var  Client = require('node-xmpp-client')

;

var jid;
var jpwd;
var localpart;

var client;

var Bridge = {
    load: function(data) {
        jid = data.xmppid;
        jpwd = data.xmpppassword;
        localpart = data.localpart;

        client = new Client({
            jid: jid,
            password: jpwd
        });


        console.log(client);
    }
};


module.exports = Bridge;