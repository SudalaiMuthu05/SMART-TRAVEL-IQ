import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import HotelCard from '../components/HotelCard'
import MustVisitSpots from '../components/MustVisitSpots'
import TravelCopilot from '../components/TravelCopilot'
import TrendChart from '../components/TrendChart'
import { fetchHotels } from '../services/api'

function sortHotels(hotels, sortBy) {
  const items = [...hotels]
  if (sortBy === 'price-low') {
    return items.sort((a, b) => (a.price || 0) - (b.price || 0))
  }
  if (sortBy === 'price-high') {
    return items.sort((a, b) => (b.price || 0) - (a.price || 0))
  }
  if (sortBy === 'distance') {
    return items.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
  }
  return items.sort((a, b) => (b.rating || 0) - (a.rating || 0))
}

export default function HotelsPage() {
  const { state } = useLocation()

  // Try state, then localStorage, then default
  const initialDest = state?.destination || localStorage.getItem('last_destination') || 'Delhi'
  const [destination, setDestination] = useState(initialDest)
  const [hotels, setHotels] = useState(state?.hotels || [])
  const [loading, setLoading] = useState(false)

  const [sortBy, setSortBy] = useState('rating')
  const [minRating, setMinRating] = useState('4.0')
  const [priceRange, setPriceRange] = useState('7000')
  const [amenity, setAmenity] = useState('Any')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchHotels(destination, '2026-04-12', '2026-04-15')
        const mapped = data.map((h, idx) => {
          // Unique image selection based on hotel ID/name
          const imgIds = [
            '1566073771259-6a8506099945', // Luxurious Grand
            '1571003123894-1f0594d2b5d9', // Modern Resort
            '1520250497591-112f2f40a3f4', // Boutique Design
            '1542314831-068cd1dbfeeb', // Classic Heritage
            '1542314831-068cd1dbfeeb', // Luxury Suite (Alternative)
            '1582719478250-c89cae4dc85b', // Tropical Escape
            '1571896349842-33c89424de2d', // Infinity Pool
            '1564501049412-61c2a3083791', // Spa & Wellness
            '1596394516093-501ba68a0ba6', // Mountain Retreat
            '1522771734898-8422204c0ec8', // Cozy Boutique
            '1445019980597-93fa8acb246c', // Minimalist Lobby
            '1517840901100-8179e982ad31', // Vibrant City
            '1521783593447-53448304439c', // Executive Suite
            '1591088398332-13e744728ef2', // Sunlit Beach
            '1490333320238-0be850be1ca7', // Garden Villa
            '1444201983204-c43cbd584d93', // Night Life Hotel
            '1512918766755-ee7a5c1ae4a6', // White Modern
            '1506059618631-7218389362d6', // Sunset Resort
            '1566665797739-1674de7a421a', // Modern Minimalist
            '1554139414-04262176261c'  // Royal Palace
          ]
          // Generate a stable hash from hotel name for unique assignment
          const nameHash = h.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          const imgId = imgIds[nameHash % imgIds.length]

          return {
            id: h.id,
            name: h.name,
            rating: h.google_rating,
            reviews: h.total_reviews,
            price: h.avg_price_per_night,
            availability: 'Available',
            location: h.address || h.city,
            distance: 'Central Location',
            amenities: h.amenities,
            image: h.image_urls?.[0] || `https://images.unsplash.com/photo-${imgId}?auto=format&fit=crop&w=800&q=80`,
            badge: h.google_rating > 4.5 ? 'Top Rated' : h.avg_price_per_night < 2000 ? 'Budget Friendly' : 'Best Value'
          }
        })
        setHotels(mapped)
      } catch (err) {
        console.error('Failed to fetch hotels', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [destination])

  const neighborhoods = useMemo(() => ['Any', ...new Set(hotels.map(hotel => hotel.location).filter(Boolean))], [hotels])
  const amenities = useMemo(() => ['Any', ...new Set(hotels.flatMap(hotel => hotel.amenities || []))], [hotels])

  const [area, setArea] = useState('Any')

  useEffect(() => {
    if (!neighborhoods.includes(area)) {
      setArea('Any')
    }
  }, [neighborhoods])

  const [searchQuery, setSearchQuery] = useState('')

  const filteredHotels = useMemo(() => {
    const ratingThreshold = Number(minRating)
    const priceCap = Number(priceRange)

    return sortHotels(
      hotels.filter(hotel => {
        const ratingOk = (hotel.rating || 0) >= ratingThreshold
        const priceOk = (hotel.price || 0) <= priceCap
        const areaOk = area === 'Any' || hotel.location === area
        const amenityOk = amenity === 'Any' || (hotel.amenities || []).includes(amenity)
        const searchOk = !searchQuery || hotel.name?.toLowerCase().includes(searchQuery.toLowerCase())
        return ratingOk && priceOk && areaOk && amenityOk && searchOk
      }),
      sortBy
    )
  }, [hotels, sortBy, minRating, priceRange, area, amenity, searchQuery])

  const demandData = useMemo(() => {
    if (!hotels.length) return { demand: [40, 45, 60, 55, 75, 90, 70] }

    // Create a seed based on city name to keep it stable but city-specific
    const seed = destination.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const avgPrice = hotels.reduce((acc, h) => acc + (h.price || 0), 0) / hotels.length

    // Shift base demand based on average price (more expensive = higher demand index usually)
    // We want a range that feels dynamic (0-100)
    const base = Math.min(Math.max(30 + (avgPrice / 400), 20), 60)

    const rawDemand = [
      base * 0.6 + (seed % 15),       // Mon (Low)
      base * 0.8 + (seed % 20),       // Tue
      base * 1.1 + (seed % 10),       // Wed
      base * 0.9 + (seed % 25),       // Thu
      base * 1.4 + (seed % 15),       // Fri (Rising)
      base * 1.7 + (seed % 30),       // Sat (Peak)
      base * 1.3 + (seed % 10)        // Sun
    ]

    // Normalize or cap to 0-100
    return {
      demand: rawDemand.map(v => Math.min(Math.max(Math.round(v), 0), 100))
    }
  }, [hotels, destination])

  const featuredHotel = filteredHotels[0]
  const restHotels = filteredHotels.slice(1)

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Hotels in {destination}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Smart recommendations based on route context and demand conditions.
          </p>
        </motion.div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Search Hotels
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by hotel name..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-6">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              City
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Change city..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Sort by
              <select value={sortBy} onChange={event => setSortBy(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <option value="rating">Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="distance">Distance</option>
              </select>
            </label>

            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Min rating
              <select value={minRating} onChange={event => setMinRating(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <option value="3.5">3.5+</option>
                <option value="4.0">4.0+</option>
                <option value="4.3">4.3+</option>
                <option value="4.5">4.5+</option>
              </select>
            </label>

            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Price cap
              <select value={priceRange} onChange={event => setPriceRange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <option value="3500">Up to Rs 3,500</option>
                <option value="5000">Up to Rs 5,000</option>
                <option value="7000">Up to Rs 7,000</option>
                <option value="15000">Up to Rs 15,000</option>
              </select>
            </label>

            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Area
              <select value={area} onChange={event => setArea(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                {neighborhoods.map(item => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Amenity
              <select value={amenity} onChange={event => setAmenity(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                {amenities.map(item => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
                <div className="text-center">
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent mx-auto" />
                  <p className="text-sm font-bold text-slate-500">Searching for luxury stays in {destination}...</p>
                </div>
              </div>
            ) : filteredHotels.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-sm font-bold text-slate-500 italic">No hotels found matching these criteria in {destination}.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {featuredHotel && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <HotelCard hotel={featuredHotel} featured />
                  </motion.div>
                )}

                {restHotels.map((hotel, idx) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <HotelCard hotel={hotel} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <TravelCopilot destination={destination} hotels={filteredHotels} />
            <MustVisitSpots destination={destination} />
            <TrendChart risk={demandData} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  )
}
