"use strict";

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

const CANNON = require('cannon');
var Physics = require('./physics/Physics');
//var Tweets = require('./objects/Tweets');
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
//var tweets = new Tweets(physics.world, physics.sphereMaterial, removeTweet);
var transactions = new Transactions(physics.world, physics.sphereMaterial, removeTransaction);

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
// TWITTER
//#############################################################################
/*
var Twitter = require('node-tweet-stream'),
t = new Twitter({
    consumer_key: 'NZfwFm5Ql5AbIlgRtZfjF1JNu',
    consumer_secret: 'jFBqqA77pCmlP1wziKiXCkgQnhDGfmLWSBRozD5Xz9zb5UpKu6',
    token: '19706714-uk0PwXcMutd49JwFop3bDOVai9pUtzSBsBTNABYly',
    token_secret: 'ShCVAeW4Wlv10b9rs033JICu8x0nT4LAwp8Mz8BWh1yVz'
});

t.on('tweet', function (tweet) {

    var candidate;
    var reTweet = 0;

    if(tweet.retweeted_status){
      reTweet = 1;
    }

    if(tweet.entities.hashtags.length > 0){
        var hashtags = tweet.entities.hashtags;
        var len = hashtags.length;

        for(var i = 0; i < len; i++){
            if(hashtags[i].text.toUpperCase() === 'HILLARY2016'){
                candidate = 0; //Hillary
                tweets.addTweet(candidate, reTweet, addTweet.bind(this));
            } else if (hashtags[i].text.toUpperCase() === 'TRUMP2016'){
                candidate = 1; //Trump
                tweets.addTweet(candidate, reTweet, addTweet.bind(this));
            } else {
                // UNKNOWN
            }
        }
    }
});

t.on('error', function (err) {
    console.log('Oh no');
});

t.track('#trump2016');
t.track('#hillary2016');
//t.track('#nevertrump');
//t.track('#neverhillary');
*/

//#############################################################################
// BLOCKCHAIN
//#############################################################################

wsc.on('open', function() {
    //wsc.send('{"op":"ping_block"}{"op":"blocks_sub"}{"op":"unconfirmed_sub"}');
    wsc.send('{"op":"unconfirmed_sub"}');
});
wsc.on('message', function(message) {
    console.log('transaction');
    transactions.addTransaction(addTransaction.bind(this));
});

//#############################################################################
// WEBSOCKET
//#############################################################################

wss.on('connection', function (ws) {
    console.log('Connected: ' + (ws.upgradeReq.headers['x-forwarded-for'] || ws.upgradeReq.connection.remoteAddress));
    var visitor = ua('UA-19451182-10');
    visitor.pageview('/physics/websocket').send();

    updateAll(ws);

    ws.on('message', function message(evt, flags) {
        var object = JSON.parse(evt);
        //console.log(object);
        if(object.d === 'scatter'){
            transactions.scatter();
        }
        if(object.d === 'updateAll'){
            updateAll(ws);
        }
    });
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        try {
            client.send(JSON.stringify(data), function (err) {
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
// ADD TWEET
//#############################################################################

/*
function updateAll(ws){
    var data = tweets.getAll();

    ws.send(JSON.stringify({
        s: 'all',
        d: data
    }));
}

function addTweet(data){
    wss.broadcast({
        s: 'add',
        d: data
    });
}

function removeTweet(data){
    wss.broadcast({
        s: 'remove',
        d: data
    });
}
*/

//#############################################################################
// ADD TRANSACTION
//#############################################################################

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

//#############################################################################
// ANIMATION FRAMES
//#############################################################################

raf(function tick() {

    physics.updatePhysics();
    //var data = tweets.updatePositions();
    var data = transactions.updatePositions();

    wss.broadcast({
      s: 'update',
      d: data
    });

    raf(tick);
});
