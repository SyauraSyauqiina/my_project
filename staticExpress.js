var bot = require('./public/js/bot.js');
var express = require('express');
var path = require('path');

var app = express();

app.use(express.static('public'));

app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/images', express.static(__dirname + '/public/images'));

// Serve index.html at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the chatbot page
app.get('/chatbot', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatbot.html'));
});

// Start the Express server
var webserver = app.listen(8081, function () {
    var address = webserver.address();
    console.log(address);
    console.log('Server started at http://localhost:8081');
});

// WebSocket setup
var WSS = require('websocket').server;
var http = require('http');

var server = http.createServer();
server.listen(8080, function() {
    console.log('WebSocket server started at http://localhost:8081');
});

// Create the WebSocket server
var wss = new WSS({
    httpServer: server,
    autoAcceptConnections: false
});

// Create the bot
var myBot = new bot();
var connections = {};

// Handle WebSocket requests
wss.on('request', function (request) {
    var connection = request.accept('chat', request.origin);

    connection.on('message', function (message) {
        var name = '';

        for (var key in connections) {
            if (connection === connections[key]) {
                name = key;
            }
        }

        var data = JSON.parse(message.utf8Data);
        var msg = 'leer';

        // Variables to store the last sentence and sender
        var uname;
        var utype;
        var umsg;

        switch (data.type) {
            case 'join':
                // Add the client to our list if the type is 'join'
                connections[data.name] = connection;
                msg = '{"type": "join", "names": ["' + Object.keys(connections).join('","') + '"]}';
                if (myBot.connected === false) {
                    myBot.connect();
                }
                break;
            case 'msg':
                // Create a message in JSON with type, sender, and content
                msg = '{"type": "msg", "name":"' + name + '", "msg":"' + data.msg + '","sender":"' + data.sender + '"}';
                utype = 'msg';
                uname = name;
                umsg = data.msg;
                break;
        }

        // Send data to all connected sockets
        for (var key in connections) {
            if (connections[key] && connections[key].send) {
                connections[key].send(msg);
            }
        }
        
        // Forward user data to the bot for response
        if (uname !== 'MegaBot' && utype === 'msg') {
            myBot.post(msg);
        }
    });
});
