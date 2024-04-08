<!--suppress CssUnusedSymbol, CssNoGenericFontName -->

<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { ref, onMounted } from 'vue';

import { v4 as uuid } from 'uuid';

import A from 'aladin-lite';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
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
    cooFrame: {
        type: String,
        default: 'equatorial',
    },
    projection: {
        type: String,
        default: 'MOL',
    },
    /**/
    showCooGrid: {
        type: Boolean,
        default: false,
    },
    showGotoControl: {
        type: Boolean,
        default: false,
    },
    showLayersControl: {
        type: Boolean,
        default: false,
    },
    showCooGridControl: {
        type: Boolean,
        default: false,
    },
    showSimbadPointerControl: {
        type: Boolean,
        default: false,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const map = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(async () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(map.value.clientHeight === 0)
    {
        map.value.style.height = `${3.0 * map.value.clientWidth / 4.0}px`;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    A.init.then(() => {

        A.aladin(`#${map.value.id}`, {
            fov: props.fov,
            target: props.target,
            cooFrame: props.cooFrame,
            projection: props.projection,
            /**/
            showCooGrid: props.showCooGrid,
            /**/
            showGotoControl: props.showGotoControl,
            showLayersControl: props.showLayersControl,
            showCooGridControl: props.showCooGridControl,
            showSimbadPointerControl: props.showSimbadPointerControl,
            /**/
            showFullscreenControl: false,
            /**/
            gridOptions: {
                color: '#FF0000',
                labelSize: 10,
            }
        });
    });

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <div class="border-0" :id="`A${uuid().substring(0, 8)}`" ref="map"></div>

</template>

<style>
/*--------------------------------------------------------------------------------------------------------------------*/

.aladin-cooFrame > select {

    height: 28px !important;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.aladin-input.search {

    padding-top: 2.4px !important;
    padding-bottom: 2.4px !important;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.aladin-cooFrame {

    left: auto !important;
    right: 4.5rem !important;
}

.aladin-location {

    left: 0.2rem !important;
    right: auto !important;
}

.aladin-projection-control {

    left: auto !important;
    right: 0.2rem !important;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.aladin-grid-control {
    top: 7.5rem !important;
}

.aladin-stack-control {
    top: 2.3rem !important;
}

.aladin-simbadPointer-control {
    top: 4.9rem !important;
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
