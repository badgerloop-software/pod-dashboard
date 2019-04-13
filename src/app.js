/*
Author: Eric Udlis
Purpose: Run the main Electron Process
*/
const electron = require('electron');
const url = require('url');
const path = require('path');

const { app } = electron;
const { BrowserWindow } = electron;
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    frame: false,
    backgroundColor:  '#FFF',
    icon: path.join(__dirname, '/public/images/icon.png'),
    webPreferences: { webSecurity: true, nodeIntegration: true },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  );

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
