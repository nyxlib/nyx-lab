/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    install(app)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        app.directive('no-autocomplete', {

            mounted(inputEl)
            {
                inputEl.setAttribute('autocorrect', 'off');
                inputEl.setAttribute('autocomplete', 'off');
                inputEl.setAttribute('autocapitalize', 'off');

                inputEl.setAttribute('spellcheck', 'false');
            }
        });

        /*------------------------------------------------------------------------------------------------------------*/

        app.directive('password-toggle', {

            /*--------------------------------------------------------------------------------------------------------*/

            mounted(inputEl)
            {
                /*----------------------------------------------------------------------------------------------------*/

                const toggleEl = document.createElement('i');

                /*----------------------------------------------------------------------------------------------------*/

                toggleEl.classList.add('bi', 'bi-eye-fill', 'text-secondary', 'position-absolute');

                toggleEl.style.setProperty('right', '1.0rem');
                toggleEl.style.setProperty('bottom', '0.2rem');

                /*----------------------------------------------------------------------------------------------------*/

                const onClickFunc = () => {

                    /**/ if(inputEl.type !== 'password') {
                        toggleEl.classList.remove('bi-eye-slash-fill');
                        toggleEl.classList.add('bi-eye-fill');
                        inputEl.type = 'password';
                    }
                    else if(inputEl.type !== 'text') {
                        toggleEl.classList.remove('bi-eye-fill');
                        toggleEl.classList.add('bi-eye-slash-fill');
                        inputEl.type = 'text';
                    }
                };

                toggleEl.addEventListener('click', onClickFunc);

                /*----------------------------------------------------------------------------------------------------*/

                inputEl.parentElement.classList.add('position-relative');
                inputEl.parentElement.appendChild(toggleEl);

                inputEl.onClickFunc = onClickFunc;
                inputEl.toggleEl = toggleEl;
                inputEl.type = 'password';

                /*----------------------------------------------------------------------------------------------------*/
            },

            /*--------------------------------------------------------------------------------------------------------*/

            unmounted(inputEl)
            {
                if(inputEl.toggleEl && inputEl.onClickFunc)
                {
                    inputEl.toggleEl.removeEventListener('click', inputEl.onClickFunc);
                }
            }

            /*--------------------------------------------------------------------------------------------------------*/
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
