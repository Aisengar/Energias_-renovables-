# Energías Renovables - Visualización de Datos

Este proyecto es una aplicación web Flask diseñada para visualizar datos relacionados con las energías renovables en países de América Latina. Procesa archivos CSV de diversas fuentes, los transforma en formato JSON y los presenta a través de una interfaz web.

## Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración](#configuración)
- [Preparación de Datos](#preparación-de-datos)
- [Procesar Datos Crudos](#procesar-datos-crudos)
- [Ejecutar la Aplicación Web](#ejecutar-la-aplicación-web)

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- Python 3.7 o superior
- pip (Administrador de paquetes de Python)

## Estructura del Proyecto

Asegúrate de que tu proyecto tenga la siguiente estructura de directorios. Los scripts de procesamiento y la aplicación esperan esta organización, especialmente para las rutas de datos.

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
│   ├── app.py                   # Aplicación principal Flask
│   ├── core/
│   │   ├── constants.py         # Constantes y mapeos de datos
│   │   └── data_handler.py      # Lógica para procesar los CSV
│   └── templates/
│       ├── index.html           # Plantilla HTML principal
│       └── 404.html             # Plantilla para página no encontrada
├── venv/                        # (Opcional) Directorio del entorno virtual
└── README.md                    # Este archivo
```

## Configuración

Sigue estos pasos para configurar el entorno del proyecto. Se recomienda ejecutar todos los comandos desde el directorio raíz del proyecto (`Energias_-renovables-/`).

1.  **Clona el repositorio (si aún no lo has hecho):**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
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
    pip install Flask pandas
    ```

## Preparación de Datos

1.  **Crea los directorios de datos:**
    Si no existen, crea los directorios `data` y `data/row_data` en la raíz del proyecto:
    ```bash
    mkdir -p data/row_data
    ```
    El directorio `data/processed_data` será creado automáticamente por el script de procesamiento.

2.  **Coloca los archivos CSV crudos:**
    Asegúrate de que todos los archivos CSV fuente (listados en `src/core/constants.py` bajo `RAW_FILE_PATHS`) estén ubicados dentro del directorio `Energias_-renovables-/data/row_data/`.

3.  **Verifica la configuración de rutas en `constants.py`:**
    El archivo `/Users/camilodelgado/Desktop/pagina_talentotech/Energias_-renovables-/src/core/constants.py` define la variable `USER_BASE_DATA_DIR`. Para una portabilidad óptima y para que coincida con la estructura de directorios recomendada, esta variable debería estar configurada como:
    ```python
    USER_BASE_DATA_DIR = 'data/'
    ```
    Si has clonado el proyecto recientemente y se ha aplicado la modificación sugerida anteriormente, este valor ya debería ser el correcto. Si no, por favor actualízalo. Esto asegura que el script de procesamiento busque los datos en `Energias_-renovables-/data/row_data/` y guarde los resultados en `Energias_-renovables-/data/processed_data/`.

## Procesar Datos Crudos

Una vez que los datos crudos estén en su lugar y las dependencias instaladas, ejecuta el script de procesamiento de datos. Este script leerá los CSV, los filtrará y transformará, y guardará los resultados como archivos JSON.

**Desde el directorio raíz del proyecto (`Energias_-renovables-/`)**, ejecuta:
```bash
python src/core/data_handler.py
```
Deberías ver mensajes en la consola indicando el progreso del procesamiento para cada archivo. Los archivos JSON resultantes se guardarán en `Energias_-renovables-/data/processed_data/`.

## Ejecutar la Aplicación Web

Después de procesar los datos, puedes iniciar la aplicación Flask.

**Desde el directorio raíz del proyecto (`Energias_-renovables-/`)**, ejecuta:
```bash
python src/app.py
```
La aplicación se ejecutará (por defecto) en `http://127.0.0.1:5000/`. Abre esta URL en tu navegador web para ver la página.

Para detener la aplicación, presiona `Ctrl+C` en la terminal donde se está ejecutando.