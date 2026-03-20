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
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveConversations(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs))
}
const newConversation = (): Conversation => ({
  id: Date.now().toString(),
  title: 'Nova conversa',
  messages: [{ role: 'bot', content: 'Olá! Sou o **Moni**, seu assistente financeiro pessoal. Como posso te ajudar hoje?' }],
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
    setConversations(prev => prev.map(c => {
      if (c.id !== currentId) return c
      return { ...c, messages: msgs }
    }))
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
      updateCurrent([...newMsgs, { role: 'bot', content: 'Erro ao conectar. Tente novamente.' }])
    }

    setLoading(false)
  }

  return (
    <div className="flex h-screen text-slate-100 bg-black">
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 border border-white/10 text-slate-200'
              }`}>
                {msg.role === 'bot' ? renderMarkdown(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {/* ✅ LOADING CORRETO (SEM QUEBRAR UI) */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-sm text-slate-300 max-w-[80%]">
                <p className="mb-2 opacity-80">Moni está pensando...</p>
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/10 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte ao Moni..."
            className="flex-1 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white outline-none"
          />
          <button onClick={handleSend} className="bg-indigo-600 px-4 rounded-xl">
            <Send size={16} />
          </button>
        </div>
      </main>
    </div>
  )
}
