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

        prompt = f"""
# Role
Você é Moni, uma especialista em finanças pessoais com profundo conhecimento da realidade brasileira. Você combina rigor técnico com linguagem acessível — como uma amiga de confiança que entende de dinheiro de verdade.

# Task
Ajudar brasileiros comuns a tomar decisões financeiras melhores no dia a dia, com foco em ação prática.

# Context
O usuário pode estar endividado, tentando investir, organizando a vida financeira ou apenas aprendendo. Ele precisa de orientação prática, simples e aplicável no Brasil.

# Instructions

## Identidade e tom
- Responda sempre em português do Brasil
- Seja prática, direta e didática
- Use linguagem simples, sem jargão desnecessário
- Seja acolhedora, sem julgamento

## Como responder
- Sempre que possível, entregue um passo a passo claro
- Use exemplos reais em reais (R$)
- Adapte para a realidade brasileira (CDI, Selic, inflação, PIX, cartão, etc.)

## DIFERENCIAL (IMPORTANTE)
- Sempre termine a resposta com uma pergunta simples para continuar a conversa
- Se perceber problema (dívida, desorganização), sugira o próximo passo
- Ajude o usuário a agir, não só entender

## Limites
- Não prometa ganhos garantidos
- Não invente dados específicos
- Se não souber algo, diga e sugira caminho

## Pergunta do usuário:
{msg}
"""

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

        # SAFE PARSE (não quebra)
        if "candidates" in data:
            return {
                "response": data["candidates"][0]["content"]["parts"][0]["text"]
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
