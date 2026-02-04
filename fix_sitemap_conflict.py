import os
import shutil

ROOT = os.getcwd()

# Detecta app ou src/app
APP_DIR = None
for candidate in ["app", "src/app"]:
    path = os.path.join(ROOT, candidate)
    if os.path.isdir(path):
        APP_DIR = path
        break

if not APP_DIR:
    print("❌ Nenhuma pasta 'app/' ou 'src/app/' encontrada.")
    exit(1)

print(f"📁 Usando pasta: {APP_DIR}\n")

sitemap_files = []

for root, dirs, files in os.walk(APP_DIR):
    for file in files:
        full = os.path.join(root, file)
        if "sitemap" in full and (
            file == "route.ts" or file.startswith("sitemap")
        ):
            sitemap_files.append(full)

if not sitemap_files:
    print("✅ Nenhum arquivo relacionado a sitemap encontrado.")
    exit(0)

print("🔍 Arquivos encontrados:\n")
for f in sitemap_files:
    print(" -", f)

metadata = [f for f in sitemap_files if f.endswith(("sitemap.ts", "sitemap.js"))]
routes = [f for f in sitemap_files if "sitemap.xml" in f and f.endswith("route.ts")]
optional = [f for f in sitemap_files if "[[..." in f]

print("\n📌 Análise:")

if metadata and (routes or optional):
    print("⚠️ Conflito: Metadata API + Route Handler\n")

    to_remove = routes + optional
    for f in to_remove:
        bak = f + ".bak"
        print(f"🗑️ Removendo: {f}")
        shutil.move(f, bak)
        print(f"📦 Backup: {bak}\n")

elif len(routes) + len(optional) > 1:
    print("⚠️ Múltiplas rotas sitemap.xml\n")

    keep = routes[0]
    print(f"✅ Mantendo: {keep}\n")

    for f in routes[1:] + optional:
        bak = f + ".bak"
        print(f"🗑️ Removendo: {f}")
        shutil.move(f, bak)
        print(f"📦 Backup: {bak}\n")

else:
    print("✅ Sitemap sem conflitos.")

print("\n🚀 Finalizado. Rode novamente:\n   npm run dev\n")

