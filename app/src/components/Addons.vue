<!--suppress HtmlUnknownAttribute, JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {computed, onMounted, onUnmounted} from 'vue';

import {listen} from '@tauri-apps/api/event';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    addons: {
        type: Object,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

let rank = 0;

/*--------------------------------------------------------------------------------------------------------------------*/

const addons = computed(() => {

    const result = Object.values(props.addons);

    result.sort((x, y) => x.rank - y.rank);

    return result;
});

/*--------------------------------------------------------------------------------------------------------------------*/

const addonSearch = () => {

    if(typeof window['__TAURI__'] !== 'undefined')
    {
        window['__TAURI__'].webviewWindow.WebviewWindow.getByLabel('addons')?.show();
    }
    else
    {
        window.open('http://localhost:3000/', 'Addon Index', 'width=1200,height=800,menubar=no,location=no,status=no,scrollbars=yes,resizable=yes');
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonAppend = (path = null) => {

    path = (path || '').trim();

    const id = uuid.v4();

    props.addons[id] = {
        id: id,
        rank: rank,
        path: path,
        enabled: false,
        started: false,
    };

    rank++;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonRm = (addon) => {

    delete props.addons[addon.id];
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonDw = (addon1) => {

    const array = addons.value;

    const index = array.findIndex((addon2) => addon2.id === addon1.id);

    if(index > 0x0000000000)
    {
        const addon2 = array[index - 1];

        addon1.rank--;
        addon2.rank++;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonUp = (addon1) => {

    const array = addons.value;

    const index = array.findIndex(addon2 => addon2.id === addon1.id);

    if(index < array.length)
    {
        const addon2 = array[index + 1];

        addon1.rank++;
        addon2.rank--;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const tauriMessageHandler = (e) => addonAppend(e.payload);

const htmlMessageHandler = (e) => addonAppend(e.data);

let unlisten = null;

/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(async () => {

    if(typeof window['__TAURI__'] !== 'undefined')
    {
        unlisten = await listen('new-addon', tauriMessageHandler);
    }
    else
    {
        window.addEventListener('message', htmlMessageHandler);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    if(typeof window['__TAURI__'] !== 'undefined')
    {
        if(unlisten) unlisten(/*- 'new-addon', tauriMessageHandler -*/);
    }
    else
    {
        window.removeEventListener('message', htmlMessageHandler);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="shadow card">
        <div class="card-header px-3 py-2">
            Addons
            [
            <button class="btn btn-xs btn-primary me-1" type="button" @click="() => addonSearch()">
                <i class="bi bi-search"></i>
                Search addons
            </button>
            <button class="btn btn-xs btn-primary me-0" type="button" @click="() => addonAppend()">
                <i class="bi bi-plus-lg"></i>
                Add addon
            </button>
            ]
        </div>
        <div class="card-body px-3 py-2">

            <!-- *************************************************************************************************** -->

            <table class="table table-sm table-striped">

                <!-- *********************************************************************************************** -->

                <thead>
                    <tr>
                        <th class="text-center" style="width: 105px;">
                            Tools
                        </th>
                        <th class="text-center" style="width: auto;">
                            Addon path
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
                    <tr v-for="(addon, idx) in addons" :key="idx">
                        <td class="text-center">
                            <button class="btn btn-sm btn-link" type="button" @click="addonDw(addon)">
                                <i class="bi bi-caret-up-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-link" type="button" @click="addonUp(addon)">
                                <i class="bi bi-caret-down-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-link" type="button" @click="addonRm(addon)">
                                <i class="bi bi-trash2 text-danger"></i>
                            </button>
                        </td>
                        <td class="text-start">
                            <input class="form-control form-control-sm" type="text" v-model="addon.path" />
                        </td>
                        <td class="text-center">
                            <input class="btn-check" type="checkbox" role="switch" :id="`CEA1455E_${idx}`" v-model="addon.enabled" :true-value="true" :false-value="false" /><label class="btn btn-sm btn-outline-success" :for="`CEA1455E_${idx}`">Enabled</label>
                        </td>
                        <td class="text-center">
                            <i :class="['bi', 'bi-circle-fill', 'btn', 'btn-sm', 'btn-text', {'text-success': addon.started, 'text-secondary': !addon.started}]"></i>
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
