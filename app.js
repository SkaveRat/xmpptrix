'use strict';

import Account from './lib/account.js';

var restify     = require('restify')
    , Client    = require('node-xmpp-client')
    //, Account    = require('./lib/account')
    , ltx       = require('node-xmpp-core').ltx
    , Datastore = require('nedb')
    , bunyan    = require('bunyan')
    , log       = require('./lib/logger')
    ;

var account_db = new Datastore({
    filename: 'accounts.db'
    ,autoload: true
});
var settings_db = new Datastore({
    filename: 'settings.db'
    ,autoload: true
});

settings_db.find({}).limit(1).exec(function (err, settings) {
    settings = settings[0]; //TODO check for missing settings
    account_db.find({}, function (err, accounts) {
        log.info("Found " + accounts.length + " accounts. Connecting...");

        accounts.forEach(function (account) {

            new Account(account, settings);
            //var bridge = new Bridge(account, db, settings[0]);
            //bridges.push(bridge)
        });
    });
});