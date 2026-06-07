import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    setChecked(true)
  }, [location.pathname])

  const token = localStorage.getItem('admin_token')

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
