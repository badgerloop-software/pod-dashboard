/**
 * @module Electron-app
 * @author Eric Udlis
 * @description Entry point of program. Runs the main electron process
 */

const { BrowserWindow, app } = require('electron');
const URL = require('url');
const PATH = require('path');

let window = null;

/**
 * Creates the browser window and loads the index.html file in it
 */
function createwindow() {
    // Ensure there is only ever 1 window
    if (window !== null)
        return;

    // Create the browser window
    window = new BrowserWindow({
        width: 1920,
        height: 1080,
        frame: false,
        backgroundColor: '#FFF',
        icon: PATH.join(__dirname, '/public/images/icon.png'),
        webPreferences: {
            webSecurity: true,
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    // Load index.html by default
    window.loadURL(
        URL.format({
            pathname: PATH.join(__dirname, 'views-pug', 'index.html'),
            protocol: 'file:',
            slashes: true,
        }),
    );

    // When the window is closed, destroy window
    window.on('closed', () => {
        window = null;
    });
}

app.on('ready', createwindow);
app.on('activate', createwindow);

// Once all windows have been closed, quit the app
app.on('window-all-closed', () => {
    // Follow the MacOS convention of not quitting the application
    // when all windows are closed
    if (process.platform === 'darwin')
        return;

    app.quit();
});
