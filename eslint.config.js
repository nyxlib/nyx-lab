/*--------------------------------------------------------------------------------------------------------------------*/

import pluginVue from 'eslint-plugin-vue';

/*--------------------------------------------------------------------------------------------------------------------*/

// noinspection JSUnusedGlobalSymbols
export default [
    ...pluginVue.configs['flat/recommended'],
    {
        ignores: ['dist/**', 'public/**', 'src-tauri/**', 'node_modules/**'],
    },
    {
        rules: {
            'vue/no-v-html': 'off',
            'vue/html-indent': 'off',
            'vue/html-self-closing': 'off',
            'vue/no-mutating-props': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/first-attribute-linebreak': 'off',
            'vue/no-v-text-v-html-on-component': 'off',
            'vue/multiline-html-element-content-newline': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            /**/
            'vue/attributes-order': ['error', {
                'order': [
                    'OTHER_ATTR',
                    'OTHER_DIRECTIVES',
                    'GLOBAL',               // id
                    'LIST_RENDERING',       // v-for
                    'UNIQUE',               // ref, key
                    'SLOT',                 // slot
                    'TWO_WAY_BINDING',      // v-model
                    'EVENTS',               // events
                    'CONTENT',              // v-html, v-text
                    'CONDITIONALS',         // v-if, v-show
                ],
                'alphabetical': false,
            }],
            /**/
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'no-extra-semi': 'error',
        },
    },
];

/*--------------------------------------------------------------------------------------------------------------------*/
