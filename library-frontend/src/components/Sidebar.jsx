import { NavLink } from 'react-router-dom'
import { BookOpen, History, LayoutDashboard, Library, Users } from 'lucide-react'

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books', label: 'Books', icon: Library },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/issue', label: 'Issue Book', icon: BookOpen },
  { to: '/history', label: 'History', icon: History },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-gray-100 bg-white/90 px-3 py-6 shadow-sm backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/90 lg:flex">
      <div className="mb-6 px-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Navigate</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">Library workspace</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1" aria-label="Sidebar">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md shadow-primary-500/25'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-800 dark:text-gray-300 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0 transition group-hover:scale-105" aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-dashed border-primary-100 bg-primary-50/60 p-3 text-xs text-primary-800 dark:border-primary-900/40 dark:bg-primary-950/40 dark:text-primary-100">
        Tip: Use History to track returns and overdue items.
      </div>
    </aside>
  )
}
