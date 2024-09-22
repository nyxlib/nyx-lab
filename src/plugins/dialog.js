// noinspection JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import * as notification from '@tauri-apps/plugin-notification';

import * as dialog from '@tauri-apps/plugin-dialog';

import * as fs from '@tauri-apps/plugin-fs';

/*--------------------------------------------------------------------------------------------------------------------*/
/* LOCK                                                                                                               */
/*--------------------------------------------------------------------------------------------------------------------*/

const _LOCKER_HTML = `
    <!-- *********************************************************************************************************** -->

    <div id="DEC2F4DE">
        <div class="align-self-center text-center">
            <div class="spinner-border" role="status" style="width: 4rem; height: 4rem;"></div>
            <div class="display-4" role="status">loading…</div>
        </div>
    </div>

    <!-- *********************************************************************************************************** -->

    <style>

        #DEC2F4DE {

            /*--------------------------------------------------------------------------------------------------------*/

            display: none;
            justify-content: center;

            /*--------------------------------------------------------------------------------------------------------*/

            position: fixed;

            top: 0;
            left: 0;

            width: 100vw;
            height: 100vh;

            /*--------------------------------------------------------------------------------------------------------*/

            z-index: 9999;

            /*--------------------------------------------------------------------------------------------------------*/

            background-color: var(--bs-body-bg);

            /*--------------------------------------------------------------------------------------------------------*/
        }

    </style>

    <!-- *********************************************************************************************************** -->
`;

/*--------------------------------------------------------------------------------------------------------------------*/

let _curLockCnt = 0;

/*--------------------------------------------------------------------------------------------------------------------*/

const _lock = () => {

    if(_curLockCnt <= 0)
    {
        document.getElementById('DEC2F4DE').style.display = 'flex';

        _curLockCnt = 1;
    }
    else
    {
        _curLockCnt++;
    }
}

/*--------------------------------------------------------------------------------------------------------------------*/

const _unlock = () => {

    if(_curLockCnt <= 1)
    {
        document.getElementById('DEC2F4DE').style.display = 'none';

        _curLockCnt = 0;
    }
    else
    {
        _curLockCnt--;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* DIALOGS                                                                                                            */
/*--------------------------------------------------------------------------------------------------------------------*/

const _notify = (body, title) => {

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

    _notify(message, 'Success');

    return {then: () => {}};
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _warning = (message) => {

    const el = document.querySelector('[data-tauri-drag-region]').closest('.navbar');

    if(el)
    {
        el.classList.remove('bg-primary');
        el.classList.add('bg-warning');

        setTimeout(() => {

            el.classList.remove('bg-warning');
            el.classList.add('bg-primary');

        }, 500);
    }

    _notify(message, 'Warning');

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

    _notify(message, 'Error');

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
        /*------------------------------------------------------------------------------------------------------------*/

        document.body.innerHTML += _LOCKER_HTML;

        /*------------------------------------------------------------------------------------------------------------*/

        app.provide('dialog', {
            /* LOCKER */
            lock: _lock,
            unlock: _unlock,
            /* DIALOGS */
            notify: _notify,
            /**/
            success: _success,
            warning: _warning,
            error: _error,
            /**/
            show: _show,
            /**/
            confirm: _confirm,
            /**/
            open: _open,
            save: _save,
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
