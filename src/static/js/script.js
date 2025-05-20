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
    function onSubmitCalculator(ev) { /* ... tu lógica ... */ }
    function setupDropdownMenu() { /* ... tu lógica ... */ }


    // --- ACTUALIZAR GRÁFICOS DEL DASHBOARD ---
    async function updateDashboard(selectedCountry) {
        // Si no se selecciona país, o se selecciona "none", mostrar imágenes por defecto
        if (!selectedCountry || selectedCountry === "none") {
            if(dashboardBarChartImg) dashboardBarChartImg.src = defaultImageSources.bar;
            if(dashboardPieChartImg) dashboardPieChartImg.src = defaultImageSources.pie;
            if(dashboardLineChartImg) dashboardLineChartImg.src = defaultImageSources.line;
            // if(dashboardAreaChartImg) dashboardAreaChartImg.src = defaultImageSources.area;
            return;
        }

        // Cargar y mostrar Gráfico de Barras (Consumo Solar)
        if (dashboardBarChartImg && typeof fetchDashboardChartImage === 'function') {
            dashboardBarChartImg.src = 'static/images/loading.gif'; // Temporalmente muestra un loader
            const barImgBase64 = await fetchDashboardChartImage('consumo_solar_latam', selectedCountry); // 'selectedCountry' puede ser "ALL"
            dashboardBarChartImg.src = barImgBase64 ? `data:image/png;base64,${barImgBase64}` : defaultImageSources.bar;
        }

        // Cargar y mostrar Gráfico de Torta (Participación Renovable)
        // Este gráfico usualmente no tiene sentido para "ALL", requiere un país específico.
        if (dashboardPieChartImg && typeof fetchDashboardChartImage === 'function') {
            if (selectedCountry === "ALL") {
                dashboardPieChartImg.src = defaultImageSources.pie; // Mostrar default si "ALL"
            } else {
                dashboardPieChartImg.src = 'static/images/loading.gif';
                const pieImgBase64 = await fetchDashboardChartImage('participacion_renovable', selectedCountry);
                dashboardPieChartImg.src = pieImgBase64 ? `data:image/png;base64,${pieImgBase64}` : defaultImageSources.pie;
            }
        }

        // Cargar y mostrar Gráfico de Líneas (Evolución por tipo)
        // Similar al de torta, usualmente para un país específico.
        if (dashboardLineChartImg && typeof fetchDashboardChartImage === 'function') {
            if (selectedCountry === "ALL") {
                dashboardLineChartImg.src = defaultImageSources.line; 
            } else {
                dashboardLineChartImg.src = 'static/images/loading.gif';
                const lineImgBase64 = await fetchDashboardChartImage('evolucion_energia_tipos', selectedCountry);
                dashboardLineChartImg.src = lineImgBase64 ? `data:image/png;base64,${lineImgBase64}` : defaultImageSources.line;
            }
        }
        
        // Añade aquí la lógica para otros gráficos (ej. Area Chart) si los implementas.
    }


    // CAMBIO DE REGIÓN Y ACTUALIZACIÓN DE TABLA/GRÁFICOS (modificado)
    async function handleRegionChange() {
        const selectedCountry = regions_lists.value;
        // console.log("Región seleccionada:", selectedCountry);

        if (tablebody) tablebody.innerHTML = ''; 

        if (selectedCountry === "none" || !selectedCountry) {
            if (tablebody) renderEmptyTable(tablebody, 'Seleccione un país para ver los datos históricos.');
        } else if (allFetchedData && allFetchedData.energyData) {
            let dataToDisplayForTable;
            if (selectedCountry === "ALL") {
                // Para la tabla, si se selecciona "ALL", podrías mostrar datos de todos los países
                // o un mensaje. Aquí asumimos mostrar todos.
                dataToDisplayForTable = allFetchedData.energyData;
            } else {
                const countrySpecificData = allFetchedData.energyData[selectedCountry];
                dataToDisplayForTable = countrySpecificData ? { [selectedCountry]: countrySpecificData } : {};
            }
            populateDataTable(dataToDisplayForTable);
        } else {
            if (tablebody) renderEmptyTable(tablebody, 'Datos no disponibles para filtrar.');
        }
        
        // Actualizar los gráficos del dashboard con el país seleccionado (puede ser "ALL")
        await updateDashboard(selectedCountry);
    }
    
    // --- INICIALIZACIÓN ---
    applyInitialDarkMode();
    if (menuButton) menuButton.addEventListener('click', toggleMenu);
    menuLinks.forEach(link => link.addEventListener('click', handleMenuLinkClick));
    if (darkModeButton) darkModeButton.addEventListener('click', toggleDarkMode);
    if (consumptionForm) consumptionForm.addEventListener('submit', onSubmitCalculator);
    setupDropdownMenu();

    try {
        if (typeof loadInitialUnifiedData === 'function') { // Renombrada de loadAndProcessBiofuelData
            if (tablebody) renderEmptyTable(tablebody, 'Cargando datos iniciales...');
            
            allFetchedData = await loadInitialUnifiedData(); 
            
            if (allFetchedData && allFetchedData.countries) {
                populateRegionsDropdown(allFetchedData.countries, true); // true para añadir "Todos los Países"
            } else {
                populateRegionsDropdown([], false);
            }
            
            if (tablebody) renderEmptyTable(tablebody, 'Seleccione un país para ver los datos históricos.');
            await updateDashboard(regions_lists.value); // Cargar gráficos con la selección inicial ("none" o "ALL")

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
});