<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { ref, onMounted } from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import StelWebEngine from '../stellarium-web-engine';

import useConfigStore from "../stores/config";

/*--------------------------------------------------------------------------------------------------------------------*/

import StelWebWASM from '../assets/stellarium-web-engine.wasm?url';

import regularFont from '../assets/Roboto-Regular.ttf';
import boldFont from '../assets/Roboto-Bold.ttf';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

const canvas = ref(null);

let stel = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(async () => {

    StelWebEngine({
        wasmFile: StelWebWASM,
        canvas: canvas.value,
        translateFn: (domain, str) => {

            return str;
        },
        onReady: (_stel) => {

            stel = _stel;

            const baseUrl = './resources';

            try
            {
                /*----------------------------------------------------------------------------------------------------*/

                stel.core.dsos.addDataSource({ url: `${baseUrl}/dso` });

                stel.core.stars.addDataSource({ url: `${baseUrl}/stars` });

                stel.core.milkyway.addDataSource({ url: `${baseUrl}/surveys/milkyway` });

                stel.core.landscapes.addDataSource({ url: `${baseUrl}/landscapes/guereins`, key: 'guereins' });

                stel.core.skycultures.addDataSource({ url: `${baseUrl}/skycultures/western`, key: 'western' });

                /*----------------------------------------------------------------------------------------------------*/

                stel.core.landscapes.visible = true;
                stel.core.atmosphere.visible = false;

                stel.core.dsos.visible = true;
                stel.core.milkyway.visible = false;

                stel.core.constellations.lines_visible = true;
                stel.core.constellations.labels_visible = true;
                stel.core.constellations.images_visible = false;
                stel.core.constellations.show_only_pointed = false;

                /*----------------------------------------------------------------------------------------------------*/

                stel.setFont('regular', regularFont, 1.38);
                stel.setFont('bold', boldFont, 1.38);

                /*----------------------------------------------------------------------------------------------------*/

                stel.core.observer.longitude = configStore.globals.lon * Math.PI / 180.0;
                stel.core.observer.latitude = configStore.globals.lat * Math.PI / 180.0;
                stel.core.observer.elevation = configStore.globals.alt;

                /*----------------------------------------------------------------------------------------------------*/
            }
            catch(e)
            {
                console.log(e);
            }
        },
        methods: {


        },
    });
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <canvas class="h-100 w-100" ref="canvas"></canvas>

</template>

<style scoped>
/*--------------------------------------------------------------------------------------------------------------------*/

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
