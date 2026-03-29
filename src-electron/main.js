/*--------------------------------------------------------------------------------------------------------------------*/

const {app, ipcMain, protocol, BrowserWindow} = require('electron');

const fsp = require('node:fs/promises');

const path = require('node:path');

/*--------------------------------------------------------------------------------------------------------------------*/

const {
    initCache,
    listCachedFiles,
    deleteCachedFile,
    deleteCachedFiles,
} = require('./cache');

/*--------------------------------------------------------------------------------------------------------------------*/

const {
    installLinux
} = require('./postInstall');

/*--------------------------------------------------------------------------------------------------------------------*/

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'nyx',
        privileges: {
            stream: true,
            secure: true,
            standard: true,
            supportFetchAPI: true,
        },
    },
]);

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

let canClose = false;

let mainWindow = null;

let pendingConfig = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* HELPERS                                                                                                            */
/*--------------------------------------------------------------------------------------------------------------------*/

const sendPendingConfig = () => {

    if(pendingConfig && mainWindow)
    {
        mainWindow.webContents.send(
            'nyx://open-config-requested',
            pendingConfig.config,
            pendingConfig.filename
        );

        pendingConfig = null;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const handleIncomingConfigPath = (filename) => {

    fsp.readFile(filename, 'utf8').then((config) => {

        pendingConfig = {
            config: config,
            filename: filename,
        };

        sendPendingConfig();

    }).catch((e) => {

        console.error(`Failed to load config '${filename}':`, e);
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* WINDOW                                                                                                             */
/*--------------------------------------------------------------------------------------------------------------------*/

const createWindow = () => {

    canClose = false;

    mainWindow = new BrowserWindow({
        height: 800,
        width: 1300,
        minHeight: 800,
        minWidth: 1300,
        hasShadow: false,
        frame: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, './dist/index.html')).then(() => {

        /*------------------------------------------------------------------------------------------------------------*/

        //mainWindow.webContents.openDevTools();

        mainWindow.maximize();

        mainWindow.show();

        /*------------------------------------------------------------------------------------------------------------*/

        sendPendingConfig();

        for(const arg of process.argv.slice(process.defaultApp ? 2 : 1))
        {
            if(arg && !arg.startsWith('-') && /\.(nyx|json)$/i.test(arg))
            {
                handleIncomingConfigPath(path.resolve(arg));
            }
        }

        /*------------------------------------------------------------------------------------------------------------*/
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    mainWindow.on('close', (e) => {

        if(!canClose)
        {
            e.preventDefault();

            mainWindow.webContents.send('nyx://close-requested');
        }
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    mainWindow.on('closed', () => {

        mainWindow = null;
    });

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* APPLICATION                                                                                                        */
/*--------------------------------------------------------------------------------------------------------------------*/

app.on('open-file', (event, filename) => {

    event.preventDefault();

    handleIncomingConfigPath(filename);
});

/*--------------------------------------------------------------------------------------------------------------------*/

app.whenReady().then(() => {

    installLinux();

    return initCache();

}).then(() => {

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
/* IPC - WINDOW                                                                                                       */
/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:minimize', () => {

    mainWindow?.minimize();
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:maximize', () => {

    mainWindow?.maximize();
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:toggleMaximize', () => {

    if(mainWindow)
    {
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
    }

    return false;
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:isMaximized', () => {

    return mainWindow?.isMaximized() || false;
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:close', () => {

    canClose = true;

    mainWindow?.close();
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:destroy', () => {

    canClose = true;

    mainWindow?.destroy();
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* IPC - ADDON CACHE                                                                                                  */
/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:addons:deleteCachedFile', (_, pathname) => {

    return deleteCachedFile(pathname);
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:addons:deleteCachedFiles', () => {

    return deleteCachedFiles();
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:addons:listCachedFiles', () => {

    return listCachedFiles();
});

/*--------------------------------------------------------------------------------------------------------------------*/
