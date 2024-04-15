<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <form class="h-100 w-100 p-3" @submit.prevent="configStore.save">

        <!--*********************************************************************************************************-->

        <nav class="mb-3">
            <div class="nav nav-tabs" role="tablist">
                <button class="nav-link active" type="button" data-bs-toggle="tab" data-bs-target="#D15B3DA7" role="tab">
                    Services
                </button>
                <button class="nav-link xxxxxx" type="button" data-bs-toggle="tab" data-bs-target="#D1B9D18C" role="tab">
                    Astro
                </button>
                <button class="nav-link xxxxxx" type="button" data-bs-toggle="tab" data-bs-target="#A636E1C5" role="tab">
                    Weather
                </button>
                <div class="ms-auto">
                    <button class="btn btn-sm btn-primary me-2" type="button" @click="configStore.import()">
                        <i class="bi bi-upload"></i> Import
                    </button>
                    <button class="btn btn-sm btn-primary me-2" type="button" @click="configStore.export()">
                        <i class="bi bi-download"></i> export
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
            <!-- SERVICES                                                                                            -->
            <!-- *************************************************************************************************** -->

            <div class="tab-pane fade show active" id="D15B3DA7" role="tabpanel" tabindex="0">

                <div class="row">
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="card mb-3">
                            <div class="card-header d-flex">
                                <span class="me-auto">
                                    MQTT Broker
                                </span>
                            </div>
                            <div class="card-body">

                                <div class="mb-3">
                                    <label class="form-label" for="F3AB1470">Server URL</label>
                                    <input class="form-control form-control-sm" type="text" id="F3AB1470" placeholder="Server URL" v-no-autocomplete v-model="configStore.globals.mqttURL" />
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="A45F11A0">Username<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" id="A45F11A0" placeholder="Username" v-no-autocomplete v-model="configStore.globals.mqttUsername" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="A4245C17">Password<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="password" id="A4245C17" placeholder="Password" v-password-toggle v-model="configStore.globals.mqttPassword" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="card mb-3">
                            <div class="card-header d-flex">
                                Grafana
                            </div>
                            <div class="card-body">

                                <div class="mb-3">
                                    <label class="form-label" for="C1C5DFD3">Server URL<sup class="text-secondary">opt</sup></label>
                                    <input class="form-control form-control-sm" type="text" id="C1C5DFD3" placeholder="Server URL" v-no-autocomplete v-model="configStore.globals.grafanaURL" />
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="card mb-0">
                            <div class="card-header d-flex">
                                Node-RED
                            </div>
                            <div class="card-body">

                                <div class="mb-3">
                                    <label class="form-label" for="DDBCAD3D">Server URL<sup class="text-secondary">opt</sup></label>
                                    <input class="form-control form-control-sm" type="text" id="DDBCAD3D" placeholder="Server URL" v-no-autocomplete v-model="configStore.globals.nodeRedURL" />
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                </div>

            </div>

            <!-- *************************************************************************************************** -->
            <!-- ASTRO                                                                                               -->
            <!-- *************************************************************************************************** -->

            <div class="tab-pane fade xxxx xxxxxx" id="D1B9D18C" role="tabpanel" tabindex="0">

                <div class="row">
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="card mb-3">
                            <div class="card-header d-flex">
                                Features
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-6">

                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" role="switch" id="A925CE04" v-model="configStore.globals.enableSkyMap" :true-value="true" :false-value="false">
                                            <label class="form-check-label" for="A925CE04">Enable sky map</label>
                                        </div>

                                    </div>
                                    <div class="col-md-6">

                                        <select class="form-select form-select-sm" v-model="configStore.globals.skymap">
                                            <option value="aladin">Aladin</option>
                                            <option value="stellarium">Stellarium</option>
                                        </select>

                                    </div>
                                </div>

                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" role="switch" id="FF3DAE50" v-model="configStore.globals.enableSkyAtlas" :true-value="true" :false-value="false">
                                    <label class="form-check-label" for="FF3DAE50">Enable sky atlas</label>
                                </div>

                                <div class="form-check form-switch mb-0">
                                    <input class="form-check-input" type="checkbox" role="switch" id="FCEB8C30" v-model="configStore.globals.enableAstroSetup" :true-value="true" :false-value="false">
                                    <label class="form-check-label" for="FCEB8C30">Enable astro setup</label>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="card mb-3">
                            <div class="card-header d-flex">
                                Astrometry
                            </div>
                            <div class="card-body">

                                TODO

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="card mb-0">
                            <div class="card-header d-flex">
                                Autoguiding
                            </div>
                            <div class="card-body">

                                TODO

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                </div>

            </div>

            <!-- *************************************************************************************************** -->
            <!-- WEATHER                                                                                             -->
            <!-- *************************************************************************************************** -->

            <div class="tab-pane fade xxxx xxxxxx" id="A636E1C5" role="tabpanel" tabindex="0">

                <div class="row">
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="card mb-3">
                            <div class="card-header">
                                <i class="bi bi-cloud"></i> Weather widget
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label" for="B8D10E0E">Service name<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" id="B8D10E0E" placeholder="Service name" v-no-autocomplete v-model="configStore.globals.weatherWidgetServiceName" />
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="mb-3">
                                            <label class="form-label" for="DC65FA98">Service URL<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" id="DC65FA98" placeholder="Service URL" v-no-autocomplete v-model="configStore.globals.weatherWidgetServiceURL" />
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-0">
                                    <label class="form-label" for="F785A24A">HTML code<sup class="text-secondary">opt</sup></label>
                                    <textarea class="form-control" rows="10" id="F785A24A" v-no-autocomplete v-model="configStore.globals.weatherWidgetHTML"></textarea>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="card mb-3">
                            <div class="card-header">
                                <i class="bi bi-stars"></i> Seeing widget
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label" for="BCAF259C">Service name<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" id="BCAF259C" placeholder="Service name" v-no-autocomplete v-model="configStore.globals.seeingWidgetServiceName" />
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="mb-3">
                                            <label class="form-label" for="DC2D5B47">Service URL<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" id="DC2D5B47" placeholder="Service URL" v-no-autocomplete v-model="configStore.globals.seeingWidgetServiceURL" />
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-0">
                                    <label class="form-label" for="AD32C0D2">HTML code<sup class="text-secondary">opt</sup></label>
                                    <textarea class="form-control" rows="10" id="AD32C0D2" v-no-autocomplete v-model="configStore.globals.seeingWidgetHTML"></textarea>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                </div>

            </div>

            <!-- *************************************************************************************************** -->

        </div>

        <!-- ******************************************************************************************************* -->

    </form>

    <!-- *********************************************************************************************************** -->

</template>
