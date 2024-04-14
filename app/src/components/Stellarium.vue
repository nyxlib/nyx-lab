<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { ref, onMounted } from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import PolluxSkyMap from '../pollux-skymap';

import useConfigStore from "../stores/config";

/*--------------------------------------------------------------------------------------------------------------------*/

import PolluxSkyMapWASM from '../assets/pollux-skymap.wasm?url';

import regularFont from '../assets/Roboto-Regular.ttf';
import boldFont from '../assets/Roboto-Bold.ttf';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

const canvas = ref(null);

let stel = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const select = () => {

    if(stel.core.selection)
    {

    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(async () => {

    PolluxSkyMap({
        wasmFile: PolluxSkyMapWASM,
        canvas: canvas.value,
        translateFn: (domain, str) => {

            return str;
        },
        onReady: (x) => {

            stel = x;

            const baseUrl = './resources';

            try
            {   /*----------------------------------------------------------------------------------------------------*/

                stel.setFont('regular', regularFont, 1.38);
                stel.setFont('bold', boldFont, 1.38);

                /*----------------------------------------------------------------------------------------------------*/

                stel.core.dsos.addDataSource({ url: `${baseUrl}/dso` });
                stel.core.stars.addDataSource({ url: `${baseUrl}/stars` });

                stel.core.milkyway.addDataSource({ url: `${baseUrl}/surveys/milkyway` });

                stel.core.planets.addDataSource({ url: `${baseUrl}/surveys/sso/sun`, key: 'sun' });
                stel.core.planets.addDataSource({ url: `${baseUrl}/surveys/sso/moon`, key: 'moon' });

                stel.core.landscapes.addDataSource({ url: `${baseUrl}/landscapes/guereins`, key: 'guereins' });

                stel.core.skycultures.addDataSource({ url: `${baseUrl}/skycultures/western`, key: 'western' });

                /*----------------------------------------------------------------------------------------------------*/

                stel.core.landscapes.visible = true;
                stel.core.atmosphere.visible = false;

                stel.core.dss.visible = true;
                stel.core.dsos.visible = true;
                stel.core.milkyway.visible = false;

                stel.core.constellations.lines_visible = true;
                stel.core.constellations.labels_visible = true;
                stel.core.constellations.images_visible = false;
                stel.core.constellations.show_only_pointed = false;

                /*----------------------------------------------------------------------------------------------------*/

                stel.core.observer.longitude = configStore.globals.lon * Math.PI / 180.0;
                stel.core.observer.latitude = configStore.globals.lat * Math.PI / 180.0;
                stel.core.observer.elevation = configStore.globals.alt;

                stel.core.time_speed = 1;

                /*----------------------------------------------------------------------------------------------------*/
            }
            catch(e)
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
