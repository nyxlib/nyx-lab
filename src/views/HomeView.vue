<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, computed, reactive} from 'vue';

import {useNyxStore} from 'vue-nyx';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '@/stores/config';

import PanelGrid from '@/components/dashboard/PanelGrid.vue';
import CredentialsModal from '@/components/dashboard/CredentialsModal.vue';

import particles from '@/assets/particles.json';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
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

const panels = computed(() => Object.values(configStore.globals.interfacePanels).filter((panel) => panel.enabled).sort((a, b) => a.rank - b.rank));

/*--------------------------------------------------------------------------------------------------------------------*/

const modalEl = ref(null);

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

const openConfig = () => {

    configStore.import();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const openHelp = () => {

};

/*--------------------------------------------------------------------------------------------------------------------*/

const openRepo = () => {

};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARD                                                                                                   -->
    <!-- *********************************************************************************************************** -->

    <div class="overflow-y-auto h-100 w-100 p-3">

        <nyx-dashboard class="position-relative" :show-devices="configStore.globals.showNyxInterfaces" @connect="connect" @disconnect="disconnect">

            <!-- *************************************************************************************************** -->

            <template #home>

                <!-- *********************************************************************************************** -->

                <vue-particles
                    class="position-absolute top-0 start-0 w-100 h-100"
                    :options="particles"
                    style="z-index: -1;"
                    id="particles-js"
                />

                <!-- *********************************************************************************************** -->

                <div class="row w-50 mt-5">

                    <!-- ******************************************************************************************* -->

                    <div class="col-md-4 d-flex flex-column align-items-center">
                        <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center mb-2" type="button" style="width: 90px; height: 90px; border-radius: 45px;" @click="openConfig()">
                            <i class="bi bi-upload" style="font-size: 45px;"></i>
                        </button>
                        <span>Open workspace</span>
                    </div>

                    <!-- ******************************************************************************************* -->

                    <div class="col-md-4 d-flex flex-column align-items-center">
                        <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center mb-2" type="button" style="width: 90px; height: 90px; border-radius: 45px;" @click="openHelp()">
                            <i class="bi bi-book" style="font-size: 45px;"></i>
                        </button>
                        <span>Documentation</span>
                    </div>

                    <!-- ******************************************************************************************* -->

                    <div class="col-md-4 d-flex flex-column align-items-center">
                        <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center mb-2" type="button" style="width: 90px; height: 90px; border-radius: 45px;" @click="openRepo()">
                            <i class="bi bi-github" style="font-size: 45px;"></i>
                        </button>
                        <span>Repository</span>
                    </div>

                    <!-- ******************************************************************************************* -->

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

</template>
