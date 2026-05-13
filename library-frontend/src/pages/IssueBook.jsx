import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { BookMarked, CheckCircle2, Search, User } from 'lucide-react'
import Button from '../components/Button.jsx'
import { bookService, getApiErrorMessage, issuedBookService, studentService } from '../services/api.js'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export default function IssueBook() {
  const [step, setStep] = useState(1)
  const [students, setStudents] = useState([])
  const [books, setBooks] = useState([])
  const [studentQuery, setStudentQuery] = useState('')
  const [bookQuery, setBookQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [s, b, allIssues] = await Promise.all([
          studentService.getAll(),
          bookService.getAvailable(),
          issuedBookService.getAll(),
        ])
        if (!cancelled) {
          setStudents(s)
          setBooks(b)
          setRecent(allIssues.slice(0, 5))
        }
      } catch (e) {
        if (!cancelled) toast.error(getApiErrorMessage(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
  }, [students, studentQuery])

  const filteredBooks = useMemo(() => {
    const q = bookQuery.trim().toLowerCase()
    if (!q) return books
    return books.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
  }, [books, bookQuery])

  const issueDate = new Date()
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)

  const submit = async () => {
    if (!selectedStudent || !selectedBook) {
      toast.error('Select both a student and a book')
      return
    }
    setSubmitting(true)
    try {
      await issuedBookService.issue(selectedBook.id, selectedStudent.id)
      toast.success('Book issued successfully')
      setDone(true)
      const [b, allIssues] = await Promise.all([bookService.getAvailable(), issuedBookService.getAll()])
      setBooks(b)
      setRecent(allIssues.slice(0, 5))
      setTimeout(() => {
        setDone(false)
        setStep(1)
        setSelectedStudent(null)
        setSelectedBook(null)
      }, 1600)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-3xl bg-gray-200 dark:bg-gray-800" />
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Issue a book</h1>
        <p className="text-sm text-gray-500">Pair a reader with an available title in two guided steps.</p>
      </div>

      <div className="rounded-3xl border-2 border-transparent bg-gradient-to-br from-primary-500 via-sky-500 to-indigo-600 p-[1px] shadow-xl">
        <div className="rounded-[22px] bg-white p-6 dark:bg-gray-950">
          <div className="mb-6 flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              1
            </div>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              2
            </div>
          </div>

          {done ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center animate-scaleIn">
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">Issue recorded</p>
              <p className="text-sm text-gray-500">The catalog availability has been updated automatically.</p>
            </div>
          ) : (
            <>
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                    <User className="h-4 w-4 text-primary-600" />
                    Select student
                  </div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={studentQuery}
                      onChange={(e) => setStudentQuery(e.target.value)}
                      placeholder="Search students..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-800 dark:bg-gray-900"
                    />
                  </div>
                  <div className="grid max-h-72 gap-2 overflow-y-auto md:grid-cols-2">
                    {filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedStudent(s)}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                          selectedStudent?.id === s.id
                            ? 'border-primary-500 bg-primary-50 text-primary-900 dark:bg-primary-950/40'
                            : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900'
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-xs font-bold text-white">
                          {initials(s.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-50">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" disabled={!selectedStudent} onClick={() => setStep(2)}>
                      Continue
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                    <BookMarked className="h-4 w-4 text-primary-600" />
                    Select available book
                  </div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={bookQuery}
                      onChange={(e) => setBookQuery(e.target.value)}
                      placeholder="Filter catalog..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-800 dark:bg-gray-900"
                    />
                  </div>
                  <div className="grid max-h-80 gap-3 overflow-y-auto md:grid-cols-2">
                    {filteredBooks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBook(b)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                          selectedBook?.id === b.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                            : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900'
                        }`}
                      >
                        <p className="font-semibold text-gray-900 dark:text-gray-50">{b.title}</p>
                        <p className="text-xs text-gray-500">{b.author}</p>
                        <p className="mt-2 text-xs font-medium text-emerald-600">{b.availableCopies} copies left</p>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-between gap-3">
                    <Button variant="secondary" type="button" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="button" loading={submitting} disabled={!selectedBook} onClick={submit}>
                      Issue book
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {(selectedStudent || selectedBook) && !done ? (
        <div className="grid gap-4 md:grid-cols-2">
          {selectedStudent ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Student</p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50">{selectedStudent.name}</p>
              <p className="text-sm text-gray-500">{selectedStudent.email}</p>
            </div>
          ) : null}
          {selectedBook ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Book</p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50">{selectedBook.title}</p>
              <p className="text-sm text-gray-500">{selectedBook.author}</p>
              <p className="mt-3 text-xs text-gray-500">
                Issue {issueDate.toLocaleDateString()} · Due {dueDate.toLocaleDateString()}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Recent issues</h2>
        <p className="text-sm text-gray-500">Latest circulation events across the library.</p>
        <ul className="mt-4 space-y-3">
          {recent.map((issue) => (
            <li key={issue.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-800/40">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-50">{issue.book?.title}</p>
                <p className="text-xs text-gray-500">{issue.student?.name}</p>
              </div>
              <span className="text-xs text-gray-500">{issue.issueDate}</span>
            </li>
          ))}
          {recent.length === 0 ? <p className="text-sm text-gray-500">No issues yet.</p> : null}
        </ul>
      </section>
    </div>
  )
}
