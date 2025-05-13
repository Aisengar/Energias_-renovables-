from flask import Flask, render_template, jsonify, request
import json
import os


# Inisialisar la aplicacion Flask
app = Flask(__name__)

# Ruta de la pagina principa, Cargando un formulario
@app.route('/')
def index():
    return render_template('index.html')


def pagina_no_encontrada(error):
    return render_template('404.html'), 404


@app.route('/process_data', methods=['GET'])
def process_data():
    print(request)
    print(dir(request))
    print(request.form)
    json_path = 'data/processed_data/consumo_energia_renovable.json'
    if not os.path.exists(json_path):
        print(f"El archivo JSON no existe en la ruta: {json_path}")
        return jsonify({"error": "El archivo JSON no existe"}), 404
    with open(json_path, 'r') as archivo:
        datos_json = json.load(archivo)
    return jsonify(datos_json)


if __name__ == '__main__':
    app.register_error_handler(404, pagina_no_encontrada)
    app.run(debug=True)