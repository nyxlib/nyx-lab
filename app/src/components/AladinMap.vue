<!--suppress CssUnusedSymbol, CssNoGenericFontName -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watch, onMounted} from 'vue';

import * as uuid from 'uuid';

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
    showFrame: {
        type: Boolean,
        default: false,
    },
    showCatalog: {
        type: Boolean,
        default: false,
    },
    showCooGrid: {
        type: Boolean,
        default: false,
    },
    showReticle: {
        type: Boolean,
        default: false,
    },
    showStatusBar: {
        type: Boolean,
        default: false,
    },
    showContextMenu: {
        type: Boolean,
        default: false,
    },
    showGotoControl: {
        type: Boolean,
        default: false,
    },
    showCooLocation: {
        type: Boolean,
        default: false,
    },
    showZoomControl: {
        type: Boolean,
        default: false,
    },
    showShareControl: {
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
    showSettingsControl: {
        type: Boolean,
        default: false,
    },
    showFullscreenControl: {
        type: Boolean,
        default: false,
    },
    showProjectionControl: {
        type: Boolean,
        default: false,
    },
    showSimbadPointerControl: {
        type: Boolean,
        default: false,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const mapEl = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/

let map = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(async () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    watch(() => props.showCooGrid, (value) => {

        if(value) {
            map.showCooGrid();
        }
        else {
            map.hideCooGrid();
        }
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    watch(() => props.cooFrame, (value) => {

        map.setFrame(value);
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    if(mapEl.value.clientHeight === 0)
    {
        mapEl.value.style.height = `${3.0 * mapEl.value.clientWidth / 4.0}px`;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    A.init.then(() => {

        map = A.aladin(`#${mapEl.value.id}`, {
            fov: props.fov,
            target: props.target,
            cooFrame: props.cooFrame,
            projection: props.projection,
            /**/
            showFrame: props.showFrame,
            showCatalog: props.showCatalog,
            showCooGrid: props.showCooGrid,
            showReticle: props.showReticle,
            showStatusBar: props.showStatusBar,
            showContextMenu: props.showContextMenu,
            showGotoControl: props.showGotoControl,
            showCooLocation: props.showCooLocation,
            showZoomControl: props.showZoomControl,
            showShareControl: props.showShareControl,
            showLayersControl: props.showLayersControl,
            showCooGridControl: props.showCooGridControl,
            showSettingsControl: props.showSettingsControl,
            showFullscreenControl: props.showFullscreenControl,
            showProjectionControl: props.showProjectionControl,
            showSimbadPointerControl: props.showSimbadPointerControl,
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

    <!-- *********************************************************************************************************** -->

    <div class="border-0" :id="`A${uuid.v4().substring(0, 8)}`" ref="mapEl"></div>

    <!-- *********************************************************************************************************** -->

</template>

<style>
/*--------------------------------------------------------------------------------------------------------------------*/

.aladin-tooltip {

    display: none;
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
