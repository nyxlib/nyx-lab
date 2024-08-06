// noinspection JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject} from 'vue';

import {defineStore} from 'pinia';

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
    state: () => {
        return {
            globals: Object.assign({}, DEFAULT_GLOBALS),
            confPanels: {},
            appPanels: {},
        };
    },
    actions: {

        /*------------------------------------------------------------------------------------------------------------*/
        /* CONFIG                                                                                                     */
        /*------------------------------------------------------------------------------------------------------------*/

        init()
        {
            this.globals.addons = JSON.parse(localStorage.getItem('indi-dashboard-config') || '{}').addons || {};

            this.dialog = inject('dialog');
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

                console.error(`Loading addon '${name}': [OKAY]`);

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

        initAddons()
        {
            return new Promise((resolve) => {

                let n = 0;

                for(const addonDescr of Object.values(this.globals.addons))
                {
                    n++;

                    try
                    {
                        this.addon.load(addonDescr.path, addonDescr.name).then(([addon, do_init]) => {

                            this._init(addon, addonDescr.name, do_init);

                            if(--n === 0) {
                                resolve();
                            }

                        }).catch((e) => {

                            console.error(`Loading addon '${addonDescr.name}': [ERROR]\n${e}`);

                            if(--n === 0) {
                                resolve();
                            }
                        });
                    }
                    catch(e)
                    {
                        console.error(`Loading addon '${addonDescr.name}': [ERROR]\n${e}`);

                        if(--n === 0) {
                            resolve();
                        }
                    }
                }
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        startStopAddons()
        {
            return new Promise((resolve) => {

                let n = 0;

                for(const addonDescr of Object.values(this.globals.addons))
                {
                    addonDescr.started = false;

                    n++;

                    try
                    {
                        this.addon.load(addonDescr.path).then(([addon, _]) => {

                            addonDescr.started = addonDescr.enabled;

                            this._startStop(addon, addonDescr.name, addonDescr.enabled);

                            if(--n === 0) {
                                resolve();
                            }

                        }).catch((e) => {

                            console.error(`${addonDescr.enabled ? 'Stopping' : 'Starting'} addon '${addonDescr.name}': [ERROR]\n${e}`);

                            if(--n === 0) {
                                resolve();
                            }
                        });
                    }
                    catch(e)
                    {
                        console.error(`${addonDescr.enabled ? 'Stopping' : 'Starting'} addon '${addonDescr.name}': [ERROR]\n${e}`);

                        if(--n === 0) {
                            resolve();
                        }
                    }
                }
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        import()
        {
            try
            {
                this.initAddons().finally(() => {

                    this.dialog.open('config.json', 'application/json;charset=utf-8', 'JSON Files', ['json']).catch(this.dialog.error).then((json) => {

                        this.globals = confDup(JSON.parse(json.toString()), DEFAULT_GLOBALS);

                        this.startStopAddons().then(() => {

                            this.dialog.success();
                        });
                    });
                });
            }
            catch(e)
            {
                this.dialog.error(e);
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        export()
        {
            try
            {
                const config = confDup(this.globals, DEFAULT_GLOBALS);

                this.dialog.save(JSON.stringify(config, null, 2), 'config.json', 'application/json;charset=utf-8', 'JSON Files', ['json']).catch(this.dialog.error).then(() => {

                    this.startStopAddons().then(() => {

                        this.dialog.success();
                    });
                });
            }
            catch(e)
            {
                this.dialog.error(e);
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        load()
        {
            try
            {
                this.initAddons().finally(() => {

                    const config = localStorage.getItem('indi-dashboard-config') || '{}';

                    this.globals = confDup(JSON.parse(config), DEFAULT_GLOBALS);

                    this.startStopAddons().then(() => {

                        this.dialog.success();
                    });
                });
            }
            catch(e)
            {
                this.dialog.error(e);
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        save()
        {
            try
            {
                const config = confDup(this.globals, DEFAULT_GLOBALS);

                localStorage.setItem('indi-dashboard-config', JSON.stringify(config));

                this.startStopAddons().then(() => {

                    this.dialog.success();
                });
            }
            catch(e)
            {
                this.dialog.error(e);
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useConfigStore;

/*--------------------------------------------------------------------------------------------------------------------*/
