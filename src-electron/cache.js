/*--------------------------------------------------------------------------------------------------------------------*/

const {app, net, protocol} = require('electron');

const fsp = require('node:fs/promises');

const path = require('node:path');

/*--------------------------------------------------------------------------------------------------------------------*/

const NYX_ADDONS_URL = 'https://addons.nyxlib.org/repo';

const NYX_CACHE_DIRNAME = 'nyx-addons-cache';

/*--------------------------------------------------------------------------------------------------------------------*/

let cacheDir = '';

/*--------------------------------------------------------------------------------------------------------------------*/
/* HELPERS                                                                                                            */
/*--------------------------------------------------------------------------------------------------------------------*/

const normalizePath = (pathname) => path.posix.normalize(`/${pathname}`);

/*--------------------------------------------------------------------------------------------------------------------*/

const getFile = async (pathname) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const normalizedPath = normalizePath(pathname);

    /*----------------------------------------------------------------------------------------------------------------*/
    /* READ LOCALLY                                                                                                   */
    /*----------------------------------------------------------------------------------------------------------------*/

    const filename = path.join(cacheDir, normalizedPath);

    try
    {
        return await fsp.readFile(filename);
    }
    catch(error_)
    {
        /* IGNORE */
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* READ REMOTELY                                                                                                  */
    /*----------------------------------------------------------------------------------------------------------------*/

    const response = await net.fetch(`${NYX_ADDONS_URL}${normalizedPath}`);

    if(!response.ok)
    {
        throw new Error(`HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    /*----------------------------------------------------------------------------------------------------------------*/

    await fsp.mkdir(path.dirname(filename), {recursive: true});

    await fsp.writeFile(filename, buffer);

    /*----------------------------------------------------------------------------------------------------------------*/

    return buffer;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const walk = async (dirname, prefix = '') => {

    let result = [];

    for(const entry of await fsp.readdir(dirname, {withFileTypes: true}))
    {
        const abs = path.join(dirname, entry.name);
        const rel = path.posix.join(prefix, entry.name);

        /**/ if(entry.isDirectory())
        {
            result = result.concat(await walk(abs, rel));
        }
        else if(entry.isFile())
        {
            result.push({
                path: `/${rel.replace(/\\/g, '/')}`,
                size: (await fsp.stat(abs)).size,
            });
        }
    }

    return result;
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* API                                                                                                                */
/*--------------------------------------------------------------------------------------------------------------------*/

const initCache = async () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    cacheDir = path.join(app.getPath('userData'), NYX_CACHE_DIRNAME);

    /*----------------------------------------------------------------------------------------------------------------*/

    await fsp.mkdir(cacheDir, {recursive: true});

    /*----------------------------------------------------------------------------------------------------------------*/

    protocol.handle('nyx', async (request) => {

        try
        {
            const url = new URL(request.url);

            if(url.hostname === 'addons')
            {
                return new Response(await getFile(url.pathname), {
                    status: 200,
                });
            }

            return new Response('Not found', {
                status: 404
            });
        }
        catch(_)
        {
            return new Response('Proxy error', {
                status: 502
            });
        }
    });

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const deleteCachedFile = (pathname) => {

    return fsp.unlink(path.join(cacheDir, normalizePath(pathname)));
};

/*--------------------------------------------------------------------------------------------------------------------*/

const deleteCachedFiles = () => {

    return fsp.rm(cacheDir, {recursive: true, force: true}).then(() => {

        return fsp.mkdir(cacheDir, {recursive: true});
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const listCachedFiles = () => {

    return walk(cacheDir);
};

/*--------------------------------------------------------------------------------------------------------------------*/

module.exports = {
    initCache,
    deleteCachedFiles,
    deleteCachedFile,
    listCachedFiles,
};

/*--------------------------------------------------------------------------------------------------------------------*/
