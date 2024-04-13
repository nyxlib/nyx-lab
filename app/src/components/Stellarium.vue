<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { ref, onMounted } from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import StelWebWASM from '../assets/stellarium-web-engine.wasm?url';

import StelWebEngine from '../stellarium-web-engine';

import regularFont from '../assets/Roboto-Regular.ttf';
import boldFont from '../assets/Roboto-Bold.ttf';

/*--------------------------------------------------------------------------------------------------------------------*/

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

            try
            {
                stel = _stel;

                const baseUrl = './resources';

                stel.core.dsos.addDataSource({ url: `${baseUrl}/dso` });

                stel.core.stars.addDataSource({ url: `${baseUrl}/stars` });

                stel.core.milkyway.addDataSource({ url: `${baseUrl}/surveys/milkyway` });

                stel.core.landscapes.addDataSource({ url: `${baseUrl}/landscapes/guereins`, key: 'guereins' });

                stel.core.skycultures.addDataSource({ url: `${baseUrl}/skycultures/western`, key: 'western' });

                stel.core.landscapes.visible = false;
                stel.core.atmosphere.visible = false;

                stel.core.dsos.visible = true;
                stel.core.milkyway.visible = false;

                stel.core.constellations.lines_visible = true;
                stel.core.constellations.labels_visible = true;
                stel.core.constellations.images_visible = false;
                stel.core.constellations.show_only_pointed = false;

                stel.setFont('regular', regularFont, 1.38);
                stel.setFont('bold', boldFont, 1.38);
            }
            catch(e)
            {
                console.log(e);
            }
        }
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
