'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Plus, MessageSquare, Menu, X } from 'lucide-react'

type Message = { role: 'user' | 'bot'; content: string }
type Conversation = { id: string; title: string; messages: Message[]; createdAt: number }

const MoniIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" rx="3" />
    <path d="M9 12h.01M15 12h.01" />
    <path d="M9 16s1 1 3 1 3-1 3-1" />
    <path d="M12 8V5" />
    <circle cx="12" cy="4" r="1" />
  </svg>
)

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### '))
      return <p key={i} className="font-bold text-indigo-300 mt-2">{line.replace('### ', '')}</p>

    if (line.startsWith('## '))
      return <p key={i} className="font-bold text-indigo-300 text-base mt-2">{line.replace('## ', '')}</p>

    if (line.startsWith('- ') || line.startsWith('• '))
      return (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-indigo-400 mt-0.5">•</span>
          <span>{parseBold(line.replace(/^[-•] /, ''))}</span>
        </div>
      )

    if (line.trim() === '') return <div key={i} className="h-1" />

    return <p key={i}>{parseBold(line)}</p>
  })
}

function parseBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      : part
  )
}

const STORAGE_KEY = 'moni_conversations'

function loadConversations(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs))
}

const newConversation = (): Conversation => ({
  id: Date.now().toString(),
  title: 'Nova conversa',
  messages: [
    {
      role: 'bot',
      content: 'Olá! Sou o **Moni**, seu assistente financeiro pessoal. Como posso te ajudar hoje?'
    }
  ],
  createdAt: Date.now()
})

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentId, setCurrentId] = useState<string>('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = loadConversations()
    if (saved.length > 0) {
      setConversations(saved)
      setCurrentId(saved[0].id)
    } else {
      const first = newConversation()
      setConversations([first])
      setCurrentId(first.id)
    }
  }, [])

  useEffect(() => {
    if (conversations.length > 0) saveConversations(conversations)
  }, [conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, currentId])

  const current = conversations.find(c => c.id === currentId)
  const messages = current?.messages || []

  const updateCurrent = (msgs: Message[]) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== currentId) return c

        const title =
          msgs.length >= 2 && c.title === 'Nova conversa'
            ? msgs[1].content.slice(0, 35) +
              (msgs[1].content.length > 35 ? '...' : '')
            : c.title

        return { ...c, messages: msgs, title }
      })
    )
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input }
    const newMsgs = [...messages, userMsg]

    updateCurrent(newMsgs)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages
            .filter(m => m.role === 'user' || m.role === 'bot')
            .map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await res.json()

      updateCurrent([
        ...newMsgs,
        { role: 'bot', content: data.reply }
      ])
    } catch {
      updateCurrent([
        ...newMsgs,
        { role: 'bot', content: 'Erro ao conectar. Tente novamente.' }
      ])
    }

    setLoading(false)
  }

  const handleNew = () => {
    const conv = newConversation()
    setConversations(prev => [conv, ...prev])
    setCurrentId(conv.id)
    setSidebarOpen(false)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    setConversations(prev => {
      const next = prev.filter(c => c.id !== id)

      if (id === currentId) {
        if (next.length > 0) setCurrentId(next[0].id)
        else {
          const fresh = newConversation()
          setCurrentId(fresh.id)
          return [fresh]
        }
      }

      return next
    })
  }

  const handleSelect = (id: string) => {
    setCurrentId(id)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen text-slate-100 overflow-hidden relative">
      {/* resto do JSX permanece igual */}
    </div>
  )
}
