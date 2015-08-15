var   XMPP = require('./xmpp_client')
;

var Account = function (accountdata) {
    var self = this;
    var xmpp = new XMPP(accountdata.xmppid, accountdata.xmpppassword);

    //xmpp._handleOnOnline();


};

Account.prototype = {
};

module.exports = Account;