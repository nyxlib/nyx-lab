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
        validator: (value) => ['bool', 'number', 'string'].includes(value.trim()),
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
        required: true,
    },
});

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

}, {immediate: true, deep: false});

/*--------------------------------------------------------------------------------------------------------------------*/

const uid = uuid();

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

/* TO BE CHECKED !!! */

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
                :value="String(value) === 'true' ? 'true' : 'false'"
                :id="uid"
                @change="(e) => {
                    const _value = e.target.value === 'true';
                    emit('update:modelValue', _value);
                    value = _value;
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
                   :value="value"
                   :id="uid"
                   @input="(e) => {
                    const _value = e.target.value.trim() ? e.target.valueAsNumber : null;
                    emit('update:modelValue', _value);
                    value = _value;
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
                :value="value"
                :id="uid"
                @input="(e) => {
                    const _value = e.target.value.trim() ? e.target.value.trim() : null;
                    emit('update:modelValue', _value);
                    value = _value;
                }"
            />
        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
