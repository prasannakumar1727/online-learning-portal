import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!getToken())

  useEffect(() => {
    if (!getToken()) return
    api.me().then((d) => setUser(d.user)).catch(() => setToken(null)).finally(() => setReady(true))
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener('lp:unauthorized', onUnauthorized)
    return () => window.removeEventListener('lp:unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (email, password) => {
    const d = await api.login({ email, password })
    setToken(d.token)
    setUser(d.user)
  }, [])

  const logout = useCallback(async () => {
    try { await api.logout() } catch { /* token may already be invalid */ }
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
