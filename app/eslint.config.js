/*--------------------------------------------------------------------------------------------------------------------*/

import pluginVue from 'eslint-plugin-vue';

/*--------------------------------------------------------------------------------------------------------------------*/

// noinspection JSUnusedGlobalSymbols
export default [
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['src/**/*.js', 'src/**/*.vue'],
        rules: {
            'vue/html-indent': 'off',
            'vue/attributes-order': 'off',
            'vue/html-self-closing': 'off',
            'vue/no-mutating-props': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/multiline-html-element-content-newline': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'quotes': ['error', 'single'],
        },
    },
];

/*--------------------------------------------------------------------------------------------------------------------*/
