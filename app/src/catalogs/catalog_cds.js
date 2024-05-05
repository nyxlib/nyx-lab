// noinspection JSUnresolvedReference, PointlessArithmeticExpressionJS
/*--------------------------------------------------------------------------------------------------------------------*/

const CDS_REGEXPS = {
    type1: /Spectral type\s*:\s*(\S+)/,
    type2: /Morphological type\s*:\s*(\S+)/,
    redshift: /Redshift\s*:\s*([-+]?\d+(?:\.\d+)?)/,
    equCoords: /Coordinates\(ICRS,ep=J2000,eq=2000\)\s*:\s*(\d+)\s+(\d+)\s+(\d+(?:\.\d+)?)\s+([+-]?\d+)\s+(\d+)\s+(\d+(?:\.\d+)?)/,
    galCoords: /Coordinates\(Gal,ep=J2000,eq=2000\)\s*:\s*([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)/,
    angularSize: /Angular size\s*:\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/,
    fluxB: /Flux B\s*:\s*(\d+(?:\.\d+)?)/,
    fluxV: /Flux V\s*:\s*(\d+(?:\.\d+)?)/,
    fluxR: /Flux R\s*:\s*(\d+(?:\.\d+)?)/,
    fluxI: /Flux I\s*:\s*(\d+(?:\.\d+)?)/,
    fluxJ: /Flux J\s*:\s*(\d+(?:\.\d+)?)/,
    fluxH: /Flux H\s*:\s*(\d+(?:\.\d+)?)/,
    fluxK: /Flux K\s*:\s*(\d+(?:\.\d+)?)/,
};

/*--------------------------------------------------------------------------------------------------------------------*/

const getCDS = (objectName, data) => {

    return new Promise((resolve, reject) => {

        if(objectName.startsWith('@'))
        {
            objectName = objectName.substring(1);
        }

        fetch(`https://simbad.u-strasbg.fr/simbad/sim-id?Ident=${encodeURIComponent(objectName)}&output.format=ASCII`).then(response => response.text())

            /*--------------------------------------------------------------------------------------------------------*/

            .then((text) => {

                if(text.includes('No known catalog could be found'))
                {
                    reject();

                    return;
                }

                /*----------------------------------------------------------------------------------------------------*/

                data.names = [objectName];

                /*----------------------------------------------------------------------------------------------------*/

                data.types.length = 0;

                const type1 = text.match(CDS_REGEXPS.type1);
                if(type1 && type1[1] !== '~') {
                    data.types.push(type1[1]);
                }

                const type2 = text.match(CDS_REGEXPS.type2);
                if(type2 && type2[1] !== '~') {
                    data.types.push(type2[1]);
                }

                /*----------------------------------------------------------------------------------------------------*/

                const redshift = text.match(CDS_REGEXPS.redshift);
                if(redshift) {
                    data.redshift = Number(redshift[1]);
                }

                /*----------------------------------------------------------------------------------------------------*/

                const coords = text.match(CDS_REGEXPS.equCoords);
                if(coords) {
                    data.ra = Number(coords[1]) * 15.0 + Number(coords[2]) * 15.0 / 60.0 + Number(coords[3]) * 15.0 / 3600.0;
                    data.dec = Number(coords[4]) * 1.00 + Number(coords[5]) * 1.00 / 60.0 + Number(coords[6]) * 1.00 / 3600.0;
                }

                const galCoords = text.match(CDS_REGEXPS.galCoords);
                if(galCoords) {
                    data.l = (Number(galCoords[1]) + 360) % 360;
                    data.b = (Number(galCoords[2]) + 360) % 360;
                }

                /*----------------------------------------------------------------------------------------------------*/

                const angularSize = text.match(CDS_REGEXPS.angularSize);
                if(angularSize) {
                    data.min_ax = Number(Number(angularSize[2]).toFixed(2));
                    data.maj_ax = Number(Number(angularSize[1]).toFixed(2));
                    data.pos_ang = Number(Number(angularSize[3]).toFixed(2));
                }

                /*----------------------------------------------------------------------------------------------------*/

                const fluxB = text.match(CDS_REGEXPS.fluxB);
                if(fluxB) {
                    data.b_mag = Number(Number(fluxB[1]).toFixed(2));
                }

                const fluxV = text.match(CDS_REGEXPS.fluxV);
                if(fluxV) {
                    data.v_mag = Number(Number(fluxV[1]).toFixed(2));
                }

                const fluxR = text.match(CDS_REGEXPS.fluxR);
                if(fluxR) {
                    data.r_mag = Number(Number(fluxR[1]).toFixed(2));
                }

                const fluxI = text.match(CDS_REGEXPS.fluxI);
                if(fluxI) {
                    data.i_mag = Number(Number(fluxI[1]).toFixed(2));
                }

                const fluxJ = text.match(CDS_REGEXPS.fluxJ);
                if(fluxJ) {
                    data.j_mag = Number(Number(fluxJ[1]).toFixed(2));
                }

                const fluxH = text.match(CDS_REGEXPS.fluxH);
                if(fluxH) {
                    data.h_mag = Number(Number(fluxH[1]).toFixed(2));
                }

                const fluxK = text.match(CDS_REGEXPS.fluxK);
                if(fluxK) {
                    data.k_mag = Number(Number(fluxK[1]).toFixed(2));
                }

                /*----------------------------------------------------------------------------------------------------*/

                resolve();
            })

            /*--------------------------------------------------------------------------------------------------------*/

            .catch(() => {

                reject();
            })

            /*--------------------------------------------------------------------------------------------------------*/
        ;
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

export default getCDS;

/*--------------------------------------------------------------------------------------------------------------------*/
