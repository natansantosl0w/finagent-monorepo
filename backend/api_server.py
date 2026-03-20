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
    history = data.get("history", [])

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return {"response": "❌ GEMINI_API_KEY não configurada"}

    try:
        # 🔥 MONTA CONVERSA COM CONTEXTO
        conversation_text = ""

        for m in history:
            if m["role"] == "user":
                conversation_text += f"Usuário: {m['content']}\n"
            else:
                conversation_text += f"Moni: {m['content']}\n"

        conversation_text += f"Usuário: {msg}"

        # 🔥 PROMPT MONI
        prompt = f"""
# Role
Você é Moni, uma especialista em finanças pessoais com profundo conhecimento da realidade brasileira.

# Task
Ajudar brasileiros a tomar decisões financeiras melhores.

# Instructions
- Responda em português do Brasil
- Seja prática e direta
- Dê passo a passo quando possível
- Use exemplos em reais (R$)
- Sempre termine com uma pergunta

# Conversa:
{conversation_text}
"""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

        response = requests.post(
            url,
            json={
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            }
        )

        data = response.json()

        if "candidates" in data:
            return {
                "reply": data["candidates"][0]["content"]["parts"][0]["text"]
            }
        else:
            return {
                "error": "Resposta inesperada do Gemini",
                "raw": data
            }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
