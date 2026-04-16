import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './auth-context'
import { PageLoader } from '@/components/ui/spinner'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (user) return <Navigate to="/" replace />

  return <Outlet />
}
