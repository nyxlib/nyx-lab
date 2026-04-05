/*--------------------------------------------------------------------------------------------------------------------*/

import router from '@/router';

/*--------------------------------------------------------------------------------------------------------------------*/

import addonDefault from '@/components/dashboard/addon/default';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const _addonDict = {};

/*--------------------------------------------------------------------------------------------------------------------*/
/* HELPERS                                                                                                            */
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
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

function _load(path)
{
    /*----------------------------------------------------------------------------------------------------------------*/

    path = path.trim();

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
            resolve(_addonDict[path]);

            return;
        }

        /*------------------------------------------------------------------------------------------------------------*/

        if(path.endsWith('/default/latest/'))
        {
            const addon = _addonDict[path] = {
                path: path,
                name: 'addon_default',
                module: addonDefault,
                initialized: false,
            };

            resolve(addon);

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

                        const name = json.entry;

                        const module = globalThis[name]?.default;

                        /*--------------------------------------------------------------------------------------------*/

                        if(module !== undefined)
                        {
                            const addon = _addonDict[path] = {
                                path: path,
                                name: name,
                                module: module,
                                initialized: false,
                            };

                            resolve(addon);
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
    /* INITIALIZATION                                                                                                 */
    /*----------------------------------------------------------------------------------------------------------------*/

    initAddon(globals, descr)
    {
        return _load(descr.url).then((addon) => {

            if(!addon.initialized)
            {
                /*----------------------------------------------------------------------------------------------------*/

                const TEMP_GLOBALS = {};

                /*----------------------------------------------------------------------------------------------------*/

                if(typeof addon.module.init === 'function')
                {
                    addon.module.init(TEMP_GLOBALS, this.addon, name);
                }

                /*----------------------------------------------------------------------------------------------------*/

                for(const key of Object.keys(TEMP_GLOBALS))
                {
                    if(!(key in globals)) globals[key] = TEMP_GLOBALS[key];

                    if(!(key in DEFAULT_GLOBALS)) DEFAULT_GLOBALS[key] = TEMP_GLOBALS[key];
                }

                /*----------------------------------------------------------------------------------------------------*/

                addon.initialized = true;

                descr.started = false;

                /*----------------------------------------------------------------------------------------------------*/
            }

            this.console.push(`Initializing addon '${descr.url}': [OKAY]`);

        }).catch((e) => {

            this.console.push(`Initializing addon '${descr.url}': [ERROR]\n${e}`);
        });
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    initAddons(globals)
    {
        return allSettledSequential(
            Object.values(globals.addons).filter((x) => x.type === 'addon').sort((x, y) => +(x.rank - y.rank)).map((addon) => this.initAddon(globals, addon))
        );
    },

    /*----------------------------------------------------------------------------------------------------------------*/
    /* START & STOP                                                                                                   */
    /*----------------------------------------------------------------------------------------------------------------*/

    startAddon(descr)
    {
        return _load(descr.url).then((addon) => {

            let e = null;

            if(addon.initialized && !descr.started)
            {
                /*----------------------------------------------------------------------------------------------------*/

                this.confPanels[addon.name] = {descr: descr, addon: addon, panels: []};
                this.appPanels[addon.name] = {descr: descr, addon: addon, panels: []};
                this.controls[addon.name] = {descr: descr, addon: addon, ctrls: []};
                this.functions[addon.name] = {descr: descr, addon: addon, funcs: {}};

                /*----------------------------------------------------------------------------------------------------*/

                try
                {
                    if(typeof addon.module.start === 'function')
                    {
                        addon.module.start(this.addon, addon.name);
                    }
                }
                catch(f)
                {
                    e = f;
                }

                /*----------------------------------------------------------------------------------------------------*/

                for(const panel of this.appPanels[addon.name]?.panels ?? [])
                {
                    router.addRoute(panel);
                }

                /*----------------------------------------------------------------------------------------------------*/
            }

            if(e === null)
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
        return _load(descr.url).then((addon) => {

            let e = null;

            if(addon.initialized && descr.started)
            {
                /*------------------------------------------------------------------------------------------------*/

                for(const panel of this.appPanels[addon.name]?.panels ?? [])
                {
                    router.removeRoute(panel.id);
                }

                /*----------------------------------------------------------------------------------------------------*/

                try
                {
                    if(typeof addon.stop === 'function')
                    {
                        addon.stop(this.addon, addon.name);
                    }
                }
                catch(f)
                {
                    e = f;
                }

                /*----------------------------------------------------------------------------------------------------*/

                delete this.confPanels[addon.name];
                delete this.appPanels[addon.name];
                delete this.controls[addon.name];
                delete this.functions[addon.name];

                /*----------------------------------------------------------------------------------------------------*/
            }

            /*--------------------------------------------------------------------------------------------------------*/

            if(e === null)
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

        if(Object.prototype.toString.call(globals) === '[object Object]')
        {
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
        }
        else
        {
            globals = {addons: {}};
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
