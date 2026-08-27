import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, ApiError } from './api/client'
import { ComposeModal } from './components/ComposeModal'
import { LoginPage } from './components/LoginPage'
import { MessageList } from './components/MessageList'
import { ReadingPane } from './components/ReadingPane'
import { Sidebar } from './components/Sidebar'
import { useAuth } from './context/AuthContext'
import type { AttachmentMeta, FolderKey, FolderPaths, MessageDetail, MessageSummary } from './types'

const SENT_NOT_FOUND = 'No se encontró la carpeta de enviados en este servidor'

function Mailbox() {
  const { email, logout } = useAuth()

  // "INBOX" es un nombre estándar de IMAP, casi siempre correcto de entrada.
  // El nombre real de "enviados" varía por servidor, así que arranca en null
  // hasta resolverlo contra el backend (ver useEffect de abajo).
  const [folderPaths, setFolderPaths] = useState<FolderPaths>({ inbox: 'INBOX', sent: null })
  const [folderKey, setFolderKey] = useState<FolderKey>('INBOX')
  const currentPath = folderKey === 'INBOX' ? folderPaths.inbox : folderPaths.sent

  const [messages, setMessages] = useState<MessageSummary[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [selectedUid, setSelectedUid] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<MessageDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [compose, setCompose] = useState<{ to?: string; subject?: string } | null>(null)

  const unreadCount = useMemo(
    () => (folderKey === 'INBOX' ? messages.filter((m) => !m.seen).length : 0),
    [folderKey, messages],
  )

  useEffect(() => {
    api
      .getFolders()
      .then(setFolderPaths)
      .catch(() => {
        // Si falla la resolución, seguimos con INBOX (asunción segura) y
        // "enviados" queda deshabilitado en vez de romper con un 400.
      })
  }, [])

  const loadMessages = useCallback(async (path: string) => {
    setListLoading(true)
    setListError(null)
    setSelectedUid(null)
    setSelectedMessage(null)
    try {
      const data = await api.listMessages(path)
      setMessages(data)
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'Error de conexión')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentPath) {
      loadMessages(currentPath)
    } else if (folderKey === 'SENT') {
      setMessages([])
      setSelectedUid(null)
      setSelectedMessage(null)
      setListLoading(false)
      setListError(SENT_NOT_FOUND)
    }
  }, [folderKey, currentPath, loadMessages])

  async function handleSelect(uid: string) {
    if (!currentPath) return
    setSelectedUid(uid)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const detail = await api.getMessage(uid, currentPath)
      setSelectedMessage(detail)
      setMessages((prev) => prev.map((m) => (m.uid === uid ? { ...m, seen: true } : m)))
    } catch (err) {
      setDetailError(err instanceof ApiError ? err.message : 'Error de conexión')
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleSend(to: string, subject: string, body: string, files: File[]) {
    await api.sendMessage(to, subject, body, files)
    if (folderKey === 'SENT' && folderPaths.sent) loadMessages(folderPaths.sent)
  }

  async function handleDownloadAttachment(uid: string, folder: string, attachment: AttachmentMeta) {
    await api.downloadAttachment(uid, folder, attachment.index, attachment.filename)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        folder={folderKey}
        onFolderChange={setFolderKey}
        onCompose={() => setCompose({})}
        email={email}
        onLogout={logout}
        unreadCount={unreadCount}
        sentAvailable={folderPaths.sent !== null}
      />

      <section className="flex w-96 shrink-0 flex-col border-r border-border bg-surface">
        <MessageList
          folder={folderKey}
          messages={messages}
          selectedUid={selectedUid}
          onSelect={handleSelect}
          loading={listLoading}
          error={listError}
        />
      </section>

      <main className="min-w-0 flex-1 bg-surface">
        <ReadingPane
          message={selectedMessage}
          folder={currentPath ?? ''}
          loading={detailLoading}
          error={detailError}
          onReply={(to, subject) =>
            setCompose({ to, subject: subject.startsWith('Re: ') ? subject : `Re: ${subject}` })
          }
          onDownloadAttachment={handleDownloadAttachment}
        />
      </main>

      {compose && (
        <ComposeModal
          initialTo={compose.to}
          initialSubject={compose.subject}
          onClose={() => setCompose(null)}
          onSend={handleSend}
        />
      )}
    </div>
  )
}

export default function App() {
  const { email } = useAuth()
  return email ? <Mailbox /> : <LoginPage />
}
