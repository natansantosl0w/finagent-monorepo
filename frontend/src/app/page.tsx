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
    if (line.startsWith('### ')) return <p key={i} className="font-bold text-indigo-300 mt-2">{line.replace('### ', '')}</p>
    if (line.startsWith('## ')) return <p key={i} className="font-bold text-indigo-300 text-base mt-2">{line.replace('## ', '')}</p>
    if (line.startsWith('- ') || line.startsWith('• ')) return (
      <div key={i} className="flex gap-2 items-start">
        <span className="text-indigo-400 mt-0.5">•</span>
        <span>{line.replace(/^[-•] /, '')}</span>
      </div>
    )
    if (line.trim() === '') return <div key={i} className="h-1" />
    return <p key={i}>{line}</p>
  })
}

const STORAGE_KEY = 'moni_conversations'

function loadConversations(): Conversation[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs))
}

const newConversation = (): Conversation => ({
  id: Date.now().toString(),
  title: 'Nova conversa',
  messages: [{ role: 'bot', content: 'Olá! Sou o Moni. Como posso te ajudar hoje?' }],
  createdAt: Date.now()
})

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentId, setCurrentId] = useState<string>('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
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
    setConversations(prev => prev.map(c => c.id === currentId ? { ...c, messages: msgs } : c))
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
        body: JSON.stringify({ message: input, history: messages })
      })

      const data = await res.json()

      updateCurrent([...newMsgs, { role: 'bot', content: data.reply }])
    } catch {
      updateCurrent([...newMsgs, { role: 'bot', content: 'Erro ao conectar.' }])
    }

    setLoading(false)
  }

  return (
    <div className="flex h-screen text-slate-100 bg-black">

      <main className="flex-1 flex flex-col">

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-xl max-w-[70%] ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}>
                {msg.role === 'bot' ? renderMarkdown(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {/* 🔥 LOADING MELHORADO */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-4 py-3 rounded-xl text-sm text-gray-300">
                <p className="mb-2">Moni está pensando...</p>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150" />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte ao Moni..."
            className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-xl outline-none"
          />
          <button onClick={handleSend} className="bg-indigo-600 px-4 rounded-xl">
            <Send size={16} />
          </button>
        </div>

      </main>
    </div>
  )
}
