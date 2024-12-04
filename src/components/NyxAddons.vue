<!--suppress HtmlUnknownAttribute, JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject, computed, onMounted, onUnmounted} from 'vue';

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

const addons = computed(() => Object.values(props.addons).sort((x, y) => x.rank - y.rank));

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

        const rank = Date.now();

        props.addons[id] = {
            id: id,
            rank: rank,
            url: url,
            zombie: false,
            enabled: !!url,
            started: false,
        };
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonSearch = () => {

    __NYX_BOOTSTRAP__.Modal.getOrCreateInstance(document.getElementById('B9674BB2')).show();
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

        const old = addon2.rank;
        addon2.rank = addon1.rank;
        addon1.rank = old;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonUp = (addon1) => {

    const array = addons.value;

    const index = array.findIndex((addon2) => addon2.id === addon1.id);

    if(index < array.length - 1)
    {
        const addon2 = array[index + 1];

        const old = addon2.rank;
        addon2.rank = addon1.rank;
        addon1.rank = old;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

const htmlMessageHandler = (e) => addonAppend(e.data);

/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

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
            <button class="btn btn-xs btn-primary me-0" type="button" @click="() => addonSearch()">
                <i class="bi bi-search"></i>
                Search
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
                    <tr v-for="addon in addons" :key="addon.id">
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
