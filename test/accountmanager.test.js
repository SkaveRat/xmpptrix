var   sinon = require('sinon')
    , proxyquire = require('proxyquire');

var loggerStub = {};

var Accountmanager = proxyquire('../lib/accountmanager', {'./logger': loggerStub});

exports.setUp = function (next) {
    loggerStub.info = sinon.spy();
    next();
};

exports.hasConstructor = function (test) {
    var t = new Accountmanager();
    test.ok(loggerStub.info.calledOnce);
    test.done();
};