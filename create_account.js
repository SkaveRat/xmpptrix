#!/usr/bin/node

var  Datastore = require('nedb')
    ,prompt = require('prompt')
    ;

var db = new Datastore({
     filename: 'accounts.db'
    ,autoload: true
});

var properties = [
    {
        name: 'localpart',
        description: 'matrix local username (e.g. "alice" for @alice:example.com)',
        validator: /^[a-zA-Z0-9_-]+$/,
        required: true
    },
    {
        name: 'xmppid',
        description: 'XMPP ID (alice@example.com)',
        required: true
    },
    {
        name: 'xmpppassword',
        description: 'XMPP password (not displayed)',
        hidden: true,
        required: true
    }
];



prompt.start();
prompt.get(properties, function (err, result) {
    if (err) { return onErr(err); }

    db.insert(result, function (err, newDocs) {
        console.log(err);
        console.log(newDocs);
    })
});

function onErr(err) {
    console.log(err);
    return 1;
}