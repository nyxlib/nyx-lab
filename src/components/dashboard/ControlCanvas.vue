<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, onMounted, onUnmounted} from 'vue';

import {Offcanvas} from 'bootstrap';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    widgets: {
        type: Object,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const canvasEl = ref(null);

let canvasInstance = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const show = () => {

    canvasInstance?.show();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const hide = () => {

    canvasInstance?.hide();
};

/*--------------------------------------------------------------------------------------------------------------------*/

defineExpose({
    show,
    hide,
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    canvasInstance = Offcanvas.getOrCreateInstance(canvasEl.value);
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    canvasInstance = /*----------------*/ null /*----------------*/;
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="offcanvas offcanvas-end" tabindex="-1" ref="canvasEl">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title">
                    <i class="bi bi-list"></i>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">

                <!-- *********************************************************************************************** -->

                <div class="list-group">
                    <template v-for="(widget, index1) in widgets" :key="widget.id">

                        <!-- *************************************************************************************** -->

                        <div class="list-group-item" v-if="['variable', 'stream'].includes(widget.mode)">
                            <div class="ms-1 me-auto">
                                <div class="fw-bold">
                                    {{ widget.title || '/' }}
                                </div>
                                <div class="form-check form-switch" v-for="index2 in widget.variables1.length" :key="index2">
                                    <input class="form-check-input" type="checkbox" :id="`FE664D_${index1}${index2}`" v-model="widget.enabled[widget.variables1[index2 - 1]]">
                                    <label class="form-check-label" :for="`FE664D_${index1}${index2}`">
                                        {{ widget.variables1[index2 - 1] }}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="list-group-item" v-if="['scatter2d'].includes(widget.mode)">
                            <div class="ms-1 me-auto">
                                <div class="fw-bold">
                                    {{ widget.title || '/' }}
                                </div>
                                <div class="form-check form-switch" v-for="index2 in Math.min(widget.variables1.length, widget.variables2.length)" :key="index2">
                                    <input class="form-check-input" type="checkbox" :id="`FE664D_${index1}${index2}`" v-model="widget.enabled[`${widget.variables1[index2 - 1]} / ${widget.variables2[index2 - 1]}`]">
                                    <label class="form-check-label" :for="`FE664D_${index1}${index2}`">
                                        {{ widget.variables1[index2 - 1] }} / {{ widget.variables2[index2 - 1] }}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="list-group-item" v-if="['scatter3d'].includes(widget.mode)">
                            <div class="ms-1 me-auto">
                                <div class="fw-bold">
                                    {{ widget.title || '/' }}
                                </div>
                                <div class="form-check form-switch" v-for="index2 in Math.min(widget.variables1.length, widget.variables2.length, widget.variables3.length)" :key="index2">
                                    <input class="form-check-input" type="checkbox" :id="`FE664D_${index1}${index2}`" v-model="widget.enabled[`${widget.variables1[index2 - 1]} / ${widget.variables2[index2 - 1]} / ${widget.variables3[index2 - 1]}`]">
                                    <label class="form-check-label" :for="`FE664D_${index1}${index2}`">
                                        {{ widget.variables1[index2 - 1] }} / {{ widget.variables2[index2 - 1] }} / {{ widget.variables3[index2 - 1] }}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                    </template>
                </div>

                <!-- *********************************************************************************************** -->

            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>
