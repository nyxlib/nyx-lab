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
