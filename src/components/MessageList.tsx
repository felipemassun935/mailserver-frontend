import type { MessageSummary } from '../types'
import { formatShortDate, senderName } from '../utils'

interface MessageListProps {
  messages: MessageSummary[]
  selectedUid: string | null
  onSelect: (uid: string) => void
  loading: boolean
  error: string | null
}

export function MessageList({ messages, selectedUid, onSelect, loading, error }: MessageListProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        Cargando mensajes…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
        <p className="text-sm font-medium text-danger">No se pudo cargar la bandeja</p>
        <p className="text-xs text-text-muted">{error}</p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
        <p className="text-sm font-medium text-text">No hay mensajes acá</p>
        <p className="text-xs text-text-muted">Los mensajes nuevos van a aparecer en esta lista.</p>
      </div>
    )
  }

  return (
    <ul className="h-full overflow-y-auto">
      {messages.map((msg, i) => {
        const selected = msg.uid === selectedUid
        return (
          <li
            key={msg.uid}
            style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
            className="animate-[fade-in_0.25s_ease-out_backwards]"
          >
            <button
              type="button"
              onClick={() => onSelect(msg.uid)}
              className={`flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left transition-colors ${
                selected ? 'bg-accent-soft' : 'hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`flex min-w-0 items-center gap-2 truncate text-sm ${
                    msg.seen ? 'font-normal text-text-muted' : 'font-semibold text-text'
                  }`}
                >
                  {!msg.seen && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  )}
                  <span className="truncate">{senderName(msg.sender)}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-text-muted">
                  {formatShortDate(msg.date)}
                </span>
              </div>
              <span
                className={`truncate text-sm ${msg.seen ? 'text-text-muted' : 'text-text'}`}
              >
                {msg.subject}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
