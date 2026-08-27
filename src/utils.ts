/** Extrae el nombre visible de un header "Nombre <email>", o el email si no hay nombre. */
export function senderName(raw: string): string {
  const match = raw.match(/^"?([^"<]*)"?\s*<.+>$/)
  const name = match?.[1]?.trim()
  return name || raw.replace(/[<>]/g, '').trim()
}

export function senderEmail(raw: string): string {
  const match = raw.match(/<([^>]+)>/)
  return match?.[1] ?? raw.trim()
}

/** Formato corto estilo Gmail: hora si es hoy, día/mes si no. */
export function formatShortDate(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso

  const now = new Date()
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (sameDay) {
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

const AVATAR_PALETTE = ['#0f8b8d', '#5b6b8c', '#8c6d4f', '#6b7fa3', '#7a8c5b', '#8c5b6f']

export function initials(name: string): string {
  const clean = name.trim()
  if (!clean) return '?'
  const parts = clean.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + second).toUpperCase()
}

export function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatFullDate(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })
}
