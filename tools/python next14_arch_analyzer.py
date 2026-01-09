import os
import sys
import re

ROOT = os.getcwd()

ERRORS = []
WARNINGS = []

def error(msg):
    ERRORS.append(msg)

def warn(msg):
    WARNINGS.append(msg)

def scan_files():
    for root, dirs, files in os.walk(ROOT):
        if 'node_modules' in root or '.next' in root:
            continue

        for file in files:
            path = os.path.join(root, file)

            # API routes cannot have JSX
            if re.search(r'app[/\\]api', path) and file.endswith(('.ts', '.js')):
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if '<div' in content or 'return (' in content:
                        error(f"API route contém JSX: {path}")

            # Server files cannot use use client
            if file.endswith(('.ts', '.tsx')):
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if 'use client' in content and '/api/' in path:
                        error(f"'use client' em API route: {path}")

            # Pages Router incompatibility
            if 'pages' in root and 'app' in ROOT:
                warn(f"Uso simultâneo de /pages e /app detectado: {path}")

def check_env():
    env_path = os.path.join(ROOT, '.env')
    if not os.path.exists(env_path):
        warn(".env não encontrado na raiz")

def report():
    print("\n=== NEXT 14 ARCHITECTURE ANALYZER ===\n")

    if ERRORS:
        print("❌ ERROS CRÍTICOS:")
        for e in ERRORS:
            print(" -", e)
    else:
        print("✅ Nenhum erro crítico encontrado")

    if WARNINGS:
        print("\n⚠️ AVISOS:")
        for w in WARNINGS:
            print(" -", w)

    print("\nResumo:")
    print(f"Erros: {len(ERRORS)} | Avisos: {len(WARNINGS)}")

    if '--strict' in sys.argv and ERRORS:
        sys.exit(1)

if __name__ == "__main__":
    scan_files()
    check_env()
    report()
