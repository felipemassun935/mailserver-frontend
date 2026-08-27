import type { ComponentType, SVGProps } from 'react'
import type { FolderKey } from '../types'
import { IconCompose, IconInbox, IconMail, IconSent } from './icons'

interface SidebarProps {
  folder: FolderKey
  onFolderChange: (folder: FolderKey) => void
  onCompose: () => void
  email: string | null
  onLogout: () => void
  unreadCount: number
  sentAvailable: boolean
}

const FOLDERS: { id: FolderKey; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { id: 'INBOX', label: 'Recibidos', icon: IconInbox },
  { id: 'SENT', label: 'Enviados', icon: IconSent },
]

export function Sidebar({
  folder,
  onFolderChange,
  onCompose,
  email,
  onLogout,
  unreadCount,
  sentAvailable,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface px-3 py-4">
      <div className="mb-4 flex items-center gap-2.5 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white">
          <IconMail className="h-4 w-4" aria-hidden />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-text">Correo</span>
      </div>

      <button
        type="button"
        onClick={onCompose}
        className="mb-5 flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-transform duration-150 ease-[var(--ease-spring)] hover:bg-accent-hover active:scale-95"
      >
        <IconCompose className="h-4 w-4" aria-hidden />
        Redactar
      </button>

      <nav className="flex flex-col gap-0.5">
        {FOLDERS.map((f) => {
          const disabled = f.id === 'SENT' && !sentAvailable
          return (
            <button
              key={f.id}
              type="button"
              disabled={disabled}
              onClick={() => onFolderChange(f.id)}
              title={disabled ? 'No se encontró la carpeta de enviados en este servidor' : undefined}
              className={`flex items-center gap-3 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                disabled
                  ? 'cursor-not-allowed text-text-muted/50'
                  : folder === f.id
                    ? 'bg-accent-soft text-accent-hover'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text'
              }`}
            >
              <f.icon className="h-4 w-4" aria-hidden />
              <span className="flex-1 text-left">{f.label}</span>
              {f.id === 'INBOX' && unreadCount > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                    folder === f.id ? 'bg-white/70 text-accent-hover' : 'bg-surface-hover text-text-muted'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-border pt-3">
        <p className="truncate px-2 text-xs text-text-muted" title={email ?? ''}>
          {email}
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-full px-3.5 py-2 text-left text-sm font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
