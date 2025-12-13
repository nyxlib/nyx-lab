/*--------------------------------------------------------------------------------------------------------------------*/

import * as geolocation from '@tauri-apps/plugin-geolocation';

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

const _getGeolocation_step2 = (resolve, reject) => {

    geolocation.getCurrentPosition(OPTIONS).then(resolve).catch((error) => {

        reject(new Error(getErrorMessage(error)));
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _getGeolocation = () => {

    return new Promise((resolve, reject) => {

        if(window['__TAURI__'] !== undefined)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            geolocation.checkPermissions().then((permissions) => {

                if(['prompt', 'prompt-with-rationale'].includes(permissions.location))
                {
                    geolocation.requestPermissions(['location']).then((permissions) => {

                        if(permissions.location !== 'granted')
                        {
                            reject(new Error('Permission denied.'));
                        }
                        else
                        {
                            _getGeolocation_step2(resolve, reject);
                        }
                    });
                }
                else
                {
                    _getGeolocation_step2(resolve, reject);
                }
            });

            /*--------------------------------------------------------------------------------------------------------*/
        }
        else
        {
            /*--------------------------------------------------------------------------------------------------------*/

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

            /*--------------------------------------------------------------------------------------------------------*/
        }
    });
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
