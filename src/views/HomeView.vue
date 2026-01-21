<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, computed, reactive} from 'vue';

import {useNyxStore} from 'vue-nyx';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '@/stores/config';

import PanelGrid from '@/components/dashboard/PanelGrid.vue';
import CredentialsModal from '@/components/dashboard/CredentialsModal.vue';

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
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARD                                                                                                   -->
    <!-- *********************************************************************************************************** -->

    <div class="overflow-y-auto h-100 w-100 p-3">

        <nyx-dashboard :show-devices="configStore.globals.showNyxInterfaces" @connect="connect" @disconnect="disconnect">

            <!-- *************************************************************************************************** -->

            <template v-if="configStore.globals.showUserInterfaces">

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
