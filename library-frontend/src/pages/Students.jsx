import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BookOpen, Eye, Pencil, Plus, Search, Trash2, User } from 'lucide-react'
import Button from '../components/Button.jsx'
import DataTable from '../components/DataTable.jsx'
import FormInput from '../components/FormInput.jsx'
import Modal from '../components/Modal.jsx'
import { getApiErrorMessage, issuedBookService, studentService } from '../services/api.js'

const emptyStudent = {
  name: '',
  email: '',
  phone: '',
  enrollmentDate: '',
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [debounced, setDebounced] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [issuesModal, setIssuesModal] = useState(null)
  const [issues, setIssues] = useState([])
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyStudent)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [issueIndex, setIssueIndex] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = debounced.trim() ? await studentService.search(debounced.trim()) : await studentService.getAll()
      setStudents(data)
      const allIssues = await issuedBookService.getAll()
      const map = {}
      allIssues.forEach((ib) => {
        const sid = ib.student?.id
        if (!sid) return
        if (!map[sid]) map[sid] = { total: 0, active: 0, overdue: 0 }
        map[sid].total += 1
        if (ib.status === 'ISSUED') {
          map[sid].active += 1
          if (ib.dueDate && new Date(ib.dueDate) < new Date()) map[sid].overdue += 1
        }
      })
      setIssueIndex(map)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [debounced])

  useEffect(() => {
    const t = setTimeout(() => setDebounced(keyword), 350)
    return () => clearTimeout(t)
  }, [keyword])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyStudent)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (s) => {
    setEditing(s)
    setForm({
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      enrollmentDate: s.enrollmentDate || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const saveStudent = async () => {
    if (!validate()) return
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      enrollmentDate: form.enrollmentDate || null,
    }
    try {
      if (editing) {
        const updated = await studentService.update(editing.id, { ...editing, ...payload })
        setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
        toast.success('Student updated')
      } else {
        const created = await studentService.create(payload)
        setStudents((prev) => [created, ...prev])
        toast.success('Student added')
      }
      setModalOpen(false)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setStudents((prev) => prev.filter((s) => s.id !== id))
    setDeleteTarget(null)
    try {
      await studentService.remove(id)
      toast.success('Student removed')
    } catch (e) {
      toast.error(getApiErrorMessage(e))
      load()
    }
  }

  const openIssues = async (student) => {
    setIssuesModal(student)
    setIssuesLoading(true)
    try {
      const data = await issuedBookService.getByStudent(student.id)
      setIssues(data)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
      setIssues([])
    } finally {
      setIssuesLoading(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-gray-900 dark:text-gray-50">{row.name}</span> },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'enrollmentDate', header: 'Enrolled' },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Students</h1>
          <p className="text-sm text-gray-500">Profiles, contact paths, and borrowing history.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Add student
        </Button>
      </div>

      <div className="relative max-w-xl rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-10 pr-3 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-800 dark:bg-gray-800/60 dark:focus:bg-gray-900"
          aria-label="Search students"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <User className="h-10 w-10 text-primary-500" />
          <p className="mt-3 text-lg font-semibold text-gray-800 dark:text-gray-100">No students yet</p>
          <p className="mt-1 text-sm text-gray-500">Invite learners to the library network.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => {
            const stats = issueIndex[student.id] || { total: 0, active: 0, overdue: 0 }
            return (
              <article
                key={student.id}
                className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-sm font-bold text-white shadow-inner">
                    {initials(student.name)}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-50">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                    {student.phone ? <p className="text-xs text-gray-500">{student.phone}</p> : null}
                    {student.enrollmentDate ? (
                      <p className="mt-1 text-xs text-gray-400">Enrolled {student.enrollmentDate}</p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-gray-50 py-2 dark:bg-gray-800/70">
                    <p className="text-[11px] text-gray-500">Issued</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{stats.total}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 py-2 dark:bg-gray-800/70">
                    <p className="text-[11px] text-gray-500">Active</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{stats.active}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 py-2 dark:bg-gray-800/70">
                    <p className="text-[11px] text-gray-500">Overdue</p>
                    <p className="text-sm font-semibold text-red-600">{stats.overdue}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" type="button" icon={Eye} onClick={() => openIssues(student)}>
                    View issues
                  </Button>
                  <Button variant="secondary" size="sm" type="button" icon={Pencil} onClick={() => openEdit(student)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" type="button" icon={Trash2} onClick={() => setDeleteTarget(student)}>
                    Delete
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Directory table</h2>
        <p className="text-sm text-gray-500">Sortable snapshot of every profile.</p>
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={students}
            searchKeys={['name', 'email', 'phone']}
            actions={(row) => (
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" icon={Eye} onClick={() => openIssues(row)}>
                  Issues
                </Button>
                <Button variant="secondary" size="sm" type="button" icon={Pencil} onClick={() => openEdit(row)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" type="button" icon={Trash2} onClick={() => setDeleteTarget(row)}>
                  Delete
                </Button>
              </div>
            )}
          />
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit student' : 'Add student'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" loading={saving} onClick={saveStudent}>
              Save
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} icon={User} />
          <FormInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={errors.email}
          />
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <FormInput label="Enrollment date" type="date" value={form.enrollmentDate} onChange={(e) => setForm((f) => ({ ...f, enrollmentDate: e.target.value }))} />
        </div>
      </Modal>

      <Modal open={!!issuesModal} onClose={() => setIssuesModal(null)} title={issuesModal ? `Issues · ${issuesModal.name}` : 'Issues'} size="lg">
        {issuesLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        ) : issues.length === 0 ? (
          <p className="text-sm text-gray-500">No circulation history for this student.</p>
        ) : (
          <ul className="space-y-3">
            {issues.map((issue) => (
              <li key={issue.id} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-sm dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-50">{issue.book?.title}</p>
                    <p className="text-xs text-gray-500">
                      {issue.issueDate} → Due {issue.dueDate}
                      {issue.returnDate ? ` · Returned ${issue.returnDate}` : ''}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      issue.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {issue.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove student?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" type="button" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Remove <span className="font-semibold">{deleteTarget?.name}</span>? Active loans may prevent deletion.
        </p>
      </Modal>
    </div>
  )
}
