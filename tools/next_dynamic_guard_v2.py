import os
import re

PROJECT_ROOT = os.getcwd()

TARGET_EXTENSIONS = (".ts", ".tsx")
EXCLUDE_DIRS = {"node_modules", ".next", ".git", "dist", "build"}

DYNAMIC_DECLARATION = "export const dynamic = 'force-dynamic';\n"

DANGEROUS_PATTERNS = [
    r"PrismaClient",
    r"prisma\.",
    r"request\.url",
    r"\bRequest\b",
    r"cookies\(",
    r"headers\(",
    r"fetch\(",
]

REPORT = []


def is_excluded(path: str) -> bool:
    return any(part in EXCLUDE_DIRS for part in path.split(os.sep))


def already_dynamic(content: str) -> bool:
    return "export const dynamic" in content


def contains_danger(content: str) -> bool:
    return any(re.search(pattern, content) for pattern in DANGEROUS_PATTERNS)


def fix_file(path: str):
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    content = "".join(lines)

    if already_dynamic(content):
        return

    if not contains_danger(content):
        return

    new_lines = []

    # Caso 1: arquivo começa com 'use client'
    if lines and re.match(r"""['"]use client['"];?""", lines[0].strip()):
        new_lines.append(lines[0])               # 'use client'
        new_lines.append("\n")
        new_lines.append(DYNAMIC_DECLARATION)    # dynamic
        new_lines.extend(lines[1:])

    # Caso 2: não é client component
    else:
        new_lines.append(DYNAMIC_DECLARATION)
        new_lines.append("\n")
        new_lines.extend(lines)

    with open(path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

    REPORT.append(path)


def scan():
    for root, dirs, files in os.walk(PROJECT_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            path = os.path.join(root, file)

            if is_excluded(path):
                continue

            if path.endswith(TARGET_EXTENSIONS):
                fix_file(path)


if __name__ == "__main__":
    scan()

    print("\n📊 RELATÓRIO DE CORREÇÕES")
    if not REPORT:
        print("✔ Nenhum arquivo precisou ser alterado.")
    else:
        for file in REPORT:
            print(f"✔ Corrigido: {file}")
        print(f"\n✅ Total de arquivos corrigidos: {len(REPORT)}")

