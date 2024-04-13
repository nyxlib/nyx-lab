<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { watch, onMounted } from 'vue';

import { IndiVariables } from 'vue-indi';

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

const setLocation = () => {

};

/*--------------------------------------------------------------------------------------------------------------------*/

const getConditions = () => {

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

    <form class="h-100 w-100 p-3" @submit.prevent="configStore.save">

        <!--*********************************************************************************************************-->

        <nav class="mb-3">
            <div class="nav nav-tabs" role="tablist">
                <button class="nav-link active" type="button" data-bs-toggle="tab" data-bs-target="#C787FFAE" role="tab">
                    Observatory
                </button>
                <button class="nav-link xxxxxx" type="button" data-bs-toggle="tab" data-bs-target="#ADEE8F0A" role="tab">
                    INDI
                </button>
                <div class="ms-auto">
                    <button class="btn btn-sm btn-danger me-2" type="reset">
                        <i class="bi bi-x-lg"></i> Reset
                    </button>
                    <button class="btn btn-sm btn-success me-0" type="submit">
                        <i class="bi bi-check-lg"></i> Apply
                    </button>
                </div>
            </div>
        </nav>

        <!--*********************************************************************************************************-->

        <div class="tab-content">

            <!-- *************************************************************************************************** -->
            <!-- OBSERVATORY                                                                                         -->
            <!-- *************************************************************************************************** -->

            <div class="tab-pane fade show active" id="C787FFAE" role="tabpanel" tabindex="0">

                <div class="row">
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="card mb-3">
                            <div class="card-header d-flex">
                                Observatory
                                <button class="btn btn-xs btn-primary ms-auto" type="button" @click="setLocation">
                                    Get observatory location
                                </button>
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="F779821A">Latitude [°]</label>
                                            <input class="form-control form-control-sm" type="number" step="0.0001" id="F779821A" placeholder="Latitude" v-model="configStore.globals.lat" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="B120D62A">Longitude [°]</label>
                                            <input class="form-control form-control-sm" type="number" step="0.0001" id="B120D62A" placeholder="Longitude" v-model="configStore.globals.lon" />
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="F951B22F">Height [m]</label>
                                            <input class="form-control form-control-sm" type="number" step="0.100000" id="F951B22F" placeholder="Height" v-model="configStore.globals.height" />
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
                            <div class="card-header d-flex">
                                Sky quality
                                <button class="btn btn-xs btn-primary ms-auto" type="button" @click="getConditions">
                                    Get observatory conditions
                                </button>
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-6">

                                        <div class="mb-3">
                                            <label class="form-label" for="C198A370">Temperature [°C]</label>
                                            <div class="input-group input-group-sm">
                                                <input class="form-control form-control-sm" type="number" min="-100" max="+1°°" step="0.1" id="C198A370" placeholder="Seeing" v-model="configStore.globals.temperature" />
                                                <span class="input-group-text px-1"><i class="bi bi-arrow-left-short"></i></span>
                                                <input class="form-control form-control-sm" type="text" id="A53961FD" placeholder="${INDI variable}" v-no-autocomplete v-model="configStore.globals.temperatureVariable" />
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label" for="B10348DA">Wind [m/s]</label>
                                            <div class="input-group input-group-sm">
                                                <input class="form-control form-control-sm" type="number" min="0" max="200" step="1.0" id="B10348DA" placeholder="Wind" v-model="configStore.globals.wind" />
                                                <span class="input-group-text px-1"><i class="bi bi-arrow-left-short"></i></span>
                                                <input class="form-control form-control-sm" type="text" id="C374E9D7" placeholder="${INDI variable}" v-no-autocomplete v-model="configStore.globals.windVariable" />
                                            </div>
                                        </div>

                                    </div>
                                    <div class="col-md-6">

                                        <div class="mb-3">
                                            <label class="form-label" for="D5904A85">Humidity [%]</label>
                                            <div class="input-group input-group-sm">
                                                <input class="form-control form-control-sm" type="number" min="0" max="100" step="1.0" id="D5904A85" placeholder="Seeing" v-model="configStore.globals.humidity" />
                                                <span class="input-group-text px-1"><i class="bi bi-arrow-left-short"></i></span>
                                                <input class="form-control form-control-sm" type="text" id="A5DCC07C" placeholder="${INDI variable}" v-no-autocomplete v-model="configStore.globals.humidityVariable" />
                                            </div>
                                        </div>

                                        <div class="mb-0">
                                            <label class="form-label" for="F6CEC4D4">Seeing [arcsec]</label>
                                            <div class="input-group input-group-sm">
                                                <input class="form-control form-control-sm" type="number" min="0" max="5" step="0.01" id="F6CEC4D4" placeholder="Seeing" v-model="configStore.globals.seeing" />
                                                <span class="input-group-text px-1"><i class="bi bi-arrow-left-short"></i></span>
                                                <input class="form-control form-control-sm" type="text" id="DD4A705A" placeholder="${INDI variable}" v-no-autocomplete v-model="configStore.globals.seeingVariable" />
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

            </div>

            <!-- *************************************************************************************************** -->
            <!-- VARIABLES                                                                                           -->
            <!-- *************************************************************************************************** -->

            <div class="tab-pane fade xxxx xxxxxx" id="ADEE8F0A" role="tabpanel" tabindex="0">

                <div class="row">
                    <div class="col-md-6">

                        TODO

                    </div>
                    <div class="col-md-6">

                        <indi-variables />

                    </div>
                </div>

            </div>

            <!-- *************************************************************************************************** -->

        </div>

        <!--*********************************************************************************************************-->

    </form>

</template>
