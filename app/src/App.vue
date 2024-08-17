<!--suppress HtmlUnknownAttribute, JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject, reactive, onMounted} from 'vue';

import {Window, getCurrentWindow} from '@tauri-apps/api/window';

import {useNyxStore} from 'vue-nyx';

/*--------------------------------------------------------------------------------------------------------------------*/

import useConfigStore from './stores/config';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const HAS_TAURI = typeof window['__TAURI__'] !== 'undefined';

/*--------------------------------------------------------------------------------------------------------------------*/

const dialog = inject('dialog');

/*--------------------------------------------------------------------------------------------------------------------*/

const nyxStore = useNyxStore();

const configStore = useConfigStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    theme: 'light',
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const about = () => {

    dialog.show('Nyx Dashboard\nhttps://nyxlib.org/\n\nAuthor: Jérôme ODIER\nEmail: jerome.odier@lpsc.in2p3.fr', 'About');
};

/*--------------------------------------------------------------------------------------------------------------------*/

const themeSet = () => {

    const label = document.querySelector('label[for="C2D68371"] i');

    if(state.theme === 'dark')
    {
        document.documentElement.setAttribute('data-bs-theme', 'dark');

        localStorage.setItem('nyx-dashboard-theme', 'dark');

        label.classList.add   ('bi-moon-stars');
        label.classList.remove('bi-sun');
    }
    else
    {
        document.documentElement.setAttribute('data-bs-theme', 'light');

        localStorage.setItem('nyx-dashboard-theme', 'light');

        label.classList.remove('bi-moon-stars');
        label.classList.add   ('bi-sun');
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const showModal = (widgetTitle, widgetName, widgetURL, widgetHTML) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    widgetURL = widgetURL || 'javascript:void(0);';

    /*----------------------------------------------------------------------------------------------------------------*/

    document.getElementById('F10F4898').textContent = widgetTitle;

    document.getElementById('DC2D5B47').textContent = widgetName;

    document.getElementById('C7F2FB8E').innerHTML = widgetHTML;

    document.getElementById('E9F2EAA2').href = widgetURL;

    /*----------------------------------------------------------------------------------------------------------------*/

    __NYX_BOOTSTRAP__.Modal.getOrCreateInstance(document.getElementById('A7E11E2F')).show();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(!HAS_TAURI)
    {
        document.body.setAttribute('data-environment', 'browser');
    }
    else
    {
        document.body.setAttribute('data-environment', 'tauri');

        /*------------------------------------------------------------------------------------------------------------*/

        const updateWindow = () => {

            getCurrentWindow().isMaximized().catch(() => {}).then((maximized) => {

                if(maximized) {
                    document.body.setAttribute('data-maximized', 'true');
                } else {
                    document.body.setAttribute('data-maximized', 'false');
                }
            });
        };

        window.addEventListener('resize', () => {

            updateWindow();
        });

        updateWindow();

        /*------------------------------------------------------------------------------------------------------------*/

        document.querySelector('[data-tauri-drag-region]').addEventListener('dblclick', (e) => {

            if(e.target.tagName.toLowerCase() === 'div')
            {
                getCurrentWindow().toggleMaximize();
            }
        });

        /*------------------------------------------------------------------------------------------------------------*/

        const addonWindow = Window.getByLabel('addons');
        const mainWindow = Window.getByLabel('main');

        mainWindow.listen('tauri://close-requested', () => {

            if(configStore.modified)
            {
                dialog.confirm('Are you sure you want to close?', 'Nyx Dashboard').then((choice) => {

                    if(choice)
                    {
                        addonWindow.destroy();
                        mainWindow.destroy();
                    }
                });
            }
            else
            {
                addonWindow.destroy();
                mainWindow.destroy();
            }
        });

        addonWindow.listen('tauri://close-requested', () => {

            addonWindow.hide();
            mainWindow.show();
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    state.theme = localStorage.getItem('nyx-dashboard-theme') || 'dark';

    configStore.init();

    themeSet();

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- HEADER                                                                                                      -->
    <!-- *********************************************************************************************************** -->

    <input class="btn-check" type="checkbox" role="switch" id="C2D68371" v-model="state.theme" :true-value="'dark'" :false-value="'light'" @change="themeSet" />

    <!-- *********************************************************************************************************** -->

    <nav class="navbar navbar-expand bg-primary border-bottom py-0">
        <div class="container-fluid px-3" data-tauri-drag-region>

            <!-- *************************************************************************************************** -->

            <div class="d-flex ms-auto py-1" id="nyx_toolbar">

                <!-- DYNAMIC -->

            </div>

            <!-- *************************************************************************************************** -->

            <div class="d-flex ms-2 py-1">

                <button class="btn btn-sm btn-success me-0" type="button" v-if="nyxStore.isConnected">
                    <i class="bi bi-lightning-charge"></i> connected
                </button>

                <button class="btn btn-sm btn-secondary me-0" type="button" v-if="!nyxStore.isConnected">
                    <i class="bi bi-lightning-charge"></i> disconnected
                </button>

            </div>

            <!-- *************************************************************************************************** -->

            <div class="d-flex ms-2 py-1" v-if="configStore.globals.weatherWidgetHTML || configStore.globals.seeingWidgetHTML">

                <button class="btn btn-sm btn-primary me-1" type="button" v-if="configStore.globals.weatherWidgetHTML" @click="showModal('Weather', configStore.globals.weatherWidgetServiceName, configStore.globals.weatherWidgetServiceURL, configStore.globals.weatherWidgetHTML)">
                    <i class="bi bi-cloud-moon-fill"></i>
                </button>

                <button class="btn btn-sm btn-primary me-0" type="button" v-if="configStore.globals.seeingWidgetHTML" @click="showModal('Seeing', configStore.globals.seeingWidgetServiceName, configStore.globals.seeingWidgetServiceURL, configStore.globals.seeingWidgetHTML)">
                    <i class="bi bi-stars"></i>
                </button>

            </div>

            <!-- *************************************************************************************************** -->

            <div class="d-flex ms-2 py-1">

                <button class="btn btn-sm btn-primary me-1" type="button" @click="about">
                    <i class="bi bi-question-circle"></i>
                </button>

                <label class="btn btn-sm btn-primary me-0" for="C2D68371">
                    <i class="bi bi-moon-stars"></i>
                </label>

            </div>

            <!-- *************************************************************************************************** -->

            <div class="d-flex ms-2 py-1">

                <button class="btn btn-sm btn-primary me-1" type="button" @click="() => getCurrentWindow().minimize()" :hidden="!HAS_TAURI">
                    <i class="bi bi-dash-lg"></i>
                </button>

                <button class="btn btn-sm btn-primary me-1" type="button" @click="() => getCurrentWindow().toggleMaximize()" :hidden="!HAS_TAURI">
                    <i class="bi bi-collection"></i>
                </button>

                <button class="btn btn-sm btn-primary me-0" type="button" @click="() => getCurrentWindow().close()" :hidden="!HAS_TAURI">
                    <i class="bi bi-x-lg"></i>
                </button>

            </div>

            <!-- *************************************************************************************************** -->

        </div>
    </nav>

    <!-- *********************************************************************************************************** -->
    <!-- BODY                                                                                                        -->
    <!-- *********************************************************************************************************** -->

    <div class="d-flex" style="background-color: var(--bs-body-bg); height: calc(100% - 2.5rem);">

        <!-- ******************************************************************************************************* -->

        <div class="d-flex flex-column" style="height: 100%; width: 4.5rem; overflow: hidden;">

            <ul class="nav nav-pills flex-grow-1 flex-column justify-content-start text-center border-end">

                <!-- *********************************************************************************************** -->

                <li class="nav-item" title="Control panel" v-tooltip>
                    <router-link class="nav-link border-bottom rounded-0 py-3" active-class="active" to="/">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="m16 15.5c0 0.27615-0.22386 0.50002-0.50002 0.50002h-3.0001c-0.66652-1.64e-4 -0.66652-1.0002 0-1h2.5001v-2.5001c4.9e-4 -0.6662 1.0005-0.6662 1 0z" /><path d="m16 0.50002c0-0.27615-0.22386-0.50002-0.50002-0.50002h-3.0001c-0.66652 1.6328e-4 -0.66652 1.0002 0 1h2.5001v2.5001c4.9e-4 0.6662 1.0005 0.6662 1 0z" /><path d="m1.7984e-7 15.5c0 0.27615 0.22386 0.50002 0.50002 0.50002h3.0001c0.66652-1.63e-4 0.66652-1.0002 0-1h-2.5001v-2.5001c-4.8972e-4 -0.6662-1.0005-0.6662-1 0z" /><path d="m1.7984e-7 0.50002c0-0.27615 0.22386-0.50002 0.50002-0.50002h3.0001c0.66652 1.6328e-4 0.66652 1.0002 0 1h-2.5001v2.5001c-4.8972e-4 0.6662-1.0005 0.6662-1 0z" /><path d="m8.0273 3c0.13476 0.0095135 0.26484 0.091406 0.31641 0.24609l0.64453 1.9375c0.28785 0.86331 0.96661 1.5407 1.8301 1.8281l1.9355 0.64453c0.33 0.11 0.33 0.57555 0 0.68555l-1.9375 0.64648c-0.86331 0.28785-1.5407 0.96465-1.8281 1.8281l-0.64453 1.9355c-0.047321 0.14419-0.16278 0.22743-0.28711 0.24609a8 5 0 0 0 7.9434-4.998 8 5 0 0 0-7.9727-5zm-0.082031 0.0019531a8 5 0 0 0-7.9453 4.998 8 5 0 0 0 7.9453 4.998c-0.12433-0.01866-0.23979-0.10191-0.28711-0.24609l-0.64648-1.9355c-0.28764-0.86309-0.96503-1.5405-1.8281-1.8281l-1.9355-0.64648c-0.33124-0.10871-0.33124-0.57684 0-0.68555l1.9355-0.64453c0.86309-0.28764 1.5405-0.96503 1.8281-1.8281l0.64648-1.9375c0.047882-0.14365 0.16304-0.22555 0.28711-0.24414zm3.3047 1.248c0.028794 0 0.057362 0.015835 0.068359 0.048828l0.12891 0.38867c0.05756 0.17263 0.19257 0.30777 0.36523 0.36523l0.38867 0.12891c0.06599 0.021996 0.06599 0.11472 0 0.13672l-0.38867 0.12891c-0.17263 0.057559-0.30777 0.19257-0.36523 0.36523l-0.12891 0.38867c-0.02174 0.066235-0.11498 0.066235-0.13672 0l-0.12891-0.38867c-0.057518-0.17259-0.19265-0.30772-0.36523-0.36523l-0.38867-0.12891c-0.06624-0.021738-0.06624-0.11498 0-0.13672l0.38867-0.12891c0.17258-0.057518 0.30772-0.19265 0.36523-0.36523l0.12891-0.38867c0.011-0.032993 0.039565-0.048828 0.068359-0.048828z" />
                        </svg>
                    </router-link>
                </li>

                <li class="nav-item" title="Monitoring" v-tooltip v-if="configStore.globals.enableMonitoring">
                    <router-link class="nav-link border-bottom rounded-0 py-3" active-class="active" to="/monitoring">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M0 0h1v15h15v1H0zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07" />
                        </svg>
                    </router-link>
                </li>

                <li class="nav-item" title="Node-RED" v-tooltip v-if="configStore.globals.nodeRedURL">
                    <router-link class="nav-link border-bottom rounded-0 py-3" active-class="active" to="/node-red">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" /><path d="m13.004 12.48c-0.45967-0.13763-0.83526-0.64749-0.83526-1.1339v-0.27919l-0.41293-6.31e-4c-0.5602-8.06e-4 -1.3308-0.1324-1.8557-0.31686-0.59073-0.20762-1.1047-0.53142-1.9162-1.2072-0.3766-0.31357-0.86064-0.6659-1.0756-0.78291-0.54067-0.29427-1.4785-0.52135-2.3886-0.57833l-0.76687-0.048023v0.40906c0 0.45544-0.11804 0.73751-0.43121 1.0305-0.19913 0.18628-0.26581 0.19799-1.2659 0.2224l-1.0557 0.025803v-0.72012h0.89232c1.1411 0 1.1527-0.010037 1.1527-1.0046 0-0.9375-0.030203-0.96178-1.1973-0.96178h-0.84769v-0.70788l1.0028 2.891e-4c0.84239 2.453e-4 1.0416 0.023924 1.2451 0.14802 0.24293 0.14814 0.50495 0.58266 0.50495 0.83737 0 0.11256 0.049456 0.12803 0.28632 0.089588 0.48193-0.078206 0.82416-0.37378 1.2338-1.0656 0.20879-0.35262 0.46701-0.745 0.57385-0.87196 0.24112-0.28656 0.8945-0.60661 1.3771-0.67456 0.36406-0.05126 0.36425-0.051449 0.40429-0.40669 0.047948-0.42539 0.24784-0.72109 0.61353-0.90755 0.24038-0.12257 0.54755-0.13752 2.8259-0.13752 2.8129 0 2.9041 0.013903 3.2585 0.49711 0.14451 0.19701 0.1629 0.33458 0.1629 1.2191 0 0.90544-0.01614 1.0197-0.17542 1.243-0.34665 0.48597-0.44566 0.50128-3.2408 0.50128-2.7849 0-2.9066-0.01772-3.2288-0.47021-0.098708-0.13862-0.19706-0.40808-0.21856-0.5988-0.036243-0.32127-0.055876-0.34676-0.26734-0.34676-0.29276 0-0.75912 0.19503-0.99637 0.41669-0.10198 0.095269-0.3236 0.40932-0.49248 0.69788-0.16889 0.28856-0.39564 0.62992-0.50388 0.75857-0.24384 0.28978-0.24493 0.32917-0.0094444 0.32917 0.3511 0 1.4249 0.35788 1.9369 0.64552 0.28064 0.15767 0.82319 0.55089 1.2057 0.87382 1.0987 0.92767 1.669 1.1715 2.9911 1.2787l0.6561 0.05324 0.042-0.37282c0.0498-0.44193 0.24579-0.73645 0.61549-0.92497 0.21325-0.10874 0.47135-0.13755 1.2332-0.13764l0.96351-1.228e-4v0.70788h-0.87035c-0.4787 0-0.93883 0.036661-1.0225 0.081446-0.13557 0.072525-0.15214 0.17127-0.15214 0.90646 0 0.81326 0.0032 0.82614 0.20176 0.90176 0.11094 0.04223 0.57108 0.07667 1.0225 0.07667h0.82075v0.78654l-0.88486-0.0069c-0.48666-0.0035-0.9868-0.03728-1.1114-0.07461zm0.64344-6.4626c0.12856-0.12856 0.12856-1.5704 0-1.6989-0.06946-0.069449-0.75383-0.094386-2.59-0.094386-2.1638 0-2.512 0.016434-2.6192 0.1236-0.093158 0.093198-0.1236 0.28996-0.1236 0.80001 0 1.0372-0.20837 0.96408 2.7493 0.96408 1.831 0 2.5139-0.024956 2.5834-0.094384z" />
                        </svg>
                    </router-link>
                </li>

                <template v-for="addon in configStore.appPanels" :key="addon">
                    <li class="nav-item" :title="panel.title" v-tooltip v-for="panel in addon" :key="panel">
                        <router-link class="nav-link border-bottom rounded-0 py-3" active-class="active" :to="panel.path" v-html="panel.logo" />
                    </li>
                </template>

                <li class="nav-item" title="Config" v-tooltip>
                    <router-link class="nav-link border-bottom rounded-0 py-3" active-class="active" to="/config">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" /><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                        </svg>
                    </router-link>
                </li>

                <!-- *********************************************************************************************** -->

            </ul>

        </div>

        <!-- ******************************************************************************************************* -->

        <div style="height: 100%; width: calc(100% - 4.5rem); overflow: hidden;">

            <router-view :key="$route.path" />

        </div>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->
    <!-- MODAL                                                                                                       -->
    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="modal" tabindex="-1" id="A7E11E2F">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">

                    <!-- ******************************************************************************************* -->

                    <div class="modal-header px-3 py-2">

                        <span>
                            <span id="F10F4898"></span>
                            [
                                <a class="btn btn-xs btn-primary" target="_blank" id="E9F2EAA2">
                                    <i class="bi bi-link-45deg"></i> <span id="DC2D5B47"></span>
                                </a>
                            ]
                        </span>

                        <button class="btn-close" type="button" data-bs-dismiss="modal"></button>

                    </div>

                    <!-- ******************************************************************************************* -->

                    <div class="modal-body px-3 py-2">

                        <div class="text-center" id="C7F2FB8E"></div>

                    </div>

                    <!-- ******************************************************************************************* -->

                </div>
            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>

<style>
/*--------------------------------------------------------------------------------------------------------------------*/

@import url(assets/app.css);

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
