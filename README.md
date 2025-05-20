# Energías Renovables - Visualización de Datos

Este proyecto es una aplicación web Flask diseñada para visualizar datos relacionados con las energías renovables en países de América Latina. Procesa archivos CSV de diversas fuentes, los transforma en formato JSON y los presenta a través de una interfaz web.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- Python 3.7 o superior
- pip (Administrador de paquetes de Python)

## Estructura del Proyecto

Asegúrate de que tu proyecto tenga la siguiente estructura de directorios.

```
Energias_-renovables-/
├── data/
│   ├── row_data/
│   │   ├── biofuel-production.csv
│   │   ├── hydropower-consumption.csv
│   │   ├── modern-renewable-prod.csv
│   │   ├── modern-renewable-energy-consumption.csv
│   │   ├── renewable-share-energy.csv
│   │   ├── solar-energy-consumption.csv
│   │   ├── wind-generation.csv
│   │   └── Consumo_de_energia_renovable.csv
│   └── processed_data/
│       └── (Aquí se guardarán los archivos JSON generados)
├── src/
│   ├── app.py                   # Flask
│   ├── core/
│   │   ├── constants.py         # Constantes y mapeos de datos
│   │   └── data_handler.py      # Lógica para procesar los CSV
│   └── templates/
│       ├── index.html           # Plantilla HTML principal
│       └── 404.html             # Plantilla para página no encontrada
├── venv/                        # Directorio del entorno virtual
└── README.md                    # Readme.md
```

## Configuración

Sigue estos pasos para configurar el entorno del proyecto. Se recomienda ejecutar todos los comandos desde el directorio raíz del proyecto (`Energias_-renovables-/`).

1.  **Clona el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO> # Reemplaza <URL_DEL_REPOSITORIO> con la URL del repositorio git.
    cd Energias_-renovables-
    ```

2.  **(Recomendado) Crea y activa un entorno virtual:**
    Esto ayuda a aislar las dependencias del proyecto.
    ```bash
    python3 -m venv venv
    ```
    Para activar el entorno virtual:
    -   En macOS y Linux:
        ```bash
        source venv/bin/activate
        ```
    -   En Windows:
        ```bash
        .\venv\Scripts\activate
        ```

3.  **Instala las dependencias:**
    ```bash
    pip install Flask pandas matplotlib 
   
    ```

## Ejecutar la Aplicación Web

Después de procesar los datos, puedes iniciar la aplicación Flask.

**Desde el directorio raíz del proyecto (`Energias_-renovables-/`)**, ejecuta:
```bash
python src/app.py
```
La aplicación se ejecutará por defecto en `http://127.0.0.1:5000/`. Abre esta URL en tu navegador web para ver la página.

Para detener la aplicación, presiona `Ctrl+C` en la terminal donde se está ejecutando.