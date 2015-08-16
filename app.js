'use strict';

import Account from './lib/account.js';

var Datastore = require('nedb')
    , log = require('./lib/logger')
    , restify = require('restify')
    ;

var account_db = new Datastore({
    filename: 'accounts.db'
    , autoload: true
});
var settings_db = new Datastore({
    filename: 'settings.db'
    , autoload: true
});


var server = restify.createServer();
server.use(restify.bodyParser({}));
server.put('/transactions/:transaction', handleIncoming);


function handleIncoming(req, res, next) {
    var event = req.body.events[0]; //TODO multiple events?

    log.info(event);

    //if(event.type != 'm.room.message') {
    //    res.send("[]");
    //    next();
    //    return;
    //}
    //
    //var room_id = event.room_id;
    //bridges.forEach(function(bridge) {
    //    if (bridge.isInRoom(room_id)) {
    //        bridge.handleEvent(event);
    //    }
    //});
    res.send("[]");
    next();
}

server.listen(61445, function () {
    settings_db.find({}).limit(1).exec(function (err, settings) {
        settings = settings[0]; //TODO check for missing settings
        account_db.find({}, function (err, accounts) {
            log.info("Found " + accounts.length + " accounts. Connecting...");

            accounts.forEach(function (account) {
                new Account(account, settings);
            });
        });
    });
});