<!--suppress HtmlUnknownTag, HtmlUnknownAttribute, JSUnresolvedReference, JSUnusedGlobalSymbols -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {h, ref, render, computed, reactive, onMounted, onUnmounted, getCurrentInstance} from 'vue';

import {createJSONEditor} from 'vanilla-jsoneditor';

import Multiselect from '@vueform/multiselect';

import {Modal, Tooltip} from 'bootstrap';

import {GridStack} from 'gridstack';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

import {useNyxStore} from 'vue-nyx';

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

const SHADOWS = [
    {value: 'shadow-none', label: 'None'},
    {value: 'shadow-sm', label: 'Small'},
    {value: 'shadow', label: 'Regular'},
    {value: 'shadow-lg', label: 'Large'},
];

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    id: null,
    mode: MODE_VARIABLE,
    divider: 1,
    control: '',
    showLegend: false,
    shadow: 'shadow',
    title: '',
    panel: '',
    variables1: [],
    variables2: [],
});

/*--------------------------------------------------------------------------------------------------------------------*/

const isValid = computed(() =>
    !!state.panel
    &&
    !!state.control
    &&
    (
        (state.mode !== MODE_SCATTER && state.variables1.length > 0 /*--------------------------------------------------*/)
        ||
        (state.mode === MODE_SCATTER && state.variables1.length > 0 && state.variables1.length === state.variables2.length)
    )
);

/*--------------------------------------------------------------------------------------------------------------------*/

const controls = computed(() => Object.values(configStore.controls).flatMap((controls) => controls.ctrls).filter((ctrl) => ctrl.mode === state.mode).map((ctrl) => ({
    value: ctrl.id,
    label: ctrl.title,
})));

/*--------------------------------------------------------------------------------------------------------------------*/

const widgetDict = {};

/*--------------------------------------------------------------------------------------------------------------------*/

const controlModal = ref(null);

const jsonEditor = ref(null);

let appContext = null;

let editor = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const newWidgetStep1 = (id = null) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(id)
    {
        const widgetDescr = configStore.globals.interfaceWidgets[id];

        state.id = id;
        state.mode = widgetDescr.mode;
        state.divider = widgetDescr.divider;
        state.control = widgetDescr.control;
        state.showLegend = widgetDescr.showLegend;
        state.shadow = widgetDescr.shadow;
        state.title = widgetDescr.title;
        state.panel = widgetDescr.panel;
        state.variables1 = widgetDescr.variables1;
        state.variables2 = widgetDescr.variables2;
        editor.set({
            json: widgetDescr.options || {}
        });
    }
    else
    {
        state.id = null;
        state.mode = MODE_VARIABLE;
        state.divider = 1;
        state.control = '';
        state.showLegend = false;
        state.shadow = 'shadow';
        state.title = '';
        state.panel = '';
        state.variables1 = [];
        state.variables2 = [];
        editor.set({
            json: {}
        });
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    Modal.getOrCreateInstance(controlModal.value).show();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const newWidgetStep2 = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    createWidget({
        id: state.id || uuid.v4(),
        mode: state.mode,
        divider: state.divider,
        control: state.control,
        showLegend: state.showLegend,
        shadow: state.shadow,
        title: state.title,
        panel: state.panel,
        variables1: state.variables1,
        variables2: state.variables2,
    }, !state.id);

    /*----------------------------------------------------------------------------------------------------------------*/

    Modal.getOrCreateInstance(controlModal.value).hide();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const createWidget = (widgetDescr, create = true) => {

    /*----------------------------------------------------------------------------------------------------------------*/
    /* GET PANEL                                                                                                      */
    /*----------------------------------------------------------------------------------------------------------------*/

    const el = document.querySelector(`[data-title="${widgetDescr.panel}"]`);

    if(!el)
    {
        return;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* RENDER CONTROL                                                                                                 */
    /*----------------------------------------------------------------------------------------------------------------*/

    let widget;

    if(create)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        if(!widgetDescr.h) {
            widgetDescr.h = Math.round(configStore.globals.interfaceColumns * el.offsetHeight / el.offsetWidth / 4);
        }

        if(!widgetDescr.w) {
            widgetDescr.w = Math.round(configStore.globals.interfaceColumns * 1.000000000000000000000000000000 / 4);
        }

        /*------------------------------------------------------------------------------------------------------------*/

        widget = el.gridstack.addWidget({
            x: widgetDescr.x,
            y: widgetDescr.y,
            h: widgetDescr.h,
            w: widgetDescr.w,
            content: '<i class="bi bi-pencil-fill position-absolute" style="cursor: pointer; right: -0px; top: -4px;"></i>'
        });

        /*------------------------------------------------------------------------------------------------------------*/

        widget.querySelector('.bi-pencil-fill').onclick = () => newWidgetStep1(widgetDescr.id);

        widget.classList.add(widgetDescr.shadow);

        widget.descr = widgetDescr;

        /*------------------------------------------------------------------------------------------------------------*/
    }
    else
    {
        /*------------------------------------------------------------------------------------------------------------*/

        widget = widgetDict[widgetDescr.id];

        /*------------------------------------------------------------------------------------------------------------*/

        render(null, widget.firstElementChild);

        /*------------------------------------------------------------------------------------------------------------*/

        const old = configStore.globals.interfaceWidgets[widgetDescr.id];

        widgetDescr.x = old.x;
        widgetDescr.y = old.y;
        widgetDescr.h = old.h;
        widgetDescr.w = old.w;

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    widgetDescr.options = editor.get();

    /*----------------------------------------------------------------------------------------------------------------*/

    const controlDescr = Object.values(configStore.controls).flatMap((controls) => controls.ctrls).find((ctrl) => ctrl.id === widgetDescr.control);

    if(controlDescr?.component)
    {
        setTimeout(() => {

            const vnode = h(controlDescr.component, widgetDescr);

            vnode.appContext = /*---*/ appContext /*---*/;

            render(vnode, widget.firstElementChild);

        }, 250);
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    configStore.globals.interfaceWidgets[widgetDescr.id] = widgetDescr;

    widgetDict[widgetDescr.id] = widget;

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const removeWidget = (widget) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    render(null, widget.firstElementChild);

    /*----------------------------------------------------------------------------------------------------------------*/

    delete configStore.globals.interfaceWidgets[widget.descr.id];

    delete widgetDict[widget.descr.id];

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const updateWidget = (widget) => {

    widget.descr.x = widget.gridstackNode.x;
    widget.descr.y = widget.gridstackNode.y;
    widget.descr.h = widget.gridstackNode.h;
    widget.descr.w = widget.gridstackNode.w;
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    /*----------------------------------------------------------------------------------------------------------------*/

    appContext = getCurrentInstance()?.appContext;

    /*----------------------------------------------------------------------------------------------------------------*/

    Tooltip.getOrCreateInstance(document.body, {
        selector: '[data-bs-title]'
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    if(nyxStore.isConnected)
    {
        /*------------------------------------------------------------------------------------------------------------*/
        /* SETUP GRID STACK                                                                                           */
        /*------------------------------------------------------------------------------------------------------------*/

        GridStack.initAll({float: true, column: configStore.globals.interfaceColumns, removable: '#AAE7F472'}).forEach((grid) => {

            grid.on('resizestop', (_, el) => updateWidget(el));

            grid.on('dragstop', (_, el) => updateWidget(el));

            grid.on('removed', (_, items) => {

                for(const item of items)
                {
                    removeWidget(item.el);
                }
            });
        });

        /*------------------------------------------------------------------------------------------------------------*/
        /* SETUP JSON EDITOR                                                                                           */
        /*------------------------------------------------------------------------------------------------------------*/

        editor = createJSONEditor({target: jsonEditor.value});

        /*------------------------------------------------------------------------------------------------------------*/
        /* RENDER WIDGETS                                                                                             */
        /*------------------------------------------------------------------------------------------------------------*/

        Object.values(configStore.globals.interfaceWidgets).forEach((control) => createWidget(control, true));

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    for(const widget of Object.values(widgetDict))
    {
        render(null, widget.firstElementChild);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARDS                                                                                                  -->
    <!-- *********************************************************************************************************** -->

    <div class="d-flex flex-column overflow-y-auto h-100 w-100 p-3">

        <nav-tabs margin="mb-3">

            <!-- *************************************************************************************************** -->

            <tab-pane :title="interfaceName" v-for="(interfaceName, interfaceIndex) in configStore.globals.interfacePanels" :key="interfaceIndex">

                <div class="grid-stack h-100 w-100" :data-title="interfaceName"></div>

            </tab-pane>

            <!-- *************************************************************************************************** -->

            <template v-slot:button>

                <button class="btn btn-sm btn-success" type="button" @click="configStore.save">
                    <i class="bi bi-check-lg"></i> Save
                </button>

            </template>

            <!-- *************************************************************************************************** -->

        </nav-tabs>

    </div>

    <!-- *********************************************************************************************************** -->
    <!-- BUTTONS                                                                                                     -->
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
                                                :options="controls" v-model="state.control" />
                                        </div>
                                    </div>
                                </div>

                                <!-- ******************************************************************************* -->

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="C8C721F4">Shadow</label>
                                            <multiselect
                                                mode="single"
                                                id="C8C721F4"
                                                :required="true"
                                                :can-clear="false"
                                                :searchable="true"
                                                :create-option="false"
                                                :close-on-select="true"
                                                :options="SHADOWS" v-model="state.shadow" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="F938E61B">Title<sup class="text-secondary">opt</sup></label>
                                            <input class="form-control form-control-sm" type="text" id="F938E61B" placeholder="Plot title" v-model="state.title" />
                                        </div>
                                    </div>
                                </div>

                                <!-- ******************************************************************************* -->

                                <div class="row">
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
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-check-label" for="FD833D53">Show legend</label>
                                            <div class="form-check form-switch form-switch-lg"><input class="form-check-input" type="checkbox" role="switch" id="FD833D53" v-model="state.showLegend" /></div>
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
                                        mode="tags"
                                        id="BBA0018F"
                                        :required="true"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="nyxStore.blobDefs" v-model="state.variables1" />
                                </div>

                                <div class="mb-3" v-if="state.mode === MODE_STREAM">
                                    <label class="form-label" for="BBA0018F">Stream</label>
                                    <multiselect
                                        mode="tags"
                                        id="BBA0018F"
                                        :required="true"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="nyxStore.streamDefs" v-model="state.variables1" />
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
