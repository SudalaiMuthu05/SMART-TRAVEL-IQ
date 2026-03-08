import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'

const cityCoords = {
  Mumbai: [19.076, 72.8777],
  Delhi: [28.6139, 77.209],
  Bengaluru: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Hyderabad: [17.385, 78.4867],
  Pune: [18.5204, 73.8567],
  Jaipur: [26.9124, 75.7873]
}

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

export default function MapView({ source, destination, hotels = [] }) {
  const from = cityCoords[source] || [20.5937, 78.9629]
  const to = cityCoords[destination] || [28.6139, 77.209]
  const routePositions = useMemo(() => [from, to], [from, to])

  function RouteViewport() {
    const map = useMap()

    useEffect(() => {
      map.flyTo([22.7, 79.2], 4, { duration: 0.6 })
      const timer = setTimeout(() => {
        map.fitBounds(routePositions, { padding: [45, 45], animate: true, duration: 1.2 })
      }, 650)

      return () => clearTimeout(timer)
    }, [map, routePositions])

    return null
  }

  return (
    <div className="h-[430px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <MapContainer center={from} zoom={5} scrollWheelZoom className="h-full w-full">
        <RouteViewport />
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={from} icon={icon}>
          <Popup>Source: {source || 'Selected Source'}</Popup>
        </Marker>

        <Marker position={to} icon={icon}>
          <Popup>Destination: {destination || 'Selected Destination'}</Popup>
        </Marker>

        <Polyline positions={routePositions} color="#0ea5e9" weight={4} className="route-flow-line" />

        {hotels.slice(0, 3).map((hotel, idx) => (
          <Marker key={hotel.id || idx} position={[to[0] + idx * 0.07, to[1] + idx * 0.05]} icon={icon}>
            <Popup>{hotel.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
