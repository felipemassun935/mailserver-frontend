import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { api, clearSession, getStoredSession, storeSession } from '../api/client'

interface AuthContextValue {
  email: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(() => getStoredSession()?.email ?? null)

  const value = useMemo<AuthContextValue>(
    () => ({
      email,
      login: async (loginEmail, password) => {
        const res = await api.login(loginEmail, password)
        storeSession(res.token, res.email)
        setEmail(res.email)
      },
      logout: () => {
        api.logout().catch(() => {})
        clearSession()
        setEmail(null)
      },
    }),
    [email],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
