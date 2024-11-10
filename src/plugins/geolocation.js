/*--------------------------------------------------------------------------------------------------------------------*/

import * as geolocation from '@tauri-apps/plugin-geolocation';

/*--------------------------------------------------------------------------------------------------------------------*/

const _getGeolocation_step2 = (resolve, reject) => {

    geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        maximumAge: 0x00,
        timeout: 10000,
    }).then((position) => {

        resolve(position);

    }).catch((message) => {

        reject(message);
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _getGeolocation = () => {

    return new Promise((resolve, reject) => {

        if(typeof window['__TAURI__'] !== 'undefined')
        {
            /*--------------------------------------------------------------------------------------------------------*/

            geolocation.checkPermissions().then((permissions) => {

                if(permissions.location === 'prompt' || permissions.location === 'prompt-with-rationale')
                {
                    geolocation.requestPermissions(['location']).then((permissions) => {

                        if(permissions.location === 'granted')
                        {
                            _getGeolocation_step2(resolve, reject);
                        }

                    }).catch((message) => {

                        reject(message);
                    });
                }
                else
                {
                    _getGeolocation_step2(resolve, reject);
                }

            }).catch((message) => {

                reject(message);
            });

            /*--------------------------------------------------------------------------------------------------------*/
        }
        else
        {
            /*--------------------------------------------------------------------------------------------------------*/

            if(typeof navigator.geolocation === 'object')
            {
                navigator.geolocation.getCurrentPosition((position) => {

                    resolve(position.coords);

                }, (message) => {

                    reject(message);

                }, {
                    enableHighAccuracy: true,
                    maximumAge: 0x00,
                    timeout: 10000,
                });
            }
            else
            {
                reject('not supported');
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
