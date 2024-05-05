// noinspection JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import NGC from './NGC.json';

import {equatorialToGalactic} from './utilities';

/*--------------------------------------------------------------------------------------------------------------------*/

const getNGC = (objectName, data) => {

    return new Promise((resolve, reject) => {

        if(objectName in NGC.table)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            const index = NGC.table[objectName];

            const lb = equatorialToGalactic(
                NGC.ra[index],
                NGC.dec[index]
            );

            /*--------------------------------------------------------------------------------------------------------*/

            data.names = NGC.names[index].split(',');
            data.type = NGC.type[index];
            data.ra = NGC.ra[index];
            data.dec = NGC.dec[index];
            data.l = lb.l;
            data.b = lb.b;
            data.min_ax = NGC.min_ax[index];
            data.maj_ax = NGC.maj_ax[index];
            data.pos_ang = NGC.pos_ang[index];
            data.redshift = NGC.redshift[index];
            data.b_mag = NGC.b_mag[index];
            data.v_mag = NGC.v_mag[index];
            data.j_mag = NGC.j_mag[index];
            data.h_mag = NGC.h_mag[index];
            data.k_mag = NGC.k_mag[index];

            /*--------------------------------------------------------------------------------------------------------*/

            resolve();
        }

        reject();
    });
};


/*--------------------------------------------------------------------------------------------------------------------*/

export default getNGC;

/*--------------------------------------------------------------------------------------------------------------------*/
