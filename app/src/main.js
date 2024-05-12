/*--------------------------------------------------------------------------------------------------------------------*/

import * as Vue from 'vue/dist/vue.esm-bundler';

import * as VueRouter from 'vue-router/dist/vue-router.esm-bundler';

import * as Bootstrap from 'bootstrap/dist/js/bootstrap.esm';

import {createPinia} from 'pinia';

import Chart from 'chart.js/auto';

import {setup} from 'vue-indi';

/*--------------------------------------------------------------------------------------------------------------------*/

import App from './App.vue';
import router from './router';

import addon from './plugins/addon';
import dialog from './plugins/dialog';
import input from './plugins/input';

import Splitter from './components/Splitter.vue';

/*--------------------------------------------------------------------------------------------------------------------*/

window.Vue       = Vue      ;
window.Chart     = Chart    ;
window.VueRouter = VueRouter;
window.Bootstrap = Bootstrap;

window.pinia = createPinia();

/*--------------------------------------------------------------------------------------------------------------------*/

const app = Vue.createApp(App);

/*--------------------------------------------------------------------------------------------------------------------*/

app.use(window.pinia);

setup(app);

app.use(router);
app.use(dialog);
app.use(input);
app.use(addon);

/*--------------------------------------------------------------------------------------------------------------------*/

app.component('Splitter', Splitter);

/*--------------------------------------------------------------------------------------------------------------------*/

app.directive('tooltip', {

    mounted(el)
    {
        const title = el.getAttribute('title');

        if(title)
        {
            new Bootstrap.Tooltip(el, {
                fallbackPlacements: ['right'],
                placement: 'right',
                trigger: 'hover',
                title: title,
            });
        }
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

app.mount('#indi_dashboard');

/*--------------------------------------------------------------------------------------------------------------------*/
