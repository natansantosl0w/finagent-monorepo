from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
import os

app = FastAPI()

# Aceita GEMINI_API_KEY OU GOOGLE_API_KEY
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("API key não encontrada!")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "ok", "api_key": bool(api_key)}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    try:
        response = model.generate_content(
            pergunta.message,
            generation_config={
                "max_output_tokens": 150,
                "temperature": 0.1
            }
        )
        return {"response": response.text[:600]}
    except Exception as e:
        return {"response": f"Erro Gemini: {str(e)[:100]}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
