from datetime import date
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.models import Hotel
from app.schemas.schemas import HotelOut


import random
from typing import List, Dict, Any

# ── Seed Data Generation ────────────────────────────────────────────────────────

DOMESTIC_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", 
    "Hyderabad", "Pune", "Goa", "Kochi", "Ahmedabad",
    "Jaipur", "Lucknow", "Chandigarh", "Guwahati", "Bhubaneswar"
]

HOTEL_BRANDS = {
    5: ["Taj", "The Leela", "Oberoi", "ITC", "Trident", "Hyatt", "Marriott", "Radisson Blu"],
    4: ["Lemon Tree Premier", "Novotel", "Holiday Inn", "Fortune", "Pride Plaza"],
    3: ["FabHotel", "Treebo", "Oyo Townhouse", "Ginger", "Red Fox"],
    2: ["Zostel", "Hosteller", "Local Guest House", "Backpacker Hostel"]
}

AMENITIES_MAP = {
    5: ["Pool", "Spa", "Gym", "Multiple Restaurants", "Bar", "Butler Service", "WiFi", "Valet Parking", "Club Lounge"],
    4: ["Pool", "Gym", "Restaurant", "Bar", "WiFi", "Business Center"],
    3: ["Restaurant", "WiFi", "AC", "TV", "Room Service"],
    2: ["WiFi", "Common Area", "Locker", "Shared Kitchen"]
}

def generate_mock_hotels() -> List[Dict[str, Any]]:
    hotels = []
    
    for city in DOMESTIC_CITIES:
        # Generate 10-15 hotels per city
        num_hotels = random.randint(10, 15)
        
        for _ in range(num_hotels):
            # Weighted random choice for star rating (mostly 3 and 4 stars)
            stars = random.choices([5, 4, 3, 2], weights=[2, 4, 3, 1])[0]
            
            brand = random.choice(HOTEL_BRANDS[stars])
            suffix = random.choice(["Palace", "Residency", "Grand", "Suites", "Inn", "Plaza", "Boutique"])
            name = f"{brand} {suffix} {city}" if stars > 3 else f"{brand} {city} Central"
            
            # Base price ranges by star rating
            price_ranges = {
                5: (8000, 25000),
                4: (3500, 7500),
                3: (1500, 3000),
                2: (500, 1200)
            }
            price = random.randint(*price_ranges[stars])
            
            # Round price to nearest 100
            price = round(price / 100) * 100
            
            # Generate realistic ratings
            rating = round(random.uniform(3.8 + (stars * 0.1), 4.9), 1)
            reviews = random.randint(50, 5000 * stars)
            
            # Get subset of amenities based on stars
            available_amenities = AMENITIES_MAP[stars]
            num_amenities = random.randint(len(available_amenities) // 2, len(available_amenities))
            amenities = random.sample(available_amenities, num_amenities)

            hotels.append({
                "name": name,
                "city": city,
                "lat": round(random.uniform(10.0, 30.0), 4),  # Mock approx India lat/lon
                "lon": round(random.uniform(70.0, 90.0), 4),
                "stars": stars,
                "price": price,
                "rating": rating,
                "reviews": reviews,
                "amenities": amenities
            })
            
    return hotels


async def seed_hotels(db: AsyncSession) -> None:
    print("Generating comprehensive hotel mock dataset...")
    generated_hotels = generate_mock_hotels()
    print(f"Total hotels generated: {len(generated_hotels)}. Inserting into database...")
    
    inserted_count = 0
    skipped_count = 0
    
    for h in generated_hotels:
        stmt = select(Hotel).where(
            and_(Hotel.name == h["name"], Hotel.city == h["city"])
        )
        result = await db.execute(stmt)
        if result.scalars().first():
            skipped_count += 1
            continue
            
        db.add(Hotel(
            name=h["name"],
            city=h["city"],
            latitude=h["lat"],
            longitude=h["lon"],
            star_rating=h["stars"],
            avg_price_per_night=h["price"],
            google_rating=h["rating"],
            total_reviews=h["reviews"],
            amenities=h["amenities"],
        ))
        inserted_count += 1
        
    await db.commit()
    print(f"✅ Hotel seed complete. Inserted: {inserted_count}, Skipped: {skipped_count}")

# ── Search ───────────────────────────────────────────────────────────────────

async def search_hotels(
    city: str,
    check_in: date,
    check_out: date,
    db: AsyncSession,
    num_guests: int = 1,
    max_price: Optional[float] = None,
    min_stars: Optional[int] = None,
) -> List[HotelOut]:
    city = city.strip().title()
    
    # Map common aliases, especially Bengaluru -> Bangalore
    aliases = {
        "Bengaluru": "Bangalore",
        "Bombay": "Mumbai",
        "Madras": "Chennai",
        "Calcutta": "Kolkata",
        "Cochin": "Kochi"
    }
    city = aliases.get(city, city)
    
    nights = max((check_out - check_in).days, 1)

    conditions = [Hotel.city == city, Hotel.is_active == True]
    if max_price:
        conditions.append(Hotel.avg_price_per_night <= max_price)
    if min_stars:
        conditions.append(Hotel.star_rating >= min_stars)

    stmt = select(Hotel).where(and_(*conditions)).order_by(
        Hotel.google_rating.desc(), Hotel.avg_price_per_night
    )
    result = await db.execute(stmt)
    hotels = result.scalars().all()

    return [
        HotelOut(
            id=h.id,
            name=h.name,
            city=h.city,
            address=h.address,
            latitude=h.latitude,
            longitude=h.longitude,
            star_rating=h.star_rating,
            avg_price_per_night=h.avg_price_per_night,
            total_price=round(h.avg_price_per_night * nights, 2) if h.avg_price_per_night else None,
            amenities=h.amenities or [],
            google_rating=h.google_rating,
            total_reviews=h.total_reviews,
            image_urls=h.image_urls or [],
        )
        for h in hotels
    ]
