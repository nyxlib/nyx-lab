/*--------------------------------------------------------------------------------------------------------------------*/

const {execFileSync} = require('node:child_process');

const path = require('node:path');

const fs = require('node:fs');

/*--------------------------------------------------------------------------------------------------------------------*/

const escapeDesktopExec = (s) => s.replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')
;

/*--------------------------------------------------------------------------------------------------------------------*/

const HOME = process.env.HOME;

/*--------------------------------------------------------------------------------------------------------------------*/

const installLinux = () => {

    /*------------------------------------------------------------------------------------------------------------*/

    if(process.platform !== 'linux' || !HOME)
    {
        return;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const mimeRootDir = path.join(HOME, '.local', 'share', 'mime');

    const iconRootDir = path.join(HOME, '.local', 'share', 'icons', 'hicolor');

    /*------------------------------------------------------------------------------------------------------------*/

    const newMimeContent = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">',
        '    <mime-type type="application/vnd.nyx+json">',
        '        <comment>Nyx configuration file</comment>',
        '        <generic-icon name="application-vnd.nyx+json" />',
        '        <glob pattern="*.nyx" />',
        '    </mime-type>',
        '</mime-info>',
        ''
    ].join('\n');

    /*------------------------------------------------------------------------------------------------------------*/

    const newAppContent = [
        '[Desktop Entry]',
        'Name=Nyx Lab',
        `Exec="${escapeDesktopExec(process.env.APPIMAGE || process.execPath)}" --no-sandbox %f`,
        'Type=Application',
        'Terminal=false',
        'Categories=Science;',
        'MimeType=application/vnd.nyx+json;',
        'Icon=nyx-lab',
        'NoDisplay=false',
        ''
    ].join('\n');

    /*----------------------------------------------------------------------------------------------------------------*/
    /* INSTALL ICONS                                                                                                  */
    /*----------------------------------------------------------------------------------------------------------------*/

    for(const size of [16, 24, 32, 48, 64, 72, 96, 128, 144, 256, 512])
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const mimeIconDir = path.join(iconRootDir, `${size}x${size}`, 'mimetypes');

        fs.mkdirSync(mimeIconDir, {recursive: true});

        /*------------------------------------------------------------------------------------------------------------*/

        const mimeIconFileSrc = path.join(__dirname, 'icons', `file-icon${size}x${size}.png`);

        const mimeIconFileDst = path.join(mimeIconDir, 'application-vnd.nyx+json.png');

        if(fs.existsSync(mimeIconFileSrc))
        {
            fs.copyFileSync(mimeIconFileSrc, mimeIconFileDst);
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    if(true)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const mimeIconDir = path.join(iconRootDir, 'scalable', 'mimetypes');

        fs.mkdirSync(mimeIconDir, {recursive: true});

        /*------------------------------------------------------------------------------------------------------------*/

        const mineIconFileSrc = path.join(__dirname, 'icons', 'file-icon.svg');

        const mineIconFileDst = path.join(mimeIconDir, 'application-vnd.nyx+json.svg');

        if(fs.existsSync(mineIconFileSrc))
        {
            fs.copyFileSync(mineIconFileSrc, mineIconFileDst);
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    for(const size of [16, 24, 32, 48, 64, 72, 96, 128, 144, 256, 512])
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const appIconDir = path.join(iconRootDir, `${size}x${size}`, 'apps');

        fs.mkdirSync(appIconDir, {recursive: true});

        /*------------------------------------------------------------------------------------------------------------*/

        const appIconFileSrc = path.join(__dirname, 'icons', `app-icon${size}x${size}.png`);

        const appIconFileDst = path.join(appIconDir, 'nyx-lab.png');

        if(fs.existsSync(appIconFileSrc))
        {
            fs.copyFileSync(appIconFileSrc, appIconFileDst);
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    if(true)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const appIconDir = path.join(iconRootDir, 'scalable', 'apps');

        fs.mkdirSync(appIconDir, {recursive: true});

        /*------------------------------------------------------------------------------------------------------------*/

        const appIconFileSrc = path.join(__dirname, 'icons', 'app-icon.svg');

        const appIconFileDst = path.join(appIconDir, 'nyx-lab.svg');

        if(fs.existsSync(appIconFileSrc))
        {
            fs.copyFileSync(appIconFileSrc, appIconFileDst);
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* INSTALL MIME                                                                                                   */
    /*----------------------------------------------------------------------------------------------------------------*/

    const mimeDir = path.join(HOME, '.local', 'share', 'mime', 'packages');

    fs.mkdirSync(mimeDir, {recursive: true});

    /*----------------------------------------------------------------------------------------------------------------*/

    const mimeFile = path.join(mimeDir, /**/ 'nyx-lab.xml' /**/);

    const curMimeContent = fs.existsSync(mimeFile) ? fs.readFileSync(mimeFile, 'utf8') : null;

    if(curMimeContent !== newMimeContent)
    {
        fs.writeFileSync(mimeFile, newMimeContent, {encoding: 'utf8', mode: 0o644});

        try
        {
            execFileSync('update-mime-database', [mimeRootDir], {stdio: 'ignore'});
        }
        catch(e)
        {
            console.warn(`update-mime-database failed: ${e}`);
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* INSTALL APP                                                                                                    */
    /*----------------------------------------------------------------------------------------------------------------*/

    const appDir = path.join(HOME, '.local', 'share', 'applications');

    fs.mkdirSync(appDir, {recursive: true});

    /*----------------------------------------------------------------------------------------------------------------*/

    const appFile = path.join(appDir, 'nyx-lab.desktop');

    const curAppContent = fs.existsSync(appFile) ? fs.readFileSync(appFile, 'utf8') : null;

    if(curAppContent !== newAppContent)
    {
        fs.writeFileSync(appFile, newAppContent, {encoding: 'utf8', mode: 0o755});

        try
        {
            execFileSync('update-desktop-database', [appDir], {stdio: 'ignore'});
        }
        catch(e)
        {
            console.warn(`update-desktop-database failed: ${e}`);
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* MIME <-> APP                                                                                                   */
    /*----------------------------------------------------------------------------------------------------------------*/

    try
    {
        execFileSync('xdg-mime', ['default', 'nyx-lab.desktop', 'application/vnd.nyx+json'], {stdio: 'ignore'});
    }
    catch(e)
    {
        console.warn(`xdg-mime failed: ${e}`);
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

module.exports = {
    installLinux
};

/*--------------------------------------------------------------------------------------------------------------------*/
