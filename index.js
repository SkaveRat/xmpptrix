process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// bootstrap.js
var traceur = require('traceur');
traceur.require.makeDefault(function(filename) {
    // don't transpile our dependencies, just our app
    return filename.indexOf('node_modules') === -1;
});
require('./app');