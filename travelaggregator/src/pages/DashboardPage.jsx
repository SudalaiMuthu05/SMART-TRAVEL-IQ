import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Target, Coins, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import RouteCard from '../components/RouteCard'
import WeatherCard from '../components/WeatherCard'
import RiskMeter from '../components/RiskMeter'
import MapView from '../components/MapView'
import InsightAssistant from '../components/InsightAssistant'
import TravelCopilot from '../components/TravelCopilot'
import LiveAlerts from '../components/LiveAlerts'
import { fetchDashboard, saveItinerary } from '../services/api'

function mapBackendRoute(route, type) {
  if (!route) return null
  return {
    id: route.id,
    type: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
    operator: route.operator_name || 'Commercial',
    departure: route.departure_time,
    arrival: route.arrival_time,
    price: route.total_fare,
    duration: `${Math.floor(route.duration_minutes / 60)}h ${route.duration_minutes % 60}m`
  }
}

export default function DashboardPage() {
  const { state } = useLocation()
  const source = state?.source || 'Mumbai'
  const destination = state?.destination || 'Delhi'
  const date = state?.date || new Date().toISOString().slice(0, 10)
  const travelersStr = state?.travelers || '1'
  const travelers = useMemo(() => {
    if (travelersStr.includes('-')) {
      return parseInt(travelersStr.split('-')[1]) || 1
    }
    return parseInt(travelersStr) || 1
  }, [travelersStr])

  const mode = state?.mode || null
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Persist destination for other pages (like Hotels)
    if (destination) {
      localStorage.setItem('last_destination', destination)
    }

    const load = async () => {
      setLoading(true)
      try {
        const dashboardData = await fetchDashboard(source, destination, date, travelers, mode)
        setData(dashboardData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [source, destination, date, travelers, mode])

  const handleSaveItinerary = async () => {
    try {
      const token = localStorage.getItem('travel_token')
      if (!token) {
        alert('Please login to save your itinerary.')
        return
      }

      const payload = {
        source_city: source,
        destination_city: destination,
        travel_date: date,
        num_travelers: travelers,
        title: `${source} to ${destination} - ${new Date(date).toLocaleDateString()}`,
        notes: "Saved from Intelligence Dashboard"
      }

      await saveItinerary(payload)
      alert('Itinerary saved successfully!')
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save itinerary. Make sure you are logged in.')
    }
  }

  const allRoutes = useMemo(() => {
    if (!data?.routes) return []
    const r = []
    const rb = data.routes
    rb.bus_options?.forEach(opt => r.push(mapBackendRoute(opt, 'bus')))
    rb.train_options?.forEach(opt => r.push(mapBackendRoute(opt, 'train')))
    rb.flight_options?.forEach(opt => r.push(mapBackendRoute(opt, 'flight')))
    rb.cab_options?.forEach(opt => r.push(mapBackendRoute(opt, 'cab')))

    if (mode) {
      const pref = mode.toLowerCase()
      return r.sort((a, b) => {
        const aIsPref = (a.type.toLowerCase().includes('train') && pref.includes('train')) ||
          (a.type.toLowerCase().includes('bus') && pref.includes('bus')) ||
          (a.type.toLowerCase().includes('flight') && pref.includes('flight'))
        const bIsPref = (b.type.toLowerCase().includes('train') && pref.includes('train')) ||
          (b.type.toLowerCase().includes('bus') && pref.includes('bus')) ||
          (b.type.toLowerCase().includes('flight') && pref.includes('flight'))
        if (aIsPref && !bIsPref) return -1
        if (!aIsPref && bIsPref) return 1
        return 0
      })
    }
    return r
  }, [data, mode])

  const efficientOptions = useMemo(() => {
    if (!data?.efficient_routes?.overall) return null
    const e = data.efficient_routes.overall
    return {
      cheapest: mapBackendRoute(e.cheapest_option, e.cheapest_option?.transport_mode || 'Travel'),
      fastest: mapBackendRoute(e.fastest_option, e.fastest_option?.transport_mode || 'Travel')
    }
  }, [data])

  const availability = useMemo(() => {
    if (!data?.routes) return { flight: false, train: false, bus: false }
    return {
      flight: (data.routes.flight_options || []).length > 0,
      train: (data.routes.train_options || []).length > 0,
      bus: (data.routes.bus_options || []).length > 0
    }
  }, [data])

  const weather = useMemo(() => {
    if (!data?.weather_destination) return { temperature: 0, rainProbability: 0, advisory: '' }
    const wd = data.weather_destination
    return {
      temperature: wd.temperature_max,
      rainProbability: wd.rain_probability,
      advisory: wd.travel_advice
    }
  }, [data])

  const risk = useMemo(() => {
    if (!data?.risk) return { score: 0, level: '', recommendations: [] }
    return {
      score: data.risk.overall_risk_score,
      level: data.risk.risk_level.toUpperCase(),
      recommendations: data.risk.recommendations
    }
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center dark:bg-slate-950">
        <div className="text-center space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-600 dark:text-slate-400 font-bold animate-pulse">Running Intelligent Travel Analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">

        {/* Header Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-sky-100 bg-white/80 backdrop-blur-md p-6 shadow-xl dark:border-sky-900/30 dark:bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={16} className="text-skyPulse" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Intelligent Trip Dossier</p>
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {source} <span className="text-skyPulse">&rarr;</span> {destination}
            </h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{new Date(date).toDateString()} | {travelers} Traveler</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 px-4 py-2 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-emerald-600 uppercase">Risk Level</p>
              <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">{risk.level}</p>
            </div>
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900 px-4 py-2 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-sky-600 uppercase">Weather</p>
              <p className="text-sm font-black text-sky-700 dark:text-sky-300">{weather.temperature}°C</p>
            </div>
          </div>
        </motion.div>

        {/* Efficiency Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-xl">
                <Coins size={24} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-xs opacity-90">Cheapest Option</h3>
            </div>
            {efficientOptions?.cheapest ? (
              <div className="space-y-1">
                <p className="text-4xl font-black tracking-tighter italic">Rs. {efficientOptions.cheapest.price?.toLocaleString()}</p>
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/20">
                  <span className="text-xs font-black uppercase bg-white/20 px-2 py-1 rounded-lg">{efficientOptions.cheapest.type}</span>
                  <span className="text-sm font-semibold opacity-80">{efficientOptions.cheapest.duration}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm opacity-60">Calculating best fare...</p>
            )}
          </div>

          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-500/30 transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-xl">
                <Zap size={24} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-xs opacity-90">Fastest Option</h3>
            </div>
            {efficientOptions?.fastest ? (
              <div className="space-y-1">
                <p className="text-4xl font-black tracking-tighter italic">{efficientOptions.fastest.duration}</p>
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/20">
                  <span className="text-xs font-black uppercase bg-white/20 px-2 py-1 rounded-lg">{efficientOptions.fastest.type}</span>
                  <span className="text-sm font-semibold opacity-80">Rs. {efficientOptions.fastest.price?.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm opacity-60">Analyzing speed...</p>
            )}
          </div>
        </div>


        {/* Intelligence Layer: Map & Hotels */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Regional Intelligence Map</h3>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">Source: {source}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-sky-500 uppercase tracking-widest bg-sky-50 dark:bg-sky-950 px-2 py-1 rounded-lg">Dest: {destination}</span>
                </div>
              </div>
              <div className="flex-1 min-h-[400px] rounded-2xl overflow-hidden relative border border-slate-100 dark:border-slate-800 shadow-inner">
                <MapView source={source} destination={destination} hotels={data?.hotels || []} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Hotel Spotlights</h3>
              <Link
                to="/hotels"
                state={{
                  destination,
                  hotels: (data?.hotels || []).map(h => ({
                    id: h.id,
                    name: h.name,
                    rating: h.google_rating,
                    reviews: h.total_reviews,
                    price: h.avg_price_per_night,
                    availability: 'Available',
                    location: h.address || h.city,
                    distance: 'Central Location',
                    amenities: h.amenities,
                    image: h.image_urls?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                    badge: h.google_rating > 4.5 ? 'Top Rated' : h.avg_price_per_night < 2000 ? 'Budget Friendly' : 'Best Value'
                  }))
                }}
                className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 border border-sky-100 dark:border-sky-900 text-sky-600 transition hover:scale-110 active:scale-95 shadow-sm"
              >
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="space-y-4 flex-1">
              {(data?.hotels || []).slice(0, 4).map((hotel, idx) => (
                <motion.div
                  key={hotel.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className="group relative flex gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
                    {hotel.image_urls?.[0] ? (
                      <img src={hotel.image_urls[0]} alt={hotel.name} className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={`https://images.unsplash.com/photo-${[
                          '1566073771259-6a8506099945', // Grand Hotel
                          '1571003123894-1f0594d2b5d9', // Modern Resort
                          '1520250497591-112f2f40a3f4', // Boutique Bed
                          '1445019980597-93fa8acb246c', // Modern Lobby
                          '1542314831-068cd1dbfeeb', // Classic Exterior
                          '1590490360182-c33d57733427', // Luxury Suite
                          '1582719478250-c89cae4dc85b', // Tropical resort
                          '1571896349842-33c89424de2d', // Pool Side
                          '1564501049412-61c2a3083791', // Spa Hotel
                          '1596394516093-501ba68a0ba6'  // Mountain View
                        ][idx % 10]}?auto=format&fit=crop&w=400&q=80`}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-600 transition-colors">{hotel.name}</h4>
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-400 group-hover:text-slate-500">
                      <MapPin size={10} />
                      <span className="truncate">{hotel.address || hotel.city}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-600 text-[10px] font-black tracking-tight flex items-center gap-0.5">
                          ⭐ {hotel.google_rating}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-500 transition-colors uppercase">Rs. {hotel.avg_price_per_night?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tighter">
                Available Routes <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-lg">{allRoutes.length}</span>
              </h2>
              <div className="flex gap-2">
                {['Flight', 'Train', 'Bus'].map(m => {
                  const isAvail = availability[m.toLowerCase()]
                  return (
                    <div
                      key={m}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${isAvail
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 opacity-60'
                        }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isAvail ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      {m}: {isAvail ? 'Available' : 'Unavailable'}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {allRoutes.length === 0 ? (
                <div className="col-span-2 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500">No direct routes found for this corridor on the selected date.</p>
                </div>
              ) : (
                allRoutes.map((route, idx) => (
                  <motion.div
                    key={`${route.type}-${route.id}-${idx}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <RouteCard
                      route={route}
                      recommended={
                        (route.id === efficientOptions?.cheapest?.id && route.type === efficientOptions?.cheapest?.type) ||
                        (route.id === efficientOptions?.fastest?.id && route.type === efficientOptions?.fastest?.type)
                      }
                      speedScore={route.id === efficientOptions?.fastest?.id ? 95 : 70}
                      valueScore={route.id === efficientOptions?.cheapest?.id ? 95 : 80}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <LiveAlerts source={source} destination={destination} date={date} />
            <InsightAssistant
              source={source}
              destination={destination}
              date={date}
              routes={allRoutes}
              weather={weather}
              risk={risk}
              hotels={data?.hotels}
            />
            <TravelCopilot destination={destination} hotels={data?.hotels} />
            <WeatherCard weather={weather} />
            <RiskMeter risk={risk} loading={false} />
            <div className="pt-4">
              <button
                onClick={handleSaveItinerary}
                className="w-full py-4 bg-slate-900 dark:bg-sky-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 shadow-xl shadow-slate-900/10 dark:shadow-sky-600/20 active:scale-[0.98] transition-all"
              >
                Save Itinerary
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

