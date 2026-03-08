import { useMemo, useState } from 'react'
import { IndianRupee, MapPin, Star } from 'lucide-react'

const fallbackImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'

const badgeStyles = {
  'Best Value': 'bg-emerald-100 text-emerald-700',
  'Closest to Station': 'bg-blue-100 text-blue-700',
  'Top Rated': 'bg-violet-100 text-violet-700',
  'Business Pick': 'bg-cyan-100 text-cyan-700',
  'Budget Friendly': 'bg-amber-100 text-amber-700',
  'Luxury Pick': 'bg-rose-100 text-rose-700'
}

export default function HotelCard({ hotel, featured = false }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const estTotal = useMemo(() => {
    const nights = 2
    return (Number(hotel.price) || 0) * nights
  }, [hotel.price])

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900 ${featured ? 'sm:col-span-2' : ''
        }`}
    >
      <div className={`relative overflow-hidden ${featured ? 'h-52' : 'h-44'}`}>
        {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />}
        <img
          src={hotel.image || fallbackImage}
          alt={hotel.name}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = fallbackImage
            setImageLoaded(true)
          }}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        {hotel.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[hotel.badge] || 'bg-slate-100 text-slate-700'}`}
          >
            {hotel.badge}
          </span>
        )}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{hotel.name}</h3>
        <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <MapPin size={13} /> {hotel.location || 'Prime city center'}
        </p>
        <p className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
          <Star size={14} fill="currentColor" /> {hotel.rating} ({hotel.reviews || 280} reviews)
        </p>
        <p className="flex items-center gap-1 text-base font-bold text-emerald-700 dark:text-emerald-400">
          <IndianRupee size={16} /> {hotel.price} / night
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Est. Rs {estTotal.toLocaleString('en-IN')} for 2 nights | {hotel.taxesNote || 'Taxes extra'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{hotel.availability}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{hotel.distance || '1.2 km from transit hub'}</p>
        <div className="flex flex-wrap gap-1 pt-1">
          {(hotel.amenities || ['Wifi', 'Breakfast', 'AC']).slice(0, 4).map(item => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
