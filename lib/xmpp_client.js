var Client = require('node-xmpp-client')
    , ltx = require('node-xmpp-core').ltx
    , log = require('./logger')
    , EventEmitter = require('events').EventEmitter
    , util = require('util')
    ;

var PRESENCE_ONLINE = new ltx.Element('presence', {}).c('show').t('chat').up();
var IQ_REQ_ROSTER = new ltx.Element('iq', {id: 'roster_0', type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});

class XMPPClient extends EventEmitter {
    constructor(jid, password) {
        super();

        this.client = new Client({
            jid: jid,
            password: password
        });

        this.client.on('online', () => this._handleOnOnline());
        this.client.on('stanza', (stanza) => this._handleOnStanza(stanza));
    }

    _handleOnOnline() {
        this.client.send(PRESENCE_ONLINE);
        this.client.send(IQ_REQ_ROSTER);

    }

    _handleOnStanza(stanza) {
        switch (stanza.name) {
            case 'iq':
                this._handleStanzaIq(stanza);
                break;

            default :
                log.debug("unknown stanza type");
                log.debug(stanza);
        }
    }

    _handleStanzaIq(stanza) {
        if (stanza.getChild('query') && stanza.getChild('query').getAttribute('xmlns') == 'jabber:iq:roster') {
            let query = stanza.getChild('query');
            let jids = [];

            for(let item of query.children) {
                jids.push(item.attrs.jid);
            }

            this.emit('roster', jids);
        }
    }

}

export default XMPPClient;