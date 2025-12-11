/*--------------------------------------------------------------------------------------------------------------------*/

import {createRouter, createWebHashHistory} from 'vue-router';

/*--------------------------------------------------------------------------------------------------------------------*/

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            redirect: '/home',
        },
        {
            name: 'home',
            path: '/home',
            component: () => import('./views/HomeView.vue'),
        },
        {
            name: 'config',
            path: '/config',
            component: () => import('./views/ConfigView.vue'),
        },
        {
            name: 'external',
            path: '/external/:id',
            component: () => import('./views/ExternalView.vue'),
        },
    ],
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default router;

/*--------------------------------------------------------------------------------------------------------------------*/
