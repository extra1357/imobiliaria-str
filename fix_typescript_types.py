#!/usr/bin/env python3
"""
Script para corrigir automaticamente erros de tipagem TypeScript
baseado no schema do Prisma para o projeto imobiliaria_str
"""

import os
import re
from pathlib import Path

# Definição dos modelos do Prisma e seus campos/relações
PRISMA_MODELS = {
    'Lead': {
        'fields': ['id', 'nome', 'email', 'telefone', 'origem', 'status', 'imovelInteresse', 
                   'mensagem', 'dataPreferencia', 'dataCaptcha', 'createdAt', 'updatedAt'],
        'relations': ['consultas', 'historicos'],
        'relation_types': {'consultas': 'Consulta[]', 'historicos': 'Historico[]'}
    },
    'Historico': {
        'fields': ['id', 'detalhes', 'tipo', 'data', 'leadId'],
        'relations': ['lead'],
        'relation_types': {'lead': 'Lead'}
    },
    'Imovel': {
        'fields': ['id', 'tipo', 'endereco', 'cidade', 'estado', 'preco', 'metragem', 
                   'quartos', 'banheiros', 'vagas', 'descricao', 'disponivel', 
                   'proprietarioId', 'createdAt', 'updatedAt', 'imagens', 'status'],
        'relations': ['consultas', 'proprietario'],
        'relation_types': {'consultas': 'Consulta[]', 'proprietario': 'Proprietario'}
    },
    'Proprietario': {
        'fields': ['id', 'nome', 'telefone', 'email', 'cpf', 'createdAt', 'updatedAt'],
        'relations': ['imoveis'],
        'relation_types': {'imoveis': 'Imovel[]'}
    },
    'Consulta': {
        'fields': ['id', 'leadId', 'imovelId', 'data', 'resultado', 'tipo', 'status',
                   'observacoes', 'comissao', 'createdAt', 'dataFechamento', 
                   'motivoCancelamento', 'updatedAt', 'valorProposta'],
        'relations': ['imovel', 'lead'],
        'relation_types': {'imovel': 'Imovel', 'lead': 'Lead'}
    },
    'AnaliseMercado': {
        'fields': ['id', 'cidade', 'estado', 'valorM2', 'valorMinimo', 'valorMaximo',
                   'dataAnalise', 'fonte', 'tendencia', 'observacoes'],
        'relations': ['relatorios'],
        'relation_types': {'relatorios': 'Relatorio[]'}
    },
    'Relatorio': {
        'fields': ['id', 'titulo', 'tipo', 'conteudo', 'dataGeracao', 'periodo', 
                   'geradoPor', 'analiseId'],
        'relations': ['analise'],
        'relation_types': {'analise': 'AnaliseMercado'}
    },
    'Auditoria': {
        'fields': ['id', 'acao', 'tabela', 'registroId', 'usuario', 'dados', 'ip', 
                   'userAgent', 'createdAt'],
        'relations': [],
        'relation_types': {}
    },
    'Usuario': {
        'fields': ['id', 'nome', 'email', 'senha', 'role', 'ativo', 'createdAt', 'updatedAt'],
        'relations': [],
        'relation_types': {}
    }
}

# Correções conhecidas
FIXES = []

def fix_useState_typing(content):
    """Corrige useState sem tipagem para useState<any[]>"""
    # useState([]) -> useState<any[]>([])
    pattern = r'useState\(\[\]\)'
    replacement = 'useState<any[]>([])'
    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        FIXES.append("useState([]) -> useState<any[]>([])")
    return new_content

def fix_jwt_payload(content):
    """Corrige casting de JWTPayload"""
    pattern = r'return payload as JWTPayload;'
    replacement = 'return payload as unknown as JWTPayload;'
    new_content = content.replace(pattern, replacement)
    if new_content != content:
        FIXES.append("JWTPayload casting corrigido")
    return new_content

def fix_lead_include_imovel(content):
    """Corrige include: { imovel: true } em Lead (não existe essa relação)"""
    # Lead não tem relação direta com imovel
    pattern = r"(prisma\.lead\.find\w+\([^)]*?)include:\s*\{\s*imovel:\s*true\s*\}"
    
    def replace_lead_include(match):
        FIXES.append("Lead: include imovel -> consultas/historicos")
        return match.group(1) + "include: { consultas: { include: { imovel: true } }, historicos: true }"
    
    new_content = re.sub(pattern, replace_lead_include, content, flags=re.DOTALL)
    return new_content

def fix_imovel_create_missing_fields(content):
    """Corrige prisma.imovel.create faltando campos obrigatórios"""
    # Detecta se é um arquivo de criação de imóvel sem os campos obrigatórios
    if 'prisma.imovel.create' in content:
        # Verifica se faltam campos obrigatórios
        required_fields = ['estado', 'metragem', 'proprietarioId']
        missing = []
        for field in required_fields:
            if field not in content:
                missing.append(field)
        
        if missing:
            FIXES.append(f"Imovel create: campos faltando detectados: {missing}")
            # Não faz substituição automática pois é complexo, apenas avisa
    return content

def fix_any_type_errors(content):
    """Corrige erros comuns de tipo any"""
    # error: any -> error: Error | any
    pattern = r'catch\s*\(\s*error\s*\)'
    replacement = 'catch (error: any)'
    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        FIXES.append("catch(error) -> catch(error: any)")
    return new_content

def fix_params_typing(content):
    """Corrige tipagem de params em rotas do Next.js"""
    # Adiciona Promise para params no Next.js 14+
    pattern = r'\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*id:\s*string\s*\}\s*\}'
    # Mantém como está, pois o Next.js 14 ainda aceita essa sintaxe
    return content

def fix_prisma_decimal(content):
    """Garante que campos Decimal são convertidos corretamente"""
    # preco: preco -> preco: parseFloat(preco)
    patterns = [
        (r'preco:\s*preco(?![\w])', 'preco: parseFloat(String(preco))'),
        (r'metragem:\s*metragem(?![\w])', 'metragem: parseFloat(String(metragem))'),
        (r'valorM2:\s*valorM2(?![\w])', 'valorM2: parseFloat(String(valorM2))'),
        (r'comissao:\s*comissao(?![\w])', 'comissao: parseFloat(String(comissao))'),
    ]
    
    new_content = content
    for pattern, replacement in patterns:
        temp = re.sub(pattern, replacement, new_content)
        if temp != new_content:
            FIXES.append(f"Decimal field conversion: {pattern}")
        new_content = temp
    
    return new_content

def fix_response_json_type(content):
    """Corrige tipagem de response.json()"""
    # .then(data => { -> .then((data: any) => {
    pattern = r'\.then\(\s*data\s*=>'
    replacement = '.then((data: any) =>'
    new_content = re.sub(pattern, replacement, content)
    
    pattern2 = r'\.then\(\s*res\s*=>'
    replacement2 = '.then((res: any) =>'
    new_content = re.sub(pattern2, replacement2, new_content)
    
    if new_content != content:
        FIXES.append("Promise .then() tipagem adicionada")
    return new_content

def fix_nextresponse_import(content):
    """Garante import correto do NextResponse"""
    if 'NextResponse' in content and 'next/server' not in content:
        # Adiciona import se faltar
        if "import { NextResponse } from 'next/server'" not in content:
            FIXES.append("Import NextResponse adicionado")
            return "import { NextResponse } from 'next/server';\n" + content
    return content

def add_missing_types_interface(content, filename):
    """Adiciona interfaces de tipo quando necessário"""
    # Se usa setConsultas, setLeads, etc sem tipo definido
    return content

def process_file(filepath):
    """Processa um arquivo e aplica todas as correções"""
    global FIXES
    FIXES = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  ❌ Erro ao ler: {e}")
        return False
    
    original_content = content
    
    # Aplica todas as correções
    content = fix_useState_typing(content)
    content = fix_jwt_payload(content)
    content = fix_lead_include_imovel(content)
    content = fix_imovel_create_missing_fields(content)
    content = fix_any_type_errors(content)
    content = fix_prisma_decimal(content)
    content = fix_response_json_type(content)
    content = fix_nextresponse_import(content)
    
    if content != original_content:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Corrigido: {filepath}")
            for fix in FIXES:
                print(f"      - {fix}")
            return True
        except Exception as e:
            print(f"  ❌ Erro ao salvar: {e}")
            return False
    
    return False

def scan_directory(base_path):
    """Escaneia diretório procurando arquivos TypeScript"""
    ts_files = []
    
    for root, dirs, files in os.walk(base_path):
        # Ignora node_modules e .next
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
        
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                ts_files.append(os.path.join(root, file))
    
    return ts_files

def generate_type_definitions():
    """Gera arquivo de definições de tipos baseado no Prisma"""
    types_content = '''// types/prisma.ts
// Tipos gerados automaticamente baseados no schema.prisma

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  status: string;
  imovelInteresse?: string | null;
  mensagem?: string | null;
  dataPreferencia?: string | null;
  dataCaptcha: Date;
  createdAt: Date;
  updatedAt: Date;
  consultas?: Consulta[];
  historicos?: Historico[];
}

export interface Historico {
  id: string;
  detalhes: string;
  tipo: string;
  data: Date;
  leadId: string;
  lead?: Lead;
}

export interface Imovel {
  id: string;
  tipo: string;
  endereco: string;
  cidade: string;
  estado: string;
  preco: number;
  metragem: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  descricao?: string | null;
  disponivel: boolean;
  proprietarioId: string;
  createdAt: Date;
  updatedAt: Date;
  imagens: string[];
  status: string;
  consultas?: Consulta[];
  proprietario?: Proprietario;
}

export interface Proprietario {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cpf?: string | null;
  createdAt: Date;
  updatedAt: Date;
  imoveis?: Imovel[];
}

export interface Consulta {
  id: string;
  leadId: string;
  imovelId: string;
  data: Date;
  resultado?: string | null;
  tipo: string;
  status: string;
  observacoes?: string | null;
  comissao?: number | null;
  createdAt: Date;
  dataFechamento?: Date | null;
  motivoCancelamento?: string | null;
  updatedAt: Date;
  valorProposta?: number | null;
  imovel?: Imovel;
  lead?: Lead;
}

export interface AnaliseMercado {
  id: string;
  cidade: string;
  estado: string;
  valorM2: number;
  valorMinimo?: number | null;
  valorMaximo?: number | null;
  dataAnalise: Date;
  fonte: string;
  tendencia?: string | null;
  observacoes?: string | null;
  relatorios?: Relatorio[];
}

export interface Relatorio {
  id: string;
  titulo: string;
  tipo: string;
  conteudo: string;
  dataGeracao: Date;
  periodo?: string | null;
  geradoPor?: string | null;
  analiseId?: string | null;
  analise?: AnaliseMercado;
}

export interface Auditoria {
  id: string;
  acao: string;
  tabela: string;
  registroId?: string | null;
  usuario: string;
  dados?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos auxiliares para API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
'''
    return types_content

def main():
    """Função principal"""
    print("=" * 60)
    print("🔧 Corretor de Tipagem TypeScript para Prisma")
    print("=" * 60)
    
    # Detecta o diretório do projeto
    project_paths = [
        '/home/edson/imobiliaria_str',
        os.path.expanduser('~/imobiliaria_str'),
        './imobiliaria_str',
        '.'
    ]
    
    project_path = None
    for path in project_paths:
        if os.path.exists(os.path.join(path, 'src')):
            project_path = path
            break
    
    if not project_path:
        project_path = input("Digite o caminho do projeto: ").strip()
    
    print(f"\n📁 Projeto: {project_path}")
    
    # Escaneia arquivos
    src_path = os.path.join(project_path, 'src')
    if not os.path.exists(src_path):
        print(f"❌ Diretório src não encontrado em {project_path}")
        return
    
    print(f"\n🔍 Escaneando {src_path}...")
    ts_files = scan_directory(src_path)
    print(f"   Encontrados {len(ts_files)} arquivos TypeScript")
    
    # Processa cada arquivo
    print("\n📝 Processando arquivos...")
    fixed_count = 0
    for filepath in ts_files:
        relative_path = os.path.relpath(filepath, project_path)
        if process_file(filepath):
            fixed_count += 1
    
    # Gera arquivo de tipos
    types_dir = os.path.join(project_path, 'src', 'types')
    os.makedirs(types_dir, exist_ok=True)
    types_file = os.path.join(types_dir, 'prisma.ts')
    
    print(f"\n📄 Gerando definições de tipos em {types_file}...")
    with open(types_file, 'w', encoding='utf-8') as f:
        f.write(generate_type_definitions())
    print("   ✅ Arquivo de tipos criado")
    
    # Resumo
    print("\n" + "=" * 60)
    print(f"✅ Concluído! {fixed_count} arquivos corrigidos")
    print("=" * 60)
    print("\n📋 Próximos passos:")
    print("   1. Execute: npm run build")
    print("   2. Se ainda houver erros, verifique manualmente")
    print(f"   3. Use os tipos de {types_file} nos seus componentes")
    print("\n💡 Dica: Importe os tipos assim:")
    print("   import { Lead, Imovel, Consulta } from '@/types/prisma'")

if __name__ == '__main__':
    main()
