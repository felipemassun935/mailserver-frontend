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

export type Folder = 'INBOX' | 'Sent'
