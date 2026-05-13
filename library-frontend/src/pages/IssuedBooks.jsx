import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AlertTriangle, Download, Filter, RefreshCw } from 'lucide-react'
import Button from '../components/Button.jsx'
import { getApiErrorMessage, issuedBookService } from '../services/api.js'

const tabs = [
  { id: 'active', label: 'Active' },
  { id: 'returned', label: 'Returned' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'all', label: 'All' },
]

function daysOverdue(due) {
  if (!due) return 0
  const dueDate = new Date(due)
  const today = new Date()
  const diff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

function initials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export default function IssuedBooks() {
  const [tab, setTab] = useState('active')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentFilter, setStudentFilter] = useState('')
  const [bookFilter, setBookFilter] = useState('')
  const [returningId, setReturningId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let data = []
      if (tab === 'active') data = await issuedBookService.getActive()
      else if (tab === 'returned') data = await issuedBookService.getReturned()
      else if (tab === 'overdue') data = await issuedBookService.getOverdue()
      else data = await issuedBookService.getAll()
      setRows(data)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const s = studentFilter.trim().toLowerCase()
    const b = bookFilter.trim().toLowerCase()
    return rows.filter((row) => {
      const okS = !s || row.student?.name?.toLowerCase().includes(s) || row.student?.email?.toLowerCase().includes(s)
      const okB = !b || row.book?.title?.toLowerCase().includes(b) || row.book?.author?.toLowerCase().includes(b)
      return okS && okB
    })
  }, [rows, studentFilter, bookFilter])

  const handleReturn = async (id) => {
    setReturningId(id)
    const previous = rows
    setRows((list) => list.filter((r) => r.id !== id))
    try {
      await issuedBookService.returnBook(id)
      toast.success('Book returned')
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
      setRows(previous)
    } finally {
      setReturningId(null)
    }
  }

  const exportCsv = () => {
    const header = ['id', 'student', 'email', 'book', 'author', 'issueDate', 'dueDate', 'returnDate', 'status']
    const lines = [header.join(',')]
    filtered.forEach((row) => {
      lines.push(
        [
          row.id,
          `"${(row.student?.name || '').replace(/"/g, '""')}"`,
          `"${(row.student?.email || '').replace(/"/g, '""')}"`,
          `"${(row.book?.title || '').replace(/"/g, '""')}"`,
          `"${(row.book?.author || '').replace(/"/g, '""')}"`,
          row.issueDate,
          row.dueDate,
          row.returnDate || '',
          row.status,
        ].join(','),
      )
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `issued-books-${tab}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Circulation history</h1>
          <p className="text-sm text-gray-500">Track loans, returns, and exceptions in one ledger.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" type="button" icon={RefreshCw} onClick={load} loading={loading}>
            Refresh
          </Button>
          <Button variant="secondary" type="button" icon={Download} onClick={exportCsv} disabled={!filtered.length}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t.id ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:grid-cols-2">
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            placeholder="Filter by student..."
            className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-800 dark:bg-gray-900"
          />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={bookFilter}
            onChange={(e) => setBookFilter(e.target.value)}
            placeholder="Filter by book..."
            className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-800 dark:bg-gray-900"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
          <p className="mt-3 text-lg font-semibold text-gray-800 dark:text-gray-100">No records</p>
          <p className="mt-1 text-sm text-gray-500">Switch tabs or relax filters to see more activity.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((issue) => {
            const overdueDays = issue.status === 'ISSUED' ? daysOverdue(issue.dueDate) : 0
            const highlight = overdueDays > 0 && issue.status === 'ISSUED'
            return (
              <article
                key={issue.id}
                className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 ${
                  highlight ? 'border-red-300 ring-2 ring-red-100 dark:border-red-500/60 dark:ring-red-900/40' : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-sm font-bold text-white">
                      {initials(issue.student?.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{issue.student?.name}</p>
                      <p className="text-xs text-gray-500">{issue.student?.email}</p>
                      <p className="mt-2 text-base font-semibold text-gray-900 dark:text-gray-50">{issue.book?.title}</p>
                      <p className="text-xs text-gray-500">{issue.book?.author}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 text-sm text-gray-600 dark:text-gray-300 lg:items-end">
                    <div className="inline-flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        Issued {issue.issueDate}
                      </span>
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-100">
                        Due {issue.dueDate}
                      </span>
                      {issue.returnDate ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100">
                          Returned {issue.returnDate}
                        </span>
                      ) : null}
                    </div>
                    {highlight ? (
                      <p className="text-sm font-semibold text-red-600">{overdueDays} days overdue</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          issue.status === 'RETURNED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-100'
                        }`}
                      >
                        {issue.status}
                      </span>
                      {issue.status === 'ISSUED' ? (
                        <Button
                          size="sm"
                          variant="success"
                          type="button"
                          loading={returningId === issue.id}
                          onClick={() => handleReturn(issue.id)}
                        >
                          Return book
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
