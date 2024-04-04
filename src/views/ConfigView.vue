<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { IndiVariables } from 'vue-indi';

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

        <nav class="navbar navbar-expand bg-transparent py-0 mb-2">
            <div class="container-fluid px-0">

                <div class="d-flex ms-auto">

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

        <nav class="mb-3">
            <div class="nav nav-tabs" role="tablist">
                <button class="nav-link active" type="button" data-bs-toggle="tab" data-bs-target="#D15B3DA7" role="tab">
                    Services
                </button>
                <button class="nav-link xxxxxx" type="button" data-bs-toggle="tab" data-bs-target="#ADEE8F0A" role="tab">
                    INDI
                </button>
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

                        <div class="card">
                            <div class="card-header d-flex">
                                <span class="me-auto">
                                    INDI
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

                    </div>
                    <div class="col-md-6">

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
                </div>

            </div>

            <!-- *************************************************************************************************** -->
            <!-- VARIABLES                                                                                           -->
            <!-- *************************************************************************************************** -->

            <div class="tab-pane fade xxxx xxxxxx" id="ADEE8F0A" role="tabpanel" tabindex="0">

                <div class="row">
                    <div class="col-md-6">

                        TODO

                    </div>
                    <div class="col-md-6">

                        <indi-variables />

                    </div>
                </div>

            </div>

            <!-- *************************************************************************************************** -->

        </div>

        <!-- ******************************************************************************************************* -->

    </form>

</template>
