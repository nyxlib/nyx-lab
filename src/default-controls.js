/*--------------------------------------------------------------------------------------------------------------------*/

import VariableCtrl from '@/components/dashboard/widgets/VariableCtrl.vue';
import ScatterCtrl from '@/components/dashboard/widgets/ScatterCtrl.vue';

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
            'default-scatter-control',
            'Variable vs Variable',
            'scatter',
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
            ScatterCtrl
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
