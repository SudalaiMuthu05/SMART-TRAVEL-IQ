import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import { TrendingUp, Calendar } from 'lucide-react'
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Title,
    Tooltip
} from 'chart.js'
import { useMemo } from 'react'

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler, Title)

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const todayLinePlugin = {
    id: 'todayLinePlugin',
    afterDatasetsDraw(chart, args, pluginOptions) {
        const { todayIndex } = pluginOptions || {}
        if (todayIndex === undefined || todayIndex < 0) return

        const xScale = chart.scales.x
        const yScale = chart.scales.y
        const x = xScale.getPixelForValue(todayIndex)

        const ctx = chart.ctx
        ctx.save()
        ctx.setLineDash([5, 5])
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x, yScale.top)
        ctx.lineTo(x, yScale.bottom)
        ctx.stroke()
        ctx.restore()
    }
}

export default function TrendChart({ risk, loading }) {
    const todayIndex = useMemo(() => {
        const jsDay = new Date().getDay()
        return (jsDay + 6) % 7
    }, [])

    if (loading) return (
        <div className="h-[400px] w-full animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-900/50" />
    )

    const demand = risk?.demand || [48, 56, 63, 58, 71, 76, 68]
    const todayPoint = dayLabels.map((_, idx) => (idx === todayIndex ? demand[idx] : null))

    const trendData = {
        labels: dayLabels,
        datasets: [
            {
                label: 'Demand Index',
                data: demand,
                borderColor: '#0ea5e9',
                borderWidth: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0ea5e9',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#0ea5e9',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3,
                tension: 0.4,
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
                    gradient.addColorStop(0, 'rgba(14, 165, 233, 0.3)')
                    gradient.addColorStop(1, 'rgba(14, 165, 233, 0)')
                    return gradient
                },
            },
            {
                label: 'Today',
                data: todayPoint,
                borderWidth: 0,
                pointBackgroundColor: '#f59e0b',
                pointRadius: 8,
                pointHoverRadius: 10,
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                showLine: false,
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { size: 13, weight: 'bold', family: 'Inter' },
                bodyFont: { size: 12, family: 'Inter' },
                padding: 12,
                cornerRadius: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => `Demand Index: ${context.raw}`
                }
            },
            todayLinePlugin: { todayIndex }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10, weight: '700', family: 'Inter' },
                    padding: 12
                }
            },
            y: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.08)',
                    drawBorder: false,
                    borderDash: [5, 5]
                },
                min: 0,
                max: 100,
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10, weight: '600', family: 'Inter' },
                    stepSize: 20,
                    padding: 15 // Increased padding to prevent overlap with title
                },
                title: {
                    display: true,
                    text: 'DEMAND INDEX',
                    color: '#64748b',
                    font: { size: 9, weight: '800', family: 'Inter' },
                    padding: { bottom: 10 }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        animation: {
            duration: 2000,
            easing: 'easeOutQuart'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group relative h-[480px] overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        >
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={14} className="text-sky-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Projected Insights</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter leading-none">Weekly Demand</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-800 shadow-inner">
                    <Calendar size={22} />
                </div>
            </div>

            <div className="relative h-[240px] w-full">
                <Line data={trendData} options={options} plugins={[todayLinePlugin]} />
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Market Status</p>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">Optimal Window</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Booking AI</p>
                    <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase">Lock Rate Now</p>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sky-500/5 blur-3xl group-hover:bg-sky-500/10 transition-colors" />
        </motion.div>
    )
}
