<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { reactive, onMounted, onUnmounted } from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    mqttConnected: false,
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const connection = () => {

    configStore.configGet();
}

/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    configStore.mqtt.setConnectionCallback((connected) => {

        state.mqttConnected = connected;
    });

    /**/

    state.mqttConnected = configStore.mqtt.connected();
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    configStore.mqtt.setConnectionCallback(null);
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <div class="h-100 w-50 mx-auto p-3">

        <div class="card">
            <div class="card-header d-flex">
                <span class="me-auto">
                    MQTT
                </span>
                <button class="btn btn-xs btn-success" type="button" v-if="state.mqttConnected">connected</button>
                <button class="btn btn-xs btn-warning" type="button" v-if="!state.mqttConnected">disconnected</button>
            </div>
            <div class="card-body">

                <div class="mb-3">
                    <label class="form-label" for="F3AB1470">Server URL</label>
                    <input class="form-control form-control-sm" type="text" id="F3AB1470" placeholder="Server URL" v-no-autocomplete v-model="configStore.globals.mqttURL" />
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="mb-0">
                            <label class="form-label" for="A45F11A0">Username</label>
                            <input class="form-control form-control-sm" type="text" id="A45F11A0" placeholder="Username" v-no-autocomplete v-model="configStore.globals.mqttUsername" />
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-0">
                            <label class="form-label" for="A4245C17">Password</label>
                            <input class="form-control form-control-sm" type="password" id="A4245C17" placeholder="Password" v-password-toggle v-model="configStore.globals.mqttPassword" />
                        </div>
                    </div>
                </div>

                <div class="text-end">
                    <button type="button" class="btn btn-sm btn-primary" @click="connection">Connection</button>
                </div>

            </div>
        </div>

    </div>

</template>
