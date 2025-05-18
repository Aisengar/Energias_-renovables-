from flask import Flask, render_template, jsonify
import json
import os
from core.constants import *




# Inicializar la aplicacion Flask
app = Flask(__name__)

# Ruta de la pagina principa, Cargando un formulario
@app.route('/')
def index():
    return render_template('index.html')

#captura cualquier el error 404 y llama a 404.html
def pagina_no_encontrada(error):
    return render_template('404.html'), 404

#direccion para acceder al 404.html sin requerir un error
@app.route('/404')
def pagina_404():
    return render_template('404.html')


# api de datos para 'consumo_energia_renovable.json'
@app.route('/process_data', methods=['GET'])
def process_data():
    try:
        # Usar constants para obtener la ruta dinámicamente
        json_path = get_processed_json_path('consumo_energia_renovable')
    except ValueError as e: # Si 'consumo_energia_renovable' no está en MAPPINGS
        app.logger.error(f"Error al obtener la ruta del JSON: {e}")
        return jsonify({"error": "Configuración de ruta de archivo incorrecta"}), 500
        
    if not os.path.exists(json_path):
        app.logger.error(f"El archivo JSON no existe en la ruta: {json_path}")
        return jsonify({"error": "El archivo JSON no existe"}), 404
    try:
        with open(json_path, 'r', encoding='utf-8') as archivo:
            datos_json = json.load(archivo)
        return jsonify(datos_json)
    except Exception as e:
        app.logger.error(f"Error al leer o procesar el archivo JSON {json_path}: {e}")
        return jsonify({"error": "Error al procesar el archivo de datos"}), 500

@app.route('/api/unified_data', methods=['GET'])
def get_unified_data():
    unified_json_path = os.path.join(PROCESSED_DATA_DIR, UNIFIED_DATA_FILENAME)
    if not os.path.exists(unified_json_path):
        app.logger.error(f"El archivo de datos unificados no existe: {unified_json_path}. Ejecute data_handler.py primero.")
        return jsonify({"error": "El archivo de datos unificados no existe. Por favor, procese los datos primero."}), 404
    try:
        with open(unified_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        app.logger.error(f"Error al leer el archivo de datos unificados {unified_json_path}: {e}")
        return jsonify({"error": "Error al leer el archivo de datos unificados"}), 500

if __name__ == '__main__':
    app.register_error_handler(404, pagina_no_encontrada)
    app.run(debug=True)