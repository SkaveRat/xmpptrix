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

let accounts = [];


function handleIncoming(req, res, next) {
    var event = req.body.events[0]; //TODO multiple events?

    if(event.type != 'm.room.message') {
        res.send("[]");
        next();
        return;
    }

    var room_id = event.room_id;

    for(let account of accounts) {
        if (account.isInRoom(room_id)) {
            account.handleEvent(event);
        }
    }
    res.send("[]");
    next();
}

server.listen(61445, function () {
    settings_db.find({}).limit(1).exec(function (err, settings) {
        settings = settings[0]; //TODO check for missing settings
        account_db.find({}, function (err, acc) {
            log.info("Found " + acc.length + " accounts. Connecting...");

            acc.forEach(function (account) {
                accounts.push(new Account(account, settings));
            });
        });
    });
});