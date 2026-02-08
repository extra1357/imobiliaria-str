#!/bin/bash
# Script de instalação do SEO Local - Imobiliária Perto
# Autor: Claude AI
# Data: 2026-02-07

echo "🚀 Instalação do SEO Local - Salto, Itu, Indaiatuba"
echo "=================================================="
echo ""

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto (onde está o package.json)"
    exit 1
fi

echo "📁 Criando estrutura de pastas..."

# Criar pastas necessárias
mkdir -p src/components/seo
mkdir -p src/app/imoveis-salto
mkdir -p src/app/imoveis-itu
mkdir -p src/app/imoveis-indaiatuba

echo "✅ Pastas criadas com sucesso!"
echo ""

echo "📄 Copiando componentes de Schema..."

# Copiar componentes
cp seo-local-str/LocalBusinessSchema.tsx src/components/seo/ 2>/dev/null || echo "⚠️  LocalBusinessSchema.tsx não encontrado"
cp seo-local-str/BreadcrumbSchema.tsx src/components/seo/ 2>/dev/null || echo "⚠️  BreadcrumbSchema.tsx não encontrado"
cp seo-local-str/FAQSchema.tsx src/components/seo/ 2>/dev/null || echo "⚠️  FAQSchema.tsx não encontrado"
cp seo-local-str/RealEstateSchema.tsx src/components/seo/ 2>/dev/null || echo "⚠️  RealEstateSchema.tsx não encontrado"

echo "✅ Componentes copiados!"
echo ""

echo "📄 Copiando páginas das cidades..."

# Copiar páginas
cp seo-local-str/page-salto.tsx src/app/imoveis-salto/page.tsx 2>/dev/null || echo "⚠️  page-salto.tsx não encontrado"
cp seo-local-str/page-itu.tsx src/app/imoveis-itu/page.tsx 2>/dev/null || echo "⚠️  page-itu.tsx não encontrado"
cp seo-local-str/page-indaiatuba.tsx src/app/imoveis-indaiatuba/page.tsx 2>/dev/null || echo "⚠️  page-indaiatuba.tsx não encontrado"

echo "✅ Páginas copiadas!"
echo ""

echo "📄 Copiando utilitários..."

# Copiar utilitário
cp seo-local-str/local-seo.ts src/lib/ 2>/dev/null || echo "⚠️  local-seo.ts não encontrado"

echo "✅ Utilitários copiados!"
echo ""

echo "=================================================="
echo "✅ Instalação concluída!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. Editar os contatos nas páginas:"
echo "   - src/app/imoveis-salto/page.tsx"
echo "   - src/app/imoveis-itu/page.tsx"
echo "   - src/app/imoveis-indaiatuba/page.tsx"
echo ""
echo "2. Atualizar telefone e WhatsApp nos arquivos"
echo ""
echo "3. Testar localmente:"
echo "   npm run dev"
echo ""
echo "4. Acessar:"
echo "   http://localhost:3000/imoveis-salto"
echo "   http://localhost:3000/imoveis-itu"
echo "   http://localhost:3000/imoveis-indaiatuba"
echo ""
echo "5. Fazer deploy:"
echo "   git add ."
echo "   git commit -m 'Implementar SEO local'"
echo "   git push origin main"
echo ""
echo "📖 Leia o GUIA_IMPLEMENTACAO.md para detalhes completos!"
echo "=================================================="
