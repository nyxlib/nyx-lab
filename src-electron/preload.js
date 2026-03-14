/*--------------------------------------------------------------------------------------------------------------------*/

const {ipcRenderer, contextBridge} = require('electron');

/*--------------------------------------------------------------------------------------------------------------------*/

contextBridge.exposeInMainWorld('__ELECTRON__', {

    /*----------------------------------------------------------------------------------------------------------------*/

    minimize: () => ipcRenderer.invoke('nyx:window:minimize'),

    toggleMaximize: () => ipcRenderer.invoke('nyx:window:toggleMaximize'),

    /*----------------------------------------------------------------------------------------------------------------*/

    close: () => ipcRenderer.invoke('nyx:window:close'),

    destroy: () => ipcRenderer.invoke('nyx:window:destroy'),

    isMaximized: () => ipcRenderer.invoke('nyx:window:isMaximized'),

    /*----------------------------------------------------------------------------------------------------------------*/

    onCloseRequested: (callback) => {

        ipcRenderer.on('nyx://close-requested', callback);

        return () => {

            ipcRenderer.removeListener('nyx://close-requested', callback);
        };
    },

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
