"use strict";

var server_port = 8080;
var server_ip_address = "0.0.0.0";

var ua = require("universal-analytics"),
  server = require("http").createServer(),
  url = require("url"),
  WebSocketServer = require("ws").Server,
  wss = new WebSocketServer({ server: server }),
  express = require("express"),
  app = express(),
  port = 8000;

var connectedClients = 0;

//#############################################################################
// HTTP SERVER
//#############################################################################

app.use(function(req, res) {
  res.send({ msg: "hello" });
});

server.on("request", app);

server.listen(server_port, server_ip_address, function() {
  console.log(
    "Listening on " + server_ip_address + ", server_port " + server_port
  );
});

//#############################################################################
// WEBSOCKET
//#############################################################################

wss.on("connection", function(user_ws) {
  connectedClients++;
  console.log(`Client connected: ${user_ws._socket.remoteAddress}`);
  console.log(user_ws._socket.remoteAddress);
  console.log(`No. clients connected: ${connectedClients}`);
  //var visitor = ua('');
  //visitor.pageview('/websocket').send();

  // ON CONNECTION SEND WORLD TO USER
  //transactions.getAll(user_ws);

  user_ws.on("message", function message(evt, flags) {
    console.log(
      `websocket message from ${user_ws._socket.remoteAddress}: ${evt}`
    );
  });

  user_ws.on("close", function() {
    connectedClients--;
    console.log(`Client Disconnected: ${user_ws._socket.remoteAddress}`);
    console.log("No. clients connected: " + connectedClients);
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    try {
      client.send(data, function(err) {
        if (err) {
          console.log(err.message);
        }
      });
    } catch (e) {
      console.log(e.message);
    }
  });
};

wss.on("error", function(err) {
  console.log(err);
});
