import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, CloudRain, ShieldCheck, TicketPercent, TrainFront } from 'lucide-react'
import Navbar from '../components/Navbar'
import SearchForm from '../components/SearchForm'
import { fetchRoutes } from '../services/api'

const cities = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Goa',
  'Lucknow', 'Indore', 'Nagpur', 'Coimbatore', 'Vadodara', 'Bhopal', 'Surat', 'Patna', 'Visakhapatnam', 'Kanpur',
  'Nashik', 'Kochi', 'Mysuru', 'Mangaluru', 'Thiruvananthapuram', 'Madurai', 'Vijayawada', 'Rajkot', 'Amritsar',
  'Varanasi', 'Prayagraj', 'Ranchi', 'Jodhpur', 'Udaipur', 'Chandigarh', 'Guwahati', 'Bhubaneswar', 'Agra', 'Dehradun'
]

const corridors = [
  { label: 'Mumbai -> Goa', source: 'Mumbai', destination: 'Goa' },
  { label: 'Delhi -> Jaipur', source: 'Delhi', destination: 'Jaipur' },
  { label: 'Bengaluru -> Chennai', source: 'Bengaluru', destination: 'Chennai' },
  { label: 'Hyderabad -> Pune', source: 'Hyderabad', destination: 'Pune' },
  { label: 'Kolkata -> Bhubaneswar', source: 'Kolkata', destination: 'Bhubaneswar' }
]

const insightCards = [
  {
    icon: CloudRain,
    title: 'Weather-aware routing',
    text: 'Delay-prone weather windows are automatically flagged in your route analysis.'
  },
  {
    icon: ShieldCheck,
    title: 'Risk scoring',
    text: 'Demand pressure, holidays, and reliability are combined into one score.',
    linkText: 'Learn more'
  },
  {
    icon: BarChart3,
    title: 'Demand analytics',
    text: 'Weekly trend projections help you avoid peak-time routes.',
    linkText: 'Learn more'
  },
  {
    icon: TrainFront,
    title: 'Mode optimization',
    text: 'Train vs bus tradeoff insights based on time, comfort, and budget.',
    linkText: 'Learn more'
  }
]

export default function SearchPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [lastCorridor, setLastCorridor] = useState('')
  const [form, setForm] = useState({
    source: 'Mumbai',
    destination: 'Delhi',
    date: new Date().toISOString().slice(0, 10),
    budget: 'Economy',
    mode: 'Any',
    travelers: '1-2'
  })

  const cityOptions = useMemo(() => cities.map(city => ({ value: city, label: city })), [])

  const quickDates = useMemo(() => {
    const today = new Date()
    return [0, 1, 3, 7].map(offset => {
      const date = new Date(today)
      date.setDate(today.getDate() + offset)
      return {
        label: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : `+${offset} days`,
        value: date.toISOString().slice(0, 10)
      }
    })
  }, [])

  const isValid = Boolean(form.source && form.destination && form.date && form.source !== form.destination)
  const validationMessage =
    form.source === form.destination
      ? 'Source and destination should be different.'
      : 'Complete source, destination, and date to analyze.'

  const onChange = event => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const onQuickDateSelect = value => setForm(prev => ({ ...prev, date: value }))

  const onCorridorSelect = corridor => {
    setForm(prev => ({ ...prev, source: corridor.source, destination: corridor.destination }))
    setLastCorridor(corridor.label)
  }

  const onSubmit = async event => {
    event.preventDefault()
    if (!isValid) {
      return
    }
    if (form.destination) {
      localStorage.setItem('last_destination', form.destination)
    }
    navigate('/dashboard', { state: { ...form } })
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Search / Trip Intelligence</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">Plan Your Route</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Choose cities and date, then run a complete travel analysis.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-4 lg:col-span-2"
          >
            <SearchForm
              form={form}
              onChange={onChange}
              onSubmit={onSubmit}
              loading={loading}
              cityOptions={cityOptions}
              quickDates={quickDates}
              onQuickDateSelect={onQuickDateSelect}
              onCorridorSelect={onCorridorSelect}
              corridors={corridors}
              isValid={isValid}
              lastCorridor={lastCorridor}
              validationMessage={validationMessage}
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sample Analysis Preview</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-slate-100 p-3 transition-all duration-200 hover:bg-slate-200 hover:shadow-md hover:scale-105 dark:bg-slate-800 dark:hover:bg-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Best route</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {form.source} to {form.destination}
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full w-2/3 rounded-full bg-skyPulse" />
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 transition-all duration-200 hover:bg-slate-200 hover:shadow-md hover:scale-105 dark:bg-slate-800 dark:hover:bg-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Weather confidence</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Live advisory ready</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full w-3/4 rounded-full bg-emerald-500" />
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 transition-all duration-200 hover:bg-slate-200 hover:shadow-md hover:scale-105 dark:bg-slate-800 dark:hover:bg-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Demand insight</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Weekly trend forecast</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full w-1/2 rounded-full bg-amber-500" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              What You Will Get In Your Report
            </p>
            {insightCards.map((card, idx) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-sky-200 hover:shadow-2xl hover:scale-105 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-900"
                >
                  <Icon size={18} className="text-skyPulse transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-800 transition-colors group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-300">{card.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">{card.text}</p>
                  <button type="button" className="mt-2 text-xs font-semibold text-sky-600 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1">
                    {card.linkText || 'Learn more'} &rarr;
                  </button>
                </motion.div>
              )
            })}

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-md dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/50">
              <p className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide">
                <TicketPercent size={13} className="transition-transform duration-200 hover:scale-110" /> Offer
              </p>
              <p className="mt-1">Up to 12% savings on selected weekday departures.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
