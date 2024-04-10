<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { ref, onMounted, reactive } from 'vue';

import * as Astronomy from 'astronomy-engine';

import Chart from 'chart.js/auto';

/*--------------------------------------------------------------------------------------------------------------------*/

import Splitter from '../components/Splitter.vue';

import useConfigStore from '../stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    objects: [],
    objectName: '',
    observationDate: new Date().toISOString().split('T')[0],
});

/*--------------------------------------------------------------------------------------------------------------------*/

const position = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const init = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const labels = Array.from({length: 1000}, (_, i) => (i * 24.0 / 1000.0).toFixed(0));

    /*----------------------------------------------------------------------------------------------------------------*/

    const scales = {
        position_x_sun_moon: {
            title: {
                display: true,
                text: `Time (UTC+?) - ${state.observationDate}`,
            },
        },
        position_y_sun_moon: {
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
        },
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    new Chart(position.value, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sun',
                borderWidth: 2,
                pointRadius: 0,
                data: [],
                xAxisID: 'position_x_sun_moon',
                yAxisID: 'position_y_sun_moon',
            }, {
                label: 'Moon',
                borderWidth: 2,
                pointRadius: 0,
                data: [],
                xAxisID: 'position_x_sun_moon',
                yAxisID: 'position_y_sun_moon',
            }],
        },
        options: {
            animation: {
                duration: 0,
            },
            scales: scales,
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
        },
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    update();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const N_MS_PER_DAY = 24.0 * 60.0 * 60.0 * 1000.0;

const update = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const timestamp = new Date(state.observationDate).getTime();

    const observer = new Astronomy.Observer(
        configStore.globals.lat,
        configStore.globals.lon,
        configStore.globals.height
    );

    /*----------------------------------------------------------------------------------------------------------------*/

    const sunAlt = [];
    const moonAlt = [];

    for(let i = 0; i < 1000; i++)
    {
        const date = new Date(timestamp + N_MS_PER_DAY * (i / 1000.0));

        const sunPosition = Astronomy.Equator('Sun', date, observer, true, true);
        const moonPosition = Astronomy.Equator('Moon', date, observer, true, true);

        const sunAltAz = Astronomy.Horizon(date, observer, sunPosition.ra, sunPosition.dec, 'normal');
        const moonAltAz = Astronomy.Horizon(date, observer, moonPosition.ra, moonPosition.dec, 'normal');

        sunAlt.push(sunAltAz.altitude);
        moonAlt.push(moonAltAz.altitude);
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const instance = Chart.getChart(position.value);

    if(instance)
    {
        instance.data.datasets[0].data = sunAlt;
        instance.data.datasets[1].data = moonAlt;

        //instance.options.scales['position_x_sun_moon'].title.text = `Time (UTC+${data['utc-offset']}) - ${state.observationDate}`;

        instance.update();
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const resize = () => {

};

/*--------------------------------------------------------------------------------------------------------------------*/

const search = () => {

};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    init();
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <splitter :sizes="[30, 70]" @resize="resize">

        <!-- ******************************************************************************************************* -->

        <template v-slot:left>

            <div class="p-3">

                <!-- *********************************************************************************************** -->

                <div class="card mb-3">
                    <div class="card-header">
                        Sky atlas
                    </div>
                    <div class="card-body">

                        <div class="mb-3">
                            <label class="form-label" for="A9856A65">Object name</label>
                            <input class="form-control form-control-sm" type="text" id="A9856A65" placeholder="Messier or NGC name" v-model="state.objectName" @keyup.enter="search()" />
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="E279F652">Observation date</label>
                            <input class="form-control form-control-sm" type="date" id="E279F652" placeholder="Observation date" v-model="state.observationDate" @change="update()" />
                        </div>

                        <div class="mb-0">
                            <button class="btn btn-sm btn-primary w-100" type="button" @click="search()">
                                Search
                            </button>
                        </div>

                    </div>
                </div>

                <!-- *********************************************************************************************** -->

                <div class="mb-3">

                    <canvas class="w-100" ref="position"></canvas>

                </div>

                <!-- *********************************************************************************************** -->

                <div>
                    <ul>
                        <li>NGC/IC catalogs: <a href="https://github.com/mattiaverga/OpenNGC/" target="_blank">OpenNCG</a></li>
                        <li>Sky map rendering: <a href="https://aladin.cds.unistra.fr/#AladinLite" target="_blank">Aladin Lite</a></li>
                    </ul>
                </div>

                <!-- *********************************************************************************************** -->

            </div>

        </template>

        <!-- ******************************************************************************************************* -->

        <template v-slot:right>

            <div class="p-3">

                TODO

            </div>

        </template>

        <!-- ******************************************************************************************************* -->

    </splitter>

</template>
