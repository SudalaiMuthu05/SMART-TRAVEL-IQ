import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import { login } from '../services/api'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            const detail = err.response?.data?.detail
            setError(typeof detail === 'string' ? detail : 'Invalid email or password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
            <Navbar />
            <main className="flex items-center justify-center px-4 py-24 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[120px]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70 border border-white/40 dark:border-slate-800/40 rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                        <div className="text-center mb-10">
                            <motion.div
                                initial={{ rotate: -15, scale: 0.8 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 mb-6"
                            >
                                <LogIn size={32} />
                            </motion.div>
                            <h1 className="text-4xl font-black tracking-tighter mb-2">Welcome Back</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Access your intelligent travel insights</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-3"
                            >
                                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Account Email</label>
                                <div className="group relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/50 pl-14 pr-6 text-sm font-semibold outline-none focus:border-sky-500 shadow-sm group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Secure Password</label>
                                    <button type="button" className="text-[10px] font-bold text-sky-600 hover:text-sky-500 tracking-wider transition-colors">FORGOT?</button>
                                </div>
                                <div className="group relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/50 pl-14 pr-6 text-sm font-semibold outline-none focus:border-sky-500 shadow-sm group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full h-16 bg-slate-900 dark:bg-sky-600 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-sky-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? 'Authenticating...' : 'Sign In Now'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                New to Smart Travel IQ?{' '}
                                <Link to="/register" className="font-black text-sky-600 dark:text-sky-400 hover:nx-underline ml-1">CREATE ACCOUNT</Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Enterprise-grade Security Enabled</span>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
