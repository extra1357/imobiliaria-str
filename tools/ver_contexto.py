import os

def ver_contexto():
    caminho = "src/app/page.jsx"
    if os.path.exists(caminho):
        with open(caminho, 'r', encoding='utf-8') as f:
            linhas = f.readlines()
            # Mostra da linha 20 até a 40 (ajustado para índice zero)
            print("--- TRECHO DO CÓDIGO (Linhas 20-40) ---")
            for i in range(19, min(40, len(linhas))):
                print(f"{i+1}: {linhas[i].strip()}")

if __name__ == "__main__":
    ver_contexto()