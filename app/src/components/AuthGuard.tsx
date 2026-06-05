import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_auth') === 'true'
    if (!isAuth) {
      navigate('/admin', { replace: true })
    }
  }, [navigate, location.pathname])

  const isAuth = sessionStorage.getItem('admin_auth') === 'true'
  if (!isAuth) return null

  return <>{children}</>
}
