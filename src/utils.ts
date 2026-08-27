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

export function formatFullDate(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })
}
