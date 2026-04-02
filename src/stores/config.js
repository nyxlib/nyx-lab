/*--------------------------------------------------------------------------------------------------------------------*/

import {watch, inject, nextTick} from 'vue';

import {defineStore} from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/

import addonFunctions from './addonFunctions.js';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const DEFAULT_GLOBALS = {
    windowTitle: 'Nyx Lab',
    windowTheme: localStorage.getItem('bsTheme') || 'dark',
    /**/
    mqttURL: '',
    nssURL: '',
    mqttUsername: '',
    askMQTTUsername: false,
    mqttPassword: '',
    askMQTTPassword: false,
    /**/
    showNyxInterfaces: true,
    showUserInterfaces: false,
    interfacePanels: {},
    interfaceWidgets: {},
    /**/
    devices: {},
    addons: {
        '94300404-2ea8-11f1-b3cc-83604f9dfd78': {
            'id': '94300404-2ea8-11f1-b3cc-83604f9dfd78',
            'rank': -999,
            'type': 'addon',
            'url': 'addon://default/latest/',
            'zombie': false,
            'enabled': true,
            'started': false,
        },
    },
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* HELPERS                                                                                                            */
/*--------------------------------------------------------------------------------------------------------------------*/

const deepClone = (obj) => {

    /**/ if(Object.prototype.toString.call(obj) === '[object Object]')
    {
        return Object.fromEntries(Object.entries(obj).map(([key, val]) => [key, deepClone(val)]));
    }
    else if(Object.prototype.toString.call(obj) === '[object Array]')
    {
        return obj.map(deepClone);
    }

    return obj;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const confDup = (src, def) => {

    const result = {};

    if(Object.prototype.toString.call(src) === '[object Object]'
        &&
        Object.prototype.toString.call(def) === '[object Object]'
    ) {
        Object.keys(def).forEach((key) => { result[key] = deepClone((key in src) ? src[key] : def[key]); });
    }

    return result;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _safeGetItem = (key) => new Promise((resolve) => {

    try
    {
        const value = localStorage.getItem(key);

        resolve(value);
    }
    catch(e)
    {
        console.error(e);

        resolve(null);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

const _safeSetItem = (key, value) => new Promise((resolve) => {

    try
    {
        localStorage.setItem(key, value);

        resolve(true);
    }
    catch(e)
    {
        console.error(e);

        resolve(false);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

const _safeJSONParse = (json) => {

    try
    {
        return JSON.parse(json || '{}');
    }
    catch(e)
    {
        console.error(e);

        return {};
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _safeJSONStringify = (json, indent) => {

    try
    {
        return JSON.stringify(json, null, indent ? 2 : 0);
    }
    catch(e)
    {
        console.error(e);

        return '{}';
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* STORE                                                                                                              */
/*--------------------------------------------------------------------------------------------------------------------*/

const useConfigStore = defineStore('config', {
    state: () => ({
        /* CONFIGURATION */
        globals: deepClone(DEFAULT_GLOBALS),
        /* RUNTIME */
        modified: false,
        /* ADDONS */
        confPanels: {},
        appPanels: {},
        controls: {},
        functions: {},
        console: []
    }),
    actions: {

        /*------------------------------------------------------------------------------------------------------------*/
        /* CONFIG                                                                                                     */
        /*------------------------------------------------------------------------------------------------------------*/

        init()
        {
            /*--------------------------------------------------------------------------------------------------------*/

            this.dialog = inject('dialog');
            this.addon = inject('addon');

            /*--------------------------------------------------------------------------------------------------------*/

            watch(() => this.globals.windowTheme, (value) => {

                document.documentElement.dataset.bsTheme = value;

                localStorage.setItem('bsTheme', value);

                DEFAULT_GLOBALS.windowTheme = value;

            }, {
                immediate: true,
                deep: false,
            });

            /*--------------------------------------------------------------------------------------------------------*/

            watch(() => this.globals, () => {

                this.modified = true;

            }, {
                immediate: false,
                deep: true,
            });

            /*--------------------------------------------------------------------------------------------------------*/

            this.rollback();

            /*--------------------------------------------------------------------------------------------------------*/
        },

        /*------------------------------------------------------------------------------------------------------------*/

        ...addonFunctions(DEFAULT_GLOBALS),

        /*------------------------------------------------------------------------------------------------------------*/

        _loadConfig(json)
        {
            this.dialog.lock();

            return this.startStopAddons(this.globals.addons, this.globals.interfacePanels, true).finally(() => {

                return this.finalAddons(this.globals.addons).finally(() => {

                    this.confPanels = {};
                    this.appPanels = {};
                    this.controls = {};
                    this.functions = {};

                    const tmp_globals = _safeJSONParse(json);

                    return this.initAddons(tmp_globals.addons).finally(() => {

                        const next_globals = confDup(tmp_globals, DEFAULT_GLOBALS);

                        next_globals.addons['94300404-2ea8-11f1-b3cc-83604f9dfd78'] = (
                            DEFAULT_GLOBALS.addons['94300404-2ea8-11f1-b3cc-83604f9dfd78']
                        );

                        return this.startStopAddons(next_globals.addons, next_globals.interfacePanels, false).finally(() => {

                            const json = _safeJSONStringify(this.globals = next_globals, false);

                            _safeSetItem('nyx-lab-config', json).then(() => {

                                this.dialog.success();
                                this.dialog.unlock();
                            });

                            nextTick().then(() => {

                                this.modified = false;
                            });

                            return json;
                        });
                    });
                });
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _saveConfig(indent)
        {
            this.dialog.lock();

            return this.initAddons(this.globals.addons).finally(() => {

                const next_globals = confDup(this.globals, DEFAULT_GLOBALS);

                return this.startStopAddons(next_globals.addons, next_globals.interfacePanels, false).finally(() => {

                    const json = _safeJSONStringify(this.globals = next_globals, indent);

                    _safeSetItem('nyx-lab-config', json).then(() => {

                        this.dialog.success();
                        this.dialog.unlock();
                    });

                    nextTick().then(() => {

                        this.modified = false;
                    });

                    return json;
                });
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _confirm(f)
        {
            if(this.modified)
            {
                this.dialog.confirm('Are you sure you want to discard your changes?', 'Nyx Lab').then((choice) => {

                    if(choice)
                    {
                        f();
                    }
                });
            }
            else
            {
                f();
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        new()
        {
            this._confirm(() => {

                this._loadConfig('{}');
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        import()
        {
            this._confirm(() => {

                this.dialog.open('config.nyx', 'application/vnd.nyx+json;charset=utf-8', 'Nyx Configuration Files', ['nyx', 'json']).then(([json]) => {

                    this._loadConfig(json);

                }).catch((e) => {

                    this.dialog.error(e);
                });
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        export()
        {
            this._saveConfig(true).then((json) => {

                this.dialog.save('config.nyx', 'application/vnd.nyx+json;charset=utf-8', 'Nyx Configuration Files', ['nyx', 'json'], json).catch((e) => {

                    this.dialog.error(e);
                });
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        rollback()
        {
            this._confirm(() => {

                _safeGetItem('nyx-lab-config').then((json) => {

                    this._loadConfig(json);
                });
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        persist()
        {
            this._saveConfig(false);
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useConfigStore;

/*--------------------------------------------------------------------------------------------------------------------*/
