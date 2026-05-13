import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Library,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import StatsCard from '../components/StatsCard.jsx'
import Button from '../components/Button.jsx'
import { dashboardService, getApiErrorMessage } from '../services/api.js'
import { KODNEST_LOGO_URL } from '../constants/branding.js'

function BarChart({ values, labels }) {
  const max = Math.max(1, ...values)
  return (
    <div className="mt-4 flex h-40 items-end gap-2">
      {values.map((v, i) => (
        <div key={labels[i]} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 shadow-inner shadow-primary-900/10 transition-all duration-500"
            style={{ height: `${(v / max) * 100}%`, minHeight: v ? '8%' : '2%' }}
            title={`${labels[i]}: ${v}`}
          />
          <span className="text-[10px] font-medium text-gray-500">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await dashboardService.getStats()
        if (!cancelled) setStats(data)
      } catch (e) {
        toast.error(getApiErrorMessage(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const chart = useMemo(() => {
    const recent = stats?.recentIssues || []
    const labels = ['W-4', 'W-3', 'W-2', 'W-1', 'This week']
    const buckets = [0, 0, 0, 0, 0]
    const today = new Date()
    recent.forEach((issue) => {
      const d = new Date(issue.issueDate)
      const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24))
      const weekIndex = Math.min(4, Math.max(0, Math.floor(diffDays / 7)))
      buckets[4 - weekIndex] += 1
    })
    return { values: buckets, labels }
  }, [stats])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8 animate-fadeIn pb-4">
      <a
        href="https://kodnest.com"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-30 flex max-w-[200px] items-center gap-2 rounded-full border border-primary-200/80 bg-white/90 py-1.5 pl-2 pr-3 text-[11px] font-semibold text-primary-800 shadow-lg shadow-primary-900/10 backdrop-blur-md transition hover:border-primary-300 hover:bg-white hover:shadow-xl dark:border-primary-800 dark:bg-gray-900/90 dark:text-primary-100 dark:hover:bg-gray-900 sm:bottom-24 sm:right-6 lg:bottom-8 lg:right-8"
        aria-label="Powered by KodNest - Leading Tech Training Institute"
      >
        <img
          src={KODNEST_LOGO_URL}
          alt=""
          className="h-7 w-auto object-contain opacity-90"
          aria-hidden
        />
        <span className="leading-tight">Powered by KodNest</span>
      </a>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-sky-500 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-white/30">
              <Sparkles className="h-3.5 w-3.5" />
              Overview
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">Welcome back, librarian</h1>
            <p className="mt-2 max-w-xl text-sm text-white/85">
              Monitor circulation, availability, and student engagement from a single calm, modern workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="!bg-white/90 !text-primary-800 hover:!bg-white" icon={BookOpen} type="button" onClick={() => navigate('/issue')}>
              Issue a book
            </Button>
            <Button
              variant="secondary"
              className="!border-white/40 !bg-transparent !text-white hover:!bg-white/10"
              icon={Library}
              type="button"
              onClick={() => navigate('/books')}
            >
              Browse catalog
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total books" value={stats?.totalBooks ?? 0} icon={Library} color="blue" trend="+ catalog growth" />
        <StatsCard title="Students" value={stats?.totalStudents ?? 0} icon={Users} color="violet" trend="Active profiles" />
        <StatsCard title="Books issued" value={stats?.activeIssues ?? 0} icon={BookMarked} color="amber" trend="Currently on loan" />
        <StatsCard title="Available copies" value={stats?.availableBooks ?? 0} icon={TrendingUp} color="green" trend="On shelves" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Issuance trend</h2>
              <p className="text-sm text-gray-500">Approximated weekly buckets from recent activity</p>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-100">
              Live data
            </span>
          </div>
          <BarChart values={chart.values} labels={chart.labels} />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Quick actions</h2>
          <p className="text-sm text-gray-500">Shortcuts to frequent workflows</p>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => navigate('/issue')}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm font-medium text-gray-800 transition hover:border-primary-200 hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary-600" />
                Issue book
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/books')}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm font-medium text-gray-800 transition hover:border-primary-200 hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              <span className="inline-flex items-center gap-2">
                <Library className="h-4 w-4 text-primary-600" />
                Add book
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm font-medium text-gray-800 transition hover:border-primary-200 hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              <span className="inline-flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary-600" />
                Add student
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Recent activity</h2>
            <p className="text-sm text-gray-500">Latest five circulation events</p>
          </div>
        </div>
        <ol className="mt-6 space-y-4">
          {(stats?.recentIssues || []).map((issue, idx) => (
            <li key={issue.id} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700 ring-2 ring-primary-100 dark:bg-primary-950 dark:text-primary-100 dark:ring-primary-900">
                  {idx + 1}
                </div>
                {idx < (stats?.recentIssues?.length || 0) - 1 ? (
                  <div className="mt-1 h-full w-px flex-1 bg-gradient-to-b from-primary-200 to-transparent dark:from-primary-800" />
                ) : null}
              </div>
              <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {issue.bookTitle}{' '}
                  <span className="font-normal text-gray-500 dark:text-gray-400">→ {issue.studentName}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Issued {issue.issueDate} · Due {issue.dueDate}
                  {issue.returnDate ? ` · Returned ${issue.returnDate}` : ''}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    issue.status === 'RETURNED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-100'
                  }`}
                >
                  {issue.status}
                </span>
              </div>
            </li>
          ))}
          {(!stats?.recentIssues || stats.recentIssues.length === 0) && (
            <p className="text-sm text-gray-500">No recent issues to display.</p>
          )}
        </ol>
      </section>
    </div>
  )
}
