<!--suppress HtmlUnknownAttribute, JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, watchEffect, onMounted, onUnmounted} from 'vue';

import draggable from 'vuedraggable';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    addons: {
        type: Object,
        required: true,
    },
    console: {
        type: Object,
        required: true,
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

const sortedAddons = ref([]);

watchEffect(() => {

    sortedAddons.value = Object.values(props.addons).sort((a, b) => a.rank - b.rank);
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits(['search']);

/*--------------------------------------------------------------------------------------------------------------------*/

const dialog = inject('dialog');

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

    __NYX_BOOTSTRAP__.Modal.getOrCreateInstance(document.getElementById('AB1BC33A')).show();
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
    <!-- TABLE                                                                                                       -->
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
            <button class="btn btn-xs btn-primary me-0" type="button" @click="() => showConsole()">
                <i class="bi bi-terminal"></i>
                Console
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
                                <input :class="['form-control', 'form-control-sm', {'text-decoration-line-through': addon.zombie}]" type="text" v-model="addon.url" />
                            </td>
                            <td class="text-center">
                                <button :class="['btn', 'btn-sm', {'btn-success': !addon.zombie && addon.enabled, 'btn-outline-success': !addon.zombie && !addon.enabled, 'btn-secondary': addon.zombie && addon.enabled, 'btn-outline-secondary': addon.zombie && !addon.enabled}]" type="button" @click="addonEnabled(addon)">Enabled</button>
                            </td>
                            <td class="text-center">
                                <i :class="['bi', 'bi-circle-fill', 'btn', 'btn-sm', 'btn-text', {'text-success': addon.started, 'text-secondary': !addon.started}]"></i>
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
    <!-- MODAL                                                                                                       -->
    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <!-- ******************************************************************************************************* -->

        <div class="modal" tabindex="-1" id="AB1BC33A">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">

                    <!-- ******************************************************************************************* -->

                    <div class="modal-header px-3 py-2">

                        <span>Addon console</span>

                        <button class="btn-close" type="button" data-bs-dismiss="modal"></button>

                    </div>

                    <!-- ******************************************************************************************* -->

                    <div class="modal-body px-3 py-2">

                        <pre class="font-monospace"><code v-for="line in console" :key="line">{{ `${line.trim()}\n` }}</code></pre>

                    </div>

                    <!-- ******************************************************************************************* -->

                </div>
            </div>
        </div>

        <!-- ******************************************************************************************************* -->

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>
