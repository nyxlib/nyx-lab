<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {computed} from 'vue';

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

const addons = computed(() => {

    const result = Object.values(props.addons);

    result.sort((x, y) => x.rank - y.rank);

    return result;
});

/*--------------------------------------------------------------------------------------------------------------------*/

let rank = 0;

/*--------------------------------------------------------------------------------------------------------------------*/

const addonAppend = () => {

    const id = uuid.v4();

    props.addons[id] = {
        id: id,
        rank: rank,
        path: '',
        name: '',
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
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="shadow card">
        <div class="card-header px-3 py-2">
            Addons
            [
            <button class="btn btn-xs btn-primary" type="button" @click="addonAppend">
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
                        <th class="text-center" style="width: auto;">
                            Addon name
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
                    <tr v-for="addon in addons">
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
                        <td class="text-start">
                            <input class="form-control form-control-sm" type="text" v-model="addon.name" />
                        </td>
                        <td class="text-center">
                            <input class="btn-check" type="checkbox" role="switch" id="CEA1455E" v-model="addon.enabled" :true-value="true" :false-value="false" /><label class="btn btn-sm btn-outline-success" for="CEA1455E">Enabled</label>
                        </td>
                        <td class="text-center">
                            <i :class="['bi', 'bi-circle-fill', 'btn', 'btn-sm', 'btn-text', {'text-success': addon.enabled && addon.started, 'text-secondary': addon.enabled && !addon.started}]"></i>
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
