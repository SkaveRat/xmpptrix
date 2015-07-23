'use strict';
var restify     = require('restify')
    , Bridge    = require('./lib/bridge.js')
    , Client    = require('node-xmpp-client')
    , ltx       = require('node-xmpp-core').ltx
    , Datastore = require('nedb')
    , bunyan    = require('bunyan')
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
            path: 'log/error.log'  // log ERROR and above to a file
        }
    ]
});


var server = restify.createServer();
server.use(restify.bodyParser({}));
server.put('/transactions/:transaction', handleIncoming);

var bridges = [];


var db = new Datastore({
    filename: 'accounts.db'
    ,autoload: true
});
var settingsdb = new Datastore({
    filename: 'settings.db'
    ,autoload: true
});

function handleIncoming(req, res, next) {
    var event = req.body.events[0]; //TODO multiple events?
    if(event.type != 'm.room.message') {
        res.send("[]");
        next();
        return;
    }

    var room_id = event.room_id;
    bridges.forEach(function(bridge) {
        if (bridge.isInRoom(room_id)) {
            bridge.handleEvent(event);
        }
    });
    res.send("[]");
    next();
}


server.listen(61444, function() {

    settingsdb.find({}).limit(1).exec(function (err, settings) {
        if(settings.length == 0) {
            log.error("No settings found. Please run 'setup' first.");
            process.exit();
        }

        db.find({}, function (err, accounts) {
            log.info("Found " + accounts.length + " accounts. Connecting...");

            accounts.forEach(function (account) {
                var bridge = new Bridge(account, db, settings[0]);
                bridges.push(bridge)
            });
        });
    });

});