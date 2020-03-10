/**
 * @module Electron-app
 * @author Eric Udlis
 * @description Runs the main electron process
 */
const ELECTRON = require('electron');
const URL = require('url');
const PATH = require('path');

const { app: APP } = ELECTRON;
const { BrowserWindow: BROWSER_WINDOW } = ELECTRON;
let win;

/**
 * Creates the browser window and loads the index.html file in it
 */
function createWindow() {
  win = new BROWSER_WINDOW({
    width: 1920,
    height: 1080,
    frame: false,
    backgroundColor: '#FFF',
    icon: PATH.join(__dirname, '/public/images/icon.png'),
    webPreferences: { webSecurity: true, nodeIntegration: true },
  });

  win.loadURL(
    URL.format({
      pathname: PATH.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  );

  win.on('closed', () => {
    win = null;
  });
}


APP.on('ready', createWindow);

APP.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    APP.quit();
  }
});

APP.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
