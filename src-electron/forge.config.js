module.exports = {
    outDir: './target/',
    packagerConfig: {
        asar: true,
    },
    makers: [
        {
            name: '@electron-forge/maker-zip',
            platforms: ['linux'],
        },
        {
            name: '@reforged/maker-appimage',
            config: {
                icon: 'icon.svg'
            },
        },
    ],
};
