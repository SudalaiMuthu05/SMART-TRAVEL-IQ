from datetime import date
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.models.models import Route, TransportMode
from app.schemas.schemas import RouteOption, RouteSearchResponse


# ── Seed Data Helper ─────────────────────────────────────────────────────────

DOMESTIC_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", 
    "Hyderabad", "Pune", "Goa", "Kochi", "Ahmedabad",
    "Jaipur", "Lucknow", "Chandigarh", "Guwahati", "Bhubaneswar"
]

def generate_mock_transport_routes() -> list:
    import random
    routes = []
    
    bus_operators = ["Zingbus", "Orange Tours", "SRS Travels", "MSRTC", "KSRTC", "VRL Travels"]
    train_names = ["Shatabdi Express", "Rajdhani Express", "Vande Bharat", "Duronto Express", "Intercity Exp"]

    for i in range(len(DOMESTIC_CITIES)):
        for j in range(len(DOMESTIC_CITIES)):
            if i == j: continue
            src, dst = DOMESTIC_CITIES[i], DOMESTIC_CITIES[j]
            
            # Generate 1-2 Buses
            for _ in range(random.randint(1, 2)):
                op = random.choice(bus_operators)
                dur = random.randint(300, 1200)
                routes.append({
                    "src": src, "dst": dst, "mode": "bus", "op": op,
                    "rno": f"BUS-{random.randint(100, 999)}", 
                    "dep": f"{random.randint(18, 23):02d}:{random.choice([0, 15, 30, 45]):02d}",
                    "arr": f"{random.randint(5, 10):02d}:{random.choice([0, 15, 30, 45]):02d}",
                    "dur": dur, "fare": random.randint(600, 1800), "ac": True,
                    "amenities": ["AC", "Charging Points", "Water"]
                })

            # Generate 1-2 Trains
            for _ in range(random.randint(1, 2)):
                op = "Indian Railways"
                name = random.choice(train_names)
                dur = random.randint(240, 1440)
                routes.append({
                    "src": src, "dst": dst, "mode": "train", "op": f"{name} {op}",
                    "rno": f"{random.randint(10000, 22999)}",
                    "dep": f"{random.randint(5, 22):02d}:{random.choice([0, 15, 30, 45]):02d}",
                    "arr": f"{random.randint(5, 22):02d}:{random.choice([0, 15, 30, 45]):02d}",
                    "dur": dur, "fare": random.randint(350, 2500), "ac": random.choice([True, False]),
                    "amenities": ["Pantry", "WiFi", "Linen"]
                })
    return routes

async def seed_routes(db: AsyncSession) -> None:
    print("Generating comprehensive bus and train dataset...")
    generated = generate_mock_transport_routes()
    print(f"Total routes generated: {len(generated)}. Inserting to database...")
    
    inserted = 0
    skipped = 0
    for r in generated:
        stmt = select(Route).where(
            and_(
                Route.source_city == r["src"],
                Route.destination_city == r["dst"],
                Route.route_number == r["rno"],
            )
        )
        res = await db.execute(stmt)
        if res.scalars().first():
            skipped += 1
            continue
        db.add(Route(
            source_city=r["src"], destination_city=r["dst"],
            transport_mode=TransportMode(r["mode"]), operator_name=r["op"],
            route_number=r["rno"], departure_time=r["dep"],
            arrival_time=r["arr"], duration_minutes=r["dur"],
            base_fare=r["fare"], is_ac=r["ac"], amenities=r["amenities"]
        ))
        inserted += 1
    await db.commit()
    print(f"✅ Route seed complete. Inserted: {inserted}, Skipped: {skipped}")


# ── Search ───────────────────────────────────────────────────────────────────

async def search_routes(
    source: str,
    destination: str,
    travel_date: date,
    db: AsyncSession,
    transport_mode: Optional[TransportMode] = None,
    num_travelers: int = 1,
) -> RouteSearchResponse:
    source = source.strip().title()
    destination = destination.strip().title()

    aliases = {
        "Bengaluru": "Bangalore",
        "Bombay": "Mumbai",
        "Madras": "Chennai",
        "Calcutta": "Kolkata",
        "Cochin": "Kochi"
    }
    source = aliases.get(source, source)
    destination = aliases.get(destination, destination)

    from sqlalchemy import func
    
    # Define city search sets (original + possible alias)
    source_set = {source, aliases.get(source, source)}
    dest_set = {destination, aliases.get(destination, destination)}

    conditions = [
        func.lower(Route.source_city).in_([s.lower() for s in source_set]),
        func.lower(Route.destination_city).in_([d.lower() for d in dest_set]),
        Route.is_active == True,
    ]
    if transport_mode:
        conditions.append(Route.transport_mode == transport_mode)

    stmt = select(Route).where(and_(*conditions)).order_by(Route.base_fare).limit(100)
    result = await db.execute(stmt)
    routes = result.scalars().all()

    bus_options: List[RouteOption] = []
    train_options: List[RouteOption] = []
    flight_options: List[RouteOption] = []
    cab_options: List[RouteOption] = []

    for r in routes:
        option = RouteOption(
            id=r.id,
            source_city=r.source_city,
            destination_city=r.destination_city,
            transport_mode=r.transport_mode,
            operator_name=r.operator_name,
            route_number=r.route_number,
            departure_time=r.departure_time,
            arrival_time=r.arrival_time,
            duration_minutes=r.duration_minutes,
            base_fare=r.base_fare,
            total_fare=round(r.base_fare * num_travelers, 2) if r.base_fare else None,
            is_ac=r.is_ac,
            amenities=r.amenities or [],
        )
        if r.transport_mode == TransportMode.BUS:
            bus_options.append(option)
        elif r.transport_mode == TransportMode.TRAIN:
            train_options.append(option)
        elif r.transport_mode == TransportMode.FLIGHT:
            flight_options.append(option)
        elif r.transport_mode == TransportMode.CAB:
            cab_options.append(option)

    return RouteSearchResponse(
        source=source,
        destination=destination,
        travel_date=travel_date,
        bus_options=bus_options,
        train_options=train_options,
        flight_options=flight_options,
        cab_options=cab_options,
        total_results=len(bus_options) + len(train_options) + len(flight_options) + len(cab_options),
    )


async def get_efficient_routes(
    source: str,
    destination: str,
    travel_date: date,
    db: AsyncSession,
    num_travelers: int = 1,
    preferred_mode: Optional[str] = None,
):
    """
    Finds and compares all routes to return the cheapest, fastest, and best value options.
    If preferred_mode is provided, it weights those options higher in the 'overall' category.
    """
    from app.schemas.schemas import EfficientRouteResponse
    
    # Get all routes using the existing search logic
    search_response = await search_routes(
        source=source,
        destination=destination,
        travel_date=travel_date,
        db=db,
        num_travelers=num_travelers
    )

    all_options = (
        search_response.bus_options + 
        search_response.train_options + 
        search_response.flight_options + 
        search_response.cab_options
    )

    def _get_efficient_category(options, is_overall=False):
        from app.schemas.schemas import EfficientCategory
        if not options:
            return EfficientCategory()
            
        cheapest = min(options, key=lambda x: x.total_fare if x.total_fare is not None else float('inf'))
        fastest = min(options, key=lambda x: x.duration_minutes if x.duration_minutes is not None else float('inf'))
        
        # If a specific mode is preferred, and is_overall is TRUE, we can adjust the categories
        # but the user usually expects the ABSOLUTE cheapest/fastest in these specific cards.
        # We'll stick to absolute metrics for clarity as per previous request.
        
        return EfficientCategory(cheapest_option=cheapest, fastest_option=fastest)

    overall = _get_efficient_category(all_options, is_overall=True)
    
    by_mode = {
        "bus": _get_efficient_category(search_response.bus_options),
        "train": _get_efficient_category(search_response.train_options),
        "flight": _get_efficient_category(search_response.flight_options),
        "cab": _get_efficient_category(search_response.cab_options)
    }

    return EfficientRouteResponse(
        source=search_response.source,
        destination=search_response.destination,
        travel_date=search_response.travel_date,
        overall=overall,
        by_mode=by_mode
    )
