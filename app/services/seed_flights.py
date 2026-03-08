import random
import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.models import Route, TransportMode

# -- Flight Reference Data -----------------------------------------------------

AIRLINES = ["IndiGo", "Air India", "Vistara", "SpiceJet", "Akasa Air"]

DOMESTIC_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", 
    "Hyderabad", "Pune", "Goa", "Kochi", "Ahmedabad",
    "Jaipur", "Lucknow", "Chandigarh", "Guwahati", "Bhubaneswar"
]

# Approximate base flight durations in minutes between major pairs
CITY_DURATIONS: Dict[str, Dict[str, int]] = {
    "Mumbai": {"Delhi": 120, "Bangalore": 90, "Chennai": 105, "Kolkata": 150, "Hyderabad": 75, "Goa": 60, "Pune": 45, "Ahmedabad": 65},
    "Delhi": {"Mumbai": 125, "Bangalore": 165, "Chennai": 175, "Kolkata": 130, "Hyderabad": 120, "Goa": 150, "Pune": 125, "Ahmedabad": 95},
    "Bangalore": {"Mumbai": 95, "Delhi": 170, "Chennai": 55, "Kolkata": 150, "Hyderabad": 60, "Goa": 70, "Pune": 80, "Ahmedabad": 120},
    "Chennai": {"Mumbai": 110, "Delhi": 175, "Bangalore": 60, "Kolkata": 135, "Hyderabad": 65, "Goa": 95, "Pune": 100, "Ahmedabad": 130},
    "Kolkata": {"Mumbai": 160, "Delhi": 135, "Bangalore": 155, "Chennai": 140, "Hyderabad": 130, "Goa": 165, "Pune": 155, "Ahmedabad": 150},
    "Hyderabad": {"Mumbai": 80, "Delhi": 125, "Bangalore": 65, "Chennai": 70, "Kolkata": 125, "Goa": 80, "Pune": 70, "Ahmedabad": 100},
}

# Add reverse durations symmetrically
for src, destinations in list(CITY_DURATIONS.items()):
    for dest, duration in destinations.items():
        if dest not in CITY_DURATIONS:
            CITY_DURATIONS[dest] = {}
        if src not in CITY_DURATIONS[dest]:
            CITY_DURATIONS[dest][src] = duration


def get_base_duration(src: str, dst: str) -> int:
    """Returns approximate base flight duration or generic fallback."""
    if src in CITY_DURATIONS and dst in CITY_DURATIONS[src]:
        return CITY_DURATIONS[src][dst]
    return random.randint(60, 180)


def format_time(hours: int, minutes: int) -> str:
    """Formats time as HH:MM"""
    return f"{hours:02d}:{minutes:02d}"


def add_duration(time_str: str, duration_mins: int) -> str:
    """Adds minutes to HH:MM format."""
    h, m = map(int, time_str.split(':'))
    total_m = (h * 60) + m + duration_mins
    new_h = (total_m // 60) % 24
    new_m = total_m % 60
    return format_time(new_h, new_m)


def generate_flight_number(airline: str) -> str:
    """Generates realistic flight numbers."""
    prefixes = {
        "IndiGo": "6E",
        "Air India": "AI",
        "Vistara": "UK",
        "SpiceJet": "SG",
        "Akasa Air": "QP"
    }
    prefix = prefixes.get(airline, "FL")
    return f"{prefix}-{random.randint(100, 9999)}"


def generate_flight_amenities(airline: str) -> List[str]:
    """Assigns amenities common to the airline style."""
    amenities = ["Cabin Baggage"]
    if airline in ["Air India", "Vistara"]:
        amenities.extend(["Complimentary Meal", "Check-in Baggage (15kg)", "Premium Seats Available"])
    else:
        amenities.extend(["Meals available for purchase", "Check-in Baggage available"])
    return amenities


def generate_mock_flight_dataset() -> List[Dict[str, Any]]:
    """Generates a dataset of realistic mock flights connecting all city pairs."""
    flights = []
    
    for i in range(len(DOMESTIC_CITIES)):
        for j in range(len(DOMESTIC_CITIES)):
            if i == j:
                continue
            
            src = DOMESTIC_CITIES[i]
            dst = DOMESTIC_CITIES[j]
            
            # Generate 2 to 5 random flights per route
            num_flights = random.randint(2, 5)
            
            for _ in range(num_flights):
                airline = random.choice(AIRLINES)
                duration = get_base_duration(src, dst) + random.randint(-10, 10)  # Add minor variation
                
                # Randomize departure time
                dep_hour = random.randint(5, 22)  # Most domestic flights during daytime/evening
                dep_min = random.choice([0, 10, 15, 30, 45, 50])
                dep_time = format_time(dep_hour, dep_min)
                
                arr_time = add_duration(dep_time, duration)
                
                # Base fare calculation (approximate using duration and randomness)
                # Shorter flights (~60 mins) usually 3000-5000, longer flights 5000+
                base_fare = round(duration * random.uniform(40, 60) / 100) * 100  # Round to nearest 100
                
                if airline in ["Vistara", "Air India"]:
                    base_fare += random.randint(500, 1500)  # Full-service carrier premium
                
                flights.append({
                    "src": src,
                    "dst": dst,
                    "mode": "flight",
                    "op": airline,
                    "rno": generate_flight_number(airline),
                    "dep": dep_time,
                    "arr": arr_time,
                    "dur": duration,
                    "fare": base_fare,
                    "ac": True,
                    "amenities": generate_flight_amenities(airline)
                })
                
    return flights

# -- DB Seeding Script ---------------------------------------------------------

async def seed_flight_dataset(db: AsyncSession) -> None:
    """Inserts generated flights into the database if they don't already exist."""
    print(f"Generating comprehensive flight dataset across {len(DOMESTIC_CITIES)} cities...")
    generated_flights = generate_mock_flight_dataset()
    print(f"Total flights generated: {len(generated_flights)}. Inserting to database...")
    
    inserted_count = 0
    skipped_count = 0
    
    # We batch process to avoid hanging
    for r in generated_flights:
        stmt = select(Route).where(
            and_(
                Route.source_city == r["src"],
                Route.destination_city == r["dst"],
                Route.route_number == r["rno"],
            )
        )
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            skipped_count += 1
            continue
            
        db.add(Route(
            source_city=r["src"],
            destination_city=r["dst"],
            transport_mode=TransportMode(r["mode"]),
            operator_name=r["op"],
            route_number=r["rno"],
            departure_time=r["dep"],
            arrival_time=r["arr"],
            duration_minutes=r["dur"],
            base_fare=r["fare"],
            is_ac=r["ac"],
            amenities=r["amenities"],
        ))
        inserted_count += 1
        
    await db.commit()
    print(f"✅ Flight seed complete. Inserted: {inserted_count}, Skipped: {skipped_count}")
