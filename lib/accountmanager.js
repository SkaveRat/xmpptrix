var logger = require('./logger');

var AccountManager = function() {
    logger.info("foo")
};

AccountManager.prototype = {
    foo: function() {
        logger.info("foo")
    }
};


module.exports = AccountManager;