from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.generativeai import GenerativeModel, configure
import os
import google.generativeai as genai

app = FastAPI()

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "ok", "gemini": bool(os.getenv("GEMINI_API_KEY"))}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = GenativeModel('gemini-1.5-flash')
        response = model.generate_content(f"Finanças Brasil R$: {pergunta.message}")
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
