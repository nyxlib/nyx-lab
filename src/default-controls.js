/*--------------------------------------------------------------------------------------------------------------------*/

import VariableCtrl from '@/components/dashboard/widgets/VariableCtrl.vue';
import Scatter2DCtrl from '@/components/dashboard/widgets/Scatter2DCtrl.vue';
import Scatter3DCtrl from '@/components/dashboard/widgets/Scatter3DCtrl.vue';

/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    /*----------------------------------------------------------------------------------------------------------------*/

    init(DEFAULT_GLOBALS, addon, addonName)
    {
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    start(addon, addonName)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        addon.registerControl(
            addonName,
            'default-variable-control',
            'Variable vs Time',
            'variable',
            [
                {
                    type: 'number',
                    name: 'y-min',
                    label: 'Y min',
                    defaultValue: null
                },
                {
                    type: 'number',
                    name: 'y-max',
                    label: 'Y max',
                    defaultValue: null
                },
            ],
            VariableCtrl
        );

        /*------------------------------------------------------------------------------------------------------------*/

        addon.registerControl(
            addonName,
            'default-scatter2d-control',
            'Variable vs Variable',
            'scatter2d',
            [
                {
                    type: 'number',
                    name: 'x-min',
                    label: 'X min',
                    defaultValue: null
                },
                {
                    type: 'number',
                    name: 'x-max',
                    label: 'X max',
                    defaultValue: null
                },
                {
                    type: 'number',
                    name: 'y-min',
                    label: 'Y min',
                    defaultValue: null
                },
                {
                    type: 'number',
                    name: 'y-max',
                    label: 'Y max',
                    defaultValue: null
                },
            ],
            Scatter2DCtrl
        );

        /*------------------------------------------------------------------------------------------------------------*/

        addon.registerControl(
            addonName,
            'default-scatter3d-control',
            'Variable vs Variable vs Variable',
            'scatter3d',
            [
                {
                    type: 'number',
                    name: 'x-min',
                    label: 'X min',
                    defaultValue: null
                },
                {
                    type: 'number',
                    name: 'x-max',
                    label: 'X max',
                    defaultValue: null
                },
                {
                    type: 'number',
                    name: 'y-min',
                    label: 'Y min',
                    defaultValue: null
                },
                {
                    type: 'number',
                    name: 'y-max',
                    label: 'Y max',
                    defaultValue: null
                },
                {
                    type: 'number',
                    name: 'z-min',
                    label: 'Z min',
                    defaultValue: null
                },
                {
                    type: 'number',
                    name: 'z-max',
                    label: 'Z max',
                    defaultValue: null
                },
            ],
            Scatter3DCtrl
        );

        /*------------------------------------------------------------------------------------------------------------*/
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    stop(addon, addonName)
    {
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/
