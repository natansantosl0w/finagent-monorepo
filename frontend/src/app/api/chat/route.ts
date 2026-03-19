import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    
    // MUDANÇA: Backend Render + endpoint correto
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    
    const data = await res.json()
    return NextResponse.json({ reply: data.response }) // response → reply
  } catch {
    return NextResponse.json({ reply: '❌ Backend Python offline.' })
  }
}
