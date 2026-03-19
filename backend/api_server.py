from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    try:
        prompt = f"""FinAgent financeiro brasileiro.
Pergunta: {pergunta.message}

Responda direto em português usando R$."""
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        return {"error": f"Erro: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
