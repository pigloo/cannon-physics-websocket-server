"use strict";

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

const CANNON = require('cannon');
var Physics = require('./physics/Physics');
var Transactions = require('./objects/Transactions');
var raf = require('raf');

var ua = require('universal-analytics'),
server = require('http').createServer(),
url = require('url'),
WebSocketServer = require('ws').Server,
wss = new WebSocketServer({ server: server }),
WebSocketClient = require('ws'),
wsc = new WebSocketClient('wss://ws.blockchain.info/inv'),
express = require('express'),
app = express(),
port = 8000;

var physics = new Physics();
var transactions = new Transactions(physics.world, physics.sphereMaterial);


//#############################################################################
// HTTP SERVER
//#############################################################################

app.use(function (req, res) {
    res.send({ msg: "hello" });
});

server.on('request', app);

server.listen(server_port, server_ip_address, function () {
    console.log( "Listening on " + server_ip_address + ", server_port " + port );
});

//#############################################################################
// WEBSOCKET
//#############################################################################

wss.binaryType = "arraybuffer";

wss.on('connection', function (user_ws) {
    console.log('Connected: ' + (user_ws.upgradeReq.headers['x-forwarded-for'] || user_ws.upgradeReq.connection.remoteAddress));
    var visitor = ua('UA-19451182-10');
    visitor.pageview('/physics/websocket').send();

    //ON CONNETION SEND WORLD TO USER
    transactions.getAll(user_ws);

    user_ws.on('message', function message(evt, flags) {
        var object = JSON.parse(evt);
        if(object.d === 'scatter'){
            transactions.scatter();
        }
        if(object.d === 'updateAll'){
            transactions.getAll(user_ws);
        }
    });
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        try {
            client.send(data, function (err) {
                if (err) {
                    console.log(err.message);
                }
            });
        } catch (e) {
            console.log(e.message);
        }
    });
};

wss.on('error', function (err) {
    console.log(err);
});

//#############################################################################
// BLOCKCHAIN
//#############################################################################

wsc.on('open', function() {
    //wsc.send('{"op":"ping_block"}{"op":"blocks_sub"}{"op":"unconfirmed_sub"}');
    wsc.send('{"op":"unconfirmed_sub"}');
});
wsc.on('message', function(message) {
    transactions.addTransaction(wss.broadcast);
});

//#############################################################################
// ANIMATION FRAMES
//#############################################################################

var everyother = 1;
raf(function tick() {

    physics.updatePhysics();

    if(everyother % 2){
        transactions.updatePositions(wss.broadcast);
        everyother = 1;
    }
    everyother++;

    raf(tick);
});
