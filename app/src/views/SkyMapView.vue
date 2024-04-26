<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {reactive, onMounted} from 'vue';

import {Offcanvas} from 'bootstrap';

import 'bootstrap/js/src/offcanvas';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

import SkyMap from '../components/SkyMap.vue';
import AladinMap from '../components/AladinMap.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    frameType: 'j2000',
    showMilkyWay: false,
    showAtmosphere: false,
    showConstellations: true,
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    new Offcanvas(document.getElementById('CD57B0D9'));
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!--                                                                                                             -->
    <!-- *********************************************************************************************************** -->

    <aladin-map class="h-100 w-100" :fov="2.8" :projection="'SIN'" :showLayersControl="true" :showCooGrid="state.frameType !== 'off'" :cooFrame="state.frameType" v-if="configStore.globals.skymap === 'aladin'" />

    <!-- *********************************************************************************************************** -->

    <sky-map :frame="state.frameType"  :show-milkyway="state.showMilkyWay"  :show-atmosphere="state.showAtmosphere" :show-constellations="state.showConstellations" v-if="configStore.globals.skymap === 'stellarium'" />

    <!-- *********************************************************************************************************** -->

    <div class="position-absolute" style="right: 1rem; bottom: 1rem;">

        <button class="btn btn-dark opacity-75" type="button" data-bs-toggle="offcanvas" data-bs-target="#CD57B0D9">
            <i class="bi bi-three-dots"></i>
        </button>

    </div>

    <!-- *********************************************************************************************************** -->
    <!--                                                                                                             -->
    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="offcanvas offcanvas-end" data-bs-backdrop="static" tabindex="-1" id="CD57B0D9">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title">Sky map</h5>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
            </div>
            <div class="offcanvas-body">

                <!-- *********************************************************************************************** -->

                <div class="mb-3">
                    <label class="form-label" for="E005392A">Object name, coordinates</label>
                    <input class="form-control form-control-sm" type="text" id="E005392A" placeholder="Object, coordinates" v-no-autocomplete />
                </div>

                <!-- *********************************************************************************************** -->

                <br /><br />

                <!-- *********************************************************************************************** -->

                <div class="mb-3">
                    <label class="form-label">Frame</label>
                    <div class="btn-group btn-group-sm w-100" role="group">
                        <input class="btn-check" type="radio" name="B1F6FEA6" value="off" id="E8449C32" v-model="state.frameType" xxxxxxx="xxxxxxx" />
                        <label class="btn btn-outline-primary" for="E8449C32">Off</label>

                        <input class="btn-check" type="radio" name="B1F6FEA6" value="j2000" id="A4D9F5DC" v-model="state.frameType" checked="checked" />
                        <label class="btn btn-outline-primary" for="A4D9F5DC">J2000</label>

                        <input class="btn-check" type="radio" name="B1F6FEA6" value="galactic" id="F2E74046" v-model="state.frameType" xxxxxxx="xxxxxxx" />
                        <label class="btn btn-outline-primary" for="F2E74046">Galactic</label>
                    </div>
                </div>

                <!-- *********************************************************************************************** -->

                <hr />

                <!-- *********************************************************************************************** -->

                <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" role="switch" id="D603EB7C" v-model="state.showMilkyWay" :true-value="true" :false-value="false" :disabled="configStore.globals.skymap === 'aladin'">
                    <label class="form-check-label" for="D603EB7C">Show Milky Way</label>
                </div>

                <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" role="switch" id="F8890F0C" v-model="state.showAtmosphere" :true-value="true" :false-value="false" :disabled="configStore.globals.skymap === 'aladin'">
                    <label class="form-check-label" for="F8890F0C">Show atmosphere</label>
                </div>

                <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" role="switch" id="D4841581" v-model="state.showConstellations" :true-value="true" :false-value="false" :disabled="configStore.globals.skymap === 'aladin'">
                    <label class="form-check-label" for="D4841581">Show constellations</label>
                </div>

                <!-- *********************************************************************************************** -->

                <hr />

                <!-- *********************************************************************************************** -->

            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>

<style>
/*--------------------------------------------------------------------------------------------------------------------*/

.aladin-btn {

    border: none;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.aladin-stack-control {

    top: 0.2rem;
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
