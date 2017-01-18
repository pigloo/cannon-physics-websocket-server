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

    //updateAll(user_ws);
    transactions.getAll(user_ws);

    user_ws.on('message', function message(evt, flags) {
        var object = JSON.parse(evt);
        //console.log(object);
        if(object.d === 'scatter'){
            transactions.scatter();
        }
        if(object.d === 'updateAll'){
            //updateAll(user_ws);
            transactions.getAll(user_ws);
        }
    });
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        try {
            /*
            client.send(JSON.stringify(data), function (err) {
                if (err) {
                    console.log(err.message);
                }
            });
            */
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
    //console.log('transaction');
    //transactions.addTransaction(addTransaction.bind(this));
    transactions.addTransaction(wss.broadcast);
});

//#############################################################################
// ADD TRANSACTION
//#############################################################################

/*

function updateAll(ws){
    var data = transactions.getAll();
    ws.send(JSON.stringify({
        s: 'all',
        d: data
    }));
}

function addTransaction(data){
    wss.broadcast({
        s: 'add',
        d: data
    });
}

function removeTransaction(data){
    wss.broadcast({
        s: 'remove',
        d: data
    });
}

function updateAll(user_ws){
    var data = transactions.getAll();
    user_ws.send(data, { binary: true, mask: true });
}
*/

//#############################################################################
// ANIMATION FRAMES
//#############################################################################

raf(function tick() {

    physics.updatePhysics();
    transactions.updatePositions(wss.broadcast);

    //wss.broadcast({ s: 'update', d: data });
    //wss.broadcast(data, { binary: true, mask: true });

    raf(tick);
});
