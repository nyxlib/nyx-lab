<!--suppress JSUnresolvedReference -->
<script setup>

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    type: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    min: {
        type: Number,
        required: false,
    },
    max: {
        type: Number,
        required: false,
    },
    step: {
        type: Number,
        required: false,
    },
    defaultValue: {
        type: [String, Number, Boolean],
        required: true,
    },
    modelValue: {
        type: [String, Number, Boolean],
        required: false,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits(['update:modelValue'])

/*--------------------------------------------------------------------------------------------------------------------*/

const uid = __NYX_UUID__.v4()

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="mb-2" v-if="props.type.toLowerCase() === 'bool'">
        <label class="form-label" :for="uid">
            {{ props.label }}
        </label>
        <select class="form-select form-select-sm" @change="emit('update:modelValue', $event.target.value === 'true')" :id="uid">
            <option value="true" :selected="String(props.modelValue ?? props.defaultValue) === 'true'">true</option>
            <option value="false" :selected="String(props.modelValue ?? props.defaultValue) !== 'true'">false</option>
        </select>
    </div>

    <!-- *********************************************************************************************************** -->

    <div class="mb-2" v-if="props.type.toLowerCase() === 'string'">
        <label class="form-label" :for="uid">
            {{ props.label }}
        </label>
        <input class="form-control form-control-sm" type="text" :value="props.modelValue ?? props.defaultValue" @input="emit('update:modelValue', $event.target.value)" :id="uid" />
    </div>

    <!-- *********************************************************************************************************** -->

    <div class="mb-2" v-if="props.type.toLowerCase() === 'number'">
        <label class="form-label" :for="uid">
            {{ props.label }}
        </label>
        <input class="form-control form-control-sm" type="number" :value="props.modelValue ?? props.defaultValue" @input="emit('update:modelValue', $event.target.value !== '' ? $event.target.valueAsNumber : null)" :min="props.min ?? undefined" :max="props.max ?? undefined" :step="props.step ?? undefined" :id="uid" />
    </div>

    <!-- *********************************************************************************************************** -->

</template>
