/*--------------------------------------------------------------------------------------------------------------------*/

import {createRouter, createWebHashHistory} from 'vue-router';

/*--------------------------------------------------------------------------------------------------------------------*/

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: 'home',
            path: '/',
            component: () => import('./views/HomeView.vue'),
        },
        {
            name: 'interfaces',
            path: '/interfaces/',
            component: () => import('./views/InterfaceView.vue'),
        },
        {
            name: 'external',
            path: '/external/:id',
            component: () => import('./views/ExternalView.vue'),
        },
        {
            name: 'config',
            path: '/config/',
            component: () => import('./views/ConfigView.vue'),
        },
    ],
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default router;

/*--------------------------------------------------------------------------------------------------------------------*/
