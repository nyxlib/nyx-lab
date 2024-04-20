// noinspection JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import { defineStore } from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const DEFAULT_GLOBALS = {
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
    grafanaURL: '',
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
}

/*--------------------------------------------------------------------------------------------------------------------*/
/* STORE                                                                                                              */
/*--------------------------------------------------------------------------------------------------------------------*/

const useConfigStore = defineStore('config', {
    state: () => {
        return {
            globals: Object.assign({}, DEFAULT_GLOBALS),
        };
    },
    actions: {

        /*------------------------------------------------------------------------------------------------------------*/
        /* CONFIG                                                                                                     */
        /*------------------------------------------------------------------------------------------------------------*/

        import()
        {
            alert('import TODO');
        },

        /*------------------------------------------------------------------------------------------------------------*/

        export()
        {
            alert('export TODO');
        },

        /*------------------------------------------------------------------------------------------------------------*/

        load()
        {
            try
            {
                const config = JSON.parse(localStorage.getItem('indi-dashboard-config'));

                this.globals = confDup(config, DEFAULT_GLOBALS);
            }
            catch(e)
            {
                /* IGNORE */
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        save()
        {
            try
            {
                const config = confDup(this.globals, DEFAULT_GLOBALS);

                localStorage.setItem('indi-dashboard-config', JSON.stringify(config));
            }
            catch(e)
            {
                /* IGNORE */
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useConfigStore;

/*--------------------------------------------------------------------------------------------------------------------*/
