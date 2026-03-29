/*--------------------------------------------------------------------------------------------------------------------*/

import * as geolocation from '@tauri-apps/plugin-geolocation';

/*--------------------------------------------------------------------------------------------------------------------*/

const HAS_TAURI = window['__TAURI__'] !== undefined;

/*--------------------------------------------------------------------------------------------------------------------*/

const OPTIONS = {
    enableHighAccuracy: true,
    maximumAge: 0x00,
    timeout: 30000,
};

/*--------------------------------------------------------------------------------------------------------------------*/

const getErrorMessage = (error) => {

    switch(error.code)
    {
        case error.PERMISSION_DENIED:
            return 'Permission denied.';

        case error.POSITION_UNAVAILABLE:
            return 'Position unavailable.';

        case error.TIMEOUT:
            return 'Timeout.';

        default:
            return 'Unknown error.';
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _getGeolocation = () => {

    if(HAS_TAURI)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        return geolocation.checkPermissions().then((permissions) => {

            if(['prompt', 'prompt-with-rationale'].includes(permissions.location))
            {
                return geolocation.requestPermissions(['location']).then((permissions) => {

                    if(permissions.location !== 'granted')
                    {
                        throw new Error('Permission denied.');
                    }

                    return geolocation.getCurrentPosition(OPTIONS).catch((error) => {

                        throw new Error(getErrorMessage(error));
                    });
                });
            }

            return geolocation.getCurrentPosition(OPTIONS).catch((error) => {

                throw new Error(getErrorMessage(error));
            });
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }
    else
    {
        /*------------------------------------------------------------------------------------------------------------*/

        return new Promise((resolve, reject) => {

            if(typeof navigator.geolocation === 'object')
            {
                navigator.geolocation.getCurrentPosition(resolve, (error) => {

                    reject(new Error(getErrorMessage(error)));

                }, OPTIONS);
            }
            else
            {
                reject(new Error('Not supported.'));
            }
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    install(app)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        app.provide('geolocation', {
            getGeolocation: _getGeolocation
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
