import os
import re

PROJECT_ROOT = os.getcwd()

API_PATH = os.path.join(PROJECT_ROOT, "src", "app", "api")
APP_PATH = os.path.join(PROJECT_ROOT, "src", "app")

errors = []
warnings = []
info = []

JSX_REGEX = re.compile(r"<[A-Za-z]")
HOOKS_REGEX = re.compile(r"use(State|Effect|Context|Reducer)")
USE_CLIENT_REGEX = re.compile(r"['\"]use client['\"]")
DYNAMIC_SSR_FALSE = re.compile(r"ssr\s*:\s*false")

def scan_file(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception:
        return ""

def check_api_routes():
    if not os.path.exists(API_PATH):
        warnings.append("⚠️ Nenhuma pasta app/api encontrada.")
        return

    for root, _, files in os.walk(API_PATH):
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                full_path = os.path.join(root, file)
                content = scan_file(full_path)

                if JSX_REGEX.search(content):
                    errors.append(f"❌ JSX encontrado em API Route: {full_path}")

                if USE_CLIENT_REGEX.search(content):
                    errors.append(f"❌ 'use client' em API Route: {full_path}")

                if HOOKS_REGEX.search(content):
                    errors.append(f"❌ Hook React usado em API Route: {full_path}")

def check_app_components():
    for root, _, files in os.walk(APP_PATH):
        for file in files:
            if not file.endswith((".ts", ".tsx", ".jsx")):
                continue

            full_path = os.path.join(root, file)
            content = scan_file(full_path)

            is_api = "/api/" in full_path.replace("\\", "/")
            uses_hooks = HOOKS_REGEX.search(content)
            has_use_client = USE_CLIENT_REGEX.search(content)

            if uses_hooks and not has_use_client and not is_api:
                errors.append(
                    f"❌ Hook React sem 'use client': {full_path}"
                )

            if has_use_client and is_api:
                errors.append(
                    f"❌ 'use client' em API: {full_path}"
                )

            if DYNAMIC_SSR_FALSE.search(content):
                warnings.append(
                    f"⚠️ dynamic(..., ssr:false) detectado: {full_path}"
                )

def check_structure():
    pages_path = os.path.join(PROJECT_ROOT, "pages")
    if os.path.exists(pages_path):
        errors.append("❌ Pasta 'pages/' encontrada (incompatível com App Router)")

    layout = os.path.join(APP_PATH, "layout.tsx")
    if not os.path.exists(layout):
        errors.append("❌ layout.tsx não encontrado em app/")

    page = os.path.join(APP_PATH, "page.tsx")
    if not os.path.exists(page):
        warnings.append("⚠️ page.tsx não encontrado na raiz de app/")

def print_report():
    print("\n================ NEXT.JS 14 STRUCTURE ANALYSIS ================\n")

    if errors:
        print("ERROS CRÍTICOS:")
        for e in errors:
            print(e)
    else:
        print("✔️ Nenhum erro crítico encontrado.")

    print("\n---------------------------------------------------------------\n")

    if warnings:
        print("AVISOS:")
        for w in warnings:
            print(w)
    else:
        print("✔️ Nenhum aviso estrutural.")

    print("\n---------------------------------------------------------------\n")
    print("INFO:")
    print(f"📁 Projeto analisado em: {PROJECT_ROOT}")
    print("\n===============================================================\n")

if __name__ == "__main__":
    check_structure()
    check_api_routes()
    check_app_components()
    print_report()
