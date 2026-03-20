'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

type Message = { role: 'user' | 'bot'; content: string }

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Olá! Sou o Moni, seu assistente financeiro. Como posso te ajudar?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })

      const data = await res.json()

      setMessages(prev => [
        ...prev,
        { role: 'bot', content: data.response || 'Erro ao responder' }
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'bot', content: 'Erro ao conectar com servidor.' }
      ])
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-2 rounded-xl ${
              msg.role === 'user'
                ? 'bg-indigo-600 ml-auto'
                : 'bg-white/10'
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="bg-white/10 px-4 py-2 rounded-xl w-fit">
            Moni está pensando...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-white/10 px-3 py-2 rounded-lg outline-none"
          placeholder="Pergunte ao Moni..."
        />

        <button
          onClick={handleSend}
          className="bg-indigo-600 px-4 rounded-lg"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
