<!--suppress JSValidateTypes -->
<script setup>

/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watch, onMounted} from 'vue';

import {v4 as uuid} from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    type: {
        type: String,
        required: true,
        validator: (value) => ['boolean', 'number', 'string'].includes(value?.trim()),
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
        default: Number.NaN,
    },
    max: {
        type: Number,
        required: false,
        default: Number.NaN,
    },
    step: {
        type: Number,
        required: false,
        default: Number.NaN,
    },
    defaultValue: {
        type: [Boolean, Number, String],
        required: true,
    },
    modelValue: {
        type: [Boolean, Number, String],
        required: false,
        default: null,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits(['update:modelValue']);

/*--------------------------------------------------------------------------------------------------------------------*/

const valueRef = ref(props.modelValue ?? props.defaultValue);

/*--------------------------------------------------------------------------------------------------------------------*/

const uid = uuid();

/*--------------------------------------------------------------------------------------------------------------------*/
/* WATCHERS                                                                                                           */
/*--------------------------------------------------------------------------------------------------------------------*/

watch(() => props.modelValue, (value) => {

    valueRef.value = value ?? props.defaultValue;

}, {immediate: true});

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    if(props.modelValue === null
       ||
       props.modelValue === undefined
    ) {
        emit('update:modelValue', valueRef.value);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- BOOL                                                                                                        -->
    <!-- *********************************************************************************************************** -->

    <div class="row mb-2" v-if="props.type.toLowerCase() === 'boolean'">
        <label class="col-sm-3 col-form-label" :for="uid">
            {{ props.label }}
        </label>
        <div class="col-sm-9">
            <select class="form-select form-select-sm"
                    :value="String(valueRef) === 'true' ? 'true' : 'false'"
                    :id="uid"
                    @change="(e) => {
                        const value = e.target.value === 'true';
                        emit('update:modelValue', value);
                        valueRef.value = value;
                    }"
            >
                <option value="true">true</option>
                <option value="false">false</option>
            </select>
        </div>
    </div>

    <!-- *********************************************************************************************************** -->
    <!-- NUMBER                                                                                                      -->
    <!-- *********************************************************************************************************** -->

    <div class="row mb-2" v-if="props.type.toLowerCase() === 'number'">
        <label class="col-sm-3 col-form-label" :for="uid">
            {{ props.label }}
        </label>
        <div class="col-sm-9">
            <input class="form-control form-control-sm" type="number"
                   :value="valueRef"
                   :min="Number.isFinite(props.min) ? props.min : undefined"
                   :max="Number.isFinite(props.max) ? props.max : undefined"
                   :step="Number.isFinite(props.step) ? props.step : undefined"
                   :id="uid"
                   @input="(e) => {
                        const value = e.target.value.trim() ? e.target.valueAsNumber : null;
                        emit('update:modelValue', value);
                        valueRef.value = value;
                   }"
            />
        </div>
    </div>

    <!-- *********************************************************************************************************** -->
    <!-- STRING                                                                                                      -->
    <!-- *********************************************************************************************************** -->

    <div class="row mb-2" v-if="props.type.toLowerCase() === 'string'">
        <label class="col-sm-3 col-form-label" :for="uid">
            {{ props.label }}
        </label>
        <div class="col-sm-9">
            <input class="form-control form-control-sm" type="text"
                   :value="valueRef"
                   :id="uid"
                   @input="(e) => {
                        const value = e.target.value.trim() ? e.target.value.trim() : null;
                        emit('update:modelValue', value);
                        valueRef.value = value;
                   }"
            />
        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
