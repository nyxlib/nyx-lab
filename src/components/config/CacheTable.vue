<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, computed, onMounted} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import getRuntime from '@/runtime';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const UNITS = ['B', 'kB', 'MB', 'GB', 'TB'];

/*--------------------------------------------------------------------------------------------------------------------*/

const dialog = inject('dialog');

/*--------------------------------------------------------------------------------------------------------------------*/

const runtime = getRuntime();

/*--------------------------------------------------------------------------------------------------------------------*/

const filenames = ref([]);
const filter = ref('');

/*--------------------------------------------------------------------------------------------------------------------*/
/* COMPUTED                                                                                                           */
/*--------------------------------------------------------------------------------------------------------------------*/

const filteredFilenames = computed(() => {

    const f = filter.value.trim().toLowerCase();

    return f ? filenames.value.filter((filename) => filename.path.toLowerCase().includes(f)) : filenames.value;
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const formatSize = (bytes) => {

    const i = Math.min(
        UNITS.length - 1,
        Math.floor(Math.log(bytes || 1) / Math.log(1024))
    );

    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${UNITS[i]}`;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const getFilenames = () => {

    dialog.lock();

    runtime.listCachedFiles().then((files) => {

        filenames.value = files;

        dialog.success();
        dialog.unlock();

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

            runtime.deleteCachedFiles().then(() => {

                filenames.value = [];

                location.reload();

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

            runtime.deleteCachedFile(filename).then(() => {

                filenames.value = filenames.value.filter((x) => x.path !== filename);

                dialog.success();
                dialog.unlock();

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

    <div class="card">
        <div class="card-header px-3 py-2">
            Cache
            [
            <button class="btn btn-xs btn-primary me-1" type="button" @click="getFilenames()">
                <i class="bi bi-recycle"></i>
                Reload cache
            </button>
            <button class="btn btn-xs btn-danger me-0" type="button" @click="delFilenames()">
                <i class="bi bi-trash2"></i>
                Flush cache
            </button>
            ]
        </div>
        <div class="card-body px-3 py-2">

            <!-- *************************************************************************************************** -->

            <div class="input-group mb-2">
                <span class="input-group-text">
                    <i class="bi bi-funnel"></i>
                    Filter
                </span>
                <input class="form-control" type="text" v-model="filter" />
            </div>

            <!-- *************************************************************************************************** -->

            <div class="table-responsive">
                <table class="table table-sm table-striped">
                    <thead>
                    <tr>
                        <th>Filename</th>
                        <th>Size</th>
                        <th>Tools</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="filename in filteredFilenames" :key="filename.path">
                        <td>
                            <a class="btn btn-sm btn-link" :href="`https://addons.nyxlib.org/repo${filename.path}`" target="_blank">
                                addon:/{{ filename.path }}
                            </a>
                        </td>
                        <td>
                            <a class="btn btn-sm btn-link" :href="`https://addons.nyxlib.org/repo${filename.path}`" target="_blank">
                                {{ formatSize(filename.size) }}
                            </a>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-link" type="button" @click="delFilename(filename.path)">
                                <i class="bi bi-trash2 text-danger"></i>
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <!-- *************************************************************************************************** -->

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
