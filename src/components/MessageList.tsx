import type { FolderKey, MessageSummary } from '../types'
import { avatarColor, formatShortDate, initials, senderName } from '../utils'

interface MessageListProps {
  folder: FolderKey
  messages: MessageSummary[]
  selectedUid: string | null
  onSelect: (uid: string) => void
  loading: boolean
  error: string | null
}

const FOLDER_LABEL: Record<FolderKey, string> = {
  INBOX: 'Recibidos',
  SENT: 'Enviados',
}

export function MessageList({ folder, messages, selectedUid, onSelect, loading, error }: MessageListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-baseline gap-2 border-b border-border px-5 py-4">
        <h1 className="text-base font-semibold tracking-tight text-text">{FOLDER_LABEL[folder]}</h1>
        {!loading && !error && (
          <span className="text-xs text-text-muted">{messages.length}</span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            Cargando mensajes…
          </div>
        )}

        {!loading && error && (
          <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
            <p className="text-sm font-medium text-danger">No se pudo cargar la bandeja</p>
            <p className="text-xs text-text-muted">{error}</p>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
            <p className="text-sm font-medium text-text">No hay mensajes acá</p>
            <p className="text-xs text-text-muted">Los mensajes nuevos van a aparecer en esta lista.</p>
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <ul>
            {messages.map((msg, i) => {
              const selected = msg.uid === selectedUid
              const name = senderName(msg.sender)
              return (
                <li
                  key={msg.uid}
                  style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
                  className="animate-[fade-in_0.25s_ease-out_backwards]"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(msg.uid)}
                    className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors ${
                      selected ? 'bg-accent-soft' : 'hover:bg-surface-hover'
                    }`}
                  >
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: avatarColor(name) }}
                      aria-hidden
                    >
                      {initials(name)}
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={`flex min-w-0 items-center gap-2 truncate text-sm ${
                            msg.seen ? 'font-normal text-text-muted' : 'font-semibold text-text'
                          }`}
                        >
                          {!msg.seen && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                          )}
                          <span className="truncate">{name}</span>
                        </span>
                        <span className="shrink-0 text-xs text-text-muted">{formatShortDate(msg.date)}</span>
                      </span>
                      <span className={`truncate text-sm ${msg.seen ? 'text-text-muted' : 'text-text'}`}>
                        {msg.subject}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
