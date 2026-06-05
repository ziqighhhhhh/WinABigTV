import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'
import Register from './pages/Register'
import AuthGuard from './components/AuthGuard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AuthGuard>
            <Admin />
          </AuthGuard>
        }
      />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}
