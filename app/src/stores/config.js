// noinspection JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject} from 'vue';

import {defineStore} from 'pinia';

import {invoke} from '@tauri-apps/api/core';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const DEFAULT_GLOBALS = {
    mqttURL: '',
    mqttUsername: '',
    mqttPassword: '',
    /**/
    enableMonitoring: false,
    monitoringGroups: [],
    monitoringMetrics: {},
    refreshInterval: 1000,
    /**/
    nodeRedURL: '',
    /**/
    addons: {},
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const confDup = (src, def) => {

    const result = {};

    if(typeof src === 'object'
       &&
       typeof def === 'object'
    ) {
        for(const key of Object.keys(def)) result[key] = (key in src) ? src[key] : def[key];
    }

    return result;
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* STORE                                                                                                              */
/*--------------------------------------------------------------------------------------------------------------------*/

const useConfigStore = defineStore('config', {
    state: () => ({
        globals: Object.assign({}, DEFAULT_GLOBALS),
        confPanels: {},
        appPanels: {},
    }),
    actions: {

        /*------------------------------------------------------------------------------------------------------------*/
        /* CONFIG                                                                                                     */
        /*------------------------------------------------------------------------------------------------------------*/

        init()
        {
            this.dialog = inject('dialog');
            this.locker = inject('locker');
            this.addon = inject('addon');

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

        _startStop(addon, name, do_start)
        {
            /*--------------------------------------------------------------------------------------------------------*/
            /* START / STOP                                                                                           */
            /*--------------------------------------------------------------------------------------------------------*/

            if(do_start)
            {
                if(typeof addon.start === 'function')
                {
                    this.confPanels[name] = [];
                    this.appPanels[name] = [];

                    addon.start(this.addon.app(), this.addon.router(), this.addon, name, this.confPanels[name], this.appPanels[name]);
                }
            }
            else
            {
                if(typeof addon.stop === 'function')
                {
                    addon.stop(this.addon.app(), this.addon.router(), this.addon, name, this.confPanels[name], this.appPanels[name]);

                    delete this.confPanels[name];
                    delete this.appPanels[name];
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

                for(const addonDescr of Object.values(addonDescrs))
                {
                    n++;

                    try
                    {
                        this.addon.load(addonDescr.path).then(([addon, name, do_init]) => {

                            this._init(addon, name, do_init);

                            console.info(`Loading addon '${addonDescr.path}': [OKAY]`);

                            if(--n === 0) {
                                resolve();
                            }

                        }).catch((e) => {

                            console.error(`Loading addon '${addonDescr.path}': [ERROR]\n${e}`);

                            if(--n === 0) {
                                resolve();
                            }
                        });
                    }
                    catch(e)
                    {
                        console.error(`Loading addon '${addonDescr.path}': [ERROR]\n${e}`);

                        if(--n === 0) {
                            resolve();
                        }
                    }
                }

                /*----------------------------------------------------------------------------------------------------*/
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        startStopAddons(addonDescrs)
        {
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

                for(const addonDescr of Object.values(addonDescrs))
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
                        this.addon.load(addonDescr.path).then(([addon, name, _]) => {

                            addonDescr.started = addonDescr.enabled;

                            this._startStop(addon, name, addonDescr.started);

                            if(--n === 0) {
                                cleanup();
                            }

                        }).catch((e) => {

                            console.error(`${addonDescr.enabled ? 'Stopping' : 'Starting'} addon '${addonDescr.path}': [ERROR]\n${e}`);

                            if(--n === 0) {
                                cleanup();
                            }
                        });
                    }
                    catch(e)
                    {
                        console.error(`${addonDescr.enabled ? 'Stopping' : 'Starting'} addon '${addonDescr.path}': [ERROR]\n${e}`);

                        if(--n === 0) {
                            cleanup();
                        }
                    }
                }

                /*----------------------------------------------------------------------------------------------------*/
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _loadConfig(json)
        {
            this.locker.lock();

            try
            {
                /*----------------------------------------------------------------------------------------------------*/

                const globals = JSON.parse(json || '{}');

                /*----------------------------------------------------------------------------------------------------*/

                this.initAddons(globals.addons).then(() => {

                    this.globals = confDup(globals, DEFAULT_GLOBALS);
/*
                    if(typeof window['__TAURI__'] !== 'undefined')
                    {
                        const url = 'https://addons.nyxlib.org/'
                        invoke('add_remote_url', { url }).then(() => {
                            console.log('URL ajoutée avec succès:', url);
                        }).catch((error) => {
                            console.error('Erreur lors de l\'ajout de l\'URL:', error);
                        });
                    }
*/
                    this.startStopAddons(this.globals.addons).then(() => {

                        this.dialog.success();

                        this.locker.unlock();
                    });
                });

                /*----------------------------------------------------------------------------------------------------*/
            }
            catch(e)
            {
                this.dialog.error(e);

                this.locker.unlock();
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _saveConfig(indent)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            this.locker.lock();

            this.startStopAddons(this.globals.addons).then(() => {

                this.dialog.success();

                this.locker.unlock();
            });

            /*--------------------------------------------------------------------------------------------------------*/

            this.globals = confDup(this.globals, DEFAULT_GLOBALS);

            return indent ? JSON.stringify(this.globals, null, 2)
                          : JSON.stringify(this.globals, null, 0)
            ;

            /*--------------------------------------------------------------------------------------------------------*/
        },

        /*------------------------------------------------------------------------------------------------------------*/

        import()
        {
            this.dialog.open('config.json', 'application/json;charset=utf-8', 'JSON Files', ['json']).then((json) => this._loadConfig(json)).catch(this.dialog.error);
        },

        /*------------------------------------------------------------------------------------------------------------*/

        load()
        {
            this._loadConfig(localStorage.getItem('indi-dashboard-config'));
        },

        /*------------------------------------------------------------------------------------------------------------*/

        export()
        {
            this.dialog.save('config.json', 'application/json;charset=utf-8', 'JSON Files', ['json'], this._saveConfig(true)).catch(this.dialog.error);
        },

        /*------------------------------------------------------------------------------------------------------------*/

        save()
        {
            localStorage.setItem('indi-dashboard-config', this._saveConfig(false));
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useConfigStore;

/*--------------------------------------------------------------------------------------------------------------------*/
