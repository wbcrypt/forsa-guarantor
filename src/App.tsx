import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import PaymentsPage from './pages/payments/PaymentsPage'

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<Guard><Layout /></Guard>}>
        <Route index element={<DashboardPage />} />
        <Route path="payments" element={<PaymentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={qc}>
        <AuthProvider><AppRoutes /></AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
