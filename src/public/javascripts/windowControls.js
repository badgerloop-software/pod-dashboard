/**
 * Handles window controls
 */

 let minWindow = document.getElementById('min-window');
 let maxWindow = document.getElementById('max-window');
 let closeWindow = document.getElementById('close-window');

if(typeof require === 'undefined') {
    // Hide window control buttons if not in electron

    minWindow.style.display = 'none';
    maxWindow.style.display = 'none';
    closeWindow.style.display = 'none';
} else {
    const electronWindow = require('electron').remote.getCurrentWindow();

    // Window minimization
    minWindow.addEventListener('click', () => {
        electronWindow.minimize();
    });
    
    // Window maximization
    maxWindow.addEventListener('click', () => {
        if (!electronWindow.isMaximized()) electronWindow.maximize();
        else electronWindow.unmaximize();
    });
    
    // Closing window
    closeWindow.addEventListener('click', () => {
        electronWindow.close();
    });
}