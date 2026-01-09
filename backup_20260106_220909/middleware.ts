import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Liberação Total: ignora qualquer checagem de cookie ou sessão
  return NextResponse.next();
}

export const config = {
  // Aplica-se a todas as rotas do sistema
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
