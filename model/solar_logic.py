# ==============================================================================
# IMPORTS
# ==============================================================================
import numpy as np
import pandas as pd
import requests
from scipy.interpolate import CubicSpline
import joblib


# ==============================================================================
# SECTION 0 — LOAD MODEL
# ==============================================================================
solar_best_model = joblib.load("solar_best_model.pkl")


# ==============================================================================
# SECTION 1 — CONSTANTS
# ==============================================================================
MAHARASHTRA_BOUNDS = {
    'lat_min': 15.6,
    'lat_max': 22.1,
    'lon_min': 72.6,
    'lon_max': 80.9
}

PANEL_SPECS = {
    'Monocrystalline': {'wattage': 400, 'efficiency': 0.20, 'area_m2': 2.00},
    'Polycrystalline': {'wattage': 350, 'efficiency': 0.15, 'area_m2': 2.33},
    'Thin-film': {'wattage': 250, 'efficiency': 0.10, 'area_m2': 2.50}
}

DEGRADATION_RATE = {
    'Monocrystalline': 0.005,
    'Polycrystalline': 0.006,
    'Thin-film': 0.008
}

NOCT_CELSIUS = 45
NOCT_AMBIENT_STD = 20
NOCT_IRRADIANCE_STD = 800

INVERTER_CAPACITY_KW = 1.362
INDIA_SOILING_FACTOR = 0.96

ROOF_UTILISATION_FACTOR = {
    'flat': 0.75,
    'low_slope': 0.80,
    'medium_slope': 0.85,
    'steep': 0.90
}

TILT_DEGREES = {
    'flat': 0,
    'low_slope': 15,
    'medium_slope': 30,
    'steep': 55
}

MNRE_COST_UPTO_2KW = 50000
MNRE_COST_ABOVE_2KW = 45000

SUBSIDY_RATE_UPTO_2KW = 0.60
SUBSIDY_RATE_2KW_TO_3KW = 0.40
SUBSIDY_CAP_ABOVE_3KW = 78000

ELECTRICITY_RATE_PER_KWH = 7.0
MAINTENANCE_COST_PER_KW_PER_YEAR = 1500
PANEL_LIFETIME_YEARS = 25

INDIA_GRID_EMISSION_FACTOR = 0.716
TREE_CO2_ABSORPTION_KG = 21.77

GHI_THRESHOLDS = {'excellent': 1900, 'good': 1800, 'adequate': 1724}
PAYBACK_THRESHOLDS = {'excellent': 6, 'good': 8, 'marginal': 10}

NREL_MIN_ROOF_AREA_M2 = 10
NREL_MAX_TILT_DEGREES = 60

SUITABILITY_BANDS = {
    'highly_suitable': (8, 9),
    'suitable': (6, 7),
    'marginally_suitable': (3, 5),
    'not_recommended': (0, 2)
}


# ==============================================================================
# SECTION 2 — VALIDATION
# ==============================================================================
def validate_location(lat, lon):
    if not (MAHARASHTRA_BOUNDS['lat_min'] <= lat <= MAHARASHTRA_BOUNDS['lat_max']):
        raise ValueError("Latitude outside Maharashtra bounds")

    if not (MAHARASHTRA_BOUNDS['lon_min'] <= lon <= MAHARASHTRA_BOUNDS['lon_max']):
        raise ValueError("Longitude outside Maharashtra bounds")

    return True


def validate_inputs(roof_area, budget, monthly_bill, tilt, roof_condition):
    if roof_area <= 0:
        raise ValueError("Invalid roof area")

    if budget not in ['low', 'medium', 'high']:
        raise ValueError("Invalid budget")

    if tilt not in TILT_DEGREES:
        raise ValueError("Invalid tilt")

    if roof_condition not in ['excellent', 'good', 'fair', 'poor']:
        raise ValueError("Invalid roof condition")

    return True


# ==============================================================================
# SECTION 3 — PANEL RECOMMENDATION
# ==============================================================================
def recommend_panel(roof_area, budget):
    if roof_area < 20:
        return 'Monocrystalline', "Space constraint"

    if budget in ('low', 'medium'):
        return 'Polycrystalline', "Cost efficient"

    return 'Monocrystalline', "High ROI"


# ==============================================================================
# SECTION 4 — SYSTEM SIZE
# ==============================================================================
def calculate_system_size(roof_area, panel_type, tilt='flat'):
    panel_area = PANEL_SPECS[panel_type]['area_m2']
    wattage = PANEL_SPECS[panel_type]['wattage']
    utilisation = ROOF_UTILISATION_FACTOR[tilt]

    usable_area = roof_area * utilisation
    num_panels = int(usable_area / panel_area)
    system_capacity_kw = (num_panels * wattage) / 1000

    return num_panels, system_capacity_kw, usable_area


# ==============================================================================
# SECTION 5 — NASA DATA
# ==============================================================================
def get_nasa_hourly_data(lat, lon, year=2023):
    url = 'https://power.larc.nasa.gov/api/temporal/hourly/point'

    params = {
        'parameters': 'ALLSKY_SFC_SW_DWN,T2M',
        'community': 'RE',
        'longitude': lon,
        'latitude': lat,
        'format': 'JSON',
        'start': str(year),
        'end': str(year)
    }

    response = requests.get(url, params=params)
    data = response.json()

    ghi = data['properties']['parameter']['ALLSKY_SFC_SW_DWN']
    temp = data['properties']['parameter']['T2M']

    df = pd.DataFrame({
        'GHI': list(ghi.values()),
        'temp': list(temp.values())
    })

    return df, sum(df['GHI']) / 1000


# ==============================================================================
# SECTION 6 — INTERPOLATION
# ==============================================================================
def interpolate_to_15min(df):
    idx = pd.date_range(start=0, periods=len(df)*4, freq='15min')

    ghi = CubicSpline(range(len(df)), df['GHI'])(np.linspace(0, len(df)-1, len(idx)))
    temp = CubicSpline(range(len(df)), df['temp'])(np.linspace(0, len(df)-1, len(idx)))

    return pd.DataFrame({'GHI': ghi, 'temp': temp}, index=idx)


# ==============================================================================
# SECTION 7 — FEATURES
# ==============================================================================
def build_features(df):
    df['hour'] = df.index.hour
    df['month'] = df.index.month

    df['MODULE_TEMPERATURE'] = (
        df['temp'] + ((NOCT_CELSIUS - 20)/800) * df['GHI']
    )

    df['temp_irr_interaction'] = df['MODULE_TEMPERATURE'] * df['GHI']

    return df.rename(columns={
        'temp': 'AMBIENT_TEMPERATURE',
        'GHI': 'IRRADIATION'
    })


# ==============================================================================
# SECTION 8 — ENERGY PREDICTION
# ==============================================================================
def predict_annual_energy(lat, lon, system_capacity_kw):
    df_nasa, annual_ghi = get_nasa_hourly_data(lat, lon)
    df_15 = interpolate_to_15min(df_nasa)
    df_feat = build_features(df_15)

    X = df_feat[['AMBIENT_TEMPERATURE','MODULE_TEMPERATURE',
                 'IRRADIATION','hour','month','temp_irr_interaction']]

    power = solar_best_model.predict(X)
    energy = power * 0.25 / 1000
    energy *= INDIA_SOILING_FACTOR
    energy *= (system_capacity_kw / INVERTER_CAPACITY_KW)

    annual_energy = float(np.sum(energy))

    return annual_energy, {}, annual_ghi


# ==============================================================================
# SECTION 9–12 (UNCHANGED LOGIC KEPT)
# ==============================================================================
# Keep your existing:
# - calculate_installation_cost
# - calculate_subsidy
# - calculate_roi
# - calculate_environmental_impact
# - assess_suitability


# ==============================================================================
# SECTION 13 — MAIN FUNCTION
# ==============================================================================
def solar_recommendation(lat, lon, roof_area, budget, monthly_bill,
                         tilt='low_slope', roof_condition='good'):

    validate_location(lat, lon)
    validate_inputs(roof_area, budget, monthly_bill, tilt, roof_condition)

    panel_type, _ = recommend_panel(roof_area, budget)

    num_panels, system_capacity_kw, _ = calculate_system_size(
        roof_area, panel_type, tilt
    )

    annual_energy, _, annual_ghi = predict_annual_energy(
        lat, lon, system_capacity_kw
    )

    return {
        "panel_type": panel_type,
        "num_panels": num_panels,
        "system_capacity_kw": system_capacity_kw,
        "annual_energy_kwh": annual_energy,
        "annual_ghi_kwh": annual_ghi
    }


# ==============================================================================
# OPTIONAL TEST RUN
# ==============================================================================
if __name__ == "__main__":
    result = solar_recommendation(
        lat=19.076,
        lon=72.877,
        roof_area=30,
        budget='medium',
        monthly_bill=3000
    )

    print(result)