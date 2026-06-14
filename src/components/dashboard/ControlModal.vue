<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watch, computed, reactive, onMounted, onBeforeUnmount} from 'vue';

import Multiselect from '@vueform/multiselect';

import {useNyxStore} from 'vue-nyx';

import {Modal} from 'bootstrap';

/*--------------------------------------------------------------------------------------------------------------------*/

import ControlOption from '@/components/dashboard/ControlOption.vue';

import useConfigStore from '@/stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/
/* CONSTANTS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const MODE_VARIABLE = 'variable';
const MODE_SCATTER_2D = 'scatter2d';
const MODE_SCATTER_3D = 'scatter3d';
const MODE_BLOB = 'blob';
const MODE_STREAM = 'stream';
const MODE_COMMAND = 'command';
const MODE_OTHER = 'other';

const MODES = [
    {value: MODE_VARIABLE, label: 'Variable'},
    {value: MODE_SCATTER_2D, label: 'Scatter 2D'},
    {value: MODE_SCATTER_3D, label: 'Scatter 3D'},
    {value: MODE_BLOB, label: 'BLOB'},
    {value: MODE_STREAM, label: 'Stream'},
    {value: MODE_COMMAND, label: 'Command'},
    {value: MODE_OTHER, label: 'Other'},
];

/*--------------------------------------------------------------------------------------------------------------------*/

const COMMAND_ALIGN_TRUE = true;
const COMMAND_ALIGN_FALSE = false;

const COMMAND_ALIGN = [
    {value: COMMAND_ALIGN_TRUE, label: 'True'},
    {value: COMMAND_ALIGN_FALSE, label: 'False'},
];

/*--------------------------------------------------------------------------------------------------------------------*/

const COMMAND_DIRECTION_COL = 'col';
const COMMAND_DIRECTION_ROW = 'row';

const COMMAND_DIRECTION = [
    {value: COMMAND_DIRECTION_COL, label: 'Column'},
    {value: COMMAND_DIRECTION_ROW, label: /**/'Row'/**/},
];

/*--------------------------------------------------------------------------------------------------------------------*/

const COMMAND_SHOW_STATUS_TRUE = true;
const COMMAND_SHOW_STATUS_FALSE = false;

const COMMAND_SHOW_STATUS = [
    {value: COMMAND_SHOW_STATUS_TRUE, label: 'True'},
    {value: COMMAND_SHOW_STATUS_FALSE, label: 'False'},
];

/*--------------------------------------------------------------------------------------------------------------------*/

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

const DEFAULTS = Object.freeze({
    id: null,
    mode: MODE_VARIABLE,
    commandAlign: COMMAND_ALIGN_TRUE,
    commandDirection: COMMAND_DIRECTION_COL,
    commandShowStatus: COMMAND_SHOW_STATUS_TRUE,
    maxPoints: 1000,
    control: '',
    shadow: 'shadow-sm',
    title: '',
    panel: '',
    title1: '',
    title2: '',
    title3: '',
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    widgetId: {
        type: String,
        required: false,
        default: null
    },
    modelValue: {
        type: Object,
        required: false,
        default: null
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits(['created', 'update:modelValue']);

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    ...DEFAULTS,
    variables1: [],
    variables2: [],
    variables3: [],
    enabled: {},
    options: {},
});

/*--------------------------------------------------------------------------------------------------------------------*/

const modalEl = ref(null);

let modalInstance = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* COMPUTED                                                                                                           */
/*--------------------------------------------------------------------------------------------------------------------*/

const isValid = computed(() => (
    !!state.mode
    &&
    !!state.panel
    &&
    !!state.control
    &&
    (
        (state.mode !== MODE_SCATTER_2D && state.variables1.length > 0 /*--------------------------------------------------*/)
        ||
        (state.mode === MODE_SCATTER_2D && state.variables1.length > 0 && state.variables1.length === state.variables2.length)
    )
));

/*--------------------------------------------------------------------------------------------------------------------*/

const _panels = computed(() => Object.values(configStore.globals.interfacePanels).filter((x) => x.enabled && !x.locked).sort((a, b) => a.rank - b.rank).map((x) => ({
    value: x.id,
    label: x.title,
})));

/*--------------------------------------------------------------------------------------------------------------------*/

const _controls = computed(() => Object.values(configStore.controls).flatMap((x) => x.ctrls).filter((x) => x.mode === state.mode).map((x) => ({
    value: x.id,
    label: x.title,
})));

/*--------------------------------------------------------------------------------------------------------------------*/

const _options = computed(() => Object.values(configStore.controls).flatMap((x) => x.ctrls).find((x) => x.id === state.control)?.options ?? []);

/*--------------------------------------------------------------------------------------------------------------------*/
/* WATCHERS                                                                                                           */
/*--------------------------------------------------------------------------------------------------------------------*/

watch(() => props.modelValue, (value) => {

    const v = value ?? DEFAULTS;

    state.id = v.id ?? DEFAULTS.id;
    state.mode = v.mode ?? DEFAULTS.mode;
    state.commandAlign = v.commandAlign ?? COMMAND_ALIGN_TRUE;
    state.commandDirection = v.commandDirection ?? COMMAND_DIRECTION_COL;
    state.commandShowStatus = v.commandShowStatus ?? COMMAND_SHOW_STATUS_TRUE;
    state.maxPoints = v.maxPoints ?? DEFAULTS.maxPoints;
    state.control = v.control ?? DEFAULTS.control;
    state.shadow = v.shadow ?? DEFAULTS.shadow;
    state.title = v.title ?? DEFAULTS.title;
    state.panel = v.panel ?? DEFAULTS.panel;
    state.variables1 = Array.isArray(v.variables1) ? [...v.variables1] : [];
    state.variables2 = Array.isArray(v.variables2) ? [...v.variables2] : [];
    state.variables3 = Array.isArray(v.variables3) ? [...v.variables3] : [];
    state.title1 = v.title1 ?? DEFAULTS.title1;
    state.title2 = v.title2 ?? DEFAULTS.title2;
    state.title3 = v.title3 ?? DEFAULTS.title3;
    state.enabled = v.enabled ? {...v.enabled} : {};
    state.options = v.options ? {...v.options} : {};

}, {immediate: true});

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

    if(props.widgetId)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const oldWidget = props.modelValue || {};

        const newWidget = {
            ...state,
            id: props.widgetId,
            x: oldWidget.x ?? null,
            y: oldWidget.y ?? null,
            h: oldWidget.h ?? 1 * 8,
            w: oldWidget.w ?? 2 * 8,
        };

        /*------------------------------------------------------------------------------------------------------------*/

        /**/ if([MODE_VARIABLE, MODE_STREAM].includes(newWidget.mode))
        {
            const n = newWidget.variables1.length;

            for(let i = 0; i < n; i++)
            {
                newWidget.enabled[`${newWidget.variables1[i]}`] ??= true;
            }
        }
        else if([MODE_SCATTER_2D].includes(newWidget.mode))
        {
            const n = Math.min(newWidget.variables1.length, newWidget.variables2.length);

            for(let i = 0; i < n; i++)
            {
                newWidget.enabled[`${newWidget.variables1[i]} / ${newWidget.variables2[i]}`] ??= true;
            }
        }
        else if([MODE_SCATTER_3D].includes(newWidget.mode))
        {
            const n = Math.min(newWidget.variables1.length, newWidget.variables2.length, newWidget.variables3.length);

            for(let i = 0; i < n; i++)
            {
                newWidget.enabled[`${newWidget.variables1[i]} / ${newWidget.variables2[i]} / ${newWidget.variables3[i]}`] ??= true;
            }
        }

        /*------------------------------------------------------------------------------------------------------------*/

        emit('update:modelValue', newWidget);

        /*------------------------------------------------------------------------------------------------------------*/

        if(!props.modelValue?.id)
        {
            emit('created', props.widgetId);
        }

        /*------------------------------------------------------------------------------------------------------------*/

        hide();

        /*------------------------------------------------------------------------------------------------------------*/
    }
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

onBeforeUnmount(() => {

    modalInstance?.dispose();
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
                                    <div :class="['col-md-2', {'visually-hidden': state.mode !== MODE_COMMAND}]">
                                        <div class="mb-3">
                                            <label class="form-label" for="F4EBA41C">Align</label>
                                            <multiselect mode="single" :required="true" :can-clear="false" :searchable="true" :create-option="false" :allow-absent="false" :close-on-select="true" :options="COMMAND_ALIGN" id="F4EBA41C" v-model="state.commandAlign" />
                                        </div>
                                    </div>
                                    <div :class="['col-md-2', {'visually-hidden': state.mode !== MODE_COMMAND}]">
                                        <div class="mb-3">
                                            <label class="form-label" for="CE02F558">Direction</label>
                                            <multiselect mode="single" :required="true" :can-clear="false" :searchable="true" :create-option="false" :allow-absent="false" :close-on-select="true" :options="COMMAND_DIRECTION" id="CE02F558" v-model="state.commandDirection" />
                                        </div>
                                    </div>
                                    <div :class="['col-md-2', {'visually-hidden': state.mode !== MODE_COMMAND}]">
                                        <div class="mb-3">
                                            <label class="form-label" for="E4C38282">Show status</label>
                                            <multiselect mode="single" :required="true" :can-clear="false" :searchable="true" :create-option="false" :allow-absent="false" :close-on-select="true" :options="COMMAND_SHOW_STATUS" id="E4C38282" v-model="state.commandShowStatus" />
                                        </div>
                                    </div>
                                    <div :class="['col-md-6', {'visually-hidden': state.mode === MODE_COMMAND}]">
                                        <div class="mb-3">
                                            <label class="form-label" for="E9549BAB">Max points</label>
                                            <input class="form-control form-control-sm" type="number" min="1" step="1" placeholder="Period" :disabled="state.mode !== MODE_VARIABLE && state.mode !== MODE_SCATTER_2D && state.mode !== MODE_STREAM" :required="true" id="E9549BAB" v-model.number="state.maxPoints" />
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
                                            <label class="form-label" for="F938E61B">Plot title</label>
                                            <input class="form-control form-control-sm" type="text" placeholder="Plot title" id="F938E61B" v-model="state.title" />
                                        </div>
                                    </div>
                                </div>

                                <!-- ******************************************************************************* -->

                                <div class="row" v-if="state.mode === MODE_VARIABLE">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="BBA0018F">Y variable</label>
                                            <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.variableDefs" id="BBA0018F" v-model="state.variables1" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="B4020B86">Y title</label>
                                            <input class="form-control form-control-sm" type="text" placeholder="Y title" id="B4020B86" v-model="state.title1" />
                                        </div>
                                    </div>
                                </div>

                                <!-- -->

                                <div class="row" v-if="state.mode === MODE_SCATTER_2D">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="C6F79530">Y variable</label>
                                            <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.variableDefs" id="C6F79530" v-model="state.variables1" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="AA0001B6">Y title</label>
                                            <input class="form-control form-control-sm" type="text" placeholder="Y title" id="AA0001B6" v-model="state.title1" />
                                        </div>
                                    </div>
                                </div>

                                <div class="row" v-if="state.mode === MODE_SCATTER_2D">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="EFE4DF78">X variable</label>
                                            <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.variableDefs" id="EFE4DF78" v-model="state.variables2" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="BD117B6E">X title</label>
                                            <input class="form-control form-control-sm" type="text" placeholder="X title" id="BD117B6E" v-model="state.title2" />
                                        </div>
                                    </div>
                                </div>

                                <!-- -->

                                <div class="row" v-if="state.mode === MODE_SCATTER_3D">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="C8248234">Z variable</label>
                                            <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.variableDefs" id="C8248234" v-model="state.variables1" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="C10540B0">Z title</label>
                                            <input class="form-control form-control-sm" type="text" placeholder="Y title" id="C10540B0" v-model="state.title1" />
                                        </div>
                                    </div>
                                </div>

                                <div class="row" v-if="state.mode === MODE_SCATTER_3D">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="B143F52E">Y variable</label>
                                            <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.variableDefs" id="B143F52E" v-model="state.variables2" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="DD2ABF65">Y title</label>
                                            <input class="form-control form-control-sm" type="text" placeholder="Y title" id="DD2ABF65" v-model="state.title2" />
                                        </div>
                                    </div>
                                </div>

                                <div class="row" v-if="state.mode === MODE_SCATTER_3D">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="A42306A6">X variable</label>
                                            <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.variableDefs" id="A42306A6" v-model="state.variables3" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="B318A291">X title</label>
                                            <input class="form-control form-control-sm" type="text" placeholder="Y title" id="B318A291" v-model="state.title3" />
                                        </div>
                                    </div>
                                </div>

                                <!-- -->

                                <div class="mb-3" v-if="state.mode === MODE_BLOB">
                                    <label class="form-label" for="D2B9498A">BLOB</label>
                                    <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.blobDefs" id="D2B9498A" v-model="state.variables1" />
                                </div>

                                <!-- -->

                                <div class="mb-3" v-if="state.mode === MODE_STREAM">
                                    <label class="form-label" for="BAFEAE75">Stream</label>
                                    <multiselect mode="tags" :required="true" :searchable="true" :create-option="true" :allow-absent="true" :close-on-select="true" :options="nyxStore.streamDefs" id="BAFEAE75" v-model="state.variables1" />
                                </div>

                                <!-- -->

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
