import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, setToken, clearToken } from '../lib/api'

interface GuarantorUser {
  id: string
  email: string
  fullName: string
  tenantId: string
  portalType: string
}

interface AuthCtx {
  user: GuarantorUser | null
  loading: boolean
  login: (email: string, password: string, tenantId: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GuarantorUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('guarantor_token')
    if (!t) { setLoading(false); return }
    authApi.me()
      .then(r => setUser(r.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string, tenantId: string) => {
    const r = await authApi.login({ email, password, tenantId })
    // T-109/K-16 — must also store the refresh token; the refresh
    // interceptor in lib/api.ts needs it to send in the request body.
    setToken(r.data.accessToken, r.data.refreshToken)
    const me = await authApi.me()
    setUser(me.data)
  }

  const logout = () => {
    authApi.logout().catch(() => {})
    clearToken()
    setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>
}
