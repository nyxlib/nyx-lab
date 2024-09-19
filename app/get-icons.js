#!/usr/bin/env node

import fs from 'fs';
import url from 'url';
import path from 'path';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const iconsDir = path.join(__dirname, '..', 'node_modules', 'bootstrap-icons', 'icons');

const outFile = path.join(__dirname, 'src', 'assets', 'icons.json');

fs.readdir(iconsDir, (err, files) => {

    if(err)
    {
        console.error('Error', err);

        return;
    }

    const icons = files.filter(file => file.endsWith('.svg')).map((file) => path.basename(file, '.svg')).sort();

    fs.writeFile(outFile, JSON.stringify(icons, null, 2), (err) => {

        if(err)
        {
            console.error('Error', err);

            return;
        }
    });
});
