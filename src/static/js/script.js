document.addEventListener('DOMContentLoaded', () => {

    // VARIABLES
    const menuButton = document.querySelector('.header-menu-btn');
    const headerMenu = document.querySelector('.header-menu');
    const menuLinks = document.querySelectorAll('.header-menu-link');
    const darkModeButton = document.querySelector('.modo-oscuro-btn');

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