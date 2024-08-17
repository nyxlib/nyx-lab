/*--------------------------------------------------------------------------------------------------------------------*/

import * as Vue from 'vue';

import * as VueRouter from 'vue-router';

/*--------------------------------------------------------------------------------------------------------------------*/

import {setup} from 'vue-nyx';

/*--------------------------------------------------------------------------------------------------------------------*/

import App from './App.vue';
import router from './router';

import addon from './plugins/addon';
import dialog from './plugins/dialog';
import locker from './plugins/locker';
import input from './plugins/input';

/*--------------------------------------------------------------------------------------------------------------------*/

window.__NYX_VUE__        = Vue      ;
window.__NYX_VUE_ROUTER__ = VueRouter;

/*--------------------------------------------------------------------------------------------------------------------*/

const app = Vue.createApp(App);

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
            new __NYX_BOOTSTRAP__.Tooltip(el, {
                fallbackPlacements: ['right'],
                placement: 'right',
                trigger: 'hover',
                title: title,
            });
        }
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

app.mount('#nyx_dashboard');

/*--------------------------------------------------------------------------------------------------------------------*/
