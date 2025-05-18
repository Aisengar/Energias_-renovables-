document.addEventListener('DOMContentLoaded', async () => {

    // VARIABLES GLOBALES
    const menuButton = document.querySelector('.header-menu-btn');
    const headerMenu = document.querySelector('.header-menu');
    const menuLinks = document.querySelectorAll('.header-menu-link');
    const darkModeButton = document.querySelector('.modo-oscuro-btn');
    const opcionDesplegable = document.querySelector('.opcion-desplegable');
    const contenedorDesplegable = document.querySelector('.contenedor-desplegable');
    const consumptionForm = document.getElementById('consumo-form');
    const regions_lists = document.getElementById('region');
    const tablebody = document.getElementById('table-body');
    
    // Variable para almacenar todos los datos cargados
    let allFetchedData = null; 

    // FUNCIONES DE LA TABLA DE DATOS
    function populateDataTable(data) {
        const tablebody = document.getElementById('table-body');
        if (!tablebody) {
            console.error('Elemento tbody con id "table-body" no encontrado.');
            return;
        }
        
        // Validar los datos recibidos
        if (!data || Object.keys(data).length === 0) {
            console.error('Datos no válidos o ausentes para poblar la tabla.');
            renderEmptyTable(tablebody, 'No hay datos disponibles para mostrar.');
            return;
        }
        
        // Limpiar contenido previo
        tablebody.innerHTML = '';

        // Procesar y mostrar los datos
        const countriesData = data; 
        const hasData = renderCountryData(tablebody, countriesData);
        
        if (!hasData) {
            renderEmptyTable(tablebody, 'No se encontraron registros para los indicadores seleccionados.');
        }
    }

    function renderCountryData(tableBody, countriesData) {
        let hasData = false;
        const biofuelIndicatorCode = 'BIOFUEL_PROD';

        // Iterar sobre los países
        Object.entries(countriesData).forEach(([countryName, countryDetails]) => {
            if (!countryDetails?.yearly_data) return;
            
            // Ordenar los datos anuales por año (ascendente)
            const sortedYearlyData = Object.entries(countryDetails.yearly_data)
                .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB));
            
            sortedYearlyData.forEach(([year, yearlyIndicators]) => {
                // Extraer el valor del indicador de biocombustibles para este año
                const biofuelProduction = yearlyIndicators[biofuelIndicatorCode];
                if (typeof biofuelProduction === 'number' && isFinite(biofuelProduction)) {
                    hasData = true;
                    addDataRow(tableBody, year, countryName, yearlyIndicators); // Pasamos todos los indicadores del año
                }
            });
        });
        
        return hasData;
    }

    function addDataRow(tableBody, year, countryName, yearlyIndicators) {
        const row = tableBody.insertRow();

        const getValueOrDefault = (indicatorCode, defaultValue = 'N/A') => {
            const value = yearlyIndicators[indicatorCode];
            return (typeof value === 'number' && isFinite(value)) ? value.toFixed(3) : defaultValue;
        };

        // Añadir celdas con datos
        row.insertCell().textContent = year;                 // Año
        row.insertCell().textContent = countryName;          // País
        row.insertCell().textContent = getValueOrDefault('HYDRO_CONSUM'); // Hidráulica
        row.insertCell().textContent = getValueOrDefault('WIND_CONSUM');  // Eólica
        row.insertCell().textContent = getValueOrDefault('SOLAR_CONSUM'); // Solar
        
        // Biocombustibles (TWh)
        const biofuelCell = row.insertCell();
        biofuelCell.textContent = getValueOrDefault('BIOFUEL_PROD');
        
        // Geotérmica no está directamente en unified_renewable_data.json con un código simple.
        // Si 'Other renewables including bioenergy - TWh' de 'modern_renewable_production' incluye geotérmica, se necesitaría ese mapeo.
        // Por ahora, lo dejamos como N/A o podrías buscarlo si está en 'MOD_RENEW_PROD' o similar.
        row.insertCell().textContent = 'N/A'; // Geotérmica (Placeholder)
    }

    function renderEmptyTable(tableBody, message) {
        tableBody.innerHTML = `<tr><td colspan="7">${message}</td></tr>`;
    }

    function toggleMenu() {
        const navList = document.getElementById('nav-list');
        navList?.classList.toggle('show');
    }

    // FUNCIONES DEL DROPDOWN DE REGIONES
    function populateRegionsDropdown(countries) {
        if (!regions_lists) {
            console.error('Elemento select con id "region" no encontrado.');
            return;
        }
        // Guardamos la primera opción (placeholder) si existe y es la que esperamos
        let placeholderOption = regions_lists.options[0];
        if (!placeholderOption || placeholderOption.value !== "none") {
            placeholderOption = document.createElement('option');
            placeholderOption.value = "none";
            placeholderOption.textContent = ""; 
        }
        
        regions_lists.innerHTML = '';
        regions_lists.appendChild(placeholderOption); 
        placeholderOption.selected = true; 

        if (countries && countries.length > 0) {
            countries.sort();
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                regions_lists.appendChild(option);
            });
        } 
    }
    
    // FUNCIONES DEL MENÚ DE NAVEGACIÓN
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

    // FUNCIONES DEL MODO OSCURO
    function toggleDarkMode() {
        document.body.classList.toggle('modo-oscuro');
    }

    // FUNCIONES DE LA CALCULADORA
    function onSubmitCalculator(ev) {
        ev.preventDefault();
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
        resultElement.innerHTML = `${Intl.NumberFormat('es-CO').format(result)} kWh`;
    }

    // CONFIGURACIÓN DE LOS EVENT LISTENERS

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
        consumptionForm.addEventListener('submit', onSubmitCalculator);
    }

    // CONFIGURACIÓN DEL MENÚ DESPLEGABLE
    if (opcionDesplegable && contenedorDesplegable) {
        let timeoutId;
        opcionDesplegable.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            contenedorDesplegable.style.visibility = 'visible';
            contenedorDesplegable.style.opacity = '1';
            contenedorDesplegable.style.pointerEvents = 'auto';
        });
    

        // Al salir del menú principal
        opcionDesplegable.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(() => {
                if (!contenedorDesplegable.matches(':hover')) {
                    contenedorDesplegable.style.visibility = 'hidden';
                    contenedorDesplegable.style.opacity = '0';
                    contenedorDesplegable.style.pointerEvents = 'none';
                }
            }, 50); // Retraso de 50ms
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
            }, 50); // Retraso de 300ms
        });
    }
    
    // CAMBIO DE REGIÓN FILTRADO DE TABLA
    function handleRegionChange() {
        if (!allFetchedData || !allFetchedData.energyData) {
            console.warn("No hay datos cargados para filtrar o la estructura de datos es incorrecta.");
            if (tablebody) renderEmptyTable(tablebody, 'Datos no disponibles para filtrar. Intente cargar de nuevo.');
            return;
        }
        const selectedCountry = regions_lists.value;
        console.log("Region seleccionada:", selectedCountry);

        // Limpiar la tabla antes de popularla o mostrar mensaje
        if (tablebody) tablebody.innerHTML = '';

        if (selectedCountry === "none") {
            // Si se selecciona "none" mostrar todos los datos
            // populateDataTable(allFetchedData.energyData); // Opción para mostrar todos los países
             renderEmptyTable(tablebody,'Seleccione un pais para ver los datos Historicos');
        } else {
            // Filtrar datos para el país seleccionado
            const countrySpecificData = allFetchedData.energyData[selectedCountry];
            
            if (countrySpecificData) {
                // Crear un objeto de datos filtrados con la misma estructura que espera populateDataTable
                const filteredData = {
                    [selectedCountry]: countrySpecificData
                };
                populateDataTable(filteredData);
            } else {
                console.warn(`No se encontraron datos para el país seleccionado: ${selectedCountry}`);
                if (tablebody) renderEmptyTable(tablebody, `No se encontraron datos para ${selectedCountry}.`);
            }
        }
    }

    // CARGA INICIAL DE DATOS
    try {
        if (typeof loadAndProcessBiofuelData === 'function') {
            const result = await loadAndProcessBiofuelData(); // result = { energyData, countries, ... }
            
            // Poblar el dropdown de regiones
            if (result?.countries) {
                allFetchedData = result; // Almacenar el objeto { energyData, countries, ... }
                populateRegionsDropdown(result.countries);
            } else {
                console.warn("No se recibieron datos de países de loadAndProcessBiofuelData.");
                populateRegionsDropdown([]); // Array vacío para mostrar mensaje de "no disponibles"
            }
            
            // Poblar la tabla de datos
            if (tablebody) {
                renderEmptyTable(tablebody, 'Seleccione un país para ver los datos Históricos');
            }

        } else {
            console.error('La función loadAndProcessBiofuelData no está definida. Asegúrate de que fetching.js se carga antes que script.js.');
            populateRegionsDropdown([]);
            if (tablebody) {
                renderEmptyTable(tablebody, 'Error: La función para cargar datos no está disponible.');
            }
        }
    } catch (error) {
        console.error('Error al cargar y procesar los datos para el dropdown y la tabla:', error);
        populateRegionsDropdown([]);
        if (tablebody) {
            renderEmptyTable(tablebody, `Error al cargar los datos: ${error.message}`);
        }
    }

    // Event listener para el cambio en el selector de región
    if (regions_lists) {
        regions_lists.addEventListener('change', handleRegionChange);
    }
});