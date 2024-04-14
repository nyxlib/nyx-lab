<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { ref, onMounted } from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import PolluxSkyMap from '../pollux-skymap';

import useConfigStore from '../stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/

import PolluxSkyMapWASM from '../assets/pollux-skymap.wasm?url';

import regularFont from '../assets/Roboto-Regular.ttf';
import boldFont from '../assets/Roboto-Bold.ttf';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

const canvas = ref(null);

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

onMounted(async () => {

    await PolluxSkyMap({
        wasmFile: PolluxSkyMapWASM,
        canvas: canvas.value,
        translateFn: (domain, str) => {

            return str;
        },
        onReady: (x) => {

            skymap = x;

            const baseUrl = './resources';

            try {   /*----------------------------------------------------------------------------------------------------*/

                skymap.setFont('regular', regularFont, 1.38);
                skymap.setFont('bold', boldFont, 1.38);

                /*----------------------------------------------------------------------------------------------------*/

                skymap.core.dsos.addDataSource({url: `${baseUrl}/dso`});
                skymap.core.stars.addDataSource({url: `${baseUrl}/stars`});

                skymap.core.milkyway.addDataSource({url: `${baseUrl}/surveys/milkyway`});

                skymap.core.planets.addDataSource({url: `${baseUrl}/surveys/sso/sun`, key: 'sun'});
                skymap.core.planets.addDataSource({url: `${baseUrl}/surveys/sso/moon`, key: 'moon'});

                skymap.core.landscapes.addDataSource({url: `${baseUrl}/landscapes/guereins`, key: 'guereins'});

                skymap.core.skycultures.addDataSource({url: `${baseUrl}/skycultures/western`, key: 'western'});

                /*----------------------------------------------------------------------------------------------------*/

                skymap.core.landscapes.visible = true;
                skymap.core.atmosphere.visible = false;

                skymap.core.dss.visible = true;
                skymap.core.dsos.visible = true;
                skymap.core.milkyway.visible = false;

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
            }
            catch (e)
            {
                console.log(e);
            }
        },
    });
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <canvas class="h-100 w-100" ref="canvas" @click="select"></canvas>

</template>

<style scoped>
/*--------------------------------------------------------------------------------------------------------------------*/

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
