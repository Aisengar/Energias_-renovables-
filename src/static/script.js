//Menú button

document.addEventListener('DOMContentLoaded', () => {
    const boton = document.querySelector('.header-menu-btn'); 

    if (boton) {
        boton.addEventListener('click', (ev) => {
            const headerMenu = document.querySelector('.header-menu');

            if (!headerMenu) {
                console.error('No se encontró el elemento .header-menu');
                return;
            }

            headerMenu.classList.toggle('show');
        })
    }
});

//Menú link

document.addEventListener('DOMContentLoaded', () => {
    const enlacesInternos = document.querySelectorAll('.header-menu-link'); 

  
  const quitarClaseActiva = () => {
    enlacesInternos.forEach(enlace => {
      enlace.classList.remove('activo');
    });
  };

  const ocultarMenu = () => {
    const headerMenu = document.querySelector('.header-menu');
    if (headerMenu) {
      headerMenu.classList.remove('show');
    }
  };

  
  enlacesInternos.forEach(enlace => {
    enlace.addEventListener('click', function(event) {
      quitarClaseActiva();
      this.classList.add('activo'); 
      ocultarMenu();
    });
  });
});

//Modo oscuro

document.addEventListener('DOMContentLoaded', () => {
    const boton = document.querySelector('.modo-oscuro-btn');

    if (boton) {
        boton.addEventListener('click', () => {
            document.body.classList.toggle('modo-oscuro');
        });
    }
});