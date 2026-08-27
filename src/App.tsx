import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from './api/client'
import { ComposeModal } from './components/ComposeModal'
import { LoginPage } from './components/LoginPage'
import { MessageList } from './components/MessageList'
import { ReadingPane } from './components/ReadingPane'
import { Sidebar } from './components/Sidebar'
import { useAuth } from './context/AuthContext'
import type { Folder, MessageDetail, MessageSummary } from './types'

function Mailbox() {
  const { email, logout } = useAuth()

  const [folder, setFolder] = useState<Folder>('INBOX')
  const [messages, setMessages] = useState<MessageSummary[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [selectedUid, setSelectedUid] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<MessageDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [compose, setCompose] = useState<{ to?: string; subject?: string } | null>(null)

  const loadMessages = useCallback(async (targetFolder: Folder) => {
    setListLoading(true)
    setListError(null)
    setSelectedUid(null)
    setSelectedMessage(null)
    try {
      const data = await api.listMessages(targetFolder)
      setMessages(data)
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'Error de conexión')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMessages(folder)
  }, [folder, loadMessages])

  async function handleSelect(uid: string) {
    setSelectedUid(uid)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const detail = await api.getMessage(uid, folder)
      setSelectedMessage(detail)
      setMessages((prev) => prev.map((m) => (m.uid === uid ? { ...m, seen: true } : m)))
    } catch (err) {
      setDetailError(err instanceof ApiError ? err.message : 'Error de conexión')
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleSend(to: string, subject: string, body: string) {
    await api.sendMessage(to, subject, body)
    if (folder === 'Sent') loadMessages('Sent')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        folder={folder}
        onFolderChange={setFolder}
        onCompose={() => setCompose({})}
        email={email}
        onLogout={logout}
      />

      <section className="flex w-96 shrink-0 flex-col border-r border-border bg-surface">
        <MessageList
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
          loading={detailLoading}
          error={detailError}
          onReply={(to, subject) =>
            setCompose({ to, subject: subject.startsWith('Re: ') ? subject : `Re: ${subject}` })
          }
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
