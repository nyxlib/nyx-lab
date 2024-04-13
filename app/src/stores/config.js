// noinspection JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import { defineStore } from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTION                                                                                                           */
/*--------------------------------------------------------------------------------------------------------------------*/

const copyDict = (dst, src) => {

    if(typeof dst === 'object'
       &&
       typeof src === 'object'
    ) {
        Object.keys(dst).forEach((key) => delete dst[key]);

        Object.assign(dst, src);
    }

    return dst;
}

/*--------------------------------------------------------------------------------------------------------------------*/
/* STORE                                                                                                              */
/*--------------------------------------------------------------------------------------------------------------------*/

const useConfigStore = defineStore('config', {
    state: () => {
        return {
            globals: {
                lat: 48.8533,
                lon: 2.34886,
                alt: 0.00000,
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
                enableSkyMap: false,
                enableSkyAtlas: false,
                enableAstroSetup: false,
            },
        };
    },
    actions: {

        /*------------------------------------------------------------------------------------------------------------*/
        /* CONFIG                                                                                                     */
        /*------------------------------------------------------------------------------------------------------------*/

        load()
        {
            try
            {
                const config = JSON.parse(localStorage.getItem('indi-dashboard-config'));

                copyDict(this.globals, config);
            }
            catch(e)
            {
                /* IGNORE */
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/

        save()
        {
            localStorage.setItem('indi-dashboard-config', JSON.stringify(this.globals));
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useConfigStore;

/*--------------------------------------------------------------------------------------------------------------------*/
