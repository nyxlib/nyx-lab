/*--------------------------------------------------------------------------------------------------------------------*/

const {execFileSync} = require('node:child_process');

const path = require('node:path');

const fs = require('node:fs');

/*--------------------------------------------------------------------------------------------------------------------*/

const escapeDesktopExec = (s) => s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')
;

/*--------------------------------------------------------------------------------------------------------------------*/

const installLinux = () => {

    /*------------------------------------------------------------------------------------------------------------*/

    if(process.platform !== 'linux')
    {
        return;
    }

    /*------------------------------------------------------------------------------------------------------------*/

    const home = process.env.HOME;

    if(!home)
    {
        return;
    }

    /*------------------------------------------------------------------------------------------------------------*/

    const mimeDir = path.join(home, '.local', 'share', 'mime', 'packages');
    const appDir = path.join(home, '.local', 'share', 'applications');
    const iconDir = path.join(home, '.local', 'share', 'icons');

    const mimeFile = path.join(mimeDir, 'nyx-lab.xml');
    const appFile = path.join(appDir, 'nyx-lab.desktop');
    const iconFile = path.join(iconDir, 'nyx-lab.svg');

    /*------------------------------------------------------------------------------------------------------------*/

    const mimeContent = `<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
    <mime-type type="application/vnd.nyx+json">
        <comment>Nyx configuration file (JSON)</comment>
        <glob pattern="*.nyx"/>
    </mime-type>
</mime-info>
`;

    /*------------------------------------------------------------------------------------------------------------*/

    const appContent = `[Desktop Entry]
Name=Nyx Lab
Exec="${escapeDesktopExec(process.env.APPIMAGE || process.execPath)}" --no-sandbox %f
Type=Application
Terminal=false
Categories=Science;
MimeType=application/vnd.nyx+json;
Icon=${iconFile}
NoDisplay=false
`;

    /*----------------------------------------------------------------------------------------------------------------*/

    fs.mkdirSync(mimeDir, {recursive: true});
    fs.mkdirSync(appDir, {recursive: true});
    fs.mkdirSync(iconDir, {recursive: true});

    /*----------------------------------------------------------------------------------------------------------------*/

    const currentMimeContent = fs.existsSync(mimeFile) ? fs.readFileSync(mimeFile, 'utf8') : null;
    const currentAppContent = fs.existsSync(appFile) ? fs.readFileSync(appFile, 'utf8') : null;

    /*----------------------------------------------------------------------------------------------------------------*/

    const mimeRootDir = path.join(home, '.local', 'share', 'mime');

    /*----------------------------------------------------------------------------------------------------------------*/

    if(currentMimeContent !== mimeContent)
    {
        fs.writeFileSync(mimeFile, mimeContent, {encoding: 'utf8', mode: 0o644});

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

    if(currentAppContent !== appContent)
    {
        fs.writeFileSync(appFile, appContent, {encoding: 'utf8', mode: 0o755});

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

    const bundledIconFile = path.join(__dirname, 'icon.svg');

    if(fs.existsSync(bundledIconFile))
    {
        fs.copyFileSync(bundledIconFile, iconFile);
    }

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
