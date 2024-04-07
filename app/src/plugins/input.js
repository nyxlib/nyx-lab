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
            }
        });

        /*------------------------------------------------------------------------------------------------------------*/

        app.directive('password-toggle', {

            mounted(inputEl)
            {
                /*----------------------------------------------------------------------------------------------------*/

                const toggleEl = document.createElement('i');

                /*----------------------------------------------------------------------------------------------------*/

                toggleEl.classList.add(...['bi', 'bi-eye-fill', 'text-secondary', 'position-absolute']);

                toggleEl.style.setProperty('right', '1.0rem');
                toggleEl.style.setProperty('bottom', '0.2rem');

                toggleEl.addEventListener('click', () => {

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
                });

                /*----------------------------------------------------------------------------------------------------*/

                inputEl.parentElement.classList.add('position-relative');

                inputEl.parentElement.appendChild(toggleEl);

                inputEl.type = 'password';

                /*----------------------------------------------------------------------------------------------------*/
            }
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
