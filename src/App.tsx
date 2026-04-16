import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/auth-context'
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/protected-route'
import { AppLayout } from '@/components/layout/app-layout'
import { LoginPage } from '@/features/auth/login-page'
import { SignupPage } from '@/features/auth/signup-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { ApplicationsListPage } from '@/features/applications/applications-list-page'
import { ApplicationCreatePage } from '@/features/applications/application-create-page'
import { ApplicationEditPage } from '@/features/applications/application-edit-page'
import { ApplicationDetailPage } from '@/features/applications/application-detail-page'
import { SettingsPage } from '@/features/settings/settings-page'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/applications" element={<ApplicationsListPage />} />
                <Route path="/applications/new" element={<ApplicationCreatePage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />
                <Route path="/applications/:id/edit" element={<ApplicationEditPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
