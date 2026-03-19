import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      // Timeout manual simples
    })
    
    const data = await res.json()
    return NextResponse.json({ reply: data.response })
    
  } catch (error: any) {
    return NextResponse.json({ 
      reply: error.name === 'AbortError' 
        ? '⏳ Moni pensando... Aguarde 30s' 
        : '❌ Backend offline. Tente novamente.'
    })
  }
}
