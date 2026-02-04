#!/usr/bin/env python3
"""
Correções Específicas para Problemas Detectados no Build
Este script corrige os problemas específicos encontrados no log de build
"""

import os
from pathlib import Path
import json


class BuildProblemsFixe:
    """Corrige problemas específicos detectados no build"""
    
    def __init__(self, project_root: str):
        self.root = Path(project_root)
        self.fixes_applied = []
        
    def fix_all(self):
        """Aplica todas as correções"""
        print("🔧 Aplicando correções específicas...\n")
        
        self.fix_database_connection()
        self.fix_dynamic_routes()
        self.fix_next_config()
        self.fix_api_routes_timeout()
        self.fix_env_file()
        self.create_prisma_singleton()
        
        self.print_summary()
    
    def fix_database_connection(self):
        """Corrige problemas de conexão com banco de dados"""
        print("1. 🗄️  Corrigindo conexão com banco de dados...")
        
        # Cria arquivo lib/prisma.ts para singleton do Prisma
        lib_dir = self.root / 'lib'
        lib_dir.mkdir(exist_ok=True)
        
        prisma_content = """import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
"""
        
        prisma_file = lib_dir / 'prisma.ts'
        prisma_file.write_text(prisma_content)
        self.fixes_applied.append("✅ Criado singleton do Prisma em lib/prisma.ts")
        print("   ✅ Singleton do Prisma criado")
    
    def fix_dynamic_routes(self):
        """Corrige problemas de rotas dinâmicas"""
        print("\n2. 🌐 Corrigindo rotas dinâmicas...")
        
        # Lista de rotas que precisam ser dinâmicas
        dynamic_routes = [
            'app/imoveis/route.ts',
            'app/imoveis/route.js',
        ]
        
        for route_path in dynamic_routes:
            full_path = self.root / route_path
            if full_path.exists():
                try:
                    content = full_path.read_text()
                    
                    # Adiciona export const dynamic se não existir
                    if 'export const dynamic' not in content:
                        # Adiciona após os imports
                        lines = content.split('\n')
                        import_end = 0
                        
                        for i, line in enumerate(lines):
                            if line.startswith('import ') or line.startswith('import{'):
                                import_end = i
                        
                        lines.insert(import_end + 1, '')
                        lines.insert(import_end + 2, "export const dynamic = 'force-dynamic';")
                        lines.insert(import_end + 3, "export const revalidate = 0;")
                        
                        full_path.write_text('\n'.join(lines))
                        self.fixes_applied.append(f"✅ Adicionado dynamic export em {route_path}")
                        print(f"   ✅ Corrigido: {route_path}")
                except Exception as e:
                    print(f"   ⚠️  Erro ao corrigir {route_path}: {e}")
    
    def fix_next_config(self):
        """Corrige ou cria next.config.js"""
        print("\n3. ⚙️  Corrigindo configuração do Next.js...")
        
        config_path = self.root / 'next.config.js'
        config_mjs_path = self.root / 'next.config.mjs'
        
        # Determina qual arquivo usar
        if config_mjs_path.exists():
            config_file = config_mjs_path
        else:
            config_file = config_path
        
        if config_file.exists():
            try:
                content = config_file.read_text()
                
                # Adiciona staticPageGenerationTimeout se não existir
                if 'staticPageGenerationTimeout' not in content:
                    # Adiciona dentro do objeto de configuração
                    content = content.replace(
                        'const nextConfig = {',
                        'const nextConfig = {\n  staticPageGenerationTimeout: 180,'
                    )
                    
                    config_file.write_text(content)
                    self.fixes_applied.append("✅ Adicionado timeout de 180s no next.config")
                    print("   ✅ Timeout configurado para 180s")
            except Exception as e:
                print(f"   ⚠️  Erro ao modificar config: {e}")
        else:
            # Cria novo arquivo de configuração
            new_config = """/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aumenta timeout para geração de páginas estáticas
  staticPageGenerationTimeout: 180,
  
  // Configuração de imagens
  images: {
    domains: [],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Experimental
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Output standalone para deploy
  output: 'standalone',
}

module.exports = nextConfig
"""
            config_path.write_text(new_config)
            self.fixes_applied.append("✅ Criado next.config.js com configurações otimizadas")
            print("   ✅ next.config.js criado")
    
    def fix_api_routes_timeout(self):
        """Adiciona timeout nas rotas API que fazem queries no banco"""
        print("\n4. ⏱️  Adicionando timeout nas rotas API...")
        
        api_dir = self.root / 'app' / 'api'
        if not api_dir.exists():
            print("   ⚠️  Diretório app/api não encontrado")
            return
        
        # Template para adicionar no início das rotas
        timeout_template = """
// Configuração de timeout e cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60; // Timeout de 60 segundos
"""
        
        routes_fixed = 0
        for route_file in api_dir.rglob('route.*'):
            try:
                content = route_file.read_text()
                
                # Verifica se já tem as configurações
                if 'export const dynamic' not in content:
                    # Adiciona após os imports
                    lines = content.split('\n')
                    import_end = 0
                    
                    for i, line in enumerate(lines):
                        if line.startswith('import '):
                            import_end = i
                    
                    # Insere as configurações
                    lines.insert(import_end + 1, timeout_template)
                    
                    route_file.write_text('\n'.join(lines))
                    routes_fixed += 1
            except Exception as e:
                print(f"   ⚠️  Erro em {route_file}: {e}")
        
        if routes_fixed > 0:
            self.fixes_applied.append(f"✅ Timeout adicionado em {routes_fixed} rotas API")
            print(f"   ✅ {routes_fixed} rotas corrigidas")
    
    def fix_env_file(self):
        """Verifica e corrige arquivo .env"""
        print("\n5. 🔐 Verificando arquivo .env...")
        
        env_file = self.root / '.env'
        env_example = self.root / '.env.example'
        
        # Cria .env.example se não existir
        if not env_example.exists():
            example_content = """# Database
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true&connection_limit=1"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
"""
            env_example.write_text(example_content)
            self.fixes_applied.append("✅ Criado .env.example")
            print("   ✅ .env.example criado")
        
        # Verifica .env
        if env_file.exists():
            content = env_file.read_text()
            
            # Verifica se DATABASE_URL tem parâmetros de pool
            if 'DATABASE_URL' in content and 'neon.tech' in content:
                if '?pgbouncer=true' not in content:
                    print("   ⚠️  DATABASE_URL sem parâmetros de pool otimizados")
                    print("   💡 Adicione ao final da URL: ?pgbouncer=true&connection_limit=1")
        else:
            print("   ⚠️  Arquivo .env não encontrado")
            print("   💡 Crie baseado no .env.example")
    
    def create_prisma_singleton(self):
        """Cria wrapper para queries Prisma com timeout"""
        print("\n6. 🛡️  Criando wrapper de queries com timeout...")
        
        lib_dir = self.root / 'lib'
        lib_dir.mkdir(exist_ok=True)
        
        db_wrapper = """import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

/**
 * Executa query com timeout
 * @param queryFn Função que executa a query
 * @param timeoutMs Timeout em milissegundos (padrão: 30s)
 */
export async function queryWithTimeout<T>(
  queryFn: () => Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Query timeout após ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    return await Promise.race([queryFn(), timeoutPromise])
  } catch (error) {
    console.error('Erro na query:', error)
    throw error
  }
}

/**
 * Executa múltiplas queries em paralelo com timeout
 */
export async function queryBatch<T>(
  queries: (() => Promise<T>)[],
  timeoutMs: number = 30000
): Promise<T[]> {
  return Promise.all(
    queries.map(query => queryWithTimeout(query, timeoutMs))
  )
}

/**
 * Helper para buscar com paginação
 */
export async function findManyWithPagination<T>(
  model: any,
  where: any,
  page: number = 1,
  pageSize: number = 20,
  orderBy?: any
) {
  const skip = (page - 1) * pageSize

  return queryBatch([
    () => model.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
    }),
    () => model.count({ where }),
  ])
}

export { prisma }
export default prisma
"""
        
        db_file = lib_dir / 'db.ts'
        db_file.write_text(db_wrapper)
        self.fixes_applied.append("✅ Criado wrapper de queries em lib/db.ts")
        print("   ✅ Wrapper de queries criado")
    
    def print_summary(self):
        """Imprime resumo das correções"""
        print("\n" + "=" * 80)
        print("📊 RESUMO DAS CORREÇÕES APLICADAS")
        print("=" * 80)
        
        for fix in self.fixes_applied:
            print(fix)
        
        print("\n" + "=" * 80)
        print("📝 PRÓXIMOS PASSOS")
        print("=" * 80)
        print("""
1. 🔍 VERIFICAR ARQUIVO .ENV
   - Certifique-se que DATABASE_URL está correta
   - Adicione parâmetros de pool: ?pgbouncer=true&connection_limit=1
   - Verifique NEXTAUTH_SECRET e NEXTAUTH_URL

2. 📦 ATUALIZAR IMPORTS NAS ROTAS API
   - Substitua: import { PrismaClient } from '@prisma/client'
   - Por: import { prisma, queryWithTimeout } from '@/lib/db'
   - Use queryWithTimeout() para queries demoradas

3. 🔄 ATUALIZAR CÓDIGO DAS ROTAS
   Exemplo de rota API corrigida:
   
   ```typescript
   import { prisma, queryWithTimeout } from '@/lib/db';
   import { NextResponse } from 'next/server';

   export const dynamic = 'force-dynamic';
   export const revalidate = 0;
   export const maxDuration = 60;

   export async function GET(request: Request) {
     try {
       const data = await queryWithTimeout(
         () => prisma.imovel.findMany({
           where: { disponivel: true },
           take: 20,
         }),
         30000 // 30 segundos
       );
       
       return NextResponse.json(data);
     } catch (error) {
       console.error('Erro:', error);
       return NextResponse.json(
         { error: 'Erro ao buscar dados' },
         { status: 500 }
       );
     }
   }
   ```

4. ✅ TESTAR
   - Execute: npm run build
   - Verifique se não há mais timeouts
   - Teste a conexão: npm run check:db

5. 🚀 DEPLOY
   - Faça commit das mudanças
   - Execute deploy na plataforma escolhida
""")
        
        print("=" * 80)


def create_additional_files(project_root: Path):
    """Cria arquivos auxiliares adicionais"""
    
    # Script para verificar conexão
    scripts_dir = project_root / 'scripts'
    scripts_dir.mkdir(exist_ok=True)
    
    check_db = """#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConnection() {
  console.log('🔍 Verificando conexão com banco de dados...');
  
  try {
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testa query simples
    const count = await prisma.imovel.count();
    console.log(`✅ Query teste OK - ${count} imóveis encontrados`);
    
    await prisma.$disconnect();
    console.log('✅ Desconectado com sucesso');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    console.error('💡 Verifique:');
    console.error('   - DATABASE_URL no arquivo .env');
    console.error('   - Se o banco está acessível');
    console.error('   - Se as credenciais estão corretas');
    
    process.exit(1);
  }
}

checkConnection();
"""
    
    (scripts_dir / 'check-db.js').write_text(check_db)
    
    # Middleware otimizado
    middleware = """import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Performance: early return para static assets
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/') ||
    request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Adicione sua lógica de autenticação aqui se necessário
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
"""
    
    (project_root / 'middleware.ts').write_text(middleware)
    
    # tsconfig.json otimizado
    tsconfig = """{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
"""
    
    (project_root / 'tsconfig.json').write_text(tsconfig)
    
    print("\n✅ Arquivos auxiliares criados:")
    print("   - scripts/check-db.js")
    print("   - middleware.ts")
    print("   - tsconfig.json")


def main():
    import sys
    
    project_root = sys.argv[1] if len(sys.argv) > 1 else '.'
    
    print("=" * 80)
    print("🔧 CORRETOR DE PROBLEMAS DE BUILD - NEXT.JS")
    print("=" * 80)
    print(f"Projeto: {project_root}\n")
    
    fixer = BuildProblemsFixer(project_root)
    fixer.fix_all()
    
    print("\n📦 Criando arquivos auxiliares...")
    create_additional_files(Path(project_root))
    
    print("\n✨ Correções concluídas!")
    print("Execute: npm run build")


if __name__ == '__main__':
    main()
