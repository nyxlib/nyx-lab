<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watchEffect} from 'vue';

import draggable from 'vuedraggable';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config.js';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    enabled: {
        type: Boolean,
        required: true,
    },
    userDashboards: {
        type: Object,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const sortedInterfacePanels = ref([]);

watchEffect(() => {

    sortedInterfacePanels.value = Object.values(props.userDashboards).sort((a, b) => a.rank - b.rank);
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const onDragEnd = () => {

    for(let i = 0; i < sortedInterfacePanels.value.length; i++)
    {
        const userDashboard = sortedInterfacePanels.value[i];

        props.userDashboards[userDashboard.id].rank = i;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const userDashboardAppend = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const id = __NYX_UUID__.v4();

    const rank = Date.now();

    props.userDashboards[id] = {
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

const userDashboardZombie = (userDashboard) => {

    userDashboard.zombie = !userDashboard.zombie;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const userDashboardLocked= (userDashboard) => {

    userDashboard.locked = !userDashboard.locked;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const userDashboardEnabled = (userDashboard) => {

    userDashboard.enabled = !userDashboard.enabled;
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="shadow card">
        <div class="d-flex card-header justify-content-between">
            <div>
                <i class="bi bi-grid-1x2"></i> Dashboards
                [
                    <button class="btn btn-xs btn-primary me-0" type="button" @click="() => userDashboardAppend()">
                        <i class="bi bi-plus-lg"></i>
                        Add dashboard
                    </button>
                ]
            </div>
            <div>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="A925CE04" v-model="configStore.globals.showNyxInterfaces">
                    <label class="form-check-label" for="A925CE04">Show Nyx interfaces</label>
                </div>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="A925CE04" v-model="configStore.globals.showUserInterfaces">
                    <label class="form-check-label" for="A925CE04">Show user dashboards</label>
                </div>
            </div>
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
                    <template #item="{element: userDashboard}">
                        <tr :key="userDashboard.id">
                            <td class="text-center">
                                <i class="bi bi-list drag-handle" style="cursor: grab;"></i>
                                <button class="btn btn-sm btn-link" type="button" @click="userDashboardZombie(userDashboard)">
                                    <i class="bi bi-trash2 text-danger" v-if="!userDashboard.zombie"></i>
                                    <i class="bi bi-recycle text-primary" v-if="userDashboard.zombie"></i>
                                </button>
                            </td>
                            <td class="text-start">
                                <input :class="['form-control', 'form-control-sm', {'text-decoration-line-through': userDashboard.zombie}]" type="text" v-model="userDashboard.title" />
                            </td>
                            <td class="text-center">
                                <button :class="['btn', 'btn-sm', {'btn-warning': !userDashboard.zombie && userDashboard.locked, 'btn-outline-warning': !userDashboard.zombie && !userDashboard.locked, 'btn-secondary': userDashboard.zombie && userDashboard.locked, 'btn-outline-secondary': userDashboard.zombie && !userDashboard.locked}]" type="button" @click="userDashboardLocked(userDashboard)">Locked</button>
                            </td>
                            <td class="text-center">
                                <button :class="['btn', 'btn-sm', {'btn-success': !userDashboard.zombie && userDashboard.enabled, 'btn-outline-success': !userDashboard.zombie && !userDashboard.enabled, 'btn-secondary': userDashboard.zombie && userDashboard.enabled, 'btn-outline-secondary': userDashboard.zombie && !userDashboard.enabled}]" type="button" @click="userDashboardEnabled(userDashboard)">Enabled</button>
                            </td>
                            <td class="text-center">
                                <i :class="['bi', 'bi-circle-fill', 'btn', 'btn-sm', 'btn-text', {'text-success': (enabled && userDashboard.enabled && userDashboard.title), 'text-secondary': !(enabled && userDashboard.enabled && userDashboard.title)}]"></i>
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
