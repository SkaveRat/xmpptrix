'use strict';
var restify  = require('restify')
    , Bridge = require('./lib/bridge.js')
    , Client = require('node-xmpp-client')
    , ltx    = require('node-xmpp-core').ltx
    , Datastore    = require('nedb')
    ;

var server = restify.createServer();
server.use(restify.bodyParser({}));
server.put('/transactions/:transaction', handleIncoming);

var bridges = [];


var db = new Datastore({
    filename: 'accounts.db'
    ,autoload: true
});

function handleIncoming(req, res, next) {
    var event = req.body.events[0]; //TODO multiple events?
    if(event.type != 'm.room.message') { //TODO "|| user_id != mx_user"
        res.send("[]");
        next();
        return;
    }

    var room_id = event.room_id;
    //var message = event.content.body;
    bridges.forEach(function(bridge) {
        if (bridge.isInRoom(room_id)) {
            bridge.handleEvent(event);
        }
    });
    res.send("[]");
    next();
}


server.listen(61444, function() {

    db.find({}, function (err, accounts) {
        console.log("Found " + accounts.length + " accounts. Connecting...");

        accounts.forEach(function (account) {
            var bridge = new Bridge(account, db);
            bridges.push(bridge)
        });
    });
});