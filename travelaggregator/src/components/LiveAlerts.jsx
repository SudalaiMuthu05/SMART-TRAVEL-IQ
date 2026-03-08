import { useEffect, useState } from 'react'
import { Bell, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LiveAlerts({ source, destination, date }) {
    const [alerts, setAlerts] = useState([])

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/alerts/${source}/${destination}/${date}`)

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setAlerts(prev => [data, ...prev].slice(0, 5))
        }

        ws.onerror = (err) => {
            console.error('WebSocket error:', err)
        }

        return () => ws.close()
    }, [source, destination, date])

    if (alerts.length === 0) return null

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 mb-2">
                <Bell size={16} className="text-orange-500 animate-bounce" />
                <h3 className="text-sm font-black uppercase tracking-widest italic">Live Travel Alerts</h3>
            </div>
            <AnimatePresence>
                {alerts.map((alert, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-2xl border flex gap-3 ${alert.type === 'warning'
                                ? 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50'
                                : 'bg-sky-50 border-sky-100 dark:bg-sky-950/20 dark:border-sky-900/50'
                            }`}
                    >
                        <div className={`p-2 rounded-xl h-fit ${alert.type === 'warning' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
                            }`}>
                            <ShieldAlert size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{alert.category || 'General'}</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alert.message}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
