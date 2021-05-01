
const WebSocketServer = require('websocket').server;
const EventEmitter = require("events");

function init(server) {
    wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });

    function originIsAllowed(origin) {
        // put logic here to detect whether the specified origin is allowed.
        return true;
    }

    const oEmitter = new EventEmitter();
    wsServer.on('request', function(request) {
        if (!originIsAllowed(request.origin)) {
            // Make sure we only accept requests from an allowed origin
            request.reject();
            console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            return;
        }

        var connection = request.accept('echo-protocol', request.origin);
        console.log((new Date()) + ' Connection accepted.');

        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log('Received Message: ' + message.utf8Data);
                connection.sendUTF(message.utf8Data);
            }
            else if (message.type === 'binary') {
                console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                connection.sendBytes(message.binaryData);
            }
        });
        connection.on('close', function(reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
        oEmitter.on('message', sMessage => {
            connection.sendUTF(sMessage);
        })

        // every time we receive a new event, we want the caller to know the connection to work with
        oEmitter.emit('connect', connection);
    });
    return oEmitter;
}
module.exports = { init: init };