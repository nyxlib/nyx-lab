/*--------------------------------------------------------------------------------------------------------------------*/

const {ipcRenderer, contextBridge} = require('electron');

/*--------------------------------------------------------------------------------------------------------------------*/

contextBridge.exposeInMainWorld('__ELECTRON__', {

    /*----------------------------------------------------------------------------------------------------------------*/
    /* APPLICATION                                                                                                    */
    /*----------------------------------------------------------------------------------------------------------------*/

    minimize: () => ipcRenderer.invoke('nyx:window:minimize'),

    maximize: () => ipcRenderer.invoke('nyx:window:maximize'),

    toggleMaximize: () => ipcRenderer.invoke('nyx:window:toggleMaximize'),

    isMaximized: () => ipcRenderer.invoke('nyx:window:isMaximized'),

    close: () => ipcRenderer.invoke('nyx:window:close'),

    destroy: () => ipcRenderer.invoke('nyx:window:destroy'),

    /*----------------------------------------------------------------------------------------------------------------*/

    onCloseRequested: (callback) => {

        const listener = () => callback();

        ipcRenderer.addListener('nyx://close-requested', listener);

        return () => {

            ipcRenderer.removeListener('nyx://close-requested', listener);
        };
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    onOpenConfigRequested: (callback) => {

        const listener = (_event, config, filename) => callback(
            config,
            filename
        );

        ipcRenderer.addListener('nyx://open-config-requested', listener);

        return () => {

            ipcRenderer.removeListener('nyx://open-config-requested', listener);
        };
    },

    /*----------------------------------------------------------------------------------------------------------------*/
    /* DIALOG                                                                                                         */
    /*----------------------------------------------------------------------------------------------------------------*/

    open: (defaultPath, _typeMime, typeName, typeExts) => ipcRenderer.invoke('nyx:dialog:open', defaultPath, typeName, typeExts),

    save: (defaultPath, _typeMime, typeName, typeExts, contents) => ipcRenderer.invoke('nyx:dialog:save', defaultPath, typeName, typeExts, contents),

    /*----------------------------------------------------------------------------------------------------------------*/
    /* BROWSER                                                                                                        */
    /*----------------------------------------------------------------------------------------------------------------*/

    browse: (url) => ipcRenderer.invoke('nyx:browser:browse', url),

    /*----------------------------------------------------------------------------------------------------------------*/
    /* CACHE                                                                                                          */
    /*----------------------------------------------------------------------------------------------------------------*/

    deleteCachedFile: (pathname) => ipcRenderer.invoke('nyx:addons:deleteCachedFile', pathname),

    deleteCachedFiles: () => ipcRenderer.invoke('nyx:addons:deleteCachedFiles'),

    listCachedFiles: () => ipcRenderer.invoke('nyx:addons:listCachedFiles'),

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
