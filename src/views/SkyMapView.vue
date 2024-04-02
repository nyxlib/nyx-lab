<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import AladinMap from '../components/AladinMap.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <aladin-map class="h-100 w-100" :fov="2.8" :projection="'SIN'" :show-coo-grid="true" :show-goto-control="true" :show-layers-control="true" :show-coo-grid-control="true" :show-simbad-pointer-control="true" />

</template>
