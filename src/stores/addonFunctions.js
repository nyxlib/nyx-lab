/*--------------------------------------------------------------------------------------------------------------------*/

import router from '@/router.js';

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

                if(typeof addon.init === 'function')
                {
                    try {
                        addon.init(TEMP_GLOBALS, this.addon, name);
                    }
                    catch(e) {
                        this.console.push(e);
                    }
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

    finalAddon(descr)
    {
        return this.addon.load(descr.url).then(([addon, name, just_loaded]) => {

            if(!just_loaded)
            {
                /*----------------------------------------------------------------------------------------------------*/

                const TEMP_GLOBALS = addon.TEMP_GLOBALS ?? {};

                /*----------------------------------------------------------------------------------------------------*/

                if(typeof addon.final === 'function')
                {
                    try {
                        addon.final(TEMP_GLOBALS, this.addon, name);
                    }
                    catch(e) {
                        this.console.push(e);
                    }
                }

                /*----------------------------------------------------------------------------------------------------*/

                for(const key of Object.keys(TEMP_GLOBALS))
                {
                    if((key in this.globals)) delete this.globals[key];

                    if((key in DEFAULT_GLOBALS)) delete DEFAULT_GLOBALS[key];
                }

                /*----------------------------------------------------------------------------------------------------*/
            }

            this.console.push(`Finalizing addon '${descr.url}': [OKAY]`);

        }).catch((e) => {

            this.console.push(`Finalizing addon '${descr.url}': [ERROR]\n${e}`);
        });
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    initAddons(descrs)
    {
        return Promise.allSettled(
            Object.values(descrs ?? []).filter((x) => x.type === 'addon').sort((x, y) => +(x.rank - y.rank)).map(this.initAddon)
        );
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    finalAddons(descrs)
    {
        return Promise.allSettled(
            Object.values(descrs ?? []).filter((x) => x.type === 'addon').sort((x, y) => -(x.rank - y.rank)).map(this.finalAddon)
        );
    },

    /*----------------------------------------------------------------------------------------------------------------*/
    /* START & STOP                                                                                                   */
    /*----------------------------------------------------------------------------------------------------------------*/

    startAddon(descr)
    {
        return this.addon.load(descr.url).then(([addon, name, just_loaded]) => {

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
                    try {
                        addon.start(this.addon, name);
                    }
                    catch(e) {
                        this.console.push(e);
                    }
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
                    try {
                        addon.stop(this.addon, name);
                    }
                    catch(e) {
                        this.console.push(e);
                    }
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

        return Promise.allSettled(Object.values(addonDescrs ?? []).filter((x) => x.type === 'addon').sort((x, y) => x.rank - y.rank).map((descr) => {

            if(closeAll || descr.zombie)
            {
                descr.enabled = false;
            }

            if(descr.enabled) {
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
        return Promise.allSettled(Object.values(addonDescrs).filter((x) => x.type === 'addon' && x.zombie).map(this.finalAddon)).finally(() => {

            /*--------------------------------------------------------------------------------------------------------*/
            /* UNINSTALL ZOMBIE ADDON                                                                                 */
            /*--------------------------------------------------------------------------------------------------------*/

            Object.values(addonDescrs).filter((x) => x.zombie).forEach((descr) => {

                delete addonDescrs[descr.id];
            });

            /*--------------------------------------------------------------------------------------------------------*/
            /* UNINSTALL ZOMBIE INTERFACE PANELS                                                                      */
            /*--------------------------------------------------------------------------------------------------------*/

            Object.values(interfacePanelDescrs).filter((x) => x.zombie).forEach((descr) => {

                delete interfacePanelDescrs[descr.id];
            });

            /*--------------------------------------------------------------------------------------------------------*/
        });
    },

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default addonFunctions;

/*--------------------------------------------------------------------------------------------------------------------*/
