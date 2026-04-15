/*--------------------------------------------------------------------------------------------------------------------*/

import {watch, inject, nextTick} from 'vue';

import {defineStore} from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/

import addonFunctions from '@/stores/addon';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const WINDOWS_THEME = localStorage.getItem('nyxLabTheme') || 'dark';

/*--------------------------------------------------------------------------------------------------------------------*/

const DEFAULT_GLOBALS = {
    windowTitle: 'Nyx Lab',
    windowTheme: WINDOWS_THEME,
    animateHomePage: true,
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
    addons: {},
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

                localStorage.setItem('nyxLabTheme', value);

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

        _setConfig(globals, stopAll, indent = false)
        {
            this.dialog.lock();

            /*--------------------------------------------------------------------------------------------------------*/
            /* STOP ADDONS                                                                                            */
            /*--------------------------------------------------------------------------------------------------------*/

            const stopAddons = (f) => {

                if(stopAll) {

                    return this.startStopAddons(this.globals.addons, this.globals.interfacePanels, true).then(() => {

                        return f();
                    });
                }
                else {
                    return f();
                }
            };

            /*--------------------------------------------------------------------------------------------------------*/
            /* LOAD CONFIG & START ADDONS                                                                             */
            /*--------------------------------------------------------------------------------------------------------*/

            return stopAddons(() => {

                const tmp_globals = this.sanitize(
                    globals,
                    stopAll
                );

                return this.initAddons(tmp_globals).then(() => {

                    this.globals = confDup(tmp_globals, DEFAULT_GLOBALS);

                    return this.startStopAddons(this.globals.addons, this.globals.interfacePanels, false).then(() => {

                        /*--------------------------------------------------------------------------------------------*/

                        const json = _safeJSONStringify(this.globals, indent);

                        /*--------------------------------------------------------------------------------------------*/

                        _safeSetItem('nyx-lab-config', json).then(() => {

                            nextTick().then(() => {

                                this.modified = false;
                            });

                            this.dialog.success();
                            this.dialog.unlock();
                        });

                        /*--------------------------------------------------------------------------------------------*/

                        return json;
                    });
                });
            });

            /*--------------------------------------------------------------------------------------------------------*/
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _confirm_close_workspace(f)
        {
            this.dialog.confirm('Are you sure you want to close the current workspace?', 'Nyx Lab', {icon: 'question'}).then((choice) => {

                if(choice)
                {
                    f();
                }
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _confirm_discard_changes(f)
        {
            this.dialog.confirm('Are you sure you want to discard your changes?', 'Nyx Lab', {icon: 'question'}).then((choice) => {

                if(choice)
                {
                    f();
                }
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _confirmIfModified(f)
        {
            if(this.modified) {

                this._confirm_discard_changes(() => {

                    f();
                });
            }
            else {
                f();
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        new()
        {
            this._confirm_close_workspace(() => {

                this._setConfig(null, true, false);
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        import()
        {
            this._confirm_close_workspace(() => {

                this.dialog.open('config.nyx', 'application/vnd.nyx+json;charset=utf-8', 'Nyx Configuration Files', ['nyx', 'json']).then((file) => {

                    if(file)
                    {
                        this._setConfig(_safeJSONParse(file.text), true, false);
                    }
                });
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        export()
        {
            this._setConfig(this.globals, false,true).then((json) => {

                this.dialog.save('config.nyx', 'application/vnd.nyx+json;charset=utf-8', 'Nyx Configuration Files', ['nyx', 'json'], json);
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        rollback()
        {
            this._confirmIfModified(() => {

                _safeGetItem('nyx-lab-config').then((json) => {

                    this._setConfig(_safeJSONParse(json), false);
                });
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        persist()
        {
            this._setConfig(this.globals, false);
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useConfigStore;

/*--------------------------------------------------------------------------------------------------------------------*/
