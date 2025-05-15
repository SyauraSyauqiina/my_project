const WebSocketServer = require('websocket').server;
const http = require('http');

const server = http.createServer(function(request, response) {
    response.writeHead(404);
    response.end();
});

server.listen(8282, function() {
    console.log((new Date()) + " Server is listening on port 8282");
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // Logic to detect whether the specified origin is allowed.
    return true; // For simplicity, allow all origins.
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    const connection = request.accept('chat', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);

            // Echo message back to the client
            connection.sendUTF(message.utf8Data);

            // You can handle the received message here, process it and send a response accordingly
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
