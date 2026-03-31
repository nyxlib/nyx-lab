/*--------------------------------------------------------------------------------------------------------------------*/

import {watch, inject} from 'vue';

import {defineStore} from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/

import router from '@/router';

import defaultControls from '@/default-controls.js';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const DEFAULT_GLOBALS = {
    windowTitle: 'Nyx Lab',
    windowTheme: localStorage.getItem('theme') || 'dark',
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
        modified: false,
        /* ADDONS */
        confPanels: {},
        appPanels: {},
        controls: {},
        functions: {},
        console: []
    }),
    getters: {
        /*------------------------------------------------------------------------------------------------------------*/

        isAddonEnabled()
        {
            return (addonName) => {

                const addon = this.globals.addons?.[addonName];

                return addon?.enabled === true && addon?.zombie !== true;
            };
        }

        /*------------------------------------------------------------------------------------------------------------*/
    },
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

                localStorage.setItem('theme', value);

            }, {immediate: true, deep: false});

            /*--------------------------------------------------------------------------------------------------------*/

            watch(() => this.globals, () => {

                this.modified = true;

            }, {immediate: false, deep: true});

            /*--------------------------------------------------------------------------------------------------------*/

            this.load();

            /*--------------------------------------------------------------------------------------------------------*/
        },

        /*------------------------------------------------------------------------------------------------------------*/
        /* CONFIG                                                                                                     */
        /*------------------------------------------------------------------------------------------------------------*/

        _init(addon, name, do_init)
        {
            /*--------------------------------------------------------------------------------------------------------*/
            /* INIT                                                                                                   */
            /*--------------------------------------------------------------------------------------------------------*/

            if(do_init && typeof addon.init === 'function')
            {
                const TEMP_GLOBALS = {};

                /*----------------------------------------------------------------------------------------------------*/

                try {
                    addon.init(TEMP_GLOBALS, this.addon, name);
                }
                catch(e) {
                    this.console.push(e);
                }

                /*----------------------------------------------------------------------------------------------------*/

                for(const key of Object.keys(TEMP_GLOBALS))
                {
                    if(!(key in this.globals)) this.globals[key] = TEMP_GLOBALS[key];

                    if(!(key in DEFAULT_GLOBALS)) DEFAULT_GLOBALS[key] = TEMP_GLOBALS[key];
                }

                /*----------------------------------------------------------------------------------------------------*/
            }

            /*--------------------------------------------------------------------------------------------------------*/
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _startStop(descr, addon, name, do_start)
        {
            /*--------------------------------------------------------------------------------------------------------*/
            /* START / STOP                                                                                           */
            /*--------------------------------------------------------------------------------------------------------*/

            if(do_start)
            {
                if(typeof addon.start === 'function')
                {
                    /*------------------------------------------------------------------------------------------------*/

                    this.confPanels[name] = {descr: descr, addon: addon, panels: []};
                    this.appPanels[name] = {descr: descr, addon: addon, panels: []};
                    this.controls[name] = {descr: descr, addon: addon, ctrls: []};
                    this.functions[name] = {descr: descr, addon: addon, funcs: {}};

                    /*------------------------------------------------------------------------------------------------*/

                    try {
                        addon.start(this.addon, name);
                    }
                    catch(e) {
                        this.console.push(e);
                    }

                    /*------------------------------------------------------------------------------------------------*/

                    for(const panel of this.appPanels[name]?.panels ?? [])
                    {
                        router.addRoute(panel);
                    }

                    /*------------------------------------------------------------------------------------------------*/
                }
            }
            else
            {
                if(typeof addon.stop === 'function')
                {
                    /*------------------------------------------------------------------------------------------------*/

                    for(const panel of this.appPanels[name]?.panels ?? [])
                    {
                        router.removeRoute(panel.id);
                    }

                    /*------------------------------------------------------------------------------------------------*/

                    try {
                        addon.stop(this.addon, name);
                    }
                    catch(e) {
                        this.console.push(e);
                    }

                    /*------------------------------------------------------------------------------------------------*/

                    delete this.confPanels[name];
                    delete this.appPanels[name];
                    delete this.controls[name];
                    delete this.functions[name];

                    /*------------------------------------------------------------------------------------------------*/
                }
            }

            /*--------------------------------------------------------------------------------------------------------*/
        },

        /*------------------------------------------------------------------------------------------------------------*/

        initAddons(addonDescrs)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            return Promise.allSettled(Object.values(addonDescrs ?? []).filter((x) => x.type === 'addon').sort((x, y) => x.rank - y.rank).map((addonDescr) => {

                try
                {
                    return this.addon.load(addonDescr.url).then(([addon, name, do_init]) => {

                        this._init(addon, name, do_init);

                        this.console.push(`Loading addon '${addonDescr.url}': [OKAY]`);

                    }).catch((e) => {

                        this.console.push(`Loading addon '${addonDescr.url}': [ERROR]\n${e}`);
                    });
                }
                catch(e)
                {
                    this.console.push(`Loading addon '${addonDescr.url}': [ERROR]\n${e}`);

                    return Promise.resolve();
                }
            }));

            /*--------------------------------------------------------------------------------------------------------*/
        },

        /*------------------------------------------------------------------------------------------------------------*/

        startStopExts(addonDescrs, interfacePanelDescrs)
        {
            /*--------------------------------------------------------------------------------------------------------*/
            /* INTERFACE PANELS                                                                                       */
            /*--------------------------------------------------------------------------------------------------------*/

            Object.values(interfacePanelDescrs).filter((x) => x.zombie).forEach((zombie) => {

                delete interfacePanelDescrs[zombie.id];
            });

            /*--------------------------------------------------------------------------------------------------------*/
            /* WEB PAGES                                                                                              */
            /*--------------------------------------------------------------------------------------------------------*/

            Object.values(addonDescrs).filter((x) => x.type === 'page' && x.zombie).forEach((zombie) => {

                delete addonDescrs[zombie.id];
            });

            /*--------------------------------------------------------------------------------------------------------*/
            /* ADDONS                                                                                                 */
            /*--------------------------------------------------------------------------------------------------------*/

            const zombies = [];

            /*--------------------------------------------------------------------------------------------------------*/

            this._startStop({}, defaultControls, 'default-controls', true);

            /*--------------------------------------------------------------------------------------------------------*/

            return Promise.allSettled(Object.values(addonDescrs ?? []).filter((x) => x.type === 'addon').sort((x, y) => x.rank - y.rank).map((addonDescr) => {

                if(addonDescr.zombie)
                {
                    zombies.push(addonDescr);

                    addonDescr.enabled = false;
                }

                addonDescr.started = false;

                try
                {
                    return this.addon.load(addonDescr.url).then(([addon, name]) => {

                        addonDescr.started = addonDescr.enabled;

                        this._startStop(addonDescr, addon, name, addonDescr.started);

                    }).catch((e) => {

                        this.console.push(`${addonDescr.enabled ? 'Stopping' : 'Starting'} addon '${addonDescr.url}': [ERROR]\n${e}`);
                    });
                }
                catch(e)
                {
                    this.console.push(`${addonDescr.enabled ? 'Stopping' : 'Starting'} addon '${addonDescr.url}': [ERROR]\n${e}`);

                    return Promise.resolve();
                }

            })).then(() => {

                for(const zombie of zombies)
                {
                    delete addonDescrs[zombie.id];
                }
            });

            /*--------------------------------------------------------------------------------------------------------*/
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _loadConfig(json)
        {
            this.dialog.lock();

            const tmp_globals = _safeJSONParse(json);

            return this.initAddons(tmp_globals.addons).then(() => {

                this.globals = confDup(tmp_globals, DEFAULT_GLOBALS);

                return this.startStopExts(this.globals.addons, this.globals.interfacePanels);

            }).then(() => {

                const json = _safeJSONStringify(this.globals, false);

                this.dialog.success();

                return json;

            }).catch((e) => {

                this.dialog.error(e);

                throw e;

            }).finally(() => {

                this.dialog.unlock();
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _saveConfig(indent)
        {
            this.dialog.lock();

            return this.initAddons(this.globals.addons).then(() => {

                this.globals = confDup(this.globals, DEFAULT_GLOBALS);

                return this.startStopExts(this.globals.addons, this.globals.interfacePanels);

            }).then(() => {

                const json = _safeJSONStringify(this.globals, indent);

                this.dialog.success();

                return json;

            }).catch((e) => {

                this.dialog.error(e);

                throw e;

            }).finally(() => {

                this.dialog.unlock();
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _setNotModified()
        {
            setTimeout(() => {

                this.modified = false;

            }, 500);
        },

        /*------------------------------------------------------------------------------------------------------------*/

        import()
        {
            this.dialog.open('config.nyx', 'application/vnd.nyx+json;charset=utf-8', 'Nyx Configuration Files', ['nyx', 'json']).then(([json]) => {

                this._loadConfig(json).then((json) => {

                    _safeSetItem('nyx-lab-config', json.toString()).then(() => {

                        this._setNotModified();
                    });
                });

            }, this.dialog.error);
        },

        /*------------------------------------------------------------------------------------------------------------*/

        load()
        {
            _safeGetItem('nyx-lab-config').then((value) => {

                this._loadConfig(value).then(() => {

                    this._setNotModified();
                });
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        export()
        {
            this._saveConfig(true).then((json) => {

                this.dialog.save('config.nyx', 'application/vnd.nyx+json;charset=utf-8', 'Nyx Configuration Files', ['nyx', 'json'], json.toString()).then(() => {

                    this._setNotModified();

                }, this.dialog.error);
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        save()
        {
            this._saveConfig(false).then((json) => {

                _safeSetItem('nyx-lab-config', json.toString()).then(() => {

                    this._setNotModified();
                });
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useConfigStore;

/*--------------------------------------------------------------------------------------------------------------------*/
