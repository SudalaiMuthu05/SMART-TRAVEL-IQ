<div align="center">

# SmartRoute AI
### *Predictive Travel Intelligence for Smarter Intercity Mobility*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Alembic](https://img.shields.io/badge/Alembic-Migrations-6BA3BE?style=for-the-badge)](https://alembic.sqlalchemy.org/)

[![Hackathon](https://img.shields.io/badge/Hackathon-Submission-FF6B6B?style=for-the-badge)](.)
[![Team](https://img.shields.io/badge/Team-CodeRed-DC143C?style=for-the-badge)](.)
[![Status](https://img.shields.io/badge/Status-Active-00C851?style=for-the-badge)](.)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

> **One platform. All routes. Zero guesswork.**
> SmartRoute AI unifies fragmented travel data into a single intelligent platform — predicting delays, crowd surges, risks, and the best routes before you even pack your bags.

<br/>

[Installation](#️-installation--setup) • [Project Structure](#-project-structure) • [API Endpoints](#-api-endpoints) • [Team](#-team)

</div>

---

## Problem Statement

Planning intercity travel today is a **fragmented, frustrating, and reactive experience**:

- **Multiple Platforms** — Users toggle between IRCTC, RedBus, MakeMyTrip, weather apps, and Google Maps just to plan one trip.
- **No Predictive Intelligence** — No way to know *before* booking if a train will be delayed, a bus overcrowded, or a route seasonally risky.
- **Data Blindness** — Travelers lack aggregated analytics like crowd density trends, demand surges, or historical delay patterns.
- **Ignoring Context** — Weather events, public holidays, and local festivals that drastically affect travel quality are never surfaced proactively.

---

## Proposed Solution

**SmartRoute AI** is an AI-powered intercity travel intelligence platform that:

✅ Aggregates bus and train options across operators in one unified interface  
✅ Predicts delay probabilities using historical patterns, weather, and holiday data  
✅ Estimates crowd density and flags demand surges in real-time  
✅ Scores each travel option with a composite **Travel Risk Score**  
✅ Provides an AI Travel Copilot for conversational planning  
✅ Recommends hotels and restaurants at the destination  
✅ Advises on climate risks using live weather intelligence  

---

## Key Features

| Feature | Description |
|---|---|
| **Travel Aggregation** | Compare buses and trains side-by-side across operators |
| **AI Delay Prediction** | ML model predicts delay probability per route |
| **Crowd Density Estimation** | Real-time and predictive crowd level indicators |
| **Demand Surge Detection** | Detect booking surges and fare hikes proactively |
| **Travel Risk Score** | Composite score: delay + crowd + weather + road conditions |
| **Weather Advisory** | Live weather integration via `weather_service.py` |
| **AI Travel Copilot** | Conversational assistant (`TravelCopilot.jsx` + `copilot.py`) |
| **Live Alerts** | Real-time travel notifications via `LiveAlerts.jsx` |
| **Auth System** | Full login/register flow (`LoginPage.jsx`, `RegisterPage.jsx`) |
| **Dashboard** | Analytics dashboard via `dashboard.py` endpoint |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│            React Frontend  (Vite + Tailwind)              │
│                                                           │
│   Pages:  LandingPage · LoginPage · RegisterPage          │
│   Components: Navbar · LiveAlerts · WeatherCard           │
│               TravelCopilot                               │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API
┌────────────────────────▼─────────────────────────────────┐
│              FastAPI Backend  (app/main.py)               │
│                                                           │
│   API Layer  (app/api/v1/)                                │
│   ├── router.py           ← v1 router                     │
│   └── endpoints/                                          │
│       ├── dashboard.py    ← analytics                     │
│       └── copilot.py      ← AI copilot                    │
│                                                           │
│   Services  (app/services/)                               │
│   ├── weather_service.py                                  │
│   ├── route_service.py                                    │
│   └── risk_service.py                                     │
│                                                           │
│   Core · Models · Schemas · Utils · DB                    │
└──────────────┬──────────────────┬────────────────────────┘
               │                  │
    ┌──────────▼──────┐  ┌────────▼────────────┐
    │   PostgreSQL     │  │   External APIs      │
    │  (via Alembic    │  │  Weather · Maps       │
    │   migrations)    │  │  Holiday · Transport  │
    └──────────────────┘  └─────────────────────┘
```

### Architecture Diagram

> *Place your architecture image at `architecture/system-architecture.png` and uncomment below:*

```markdown
![System Architecture](architecture/system-architecture.png)
```

---

## Technology Stack

### Frontend — `travelaggregator/`
| Technology | Config File | Purpose |
|---|---|---|
| **React.js** | `src/` | Component-based SPA |
| **Vite** | `vite.config.js` | Fast dev server & bundler |
| **Tailwind CSS** | `tailwind.config.js` | Utility-first styling |
| **PostCSS** | `postcss.config.js` | CSS transformations |

### Backend — `app/`
| Technology | File | Purpose |
|---|---|---|
| **FastAPI** | `app/main.py` | Async Python REST API |
| **SQLAlchemy** | `app/models/`, `app/db/` | ORM & DB session management |
| **Alembic** | `alembic/`, `alembic.ini` | Database migrations |
| **Pydantic** | `app/schemas/schemas.py` | Request/response validation |

### Services
| Service | File | Responsibility |
|---|---|---|
| Weather | `weather_service.py` | Fetch & process weather data |
| Routes | `route_service.py` | Route aggregation & comparison |
| Risk | `risk_service.py` | Travel Risk Score computation |

---

## Installation & Setup

### Prerequisites

- Node.js `v18+` and npm
- Python `3.10+`
- PostgreSQL `14+`

---

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/CodeRed-Team/SmartRoute-AI.git
cd SmartRoute-AI

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env — fill in:
# DATABASE_URL=postgresql://user:password@localhost:5432/smartroute
# WEATHER_API_KEY=your_openweathermap_key
# MAPS_API_KEY=your_maps_key
# SECRET_KEY=your_jwt_secret

# 5. Initialize the database
psql -U postgres -f db_setup.sql
alembic upgrade head

# 6. Start the backend
bash run.sh
# or directly:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

> API: `http://localhost:8000` | 📖 Swagger UI: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
cd travelaggregator

npm install

cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8000
# VITE_MAPS_API_KEY=your_key

npm run dev
```

> Frontend: `http://localhost:5173`

---

### Utility Scripts

| Script | Purpose |
|---|---|
| `run.sh` | Start the backend server |
| `setup.sh` | Full one-shot environment setup |
| `clear_cache.py` | Clear application-level cache |
| `check_hotel_images.py` | Validate hotel image loading |
| `test_weather.py` | Test weather API connectivity |
| `db_setup.sql` | Initialize PostgreSQL schema |

---

### Running Tests

```bash
python -m pytest tests/test_services.py -v
```

---

## Project Structure

```
stb/                                      ← Project root
│
├── README.md
├── requirements.txt
├── alembic.ini                        ← Alembic config
├── db_setup.sql                       ← DB initialization
├── .env                               ← Secrets (git-ignored)
├── .env.example                       ← Template for .env
│
├── run.sh                             ← Start backend
├── setup.sh                           ← Full setup script
├── clear_cache.py
├── check_hotel_images.py
├── test_weather.py
│
├── backend_error.log
├── backend_full.log
├── weather_debug.log
├── dashboard_resp.json                ← Sample API response
├── pip_out.txt
│
├── alembic/                           ← DB migration files
│   ├── versions/
│   └── env.py
│
├── app/                               ← FastAPI application
│   ├── main.py                        ← Entry point
│   ├── __init__.py
│   │
│   ├── api/v1/
│   │   ├── router.py                     ← API v1 router
│   │   └── endpoints/
│   │       ├── dashboard.py              ← Dashboard analytics
│   │       └── copilot.py                ← AI copilot chat
│   │
│   ├── core/                          ← Config & security
│   ├── db/                            ← DB session & connection
│   ├── models/                        ← SQLAlchemy ORM models
│   ├── schemas/
│   │   └── schemas.py                    ← Pydantic schemas
│   ├── services/
│   │   ├── weather_service.py
│   │   ├── route_service.py
│   │   └── risk_service.py
│   └── utils/
│
├── tests/
│   ├── __init__.py
│   └── test_services.py
│
├── venv/                              ← Python virtual environment
│
└── travelaggregator/                  ← React frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    ├── dist/                          ← Production build
    └── src/
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx
        │   └── RegisterPage.jsx
        └── components/
            ├── App.jsx
            ├── Navbar.jsx
            ├── LiveAlerts.jsx
            ├── WeatherCard.jsx
            └── TravelCopilot.jsx
```

---

## API Endpoints

| Method | Endpoint | Handler | Description |
|---|---|---|---|
| `GET` | `/api/v1/dashboard` | `dashboard.py` | Analytics dashboard data |
| `POST` | `/api/v1/copilot` | `copilot.py` | AI travel copilot query |
| `GET` | `/api/v1/routes` | `route_service.py` | Search & compare routes |
| `GET` | `/api/v1/weather` | `weather_service.py` | Weather for a location |
| `GET` | `/api/v1/risk` | `risk_service.py` | Travel Risk Score |

> Full docs at `http://localhost:8000/docs` (Swagger UI)

---

## Demo Screenshots

> *Drop screenshots into `docs/screenshots/` and replace the paths below*

### Landing Page
```markdown
![Landing Page](docs/screenshots/landing-page.png)
```

### Search Results + Risk Scores
```markdown
![Search Results](docs/screenshots/search-results.png)
```

### AI Travel Copilot
```markdown
![Travel Copilot](docs/screenshots/travel-copilot.png)
```

### Dashboard
```markdown
![Dashboard](docs/screenshots/dashboard.png)
```

---

## Demo Video

[![Demo Video](https://img.shields.io/badge/▶_Watch_Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://drive.google.com/file/d/1L_OU4cTmTeEGHMpwkux6qmy9shFmcwKb/view?usp=sharing)

```
Demo Video:https://drive.google.com/file/d/1L_OU4cTmTeEGHMpwkux6qmy9shFmcwKb/view?usp=sharing
```

---

## Pitch Video

[![Pitch Video](https://img.shields.io/badge/▶_Watch_Pitch-4285F4?style=for-the-badge&logo=youtube&logoColor=white)](https://drive.google.com/file/d/1TrNQUVfoZtBah2pP710RZXU_LiEvOy5X/view?usp=sharing)

```
Pitch Video:https://drive.google.com/file/d/1TrNQUVfoZtBah2pP710RZXU_LiEvOy5X/view?usp=sharing
```

---

## Presentation

[![Presentation](https://img.shields.io/badge/📊_View_Slides-FF7139?style=for-the-badge&logo=microsoftpowerpoint&logoColor=white)](https://drive.google.com/file/d/1TrNQUVfoZtBah2pP710RZXU_LiEvOy5X/view?usp=sharing)

```
Presentation:https://drive.google.com/file/d/1TrNQUVfoZtBah2pP710RZXU_LiEvOy5X/view?usp=sharing
```

---

## Future Improvements

| Priority | Enhancement |
|---|---|
| High | **Mobile App** — React Native iOS/Android |
| High | **Multi-modal journeys** — chain bus + train + metro in one itinerary |
| Medium | **Personalized recommendations** — based on travel history |
| Medium | **Expanded Copilot** — voice input and multi-turn memory |
| Low | **Carbon Footprint Tracker** — eco-score per route |
| Low | **Group Travel** — multi-user itinerary collaboration |

---

## Impact & Use Cases

- **Individual Travelers** — data-backed decisions on route, timing, and risk in seconds
- **Corporate Travel Desks** — automate low-risk route approvals with live delay alerts
- **Transport Authorities** — surface demand hotspots for infrastructure planning
- **Logistics** — proactively reroute shipments around intercity disruptions

---

## Team

<div align="center">

### Team CodeRed

| Name | 
|---|
| **Srinithi M** | 
| **Pragathi P** |
| **Pooja U** | 
| **Sudalai Muthu S** |

</div>

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by Team CodeRed**

*SmartRoute AI — Because every journey deserves intelligence.*

</div>

