/*--------------------------------------------------------------------------------------------------------------------*/

import { fileURLToPath, URL } from 'node:url';

import { execSync } from 'node:child_process';

import { defineConfig } from 'vite';

/*--------------------------------------------------------------------------------------------------------------------*/

import vuePlugin from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';

/*--------------------------------------------------------------------------------------------------------------------*/

const GIT_RELEASE = {
    commitId: execSync('git rev-parse --short HEAD').toString().trim(),
    date: new Date().toISOString(),
};

/*--------------------------------------------------------------------------------------------------------------------*/

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    plugins: [vuePlugin(), eslintPlugin()],
    define: {
        __GIT_RELEASE__: JSON.stringify(GIT_RELEASE),
    },
    base: './',
    build: {
        chunkSizeWarningLimit: 8000,
        minify: true,
        rollupOptions: {
            output: {
                entryFileNames: 'lab.js',
                chunkFileNames: 'chunks/[hash].js',
                assetFileNames: 'assets/[hash].[ext]',
                manualChunks(id)
                {
                    if(id.endsWith('/src/assets/icons.json'))
                    {
                        return 'icons';
                    }
                },
            }
        }
    },
    esbuild: {
        legalComments: 'none'
    },
    resolve: {
        dedupe: [
            'chartjs-adapter-date-fns',
            '@vueform/multiselect',
            'd3-geo-projection',
            'air-datepicker',
            'bootstrap-icon',
            '@popperjs/core',
            'd3-selection',
            'vuedraggable',
            'echarts-gl',
            'bootstrap',
            'chart.js',
            'date-fns',
            'd3-zoom',
            'echarts',
            'marked',
            'pinia',
            'uuid',
            'd3'
        ],
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        fs: {
            allow: ['../..']
        }
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
