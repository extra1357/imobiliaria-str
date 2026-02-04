#!/usr/bin/env python3
"""
Next.js Build Fixer - Ferramenta para detectar e corrigir problemas de build
Autor: Sistema Automatizado
Data: 2026-02-03
"""

import os
import re
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Tuple
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Anomalia:
    """Classe para representar uma anomalia detectada"""
    tipo: str
    arquivo: str
    linha: int
    descricao: str
    severidade: str  # 'critica', 'alta', 'media', 'baixa'
    corrigivel: bool
    sugestao_correcao: str


class NextJSFixer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.anomalias: List[Anomalia] = []
        self.relatorio: Dict = {
            'timestamp': datetime.now().isoformat(),
            'projeto': str(self.project_root),
            'anomalias_encontradas': 0,
            'anomalias_corrigidas': 0,
            'problemas_criticos': 0
        }
        
    def escanear_projeto(self) -> List[Anomalia]:
        """Escaneia o projeto em busca de anomalias"""
        print(f"🔍 Escaneando projeto em: {self.project_root}")
        print("=" * 80)
        
        # Verifica se o diretório existe
        if not self.project_root.exists():
            print(f"❌ Erro: Diretório {self.project_root} não encontrado!")
            return []
        
        # Executa todas as verificações
        self._verificar_timeout_estatico()
        self._verificar_dynamic_server_usage()
        self._verificar_conexao_database()
        self._verificar_variaveis_ambiente()
        self._verificar_rotas_api()
        self._verificar_configuracao_next()
        self._verificar_middleware()
        self._verificar_imports_problematicos()
        
        # Atualiza relatório
        self.relatorio['anomalias_encontradas'] = len(self.anomalias)
        self.relatorio['problemas_criticos'] = sum(
            1 for a in self.anomalias if a.severidade == 'critica'
        )
        
        return self.anomalias
    
    def _verificar_timeout_estatico(self):
        """Verifica problemas de timeout na geração estática"""
        print("\n📊 Verificando timeouts de geração estática...")
        
        # Procura por arquivos de rotas que podem causar timeout
        pastas_problematicas = [
            'app/api',
            'app/admin',
            'app/imoveis'
        ]
        
        for pasta in pastas_problematicas:
            caminho_pasta = self.project_root / pasta
            if caminho_pasta.exists():
                self._verificar_rotas_na_pasta(caminho_pasta)
    
    def _verificar_rotas_na_pasta(self, pasta: Path):
        """Verifica rotas em uma pasta específica"""
        for arquivo in pasta.rglob('route.ts'):
            self._analisar_arquivo_rota(arquivo)
        
        for arquivo in pasta.rglob('route.js'):
            self._analisar_arquivo_rota(arquivo)
        
        for arquivo in pasta.rglob('page.tsx'):
            self._analisar_arquivo_pagina(arquivo)
    
    def _analisar_arquivo_rota(self, arquivo: Path):
        """Analisa um arquivo de rota API"""
        try:
            conteudo = arquivo.read_text(encoding='utf-8')
            
            # Verifica se há chamadas ao Prisma sem try-catch
            if 'prisma.' in conteudo.lower() and 'try' not in conteudo:
                self.anomalias.append(Anomalia(
                    tipo='PRISMA_SEM_ERRO_HANDLING',
                    arquivo=str(arquivo.relative_to(self.project_root)),
                    linha=0,
                    descricao='Chamada ao Prisma sem tratamento de erro adequado',
                    severidade='alta',
                    corrigivel=True,
                    sugestao_correcao='Adicionar try-catch com timeout'
                ))
            
            # Verifica se a rota não tem export const dynamic
            if 'export' in conteudo and 'dynamic' not in conteudo:
                self.anomalias.append(Anomalia(
                    tipo='ROTA_SEM_DYNAMIC_CONFIG',
                    arquivo=str(arquivo.relative_to(self.project_root)),
                    linha=0,
                    descricao='Rota API sem configuração dynamic',
                    severidade='media',
                    corrigivel=True,
                    sugestao_correcao="Adicionar: export const dynamic = 'force-dynamic'"
                ))
            
            # Verifica operações de banco sem timeout
            if any(op in conteudo for op in ['findMany', 'findUnique', 'create', 'update']):
                if 'timeout' not in conteudo.lower():
                    self.anomalias.append(Anomalia(
                        tipo='QUERY_SEM_TIMEOUT',
                        arquivo=str(arquivo.relative_to(self.project_root)),
                        linha=0,
                        descricao='Query de banco sem timeout configurado',
                        severidade='alta',
                        corrigivel=True,
                        sugestao_correcao='Adicionar timeout nas queries Prisma'
                    ))
        
        except Exception as e:
            print(f"⚠️  Erro ao analisar {arquivo}: {e}")
    
    def _analisar_arquivo_pagina(self, arquivo: Path):
        """Analisa um arquivo de página"""
        try:
            conteudo = arquivo.read_text(encoding='utf-8')
            
            # Verifica uso de request.url em páginas estáticas
            if 'request.url' in conteudo or 'request.headers' in conteudo:
                self.anomalias.append(Anomalia(
                    tipo='DYNAMIC_SERVER_USAGE',
                    arquivo=str(arquivo.relative_to(self.project_root)),
                    linha=self._encontrar_linha(conteudo, 'request.url'),
                    descricao='Uso de request dinâmico que impede renderização estática',
                    severidade='critica',
                    corrigivel=True,
                    sugestao_correcao="Adicionar 'export const dynamic = \"force-dynamic\"' ou refatorar lógica"
                ))
        
        except Exception as e:
            print(f"⚠️  Erro ao analisar {arquivo}: {e}")
    
    def _verificar_dynamic_server_usage(self):
        """Verifica uso de recursos dinâmicos do servidor"""
        print("\n🌐 Verificando uso dinâmico do servidor...")
        
        # Procura por arquivos que usam request.url
        for arquivo in self.project_root.rglob('*.tsx'):
            if 'route' in str(arquivo):
                continue
            
            try:
                conteudo = arquivo.read_text(encoding='utf-8')
                if 'request.url' in conteudo or 'request.headers' in conteudo:
                    self.anomalias.append(Anomalia(
                        tipo='DYNAMIC_SERVER_USAGE',
                        arquivo=str(arquivo.relative_to(self.project_root)),
                        linha=self._encontrar_linha(conteudo, 'request.'),
                        descricao='Uso de recursos dinâmicos em componente estático',
                        severidade='critica',
                        corrigivel=True,
                        sugestao_correcao='Mover lógica para route handler ou adicionar dynamic config'
                    ))
            except:
                pass
    
    def _verificar_conexao_database(self):
        """Verifica problemas de conexão com banco de dados"""
        print("\n🗄️  Verificando configuração de banco de dados...")
        
        # Verifica arquivo .env
        env_file = self.project_root / '.env'
        if env_file.exists():
            try:
                conteudo = env_file.read_text()
                
                # Verifica se DATABASE_URL está configurada
                if 'DATABASE_URL' not in conteudo:
                    self.anomalias.append(Anomalia(
                        tipo='DATABASE_URL_AUSENTE',
                        arquivo='.env',
                        linha=0,
                        descricao='DATABASE_URL não encontrada no arquivo .env',
                        severidade='critica',
                        corrigivel=False,
                        sugestao_correcao='Adicionar DATABASE_URL com string de conexão válida'
                    ))
                
                # Verifica formato da URL do Neon
                if 'neon.tech' in conteudo:
                    # Verifica se tem parâmetros de pool corretos
                    if 'pgbouncer=true' not in conteudo:
                        self.anomalias.append(Anomalia(
                            tipo='DATABASE_POOL_CONFIG',
                            arquivo='.env',
                            linha=self._encontrar_linha(conteudo, 'DATABASE_URL'),
                            descricao='DATABASE_URL do Neon sem configuração de pool adequada',
                            severidade='alta',
                            corrigivel=True,
                            sugestao_correcao='Adicionar ?pgbouncer=true&connection_limit=1 na URL'
                        ))
            except Exception as e:
                print(f"⚠️  Erro ao ler .env: {e}")
        else:
            self.anomalias.append(Anomalia(
                tipo='ENV_AUSENTE',
                arquivo='.env',
                linha=0,
                descricao='Arquivo .env não encontrado',
                severidade='critica',
                corrigivel=False,
                sugestao_correcao='Criar arquivo .env com variáveis necessárias'
            ))
    
    def _verificar_variaveis_ambiente(self):
        """Verifica variáveis de ambiente necessárias"""
        print("\n🔐 Verificando variáveis de ambiente...")
        
        variaveis_necessarias = [
            'DATABASE_URL',
            'NEXTAUTH_SECRET',
            'NEXTAUTH_URL'
        ]
        
        env_file = self.project_root / '.env'
        if env_file.exists():
            conteudo = env_file.read_text()
            
            for var in variaveis_necessarias:
                if var not in conteudo:
                    self.anomalias.append(Anomalia(
                        tipo='VARIAVEL_AMBIENTE_AUSENTE',
                        arquivo='.env',
                        linha=0,
                        descricao=f'Variável {var} não encontrada',
                        severidade='alta',
                        corrigivel=False,
                        sugestao_correcao=f'Adicionar {var}=<valor> no .env'
                    ))
    
    def _verificar_rotas_api(self):
        """Verifica configuração das rotas API"""
        print("\n🛣️  Verificando rotas API...")
        
        api_dir = self.project_root / 'app' / 'api'
        if not api_dir.exists():
            return
        
        for route_file in api_dir.rglob('route.*'):
            self._verificar_configuracao_rota(route_file)
    
    def _verificar_configuracao_rota(self, arquivo: Path):
        """Verifica configuração de uma rota específica"""
        try:
            conteudo = arquivo.read_text(encoding='utf-8')
            
            # Lista de verificações
            verificacoes = {
                'export const dynamic': 'Configuração dynamic ausente',
                'export const runtime': 'Runtime não especificado',
            }
            
            for check, descricao in verificacoes.items():
                if check not in conteudo:
                    self.anomalias.append(Anomalia(
                        tipo='CONFIGURACAO_ROTA_AUSENTE',
                        arquivo=str(arquivo.relative_to(self.project_root)),
                        linha=0,
                        descricao=descricao,
                        severidade='media',
                        corrigivel=True,
                        sugestao_correcao=f'Adicionar: {check} = ...'
                    ))
        except:
            pass
    
    def _verificar_configuracao_next(self):
        """Verifica configuração do Next.js"""
        print("\n⚙️  Verificando next.config.js...")
        
        config_files = [
            self.project_root / 'next.config.js',
            self.project_root / 'next.config.mjs'
        ]
        
        config_found = False
        for config_file in config_files:
            if config_file.exists():
                config_found = True
                try:
                    conteudo = config_file.read_text()
                    
                    # Verifica timeout de build
                    if 'staticPageGenerationTimeout' not in conteudo:
                        self.anomalias.append(Anomalia(
                            tipo='TIMEOUT_CONFIG_AUSENTE',
                            arquivo=str(config_file.name),
                            linha=0,
                            descricao='staticPageGenerationTimeout não configurado',
                            severidade='alta',
                            corrigivel=True,
                            sugestao_correcao='Adicionar staticPageGenerationTimeout: 180'
                        ))
                    
                    # Verifica configuração de imagens
                    if 'images' not in conteudo:
                        self.anomalias.append(Anomalia(
                            tipo='IMAGE_CONFIG_AUSENTE',
                            arquivo=str(config_file.name),
                            linha=0,
                            descricao='Configuração de imagens ausente',
                            severidade='baixa',
                            corrigivel=True,
                            sugestao_correcao='Adicionar configuração de images com domínios permitidos'
                        ))
                except Exception as e:
                    print(f"⚠️  Erro ao ler config: {e}")
        
        if not config_found:
            self.anomalias.append(Anomalia(
                tipo='CONFIG_AUSENTE',
                arquivo='next.config.js',
                linha=0,
                descricao='Arquivo de configuração Next.js não encontrado',
                severidade='alta',
                corrigivel=True,
                sugestao_correcao='Criar next.config.js com configurações básicas'
            ))
    
    def _verificar_middleware(self):
        """Verifica configuração do middleware"""
        print("\n🔒 Verificando middleware...")
        
        middleware_file = self.project_root / 'middleware.ts'
        if not middleware_file.exists():
            middleware_file = self.project_root / 'middleware.js'
        
        if middleware_file.exists():
            try:
                conteudo = middleware_file.read_text()
                
                # Verifica se middleware tem config de matcher
                if 'config' not in conteudo or 'matcher' not in conteudo:
                    self.anomalias.append(Anomalia(
                        tipo='MIDDLEWARE_SEM_MATCHER',
                        arquivo=str(middleware_file.name),
                        linha=0,
                        descricao='Middleware sem configuração de matcher pode afetar performance',
                        severidade='media',
                        corrigivel=True,
                        sugestao_correcao='Adicionar export const config = { matcher: [...] }'
                    ))
            except:
                pass
    
    def _verificar_imports_problematicos(self):
        """Verifica imports que podem causar problemas"""
        print("\n📦 Verificando imports problemáticos...")
        
        for arquivo in self.project_root.rglob('*.tsx'):
            try:
                conteudo = arquivo.read_text(encoding='utf-8')
                
                # Verifica imports de servidor em componentes cliente
                if "'use client'" in conteudo or '"use client"' in conteudo:
                    if 'prisma' in conteudo.lower():
                        self.anomalias.append(Anomalia(
                            tipo='IMPORT_SERVIDOR_EM_CLIENTE',
                            arquivo=str(arquivo.relative_to(self.project_root)),
                            linha=self._encontrar_linha(conteudo, 'prisma'),
                            descricao='Componente cliente importando código de servidor',
                            severidade='critica',
                            corrigivel=True,
                            sugestao_correcao='Mover lógica de banco para Server Actions ou Route Handlers'
                        ))
            except:
                pass
    
    def _encontrar_linha(self, conteudo: str, termo: str) -> int:
        """Encontra a linha onde um termo aparece"""
        linhas = conteudo.split('\n')
        for i, linha in enumerate(linhas, 1):
            if termo in linha:
                return i
        return 0
    
    def corrigir_anomalias(self, auto_fix: bool = False) -> int:
        """Corrige anomalias encontradas"""
        print("\n🔧 Iniciando correções...")
        print("=" * 80)
        
        corrigidas = 0
        
        for anomalia in self.anomalias:
            if not anomalia.corrigivel:
                continue
            
            if not auto_fix:
                resposta = input(f"\n⚠️  Corrigir {anomalia.tipo} em {anomalia.arquivo}? (s/n): ")
                if resposta.lower() != 's':
                    continue
            
            try:
                if self._aplicar_correcao(anomalia):
                    corrigidas += 1
                    print(f"✅ Corrigido: {anomalia.tipo} em {anomalia.arquivo}")
                else:
                    print(f"❌ Falha ao corrigir: {anomalia.tipo}")
            except Exception as e:
                print(f"❌ Erro ao corrigir {anomalia.tipo}: {e}")
        
        self.relatorio['anomalias_corrigidas'] = corrigidas
        return corrigidas
    
    def _aplicar_correcao(self, anomalia: Anomalia) -> bool:
        """Aplica correção para uma anomalia específica"""
        arquivo_path = self.project_root / anomalia.arquivo
        
        if not arquivo_path.exists():
            return False
        
        try:
            conteudo = arquivo_path.read_text(encoding='utf-8')
            conteudo_original = conteudo
            
            # Aplica correções baseadas no tipo
            if anomalia.tipo == 'ROTA_SEM_DYNAMIC_CONFIG':
                conteudo = self._adicionar_dynamic_export(conteudo)
            
            elif anomalia.tipo == 'TIMEOUT_CONFIG_AUSENTE':
                conteudo = self._adicionar_timeout_config(conteudo)
            
            elif anomalia.tipo == 'PRISMA_SEM_ERRO_HANDLING':
                conteudo = self._adicionar_try_catch(conteudo)
            
            elif anomalia.tipo == 'DATABASE_POOL_CONFIG':
                conteudo = self._corrigir_database_url(conteudo)
            
            elif anomalia.tipo == 'CONFIG_AUSENTE':
                return self._criar_next_config()
            
            elif anomalia.tipo == 'DYNAMIC_SERVER_USAGE':
                conteudo = self._adicionar_dynamic_export(conteudo)
            
            # Salva arquivo se houve mudanças
            if conteudo != conteudo_original:
                arquivo_path.write_text(conteudo, encoding='utf-8')
                return True
            
        except Exception as e:
            print(f"Erro ao aplicar correção: {e}")
            return False
        
        return False
    
    def _adicionar_dynamic_export(self, conteudo: str) -> str:
        """Adiciona export const dynamic ao arquivo"""
        if 'export const dynamic' in conteudo:
            return conteudo
        
        # Adiciona após os imports
        linhas = conteudo.split('\n')
        ultima_import = 0
        
        for i, linha in enumerate(linhas):
            if linha.startswith('import '):
                ultima_import = i
        
        linhas.insert(ultima_import + 1, "\nexport const dynamic = 'force-dynamic';")
        linhas.insert(ultima_import + 2, "export const revalidate = 0;")
        
        return '\n'.join(linhas)
    
    def _adicionar_timeout_config(self, conteudo: str) -> str:
        """Adiciona configuração de timeout"""
        if 'staticPageGenerationTimeout' in conteudo:
            return conteudo
        
        # Adiciona dentro do module.exports
        conteudo = conteudo.replace(
            'module.exports = {',
            'module.exports = {\n  staticPageGenerationTimeout: 180,'
        )
        
        return conteudo
    
    def _adicionar_try_catch(self, conteudo: str) -> str:
        """Adiciona try-catch em chamadas Prisma"""
        # Esta é uma correção simplificada
        # Em produção, seria necessário parsing mais sofisticado
        if 'try' in conteudo:
            return conteudo
        
        return conteudo  # Não modifica por segurança
    
    def _corrigir_database_url(self, conteudo: str) -> str:
        """Corrige DATABASE_URL para incluir parâmetros de pool"""
        if '?pgbouncer=true' in conteudo:
            return conteudo
        
        # Adiciona parâmetros de pool
        conteudo = conteudo.replace(
            'neon.tech:5432',
            'neon.tech:5432?pgbouncer=true&connection_limit=1'
        )
        
        return conteudo
    
    def _criar_next_config(self) -> bool:
        """Cria arquivo next.config.js básico"""
        config_content = """/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 180,
  images: {
    domains: [],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
"""
        
        config_path = self.project_root / 'next.config.js'
        config_path.write_text(config_content)
        return True
    
    def gerar_relatorio(self, output_file: str = None):
        """Gera relatório detalhado das anomalias"""
        print("\n📝 Gerando relatório...")
        print("=" * 80)
        
        # Agrupa anomalias por severidade
        por_severidade = {
            'critica': [],
            'alta': [],
            'media': [],
            'baixa': []
        }
        
        for anomalia in self.anomalias:
            por_severidade[anomalia.severidade].append(anomalia)
        
        # Imprime resumo
        print(f"\n📊 RESUMO DO ESCANEAMENTO")
        print(f"Projeto: {self.relatorio['projeto']}")
        print(f"Data: {self.relatorio['timestamp']}")
        print(f"\nTotal de anomalias: {self.relatorio['anomalias_encontradas']}")
        print(f"Anomalias corrigidas: {self.relatorio['anomalias_corrigidas']}")
        print(f"\n🔴 Críticas: {len(por_severidade['critica'])}")
        print(f"🟠 Altas: {len(por_severidade['alta'])}")
        print(f"🟡 Médias: {len(por_severidade['media'])}")
        print(f"🟢 Baixas: {len(por_severidade['baixa'])}")
        
        # Imprime detalhes
        for severidade, anomalias_lista in por_severidade.items():
            if not anomalias_lista:
                continue
            
            emoji = {'critica': '🔴', 'alta': '🟠', 'media': '🟡', 'baixa': '🟢'}
            print(f"\n\n{emoji[severidade]} ANOMALIAS {severidade.upper()}")
            print("-" * 80)
            
            for i, anomalia in enumerate(anomalias_lista, 1):
                print(f"\n{i}. {anomalia.tipo}")
                print(f"   Arquivo: {anomalia.arquivo}")
                if anomalia.linha > 0:
                    print(f"   Linha: {anomalia.linha}")
                print(f"   Descrição: {anomalia.descricao}")
                print(f"   Corrigível: {'Sim' if anomalia.corrigivel else 'Não'}")
                print(f"   Sugestão: {anomalia.sugestao_correcao}")
        
        # Salva relatório em arquivo se especificado
        if output_file:
            self._salvar_relatorio_json(output_file)
    
    def _salvar_relatorio_json(self, output_file: str):
        """Salva relatório em formato JSON"""
        relatorio_completo = {
            **self.relatorio,
            'anomalias': [
                {
                    'tipo': a.tipo,
                    'arquivo': a.arquivo,
                    'linha': a.linha,
                    'descricao': a.descricao,
                    'severidade': a.severidade,
                    'corrigivel': a.corrigivel,
                    'sugestao_correcao': a.sugestao_correcao
                }
                for a in self.anomalias
            ]
        }
        
        output_path = Path(output_file)
        output_path.write_text(json.dumps(relatorio_completo, indent=2, ensure_ascii=False))
        print(f"\n💾 Relatório salvo em: {output_file}")


def criar_scripts_auxiliares(project_root: Path):
    """Cria scripts auxiliares para o projeto"""
    
    # Script para verificar conexão com banco
    check_db_script = """#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados OK');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao conectar com banco:', error.message);
    process.exit(1);
  }
}

checkConnection();
"""
    
    script_path = project_root / 'scripts'
    script_path.mkdir(exist_ok=True)
    
    (script_path / 'check-db.js').write_text(check_db_script)
    print(f"✅ Script de verificação de DB criado em: scripts/check-db.js")
    
    # Script package.json para adicionar
    print("\n📦 Adicione ao package.json:")
    print("""
  "scripts": {
    ...
    "check:db": "node scripts/check-db.js",
    "fix:build": "python3 nextjs_fixer.py --fix",
    "analyze": "python3 nextjs_fixer.py --analyze"
  }
""")


def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Next.js Build Fixer - Ferramenta para detectar e corrigir problemas'
    )
    parser.add_argument(
        'project_root',
        nargs='?',
        default='.',
        help='Caminho raiz do projeto Next.js'
    )
    parser.add_argument(
        '--fix',
        action='store_true',
        help='Corrige automaticamente problemas detectados'
    )
    parser.add_argument(
        '--analyze',
        action='store_true',
        help='Apenas analisa sem corrigir'
    )
    parser.add_argument(
        '--report',
        type=str,
        help='Caminho para salvar relatório JSON'
    )
    parser.add_argument(
        '--create-scripts',
        action='store_true',
        help='Cria scripts auxiliares'
    )
    
    args = parser.parse_args()
    
    print("=" * 80)
    print("🔧 NEXT.JS BUILD FIXER")
    print("=" * 80)
    
    # Cria instância do fixer
    fixer = NextJSFixer(args.project_root)
    
    # Escaneia projeto
    anomalias = fixer.escanear_projeto()
    
    if not anomalias:
        print("\n✅ Nenhuma anomalia detectada! Projeto está saudável.")
        return
    
    # Corrige se solicitado
    if args.fix:
        fixer.corrigir_anomalias(auto_fix=True)
    elif not args.analyze:
        fixer.corrigir_anomalias(auto_fix=False)
    
    # Gera relatório
    fixer.gerar_relatorio(args.report)
    
    # Cria scripts auxiliares se solicitado
    if args.create_scripts:
        criar_scripts_auxiliares(Path(args.project_root))
    
    print("\n" + "=" * 80)
    print("✨ Escaneamento concluído!")
    print("=" * 80)
    
    # Recomendações finais
    print("\n💡 PRÓXIMOS PASSOS RECOMENDADOS:")
    print("1. Revisar as correções aplicadas")
    print("2. Executar: npm run build")
    print("3. Verificar conexão com banco: npm run check:db")
    print("4. Testar aplicação localmente")
    print("5. Fazer deploy se tudo estiver OK")


if __name__ == '__main__':
    main()
