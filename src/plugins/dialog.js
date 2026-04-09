/*--------------------------------------------------------------------------------------------------------------------*/

import Swal from 'sweetalert2';

/*--------------------------------------------------------------------------------------------------------------------*/

import getRuntime from '@/runtime';

/*--------------------------------------------------------------------------------------------------------------------*/
/* LOCK                                                                                                               */
/*--------------------------------------------------------------------------------------------------------------------*/

const _LOCKER_HTML = [
    '<div class="spinner-backdrop justify-content-center position-fixed top-0 bottom-0 start-0 end-0 bg-body" style="display: none; z-index: 9999;">',
    '    <div class="align-self-center text-center">',
    '        <div class="spinner-border" style="width: 4rem; height: 4rem;"></div>',
    '        <div class="display-4">please wait…</div>',
    '    </div>',
    '</div>',
].join('\n');

/*--------------------------------------------------------------------------------------------------------------------*/

let _curLockCnt = 0;

/*--------------------------------------------------------------------------------------------------------------------*/
/* LOCKER                                                                                                             */
/*--------------------------------------------------------------------------------------------------------------------*/

const _lock = () => {

    if(_curLockCnt <= 0)
    {
        document.querySelectorAll('.spinner-backdrop').forEach((x) => x.style.display = 'flex');

        _curLockCnt = 1;
    }
    else
    {
        _curLockCnt++;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _unlock = () => {

    if(_curLockCnt <= 1)
    {
        document.querySelectorAll('.spinner-backdrop').forEach((x) => x.style.display = 'none');

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

const _toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

const _notify_fallback = (title, message) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    /** @type {import('sweetalert2').SweetAlertIcon} */
    let icon;

    switch(title)
    {
        case 'Success':
            icon = 'success';
            break;
        case 'Warning':
            icon = 'warning';
            break;
        case 'Error':
            icon = 'error';
            break;
        default:
            icon = 'info';
            break;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return _toast.fire({
        icon: icon,
        title: title,
        text: message,
    });

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _notify = async (title, message) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(typeof title !== 'string')
    {
        title = title ? String(title) : '';
    }

    if(typeof message !== 'string')
    {
        message = message ? String(message) : '';
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    if(!message)
    {
        return;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const runtime = getRuntime();

    /*----------------------------------------------------------------------------------------------------------------*/

    try
    {
        if(await runtime.notifyIsPermissionGranted())
        {
            runtime.notifySend(title, message);
            return;
        }

        if(await runtime.notifyRequestPermission() === 'granted')
        {
            runtime.notifySend(title, message);
            return;
        }

        return _notify_fallback(title, message);
    }
    catch
    {
        return _notify_fallback(title, message);
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _success = (message) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const el = document.querySelector('[data-tauri-drag-region]')?.closest('.navbar');

    /*----------------------------------------------------------------------------------------------------------------*/

    if(el)
    {
        el.classList.remove('nyx-bg1');
        el.classList.add('bg-success');

        setTimeout(() => {

            el.classList.remove('bg-success');
            el.classList.add('nyx-bg1');

        }, 500);
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return _notify('Success', message);

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _warning = (message) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const el = document.querySelector('[data-tauri-drag-region]')?.closest('.navbar');

    /*----------------------------------------------------------------------------------------------------------------*/

    if(el)
    {
        el.classList.remove('nyx-bg1');
        el.classList.add('bg-warning');

        setTimeout(() => {

            el.classList.remove('bg-warning');
            el.classList.add('nyx-bg1');

        }, 500);
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return _notify('Warning', message);

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _error = (message) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const el = document.querySelector('[data-tauri-drag-region]')?.closest('.navbar');

    /*----------------------------------------------------------------------------------------------------------------*/

    if(el)
    {
        el.classList.remove('nyx-bg1');
        el.classList.add('bg-danger');

        setTimeout(() => {

            el.classList.remove('bg-danger');
            el.classList.add('nyx-bg1');

        }, 500);
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return _notify('Error', message);

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _show = (message, title, options = {}) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(typeof message !== 'string')
    {
        message = message ? String(message) : '';
    }

    if(typeof title !== 'string')
    {
        title = title ? String(title) : '';
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const dialogOptions = {
        theme: 'bootstrap-5',
        heightAuto: false,
        width: 'min(800px, calc(100vw - 2rem))',
        customClass: {
            popup: 'modal-content rounded-3 shadow bg-body',
            confirmButton: 'btn btn-outline-success',
        },
        buttonsStyling: false,
        icon: options.icon,
        title: title,
    };

    if(options.html) {
        dialogOptions.html = message;
    }
    else {
        dialogOptions.text = message;
    }

    return Swal.fire(dialogOptions).then(() => {

        return true;
    });

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _confirm = (message, title, options = {}) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(typeof message !== 'string')
    {
        message = message ? String(message): '';
    }

    if(typeof title !== 'string')
    {
        title = title ? String(title) : '';
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const dialogOptions = {
        theme: 'bootstrap-5',
        heightAuto: false,
        width: 'min(800px, calc(100vw - 2rem))',
        customClass: {
            popup: 'modal-content rounded-3 shadow bg-body',
            confirmButton: 'btn btn-outline-success me-2',
            cancelButton: 'btn btn-danger me-0',
        },
        buttonsStyling: false,
        showCancelButton: true,
        icon: options.icon,
        title: title,
    };

    if(options.html) {
        dialogOptions.html = message;
    }
    else {
        dialogOptions.text = message;
    }

    return Swal.fire(dialogOptions).then((result) => {

        return result.isConfirmed;
    });

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _open = (defaultPath, typeMime, typeName, typeExts) => {

    return getRuntime().open(defaultPath, typeMime, typeName, typeExts);
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _save = (defaultPath, typeMime, typeName, typeExts, contents) => {

    return getRuntime().save(defaultPath, typeMime, typeName, typeExts, contents);
};

/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    install(app)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        if(!document.querySelector('.spinner-backdrop'))
        {
            document.body.insertAdjacentHTML('beforeend', _LOCKER_HTML);
        }

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
