import { HashRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from './hooks/useToast'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import CourseDetail from './pages/CourseDetail'
import Lesson from './pages/Lesson'
import Dashboard from './pages/Dashboard'
import { Login, Register } from './pages/AuthPages'
import Settings from './pages/Settings'
import { EmptyState } from './components/ui'
import { Link } from 'react-router-dom'

// HashRouter keeps deep links and refresh working both in browsers and inside the Android WebView.
export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="lessons/:id" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<EmptyState title="Page not found"><Link className="btn btn-primary" to="/">Back to courses</Link></EmptyState>} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  )
}
