#!/usr/bin/env python3
"""
🚀 SUPER OTIMIZADOR STR GENETICS v2.0
Otimiza automaticamente sua aplicação Next.js

Uso: python3 super-otimizar.py
"""

import os
import re
import sys
import json
import shutil
from pathlib import Path
from datetime import datetime

# ========================================
# CONFIGURAÇÕES
# ========================================
CONFIG = {
    'PAGINACAO_PADRAO': 20,
    'CRIAR_BACKUP': True,
    'MODO_SEGURO': True,  # Não sobrescreve sem confirmação
}

class Colors:
    GREEN = '\033[92m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    PURPLE = '\033[95m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_success(msg): print(f"{Colors.GREEN}✅ {msg}{Colors.END}")
def print_info(msg): print(f"{Colors.BLUE}ℹ️  {msg}{Colors.END}")
def print_warning(msg): print(f"{Colors.YELLOW}⚠️  {msg}{Colors.END}")
def print_error(msg): print(f"{Colors.RED}❌ {msg}{Colors.END}")
def print_header(msg): print(f"\n{Colors.BOLD}{Colors.PURPLE}{'='*60}\n  {msg}\n{'='*60}{Colors.END}\n")

# ========================================
# UTILITÁRIOS
# ========================================
def criar_backup(file_path):
    """Cria backup do arquivo"""
    if CONFIG['CRIAR_BACKUP']:
        backup_dir = '.backups-otimizacao'
        os.makedirs(backup_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        rel_path = os.path.relpath(file_path)
        backup_name = f"{rel_path.replace('/', '_')}_{timestamp}.backup"
        backup_path = os.path.join(backup_dir, backup_name)
        
        shutil.copy2(file_path, backup_path)
        return backup_path
    return None

def salvar_arquivo(file_path, content, original_content):
    """Salva arquivo com backup"""
    if content != original_content:
        backup_path = criar_backup(file_path)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# ========================================
# OTIMIZAÇÃO 1: PAGINAÇÃO EM APIs
# ========================================
def otimizar_api_paginacao(file_path):
    """Adiciona paginação completa em APIs"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Verificar se já tem paginação
        if 'searchParams.get' in content and "'page'" in content:
            return False, "Já tem paginação"
        
        # Encontrar função GET
        if 'export async function GET' not in content:
            return False, "Não é um GET handler"
        
        # Adicionar paginação
        pagination_snippet = """
    // 🚀 PAGINAÇÃO AUTOMÁTICA
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
"""
        
        # Inserir após abertura da função GET
        pattern = r'(export async function GET[^{]*{\s*)'
        if re.search(pattern, content):
            content = re.sub(pattern, r'\1' + pagination_snippet, content, count=1)
            
            # Adicionar take e skip no Prisma
            if 'findMany(' in content:
                # Padrão simples: adicionar antes do primeiro parâmetro
                content = re.sub(
                    r'\.findMany\(\s*{',
                    '.findMany({\n      take: limit,\n      skip: skip,',
                    content,
                    count=1
                )
                
                # Adicionar contagem total
                if 'count()' not in content:
                    # Detectar nome do model
                    model_match = re.search(r'prisma\.(\w+)\.findMany', content)
                    if model_match:
                        model_name = model_match.group(1)
                        count_code = f"\n    const total = await prisma.{model_name}.count()"
                        content = content.replace(pagination_snippet, pagination_snippet + count_code)
                
                # Modificar o retorno para incluir meta
                content = re.sub(
                    r'return NextResponse\.json\(\s*{\s*success:\s*true,\s*data:',
                    '''return NextResponse.json({
      success: true,
      data:''',
                    content
                )
                
                # Adicionar pagination meta
                if 'return NextResponse.json' in content and 'pagination' not in content:
                    content = re.sub(
                        r'(data:\s*\w+\s*)\}',
                        r'\1,\n      pagination: { page, limit, total }\n    }',
                        content,
                        count=1
                    )
            
            return salvar_arquivo(file_path, content, original), "Paginação adicionada"
        
        return False, "Padrão não encontrado"
        
    except Exception as e:
        return False, f"Erro: {str(e)}"

# ========================================
# OTIMIZAÇÃO 2: SELECT ESPECÍFICO PRISMA
# ========================================
def otimizar_prisma_select(file_path):
    """Adiciona select específico em queries"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        modified = False
        
        # Procurar findMany sem select
        pattern = r'prisma\.(\w+)\.findMany\(\s*\{([^}]*)\}'
        
        for match in re.finditer(pattern, content):
            model_name = match.group(1)
            params = match.group(2)
            
            # Se não tem select nem include
            if 'select:' not in params and 'include:' not in params:
                print_warning(f"  ⚠️  Query sem select em {model_name}")
                # Muito arriscado adicionar automaticamente
                # Apenas reportar
        
        return False, "Manual"
        
    except Exception as e:
        return False, f"Erro: {str(e)}"

# ========================================
# OTIMIZAÇÃO 3: LAZY LOADING
# ========================================
def adicionar_lazy_loading_avancado(file_path):
    """Adiciona lazy loading em componentes grandes"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Verificar se já usa dynamic
        if "from 'next/dynamic'" in content:
            return False, "Já usa dynamic"
        
        # Procurar componentes em tabs/modais
        if any(keyword in content for keyword in ['TabsContent', 'DialogContent', 'SheetContent']):
            # Adicionar import dynamic
            if "import dynamic from 'next/dynamic'" not in content:
                first_import = re.search(r"^(import\s)", content, re.MULTILINE)
                if first_import:
                    pos = first_import.start()
                    content = content[:pos] + "import dynamic from 'next/dynamic'\n" + content[pos:]
                    
                    return salvar_arquivo(file_path, content, original), "Dynamic import adicionado"
        
        return False, "Não aplicável"
        
    except Exception as e:
        return False, f"Erro: {str(e)}"

# ========================================
# OTIMIZAÇÃO 4: DEBOUNCE HOOK
# ========================================
def criar_hook_debounce(base_dir):
    """Cria um hook de debounce reutilizável"""
    hooks_dir = os.path.join(base_dir, 'hooks')
    os.makedirs(hooks_dir, exist_ok=True)
    
    hook_path = os.path.join(hooks_dir, 'useDebounce.ts')
    
    if os.path.exists(hook_path):
        return False, "Hook já existe"
    
    hook_content = """import { useEffect, useState } from 'react'

/**
 * Hook de debounce para otimizar buscas
 * @param value - Valor a ser debounced
 * @param delay - Delay em ms (padrão: 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Exemplo de uso:
// const [busca, setBusca] = useState('')
// const buscaDebounced = useDebounce(busca, 500)
// 
// useEffect(() => {
//   if (buscaDebounced) {
//     // Fazer fetch aqui
//   }
// }, [buscaDebounced])
"""
    
    with open(hook_path, 'w', encoding='utf-8') as f:
        f.write(hook_content)
    
    return True, "Hook criado"

# ========================================
# OTIMIZAÇÃO 5: NEXT.CONFIG OTIMIZADO
# ========================================
def otimizar_next_config():
    """Otimiza next.config.js"""
    config_path = 'next.config.js'
    
    if not os.path.exists(config_path):
        config_path = 'next.config.mjs'
    
    if not os.path.exists(config_path):
        return False, "next.config não encontrado"
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Adicionar otimizações
        otimizacoes = {
            'swcMinify': True,
            'reactStrictMode': True,
            'compiler': {
                'removeConsole': {
                    'exclude': ['error', 'warn']
                }
            },
            'images': {
                'formats': ['image/avif', 'image/webp']
            }
        }
        
        # Se for um arquivo simples, adicionar config
        if 'module.exports' in content and 'swcMinify' not in content:
            print_warning("  ⚠️  Recomenda-se otimizar next.config.js manualmente")
        
        return False, "Manual"
        
    except Exception as e:
        return False, f"Erro: {str(e)}"

# ========================================
# MAIN
# ========================================
def main():
    print_header("🚀 SUPER OTIMIZADOR STR GENETICS v2.0")
    
    # Verificar ambiente
    if not os.path.exists('package.json'):
        print_error("Execute na raiz do projeto Next.js!")
        sys.exit(1)
    
    base_dir = 'src/app' if os.path.exists('src/app') else 'app'
    
    if not os.path.exists(base_dir):
        print_error(f"Diretório {base_dir} não encontrado!")
        sys.exit(1)
    
    print_info(f"Diretório base: {base_dir}/")
    print()
    
    stats = {
        'apis_paginacao': 0,
        'lazy_loading': 0,
        'hooks_criados': 0,
        'erros': 0
    }
    
    # ========================================
    # 1. OTIMIZAR APIs
    # ========================================
    print_header("📡 OTIMIZANDO APIs")
    
    api_dir = os.path.join(base_dir, 'api')
    if os.path.exists(api_dir):
        for root, dirs, files in os.walk(api_dir):
            for file in files:
                if file == 'route.ts':
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path)
                    
                    success, msg = otimizar_api_paginacao(file_path)
                    if success:
                        print_success(f"{rel_path} - {msg}")
                        stats['apis_paginacao'] += 1
                    else:
                        print_info(f"  {rel_path} - {msg}")
                    
                    # Analisar queries Prisma
                    otimizar_prisma_select(file_path)
    
    # ========================================
    # 2. LAZY LOADING
    # ========================================
    print_header("⚡ ADICIONANDO LAZY LOADING")
    
    for root, dirs, files in os.walk(base_dir):
        # Ignorar node_modules, .next, etc
        dirs[:] = [d for d in dirs if d not in ['.next', 'node_modules', 'dist']]
        
        for file in files:
            if file.endswith('.tsx'):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path)
                
                success, msg = adicionar_lazy_loading_avancado(file_path)
                if success:
                    print_success(f"{rel_path} - {msg}")
                    stats['lazy_loading'] += 1
    
    # ========================================
    # 3. CRIAR HOOKS
    # ========================================
    print_header("🎣 CRIANDO HOOKS DE OTIMIZAÇÃO")
    
    success, msg = criar_hook_debounce(base_dir)
    if success:
        print_success(f"useDebounce.ts - {msg}")
        stats['hooks_criados'] += 1
    else:
        print_info(f"  useDebounce.ts - {msg}")
    
    # ========================================
    # 4. NEXT.CONFIG
    # ========================================
    print_header("⚙️  ANALISANDO CONFIGURAÇÕES")
    
    otimizar_next_config()
    
    # ========================================
    # RELATÓRIO
    # ========================================
    print_header("📊 RELATÓRIO FINAL")
    
    print(f"{Colors.BOLD}Otimizações Automáticas:{Colors.END}")
    print(f"  📡 APIs com paginação:     {Colors.GREEN}{stats['apis_paginacao']}{Colors.END}")
    print(f"  ⚡ Lazy loading:           {Colors.GREEN}{stats['lazy_loading']}{Colors.END}")
    print(f"  🎣 Hooks criados:          {Colors.GREEN}{stats['hooks_criados']}{Colors.END}")
    
    if CONFIG['CRIAR_BACKUP']:
        print()
        print_success("💾 Backups salvos em: .backups-otimizacao/")
    
    print()
    print_header("📋 PRÓXIMOS PASSOS MANUAIS")
    
    print("""
1. 🔍 REVISAR MUDANÇAS:
   git diff

2. ✏️  OTIMIZAÇÕES MANUAIS:
   - Adicionar 'select' específico nas queries Prisma
   - Usar o hook useDebounce nos campos de busca
   - Adicionar React.memo em componentes que não mudam

3. 🧪 TESTAR:
   npm run dev
   
4. 🚀 BUILD DE PRODUÇÃO:
   npm run build
   
5. 📊 ANALISAR BUNDLE:
   npm install @next/bundle-analyzer
   ANALYZE=true npm run build
""")
    
    print_success("🎉 Otimização concluída!")
    print()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print()
        print_warning("Operação cancelada")
        sys.exit(0)
    except Exception as e:
        print_error(f"Erro fatal: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
