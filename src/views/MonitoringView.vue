<!--suppress HtmlUnknownTag, JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="h-100 w-100 overflow-y-auto p-3">

        <nyx-monitoring :groups="configStore.globals.monitoringGroups" :metrics="configStore.globals.monitoringMetrics" :refresh-interval="configStore.globals.refreshInterval">

            <button class="btn btn-sm btn-success me-0" type="button" @click="configStore.save">
                <i class="bi bi-check-lg"></i> Save
            </button>

        </nyx-monitoring>

    </div>

    <!-- *********************************************************************************************************** -->

</template>
