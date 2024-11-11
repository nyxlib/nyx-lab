/*--------------------------------------------------------------------------------------------------------------------*/

import * as geolocation from '@tauri-apps/plugin-geolocation';

/*--------------------------------------------------------------------------------------------------------------------*/

const getErrorMessage = (error) => {

    switch(error.code)
    {
        case error.PERMISSION_DENIED:
            return 'Geolocation: permission denied.';

        case error.POSITION_UNAVAILABLE:
            return 'Geolocation: position unavailable.';

        case error.TIMEOUT:
            return 'Geolocation: timeout.';

        default:
            return 'Geolocation: unknown error.';
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _getGeolocation_step2 = (resolve, reject) => {

    geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        maximumAge: 0x00,
        timeout: 30000,
    }).then(resolve).catch((error) => {

        reject(getErrorMessage(error));
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _getGeolocation = () => {

    return new Promise((resolve, reject) => {

        if(typeof window['__TAURI__'] !== 'undefined')
        {
            /*--------------------------------------------------------------------------------------------------------*/

            geolocation.checkPermissions().then((permissions) => {

                if(['prompt', 'prompt-with-rationale'].includes(permissions.location))
                {
                    geolocation.requestPermissions(['location']).then((permissions) => {

                        if(permissions.location !== 'granted')
                        {
                            reject('Geolocation: permission denied.');
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

                    reject(getErrorMessage(error));

                }, {
                    enableHighAccuracy: true,
                    maximumAge: 0x00,
                    timeout: 30000,
                });
            }
            else
            {
                reject('Geolocation: not supported.');
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
