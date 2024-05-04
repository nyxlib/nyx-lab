/*--------------------------------------------------------------------------------------------------------------------*/

import {createRouter, createWebHashHistory} from 'vue-router';

/*--------------------------------------------------------------------------------------------------------------------*/

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('./views/HomeView.vue'),
        },
        {
            path: '/monitoring/',
            name: 'monitoring',
            component: () => import('./views/MonitoringView.vue'),
        },
        {
            path: '/sky-map/',
            name: 'sky-map',
            component: () => import('./views/SkyMapView.vue'),
        },
        {
            path: '/sky-atlas/:target?',
            name: 'sky-atlas',
            component: () => import('./views/SkyAtlasView.vue'),
        },
        {
            path: '/node-red/',
            name: 'node-red',
            component: () => import('./views/NodeRedView.vue'),
        },
        {
            path: '/astro/',
            name: 'astro',
            component: () => import('./views/AstroView.vue'),
        },
        {
            path: '/config/',
            name: 'config',
            component: () => import('./views/ConfigView.vue'),
        },
    ],
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default router;

/*--------------------------------------------------------------------------------------------------------------------*/
