<!--suppress JSUnresolvedReference, NonAsciiCharacters, JSNonASCIINames -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, reactive, onMounted, onUnmounted} from 'vue';

import {NavTabs, TabPane} from 'vue-indi';

import * as ae from 'astronomy-engine';

import Chart from 'chart.js/auto';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

import ObjectPic from './ObjectPic.vue';

import NGC from '../catalogs/NGC.json';
import HIP from '../catalogs/HIP.json';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    objectName: {
        type: String,
        default: '',
    },
    observationDate: {
        type: String,
        default: '',
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    names: [],
    type: '',
    ra: -999.0,
    dec: -999.0,
    l: -999.0,
    b: -999.0,
    min_ax: -999.0,
    maj_ax: -999.0,
    pos_ang: -999.0,
    redshift: -999.0,
    b_mag: -999.0,
    v_mag: -999.0,
    r_mag: -999.0,
    i_mag: -999.0,
    j_mag: -999.0,
    h_mag: -999.0,
    k_mag: -999.0,
    show_image: false,
});

/*--------------------------------------------------------------------------------------------------------------------*/

const position = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/

let chart = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const degreesToHMS = (degrees) => {

    const totalSeconds = degrees * 240;

    return {
        h: Math.floor(totalSeconds / 3600),
        m: Math.floor((totalSeconds % 3600) / 60),
        s: (totalSeconds % 60).toFixed(2),
    };
}

/*--------------------------------------------------------------------------------------------------------------------*/

function degreesToDMS(degrees)
{
    const totalSeconds = degrees * 3600;

    return {
        d: Math.floor(totalSeconds / 3600),
        m: Math.floor((totalSeconds % 3600) / 60),
        s: (totalSeconds % 60).toFixed(2),
    };
}

/*--------------------------------------------------------------------------------------------------------------------*/

function degreesToHMSString(degrees)
{
    if(degrees === -999.0)
    {
        return 'Ø';
    }

    const hms = degreesToHMS(degrees);

    return `${hms.h.toString().padStart(2, '0')}h ${hms.m.toString().padStart(2, '0')}m ${hms.s.toString().padStart(2, '0')}s`;
}

/*--------------------------------------------------------------------------------------------------------------------*/

function degreesToDMSString(degrees)
{
    if(degrees === -999.0)
    {
        return 'Ø';
    }

    const dms = degreesToDMS(degrees);

    return `${dms.d.toString().padStart(2, '0')}° ${dms.m.toString().padStart(2, '0')}' ${dms.s.toString().padStart(2, '0')}"`;
}

/*--------------------------------------------------------------------------------------------------------------------*/

const DEG_TO_RAD = Math.PI / 180.0;
const RAD_TO_DEC = 180.0 / Math.PI;

const A_NGP = 192.85948 * DEG_TO_RAD;
const Δ_NGP = 27.12825 * DEG_TO_RAD;
const L_NCP = 122.93314 * DEG_TO_RAD;

const equatorialToGalactic = (α, ẟ) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    α *= DEG_TO_RAD;
    ẟ *= DEG_TO_RAD;

    /*----------------------------------------------------------------------------------------------------------------*/

    const sinẟ = Math.sin(ẟ);
    const cosẟ = Math.cos(ẟ);

    const sinαNGP = Math.sin(Δ_NGP);
    const cosαNGP = Math.cos(Δ_NGP);

    const sinααNGP = Math.sin(α - A_NGP);
    const cosααNGP = Math.cos(α - A_NGP);

    /*----------------------------------------------------------------------------------------------------------------*/

    const ℓ = L_NCP - Math.atan2(cosẟ * sinααNGP, sinẟ * cosαNGP - cosẟ * sinαNGP * cosααNGP);

    const 𝑏 = Math.asin(sinẟ * sinαNGP + cosẟ * cosαNGP * cosααNGP);

    /*----------------------------------------------------------------------------------------------------------------*/

    return {
        l: (ℓ * RAD_TO_DEC + 360) % 360,
        b: (𝑏 * RAD_TO_DEC + 360) % 360,
    };

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const SIMBAD_REGEXPS = {
    redshift: /Redshift:\s*([+-]?\d*\.?\d+)/,
    coords: /Coordinates\(ICRS,ep=J2000,eq=2000\):\s*(\d+)\s+(\d+)\s+(\d+(?:\.\d+)?)\s+([+-]?\d+)\s+(\d+)\s+(\d+(?:\.\d+)?)/,
    galCoord: /Coordinates\(Gal,ep=J2000,eq=2000\):\s*([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)/,
    angularSize: /Angular size:\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/,
    fluxB: /Flux B :\s*(\d+(?:\.\d+)?)/,
    fluxV: /Flux V :\s*(\d+(?:\.\d+)?)/,
    fluxR: /Flux R :\s*(\d+(?:\.\d+)?)/,
    fluxI: /Flux I :\s*(\d+(?:\.\d+)?)/,
    fluxJ: /Flux J :\s*(\d+(?:\.\d+)?)/,
    fluxH: /Flux H :\s*(\d+(?:\.\d+)?)/,
    fluxK: /Flux K :\s*(\d+(?:\.\d+)?)/,
};

/*--------------------------------------------------------------------------------------------------------------------*/

const loadSIMBAD = () => {

    fetch(`http://simbad.u-strasbg.fr/simbad/sim-id?Ident=${encodeURIComponent(props.objectName)}&output.format=ASCII`).then(response => response.text())

        /*------------------------------------------------------------------------------------------------------------*/

        .then((data) => {

            //console.log(data);

            /*--------------------------------------------------------------------------------------------------------*/

            state.names = [props.objectName];

            const redshift = data.match(SIMBAD_REGEXPS.redshift);
            if(redshift) {
                state.redshift = Number(Number(redshift[1]).toFixed(2));
            }

            /*--------------------------------------------------------------------------------------------------------*/

            const coords = data.match(SIMBAD_REGEXPS.coords);
            if(coords) {
                state.ra = Number(coords[1]) * 15.0 + Number(coords[2]) * 15.0 / 60.0 + Number(coords[2]) * 15.0 / 3600.0;
                state.dec = Number(coords[3]) * 1.00 + Number(coords[4]) * 1.00 / 60.0 + Number(coords[5]) * 1.00 / 3600.0;
            }

            const galCoords = data.match(SIMBAD_REGEXPS.galCoord);
            if(galCoords) {
                state.l = Number(galCoords[1]);
                state.b = Number(galCoords[2]);
            }

            const angularSize = data.match(SIMBAD_REGEXPS.angularSize);
            if(angularSize) {
                state.min_ax = Number(Number(angularSize[2]).toFixed(2));
                state.maj_ax = Number(Number(angularSize[1]).toFixed(2));
                state.pos_ang = Number(Number(angularSize[3]).toFixed(2));
            }

            /*--------------------------------------------------------------------------------------------------------*/

            const fluxB = data.match(SIMBAD_REGEXPS.fluxB);
            if(fluxB) {
                state.b_mag = Number(Number(fluxB[1]).toFixed(2));
            }

            const fluxV = data.match(SIMBAD_REGEXPS.fluxV);
            if(fluxV) {
                state.v_mag = Number(Number(fluxV[1]).toFixed(2));
            }

            const fluxR = data.match(SIMBAD_REGEXPS.fluxR);
            if(fluxR) {
                state.r_mag = Number(Number(fluxR[1]).toFixed(2));
            }

            const fluxI = data.match(SIMBAD_REGEXPS.fluxI);
            if(fluxI) {
                state.i_mag = Number(Number(fluxI[1]).toFixed(2));
            }

            const fluxJ = data.match(SIMBAD_REGEXPS.fluxJ);
            if(fluxJ) {
                state.j_mag = Number(Number(fluxJ[1]).toFixed(2));
            }

            const fluxH = data.match(SIMBAD_REGEXPS.fluxH);
            if(fluxH) {
                state.h_mag = Number(Number(fluxH[1]).toFixed(2));
            }

            const fluxK = data.match(SIMBAD_REGEXPS.fluxK);
            if(fluxK) {
                state.k_mag = Number(Number(fluxK[1]).toFixed(2));
            }

            /*--------------------------------------------------------------------------------------------------------*/
        })

        /*------------------------------------------------------------------------------------------------------------*/

        .catch(() => {

        })

        /*------------------------------------------------------------------------------------------------------------*/
    ;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const loadNGC = () => {

    if(props.objectName in NGC.table)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const index = NGC.table[props.objectName];

        const lb = equatorialToGalactic(
            NGC.ra[index],
            NGC.dec[index]
        );

        /*------------------------------------------------------------------------------------------------------------*/

        state.names = NGC.names[index].split(',');
        state.type = NGC.type[index];
        state.ra = NGC.ra[index];
        state.dec = NGC.dec[index];
        state.l = lb.l;
        state.b = lb.b;
        state.min_ax = NGC.min_ax[index];
        state.maj_ax = NGC.maj_ax[index];
        state.pos_ang = NGC.pos_ang[index];
        state.redshift = NGC.redshift[index];
        state.b_mag = NGC.b_mag[index];
        state.v_mag = NGC.v_mag[index];
        state.j_mag = NGC.j_mag[index];
        state.h_mag = NGC.h_mag[index];
        state.k_mag = NGC.k_mag[index];

        /*------------------------------------------------------------------------------------------------------------*/

        return true;
    }

    return false;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const loadHIP = () => {

    if(props.objectName in HIP.table)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const index = HIP.table[props.objectName];

        const lb = equatorialToGalactic(
            HIP.ra[index],
            HIP.dec[index]
        );

        /*------------------------------------------------------------------------------------------------------------*/

        state.names = [props.objectName];
        state.type = HIP.type[index];
        state.ra = HIP.ra[index];
        state.dec = HIP.dec[index];
        state.l = lb.l;
        state.b = lb.b;
        state.b_mag = HIP.b_mag[index];
        state.v_mag = HIP.v_mag[index];

        /*------------------------------------------------------------------------------------------------------------*/

        return true;
    }

    return false;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const N_MS_PER_DAY = 24.0 * 60.0 * 60.0 * 1000.0;

const update = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(loadNGC() || loadHIP() || loadSIMBAD())
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const id = uuid.v4();

        const timestamp = new Date(props.observationDate).getTime();

        const observer = new ae.Observer(
            configStore.globals.lat,
            configStore.globals.lon,
            configStore.globals.alt
        );

        /*------------------------------------------------------------------------------------------------------------*/

        const objectAlt = [];
        const objectAz = [];

        for(let i = 0; i < 1000; i++)
        {
            const date = new Date(timestamp + N_MS_PER_DAY * (i / 1000.0));

            const objectAltAz = ae.Horizon(date, observer, state.ra, state.dec, 'normal');

            objectAlt.push(objectAltAz.altitude);
            objectAz.push(objectAltAz.azimuth);
        }

        /*------------------------------------------------------------------------------------------------------------*/

        const labels = Array.from({length: 1000}, (_, i) => (24.0 * (i / 1000.0)).toFixed(0));

        /*------------------------------------------------------------------------------------------------------------*/

        const scales = {};

        scales[`position_x_${id}`] = {
            title: {
                display: true,
                text: `Time (UTC+?) - ${props.observationDate}`,
            },
        };

        scales[`position_y1_${id}`] = {
            position: 'left',
            min: -90,
            max: +90,
            ticks: {
                stepSize: 10,
            },
            title: {
                display: true,
                text: 'Alt. (deg)',
            },
        };

        scales[`position_y2_${id}`] = {
            position: 'right',
            min: 0,
            max: 360,
            ticks: {
                stepSize: 20,
            },
            title: {
                display: true,
                text: 'Az. (deg)',
            },
        };

        /*------------------------------------------------------------------------------------------------------------*/

        chart = new Chart(position.value, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Alt.',
                    borderWidth: 2,
                    pointRadius: 0,
                    data: objectAlt,
                    xAxisID: `position_x_${id}`,
                    yAxisID: `position_y1_${id}`,
                }, {
                    label: 'Az.',
                    borderWidth: 2,
                    pointRadius: 0,
                    data: objectAz,
                    xAxisID: `position_x_${id}`,
                    yAxisID: `position_y2_${id}`,
                }],
            },
            options: {
                animation: {
                    duration: 0,
                },
                scales: scales,
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.75,
            },
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    update();
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    if(chart)
    {
        chart.destroy();
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="shadow card mb-3">
        <div class="card-header d-flex">

            <span class="me-auto">{{state.names.join(', ')}}</span>

            <button class="btn btn-xs btn-link ms-2" type="button" @click="$event.target.closest('.card').remove()">
                <i class="bi bi-x-lg"></i>
            </button>

        </div>
        <div class="card-body" ref="card">

            <div class="row">
                <div class="col-md-5">

                    <!--*********************************************************************************************-->

                    <p v-if="state.type === 'G'">Type: {{state.type}}, redshift: {{state.redshift}}</p>

                    <p v-if="state.type !== 'G'">Type: {{state.type}}</p>

                    <hr />

                    <nav-tabs margin="mb-1">

                        <tab-pane title="J2000">

                            <!--*************************************************************************************-->

                            <table class="w-100">
                                <tr>
                                    <td colspan="2">
                                        Equatorial coordinate
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 10%; text-align: center;">α:</td>
                                    <td><kbd class="d-block">{{degreesToHMSString(state.ra)}}</kbd></td>
                                </tr>
                                <tr>
                                    <td style="width: 10%; text-align: center;">δ:</td>
                                    <td><kbd class="d-block">{{degreesToDMSString(state.dec)}}</kbd></td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        Galactic coordinate
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 10%; text-align: center;">ℓ:</td>
                                    <td><kbd class="d-block">{{degreesToDMSString(state.l)}}</kbd></td>
                                </tr>
                                <tr>
                                    <td style="width: 10%; text-align: center;">𝑏:</td>
                                    <td><kbd class="d-block">{{degreesToDMSString(state.b)}}</kbd></td>
                                </tr>
                            </table>

                            <!--*************************************************************************************-->

                        </tab-pane>

                        <tab-pane title="J2000d">

                            <!--*************************************************************************************-->

                            <table class="w-100">
                                <tr>
                                    <td colspan="2">
                                        Equatorial coordinate
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 10%; text-align: center;">α:</td>
                                    <td><kbd class="d-block">{{ state.ra.toFixed(7) }}°</kbd></td>
                                </tr>
                                <tr>
                                    <td style="width: 10%; text-align: center;">δ:</td>
                                    <td><kbd class="d-block">{{ state.dec.toFixed(7) }}°</kbd></td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        Galactic coordinate
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 10%; text-align: center;">ℓ:</td>
                                    <td><kbd class="d-block">{{ state.l.toFixed(7) }}°</kbd></td>
                                </tr>
                                <tr>
                                    <td style="width: 10%; text-align: center;">𝑏:</td>
                                    <td><kbd class="d-block">{{ state.b.toFixed(7) }}°</kbd></td>
                                </tr>
                            </table>

                            <!--*************************************************************************************-->

                        </tab-pane>

                    </nav-tabs>

                    <hr />

                    <p>Dimensions: R(<span v-if="state.pos_ang !== -999.0">{{state.pos_ang}}</span><span v-else>Ø</span>°; <span v-if="state.maj_ax !== -999.0">{{state.maj_ax}}</span><span v-else>Ø</span>' × <span v-if="state.min_ax !== -999.0">{{state.min_ax}}</span><span v-else>Ø</span>')</p>

                    <hr />

                    Apparent total magnitudes per bands:

                    <table class="table table-sm w-100">
                        <thead>
                        <tr>
                            <th style="width: 14.2857%;">B <i class="bi bi-circle-fill" style="color: rgb(0,0,255);"></i></th>
                            <th style="width: 14.2857%;">V <i class="bi bi-circle-fill" style="color: rgb(0,128,255);"></i></th>
                            <th style="width: 14.2857%;">R <i class="bi bi-circle-fill" style="color: rgb(132,198,41);"></i></th>
                            <th style="width: 14.2857%;">I <i class="bi bi-circle-fill" style="color: rgb(255,222,0);"></i></th>
                            <th style="width: 14.2857%;">J <i class="bi bi-circle-fill" style="color: rgb(255,0,0);"></i></th>
                            <th style="width: 14.2857%;">H <i class="bi bi-circle-fill" style="color: rgb(220,0,0);"></i></th>
                            <th style="width: 14.2857%;">K <i class="bi bi-circle-fill" style="color: rgb(165,0,8);"></i></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td v-if="state.b_mag !== -999.0">{{state.b_mag}}</td><td v-else>Ø</td>
                            <td v-if="state.v_mag !== -999.0">{{state.v_mag}}</td><td v-else>Ø</td>
                            <td v-if="state.r_mag !== -999.0">{{state.r_mag}}</td><td v-else>Ø</td>
                            <td v-if="state.i_mag !== -999.0">{{state.i_mag}}</td><td v-else>Ø</td>
                            <td v-if="state.j_mag !== -999.0">{{state.j_mag}}</td><td v-else>Ø</td>
                            <td v-if="state.h_mag !== -999.0">{{state.h_mag}}</td><td v-else>Ø</td>
                            <td v-if="state.k_mag !== -999.0">{{state.k_mag}}</td><td v-else>Ø</td>
                        </tr>
                        </tbody>
                    </table>

                    <!--*********************************************************************************************-->

                </div>
                <div class="col-md-7">

                    <!--*********************************************************************************************-->

                    <nav-tabs margin="mb-1">

                        <tab-pane title="Position">

                            <canvas class="w-100" ref="position"></canvas>

                        </tab-pane>

                        <tab-pane title="Image" @shown="state.show_image = true">

                            <object-pic class="w-100" :target="objectName" v-if="state.show_image" />

                        </tab-pane>

                    </nav-tabs>

                    <!--*********************************************************************************************-->

                </div>
            </div>

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
