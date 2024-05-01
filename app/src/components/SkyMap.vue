<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watch, onMounted} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

import PolluxSkyMap from '../pollux-skymap';

/*--------------------------------------------------------------------------------------------------------------------*/

import PolluxSkyMapWASM from '../assets/pollux-skymap.wasm?url';

import regularFont from '../assets/Roboto-Regular.ttf';
import boldFont from '../assets/Roboto-Bold.ttf';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    fov: {
        type: Number,
        default: 360,
    },
    target: {
        type: String,
        default: 'M45',
    },
    frame: {
        type: String,
        default: 'j2000',
        validator: (value) => {
            return ['off', 'j2000', 'j2000d', 'galactic'].includes(value)
        }
    },
    showMilkyway: {
        type: Boolean,
        default: false,
    },
    showAtmosphere: {
        type: Boolean,
        default: false,
    },
    showConstellations: {
        type: Boolean,
        default: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const canvasEl = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/

let skymap = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const select = () => {

    if(skymap.core.selection)
    {

    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    /*----------------------------------------------------------------------------------------------------------------*/

    watch(() => props.target, (value) => {

        alert(JSON.stringify(skymap.getObj(value)));
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    watch(() => props.frame, (value) => {

        /**/ if(value === 'j2000')
        {
            skymap.core.lines.j2000.visible = true;
            skymap.core.lines.j2000d.visible = false;
            skymap.core.lines.galactic.visible = false;
        }
        else if(value === 'j2000d')
        {
            skymap.core.lines.j2000.visible = false;
            skymap.core.lines.j2000d.visible = true;
            skymap.core.lines.galactic.visible = false;
        }
        else if(value === 'galactic')
        {
            skymap.core.lines.j2000.visible = false;
            skymap.core.lines.j2000d.visible = false;
            skymap.core.lines.galactic.visible = true;
        }
        else
        {
            skymap.core.lines.j2000.visible = false;
            skymap.core.lines.j2000d.visible = false;
            skymap.core.lines.galactic.visible = false;
        }
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    watch(() => props.showMilkyway, (value) => {

        skymap.core.milkyway.visible = value;
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    watch(() => props.showAtmosphere, (value) => {

        skymap.core.atmosphere.visible = value
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    watch(() => props.showConstellations, (value) => {

        skymap.core.constellations.lines_visible = value;
        skymap.core.constellations.labels_visible = value;
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    try
    {
        PolluxSkyMap({
            wasmFile: PolluxSkyMapWASM,
            canvas: canvasEl.value,
            translateFn: (domain, str) => {

                return str;
            },
            onReady: (x) => {

                skymap = x;

                const baseUrl = './resources';

                /*----------------------------------------------------------------------------------------------------*/

                skymap.setFont('regular', regularFont, 1.38);
                skymap.setFont('bold', boldFont, 1.38);

                /*----------------------------------------------------------------------------------------------------*/

                skymap.core.dsos.addDataSource({url: `${baseUrl}/dso`});
                skymap.core.stars.addDataSource({url: `${baseUrl}/stars`});

                skymap.core.milkyway.addDataSource({url: `${baseUrl}/surveys/milkyway`});

                skymap.core.planets.addDataSource({url: `${baseUrl}/surveys/sso/sun`, key: 'sun'});
                skymap.core.planets.addDataSource({url: `${baseUrl}/surveys/sso/moon`, key: 'moon'});

                skymap.core.landscapes.addDataSource({url: `${baseUrl}/landscapes/zero`, key: 'zero'});

                skymap.core.skycultures.addDataSource({url: `${baseUrl}/skycultures/western`, key: 'western'});

                /*----------------------------------------------------------------------------------------------------*/

                skymap.core.landscapes.visible = true;
                skymap.core.atmosphere.visible = false;

                skymap.core.dss.visible = true;
                skymap.core.dsos.visible = true;
                skymap.core.milkyway.visible = false;

                skymap.core.lines.j2000.visible = true;
                skymap.core.lines.j2000d.visible = false;
                skymap.core.lines.galactic.visible = false;

                skymap.core.constellations.lines_visible = true;
                skymap.core.constellations.labels_visible = true;
                skymap.core.constellations.images_visible = false;
                skymap.core.constellations.show_only_pointed = false;

                /*----------------------------------------------------------------------------------------------------*/

                skymap.core.observer.longitude = configStore.globals.lon * Math.PI / 180.0;
                skymap.core.observer.latitude = configStore.globals.lat * Math.PI / 180.0;
                skymap.core.observer.elevation = configStore.globals.alt;

                skymap.core.time_speed = 1;

                /*----------------------------------------------------------------------------------------------------*/
            },

        }).catch(() => {

            /* IGNORE */
        });
    }
    catch(e)
    {
        /* IGNORE */
    }

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <canvas class="h-100 w-100" ref="canvasEl" @click="select"></canvas>

    <!-- *********************************************************************************************************** -->

</template>
