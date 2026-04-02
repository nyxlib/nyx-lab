/*--------------------------------------------------------------------------------------------------------------------*/

import router from '@/router.js';

/*--------------------------------------------------------------------------------------------------------------------*/

async function allSettledSequential(iterable)
{
    return Promise.allSettled(iterable);
}

/*--------------------------------------------------------------------------------------------------------------------*/

const addonFunctions = (DEFAULT_GLOBALS) => ({

    /*----------------------------------------------------------------------------------------------------------------*/
    /* INITIALIZATION & FINALIZATION                                                                                  */
    /*----------------------------------------------------------------------------------------------------------------*/

    initAddon(descr)
    {
        return this.addon.load(descr.url).then(([addon, name, just_loaded]) => {

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
        return this.addon.load(descr.url).then(([addon, name, just_loaded]) => {

            console.log('start: ' + name + ', started: ' + descr.started);

            if(!descr.started && !just_loaded)
            {
                /*----------------------------------------------------------------------------------------------------*/

                this.confPanels[name] = {descr: descr, addon: addon, panels: []};
                this.appPanels[name] = {descr: descr, addon: addon, panels: []};
                this.controls[name] = {descr: descr, addon: addon, ctrls: []};
                this.functions[name] = {descr: descr, addon: addon, funcs: {}};

                /*----------------------------------------------------------------------------------------------------*/

                if(typeof addon.start === 'function')
                {
                    addon.start(this.addon, name);
                }

                /*----------------------------------------------------------------------------------------------------*/

                for(const panel of this.appPanels[name]?.panels ?? [])
                {
                    router.addRoute(panel);
                }

                /*----------------------------------------------------------------------------------------------------*/
            }

            descr.started = true;

            this.console.push(`Starting addon '${descr.url}': [OKAY]`);

        }).catch((e) => {

            this.console.push(`Starting addon '${descr.url}': [ERROR]\n${e}`);
        });
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    stopAddon(descr)
    {
        return this.addon.load(descr.url).then(([addon, name, just_loaded]) => {

            console.log('stop: ' + name + ', started: ' + descr.started);

            if(descr.started && !just_loaded)
            {
                /*----------------------------------------------------------------------------------------------------*/

                for(const panel of this.appPanels[name]?.panels ?? [])
                {
                    router.removeRoute(panel.id);
                }

                /*----------------------------------------------------------------------------------------------------*/

                if(typeof addon.stop === 'function')
                {
                    addon.stop(this.addon, name);
                }

                /*----------------------------------------------------------------------------------------------------*/

                delete this.confPanels[name];
                delete this.appPanels[name];
                delete this.controls[name];
                delete this.functions[name];

                /*----------------------------------------------------------------------------------------------------*/
            }

            descr.started = false;

            this.console.push(`Stopping addon '${descr.url}': [OKAY]`);

        }).catch((e) => {

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
