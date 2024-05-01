<!--suppress HtmlUnknownAttribute, VueUnrecognizedDirective -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {reactive} from 'vue';

import Multiselect from '@vueform/multiselect';

import {IndiVariables, IndiTopology, NavTabs, TabPane} from 'vue-indi';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    show_indi: false,
});

/*--------------------------------------------------------------------------------------------------------------------*/

const SKY_MAPS = [
    {value: 'aladin', label: 'Aladin'},
    {value: 'stellarium', label: 'Stellarium'},
];

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <form class="h-100 w-100 p-3" @submit.prevent="configStore.save">

        <!--*********************************************************************************************************-->

        <nav-tabs margin="mb-3">

            <!-- *************************************************************************************************** -->
            <!-- SERVICES                                                                                            -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Services">

                <div class="row">
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="shadow card">
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

                        <div class="shadow card">
                            <div class="card-header d-flex">
                                Node-RED
                            </div>
                            <div class="card-body">

                                <div class="mb-3">
                                    <label class="form-label" for="A508D199">Server URL<sup class="text-secondary">opt</sup></label>
                                    <input class="form-control form-control-sm" type="text" id="A508D199" placeholder="Server URL" v-no-autocomplete v-model="configStore.globals.nodeRedURL" />
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                </div>

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- FEATURES                                                                                            -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Features">

                <div class="row">
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="shadow card">
                            <div class="card-header">
                                Features
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-4">

                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" role="switch" id="A925CE04" v-model="configStore.globals.enableMonitoring" :true-value="true" :false-value="false" />
                                            <label class="form-check-label" for="A925CE04">Enable monitoring</label>
                                        </div>

                                    </div>
                                    <div class="col-md-8">

                                        <div class="mb-3">
                                            <label class="form-label" for="C8206AA4">Groups</label>
                                            <multiselect
                                                mode="tags"
                                                id="C8206AA4"
                                                :can-clear="true"
                                                :searchable="true"
                                                :create-option="true"
                                                :close-on-select="false"
                                                :options="configStore.globals.monitoringGroups"
                                                v-model="configStore.globals.monitoringGroups" />
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label" for="C8206AA4">Refresh interval [ms]</label>
                                            <input class="form-control form-control-sm" type="number" min="100" max="100000" step="1" v-model="configStore.globals.refreshInterval" />
                                        </div>

                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-4">

                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" role="switch" id="A925CE04" v-model="configStore.globals.enableSkyMap" :true-value="true" :false-value="false" />
                                            <label class="form-check-label" for="A925CE04">Enable sky map</label>
                                        </div>

                                    </div>
                                    <div class="col-md-8">

                                        <div class="mb-3">
                                            <label class="form-label" for="C88D31FB">Renderer</label>
                                            <multiselect
                                                mode="single"
                                                id="C88D31FB"
                                                :can-clear="false"
                                                :searchable="true"
                                                :create-option="false"
                                                :close-on-select="true"
                                                :options="/*-----*/SKY_MAPS/*-----*/"
                                                v-model="configStore.globals.skymap" />
                                        </div>

                                    </div>
                                </div>

                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" role="switch" id="FF3DAE50" v-model="configStore.globals.enableSkyAtlas" :true-value="true" :false-value="false" />
                                    <label class="form-check-label" for="FF3DAE50">Enable sky atlas</label>
                                </div>

                                <div class="form-check form-switch mb-0">
                                    <input class="form-check-input" type="checkbox" role="switch" id="A36C9DF3" v-model="configStore.globals.enableAstroSetup" :true-value="true" :false-value="false" />
                                    <label class="form-check-label" for="A36C9DF3">Enable astro setup</label>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="shadow card">
                            <div class="card-header">
                                Extensions
                            </div>
                            <div class="card-body">

                                TODO

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                </div>

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- WEATHER                                                                                             -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Weather">

                <div class="row">
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="shadow card">
                            <div class="card-header">
                                <i class="bi bi-cloud-moon-fill"></i> Weather widget
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

                        <div class="shadow card">
                            <div class="card-header">
                                <i class="bi bi-stars"></i> Seeing widget
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label" for="E4616FC6">Service name<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" id="E4616FC6" placeholder="Service name" v-no-autocomplete v-model="configStore.globals.seeingWidgetServiceName" />
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

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- INDI                                                                                                -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="INDI" @shown="state.show_indi = true">

                <div class="row">
                    <div class="col-md-6">

                        <indi-variables class="shadow" v-if="state.show_indi" />

                    </div>
                    <div class="col-md-6">

                        <indi-topology class="shadow" v-if="state.show_indi" />

                    </div>
                </div>

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- BUTTONS                                                                                             -->
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
