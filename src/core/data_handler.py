# data_handler.py
import pandas as pd
import json
import os
import constants


def read_csv_to_dataframe(csv_file_path):
    """
    Lee un archivo CSV y lo convierte en un DataFrame de Pandas.
    Args:
        csv_file_path (str): La ruta completa al archivo CSV.
    Returns:
        pd.DataFrame: El DataFrame cargado desde el CSV.
    Raises:
        FileNotFoundError: Si el archivo no se encuentra en la ruta especificada.
        pd.errors.EmptyDataError: Si el archivo CSV está vacío.
        Exception: Para otros errores relacionados con la lectura del CSV.
    """
    try:
        df = pd.read_csv(csv_file_path)
        if df.empty:
            print(f"Advertencia: El archivo CSV '{csv_file_path}' está vacío.")
        return df
    except FileNotFoundError:
        raise FileNotFoundError(f"Error: No se encontró el archivo CSV en la ruta: '{csv_file_path}'")
    except pd.errors.EmptyDataError:
        raise pd.errors.EmptyDataError(f"Error: El archivo CSV '{csv_file_path}' está vacío y no se pudo leer.")
    except Exception as e:
        raise Exception(f"Error inesperado al leer el archivo CSV '{csv_file_path}': {e}")


def filter_dataframe_by_countries(df, countries_list, country_column_name):
    """
    Filtra un DataFrame para incluir solo las filas correspondientes a una lista de países.
    Args:
        df (pd.DataFrame): El DataFrame de Pandas a filtrar.
        countries_list (list): Una lista de nombres de países para mantener.
        country_column_name (str): El nombre de la columna en el DataFrame que contiene los nombres de los países.
    Returns:
        pd.DataFrame: Un nuevo DataFrame filtrado.
    Raises:
        KeyError: Si la columna especificada para los países no se encuentra en el DataFrame.
        Exception: Para otros errores inesperados durante el filtrado.
    """
    if df.empty:
        print(f"Advertencia: El DataFrame de entrada para filtrar por países (columna '{country_column_name}') está vacío.")
        return df

    if country_column_name not in df.columns:
        raise KeyError(f"Error: La columna de país '{country_column_name}' no se encuentra en el DataFrame. Columnas disponibles: {df.columns.tolist()}")

    try:
        # Asegurar que los nombres de países en el DataFrame y en la lista tengan un tratamiento similar (ej. quitando espacios extra)
        df[country_column_name] = df[country_column_name].str.strip()
        countries_list_stripped = [country.strip() for country in countries_list]
        
        filtered_df = df[df[country_column_name].isin(countries_list_stripped)].copy()
        return filtered_df
    except Exception as e:
        raise Exception(f"Error inesperado durante el filtrado de países: {e}")


def create_single_indicator_json(df_indicator_data, output_json_path,
                                 indicator_name, indicator_code,
                                 csv_country_col, csv_code_col, csv_year_col, csv_value_col):
    """
    Crea y guarda un archivo JSON para un único indicador, estructurado por país y año.
    """
    data_by_country = {}

    if df_indicator_data.empty:
        print(f"Advertencia: No hay datos en el DataFrame para el indicador '{indicator_name}' después del preprocesamiento/filtrado. "
              f"El archivo JSON se creará con metadatos pero sin datos de países.")
    else:
        # Validar columnas necesarias
        base_required_cols = [csv_country_col, csv_year_col, csv_value_col]
        # Solo requerir csv_code_col si está explícitamente definido en el mapeo
        if csv_code_col: 
            base_required_cols.append(csv_code_col)
        
        missing_cols = [col for col in base_required_cols if col not in df_indicator_data.columns]
        if missing_cols:
            raise KeyError(
                f"Error: Para el indicador '{indicator_name}', las siguientes columnas no se encuentran en el DataFrame después del preprocesamiento: {missing_cols}. "
                f"Columnas disponibles: {df_indicator_data.columns.tolist()}"
            )

        for country_name, group in df_indicator_data.groupby(csv_country_col):
            country_code = "N/A"
            if csv_code_col and csv_code_col in group.columns and not group[csv_code_col].dropna().empty:
                country_code_series = group[csv_code_col].dropna()
                if not country_code_series.empty:
                    country_code = country_code_series.iloc[0]
            
            yearly_data = {}
            for _, row in group.iterrows():
                year = row[csv_year_col]
                value = row[csv_value_col]
                
                numeric_value = pd.to_numeric(value, errors='coerce')

                if pd.notna(numeric_value):
                    try:
                        year_str = str(int(float(str(year))))
                    except (ValueError, TypeError):
                        year_str = str(year)
                    yearly_data[year_str] = numeric_value
            
            if yearly_data:
                data_by_country[str(country_name).strip()] = { # Asegurar que el nombre del país sea string y sin espacios extra
                    "country_code": str(country_code).strip(), # Asegurar que el código del país sea string
                    "yearly_data": dict(sorted(yearly_data.items()))
                }

    output_data = {
        "indicator_name": indicator_name,
        "indicator_code": indicator_code,
        "data_by_country": data_by_country
    }

    try:
        os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
        with open(output_json_path, 'w', encoding='utf-8') as json_file:
            json.dump(output_data, json_file, ensure_ascii=False, indent=4)
        print(f"Archivo JSON para '{indicator_name}' creado exitosamente en: '{output_json_path}'")
    except IOError as e:
        raise IOError(f"Error de E/S al escribir el archivo JSON en '{output_json_path}': {e}")
    except Exception as e:
        raise Exception(f"Un error inesperado ocurrió al guardar el JSON para '{indicator_name}': {e}")

    return output_data


def process_all_datasets():
    """
    Función principal para procesar todos los datasets definidos en constants.RAW_FILE_PATHS
    y sus mapeos correspondientes en constants.INDICATOR_MAPPINGS.
    """
    print(f"Directorio de datos crudos: {constants.RAW_DATA_DIR}")
    print(f"Directorio de datos procesados: {constants.PROCESSED_DATA_DIR}")
    
    if not os.path.exists(constants.PROCESSED_DATA_DIR):
        print(f"Creando directorio de datos procesados: {constants.PROCESSED_DATA_DIR}")
        os.makedirs(constants.PROCESSED_DATA_DIR)

    processed_files_count = 0
    for logical_name, csv_path in constants.RAW_FILE_PATHS.items():
        print(f"\n--- Procesando: {logical_name} ---")
        
        if logical_name not in constants.INDICATOR_MAPPINGS:
            print(f"Advertencia: No se encontró mapeo para '{logical_name}' en INDICATOR_MAPPINGS. Saltando este archivo.")
            continue
            
        mapping_info = constants.INDICATOR_MAPPINGS[logical_name]
        output_json_path = constants.get_processed_json_path(logical_name)

        try:
            df_raw = read_csv_to_dataframe(csv_path)
            if df_raw.empty:
                print(f"El archivo CSV '{csv_path}' está vacío o no contiene datos. Saltando.")
                continue

            df_processed = df_raw.copy()
            
            # Variables para almacenar los nombres de columna efectivos después del preprocesamiento
            current_csv_country_col = mapping_info['csv_country_col']
            current_csv_code_col = mapping_info.get('csv_code_col') # Usar .get() para manejar si no está definido
            current_csv_year_col = None
            current_csv_value_col = None

            # A. Manejar 'melt_config' (transformación de formato ancho a largo)
            if 'melt_config' in mapping_info:
                print(f"Aplicando 'melt' para '{logical_name}'...")
                config = mapping_info['melt_config']
                id_vars = config['id_vars']
                
                # Asegurar que todas las id_vars estén presentes
                missing_id_vars = [col for col in id_vars if col not in df_processed.columns]
                if missing_id_vars:
                    raise KeyError(f"Para '{logical_name}', las id_vars de melt_config no encontradas: {missing_id_vars}")

                # Columnas a derretir (value_vars) son todas las que no son id_vars
                value_vars = [col for col in df_processed.columns if col not in id_vars]
                
                df_processed = pd.melt(df_processed,
                                       id_vars=id_vars,
                                       value_vars=value_vars,
                                       var_name=mapping_info['post_melt_year_col'],
                                       value_name=mapping_info['post_melt_value_col'])
                
                current_csv_year_col = mapping_info['post_melt_year_col']
                current_csv_value_col = mapping_info['post_melt_value_col']
                
                # Limpiar y convertir la columna de año a tipo numérico (entero)
                df_processed[current_csv_year_col] = pd.to_numeric(df_processed[current_csv_year_col], errors='coerce')
                df_processed.dropna(subset=[current_csv_year_col], inplace=True) # Eliminar filas donde el año no es válido
                df_processed[current_csv_year_col] = df_processed[current_csv_year_col].astype(int)
                print(f"'Melt' completado. Columnas de año y valor ahora son '{current_csv_year_col}' y '{current_csv_value_col}'.")

            # B. Manejar 'value_columns_to_sum'
            elif 'value_columns_to_sum' in mapping_info:
                print(f"Aplicando suma de columnas para '{logical_name}'...")
                cols_to_sum = mapping_info['value_columns_to_sum']
                
                missing_sum_cols = [col for col in cols_to_sum if col not in df_processed.columns]
                if missing_sum_cols:
                    raise KeyError(f"Para '{logical_name}', columnas para sumar no encontradas: {missing_sum_cols}")

                for col in cols_to_sum: # Convertir a numérico antes de sumar
                    df_processed[col] = pd.to_numeric(df_processed[col], errors='coerce')
                
                # Si todas las columnas a sumar son NaN para una fila, el resultado será 0.
                df_processed['calculated_value'] = df_processed[cols_to_sum].sum(axis=1, skipna=True)
                
                current_csv_value_col = 'calculated_value'
                current_csv_year_col = mapping_info['csv_year_col'] # La columna de año original se mantiene
                print(f"Suma de columnas completada. Nueva columna de valor: '{current_csv_value_col}'.")
            
            # C. Caso por defecto (una sola columna 'csv_value_col')
            else:
                current_csv_year_col = mapping_info['csv_year_col']
                current_csv_value_col = mapping_info['csv_value_col']
                if current_csv_value_col not in df_processed.columns:
                     raise KeyError(f"Para '{logical_name}', la columna de valor '{current_csv_value_col}' no fue encontrada.")

            # Filtrar por países después del preprocesamiento
            df_filtered = filter_dataframe_by_countries(
                df_processed,
                constants.LATIN_AMERICAN_COUNTRIES,
                current_csv_country_col 
            )

            if df_filtered.empty:
                print(f"No se encontraron datos para los países latinoamericanos en '{logical_name}' después del filtrado.")
            
            create_single_indicator_json(
                df_indicator_data=df_filtered,
                output_json_path=output_json_path,
                indicator_name=mapping_info['indicator_name_json'],
                indicator_code=mapping_info['indicator_code_json'],
                csv_country_col=current_csv_country_col,
                csv_code_col=current_csv_code_col,
                csv_year_col=current_csv_year_col,
                csv_value_col=current_csv_value_col
            )
            processed_files_count += 1

        except FileNotFoundError as e:
            print(e)
        except KeyError as e:
            print(f"Error de configuración o de columna para '{logical_name}': {e}")
        except Exception as e:
            print(f"Error general procesando el archivo '{logical_name}': {e}")
            import traceback
            traceback.print_exc() # Imprime el stack trace completo para depuración
            
    print(f"\n--- Procesamiento completado. {processed_files_count} archivos JSON generados. ---")

if __name__ == "__main__":
    process_all_datasets()