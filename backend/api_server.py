from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Pergunta(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "MOCK OK", "model": "finanças-br"}

@app.post("/chat")
async def chat(pergunta: Pergunta):
    msg = pergunta.message.lower()
    
    respostas = {
        "cdi": "CDI 11.25% hoje. **Melhor que poupança (6.17%)**. Tesouro Selic diário!",
        "poupança": "Poupança rende 6.17% (0.5%+70%CDI). **Segura mas perde inflação**.",
        "reserva": "Reserva: **6 meses salário**. Tesouro Selic 100% líquido R$0 IR.",
        "investir": "Comece **Tesouro Selic** (100% CDI). App Tesouro Direto grátis!",
        "inflação": "IPCA 4.5% 2026. CDI 11.25% **ganha inflação fácil**."
    }
    
    for chave, resposta in respostas.items():
        if chave in msg:
            return {"response": resposta}
    
    return {"response": "Finanças BR! Pergunte CDI/poupança/reserva/investir 💰"}
