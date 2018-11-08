const net = require('net');
const port = 1337;
const host = '127.0.0.1';

net.createServer(function(socket) {
    console.log('Connected');

    socket.on('data', function(data) {
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
    });
});

server.listen(1337, '127.0.0.1');