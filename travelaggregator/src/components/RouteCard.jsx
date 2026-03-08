import { Bus, Clock3, IndianRupee, Train, Plane, Car } from 'lucide-react'

export default function RouteCard({ route, recommended, speedScore = 50, valueScore = 50 }) {
  const getIcon = (type) => {
    const t = type?.toLowerCase() || ''
    if (t.includes('train')) return Train
    if (t.includes('flight')) return Plane
    if (t.includes('cab')) return Car
    return Bus
  }

  const ModeIcon = getIcon(route.type)
  const isFlight = route.type?.toLowerCase().includes('flight')

  return (
    <div className={`rounded-2xl border transition-all duration-300 p-5 shadow-lg group hover:-translate-y-1 ${recommended
      ? 'border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-900/20'
      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${recommended ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            <ModeIcon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{route.type}</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{route.operator}</p>
          </div>
        </div>
        {recommended && (
          <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold text-white shadow-sm">RECOMMENDED</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-800 py-3 mb-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-tight">Departure</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{route.departure}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-tight">Arrival</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{route.arrival}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Clock3 size={14} className="text-skyPulse" />
          <span className="text-xs font-semibold">{route.duration}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <IndianRupee size={12} strokeWidth={3} />
          <span className="text-lg font-black tracking-tight">{route.price?.toLocaleString() || 'N/A'}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/50 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <span>Speed</span>
          <span>{speedScore}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-400 to-sky-600" style={{ width: `${speedScore}%` }} />
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
          <span>Value</span>
          <span>{valueScore}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${valueScore}%` }} />
        </div>
      </div>
    </div>
  )
}
