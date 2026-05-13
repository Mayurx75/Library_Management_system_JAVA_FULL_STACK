/**
 * Serverless API mirroring Spring routes for Netlify production.
 * Local development still uses Spring Boot at http://localhost:8080/api
 */
import express from 'express'
import serverless from 'serverless-http'

const STATUS_ISSUED = 'ISSUED'
const STATUS_RETURNED = 'RETURNED'

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

function isoDateTime() {
  return new Date().toISOString().slice(0, 19)
}

const state = {
  books: [],
  students: [],
  issues: [],
  nextBookId: 1,
  nextStudentId: 1,
  nextIssueId: 1,
  seeded: false,
}

function seed() {
  if (state.seeded) return
  state.seeded = true

  const bookRows = [
    ['The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', '978-0743273565', 4],
    ['1984', 'George Orwell', 'Fiction', '978-0451524935', 5],
    ['Sapiens', 'Yuval Noah Harari', 'History', '978-0062316097', 3],
    ['A Brief History of Time', 'Stephen Hawking', 'Science', '978-0553380163', 6],
    ['Clean Code', 'Robert C. Martin', 'Technology', '978-0132350884', 4],
    ['The Pragmatic Programmer', 'David Thomas', 'Technology', '978-0134757599', 3],
    ['Becoming', 'Michelle Obama', 'Biography', '978-1524763138', 5],
    ['Steve Jobs', 'Walter Isaacson', 'Biography', '978-1451648539', 2],
    ['The Selfish Gene', 'Richard Dawkins', 'Science', '978-0192860927', 4],
    ['Guns, Germs, and Steel', 'Jared Diamond', 'History', '978-0393354324', 3],
    ['Dune', 'Frank Herbert', 'Fiction', '978-0441172719', 7],
    ['The Code Breaker', 'Walter Isaacson', 'Biography', '978-1982115852', 2],
    ['Introduction to Algorithms', 'Cormen et al.', 'Technology', '978-0262046305', 5],
    ['The Immortal Life of Henrietta Lacks', 'Rebecca Skloot', 'Science', '978-1400052189', 3],
    ['The Wright Brothers', 'David McCullough', 'History', '978-1476728755', 4],
  ]
  for (const [title, author, category, isbn, copies] of bookRows) {
    state.books.push({
      id: state.nextBookId++,
      title,
      author,
      category,
      isbn,
      totalCopies: copies,
      availableCopies: copies,
      createdAt: isoDateTime(),
    })
  }

  const stud = [
    ['Ava Thompson', 'ava.thompson@university.edu', '+1-555-0101', '2023-08-21'],
    ['Liam Chen', 'liam.chen@university.edu', '+1-555-0102', '2023-08-22'],
    ['Sophia Martinez', 'sophia.martinez@university.edu', '+1-555-0103', '2022-08-15'],
    ['Noah Patel', 'noah.patel@university.edu', '+1-555-0104', '2024-01-10'],
    ['Mia Johnson', 'mia.johnson@university.edu', '+1-555-0105', '2023-08-21'],
    ['Ethan Brooks', 'ethan.brooks@university.edu', '+1-555-0106', '2021-08-18'],
    ['Isabella Rossi', 'isabella.rossi@university.edu', '+1-555-0107', '2023-08-23'],
    ['Lucas Kim', 'lucas.kim@university.edu', '+1-555-0108', '2022-08-16'],
  ]
  for (const [name, email, phone, enrollmentDate] of stud) {
    state.students.push({
      id: state.nextStudentId++,
      name,
      email,
      phone,
      enrollmentDate,
      createdAt: isoDateTime(),
    })
  }

  const byIsbn = (isbn) => state.books.find((b) => b.isbn === isbn)
  const byEmail = (email) => state.students.find((s) => s.email === email)
  const today = new Date()

  function addDays(d, n) {
    const x = new Date(d)
    x.setDate(x.getDate() + n)
    return x
  }

  function issueActive(book, student, issueOff, dueOff) {
    if (book.availableCopies <= 0) return
    book.availableCopies -= 1
    const issueDate = addDays(today, issueOff)
    const dueDate = addDays(today, dueOff)
    state.issues.push({
      id: state.nextIssueId++,
      bookId: book.id,
      studentId: student.id,
      issueDate: isoDate(issueDate),
      dueDate: isoDate(dueDate),
      returnDate: null,
      status: STATUS_ISSUED,
    })
  }

  function issueReturned(book, student, issueOff, dueOff, retOff) {
    state.issues.push({
      id: state.nextIssueId++,
      bookId: book.id,
      studentId: student.id,
      issueDate: isoDate(addDays(today, issueOff)),
      dueDate: isoDate(addDays(today, dueOff)),
      returnDate: isoDate(addDays(today, retOff)),
      status: STATUS_RETURNED,
    })
  }

  issueActive(byIsbn('978-0743273565'), byEmail('ava.thompson@university.edu'), -20, -6)
  issueActive(byIsbn('978-0132350884'), byEmail('liam.chen@university.edu'), -5, 9)
  issueActive(byIsbn('978-0062316097'), byEmail('sophia.martinez@university.edu'), -2, 12)
  issueReturned(byIsbn('978-0441172719'), byEmail('noah.patel@university.edu'), -30, -16, -14)
  issueReturned(byIsbn('978-0262046305'), byEmail('mia.johnson@university.edu'), -45, -31, -28)
}

function bookById(id) {
  return state.books.find((b) => b.id === Number(id))
}

function studentById(id) {
  return state.students.find((s) => s.id === Number(id))
}

function enrichIssue(row) {
  const book = bookById(row.bookId)
  const student = studentById(row.studentId)
  return {
    id: row.id,
    book,
    student,
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    returnDate: row.returnDate,
    status: row.status,
  }
}

const router = express.Router()

router.get('/books', (_req, res) => {
  seed()
  res.json(state.books)
})

router.get('/books/search', (req, res) => {
  seed()
  const k = String(req.query.keyword || '')
    .trim()
    .toLowerCase()
  const list = state.books.filter(
    (b) => b.title.toLowerCase().includes(k) || b.author.toLowerCase().includes(k),
  )
  res.json(list)
})

router.get('/books/available', (_req, res) => {
  seed()
  res.json(state.books.filter((b) => b.availableCopies > 0))
})

router.get('/books/:id', (req, res) => {
  seed()
  const b = bookById(req.params.id)
  if (!b) return res.status(404).json({ message: 'Book not found for id: ' + req.params.id })
  res.json(b)
})

router.post('/books', (req, res) => {
  seed()
  const body = req.body || {}
  const total = Number(body.totalCopies ?? 1)
  const avail = Number(body.availableCopies ?? total)
  const row = {
    id: state.nextBookId++,
    title: body.title,
    author: body.author,
    category: body.category || null,
    isbn: body.isbn || null,
    totalCopies: total,
    availableCopies: avail,
    createdAt: isoDateTime(),
  }
  state.books.push(row)
  res.status(201).json(row)
})

router.put('/books/:id', (req, res) => {
  seed()
  const b = bookById(req.params.id)
  if (!b) return res.status(404).json({ message: 'Book not found for id: ' + req.params.id })
  const body = req.body || {}
  const borrowed = b.totalCopies - b.availableCopies
  Object.assign(b, {
    title: body.title ?? b.title,
    author: body.author ?? b.author,
    category: body.category ?? b.category,
    isbn: body.isbn ?? b.isbn,
    totalCopies: Number(body.totalCopies ?? b.totalCopies),
  })
  b.availableCopies = Math.max(0, b.totalCopies - borrowed)
  res.json(b)
})

router.delete('/books/:id', (req, res) => {
  seed()
  const id = Number(req.params.id)
  const hasActive = state.issues.some((i) => i.bookId === id && i.status === STATUS_ISSUED)
  if (hasActive) return res.status(400).json({ message: 'Cannot delete book with active issues' })
  const idx = state.books.findIndex((b) => b.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Book not found for id: ' + id })
  state.books.splice(idx, 1)
  res.status(204).send()
})

router.get('/students', (_req, res) => {
  seed()
  res.json(state.students)
})

router.get('/students/search', (req, res) => {
  seed()
  const k = String(req.query.keyword || '')
    .trim()
    .toLowerCase()
  res.json(
    state.students.filter(
      (s) => s.name.toLowerCase().includes(k) || s.email.toLowerCase().includes(k),
    ),
  )
})

router.get('/students/:id', (req, res) => {
  seed()
  const s = studentById(req.params.id)
  if (!s) return res.status(404).json({ message: 'Student not found for id: ' + req.params.id })
  res.json(s)
})

router.post('/students', (req, res) => {
  seed()
  const body = req.body || {}
  if (state.students.some((s) => s.email === body.email))
    return res.status(400).json({ message: 'Email already registered' })
  const row = {
    id: state.nextStudentId++,
    name: body.name,
    email: body.email,
    phone: body.phone || null,
    enrollmentDate: body.enrollmentDate || null,
    createdAt: isoDateTime(),
  }
  state.students.push(row)
  res.status(201).json(row)
})

router.put('/students/:id', (req, res) => {
  seed()
  const s = studentById(req.params.id)
  if (!s) return res.status(404).json({ message: 'Student not found for id: ' + req.params.id })
  const body = req.body || {}
  if (body.email && body.email !== s.email && state.students.some((x) => x.email === body.email))
    return res.status(400).json({ message: 'Email already registered' })
  Object.assign(s, {
    name: body.name ?? s.name,
    email: body.email ?? s.email,
    phone: body.phone ?? s.phone,
    enrollmentDate: body.enrollmentDate ?? s.enrollmentDate,
  })
  res.json(s)
})

router.delete('/students/:id', (req, res) => {
  seed()
  const id = Number(req.params.id)
  const hasActive = state.issues.some((i) => i.studentId === id && i.status === STATUS_ISSUED)
  if (hasActive) return res.status(400).json({ message: 'Cannot delete student with active book issues' })
  const idx = state.students.findIndex((s) => s.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Student not found for id: ' + id })
  state.students.splice(idx, 1)
  res.status(204).send()
})

router.get('/issued-books', (_req, res) => {
  seed()
  const sorted = [...state.issues].sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1))
  res.json(sorted.map(enrichIssue))
})

router.get('/issued-books/active', (_req, res) => {
  seed()
  const list = state.issues.filter((i) => i.status === STATUS_ISSUED)
  list.sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1))
  res.json(list.map(enrichIssue))
})

router.get('/issued-books/returned', (_req, res) => {
  seed()
  const list = state.issues.filter((i) => i.status === STATUS_RETURNED)
  list.sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1))
  res.json(list.map(enrichIssue))
})

router.get('/issued-books/overdue', (_req, res) => {
  seed()
  const today = isoDate(new Date())
  const list = state.issues.filter(
    (i) => i.status === STATUS_ISSUED && i.dueDate && i.dueDate < today,
  )
  list.sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
  res.json(list.map(enrichIssue))
})

router.get('/issued-books/student/:studentId', (req, res) => {
  seed()
  const sid = Number(req.params.studentId)
  if (!studentById(sid)) return res.status(404).json({ message: 'Student not found for id: ' + sid })
  const list = state.issues.filter((i) => i.studentId === sid)
  list.sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1))
  res.json(list.map(enrichIssue))
})

router.post('/issued-books/issue', (req, res) => {
  seed()
  const { bookId, studentId } = req.body || {}
  const book = bookById(bookId)
  const student = studentById(studentId)
  if (!book) return res.status(404).json({ message: 'Book not found for id: ' + bookId })
  if (!student) return res.status(404).json({ message: 'Student not found for id: ' + studentId })
  if (!book.availableCopies || book.availableCopies <= 0)
    return res.status(400).json({ message: 'No copies available for this book' })
  const today = new Date()
  const issueDate = isoDate(today)
  const due = new Date(today)
  due.setDate(due.getDate() + 14)
  const dueDate = isoDate(due)
  book.availableCopies -= 1
  const row = {
    id: state.nextIssueId++,
    bookId: book.id,
    studentId: student.id,
    issueDate,
    dueDate,
    returnDate: null,
    status: STATUS_ISSUED,
  }
  state.issues.push(row)
  res.status(201).json(enrichIssue(row))
})

router.put('/issued-books/return/:id', (req, res) => {
  seed()
  const row = state.issues.find((i) => i.id === Number(req.params.id))
  if (!row) return res.status(404).json({ message: 'IssuedBook not found for id: ' + req.params.id })
  if (row.status === STATUS_RETURNED) return res.status(400).json({ message: 'Book is already returned' })
  const book = bookById(row.bookId)
  row.returnDate = isoDate(new Date())
  row.status = STATUS_RETURNED
  book.availableCopies += 1
  res.json(enrichIssue(row))
})

router.get('/dashboard/stats', (_req, res) => {
  seed()
  const activeIssues = state.issues.filter((i) => i.status === STATUS_ISSUED).length
  const availableBooks = state.books.reduce((sum, b) => sum + (b.availableCopies || 0), 0)
  const recent = [...state.issues]
    .sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1))
    .slice(0, 5)
    .map((i) => {
      const e = enrichIssue(i)
      return {
        id: e.id,
        bookTitle: e.book?.title,
        studentName: e.student?.name,
        issueDate: e.issueDate,
        dueDate: e.dueDate,
        returnDate: e.returnDate,
        status: e.status,
      }
    })
  res.json({
    totalBooks: state.books.length,
    totalStudents: state.students.length,
    activeIssues,
    availableBooks,
    recentIssues: recent,
  })
})

const app = express()
app.use(express.json())
app.use('/api', router)

export const handler = serverless(app)
