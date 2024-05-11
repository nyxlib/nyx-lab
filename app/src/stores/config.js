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
    lat: 48.8533,
    latVariable: '',
    lon: 2.34886,
    lonVariable: '',
    alt: 0.00000,
    altVariable: '',
    zoom: 18,
    /**/
    temperature: 0.0,
    temperatureVariable: '',
    humidity: 0.0,
    humidityVariable: '',
    wind: 0.0,
    windVariable: '',
    seeing: 0.0,
    seeingVariable: '',
    /**/
    weatherWidgetHTML: '',
    weatherWidgetServiceName: '',
    weatherWidgetServiceURL: '',
    seeingWidgetHTML: '',
    seeingWidgetServiceName: '',
    seeingWidgetServiceURL: '',
    /**/
    mqttURL: '',
    mqttUsername: '',
    mqttPassword: '',
    /**/
    nodeRedURL: '',
    /**/
    enableMonitoring: false,
    enableSkyMap: false,
    enableSkyAtlas: false,
    enableAstroSetup: false,
    /**/
    devices: {},
    monitoringGroups: [],
    monitoringMetrics: {},
    refreshInterval: 1000,
    skymap: 'aladin',
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
            subapps: {},
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
                            addon.addonInitialize(this.addon.app(), this.addon.router(), DEFAULT_GLOBALS, this.globals, this.subapps);

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
                            addon.addonFinalize(this.addon.app(), this.addon.router(), DEFAULT_GLOBALS, this.globals, this.subapps);

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
