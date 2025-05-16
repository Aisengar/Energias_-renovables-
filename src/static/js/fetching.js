const web_url_link =  'http://127.0.0.1:5000/process_data'


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
        const biofuelData = await fetchData(web_url_link);
        console.log("Biofuel data successfully fetched:", biofuelData);

        const countries = getCountryList(biofuelData);
        const uniqueYears = getUniqueYears(biofuelData);
        const decadeSums = sumProductionByDecade(biofuelData);
        // Devuelve los datos procesados para que puedan ser utilizados por otros scripts
        return {
            biofuelData,
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
    if (!jsonData || typeof jsonData.data_by_country!== 'object' || jsonData.data_by_country === null) {
        console.error("Invalid JSON data: 'data_by_country' field is missing or not an object.");
        return [];
    }
    const countries = Object.keys(jsonData.data_by_country);
    console.log("List of countries:", countries);
    return countries;
}

function getUniqueYears(jsonData) {
    if (!jsonData || typeof jsonData.data_by_country!== 'object' || jsonData.data_by_country === null) {
        console.error("Invalid JSON data: 'data_by_country' field is missing or not an object.");
        return;
    }

    const yearSet = new Set();
    const countriesDataArray = Object.values(jsonData.data_by_country);

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

function sumProductionByDecade(jsonData) {
    if (!jsonData || typeof jsonData.data_by_country!== 'object' || jsonData.data_by_country === null) {
        console.error("Invalid JSON data: 'data_by_country' field is missing or not an object.");
        return {};
    }
    const productionByDecade = {};

    const countriesDataArray = Object.values(jsonData.data_by_country);

    countriesDataArray.forEach(countryData => {
        if (countryData && typeof countryData.yearly_data === 'object' && countryData.yearly_data!== null) {
            for (const [yearStr, productionValue] of Object.entries(countryData.yearly_data)) {
                const yearNum = parseInt(yearStr, 10);
                // Ensure productionValue is a number and yearNum is valid
                if (!isNaN(yearNum) && typeof productionValue === 'number' && isFinite(productionValue)) {
                    const decadeStartYear = Math.floor(yearNum / 10) * 10;
                    const decadeKey = `${decadeStartYear}s`;

                    if (!productionByDecade[decadeKey]) {
                        productionByDecade[decadeKey] = 0;
                    }
                    productionByDecade[decadeKey] += productionValue;
                }
            }
        }
    });

    for (const decade in productionByDecade) {
        productionByDecade[decade] = parseFloat(productionByDecade[decade].toFixed(3)); // Example: 3 decimal places
    }

    console.log("Total biofuel production by decade (global):", productionByDecade);
    return productionByDecade;
}