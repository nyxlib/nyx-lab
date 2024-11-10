<!--suppress HtmlUnknownAttribute, JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {computed} from 'vue';

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

const webPages = computed(() => Object.values(props.webPages).sort((x, y) => x.rank - y.rank));

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const webPageAppend = (url = null) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    url = (url || '').trim();

    /*----------------------------------------------------------------------------------------------------------------*/

    const found = Object.values(props.webPages).some((webPage) => webPage.url === url);

    /*----------------------------------------------------------------------------------------------------------------*/

    if(!found)
    {
        const id = __NYX_UUID__.v4();

        const rank = Date.now();

        props.webPages[id] = {
            id: id,
            rank: rank,
            url: url,
            icon: 'question',
            zombie: false,
            enabled: !!url,
        };
    }

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

const webPageDw = (webPage1) => {

    const array = webPages.value;

    const index = array.findIndex((webPage2) => webPage2.id === webPage1.id);

    if(index > 0x00000000000000)
    {
        const webPage2 = array[index - 1];

        const old = webPage2.rank;
        webPage2.rank = webPage1.rank;
        webPage1.rank = old;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const webPageUp = (webPage1) => {

    const array = webPages.value;

    const index = array.findIndex((webPage2) => webPage2.id === webPage1.id);

    if(index < array.length - 1)
    {
        const webPage2 = array[index + 1];

        const old = webPage2.rank;
        webPage2.rank = webPage1.rank;
        webPage1.rank = old;
    }
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

                <tbody>
                    <tr v-for="webPage in webPages" :key="webPage.id">
                        <td class="text-center">
                            <button class="btn btn-sm btn-link" type="button" @click="webPageDw(webPage)">
                                <i class="bi bi-caret-up-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-link" type="button" @click="webPageUp(webPage)">
                                <i class="bi bi-caret-down-fill"></i>
                            </button>
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
                </tbody>

                <!-- *********************************************************************************************** -->

            </table>

            <!-- *************************************************************************************************** -->

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
