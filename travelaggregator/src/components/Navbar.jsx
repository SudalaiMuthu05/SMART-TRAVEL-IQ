import { Home, Hotel, LayoutDashboard, Moon, Search, Sun, User, LogOut } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getMe } from '../services/api'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/hotels', label: 'Hotels', icon: Hotel }
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const preferredTheme = localStorage.getItem('travel_theme')
    const useDark = preferredTheme === 'dark'
    setIsDark(useDark)
    document.documentElement.classList.toggle('dark', useDark)

    const checkUser = async () => {
      const u = await getMe()
      setUser(u)
    }
    checkUser()
  }, [pathname])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('travel_theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  const handleLogout = () => {
    localStorage.removeItem('travel_token')
    setUser(null)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-amber-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-950/75">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100 md:text-base">
          <img src="/logo.png" alt="Smart Travel IQ" className="h-8 w-8 rounded-lg" />
          Smart Travel IQ
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:flex">
            {navItems.map(item => {
              const Icon = item.icon
              const active = pathname === item.to

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition md:text-sm ${active
                    ? 'bg-slateBlue text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden flex-col items-end sm:flex">
                <p className="text-xs font-black text-slate-800 dark:text-slate-100">{user.full_name}</p>
                <p className="text-[10px] font-bold text-sky-500 uppercase">Pro Explorer</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-950/30"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            title="Switch Dark/Light"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Toggle dark and light mode"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </nav>
    </header>
  )
}
