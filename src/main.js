// noinspection JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import * as Vue from 'vue';

import * as gridstack from 'gridstack';

import * as VueRouter from 'vue-router';

import * as os from '@tauri-apps/plugin-os';

/*--------------------------------------------------------------------------------------------------------------------*/

import { setup } from 'vue-nyx';

/*--------------------------------------------------------------------------------------------------------------------*/

import App from './App.vue';
import router from './router';

import dialog from './plugins/dialog';
import geoloc from './plugins/geoloc';
import input from './plugins/input';

import addon from './plugins/addon';

/*--------------------------------------------------------------------------------------------------------------------*/

window.__NYX_VUE__        = Vue      ;
window.__NYX_VUE_ROUTER__ = VueRouter;

/*--------------------------------------------------------------------------------------------------------------------*/

if(typeof window['__TAURI__'] === 'undefined')
{
    /**/ if (/linux/i.test(navigator.userAgent)) {
        window.__NYX_OS_TYPE__ = 'linux';
    }
    else if (/macintosh/i.test(navigator.userAgent)) {
        window.__NYX_OS_TYPE__ = 'macos';
    }
    else if (/windows/i.test(navigator.userAgent)) {
        window.__NYX_OS_TYPE__ = 'windows';
    }
    else if(/android/i.test(navigator.userAgent)) {
        window.__NYX_OS_TYPE__ = 'android';
    }
    else if(/ipad|iphone/i.test(navigator.userAgent)) {
        window.__NYX_OS_TYPE__ = 'ios';
    }
    else {
        window.__NYX_OS_TYPE__ = 'unknown';
    }
}
else
{
    window.__NYX_OS_TYPE__ = os.type();
}

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

    if(/android|iPad|iPhone/i.test(navigator.userAgent))
    {
        setTimeout(() => {

            document.querySelectorAll('[data-bs-original-title]').forEach((tooltip) => {

                __NYX_BOOTSTRAP__.Tooltip.getInstance(tooltip)?.hide();
            });

        }, 1000);
    }
});

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
