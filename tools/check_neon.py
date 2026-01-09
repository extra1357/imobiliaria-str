import requests

def espiar_banco():
    print("🕵️ Investigando dados do Neon via API...")
    url = "https://imobiliaria-str.vercel.app/api/imoveis?publico=true"
    
    try:
        r = requests.get(url, timeout=15)
        if r.status_code == 200:
            dados = r.json()
            print(f"✅ Total de imóveis recebidos: {len(dados)}")
            for idx, p in enumerate(dados):
                print(f"--- Imóvel {idx+1} ---")
                print(f"ID: {p.get('id')}")
                print(f"STATUS: '{p.get('status')}'") # Aqui veremos se é 'ATIVO', 'ativo' ou 'Ativo'
                print(f"PREÇO: {p.get('preco')}")
        else:
            print(f"❌ Erro na API: Status {r.status_code}")
    except Exception as e:
        print(f"⚠️ Erro ao conectar: {e}")

if __name__ == "__main__":
    espiar_banco()