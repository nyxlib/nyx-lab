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
            name: 'monitoring',
            path: '/monitoring/',
            component: () => import('./views/MonitoringView.vue'),
        },
        {
            name: 'sky-map',
            path: '/sky-map/',
            component: () => import('./views/SkyMapView.vue'),
        },
        {
            name: 'sky-atlas',
            path: '/sky-atlas/:target?',
            component: () => import('./views/SkyAtlasView.vue'),
        },
        {
            name: 'node-red',
            path: '/node-red/',
            component: () => import('./views/NodeRedView.vue'),
        },
        {
            name: 'astro',
            path: '/astro/',
            component: () => import('./views/AstroView.vue'),
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
