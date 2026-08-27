import type { Folder, MessageDetail, MessageSummary } from '../types'

const TOKEN_KEY = 'webmail_token'
const EMAIL_KEY = 'webmail_email'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function getStoredSession(): { token: string; email: string } | null {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const email = sessionStorage.getItem(EMAIL_KEY)
  if (!token || !email) return null
  return { token, email }
}

export function storeSession(token: string, email: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(EMAIL_KEY, email)
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(EMAIL_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getStoredSession()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (session) headers.set('Authorization', `Bearer ${session.token}`)

  const res = await fetch(`/api${path}`, { ...options, headers })

  if (res.status === 401) {
    clearSession()
    throw new ApiError(401, 'Sesión expirada')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.detail ?? 'Error inesperado')
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; email: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  listMessages: (folder: Folder, limit = 50) =>
    request<MessageSummary[]>(`/messages?folder=${encodeURIComponent(folder)}&limit=${limit}`),

  getMessage: (uid: string, folder: Folder) =>
    request<MessageDetail>(`/messages/${encodeURIComponent(uid)}?folder=${encodeURIComponent(folder)}`),

  sendMessage: (to: string, subject: string, body: string) =>
    request<void>('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ to, subject, body }),
    }),
}
