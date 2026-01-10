// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'TROQUE');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        corretor: {
          select: {
            id: true,
            nome: true,
            creci: true
          }
        }
      }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      return NextResponse.json(
        { error: 'Usuário desativado. Entre em contato com o administrador.' },
        { status: 403 }
      );
    }

    // Verificar se usuário está bloqueado
    if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
      const minutosRestantes = Math.ceil(
        (usuario.bloqueadoAte.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { 
          error: `Usuário bloqueado temporariamente. Tente novamente em ${minutosRestantes} minutos.`,
          bloqueadoAte: usuario.bloqueadoAte 
        },
        { status: 423 }
      );
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(password, usuario.senha);

    if (!senhaValida) {
      // Incrementar tentativas de login
      const tentativas = (usuario.tentativasLogin || 0) + 1;
      
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          tentativasLogin: tentativas,
          bloqueadoAte: tentativas >= 5 
            ? new Date(Date.now() + 15 * 60 * 1000) 
            : null
        }
      });

      return NextResponse.json(
        { 
          error: 'Credenciais inválidas',
          tentativasRestantes: Math.max(0, 5 - tentativas)
        },
        { status: 401 }
      );
    }

    // ===== LOGIN VÁLIDO =====

    // Resetar tentativas de login e atualizar último acesso
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tentativasLogin: 0,
        bloqueadoAte: null,
        ultimoLogin: new Date()
      }
    });

    // Criar JWT com informações do usuário
    const token = await new SignJWT({
      userId: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      role: usuario.role,
      corretorId: usuario.corretorId || undefined,
      corretorNome: usuario.corretor?.nome || undefined
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Log de auditoria
    await prisma.auditoria.create({
      data: {
        usuario: usuario.id,
        acao: 'LOGIN',
        tabela: 'usuarios',
        registroId: usuario.id,
        ip: request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }).catch(err => console.error('Erro ao registrar auditoria:', err));

    // Criar resposta com cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        corretor: usuario.corretor ? {
          id: usuario.corretor.id,
          nome: usuario.corretor.nome,
          creci: usuario.corretor.creci
        } : null
      }
    });

    // Setar cookie seguro
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      try {
        const { jwtVerify } = await import('jose');
        const { payload } = await jwtVerify(token, JWT_SECRET);
        
        await prisma.auditoria.create({
          data: {
            usuario: payload.userId as string,
            acao: 'LOGOUT',
            tabela: 'usuarios',
            registroId: payload.userId as string
          }
        });
      } catch {
        // Ignora erro se token inválido
      }
    }

    const response = NextResponse.json({ 
      success: true, 
      message: 'Logout realizado com sucesso' 
    });
    
    response.cookies.delete('auth-token');
    
    return response;

  } catch (error: any) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.userId as string },
      include: {
        corretor: {
          select: {
            id: true,
            nome: true,
            creci: true
          }
        }
      }
    });

    if (!usuario || !usuario.ativo) {
      return NextResponse.json(
        { error: 'Usuário inválido ou desativado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        corretor: usuario.corretor
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Token inválido', authenticated: false },
      { status: 401 }
    );
  }
}
