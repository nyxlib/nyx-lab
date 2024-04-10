<!--suppress JSUnresolvedReference, NonAsciiCharacters, JSNonASCIINames -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { ref, onMounted, reactive } from 'vue';

import * as ae from 'astronomy-engine';

import {v4 as uuid_v4} from 'uuid';

import Chart from 'chart.js/auto';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

import AladinMap from './AladinMap.vue';

import NGC from '../catalogs/NGC.json';

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
    j_mag: -999.0,
    h_mag: -999.0,
    k_mag: -999.0,
    surf_br: -999.0,
    show_image: false,
});

/*--------------------------------------------------------------------------------------------------------------------*/

const uuid = uuid_v4();

/*--------------------------------------------------------------------------------------------------------------------*/

const position = ref(null);
const spectrum = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/

const card = ref(null);
const infoTab = ref(null);
const imageTab = ref(null);
const spectrumTab = ref(null);

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
    const hms = degreesToHMS(degrees);

    return `${hms.h.toString().padStart(2, '0')}h ${hms.m.toString().padStart(2, '0')}m ${hms.s.toString().padStart(2, '0')}s`;
}

/*--------------------------------------------------------------------------------------------------------------------*/

function degreesToDMSString(degrees)
{
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

const N_MS_PER_DAY = 24.0 * 60.0 * 60.0 * 1000.0;

const update = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(props.objectName in NGC.table)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const timestamp = new Date(props.observationDate).getTime();

        const observer = new ae.Observer(
            configStore.globals.lat,
            configStore.globals.lon,
            configStore.globals.height
        );

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
        state.surf_br = NGC.surf_br[index];

        /*----------------------------------------------------------------------------------------------------------------*/

        const objectAlt = [];
        const objectAz = [];

        for(let i = 0; i < 1000; i++)
        {
            const date = new Date(timestamp + N_MS_PER_DAY * (i / 1000.0));

            const objectAltAz = ae.Horizon(date, observer, NGC.ra[index], NGC.dec[index], 'normal');

            objectAlt.push(objectAltAz.altitude);
            objectAz.push(objectAltAz.azimuth);
        }

        /*--------------------------------------------------------------------------------------------------------*/

        const labels = Array.from({length: 1000}, (_, i) => (24.0 * (i / 1000.0)).toFixed(0));

        /*--------------------------------------------------------------------------------------------------------*/

        const scales = {};

        scales[`position_x_${uuid}`] = {
            title: {
                display: true,
                text: `Time (UTC+?) - ${props.observationDate}`,
            },
        };

        scales[`position_y1_${uuid}`] = {
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

        scales[`position_y2_${uuid}`] = {
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

        /*--------------------------------------------------------------------------------------------------------*/

        new Chart(position.value, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Alt.',
                    borderWidth: 2,
                    pointRadius: 0,
                    data: objectAlt,
                    xAxisID: `position_x_${uuid}`,
                    yAxisID: `position_y1_${uuid}`,
                }, {
                    label: 'Az.',
                    borderWidth: 2,
                    pointRadius: 0,
                    data: objectAz,
                    xAxisID: `position_x_${uuid}`,
                    yAxisID: `position_y2_${uuid}`,
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

    imageTab.value.addEventListener('shown.bs.tab', () => {

        state.show_image = true;
    });

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    update();
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <div class="card mb-3">
        <div class="card-header d-flex">

            <span class="me-auto">{{state.names.join(', ')}}</span>

            <button class="btn btn-xs btn-link ms-2" type="button" @click="$event.target.closest('.card').style.display = 'none';">
                <i class="bi bi-x-lg"></i>
            </button>

        </div>
        <div class="card-body" ref="card">

            <div class="row">
                <div class="col-md-5">

                    <!--*********************************************************************************************-->

                    <p v-if="state.type === 'G'">Type: {{state.type}}, z: {{state.redshift}}</p>

                    <p v-if="state.type !== 'G'">Type: {{state.type}}</p>

                    <hr />

                    <p>Right ascension α: {{degreesToHMSString(state.ra)}}</p>

                    <p>Declination δ: {{degreesToDMSString(state.dec)}}</p>

                    <p>ℓ: {{degreesToDMSString(state.l)}}</p>

                    <p>b: {{degreesToDMSString(state.b)}}</p>

                    <hr />

                    <p>Dimensions: R(<span v-if="state.pos_ang !== -999.0">{{state.pos_ang}}</span><span v-else>Ø</span>°; <span v-if="state.maj_ax !== -999.0">{{state.maj_ax}}</span><span v-else>Ø</span>' × <span v-if="state.min_ax !== -999.0">{{state.min_ax}}</span><span v-else>Ø</span>')</p>

                    <hr />

                    Apparent total magnitudes / photometric band:

                    <table class="table table-sm w-100">
                        <thead>
                        <tr>
                            <th style="width: 20%;">B</th>
                            <th style="width: 20%;">V</th>
                            <th style="width: 20%;">J</th>
                            <th style="width: 20%;">H</th>
                            <th style="width: 20%;">K</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td v-if="state.b_mag !== -999.0">{{state.b_mag}}</td><td v-else>Ø</td>
                            <td v-if="state.v_mag !== -999.0">{{state.v_mag}}</td><td v-else>Ø</td>
                            <td v-if="state.j_mag !== -999.0">{{state.j_mag}}</td><td v-else>Ø</td>
                            <td v-if="state.h_mag !== -999.0">{{state.h_mag}}</td><td v-else>Ø</td>
                            <td v-if="state.k_mag !== -999.0">{{state.k_mag}}</td><td v-else>Ø</td>
                        </tr>
                        </tbody>
                    </table>

                    <p>Surface brightness: <span v-if="state.surf_br !== -999.0">{{state.surf_br}}</span><span v-else>Ø</span> mag / arcsec<sup>2</sup></p>

                    <!--*********************************************************************************************-->

                </div>
                <div class="col-md-7">

                    <!--*********************************************************************************************-->

                    <nav>
                        <div class="nav nav-tabs" role="tablist">
                            <button class="nav-link active" type="button" data-bs-toggle="tab" :data-bs-target="`#CE950DAA_${uuid}`" role="tab" ref="infoTab">
                                Position
                            </button>
                            <button class="nav-link xxxxxx" type="button" data-bs-toggle="tab" :data-bs-target="`#D91CE60F_${uuid}`" role="tab" ref="imageTab">
                                Image
                            </button>
                            <button class="nav-link xxxxxx" type="button" data-bs-toggle="tab" :data-bs-target="`#E3DB8E9E_${uuid}`" role="tab" ref="spectrumTab">
                                H I
                            </button>
                        </div>
                    </nav>

                    <!--*********************************************************************************************-->

                    <div class="tab-content mt-1">

                        <div class="tab-pane fade show active" :id="`CE950DAA_${uuid}`" role="tabpanel" tabindex="0">

                            <canvas class="w-100" ref="position"></canvas>

                        </div>

                        <div class="tab-pane fade xxxx xxxxxx" :id="`D91CE60F_${uuid}`" role="tabpanel" tabindex="0">

                            <aladin-map class="w-100" :fov="10.0" :target="objectName" :projection="'SIN'" v-if="state.show_image" />

                        </div>

                        <div class="tab-pane fade xxxx xxxxxx" :id="`E3DB8E9E_${uuid}`" role="tabpanel" tabindex="0">

                            <canvas class="w-100" ref="spectrum"></canvas>

                        </div>

                    </div>

                    <!--*********************************************************************************************-->

                </div>
            </div>

        </div>
    </div>

</template>
