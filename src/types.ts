export interface MessageSummary {
  uid: string
  sender: string
  subject: string
  date: string
  seen: boolean
}

export interface MessageDetail {
  uid: string
  sender: string
  to: string
  subject: string
  date: string
  body_text: string
  body_html: string | null
}

export type Folder = 'INBOX' | 'Sent'
