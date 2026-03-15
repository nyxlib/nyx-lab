module.exports = {
    packagerConfig: {
        asar: true,
    },
    makers: [
        {
            name: '@electron-forge/maker-zip',
            platforms: ['linux'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@reforged/maker-appimage',
            config: {
                icon: 'icon.svg'
            },
        },
    ],
};
