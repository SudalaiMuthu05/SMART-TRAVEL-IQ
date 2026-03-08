import { useEffect, useState, useRef } from 'react'
import { BotMessageSquare, SendHorizontal, Sparkles, Loader2, User } from 'lucide-react'
import { fetchCopilotReply } from '../services/api'

const rotatingPrompts = [
  'Best area to stay in?',
  'Recommend a top hotel',
  'Give me a 1-day plan',
  'Is it safe for tourists?'
]

const ChatMessage = ({ m, onSend }) => {
  const formatText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-sky-500">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${m.role === 'user' ? 'bg-slate-800' : 'bg-gradient-to-br from-sky-400 to-sky-600'
        }`}>
        {m.role === 'user' ? <User size={16} className="text-white" /> : <BotMessageSquare size={16} className="text-white" />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm shadow-md border leading-relaxed ${m.role === 'user'
            ? 'bg-sky-600 text-white rounded-tr-none border-sky-500 shadow-sky-200 dark:shadow-none'
            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-tl-none border-slate-100 dark:border-slate-800'
          }`}>
          <div className="whitespace-pre-wrap">{formatText(m.text)}</div>
        </div>

        {m.suggestions && (
          <div className="flex flex-wrap gap-2 mt-1">
            {m.suggestions.map(s => (
              <button
                key={s}
                onClick={() => onSend(s)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase rounded-full transition-all border border-slate-200 dark:border-slate-800 hover:border-sky-400 transform hover:-translate-y-0.5 active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function TravelCopilot({ destination, hotels }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hello! I'm your **Travel Copilot**. \n\nAsk me about stay choice, area, or quick local planning for **${destination}**.`
    }
  ])
  const scrollRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % rotatingPrompts.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleAsk = async (forcedMessage = null) => {
    const msg = forcedMessage || input.trim()
    if (!msg || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const response = await fetchCopilotReply(msg, destination, hotels)
      setMessages(prev => [...prev, { role: 'ai', text: response.reply, suggestions: response.suggestions }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "I hit a snag while processing your request. Please try again!" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[520px] rounded-[2rem] border border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 ring-1 ring-sky-100 dark:ring-sky-900">
            <BotMessageSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                Travel Copilot
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/30 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-500 ring-1 ring-amber-200 dark:ring-amber-900">
                <Sparkles size={10} /> AI
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ready to Help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-hide">
        {messages.map((m, idx) => (
          <ChatMessage key={idx} m={m} onSend={handleAsk} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-[11px] font-black tracking-widest uppercase animate-pulse">
            <Loader2 size={12} className="animate-spin" />
            Analyzing {destination}...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => { e.preventDefault(); handleAsk(); }}
          className="relative flex items-center group"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask: ${rotatingPrompts[placeholderIndex]}`}
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-5 pr-14 py-4 text-sm font-medium focus:ring-2 focus:ring-sky-500 transition-all dark:text-slate-100 placeholder-slate-400 shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 bg-slate-800 dark:bg-sky-500 hover:bg-black dark:hover:bg-sky-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white w-10 h-10 rounded-xl transition-all shadow-lg active:scale-90 flex items-center justify-center z-10"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
          </button>
        </form>
      </div>
    </div>
  )
}
