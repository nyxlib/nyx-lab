/*--------------------------------------------------------------------------------------------------------------------*/

import {markRaw} from 'vue';

import * as uuid from 'uuid';

import {useNyxStore} from 'vue-nyx';

/*--------------------------------------------------------------------------------------------------------------------*/

import router from '@/router';

import getRuntime from '@/runtime';

import useConfigStore from '@/stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/

const _registerConfPanel_func = (addonName, id, title, component) => {

    useConfigStore().confPanels[addonName].panels.push({
        id: id.trim(),
        title: title.trim(),
        component: markRaw(component),
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _registerAppPanel_func = (addonName, id, path, title, logo, component) => {

    useConfigStore().appPanels[addonName].panels.push({
        id: id.trim(),
        name: id.trim(),
        path: path.trim(),
        title: title.trim(),
        logo: logo.trim(),
        component: markRaw(component),
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _registerControl_func = (addonName, id, title, mode, options, component) => {

    useConfigStore().controls[addonName].ctrls.push({
        id: id.trim(),
        title: title.trim(),
        mode: mode.trim(),
        options: options,
        component: markRaw(component),
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _registerFunction_func = (addonName, funcName, func) => {

    useConfigStore().functions[addonName].funcs[funcName] = func;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _hasAddon_func = (addonName) => {

    return typeof(useConfigStore()?.functions[addonName]) === 'object';
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _hasFunction_func = (addonName, funcName) => {

    return typeof(useConfigStore()?.functions[addonName]?.funcs[funcName]) === 'function';
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _execFunction_func = (addonName, funcName, ...args) => {

    const f = useConfigStore()?.functions[addonName]?.funcs[funcName];

    if(typeof(f) !== 'function')
    {
        throw new TypeError(`Unknown function: ${funcName}`);
    }
    else
    {
        return f(...args);
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _synchronizeVariable_func = (variable) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    try
    {
        if(variable.mode === 'var')
        {
            const nyxStore = useNyxStore();

            const def = nyxStore.resolve(variable.var);

            if(def)
            {
                variable.val = nyxStore.getValue(def);
            }
        }
    }
    catch
    {
        /* IGNORE */
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    install(app)
    {
        app.provide('addon', {
            app: app,
            router: router,
            runtime: getRuntime,
            nyxStore: useNyxStore,
            configStore: useConfigStore,
            /**/
            newId: () => uuid.v4().substring(0, 13),
            /**/
            registerConfPanel: _registerConfPanel_func,
            registerAppPanel: _registerAppPanel_func,
            registerControl: _registerControl_func,
            registerFunction: _registerFunction_func,
            /**/
            hasAddon: _hasAddon_func,
            hasFunction: _hasFunction_func,
            execFunction: _execFunction_func,
            /**/
            synchronizeVariable: _synchronizeVariable_func,
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
