/*--------------------------------------------------------------------------------------------------------------------*/

const {app, shell, dialog, ipcMain, session, protocol, BrowserWindow} = require('electron');

const process = require('node:child_process');

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

const handleConfigPath = (filename) => {

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
        show: false,
        frame: false,
        hasShadow: false,
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

        mainWindow.webContents.setWindowOpenHandler((details) => {

            if(!details.url.startsWith('http://localhost'))
            {
                shell.openExternal(details.url).catch((error) => {

                    console.error(error);
                });

                return {action: 'deny'};
            }

            return {action: 'allow'};
        });

        /*------------------------------------------------------------------------------------------------------------*/

        sendPendingConfig();

        for(const arg of process.argv.slice(process.defaultApp ? 2 : 1))
        {
            if(arg && !arg.startsWith('-') && /\.(nyx|json)$/i.test(arg))
            {
                handleConfigPath(path.resolve(arg));
            }
        }

        /*------------------------------------------------------------------------------------------------------------*/
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    mainWindow.on('close', (e) => {

        if(canClose)
        {
            canClose = false;
        }
        else
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

console.log('userData:', app.getPath('userData'));

/*--------------------------------------------------------------------------------------------------------------------*/

app.on('open-file', (event, filename) => {

    event.preventDefault();

    handleConfigPath(filename);
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

    /*------------*/

    mainWindow?.close();
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:window:destroy', () => {

    canClose = true;

    mainWindow?.close();
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* IPC - DIALOG                                                                                                       */
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

    if(!result.canceled && result.filePaths.length > 0)
    {
        const text = await fsp.readFile(result.filePaths[0], 'utf8');

        return {text: text, name: result.filePaths[0]};
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return null;
});

/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:dialog:save', async (_event, defaultPath, typeName, typeExts, text) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const result = await dialog.showSaveDialog({
        defaultPath: defaultPath || undefined,
        filters: [{
            name: typeName,
            extensions: typeExts,
        }],
        properties: ['createDirectory'],
    });

    if(!result.canceled && result.filePath)
    {
        await fsp.writeFile(result.filePath, text, 'utf8');

        return {text: text, name: result.filePath};
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return null;
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* IPC - BROWSER                                                                                                      */
/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:browser:browse', (_, url) => {

    return shell.openExternal(url);
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* IPC - COMMAND                                                                                                      */
/*--------------------------------------------------------------------------------------------------------------------*/

ipcMain.handle('nyx:command:exec', async (event, cmd, args = []) => {

    return await new Promise((resolve) => {

        const proc = process.spawn(cmd, args);

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => {

            stdout += data.toString();
        });

        proc.stderr.on('data', (data) => {

            stderr += data.toString();
        });

        proc.on('error', (e) => {

            resolve({
                stdout: /**/''/**/,
                stderr: e.message,
                code: -1,
            });
        });

        proc.on('close', (code) => {

            resolve({
                stdout: stdout,
                stderr: stderr,
                code: code,
            });
        });
    });
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
