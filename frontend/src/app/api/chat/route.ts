import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    
    console.log('Chamando backend:', process.env.NEXT_PUBLIC_API_URL)
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`)
    }
    
    const data = await res.json()
    return NextResponse.json({ reply: data.response || data.reply })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      reply: `❌ Erro backend: ${error.message}. Tente novamente.` 
    })
  }
}
