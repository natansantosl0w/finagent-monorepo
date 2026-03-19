from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
import os

app = FastAPI()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    response = model.generate_content(
        pergunta.message,
        generation_config={
            "max_output_tokens": 150,
            "temperature": 0.1,
            "top_p": 0.8
        }
    )
    return {"response": response.text[:600]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
