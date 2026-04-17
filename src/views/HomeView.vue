<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, computed, reactive} from 'vue';

import {useNyxStore} from 'vue-nyx';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '@/stores/config';

import getRuntime from '@/runtime';

import PanelGrid from '@/components/dashboard/PanelGrid.vue';
import CredentialsModal from '@/components/dashboard/CredentialsModal.vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import particles from '@/assets/particles.json';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const GIT_RELEASE = __GIT_RELEASE__;

/*--------------------------------------------------------------------------------------------------------------------*/

const mqtt = inject('mqtt');
const nyx = inject('nyx');
const nss = inject('nss');

/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    currentPanelId: null,
});


/*--------------------------------------------------------------------------------------------------------------------*/

const modalEl = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/
/* COMPUTED                                                                                                           */
/*--------------------------------------------------------------------------------------------------------------------*/

const panels = computed(() => Object.values(configStore.globals.interfacePanels).filter((panel) => panel.enabled).sort((a, b) => a.rank - b.rank));

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const connect_step2 = (credentials) => {

    mqtt.update(
        configStore.globals.mqttURL,
        credentials.username,
        credentials.password,
    );

    nss.update(
        configStore.globals.nssURL,
        credentials.username,
        credentials.password,
    );
};

/*--------------------------------------------------------------------------------------------------------------------*/

const connect = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(!configStore.globals.askMQTTUsername
       &&
       !configStore.globals.askMQTTPassword
    ) {
        connect_step2({
            username: configStore.globals.mqttUsername,
            password: configStore.globals.mqttPassword,
        });
    }
    else
    {
        modalEl.value.show();
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const disconnect = () => {

    mqtt.update('', '', '');

    nss.update('', '', '');
};

/*--------------------------------------------------------------------------------------------------------------------*/

const enableBLOBsAndStreams = (panel, enabled) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    state.currentPanelId = enabled ? panel : null;

    /*----------------------------------------------------------------------------------------------------------------*/

    const blobs = new Set();
    const streams = new Set();

    Object.values(configStore.globals.interfaceWidgets).filter((widget) => widget.panel === panel).forEach((widget) => {

        if(widget.mode === 'blob')
        {
            widget.variables1.forEach((variable) => { blobs.add(variable); });
            widget.variables2.forEach((variable) => { blobs.add(variable); });
        }

        if(widget.mode === 'stream')
        {
            widget.variables1.forEach((variable) => { streams.add(variable); });
            widget.variables2.forEach((variable) => { streams.add(variable); });
        }
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    blobs.forEach((blob) => {

        nyx.enableBLOB(blob, enabled && nyxStore.isConnected);
    });

    streams.forEach((stream) => {

        nyx.enableStream(stream, enabled && nyxStore.isConnected);
    });

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const newConfig = () => {

    configStore.new();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const openConfig = () => {

    configStore.import();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const saveConfig = () => {

    configStore.export();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const openHelp = () => {

    getRuntime().browse('https://nyxlib.org/solutions/nyx-lab/');
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARD                                                                                                   -->
    <!-- *********************************************************************************************************** -->

    <div class="overflow-y-hidden overflow-y-auto h-100 w-100 p-3">

        <nyx-dashboard class="position-relative" :show-devices="configStore.globals.showNyxInterfaces" @connect="connect" @disconnect="disconnect">

            <!-- *************************************************************************************************** -->

            <template #home>

                <!-- *********************************************************************************************** -->

                <vue-particles class="position-absolute top-0 start-0 w-100 h-100 z-n1" :options="particles" :id="uuid.v4()" v-if="configStore.globals.animateHomePage" />

                <!-- *********************************************************************************************** -->

                <div class="row w-50 my-5">

                    <!-- ******************************************************************************************* -->

                    <div class="col-md-3 d-flex flex-column align-items-center">
                        <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center mb-2" type="button" style="width: 75px; height: 75px; border-radius: 40px;" @click="newConfig()">
                            <i class="bi bi-plus-lg" style="font-size: 40px;"></i>
                        </button>
                        <span class="text-center mb-2">New workspace</span>
                    </div>

                    <!-- ******************************************************************************************* -->

                    <div class="col-md-3 d-flex flex-column align-items-center">
                        <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center mb-2" type="button" style="width: 70px; height: 70px; border-radius: 35px;" @click="openConfig()">
                            <i class="bi bi-upload" style="font-size: 35px;"></i>
                        </button>
                        <span class="text-center mb-2">Import workspace</span>
                    </div>

                    <!-- ******************************************************************************************* -->

                    <div class="col-md-3 d-flex flex-column align-items-center">
                        <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center mb-2" type="button" style="width: 70px; height: 70px; border-radius: 35px;" @click="saveConfig()">
                            <i class="bi bi-download" style="font-size: 35px;"></i>
                        </button>
                        <span class="text-center mb-2">Export workspace</span>
                    </div>

                    <!-- ******************************************************************************************* -->

                    <div class="col-md-3 d-flex flex-column align-items-center">
                        <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center mb-2" type="button" style="width: 70px; height: 70px; border-radius: 35px;" @click="openHelp()">
                            <i class="bi bi-book" style="font-size: 35px;"></i>
                        </button>
                        <span class="text-center mb-2">Documentation</span>
                    </div>

                    <!-- ******************************************************************************************* -->

                </div>

                <!-- *********************************************************************************************** -->

                <div class="d-none d-md-block position-absolute text-center opacity-50" style="font-size: 0.9rem; bottom: -10px;">

                    <span>
                        © 2024-{{ new Date().getFullYear() }} <a href="https://nyxlib.org/" target="_blank">Nyx Lab</a> — <a href="https://odier.xyz/" target="_blank">Jérôme ODIER</a>, <a href="https://lpsc.in2p3.fr/" target="_blank">LPSC</a> / <a href="https://cnrs.fr/" target="_blank">CNRS</a>.
                    </span>

                    <br class="d-lg-none">

                    <span>
                        GIT commit: <a :href="`https://github.com/nyxlib/nyx-lab/tree/${GIT_RELEASE.gitCommit}`" target="_blank">{{ GIT_RELEASE.gitBranch }} / {{ GIT_RELEASE.gitCommit }}</a>, build date: {{ GIT_RELEASE.date?.split('T')[0] }}.
                    </span>

                </div>

                <!-- *********************************************************************************************** -->

            </template>

            <!-- *************************************************************************************************** -->

            <template #panels v-if="configStore.globals.showUserInterfaces">

                <tab-pane class="pt-3" :title="panel.title" v-for="panel in panels" :key="panel.id" @shown="enableBLOBsAndStreams(panel.id, true)" @hidden="enableBLOBsAndStreams(panel.id, false)">

                    <panel-grid :panel="panel" v-if="panel.id === state.currentPanelId" />

                </tab-pane>

            </template>

            <!-- *************************************************************************************************** -->

        </nyx-dashboard>

    </div>

    <!-- *********************************************************************************************************** -->
    <!-- MODAL                                                                                                       -->
    <!-- *********************************************************************************************************** -->

    <credentials-modal ref="modalEl" @connect="connect_step2" />

    <!-- *********************************************************************************************************** -->
    <!-- BUTTONS                                                                                                     -->
    <!-- *********************************************************************************************************** -->

    <teleport to="#nyx_toolbar" v-if="configStore.modified && !state.currentPanelId">

        <button class="btn btn-sm btn-outline-warning me-2" :class="{'pulse-btn': configStore.modified}" type="button" style="width: 150px;" @click="configStore.rollback()">
            <i class="bi bi-x-lg"></i> Rollback changes
        </button>

        <button class="btn btn-sm btn-outline-success me-0" :class="{'pulse-btn': configStore.modified}" type="button" style="width: 150px;" @click="configStore.persist()">
            <i class="bi bi-check-lg"></i> Persist changes
        </button>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>

<style scoped>
/*--------------------------------------------------------------------------------------------------------------------*/

a {
    text-decoration: none;
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
