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
    'Thin-film':       {'wattage': 250, 'efficiency': 0.10, 'area_m2': 2.50}
}

DEGRADATION_RATE = {
    'Monocrystalline': 0.005,
    'Polycrystalline': 0.006,
    'Thin-film':       0.008
}

NOCT_CELSIUS        = 45
NOCT_AMBIENT_STD    = 20
NOCT_IRRADIANCE_STD = 800

INVERTER_CAPACITY_KW = 1.362
INDIA_SOILING_FACTOR = 0.96

ROOF_UTILISATION_FACTOR = {
    'flat':         0.75,
    'low_slope':    0.80,
    'medium_slope': 0.85,
    'steep':        0.90
}

TILT_DEGREES = {
    'flat':         0,
    'low_slope':    15,
    'medium_slope': 30,
    'steep':        55
}

MNRE_COST_UPTO_2KW  = 50000
MNRE_COST_ABOVE_2KW = 45000

SUBSIDY_RATE_UPTO_2KW   = 0.60
SUBSIDY_RATE_2KW_TO_3KW = 0.40
SUBSIDY_CAP_ABOVE_3KW   = 78000

ELECTRICITY_RATE_PER_KWH         = 7.0
MAINTENANCE_COST_PER_KW_PER_YEAR = 1500
PANEL_LIFETIME_YEARS              = 25

INDIA_GRID_EMISSION_FACTOR = 0.716
TREE_CO2_ABSORPTION_KG     = 21.77

GHI_THRESHOLDS      = {'excellent': 1900, 'good': 1800, 'adequate': 1724}
PAYBACK_THRESHOLDS  = {'excellent': 6, 'good': 8, 'marginal': 10}

NREL_MIN_ROOF_AREA_M2 = 10
NREL_MAX_TILT_DEGREES = 60

SUITABILITY_BANDS = {
    'highly_suitable':     (8, 9),
    'suitable':            (6, 7),
    'marginally_suitable': (3, 5),
    'not_recommended':     (0, 2)
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


# budget parameter removed — panel type is now decided purely from
# roof area and site conditions (more technically sound)
def validate_inputs(roof_area, monthly_bill, tilt, roof_condition):
    if roof_area <= 0:
        raise ValueError("Invalid roof area")

    if monthly_bill <= 0:
        raise ValueError("Monthly bill must be greater than 0")

    if tilt not in TILT_DEGREES:
        raise ValueError("Invalid tilt")

    if roof_condition not in ['excellent', 'good', 'fair', 'poor']:
        raise ValueError("Invalid roof condition")

    return True


# ==============================================================================
# SECTION 3 — PANEL RECOMMENDATION
# Panel type is now determined purely by roof area.
# Source: MNRE Rooftop Solar Programme Phase II Guidelines
# ==============================================================================
def recommend_panel(roof_area):
    """
    Recommends panel type based on roof area only.

    Budget removed as an input — the user typically does not know their
    solar budget upfront. The financial output (net cost, payback period)
    gives them the information to decide affordability after the fact.

    Decision logic:
        roof_area < 20 m²  →  Monocrystalline
            Space is the binding constraint. Mono gives the most kW per m²
            (20% efficiency vs 15% poly). On a small roof this matters more
            than cost.
            Source: MNRE Rooftop Solar Programme Phase II Guidelines.

        roof_area >= 20 m²  →  Polycrystalline
            When space is not a constraint, poly gives better cost-efficiency.
            15% efficiency is adequate when roof area is sufficient.
            Most widely installed residential panel in India.
            Source: MNRE Rooftop Solar Deployment Data 2023.

    Parameters:
        roof_area : float — available roof area in m²

    Returns:
        panel_type : str
        reason     : str
    """
    if roof_area < 20:
        panel_type = 'Monocrystalline'
        reason = (
            f"Roof is space-constrained ({roof_area}m² < 20m²). "
            f"Monocrystalline delivers 20% efficiency — maximum output per m². "
            f"Source: MNRE Rooftop Solar Programme Phase II Guidelines."
        )
    else:
        panel_type = 'Polycrystalline'
        reason = (
            f"Roof area ({roof_area}m²) is sufficient. Polycrystalline gives "
            f"optimal cost-efficiency balance (15% efficiency). Most widely "
            f"installed residential panel in India. "
            f"Source: MNRE Rooftop Solar Deployment Data 2023."
        )

    return panel_type, reason


# ==============================================================================
# SECTION 4 — SYSTEM SIZE
# ==============================================================================
def calculate_system_size(roof_area, panel_type, tilt='flat'):
    panel_area  = PANEL_SPECS[panel_type]['area_m2']
    wattage     = PANEL_SPECS[panel_type]['wattage']
    utilisation = ROOF_UTILISATION_FACTOR[tilt]

    usable_area        = roof_area * utilisation
    num_panels         = int(usable_area / panel_area)
    system_capacity_kw = (num_panels * wattage) / 1000

    return num_panels, system_capacity_kw, usable_area


# ==============================================================================
# SECTION 5 — NASA DATA
# ==============================================================================
def get_nasa_hourly_data(lat, lon, year=2023):
    url    = 'https://power.larc.nasa.gov/api/temporal/hourly/point'
    params = {
        'parameters': 'ALLSKY_SFC_SW_DWN,T2M',
        'community':  'RE',
        'longitude':  lon,
        'latitude':   lat,
        'format':     'JSON',
        'start':      str(year),
        'end':        str(year)
    }

    response = requests.get(url, params=params)
    data     = response.json()

    ghi  = data['properties']['parameter']['ALLSKY_SFC_SW_DWN']
    temp = data['properties']['parameter']['T2M']

    df = pd.DataFrame({
        'GHI':  list(ghi.values()),
        'temp': list(temp.values())
    })

    return df, sum(df['GHI']) / 1000


# ==============================================================================
# SECTION 6 — INTERPOLATION
# ==============================================================================
def convert_to_15min(df):
    df = df.copy()

    df.index = pd.date_range(
        start='2023-01-01 00:00:00',
        periods=len(df),
        freq='H'
    )

    df_15 = df.resample('15min').ffill()
    return df_15


# ==============================================================================
# SECTION 7 — FEATURES
# ==============================================================================
def build_features(df):
    df['hour']  = df.index.hour
    df['month'] = df.index.month

    df['MODULE_TEMPERATURE'] = (
        df['temp'] + ((NOCT_CELSIUS - 20) / 800) * df['GHI']
    )

    df['temp_irr_interaction'] = df['MODULE_TEMPERATURE'] * df['GHI']

    return df.rename(columns={
        'temp': 'AMBIENT_TEMPERATURE',
        'GHI':  'IRRADIATION'
    })


# ==============================================================================
# SECTION 8 — ENERGY PREDICTION
# ==============================================================================
def predict_annual_energy(lat, lon, system_capacity_kw):
    df_nasa, annual_ghi = get_nasa_hourly_data(lat, lon)

    df_15   = convert_to_15min(df_nasa)
    df_feat = build_features(df_15)

    X = df_feat[['AMBIENT_TEMPERATURE', 'MODULE_TEMPERATURE',
                 'IRRADIATION', 'hour', 'month', 'temp_irr_interaction']]

    power = solar_best_model.predict(X)

    # Convert W → kWh per 15-min interval
    energy = power * 0.25 / 1000

    # Real-world losses (research-backed typical values)
    PERFORMANCE_RATIO = 0.70   # NREL typical range: 0.7–0.8
    energy *= PERFORMANCE_RATIO

    # Scale based on training system size
    TRAINED_SYSTEM_KW = 1.362
    scale_factor = system_capacity_kw / TRAINED_SYSTEM_KW
    energy *= scale_factor

    annual_energy = float(np.sum(energy))

    return annual_energy, {}, annual_ghi


# ==============================================================================
# SECTION 9 — INSTALLATION COST
# ==============================================================================
def calculate_installation_cost(system_capacity_kw):
    """
    MNRE benchmark rates:
      Up to 2 kW  : Rs 50,000/kW
      Above 2 kW  : Rs 45,000/kW
    """
    if system_capacity_kw <= 2:
        cost = system_capacity_kw * MNRE_COST_UPTO_2KW
    else:
        cost = (2 * MNRE_COST_UPTO_2KW) + ((system_capacity_kw - 2) * MNRE_COST_ABOVE_2KW)
    return round(cost, 2)


# ==============================================================================
# SECTION 10 — SUBSIDY
# ==============================================================================
def calculate_subsidy(system_capacity_kw):
    """
    PM Surya Ghar Yojana subsidy structure:
      Up to 2 kW       : 60% of benchmark cost
      2 kW to 3 kW     : 40% of benchmark cost for additional capacity
      Above 3 kW       : Fixed cap of Rs 78,000
    """
    if system_capacity_kw <= 2:
        subsidy = system_capacity_kw * MNRE_COST_UPTO_2KW * SUBSIDY_RATE_UPTO_2KW
    elif system_capacity_kw <= 3:
        cost_2kw   = 2 * MNRE_COST_UPTO_2KW
        cost_extra = (system_capacity_kw - 2) * MNRE_COST_ABOVE_2KW
        subsidy    = (cost_2kw * SUBSIDY_RATE_UPTO_2KW) + (cost_extra * SUBSIDY_RATE_2KW_TO_3KW)
    else:
        subsidy = SUBSIDY_CAP_ABOVE_3KW
    return round(min(subsidy, SUBSIDY_CAP_ABOVE_3KW), 2)


# ==============================================================================
# SECTION 11 — ROI
# ==============================================================================
def calculate_roi(annual_energy_kwh, installation_cost, subsidy,
                  system_capacity_kw, panel_type):
    """
    Realistic financial returns including maintenance and degradation.

    Degradation applied year-by-year:
      Year Y energy = annual_energy x (1 - degradation_rate)^Y
    """
    net_cost           = installation_cost - subsidy
    annual_maintenance = system_capacity_kw * MAINTENANCE_COST_PER_KW_PER_YEAR
    degradation_rate   = DEGRADATION_RATE[panel_type]

    year1_gross_savings = annual_energy_kwh * ELECTRICITY_RATE_PER_KWH
    year1_net_savings   = year1_gross_savings - annual_maintenance

    payback_years = (
        round(net_cost / year1_net_savings, 2)
        if year1_net_savings > 0 else float('inf')
    )

    cumulative_savings = 0
    for year in range(1, PANEL_LIFETIME_YEARS + 1):
        year_energy = annual_energy_kwh * ((1 - degradation_rate) ** year)
        year_net    = (year_energy * ELECTRICITY_RATE_PER_KWH) - annual_maintenance
        cumulative_savings += year_net

    net_savings_25yr = cumulative_savings - net_cost

    return {
        'net_cost':            round(net_cost, 2),
        'annual_maintenance':  round(annual_maintenance, 2),
        'year1_gross_savings': round(year1_gross_savings, 2),
        'year1_net_savings':   round(year1_net_savings, 2),
        'payback_years':       payback_years,
        'savings_25yr':        round(net_savings_25yr, 2),
        'degradation_rate':    degradation_rate
    }


# ==============================================================================
# SECTION 12 — ENVIRONMENTAL IMPACT
# ==============================================================================
def calculate_environmental_impact(annual_energy_kwh, panel_type):
    """CO2 avoided over 25-year panel lifetime with year-by-year degradation."""
    degradation_rate  = DEGRADATION_RATE[panel_type]
    total_energy_25yr = sum(
        annual_energy_kwh * ((1 - degradation_rate) ** year)
        for year in range(1, PANEL_LIFETIME_YEARS + 1)
    )
    co2_avoided_kg     = total_energy_25yr * INDIA_GRID_EMISSION_FACTOR
    co2_avoided_tonnes = co2_avoided_kg / 1000
    trees_equivalent   = co2_avoided_kg / TREE_CO2_ABSORPTION_KG

    return {
        'total_energy_25yr_kwh': round(total_energy_25yr, 2),
        'co2_avoided_tonnes':    round(co2_avoided_tonnes, 2),
        'trees_equivalent':      round(trees_equivalent, 0)
    }


# ==============================================================================
# SECTION 13 — SUITABILITY ASSESSMENT
# ==============================================================================
def assess_suitability(system_capacity_kw, payback_years, bill_coverage_pct,
                       annual_ghi_kwh, roof_area, tilt, roof_condition):
    """
    Hard Disqualifiers (NREL 2016 — Gagnon et al.):
      roof_area < 10m²   → cannot host a viable system
      tilt > 60 degrees  → engineering limit for panel installation
    """
    disqualifiers = []
    factor_scores = {}

    # Hard Disqualifier 1 — Minimum roof area
    if roof_area < NREL_MIN_ROOF_AREA_M2:
        disqualifiers.append(
            f'Roof area {roof_area}m2 is below NREL minimum of '
            f'{NREL_MIN_ROOF_AREA_M2}m2. Source: Gagnon et al. (2016) NREL/TP-6A20-65298.'
        )

    # Hard Disqualifier 2 — Maximum tilt
    if TILT_DEGREES[tilt] > NREL_MAX_TILT_DEGREES:
        disqualifiers.append(
            f'Roof tilt ({TILT_DEGREES[tilt]} degrees) exceeds NREL maximum of '
            f'{NREL_MAX_TILT_DEGREES} degrees. Source: Gagnon et al. (2016) NREL/TP-6A20-65298.'
        )

    if disqualifiers:
        return {
            'rating':        'UNSUITABLE',
            'score':         0,
            'max_score':     9,
            'disqualifiers': disqualifiers,
            'factor_scores': {},
            'advice':        'Property does not meet minimum criteria. See disqualifying factors.'
        }

    # Factor 1 — GHI Solar Resource (max 3 pts)
    if annual_ghi_kwh >= GHI_THRESHOLDS['excellent']:
        factor_scores['Solar Resource (GHI)'] = (3, f'{annual_ghi_kwh:.0f} kWh/m2/yr — Excellent (Vidarbha range).')
    elif annual_ghi_kwh >= GHI_THRESHOLDS['good']:
        factor_scores['Solar Resource (GHI)'] = (2, f'{annual_ghi_kwh:.0f} kWh/m2/yr — Good (Mumbai/Pune range).')
    elif annual_ghi_kwh >= GHI_THRESHOLDS['adequate']:
        factor_scores['Solar Resource (GHI)'] = (1, f'{annual_ghi_kwh:.0f} kWh/m2/yr — Adequate.')
    else:
        factor_scores['Solar Resource (GHI)'] = (0, f'{annual_ghi_kwh:.0f} kWh/m2/yr — Low for Maharashtra.')

    # Factor 2 — Payback Period (max 3 pts)
    if payback_years <= PAYBACK_THRESHOLDS['excellent']:
        factor_scores['Payback Period'] = (3, f'{payback_years} yrs — Excellent (typical India range 4-7 yrs).')
    elif payback_years <= PAYBACK_THRESHOLDS['good']:
        factor_scores['Payback Period'] = (2, f'{payback_years} yrs — Good.')
    elif payback_years <= PAYBACK_THRESHOLDS['marginal']:
        factor_scores['Payback Period'] = (1, f'{payback_years} yrs — Marginal but within 25-yr lifetime.')
    else:
        factor_scores['Payback Period'] = (0, f'{payback_years} yrs — Poor financial viability.')

    # Factor 3 — Bill Coverage (max 2 pts)
    if bill_coverage_pct >= 80:
        factor_scores['Bill Coverage'] = (2, f'{bill_coverage_pct:.1f}% — Solar substantially eliminates electricity bill.')
    elif bill_coverage_pct >= 50:
        factor_scores['Bill Coverage'] = (1, f'{bill_coverage_pct:.1f}% — Solar covers majority of bill.')
    else:
        factor_scores['Bill Coverage'] = (0, f'{bill_coverage_pct:.1f}% — Marginal bill impact.')

    # Factor 4 — Roof Condition (max 1 pt)
    if roof_condition in ('excellent', 'good', 'fair'):
        factor_scores['Roof Condition'] = (1, f'{roof_condition.capitalize()} — Suitable for installation.')
    else:
        factor_scores['Roof Condition'] = (0, 'Poor — Roof replacement required before installation.')

    total_score = sum(v[0] for v in factor_scores.values())
    max_score   = 9

    if total_score >= SUITABILITY_BANDS['highly_suitable'][0]:
        rating = 'HIGHLY SUITABLE'
    elif total_score >= SUITABILITY_BANDS['suitable'][0]:
        rating = 'SUITABLE'
    elif total_score >= SUITABILITY_BANDS['marginally_suitable'][0]:
        rating = 'MARGINALLY SUITABLE'
    else:
        rating = 'NOT RECOMMENDED'

    weak_factors = [f for f, (s, _) in factor_scores.items() if s == 0]
    good_factors = [f for f, (s, _) in factor_scores.items() if s >= 2]

    advice = {
        'HIGHLY SUITABLE':    'Excellent candidate for solar installation.',
        'SUITABLE':           'Good candidate for solar installation.',
        'MARGINALLY SUITABLE': 'Solar is possible but with notable limitations.',
        'NOT RECOMMENDED':    'Solar installation not recommended at this time.'
    }[rating]

    if good_factors:
        advice += f' Strong areas: {", ".join(good_factors)}.'
    if weak_factors:
        advice += f' Weak areas: {", ".join(weak_factors)}.'

    return {
        'rating':        rating,
        'score':         total_score,
        'max_score':     max_score,
        'disqualifiers': [],
        'factor_scores': factor_scores,
        'advice':        advice
    }


# ==============================================================================
# SECTION 14 — MAIN FUNCTION
# ==============================================================================
def solar_recommendation(lat, lon, roof_area, monthly_bill,
                         tilt='low_slope', roof_condition='good'):
    """
    Complete solar installation recommendation for Maharashtra, India.

    Parameters:
        lat            : float — latitude  (Maharashtra: 15.6 to 22.1 N)
        lon            : float — longitude (Maharashtra: 72.6 to 80.9 E)
        roof_area      : float — available roof area in m2
        monthly_bill   : float — current monthly electricity bill in Rs
        tilt           : str   — 'flat', 'low_slope', 'medium_slope', 'steep'
        roof_condition : str   — 'excellent', 'good', 'fair', or 'poor'

    Returns:
        dict — complete recommendation results, or None if inputs invalid

    Note on budget removal:
        Budget has been removed as an input. The panel type is now determined
        purely by roof area — the technically correct approach since budget
        should not drive a technology choice. The financial output (net cost
        after subsidy, payback period, 25-year savings) gives the user all
        the information needed to assess affordability after seeing the numbers.
    """
    print('=' * 65)
    print('          SOLARMAP AI — RECOMMENDATION REPORT')
    print('              Scope: Maharashtra, India')
    print('=' * 65)

    try:
        validate_location(lat, lon)
        validate_inputs(roof_area, monthly_bill, tilt, roof_condition)
    except ValueError as e:
        print(f'\n  Input Error: {e}')
        return None

    # Panel recommendation — based on roof area only
    panel_type, reason = recommend_panel(roof_area)

    print(f'\n  Recommended Panel  : {panel_type}')
    print(f'    Wattage          : {PANEL_SPECS[panel_type]["wattage"]}W per panel')
    print(f'    Efficiency       : {int(PANEL_SPECS[panel_type]["efficiency"]*100)}%')
    print(f'    Panel Area       : {PANEL_SPECS[panel_type]["area_m2"]}m2 per panel')
    print(f'    Reason           : {reason}')

    # System sizing
    num_panels, system_capacity_kw, usable_area = calculate_system_size(
        roof_area, panel_type, tilt
    )
    panel_area = PANEL_SPECS[panel_type]['area_m2']

    print(f'\n  System Details:')
    print(f'    Number of Panels   : {num_panels}')
    print(f'    System Capacity    : {system_capacity_kw:.2f} kW')
    print(f'    Total Roof Area    : {roof_area} m2')
    print(f'    Utilisation Factor : {ROOF_UTILISATION_FACTOR[tilt]*100:.0f}% (spacing + walkway setback)')
    print(f'    Usable Area        : {usable_area:.1f} m2')
    print(f'    Area Used by Panels: {num_panels * panel_area:.1f} m2')

    if num_panels == 0:
        print('\n  Roof too small — cannot fit even one panel.')
        return None

    # Energy prediction
    print(f'\n  Fetching NASA POWER hourly data for ({lat}N, {lon}E)...')
    annual_energy, monthly_breakdown, annual_ghi_kwh = predict_annual_energy(
        lat, lon, system_capacity_kw
    )

    print(f'\n    Site Solar Resource : {annual_ghi_kwh:.0f} kWh/m2/year (NASA POWER)')
    print(f'\n    Monthly Energy Breakdown (kWh):')
    for month, energy in monthly_breakdown.items():
        bar = 'X' * int(energy / 30)
        print(f'      {month} : {energy:7.1f} kWh  {bar}')
    print(f'\n    Annual Energy   : {annual_energy:,.2f} kWh')
    print(f'    Monthly Average : {round(annual_energy/12, 2):,.2f} kWh')

    # Costs and subsidy
    installation_cost = calculate_installation_cost(system_capacity_kw)
    subsidy           = calculate_subsidy(system_capacity_kw)

    # ROI
    roi = calculate_roi(annual_energy, installation_cost, subsidy,
                        system_capacity_kw, panel_type)

    print(f'\n  Financial Summary:')
    print(f'    Installation Cost      : Rs {installation_cost:>10,.0f}')
    print(f'    PM Surya Ghar Subsidy  : Rs {subsidy:>10,.0f}')
    print(f'    Net Cost After Subsidy : Rs {roi["net_cost"]:>10,.0f}')
    print(f'    Annual Maintenance     : Rs {roi["annual_maintenance"]:>10,.0f}/year')
    print(f'    Year 1 Gross Savings   : Rs {roi["year1_gross_savings"]:>10,.0f}')
    print(f'    Year 1 Net Savings     : Rs {roi["year1_net_savings"]:>10,.0f}')
    print(f'    Payback Period         : {roi["payback_years"]:>10} years')
    print(f'    Panel Degradation      : {roi["degradation_rate"]*100:.1f}%/year (Jordan & Kurtz 2013, NREL)')
    print(f'    25-Year Net Savings    : Rs {roi["savings_25yr"]:>10,.0f}')

    # Bill coverage
    annual_bill            = monthly_bill * 12
    annual_consumption_kwh = annual_bill / ELECTRICITY_RATE_PER_KWH
    bill_coverage_pct      = min((annual_energy / annual_consumption_kwh) * 100, 100)

    print(f'\n  Bill Coverage:')
    print(f'    Current Annual Bill : Rs {annual_bill:>10,.0f}')
    print(f'    Solar Covers        : {bill_coverage_pct:.1f}%')

    # Environmental impact
    env = calculate_environmental_impact(annual_energy, panel_type)
    print(f'\n  Environmental Impact (25-year lifetime):')
    print(f'    Total Energy Generated : {env["total_energy_25yr_kwh"]:>10,.0f} kWh')
    print(f'    CO2 Avoided            : {env["co2_avoided_tonnes"]:>10.1f} tonnes (CEA India 2023)')
    print(f'    Equivalent Trees       : {env["trees_equivalent"]:>10,.0f} trees (US Forest Service)')

    # Suitability assessment
    suitability = assess_suitability(
        system_capacity_kw=system_capacity_kw,
        payback_years=roi['payback_years'],
        bill_coverage_pct=bill_coverage_pct,
        annual_ghi_kwh=annual_ghi_kwh,
        roof_area=roof_area,
        tilt=tilt,
        roof_condition=roof_condition
    )

    print(f'\n  Suitability Assessment ({suitability["score"]}/{suitability["max_score"]} points)')
    print(f'    Methodology : MCDM Weighted Sum Model')
    print(f'    Rating      : {suitability["rating"]}')
    print(f'    Advice      : {suitability["advice"]}')

    if suitability['disqualifiers']:
        print(f'\n    Disqualifying Factors:')
        for d in suitability['disqualifiers']:
            print(f'      - {d}')
    else:
        print(f'\n    Factor Breakdown:')
        print(f'    {"Factor":<25} {"Pts":>4}   Detail')
        print(f'    {"-"*60}')
        for factor, (score, desc) in suitability['factor_scores'].items():
            print(f'    {factor:<25} {score:>4}   {desc[:55]}')

    print('\n' + '=' * 65)

    return {
        'panel_type':         panel_type,
        'num_panels':         num_panels,
        'system_capacity_kw': system_capacity_kw,
        'annual_energy_kwh':  annual_energy,
        'monthly_breakdown':  monthly_breakdown,
        'annual_ghi_kwh':     annual_ghi_kwh,
        'installation_cost':  installation_cost,
        'subsidy':            subsidy,
        'roi':                roi,
        'bill_coverage_pct':  bill_coverage_pct,
        'environmental':      env,
        'suitability':        suitability
    }


# ==============================================================================
# OPTIONAL TEST RUN
# ==============================================================================
if __name__ == "__main__":

    print("TEST 1 — Mumbai, 30m2 roof")
    print()
    result = solar_recommendation(
        lat=19.076,
        lon=72.877,
        roof_area=30,
        monthly_bill=3000,
        tilt='low_slope',
        roof_condition='good'
    )

    print()
    print("TEST 2 — Pune, 25m2 roof")
    print()
    result2 = solar_recommendation(
        lat=18.520,
        lon=73.856,
        roof_area=25,
        monthly_bill=2500,
        tilt='low_slope',
        roof_condition='excellent'
    )

    print()
    print("TEST 3 — Kolhapur, 20m2 roof")
    print()
    result3 = solar_recommendation(
        lat=16.705,
        lon=74.243,
        roof_area=20,
        monthly_bill=1500,
        tilt='medium_slope',
        roof_condition='fair'
    )

    print()
    print("TEST 4 — Delhi coordinates (should be rejected)")
    print()
    result4 = solar_recommendation(
        lat=28.613,
        lon=77.209,
        roof_area=30,
        monthly_bill=3000
    )