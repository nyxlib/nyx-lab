<!--suppress HtmlUnknownAttribute, JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watch, inject, onMounted, onBeforeUnmount} from 'vue';

import Multiselect from '@vueform/multiselect';

import draggable from 'vuedraggable';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import ConsoleModal from '@/components/config/ConsoleModal.vue';

import icons from '@/assets/icons.json';

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
    console: {
        type: Array,
        required: true,
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits(['search']);

/*--------------------------------------------------------------------------------------------------------------------*/

const sortedAddons = ref([]);
const modalEl = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/
/* WATCHERS                                                                                                           */
/*--------------------------------------------------------------------------------------------------------------------*/

watch(() => props.addons, () => {

    sortedAddons.value = Object.values(props.addons).filter((addon) => addon.id !== '94300404-2ea8-11f1-b3cc-83604f9dfd78').sort((a, b) => a.rank - b.rank);

}, {immediate: true, deep: true});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const onDragEnd = () => {

    for(let i = 0; i < sortedAddons.value.length; i++)
    {
        const addon = sortedAddons.value[i];

        props.addons[addon.id].rank = i;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonAppend = (url = null) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    url = (url || '').trim();

    /*----------------------------------------------------------------------------------------------------------------*/

    const found = Object.values(props.addons).some((addon) => addon.url === url);

    /*----------------------------------------------------------------------------------------------------------------*/

    if(!found)
    {
        const id = uuid.v4();

        const rank = Date.now();

        props.addons[id] = {
            id: id,
            rank: rank,
            type: 'addon',
            url: url,
            zombie: false,
            enabled: !!url,
            started: false,
        };

        if(url) {
            dialog.success(`Addon "${url}" successfully installed!`);
        }
    }
    else
    {
        if(url) {
            dialog.warning(`Addon "${url}" already installed!`);
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const pageAppend = (url = null) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    url = (url || '').trim();

    /*----------------------------------------------------------------------------------------------------------------*/

    const found = Object.values(props.addons).some((addon) => addon.url === url);

    /*----------------------------------------------------------------------------------------------------------------*/

    if(!found)
    {
        const id = uuid.v4();

        const rank = Date.now();

        props.addons[id] = {
            id: id,
            rank: rank,
            type: 'page',
            url: '',
            title: '?',
            icon: 'bi-question',
            zombie: false,
            enabled: false,
        };

        if(url) {
            dialog.success(`Addon "${url}" successfully installed!`);
        }
    }
    else
    {
        if(url) {
            dialog.warning(`Addon "${url}" already installed!`);
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addonSearch = () => {

    emit('search');
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

const showConsole = () => {

    modalEl.value.show();
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

const htmlMessageHandler = (e) => {

    if(Object.prototype.toString.call(e.data) === '[object String]' && e.data.startsWith('addon://'))
    {
        addonAppend(e.data);
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    window.addEventListener('message', htmlMessageHandler);
});

/*--------------------------------------------------------------------------------------------------------------------*/

onBeforeUnmount(() => {

    window.removeEventListener('message', htmlMessageHandler);
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="card">
        <div class="card-header px-3 py-2">
            Addons
            [
            <button class="btn btn-xs btn-primary me-1" type="button" @click="addonAppend()">
                <i class="bi bi-plus-lg"></i>
                Add addon
            </button>
            <button class="btn btn-xs btn-primary me-1" type="button" @click="pageAppend()">
                <i class="bi bi-plus-lg"></i>
                Add page
            </button>
            <button class="btn btn-xs btn-primary me-1" type="button" @click="addonSearch()">
                <i class="bi bi-search"></i>
                Search
            </button>
            <button class="btn btn-xs btn-primary me-0" type="button" @click="showConsole()">
                <i class="bi bi bi-card-text"></i>
                Console
            </button>
            ]
        </div>
        <div class="card-body px-3 py-2">

            <!-- *************************************************************************************************** -->

            <div class="table-responsive">
                <table class="table table-sm table-striped">

                    <!-- ******************************************************************************************* -->

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

                    <!-- ******************************************************************************************* -->

                    <draggable tag="tbody" handle=".drag-handle" item-key="id" v-model="sortedAddons" @end="onDragEnd">
                        <template #item="{element: addon}">
                            <tr :key="addon.id">
                                <td class="text-center">
                                    <i class="bi bi-list drag-handle" style="cursor: grab;"></i>
                                    <button class="btn btn-sm btn-link" type="button" @click="addonZombie(addon)">
                                        <i class="bi bi-trash2 text-danger" v-if="!addon.zombie"></i>
                                        <i class="bi bi-recycle text-primary" v-if="addon.zombie"></i>
                                    </button>
                                </td>
                                <td class="text-start">
                                    <input :class="['form-control', 'form-control-sm', {'text-decoration-line-through': addon.zombie}]" type="text" :disabled="addon.type === 'other'" v-model="addon.url" />
                                </td>
                                <td class="text-start">
                                    <input :class="['form-control', 'form-control-sm', {'text-decoration-line-through': addon.zombie}]" type="text" :disabled="addon.type === 'addon'" v-model="addon.title" />
                                </td>
                                <td class="text-start">
                                    <multiselect :options="Object.keys(icons)" :searchable="true" :limit="100" append-to="body" :disabled="addon.type === 'addon'" v-model="addon.icon"></multiselect>
                                </td>
                                <td class="text-center">
                                    <button :class="['btn', 'btn-sm', {'btn-success': !addon.zombie && addon.enabled, 'btn-outline-success': !addon.zombie && !addon.enabled, 'btn-secondary': addon.zombie && addon.enabled, 'btn-outline-secondary': addon.zombie && !addon.enabled}]" type="button" @click="addonEnabled(addon)">Enabled</button>
                                </td>
                                <td class="text-center">
                                    <i :class="['bi', 'bi-circle-fill', 'btn', 'btn-sm', 'btn-text', {'text-success': (addon.type === 'addon' && addon.started) || (addon.type === 'page' && addon.enabled && addon.url), 'text-secondary': !((addon.type === 'addon' && addon.started) || (addon.type === 'page' && addon.enabled && addon.url))}]"></i>
                                </td>
                            </tr>
                        </template>
                    </draggable>

                    <!-- ******************************************************************************************* -->

                </table>
            </div>

            <!-- *************************************************************************************************** -->

            <console-modal :lines="console" ref="modalEl" />

            <!-- *************************************************************************************************** -->

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
