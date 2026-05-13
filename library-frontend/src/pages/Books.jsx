import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { BookMarked, Grid3x3, List, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Button from '../components/Button.jsx'
import DataTable from '../components/DataTable.jsx'
import FormInput from '../components/FormInput.jsx'
import Modal from '../components/Modal.jsx'
import { bookService, getApiErrorMessage } from '../services/api.js'

const CATEGORIES = ['All', 'Fiction', 'Science', 'Technology', 'History', 'Biography']

const emptyBook = {
  title: '',
  author: '',
  category: 'Fiction',
  isbn: '',
  totalCopies: 1,
  availableCopies: 1,
}

export default function Books() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [debounced, setDebounced] = useState('')
  const [category, setCategory] = useState('All')
  const [view, setView] = useState('grid')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyBook)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = debounced.trim()
        ? await bookService.search(debounced.trim())
        : await bookService.getAll()
      setBooks(data)
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

  const filtered = useMemo(() => {
    if (category === 'All') return books
    return books.filter((b) => (b.category || '').toLowerCase() === category.toLowerCase())
  }, [books, category])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyBook)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (book) => {
    setEditing(book)
    setForm({
      title: book.title,
      author: book.author,
      category: book.category || 'Fiction',
      isbn: book.isbn || '',
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'Title is required'
    if (!form.author.trim()) next.author = 'Author is required'
    if (form.totalCopies < 0) next.totalCopies = 'Must be zero or more'
    if (form.availableCopies != null && form.availableCopies > form.totalCopies) {
      next.availableCopies = 'Cannot exceed total copies'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const saveBook = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (editing) {
        const updated = await bookService.update(editing.id, {
          ...editing,
          title: form.title.trim(),
          author: form.author.trim(),
          category: form.category,
          isbn: form.isbn.trim() || null,
          totalCopies: Number(form.totalCopies),
        })
        setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
        toast.success('Book updated')
      } else {
        const created = await bookService.create({
          title: form.title.trim(),
          author: form.author.trim(),
          category: form.category,
          isbn: form.isbn.trim() || null,
          totalCopies: Number(form.totalCopies),
          availableCopies: Number(form.availableCopies ?? form.totalCopies),
        })
        setBooks((prev) => [created, ...prev])
        toast.success('Book added')
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
    setBooks((prev) => prev.filter((b) => b.id !== id))
    setDeleteTarget(null)
    try {
      await bookService.remove(id)
      toast.success('Book removed')
    } catch (e) {
      toast.error(getApiErrorMessage(e))
      load()
    }
  }

  const badgeColor = (cat) => {
    const map = {
      Fiction: 'bg-violet-100 text-violet-800',
      Science: 'bg-sky-100 text-sky-800',
      Technology: 'bg-indigo-100 text-indigo-800',
      History: 'bg-amber-100 text-amber-800',
      Biography: 'bg-emerald-100 text-emerald-800',
    }
    return map[cat] || 'bg-gray-100 text-gray-700'
  }

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'author', header: 'Author' },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColor(row.category)}`}>{row.category}</span>
      ),
    },
    { key: 'isbn', header: 'ISBN' },
    {
      key: 'availableCopies',
      header: 'Availability',
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            row.availableCopies > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {row.availableCopies}/{row.totalCopies}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Books</h1>
          <p className="text-sm text-gray-500">Manage catalog, availability, and metadata.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Add book
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-10 pr-3 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-800 dark:bg-gray-800/60 dark:focus:bg-gray-900"
            aria-label="Search books"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === 'grid' ? 'primary' : 'secondary'} size="sm" type="button" onClick={() => setView('grid')} icon={Grid3x3}>
            Grid
          </Button>
          <Button variant={view === 'table' ? 'primary' : 'secondary'} size="sm" type="button" onClick={() => setView('table')} icon={List}>
            Table
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              category === c
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : view === 'table' ? (
        <DataTable
          columns={columns}
          data={filtered}
          searchKeys={['title', 'author', 'isbn']}
          actions={(row) => (
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" type="button" icon={Pencil} onClick={() => openEdit(row)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" type="button" icon={Trash2} onClick={() => setDeleteTarget(row)}>
                Delete
              </Button>
            </div>
          )}
        />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <BookMarked className="h-10 w-10 text-primary-500" />
          <p className="mt-3 text-lg font-semibold text-gray-800 dark:text-gray-100">No books found</p>
          <p className="mt-1 text-sm text-gray-500">Adjust filters or add your first title.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((book) => (
            <article
              key={book.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="relative h-28 bg-gradient-to-br from-primary-500 via-sky-500 to-indigo-600 p-4 text-white">
                <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/30 backdrop-blur">
                  {book.category}
                </span>
                <p className="text-xs uppercase tracking-wide text-white/80">Featured</p>
                <p className="mt-2 line-clamp-2 text-lg font-semibold leading-snug">{book.title}</p>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">{book.author}</p>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      book.availableCopies > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="text-gray-500">
                    {book.availableCopies}/{book.totalCopies} copies
                  </span>
                </div>
                <div className="mt-auto flex gap-2 pt-2">
                  <Button variant="secondary" size="sm" className="flex-1" type="button" onClick={() => openEdit(book)} icon={Pencil}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1" type="button" onClick={() => setDeleteTarget(book)} icon={Trash2}>
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit book' : 'Add book'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" loading={saving} onClick={saveBook}>
              Save
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            error={errors.title}
          />
          <FormInput
            label="Author"
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            error={errors.author}
          />
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <FormInput label="ISBN" value={form.isbn} onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))} />
          <FormInput
            label="Total copies"
            type="number"
            min="0"
            value={form.totalCopies}
            onChange={(e) => setForm((f) => ({ ...f, totalCopies: Number(e.target.value) }))}
            error={errors.totalCopies}
          />
          {!editing ? (
            <FormInput
              label="Available copies"
              type="number"
              min="0"
              value={form.availableCopies}
              onChange={(e) => setForm((f) => ({ ...f, availableCopies: Number(e.target.value) }))}
              error={errors.availableCopies}
            />
          ) : null}
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete book?"
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
          This will remove <span className="font-semibold">{deleteTarget?.title}</span> from the catalog. Active loans may block deletion.
        </p>
      </Modal>
    </div>
  )
}
