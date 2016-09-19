 "use strict";

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

const CANNON = require('cannon');
var Physics = require('./physics/physics');
var Tweets = require('./tweets');
var raf = require('raf');

var ua = require('universal-analytics'),
server = require('http').createServer(),
url = require('url'),
WebSocketServer = require('ws').Server,
wss = new WebSocketServer({ server: server }),
express = require('express'),
app = express(),
port = 8000;


var physics = new Physics();
var tweets = new Tweets(physics.world);

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
//
//#############################################################################

var Twitter = require('node-tweet-stream'),
t = new Twitter({
    consumer_key: 'NZfwFm5Ql5AbIlgRtZfjF1JNu',
    consumer_secret: 'jFBqqA77pCmlP1wziKiXCkgQnhDGfmLWSBRozD5Xz9zb5UpKu6',
    token: '19706714-uk0PwXcMutd49JwFop3bDOVai9pUtzSBsBTNABYly',
    token_secret: 'ShCVAeW4Wlv10b9rs033JICu8x0nT4LAwp8Mz8BWh1yVz'
});

t.on('tweet', function (tweet) {

    var candidate;
    var reTweet = false;

    if(tweet.retweeted_status){
      reTweet = true;
    }

    if(tweet.entities.hashtags.length > 0){
        var hashtags = tweet.entities.hashtags;
        var len = hashtags.length;

        for(var i = 0; i < len; i++){
            if(hashtags[i].text.toUpperCase() === 'NEVERTRUMP'){
                candidate = 0;
                tweets.addTweet(candidate, reTweet);
            } else if (hashtags[i].text.toUpperCase() === 'NEVERHILLARY'){
                candidate = 1;
                tweets.addTweet(candidate, reTweet);
            } else {
                // UNKNOWN
            }
        }
    }
});

t.on('error', function (err) {
    console.log('Oh no');
});

t.track('#nevertrump');
t.track('#neverhillary');

//#############################################################################
// WEBSOCKET
//#############################################################################

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

wss.on('connection', function (ws) {
    console.log('Connected: ' + (ws.upgradeReq.headers['x-forwarded-for'] || ws.upgradeReq.connection.remoteAddress));
    var visitor = ua('UA-19451182-10');
    visitor.pageview('/websocket').send();
});

wss.on('error', function (err) {
    console.log(err);
});

//#############################################################################
// ADD FLOOR
//#############################################################################

var halfExtents = new CANNON.Vec3(8, 1, 8);
var boxShape = new CANNON.Box(halfExtents);
var boxBody = new CANNON.Body({
  mass: 0,
  //material: groundMaterial
});
boxBody.addShape(boxShape);
boxBody.position.set(0,0,0);
physics.addBody(boxBody);

//#############################################################################
// ANIMATION FRAMES
//#############################################################################

raf(function tick() {

    physics.updatePhysics();
    var frame = tweets.updatePhysics();

    //console.log(frame);

    JSON.stringify(frame);

    wss.broadcast({
        subscription: 't',
        d: frame
    });

    raf(tick);
});
