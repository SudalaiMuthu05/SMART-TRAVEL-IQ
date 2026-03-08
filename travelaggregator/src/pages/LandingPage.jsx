import { motion } from 'framer-motion'
import { ArrowRight, BrainCircuit, CloudSun, Hotel, MapPinned, Route, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const features = [
  {
    icon: Route,
    title: 'Route Intelligence',
    text: 'Compare intercity bus/train options by price, time, and comfort in one panel.',
    stat: '50+ route options compared in seconds',
    detail: 'Operator reliability and travel duration normalization included.'
  },
  {
    icon: CloudSun,
    title: 'Weather Awareness',
    text: 'Predict weather disruption windows before confirming tickets.',
    stat: 'Rain and delay advisory for each city',
    detail: 'Highlights weather risk periods across your travel day.'
  },
  {
    icon: BrainCircuit,
    title: 'Risk Analysis',
    text: 'Identify high-demand periods and holiday surge risks automatically.',
    stat: 'Trip risk score from 0 to 10',
    detail: 'Includes festival impact and demand trend projection.'
  },
  {
    icon: Hotel,
    title: 'Smart Hotel Picks',
    text: 'Find context-aware stays near transport hubs and must-visit spots.',
    stat: 'Top stays with amenities and distance filters',
    detail: 'Recommends options based on route timing and arrival context.'
  }
]

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.15 }}
      className="relative overflow-hidden rounded-3xl border border-amber-200 bg-[#fffaf5] p-5 shadow-xl"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-md lg:col-span-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700">Live Route Preview</p>
          <div className="relative h-52 overflow-hidden rounded-xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100">
            <svg viewBox="0 0 500 220" className="absolute inset-0 h-full w-full">
              <path d="M45 165 C145 40, 330 220, 445 65" stroke="#f97316" strokeWidth="4" strokeDasharray="8 8" fill="none" />
              <circle cx="45" cy="165" r="10" fill="#1f2937" />
              <circle cx="445" cy="65" r="10" fill="#1f2937" />
            </svg>
            <motion.div
              initial={{ left: '8%', top: '72%' }}
              animate={{ left: ['8%', '36%', '62%', '84%'], top: ['72%', '39%', '61%', '26%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute rounded-full bg-white p-2 shadow"
            >
              <Ticket size={16} className="text-orange-600" />
            </motion.div>
            <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">Mumbai</div>
            <div className="absolute bottom-4 right-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">Delhi</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-white p-4 shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">How It Works</p>
            <div className="mt-2 space-y-2 text-xs text-slate-700">
              <p>1. Select source, destination, and date.</p>
              <p>2. Review route, weather, and risk insights.</p>
              <p>3. Pick stays and nearby places confidently.</p>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=900&q=80"
            alt="Travel destination aerial visual"
            className="h-32 w-full rounded-2xl object-cover shadow-md"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fcf7f1] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="grid-bg">
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-12 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5"
          >
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              <MapPinned size={13} /> Built for Smart Intercity Travel
            </p>
            <h1 className="hero-display text-4xl leading-tight md:text-6xl">
              Smart Travel Intelligence Platform
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-700 dark:text-slate-300 md:text-lg">
              Plan smarter trips with AI-powered travel insights across routes, weather, demand risk, and accommodation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-red-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                Plan Your Journey
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          <div className="lg:col-span-7">
            <HeroVisual />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
          <h2 className="mb-6 hero-display text-3xl">Features That Actually Help You Decide</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="group rounded-2xl border border-amber-200 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
                >
                  <Icon size={20} className="text-orange-600" />
                  <h3 className="mt-3 text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{feature.text}</p>
                  <p className="mt-3 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-slate-800 dark:text-amber-300">
                    {feature.stat}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 opacity-0 transition group-hover:opacity-100 dark:text-slate-400">
                    {feature.detail}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
          <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 md:flex md:items-center md:justify-between">
            <div>
              <h3 className="hero-display text-2xl">Ready to plan a reliable trip?</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Explore routes, compare risks, and confirm stays with one connected workflow.
              </p>
            </div>
            <div className="mt-4 flex gap-3 md:mt-0">
              <Link
                to="/search"
                className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white"
              >
                Explore Routes
              </Link>
              <Link
                to="/hotels"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                View Destinations
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
