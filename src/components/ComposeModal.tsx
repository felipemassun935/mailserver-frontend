import { useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { formatFileSize } from '../utils'
import { IconClose, IconFile, IconPaperclip } from './icons'

interface ComposeModalProps {
  initialTo?: string
  initialSubject?: string
  onClose: () => void
  onSend: (to: string, subject: string, body: string, files: File[]) => Promise<void>
}

export function ComposeModal({ initialTo = '', initialSubject = '', onClose, onSend }: ComposeModalProps) {
  const [to, setTo] = useState(initialTo)
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFilesChosen(chosen: FileList | null) {
    if (!chosen) return
    setFiles((prev) => [...prev, ...Array.from(chosen)])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSending(true)
    try {
      await onSend(to, subject, body, files)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/10 animate-[fade-in_0.15s_ease-out]"
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl animate-[sheet-in_0.35s_var(--ease-spring)]"
      >
        <div className="flex items-center justify-between border-b border-border bg-bg px-4 py-3">
          <span className="text-sm font-medium text-text">Mensaje nuevo</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-6 w-6 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <IconClose className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col divide-y divide-border">
          <input
            type="email"
            required
            placeholder="Para"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-4 py-2.5 text-sm text-text outline-none placeholder:text-text-muted"
          />
          <input
            type="text"
            required
            placeholder="Asunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-4 py-2.5 text-sm text-text outline-none placeholder:text-text-muted"
          />
        </div>

        <textarea
          required
          placeholder="Escribí tu mensaje…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="flex-1 resize-none px-4 py-3 text-sm text-text outline-none placeholder:text-text-muted"
        />

        {files.length > 0 && (
          <ul className="flex flex-col gap-1.5 border-t border-border px-4 py-3">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center gap-2 rounded-lg bg-bg px-2.5 py-1.5 text-xs"
              >
                <IconFile className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-text">{file.name}</span>
                <span className="shrink-0 text-text-muted">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Quitar ${file.name}`}
                  className="shrink-0 text-text-muted transition-colors hover:text-danger"
                >
                  <IconClose className="h-3 w-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="px-4 pb-2 text-sm text-danger">{error}</p>}

        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFilesChosen(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Adjuntar archivo"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <IconPaperclip className="h-4 w-4" aria-hidden />
          </button>

          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-transform duration-150 ease-[var(--ease-spring)] hover:bg-accent-hover active:scale-95 disabled:opacity-60"
          >
            {sending ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  )
}
