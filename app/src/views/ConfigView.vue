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

    <form class="h-100 w-100 p-3" @submit.prevent="configStore.save">

        <!--*********************************************************************************************************-->

        <nav class="mb-3">
            <div class="nav nav-tabs" role="tablist">
                <button class="nav-link active" type="button" data-bs-toggle="tab" data-bs-target="#D15B3DA7" role="tab">
                    Services
                </button>
                <button class="nav-link xxxxxx" type="button" data-bs-toggle="tab" data-bs-target="#A636E1C5" role="tab">
                    Weather
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
                                            <label class="form-label" for="A45F11A0">Username</label>
                                            <input class="form-control form-control-sm" type="text" id="A45F11A0" placeholder="Username" v-no-autocomplete v-model="configStore.globals.mqttUsername" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="A4245C17">Password</label>
                                            <input class="form-control form-control-sm" type="password" id="A4245C17" placeholder="Password" v-password-toggle v-model="configStore.globals.mqttPassword" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

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
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="card mb-3">
                            <div class="card-header d-flex">
                                Sky map
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="enable_sky_map" id="CAC16985" v-model="configStore.globals.enableSkyMap" v-bind:value="true">
                                            <label class="form-check-label" for="CAC16985">
                                                Enable
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="enable_sky_map" id="C9E3CBA5" v-model="configStore.globals.enableSkyMap" v-bind:value="false">
                                            <label class="form-check-label" for="C9E3CBA5">
                                                Disable
                                            </label>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="card mb-0">
                            <div class="card-header d-flex">
                                Sky atlas
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="enable_sky_atlas" id="FF3DAE50" v-model="configStore.globals.enableSkyAtlas" v-bind:value="true">
                                            <label class="form-check-label" for="FF3DAE50">
                                                Enable
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="enable_sky_atlas" id="DC0AB03E" v-model="configStore.globals.enableSkyAtlas" v-bind:value="false">
                                            <label class="form-check-label" for="DC0AB03E">
                                                Disable
                                            </label>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="card mb-0">
                            <div class="card-header d-flex">
                                Astro setup
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="enable_astro_setup" id="FCEB8C30" v-model="configStore.globals.enableAstroSetup" v-bind:value="true">
                                            <label class="form-check-label" for="FCEB8C30">
                                                Enable
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="enable_astro_setup" id="FCEB8C30" v-model="configStore.globals.enableAstroSetup" v-bind:value="false">
                                            <label class="form-check-label" for="FCEB8C30">
                                                Disable
                                            </label>
                                        </div>
                                    </div>
                                </div>

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
                                <i class="bi bi-cloud"></i> Weather widget HTML
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label" for="B8D10E0E">Service name</label>
                                            <input class="form-control form-control-sm" type="text" id="B8D10E0E" placeholder="Service name" v-model="configStore.globals.weatherWidgetServiceName" />
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="mb-3">
                                            <label class="form-label" for="DC65FA98">Service URL</label>
                                            <input class="form-control form-control-sm" type="text" id="DC65FA98" placeholder="Service URL" v-model="configStore.globals.weatherWidgetServiceURL" />
                                        </div>
                                    </div>
                                </div>

                                <textarea class="form-control" rows="10" v-model="configStore.globals.weatherWidgetHTML"></textarea>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="card mb-3">
                            <div class="card-header">
                                <i class="bi bi-stars"></i> Seeing widget HTML
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label" for="BCAF259C">Service name</label>
                                            <input class="form-control form-control-sm" type="text" id="BCAF259C" placeholder="Service name" v-model="configStore.globals.seeingWidgetServiceName" />
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="mb-3">
                                            <label class="form-label" for="DC2D5B47">Service URL</label>
                                            <input class="form-control form-control-sm" type="text" id="DC2D5B47" placeholder="Service URL" v-model="configStore.globals.seeingWidgetServiceURL" />
                                        </div>
                                    </div>
                                </div>

                                <textarea class="form-control" rows="10" v-model="configStore.globals.seeingWidgetHTML"></textarea>

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

</template>
