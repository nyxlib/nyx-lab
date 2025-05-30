<!--suppress ALL, HtmlUnknownAttribute -->

<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { ref, computed, reactive, onMounted } from 'vue';

import { createJSONEditor } from 'vanilla-jsoneditor';

import Multiselect from '@vueform/multiselect';

import { GridStack } from 'gridstack';

import { Modal } from 'bootstrap';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

import { useNyxStore } from 'vue-nyx';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const MODE_VARIABLE = 'variable';
const MODE_SCATTER = 'temporal';
const MODE_BLOB = 'blob';
const MODE_STREAM = 'stream';

const MODES = [
    {value: MODE_VARIABLE, label: 'Variable'},
    {value: MODE_SCATTER, label: 'Scatter'},
    {value: MODE_BLOB, label: 'BLOB'},
    {value: MODE_STREAM, label: 'Stream'},
];

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    id: null,
    mode: MODE_VARIABLE,
    divider: 1,
    control: '',
    title: '',
    panel: '',
    xTitle: '',
    yTitle: '',
    showLegend: false,
    xLogScale: false,
    yLogScale: false,
    variables1: [],
    variables2: [],
    blob: null,
    stream: null,
    options: {},
});

/*--------------------------------------------------------------------------------------------------------------------*/

const isValid = computed(() =>
    !!state.panel
    &&
    !!state.control
    &&
    (
        (state.mode == MODE_VARIABLE && state.variables1.length > 0 /*--------------------------------------------------*/)
        ||
        (state.mode == MODE_SCATTER && state.variables1.length > 0 && state.variables1.length === state.variables2.length)
        ||
        (state.mode == MODE_BLOB && state.blobOrStream)
        ||
        (state.mode == MODE_STREAM && state.blobOrStream)
    )
);

/*--------------------------------------------------------------------------------------------------------------------*/

const widgetDict = {};

/*--------------------------------------------------------------------------------------------------------------------*/

const controlModal = ref(null);

const jsonEditor = ref(null);

let editor = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const newWidgetStep1 = (id = null) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(id)
    {
        const control = configStore.globals.interfaceControls[id];

        state.id = id;
        state.mode = control.mode;
        state.divider = control.divider;
        state.control = control.control;
        state.title = control.title;
        state.panel = control.panel;
        state.xTitle = control.xTitle;
        state.yTitle = control.yTitle;
        state.variables1 = control.variables1;
        state.variables2 = control.variables2;
        state.blob = control.blob;
        state.stream = control.stream;
        state.options = control.options;
    }
    else
    {
        state.id = null;
        state.mode = MODE_VARIABLE;
        state.divider = 1;
        state.control = '';
        state.title = '';
        state.panel = '';
        state.xTitle = '';
        state.yTitle = '';
        state.variables1 = [];
        state.variables2 = [];
        state.blob = null;
        state.stream = null;
        state.options = {};
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    Modal.getOrCreateInstance(controlModal.value).show();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const newWidgetStep2 = () => {

    createWidget({
        id: state.id || uuid.v4(),
        mode: state.mode,
        divider: state.divider,
        control: state.control,
        title: state.title,
        panel: state.panel,
        xTitle: state.xTitle,
        yTitle: state.yTitle,
        variables1: state.variables1,
        variables2: state.variables2,
        blob: state.blob,
        stream: state.stream,
        x: 0, y: 0,
        h: 2, w: 2,
    }, !!state.id);
};

/*--------------------------------------------------------------------------------------------------------------------*/

const createWidget = (control, edit) => {

    /*----------------------------------------------------------------------------------------------------------------*/
    /* EDIT                                                                                                           */
    /*----------------------------------------------------------------------------------------------------------------*/

    if(edit)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        widgetDict[control.id].gridstack.removeWidget(widgetDict[control.id], true, false);

        /*------------------------------------------------------------------------------------------------------------*/

        const old = configStore.globals.interfaceControls[control.id];

        control.x = old.x;
        control.y = old.y;
        control.h = old.h;
        control.w = old.w;

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* CREATE                                                                                                         */
    /*----------------------------------------------------------------------------------------------------------------*/

    const el = document.querySelector(`[data-title="${control.panel}"]`);

    if(el)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const widget = el.gridstack.addWidget({
            x: control.x,
            y: control.y,
            h: control.h,
            w: control.w,
            content: (
                '<i class="bi bi-pencil-fill position-absolute" style="cursor: pointer; right: 1.50rem; top: -0.25rem;"></i>'
                +
                '<i class="bi bi-eraser-fill position-absolute" style="cursor: pointer; right: 0.00rem; top: -0.25rem;"></i>'
            ),
        });

        /*------------------------------------------------------------------------------------------------------------*/

        widget.querySelector('.bi-pencil-fill').onclick = () => newWidgetStep1(control.id);

        widget.querySelector('.bi-eraser-fill').onclick = () => clearWidget(control.id);

        widget.gridstack = el.gridstack;

        widget.metric = control;

        /*------------------------------------------------------------------------------------------------------------*/

        /*------------------------------------------------------------------------------------------------------------*/

        configStore.globals.interfaceControls[control.id] = control;

        widgetDict[control.id] = widget;

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const updateWidget = (_, widget) => {

    widget.metric.x = widget.gridstackNode.x;
    widget.metric.y = widget.gridstackNode.y;
    widget.metric.h = widget.gridstackNode.h;
    widget.metric.w = widget.gridstackNode.w;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const removeWidget = (_, widget) => {

    delete configStore.globals.interfaceControls[widget.metric.id];

    delete widgetDict[widget.metric.id];
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    /*----------------------------------------------------------------------------------------------------------------*/

    editor = createJSONEditor({
        target: jsonEditor.value,
        props: {
            json: state.options,
            onChange: (options) => {
                state.options = options;
            }
        }
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    if(nyxStore.isConnected)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        GridStack.renderCB = (el, w) => {

            el.innerHTML = w.content;
        };

        /*------------------------------------------------------------------------------------------------------------*/

        GridStack.initAll({float: true, removable: '#AAE7F472'}).forEach((grid) => {

            grid.on('resizestop', updateWidget);

            grid.on('dragstop', updateWidget);

            grid.on('removed', (e, items) => {

                items.forEach((item) => {

                    removeWidget(e, item.el);
                });
            });
        });

        /*------------------------------------------------------------------------------------------------------------*/

        Object.values(configStore.globals.interfaceControls).forEach((control) => createWidget(control, false));

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>
    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARD                                                                                                   -->
    <!-- *********************************************************************************************************** -->

    <div class="h-100 w-100 d-flex flex-column p-3">

        <nav-tabs margin="mb-3">

            <tab-pane class="align-items-center justify-content-center" :title="interfaceName" v-for="(interfaceName, interfaceIndex) in configStore.globals.interfacePanels" :key="interfaceIndex">

                <div class="grid-stack h-100 w-100" :data-title="interfaceName"></div>

            </tab-pane>

        </nav-tabs>

    </div>

    <!-- *********************************************************************************************************** -->

    <div class="position-absolute" style="right: 1rem; bottom: 1rem;">

        <button class="btn btn-primary ms-0" type="button" data-bs-placement="top" data-bs-title="Add a new widget" :disabled="!nyxStore.isConnected" @click="newWidgetStep1(null)">
            <i class="bi bi-plus-lg"></i>
        </button>

        <button class="btn btn-danger ms-1" type="button" data-bs-placement="top" data-bs-title="Drop here to remove" :disabled="!nyxStore.isConnected" id="AAE7F472">
            <i class="bi bi-trash2"></i>
        </button>

    </div>

    <!-- *********************************************************************************************************** -->
    <!-- MODAL                                                                                                       -->
    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="modal" tabindex="-1" ref="controlModal">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">

                    <div class="modal-header px-3 py-2">
                        <h5 class="modal-title">
                            <i class="bi bi-pencil"></i>
                            {{ state.id ? 'Edit' : 'New' }} control
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <form class="modal-body px-3 py-2" @submit.prevent="newWidgetStep2" id="D1531250">

                        <nav-tabs margin="mb-3">

                            <!-- *********************************************************************************** -->
                            <!-- Control                                                                             -->
                            <!-- *********************************************************************************** -->

                            <tab-pane title="Control">

                                <!-- ******************************************************************************* -->

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label" for="D38EC0FA">Mode</label>
                                            <multiselect
                                                mode="single"
                                                id="D38EC0FA"
                                                :required="true"
                                                :can-clear="false"
                                                :searchable="true"
                                                :create-option="false"
                                                :close-on-select="true"
                                                :options="MODES" v-model="state.mode" />
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <label class="form-label" for="E9549BAB">Divider</label>
                                        <input class="form-control form-control-sm" type="number" min="1" step="1" id="E9549BAB" placeholder="Divider" v-model="state.divider" :disabled="state.mode !== MODE_VARIABLE && state.mode !== MODE_SCATTER" required="required" />
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="F8E884DD">Control</label>
                                            <multiselect
                                                mode="single"
                                                id="F8E884DD"
                                                :required="true"
                                                :can-clear="false"
                                                :searchable="true"
                                                :create-option="false"
                                                :close-on-select="true"
                                                :options="[{value: 'yok', label: 'yok'}]" v-model="state.control" />
                                        </div>
                                    </div>
                                </div>

                                <!-- ******************************************************************************* -->

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="F938E61B">Title<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" id="F938E61B" placeholder="Plot title" v-model="state.title" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="C8C721F4">Panel</label>
                                            <multiselect
                                                mode="single"
                                                id="C8C721F4"
                                                :required="true"
                                                :can-clear="false"
                                                :searchable="true"
                                                :create-option="false"
                                                :close-on-select="true"
                                                :options="configStore.globals.interfacePanels.map((x) => ({value: x, label: x}))" v-model="state.panel" />
                                        </div>
                                    </div>
                                </div>

                                <!-- ******************************************************************************* -->

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="D8A97782">X title<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" id="D8A97782" placeholder="X title" v-model="state.xTitle" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <div class="mb-3">
                                                <label class="form-label" for="EC986FF8">Y title<sup class="text-secondary">opt</sup></label>
                                                <input class="form-control form-control-sm" type="text" id="EC986FF8" placeholder="Y title" v-model="state.yTitle" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- ******************************************************************************* -->

                                <div class="mb-3" v-if="state.mode === MODE_VARIABLE ">
                                    <label class="form-label" for="BBA0018F">Y variable</label>
                                    <multiselect
                                        mode="tags"
                                        id="BBA0018F"
                                        :required="true"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="nyxStore.variableDefs" v-model="state.variables1" />
                                </div>

                                <div class="mb-3" v-if="state.mode === MODE_SCATTER">
                                    <label class="form-label" for="BBA0018F">Y variable</label>
                                    <multiselect
                                        mode="tags"
                                        id="BBA0018F"
                                        :required="true"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="nyxStore.variableDefs" v-model="state.variables1" />
                                </div>

                                <div class="mb-3" v-if="state.mode === MODE_SCATTER">
                                    <label class="form-label" for="B5D75D1E">X variable</label>
                                    <multiselect
                                        mode="tags"
                                        id="B5D75D1E"
                                        :required="true"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="nyxStore.variableDefs" v-model="state.variables2" />
                                </div>

                                <div class="mb-3" v-if="state.mode === MODE_BLOB">
                                    <label class="form-label" for="BBA0018F">BLOB</label>
                                    <multiselect
                                        mode="single"
                                        id="BBA0018F"
                                        :required="true"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="nyxStore.blobDefs" v-model="state.blobOrStream" />
                                </div>

                                <div class="mb-3" v-if="state.mode === MODE_STREAM">
                                    <label class="form-label" for="BBA0018F">Stream</label>
                                    <multiselect
                                        mode="single"
                                        id="BBA0018F"
                                        :required="true"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="nyxStore.streamDefs" v-model="state.blobOrStream" />
                                </div>

                                <!-- ******************************************************************************* -->

                            </tab-pane>

                            <!-- *********************************************************************************** -->
                            <!-- OPTIONS                                                                             -->
                            <!-- *********************************************************************************** -->

                            <tab-pane title="Options">

                                <div style="height: 400px;" ref="jsonEditor"></div>

                            </tab-pane>

                            <!-- *********************************************************************************** -->

                        </nav-tabs>

                    </form>

                    <div class="modal-footer px-3 py-1">

                        <!-- *************************************************************************************** -->

                        <button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">
                            <i class="bi bi-x-lg"></i> Cancel
                        </button>

                        <button class="btn btn-success" type="submit" form="D1531250" :disabled="!isValid">
                            <i class="bi bi-check-lg"></i> Add
                        </button>

                        <!-- *************************************************************************************** -->

                    </div>

                </div>
            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>
