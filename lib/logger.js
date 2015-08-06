var bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: 'xmppbridge',
    streams: [
        {
            level: 'info',
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

module.exports = log;