var restify  = require('restify')
    , Client = require('node-xmpp-client')
    , ltx    = require('node-xmpp-core').ltx;

function putTransaction(req, res, next) {
    console.log("incoming");
    console.log(req.body);
    console.log(req.body.events[0].content);
    res.send("");
    next();
}

function getContactsFromQueryStanza(queryStanza) {
    var jids = [];

    queryStanza.children.forEach(function (item) {
       jids.push(item.attrs.jid); //TODO check for subscription
    });

    return jids;
}

var access_token ='aeY9ay8wahqu0pheo1zah2sozohcu4Ciexo0eev1ja';
var URL_CREATE_ROOM = '/_matrix/client/api/v1/createRoom?access_token=' + access_token + '&user_id=';
var server = restify.createServer();
var http = restify.createJSONClient({url: 'https://m.skaverat.net:61448', rejectUnauthorized: false});
server.use(restify.bodyParser({ }));
var clients = [];

server.put('/transactions/:transaction', putTransaction);

function prepareClients() {
    clients.forEach(function (client) {
        client.on('stanza', function (stanza) {
            if (stanza.name !== 'iq') {
                return;
            }

            var queryStanza = stanza.getChild('query');
            if(queryStanza.attrs.xmlns == 'jabber:iq:roster') {
                var jids = getContactsFromQueryStanza(queryStanza);
                var jid = jids[0];
                var foo = URL_CREATE_ROOM + '@xmpp_' + jid + ':m.skaverat.net';

                console.log(foo);
                http.post(foo,{
                    visibility: 'private',
                    invite: ['@skaverat:m.skaverat.net']
                }, function (foo) {
                    console.log(foo);
                });

                console.log(jids);
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