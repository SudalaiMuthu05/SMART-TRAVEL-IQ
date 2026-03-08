from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter(prefix="/copilot", tags=["Copilot"])

class ChatRequest(BaseModel):
    message: str
    destination: str
    hotels: List[Dict[str, Any]] = []

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []

@router.post("/chat", response_model=ChatResponse)
async def copilot_chat(req: ChatRequest):
    message = req.message.lower()
    dest = req.destination
    hotels = req.hotels
    
    reply = ""
    suggestions = []

    # 1. Handle Hotel Queries
    if any(k in message for k in ["hotel", "stay", "accommodation", "resort", "inn"]):
        if hotels:
            # Try to find a highly rated one
            sorted_hotels = sorted(hotels, key=lambda x: x.get("google_rating", 0), reverse=True)
            top = sorted_hotels[0]
            name = top.get("name", "the top-rated hotel")
            rating = top.get("google_rating", "excellent")
            price = top.get("avg_price_per_night", 0)
            
            reply = f"In {dest}, I'd personally recommend **{name}**. It has a {rating}/5 rating and usually costs around ₹{price:,}/night. "
            if len(hotels) > 1:
                others = [h.get("name") for h in sorted_hotels[1:3] if h.get("name")]
                reply += f"You could also consider **{', '.join(others)}** for a solid alternative."
        else:
            reply = f"I'm scanning for stays in **{dest}**. Usually, the city center or areas near transport hubs like the main railway station are the most convenient for short trips. Would you like me to suggest some specific budget or luxury options?"
        
        suggestions = ["Luxury options", "Budget stays", "Nearest to metro"]

    # 2. Handle Area/Location Queries
    elif any(k in message for k in ["area", "location", "neighborhood", "place", "where to stay"]):
        if dest == "Delhi":
            reply = "For Delhi, **Aerocity** is perfect if you're on a quick business trip. If you want culture and shopping, **Connaught Place** is the heart of the city. For a more posh, quiet vibe, **South Delhi** neighborhoods like Greater Kailash are great."
        elif dest == "Mumbai":
            reply = "In Mumbai, stay in **Colaba** for old-world charm and tourism. **Bandra** is the place to be for trendy cafes and nightlife. For business, **BKC (Bandra Kurla Complex)** is the most efficient."
        elif dest == "Goa":
            reply = "**North Goa (Calangute/Baga)** is best for parties and crowds, while **South Goa (Palolem/Agonda)** is better for peace and clean beaches."
        else:
            reply = f"For **{dest}**, the 'Central Business District' is usually the safest bet for first-time visitors. Are you looking for nightlife, quiet, or proximity to office hubs?"
        suggestions = ["Getting around", "Top landmarks", "Safety tips"]

    # 3. Handle Sightseeing/Itinerary Queries
    elif any(k in message for k in ["itinerary", "plan", "visit", "see", "things to do", "todo"]):
        reply = f"Here is a quick 'Smart Plan' for **{dest}**: \n\n"
        if dest == "Delhi":
            reply += "1. **Morning**: Visit India Gate and War Memorial.\n2. **Afternoon**: Explore the Mughal architecture at Humayun's Tomb.\n3. **Evening**: Walk through Lodhi Gardens or shop at Khan Market."
        elif dest == "Mumbai":
            reply += "1. **Morning**: Gateway of India and Taj Mahal Palace.\n2. **Afternoon**: Drive through Marine Drive and visit Mani Bhavan.\n3. **Evening**: Enjoy the sunset at Juhu Beach or Bandra Fort."
        else:
            reply += f"Start your day early at the most famous local landmark. Spend the afternoon exploring a local market to get the real vibe of {dest}, and finish with a nice dinner at a top-rated local restaurant."
        suggestions = ["Best food spots", "Hidden gems", "Timing advice"]

    # 4. Default / General AI Intro
    else:
        reply = f"Hello! I am your **Travel Copilot**. I have analyzed the routes and hotels for your trip to **{dest}**. \n\nI can help you decide between hotels, explain which city areas are best, or give you a quick 1-day itinerary. What would you like to know?"
        suggestions = ["Best hotels?", "Where to stay?", "1-day plan"]

    return ChatResponse(reply=reply, suggestions=suggestions)
