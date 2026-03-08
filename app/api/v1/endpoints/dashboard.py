from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
import asyncio
from app.db.session import get_db
from app.schemas.schemas import DashboardRequest, DashboardResponse
from app.services.route_service import search_routes
from app.services.weather_service import get_weather
from app.services.holiday_service import get_holidays_near_date
from app.services.risk_service import compute_risk
from app.services.hotel_service import search_hotels

router = APIRouter(prefix="/dashboard", tags=["Smart Dashboard"])


@router.post("/", response_model=DashboardResponse)
async def smart_dashboard(
    req: DashboardRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    🧠 Smart Travel Intelligence Dashboard

    Single endpoint that aggregates ALL modules:
    - Route options (bus, train, flight, cab)
    - Source & destination weather
    - Nearby holidays
    - Travel risk score + recommendations
    - Hotel suggestions at destination

    Use this to power the main frontend dashboard view.
    """
    check_out = req.check_out_date or (req.travel_date + timedelta(days=1))

    # 1. DB tasks must be sequential because AsyncSession is not concurrent
    from app.services.route_service import get_efficient_routes
    try:
        routes = await search_routes(req.source, req.destination, req.travel_date, db, num_travelers=req.num_travelers)
        efficient_routes = await get_efficient_routes(
            req.source, req.destination, req.travel_date, db, 
            num_travelers=req.num_travelers, 
            preferred_mode=req.preferred_mode
        )
        holidays = await get_holidays_near_date(req.travel_date, db)
        hotels = await search_hotels(req.destination, req.travel_date, check_out, db)
    except Exception as e:
        print(f"DEBUG: DB Task failed: {e}")
        routes, efficient_routes, holidays, hotels = None, None, [], []

    # 2. API independent fetches (safe for parallelism)
    from app.services.weather_service import fetch_weather_data, _generate_travel_advice, WeatherOut
    
    w_src_api_task = fetch_weather_data(req.source, req.travel_date)
    w_dst_api_task = fetch_weather_data(req.destination, req.travel_date)

    weather_results = await asyncio.gather(
        w_src_api_task,
        w_dst_api_task,
        return_exceptions=True,
    )
    w_src_data, w_dst_data = weather_results

    # 2. Process weather (convert to schemas and log to DB sequentially if needed)
    # This part is now much faster because data is already in memory
    def _create_weather_out(city, data):
        if isinstance(data, Exception): return None
        return WeatherOut(
            city=city,
            date=req.travel_date,
            travel_advice=_generate_travel_advice(data),
            **data
        )

    weather_source = _create_weather_out(req.source, w_src_data)
    weather_destination = _create_weather_out(req.destination, w_dst_data)

    # 3. Compute risk (using pre-fetched data)
    try:
        risk = await compute_risk(
            req.source, 
            req.destination, 
            req.travel_date, 
            db,
            weather=weather_destination,
            holidays=holidays if not isinstance(holidays, Exception) else None
        )
    except Exception as e:
        print(f"DEBUG: risk failed: {e}")
        risk = None

    return DashboardResponse(
        routes=routes if not isinstance(routes, Exception) else None,
        efficient_routes=efficient_routes if not isinstance(efficient_routes, Exception) else None,
        weather_source=weather_source,
        weather_destination=weather_destination,
        holidays=holidays if not isinstance(holidays, Exception) else [],
        risk=risk,
        hotels=hotels if not isinstance(hotels, Exception) else [],
    )
