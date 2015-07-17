var restify  = require('restify')
    , Bridge = require('./bridge')
    , Client = require('node-xmpp-client')
    , ltx    = require('node-xmpp-core').ltx
    , Datastorage    = require('nedb')
    ;

//Settings
var mx_host = 'm.skaverat.net';
var mx_port = 61448;
//var mx_localpart = 'skaverat';
var access_token ='etooyio6aethaiquoo4mamaju2quahSi2iecaezahv';
//var xmpp_jid = 'matrix@skaverat.net';
//var xmpp_password = 'f00b4r23';

//var mx_user = '@' + mx_localpart + ':' + mx_host;
var URL_CREATE_ROOM = '/_matrix/client/api/v1/createRoom?access_token=' + access_token + '&user_id=';
var URL_SEND_MESSAGE = '/_matrix/client/api/v1/rooms/{room_id}/send/m.room.message?access_token={access_token}&user_id={user_id}';
var server = restify.createServer();
var http = restify.createJSONClient({url: 'https://'+ mx_host+':' + mx_port, rejectUnauthorized: false});
server.use(restify.bodyParser({ }));
var clients = [];

var db = new Datastorage(
    {
         filename: 'accounts.db'
        ,autoload: true
    }
);


function putTransaction(req, res, next) {
    var type = req.body.events[0].type;
    var user_id = req.body.events[0].user_id;
    if(type != 'm.room.message' || user_id != mx_user) {
        res.send("[]");
        next();
        return;
    }


    var room_id = req.body.events[0].room_id;
    var message = req.body.events[0].content.body;
    var receiver = getJidByRoom(room_id);
    var sender = xmpp_jid;
    var reply = new ltx.Element('message', {
        to: receiver,
        from: sender,
        type: 'chat'
    });
    reply.c('body').t(message);

    var client = clients[sender];
    client.send(reply);

    res.send("[]");
    next();
}

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

function roomExists(jid) {
    return !!getRoomByJid(jid) || false
}

function createRoom(jid) {
    http.post(URL_CREATE_ROOM + '@xmpp_' + jid + ':' + mx_host,{
        visibility: 'private',
        invite: [mx_user]
    }, function (err, req, res) {
        if(err) {
            console.log(err)
        }else{
            var response = JSON.parse(res.body);

            db.find({xmppid: jid}, function (account) {
                db.update({_id: account._id}, {
                    $push: {rooms: {
                        room_id: response.room_id,
                        jid: jid
                        }
                    }}
                );
            });

            rooms.push();
        }
    });
}

function sendMessage(sender, message) {
    var user_id = '@xmpp_' + sender + ':' + mx_host;
    var room_id = getRoomByJid(sender);
    var request_uri = URL_SEND_MESSAGE.replace('{room_id}', room_id).replace('{access_token}', access_token).replace('{user_id}', user_id);
    http.post(request_uri, {
        msgtype: 'm.text',
        body: message
    }, function (err) {
        if(err) {
            console.log(err);
        }
    });
}

var rooms = [];


server.put('/transactions/:transaction', putTransaction);

function runClient(data) {
    var jid = data.xmppid;
    var jpwd = data.xmpppassword;
    var localpart = data.localpart;

    var client = new Client({
        jid: jid,
        password: jpwd
    });

    clients.push(client);

    client.on('stanza', function (stanza) {
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

    client.on('online', function() {
        client.send(new ltx.Element('presence', { })
                .c('show').t('chat').up()
        );

        client.send(new ltx.Element('iq', {
            id: 'roster_0',
            type: 'get'
        }).c('query', {xmlns: 'jabber:iq:roster'}));

    });
}

server.listen(61444, function() {

    db.find({}, function (err, accounts) {

        console.log("Found " + accounts.length + " accounts. Connecting...");

        accounts.forEach(function (account) {
           runClient(account);
        });
    });


    //
    //clients[xmpp_jid] = new Client({
    //    jid: xmpp_jid,
    //    password: xmpp_password
    //});
    //
    //
    //prepareClients();
    //
    //console.log('%s listening at %s', server.name, server.url);
});