var express = require('express');
var API = require('./API');
var relationsModule = require("./relations");
var usersModule = require("./usersModule");
var blockingModule = require("./blocking");
var replications = require("./replication");
var app = express();

var port = 443;

app.use(express.static('./public'));
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    // res.setHeader('Access-Control-Allow-Origin', 'http://192.168.1.254:4200');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var users_server = app.listen(port, function () {
    console.log('App lestening on port ' + port);
});

API(app);
relationsModule(app);
usersModule(app);
blockingModule(app);
replications(app);
