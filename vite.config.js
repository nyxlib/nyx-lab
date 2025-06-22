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
                entryFileNames: 'dashboard.js',
                chunkFileNames: 'chunks/[hash].js',
                assetFileNames: 'assets/[hash].[ext]',
            }
        }
    },
    esbuild: {
        legalComments: 'none'
    },
    resolve: {
        dedupe: [
            '@vueform/multiselect',
            'bootstrap-icons',
            'pinia',
            'vue'
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
