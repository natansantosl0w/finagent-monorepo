from fastapi import FastAPI, Request
import json
import urllib.request
import os
import base64

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "LIVE", "together": bool(os.getenv("TOGETHER_API_KEY"))}

@app.post("/chat")
async def chat(request: Request):
    body = await request.body()
    data = json.loads(body)
    msg = data["message"]
    
    key = os.getenv("TOGETHER_API_KEY")
    if not key:
        return {"response": "Configurar TOGETHER_API_KEY em Render Environment"}
    
    # Together API urllib (Python nativo)
    payload = {
        "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        "messages": [{"role": "user", "content": f"Finanças Brasil: {msg}"}],
        "max_tokens": 300
    }
    
    req_data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        "https://api.together.xyz/v1/chat/completions",
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
        return {"response": f"Erro IA: {str(e)}. CDI 11.25% Selic recomendado."}
