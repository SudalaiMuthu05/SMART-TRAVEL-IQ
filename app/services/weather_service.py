import aiohttp
import json
from datetime import date, datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.models import WeatherLog
from app.schemas.schemas import WeatherOut
from app.core.config import settings


# ── Weather Advice Engine ────────────────────────────────────────────────────

def log_debug(msg: str):
    with open("weather_debug.log", "a") as f:
        f.write(f"{datetime.now()}: {msg}\n")

def _generate_travel_advice(data: dict) -> str:
    advice_parts = []

    rain_prob = data.get("rain_probability", 0)
    fog = data.get("fog_alert", False)
    temp_max = data.get("temperature_max", 25)
    wind = data.get("wind_speed_kmh", 0)

    if rain_prob >= 80:
        advice_parts.append("Heavy rain expected — carry rain gear and expect delays")
    elif rain_prob >= 50:
        advice_parts.append("Moderate rain likely — keep an umbrella handy")
    elif rain_prob >= 30:
        advice_parts.append("Light showers possible")

    if fog:
        advice_parts.append("Dense fog alert — travel delays likely, avoid early morning travel")

    if temp_max >= 42:
        advice_parts.append("Extreme heat — stay hydrated and travel during cooler hours")
    elif temp_max >= 38:
        advice_parts.append("Very hot conditions — carry water")

    if wind >= 60:
        advice_parts.append("Strong winds — may affect bus/cab routes")

    return ". ".join(advice_parts) if advice_parts else "Weather conditions are favorable for travel"


def _compute_weather_score(rain_prob: float, fog: bool, temp_max: float, wind: float) -> float:
    """Returns 0–10 where 10 = worst weather for travel."""
    score = 0.0
    score += min(rain_prob / 10, 4)    # max 4 pts from rain
    if fog:
        score += 2.5
    if temp_max >= 42:
        score += 2
    elif temp_max >= 38:
        score += 1
    score += min(wind / 30, 1.5)       # max 1.5 pts from wind
    return round(min(score, 10), 2)


# ── Open-Meteo Fetch (No Key Required) ─────────────────────────────────────────

async def _geocode_city(city: str) -> Optional[tuple]:
    """Converts city name to (lat, lon) using Open-Meteo Geocoding API."""
    url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {"name": city, "count": 1, "language": "en", "format": "json"}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=5) as resp:
                if resp.status != 200:
                    return None
                data = await resp.json()
                results = data.get("results")
                if not results:
                    return None
                return results[0]["latitude"], results[0]["longitude"]
    except Exception:
        return None


async def _fetch_from_openmeteo(city: str, target_date: date) -> Optional[dict]:
    """Fetches weather forecast from Open-Meteo (fallback or primary if no OW key)."""
    coords = await _geocode_city(city)
    if not coords:
        return None
    
    lat, lon = coords
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,weathercode",
        "timezone": "auto",
        "start_date": target_date.strftime("%Y-%m-%d"),
        "end_date": target_date.strftime("%Y-%m-%d")
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=10) as resp:
                if resp.status != 200:
                    return None
                data = await resp.json()
                daily = data.get("daily", {})
                
                if not daily or not daily.get("time"):
                    return None
                
                # WMO Weather interpretation
                weather_code = daily["weathercode"][0]
                condition = "Clear"
                if weather_code >= 95: condition = "Thunderstorm"
                elif weather_code >= 71: condition = "Snow"
                elif weather_code >= 51: condition = "Rain"
                elif weather_code >= 45: condition = "Fog"
                elif weather_code >= 1: condition = "Clouds"

                return {
                    "temperature_min": daily["temperature_2m_min"][0],
                    "temperature_max": daily["temperature_2m_max"][0],
                    "humidity": 65.0,  # Open-Meteo daily humidity requires extra params, providing estimate
                    "rain_probability": daily["precipitation_probability_max"][0],
                    "rain_mm": 0.0,    # Not strictly needed for dashboard logic but good to have
                    "fog_alert": weather_code in [45, 48],
                    "wind_speed_kmh": daily["windspeed_10m_max"][0],
                    "weather_condition": condition,
                }
    except Exception:
        return None


# ── OpenWeatherMap Fetch ─────────────────────────────────────────────────────

async def _fetch_from_openweather(city: str, target_date: date) -> Optional[dict]:
    """Fetches 5-day forecast from OpenWeatherMap and extracts target date data."""
    if not settings.OPENWEATHER_API_KEY or "your_" in settings.OPENWEATHER_API_KEY:
        return None

    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        "q": f"{city},IN",
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
        "cnt": 40,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    return None
                raw = await resp.json()

        # Filter forecast items for the target date
        target_str = target_date.strftime("%Y-%m-%d")
        items = [
            item for item in raw.get("list", [])
            if item["dt_txt"].startswith(target_str)
        ]

        if not items:
            return None

        temps = [i["main"]["temp"] for i in items]
        humidities = [i["main"]["humidity"] for i in items]
        rain_probs = [i.get("pop", 0) * 100 for i in items]
        rain_mm = sum(i.get("rain", {}).get("3h", 0) for i in items)
        wind_speeds = [i["wind"]["speed"] * 3.6 for i in items]  # m/s → km/h
        conditions = [i["weather"][0]["main"] for i in items]

        fog_alert = any(c in ["Fog", "Mist", "Haze", "Smoke"] for c in conditions)
        dominant_condition = max(set(conditions), key=conditions.count)

        return {
            "temperature_min": round(min(temps), 1),
            "temperature_max": round(max(temps), 1),
            "humidity": round(sum(humidities) / len(humidities), 1),
            "rain_probability": round(max(rain_probs), 1),
            "rain_mm": round(rain_mm, 2),
            "fog_alert": fog_alert,
            "wind_speed_kmh": round(max(wind_speeds), 1),
            "weather_condition": dominant_condition,
        }
    except Exception:
        return None


# ── Mock Fallback ────────────────────────────────────────────────────────────

def _mock_weather(city: str, target_date: date) -> dict:
    """Returns deterministic mock weather when API key is absent (dev mode)."""
    import hashlib
    seed = int(hashlib.md5(f"{city}{target_date}".encode()).hexdigest(), 16) % 100
    return {
        "temperature_min": 18 + seed % 10,
        "temperature_max": 28 + seed % 15,
        "humidity": 50 + seed % 40,
        "rain_probability": seed % 70,
        "rain_mm": (seed % 20) * 0.5,
        "fog_alert": seed % 10 == 0,
        "wind_speed_kmh": 10 + seed % 40,
        "weather_condition": ["Clear", "Clouds", "Rain", "Haze"][seed % 4],
    }


# ── Main Service ─────────────────────────────────────────────────────────────

async def fetch_weather_data(city: str, target_date: date) -> dict:
    """Pure fetch logic - No DB interaction. Returns a dict."""
    try:
        data = await _fetch_from_openweather(city, target_date)
        if data is None:
            data = await _fetch_from_openmeteo(city, target_date)
        
        if data is None:
            data = _mock_weather(city, target_date)
        return data
    except Exception:
        return _mock_weather(city, target_date)


async def get_weather(city: str, target_date: date, db: AsyncSession) -> WeatherOut:
    city = city.strip().title()

    try:
        # 1. Check DB cache
        stmt = select(WeatherLog).where(
            and_(WeatherLog.city == city, WeatherLog.date == target_date)
        )
        result = await db.execute(stmt)
        cached = result.scalar_one_or_none()
        if cached:
            return WeatherOut.model_validate(cached)

        # 2. Fetch live data
        data = await fetch_weather_data(city, target_date)
        advice = _generate_travel_advice(data)

        # 3. Persist to DB
        log = WeatherLog(
            city=city,
            date=target_date,
            travel_advice=advice,
            **data,
        )
        db.add(log)
        await db.flush()

        return WeatherOut(
            city=city,
            date=target_date,
            travel_advice=advice,
            **data,
        )
    except Exception as e:
        log_debug(f"Error in get_weather for {city}: {e}")
        fallback = _mock_weather(city, target_date)
        return WeatherOut(
            city=city,
            date=target_date,
            travel_advice=_generate_travel_advice(fallback),
            **fallback
        )


def get_weather_risk_score(rain_prob: float, fog: bool, temp_max: float, wind: float) -> float:
    return _compute_weather_score(rain_prob, fog, temp_max, wind)
