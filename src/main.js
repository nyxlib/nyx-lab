/*--------------------------------------------------------------------------------------------------------------------*/

import * as Vue from 'vue';

import * as VueRouter from 'vue-router';

/*--------------------------------------------------------------------------------------------------------------------*/

import Particles from '@tsparticles/vue3';
import {loadSlim} from '@tsparticles/slim';

import * as gridstack from 'gridstack';

import {Tooltip} from 'bootstrap';

import {setup} from 'vue-nyx';

/*--------------------------------------------------------------------------------------------------------------------*/

import App from '@/App.vue';
import router from '@/router';

import dialog from '@/plugins/dialog';
import geoloc from '@/plugins/geoloc';
import input from '@/plugins/input';

import addon from '@/plugins/addon';

/*--------------------------------------------------------------------------------------------------------------------*/

globalThis.__NYX_VUE__        = Vue      ;
globalThis.__NYX_VUE_ROUTER__ = VueRouter;

/*--------------------------------------------------------------------------------------------------------------------*/

gridstack.GridStack.renderCB = (el, w) => el.innerHTML = w.content;

/*--------------------------------------------------------------------------------------------------------------------*/

const app = Vue.createApp(App);

setup(app);

app.use(router);
app.use(dialog);
app.use(geoloc);
app.use(input);
app.use(addon);

/*--------------------------------------------------------------------------------------------------------------------*/

router.beforeEach(() => {

    setTimeout(() => {

        document.querySelectorAll('[data-bs-original-title]').forEach((tooltip) => {

            Tooltip.getInstance(tooltip)?.hide();
        });

    }, 1000);
});

/*--------------------------------------------------------------------------------------------------------------------*/

app.directive('tooltip', {

    mounted(el)
    {
        const title = el.getAttribute('title');

        if(title)
        {
            /* NOSONAR */ new Tooltip(el, {
                fallbackPlacements: ['right'],
                placement: 'right',
                trigger: 'hover',
                title: title,
            });
        }
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

// noinspection JSCheckFunctionSignatures
app.use(Particles, {

    init: (engine) => {

        loadSlim(engine).then(() => {

            app.mount('#nyx_lab');
        });
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/
