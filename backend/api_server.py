from fastapi import FastAPI, Request
import json
import urllib.request
import os

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
    together_key = os.getenv("TOGETHER_API_KEY")

    if not groq_key and not together_key:
        return {"response": "❌ Nenhuma API key configurada"}

    try:
        # 🔥 GROQ (principal)
        if groq_key:
            url = "https://api.groq.com/openai/v1/chat/completions"
            key = groq_key
            model = "llama3-8b-8192"  # ✅ modelo garantido
        else:
            # fallback Together
            url = "https://api.together.xyz/v1/chat/completions"
            key = together_key
            model = "meta-llama/Llama-3-8b-chat-hf"

        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": f"Finanças Brasil 2026: {msg}. Responda direto e prático."
                }
            ],
            "max_tokens": 400,
            "temperature": 0.1
        }

        req_data = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(
            url,
            data=req_data,
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json"
            },
            method="POST"
        )

        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            return {
                "response": result["choices"][0]["message"]["content"]
            }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
