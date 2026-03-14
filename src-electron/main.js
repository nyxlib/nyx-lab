/*--------------------------------------------------------------------------------------------------------------------*/

const {app, ipcMain, BrowserWindow} = require('electron');

const path = require('path');

/*--------------------------------------------------------------------------------------------------------------------*/

let mainWindow = null;

/*--------------------------------------------------------------------------------------------------------------------*/

const createWindow = () => {

    mainWindow = new BrowserWindow({
        height: 800,
        width: 1300,
        minHeight: 800,
        minWidth: 1300,
        frame: false,
        show: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

    //mainWindow.loadURL('https://nyxlib.org/lab/');

    //mainWindow.webContents.openDevTools();

    mainWindow.maximize();

    mainWindow.show();

    /*------------------------------------------------------------------------------------------------------------*/

    mainWindow.on('close', (e) => {

        e.preventDefault();

        mainWindow.webContents.send('nyx://close-requested');
    });

    /*------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

app.whenReady().then(() => {

    createWindow();

    app.on('activate', () => {

        if(BrowserWindow.getAllWindows().length === 0)
        {
            createWindow();
        }
    });
});

/*--------------------------------------------------------------------------------------------------------------------*/

app.on('window-all-closed', () => {

    app.quit();
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:minimize', () => {

    mainWindow?.minimize();
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:toggleMaximize', () => {

    if(!mainWindow)
    {
        return false;
    }

    if(mainWindow.isMaximized())
    {
        mainWindow.unmaximize();
        return false;
    }
    else
    {
        mainWindow.maximize();
        return true;
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:isMaximized', () => {

    return mainWindow?.isMaximized() || false;
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:close', () => {

    mainWindow?.close();
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:destroy', () => {

    mainWindow?.destroy();
});

/*--------------------------------------------------------------------------------------------------------------------*/
