let Matrix = require('matrix-js-sdk');
let log = require('./logger');

class Contact {
    constructor(roomTouple, settings) {
        this.room = roomTouple;

        log.info(settings);
        log.info(settings.mxhost);
        log.info('https://' + settings.mxhost + ':' + settings.mxport);

        this.mxClient = Matrix.createClient({
            baseUrl: 'https://' + settings.mxhost + ':' + settings.mxport,
            queryParams: {
                user_id: '@xmpp_' + this.room.jid + ':' + settings.mxhost
            },
            accessToken: settings.access_token,
            userId: '@xmppbridge_test:' + settings.mxhost
        });



    }

    sendMessage(message) {
        this.mxClient.sendTextMessage(this.room.room_id, message)
            .catch((err) => log.error(err));
    }

    get jid() {return this.room.jid; };

}

export default Contact;