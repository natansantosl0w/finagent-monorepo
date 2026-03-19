from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os

app = FastAPI()

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "TOGETHER", "key_ok": bool(os.getenv("TOGETHER_API_KEY"))}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    key = os.getenv("TOGETHER_API_KEY")
    if not key:
        return {"response": "❌ TOGETHER_API_KEY missing. Render Environment."}
    
    r = requests.post(
        "https://api.together.xyz/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            "messages": [{"role": "user", "content": pergunta.message}],
            "max_tokens": 400
        }
    )
    data = r.json()
    return {"response": data['choices'][0]['message']['content']}
