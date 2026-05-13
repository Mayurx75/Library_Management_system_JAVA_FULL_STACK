import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Footer from '../components/Footer.jsx'

/**
 * App shell: top navigation, desktop sidebar, routed content, footer, global toasts.
 * Nested routes render inside <Outlet /> — ready for an auth guard wrapper later.
 */
export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <Navbar />
      <Sidebar />
      <main className="flex-1 pt-16 lg:pl-64">
        <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 lg:px-10">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'text-sm',
          style: {
            borderRadius: '12px',
            padding: '12px 14px',
          },
        }}
      />
    </div>
  )
}
