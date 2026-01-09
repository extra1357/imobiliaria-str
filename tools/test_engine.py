import os
import requests

def testar_saude_api():
    print("🤖 Iniciando teste de saúde da API...")
    url = "https://imobiliaria-str.vercel.app/api/imoveis?publico=true" # Mude para sua URL real
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            dados = response.json()
            print(f"✅ API Online! Encontrados {len(dados)} registros brutos.")
        else:
            print(f"❌ API retornou erro {response.status_code}")
    except Exception as e:
        print(f"⚠️ Não consegui conectar na API online: {e}")

if __name__ == "__main__":
    testar_saude_api()