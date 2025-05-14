document.addEventListener('DOMContentLoaded', () => {

    // VARIABLES
    const menuButton = document.querySelector('.header-menu-btn');
    const headerMenu = document.querySelector('.header-menu');
    const menuLinks = document.querySelectorAll('.header-menu-link');
    const darkModeButton = document.querySelector('.modo-oscuro-btn');
    const opcionDesplegable = document.querySelector('.opcion-desplegable');
    const contenedorDesplegable = document.querySelector('.contenedor-desplegable');
    const consumptionForm = document.getElementById('consumo-form');

    // FUNCTIONS
    
    // Menú functions
    function toggleMenu() {
        if (!headerMenu) {
            console.error('No se encontró el elemento .header-menu');
            return;
        }
        headerMenu.classList.toggle('show');
    }
    
    function hideMenu() {
        if (headerMenu) {
            headerMenu.classList.remove('show');
        }
    }

    // Menú link functions
    function removeActiveClass() {
        menuLinks.forEach(link => {
            link.classList.remove('activo');
        });
    }
    
    function handleMenuLinkClick(event) {
        removeActiveClass();
        this.classList.add('activo');
        hideMenu();
    }

    // Modo oscuro function
    function toggleDarkMode() {
        document.body.classList.toggle('modo-oscuro');
    }

    function onSubmitCalculator(ev) {
        ev.preventDefault();
        // Porcentaje de energías que provienen de fuentes renovables.
        // En base a la producción de energía total
        const PORCENTAGE = 0.37;
        const userInput = document.getElementById('consumo-usuario');
        const resultContainer = document.getElementById('resultado-calculadora');
        const resultElement = document.getElementById('consumo-resultado');

        if (!userInput || !resultContainer) {
            alert('No se han obtenido los elementos necesarios para realizar los calculos');
            return;
        }

        const value = Number(userInput.value);

        if (Number.isNaN(value)) {
            alert('El valor ingresado no es un número');
        }

        const result = Number(value * PORCENTAGE).toFixed(0);

        resultContainer.style.visibility = 'visible';
        resultElement.innerHTML = `${Intl.NumberFormat('es-CO').format(result)} kWh`
    }

    // Mejorar el comportamiento del menú desplegable
    if (opcionDesplegable && contenedorDesplegable) {
        let timeoutId; //
        opcionDesplegable.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            contenedorDesplegable.style.visibility = 'visible';
            contenedorDesplegable.style.opacity = '1';
            contenedorDesplegable.style.pointerEvents = 'auto';
        });
        
        // Al salir del menú principal
        opcionDesplegable.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(() => {
                // Solo ocultamos si el ratón no está sobre el menú desplegable
                if (!contenedorDesplegable.matches(':hover')) {
                    contenedorDesplegable.style.visibility = 'hidden';
                    contenedorDesplegable.style.opacity = '0';
                    contenedorDesplegable.style.pointerEvents = 'none';
                }
            }, 50); // Retraso de 300ms
        });
        
        // Al salir del menú desplegable
        contenedorDesplegable.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(() => {
                // Solo ocultamos si el ratón no está sobre el menú principal
                if (!opcionDesplegable.matches(':hover')) {
                    contenedorDesplegable.style.visibility = 'hidden';
                    contenedorDesplegable.style.opacity = '0';
                    contenedorDesplegable.style.pointerEvents = 'none';
                }
            }, 300); // Retraso de 300ms
        });
    }

    //EVENT LISTENERS
    
    // Menú button listener
    if (menuButton) {
        menuButton.addEventListener('click', toggleMenu);
    }
    
    // Menú links listeners
    menuLinks.forEach(link => {
        link.addEventListener('click', handleMenuLinkClick);
    });
    
    // Modo oscuro listener
    if (darkModeButton) {
        darkModeButton.addEventListener('click', toggleDarkMode);
    }

    // Calculadora
    if (consumptionForm) {
        consumptionForm.addEventListener('submit', onSubmitCalculator)
    }
});