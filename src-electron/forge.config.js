/*--------------------------------------------------------------------------------------------------------------------*/

const path = require('node:path');

/*--------------------------------------------------------------------------------------------------------------------*/

module.exports = {
    outDir: './target/',
    packagerConfig: {
        asar: true,
        executableName: 'nyx-lab',
        icon: path.resolve(__dirname, 'icon.svg'),
    },
    makers: [
        {
            name: '@reforged/maker-appimage',
            config: {
                icon: path.resolve(__dirname, 'icon.svg'),
            },
        },
    ],
};

/*--------------------------------------------------------------------------------------------------------------------*/
