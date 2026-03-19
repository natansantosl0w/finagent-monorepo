from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
import os

app = FastAPI()

# Config direto (sem dotenv pra Render)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    try:
        response = model.generate_content(
            pergunta.message,
            generation_config={
                "max_output_tokens": 200,
                "temperature": 0.1
            }
        )
        return {"response": response.text[:800]}
    except Exception as e:
        return {"response": f"Erro: {str(e)[:100]}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
