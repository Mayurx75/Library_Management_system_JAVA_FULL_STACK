import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Books from './pages/Books.jsx'
import Students from './pages/Students.jsx'
import IssueBook from './pages/IssueBook.jsx'
import IssuedBooks from './pages/IssuedBooks.jsx'
import NotFound from './pages/NotFound.jsx'

function ProtectedOutlet() {
  // Placeholder for future auth: if (!token) return <Navigate to="/login" replace />;
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route element={<ProtectedOutlet />}>
            <Route index element={<Dashboard />} />
            <Route path="books" element={<Books />} />
            <Route path="students" element={<Students />} />
            <Route path="issue" element={<IssueBook />} />
            <Route path="history" element={<IssuedBooks />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
