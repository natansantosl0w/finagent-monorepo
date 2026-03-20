from fastapi import FastAPI, Request
import os
import requests

app = FastAPI()

@app.get("/health")
def health():
    key = os.getenv("GROQ_API_KEY")

    return {
        "has_key": key is not None,
        "key_length": len(key) if key else 0,
        "starts_with_gsk": key.startswith("gsk_") if key else False
    }

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    msg = data.get("message", "")

    groq_key = os.getenv("GROQ_API_KEY")

    if not groq_key:
        return {"response": "❌ GROQ_API_KEY não configurada"}

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama3-8b-8192",
                "messages": [
                    {
                        "role": "user",
                        "content": msg
                    }
                ]
            }
        )

        return {
            "status_code": response.status_code,
            "response": response.json()
        }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
