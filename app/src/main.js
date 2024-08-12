/*--------------------------------------------------------------------------------------------------------------------*/

import * as Vue from 'vue/dist/vue.esm-bundler';

import * as VueRouter from 'vue-router/dist/vue-router.esm-bundler';

import * as Bootstrap from 'bootstrap/dist/js/bootstrap.esm';

/*--------------------------------------------------------------------------------------------------------------------*/

import {createPinia} from 'pinia';

import Chart from 'chart.js/auto';

import {setup} from 'vue-nyx';

/*--------------------------------------------------------------------------------------------------------------------*/

import App from './App.vue';
import router from './router';

import addon from './plugins/addon';
import dialog from './plugins/dialog';
import locker from './plugins/locker';
import input from './plugins/input';

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
app.use(locker)
app.use(input);
app.use(addon);

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
