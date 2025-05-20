import pandas as pd
import matplotlib.pyplot as plt
import io
import base64
from core.constants import *

# Carga de datos con nombres más descriptivos
solar_data = pd.read_csv(SolarEnergy)
wind_data = pd.read_csv(WindGeneration)
hydro_data = pd.read_csv(Hydropower)
renewable_share_data = pd.read_csv(RenewShareEnergy)
renewable_consumption_data = pd.read_csv(EnergyDataRenewCons)
renewable_production_data = pd.read_csv(EnergyRenewProd)
conventional_energy_data = pd.read_csv(EnerConvCol)


def create_bar_chart(data, title, x_label, y_label, figsize=(10, 6), rotation=45, country=None):
    """
    Crea un gráfico de barras y devuelve la imagen como base64.
    """
    plot_data = data.copy()
    chart_title = title
    
    if country and country != "ALL":
        plot_data = plot_data.loc[[country]]
        chart_title = f"{title} - {country}"
        
    fig, ax = plt.subplots(figsize=figsize)
    plot_data.plot(kind='bar', ax=ax, color=COLORS[0])
    ax.set_title(chart_title)
    ax.tick_params(axis='x', labelsize=10)
    ax.set_xticklabels(ax.get_xticklabels(), rotation=rotation, ha="right")
    ax.set_ylabel(y_label)
    ax.set_xlabel(x_label)
    ax.grid(True, linestyle='--', alpha=0.7)

    fig.tight_layout()
    
    return convert_to_base64(fig)

def create_grouped_bar_chart(data, title, y_label, x_label='Países', figsize=(18, 9),
                             width=0.8, rotation=45, legend_title='Tipos de Energía', country=None):
    """
    Crea un gráfico de barras agrupadas y devuelve la imagen como base64.
    """
    plot_data = data.copy()
    chart_title = title
    
    if country and country != "ALL":
        plot_data = plot_data.loc[[country]]
        chart_title = f"{title} - {country}"
    
    fig, ax = plt.subplots(figsize=figsize)
    plot_data.plot(kind='bar', width=width, ax=ax, color=COLORS)
    ax.set_title(chart_title)
    ax.set_ylabel(y_label)
    ax.set_xlabel(x_label)
    ax.legend(title=legend_title, fontsize='small')
    ax.set_xticklabels(ax.get_xticklabels(), rotation=rotation, ha="right")
    ax.grid(axis='y', linestyle='--', alpha=0.7)
    
    fig.tight_layout()
    
    return convert_to_base64(fig)

def create_pie_chart(country, renewable_percentage, year, figsize=(8, 8)):
    """
    Crea un gráfico circular de participación renovable vs no renovable.
    """
    non_renewable_percentage = 100.0 - renewable_percentage
    labels = ['Energías Renovables', 'Energías No Renovables']
    values = [renewable_percentage, non_renewable_percentage]
    colors = [COLORS[1], COLORS[0]]
    explode = (0.08, 0)

    fig, ax = plt.subplots(figsize=figsize)
    ax.pie(values, explode=explode, labels=labels,
           colors=colors, autopct='%1.1f%%', startangle=90,
           wedgeprops={'linewidth': 2, 'edgecolor': "#013120"})
    ax.set_title(f'Participación Renovables {country}\nvs No Renovables en {year}', fontsize=13)
    ax.axis('equal')
    
    fig.tight_layout()

    return convert_to_base64(fig)

def create_time_series(data, country, columns_to_plot, title_prefix, 
                      y_label='Generación (TWh)', x_label='Año', figsize=(12, 7)):
    """
    Crea un gráfico de líneas para la evolución de energía.
    """
    country_data = data[data['Entity'] == country].copy()
    chart_title = f"{title_prefix} - {country}"
    
    country_data['Year'] = pd.to_numeric(country_data['Year'], errors='coerce')
    country_data = country_data.dropna(subset=['Year'])
    country_data = country_data.sort_values('Year').set_index('Year')
    
    fig, ax = plt.subplots(figsize=figsize)
    
    for i, column in enumerate(columns_to_plot):
        if column in country_data.columns:
            # Simplificar etiquetas para la leyenda
            clean_label = column.replace(' - TWh', '').replace('Electricity from ', '').replace('generation', '').strip()
            ax.plot(country_data.index, country_data[column], 
                    label=clean_label, color=COLORS[i % len(COLORS)])

    ax.set_title(chart_title)
    ax.set_ylabel(y_label)
    ax.set_xlabel(x_label)
    ax.legend(fontsize='medium')
    ax.grid(True, linestyle='--', alpha=0.7)
    
    fig.tight_layout()
    
    return convert_to_base64(fig)

def create_stacked_area_chart(conventional_data, renewable_data, country, figsize=(14, 7)):
    """
    Crea un gráfico de área apilada mostrando energía renovable vs convencional.
    """
    chart_title = f'Consumo Energético en {country}: Renovable vs. Convencional'
    
    # Preparar datos convencionales
    if country == 'Colombia' and 'Total_Conventional_TWh' in conventional_data.columns:
        conv_df = conventional_data[['Year', 'Total_Conventional_TWh']].copy()
        conv_df.rename(columns={'Total_Conventional_TWh': 'Conventional_TWh'}, inplace=True)
    else:
        conv_col_name = next(col for col in conventional_data.columns if 'conventional' in col.lower())
        conv_df = conventional_data[conventional_data['Entity'] == country][['Year', conv_col_name]].copy()
        conv_df.rename(columns={conv_col_name: 'Conventional_TWh'}, inplace=True)
    
    # Preparar datos renovables
    renew_df = renewable_data[renewable_data['Entity'] == country].copy()
    renewable_cols = [
        'Other renewables (including geothermal and biomass) electricity generation - TWh',
        'Solar generation - TWh',
        'Wind generation - TWh',
        'Hydro generation - TWh'
    ]
    
    available_cols = [col for col in renewable_cols if col in renew_df.columns]
    
    for col in available_cols:
        renew_df[col] = pd.to_numeric(renew_df[col], errors='coerce').fillna(0)
    
    renew_df['Renewable_TWh'] = renew_df[available_cols].sum(axis=1)
    renew_df = renew_df[['Year', 'Renewable_TWh']]
    
    # Unir datos
    merged_df = pd.merge(conv_df, renew_df, on='Year', how='outer').fillna(0)
    merged_df = merged_df.sort_values('Year').drop_duplicates(subset=['Year'], keep='first')
    
    # Crear gráfico
    fig, ax = plt.subplots(figsize=figsize)
    ax.stackplot(merged_df['Year'],
                merged_df['Conventional_TWh'],
                merged_df['Renewable_TWh'],
                labels=['Energía Convencional (TWh)', 'Energía Renovable (TWh)'],
                colors=[COLORS[1], COLORS[0]],
                alpha=0.8)
    
    ax.set_title(chart_title, fontsize=16)
    ax.set_xlabel('Año', fontsize=14)
    ax.set_ylabel('Consumo de Energía (TWh)', fontsize=14)
    ax.legend(loc='upper left')
    ax.grid(True, linestyle='--', alpha=0.7)
    fig.tight_layout()

    return convert_to_base64(fig)

def convert_to_base64(fig):
    """
    Convierte una figura de matplotlib a una imagen en formato base64.
    """
    buf = io.BytesIO()
    fig.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    buf.close()
    plt.close(fig)
    return img_base64