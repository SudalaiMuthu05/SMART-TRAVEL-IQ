import { motion } from 'framer-motion'
import { Doughnut } from 'react-chartjs-2'
import { AlertTriangle } from 'lucide-react'
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from 'chart.js'
import { useEffect, useState } from 'react'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function RiskMeter({ risk, loading }) {
  const score = Number(risk.score) || 0
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (loading) {
      setDisplayScore(0)
      return
    }

    let current = 0
    const interval = setInterval(() => {
      current += 1
      setDisplayScore(Math.min(current, score))
      if (current >= score) {
        clearInterval(interval)
      }
    }, 120)

    return () => clearInterval(interval)
  }, [score, loading])

  const doughnutData = {
    labels: ['Risk', 'Remaining'],
    datasets: [
      {
        data: [score, Math.max(10 - score, 0)],
        backgroundColor: [score <= 3 ? '#10b981' : score <= 7 ? '#f59e0b' : '#ef4444', '#e2e8f0'],
        borderWidth: 0,
        cutout: '72%'
      }
    ]
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg transition hover:-translate-y-0.5 hover:border-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-900">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Travel Risk Meter</h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <p className="text-slate-600 dark:text-slate-400">Analyzing travel risks...</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-4">
          <div className="w-48">
            <Doughnut data={doughnutData} options={{ plugins: { legend: { display: false } }, animation: { duration: 1300 } }} />
          </div>
          <div className="mt-6 text-center">
            <p className="text-4xl font-black tracking-tighter text-slate-800 dark:text-slate-100">
              {displayScore} <span className="text-base font-medium opacity-40">/ 10</span>
            </p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{risk.level || 'Moderate Risk'}</p>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {(risk.recommendations && risk.recommendations.length > 0 ? risk.recommendations : ['Book early to avoid high demand fares']).slice(0, 2).map((rec, idx) => (
          <div key={idx} className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <span>{rec}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
