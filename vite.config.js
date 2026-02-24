/*--------------------------------------------------------------------------------------------------------------------*/

import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

/*--------------------------------------------------------------------------------------------------------------------*/

import vuePlugin from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';

/*--------------------------------------------------------------------------------------------------------------------*/

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    plugins: [vuePlugin(), eslintPlugin()],
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
            'plotly.js-dist-min',
            'd3-geo-projection',
            'bootstrap-icon',
            '@popperjs/core',
            'd3-selection',
            'vuedraggable',
            'bootstrap',
            'chart.js',
            'date-fns',
            'd3-zoom',
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
