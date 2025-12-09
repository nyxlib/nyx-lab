<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watch, computed, reactive, onMounted, onUnmounted} from 'vue';

import Multiselect from '@vueform/multiselect';

import {useNyxStore} from 'vue-nyx';

import {Modal} from 'bootstrap';

/*--------------------------------------------------------------------------------------------------------------------*/

import ControlOption from '@/components/dashboard/ControlOption.vue';

import useConfigStore from '@/stores/config.js';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const MODE_VARIABLE = 'variable';
const MODE_SCATTER = 'scatter';
const MODE_BLOB = 'blob';
const MODE_STREAM = 'stream';
const MODE_COMMAND = 'command';

const MODES = [
    {value: MODE_VARIABLE, label: 'Variable'},
    {value: MODE_SCATTER, label: 'Scatter'},
    {value: MODE_BLOB, label: 'BLOB'},
    {value: MODE_STREAM, label: 'Stream'},
    {value: MODE_COMMAND, label: 'Command'},
];

const SHADOWS = [
    {value: 'shadow-none', label: 'None'},
    {value: 'shadow-sm', label: 'Small'},
    {value: 'shadow', label: 'Regular'},
    {value: 'shadow-lg', label: 'Large'},
];

const CONTROLS = [
    {value: 'auto', label: 'Auto'},
];

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    modelValue: {
        type: Object,
        required: false,
        default: null
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits(['update:modelValue']);

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    id: '',
    mode: MODE_VARIABLE,
    period: 1000,
    control: '',
    shadow: 'shadow',
    title: '',
    panel: '',
    variables1: [],
    variables2: [],
    enabled: {},
    options: {},
});

/*--------------------------------------------------------------------------------------------------------------------*/

watch(
    () => props.modelValue,
    (value) => {
        if(value)
        {
            state.id = value.id ?? null;
            state.mode = value.mode ?? MODE_VARIABLE;
            state.period = value.period ?? 1000;
            state.control = value.control ?? '';
            state.shadow = value.shadow ?? 'shadow';
            state.title = value.title ?? '';
            state.panel = value.panel ?? '';
            state.variables1 = Array.isArray(value.variables1) ? [...value.variables1] : ([]);
            state.variables2 = Array.isArray(value.variables2) ? [...value.variables2] : ([]);
            state.enabled = value.enabled ? {...value.enabled} : {};
            state.options = value.options ? {...value.options} : {};
        }
    },
    {immediate: true, deep: true}
);

/*--------------------------------------------------------------------------------------------------------------------*/

const isValid = computed(() => (
    !!state.mode
    &&
    !!state.panel
    &&
    !!state.title
    &&
    !!state.control
    &&
    (
        (state.mode !== MODE_SCATTER && state.variables1.length > 0 /*--------------------------------------------------*/)
        ||
        (state.mode === MODE_SCATTER && state.variables1.length > 0 && state.variables1.length === state.variables2.length)
    )
));

/*--------------------------------------------------------------------------------------------------------------------*/

const _panels = computed(() => Object.values(configStore.globals.interfacePanels).filter((x) => x.enabled && !x.locked).sort((a, b) => a.rank - b.rank).map((x) => ({
    value: x.id,
    label: x.title,
    locked: x.locked,
})));

/*--------------------------------------------------------------------------------------------------------------------*/

const _controls = computed(() => Object.values(configStore.controls).flatMap((x) => x.ctrls).filter((x) => x.mode === state.mode).map((x) => ({
    value: x.id,
    label: x.title,
})));

/*--------------------------------------------------------------------------------------------------------------------*/

const _options = computed(() => Object.values(configStore.controls).flatMap((x) => x.ctrls).find((x) => x.id === state.control)?.options ?? []);

/*--------------------------------------------------------------------------------------------------------------------*/

const modalEl = ref(null);

let modalInstance = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const show = () => {

    modalInstance?.show();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const hide = () => {

    modalInstance?.hide();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const submit = () => {

    const oldWidget = props.modelValue || {};

    const newWidget = {
        ...state,
        x: oldWidget.x ?? 0,
        y: oldWidget.y ?? 0,
        h: oldWidget.h ?? 1,
        w: oldWidget.w ?? 1,
    };

    emit('update:modelValue', newWidget);

    hide();
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

    modalInstance = Modal.getOrCreateInstance(modalEl.value);
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    modalInstance = /*-------------*/ null /*-------------*/;
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="modal" tabindex="-1" ref="modalEl">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">

                    <!-- ******************************************************************************************* -->

                    <div class="modal-header px-3 py-2">

                        <h5 class="modal-title">
                            <i class="bi bi-pencil"></i>
                            {{ state.id ? 'Edit' : 'New' }} control
                        </h5>

                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>

                    </div>

                    <!-- ******************************************************************************************* -->

                    <form class="modal-body px-3 py-2" id="D1531250" @submit.prevent="submit">

                        <nav-tabs>

                            <!-- *********************************************************************************** -->
                            <!-- Control                                                                             -->
                            <!-- *********************************************************************************** -->

                            <tab-pane title="Control">

                                <!-- ******************************************************************************* -->

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="D38EC0FA">Mode</label>
                                            <multiselect mode="single" :required="true" :can-clear="false" :searchable="true" :create-option="false" :allow-absent="false" :close-on-select="true" :options="MODES" id="D38EC0FA" v-model="state.mode" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="E9549BAB">Period [ms]</label>
                                            <input class="form-control form-control-sm" type="number" min="1" step="1" placeholder="Period" :disabled="state.mode !== MODE_VARIABLE && state.mode !== MODE_SCATTER && state.mode !== MODE_STREAM" :required="true" id="E9549BAB" v-model="state.period" />
                                        </div>
                                    </div>
                                </div>

                                <!-- ******************************************************************************* -->

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="F8E884DD">Control</label>
                                            <multiselect mode="single" :required="true" :can-clear="false" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="state.mode === MODE_COMMAND ? CONTROLS : _controls" id="F8E884DD" v-model="state.control" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="CFF21884">Shadow</label>
                                            <multiselect mode="single" :required="true" :can-clear="false" :searchable="true" :create-option="false" :allow-absent="false" :close-on-select="true" :options="SHADOWS" id="CFF21884" v-model="state.shadow" />
                                        </div>
                                    </div>
                                </div>

                                <!-- ******************************************************************************* -->

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="C8C721F4">Panel</label>
                                            <multiselect mode="single" :required="true" :can-clear="false" :searchable="true" :create-option="false" :close-on-select="true" :options="_panels" id="C8C721F4" v-model="state.panel" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="F938E61B">Title</label>
                                            <input class="form-control form-control-sm" type="text" placeholder="Plot title" id="F938E61B" v-model="state.title" />
                                        </div>
                                    </div>
                                </div>

                                <!-- ******************************************************************************* -->

                                <div class="mb-3" v-if="state.mode === MODE_VARIABLE ">
                                    <label class="form-label" for="BBA0018F">Variable</label>
                                    <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.variableDefs" id="BBA0018F" v-model="state.variables1" />
                                </div>

                                <div class="mb-3" v-if="state.mode === MODE_SCATTER">
                                    <label class="form-label" for="C6F79530">Y variable</label>
                                    <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.variableDefs" id="C6F79530" v-model="state.variables1" />
                                </div>

                                <div class="mb-3" v-if="state.mode === MODE_SCATTER">
                                    <label class="form-label" for="EFE4DF78">X variable</label>
                                    <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.variableDefs" id="EFE4DF78" v-model="state.variables2" />
                                </div>

                                <div class="mb-3" v-if="state.mode === MODE_BLOB">
                                    <label class="form-label" for="D2B9498A">BLOB</label>
                                    <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.blobDefs" id="D2B9498A" v-model="state.variables1" />
                                </div>

                                <div class="mb-3" v-if="state.mode === MODE_STREAM">
                                    <label class="form-label" for="BAFEAE75">Stream</label>
                                    <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.streamDefs" id="BAFEAE75" v-model="state.variables1" />
                                </div>

                                <div class="mb-3" v-if="state.mode === MODE_COMMAND">
                                    <label class="form-label" for="A0FFDC95">Command</label>
                                    <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.vectorDefs" id="A0FFDC95" v-model="state.variables1" />
                                </div>

                                <!-- ******************************************************************************* -->

                            </tab-pane>

                            <!-- *********************************************************************************** -->
                            <!-- OPTIONS                                                                             -->
                            <!-- *********************************************************************************** -->

                            <tab-pane title="Options">

                                <div v-for="(option, index) in _options" :key="index">

                                    <control-option :type="option.type" :name="option.name" :label="option.label" :min="option.min" :max="option.max" :step="option.step" :default-value="option.defaultValue" v-model="state.options[option.name]"></control-option>

                                </div>

                            </tab-pane>

                            <!-- *********************************************************************************** -->

                        </nav-tabs>

                    </form>

                    <!-- ******************************************************************************************* -->

                    <div class="modal-footer px-3 py-1">

                        <button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">
                            <i class="bi bi-x-lg"></i> Cancel
                        </button>

                        <button class="btn btn-success" type="submit" form="D1531250" :disabled="!isValid">
                            <i class="bi bi-check-lg"></i> Add
                        </button>

                    </div>

                    <!-- ******************************************************************************************* -->

                </div>
            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>
