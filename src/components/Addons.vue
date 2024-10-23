<!--suppress HtmlUnknownAttribute, JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject, computed, onMounted, onUnmounted} from 'vue';

import {load} from '@tauri-apps/plugin-store';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const dialog = inject('dialog');

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    addons: {
        type: Object,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const addons = computed(() => {

    const result = Object.values(props.addons);

    result.sort((x, y) => x.rank - y.rank);

    return result;
});

/*--------------------------------------------------------------------------------------------------------------------*/

let rank = 0;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const addonAppend = (url = null) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    url = (url || '').trim();

    /*----------------------------------------------------------------------------------------------------------------*/

    const found = Object.values(props.addons).some((addon) => addon.url === url);

    /*----------------------------------------------------------------------------------------------------------------*/

    if(!found)
    {
        const id = __NYX_UUID__.v4();

        props.addons[id] = {
            id: id,
            rank: rank,
            url: url,
            zombie: false,
            enabled: !!url,
            started: false,
        };

        rank++;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonSearch = () => {

    __NYX_BOOTSTRAP__.Modal.getOrCreateInstance(document.getElementById('B9674BB2')).show();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonClear = () => {

    dialog.confirm('Are you sure you want to re-download the installed addons?', 'Nyx Dashboard').then((choice) => {

        if(choice)
        {
            load('nyx-addons-store.json').then((store) => {

                store.clear();
            });
        }
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonZombie = (addon) => {

    addon.zombie = !addon.zombie;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonEnabled = (addon) => {

    addon.enabled = !addon.enabled;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonDw = (addon1) => {

    const array = addons.value;

    const index = array.findIndex((addon2) => addon2.id === addon1.id);

    if(index > 0x00000000000000)
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

    if(index < array.length - 1)
    {
        const addon2 = array[index + 1];

        addon1.rank++;
        addon2.rank--;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

const htmlMessageHandler = (e) => addonAppend(e.data);

/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(async () => {

    window.addEventListener('message', htmlMessageHandler);
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    window.removeEventListener('message', htmlMessageHandler);
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="shadow card">
        <div class="card-header px-3 py-2">
            Addons
            [
            <button class="btn btn-xs btn-primary me-1" type="button" @click="() => addonAppend()">
                <i class="bi bi-plus-lg"></i>
                Add
            </button>
            <button class="btn btn-xs btn-primary me-1" type="button" @click="() => addonSearch()">
                <i class="bi bi-search"></i>
                Search
            </button>
            <button class="btn btn-xs btn-warning me-0" type="button" @click="() => addonClear()">
                <i class="bi bi-eraser"></i>
                Clear cache
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
                            URL
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
                            <button class="btn btn-sm btn-link" type="button" @click="addonZombie(addon)">
                                <i class="bi bi-trash2 text-danger" v-if="!addon.zombie"></i>
                                <i class="bi bi-recycle text-primary" v-if="addon.zombie"></i>
                            </button>
                        </td>
                        <td class="text-start">
                            <input :class="['form-control', 'form-control-sm', {'text-decoration-line-through': addon.zombie}]" type="text" v-model="addon.url" />
                        </td>
                        <td class="text-center">
                            <button :class="['btn', 'btn-sm', {'btn-success': !addon.zombie && addon.enabled, 'btn-outline-success': !addon.zombie && !addon.enabled, 'btn-secondary': addon.zombie && addon.enabled, 'btn-outline-secondary': addon.zombie && !addon.enabled}]" type="button" @click="addonEnabled(addon)">Enabled</button>
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
