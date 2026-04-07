<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {watch, inject, reactive, computed, onMounted} from 'vue';

import * as marked from 'marked';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '@/stores/config';

import getRuntime from '@/runtime';

import UserDashboardTable from '@/components/config/UserDashboardTable.vue';
import AddonTable from '@/components/config/AddonTable.vue';
import CacheTable from '@/components/config/CacheTable.vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import license from '@/assets/license.txt?raw';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const dialog = inject('dialog');
const mqtt = inject('mqtt');
const nss = inject('nss');

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

    mqtt.check(configStore.globals.mqttURL, configStore.globals.mqttUsername, configStore.globals.mqttPassword).then((message) => {

        dialog.show(message, 'Testing MQTT broker', 'info');

    }).catch((error) => {

        dialog.show(error, 'Testing MQTT broker', 'error');
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const checkNSSConnection = () => {

    nss.check(configStore.globals.nssURL, configStore.globals.nssUsername, configStore.globals.nssPassword).then((message) => {

        dialog.show(message, 'Testing Nyx-Stream', 'info');

    }).catch((error) => {

        dialog.show(error, 'Testing Nyx-Stream', 'error');
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

watch(() => configStore.globals.askMQTTUsername, (ask) => {

    if(ask) {
        configStore.globals.mqttUsername = '';
    }
});

watch(() => configStore.globals.askMQTTPassword, (ask) => {

    if(ask) {
        configStore.globals.mqttPassword = '';
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    document.getElementById('nyx_license').innerHTML = marked.marked(license).replace('/<a /g', '<a target="_blank" ').replaceAll(/<h([1-6])>/g, (_, p1) => `<h${Number.parseInt(p1) + 1}>`).replaceAll(/<\/h([1-6])>/g, (_, p1) => `</h${Number.parseInt(p1) + 1}>`);
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <template v-if="state.indexMode">

        <button class="btn btn-light" type="button" style="z-index: 999999; position: absolute; top: 58px; right: 1rem;" @click="() => { state.indexMode = false; }">
            <i class="bi bi-door-open"></i> Close addon index
        </button>

        <iframe src="https://addons.nyxlib.org/" title="Nyx Addon Index" style="height: 100%; width: 100%;" v-show="state.indexMode"></iframe>

    </template>

    <!-- *********************************************************************************************************** -->

    <div class="overflow-y-auto h-100 w-100 p-3" v-show="!state.indexMode">

        <!--*********************************************************************************************************-->

        <nav-tabs>

            <!-- *************************************************************************************************** -->
            <!-- NYX LAB                                                                                             -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Nyx Lab">

                <div class="row">
                    <div class="col-lg-6">

                        <!-- *************************************************************************************** -->

                        <div class="shadow-sm card mb-3">
                            <div class="card-header">
                                <i class="bi bi-window"></i> Nyx Lab
                            </div>
                            <div class="card-body">

                                <div class="row">
                                    <div class="col-lg-6">
                                        <div class="mb-3 mb-md-0">
                                            <label class="form-label" for="A4703928">Window title</label>
                                            <input class="form-control form-control-sm" type="text" name="windowTitle" placeholder="Window title" id="A4703928" v-model="configStore.globals.windowTitle" />
                                        </div>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="mb-0 mb-md-0">
                                            <label class="form-label" for="EDED8D84">Window theme</label>
                                            <select class="form-select form-select-sm" name="windowTheme" id="EDED8D84" v-model="configStore.globals.windowTheme">
                                                <option value="light">Light</option>
                                                <option value="dark">Dark</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="shadow-sm card mb-3">
                            <div class="card-header">
                                <i class="bi bi-hdd-stack"></i> Servers
                            </div>
                            <div class="card-body">

                                <div class="mb-3">
                                    <label class="form-label" for="F3AB1470">MQTT Broker URL<!-- ********************************** --></label>
                                    <div class="input-group input-group-sm">
                                        <input class="form-control form-control-sm" type="text" name="mqttURL" placeholder="Server URL, e.g. ws://localhost:8080/" autocomplete="mqtt-server url" id="F3AB1470" v-model="configStore.globals.mqttURL" />
                                        <button class="btn btn-primary" type="button" :disabled="!configStore.globals.mqttURL?.trim()" @click="checkMQTTConnection">
                                            <i class="bi bi-broadcast"></i> Check
                                        </button>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label" for="FCF446F6">Nyx-Stream Server URL<sup class="text-secondary">opt</sup></label>
                                    <div class="input-group input-group-sm">
                                        <input class="form-control form-control-sm" type="text" name="nssURL" placeholder="Server URL, e.g. ws://localhost:9999/" autocomplete="nss-server url" id="FCF446F6" v-model="configStore.globals.nssURL" />
                                        <button class="btn btn-primary" type="button" :disabled="!configStore.globals.nssURL?.trim()" @click="checkNSSConnection">
                                            <i class="bi bi-broadcast"></i> Check
                                        </button>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3 mb-md-0">
                                            <label class="form-label" for="A45F11A0">Username<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" name="mqttUsername" placeholder="Username" autocomplete="mqtt-server username" :disabled="configStore.globals.askMQTTUsername" x-xxxxxxxx-xxxxxx id="A45F11A0" v-model="configStore.globals.mqttUsername" />
                                        </div>
                                        <div class="mb-3 mb-md-0">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" role="switch" id="ECC6E4FD" v-model="configStore.globals.askMQTTUsername">
                                                <label class="form-check-label" for="ECC6E4FD">Always ask username</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3 mb-md-0">
                                            <label class="form-label" for="A4245C17">Password<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="password" name="mqttPassword" placeholder="Password" autocomplete="mqtt-server current-password" :disabled="configStore.globals.askMQTTPassword" v-password-toggle id="A4245C17" v-model="configStore.globals.mqttPassword" />
                                        </div>
                                        <div class="mb-0 mb-md-0">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" role="switch" id="A6DE57C2" v-model="configStore.globals.askMQTTPassword">
                                                <label class="form-check-label" for="A6DE57C2">Always ask password</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <user-dashboard-table class="shadow-sm mb-3" :user-dashboards="configStore.globals.interfacePanels" :enabled="configStore.globals.showUserInterfaces" />

                        <!-- *************************************************************************************** -->

                    </div>
                    <div class="col-lg-6">

                        <!-- *************************************************************************************** -->

                        <div class="shadow-sm card mb-3">
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
            <!-- ADDONS                                                                                              -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Addons">

                <div class="container">

                    <nav-tabs>

                        <tab-pane title="Addons and pages" icon="plugin">
                            <addon-table class="shadow-sm" :addons="configStore.globals.addons" :console="configStore.console" @search="() => { state.indexMode = true; }" />
                        </tab-pane>

                        <tab-pane title="Cache" icon="recycle" @shown="() => state.shownTabs.add('nyx-cache')" v-if="getRuntime().isDesktop || getRuntime().isMobile">
                            <cache-table class="shadow-sm" v-if="state.shownTabs.has('nyx-cache')" />
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

                        <nyx-topology class="shadow-sm mb-3" v-if="state.showNyx" />

                    </div>
                    <div class="col-lg-6">

                        <nyx-variables class="shadow-sm mb-3" v-if="state.showNyx" />

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

        </nav-tabs>

        <!--*********************************************************************************************************-->

    </div>

    <!-- *************************************************************************************************** -->
    <!-- BUTTONS                                                                                             -->
    <!-- *************************************************************************************************** -->

    <teleport to="#nyx_toolbar">

        <!-- *********************************************************************************************** -->

        <button class="btn btn-sm btn-outline-primary me-2" type="button" style="width: 96px;" @click="configStore.new()">
            <i class="bi bi-plus-lg"></i> New
        </button>

        <button class="btn btn-sm btn-outline-primary me-2" type="button" style="width: 96px;" @click="configStore.import()">
            <i class="bi bi-upload"></i> Import
        </button>

        <button class="btn btn-sm btn-outline-primary me-2" type="button" style="width: 96px;" @click="configStore.export()">
            <i class="bi bi-download"></i> Export
        </button>

        <!-- *********************************************************************************************** -->

        <span class="navbar-text me-2">-</span>

        <!-- *********************************************************************************************** -->

        <button class="btn btn-sm btn-outline-warning me-2" :class="{'pulse-btn': configStore.modified}" type="button" style="width: 96px;" :disabled="!configStore.modified" @click="configStore.rollback()">
            <i class="bi bi-x-lg"></i> Rollback
        </button>

        <button class="btn btn-sm btn-outline-success me-0" :class="{'pulse-btn': configStore.modified}" type="button" style="width: 96px;" :disabled="!configStore.modified" @click="configStore.persist()">
            <i class="bi bi-check-lg"></i> Persist
        </button>

        <!-- *********************************************************************************************** -->

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>
