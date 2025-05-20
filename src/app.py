# app.py
from flask import Flask, render_template, jsonify, request
import json
import os
import matplotlib
matplotlib.use('Agg')
from core.constants import *
from core.graficos import (
    create_bar_chart,
    create_pie_chart,
    create_time_series,
    create_grouped_bar_chart,
    create_stacked_area_chart,
    solar_data,
    renewable_production_data,
    renewable_share_data,
    conventional_energy_data,
    renewable_consumption_data,
    LATIN_AMERICAN_COUNTRIES
)


# Inicializar la aplicacion Flask
app = Flask(__name__)

# Ruta de la pagina principa 
@app.route('/')
def index():
    return render_template('index.html')

# Error handlers 
def pagina_no_encontrada(error):
    return render_template('404.html'), 404

@app.route('/404')
def pagina_404():
    return render_template('404.html')

# API de datos 
@app.route('/process_data', methods=['GET'])
def process_data():  
    json_path = get_processed_json_path('consumo_energia_renovable')
    if not os.path.exists(json_path):
        app.logger.error(f"El archivo JSON no existe en la ruta: {json_path}")
        return jsonify({"error": "El archivo JSON no existe"}), 404

    with open(json_path, 'r', encoding='utf-8') as archivo:
        datos_json = json.load(archivo)
    return jsonify(datos_json)


@app.route('/api/unified_data', methods=['GET'])
def get_unified_data():
    unified_json_path = os.path.join(PROCESSED_DATA_DIR, UNIFIED_DATA_FILENAME)
    if not os.path.exists(unified_json_path):
        app.logger.error(f"El archivo de datos unificados no existe: {unified_json_path}.")
        return jsonify({"error": "El archivo de datos unificados no existe. Procese los datos primero."}), 404
  
    with open(unified_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)

#  Gráficos Dinámicos
@app.route('/grafico/consumo_solar_latam')
def consumo_solar_latam_chart_route():
    country = request.args.get('country', "ALL")  # Default to "ALL"
    try:
        solar_latam = solar_data[solar_data['Entity'].isin(LATIN_AMERICAN_COUNTRIES)]
        target_column = next((col for col in solar_data.columns if 'solar' in col.lower() and 'twh' in col.lower()), solar_data.columns[2])
        total_solar_consumption = solar_latam.groupby('Entity')[target_column].sum()
        
        img_base64 = create_bar_chart(
            data=total_solar_consumption,
            title='Consumo Energía Solar (1965-2022)',
            x_label='Países LATAM',
            y_label='Consumo (TWh)',
            country=country
        )
        
        return jsonify({'imagen': img_base64, 'country_requested': country})
        
    except Exception as e:
        app.logger.error(f"Error en ruta /grafico/consumo_solar_latam: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/grafico/participacion_renovable')
def participacion_renovable_chart_route():
    country = request.args.get('country')
    if not country or country == "ALL":
        return jsonify({'error': 'Se requiere un país específico para el gráfico de torta.'}), 400
    
    try:
        country_data = renewable_share_data[renewable_share_data['Entity'] == country].copy()
        if country_data.empty:
            return jsonify({'error': f'No hay datos de participación para {country}.'}), 404
            
        latest_data = country_data.sort_values(by='Year', ascending=False).iloc[0]
        year = int(latest_data['Year'])
        
        percentage_column = 'Renewables (% equivalent primary energy)' 
        if percentage_column not in latest_data:
            percentage_column = 'Renewables (% electricity generation)'  # Fallback
        
        if percentage_column not in latest_data:
            return jsonify({'error': f'Columna de porcentaje no encontrada para {country}.'}), 404
            
        renewable_percentage = latest_data[percentage_column]
        
        img_base64 = create_pie_chart(
            country=country,
            renewable_percentage=renewable_percentage,
            year=year
        )
        
        return jsonify({'imagen': img_base64, 'country_requested': country})
        
    except Exception as e:
        app.logger.error(f"Error en ruta /grafico/participacion_renovable para {country}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/grafico/evolucion_energia_tipos')
def evolucion_energia_tipos_chart_route():
    country = request.args.get('country')
    if not country or country == "ALL":
        return jsonify({'error': 'Se requiere un país específico para el gráfico de evolución de energía.'}), 400
    
    try:
        # Columnas a graficar
        columns_to_plot = [
            'Electricity from wind - TWh', 
            'Electricity from hydro - TWh',
            'Electricity from solar - TWh', 
            'Other renewables including bioenergy - TWh'
        ]
        
        # Filtrar solo columnas que existen en el DataFrame
        columns_to_plot = [col for col in columns_to_plot if col in renewable_production_data.columns]
        
        img_base64 = create_time_series(
            data=renewable_production_data,
            country=country,
            columns_to_plot=columns_to_plot,
            title_prefix='Generación de Energía por Tipo'
        )
        
        return jsonify({'imagen': img_base64, 'country_requested': country})
        
    except Exception as e:
        app.logger.error(f"Error en ruta /grafico/evolucion_energia_tipos para {country}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/grafico/consumo_energetico')
def consumo_energetico_chart_route():
    country = request.args.get('country')
    if not country or country == "ALL":
        return jsonify({'error': 'Se requiere un país específico para el gráfico de consumo energético.'}), 400
    
    try:
        img_base64 = create_stacked_area_chart(
            conventional_data=conventional_energy_data,
            renewable_data=renewable_consumption_data,
            country=country
        )
        
        return jsonify({'imagen': img_base64, 'country_requested': country})
        
    except Exception as e:
        app.logger.error(f"Error en ruta /grafico/consumo_energetico para {country}: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.register_error_handler(404, pagina_no_encontrada)
    app.run(debug=True)
