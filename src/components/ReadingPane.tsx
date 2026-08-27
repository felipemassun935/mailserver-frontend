import DOMPurify from 'dompurify'
import type { MessageDetail } from '../types'
import { formatFullDate, senderEmail, senderName } from '../utils'
import { IconMail, IconReply } from './icons'

interface ReadingPaneProps {
  message: MessageDetail | null
  loading: boolean
  error: string | null
  onReply: (to: string, subject: string) => void
}

export function ReadingPane({ message, loading, error, onReply }: ReadingPaneProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        Abriendo mensaje…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-sm text-danger">{error}</div>
    )
  }

  if (!message) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <IconMail className="h-5 w-5" aria-hidden />
        </div>
        <p className="text-sm text-text-muted">Elegí un mensaje para leerlo</p>
      </div>
    )
  }

  return (
    <div key={message.uid} className="flex h-full flex-col animate-[fade-in_0.2s_ease-out]">
      <div className="border-b border-border px-8 py-6">
        <h2 className="text-lg font-semibold text-text">{message.subject}</h2>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">{senderName(message.sender)}</p>
            <p className="truncate font-mono text-xs text-text-muted">{senderEmail(message.sender)}</p>
          </div>
          <span className="shrink-0 font-mono text-xs text-text-muted">
            {formatFullDate(message.date)}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {message.body_html ? (
          <div
            className="email-body text-sm leading-relaxed text-text"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(message.body_html, {
                FORBID_TAGS: ['iframe', 'object', 'embed', 'style'],
                FORBID_ATTR: ['style'],
              }),
            }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-text">
            {message.body_text}
          </pre>
        )}
      </div>

      <div className="border-t border-border px-8 py-4">
        <button
          type="button"
          onClick={() => onReply(senderEmail(message.sender), message.subject)}
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
        >
          <IconReply className="h-4 w-4" aria-hidden />
          Responder
        </button>
      </div>
    </div>
  )
}
