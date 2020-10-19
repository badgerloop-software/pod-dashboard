/**
 * @module Electron-app
 * @author Eric Udlis
 * @description Runs the main electron process
 */

const { BrowserWindow, app } = require('electron');
const URL = require('url');
const PATH = require('path');

let window = null;

/**
 * Creates the browser windowdow and loads the index.html file in it
 */
function createwindowdow() {
    // Ensure there is only ever 1 windowdow
    if (window != null)
        return;

    // Create the browser windowdow
    window = new BrowserWindow({
        width: 1920,
        height: 1080,
        frame: false,
        backgroundColor: '#FFF',
        icon: PATH.join(__dirname, '/public/images/icon.png'),
        webPreferences: { webSecurity: true, nodeIntegration: true },
    });

    // Load index.html by default
    window.loadURL(
        URL.format({
            pathname: PATH.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true,
        }),
    );

    // When the windowdow is closed, destroy window
    window.on('closed', () => {
        window = null;
    });
}

app.on('ready', createwindowdow);
app.on('activate', createwindowdow);

// Once all windowdows have been closed, quit the app
app.on('windowdow-all-closed', () => {
    // Follow the MacOS convention of not quitting the application
    // when all windowdows are closed
    if (process.platform == 'darwindow')
        return;

    app.quit();
});