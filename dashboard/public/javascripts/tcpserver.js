var net = require('net');
var PORT = 1337;
var HOST = '127.0.0.1';

net.createServer(function(sock) {
    
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    sock.on('data', function(data) {
         console.log('DATA ' + sock.remoteAddress + ': ' + data);
        
        sock.write('You said "' + data + '"');
        dataReceived(data);
        
    });
    
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

var array = [];
function dataReceived (data) {
    array.push(data);
}