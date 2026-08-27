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

function authHeaders(): Headers {
  const headers = new Headers()
  const session = getStoredSession()
  if (session) headers.set('Authorization', `Bearer ${session.token}`)
  return headers
}

async function assertOk(res: Response): Promise<void> {
  if (res.status === 401) {
    clearSession()
    throw new ApiError(401, 'Sesión expirada')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.detail ?? 'Error inesperado')
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = authHeaders()
  headers.set('Content-Type', 'application/json')

  const res = await fetch(`/api${path}`, { ...options, headers })
  await assertOk(res)

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

  sendMessage: async (to: string, subject: string, body: string, files: File[] = []) => {
    const form = new FormData()
    form.append('to', to)
    form.append('subject', subject)
    form.append('body', body)
    for (const file of files) form.append('files', file)

    const res = await fetch('/api/messages/send', { method: 'POST', headers: authHeaders(), body: form })
    await assertOk(res)
  },

  downloadAttachment: async (uid: string, folder: Folder, index: number, filename: string) => {
    const res = await fetch(
      `/api/messages/${encodeURIComponent(uid)}/attachments/${index}?folder=${encodeURIComponent(folder)}`,
      { headers: authHeaders() },
    )
    await assertOk(res)

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  },
}
