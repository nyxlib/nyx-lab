<!--suppress HtmlUnknownTag, CssUnusedSymbol, JSUnresolvedReference, PointlessArithmeticExpressionJS -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {h, ref, inject, render, computed, reactive, onMounted, onUnmounted, getCurrentInstance} from 'vue';

import Multiselect from '@vueform/multiselect';

import {GridStack} from 'gridstack';

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
const mqtt = inject('mqtt');
const nss = inject('nss');

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

const SHADOWS = [
    {value: 'shadow-none', label: 'None'},
    {value: 'shadow-sm', label: 'Small'},
    {value: 'shadow', label: 'Regular'},
    {value: 'shadow-lg', label: 'Large'},
];

const CONTROLS = [
    {value: 'auto', label: 'Auto'},
]

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    id: null,
    mode: MODE_VARIABLE,
    refreshTime: 1000,
    control: '',
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
    ||
    !!state.title
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
    locked: panel.locked,
})));

/*--------------------------------------------------------------------------------------------------------------------*/

const controls = computed(() => Object.values(configStore.controls).flatMap((controls) => controls.ctrls).filter((ctrl) => ctrl.mode === state.mode).map((ctrl) => ({
    value: ctrl.id,
    label: ctrl.title,
    //////: ctrl.?????,
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

const connect = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    mqtt.update(
        configStore.globals.mqttURL,
        configStore.globals.mqttUsername,
        configStore.globals.mqttPassword
    );

    nss.update(
        configStore.globals.nssURL,
        configStore.globals.nssUsername,
        configStore.globals.nssPassword
    );

    /*----------------------------------------------------------------------------------------------------------------*/

    let cnt = 0, interval = setInterval(() => {

        if(cnt++ > 10 || nyxStore.isConnected)
        {
            clearInterval(interval);

            interval = null;

            init();
        }

    }, 1000);

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const disconnect = () => {

    mqtt.update('', '', '');

    nss.update('', '', '');
};

/*--------------------------------------------------------------------------------------------------------------------*/

const init = () => {

    if(configStore.globals.showUserInterfaces)
    {
        Object.values(configStore.globals.interfaceWidgets).forEach(createWidget);
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const final = () => {

    for(const widget of Object.values(widgetDict))
    {
        render(null, widget.querySelector('.card-body'));
    }
};

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
        state.shadow = widgetDescr.shadow;
        state.title = widgetDescr.title;
        state.panel = widgetDescr.panel;
        state.variables1 = widgetDescr.variables1;
        state.variables2 = widgetDescr.variables2;
        state.enabled = widgetDescr.enabled;
        state.options = widgetDescr.options;
    }
    else
    {
        state.id = __NYX_UUID__.v4();
        state.mode = MODE_VARIABLE;
        state.refreshTime = 1000;
        state.control = '';
        state.shadow = 'shadow';
        state.title = '';
        state.panel = '';
        state.variables1 = [];
        state.variables2 = [];
        state.enabled = {};
        state.options = {};
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    __NYX_BOOTSTRAP__.Modal.getOrCreateInstance(controlModal.value).show();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const newWidgetStep2 = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    createWidget({
        id: state.id,
        mode: state.mode,
        refreshTime: state.refreshTime,
        control: state.control,
        shadow: state.shadow,
        title: state.title,
        panel: state.panel,
        variables1: state.variables1,
        variables2: state.variables2,
        enabled: state.enabled,
        options: state.options,
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    __NYX_BOOTSTRAP__.getOrCreateInstance(controlModal.value).hide();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const createComponent = (component, attributes) => {

    const vnode = h(component, attributes);

    vnode.appContext = appContext;

    return vnode;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const createWidget = (widgetDescr) => {

    /*----------------------------------------------------------------------------------------------------------------*/
    /* GET PANEL                                                                                                      */
    /*----------------------------------------------------------------------------------------------------------------*/

    const el = document.querySelector(`[data-panel="${widgetDescr.panel}"]`);

    if(!el)
    {
        return;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* CREATE / UPDATE WIDGET                                                                                         */
    /*----------------------------------------------------------------------------------------------------------------*/

    let widget;

    if(!(widgetDescr.id in widgetDict))
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const locked = configStore.globals.interfacePanels[widgetDescr.panel].locked;

        /*------------------------------------------------------------------------------------------------------------*/

        if(!widgetDescr.h) {
            widgetDescr.h = Math.round(NB_COLUMNS * el.offsetHeight / el.offsetWidth / 4);
        }

        if(!widgetDescr.w) {
            widgetDescr.w = Math.round(NB_COLUMNS * 1.000000000000000000000000000000 / 4);
        }

        /*------------------------------------------------------------------------------------------------------------*/

        widget = el.gridstack.addWidget({
            noMove: locked,
            noResize: locked,
            x: widgetDescr.x,
            y: widgetDescr.y,
            h: widgetDescr.h,
            w: widgetDescr.w,
            content: `
                <div class="card h-100 w-100 m-0">
                    <div class="card-header px-3 py-1">
                        <span class="widget-title"></span>
                        <span class="${locked ? 'd-none' : ''}">
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

        widgetDict[widgetDescr.id] = widget;

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

    widgetDescr.enabled = Object.fromEntries(widgetDescr.variables1.map((variable) => [variable, widgetDescr.enabled?.[variable] ?? true]));

    SHADOWS.forEach((shadow) => widget.classList.toggle(shadow.value, widgetDescr.shadow === shadow.value));

    widget.querySelector('.widget-title').textContent = widgetDescr.title;

    /*----------------------------------------------------------------------------------------------------------------*/

    configStore.globals.interfaceWidgets[widgetDescr.id] = widget.descr = widgetDescr;

    /*----------------------------------------------------------------------------------------------------------------*/
    /* CREATE / UPDATE COMPONENT                                                                                      */
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

        const groupDescr = widgetDescr.variables1.map((defXXXVector) => nyxStore.defXXXVectorDict[defXXXVector]).filter(Boolean);

        if(groupDescr.length > 0)
        {
            try
            {
                const vnode = createComponent(NyxGroup, {groupDescr: groupDescr});

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

    let interval = setInterval(() => {

        const grids = GridStack.initAll({float: true, margin: 0, column: NB_COLUMNS});

        if(grids.length > 0)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            grids.forEach((grid) => {

                grid.on('resizestop', (_, el) => {

                    updateWidget(el)
                });

                grid.on('dragstop', (_, el) => {

                    updateWidget(el)
                });
            });

            /*--------------------------------------------------------------------------------------------------------*/

            clearInterval(interval);

            interval = null

            init();

            /*--------------------------------------------------------------------------------------------------------*/
        }

    }, 100);

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    /*----------------------------------------------------------------------------------------------------------------*/

    final();

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARDS                                                                                                  -->
    <!-- *********************************************************************************************************** -->

    <div class="overflow-y-auto h-100 w-100 p-3">

        <nyx-dashboard :show-devices="configStore.globals.showNyxInterfaces" @connect="connect" @disconnect="disconnect">

            <!-- *************************************************************************************************** -->

            <template v-if="configStore.globals.showUserInterfaces">

                <tab-pane class="pt-3" :title="panel.label" v-for="panel in panels" :key="panel.value">

                    <div class="grid-stack h-100 w-100" :data-panel="panel.value"></div>

                </tab-pane>

            </template>

            <!-- *************************************************************************************************** -->

            <template v-slot:button>

                <button class="btn btn-sm btn-primary ms-0" type="button" :disabled="!nyxStore.isConnected" data-bs-toggle="offcanvas" data-bs-target="#controlCanvas">
                    <i class="bi bi-list"></i>
                </button>

                <button class="btn btn-sm btn-primary ms-2" type="button" :disabled="!nyxStore.isConnected" @click="newWidget(null)">
                    <i class="bi bi-plus-lg"></i> New widget
                </button>

                <button class="btn btn-sm btn-success ms-2" type="button" :disabled="!nyxStore.isConnected" @click="configStore.save()">
                    <i class="bi bi-check-lg"></i> Save dashboards
                </button>

            </template>

            <!-- *************************************************************************************************** -->

        </nyx-dashboard>

    </div>

    <!-- *********************************************************************************************************** -->
    <!-- OFFCANVAS                                                                                                   -->
    <!-- *********************************************************************************************************** -->

    <div class="offcanvas offcanvas-end" tabindex="-1" id="controlCanvas">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title">
                <i class="bi bi-list"></i>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">

            <!-- *************************************************************************************************** -->

            <div class="list-group">
                <template v-for="(widgetDescr, index1) in Object.values(configStore.globals.interfaceWidgets)" :key="widgetDescr.id">

                    <!-- ******************************************************************************************* -->

                    <div class="list-group-item" v-if="widgetDescr.mode !== MODE_COMMAND">
                        <div class="ms-1 me-auto">
                            <div class="fw-bold">
                                {{ widgetDescr.title }}
                            </div>
                            <div class="form-check form-switch" v-for="(variable, index2) in widgetDescr.variables1" :key="variable">
                                <input class="form-check-input" type="checkbox" role="switch" :id="`FE664D_${index1}${index2}`" v-model="widgetDescr.enabled[variable]">
                                <label class="form-check-label" :for="`FE664D_${index1}${index2}`">
                                    {{ variable }}
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- ******************************************************************************************* -->

                </template>
            </div>

            <!-- *************************************************************************************************** -->

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
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="E9549BAB">Refresh time [ms]</label>
                                            <input class="form-control form-control-sm" type="number" min="1" step="1" id="E9549BAB" placeholder="Refresh time" v-model="state.refreshTime" :disabled="state.mode !== MODE_VARIABLE && state.mode !== MODE_SCATTER" required="required" />
                                        </div>
                                    </div>
                                </div>

                                <!-- ******************************************************************************* -->

                                <div class="row">
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
                                                :options="panels.filter((panel) => !panel.locked)" v-model="state.panel" />
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="F938E61B">Title</label>
                                            <input class="form-control form-control-sm" type="text" id="F938E61B" placeholder="Plot title" v-model="state.title" />
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

.grid-stack-item > .ui-resizable-se {

    background-image: none;
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
