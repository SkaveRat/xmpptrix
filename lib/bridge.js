var  Client = require('node-xmpp-client')
    , ltx    = require('node-xmpp-core').ltx
    , restify  = require('restify')
;

var URL_CREATE_ROOM  = '/_matrix/client/api/v1/createRoom?access_token={access_token}&user_id={user_id}';
var URL_SEND_MESSAGE = '/_matrix/client/api/v1/rooms/{room_id}/send/m.room.message?access_token={access_token}&user_id={user_id}';

var accountdata;
var jid;
var jpwd;
var localpart;
var xmpp_client;

var rooms;

var db;
var settings;

var http;

var Bridge = function(data, dbconn, serversettings) {
    settings = serversettings;
    accountdata = data;
    db = dbconn;
    rooms = data.rooms || [];
    jid = data.xmppid;
    jpwd = data.xmpppassword;
    localpart = data.localpart;

    var url = 'https://' + settings.mxhost + ':' + settings.mxport;
    http = restify.createJSONClient({url: url, rejectUnauthorized: false});

    console.log(url);

    xmpp_client = new Client({
        jid: jid,
        password: jpwd
    });

    xmpp_client.on('stanza', function (stanza) {
        if(stanza.is('message') && stanza.getChild('body')) {
            var message = stanza.getChild('body').children.join('').trim();
            var sender = stanza.getAttr('from').split('/')[0];
            if(sender != jid) {
                sendMessage(sender, message);
            }
            return;
        }


        if (stanza.name !== 'iq') {
            return;
        }

        var queryStanza = stanza.getChild('query');
        if(queryStanza.attrs.xmlns == 'jabber:iq:roster') {
            var contactjids = getContactsFromQueryStanza(queryStanza);
            contactjids.forEach(function (contact) {
                if(!roomExists(contact)) {
                    createRoom(contact)
                }
            });
        }
    });


    xmpp_client.on('online', function() {
        xmpp_client.send(new ltx.Element('presence', { })
                .c('show').t('chat').up()
        );

        xmpp_client.send(new ltx.Element('iq', {
            id: 'roster_0',
            type: 'get'
        }).c('query', {xmlns: 'jabber:iq:roster'}));

    });
};

Bridge.prototype.isInRoom = function(room_id) {
    var in_room = false;
    rooms.forEach(function(room_touple) {
        if(room_touple.room_id == room_id) {
            in_room = true;
        }
    });

    return in_room;
};

Bridge.prototype.handleEvent = function(event) {
    var room_id = event.room_id;
    var message = event.content.body;
    var receiver = getJidByRoom(room_id);
    var reply = new ltx.Element('message', {
        to: receiver,
        from: jid,
        type: 'chat'
    });
    reply.c('body').t(message);

    xmpp_client.send(reply);
};

function getContactsFromQueryStanza(queryStanza) {
    var jids = [];

    queryStanza.children.forEach(function (item) {
        jids.push(item.attrs.jid); //TODO check for subscription
    });

    return jids;
}

function getRoomByJid(jid) {
    var foundroom = null;
    rooms.forEach(function (room) {
        if(room.jid == jid) {
            foundroom = room.room_id
        }
    });
    return foundroom;
}


function getJidByRoom(room_id) {
    var foundjid = null;
    rooms.forEach(function (room) {
        if(room.room_id == room_id) {
            foundjid = room.jid
        }
    });
    return foundjid;
}


function createRoom(jid) {
    http.post(URL_CREATE_ROOM.replace('{access_token}', settings.access_token).replace('{user_id}', '@xmpp_' + jid + ':' + settings.mxhost),{
        visibility: 'private',
        invite: ['@' + localpart +':' + settings.mxhost]
    }, function (err, req, res) {
        if(err) {
            console.log(err)
        }else{
            var response = JSON.parse(res.body);
            var room_touple = {
                jid: jid,
                room_id: response.room_id
            };

            db.update({_id: accountdata._id}, {$push: {rooms: room_touple}}, function(err) {
                if(err) {
                    console.log(err);
                }
            });

        }
    });
}

function roomExists(jid) {
    return !!getRoomByJid(jid) || false
}


function sendMessage(sender, message) {
    var user_id = '@xmpp_' + sender + ':' + settings.mxhost;
    var room_id = getRoomByJid(sender);
    var request_uri = URL_SEND_MESSAGE.replace('{room_id}', room_id).replace('{access_token}', settings.access_token).replace('{user_id}', user_id);
    http.post(request_uri, {
        msgtype: 'm.text',
        body: message
    }, function (err) {
        if(err) {
            console.log(err);
        }
    });
}

module.exports = Bridge;