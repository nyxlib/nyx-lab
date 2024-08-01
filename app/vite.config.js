/*--------------------------------------------------------------------------------------------------------------------*/

import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

/*--------------------------------------------------------------------------------------------------------------------*/

import vuePlugin from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';

/*--------------------------------------------------------------------------------------------------------------------*/

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    plugins: [vuePlugin()],
    base: './',
    build: {
        chunkSizeWarningLimit: 1250,
        minify: false,
        rollupOptions: {
            output: {
                entryFileNames: 'dashboard.js',
                chunkFileNames: 'chunks/[hash].js',
                assetFileNames: 'assets/[hash].[ext]',
            }
        }
    },
    resolve: {
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
