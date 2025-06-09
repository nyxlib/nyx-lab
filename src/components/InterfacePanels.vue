<!--suppress HtmlUnknownAttribute, JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watchEffect} from 'vue';

import draggable from 'vuedraggable';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    enabled: {
        type: Boolean,
        required: true,
    },
    interfacePanels: {
        type: Object,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const sortedInterfacePanels = ref([]);

watchEffect(() => {

    sortedInterfacePanels.value = Object.values(props.interfacePanels).sort((a, b) => a.rank - b.rank);
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const onDragEnd = () => {

    for(let i = 0; i < sortedInterfacePanels.value.length; i++)
    {
        const interfacePanel = sortedInterfacePanels.value[i];

        props.interfacePanels[interfacePanel.id].rank = i;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const interfacePanelAppend = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const id = __NYX_UUID__.v4();

    const rank = Date.now();

    props.interfacePanels[id] = {
        id: id,
        rank: rank,
        title: '',
        zombie: false,
        enabled: false,
    };

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const interfacePanelZombie = (interfacePanel) => {

    interfacePanel.zombie = !interfacePanel.zombie;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const interfacePanelEnabled = (interfacePanel) => {

    interfacePanel.enabled = !interfacePanel.enabled;
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="shadow card">
        <div class="card-header px-3 py-2">
            Interface panels
            [
            <button class="btn btn-xs btn-primary me-0" type="button" @click="() => interfacePanelAppend()">
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
                            Title
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

                <draggable tag="tbody" handle=".drag-handle" v-model="sortedInterfacePanels" item-key="id" @end="onDragEnd">
                    <template #item="{element: interfacePanel}">
                        <tr :key="interfacePanel.id">
                            <td class="text-center">
                                <i class="bi bi-list drag-handle" style="cursor: grab;"></i>
                                <button class="btn btn-sm btn-link" type="button" @click="interfacePanelZombie(interfacePanel)">
                                    <i class="bi bi-trash2 text-danger" v-if="!interfacePanel.zombie"></i>
                                    <i class="bi bi-recycle text-primary" v-if="interfacePanel.zombie"></i>
                                </button>
                            </td>
                            <td class="text-start">
                                <input :class="['form-control', 'form-control-sm', {'text-decoration-line-through': interfacePanel.zombie}]" type="text" v-model="interfacePanel.title" />
                            </td>
                            <td class="text-center">
                                <button :class="['btn', 'btn-sm', {'btn-success': !interfacePanel.zombie && interfacePanel.enabled, 'btn-outline-success': !interfacePanel.zombie && !interfacePanel.enabled, 'btn-secondary': interfacePanel.zombie && interfacePanel.enabled, 'btn-outline-secondary': interfacePanel.zombie && !interfacePanel.enabled}]" type="button" @click="interfacePanelEnabled(interfacePanel)">Enabled</button>
                            </td>
                            <td class="text-center">
                                <i :class="['bi', 'bi-circle-fill', 'btn', 'btn-sm', 'btn-text', {'text-success': (enabled && interfacePanel.enabled && interfacePanel.title), 'text-secondary': !(enabled && interfacePanel.enabled && interfacePanel.title)}]"></i>
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
