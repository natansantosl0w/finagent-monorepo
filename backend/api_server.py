from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
import json

app = FastAPI()

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "TOGETHER AI LIVE", "key": bool(os.getenv("TOGETHER_API_KEY"))}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    api_key = os.getenv("TOGETHER_API_KEY")
    if not api_key:
        return {"error": "TOGETHER_API_KEY missing"}
    
    url = "https://api.together.xyz/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        "messages": [{"role": "user", "content": f"Finanças Brasil R$: {pergunta.message} Responda direto prático."}],
        "max_tokens": 300,
        "temperature": 0.1
    }
    
    resp = requests.post(url, headers=headers, json=data)
    result = resp.json()
    return {"response": result['choices'][0]['message']['content']}
from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
import json

app = FastAPI()

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "TOGETHER AI", "free": True}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    api_key = os.getenv("TOGETHER_API_KEY")
    if not api_key:
        return {"error": "No API key"}
    
    url = "https://api.together.xyz/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",  # FREE!
        "messages": [{"role": "user", "content": f"Finanças Brasil: {pergunta.message}"}],
        "max_tokens": 200
    }
    
    resp = requests.post(url, headers=headers, json=data)
    return resp.json()
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "MOCK OK", "model": "finanças-br"}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    msg = pergunta.message.lower()
    
    respostas = {
        "cdi": "CDI 11.25% hoje. **Melhor que poupança (6.17%)**. Tesouro Selic diário!",
        "poupança": "Poupança rende 6.17% (0.5%+70%CDI). **Segura mas perde inflação**.",
        "reserva": "Reserva: **6 meses salário**. Tesouro Selic 100% líquido R$0 IR.",
        "investir": "Comece **Tesouro Selic** (100% CDI). App Tesouro Direto grátis!",
        "inflação": "IPCA 4.5% 2026. CDI 11.25% **ganha inflação fácil**."
    }
    
    for chave, resposta in respostas.items():
        if chave in msg:
            return {"response": resposta}
    
    return {"response": "Finanças BR! Pergunte CDI/poupança/reserva/investir 💰"}
