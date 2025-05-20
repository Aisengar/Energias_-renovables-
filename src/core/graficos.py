import pandas as pd
import matplotlib.pyplot as plt
import os
from constants import *

# Carga de datos
DataSolarEnergy = pd.read_csv(SolarEnergy)
DataWind = pd.read_csv(WindGeneration)
DataHydro = pd.read_csv(Hydropower)
DataRenewShareEnergy = pd.read_csv(RenewShareEnergy)
DataRenewCons = pd.read_csv(EnergyDataRenewCons)
DataRenewProd = pd.read_csv(EnergyRenewProd)
DataEnerConvCol = pd.read_csv(EnerConvCol)


def plot_bar_chart(data, x, y, title, xlabel, ylabel, figsize=(15, 5), rotation=45, country=None):
    """
    Crea un gráfico de barras genérico
    
    Args:
        data: DataFrame o Series con los datos
        x: Valores para el eje x
        y: Valores para el eje y
        title: Título del gráfico
        xlabel: Etiqueta del eje x
        ylabel: Etiqueta del eje y
        figsize: Tamaño de la figura
        rotation: Rotación de las etiquetas del eje x
        country: País específico a filtrar (None para todos)
    """
    # Filtrar por país si se proporciona
    if country:
        if country in x:
            mask = x == country
            x = x[mask]
            y = y[mask]
            title = f"{title} - {country}"
    
    plt.figure(figsize=figsize)
    plt.bar(x, y)
    plt.title(title)
    plt.tick_params(axis='x', labelsize=10)
    plt.xticks(rotation=rotation, ha="right")
    plt.ylabel(ylabel)
    plt.xlabel(xlabel)
    plt.grid()
    plt.show()


def plot_grouped_bar_chart(data, title, ylabel, xlabel='Países', figsize=(20, 10), 
                           width=0.8, rotation=45, legend_title='Tipos de Energía', country=None):
    """
    Crea un grafico de barras agrupadas

    arg:
        data: dataframe
        title: título del grafico
        ylabel: etiqueta del eje y
        xlabel: etiqueta del eje x
        figsize: tamaño del grafico
        width: ancho de las barras
        rotation: angulo de rotacion de las etiquetas del eje x
        legend_title: titulo de la leyenda
        country: país específico a filtrar (None para todos)
    """
    data_copy = data.copy()
    
    # Filtrar por país si se proporciona
    if country:
        if country in data_copy.index:
            data_copy = data_copy.loc[[country]]
            title = f"{title} - {country}"
    
    fig, ax = plt.subplots(figsize=figsize)
    data_copy.plot(kind='bar', width=width, ax=ax)
    
    plt.title(title)
    plt.ylabel(ylabel)
    plt.xlabel(xlabel)
    plt.legend(title=legend_title)
    plt.xticks(rotation=rotation, ha="right")
    plt.grid(axis='y', linestyle='--')
    plt.tight_layout()
    plt.show()


def plot_renewable_pie_chart(pais, porcentaje_renovables, año, figsize=(8, 8)):
    """
    Crea un gráfico de torta para mostrar la participación de energías renovables
    
    Args:
        pais: Nombre del país
        porcentaje_renovables: Porcentaje de energías renovables
        año: Año de los datos
        figsize: Tamaño de la figura
    """
    porcentaje_no_renovables = 100.0 - porcentaje_renovables
    etiquetas_torta = ['Energías Renovables', 'Energías convencionales']
    valores_torta = [porcentaje_renovables, porcentaje_no_renovables]
    colores_torta = ['#F4A401', '#1F7D6A']
    explode_torta = (0.08, 0)

    plt.figure(figsize=figsize)
    plt.pie(valores_torta, explode=explode_torta, labels=etiquetas_torta, 
            colors=colores_torta, autopct='%1.1f%%', startangle=90, 
            wedgeprops={'linewidth': 3, 'edgecolor': "#013120"})
    plt.title(f'Porcentaje Energías Renovables {pais}\n vs Energías Tradicionales en el {año}', 
              fontsize=13)
    plt.axis('equal')
    plt.show()


def plot_energy_time_series(data, country, columns, title, ylabel='Generación en TWh', 
                           xlabel='Años', figsize=(10, 6)):
    """
    Crea un gráfico de líneas para mostrar la evolución de la generación de energía
    
    Args:
        data: DataFrame con los datos
        country: País a analizar
        columns: Columnas a incluir en el gráfico
        title: Título del gráfico
        ylabel: Etiqueta del eje y
        xlabel: Etiqueta del eje x
        figsize: Tamaño de la figura
    """
    color = ['#1F806B', '#F4A401', '#68B8E7', '#75B943']
    
    country_data = data[data['Entity'] == country].dropna()
    
    if not country_data.empty:
        plt.figure(figsize=figsize)
        data_to_plot = country_data[columns]
        data_to_plot.plot(color=color)
        plt.title(f"{title} - {country}")
        plt.ylabel(ylabel)
        plt.xlabel(xlabel)
        plt.legend()
        plt.grid()
        plt.show()


def plot_stackarea_chart(conventional_data, renewable_data, country, figsize=(14, 8)):
    """
    Crea un gráfico de área apilada que muestra la comparación entre energía convencional y renovable
    
    Args:
        conventional_data: DataFrame con datos de energía convencional
        renewable_data: DataFrame con datos de energía renovable
        country: País a visualizar
        figsize: Tamaño de la figura
    """
    # Preparar datos para Colombia (caso especial con datos disponibles)
    if country == 'Colombia':
        DataEnerConvCol_country = conventional_data[['Year', 'Total_Conventional_TWh']].copy()
        DataEnerConvCol_country.rename(columns={'Total_Conventional_TWh': 'Conventional_TWh'}, inplace=True)
    else:
        # Para otros países, creamos un DataFrame vacío o con datos estimados
        # En un caso real, se cargarían los datos específicos del país
        years = renewable_data[renewable_data['Entity'] == country]['Year'].unique()
        DataEnerConvCol_country = pd.DataFrame({'Year': years, 'Conventional_TWh': 0})
    
    # Datos de energía renovable para el país seleccionado
    DataRenewConsCountry = renewable_data[renewable_data['Entity'] == country].copy()
    
    renewable_cols_map = {
        'Other renewables (including geothermal and biomass) electricity generation - TWh': 'Other_Renewables_TWh',
        'Solar generation - TWh': 'Solar_TWh',
        'Wind generation - TWh': 'Wind_TWh',
        'Hydro generation - TWh': 'Hydro_TWh'
    }
    
    # Comprobamos qué columnas están disponibles en el DataFrame
    available_cols = []
    for old_col, new_col in renewable_cols_map.items():
        if old_col in DataRenewConsCountry.columns:
            DataRenewConsCountry[new_col] = pd.to_numeric(DataRenewConsCountry[old_col], errors='coerce').fillna(0)
            available_cols.append(new_col)
    
    # Si no hay columnas disponibles, no continuamos
    if not available_cols:
        print(f"No hay datos de energía renovable disponibles para {country}")
        return
    
    # Calculamos el total de energía renovable
    DataRenewConsCountry['Renewable_TWh'] = DataRenewConsCountry[available_cols].sum(axis=1)
    DataRenewConsCountry = DataRenewConsCountry[['Year', 'Renewable_TWh']]
    
    # Mezclamos los datos de energía convencional y renovable
    df_merged = pd.merge(DataEnerConvCol_country, DataRenewConsCountry, on='Year', how='outer')
    df_merged['Conventional_TWh'] = df_merged['Conventional_TWh'].fillna(0)
    df_merged['Renewable_TWh'] = df_merged['Renewable_TWh'].fillna(0)
    
    # Ordenamos por año
    df_merged = df_merged.sort_values('Year')
    
    # Creamos el gráfico de área apilada
    fig, ax = plt.subplots(figsize=figsize)
    ax.stackplot(df_merged['Year'],
                df_merged['Conventional_TWh'],
                df_merged['Renewable_TWh'],
                labels=['Energía Convencional (TWh)', 'Energía Renovable (TWh)'],
                colors=['#F4A401', '#1F7D6A'],
                alpha=0.8)
    
    ax.set_title(f'Consumo de Energía en {country}: Renovable vs. Convencional', fontsize=16)
    ax.set_xlabel('Año', fontsize=14)
    ax.set_ylabel('Consumo de Energía (TWh)', fontsize=14)
    plt.legend()
    plt.grid(alpha=0.3)
    plt.show()


def visualizar_energia_renovable(pais=None):
    """
    Visualiza estadísticas de energía renovable para un país específico o todos los países.
    
    Args:
        pais: País específico a visualizar. Si es None, se muestran todos los países.
    """
    # Gráfico 1: Consumo de Energía Solar LATAM
    EnergySolarCons = DataSolarEnergy[DataSolarEnergy['Entity'].isin(LATIN_AMERICAN_COUNTRIES)]
    TotalEnergySolarCons = EnergySolarCons.groupby('Entity').sum().iloc[:,2]
    
    plot_bar_chart(
        data=TotalEnergySolarCons,
        x=TotalEnergySolarCons.index,
        y=TotalEnergySolarCons.values,
        title='Consumo de Energía Solar 1965 - 2022',
        xlabel='Países LATAM',
        ylabel='Consumo TWh',
        country=pais
    )

    # Gráfico 2: Producción de Energía Renovable por Fuente
    EnergyRenewConsLATAM = DataRenewProd[DataRenewProd['Entity'].isin(LATIN_AMERICAN_COUNTRIES)]
    TotalRenewProdByCountry = EnergyRenewConsLATAM.groupby('Entity').sum(numeric_only=True)
    energy_columns = ['Electricity from wind - TWh', 'Electricity from hydro - TWh',
                      'Electricity from solar - TWh', 'Other renewables including bioenergy - TWh']
    DataAllCountries = TotalRenewProdByCountry[energy_columns]
    
    plot_grouped_bar_chart(
        data=DataAllCountries,
        title='Producción Total de Energía Renovable por Tipo y País en LATAM',
        ylabel='Generación Total en TWh',
        country=pais
    )

    # Gráfico 3: Participación de Energías Renovables (gráficos de torta)
    countries_to_plot = [pais] if pais else LATIN_AMERICAN_COUNTRIES
    
    for pais_act in countries_to_plot:
        PaisSel = DataRenewShareEnergy[DataRenewShareEnergy['Entity'] == pais_act].copy()
        if not PaisSel.empty:
            PaisSelOrd = PaisSel.sort_values(by='Year', ascending=False)
            
            dato_mas_reciente_pais = PaisSelOrd.iloc[0]
            año_analizado = int(dato_mas_reciente_pais['Year'])
            porcentaje_renovables_pais = dato_mas_reciente_pais['Renewables (% equivalent primary energy)']
            
            plot_renewable_pie_chart(pais_act, porcentaje_renovables_pais, año_analizado)

    # Gráfico 4: Serie de tiempo de generación de energía
    columns = ['Electricity from wind - TWh', 'Electricity from hydro - TWh',
               'Electricity from solar - TWh', 'Other renewables including bioenergy - TWh']
    
    countries_to_plot = [pais] if pais else LATIN_AMERICAN_COUNTRIES
    
    for pais_act in countries_to_plot:
        plot_energy_time_series(
            data=DataRenewProd,
            country=pais_act,
            columns=columns,
            title='Generación de Energía'
        )
        
    # Gráfico 5: Gráfico de área apilada para energía convencional vs renovable
    if pais:
        plot_stackarea_chart(DataEnerConvCol, DataRenewCons, pais)
    else:
        for pais_act in LATIN_AMERICAN_COUNTRIES:
            plot_stackarea_chart(DataEnerConvCol, DataRenewCons, pais_act)

visualizar_energia_renovable('Colombia')

