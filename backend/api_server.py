from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os

app = FastAPI()

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "OK GROQ"}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    if not os.getenv("GROQ_API_KEY"):
        return {"error": "No GROQ_API_KEY"}
    
    client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=os.getenv("GROQ_API_KEY"))
    resp = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": pergunta.message}]
    )
    return {"response": resp.choices[0].message.content}
