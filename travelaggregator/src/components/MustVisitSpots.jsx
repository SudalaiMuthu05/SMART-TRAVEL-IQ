import { Camera, MapPin } from 'lucide-react'

const spotsByCity = {
  Delhi: [
    {
      name: 'India Gate',
      blurb: 'Evening lighting and food street vibes.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Humayun Tomb',
      blurb: 'Mughal architecture and gardens.',
      image: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Lodhi Art District',
      blurb: 'Open-air mural walk.',
      image: 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?auto=format&fit=crop&w=900&q=80'
    }
  ],
  Mumbai: [
    {
      name: 'Gateway of India',
      blurb: 'Iconic waterfront landmark.',
      image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Marine Drive',
      blurb: 'Sunset promenade and skyline.',
      image: 'https://images.unsplash.com/photo-1614094082869-cd4e4b2905c7?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Colaba Causeway',
      blurb: 'Street shopping and cafes.',
      image: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=900&q=80'
    }
  ]
}

export default function MustVisitSpots({ destination }) {
  const spots = spotsByCity[destination] || [
    {
      name: 'City Museum',
      blurb: 'Local culture and history highlights.',
      image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Central Market',
      blurb: 'Food and street shopping.',
      image: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Riverfront Walk',
      blurb: 'Evening views and cafes.',
      image: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=900&q=80'
    }
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
        <Camera size={16} className="text-skyPulse" /> Must-Visit Spots in {destination}
      </h3>

      <div className="mt-4 space-y-3">
        {spots.map(spot => (
          <div key={spot.name} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <img src={spot.image} alt={spot.name} className="h-20 w-full object-cover" loading="lazy" />
            <div className="p-3">
              <p className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-100">
                <MapPin size={13} /> {spot.name}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{spot.blurb}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name} ${destination}`)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs font-semibold text-sky-600"
              >
                View on Map &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
