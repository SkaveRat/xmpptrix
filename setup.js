#!/usr/bin/env node

var  Datastore = require('nedb')
    ,prompt = require('prompt')
    ;

var db = new Datastore({
     filename: 'settings.db'
    ,autoload: true
});

var properties = [
    {
        name: 'mxhost',
        description: 'your matrix HS hostname (e.g. matrix.org)',
        required: true
    },
    {
        name: 'mxport',
        description: 'matrix HS client->server port (e.g. 8448)',
        validator: /^[0-9]+$/,
        required: true
    },
    {
        name: 'access_token',
        description: 'The AS token, specified in your application server yml',
        required: true
    }
];



prompt.start();
prompt.get(properties, function (err, result) {
    if (err) { return onErr(err); }

    db.insert(result, function (err, newDocs) {
		if(err) {
			console.log(err);
		}else{
            console.log("Successfully set up. Please use 'create_account' now to add an xmpp account.");
        }
    })
});

function onErr(err) {
    console.log(err);
    return 1;
}