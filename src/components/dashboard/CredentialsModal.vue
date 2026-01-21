<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, onMounted, onUnmounted, reactive} from 'vue';

import {Modal} from 'bootstrap';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '@/stores/config.js';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits(['connect']);

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    username: '',
    password: '',
});

/*--------------------------------------------------------------------------------------------------------------------*/

const modalEl = ref(null);

let modalInstance = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const show = () => {

    state.username = '';
    state.password = '';

    modalInstance?.show();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const hide = () => {

    state.username = '';
    state.password = '';

    modalInstance?.hide();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const submit = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    emit('connect', {
        username: !configStore.globals.askMQTTUsername ? configStore.globals.mqttUsername : state.username,
        password: !configStore.globals.askMQTTPassword ? configStore.globals.mqttPassword : state.password,
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    hide();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

defineExpose({
    show,
    hide,
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    modalInstance = Modal.getOrCreateInstance(modalEl.value);
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    modalInstance = /*-------------*/ null /*-------------*/;
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="modal" tabindex="-1" ref="modalEl">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">

                    <!-- ******************************************************************************************* -->

                    <div class="modal-header px-3 py-2">

                        <h5 class="modal-title">
                            Credentials
                        </h5>

                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>

                    </div>

                    <!-- ******************************************************************************************* -->

                    <form class="modal-body px-3 py-2" id="A8FAABB1" @submit.prevent="submit">

                        <div class="row">
                            <div class="col-3 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="125" height="125" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m0 5.996V14H3s-1 0-1-1 1-4 6-4q.845.002 1.544.107a4.5 4.5 0 0 0-.803.918A11 11 0 0 0 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664zM9 13a1 1 0 0 1 1-1v-1a2 2 0 1 1 4 0v1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm3-3a1 1 0 0 0-1 1v1h2v-1a1 1 0 0 0-1-1" />
                                </svg>
                            </div>
                            <div class="col-9 text-start">
                                <div class="mb-3" v-if="configStore.globals.askMQTTUsername">
                                    <label class="form-label" for="A45F11A0">Username</label>
                                    <input class="form-control form-control-sm" type="text" name="mqttUsername" placeholder="Username" autocomplete="mqtt-server username" v-xxxxxxxx-xxxxxx id="A45F11A0" v-model="state.username" />
                                </div>

                                <div class="mb-3" v-if="configStore.globals.askMQTTPassword">
                                    <label class="form-label" for="A4245C17">Password</label>
                                    <input class="form-control form-control-sm" type="password" name="mqttPassword" placeholder="Password" autocomplete="mqtt-server current-password" v-password-toggle id="A4245C17" v-model="state.password" />
                                </div>
                            </div>
                        </div>

                    </form>

                    <!-- ******************************************************************************************* -->

                    <div class="modal-footer px-3 py-1">

                        <button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">
                            <i class="bi bi-x-lg"></i> Cancel
                        </button>

                        <button class="btn btn-success" type="submit" form="A8FAABB1">
                            <i class="bi bi-check-lg"></i> Connect
                        </button>

                    </div>

                    <!-- ******************************************************************************************* -->

                </div>
            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>
