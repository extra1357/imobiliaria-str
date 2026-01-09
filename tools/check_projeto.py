import os
import re

def analisar_codigo_async():
    print("🚀 Analisador Digital Imóveis v1.0")
    print("-" * 30)
    
    caminho_page = "src/app/page.jsx"
    
    if not os.path.exists(caminho_page):
        print("❌ Erro: page.jsx não encontrado!")
        return

    with open(caminho_page, 'r', encoding='utf-8') as f:
        conteudo = f.read()
        
    # Verifica se existe o padrão de busca assíncrona
    if "async" in conteudo and "await fetch" in conteudo:
        print("✅ OK: Busca assíncrona detectada.")
    else:
        print("⚠️ ALERTA: Você pode estar renderizando sem esperar o await!")

    # Verifica se o SSR está desativado (para evitar erro 418)
    if "ssr: false" in conteudo:
        print("✅ OK: SSR desativado para evitar conflito de hidratação.")
    else:
        print("⚠️ ALERTA: SSR está ligado. O erro #418 pode voltar.")

    # Verifica se a API está no lugar certo
    api_path = "src/app/api/imoveis/route.ts"
    if os.path.exists(api_path):
        print("✅ OK: Rota da API encontrada em src/app/api.")
    else:
        print("❌ ERRO: Rota da API faltando ou com nome errado.")

if __name__ == "__main__":
    analisar_codigo_async()