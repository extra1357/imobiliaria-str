#!/bin/bash

# 🚀 Script de Instalação Automática - Sistema Reset de Senha
# STR Imobiliária

echo "================================================"
echo "🔐 INSTALAÇÃO DO SISTEMA DE RESET DE SENHA"
echo "================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para mensagens de sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para mensagens de aviso
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Função para mensagens de erro
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    error "Execute este script na pasta raiz do projeto (~/imobiliaria_str/)"
    exit 1
fi

success "Pasta do projeto encontrada!"
echo ""

# Passo 1: Criar estrutura de pastas
echo "📁 Criando estrutura de pastas..."
mkdir -p app/api/auth/redefinir-senha
mkdir -p app/admin/esqueci-senha
mkdir -p app/admin/redefinir-senha
success "Pastas criadas!"
echo ""

# Passo 2: Instalar dependência
echo "📦 Instalando Resend..."
npm install resend
success "Resend instalado!"
echo ""

# Passo 3: Verificar .env
echo "🔑 Verificando arquivo .env..."
if [ ! -f ".env" ]; then
    warning "Arquivo .env não encontrado. Criando..."
    touch .env
fi

# Adicionar variáveis se não existirem
if ! grep -q "RESEND_API_KEY" .env; then
    echo "" >> .env
    echo "# Reset de Senha" >> .env
    echo "RESEND_API_KEY=re_YWTWu58E_LiLEALrxyh2WXraDwVS6RgUM" >> .env
    echo "NEXT_PUBLIC_URL=http://localhost:3000" >> .env
    success "Variáveis adicionadas ao .env"
else
    warning "Variáveis já existem no .env (pulando)"
fi
echo ""

# Passo 4: Verificar schema.prisma
echo "🗄️  Verificando schema do Prisma..."
if ! grep -q "resetToken" prisma/schema.prisma; then
    warning "ATENÇÃO: Você precisa adicionar manualmente os campos ao schema.prisma"
    echo ""
    echo "Adicione estas linhas no model Usuario:"
    echo "  resetToken        String?   @db.VarChar(255)"
    echo "  resetTokenExpira  DateTime?"
    echo ""
    echo "Pressione ENTER quando terminar..."
    read
else
    success "Campos já existem no schema (pulando)"
fi
echo ""

# Passo 5: Executar migrations
echo "🔄 Executando migrations do Prisma..."
npx prisma migrate dev --name add_reset_token
success "Migrations executadas!"
echo ""

echo "📊 Gerando cliente Prisma..."
npx prisma generate
success "Cliente Prisma gerado!"
echo ""

# Resumo
echo "================================================"
echo "✅ INSTALAÇÃO CONCLUÍDA!"
echo "================================================"
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo ""
echo "1. Copie os 3 arquivos baixados para:"
echo "   - redefinir-senha-route.ts  → app/api/auth/redefinir-senha/route.ts"
echo "   - esqueci-senha-page.tsx    → app/admin/esqueci-senha/page.tsx"
echo "   - redefinir-senha-page.tsx  → app/admin/redefinir-senha/page.tsx"
echo ""
echo "2. Se ainda não adicionou, atualize prisma/schema.prisma:"
echo "   Adicione no model Usuario:"
echo "   resetToken        String?   @db.VarChar(255)"
echo "   resetTokenExpira  DateTime?"
echo ""
echo "3. Execute as migrations novamente se alterou o schema:"
echo "   npx prisma migrate dev --name add_reset_token"
echo "   npx prisma generate"
echo ""
echo "4. Inicie o servidor:"
echo "   npm run dev"
echo ""
echo "5. Teste em: http://localhost:3000/admin/login"
echo ""
echo "================================================"
echo "📚 Consulte ONDE_COLOCAR_ARQUIVOS.md para mais detalhes"
echo "================================================"
