document.addEventListener('DOMContentLoaded', () => {

    // VARIABLES
    const menuButton = document.querySelector('.header-menu-btn');
    const headerMenu = document.querySelector('.header-menu');
    const menuLinks = document.querySelectorAll('.header-menu-link');
    const darkModeButton = document.querySelector('.modo-oscuro-btn');
    const opcionDesplegable = document.querySelector('.opcion-desplegable');
    const contenedorDesplegable = document.querySelector('.contenedor-desplegable');

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

    //calculadora
});