<!--suppress VueUnrecognizedDirective -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { watch, onMounted } from 'vue';

import {IndiDevices, IndiVariables, NavTabs, TabPane} from 'vue-indi';

import * as L from 'leaflet';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const TILES_URL = 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png';

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

let map = null;

const mapSetup = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    map = L.map('BC002C3F', {zoomControl: false, doubleClickZoom: false, scrollWheelZoom: false}).setView([configStore.globals.lat, configStore.globals.lon], configStore.globals.zoom);

    /*----------------------------------------------------------------------------------------------------------------*/

    map.on('dblclick', (e) => {

        configStore.globals.lat = Number(e.latlng.lat.toFixed(4));
        configStore.globals.lon = Number(e.latlng.lng.toFixed(4));

        map.setView([configStore.globals.lat, configStore.globals.lon], configStore.globals.zoom);
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    L.tileLayer(TILES_URL, {attribution: '', minZoom: 1, maxZoom: 20}).addTo(map);

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const getLocation = () => {

    if(typeof navigator.geolocation === 'object')
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const success = (position) => {

            configStore.globals.lat = Number(position.coords.latitude.toFixed(4));
            configStore.globals.lon = Number(position.coords.longitude.toFixed(4));
        };

        /*------------------------------------------------------------------------------------------------------------*/

        const error = (message) => {

            alert(message);
        };

        /*------------------------------------------------------------------------------------------------------------*/

        navigator.geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 5000,
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(async () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    watch(() => [
        configStore.globals.lat ,
        configStore.globals.lon ,
        configStore.globals.zoom,
    ], () => {

        map.setView([configStore.globals.lat, configStore.globals.lon], configStore.globals.zoom);
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    mapSetup();

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <form class="h-100 w-100 p-3" @submit.prevent="configStore.save">

        <!--*********************************************************************************************************-->

        <nav-tabs margin="mb-3">

            <!-- *************************************************************************************************** -->
            <!-- OBSERVATORY                                                                                         -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Observatory">


                <div class="row">
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="card mb-3">
                            <div class="card-header d-flex">
                                Observatory
                                <button class="btn btn-xs btn-primary ms-auto" type="button" @click="getLocation" v-if="!configStore.globals.latVariable && !configStore.globals.lonVariable">
                                    Get current location
                                </button>
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="F779821A">Latitude [°]</label>
                                            <div class="input-group input-group-sm">
                                                <input class="form-control form-control-sm" type="number" step="0.0001" id="F779821A" v-model="configStore.globals.lat" :disabled="!!configStore.globals.latVariable" />
                                                <span class="input-group-text px-1"><i class="bi bi-arrow-left-short"></i></span>
                                                <input class="form-control form-control-sm" type="text" placeholder="INDI variable" v-no-autocomplete v-model="configStore.globals.latVariable" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="B120D62A">Longitude [°]</label>
                                            <div class="input-group input-group-sm">
                                                <input class="form-control form-control-sm" type="number" step="0.0001" id="B120D62A" v-model="configStore.globals.lon" :disabled="!!configStore.globals.lonVariable" />
                                                <span class="input-group-text px-1"><i class="bi bi-arrow-left-short"></i></span>
                                                <input class="form-control form-control-sm" type="text" placeholder="INDI variable" v-no-autocomplete v-model="configStore.globals.lonVariable" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="F951B22F">Elevation [m]</label>
                                            <div class="input-group input-group-sm">
                                                <input class="form-control form-control-sm" type="number" step="0.100000" id="F951B22F" v-model="configStore.globals.alt" :disabled="!!configStore.globals.altVariable" />
                                                <span class="input-group-text px-1"><i class="bi bi-arrow-left-short"></i></span>
                                                <input class="form-control form-control-sm" type="text" placeholder="INDI variable" v-no-autocomplete v-model="configStore.globals.altVariable" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="B816D6F2">Card zoom [{{configStore.globals.zoom}}]</label>
                                            <input class="form-control form-control-sm" type="range" min="1" max="20" step="1" id="B816D6F2" :value="configStore.globals.zoom" @change="configStore.globals.zoom = $event.target.value" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="card mb-3">
                            <div class="card-header">
                                Sky quality
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-6">

                                        <div class="mb-3">
                                            <label class="form-label" for="C198A370">Temperature [°C]</label>
                                            <div class="input-group input-group-sm">
                                                <input class="form-control form-control-sm" type="number" min="-100" max="+100" step="0.1" id="C198A370" v-model="configStore.globals.temperature" :disabled="!!configStore.globals.temperatureVariable" />
                                                <span class="input-group-text px-1"><i class="bi bi-arrow-left-short"></i></span>
                                                <input class="form-control form-control-sm" type="text" placeholder="INDI variable" v-no-autocomplete v-model="configStore.globals.temperatureVariable" />
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label" for="B10348DA">Wind speed [m/s]</label>
                                            <div class="input-group input-group-sm">
                                                <input class="form-control form-control-sm" type="number" min="0" max="200" step="0.1" id="B10348DA" v-model="configStore.globals.wind" :disabled="!!configStore.globals.windVariable" />
                                                <span class="input-group-text px-1"><i class="bi bi-arrow-left-short"></i></span>
                                                <input class="form-control form-control-sm" type="text" placeholder="INDI variable" v-no-autocomplete v-model="configStore.globals.windVariable" />
                                            </div>
                                        </div>

                                    </div>
                                    <div class="col-md-6">

                                        <div class="mb-3">
                                            <label class="form-label" for="D5904A85">Humidity [%]</label>
                                            <div class="input-group input-group-sm">
                                                <input class="form-control form-control-sm" type="number" min="0" max="100" step="0.1" id="D5904A85" v-model="configStore.globals.humidity" :disabled="!!configStore.globals.humidityVariable" />
                                                <span class="input-group-text px-1"><i class="bi bi-arrow-left-short"></i></span>
                                                <input class="form-control form-control-sm" type="text" placeholder="INDI variable" v-no-autocomplete v-model="configStore.globals.humidityVariable" />
                                            </div>
                                        </div>

                                        <div class="mb-0">
                                            <label class="form-label" for="F6CEC4D4">Seeing [arcsec]</label>
                                            <div class="input-group input-group-sm">
                                                <input class="form-control form-control-sm" type="number" min="0" max="5" step="0.1" id="F6CEC4D4" v-model="configStore.globals.seeing" :disabled="!!configStore.globals.seeingVariable" />
                                                <span class="input-group-text px-1"><i class="bi bi-arrow-left-short"></i></span>
                                                <input class="form-control form-control-sm" type="text" placeholder="INDI variable" v-no-autocomplete v-model="configStore.globals.seeingVariable" />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                    <div class="col-md-6">

                        <div class="rounded" id="BC002C3F" style="height: 450px; width: 100%;"></div>

                    </div>
                </div>

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- INDI                                                                                                -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="INDI">

                <div class="row">
                    <div class="col-md-6">

                        <indi-devices />

                    </div>
                    <div class="col-md-6">

                        <indi-variables />

                    </div>
                </div>

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- BUTTONS                                                                                            -->
            <!-- *************************************************************************************************** -->

            <template v-slot:button>

                <button class="btn btn-sm btn-outline-primary me-2" type="button" @click="configStore.import">
                    <i class="bi bi-upload"></i> Import
                </button>

                <button class="btn btn-sm btn-outline-primary me-2" type="button" @click="configStore.export">
                    <i class="bi bi-download"></i> Export
                </button>

                <button class="btn btn-sm btn-outline-warning me-2" type="button" @click="configStore.load">
                    <i class="bi bi-x-lg"></i> Reload
                </button>

                <button class="btn btn-sm btn-success me-0" type="submit">
                    <i class="bi bi-check-lg"></i> Save
                </button>

            </template>

            <!-- *************************************************************************************************** -->

        </nav-tabs>

        <!--*********************************************************************************************************-->

    </form>

    <!-- *********************************************************************************************************** -->

</template>
