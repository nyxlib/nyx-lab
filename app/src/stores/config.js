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

                let n = 0;

                for(const addonDescr of Object.values(addonDescrs))
                {
                    addonDescr.started = false;

                    n++;

                    try
                    {
                        this.addon.load(addonDescr.path).then(([addon, name, _]) => {

                            addonDescr.started = addonDescr.enabled;

                            this._startStop(addon, name, addonDescr.enabled);

                            if(--n === 0) {
                                resolve();
                            }

                        }).catch((e) => {

                            console.error(`${addonDescr.enabled ? 'Stopping' : 'Starting'} addon '${addonDescr.path}': [ERROR]\n${e}`);

                            if(--n === 0) {
                                resolve();
                            }
                        });
                    }
                    catch(e)
                    {
                        console.error(`${addonDescr.enabled ? 'Stopping' : 'Starting'} addon '${addonDescr.path}': [ERROR]\n${e}`);

                        if(--n === 0) {
                            resolve();
                        }
                    }
                }

                /*----------------------------------------------------------------------------------------------------*/
            });
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _loadConfig(json)
        {
            try
            {
                /*----------------------------------------------------------------------------------------------------*/

                const globals = JSON.parse(json.toString())

                /*----------------------------------------------------------------------------------------------------*/

                this.initAddons(globals.addons || {}).then(() => {

                    this.globals = confDup(globals, DEFAULT_GLOBALS);

                    this.startStopAddons(globals.addons || {}).then(() => {

                        this.dialog.success();
                    });
                });

                /*----------------------------------------------------------------------------------------------------*/
            }
            catch(e)
            {
                this.dialog.error(e);
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        _saveConfig(indent)
        {
            const globals = confDup(this.globals, DEFAULT_GLOBALS);

            const json = JSON.stringify(globals, null, indent ? 2 : 0);

            this.startStopAddons(globals.addons).then(this.dialog.success);

            return json;
        },

        /*------------------------------------------------------------------------------------------------------------*/

        import()
        {
            this.dialog.open('config.json', 'application/json;charset=utf-8', 'JSON Files', ['json']).then((json) => this._loadConfig(json)).catch(this.dialog.error);
        },

        load()
        {
            this._loadConfig(localStorage.getItem('indi-dashboard-config'));
        },

        /*------------------------------------------------------------------------------------------------------------*/

        export()
        {
            this.dialog.save('config.json', 'application/json;charset=utf-8', 'JSON Files', ['json'], this._saveConfig(true)).catch(this.dialog.error);
        },

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
