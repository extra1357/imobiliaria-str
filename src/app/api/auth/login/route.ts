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
  } catch (error: any) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
