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
var settings = new Datastore({
    filename: 'settings.db'
    ,autoload: true
});

account_db.find({}, function (err, accounts) {
    log.info("Found " + accounts.length + " accounts. Connecting...");

    accounts.forEach(function (account) {

        new Account(account);
        //var bridge = new Bridge(account, db, settings[0]);
        //bridges.push(bridge)
    });
});
