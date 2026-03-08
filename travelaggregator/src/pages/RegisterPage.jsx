import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, User, ArrowRight, ShieldCheck, Phone } from 'lucide-react'
import Navbar from '../components/Navbar'
import { register } from '../services/api'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await register(formData)
            navigate('/login')
        } catch (err) {
            const detail = err.response?.data?.detail
            if (Array.isArray(detail)) {
                setError(detail[0]?.msg || 'Validation error')
            } else if (typeof detail === 'string') {
                setError(detail)
            } else {
                setError('Registration failed. Email might already be taken or invalid data provided.')
            }
        } finally {
            setLoading(false)
        }
    }

    const onChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
            <Navbar />
            <main className="flex items-center justify-center px-4 py-24 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-1/3 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/3 -left-20 w-80 h-80 bg-sky-500/20 rounded-full blur-[120px]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-lg relative z-10"
                >
                    <div className="backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70 border border-white/40 dark:border-slate-800/40 rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                        <div className="text-center mb-10">
                            <motion.div
                                initial={{ rotate: 15, scale: 0.8 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-600 text-white shadow-lg shadow-emerald-500/30 mb-6"
                            >
                                <UserPlus size={32} />
                            </motion.div>
                            <h1 className="text-4xl font-black tracking-tighter mb-2">Join the Future</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Create your intelligent travel profile</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Full Name</label>
                                    <div className="group relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            name="full_name"
                                            required
                                            value={formData.full_name}
                                            onChange={onChange}
                                            className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/50 pl-14 pr-6 text-sm font-semibold outline-none focus:border-emerald-500 shadow-sm group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all font-sans"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Phone (Optional)</label>
                                    <div className="group relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={onChange}
                                            className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/50 pl-14 pr-6 text-sm font-semibold outline-none focus:border-emerald-500 shadow-sm group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all font-sans"
                                            placeholder="+1 234..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Account Email</label>
                                <div className="group relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={onChange}
                                        className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/50 pl-14 pr-6 text-sm font-semibold outline-none focus:border-emerald-500 shadow-sm group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all font-sans"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Secure Password</label>
                                <div className="group relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={onChange}
                                        className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/50 pl-14 pr-6 text-sm font-semibold outline-none focus:border-emerald-500 shadow-sm group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all font-sans"
                                        placeholder="Min. 8 characters"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full h-16 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? 'Creating Profile...' : 'Begin Your Journey'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="font-black text-emerald-600 dark:text-emerald-400 hover:nx-underline ml-1 uppercase tracking-tight">LOG IN HERE</Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption Protected</span>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
