from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os

app = FastAPI()
client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=os.getenv("GROQ_API_KEY"))

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "ok", "groq": True}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    resp = client.chat.completions.create(
        model="llama3-8b-8192",  # FREE & RÁPIDO!
        messages=[{"role": "user", "content": f"Finanças BR: {pergunta.message}"}]
    )
    return {"response": resp.choices[0].message.content}
