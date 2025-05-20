const web_url_link = 'http://127.0.0.1:5000/api/unified_data';
const base_api_url = 'http://127.0.0.1:5000';

async function fetchData(url, options) {
    const respuesta = await fetch(url, options);
    if (!respuesta.ok) {
        let errorDatos = { message: respuesta.statusText };
        try {
            errorDatos = await respuesta.json();
        } catch (e) {
            console.warn("La respuesta de error no contenía JSON válido.", e);
        }
        const errorMessage = (errorDatos && errorDatos.error) ? errorDatos.error : (errorDatos.message || respuesta.statusText);
        const error = new Error(`Error HTTP: ${respuesta.status} - ${errorMessage}`);
        error.status = respuesta.status;
        error.data = errorDatos; 
        throw error;
    }
    
    try {
        return await respuesta.json();
    } catch (e) {
        console.error("Error al parsear la respuesta JSON:", e);
        const error = new Error("La respuesta del servidor no es JSON válido a pesar de un estado OK.");
        error.status = respuesta.status;
        throw error;
    }
}

async function loadInitialUnifiedData() {
    try {
        const energyData = await fetchData(web_url_link);
        const countries = getCountryList(energyData);
        const uniqueYears = getUniqueYears(energyData);
        const decadeSums = sumProductionByDecade(energyData);
        
        return {
            energyData,
            countries,
            uniqueYears,
            decadeSums
        };
    } catch (error) {
        console.error("Fallo al cargar o procesar datos unificados iniciales:", error.message, error.data ? error.data : '');
        throw error; 
    }
}

function getCountryList(jsonData) {
    try {
        return Object.keys(jsonData);
    } catch (error) {
        console.error("Error en getCountryList:", error.message);
        return [];
    }
}

function getUniqueYears(jsonData) {
    try {
        const yearSet = new Set();
        
        Object.values(jsonData).forEach(countryData => {
            const yearsForCountry = Object.keys(countryData.yearly_data || {});
            yearsForCountry.forEach(year => yearSet.add(year));
        });
        
        return Array.from(yearSet).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    } catch (error) {
        console.error("Error en getUniqueYears:", error.message);
        return [];
    }
}

function sumProductionByDecade(jsonData) {
    try {
        const productionByDecade = {};
        const indicatorToSum = 'BIOFUEL_PROD';

        Object.values(jsonData).forEach(countryData => {
            Object.entries(countryData.yearly_data || {}).forEach(([yearStr, yearlyIndicators]) => {
                const yearNum = parseInt(yearStr, 10);
                const productionValue = yearlyIndicators?.[indicatorToSum];
                
                if (!isNaN(yearNum) && typeof productionValue === 'number' && isFinite(productionValue)) {
                    const decadeStartYear = Math.floor(yearNum / 10) * 10;
                    const decadeKey = `${decadeStartYear}s`;
                    
                    productionByDecade[decadeKey] = (productionByDecade[decadeKey] || 0) + productionValue;
                }
            });
        });
        
        // Redondear valores a 3 decimales
        Object.keys(productionByDecade).forEach(decade => {
            productionByDecade[decade] = parseFloat(productionByDecade[decade].toFixed(3));
        });
        
        return productionByDecade;
    } catch (error) {
        console.error("Error en sumProductionByDecade:", error.message);
        return {};
    }
}

async function fetchDashboardChartImage(chartEndpoint, country) {
    try {
        let url = `${base_api_url}/grafico/${chartEndpoint}`;
        if (country) {
            url += `?country=${encodeURIComponent(country)}`;
        }
        
        const data = await fetchData(url);
        return data.imagen || null;
    } catch (error) {
        console.error(`Error al solicitar gráfico ${chartEndpoint}:`, error.message);
        return null;
    }
}