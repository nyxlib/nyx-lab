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

        const listener = () => callback();

        ipcRenderer.addListener('nyx://close-requested', listener);

        return () => {

            ipcRenderer.removeListener('nyx://close-requested', listener);
        };
    },

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
