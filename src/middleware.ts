/**
 * 🛡️ MIDDLEWARE DE SEGURANÇA - STR Imobiliária
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'TROQUE');

// ✅ ROTAS PÚBLICAS - Qualquer pessoa pode acessar
const PUBLIC_ROUTES = [
  '/',                      // Página inicial
  '/admin/login',           // Página de login
  '/imoveis-publicos',      // Listagem pública de imóveis
  '/api/auth/login',        // API de login
  '/api/imoveis/publico',   // API pública de imóveis (apenas disponíveis)
  '/api/busca',             // Busca pública
];

// 🔒 ROTAS QUE EXIGEM ADMIN
const ADMIN_ROUTES = [
  '/admin',
  '/api/leads',
  '/api/proprietarios', 
  '/api/imoveis/cadastro',
  '/api/consultas',
  '/api/analises',
  '/api/analise-mercado',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || 
    (route.endsWith('/publico') && pathname.startsWith(route))
  );
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
  
  // Ignora arquivos estáticos
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Rotas públicas - libera acesso
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Todas as outras rotas exigem autenticação
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    const response = pathname.startsWith('/api')
      ? NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      : NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
  
  // Verifica permissão de admin para rotas administrativas
  if (isAdminRoute(pathname) && payload.role !== 'admin') {
    return pathname.startsWith('/api')
      ? NextResponse.json({ error: 'Acesso negado - Admin necessário' }, { status: 403 })
      : NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
