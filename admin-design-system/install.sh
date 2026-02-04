#!/bin/bash

# ============================================
# 🎨 STR Admin Design System - Script de Instalação
# ============================================

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🎨 STR ADMIN DESIGN SYSTEM - INSTALAÇÃO AUTOMÁTICA      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório base (ajuste se necessário)
BASE_DIR="$(pwd)"

echo -e "${BLUE}📁 Diretório base: ${BASE_DIR}${NC}"
echo ""

# ============================================
# 1. Criar estrutura de pastas
# ============================================
echo -e "${YELLOW}[1/5] Criando estrutura de pastas...${NC}"

mkdir -p src/components/admin
mkdir -p src/styles

echo -e "${GREEN}✓ Pastas criadas${NC}"

# ============================================
# 2. Fazer backup do layout atual (se existir)
# ============================================
echo -e "${YELLOW}[2/5] Verificando layout atual...${NC}"

if [ -f "src/app/admin/layout.tsx" ]; then
    cp src/app/admin/layout.tsx src/app/admin/layout.backup.tsx
    echo -e "${GREEN}✓ Backup criado: src/app/admin/layout.backup.tsx${NC}"
else
    echo -e "${BLUE}ℹ Nenhum layout existente encontrado${NC}"
fi

# ============================================
# 3. Instruções para copiar os arquivos
# ============================================
echo -e "${YELLOW}[3/5] Copiando arquivos do Design System...${NC}"
echo ""
echo -e "${BLUE}Por favor, copie os seguintes arquivos para seu projeto:${NC}"
echo ""
echo "  📄 layout.tsx           → src/app/admin/layout.tsx"
echo "  📄 index.tsx (components) → src/components/admin/index.tsx"
echo "  📄 page.tsx (usuarios)  → src/app/admin/usuarios/page.tsx (exemplo)"
echo ""

# ============================================
# 4. Verificar dependências
# ============================================
echo -e "${YELLOW}[4/5] Verificando dependências...${NC}"

# Verifica se Next.js está instalado
if grep -q "\"next\":" package.json 2>/dev/null; then
    echo -e "${GREEN}✓ Next.js encontrado${NC}"
else
    echo -e "${RED}✗ Next.js não encontrado no package.json${NC}"
fi

# Verifica Tailwind CSS
if [ -f "tailwind.config.js" ] || [ -f "tailwind.config.ts" ]; then
    echo -e "${GREEN}✓ Tailwind CSS configurado${NC}"
else
    echo -e "${RED}✗ Tailwind CSS não encontrado${NC}"
    echo -e "${YELLOW}  Execute: npm install -D tailwindcss postcss autoprefixer${NC}"
fi

# ============================================
# 5. Instruções finais
# ============================================
echo ""
echo -e "${YELLOW}[5/5] Configurações adicionais necessárias...${NC}"
echo ""
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│                    📋 PRÓXIMOS PASSOS                       │"
echo "├─────────────────────────────────────────────────────────────┤"
echo "│                                                             │"
echo "│ 1. Copie os arquivos do Design System para seu projeto     │"
echo "│                                                             │"
echo "│ 2. Atualize o tsconfig.json (se necessário):               │"
echo "│    {                                                        │"
echo "│      \"compilerOptions\": {                                  │"
echo "│        \"paths\": {                                          │"
echo "│          \"@/*\": [\"./src/*\"]                                │"
echo "│        }                                                    │"
echo "│      }                                                      │"
echo "│    }                                                        │"
echo "│                                                             │"
echo "│ 3. Verifique se o Tailwind está configurado corretamente:  │"
echo "│    - content: ['./src/**/*.{js,ts,jsx,tsx}']               │"
echo "│                                                             │"
echo "│ 4. Reinicie o servidor de desenvolvimento:                  │"
echo "│    npm run dev                                              │"
echo "│                                                             │"
echo "│ 5. Acesse: http://localhost:3000/admin/usuarios             │"
echo "│                                                             │"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ SCRIPT CONCLUÍDO COM SUCESSO!                ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
