// noinspection JSUnusedGlobalSymbols
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

        app.directive('indi-group', {

            mounted(divEl) {

                /*----------------------------------------------------------------------------------------------------*/

                const button = document.createElement('button');

                button.innerHTML = '<i class="bi bi-braces"></i>';

                button.className = 'btn';

                divEl.append(button);

                /*----------------------------------------------------------------------------------------------------*/

                button.addEventListener('click', () => {

                    const length = inputs.length;

                    if(length > 0)
                    {
                        if(inputs[0].style.display === 'none') {
                            hideInputs();
                        }
                        else {
                            showInputs();
                        }
                    }
                });

                /*----------------------------------------------------------------------------------------------------*/

                const inputs = divEl.querySelectorAll('input');

                /*----------------------------------------------------------------------------------------------------*/

                const showInputs = () => {

                    const length = inputs.length;

                    if(length > 0)
                    {
                        button.classList.add('btn-outline-primary');
                        button.classList.remove('btn-outline-secondary');

                        inputs[0].style.display = 'none';

                        for(let i = 1; i < length; i++) {
                            inputs[i].style.display = ((''));
                        }
                    }
                };

                /*----------------------------------------------------------------------------------------------------*/

                const hideInputs = () => {

                    const length = inputs.length;

                    if(length > 0)
                    {
                        button.classList.add('btn-outline-secondary');
                        button.classList.remove('btn-outline-primary');

                        inputs[0].style.display = ((''));

                        for(let i = 1; i < length; i++) {
                            inputs[i].style.display = 'none';
                        }
                    }
                };

                /*----------------------------------------------------------------------------------------------------*/

                hideInputs();

                /*----------------------------------------------------------------------------------------------------*/
            }
        });

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
