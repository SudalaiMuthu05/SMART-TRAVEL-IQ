import { CloudRain, Thermometer } from 'lucide-react'

export default function WeatherCard({ weather }) {
  if (!weather || (weather.temperature === 0 && !weather.advisory)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg animate-pulse dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500">Loading weather data...</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100 md:text-base">Weather Insights</h3>
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
        <p className="flex items-center gap-2">
          <Thermometer size={16} className="text-skyPulse" /> Temperature: <strong>{weather.temperature}C</strong>
        </p>
        <p className="flex items-center gap-2">
          <CloudRain size={16} className="text-blue-500" /> Rain Probability: <strong>{weather.rainProbability}%</strong>
        </p>
        <p className="rounded-xl bg-amber-100 px-3 py-2 text-amber-800 dark:bg-amber-200">{weather.advisory}</p>
      </div>
    </div>
  )
}
