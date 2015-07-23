var  Client = require('node-xmpp-client')
    , ltx    = require('node-xmpp-core').ltx
    , restify  = require('restify')
    , bunyan = require('bunyan')
;
var log = bunyan.createLogger({
    name: 'xmppbridge',
    streams: [
        {
            level: 'info',
            stream: process.stdout            // log INFO and above to stdout
        },
        {
            level: 'error',
            path: 'log/error.log'
        },
        {
            level: 'debug',
            path: 'log/debug.log'
        }
    ]
});


var URL_CREATE_ROOM  = '/_matrix/client/api/v1/createRoom?access_token={access_token}&user_id={user_id}';
var URL_SEND_MESSAGE = '/_matrix/client/api/v1/rooms/{room_id}/send/m.room.message?access_token={access_token}&user_id={user_id}';

var Bridge = function(data, dbconn, serversettings) {
    var self = this;

    self.settings = serversettings;
    self.accountdata = data;
    self.db = dbconn;
    self.rooms = data.rooms || [];
    self.jid = data.xmppid;
    self.jpwd = data.xmpppassword;
    self.localpart = data.localpart;

    var url = 'https://' + self.settings.mxhost + ':' + self.settings.mxport;
    self.http = restify.createJSONClient({url: url, rejectUnauthorized: false});

    self.xmpp_client = new Client({
        jid: self.jid,
        password: self.jpwd
    });

    self.xmpp_client.on('stanza', function (stanza) {

        log.debug(stanza);

        if(stanza.is('message') && stanza.getChild('body')) {
            var message = stanza.getChild('body').children.join('').trim();
            var sender = stanza.getAttr('from').split('/')[0];
            if(sender != self.jid) {
                self._sendMessage(sender, message);
            }
            return;
        }


        if (stanza.name !== 'iq') {
            return;
        }

        var queryStanza = stanza.getChild('query');
        if(queryStanza.attrs.xmlns == 'jabber:iq:roster') {
            var contactjids = self._getContactsFromQueryStanza(queryStanza);
            log.info("Found %d xmpp contacts on account %s", contactjids.length, self.jid);
            contactjids.forEach(function (contact) {
                if(!self._roomExists(contact)) {
                    self._createRoom(contact)
                }
            });
        }
    });

    self.xmpp_client.on('drain', function (event) {
        log.debug("############# drain");
        log.debug(event);
        log.debug("####################");
    });
    self.xmpp_client.on('end', function (event) {
        log.debug("############# end");
        log.debug(event);
        log.debug("####################");
    });
    self.xmpp_client.on('close', function (event) {
        log.debug("############# close");
        log.debug(event);
        log.debug("####################");
    });
    self.xmpp_client.on('error', function (event) {
        log.debug("############# error");
        log.debug(event);
        log.debug("####################");
    });
    self.xmpp_client.on('reconnect', function (event) {
        log.debug("############# reconnect");
        log.debug(event);
        log.debug("####################");
    });
    self.xmpp_client.on('disconnect', function (event) {
        log.debug("############# disconnect");
        log.debug(event);
        log.debug("####################");
    });


    self.xmpp_client.on('online', function() {
        self.xmpp_client.send(new ltx.Element('presence', { })
                .c('show').t('chat').up()
        );

        self.xmpp_client.send(new ltx.Element('iq', {
            id: 'roster_0',
            type: 'get'
        }).c('query', {xmlns: 'jabber:iq:roster'}));

    });
};

Bridge.prototype.isInRoom = function(room_id) {
    var in_room = false;
    this.rooms.forEach(function(room_touple) {
        if(room_touple.room_id == room_id) {
            in_room = true;
        }
    });

    return in_room;
};

Bridge.prototype.handleEvent = function(event) {

    log.debug(event);

    if(this._isIncomingMessage(event)) { //it's a message we receive. dont echo it to the user
        return;
    }

    var room_id = event.room_id;
    var message = event.content.body;
    var receiver = this._getJidByRoom(room_id);
    var reply = new ltx.Element('message', {
        to: receiver,
        from: this.jid,
        type: 'chat'
    });
    reply.c('body').t(message);

    log.debug(reply);

    this.xmpp_client.send(reply);
};

Bridge.prototype._isIncomingMessage = function(event) {
    return event.user_id != '@' + this.localpart + ':' + this.settings.mxhost;
};

Bridge.prototype._getContactsFromQueryStanza = function(queryStanza) {
    var jids = [];

    queryStanza.children.forEach(function (item) {
        jids.push(item.attrs.jid); //TODO check for subscription
    });

    return jids;
};

Bridge.prototype._getRoomByJid = function(jid) {
    var foundroom = null;
    this.rooms.forEach(function (room) {
        if(room.jid == jid) {
            foundroom = room.room_id
        }
    });
    return foundroom;
};


Bridge.prototype._getJidByRoom = function(room_id) {
    var foundjid = null;
    this.rooms.forEach(function (room) {
        if(room.room_id == room_id) {
            foundjid = room.jid
        }
    });
    return foundjid;
};


Bridge.prototype._createRoom = function(jid) {
    var self = this;

    this.http.post(URL_CREATE_ROOM.replace('{access_token}', this.settings.access_token).replace('{user_id}', '@xmpp_' + jid + ':' + this.settings.mxhost),{
        visibility: 'private',
        invite: ['@' + this.localpart +':' + this.settings.mxhost]
    }, function (err, req, res) {
        if(err) {
            log.error(err)
        }else{
            var response = JSON.parse(res.body);
            var room_touple = {
                jid: jid,
                room_id: response.room_id
            };

            self.db.update({_id: self.accountdata._id}, {$push: {rooms: room_touple}}, function(err) {
                if(err) {
                    log.error(err);
                }
            });

        }
    });
};

Bridge.prototype._roomExists = function(jid) {
    return !!this._getRoomByJid(jid) || false
};


Bridge.prototype._sendMessage = function(sender, message) {
    var user_id = '@xmpp_' + sender + ':' + this.settings.mxhost;
    var room_id = this._getRoomByJid(sender);

    var request_uri = URL_SEND_MESSAGE.replace('{room_id}', room_id).replace('{access_token}', this.settings.access_token).replace('{user_id}', user_id);
    this.http.post(request_uri, {
        msgtype: 'm.text',
        body: message
    }, function (err) {
        if(err) {
            log.error(err);
        }
    });
};

module.exports = Bridge;