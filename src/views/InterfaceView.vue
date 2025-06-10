<!--suppress HtmlUnknownTag, CssUnusedSymbol, JSUnresolvedReference, PointlessArithmeticExpressionJS -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {h, ref, inject, render, computed, reactive, onMounted, onUnmounted, getCurrentInstance} from 'vue';

import Multiselect from '@vueform/multiselect';

import {GridStack} from 'gridstack';

import {Modal} from 'bootstrap';

/*--------------------------------------------------------------------------------------------------------------------*/

import ControlOption from '../components/ControlOption.vue';

import {useNyxStore, NyxGroup} from 'vue-nyx';

import useConfigStore from '../stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const dialog = inject('dialog');

/*--------------------------------------------------------------------------------------------------------------------*/

const NB_COLUMNS = 64;

const MODE_VARIABLE = 'variable';
const MODE_SCATTER = 'temporal';
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

const CONTROLS = [
    {value: 'auto', label: 'Auto'},
]

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
    refreshTime: 1000,
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
    !!state.mode
    &&
    !!state.panel
    &&
    (!!state.control || state.mode === MODE_COMMAND)
    &&
    (
        (state.mode !== MODE_SCATTER && state.variables1.length > 0 /*--------------------------------------------------*/)
        ||
        (state.mode === MODE_SCATTER && state.variables1.length > 0 && state.variables1.length === state.variables2.length)
    )
);

/*--------------------------------------------------------------------------------------------------------------------*/

const panels = computed(() => Object.values(configStore.globals.interfacePanels).filter((panel) => panel.enabled).sort((a, b) => a.rank - b.rank).map((panel) => ({
    value: panel.id,
    label: panel.title,
})));

/*--------------------------------------------------------------------------------------------------------------------*/

const controls = computed(() => Object.values(configStore.controls).flatMap((controls) => controls.ctrls).filter((ctrl) => ctrl.mode === state.mode).map((ctrl) => ({
    value: ctrl.id,
    label: ctrl.title,
})));

/*--------------------------------------------------------------------------------------------------------------------*/

const options = computed(() => Object.values(configStore.controls).flatMap((controls) => controls.ctrls).find((ctrl) => ctrl.id === state.control)?.options ?? []);

/*--------------------------------------------------------------------------------------------------------------------*/

const controlModal = ref(null);

const widgetDict = {};

let appContext;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const newWidget = (widget = null) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const widgetDescr = widget?.descr;

    if(widgetDescr)
    {
        state.id = widgetDescr.id;
        state.mode = widgetDescr.mode;
        state.refreshTime = widgetDescr.refreshTime;
        state.control = widgetDescr.control;
        state.showLegend = widgetDescr.showLegend;
        state.shadow = widgetDescr.shadow;
        state.title = widgetDescr.title;
        state.panel = widgetDescr.panel;
        state.variables1 = widgetDescr.variables1;
        state.variables2 = widgetDescr.variables2;
        state.options = widgetDescr.options;
    }
    else
    {
        state.id = null;
        state.mode = MODE_VARIABLE;
        state.refreshTime = 1000;
        state.control = '';
        state.showLegend = false;
        state.shadow = 'shadow';
        state.title = '';
        state.panel = '';
        state.variables1 = [];
        state.variables2 = [];
        state.options = {};
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    Modal.getOrCreateInstance(controlModal.value).show();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const newWidgetStep2 = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    createWidget({
        id: state.id || __NYX_UUID__.v4(),
        mode: state.mode,
        refreshTime: state.refreshTime,
        control: state.control,
        showLegend: state.showLegend,
        shadow: state.shadow,
        title: state.title,
        panel: state.panel,
        variables1: state.variables1,
        variables2: state.variables2,
        options: state.options,
    }, !state.id);

    /*----------------------------------------------------------------------------------------------------------------*/

    Modal.getOrCreateInstance(controlModal.value).hide();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const createComponent = (component, attributes) => {

    const vnode = h(component, attributes);

    vnode.appContext = appContext;

    return vnode;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const createWidget = (widgetDescr, create = true) => {

    /*----------------------------------------------------------------------------------------------------------------*/
    /* GET PANEL                                                                                                      */
    /*----------------------------------------------------------------------------------------------------------------*/

    const el = document.querySelector(`[data-panel="${widgetDescr.panel}"]`);

    if(!el)
    {
        return;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* RENDER WIDGET                                                                                                  */
    /*----------------------------------------------------------------------------------------------------------------*/

    let widget;

    if(create)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        if(!widgetDescr.h) {
            widgetDescr.h = Math.round(NB_COLUMNS * el.offsetHeight / el.offsetWidth / 4);
        }

        if(!widgetDescr.w) {
            widgetDescr.w = Math.round(NB_COLUMNS * 1.000000000000000000000000000000 / 4);
        }

        /*------------------------------------------------------------------------------------------------------------*/

        widget = el.gridstack.addWidget({
            x: widgetDescr.x,
            y: widgetDescr.y,
            h: widgetDescr.h,
            w: widgetDescr.w,
            content: `
                <div class="card h-100 w-100 m-0">
                    <div class="card-header px-3 py-1">
                        <span class="widget-title"></span>
                        <span>
                            <i class="bi bi-pencil" style="cursor: pointer;"></i>
                            <i class="bi bi-x-lg" style="cursor: pointer;"></i>
                        </span>
                    </div>
                    <div class="card-body px-1 py-1"></div>
                </div>
            `
        });

        /*------------------------------------------------------------------------------------------------------------*/

        widget.querySelector('.bi-pencil').onclick = () => {

            newWidget(widget);
        };

        widget.querySelector('.bi-x-lg').onclick = () => {

            closeWidget(widget);
        };

        /*------------------------------------------------------------------------------------------------------------*/

        widget.classList.add(widgetDescr.shadow);

        widget.descr = widgetDescr;

        /*------------------------------------------------------------------------------------------------------------*/
    }
    else
    {
        /*------------------------------------------------------------------------------------------------------------*/

        widget = widgetDict[widgetDescr.id];

        /*------------------------------------------------------------------------------------------------------------*/

        render(null, widget.querySelector('.card-body'));

        /*------------------------------------------------------------------------------------------------------------*/

        const old = configStore.globals.interfaceWidgets[widgetDescr.id];

        widgetDescr.x = old.x;
        widgetDescr.y = old.y;
        widgetDescr.h = old.h;
        widgetDescr.w = old.w;

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    widget.querySelector('.widget-title').textContent = widgetDescr.title;

    /*----------------------------------------------------------------------------------------------------------------*/

    if(widgetDescr.mode !== MODE_COMMAND)
    {
        /*------------------------------------------------------------------------------------------------------------*/
        /* RENDER CONTROL                                                                                             */
        /*------------------------------------------------------------------------------------------------------------*/

        const controlDescr = Object.values(configStore.controls).flatMap((controls) => controls.ctrls).find((ctrl) => ctrl.id === widgetDescr.control);

        if(controlDescr?.['component'])
        {
            try
            {
                const vnode = createComponent(controlDescr.component, widgetDescr);

                if(vnode)
                {
                    render(vnode, widget.querySelector('.card-body'));
                }
            }
            catch(e)
            {
                console.error(e);
            }
        }

        /*------------------------------------------------------------------------------------------------------------*/
    }
    else
    {
        /*------------------------------------------------------------------------------------------------------------*/
        /* RENDER COMMAND                                                                                             */
        /*------------------------------------------------------------------------------------------------------------*/

        const groupDescr = widgetDescr.variables1.map((x) => nyxStore.defXXXVectorDict[x]).filter((x) => !!x);

        if(groupDescr)
        {
            try
            {
                const vnode = createComponent(NyxGroup, {groupInfo: groupDescr});

                if(vnode)
                {
                    render(vnode, widget.querySelector('.card-body'));
                }
            }
            catch(e)
            {
                console.error(e);
            }
        }

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    configStore.globals.interfaceWidgets[widgetDescr.id] = widgetDescr;

    widgetDict[widgetDescr.id] = widget;

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const closeWidget = (widget) => {

    dialog.confirm('Are you sure you want to delete this widget?', 'Nyx Dashboard').then((choice) => {

        if(choice)
        {
            const grid = widget.closest('.grid-stack')?.gridstack;

            if(grid)
            {
                /*----------------------------------------------------------------------------------------------------*/

                render(null, widget.querySelector('.card-body'));

                /*----------------------------------------------------------------------------------------------------*/

                delete configStore.globals.interfaceWidgets[widget.descr.id];

                delete widgetDict[widget.descr.id];

                /*----------------------------------------------------------------------------------------------------*/

                grid.removeWidget(widget, true);

                /*----------------------------------------------------------------------------------------------------*/
            }
        }
    });
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

    if(nyxStore.isConnected)
    {
        /*------------------------------------------------------------------------------------------------------------*/
        /* SETUP GRID STACK                                                                                           */
        /*------------------------------------------------------------------------------------------------------------*/

        GridStack.initAll({float: true, margin: 0, column: NB_COLUMNS}).forEach((grid) => {

            grid.on('resizestop', (_, el) => {

                updateWidget(el)
            });

            grid.on('dragstop', (_, el) => {

                updateWidget(el)
            });
        });

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
        render(null, widget.querySelector('.card-body'));
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARDS                                                                                                  -->
    <!-- *********************************************************************************************************** -->

    <div class="d-flex flex-column overflow-y-auto h-100 w-100 p-3">

        <nav-tabs margin="mb-3" v-if="nyxStore.isConnected">

            <!-- *************************************************************************************************** -->

            <tab-pane :title="panel.label" v-for="panel in panels" :key="panel.value">

                <div class="grid-stack h-100 w-100" :data-panel="panel.value"></div>

            </tab-pane>

            <!-- *************************************************************************************************** -->

            <template v-slot:button>

                <button class="btn btn-sm btn-primary ms-0" type="button" :disabled="!nyxStore.isConnected" @click="newWidget()">
                    <i class="bi bi-plus-lg"></i> New widget
                </button>

                <button class="btn btn-sm btn-success ms-2" type="button" :disabled="!nyxStore.isConnected" @click="configStore.save()">
                    <i class="bi bi-check-lg"></i> Save
                </button>

            </template>

            <!-- *************************************************************************************************** -->

        </nav-tabs>

        <div class="alert alert-warning" role="alert" v-else>
            Not connected
        </div>

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
                                    <div class="col-md-3">
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
                                    <div class="col-md-3">
                                        <label class="form-label" for="E9549BAB">Refresh time [ms]</label>
                                        <input class="form-control form-control-sm" type="number" min="1" step="1" id="E9549BAB" placeholder="Divider" v-model="state.refreshTime" :disabled="state.mode !== MODE_VARIABLE && state.mode !== MODE_SCATTER" required="required" />
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
                                                :options="state.mode === MODE_COMMAND ? CONTROLS : controls" v-model="state.control" />
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
                                                :options="panels" v-model="state.panel" />
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
                                    <label class="form-label" for="BBA0018F">Variable</label>
                                    <multiselect
                                        mode="tags"
                                        id="BBA0018F"
                                        :required="true"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="nyxStore.variableDefs" v-model="state.variables1" />
                                </div>

                                <!-- ******************************************************************************* -->

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

                                <!-- ******************************************************************************* -->

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

                                <!-- ******************************************************************************* -->

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

                                <!-- ******************************************************************************* -->

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

                                <div class="mb-3" v-if="state.mode === MODE_COMMAND">
                                    <label class="form-label" for="BBA0018F">Command</label>
                                    <multiselect
                                        mode="tags"
                                        id="BBA0018F"
                                        :required="true"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="nyxStore.vectorDefs" v-model="state.variables1" />
                                </div>

                                <!-- ******************************************************************************* -->

                            </tab-pane>

                            <!-- *********************************************************************************** -->
                            <!-- OPTIONS                                                                             -->
                            <!-- *********************************************************************************** -->

                            <tab-pane title="Options">

                                <div v-for="(option, index) in options" :key="index">

                                    <control-option :type="option.type" :name="option.name" :label="option.label" :min="option.min" :max="option.max" :step="option.step" :default-value="option.defaultValue" v-model="state.options[option.name]"></control-option>

                                </div>

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

<style>
/*--------------------------------------------------------------------------------------------------------------------*/

.grid-stack-item {

    border-radius: calc(var(--bs-border-radius) + 10px);
}

/*--------------------------------------------------------------------------------------------------------------------*/

.grid-stack-item .card-header {

    display: flex;
    overflow: hidden;
    flex-direction: row;
    justify-content: space-between;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.grid-stack-item .card-body {

    display: flex;
    overflow: hidden;
    flex-direction: column;
    justify-content: /**/ center /**/;
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
