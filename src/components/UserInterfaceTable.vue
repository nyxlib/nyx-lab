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
    userInterfaces: {
        type: Object,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const sortedInterfacePanels = ref([]);

watchEffect(() => {

    sortedInterfacePanels.value = Object.values(props.userInterfaces).sort((a, b) => a.rank - b.rank);
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const onDragEnd = () => {

    for(let i = 0; i < sortedInterfacePanels.value.length; i++)
    {
        const userInterface = sortedInterfacePanels.value[i];

        props.userInterfaces[userInterface.id].rank = i;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const userInterfaceAppend = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const id = __NYX_UUID__.v4();

    const rank = Date.now();

    props.userInterfaces[id] = {
        id: id,
        rank: rank,
        title: '',
        zombie: false,
        locked: false,
        enabled: false,
    };

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const userInterfaceZombie = (userInterface) => {

    userInterface.zombie = !userInterface.zombie;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const userInterfaceLocked= (userInterface) => {

    userInterface.locked = !userInterface.locked;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const userInterfaceEnabled = (userInterface) => {

    userInterface.enabled = !userInterface.enabled;
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="shadow card">
        <div class="card-header px-3 py-2">
            User interfaces
            [
            <button class="btn btn-xs btn-primary me-0" type="button" @click="() => userInterfaceAppend()">
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
                            Locked
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

                <draggable tag="tbody" handle=".drag-handle" item-key="id" v-model="sortedInterfacePanels" @end="onDragEnd">
                    <template #item="{element: userInterface}">
                        <tr :key="userInterface.id">
                            <td class="text-center">
                                <i class="bi bi-list drag-handle" style="cursor: grab;"></i>
                                <button class="btn btn-sm btn-link" type="button" @click="userInterfaceZombie(userInterface)">
                                    <i class="bi bi-trash2 text-danger" v-if="!userInterface.zombie"></i>
                                    <i class="bi bi-recycle text-primary" v-if="userInterface.zombie"></i>
                                </button>
                            </td>
                            <td class="text-start">
                                <input :class="['form-control', 'form-control-sm', {'text-decoration-line-through': userInterface.zombie}]" type="text" v-model="userInterface.title" />
                            </td>
                            <td class="text-center">
                                <button :class="['btn', 'btn-sm', {'btn-warning': !userInterface.zombie && userInterface.locked, 'btn-outline-warning': !userInterface.zombie && !userInterface.locked, 'btn-secondary': userInterface.zombie && userInterface.locked, 'btn-outline-secondary': userInterface.zombie && !userInterface.locked}]" type="button" @click="userInterfaceLocked(userInterface)">Locked</button>
                            </td>
                            <td class="text-center">
                                <button :class="['btn', 'btn-sm', {'btn-success': !userInterface.zombie && userInterface.enabled, 'btn-outline-success': !userInterface.zombie && !userInterface.enabled, 'btn-secondary': userInterface.zombie && userInterface.enabled, 'btn-outline-secondary': userInterface.zombie && !userInterface.enabled}]" type="button" @click="userInterfaceEnabled(userInterface)">Enabled</button>
                            </td>
                            <td class="text-center">
                                <i :class="['bi', 'bi-circle-fill', 'btn', 'btn-sm', 'btn-text', {'text-success': (enabled && userInterface.enabled && userInterface.title), 'text-secondary': !(enabled && userInterface.enabled && userInterface.title)}]"></i>
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
