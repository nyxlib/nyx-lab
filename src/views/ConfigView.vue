<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {reactive, computed, onMounted, inject} from 'vue';

import * as marked from 'marked';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

import UserDashboardTable from '../components/UserDashboardTable.vue';
import AddonTable from '../components/AddonTable.vue';
import CacheTable from '../components/CacheTable.vue';
import WebPageTable from '../components/WebPageTable.vue';

import license from '../assets/license.txt';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const HAS_TAURI = typeof window['__TAURI__'] !== 'undefined';

/*--------------------------------------------------------------------------------------------------------------------*/

const dialog = inject('dialog');
const mqtt = inject('mqtt');
const nss = inject('nss');

/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    shownTabs: new Set(),
    indexMode: false,
    showNyx: false,
});

/*--------------------------------------------------------------------------------------------------------------------*/

const confPanels = computed(() => Object.values(configStore.confPanels).sort((x, y) => x.descr.rank - y.descr.rank));

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const checkMQTTConnection = () => {

    mqtt.update(configStore.globals.mqttURL, configStore.globals.mqttUsername, configStore.globals.mqttPassword).then((message) => {

        dialog.show(message, 'Testing MQTT broker', 'info');

    }).catch((message) => {

        dialog.show(message, 'Testing MQTT broker', 'error');
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const checkNSSConnection = () => {

    nss.check(configStore.globals.nssURL, configStore.globals.nssUsername, configStore.globals.nssPassword).then((message) => {

        dialog.show(message, 'Testing Nyx-Stream', 'info');

    }).catch((message) => {

        dialog.show(message, 'Testing Nyx-Stream', 'error');
    });
};

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

    <template v-if="state.indexMode">

        <button class="btn btn-light" type="button" style="z-index: 999999; position: absolute; top: 51px; right: 1rem;" @click="() => { state.indexMode = false; }">
            <i class="bi bi-door-open"></i> Close addon index
        </button>

        <iframe src="https://addons.nyxlib.org/" style="height: 100%; width: 100%;" v-show="state.indexMode"></iframe>

    </template>

    <!-- *********************************************************************************************************** -->

    <div class="overflow-y-auto h-100 w-100 p-3" v-show="!state.indexMode">

        <!--*********************************************************************************************************-->

        <nav-tabs>

            <!-- *************************************************************************************************** -->
            <!-- SERVICES                                                                                            -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Main">

                <div class="row">
                    <div class="col-lg-6">

                        <!-- *************************************************************************************** -->

                        <div class="shadow card mb-3">
                            <div class="d-flex card-header justify-content-between">
                                <div><i class="bi bi-hdd-stack"></i> MQTT Broker</div>
                                <button class="btn btn-xs btn-primary" type="button" @click="checkMQTTConnection">
                                    <i class="bi bi-broadcast"></i>
                                    Check connection
                                </button>
                            </div>
                            <div class="card-body">

                                <div class="mb-3">
                                    <label class="form-label" for="F3AB1470">Server URL</label>
                                    <input class="form-control form-control-sm" type="text" placeholder="Server URL" autocomplete="mqtt-server url" id="F3AB1470" v-model="configStore.globals.mqttURL" />
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3 mb-md-0">
                                            <label class="form-label" for="A45F11A0">Username<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" placeholder="Username" autocomplete="mqtt-server username" id="A45F11A0" v-model="configStore.globals.mqttUsername" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-0 mb-md-0">
                                            <label class="form-label" for="A4245C17">Password<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="password" placeholder="Password" autocomplete="mqtt-server current-password" v-password-toggle id="A4245C17" v-model="configStore.globals.mqttPassword" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="shadow card mb-3">
                            <div class="d-flex card-header justify-content-between">
                                <div><i class="bi bi-hdd-stack"></i> Nyx-Stream Server</div>
                                <button class="btn btn-xs btn-primary" type="button" @click="checkNSSConnection">
                                    <i class="bi bi-broadcast"></i>
                                    Check connection
                                </button>
                            </div>
                            <div class="card-body">

                                <div class="mb-3">
                                    <label class="form-label" for="F3AB1470">Server URL<sup class="text-secondary">opt</sup></label>
                                    <input class="form-control form-control-sm" type="text" placeholder="Server URL" autocomplete="nss-server url" id="F3AB1470" v-model="configStore.globals.nssURL" />
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3 mb-md-0">
                                            <label class="form-label" for="D82503D3">Username<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" placeholder="Username" autocomplete="nss-server username" id="D82503D3" v-model="configStore.globals.nssUsername" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-0 mb-md-0">
                                            <label class="form-label" for="DDCC3DFE">Password<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="password" placeholder="Password" autocomplete="nss-server current-password" v-password-toggle id="DDCC3DFE" v-model="configStore.globals.nssPassword" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="shadow card mb-3">
                            <div class="card-header">
                                <i class="bi bi-grid-1x2"></i> Interfaces & dashboards
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-md-3">

                                        <div class="mb-3">
                                            <label class="form-label" for="A925CE04">Show Nyx interfaces</label>
                                            <div class="form-check form-switch form-switch-lg"><input class="form-check-input" type="checkbox" id="A925CE04" v-model="configStore.globals.showNyxInterfaces" /></div>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label" for="A925CE04">Show user dashboards</label>
                                            <div class="form-check form-switch form-switch-lg"><input class="form-check-input" type="checkbox" id="A925CE04" v-model="configStore.globals.showUserInterfaces" /></div>
                                        </div>

                                    </div>
                                    <div class="col-md-9">

                                        <user-dashboard-table :user-dashboards="configStore.globals.interfacePanels" :enabled="configStore.globals.showUserInterfaces" />

                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>
                    <div class="col-lg-6">

                        <!-- *************************************************************************************** -->

                        <div class="shadow card mb-3">
                            <div class="card-header">
                                <i class="bi bi-bank"></i> License
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

                    <nav-tabs>

                        <tab-pane title="Addons">
                            <addon-table :addons="configStore.globals.addons" @search="() => {state.indexMode = true; }" />
                        </tab-pane>

                        <tab-pane title="Web pages">
                            <web-page-table :web-pages="configStore.globals.webPages" @search="() => {state.indexMode = true; }" />
                        </tab-pane>

                        <tab-pane title="Console">
                            <pre class="font-monospace rounded border p-2">{{ configStore.console.map((line) => line.trim()).join('\n') }}</pre>
                        </tab-pane>

                        <tab-pane title="Cache" @shown="() => state.shownTabs.add('nyx-cache')" v-if="HAS_TAURI">
                            <cache-table v-if="state.shownTabs.has('nyx-cache')" />
                        </tab-pane>

                    </nav-tabs>

                </div>

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- NYX                                                                                                 -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Nyx" @shown="state.showNyx = true">

                <div class="row">
                    <div class="col-lg-6">

                        <nyx-topology class="shadow mb-3" v-if="state.showNyx" />

                    </div>
                    <div class="col-lg-6">

                        <nyx-variables class="shadow mb-3" v-if="state.showNyx" />

                    </div>
                </div>

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- ADDONS                                                                                              -->
            <!-- *************************************************************************************************** -->

            <template v-for="confPanel in confPanels" :key="confPanel.descr.id">

                <tab-pane :title="panel.title" v-for="(panel, idx) in confPanel.panels" :key="`${confPanel.descr.id}_${idx}`" @shown="() => state.shownTabs.add(`${confPanel.descr.id}_${idx}`)">

                    <component :is="panel.component" v-if="state.shownTabs.has(`${confPanel.descr.id}_${idx}`)" />

                </tab-pane>

            </template>

            <!-- *************************************************************************************************** -->
            <!-- BUTTONS                                                                                             -->
            <!-- *************************************************************************************************** -->

            <template #button>

                <button class="btn btn-sm btn-outline-primary my-1 me-2" type="button" style="width: 85px;" @click="configStore.import()">
                    <i class="bi bi-upload"></i> Import
                </button>

                <button class="btn btn-sm btn-outline-primary my-1 me-2" type="button" style="width: 85px;" @click="configStore.export()">
                    <i class="bi bi-download"></i> Export
                </button>

                <button class="btn btn-sm btn-outline-warning my-1 me-2" type="button" style="width: 85px;" @click="configStore.load()">
                    <i class="bi bi-x-lg"></i> Reload
                </button>

                <button class="btn btn-sm btn-success xxxxxxx my-1 me-0" type="button" style="width: 85px;" @click="configStore.save()">
                    <i class="bi bi-check-lg"></i> Save
                </button>

            </template>

            <!-- *************************************************************************************************** -->

        </nav-tabs>

        <!--*********************************************************************************************************-->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
