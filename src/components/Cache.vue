<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, onMounted} from 'vue';

import {load} from '@tauri-apps/plugin-store';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const dialog = inject('dialog');

/*--------------------------------------------------------------------------------------------------------------------*/

const filenames = ref([]);

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const getFilenames = () => {

    dialog.lock();

    load('nyx-addons-store.json').then((store) => {

        store.keys().then((keys) => {

            filenames.value = keys;

            dialog.success();
            dialog.unlock();

        }).catch((e) => {

            dialog.error(e);
            dialog.unlock();
        });

    }).catch((e) => {

        dialog.error(e);
        dialog.unlock();
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const delFilenames = () => {

    dialog.confirm('Are you sure you want to flush cache and reload?', 'Nyx Dashboard').then((choice) => {

        if(choice)
        {
            dialog.lock();

            load('nyx-addons-store.json').then((store) => {

                filenames.value = [];

                store.clear().then(() => {

                    location.reload();

                }).catch((e) => {

                    dialog.error(e);
                    dialog.unlock();
                });

            }).catch((e) => {

                dialog.error(e);
                dialog.unlock();
            });
        }
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const delFilename = (filename) => {

    dialog.confirm('Are you sure you want to delete this file?', 'Nyx Dashboard').then((choice) => {

        if(choice)
        {
            dialog.lock();

            load('nyx-addons-store.json').then((store) => {

                store.delete(filename).then(() => {

                    filenames.value = filenames.value.filter((x) => x !== filename);

                    dialog.success();
                    dialog.unlock();

                }).catch((e) => {

                    dialog.error(e);
                    dialog.unlock();
                });

            }).catch((e) => {

                dialog.error(e);
                dialog.unlock();
            });
        }
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    getFilenames();
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <table class="table table-sm table-striped">
        <thead>
            <tr>
                <th>Filename</th>
                <th>Tools</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="filename in filenames" :key="filename">
                <td>
                    <a class="btn btn-sm btn-link" :href="filename" target="_blank">
                        {{ filename }}
                    </a>
                </td>
                <td>
                    <button class="btn btn-sm btn-link" type="button" @click="delFilename(filename)">
                        <i class="bi bi-trash2 text-danger"></i>
                    </button>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- *********************************************************************************************************** -->

    <div class="text-end">

        <button class="btn btn-sm btn-outline-primary me-2" type="button" @click="getFilenames">
            <i class="bi bi-recycle"></i> Reload cache
        </button>

        <button class="btn btn-sm btn-outline-danger me-2" type="button" @click="delFilenames">
            <i class="bi bi-trash2"></i> Flush cache
        </button>

    </div>

    <!-- *********************************************************************************************************** -->

</template>
