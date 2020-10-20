/**
 * Handles window controls
 */
const electronWindow = require('electron').remote.getCurrentWindow();

// Window minimization
document.getElementById('min-window').addEventListener('click', () => {
    electronWindow.minimize();
});

// Window maximization
document.getElementById('max-window').addEventListener('click', () => {
    if (!electronWindow.isMaximized()) electronWindow.maximize();
    else electronWindow.unmaximize();
});

// Closing window
document.getElementById('close-window').addEventListener('click', () => {
    electronWindow.close();
});