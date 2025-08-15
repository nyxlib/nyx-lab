<!--suppress HtmlUnknownAttribute, JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watchEffect} from 'vue';

import draggable from 'vuedraggable';

import icons from '../assets/icons.json';

import Multiselect from '@vueform/multiselect';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    webPages: {
        type: Object,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const sortedWebPages = ref([]);

watchEffect(() => {

    sortedWebPages.value = Object.values(props.webPages).sort((a, b) => a.rank - b.rank);
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const onDragEnd = () => {

    for(let i = 0; i < sortedWebPages.value.length; i++)
    {
        const webPage = sortedWebPages.value[i];

        props.webPages[webPage.id].rank = i;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const webPageAppend = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const id = __NYX_UUID__.v4();

    const rank = Date.now();

    props.webPages[id] = {
        id: id,
        rank: rank,
        url: '',
        title: '?',
        icon: 'bi-question',
        zombie: false,
        enabled: false,
    };

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const webPageZombie = (webPage) => {

    webPage.zombie = !webPage.zombie;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const webPageEnabled = (webPage) => {

    webPage.enabled = !webPage.enabled;
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="shadow card">
        <div class="card-header px-3 py-2">
            Web pages
            [
            <button class="btn btn-xs btn-primary me-0" type="button" @click="() => webPageAppend()">
                <i class="bi bi-plus-lg"></i>
                Add
            </button>
            ]
        </div>
        <div class="card-body px-3 py-2">

            <!-- *************************************************************************************************** -->

            <table class="table table-sm table-striped">

                <!-- *********************************************************************************************** -->

                <thead>
                    <tr>
                        <th class="text-center" style="width: 110px;">
                            Tools
                        </th>
                        <th class="text-center" style="width: auto;">
                            URL
                        </th>
                        <th class="text-center" style="width: auto;">
                            Title
                        </th>
                        <th class="text-center" style="width: 200px;">
                            Icon
                        </th>
                        <th class="text-center" style="width: 105px;">
                            Enabled
                        </th>
                        <th class="text-center" style="width: 060px;">
                            Status
                        </th>
                    </tr>
                </thead>

                <!-- *********************************************************************************************** -->

                <draggable tag="tbody" handle=".drag-handle" item-key="id" v-model="sortedWebPages" @end="onDragEnd">
                    <template #item="{element: webPage}">
                        <tr :key="webPage.id">
                            <td class="text-center">
                                <i class="bi bi-list drag-handle" style="cursor: grab;"></i>
                                <button class="btn btn-sm btn-link" type="button" @click="webPageZombie(webPage)">
                                    <i class="bi bi-trash2 text-danger" v-if="!webPage.zombie"></i>
                                    <i class="bi bi-recycle text-primary" v-if="webPage.zombie"></i>
                                </button>
                            </td>
                            <td class="text-start">
                                <input :class="['form-control', 'form-control-sm', {'text-decoration-line-through': webPage.zombie}]" type="text" v-model="webPage.url" />
                            </td>
                            <td class="text-start">
                                <input :class="['form-control', 'form-control-sm', {'text-decoration-line-through': webPage.zombie}]" type="text" v-model="webPage.title" />
                            </td>
                            <td class="text-start">
                                <multiselect :options="Object.keys(icons)" :searchable="true" :limit="100" v-model="webPage.icon"></multiselect>
                            </td>
                            <td class="text-center">
                                <button :class="['btn', 'btn-sm', {'btn-success': !webPage.zombie && webPage.enabled, 'btn-outline-success': !webPage.zombie && !webPage.enabled, 'btn-secondary': webPage.zombie && webPage.enabled, 'btn-outline-secondary': webPage.zombie && !webPage.enabled}]" type="button" @click="webPageEnabled(webPage)">Enabled</button>
                            </td>
                            <td class="text-center">
                                <i :class="['bi', 'bi-circle-fill', 'btn', 'btn-sm', 'btn-text', {'text-success': (webPage.enabled && webPage.url), 'text-secondary': !(webPage.enabled && webPage.url)}]"></i>
                            </td>
                        </tr>
                    </template>
                </draggable>

                <!-- *********************************************************************************************** -->

            </table>

            <!-- *************************************************************************************************** -->

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
