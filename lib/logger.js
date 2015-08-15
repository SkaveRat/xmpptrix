var bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: 'xmppbridge',
    streams: [
        {
            level: 'debug',
            stream: process.stdout            // log INFO and above to stdout
        },
        {
            level: 'error',
            path: 'log/error.log'
        },
        {
            level: 'debug',
            path: 'log/debug.log'
        }
    ]
});

module.exports = {
    debug: function (message) {
        log.debug({message: message});
    },
    info: function (message) {
        log.info({message: message});
    },
    warning: function (message) {
        log.warning({message: message});
    },
    error: function (message) {
        log.error({message: message});
    }
};