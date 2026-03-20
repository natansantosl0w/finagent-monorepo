from fastapi import FastAPI, Request
import os
import requests

app = FastAPI()

@app.get("/health")
def health():
    key = os.getenv("GEMINI_API_KEY")

    return {
        "has_gemini_key": key is not None,
        "key_length": len(key) if key else 0
    }

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    msg = data.get("message", "")

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return {"response": "❌ GEMINI_API_KEY não configurada"}

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

        response = requests.post(
            url,
            json={
                "contents": [
                    {
                        "parts": [
                            {
                                "text": f"Você é uma IA de finanças no Brasil. Responda direto e prático: {msg}"
                            }
                        ]
                    }
                ]
            }
        )

        data = response.json()

        return {
            "response": data["candidates"][0]["content"]["parts"][0]["text"]
        }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
