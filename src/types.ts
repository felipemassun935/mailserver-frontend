export interface MessageSummary {
  uid: string
  sender: string
  subject: string
  date: string
  seen: boolean
}

export interface AttachmentMeta {
  index: number
  filename: string
  content_type: string
  size: number
}

export interface MessageDetail {
  uid: string
  sender: string
  to: string
  subject: string
  date: string
  body_text: string
  body_html: string | null
  attachments: AttachmentMeta[]
}

/** Identificador de UI para la carpeta seleccionada (no es necesariamente
 * el nombre real del mailbox IMAP, ver FolderPaths). */
export type FolderKey = 'INBOX' | 'SENT'

/** Nombres reales de los mailboxes IMAP en este servidor, resueltos por el
 * backend vía LIST (no siempre son literalmente "INBOX"/"Sent"). */
export interface FolderPaths {
  inbox: string
  sent: string | null
}
