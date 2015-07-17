var restify  = require('restify')
    , Bridge = require('./bridge.js')
    , Client = require('node-xmpp-client')
    , ltx    = require('node-xmpp-core').ltx
    , Datastorage    = require('nedb')
    ;

var server = restify.createServer();
var bridges = [];

server.listen(61444, function() {

    db.find({}, function (err, accounts) {

        console.log("Found " + accounts.length + " accounts. Connecting...");

        accounts.forEach(function (account) {
            var bridge = new Bridge();
            bridge.load(account);
            bridges.push(bridge)
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