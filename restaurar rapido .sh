#!/bin/bash
# =============================================================
# SCRIPT DE RESTAURAÇÃO RÁPIDA
# =============================================================
# Execute: bash restaurar-rapido.sh
# =============================================================

echo ""
echo "============================================================"
echo "  🔄 RESTAURAÇÃO RÁPIDA DOS BACKUPS"
echo "============================================================"
echo ""

# 1. Remover page.tsx em pasta de API (conflito)
echo "1️⃣  Removendo page.tsx conflitante..."
rm -f src/app/api/corretores/\[id\]/page.tsx 2>/dev/null && echo "   ✅ Removido: src/app/api/corretores/[id]/page.tsx" || echo "   ℹ️  Arquivo não existe"

echo ""
echo "2️⃣  Restaurando arquivos dos backups..."

# Verificar qual diretório de backup existe
BACKUP_DIR=""
if [ -d ".backups-otimizacao" ]; then
    BACKUP_DIR=".backups-otimizacao"
elif [ -d ".backups-prisma" ]; then
    BACKUP_DIR=".backups-prisma"
fi

if [ -z "$BACKUP_DIR" ]; then
    echo "   ❌ Nenhum diretório de backup encontrado!"
    echo "   Procurado: .backups-otimizacao/, .backups-prisma/"
    echo ""
    echo "   Você precisará corrigir os arquivos manualmente."
    exit 1
fi

echo "   📂 Usando backups de: $BACKUP_DIR"
echo ""

# Listar backups disponíveis
echo "   📋 Backups encontrados:"
ls -la $BACKUP_DIR/*.backup 2>/dev/null | head -20

echo ""
echo "3️⃣  Restaurando arquivos..."

# Função para restaurar
restaurar() {
    BACKUP_PATTERN=$1
    DESTINO=$2
    
    BACKUP_FILE=$(ls -t $BACKUP_DIR/$BACKUP_PATTERN 2>/dev/null | head -1)
    
    if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" "$DESTINO"
        echo "   ✅ Restaurado: $DESTINO"
    else
        echo "   ⚠️  Backup não encontrado para: $DESTINO"
    fi
}

# Restaurar arquivos específicos mencionados nos erros
restaurar "src_app_api_alugueis_route.ts*.backup" "src/app/api/alugueis/route.ts"
restaurar "src_app_api_analise-mercado_route.ts*.backup" "src/app/api/analise-mercado/route.ts"
restaurar "src_app_api_comissoes_route.ts*.backup" "src/app/api/comissoes/route.ts"
restaurar "src_app_api_consultas_\[id\]_route.ts*.backup" "src/app/api/consultas/[id]/route.ts"
restaurar "src_app_api_corretores_route.ts*.backup" "src/app/api/corretores/route.ts"
restaurar "src_app_api_leads_route.ts*.backup" "src/app/api/leads/route.ts"
restaurar "src_app_api_imoveis_route.ts*.backup" "src/app/api/imoveis/route.ts"

echo ""
echo "============================================================"
echo "  📊 RESTAURAÇÃO CONCLUÍDA"
echo "============================================================"
echo ""
echo "🧪 Agora teste o build:"
echo "   npm run build"
echo ""
echo "✅ Se funcionar:"
echo "   npm run dev"
echo ""
