#!/bin/bash

##############################################
# 🚀 INSTALADOR AUTOMÁTICO DE SEO
# Imobiliária Perto STR - STR Genetics
##############################################

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║   🚀 INSTALADOR SEO - STR GENETICS        ║"
echo "║   Imobiliária Perto STR                   ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto!${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Verificando estrutura...${NC}"

# 1️⃣ Criar estrutura de diretórios
echo -e "${BLUE}📁 Criando diretórios...${NC}"

mkdir -p src/lib
mkdir -p src/app/sitemap.xml
mkdir -p src/app/robots.txt

echo -e "${GREEN}✅ Diretórios criados!${NC}"

# 2️⃣ Verificar se os arquivos baixados existem
echo -e "${BLUE}📦 Verificando arquivos baixados...${NC}"

DOWNLOAD_DIR="$HOME/Downloads"
ARQUIVOS=(
    "seo-utils.ts"
    "structured-data.tsx"
    "metadata-generator.ts"
    "sitemap-route.ts"
    "robots-route.ts"
)

TODOS_PRESENTES=true

for arquivo in "${ARQUIVOS[@]}"; do
    if [ ! -f "$DOWNLOAD_DIR/$arquivo" ]; then
        echo -e "${RED}❌ Arquivo não encontrado: $arquivo${NC}"
        TODOS_PRESENTES=false
    else
        echo -e "${GREEN}✅ Encontrado: $arquivo${NC}"
    fi
done

if [ "$TODOS_PRESENTES" = false ]; then
    echo ""
    echo -e "${YELLOW}⚠️  AÇÃO NECESSÁRIA:${NC}"
    echo -e "Baixe os arquivos que te enviei e coloque em ~/Downloads/"
    echo ""
    echo "Arquivos necessários:"
    for arquivo in "${ARQUIVOS[@]}"; do
        echo "  - $arquivo"
    done
    echo ""
    read -p "Pressione ENTER quando os arquivos estiverem em ~/Downloads/ ..."
fi

# 3️⃣ Copiar arquivos para os locais corretos
echo -e "${BLUE}📂 Copiando arquivos...${NC}"

# Copiar para src/lib/
cp "$DOWNLOAD_DIR/seo-utils.ts" src/lib/seo-utils.ts 2>/dev/null && \
    echo -e "${GREEN}✅ src/lib/seo-utils.ts${NC}" || \
    echo -e "${RED}❌ Erro ao copiar seo-utils.ts${NC}"

cp "$DOWNLOAD_DIR/structured-data.tsx" src/lib/structured-data.tsx 2>/dev/null && \
    echo -e "${GREEN}✅ src/lib/structured-data.tsx${NC}" || \
    echo -e "${RED}❌ Erro ao copiar structured-data.tsx${NC}"

cp "$DOWNLOAD_DIR/metadata-generator.ts" src/lib/metadata-generator.ts 2>/dev/null && \
    echo -e "${GREEN}✅ src/lib/metadata-generator.ts${NC}" || \
    echo -e "${RED}❌ Erro ao copiar metadata-generator.ts${NC}"

# Copiar rotas
cp "$DOWNLOAD_DIR/sitemap-route.ts" src/app/sitemap.xml/route.ts 2>/dev/null && \
    echo -e "${GREEN}✅ src/app/sitemap.xml/route.ts${NC}" || \
    echo -e "${RED}❌ Erro ao copiar sitemap-route.ts${NC}"

cp "$DOWNLOAD_DIR/robots-route.ts" src/app/robots.txt/route.ts 2>/dev/null && \
    echo -e "${GREEN}✅ src/app/robots.txt/route.ts${NC}" || \
    echo -e "${RED}❌ Erro ao copiar robots-route.ts${NC}"

# 4️⃣ Adicionar variável de ambiente
echo -e "${BLUE}⚙️  Configurando .env...${NC}"

if ! grep -q "NEXT_PUBLIC_BASE_URL" .env 2>/dev/null; then
    echo "" >> .env
    echo "# SEO - Configuração" >> .env
    echo "NEXT_PUBLIC_BASE_URL=http://localhost:3000" >> .env
    echo -e "${GREEN}✅ Variável NEXT_PUBLIC_BASE_URL adicionada ao .env${NC}"
else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_BASE_URL já existe no .env${NC}"
fi

# 5️⃣ Verificar instalação
echo ""
echo -e "${BLUE}🔍 Verificando instalação...${NC}"
echo ""

SUCCESS=true

if [ -f "src/lib/seo-utils.ts" ]; then
    echo -e "${GREEN}✅${NC} src/lib/seo-utils.ts"
else
    echo -e "${RED}❌${NC} src/lib/seo-utils.ts"
    SUCCESS=false
fi

if [ -f "src/lib/structured-data.tsx" ]; then
    echo -e "${GREEN}✅${NC} src/lib/structured-data.tsx"
else
    echo -e "${RED}❌${NC} src/lib/structured-data.tsx"
    SUCCESS=false
fi

if [ -f "src/lib/metadata-generator.ts" ]; then
    echo -e "${GREEN}✅${NC} src/lib/metadata-generator.ts"
else
    echo -e "${RED}❌${NC} src/lib/metadata-generator.ts"
    SUCCESS=false
fi

if [ -f "src/app/sitemap.xml/route.ts" ]; then
    echo -e "${GREEN}✅${NC} src/app/sitemap.xml/route.ts"
else
    echo -e "${RED}❌${NC} src/app/sitemap.xml/route.ts"
    SUCCESS=false
fi

if [ -f "src/app/robots.txt/route.ts" ]; then
    echo -e "${GREEN}✅${NC} src/app/robots.txt/route.ts"
else
    echo -e "${RED}❌${NC} src/app/robots.txt/route.ts"
    SUCCESS=false
fi

echo ""

if [ "$SUCCESS" = true ]; then
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════╗"
    echo "║   ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!    ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${BLUE}📋 Próximos passos:${NC}"
    echo ""
    echo "1️⃣  Rodar o servidor:"
    echo "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo "2️⃣  Testar SEO:"
    echo "   ${YELLOW}http://localhost:3000/sitemap.xml${NC}"
    echo "   ${YELLOW}http://localhost:3000/robots.txt${NC}"
    echo ""
    echo "3️⃣  Fazer build de produção:"
    echo "   ${YELLOW}npm run build${NC}"
    echo "   ${YELLOW}npm start${NC}"
    echo ""
    echo "4️⃣  Deploy na Vercel:"
    echo "   Adicione variável: ${YELLOW}NEXT_PUBLIC_BASE_URL${NC} = ${YELLOW}https://seudominio.com.br${NC}"
    echo ""
    echo -e "${GREEN}🎉 Seu site agora está otimizado para SEO do Google!${NC}"
    echo ""
else
    echo -e "${RED}"
    echo "╔════════════════════════════════════════════╗"
    echo "║   ❌ INSTALAÇÃO INCOMPLETA                ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Alguns arquivos não foram instalados.${NC}"
    echo "Verifique se os arquivos estão em ~/Downloads/"
    echo ""
fi
