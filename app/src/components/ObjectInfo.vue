
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, reactive, onMounted, onUnmounted} from 'vue';

import {NavTabs, TabPane} from 'vue-indi';

import * as ae from 'astronomy-engine';

import Chart from 'chart.js/auto';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from '../stores/config';

import getHIP from '../catalogs/catalog_hip';
import getNGC from '../catalogs/catalog_ngc';
import getSIM from '../catalogs/catalog_sim';

import ObjectPic from './ObjectPic.vue';

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
    names: ['Unknown'],
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

const N_MS_PER_DAY = 24.0 * 60.0 * 60.0 * 1000.0;

const update_step2 = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const id = uuid.v4();

    const timestamp = new Date(props.observationDate).getTime();

    const observer = new ae.Observer(
        configStore.globals.lat,
        configStore.globals.lon,
        configStore.globals.alt
    );

    /*----------------------------------------------------------------------------------------------------------------*/

    const objectAlt = [];
    const objectAz = [];

    for(let i = 0; i < 1000; i++)
    {
        const date = new Date(timestamp + N_MS_PER_DAY * (i / 1000.0));

        const objectAltAz = ae.Horizon(date, observer, state.ra, state.dec, 'normal');

        objectAlt.push(objectAltAz.altitude);
        objectAz.push(objectAltAz.azimuth);
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const labels = Array.from({length: 1000}, (_, i) => (24.0 * (i / 1000.0)).toFixed(0));

    /*----------------------------------------------------------------------------------------------------------------*/

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

    /*----------------------------------------------------------------------------------------------------------------*/

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

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const update = () => {

    getNGC(props.objectName, state).then(update_step2).catch(() => {
        getHIP(props.objectName, state).then(update_step2).catch(() => {
            getSIM(props.objectName, state).then(update_step2).catch(() => {

                /* TODO */
            })
        })
    });
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

                    <p v-if="state.redshift !== -999.0">Type: {{state.type}}, redshift: {{state.redshift}}</p>
                    <p v-else>Type: {{state.type}}</p>

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
