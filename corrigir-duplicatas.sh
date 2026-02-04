#!/bin/bash

cd ~/imobiliaria_str

# Função para corrigir cada arquivo
corrigir_arquivo() {
  local arquivo=$1
  
  # Remove todas as linhas com export const dynamic e 'use client'
  # e depois adiciona uma vez no topo na ordem correta
  sed -i "/^export const dynamic = 'force-dynamic';/d" "$arquivo"
  sed -i "/^'use client';/d" "$arquivo"
  
  # Adiciona no topo na ordem correta
  sed -i "1i'use client';\nexport const dynamic = 'force-dynamic';\n" "$arquivo"
  
  echo "✓ $arquivo corrigido"
}

# Corrigir os 3 arquivos
corrigir_arquivo "src/app/admin/esqueci-senha/page.tsx"
corrigir_arquivo "src/app/admin/redefinir-senha/page.tsx"
corrigir_arquivo "src/app/admin/trocar-senha/page.tsx"

echo ""
echo "✅ Todos os arquivos corrigidos!"
echo "Rode: npm run build"
