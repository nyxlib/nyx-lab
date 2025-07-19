// noinspection JSUnresolvedReference, JSUnusedGlobalSymbols
/*--------------------------------------------------------------------------------------------------------------------*/

import {markRaw} from 'vue';

import {useNyxStore} from 'vue-nyx';

/*--------------------------------------------------------------------------------------------------------------------*/

import router from '../router';

import useConfigStore from '../stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const _addonDict = {};

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

function _register(app, path, name)
{
    const module = window[name]?.default;

    if(typeof module !== 'undefined')
    {
        /*------------------------------------------------------------------------------------------------------------*/

        _addonDict[path] = name;

        /*------------------------------------------------------------------------------------------------------------*/

        if(typeof module.install === 'function')
        {
            app.use(module);
        }

        /*------------------------------------------------------------------------------------------------------------*/
    }

    return module;
}

/*--------------------------------------------------------------------------------------------------------------------*/

function _load(app, path)
{
    /*----------------------------------------------------------------------------------------------------------------*/

    if(typeof window['__TAURI__'] !== 'undefined') {
        path = path.replace('addon://', 'http://localhost:7878/repo/');
    }
    else {
        path = path.replace('addon://', 'https://addons.nyxlib.org/repo/');
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return new Promise((resolve, reject) => {

        /*------------------------------------------------------------------------------------------------------------*/

        if(path in _addonDict)
        {
            const name = _addonDict[path];

            resolve([window[name].default, name, false]);

            return;
        }

        /*------------------------------------------------------------------------------------------------------------*/

        fetch(`${path}/package.json?_=${new Date().getTime()}`, {method: 'GET', mode: 'cors'}).catch(reject).then((response) => {

            response.json().catch(reject).then((json) =>  {

                if(json.main
                   &&
                   json.entry
                ) {
                    /*------------------------------------------------------------------------------------------------*/

                    const script = document.createElement('script');

                    /*------------------------------------------------------------------------------------------------*/

                    script.addEventListener('load', () => {

                        resolve([_register(app, path, json.entry), json.entry, true]);
                    });

                    /*------------------------------------------------------------------------------------------------*/

                    script.addEventListener('error', () => {

                        reject('corrupted addon');
                    });

                    /*------------------------------------------------------------------------------------------------*/

                    script.src = `${path}/${json.main}?_=${new Date().getTime()}`;

                    script.type = 'text/javascript';

                    script.async = true;

                    /*------------------------------------------------------------------------------------------------*/

                    document.head.appendChild(script);

                    /*------------------------------------------------------------------------------------------------*/
                }
                else {

                    reject('missing metadata');
                }
            });
        });
    });

    /*----------------------------------------------------------------------------------------------------------------*/
}

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

const _updateVariables_func = (name1, name2, fractionDigits) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const nyxStore = useNyxStore();
    const configStore = useConfigStore();

    /*----------------------------------------------------------------------------------------------------------------*/

    try
    {
        if(configStore.globals[name2])
        {
            const def = nyxStore.resolve(configStore.globals[name2]);

            if(def?.$)
            {
                configStore.globals[name1] = Number(Number(def.$).toFixed(fractionDigits));
            }
        }
    }
    catch(_)
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
            load: (path) => _load(app, path),
            /**/
            app: () => app,
            router: () => router,
            nyxStore: () => useNyxStore(),
            configStore: () => useConfigStore(),
            newId: () => __NYX_UUID__.v4().substring(0, 13),
            /**/
            registerConfPanel: _registerConfPanel_func,
            registerAppPanel: _registerAppPanel_func,
            registerControl: _registerControl_func,
            /**/
            updateVariables: _updateVariables_func,
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
