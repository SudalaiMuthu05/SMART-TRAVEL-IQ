import { useMemo, useState } from 'react'
import { Bot, Sparkles } from 'lucide-react'

export default function InsightAssistant({ source, destination, date, routes, weather, risk, hotels }) {
  const [note, setNote] = useState('')

  const generatedSummary = useMemo(() => {
    const bestRoute = routes?.[0]
    const topHotel = hotels?.[0]
    const advisory = weather?.advisory || 'No major weather warning detected.'
    const riskLevel = risk?.level || 'Moderate Risk'

    return [
      `${source} to ${destination} on ${date}.`,
      bestRoute ? `Best route: ${bestRoute.type} by ${bestRoute.operator}, ${bestRoute.duration}, around Rs ${bestRoute.price}.` : null,
      `Weather note: ${advisory}`,
      `Travel risk: ${risk?.score || 0}/10 (${riskLevel}).`,
      topHotel ? `Suggested stay: ${topHotel.name} at Rs ${topHotel.price}/night.` : null,
      note ? `Extra note summary: ${note.slice(0, 120)}.` : null
    ]
      .filter(Boolean)
      .join(' ')
  }, [source, destination, date, routes, weather, risk, hotels, note])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
        <Bot size={17} className="text-skyPulse" />
        <h3 className="text-sm font-semibold md:text-base">Travel Summary Assistant</h3>
      </div>

      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Purpose: quick briefing to help you decide route + timing + stay in one glance.</p>

      <textarea
        value={note}
        onChange={event => setNote(event.target.value)}
        placeholder="Optional: add custom travel notes to include in summary"
        className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none focus:border-skyPulse dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
      />

      <div className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Sparkles size={13} /> Auto Summary
        </p>
        <p>{generatedSummary}</p>
      </div>
    </div>
  )
}
