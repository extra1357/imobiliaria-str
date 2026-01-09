#!/bin/bash

# 🔒 INSTALADOR COMPLETO - CRIA TODOS OS ARQUIVOS
# Execute este script na pasta raiz do seu projeto

echo "🔒 INSTALADOR DE SEGURANÇA - CRIANDO TODOS OS ARQUIVOS..."
echo ""

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Execute na pasta raiz do projeto!"
    exit 1
fi

# 1. Instalar dependências
echo "📥 Instalando dependências..."
npm install jose zod bcryptjs
npm install -D @types/bcryptjs

# 2. Criar diretórios
echo "📁 Criando estrutura de pastas..."
mkdir -p src/lib
mkdir -p src/app/api/auth/login
mkdir -p src/app/api/auth/logout
mkdir -p src/app/admin/login

# 3. Criar backup
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
[ -f "src/middleware.ts" ] && cp src/middleware.ts "$BACKUP_DIR/"
[ -f "src/lib/prisma.ts" ] && cp src/lib/prisma.ts "$BACKUP_DIR/"
echo "✅ Backup em: $BACKUP_DIR"

# 4. Criar src/lib/auth.ts
echo "📝 Criando src/lib/auth.ts..."
cat > src/lib/auth.ts << 'ENDOFFILE'
/**
 * 🔒 SISTEMA DE AUTENTICAÇÃO JWT
 */
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'TROQUE_ESTA_CHAVE'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as JWTPayload;
}

export function setAuthCookies(response: NextResponse, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24
  });
  response.cookies.set('authenticated', 'true', {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('auth-token');
  response.cookies.delete('authenticated');
}

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}
ENDOFFILE

echo "✅ src/lib/auth.ts criado"

# 5. Criar src/lib/prisma.ts
echo "📝 Criando src/lib/prisma.ts..."
cat > src/lib/prisma.ts << 'ENDOFFILE'
/**
 * 🗄️ PRISMA CLIENT SINGLETON
 */
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
ENDOFFILE

echo "✅ src/lib/prisma.ts criado"

# 6. Criar src/lib/validation.ts
echo "📝 Criando src/lib/validation.ts..."
cat > src/lib/validation.ts << 'ENDOFFILE'
/**
 * 🛡️ VALIDAÇÃO COM ZOD
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

export type LoginInput = z.infer<typeof loginSchema>;
ENDOFFILE

echo "✅ src/lib/validation.ts criado"

# 7. Criar src/middleware.ts
echo "📝 Criando src/middleware.ts..."
cat > src/middleware.ts << 'ENDOFFILE'
/**
 * 🛡️ MIDDLEWARE DE SEGURANÇA
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'TROQUE');

const PUBLIC_ROUTES = ['/', '/login', '/api/auth/login', '/api/leads', '/api/imoveis/publico'];
const ADMIN_ROUTES = ['/admin', '/api/proprietarios', '/api/imoveis', '/api/consultas'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }
  
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
  }
  
  const payload = await verifyToken(token!);
  
  if (!payload) {
    const response = pathname.startsWith('/api')
      ? NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
  
  if (isAdminRoute(pathname) && payload.role !== 'admin') {
    return pathname.startsWith('/api')
      ? NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      : NextResponse.redirect(new URL('/acesso-negado', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
ENDOFFILE

echo "✅ src/middleware.ts criado"

# 8. Criar src/app/api/auth/login/route.ts
echo "📝 Criando src/app/api/auth/login/route.ts..."
cat > src/app/api/auth/login/route.ts << 'ENDOFFILE'
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateToken, setAuthCookies } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }
    
    const { email, password } = validation.data;
    
    const user = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true, nome: true, email: true, senha: true, role: true, ativo: true }
    });
    
    if (!user || !user.ativo) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }
    
    const senhaValida = await bcrypt.compare(password, user.senha);
    
    if (!senhaValida) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }
    
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    const { senha, ...userData } = user;
    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: { user: userData }
    });
    
    setAuthCookies(response, token);
    
    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
ENDOFFILE

echo "✅ src/app/api/auth/login/route.ts criado"

# 9. Criar src/app/admin/login/page.tsx
echo "📝 Criando src/app/admin/login/page.tsx..."
cat > src/app/admin/login/page.tsx << 'ENDOFFILE'
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao fazer login');

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">🏘️ Digital Imóveis</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Senha</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
ENDOFFILE

echo "✅ src/app/admin/login/page.tsx criado"

# 10. Gerar chaves
echo ""
echo "🔐 Configurando .env..."

if [ ! -f ".env" ]; then
    cp .env .env.backup 2>/dev/null || true
fi

# Gerar JWT_SECRET
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo "JWT_SECRET=$JWT_SECRET" >> .env
echo "✅ JWT_SECRET gerado"

# 11. Atualizar Prisma
echo ""
echo "🗄️  Atualizando Prisma..."
npx prisma generate

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          ✅ INSTALAÇÃO CONCLUÍDA!                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. Testar: npm run dev"
echo "2. Login: http://localhost:3000/login"
echo "3. Criar admin (se necessário)"
echo ""
echo "🎉 Sistema agora está seguro!"
