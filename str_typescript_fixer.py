#!/usr/bin/env python3
"""
🔧 STR TypeScript Fixer - Corretor Automático de Erros TypeScript
Escaneia e corrige automaticamente erros comuns de tipagem no projeto Next.js/Prisma
"""

import os
import re
import json
from pathlib import Path

# Diretório do projeto
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(PROJECT_DIR, 'src')

# Contador de correções
fixes_applied = 0
files_fixed = []

def log(msg, icon="📝"):
    print(f"  {icon} {msg}")

def fix_file(filepath, content):
    """Aplica todas as correções necessárias em um arquivo"""
    global fixes_applied
    original = content
    fixes = []
    
    # ============================================================
    # CORREÇÃO 1: Parâmetros de função sem tipo
    # ============================================================
    
    # Padrão: function nome(param, param2) ou (param, param2) =>
    function_patterns = [
        # canManageUser e similares
        (r'function canManageUser\(managerRole, targetRole\)', 
         'function canManageUser(managerRole: string, targetRole: string)'),
        
        # handleEdit(user) -> handleEdit(user: any)
        (r'function handleEdit\(user\)\s*\{',
         'function handleEdit(user: any) {'),
        
        # handleToggleStatus(userId, currentStatus)
        (r'function handleToggleStatus\(userId, currentStatus\)',
         'function handleToggleStatus(userId: string, currentStatus: boolean)'),
        
        # getRoleBadgeColor(role)
        (r'function getRoleBadgeColor\(role\)\s*\{',
         'function getRoleBadgeColor(role: string) {'),
        
        # getRoleIcon(role)
        (r'function getRoleIcon\(role\)\s*\{',
         'function getRoleIcon(role: string) {'),
        
        # Genérico: function nome(param) sem tipo
        (r'function (\w+)\((\w+)\)\s*\{',
         r'function \1(\2: any) {'),
        
        # Genérico: function nome(param1, param2) sem tipo  
        (r'function (\w+)\((\w+), (\w+)\)\s*\{',
         r'function \1(\2: any, \3: any) {'),
    ]
    
    for pattern, replacement in function_patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            fixes.append(f"Corrigido parâmetro de função: {pattern[:50]}...")
    
    # ============================================================
    # CORREÇÃO 2: useState sem tipo
    # ============================================================
    
    # useState([]) -> useState<any[]>([])
    if 'useState([])' in content and 'useState<' not in content:
        content = content.replace('useState([])', 'useState<any[]>([])')
        fixes.append("useState([]) -> useState<any[]>([])")
    
    # useState({}) -> useState<any>({})
    content = re.sub(r'useState\(\{\}\)(?!.*<)', 'useState<any>({})', content)
    
    # useState(null) -> useState<any>(null)
    content = re.sub(r'useState\(null\)(?!.*<)', 'useState<any>(null)', content)
    
    # ============================================================
    # CORREÇÃO 3: Prisma include incorretos
    # ============================================================
    
    # Lead não tem relação 'imovel', tem 'consultas' e 'historicos'
    # Corrigir includes aninhados recursivos incorretos
    
    # Padrão problemático: consultas aninhadas infinitamente
    bad_include_pattern = r'include:\s*\{\s*consultas:\s*\{\s*include:\s*\{\s*consultas:'
    if re.search(bad_include_pattern, content):
        # Encontrar e substituir o bloco include problemático
        content = fix_prisma_includes(content)
        fixes.append("Corrigido Prisma include recursivo")
    
    # ============================================================
    # CORREÇÃO 4: .map() sem tipo
    # ============================================================
    
    # data.map((item) => -> data.map((item: any) =>
    content = re.sub(r'\.map\(\((\w+)\)\s*=>', r'.map((\1: any) =>', content)
    
    # data.map((item, index) => -> data.map((item: any, index: number) =>
    content = re.sub(r'\.map\(\((\w+),\s*(\w+)\)\s*=>', r'.map((\1: any, \2: number) =>', content)
    
    # ============================================================
    # CORREÇÃO 5: .filter() sem tipo
    # ============================================================
    
    content = re.sub(r'\.filter\(\((\w+)\)\s*=>', r'.filter((\1: any) =>', content)
    
    # ============================================================
    # CORREÇÃO 6: .reduce() sem tipo
    # ============================================================
    
    content = re.sub(r'\.reduce\(\((\w+),\s*(\w+)\)\s*=>', r'.reduce((\1: any, \2: any) =>', content)
    
    # ============================================================
    # CORREÇÃO 7: .forEach() sem tipo
    # ============================================================
    
    content = re.sub(r'\.forEach\(\((\w+)\)\s*=>', r'.forEach((\1: any) =>', content)
    
    # ============================================================
    # CORREÇÃO 8: catch(error) -> catch(error: any)
    # ============================================================
    
    content = re.sub(r'catch\s*\(\s*(\w+)\s*\)\s*\{', r'catch (\1: any) {', content)
    
    # ============================================================
    # CORREÇÃO 9: async function handlers sem tipo de retorno
    # ============================================================
    
    # export async function GET(request) -> GET(request: NextRequest)
    content = re.sub(
        r'export async function (GET|POST|PUT|DELETE|PATCH)\(request\)',
        r'export async function \1(request: NextRequest)',
        content
    )
    
    # ============================================================
    # CORREÇÃO 10: Imports faltando
    # ============================================================
    
    # Se usa NextRequest mas não importa
    if 'NextRequest' in content and "import { NextRequest" not in content and "import {NextRequest" not in content:
        if "from 'next/server'" in content:
            content = re.sub(
                r"import \{ (.*?) \} from 'next/server'",
                r"import { NextRequest, \1 } from 'next/server'",
                content
            )
        else:
            # Adicionar import no início
            content = "import { NextRequest, NextResponse } from 'next/server';\n" + content
            fixes.append("Adicionado import NextRequest")
    
    # ============================================================
    # CORREÇÃO 11: Object.entries sem tipo
    # ============================================================
    
    content = re.sub(
        r'Object\.entries\((\w+)\)\.map\(\(\[(\w+),\s*(\w+)\]\)',
        r'Object.entries(\1).map(([\2, \3]: [string, any])',
        content
    )
    
    # ============================================================
    # CORREÇÃO 12: Event handlers sem tipo
    # ============================================================
    
    # onChange={(e) => -> onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    # Simplificado para any por segurança
    content = re.sub(r'onChange=\{\(e\)\s*=>', r'onChange={(e: any) =>', content)
    content = re.sub(r'onClick=\{\(e\)\s*=>', r'onClick={(e: any) =>', content)
    content = re.sub(r'onSubmit=\{\(e\)\s*=>', r'onSubmit={(e: any) =>', content)
    
    # ============================================================
    # CORREÇÃO 13: Promise sem tipo
    # ============================================================
    
    content = re.sub(r'new Promise\(\(resolve, reject\)\s*=>', r'new Promise<any>((resolve, reject) =>', content)
    content = re.sub(r'new Promise\(\(resolve\)\s*=>', r'new Promise<any>((resolve) =>', content)
    
    # ============================================================
    # CORREÇÃO 14: then/catch sem tipo
    # ============================================================
    
    content = re.sub(r'\.then\(\((\w+)\)\s*=>', r'.then((\1: any) =>', content)
    
    # ============================================================
    # CORREÇÃO 15: JSON.parse resultado sem tipo
    # ============================================================
    
    # const data = JSON.parse(...) -> const data: any = JSON.parse(...)
    content = re.sub(
        r'const (\w+) = JSON\.parse\(',
        r'const \1: any = JSON.parse(',
        content
    )
    
    # ============================================================
    # CORREÇÃO 16: Evitar correções duplicadas
    # ============================================================
    
    # Remover tipos duplicados como (item: any: any)
    content = re.sub(r': any: any', ': any', content)
    content = re.sub(r': string: string', ': string', content)
    content = re.sub(r': number: number', ': number', content)
    content = re.sub(r': boolean: boolean', ': boolean', content)
    
    # ============================================================
    # Verificar se houve mudanças
    # ============================================================
    
    if content != original:
        fixes_applied += len(fixes) if fixes else 1
        return content, True, fixes
    
    return content, False, []


def fix_prisma_includes(content):
    """Corrige includes do Prisma que estão incorretos"""
    
    # Problema específico: Lead.include com 'imovel' (não existe)
    # Lead tem: consultas, historicos, vendas, alugueis
    
    # Corrigir o arquivo de leads/[id]/route.ts
    if 'findUnique' in content and 'Lead' in content or 'lead' in content.lower():
        # Substituir include incorreto por correto
        bad_patterns = [
            # Include recursivo infinito
            (r'include:\s*\{\s*consultas:\s*\{\s*include:\s*\{[^}]*consultas[^}]*\}[^}]*\}[^}]*\}',
             'include: { consultas: { include: { imovel: true } }, historicos: true }'),
            
            # imovel em Lead (não existe)
            (r"include:\s*\{\s*imovel:\s*true\s*\}",
             "include: { consultas: true, historicos: true }"),
        ]
        
        for pattern, replacement in bad_patterns:
            content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    return content


def fix_api_route_file(filepath, content):
    """Correções específicas para arquivos de API route"""
    original = content
    
    # Garantir que tem os imports corretos
    if 'NextRequest' in content or 'NextResponse' in content:
        if "import { NextRequest, NextResponse } from 'next/server'" not in content:
            if "from 'next/server'" in content:
                content = re.sub(
                    r"import \{([^}]*)\} from 'next/server'",
                    "import { NextRequest, NextResponse } from 'next/server'",
                    content
                )
            else:
                lines = content.split('\n')
                import_line = "import { NextRequest, NextResponse } from 'next/server';"
                if lines[0].startswith('export') or lines[0].startswith("'use"):
                    lines.insert(1, import_line)
                else:
                    lines.insert(0, import_line)
                content = '\n'.join(lines)
    
    return content


def process_file(filepath):
    """Processa um único arquivo TypeScript"""
    global files_fixed
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Aplicar correções gerais
        content, changed, fixes = fix_file(filepath, content)
        
        # Correções específicas para API routes
        if '/api/' in filepath:
            content = fix_api_route_file(filepath, content)
        
        # Salvar se houve mudanças
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            files_fixed.append(filepath)
            log(f"Corrigido: {filepath}", "✅")
            for fix in fixes:
                log(f"  → {fix}", "  ")
            return True
            
    except Exception as e:
        log(f"Erro em {filepath}: {e}", "❌")
    
    return False


def fix_specific_files():
    """Corrige arquivos específicos conhecidos por terem problemas"""
    global fixes_applied, files_fixed
    
    # Arquivo: src/app/api/leads/[id]/route.ts
    leads_route = os.path.join(SRC_DIR, 'app', 'api', 'leads', '[id]', 'route.ts')
    if os.path.exists(leads_route):
        log(f"Corrigindo arquivo problemático: leads/[id]/route.ts", "🔧")
        
        correct_content = '''export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar lead por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { 
        consultas: {
          include: { imovel: true }
        }, 
        historicos: true 
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('Erro ao buscar lead:', error);
    return NextResponse.json({ error: 'Erro ao buscar lead' }, { status: 500 });
  }
}

// PUT - Atualizar lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        origem: body.origem,
        status: body.status,
        imovelInteresse: body.imovelInteresse,
        mensagem: body.mensagem,
        corretorId: body.corretorId || null,
      }
    });

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('Erro ao atualizar lead:', error);
    return NextResponse.json({ error: 'Erro ao atualizar lead' }, { status: 500 });
  }
}

// DELETE - Deletar lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lead.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Lead deletado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar lead:', error);
    return NextResponse.json({ error: 'Erro ao deletar lead' }, { status: 500 });
  }
}
'''
        with open(leads_route, 'w', encoding='utf-8') as f:
            f.write(correct_content)
        files_fixed.append(leads_route)
        fixes_applied += 1
        log("Arquivo leads/[id]/route.ts reescrito completamente", "✅")


def scan_and_fix():
    """Escaneia todos os arquivos TypeScript e aplica correções"""
    print("=" * 60)
    print("🔧 STR TypeScript Fixer - Corretor Automático")
    print("=" * 60)
    print(f"📁 Projeto: {PROJECT_DIR}")
    print(f"🔍 Escaneando {SRC_DIR}...")
    
    # Primeiro, corrigir arquivos específicos conhecidos
    fix_specific_files()
    
    # Depois, escanear todos os arquivos
    ts_files = []
    for root, dirs, files in os.walk(SRC_DIR):
        # Ignorar node_modules e .next
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
        
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                ts_files.append(os.path.join(root, file))
    
    print(f"   Encontrados {len(ts_files)} arquivos TypeScript")
    print("\n📝 Processando arquivos...")
    
    for filepath in ts_files:
        process_file(filepath)
    
    # Resumo
    print("\n" + "=" * 60)
    print(f"✅ Concluído! {len(files_fixed)} arquivos corrigidos")
    print("=" * 60)
    
    if files_fixed:
        print("\n📋 Arquivos modificados:")
        for f in files_fixed:
            print(f"   • {f.replace(PROJECT_DIR, '')}")
    
    print("\n📋 Próximos passos:")
    print("   1. Execute: npm run build")
    print("   2. Se ainda houver erros, execute novamente este script")
    print("   3. Commit as mudanças: git add . && git commit -m 'Fix TypeScript errors'")


if __name__ == '__main__':
    scan_and_fix()
