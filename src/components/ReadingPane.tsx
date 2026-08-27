import DOMPurify from 'dompurify'
import { useState } from 'react'
import type { AttachmentMeta, Folder, MessageDetail } from '../types'
import { avatarColor, formatFileSize, formatFullDate, initials, senderEmail, senderName } from '../utils'
import { IconDownload, IconFile, IconMail, IconReply } from './icons'

interface ReadingPaneProps {
  message: MessageDetail | null
  folder: Folder
  loading: boolean
  error: string | null
  onReply: (to: string, subject: string) => void
  onDownloadAttachment: (uid: string, folder: Folder, attachment: AttachmentMeta) => Promise<void>
}

function AttachmentChip({
  attachment,
  onDownload,
}: {
  attachment: AttachmentMeta
  onDownload: () => Promise<void>
}) {
  const [downloading, setDownloading] = useState(false)

  async function handleClick() {
    setDownloading(true)
    try {
      await onDownload()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={downloading}
      className="flex items-center gap-2.5 rounded-xl border border-border bg-bg px-3 py-2 text-left text-sm transition-colors hover:border-accent hover:bg-accent-soft disabled:opacity-60"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-text-muted">
        <IconFile className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-text">{attachment.filename}</span>
        <span className="block text-xs text-text-muted">{formatFileSize(attachment.size)}</span>
      </span>
      <IconDownload className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
    </button>
  )
}

export function ReadingPane({ message, folder, loading, error, onReply, onDownloadAttachment }: ReadingPaneProps) {
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

  const name = senderName(message.sender)

  return (
    <div key={message.uid} className="flex h-full flex-col animate-[fade-in_0.2s_ease-out]">
      <div className="border-b border-border px-8 py-6">
        <h2 className="text-lg font-semibold tracking-tight text-text">{message.subject}</h2>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: avatarColor(name) }}
              aria-hidden
            >
              {initials(name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">{name}</p>
              <p className="truncate font-mono text-xs text-text-muted">{senderEmail(message.sender)}</p>
            </div>
          </div>
          <span className="shrink-0 text-xs text-text-muted">{formatFullDate(message.date)}</span>
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

        {message.attachments.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-2.5 text-xs font-medium text-text-muted">
              {message.attachments.length} adjunto{message.attachments.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {message.attachments.map((attachment) => (
                <AttachmentChip
                  key={attachment.index}
                  attachment={attachment}
                  onDownload={() => onDownloadAttachment(message.uid, folder, attachment)}
                />
              ))}
            </div>
          </div>
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
