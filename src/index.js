var restify  = require('restify')
    , Client = require('node-xmpp-client')
    , ltx    = require('node-xmpp-core').ltx;

function putTransaction(req, res, next) {
    console.log("incoming");
    console.log(req.body);
    console.log(req.body.events[0].content);
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

function roomExists(jid) {
    return !!getRoomByJid(jid) || false
}

function createRoom(jid) {
    http.post(URL_CREATE_ROOM + '@xmpp_' + jid + ':m.skaverat.net',{
        visibility: 'private',
        invite: [user_id]
    }, function (err) {
        if(err) console.log(err);
    });
}

function sendMessage(sender, message) {
    var user_id = '@xmpp_' + sender + ':m.skaverat.net';
    var room_id = getRoomByJid(sender);
    var request_uri = URL_SEND_MESSAGE.replace('{room_id}', room_id).replace('{access_token}', access_token).replace('{user_id}', user_id);
    http.post(request_uri, {
        msgtype: 'm.text',
        body: message
    }, function (err) {
        if(err)
            console.log(err);
    });
}

var rooms = [
    {   room_id: '!TZaeCAqTYsmDQQFPbz:m.skaverat.net',
        jid: 'skaverat@skaverat.net'
    }
];

var user_id = '@skaverat:m.skaverat.net';
var access_token ='aeY9ay8wahqu0pheo1zah2sozohcu4Ciexo0eev1ja';
var URL_CREATE_ROOM = '/_matrix/client/api/v1/createRoom?access_token=' + access_token + '&user_id=';
var URL_SEND_MESSAGE = '/_matrix/client/api/v1/rooms/{room_id}/send/m.room.message?access_token={access_token}&user_id={user_id}';
var server = restify.createServer();
var http = restify.createJSONClient({url: 'https://m.skaverat.net:61448', rejectUnauthorized: false});
server.use(restify.bodyParser({ }));
var clients = [];

server.put('/transactions/:transaction', putTransaction);

function prepareClients() {
    clients.forEach(function (client) {
        client.on('stanza', function (stanza) {
            if(stanza.is('message') && stanza.getChild('body')) {
                var message = stanza.getChild('body').children.join('').trim();
                var sender = stanza.getAttr('from').split('/')[0];
                sendMessage(sender, message);
            }


            if (stanza.name !== 'iq') {
                return;
            }

            var queryStanza = stanza.getChild('query');
            if(queryStanza.attrs.xmlns == 'jabber:iq:roster') {
                var jids = getContactsFromQueryStanza(queryStanza);
                var jid = jids[0];
                if(!roomExists(jid)) {
                    createRoom(jid)
                }
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
    });
}

server.listen(61444, function() {

    clients.push(new Client({
        jid: 'matrix@skaverat.net',
        password: 'f00b4r'
    }));


    prepareClients();

    console.log('%s listening at %s', server.name, server.url);
});