/*--------------------------------------------------------------------------------------------------------------------*/

const {app, dialog, ipcMain, session, protocol, BrowserWindow} = require('electron');

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

    /*----------------------------------------------------------------------------------------------------------------*/

    canClose = false;

    /*----------------------------------------------------------------------------------------------------------------*/

    const filter = {
        urls: [
            'https://tile.openstreetmap.org/*',
            'https://*.tile.openstreetmap.org/*'
        ]
    };

    session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {

        details.requestHeaders['User-Agent'] = 'NyxLab/1.0.0 (+https://nyxlib.org)';

        callback({requestHeaders: details.requestHeaders});
    });

    /*----------------------------------------------------------------------------------------------------------------*/

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

    /*----------------------------------------------------------------------------------------------------------------*/

    const indexPath = app.isPackaged ? path.join(__dirname, 'dist', 'index.html')
                                     : path.join(__dirname, '..', 'dist', 'index.html')
    ;

    mainWindow.loadFile(indexPath).then(() => {

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
/* IPC - DIALOG                                                                                                       */
/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:dialog:message', async (_event, message, options = {}) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const result = await dialog.showMessageBox({
        type: options.kind ?? 'info',
        title: options.title ?? 'Information',
        message: String(message),
        buttons: ['OK'],
        defaultId: 0,
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    return result.response === 0;
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:dialog:confirm', async (_event, message, options = {}) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const result = await dialog.showMessageBox({
        type: options.kind ?? 'question',
        title: options.title ?? 'Confirmation',
        message: String(message),
        buttons: ['OK', 'Cancel'],
        defaultId: 0,
        cancelId: 1,
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    return result.response === 0;
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:dialog:open', async (_event, defaultPath, typeName, typeExts) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const result = await dialog.showOpenDialog({
        defaultPath: defaultPath || undefined,
        filters: [{
            name: typeName,
            extensions: typeExts,
        }],
        properties: ['openFile'],
    });

    if(result.canceled || result.filePaths.length === 0)
    {
        throw new Error('Operation cancelled');
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const text = await fsp.readFile(result.filePaths[0], 'utf8');

    /*----------------------------------------------------------------------------------------------------------------*/

    return [text, result.filePaths[0]];
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:dialog:save', async (_event, defaultPath, typeName, typeExts, contents) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const result = await dialog.showSaveDialog({
        defaultPath: defaultPath || undefined,
        filters: [{
            name: typeName,
            extensions: typeExts,
        }],
    });

    if(result.canceled || !result.filePath)
    {
        throw new Error('Operation cancelled');
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    await fsp.writeFile(result.filePath, contents, 'utf8');

    /*----------------------------------------------------------------------------------------------------------------*/

    return result.filePath;
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* IPC - CACHE                                                                                                        */
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
