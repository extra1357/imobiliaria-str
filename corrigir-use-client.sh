#!/bin/bash

cd ~/imobiliaria_str

# Corrigir esqueci-senha
sed -i "1s/^export const dynamic = 'force-dynamic';/'use client';/" src/app/admin/esqueci-senha/page.tsx
sed -i "4d" src/app/admin/esqueci-senha/page.tsx
sed -i "2i export const dynamic = 'force-dynamic';" src/app/admin/esqueci-senha/page.tsx

# Corrigir redefinir-senha
sed -i "1s/^export const dynamic = 'force-dynamic';/'use client';/" src/app/admin/redefinir-senha/page.tsx
sed -i "4d" src/app/admin/redefinir-senha/page.tsx
sed -i "2i export const dynamic = 'force-dynamic';" src/app/admin/redefinir-senha/page.tsx

# Corrigir trocar-senha
sed -i "1s/^export const dynamic = 'force-dynamic';/'use client';/" src/app/admin/trocar-senha/page.tsx
sed -i "4d" src/app/admin/trocar-senha/page.tsx
sed -i "2i export const dynamic = 'force-dynamic';" src/app/admin/trocar-senha/page.tsx

echo "✅ Arquivos corrigidos!"
