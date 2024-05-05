// noinspection JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import HIP from './HIP.json';

import {equatorialToGalactic} from './utilities';

/*--------------------------------------------------------------------------------------------------------------------*/

const getHIP = (objectName, data) => {

    return new Promise((resolve, reject) => {

        if(objectName in HIP.table)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            const index = HIP.table[objectName];

            const lb = equatorialToGalactic(
                HIP.ra[index],
                HIP.dec[index]
            );

            /*--------------------------------------------------------------------------------------------------------*/

            data.names = objectName.split(',');
            data.types = [HIP.type[index]];
            data.ra = HIP.ra[index];
            data.dec = HIP.dec[index];
            data.l = lb.l;
            data.b = lb.b;
            data.b_mag = HIP.b_mag[index];
            data.v_mag = HIP.v_mag[index];

            /*--------------------------------------------------------------------------------------------------------*/

            resolve();
        }

        reject();
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

export default getHIP;

/*--------------------------------------------------------------------------------------------------------------------*/
