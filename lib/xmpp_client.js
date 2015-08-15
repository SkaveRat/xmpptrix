'use strict';

var Client = require('node-xmpp-client')
    , ltx = require('node-xmpp-core').ltx
    , log = require('./logger')
    ;

function XMPPClient(jid, password) {
    this.client = new Client({
        jid: jid,
        password: password
    });

    this.client.on('online', this._handleOnOnline.bind(this));
    this.client.on('stanza', this._handleOnStanza.bind(this));

}

XMPPClient.prototype = {

    _handleOnStanza: function (stanza) {
        log.info(stanza);
    },


    _handleOnOnline: function () {
        this.client.send(new ltx.Element('presence', { })
                .c('show').t('chat').up()
        );

        this._requestRoster();
    },

    _requestRoster: function () {
        this.client.send(new ltx.Element('iq', {
            id: 'roster_0',
            type: 'get'
        }).c('query', {xmlns: 'jabber:iq:roster'}));
    }
};


module.exports = XMPPClient;