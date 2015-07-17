var restify  = require('restify')
    , Bridge = require('./lib/bridge.js')
    , Client = require('node-xmpp-client')
    , ltx    = require('node-xmpp-core').ltx
    , Datastore    = require('nedb')
    ;

var server = restify.createServer();
var bridges = [];


var db = new Datastore({
    filename: 'accounts.db'
    ,autoload: true
});

server.listen(61444, function() {

    db.find({}, function (err, accounts) {
        console.log("Found " + accounts.length + " accounts. Connecting...");

        accounts.forEach(function (account) {
            var bridge = new Bridge(account, db);
            bridges.push(bridge)
        });
    });
});