import axios from 'axios'

/**
 * Local: Spring Boot at http://localhost:8080/api
 * Netlify production: same-origin /api (rewritten to serverless Express in netlify/functions/api.mjs)
 * Override: VITE_API_BASE_URL
 */
function apiBaseUrl() {
  const env = import.meta.env.VITE_API_BASE_URL?.trim()
  if (env) return env.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('netlify.app')) {
    return `${window.location.origin}/api`
  }
  return 'http://localhost:8080/api'
}

const api = axios.create({
  baseURL: apiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

export function getApiErrorMessage(error) {
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return 'Cannot reach the API. For local dev, run Spring Boot on port 8080. On Netlify, redeploy after a successful build.'
  }
  const data = error?.response?.data
  if (!data) return error?.message || 'Something went wrong'
  if (typeof data.message === 'string' && data.message) return data.message
  if (data.fieldErrors && typeof data.fieldErrors === 'object') {
    const vals = Object.values(data.fieldErrors).filter(Boolean)
    if (vals.length) return vals.join(' · ')
  }
  if (Array.isArray(data.details) && data.details.length) return data.details.join(' · ')
  return data.error || error.message || 'Request failed'
}

export const bookService = {
  getAll: () => api.get('/books').then((r) => r.data),
  getById: (id) => api.get(`/books/${id}`).then((r) => r.data),
  create: (payload) => api.post('/books', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/books/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/books/${id}`).then((r) => r.data),
  search: (keyword) => api.get('/books/search', { params: { keyword } }).then((r) => r.data),
  getAvailable: () => api.get('/books/available').then((r) => r.data),
}

export const studentService = {
  getAll: () => api.get('/students').then((r) => r.data),
  getById: (id) => api.get(`/students/${id}`).then((r) => r.data),
  create: (payload) => api.post('/students', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/students/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/students/${id}`).then((r) => r.data),
  search: (keyword) => api.get('/students/search', { params: { keyword } }).then((r) => r.data),
}

export const issuedBookService = {
  getAll: () => api.get('/issued-books').then((r) => r.data),
  getActive: () => api.get('/issued-books/active').then((r) => r.data),
  getReturned: () => api.get('/issued-books/returned').then((r) => r.data),
  getOverdue: () => api.get('/issued-books/overdue').then((r) => r.data),
  getByStudent: (studentId) => api.get(`/issued-books/student/${studentId}`).then((r) => r.data),
  issue: (bookId, studentId) =>
    api.post('/issued-books/issue', { bookId, studentId }).then((r) => r.data),
  returnBook: (id) => api.put(`/issued-books/return/${id}`).then((r) => r.data),
}

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats').then((r) => r.data),
}

export default api
