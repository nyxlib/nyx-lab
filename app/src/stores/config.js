// noinspection JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject} from 'vue';

import {defineStore} from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const DEFAULT_GLOBALS = {
    addons: {},
    /**/
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
    enableSkyMap: false,
    enableAstroSetup: false,
    /**/
    devices: {},
    skymap: 'aladin',
};

DEFAULT_GLOBALS.lat = 48.8533;
DEFAULT_GLOBALS.latVariable = '';
DEFAULT_GLOBALS.lon = 2.34886;
DEFAULT_GLOBALS.lonVariable = '';
DEFAULT_GLOBALS.alt = 0.00000;
DEFAULT_GLOBALS.altVariable = '';
DEFAULT_GLOBALS.zoom = 18;

DEFAULT_GLOBALS.temperature = 0.0;
DEFAULT_GLOBALS.temperatureVariable = '';
DEFAULT_GLOBALS.humidity = 0.0;
DEFAULT_GLOBALS.humidityVariable = '';
DEFAULT_GLOBALS.wind = 0.0;
DEFAULT_GLOBALS.windVariable = '';
DEFAULT_GLOBALS.seeing = 0.0;
DEFAULT_GLOBALS.seeingVariable = '';

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const confDup = (src, def) => {

    const result = {};

    if(typeof src === 'object'
       &&
       typeof def === 'object'
    ) {
        Object.keys(def).forEach((key) => { result[key] = (key in src) ? src[key] : def[key]; });
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
            this.dialog = inject('dialog');
            this.addon = inject('addon');

            this.load();
        },

        /*------------------------------------------------------------------------------------------------------------*/
        /* CONFIG                                                                                                     */
        /*------------------------------------------------------------------------------------------------------------*/

        initializeAddons()
        {
            for(const addonDescr of Object.values(this.globals.addons))
            {
                addonDescr.started = false;

                if(addonDescr.enabled)
                {
                    this.addon.load(addonDescr.path, addonDescr.name).then((addon) => {

                        try
                        {
                            addon.globalsInitialize(DEFAULT_GLOBALS);

                            addon.addonInitialize(this.addon.app(), this.addon.router(), this.confPanels, this.appPanels);

                            addonDescr.started = true;
                        }
                        catch(e)
                        {
                            console.error(e);
                        }

                    }).catch((e) => {

                        console.error(e);
                    });
                }
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        finalizeAddons()
        {
            for(const addonDescr of Object.values(this.globals.addons))
            {
                addonDescr.started = false;

                if(addonDescr.enabled)
                {
                    this.addon.load(addonDescr.path, addonDescr.name).then((addon) => {

                        try
                        {
                            addon.globalsInitialize(DEFAULT_GLOBALS);

                            addon.addonFinalize(this.addon.app(), this.addon.router(), this.confPanels, this.appPanels);

                            //////////.started = false;
                        }
                        catch(e)
                        {
                            console.error(e);
                        }

                    }).catch((e) => {

                        console.error(e);
                    });
                }
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        import()
        {
            try
            {
                this.dialog.open('config.json', 'text/plain;charset=utf-8', 'JSON Files', ['json']).catch(this.dialog.error).then((json) => {

                    this.finalizeAddons();
                    this.globals = confDup(JSON.parse(json), DEFAULT_GLOBALS);
                    this.initializeAddons();

                    this.dialog.success();
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

                this.dialog.save(JSON.stringify(config, null, 2), 'config.json', 'text/plain;charset=utf-8', 'JSON Files', ['json']).catch(this.dialog.error).then(() => {

                    this.dialog.success();
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
                const config = localStorage.getItem('indi-dashboard-config');

                this.finalizeAddons();
                this.globals = confDup(JSON.parse(config), DEFAULT_GLOBALS);
                this.initializeAddons();

                this.dialog.success();
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

                this.dialog.success();
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
