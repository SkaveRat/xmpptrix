import XMPP from './xmpp_client.js';
import Contact from './contact.js';

var   log = require('./logger')
    ;

class Account {
    constructor(accountdata, settings) {
        this.contacts = [];
        this.settings  = settings;
        this.rooms = accountdata.rooms;

        this.xmpp = new XMPP(accountdata.xmppid, accountdata.xmpppassword);
        this.xmpp.on('roster', (rosterdata) => this._createRoster(rosterdata));
        this.xmpp.on('message', (data) => {

            this._getContactByJid(data.from).sendMessage(data.message);
        });
    }

    isInRoom(room_id) {
        let isInRoom = false;

        for(let room of this.rooms) {
            if(room.room_id == room_id) {
                isInRoom = true;
                break;
            }
        }

        return isInRoom;
    }

    handleEvent(event) {
        let contact = this._getContactByRoomId(event.room_id);
        if(event.user_id != '@xmpp_' + contact.room.jid + ':' + this.settings.mxhost) {
            this.xmpp.sendMessage(contact.jid, event.content.body);
        }
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

    _getContactByRoomId(room_id) {
        for(let contact of this.contacts) {
            if( contact.room_id == room_id) {
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