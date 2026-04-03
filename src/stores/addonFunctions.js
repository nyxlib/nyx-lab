/*--------------------------------------------------------------------------------------------------------------------*/

import router from '@/router.js';

/*--------------------------------------------------------------------------------------------------------------------*/

import defaultAddon from '../default-controls.js';

/*--------------------------------------------------------------------------------------------------------------------*/

async function allSettledSequential(iterable)
{
    const results = [];

    /*----------------------------------------------------------------------------------------------------------------*/

    for(const item of iterable)
    {
        try
        {
            const value = await (typeof item === 'function' ? item() : item);

            results.push({status: 'fulfilled', value: value});
        }
        catch(reason)
        {
            results.push({status: 'rejected', reason: reason});
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return results;
}

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const _addonDict = {};

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

function _load(path)
{
    /*----------------------------------------------------------------------------------------------------------------*/

    path = path.trim();

    if(path === 'addon://default/latest/')
    {
        return Promise.resolve([defaultAddon, 'default', false]);
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    /**/ if(window['__ELECTRON__'] !== undefined) {
        path = path.replace('addon://', 'nyx://addons/');
    }
    else if(window[/**/'__TAURI__'/**/] !== undefined) {
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

        fetch(`${path}/package.json?_=${Date.now()}`, {method: 'GET', mode: 'cors'}).catch(reject).then((response) => {

            response.json().catch(reject).then((json) =>  {

                if(json.main
                   &&
                   json.entry
                ) {
                    /*------------------------------------------------------------------------------------------------*/

                    const script = document.createElement('script');

                    /*------------------------------------------------------------------------------------------------*/

                    script.addEventListener('load', () => {

                        /*--------------------------------------------------------------------------------------------*/

                        const module = globalThis[json.entry]?.default;

                        /*--------------------------------------------------------------------------------------------*/

                        if(module !== undefined)
                        {
                            _addonDict[path] = json.entry;

                            resolve([module, json.entry, true]);
                        }
                        else
                        {
                            reject(new Error('Corrupted addon'));
                        }

                        /*--------------------------------------------------------------------------------------------*/
                    });

                    /*------------------------------------------------------------------------------------------------*/

                    script.addEventListener('error', () => {

                        reject(new Error('Corrupted addon'));
                    });

                    /*------------------------------------------------------------------------------------------------*/

                    script.src = `${path}/${json.main}?_=${Date.now()}`;

                    script.type = 'text/javascript';

                    script.async = false;

                    /*------------------------------------------------------------------------------------------------*/

                    document.head.appendChild(script);

                    /*------------------------------------------------------------------------------------------------*/
                }
                else
                {
                    reject(new Error('Missing metadata'));
                }
            });
        });
    });

    /*----------------------------------------------------------------------------------------------------------------*/
}

/*--------------------------------------------------------------------------------------------------------------------*/

const addonFunctions = (DEFAULT_GLOBALS) => ({

    /*----------------------------------------------------------------------------------------------------------------*/
    /* INITIALIZATION & FINALIZATION                                                                                  */
    /*----------------------------------------------------------------------------------------------------------------*/

    initAddon(descr)
    {
        return _load(descr.url).then(([addon, name, just_loaded]) => {

            if(just_loaded)
            {
                /*----------------------------------------------------------------------------------------------------*/

                const TEMP_GLOBALS = addon.TEMP_GLOBALS = {};

                /*----------------------------------------------------------------------------------------------------*/

                descr.started = false;

                if(typeof addon.init === 'function')
                {
                    addon.init(TEMP_GLOBALS, this.addon, name);
                }

                /*----------------------------------------------------------------------------------------------------*/

                for(const key of Object.keys(TEMP_GLOBALS))
                {
                    if(!(key in this.globals)) this.globals[key] = TEMP_GLOBALS[key];

                    if(!(key in DEFAULT_GLOBALS)) DEFAULT_GLOBALS[key] = TEMP_GLOBALS[key];
                }

                /*----------------------------------------------------------------------------------------------------*/
            }

            this.console.push(`Initializing addon '${descr.url}': [OKAY]`);

        }).catch((e) => {

            this.console.push(`Initializing addon '${descr.url}': [ERROR]\n${e}`);
        });
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    initAddons(descrs)
    {
        return allSettledSequential(
            Object.values(descrs).filter((x) => x.type === 'addon').sort((x, y) => +(x.rank - y.rank)).map((addon) => this.initAddon(addon))
        );
    },

    /*----------------------------------------------------------------------------------------------------------------*/
    /* START & STOP                                                                                                   */
    /*----------------------------------------------------------------------------------------------------------------*/

    startAddon(descr)
    {
        return _load(descr.url).then(([addon, name, just_loaded]) => {

            let e = null;

            if(!descr.started && !just_loaded)
            {
                /*----------------------------------------------------------------------------------------------------*/

                this.confPanels[name] = {descr: descr, addon: addon, panels: []};
                this.appPanels[name] = {descr: descr, addon: addon, panels: []};
                this.controls[name] = {descr: descr, addon: addon, ctrls: []};
                this.functions[name] = {descr: descr, addon: addon, funcs: {}};

                /*----------------------------------------------------------------------------------------------------*/

                try
                {
                    if(typeof addon.start === 'function')
                    {
                        addon.start(this.addon, name);
                    }
                }
                catch(f)
                {
                    e = f;
                }

                /*----------------------------------------------------------------------------------------------------*/

                for(const panel of this.appPanels[name]?.panels ?? [])
                {
                    router.addRoute(panel);
                }

                /*----------------------------------------------------------------------------------------------------*/
            }

            if(e == null)
            {
                descr.started = true;
                this.console.push(`Starting addon '${descr.url}': [OKAY]`);
            }
            else
            {
                descr.started = false;
                this.console.push(`Starting addon '${descr.url}': [ERROR]\n${e}`);
            }

        }).catch((e) => {

            descr.started = false;
            this.console.push(`Starting addon '${descr.url}': [ERROR]\n${e}`);
        });
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    stopAddon(descr)
    {
        return _load(descr.url).then(([addon, name, just_loaded]) => {

            let e = null;

            if(descr.started && !just_loaded)
            {
                /*------------------------------------------------------------------------------------------------*/

                for(const panel of this.appPanels[name]?.panels ?? [])
                {
                    router.removeRoute(panel.id);
                }

                /*----------------------------------------------------------------------------------------------------*/

                try
                {
                    if(typeof addon.stop === 'function')
                    {
                        addon.stop(this.addon, name);
                    }
                }
                catch(f)
                {
                    e = f;
                }

                /*----------------------------------------------------------------------------------------------------*/

                delete this.confPanels[name];
                delete this.appPanels[name];
                delete this.controls[name];
                delete this.functions[name];

                /*----------------------------------------------------------------------------------------------------*/
            }

            /*--------------------------------------------------------------------------------------------------------*/

            if(e == null)
            {
                descr.started = false;
                this.console.push(`Stopping addon '${descr.url}': [OKAY]`);
            }
            else
            {
                descr.started = false;
                this.console.push(`Stopping addon '${descr.url}': [ERROR]\n${e}`);
            }

        }).catch((e) => {

            descr.started = false;
            this.console.push(`Stopping addon '${descr.url}': [ERROR]\n${e}`);
        });
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    startStopAddons(addonDescrs, interfacePanelDescrs, closeAll)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        return allSettledSequential(Object.values(addonDescrs).filter((x) => x.type === 'addon').sort((x, y) => x.rank - y.rank).map((descr) => {

            if(descr.enabled && !descr.zombie && !closeAll) {
                return this.startAddon(descr);
            } else {
                return this.stopAddon(descr);
            }

        })).finally(() => this._cleanup(addonDescrs, interfacePanelDescrs));

        /*------------------------------------------------------------------------------------------------------------*/
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    _cleanup(addonDescrs, interfacePanelDescrs)
    {
        /*------------------------------------------------------------------------------------------------------------*/
        /* UNINSTALL ZOMBIE ADDON                                                                                     */
        /*------------------------------------------------------------------------------------------------------------*/

        Object.values(addonDescrs).filter((x) => x.zombie).forEach((descr) => {

            delete addonDescrs[descr.id];
        });

        /*------------------------------------------------------------------------------------------------------------*/
        /* UNINSTALL ZOMBIE INTERFACE PANELS                                                                          */
        /*------------------------------------------------------------------------------------------------------------*/

        Object.values(interfacePanelDescrs).filter((x) => x.zombie).forEach((descr) => {

            delete interfacePanelDescrs[descr.id];
        });

        /*------------------------------------------------------------------------------------------------------------*/
    },

    /*----------------------------------------------------------------------------------------------------------------*/
    /* SANITIZE                                                                                                       */
    /*----------------------------------------------------------------------------------------------------------------*/

    sanitize(globals)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        if(Object.prototype.toString.call(globals.addons) === '[object Object]')
        {
            Object.values(globals.addons).filter((x) => x.type === 'addon').forEach((descr) => {

                descr.started = false;
            });
        }
        else
        {
            globals.addons = {};
        }

        /*------------------------------------------------------------------------------------------------------------*/

        globals.addons['94300404-2ea8-11f1-b3cc-83604f9dfd78'] = {
            'id': '94300404-2ea8-11f1-b3cc-83604f9dfd78',
            'rank': -999,
            'type': 'addon',
            'url': 'addon://default/latest/',
            'zombie': false,
            'enabled': true,
            'started': false,
        };

        /*------------------------------------------------------------------------------------------------------------*/

        return globals;
    },

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default addonFunctions;

/*--------------------------------------------------------------------------------------------------------------------*/
