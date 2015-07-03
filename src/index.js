var restify = require('restify');

function respond(req, res, next) {
    res.send('hello ' + req.params.name);
    next();
}

function putTransaction(req, res, next) {

    console.log(req);

    res.send("");

    next();
}

var server = restify.createServer();
server.put('/transactions/:transation', putTransaction);

server.listen(61444, function() {
    console.log('%s listening at %s', server.name, server.url);
});