const url_base = 'http://127.0.0.1:5000'
const web_url_link =  'http://127.0.0.1:5000/api/unified_data'


async function fetchData(url, options) {
    const respuesta = await fetch(url, options);
    //... (as defined in user's fetching.js)...
    if (!respuesta.ok) {
        let errorDatos = { message: respuesta.statusText };
        try {
            errorDatos = await respuesta.json();
        } catch (e) {
            console.warn("La respuesta de error no contenía JSON válido.");
        }
        const error = new Error(`Error HTTP: ${respuesta.status} - ${errorDatos.message || respuesta.statusText}`);
        error.status = respuesta.status;
        error.data = errorDatos;
        throw error;
    }
    return await respuesta.json();
}

// Main function to get and then process the biofuel data
async function loadAndProcessBiofuelData() {
    try {
        const energyData = await fetchData(web_url_link);
        console.log("Unified energy data successfully fetched:", energyData);
        const countries = getCountryList(energyData);
        const uniqueYears = getUniqueYears(energyData);
        const decadeSums = sumProductionByDecade(energyData);
        // Devuelve los datos procesados para que puedan ser utilizados por otros scripts
        return {
            energyData,
            countries,
            uniqueYears,
            decadeSums
        };
    } catch (error) {
        console.error("Failed to load or process biofuel data:", error.message);
        throw error;
    }
}

function getCountryList(jsonData) {
    if (!jsonData || typeof jsonData !== 'object' || jsonData === null) {
        console.error("Invalid JSON data: Expected an object of countries.");
        return [];
    }
    const countries = Object.keys(jsonData);
    console.log("List of countries:", countries);
    return countries;
}


function getUniqueYears(jsonData) {
    if (!jsonData || typeof jsonData !== 'object' || jsonData === null) {
        console.error("Invalid JSON data: Expected an object of countries.");
        return;
    }

    const yearSet = new Set();
    const countriesDataArray = Object.values(jsonData); // jsonData is now the country-keyed object

    countriesDataArray.forEach(countryData => {
        if (countryData && typeof countryData.yearly_data === 'object' && countryData.yearly_data!== null) {
            const yearsForCountry = Object.keys(countryData.yearly_data);
            yearsForCountry.forEach(year => yearSet.add(year));
        }
    });

    const uniqueYears = Array.from(yearSet).sort((a, b) => parseInt(a) - parseInt(b)); // Sort numerically
    console.log("Unique years:", uniqueYears);
    return uniqueYears;
}

async function fetchDashboardChartImage(chartEndpoint, country) {
    let url = `${base_api_url}/grafico/${chartEndpoint}`;
    if (country) {
        url += `?country=${encodeURIComponent(country)}`;
    }
    
    try {
        const data = await fetchData(url);
        if (data && data.imagen) {
            return data.imagen;
        } else {
            // Log the error if present in server's JSON response but not an HTTP error
            console.error(`No se recibió imagen para ${chartEndpoint} desde ${url}. Respuesta:`, data.error || 'Respuesta inesperada');
            return null; // Or throw new Error(data.error || 'Respuesta inesperada');
        }
    } catch (error) {
        // fetchData already logs details of HTTP errors.
        // This catch is for logging context specific to chart fetching.
        console.error(`Error al solicitar gráfico ${chartEndpoint} desde ${url}:`, error.message);
        return null; // Gracefully return null so UI can use default.
    }
}