import XMPP from './xmpp_client.js';

var   log = require('./logger')
    ;

class Account {
    constructor(accountdata) {
        var xmpp = new XMPP(accountdata.xmppid, accountdata.xmpppassword);
        xmpp.on('roster', (data) => log.info(data)); //TODO create Contact for every contact
        xmpp.on('message', (data) => log.info(data));
        //listen on message event
            //look up sender in room touples

    }
}

export default Account;