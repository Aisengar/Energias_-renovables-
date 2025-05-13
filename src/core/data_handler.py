import numpy as np
import pandas as pd
import json
import os

latin_american_countries = [
    "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica",
    "Cuba", "Ecuador", "El Salvador", "Guatemala", "Haití", "Honduras",
    "México", "Nicaragua", "Panamá", "Paraguay", "Perú",
    "República Dominicana", "Uruguay", "Venezuela"
]
file_path = 'src/data/biofuel-production.csv'
file_jason_direction = 'data/procesed_data/energias_renovables.json'


def read_csv(file_path):    
    """
        lee los archivos CSV y los transofrma en un DataFrame
        arg:
        input(csv): un archivo csv
        output(DataFrame): un dataframe de pandas 
    """
    try:
        return  pd.read_csv(file_path)
    except FileNotFoundError:
        raise FileNotFoundError(f"No se encontró el archivo en la ruta: {file_path}")


def filtro_paises(df,lista_paises, country_col_name):
    """
        Filtra los paises en una lista seleccionada
        arg:
        input(df: dataframe): un dataframe de pandas
        output(df: dataframe): un dataframe de pandas filtrado
    """
    try:
        filtro = df.loc[df[country_col_name].isin(lista_paises)]
        return filtro
    except KeyError:
        raise KeyError(f"La columna {country_col_name} no se encuentra en el DataFrame")
    except Exception as e:
        raise Exception(f"Ocurrió un error inesperado durante el filtrado de países: {e}")
     

def crear_json(df): # df aquí es el DataFrame ya filtrado
    """
        Crea la estructura de un archivo Json a partir del DataFrame
        y lo guarda en la ruta especificada por la variable global 'file_jason_direction'.
        arg:
        input(df): dataframe de pandas (filtrado con los países)
        output(dict): Retorna la estructura de datos JSON creada.
    """
    json_datos = {}
    
    metadata_columns = ['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code']
    year_columns = [col for col in df.columns if col not in metadata_columns]

    if df.empty:
        print("Advertencia: El DataFrame para 'crear_json' está vacío. Se creará un archivo JSON vacío.")
    for col in metadata_columns:
        if col not in df.columns:
            raise KeyError(f"La columna de metadatos '{col}' no se encuentra en el DataFrame. "
                           "Asegúrate de que el CSV y el filtrado sean correctos.")
        
    for index, row in df.iterrows():
        country_name = row['Country Name']
        #print(index, row, country_name)
        
        yearly_data = {}
        for year in year_columns:
            value = row[year]
            print(value)
            numeric_value = pd.to_numeric(value, errors='coerce')
            #print(numeric_value)
            if pd.notna(numeric_value):
                yearly_data[year] = numeric_value
        
        json_datos[country_name] = {
            "country_code": row['Country Code'],
            "indicator_name": row['Indicator Name'],
            "indicator_code": row['Indicator Code'],
            "yearly_data": yearly_data
        }

    try:
        with open(file_jason_direction, 'w', encoding='utf-8') as json_file:
            # json.dump escribe el objeto Python (json_datos) en el archivo (json_file)
            # ensure_ascii=False permite caracteres como 'é', 'ñ' directamente.
            # indent=4 formatea el JSON para que sea legible.
            json.dump(json_datos, json_file, ensure_ascii=False, indent=4)
        print(f"Archivo JSON creado exitosamente en: {file_jason_direction}")
    except IOError as e:
        raise IOError(f"Error al escribir el archivo JSON en '{file_jason_direction}': {e}")
    except Exception as e:
        raise Exception(f"Un error inesperado ocurrió al guardar el JSON: {e}")
    return json_datos


def crear_json_con_actualizacion_multi_indicador(df_procesar, output_filepath,entity_col_csv='Entity', 
    code_col_csv='Code',year_col_csv='Year',value_col_csv='Value',nombre_indicador_json = 'Biofuels Production (TWh)',
    codigo_indicador_json = "BIOFUEL_PROD_TWH"):
    """
    Crea o actualiza un archivo JSON con datos de múltiples indicadores por país.
    Lee el JSON existente, añade/actualiza la información del indicador especificado
    para los países en df_procesar, y guarda el JSON.
    """
    
    # Leer JSON existente (si lo hay)
    json_principal = {}
    if os.path.exists(output_filepath):
        try:
            with open(output_filepath, 'r', encoding='utf-8') as f_json_existente:
                json_principal = json.load(f_json_existente)
        except json.JSONDecodeError:
            print(f"Advertencia: El archivo JSON existente en '{output_filepath}' está corrupto o vacío. Se creará uno nuevo.")
        except Exception as e:
            print(f"Error al leer el archivo JSON existente '{output_filepath}': {e}. Se creará uno nuevo.")

    if df_procesar.empty:
        print(f"Advertencia: El DataFrame de entrada para la actualización del JSON con el indicador '{nombre_indicador_json}' está vacío.")
    else:
        # Verificar que las columnas necesarias del CSV estén presentes
        columnas_csv_requeridas = [entity_col_csv, code_col_csv, year_col_csv, value_col_csv]
        for col in columnas_csv_requeridas:
            if col not in df_procesar.columns:
                raise KeyError(f"La columna requerida del CSV '{col}' no se encuentra en el DataFrame de entrada.")

        # Procesar los datos del DataFrame (df_procesar) y actualizar json_principal
        for nombre_pais_csv, grupo_pais_csv in df_procesar.groupby(entity_col_csv):
            if grupo_pais_csv.empty:
                continue

            codigo_pais_csv = grupo_pais_csv[code_col_csv].iloc[0] if not grupo_pais_csv[code_col_csv].empty else "N/A"
            
            # Preparar los datos anuales para el indicador actual
            datos_anuales_indicador = {}
            for _, fila in grupo_pais_csv.iterrows():
                year_csv = fila[year_col_csv]
                valor_csv = fila[value_col_csv]
                valor_numerico = pd.to_numeric(valor_csv, errors='coerce')
                if pd.notna(valor_numerico):
                    try: year_str = str(int(float(year_csv)))
                    except (ValueError, TypeError): year_str = str(year_csv)
                    datos_anuales_indicador[year_str] = valor_numerico
            
            datos_anuales_ordenados = dict(sorted(datos_anuales_indicador.items()))
            
            # Si el país no existe en el JSON, crearlo
            if nombre_pais_csv not in json_principal:
                json_principal[nombre_pais_csv] = {
                    "country_code": codigo_pais_csv,
                    "indicators": {} # Inicializar el diccionario de indicadores
                }
            # Asegurar que el país tenga la entrada "indicators"
            elif "indicators" not in json_principal[nombre_pais_csv]:
                json_principal[nombre_pais_csv]["indicators"] = {}
            
            # Actualizar el código del país si el existente es genérico o vacío
            if json_principal[nombre_pais_csv].get("country_code", "N/A") == "N/A" or \
               not json_principal[nombre_pais_csv].get("country_code"):
                json_principal[nombre_pais_csv]["country_code"] = codigo_pais_csv
            
            # Añadir o sobrescribir los datos para el indicador actual dentro de "indicators"
            json_principal[nombre_pais_csv]["indicators"][nombre_indicador_json] = {
                "indicator_code": codigo_indicador_json,
                "yearly_data": datos_anuales_ordenados
            }
    # 4. Guardar el archivo JSON actualizado (o el original si no hubo datos de entrada y el archivo no existía)
    try:
        with open(output_filepath, 'w', encoding='utf-8') as f_json_salida:
            json.dump(json_principal, f_json_salida, ensure_ascii=False, indent=4)
        print(f"Archivo JSON actualizado/creado exitosamente en: '{output_filepath}'")
    except IOError as e:
        raise IOError(f"Error al escribir el archivo JSON en '{output_filepath}': {e}")
    except Exception as e:
        raise Exception(f"Un error inesperado ocurrió al guardar el JSON actualizado: {e}")
            
    return json_principal



df = read_csv(file_path)
df = filtro_paises(df,latin_american_countries,'Entity')



    