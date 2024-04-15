<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import AladinMap from '../components/AladinMap.vue';

import Stellarium from '../components/SkyMap.vue';

import useConfigStore from '../stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <aladin-map class="h-100 w-100" :fov="2.8" :projection="'SIN'" :show-frame="true" :show-coo-grid="true" :show-coo-location="true" :show-projection-control="true" :show-fullscreen-control="true" v-if="configStore.globals.skymap === 'aladin'" />

    <stellarium v-if="configStore.globals.skymap === 'stellarium'" />

</template>
