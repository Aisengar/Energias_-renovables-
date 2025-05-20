import os


USER_BASE_DATA_DIR = 'data/'
RAW_DATA_DIR = os.path.join(USER_BASE_DATA_DIR, 'row_data')
PROCESSED_DATA_DIR = os.path.join(USER_BASE_DATA_DIR, 'processed_data')

#graficos.py
SolarEnergy = os.path.join(RAW_DATA_DIR, 'solar-energy-consumption.csv')
WindGeneration = os.path.join(RAW_DATA_DIR, 'wind-generation.csv')
Hydropower = os.path.join(RAW_DATA_DIR, 'hydropower-consumption.csv')
RenewShareEnergy = os.path.join(RAW_DATA_DIR, 'renewable-share-energy.csv')
EnergyDataRenewCons = os.path.join(RAW_DATA_DIR, 'modern-renewable-energy-consumption.csv')
EnergyRenewProd = os.path.join(RAW_DATA_DIR, 'modern-renewable-prod.csv')
EnerConvCol = os.path.join(RAW_DATA_DIR, 'datos_energias_convencionales_Colombia.csv')



LATIN_AMERICAN_COUNTRIES = [
    "Argentina", "Bolivia","Brasil" , "Brazil", "Chile", "Colombia", "Costa Rica",
    "Cuba", "Ecuador", "El Salvador", "Guatemala","Haití", "Haiti", "Honduras",
    "Mexico", "Nicaragua", "Panama", "Paraguay", "Peru","México", "Panamá", "Perú",
    "Dominican Republic", "Uruguay", "Venezuela","República Dominicana"]


RAW_FILE_PATHS = {
    'biofuel_production': os.path.join(RAW_DATA_DIR, 'biofuel-production.csv'),
    'hydropower_consumption': os.path.join(RAW_DATA_DIR, 'hydropower-consumption.csv'),
    'modern_renewable_production': os.path.join(RAW_DATA_DIR, 'modern-renewable-prod.csv'), # Nombre de archivo corregido
    'modern_renewable_consumption': os.path.join(RAW_DATA_DIR, 'modern-renewable-energy-consumption.csv'),
    'renewable_share_energy': os.path.join(RAW_DATA_DIR, 'renewable-share-energy.csv'), # Asegúrate que este es el nombre correcto
    'solar_consumption': os.path.join(RAW_DATA_DIR, 'solar-energy-consumption.csv'),
    'wind_consumption': os.path.join(RAW_DATA_DIR, 'wind-generation.csv'),
    'consumo_energia_renovable': os.path.join(RAW_DATA_DIR, 'Consumo_de_energia_renovable.csv')
}

# Define cómo procesar cada archivo CSV y qué metadatos usar para el JSON.
INDICATOR_MAPPINGS = {
    'biofuel_production': {
        'indicator_name_json': 'Biofuel Production',
        'indicator_code_json': 'BIOFUEL_PROD',
        'csv_country_col': 'Entity',
        'csv_code_col': 'Code',
        'csv_year_col': 'Year',
        'csv_value_col': 'Biofuels production - TWh', # Nombre de columna corregido
        'output_json_filename': 'unir/biofuel_production.json'
    },
    'hydropower_consumption': {
        'indicator_name_json': 'Hydropower Consumption',
        'indicator_code_json': 'HYDRO_CONSUM',
        'csv_country_col': 'Entity',
        'csv_code_col': 'Code',
        'csv_year_col': 'Year',
        'csv_value_col': 'Electricity from hydro - TWh', # Nombre de columna corregido
        'output_json_filename': 'unir/hydropower_consumption.json'
    },
    'modern_renewable_production': {
        'indicator_name_json': 'Modern Renewable Energy Production',
        'indicator_code_json': 'MOD_RENEW_PROD',
        'csv_country_col': 'Entity',
        'csv_code_col': 'Code',
        'csv_year_col': 'Year',
        'value_columns_to_sum': [ # Columnas a sumar para obtener el valor del indicador
            'Electricity from wind - TWh',
            'Electricity from hydro - TWh',
            'Electricity from solar - TWh',
            'Other renewables including bioenergy - TWh'
        ],
        'output_json_filename': 'unir/modern_renewable_production.json'
    },
    'modern_renewable_consumption': {
        'indicator_name_json': 'Modern Renewable Energy Consumption',
        'indicator_code_json': 'MOD_RENEW_CONSUM',
        'csv_country_col': 'Entity',
        'csv_code_col': 'Code',
        'csv_year_col': 'Year',
        'value_columns_to_sum': [
            'Other renewables (including geothermal and biomass) electricity generation - TWh',
            'Solar generation - TWh',
            'Wind generation - TWh',
            'Hydro generation - TWh'
        ],
        'output_json_filename': 'unir/modern_renewable_consumption.json'
    },
    'renewable_share_energy': {
        'indicator_name_json': 'Renewable Energy Share in Total Final Energy Consumption',
        'indicator_code_json': 'RENEW_SHARE_TFEC',
        'csv_country_col': 'Entity',
        'csv_code_col': 'Code',
        'csv_year_col': 'Year',
        'csv_value_col': 'Renewables (% equivalent primary energy)',
        'output_json_filename': 'unir/renewable_share_energy.json'
    },
    'solar_consumption': {
        'indicator_name_json': 'Solar Power Consumption',
        'indicator_code_json': 'SOLAR_CONSUM',
        'csv_country_col': 'Entity',
        'csv_code_col': 'Code',
        'csv_year_col': 'Year',
        'csv_value_col': 'Electricity from solar - TWh',
        'output_json_filename': 'unir/solar_consumption.json'
    },
    'wind_consumption': {
        'indicator_name_json': 'Wind Power Consumption',
        'indicator_code_json': 'WIND_CONSUM',
        'csv_country_col': 'Entity',
        'csv_code_col': 'Code',
        'csv_year_col': 'Year',
        'csv_value_col': 'Electricity from wind - TWh',
        'output_json_filename': 'unir/wind_consumption.json'
    },
    'consumo_energia_renovable': {
        'indicator_name_json': 'Consumo de energía renovable (% del consumo total de energía final)', # Tomado del CSV
        'indicator_code_json': 'EG.FEC.RNEW.ZS', # Tomado del CSV
        'csv_country_col': 'Country Name',
        'csv_code_col': 'Country Code',
        'csv_year_col': 'Year',
        # No 'csv_value_col' directamente, se usa melt_config
        'melt_config': {
            'id_vars': ['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code'],
            'var_name': 'Year_melted', # Nombre temporal para la columna de años derretidos
            'value_name': 'Value_melted' # Nombre temporal para la columna de valores derretidos
        },
        'post_melt_year_col': 'Year',
        'post_melt_value_col': 'Value',
        'output_json_filename': 'unir/consumo_energia_renovable.json'
    }
}

UNIFIED_DATA_FILENAME = 'unified_renewable_data.json'
graficos_data_file_path = 'data/processed_data/unified_renewable_data.json'

def get_processed_json_path(logical_name_or_filename):
    """
    Genera la ruta completa para un archivo JSON procesado.
    Si se provee un logical_name, busca en INDICATOR_MAPPINGS.
    Si se provee un filename directamente (ej: "biofuel_production.json"), lo usa.
    """
    # Ahora esperamos que logical_name_or_filename sea siempre un nombre lógico
    if logical_name_or_filename not in INDICATOR_MAPPINGS:
        raise ValueError(f"Nombre lógico '{logical_name_or_filename}' no encontrado en INDICATOR_MAPPINGS.")
    
    filename = INDICATOR_MAPPINGS[logical_name_or_filename]['output_json_filename']

    return os.path.join(PROCESSED_DATA_DIR, filename)