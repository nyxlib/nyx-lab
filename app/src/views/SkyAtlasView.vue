<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { reactive } from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import Splitter from '../components/Splitter.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    objects: [],
    objectName: '',
    observationDate: new Date().toISOString().split('T')[0],
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const update = () => {

};

/*--------------------------------------------------------------------------------------------------------------------*/

const resize = () => {

};

/*--------------------------------------------------------------------------------------------------------------------*/

const search = () => {

};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <splitter :sizes="[30, 70]" @resize="resize">

        <!-- ******************************************************************************************************* -->

        <template v-slot:left>

            <div class="p-3">

                <!-- *********************************************************************************************** -->

                <div class="card mb-3">
                    <div class="card-header">
                        Sky atlas
                    </div>
                    <div class="card-body">

                        <div class="mb-3">
                            <label class="form-label" for="A9856A65">Object name</label>
                            <input class="form-control form-control-sm" type="text" id="A9856A65" placeholder="Messier or NGC name" v-model="state.objectName" @keyup.enter="search()" />
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="D130FEEF">Observation date</label>
                            <input class="form-control form-control-sm" type="date" id="D130FEEF" placeholder="Observation date" v-model="state.observationDate" @change="update()" />
                        </div>

                        <div class="mb-0">
                            <button class="btn btn-sm btn-primary w-100" type="button" @click="search()">
                                Search
                            </button>
                        </div>

                    </div>
                </div>

                <!-- *********************************************************************************************** -->

                <div class="mb-3">

                    <canvas class="w-100" ref="position"></canvas>

                </div>

                <!-- *********************************************************************************************** -->

                <div>
                    <ul>
                        <li>NGC/IC catalogs: <a href="https://github.com/mattiaverga/OpenNGC/" target="_blank">OpenNCG</a></li>
                        <li>Sky map rendering: <a href="https://aladin.cds.unistra.fr/#AladinLite" target="_blank">Aladin Lite</a></li>
                    </ul>
                </div>

                <!-- *********************************************************************************************** -->

            </div>

        </template>

        <!-- ******************************************************************************************************* -->

        <template v-slot:right>

            <div class="p-3">

                TODO

            </div>

        </template>

        <!-- ******************************************************************************************************* -->

    </splitter>

</template>
