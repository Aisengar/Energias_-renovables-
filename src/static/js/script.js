// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burger-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            burger.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                burger.classList.remove('active');
            }
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });

    // Datos Históricos Section
    const loadDataBtn = document.getElementById('load-data-btn');
    const dataTable = document.getElementById('data-table');
    const tableBody = document.getElementById('table-body');
    const csvFileInput = document.getElementById('csv-file');
    
    // Sample data for precargados button
    const sampleData = [
        { year: 2022, country: 'Mundial', hydro: 4327.8, wind: 2085.6, solar: 1289.3, biofuels: 657.2, geothermal: 99.4 },
        { year: 2021, country: 'Mundial', hydro: 4274.5, wind: 1862.4, solar: 1036.2, biofuels: 623.8, geothermal: 97.1 },
        { year: 2020, country: 'Mundial', hydro: 4297.3, wind: 1596.1, solar: 844.4, biofuels: 591.5, geothermal: 95.6 },
        { year: 2022, country: 'China', hydro: 1339.6, wind: 867.4, solar: 469.8, biofuels: 132.4, geothermal: 0.2 },
        { year: 2022, country: 'Estados Unidos', hydro: 251.3, wind: 434.7, solar: 209.4, biofuels: 106.5, geothermal: 18.3 },
        { year: 2022, country: 'Brasil', hydro: 382.1, wind: 96.2, solar: 34.7, biofuels: 73.6, geothermal: 0.0 }
    ];
    
    // Load sample data
    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', () => {
            populateTable(sampleData);
        });
    }
    
    // Handle CSV file upload
    if (csvFileInput) {
        csvFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const csvData = event.target.result;
                    const parsedData = parseCSV(csvData);
                    populateTable(parsedData);
                };
                reader.readAsText(file);
            }
        });
    }
    
    // Parse CSV data
    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const result = [];
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const obj = {};
            const currentLine = lines[i].split(',');
            
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j].trim().toLowerCase()] = currentLine[j].trim();
            }
            
            result.push({
                year: parseInt(obj.year || obj.año || 0),
                country: obj.country || obj.país || obj.pais || '',
                hydro: parseFloat(obj.hydro || obj.hidraulica || obj.hidroeléctrica || 0),
                wind: parseFloat(obj.wind || obj.eólica || obj.eolica || 0),
                solar: parseFloat(obj.solar || 0),
                biofuels: parseFloat(obj.biofuels || obj.biocombustibles || 0),
                geothermal: parseFloat(obj.geothermal || obj.geotérmica || obj.geotermica || 0)
            });
        }
        
        return result;
    }
    
    // Populate table with data
    function populateTable(data) {
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        data.forEach(row => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${row.year}</td>
                <td>${row.country}</td>
                <td>${row.hydro.toFixed(1)}</td>
                <td>${row.wind.toFixed(1)}</td>
                <td>${row.solar.toFixed(1)}</td>
                <td>${row.biofuels.toFixed(1)}</td>
                <td>${row.geothermal.toFixed(1)}</td>
            `;
            
            tableBody.appendChild(tr);
        });
    }

    // Calculadora Section
    const calculateBtn = document.getElementById('calculate-btn');
    const consumptionInput = document.getElementById('consumption');
    const regionSelect = document.getElementById('region');
    const resultContainer = document.getElementById('result-container');
    const renewablePercentage = document.getElementById('renewable-percentage');
    const totalConsumption = document.getElementById('total-consumption');
    const renewableConsumption = document.getElementById('renewable-consumption');
    const co2Savings = document.getElementById('co2-savings');
    
    // Regional renewable energy percentages (approximated)
    const renewablePercentages = {
        global: 28.4,
        europe: 39.2,
        northamerica: 22.1,
        latinamerica: 61.5,
        asia: 25.7,
        africa: 20.3,
        oceania: 27.8
    };
    
    // CO2 emissions factor (kg CO2/kWh) for non-renewable energy
    const co2Factor = 0.5;
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const consumption = parseFloat(consumptionInput.value) || 0;
            const region = regionSelect.value;
            const percentage = renewablePercentages[region] || renewablePercentages.global;
            
            const renewableAmount = (consumption * percentage / 100).toFixed(1);
            const co2Reduction = (renewableAmount * co2Factor).toFixed(1);
            
            renewablePercentage.textContent = `${percentage.toFixed(1)}%`;
            totalConsumption.textContent = `${consumption.toFixed(1)} kWh/mes`;
            renewableConsumption.textContent = `${renewableAmount} kWh/mes`;
            co2Savings.textContent = `${co2Reduction} kg/mes`;
            
            resultContainer.style.display = 'block';
        });
    }

    // Dashboard Section
    const yearFilter = document.getElementById('year-filter');
    const countryFilter = document.getElementById('country-filter');
    
    let productionChart, shareChart, capacityChart, comparisonChart;
    
    // Chart data (simplified sample data)
    const chartData = {
        // Data for different years and countries
        world: {
            2022: {
                production: {
                    hydro: 4327.8,
                    wind: 2085.6,
                    solar: 1289.3,
                    biofuels: 657.2,
                    geothermal: 99.4
                },
                share: {
                    renewable: 28.4,
                    conventional: 71.6
                },
                capacity: [
                    { year: 2018, solar: 486, wind: 564, hydro: 1143 },
                    { year: 2019, solar: 584, wind: 622, hydro: 1156 },
                    { year: 2020, solar: 710, wind: 733, hydro: 1170 },
                    { year: 2021, solar: 849, wind: 824, hydro: 1195 },
                    { year: 2022, solar: 1049, wind: 899, hydro: 1236 }
                ]
            },
            2021: {
                production: {
                    hydro: 4274.5,
                    wind: 1862.4,
                    solar: 1036.2,
                    biofuels: 623.8,
                    geothermal: 97.1
                },
                share: {
                    renewable: 26.7,
                    conventional: 73.3
                },
                capacity: [
                    { year: 2017, solar: 402, wind: 515, hydro: 1122 },
                    { year: 2018, solar: 486, wind: 564, hydro: 1143 },
                    { year: 2019, solar: 584, wind: 622, hydro: 1156 },
                    { year: 2020, solar: 710, wind: 733, hydro: 1170 },
                    { year: 2021, solar: 849, wind: 824, hydro: 1195 }
                ]
            }
        },
        // Add more data for other countries/years as needed
        usa: {
            2022: {
                production: {
                    hydro: 251.3,
                    wind: 434.7,
                    solar: 209.4,
                    biofuels: 106.5,
                    geothermal: 18.3
                },
                share: {
                    renewable: 22.8,
                    conventional: 77.2
                },
                capacity: [
                    { year: 2018, solar: 62, wind: 95, hydro: 102 },
                    { year: 2019, solar: 75, wind: 103, hydro: 102 },
                    { year: 2020, solar: 89, wind: 118, hydro: 102 },
                    { year: 2021, solar: 110, wind: 132, hydro: 102 },
                    { year: 2022, solar: 140, wind: 141, hydro: 103 }
                ]
            }
        }
    };
    
    // Default charts data for other countries and years
    const defaultChartData = {
        production: {
            hydro: 1000,
            wind: 500,
            solar: 300,
            biofuels: 150,
            geothermal: 50
        },
        share: {
            renewable: 25,
            conventional: 75
        },
        capacity: [
            { year: 2018, solar: 100, wind: 150, hydro: 300 },
            { year: 2019, solar: 130, wind: 170, hydro: 310 },
            { year: 2020, solar: 170, wind: 200, hydro: 320 },
            { year: 2021, solar: 210, wind: 230, hydro: 330 },
            { year: 2022, solar: 250, wind: 260, hydro: 340 }
        ]
    };
    
    // Initialize dashboard
    initDashboard();
    
    // Update dashboard when filters change
    if (yearFilter && countryFilter) {
        yearFilter.addEventListener('change', updateDashboard);
        countryFilter.addEventListener('change', updateDashboard);
    }
    
    function initDashboard() {
        const ctx1 = document.getElementById('production-chart')?.getContext('2d');
        const ctx2 = document.getElementById('share-chart')?.getContext('2d');
        const ctx3 = document.getElementById('capacity-chart')?.getContext('2d');
        const ctx4 = document.getElementById('comparison-chart')?.getContext('2d');
        
        if (!ctx1 || !ctx2 || !ctx3 || !ctx4) return;
        
        // Initialize charts with default data
        productionChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Hidráulica', 'Eólica', 'Solar', 'Biocombustibles', 'Geotérmica'],
                datasets: [{
                    label: 'Producción (TWh)',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'TWh'
                        }
                    }
                }
            }
        });
        
        shareChart = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: ['Renovables', 'Convencionales'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(201, 203, 207, 0.7)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(201, 203, 207, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });
        
        capacityChart = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: [2018, 2019, 2020, 2021, 2022],
                datasets: [
                    {
                        label: 'Solar',
                        data: [0, 0, 0, 0, 0],
                        borderColor: 'rgba(255, 206, 86, 1)',
                        backgroundColor: 'rgba(255, 206, 86, 0.1)',
                        tension: 0.1,
                        fill: true
                    },
                    {
                        label: 'Eólica',
                        data: [0, 0, 0, 0, 0],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        tension: 0.1,
                        fill: true
                    },
                    {
                        label: 'Hidráulica',
                        data: [0, 0, 0, 0, 0],
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        tension: 0.1,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Capacidad (GW)'
                        }
                    }
                }
            }
        });
        
        comparisonChart = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: ['2018', '2019', '2020', '2021', '2022'],
                datasets: [
                    {
                        label: 'Renovable',
                        data: [22, 23, 24, 26, 28],
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Convencional',
                        data: [78, 77, 76, 74, 72],
                        backgroundColor: 'rgba(201, 203, 207, 0.7)',
                        borderColor: 'rgba(201, 203, 207, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        stacked: false,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Porcentaje (%)'
                        }
                    },
                    x: {
                        stacked: false
                    }
                }
            }
        });
        
        // Initial update
        updateDashboard();
    }
    
    function updateDashboard() {
        if (!yearFilter || !countryFilter) return;
        
        const year = yearFilter.value;
        const country = countryFilter.value;
        
        // Get data for selected year and country, or use default if not available
        let data;
        if (chartData[country] && chartData[country][year]) {
            data = chartData[country][year];
        } else if (chartData.world && chartData.world[year]) {
            data = chartData.world[year];
        } else {
            data = defaultChartData;
        }
        
        // Update Production Chart
        productionChart.data.datasets[0].data = [
            data.production.hydro,
            data.production.wind,
            data.production.solar,
            data.production.biofuels,
            data.production.geothermal
        ];
        productionChart.update();
        
        // Update Share Chart
        shareChart.data.datasets[0].data = [
            data.share.renewable,
            data.share.conventional
        ];
        shareChart.update();
        
        // Update Capacity Chart
        capacityChart.data.labels = data.capacity.map(item => item.year);
        capacityChart.data.datasets[0].data = data.capacity.map(item => item.solar);
        capacityChart.data.datasets[1].data = data.capacity.map(item => item.wind);
        capacityChart.data.datasets[2].data = data.capacity.map(item => item.hydro);
        capacityChart.update();
        
    }
});