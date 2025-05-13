from flask import Flask, render_template, jsonify, request
import csv
import os


# Inisialisar la aplicacion Flask
app = Flask(__name__)

# Ruta de la pagina principa, Cargando un formulario
@app.route('/')
def index():
    return render_template('main.html')

if __name__ == '__main__':
    app.run(debug=True)