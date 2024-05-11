/*--------------------------------------------------------------------------------------------------------------------*/

import * as Vue from 'vue/dist/vue.esm-bundler';

import {createPinia} from 'pinia';

import {Tooltip} from 'bootstrap/dist/js/bootstrap.esm';

import {setup} from 'vue-indi';

/*--------------------------------------------------------------------------------------------------------------------*/

import App from './App.vue';
import router from './router';

import addon from './plugins/addon';
import dialog from './plugins/dialog';
import input from './plugins/input';

/*--------------------------------------------------------------------------------------------------------------------*/

window.Vue = Vue;

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

app.directive('tooltip', {

    mounted(el)
    {
        const title = el.getAttribute('title');

        if(title)
        {
            new Tooltip(el, {
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
