# 🗺️ Smart Travel Intelligence Platform — Backend

A production-grade **FastAPI** backend for intelligent intercity travel planning in India.
No Docker required — runs directly with Python + PostgreSQL.

---

## 📁 Complete File Structure

```
smart_travel_backend/
│
├── app/                                 ← Main application package
│   ├── __init__.py
│   ├── main.py                          ← FastAPI app entry point, lifespan, middleware
│   │
│   ├── core/                            ← Configuration & Security
│   │   ├── __init__.py
│   │   ├── config.py                    ← Pydantic settings (reads .env)
│   │   └── security.py                  ← JWT encode/decode, bcrypt password hashing
│   │
│   ├── db/                              ← Database layer
│   │   ├── __init__.py
│   │   └── session.py                   ← Async SQLAlchemy engine, session factory, DI
│   │
│   ├── models/                          ← ORM Models (SQLAlchemy)
│   │   ├── __init__.py
│   │   └── models.py                    ← User, Route, Hotel, Holiday, WeatherLog,
│   │                                        RiskPrediction, Itinerary, UserPreference
│   │
│   ├── schemas/                         ← Pydantic Request/Response schemas
│   │   ├── __init__.py
│   │   └── schemas.py                   ← All input/output shapes for every endpoint
│   │
│   ├── services/                        ← Core Business Logic
│   │   ├── __init__.py
│   │   ├── auth_service.py              ← User registration, login, JWT guard dependency
│   │   ├── route_service.py             ← Route search engine + sample data seeder
│   │   ├── weather_service.py           ← OpenWeatherMap integration + mock fallback
│   │   ├── holiday_service.py           ← Holiday detection + demand scoring
│   │   ├── risk_service.py              ← Travel Risk Meter (0-10) weighted engine
│   │   └── hotel_service.py             ← Hotel search + recommendation + seeder
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py                ← Aggregates all endpoint routers
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── auth.py              ← POST /register  POST /login  GET /me
│   │           ├── routes.py            ← GET /routes/search
│   │           ├── weather.py           ← GET /weather
│   │           ├── holidays.py          ← GET /holidays/near  GET /holidays/score
│   │           ├── risk.py              ← GET /risk
│   │           ├── hotels.py            ← GET /hotels/search
│   │           ├── dashboard.py         ← POST /dashboard (all modules in one call)
│   │           ├── itineraries.py       ← CRUD /itineraries (auth protected)
│   │           └── websocket.py         ← WS /ws/alerts/{src}/{dst}/{date}
│   │
│   └── utils/
│       └── __init__.py
│
├── alembic/                             ← Database migrations
│   ├── env.py                           ← Migration environment config
│   └── versions/                        ← Auto-generated migration files go here
│
├── tests/
│   ├── __init__.py
│   └── test_services.py                 ← Unit tests for all service modules
│
├── .env.example                         ← Environment variable template
├── alembic.ini                          ← Alembic configuration
├── requirements.txt                     ← All Python dependencies
├── db_setup.sql                         ← PostgreSQL one-time setup script
├── setup.sh                             ← Automated local setup script
└── run.sh                               ← Dev server launcher
```

---

## Local Setup (No Docker)

### Step 1 — Install PostgreSQL

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu / Debian:**
```bash
sudo apt update && sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

### Step 2 — Create Database

```bash
sudo -u postgres psql -f db_setup.sql
```

Or manually:
```bash
sudo -u postgres psql
```
```sql
CREATE USER travel_user WITH PASSWORD 'travel_pass';
CREATE DATABASE smart_travel OWNER travel_user;
GRANT ALL PRIVILEGES ON DATABASE smart_travel TO travel_user;
\q
```

---

### Step 3 — Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

Creates virtual environment and installs all dependencies.

---

### Step 4 — Configure Environment

Edit the generated `.env` file:

```env
DATABASE_URL=postgresql+asyncpg://travel_user:travel_pass@localhost:5432/smart_travel
SYNC_DATABASE_URL=postgresql://travel_user:travel_pass@localhost:5432/smart_travel
SECRET_KEY=change-me-to-something-secure-and-random-32chars
DEBUG=true

# Optional - mock data used if blank
OPENWEATHER_API_KEY=
GOOGLE_MAPS_API_KEY=
```

---

### Step 5 — Start the Server

```bash
chmod +x run.sh
./run.sh
```

Or directly:
```bash
source venv/bin/activate
uvicorn app.main:app --reload
```

**Output on success:**
```
INFO: Starting Smart Travel API...
INFO: Database tables ready
INFO: Seed data loaded (routes, hotels, holidays)
INFO: Uvicorn running on http://0.0.0.0:8000
```

---

### Step 6 — Open Swagger UI

- http://localhost:8000/docs    — Interactive Swagger UI
- http://localhost:8000/redoc   — ReDoc documentation
- http://localhost:8000/health  — Health check

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Login, returns JWT tokens |
| GET | `/api/v1/auth/me` | Yes | Get current user profile |

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/routes/search` | Search bus + train routes |

Query params: `source`, `destination`, `date`, `transport_mode`, `num_travelers`

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/weather` | Weather forecast + travel advice |

Query params: `city`, `date`

### Holidays
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/holidays/near` | Holidays within N days of travel date |
| GET | `/api/v1/holidays/score` | Holiday demand risk score (0-10) |

### Risk Prediction
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/risk` | Compute travel risk score (0-10) |

Query params: `source`, `destination`, `date`

### Hotels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/hotels/search` | Search hotels with filters |

Query params: `city`, `check_in`, `check_out`, `num_guests`, `max_price`, `min_stars`

### Smart Dashboard (Main Endpoint)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/dashboard` | All 6 modules in a single async call |

Request body:
```json
{
  "source": "Chennai",
  "destination": "Bangalore",
  "travel_date": "2025-11-01",
  "num_travelers": 2,
  "check_out_date": "2025-11-03"
}
```

### Itineraries (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/itineraries` | Save a trip itinerary |
| GET | `/api/v1/itineraries` | List all user itineraries |
| GET | `/api/v1/itineraries/{id}` | Get one itinerary |
| PATCH | `/api/v1/itineraries/{id}` | Update itinerary |
| DELETE | `/api/v1/itineraries/{id}` | Delete itinerary |

### WebSocket — Real-time Alerts
```
ws://localhost:8000/ws/alerts/{source}/{destination}/{date}
```

---

## Quick Test (curl)

```bash
# Health check
curl http://localhost:8000/health

# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Ravi Kumar","email":"ravi@example.com","password":"securepass123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ravi@example.com","password":"securepass123"}'

# Smart Dashboard
curl -X POST http://localhost:8000/api/v1/dashboard \
  -H "Content-Type: application/json" \
  -d '{"source":"Chennai","destination":"Bangalore","travel_date":"2025-11-01","num_travelers":2}'

# Search routes
curl "http://localhost:8000/api/v1/routes/search?source=Chennai&destination=Bangalore&date=2025-11-01"

# Risk score
curl "http://localhost:8000/api/v1/risk?source=Chennai&destination=Bangalore&date=2025-11-01"

# Hotels
curl "http://localhost:8000/api/v1/hotels/search?city=Bangalore&check_in=2025-11-01&check_out=2025-11-03"
```

---

## Risk Score Formula

```
Risk Score (0-10) =
    holiday_score  x 0.30   (peak demand detection)
  + weather_score  x 0.25   (rain, fog, heat, wind)
  + traffic_score  x 0.25   (weekends, long weekends, season)
  + demand_score   x 0.20   (composite pressure)
```

| Score | Level | Recommendation |
|-------|-------|----------------|
| 0-3.4 | LOW | Safe to travel |
| 3.5-5.4 | MODERATE | Plan carefully |
| 5.5-7.4 | HIGH | Book early, expect delays |
| 7.5-10 | CRITICAL | Consider rescheduling |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `user_preferences` | Travel preferences per user |
| `routes` | Bus/train route catalog |
| `hotels` | Hotel catalog with ratings |
| `holidays` | Indian national + festival holidays |
| `weather_logs` | Cached weather forecasts |
| `risk_predictions` | Cached risk computations |
| `itineraries` | User saved trip plans |

---

## Database Migrations

```bash
# Apply migrations
alembic upgrade head

# Create migration after changing models
alembic revision --autogenerate -m "describe your change"

# Rollback one step
alembic downgrade -1
```

---

## Run Tests

```bash
source venv/bin/activate
pytest tests/ -v
```

---

## 🎨 Frontend Setup (travelaggregator)

The frontend is a modern **React + Vite** application located in the `travelaggregator/` directory.

### Step 1 — Install Dependencies
```bash
cd travelaggregator
npm install
```

### Step 2 — Environmental Configuration
The frontend expects the backend to be running on `http://localhost:8000`. This is configured in `src/services/api.js`.

### Step 3 — Start Frontend Dev Server
```bash
npm run dev
```
Open http://localhost:5173 to access the platform.

---

## 🔗 Main Integration Points

1. **Intelligent Dashboard**: The frontend calls `POST /api/v1/dashboard/` which aggregates data from Route Search, Weather, Holidays, and Risk modules.
2. **Efficiency Comparison**: The backend calculates the `cheapest`, `fastest`, and `best_value` options across all transport modes (Bus, Train, Flight, Cab).
3. **City Aliasing**: The backend automatically handles city name variations (e.g., "Bengaluru" -> "Bangalore") to ensure database matches.
4. **Data Seeding**: On first run, the backend seeds ~200 hotels, thousands of flight options, and hundreds of bus/train routes to the PostgreSQL database.

---

## 🗺️ Smart Travel Dataset

The platform comes with a pre-seeded dataset for major Indian cities:
- **Cities**: Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Goa, Kochi, Jaipur, etc.
- **Transport**: Realistic schedules for Flights, Vande Bharat/Express Trains, and Premium Bus operators.
- **Hotels**: Curated mock data for stays ranging from backpacker hostels (2-star) to luxury palaces (5-star).

---

## 🏆 Project Architecture (Full Stack)

| Component | Responsibility |
|-----------|----------------|
| **Frontend** | React, Vite, TailwindCSS, Lucide, Framer Motion |
| **API Layer** | FastAPI, Pydantic, OAuth2/JWT |
| **Logic** | Route Comparison, Risk Scoring, Async Aggregation |
| **Database** | PostgreSQL (Relational Data + JSONB for amenities) |
| **Caching** | Pydantic-based TTL (Redis ready) |