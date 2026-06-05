import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin', { replace: true })
    }
  }, [navigate, location.pathname])

  const token = localStorage.getItem('admin_token')
  if (!token) return null

  return <>{children}</>
}
