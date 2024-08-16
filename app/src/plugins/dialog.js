// noinspection JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import * as notification from '@tauri-apps/plugin-notification';

import * as dialog from '@tauri-apps/plugin-dialog';

import * as fs from '@tauri-apps/plugin-fs';

/*--------------------------------------------------------------------------------------------------------------------*/

const _notify = (title, body) => {

    if(!body)
    {
        return;
    }

    if(typeof window['__TAURI__'] !== 'undefined')
    {
        /*------------------------------------------------------------------------------------------------------------*/

        notification.isPermissionGranted().then((permissionGranted) => {

            if(!permissionGranted)
            {
                notification.requestPermission().then((permissionObtained) => {

                    if(permissionObtained === 'granted')
                    {
                        notification.sendNotification({
                            title: title,
                            body: body,
                        });
                    }
                });
            }
            else
            {
                notification.sendNotification({
                    title: title,
                    body: body,
                });
            }
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }
    else
    {
        /*------------------------------------------------------------------------------------------------------------*/

        console.log(body);

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _success = (message) => {

    const el = document.querySelector('[data-tauri-drag-region]').closest('.navbar');

    if(el)
    {
        el.classList.remove('bg-primary');
        el.classList.add('bg-success');

        setTimeout(() => {

            el.classList.remove('bg-success');
            el.classList.add('bg-primary');

        }, 500);
    }

    _notify('Success', message);

    return {then: () => {}};
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _error = (message) => {

    const el = document.querySelector('[data-tauri-drag-region]').closest('.navbar');

    if(el)
    {
        el.classList.remove('bg-primary');
        el.classList.add('bg-danger');

        setTimeout(() => {

            el.classList.remove('bg-danger');
            el.classList.add('bg-primary');

        }, 500);
    }

    _notify('Error', message);

    return {then: () => {}};
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _show = (message, title, type = null) => {

    if(typeof window['__TAURI__'] !== 'undefined')
    {
        /*------------------------------------------------------------------------------------------------------------*/

        dialog.message(message, {title: title, kind: type || 'error'}).catch((e) => {

            console.log(e);
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }
    else
    {
        /*------------------------------------------------------------------------------------------------------------*/

        alert(message);

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _confirm = (message, title, type = null) => {

    return new Promise((resolve) => {

        if(typeof window['__TAURI__'] !== 'undefined')
        {
            /*--------------------------------------------------------------------------------------------------------*/

            dialog.confirm(message, {title: title, kind: type || 'info'}).then((choice) => {

                resolve(choice);
            });

            /*--------------------------------------------------------------------------------------------------------*/
        }
        else
        {
            /*--------------------------------------------------------------------------------------------------------*/

            resolve(confirm(message));

            /*--------------------------------------------------------------------------------------------------------*/
        }
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _open = (defaultPath, typeMime, typeName, typeExts) => {

    return new Promise((resolve, reject) => {

        if(typeof window['__TAURI__'] !== 'undefined')
        {
            /*--------------------------------------------------------------------------------------------------------*/

            dialog.open({
                multiple: false,
                defaultPath: defaultPath,
                filters: [{
                    name: typeName,
                    extensions: typeExts,
                }]
            }).then((file) => {

                if(file)
                {
                    fs.readTextFile(file.path).then((text) => {

                        resolve([text, file.path]);

                    }).catch(() => {

                        reject();
                    });
                }
                else
                {
                    reject();
                }

            }).catch(() => {

                reject();
            });

            /*--------------------------------------------------------------------------------------------------------*/
        }
        else
        {
            /*--------------------------------------------------------------------------------------------------------*/

            const el = document.createElement('input');

            el.accept = typeExts.map((x) => `.${x}`).join(',');

            el.type = 'file';

            /*--------------------------------------------------------------------------------------------------------*/

            el.addEventListener('change', (e) => {

                const file = e.target.files[0];

                if(file)
                {
                    const reader = new FileReader();

                    reader.onload = (e) => {

                        resolve([e.target.result, null]);
                    };

                    reader.onabort = reject;
                    reader.onerror = reject;

                    reader.readAsText(file);
                }
                else
                {
                    reject();
                }

                document.body.removeChild(el);
            });

            document.body.appendChild(el);

            /*--------------------------------------------------------------------------------------------------------*/

            el.click();

            /*--------------------------------------------------------------------------------------------------------*/
        }
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _save = (defaultPath, typeMime, typeName, typeExts, contents) => {

    return new Promise((resolve, reject) => {

        if(typeof window['__TAURI__'] !== 'undefined')
        {
            /*--------------------------------------------------------------------------------------------------------*/

            dialog.save({
                defaultPath: defaultPath,
                filters: [
                    {
                        name: typeName,
                        extensions: typeExts,
                    },
                ],
            }).then((path) => {

                if(path)
                {
                    fs.writeTextFile(path, contents).then(() => {

                        resolve(path);

                    }).catch(() => {

                        reject();
                    });
                }
                else
                {
                    reject();
                }

            }).catch(() => {

                reject();
            });

            /*--------------------------------------------------------------------------------------------------------*/
        }
        else
        {
            /*--------------------------------------------------------------------------------------------------------*/

            const blob = new Blob([contents], {type: typeMime});

            const el = document.createElement('a');

            el.href = URL.createObjectURL(blob);
            el.download = defaultPath;
            el.style.display = 'none';

            document.body.appendChild(el);
            el.click();
            document.body.removeChild(el);

            resolve(null);

            /*--------------------------------------------------------------------------------------------------------*/
        }
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    install(app)
    {
        app.provide('dialog', {
            success: _success,
            error: _error,
            show: _show,
            confirm: _confirm,
            open: _open,
            save: _save,
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
