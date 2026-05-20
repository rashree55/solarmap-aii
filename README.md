# ☀️ SolarMap AI — AI-Powered Rooftop Solar Analysis Platform

SolarMap AI is a full-stack intelligent rooftop solar recommendation platform that helps users analyze the feasibility of installing rooftop solar systems using real-world solar irradiance datasets, machine learning-based energy prediction, financial analysis, and environmental impact estimation.

The platform combines a modern React frontend, Flask-based ML backend, NASA POWER climate datasets, and Supabase authentication/database services to deliver end-to-end rooftop solar analysis for Maharashtra, India.

---

# 🚀 Features

## 🔐 Authentication & User Management
- Google OAuth authentication using Supabase Auth
- Persistent login sessions
- Protected dashboard routes
- User-specific solar analysis history storage

---

## 📍 Smart Location Detection
- Browser Geolocation API integration
- Automatic latitude & longitude detection
- Maharashtra boundary validation
- Manual coordinate support

---

## ☀️ AI-Based Solar Recommendation Engine
The platform dynamically:
- Validates rooftop feasibility
- Recommends optimal solar panel type
- Calculates system capacity
- Estimates rooftop utilization
- Predicts annual solar energy generation

using:
- Real NASA solar irradiance datasets
- Machine learning energy prediction models
- Solar engineering formulas
- MNRE rooftop solar guidelines

---

## 🤖 Machine Learning Solar Prediction
The backend uses a trained Scikit-learn regression model (`solar_model.pkl`) to predict:
- Solar power generation
- Annual energy production
- System efficiency scaling

### Input Features Used
- Ambient Temperature
- Module Temperature
- Solar Irradiation
- Hour
- Month
- Temperature-Irradiation Interaction

---

## 📊 Dynamic Solar Suitability Assessment
SolarMap AI evaluates:
- Roof area
- Roof condition
- Solar irradiance (GHI)
- ROI/payback period
- Bill coverage potential

and generates suitability ratings:
- HIGHLY SUITABLE
- SUITABLE
- MARGINALLY SUITABLE
- NOT RECOMMENDED

using a weighted multi-criteria decision model (MCDM).

---

## 💰 Financial Analysis Engine
The platform calculates:
- Installation cost
- PM Surya Ghar subsidy
- Net installation cost
- Annual maintenance
- Year-1 savings
- 25-year projected savings
- Payback period

using:
- MNRE benchmark pricing
- Government subsidy slabs
- Real degradation rates
- Indian electricity tariff assumptions

---

## 🌱 Environmental Impact Estimation
SolarMap AI estimates:
- CO₂ emissions avoided
- Lifetime clean energy generation
- Equivalent trees planted

using:
- India grid emission factor
- Panel degradation modeling
- 25-year lifecycle estimation

---

## 📄 Professional PDF Report Generation
The platform dynamically generates downloadable solar reports containing:
- Location information
- Performance summary
- Financial analysis
- Environmental impact
- Suitability assessment
- Recommendation summary

using:
- jsPDF
- Dynamic templating
- Structured section rendering

---

# 🏗️ System Architecture

```text
solarmap-aii/
│
├── frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Dashboard & analysis pages
│   │   ├── layouts/                 # App layouts
│   │   ├── lib/
│   │   │   ├── supabase.ts          # Supabase client
│   │   │   └── generatePDF.ts       # PDF generation engine
│   │   ├── hooks/
│   │   └── App.tsx
│   │
│   ├── public/
│   └── package.json
│
├── backend/                         # Flask ML Backend
│   ├── app.py                       # Flask API server
│   ├── solar_logic.py              # Core solar recommendation engine
│   ├── solar_model.pkl             # Trained ML model
│   └── requirements.txt
│
├── supabase/                        # Database + Authentication
│
└── README.md
```

---

# ⚙️ Complete Application Workflow

## Step 1 — User Authentication
Users log in securely using Google OAuth via Supabase Auth.

---

## Step 2 — User Input Collection

The frontend collects:
- Roof Area
- Monthly Electricity Bill
- Roof Tilt
- Roof Condition
- Latitude & Longitude

through the React dashboard UI.

---

## Step 3 — Frontend API Request

React sends a POST request to the Flask backend:

```json
{
  "lat": 19.076,
  "lon": 72.877,
  "roof_area": 30,
  "monthly_bill": 3000,
  "tilt": "low_slope",
  "roof_condition": "good"
}
```

---

## Step 4 — Backend Solar Processing Pipeline

The Flask backend performs:

### ✅ Location Validation
Checks if coordinates lie within Maharashtra boundaries.

### ✅ NASA POWER API Integration
Fetches:
- Hourly Solar Irradiance (GHI)
- Ambient Temperature

from NASA POWER datasets.

### ✅ 15-Minute Data Interpolation
Hourly NASA data is converted into 15-minute intervals for more granular ML prediction.

### ✅ Feature Engineering
Creates ML-ready features:
- Module temperature
- Temperature-irradiation interaction
- Hour/month cyclical patterns

### ✅ Machine Learning Prediction
The trained Scikit-learn model predicts:
- Power generation
- Annual energy production

scaled according to:
- System capacity
- Performance ratio
- Real-world losses

### ✅ Solar Panel Recommendation Logic
The backend dynamically selects:
- Monocrystalline panels
- Polycrystalline panels

based on:
- Roof area constraints
- Solar irradiance levels
- Efficiency requirements

### ✅ Financial Calculations
The backend computes:
- Subsidy eligibility
- Net installation cost
- Maintenance cost
- Payback period
- Long-term savings

### ✅ Environmental Analysis
Calculates:
- CO₂ reduction
- Trees equivalent
- Lifetime clean energy generation

### ✅ Suitability Assessment
Generates weighted feasibility score using:
- GHI thresholds
- Bill coverage
- Roof condition
- ROI/payback metrics

---

# 🔄 Backend Processing Pipeline

```text
User Inputs
      ↓
Flask API
      ↓
Location Validation
      ↓
NASA POWER API Data Fetching
      ↓
15-Minute Interpolation
      ↓
Feature Engineering
      ↓
ML Prediction Model
      ↓
Energy Estimation
      ↓
Financial Calculations
      ↓
Environmental Analysis
      ↓
Suitability Assessment
      ↓
JSON API Response
```

---

# 📡 API Response Example

```json
{
  "panel_type": "Monocrystalline",
  "num_panels": 72,
  "system_capacity_kw": 25.2,
  "annual_energy_kwh": 67736.17,
  "annual_ghi_kwh": 1794.91,
  "installation_cost": 1184000,
  "subsidy": 78000,
  "bill_coverage_pct": 100,
  "suitability": {
    "rating": "HIGHLY SUITABLE",
    "score": 8
  }
}
```

---

# 🧠 ML Model Workflow

```text
NASA Hourly Data
        ↓
Interpolation (15min)
        ↓
Feature Engineering
        ↓
Scikit-learn Regression Model
        ↓
Power Prediction
        ↓
Energy Conversion (kWh)
        ↓
System Scaling
        ↓
Annual Energy Estimation
```

---

# 📊 Frontend Dashboard Features

## Dashboard Pages
- Login Page
- New Analysis Page
- Analysis Output Page
- Analysis History Page
- User Profile Page

---

## UI Features
- Responsive dashboard layout
- Dynamic performance cards
- Real-time API rendering
- PDF report download
- Protected routing
- Dark/light theme support

---

# 🛠 Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- TypeScript
- React Router DOM
- shadcn/ui
- jsPDF

## Backend
- Python
- Flask
- Scikit-learn
- Pandas
- NumPy
- SciPy
- Joblib

## APIs & External Data
- NASA POWER API
- Browser Geolocation API

## Database & Authentication
- Supabase PostgreSQL
- Supabase Auth
- Google OAuth

## Deployment
- Vercel (Frontend)
- Flask API Server
- Supabase Cloud Backend

---

# 🚀 Quick Start

## 1️⃣ Clone Repository

```bash
git clone https://github.com/rashree55/solarmap-aii.git
cd solarmap-aii
```

---

## 2️⃣ Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 3️⃣ Backend Setup

```bash
pip install -r requirements.txt
python app.py
```

Backend runs on:

```text
http://127.0.0.1:5000
```

---

# 🔐 Environment Variables

## Frontend `.env`

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Backend `.env`

```env
FLASK_ENV=development
```

---

# 📄 PDF Report Engine

The PDF generator dynamically renders:
- Performance metrics
- Financial breakdown
- Environmental statistics
- Suitability analysis
- Recommendations

using:
- jsPDF
- Structured layout rendering
- Dynamic typography formatting

---


# 🌍 Research & Standards Used

## NASA POWER API
Used for:
- Solar irradiance data
- Hourly climate data

## MNRE Guidelines
Used for:
- Solar subsidy calculation
- Installation benchmark costs

## NREL Standards
Used for:
- Performance ratios
- Solar feasibility thresholds
- Roof suitability constraints

---

# 👨‍💻 Author

Rajeshree Chaudhari

GitHub:  
https://github.com/rashree55

---

# 🌐 Live Project

Frontend Deployment:  
https://solarmap-aii.vercel.app

Vercel Project:  
https://vercel.com/rashree55s-projects/solarmap-aii

---

# 📌 Repository Description

```text
AI-powered rooftop solar analysis platform using React, Flask, ML prediction models, NASA POWER API, and Supabase for intelligent solar feasibility, financial, and environmental analysis.
```
