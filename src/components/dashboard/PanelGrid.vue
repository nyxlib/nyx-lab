<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, computed, nextTick, reactive, onMounted, onBeforeUnmount} from 'vue';

import {useNyxStore, NyxGroup} from 'vue-nyx';

import {GridStack} from 'gridstack';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import ControlCanvas from '@/components/dashboard/ControlCanvas.vue';
import ControlModal from '@/components/dashboard/ControlModal.vue';

import useConfigStore from '@/stores/config.js';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const dialog = inject('dialog');

/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    panel: {
        type: Object,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    currentWidgetId: null,
});

/*--------------------------------------------------------------------------------------------------------------------*/

const controlById = computed(() => new Map(Object.values(configStore.controls).flatMap((x) => x.ctrls).map((x) => [x.id, x.component ?? null])));

/*--------------------------------------------------------------------------------------------------------------------*/

const widgets = computed(() => Object.values(configStore.globals.interfaceWidgets).filter((x) => x.panel === props.panel.id));

/*--------------------------------------------------------------------------------------------------------------------*/

const locked = computed(() => props.panel.locked || !nyxStore.isConnected);

/*--------------------------------------------------------------------------------------------------------------------*/

const canvasEl = ref(null);
const modalEl = ref(null);
const gridEl = ref(null);

let observer = null;

let grid = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const newEditWidget = (id = null) => {

    state.currentWidgetId = id || uuid.v4();

    modalEl.value.show();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const closeWidget = (id) => {

    dialog.confirm('Are you sure you want to delete this widget?', 'Nyx Lab').then((choice) => {

        if(choice)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            const el = gridEl.value?.querySelector(`[data-id="${id}"]`);

            if(el)
            {
                grid.removeWidget(el, true);
            }

            /*--------------------------------------------------------------------------------------------------------*/

            delete configStore.globals.interfaceWidgets[id];

            /*--------------------------------------------------------------------------------------------------------*/
        }
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const createWidget = (id) => {

    nextTick(() => {

        const el = gridEl.value?.querySelector(`[data-id="${id}"]`);

        const widget = configStore.globals.interfaceWidgets[id];

        if(el && widget)
        {
            grid.update(grid.makeWidget(el), {
                w: widget.w,
                h: widget.h,
                noMove: false,
                noResize: false,
                autoPosition: true,
            });
        }
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    const CELL_WIDTH_PX = 24;
    const MIN_COLS = 16;
    const SNAP = 4;

    /*----------------------------------------------------------------------------------------------------------------*/

    const getColumns = () => {

        const width = gridEl.value?.clientWidth ?? 0;

        return Math.max(MIN_COLS, Math.floor(width / CELL_WIDTH_PX));
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    grid = GridStack.init({float: true, margin: 0, column: getColumns(), disableOneColumnMode: true}, gridEl.value);

    if(grid)
    {
        /*------------------------------------------------------------------------------------------------------------*/
        /* WINDOW RESIZING                                                                                            */
        /*------------------------------------------------------------------------------------------------------------*/

        let lastCols = 0;

        const updateColumns = () => {

            const cols = Math.max(MIN_COLS, Math.floor(getColumns() / SNAP) * SNAP);

            if(lastCols !== cols)
            {
                lastCols = cols;

                grid.column(cols, 'none');
            }
        };

        /*------------------------------------------------------------------------------------------------------------*/

        observer = new ResizeObserver(updateColumns);

        observer.observe(gridEl.value);

        updateColumns();

        /*------------------------------------------------------------------------------------------------------------*/
        /* WIDGET RESIZING                                                                                            */
        /*------------------------------------------------------------------------------------------------------------*/

        const updateWidget = (el) => {

            const node = el.gridstackNode;

            const widget = configStore.globals.interfaceWidgets[el.dataset?.id];

            if(node && widget)
            {
                widget.x = node.x;
                widget.y = node.y;
                widget.w = node.w;
                widget.h = node.h;
            }
        };

        /*------------------------------------------------------------------------------------------------------------*/

        grid.on('resizestop', (_, el) => {

            updateWidget(el);
        });

        grid.on('dragstop', (_, el) => {

            updateWidget(el);
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/

onBeforeUnmount(() => {

    observer?.disconnect(false);

    grid?.destroy(false);
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- GRID                                                                                                        -->
    <!-- *********************************************************************************************************** -->

    <div class="grid-stack h-100 w-100" ref="gridEl">

        <div
            class="grid-stack-item"
            :data-id="widget.id"
            :gs-x="widget.x ?? undefined"
            :gs-y="widget.y ?? undefined"
            :gs-w="widget.w ?? undefined"
            :gs-h="widget.h ?? undefined"
            :gs-no-move="locked ? 'true' : undefined"
            :gs-no-resize="locked ? 'true' : undefined"
            v-for="widget in widgets" :key="widget.id"
        >
            <div :class="['grid-stack-item-content', widget.shadow, 'card', 'h-100', 'w-100', 'm-0']">
                <div class="card-header px-3 py-1">
                    <span>
                        {{ widget.title || '/' }}
                    </span>
                    <span :class="{'d-none': locked}">
                      <i class="bi bi-pencil me-1" style="cursor: pointer;" @click="newEditWidget(widget.id)"></i>
                      <i class="bi bi-x-lg me-0" style="cursor: pointer;" @click="closeWidget(widget.id)"></i>
                    </span>
                </div>
                <div :class="['card-body', 'px-1', 'py-1', {'nyx-group-disabled': !nyxStore.isConnected}]">

                    <!-- ******************************************************************************************* -->

                    <nyx-group :group-descr="widget.variables1.map((vector) => nyxStore.defXXXVectorDict[vector]).filter(Boolean)" v-if="widget.mode === 'command'" />

                    <!-- ******************************************************************************************* -->

                    <component v-else-if="controlById.get(widget.control)" v-bind="widget" :is="controlById.get(widget.control)" />

                    <!-- ******************************************************************************************* -->

                </div>
            </div>
        </div>

    </div>

    <!-- *********************************************************************************************************** -->
    <!-- CANVAS                                                                                                      -->
    <!-- *********************************************************************************************************** -->

    <control-canvas :widgets="widgets" ref="canvasEl" />

    <!-- *********************************************************************************************************** -->
    <!-- MODAL                                                                                                       -->
    <!-- *********************************************************************************************************** -->

    <control-modal :widget-id="state.currentWidgetId" ref="modalEl" v-model="configStore.globals.interfaceWidgets[state.currentWidgetId]" @created="createWidget" />

    <!-- *********************************************************************************************************** -->
    <!-- BUTTONS                                                                                                     -->
    <!-- *********************************************************************************************************** -->

    <teleport to="#nyx_toolbar">

        <button class="btn btn-sm btn-outline-primary ms-0" type="button" :disabled="!nyxStore.isConnected" @click="canvasEl.show()">
            <i class="bi bi-list"></i>
        </button>

        <button class="btn btn-sm btn-outline-primary ms-2" type="button" :disabled="!nyxStore.isConnected || panel.locked" @click="newEditWidget()">
            <i class="bi bi-plus-lg"></i> New widget
        </button>

        <button class="btn btn-sm btn-outline-success ms-2" :class="{'pulse-btn': configStore.modified}" type="button" :disabled="!nyxStore.isConnected" @click="configStore.apply()">
            <i class="bi bi-check-lg"></i> Apply changes
        </button>

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
