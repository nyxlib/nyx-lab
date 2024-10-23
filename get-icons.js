#!/usr/bin/env node

/*--------------------------------------------------------------------------------------------------------------------*/

import fs from 'fs';
import url from 'url';
import path from 'path';

/*--------------------------------------------------------------------------------------------------------------------*/

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/*--------------------------------------------------------------------------------------------------------------------*/

function readSVG(inFile, size)
{
    return new Promise((resolve, reject) => {

        fs.readFile(inFile, 'utf8', (err, data) => {

            if(err)
            {
                reject(err);

                return;
            }

            resolve(data.replace(/<svg [^>]+>/g, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 ${size} ${size}">`));
        });
    });
}

/*--------------------------------------------------------------------------------------------------------------------*/

function getIcons(icons, prefix, size, inDir, outDir)
{
    return new Promise((resolve) => {

        fs.mkdir(outDir, {recursive: true}, (err) => {

            if(err)
            {
                console.error('Error', err);

                return;
            }

            fs.readdir(inDir, (err, files) => {

                if(err)
                {
                    console.error('Error', err);

                    return;
                }

                files = files.filter((file) => file.endsWith('.svg'));

                let i = files.length;

                files.forEach((file) => {

                    const destPath = path.join(outDir, `${prefix}-${file}`);

                    readSVG(path.join(inDir, file), size).then((svg) => {

                        icons[path.basename(destPath, '.svg')] = svg;

                        if(--i === 0)
                        {
                            resolve();
                        }

                    }).catch(() => {

                        if(--i === 0)
                        {
                            resolve();
                        }
                    })
                });
            });
        });
    });
}

/*--------------------------------------------------------------------------------------------------------------------*/

const icons = {};

getIcons(
    icons,
    'bi', 16,
    path.join(__dirname, 'node_modules', 'bootstrap-icons', 'icons'),
    path.join(__dirname, 'public', 'icons'),
).then(() => {

    getIcons(
        icons,
        'si', 24,
        path.join(__dirname, 'node_modules', 'simple-icons', 'icons'),
        path.join(__dirname, 'public', 'icons'),
    ).then(() => {

        fs.writeFile(path.join(__dirname, 'src', 'assets', 'icons.json'), JSON.stringify(icons), 'utf8', (err) => {

            if(err)
            {
                console.error('Error', err);
            }
        });
    });
});

/*--------------------------------------------------------------------------------------------------------------------*/
