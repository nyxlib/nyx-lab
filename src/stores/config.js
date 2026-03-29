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
    webPages: {},
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
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

                    for(const panel of this.appPanels[name]?.panels || [])
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

                    for(const panel of this.appPanels[name]?.panels || [])
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

            if(!addonDescrs || Object.keys(addonDescrs).length === 0)
            {
                return Promise.resolve();
            }

            /*--------------------------------------------------------------------------------------------------------*/

            return Promise.allSettled(Object.values(addonDescrs).sort((x, y) => x.rank - y.rank).map((addonDescr) => {

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

        startStopExts(addonDescrs, webPageDescrs, interfacePanelDescrs)
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

            Object.values(webPageDescrs).filter((x) => x.zombie).forEach((zombie) => {

                delete webPageDescrs[zombie.id];
            });

            /*--------------------------------------------------------------------------------------------------------*/
            /* ADDONS                                                                                                 */
            /*--------------------------------------------------------------------------------------------------------*/

            if(!addonDescrs || Object.keys(addonDescrs).length === 0)
            {
                return Promise.resolve();
            }

            /*--------------------------------------------------------------------------------------------------------*/

            const zombies = [];

            /*--------------------------------------------------------------------------------------------------------*/

            this._startStop({}, defaultControls, 'default-controls', true);

            /*--------------------------------------------------------------------------------------------------------*/

            return Promise.allSettled(Object.values(addonDescrs).sort((x, y) => x.rank - y.rank).map((addonDescr) => {

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

            try
            {
                /*----------------------------------------------------------------------------------------------------*/

                const tmp_globals = JSON.parse(json || '{}');

                /*----------------------------------------------------------------------------------------------------*/

                this.initAddons(tmp_globals.addons).then(() => {

                    this.globals = confDup(tmp_globals, DEFAULT_GLOBALS);

                    return this.startStopExts(this.globals.addons, this.globals.webPages, this.globals.interfacePanels);

                }).then(() => {

                    setTimeout(() => {

                        this.modified = false;

                    }, 500);

                    this.dialog.success();

                    this.dialog.unlock();

                }).catch((e) => {

                    this.dialog.error(e);

                    this.dialog.unlock();
                });

                /*----------------------------------------------------------------------------------------------------*/
            }
            catch(e)
            {
                this.dialog.error(e);

                this.dialog.unlock();
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _saveConfig(indent)
        {
            this.dialog.lock();

            return this.initAddons(this.globals.addons).then(() => {

                this.globals = confDup(this.globals, DEFAULT_GLOBALS);

                return this.startStopExts(this.globals.addons, this.globals.webPages, this.globals.interfacePanels);

            }).then(() => {

                const json = JSON.stringify(this.globals, null, indent ? 2 : 0);

                this.dialog.success();

                this.dialog.unlock();

                return json;

            }).catch((e) => {

                this.dialog.error(e);

                this.dialog.unlock();

                throw e;
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        import()
        {
            this.dialog.open('config.json', 'application/json;charset=utf-8', 'JSON Files', ['json']).then(([json]) => {

                this._loadConfig(json);

            }, this.dialog.error);
        },

        /*------------------------------------------------------------------------------------------------------------*/

        load()
        {
            this._loadConfig(localStorage.getItem('nyx-lab-config'));
        },

        /*------------------------------------------------------------------------------------------------------------*/

        export()
        {
            this._saveConfig(true).then((json) => {

                return this.dialog.save('config.json', 'application/json;charset=utf-8', 'JSON Files', ['json'], json.toString());

            }).then(() => {

                setTimeout(() => {

                    this.modified = false;

                }, 500);

            }, this.dialog.error);
        },

        /*------------------------------------------------------------------------------------------------------------*/

        save()
        {
            this._saveConfig(false).then((json) => {

                localStorage.setItem('nyx-lab-config', json.toString());

                setTimeout(() => {

                    this.modified = false;

                }, 500);

            }, this.dialog.error);
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useConfigStore;

/*--------------------------------------------------------------------------------------------------------------------*/
