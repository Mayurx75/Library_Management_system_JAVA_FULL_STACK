import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BookOpen, History, LayoutDashboard, Library, Menu, Moon, SunMedium, Users, X } from 'lucide-react'
import { KODNEST_LOGO_URL } from '../constants/branding.js'

const linkBase =
  'relative px-1 py-2 text-sm font-medium text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-md'

function underlineClass({ isActive }) {
  return `${linkBase} ${isActive ? 'after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:rounded-full after:bg-white after:content-[""]' : ''}`
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books', label: 'Books', icon: Library },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/issue', label: 'Issue Book', icon: BookOpen },
  { to: '/history', label: 'History', icon: History },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
      setDark(true)
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark')
      setDark(false)
    } else {
      setDark(document.documentElement.classList.contains('dark'))
    }
  }, [])

  const toggleTheme = () => {
    const next = !document.documentElement.classList.toggle('dark')
    setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-gradient-to-r from-primary-600 to-primary-800 shadow-lg shadow-primary-900/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <a
            href="https://kodnest.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group shrink-0 transition duration-200 hover:opacity-90"
            aria-label="KodNest - Leading Tech Training Institute"
          >
            <img
              src={KODNEST_LOGO_URL}
              alt="KodNest - Leading Tech Training Institute"
              height={40}
              width={160}
              className="h-10 w-auto max-w-[140px] object-contain transition duration-200 group-hover:scale-[1.03] sm:max-w-[180px]"
              loading="eager"
            />
          </a>
          <div className="min-w-0 border-l border-white/25 pl-3 sm:pl-4">
            <p className="truncate text-sm font-bold tracking-tight text-white sm:text-base">Library Management System</p>
            <p className="hidden text-xs text-white/70 sm:block">Circulation &amp; catalog workspace</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={underlineClass} end={to === '/'}>
              <span className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full bg-white/10 p-2 text-white ring-1 ring-white/20 transition hover:bg-white/20"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="rounded-lg bg-white/10 p-2 text-white ring-1 ring-white/20 lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-l border-white/10 bg-gradient-to-b from-primary-700 to-primary-900 p-4 shadow-2xl animate-slideIn">
            <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
              <img
                src={KODNEST_LOGO_URL}
                alt="KodNest - Leading Tech Training Institute"
                className="h-9 w-auto max-w-[120px] object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight text-white">Library Management System</p>
              </div>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Menu</p>
              <button
                type="button"
                className="rounded-full bg-white/10 p-2 text-white"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                      isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
