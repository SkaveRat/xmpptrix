import XMPP from './xmpp_client.js';
import Contact from './contact.js';

var   log = require('./logger')
    ;

class Account {
    constructor(accountdata, settings) {
        this.contacts = [];
        this.settings  = settings;
        this.rooms = accountdata.rooms;

        var xmpp = new XMPP(accountdata.xmppid, accountdata.xmpppassword);
        xmpp.on('roster', (rosterdata) => this._createRoster(rosterdata));
        xmpp.on('message', (data) => {

            this._getContactByJid(data.from).sendMessage(data.message);
        });
    }

    _createRoster(rosterdata) {
        for(let contact of rosterdata) {

            let roomTouple = this._getRoomToupleByJid(contact);

            if(!roomTouple) {
                //createRoom
            }else{
                this.contacts.push(new Contact(roomTouple, this.settings));
            }


        }
    }

    _getContactByJid(jid) {
        for(let contact of this.contacts) {
            if( contact.jid == jid) {
                return contact;
            }
        }
    }

    _getRoomToupleByJid(jid) {
        for(let touple of this.rooms) {
            if(touple.jid == jid) {
                return touple;
            }
        }
    }
}

export default Account;