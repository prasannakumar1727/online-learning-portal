// Centralised API client: base URL, JSON, auth token, errors, network failures.
const TOKEN_KEY = 'lp_token'
const BASE_KEY = 'lp_api_base'
const TIMEOUT_MS = 15000

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message)
    this.status = status
    this.fields = fields || {}
  }
}

export const getApiBase = () => {
  let v = ''
  try { v = localStorage.getItem(BASE_KEY) || '' } catch { /* storage unavailable */ }
  return (v || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
}
export const setApiBase = (url) => {
  try {
    if (url) localStorage.setItem(BASE_KEY, url.trim().replace(/\/+$/, ''))
    else localStorage.removeItem(BASE_KEY)
  } catch { /* ignore */ }
}

// Only the opaque login token is kept client-side; all real data lives in the backend DB.
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }
export const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } }

async function request(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  let res
  try {
    res = await fetch(`${getApiBase()}${path}`, {
      method, headers, signal: ctrl.signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    throw new ApiError(0, e.name === 'AbortError'
      ? 'The server took too long to respond. Please try again.'
      : 'Cannot reach the server. Check your connection and the server address.')
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try { data = await res.json() } catch { /* non-JSON body */ }
  if (!res.ok) {
    if (res.status === 401 && token) {
      setToken(null) // expired or invalid token
      window.dispatchEvent(new Event('lp:unauthorized'))
    }
    throw new ApiError(res.status, data?.error || `Request failed (${res.status}).`, data?.fields)
  }
  return data
}

export const api = {
  health: () => request('/health'),
  register: (b) => request('/register', { method: 'POST', body: b }),
  login: (b) => request('/login', { method: 'POST', body: b }),
  logout: () => request('/logout', { method: 'POST' }),
  me: () => request('/me'),
  courses: () => request('/courses'),
  course: (id) => request(`/courses/${id}`),
  enroll: (id) => request(`/courses/${id}/enroll`, { method: 'POST' }),
  myCourses: () => request('/my-courses'),
  lesson: (id) => request(`/lessons/${id}`),
  complete: (id) => request(`/lessons/${id}/complete`, { method: 'POST' }),
}
