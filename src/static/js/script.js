// script.js
document.addEventListener('DOMContentLoaded', async () => { //

    // VARIABLES GLOBALES (existing)
    const menuButton = document.querySelector('.header-menu-btn');
    const headerMenu = document.querySelector('.header-menu');
    const menuLinks = document.querySelectorAll('.header-menu-link');
    const darkModeButton = document.querySelector('.modo-oscuro-btn');
    const opcionDesplegable = document.querySelector('.opcion-desplegable');
    const contenedorDesplegable = document.querySelector('.contenedor-desplegable');
    const consumptionForm = document.getElementById('consumo-form');
    const regions_lists = document.getElementById('region');
    const tablebody = document.getElementById('table-body');
    
    let allFetchedData = null; 

    // Referencias a los <select> de los gráficos del dashboard
    const barChartCountrySelect = document.getElementById('bar-chart-country-select');
    const pieChartCountrySelect = document.getElementById('pie-chart-country-select');
    const lineChartCountrySelect = document.getElementById('line-chart-country-select');

    // Referencias a los <img> del dashboard
    const dashboardBarChartImg = document.getElementById('dashboard-bar-chart-img');
    const dashboardPieChartImg = document.getElementById('dashboard-pie-chart-img');
    const dashboardLineChartImg = document.getElementById('dashboard-line-chart-img');
    // const dashboardAreaChartImg = document.getElementById('dashboard-area-chart-img'); // Uncomment if used

    // Almacenar las rutas de las imágenes por defecto
    const defaultImageSources = {
        bar: dashboardBarChartImg ? dashboardBarChartImg.src : '',
        pie: dashboardPieChartImg ? dashboardPieChartImg.src : '',
        line: dashboardLineChartImg ? dashboardLineChartImg.src : '',
        // area: dashboardAreaChartImg ? dashboardAreaChartImg.src : '', // Uncomment if used
    };

    // FUNCIONES DE LA TABLA DE DATOS (existing, ensure they are robust)
    function populateDataTable(data) {
        if (!tablebody) {
            console.error('Elemento tbody con id "table-body" no encontrado.');
            return;
        }
        if (!data || Object.keys(data).length === 0) {
            renderEmptyTable(tablebody, 'No hay datos disponibles para mostrar para la selección actual.');
            return;
        }
        tablebody.innerHTML = '';
        const countriesData = data; 
        const hasData = renderCountryData(tablebody, countriesData);
        if (!hasData) {
            renderEmptyTable(tablebody, 'No se encontraron registros para los indicadores y país seleccionados.');
        }
    }

    function renderCountryData(tableBody, countriesData) {
        let anyRowWasRendered = false;
        Object.entries(countriesData).forEach(([countryName, countryDetails]) => {
            if (!countryDetails || !countryDetails.yearly_data) {
                console.warn(`Datos anuales no encontrados o en formato incorrecto para ${countryName}`);
                return; 
            }
            const sortedYearlyData = Object.entries(countryDetails.yearly_data)
                .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB));
            
            sortedYearlyData.forEach(([year, yearlyIndicators]) => {
                addDataRow(tableBody, year, countryName, yearlyIndicators);
                anyRowWasRendered = true;
            });
        });
        return anyRowWasRendered;
    }

    function addDataRow(tableBody, year, countryName, yearlyIndicators) {
        const row = tableBody.insertRow();
        const getValueOrDefault = (indicatorCode, defaultValue = 'N/A') => {
            if (typeof yearlyIndicators !== 'object' || yearlyIndicators === null) return defaultValue;
            const value = yearlyIndicators[indicatorCode];
            return (typeof value === 'number' && isFinite(value)) ? value.toFixed(2) : defaultValue;
        };
        row.insertCell().textContent = year;
        row.insertCell().textContent = countryName;
        row.insertCell().textContent = getValueOrDefault('HYDRO_CONSUM');
        row.insertCell().textContent = getValueOrDefault('WIND_CONSUM');
        row.insertCell().textContent = getValueOrDefault('SOLAR_CONSUM');
        row.insertCell().textContent = getValueOrDefault('BIOFUEL_PROD');
        // La última columna en tu HTML es "Geotérmica (TWh)"
        // Pero en tu JS original usabas 'EG.FEC.RNEW.ZS' (% Energía Renovable Total)
        // Adecúa esto a lo que realmente tengas en unified_data.json y lo que quieras mostrar.
        // Si tienes 'GEOTHERMAL_CONSUM', úsalo. Por ahora, mantendré 'EG.FEC.RNEW.ZS' como ejemplo.
        row.insertCell().textContent = getValueOrDefault('EG.FEC.RNEW.ZS'); 
    }

    function renderEmptyTable(tableBody, message) {
        if (tableBody) {
            const colCount = tableBody.previousElementSibling?.rows?.[0]?.cells?.length || 7;
            tableBody.innerHTML = `<tr><td colspan="${colCount}">${message}</td></tr>`;
        }
    }
    
    // FUNCIONES DEL DROPDOWN DE REGIONES (modified)
    function populateRegionsDropdown(countries, addAllCountriesOption = true) {
        if (!regions_lists) {
            console.error('Elemento select con id "region" no encontrado.');
            return;
        }
        let placeholderOption = regions_lists.querySelector('option[value="none"]');
        if (!placeholderOption) {
            placeholderOption = document.createElement('option');
            placeholderOption.value = "none";
            placeholderOption.textContent = "Seleccione un país...";
        }
        
        regions_lists.innerHTML = ''; // Limpiar opciones existentes
        regions_lists.appendChild(placeholderOption); 
        
        if (addAllCountriesOption) {
            const allOption = document.createElement('option');
            allOption.value = "ALL";
            allOption.textContent = "Todos los Países";
            regions_lists.appendChild(allOption);
        }

        if (countries && countries.length > 0) {
            countries.sort(); 
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                regions_lists.appendChild(option);
            });
        }
        placeholderOption.selected = true; 
    }
    
    // --- Funciones de Menú, Modo Oscuro, Calculadora (sin cambios, deben existir) ---
    function toggleMenu() {if(headerMenu) headerMenu.classList.toggle('show');}
    function hideMenu() {if(headerMenu) headerMenu.classList.remove('show');}
    function removeActiveClassFromLinks() {menuLinks.forEach(link => link.classList.remove('activo'));}
    function handleMenuLinkClick(event) {removeActiveClassFromLinks(); this.classList.add('activo'); hideMenu();}
    function toggleDarkMode() {
        document.body.classList.toggle('modo-oscuro');
        localStorage.setItem('darkMode', document.body.classList.contains('modo-oscuro') ? 'enabled' : 'disabled');
    }
    function applyInitialDarkMode() {if (localStorage.getItem('darkMode') === 'enabled') document.body.classList.add('modo-oscuro');}
    function onSubmitCalculator(ev) {
        ev.preventDefault();
        const PORCENTAGE = 0.29;
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

    // --- FUNCIONES PARA POBLAR Y ACTUALIZAR GRÁFICOS INDIVIDUALES DEL DASHBOARD ---

    function populateChartCountrySelect(selectElement, countries, includeAllOption, defaultText = "Seleccione un país...") {
        if (!selectElement) return;

        selectElement.innerHTML = ''; // Limpiar opciones existentes

        // Opción Placeholder
        const placeholderOption = document.createElement('option');
        placeholderOption.value = "none";
        placeholderOption.textContent = defaultText;
        selectElement.appendChild(placeholderOption);

        if (includeAllOption) {
            const allOption = document.createElement('option');
            allOption.value = "ALL"; // "ALL" para indicar que se quieren datos de todos los países (si el backend lo soporta)
            allOption.textContent = "Todos los Países";
            selectElement.appendChild(allOption);
        }

        if (countries && countries.length > 0) {
            countries.sort().forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                selectElement.appendChild(option);
            });
        }
        selectElement.value = "none"; // Establecer el placeholder como seleccionado por defecto
    }

    async function updateBarChart() {
        if (!dashboardBarChartImg || !barChartCountrySelect) return;
        const selectedCountry = barChartCountrySelect.value;

        if (selectedCountry === "none") {
            dashboardBarChartImg.src = defaultImageSources.bar;
            return;
        }
        
        dashboardBarChartImg.src = 'static/images/loading.gif';
        // Para el gráfico de barras, "ALL" podría ser una opción válida si el backend lo maneja
        // o si selectedCountry es "" o null cuando "ALL" se interpreta como "sin filtro de país específico".
        const countryParam = (selectedCountry === "ALL") ? null : selectedCountry; // Backend podría esperar null/undefined para "todos"
        const barImgBase64 = await fetchDashboardChartImage('consumo_solar_latam', countryParam);
        dashboardBarChartImg.src = barImgBase64 ? `data:image/png;base64,${barImgBase64}` : defaultImageSources.bar;
    }

    async function updatePieChart() {
        if (!dashboardPieChartImg || !pieChartCountrySelect) return;
        const selectedCountry = pieChartCountrySelect.value;

        // Gráfico de torta usualmente no tiene sentido para "ALL", requiere un país específico.
        if (selectedCountry === "none" || selectedCountry === "ALL") {
            dashboardPieChartImg.src = defaultImageSources.pie;
            return;
        }

        dashboardPieChartImg.src = 'static/images/loading.gif';
        const pieImgBase64 = await fetchDashboardChartImage('participacion_renovable', selectedCountry);
        dashboardPieChartImg.src = pieImgBase64 ? `data:image/png;base64,${pieImgBase64}` : defaultImageSources.pie;
    }

    async function updateLineChart() {
        if (!dashboardLineChartImg || !lineChartCountrySelect) return;
        const selectedCountry = lineChartCountrySelect.value;

        // Gráfico de líneas usualmente para un país específico.
        if (selectedCountry === "none" || selectedCountry === "ALL") {
            dashboardLineChartImg.src = defaultImageSources.line;
            return;
        }

        dashboardLineChartImg.src = 'static/images/loading.gif';
        const lineImgBase64 = await fetchDashboardChartImage('evolucion_energia_tipos', selectedCountry);
        dashboardLineChartImg.src = lineImgBase64 ? `data:image/png;base64,${lineImgBase64}` : defaultImageSources.line;
    }


    // CAMBIO DE REGIÓN EN EL DROPDOWN PRINCIPAL (SOLO AFECTA LA TABLA DE DATOS HISTÓRICOS)
    async function handleRegionChange() {
        const selectedCountry = regions_lists.value;

        if (tablebody) tablebody.innerHTML = ''; 

        if (selectedCountry === "none" || !selectedCountry) {
            if (tablebody) renderEmptyTable(tablebody, 'Seleccione un país para ver los datos históricos.');
        } else if (allFetchedData && allFetchedData.energyData) {
            let dataToDisplayForTable;
            if (selectedCountry === "ALL") {
                dataToDisplayForTable = allFetchedData.energyData;
            } else {
                const countrySpecificData = allFetchedData.energyData[selectedCountry];
                dataToDisplayForTable = countrySpecificData ? { [selectedCountry]: countrySpecificData } : {};
            }
            populateDataTable(dataToDisplayForTable);
        } else {
            if (tablebody) renderEmptyTable(tablebody, 'Datos no disponibles para filtrar.');
        }
        // Ya no se actualizan los gráficos del dashboard desde aquí.
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
    
    
    // --- INICIALIZACIÓN ---
    applyInitialDarkMode();
    if (menuButton) menuButton.addEventListener('click', toggleMenu);
    menuLinks.forEach(link => link.addEventListener('click', handleMenuLinkClick));
    if (darkModeButton) darkModeButton.addEventListener('click', toggleDarkMode);
    if (consumptionForm) consumptionForm.addEventListener('submit', onSubmitCalculator);

    try {
        if (typeof loadInitialUnifiedData === 'function') {
            if (tablebody) renderEmptyTable(tablebody, 'Cargando datos iniciales...');
            
            allFetchedData = await loadInitialUnifiedData(); 
            
            if (allFetchedData && allFetchedData.countries) {
                const countries = allFetchedData.countries;
                populateRegionsDropdown(countries, true); // Dropdown principal para la tabla

                // Poblar dropdowns de los gráficos
                populateChartCountrySelect(barChartCountrySelect, countries, true, "País (Todos por defecto)"); // true para "Todos los Países"
                populateChartCountrySelect(pieChartCountrySelect, countries, false, "Seleccione un país");   // false, no tiene sentido "Todos" para pie
                populateChartCountrySelect(lineChartCountrySelect, countries, false, "Seleccione un país");  // false, no tiene sentido "Todos" para line

            } else {
                populateRegionsDropdown([], false);
                populateChartCountrySelect(barChartCountrySelect, [], true);
                populateChartCountrySelect(pieChartCountrySelect, [], false);
                populateChartCountrySelect(lineChartCountrySelect, [], false);
            }
            
            if (tablebody) renderEmptyTable(tablebody, 'Seleccione un país para ver los datos históricos.');
            
            // Cargar gráficos iniciales basados en el estado por defecto de sus dropdowns
            await updateBarChart();
            await updatePieChart();
            await updateLineChart();
        } else {
            console.error('La función loadInitialUnifiedData no está definida.');
            populateRegionsDropdown([], false);
            if (tablebody) renderEmptyTable(tablebody, 'Error al cargar función de datos.');
        }
    } catch (error) {
        console.error('Error crítico al cargar datos iniciales:', error);
        populateRegionsDropdown([], false);
        if (tablebody) renderEmptyTable(tablebody, `Error al cargar datos: ${error.message}.`);
    }

    if (regions_lists) regions_lists.addEventListener('change', handleRegionChange);

    // Event listeners para los dropdowns de los gráficos
    if (barChartCountrySelect) barChartCountrySelect.addEventListener('change', updateBarChart);
    if (pieChartCountrySelect) pieChartCountrySelect.addEventListener('change', updatePieChart);
    if (lineChartCountrySelect) lineChartCountrySelect.addEventListener('change', updateLineChart);
});