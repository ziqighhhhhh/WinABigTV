import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'
import Survey from './pages/Survey'
import Prediction from './pages/Prediction'
import Success from './pages/Success'
import AuthGuard from './components/AuthGuard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/survey" element={<Survey />} />
      <Route path="/prediction" element={<Prediction />} />
      <Route path="/success" element={<Success />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AuthGuard>
            <Admin />
          </AuthGuard>
        }
      />
    </Routes>
  )
}
