/*--------------------------------------------------------------------------------------------------------------------*/

import * as Vue from 'vue';

import * as VueRouter from 'vue-router';

import * as gridstack from 'gridstack';

import * as os from '@tauri-apps/plugin-os';

/*--------------------------------------------------------------------------------------------------------------------*/

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

if(window['__TAURI__'] === undefined)
{
    /**/ if (/linux/i.test(navigator.userAgent)) {
        globalThis.__NYX_OS_TYPE__ = 'linux';
    }
    else if (/macintosh/i.test(navigator.userAgent)) {
        globalThis.__NYX_OS_TYPE__ = 'macos';
    }
    else if (/windows/i.test(navigator.userAgent)) {
        globalThis.__NYX_OS_TYPE__ = 'windows';
    }
    else if(/android/i.test(navigator.userAgent)) {
        globalThis.__NYX_OS_TYPE__ = 'android';
    }
    else if(/ipad|iphone/i.test(navigator.userAgent)) {
        globalThis.__NYX_OS_TYPE__ = 'ios';
    }
    else {
        globalThis.__NYX_OS_TYPE__ = 'unknown';
    }
}
else
{
    globalThis.__NYX_OS_TYPE__ = os.type();
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

app.mount('#nyx_lab');

/*--------------------------------------------------------------------------------------------------------------------*/
