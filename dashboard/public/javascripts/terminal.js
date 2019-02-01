const os = require('os');
const fs = require('fs');
const pty = require('node-pty');
const Terminal = require('xterm').Terminal;

const shell = process.env[os.platform() === 'win64' ? 'COMSPEC' : 'SHELL'];
var ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
});

const xterm = new Terminal();

xterm.open(document.getElementById('terminal'));

xterm.on('data', (e) => {
    ptyProcess.write(e);
});

ptyProcess.on('data', (e) =>{
    xterm.write(e);
})