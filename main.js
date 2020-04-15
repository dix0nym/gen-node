const { app, BrowserWindow, ipcMain } = require('electron');
let store = require('./datastore');


function createWindow() {
    let win = new BrowserWindow({
        width: 520,
        height: 580,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        },
        resizable: false,
        autoHideMenuBar : true,
        icon: "safe.png"
    });
    win.loadFile('renderer/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('save-settings', async (event, data) => {
    event.sender.send('save-success');
    store.store = data;
});