/*--------------------------------------------------------------------------------------------------------------------*/

const {ipcRenderer, contextBridge} = require('electron');

/*--------------------------------------------------------------------------------------------------------------------*/

contextBridge.exposeInMainWorld('__ELECTRON__', {

    /*----------------------------------------------------------------------------------------------------------------*/

    minimize: () => ipcRenderer.invoke('nyx:window:minimize'),

    maximize: () => ipcRenderer.invoke('nyx:window:maximize'),

    toggleMaximize: () => ipcRenderer.invoke('nyx:window:toggleMaximize'),

    isMaximized: () => ipcRenderer.invoke('nyx:window:isMaximized'),

    /*----------------------------------------------------------------------------------------------------------------*/

    close: () => ipcRenderer.invoke('nyx:window:close'),

    destroy: () => ipcRenderer.invoke('nyx:window:destroy'),

    onCloseRequested: (callback) => {

        ipcRenderer.addListener('nyx://close-requested', callback);

        return () => {

            ipcRenderer.removeListener('nyx://close-requested', callback);
        };
    },

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
