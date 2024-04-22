<!--suppress CssUnusedSymbol, CssUnknownTarget -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {onMounted} from 'vue';

import Split from 'split.js';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    sizes: {
        type: Array,
        default: () => [
            25,
            75,
        ],
    },
    direction: {
        type: String,
        default: 'horizontal',
        validator: (x) => ['horizontal', 'vertical'].includes(x),
    },
    gutterSize: {
        type: Number,
        default: 3,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits([
    'resize'
]);

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(async () => {

    const splitter = Split([
        '#A63A8EE3',
        '#DE938E40',
    ], {
        sizes: props.sizes,
        direction: props.direction,
        gutterSize: props.gutterSize,
        onDragEnd: () => {

            emit('resize', {sizes: splitter.getSizes()});
        },
    });

    window.addEventListener('resize', () => {

        emit('resize', {sizes: splitter.getSizes()});
    });
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div :class="`d-flex ${direction === 'vertical' ? 'flex-column' : 'flex-row'} h-100 w-100`">

        <div id="A63A8EE3" style="height: 100%; overflow-y: scroll;">
            <slot name="left"></slot>
        </div>

        <div id="DE938E40" style="height: 100%; overflow-y: scroll;">
            <slot name="right"></slot>
        </div>

    </div>

    <!-- *********************************************************************************************************** -->

</template>

<style>
/*--------------------------------------------------------------------------------------------------------------------*/

.gutter {
    background-color: rgba(var(--bs-body-color-rgb), 0.03);
    background-repeat: no-repeat;
    background-position: 50%;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.gutter.gutter-horizontal {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
    cursor: col-resize;
}

.gutter.gutter-vertical {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
    cursor: row-resize;
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
