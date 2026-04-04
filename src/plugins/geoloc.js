/*--------------------------------------------------------------------------------------------------------------------*/

import getRuntime from '@/runtimes';

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

        case error./*----*/ TIMEOUT /*----*/:
            return /*----*/ 'Timeout.' /*----*/;

        default:
            return 'Unknown error.';
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _getGeolocation = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const runtime = getRuntime();

    /*----------------------------------------------------------------------------------------------------------------*/

    return runtime.geolocCheckPermissions().then((permissions) => {

        if(['prompt', 'prompt-with-rationale'].includes(permissions.location))
        {
            return runtime.geolocRequestPermissions(['location']).then((permissions) => {

                if(permissions.location !== 'granted')
                {
                    throw new Error('Permission denied.');
                }

                return runtime.getCurrentPosition(OPTIONS).catch((error) => {

                    throw new Error(getErrorMessage(error));
                });
            });
        }

        return runtime.getCurrentPosition(OPTIONS).catch((error) => {

            throw new Error(getErrorMessage(error));
        });
    });

    /*----------------------------------------------------------------------------------------------------------------*/
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
