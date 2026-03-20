from fastapi import FastAPI, Request
import json
import urllib.request
import os

app = FastAPI()

@app.get("/health")
def health():
    key = os.getenv("GROQ_API_KEY")

    return {
        "has_key": key is not None,
        "key_length": len(key) if key else 0,
        "starts_with_gsk": key.startswith("gsk_") if key else False
    }

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    msg = data["message"]
    
    # Prioridade GROQ > Together
    key = os.getenv("GROQ_API_KEY") or os.getenv("TOGETHER_API_KEY")
    if not key:
        return {"response": "❌ API key missing. Render Environment GROQ_API_KEY or TOGETHER_API_KEY"}
    
    # GROQ endpoint + model
    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": "llama3-70b-8192",
        "messages": [{"role": "user", "content": f"Finanças Brasil 2026: {msg}. Responda prático direto."}],
        "max_tokens": 400,
        "temperature": 0.1
    }
    
    req_data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json'
        },
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            return {"response": result['choices'][0]['message']['content']}
    except Exception as e:
        return {
            "response": f"Erro: {str(e)}. Fallback: Corte gastos, pague dívidas juro alto primeiro, Tesouro Selic reserva."
        }
