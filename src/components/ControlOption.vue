<!--suppress JSUnresolvedReference -->
<script setup>

/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watch, onMounted} from 'vue';

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
        default: NaN,
        required: false,
    },
    max: {
        type: Number,
        default: NaN,
        required: false,
    },
    step: {
        type: Number,
        default: NaN,
        required: false,
    },
    defaultValue: {
        type: [String, Number, Boolean],
        required: true,
    },
    modelValue: {
        type: [String, Number, Boolean],
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const uid = __NYX_UUID__.v4();

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits(['update:modelValue']);

/*--------------------------------------------------------------------------------------------------------------------*/

const value = ref(props.modelValue ?? props.defaultValue);

/*--------------------------------------------------------------------------------------------------------------------*/

watch(() => props.modelValue, (_value) => {

    if(value.value !== _value)
    {
        value.value = _value;
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    if(props.modelValue === null
       ||
       props.modelValue === undefined
    ) {
        emit('update:modelValue', value.value);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- BOOL                                                                                                        -->
    <!-- *********************************************************************************************************** -->

    <div class="row mb-2" v-if="props.type.toLowerCase() === 'bool'">
        <label class="col-sm-3 col-form-label" :for="uid">
            {{ props.label }}
        </label>
        <div class="col-sm-9">
            <select class="form-select form-select-sm"
                :id="uid"
                :value="String(value) === 'true' ? 'true' : 'false'"
                @change="(e) => {
                    const _value = e.target.value === 'true';
                    emit('update:modelValue', _value);
                    value.value = _value;
                }"
            >
                <option value="true">true</option>
                <option value="false">false</option>
            </select>
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
                :id="uid"
                :value="value"
                @input="(e) => {
                    const _value = e.target.value.trim() ? e.target.value.trim() : null;
                    emit('update:modelValue', _value);
                    value.value = _value;
                }"
            />
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
               :id="uid"
               :value="value"
               @input="(e) => {
                   const _value = e.target.value.trim() ? e.target.valueAsNumber : null;
                   emit('update:modelValue', _value);
                   value.value = _value;
               }"
            />
        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
