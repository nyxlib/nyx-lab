<!--suppress HtmlUnknownTag, JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {reactive, onMounted} from 'vue';

import Multiselect from '@vueform/multiselect';

import * as marked from 'marked';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

import license from '../assets/license.txt';

import NyxAddons from '../components/NyxAddons.vue';
import WebPages from '../components/WebPages.vue';
import Cache from '../components/Cache.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const HAS_TAURI = typeof window['__TAURI__'] !== 'undefined';

/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    shownTabs: new Set(),
    showNyx: false,
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    fetch(license.toString()).then((response) => {

        response.text().then((content) => {

            document.getElementById('nyx_license').innerHTML = marked.marked(content).replace('/<a /g', '<a target="_blank" ').replace(/<h([1-6])>/g, (_, p1) => `<h${parseInt(p1) + 1}>`).replace(/<\/h([1-6])>/g, (_, p1) => `</h${parseInt(p1) + 1}>`);
        });
    });
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="h-100 w-100 overflow-y-auto p-3">

        <!--*********************************************************************************************************-->

        <nav-tabs margin="mb-3">

            <!-- *************************************************************************************************** -->
            <!-- SERVICES                                                                                            -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Main">

                <div class="row">
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="shadow card mb-3">
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

                        <div class="shadow card mb-3">
                            <div class="card-header">
                                Monitoring
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
                                                v-model="configStore.globals.monitoringGroups"
                                            />
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label" for="C8206AA4">Refresh interval [ms]</label>
                                            <input class="form-control form-control-sm" type="number" min="100" max="100000" step="1" required="required" v-model="configStore.globals.refreshInterval" />
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                    <div class="col-md-6">

                        <!-- *************************************************************************************** -->

                        <div class="shadow card mb-3">
                            <div class="card-header">
                                License
                            </div>
                            <div class="card-body">

                                <div class="overflow-y-scroll" style="height: 500px;" id="nyx_license"></div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                </div>

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- EXT.                                                                                                -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Ext.">

                <div class="container">

                    <nav-tabs margin="mb-3">

                        <tab-pane title="Nyx Addons">

                            <nyx-addons :addons="configStore.globals.addons" />

                        </tab-pane>

                        <tab-pane title="Web pages">

                            <web-pages :web-pages="configStore.globals.webPages" />

                        </tab-pane>

                        <tab-pane title="Cache">

                            <cache v-if="HAS_TAURI" /><div v-else>Cache not available...</div>

                        </tab-pane>

                    </nav-tabs>

                </div>

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- NYX                                                                                                 -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Nyx" @shown="state.showNyx = true">

                <div class="row">
                    <div class="col-md-6">

                        <nyx-topology class="shadow mb-3" v-if="state.showNyx" />

                    </div>
                    <div class="col-md-6">

                        <nyx-variables class="shadow mb-3" v-if="state.showNyx" />

                    </div>
                </div>

            </tab-pane>

            <!-- *************************************************************************************************** -->

            <template v-for="(addon, key) in configStore.confPanels" :key="key">

                <tab-pane :title="panel.title" v-for="(panel, idx) in addon" :key="idx" @shown="() => state.shownTabs.add(`${key}_${idx}`)">

                    <component :is="panel.component" v-if="state.shownTabs.has(`${key}_${idx}`)" />

                </tab-pane>

            </template>

            <!-- *************************************************************************************************** -->
            <!-- BUTTONS                                                                                             -->
            <!-- *************************************************************************************************** -->

            <template v-slot:button>

                <button class="btn btn-sm btn-outline-primary my-1 me-2" type="button" @click="configStore.import()" style="width: 85px;">
                    <i class="bi bi-upload"></i> Import
                </button>

                <button class="btn btn-sm btn-outline-primary my-1 me-2" type="button" @click="configStore.export()" style="width: 85px;">
                    <i class="bi bi-download"></i> Export
                </button>

                <button class="btn btn-sm btn-outline-warning my-1 me-2" type="button" @click="configStore.load()" style="width: 85px;">
                    <i class="bi bi-x-lg"></i> Reload
                </button>

                <button class="btn btn-sm btn-success xxxxxxx my-1 me-0" type="button" @click="configStore.save()" style="width: 85px;">
                    <i class="bi bi-check-lg"></i> Save
                </button>

            </template>

            <!-- *************************************************************************************************** -->

        </nav-tabs>

        <!--*********************************************************************************************************-->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
