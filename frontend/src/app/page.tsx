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
      const title = msgs.length >= 2 && c.title === 'Nova conversa'
        ? msgs[1].content.slice(0, 35) + (msgs[1].content.length > 35 ? '...' : '')
        : c.title
      return { ...c, messages: msgs, title }
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
        body: JSON.stringify({
          message: input,
          history: messages
            .filter(m => m.role === 'user' || m.role === 'bot')
            .map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json()
      updateCurrent([...newMsgs, { role: 'bot', content: data.reply }])
    } catch {
      updateCurrent([...newMsgs, { role: 'bot', content: 'Erro ao conectar. Tente novamente.' }])
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
    <div className="flex h-screen text-slate-100 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #0f1117 50%, #0a0d1f 100%)' }}>

      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:relative top-0 left-0 h-full w-64 z-30
        flex flex-col border-r border-white/10
        bg-slate-900/80 backdrop-blur-xl
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/80 flex items-center justify-center border border-indigo-500/30">
              <MoniIcon size={14} />
            </div>
            <span className="text-sm font-semibold text-slate-100">Moni</span>
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-3">
          <button onClick={handleNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200">
            <Plus className="w-3.5 h-3.5" />
            Nova conversa
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide">
          {conversations.map(conv => (
            <div key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                conv.id === currentId
                  ? 'bg-indigo-600/25 border border-indigo-500/30 text-white'
                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
              }`}>
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
              <span className="flex-1 text-xs truncate">{conv.title}</span>
              <button
                onClick={e => handleDelete(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-red-400 transition-all flex-shrink-0">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-xs text-slate-600 text-center">Organize sua vida financeira com inteligência.</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative z-10 min-w-0">

        <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 backdrop-blur-md bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400">
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-slate-100 truncate">
                {current?.title || 'Nova conversa'}
              </h1>
              <p className="text-xs text-slate-500">Dê o próximo passo na sua vida financeira.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            online
          </div>
        </header>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4 scrollbar-hide">
          <div className="max-w-2xl mx-auto w-full space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`animate-message flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border text-xs font-semibold ${
                  msg.role === 'bot'
                    ? 'bg-indigo-600/70 backdrop-blur text-white shadow-lg shadow-indigo-900/50 border-indigo-500/30'
                    : 'bg-slate-700/60 backdrop-blur text-slate-300 border-slate-600/30'
                }`}>
                  {msg.role === 'bot' ? <MoniIcon size={14} /> : 'eu'}
                </div>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed space-y-0.5 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600/70 backdrop-blur-md text-white rounded-br-sm shadow-lg shadow-indigo-900/30 border border-indigo-500/20'
                    : 'bg-white/5 backdrop-blur-md border border-white/10 text-slate-200 rounded-bl-sm shadow-lg shadow-black/20'
                }`}>
                  {msg.role === 'bot' ? renderMarkdown(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="animate-message flex items-end gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-600/70 backdrop-blur flex items-center justify-center shadow-lg border border-indigo-500/30">
                  <MoniIcon size={14} />
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm shadow-lg">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
              {['Como montar reserva de emergência?', 'CDI vs Poupança', 'Como sair das dívidas?'].map(s => (
                <button key={s} onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-400 bg-white/5 backdrop-blur hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 focus-within:border-indigo-500/50 transition-all duration-300 shadow-xl shadow-black/30">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Pergunte ao Moni..."
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                disabled={loading}
              />
              <button onClick={handleSend} disabled={!input.trim() || loading}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-600/80 backdrop-blur hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-900/50 border border-indigo-500/30 flex-shrink-0">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
