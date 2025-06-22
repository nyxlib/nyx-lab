// noinspection JSValidateTypes, JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import {watch, inject} from 'vue';

import {defineStore} from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/

import router from '../router';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const DEFAULT_GLOBALS = {
    mqttURL: '',
    mqttUsername: '',
    mqttPassword: '',
    /**/
    nssURL: '',
    nssUsername: '',
    nssPassword: '',
    /**/
    enableInterfaces: false,
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

    if(typeof src === 'object'
        &&
        typeof def === 'object'
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
        methods: {},
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
            this.dialog = inject('dialog');
            this.addon = inject('addon');

            watch(() => this.globals, () => {

                this.modified = true;

            }, {

                deep: true
            });

            this.load();
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
                /*----------------------------------------------------------------------------------------------------*/

                const TEMP_GLOBALS = {};

                addon.init(TEMP_GLOBALS, this.addon, name);

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

                    /*------------------------------------------------------------------------------------------------*/

                    addon.start(this.addon, name);

                    /*------------------------------------------------------------------------------------------------*/

                    for(const panel of this.appPanels[name].panels)
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

                    for(const panel of this.appPanels[name].panels)
                    {
                        router.removeRoute(panel.id);
                    }

                    /*------------------------------------------------------------------------------------------------*/

                    addon.stop(this.addon, name);

                    /*------------------------------------------------------------------------------------------------*/

                    delete this.confPanels[name];
                    delete this.appPanels[name];
                    delete this.controls[name];

                    /*------------------------------------------------------------------------------------------------*/
                }
            }

            /*--------------------------------------------------------------------------------------------------------*/
        },

        /*------------------------------------------------------------------------------------------------------------*/

        initAddons(addonDescrs)
        {
            return new Promise((resolve) => {

                /*----------------------------------------------------------------------------------------------------*/

                if(!addonDescrs || Object.keys(addonDescrs).length === 0)
                {
                    resolve();

                    return;
                }

                /*----------------------------------------------------------------------------------------------------*/

                let n = 0;

                /*----------------------------------------------------------------------------------------------------*/

                for(const addonDescr of Object.values(addonDescrs).sort((x, y) => x.rank - y.rank))
                {
                    n++;

                    try
                    {
                        this.addon.load(addonDescr.url).then(([addon, name, do_init]) => {

                            this._init(addon, name, do_init);

                            console.info(`Loading addon '${addonDescr.url}': [OKAY]`);

                            if(--n === 0) {
                                resolve();
                            }

                        }).catch((e) => {

                            console.error(`Loading addon '${addonDescr.url}': [ERROR]\n${e}`);

                            if(--n === 0) {
                                resolve();
                            }
                        });
                    }
                    catch(e)
                    {
                        console.error(`Loading addon '${addonDescr.url}': [ERROR]\n${e}`);

                        if(--n === 0) {
                            resolve();
                        }
                    }
                }

                /*----------------------------------------------------------------------------------------------------*/
            });
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

            return new Promise((resolve) => {

                /*----------------------------------------------------------------------------------------------------*/

                if(!addonDescrs || Object.keys(addonDescrs).length === 0)
                {
                    resolve();

                    return;
                }

                /*----------------------------------------------------------------------------------------------------*/

                const zombies = [];

                const cleanup = () => {

                    for(const zombie of zombies)
                    {
                        delete addonDescrs[zombie.id];
                    }

                    resolve();
                };

                /*----------------------------------------------------------------------------------------------------*/

                let n = 0;

                /*----------------------------------------------------------------------------------------------------*/

                for(const addonDescr of Object.values(addonDescrs).sort((x, y) => x.rank - y.rank))
                {
                    if(addonDescr.zombie)
                    {
                        zombies.push(addonDescr);

                        addonDescr.enabled = false;
                    }

                    addonDescr.started = false;

                    n++;

                    try
                    {
                        this.addon.load(addonDescr.url).then(([addon, name, _]) => {

                            addonDescr.started = addonDescr.enabled;

                            this._startStop(addonDescr, addon, name, addonDescr.started);

                            if(--n === 0) {
                                cleanup();
                            }

                        }).catch((e) => {

                            console.error(`${addonDescr.enabled ? 'Stopping' : 'Starting'} addon '${addonDescr.url}': [ERROR]\n${e}`);

                            if(--n === 0) {
                                cleanup();
                            }
                        });
                    }
                    catch(e)
                    {
                        console.error(`${addonDescr.enabled ? 'Stopping' : 'Starting'} addon '${addonDescr.url}': [ERROR]\n${e}`);

                        if(--n === 0) {
                            cleanup();
                        }
                    }
                }

                /*----------------------------------------------------------------------------------------------------*/
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

                    this.startStopExts(this.globals.addons, this.globals.webPages, this.globals.interfacePanels).then(() => {

                        setTimeout(() => {

                            this.modified = false;

                        }, 500);

                        this.dialog.success();

                        this.dialog.unlock();
                    });
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

            return new Promise((resolve) => {

                /*----------------------------------------------------------------------------------------------------*/

                this.initAddons(this.globals.addons).then(() => {

                    this.globals = confDup(this.globals, DEFAULT_GLOBALS);

                    this.startStopExts(this.globals.addons, this.globals.webPages, this.globals.interfacePanels).then(() => {

                        resolve(JSON.stringify(this.globals, null, indent ? 2 : 0));

                        this.dialog.success();

                        this.dialog.unlock();
                    });
                });

                /*----------------------------------------------------------------------------------------------------*/
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        import()
        {
            this.dialog.open('config.json', 'application/json;charset=utf-8', 'JSON Files', ['json']).then(([json, _]) => this._loadConfig(json)).catch(this.dialog.error);
        },

        /*------------------------------------------------------------------------------------------------------------*/

        load()
        {
            this._loadConfig(localStorage.getItem('nyx-dashboard-config'));
        },

        /*------------------------------------------------------------------------------------------------------------*/

        export()
        {
            this._saveConfig(true).then((json) => {

                this.dialog.save('config.json', 'application/json;charset=utf-8', 'JSON Files', ['json'], json.toString()).catch(this.dialog.error).then(() => {

                    setTimeout(() => {

                        this.modified = false;

                    }, 500);
                });
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        save()
        {
            this._saveConfig(false).then((json) => {

                localStorage.setItem('nyx-dashboard-config', json.toString());

                setTimeout(() => {

                    this.modified = false;

                }, 500);
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useConfigStore;

/*--------------------------------------------------------------------------------------------------------------------*/
