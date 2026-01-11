// src/app/api/auth/solicitar-reset/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import crypto from 'crypto';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    // NÃO revelar se o email existe ou não (segurança)
    if (!usuario) {
      return NextResponse.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
      });
    }

    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      return NextResponse.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
      });
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiraEm = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Salvar token no banco
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken: token,
        resetTokenExpira: expiraEm
      }
    });

    // URL de redefinição
    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/admin/redefinir-senha?token=${token}`;

    // Enviar email
    await resend.emails.send({
      from: 'STR Imobiliária <onboarding@resend.dev>',
      to: email,
      subject: 'Redefinição de Senha - STR Imobiliária',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🏠 STR Imobiliária</h1>
                    </td>
                  </tr>

                  <!-- Conteúdo -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Redefinição de Senha</h2>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Olá, <strong>${usuario.nome}</strong>!
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Recebemos uma solicitação para redefinir a senha da sua conta. 
                        Clique no botão abaixo para criar uma nova senha:
                      </p>

                      <!-- Botão -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              Redefinir Senha
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Ou copie e cole este link no seu navegador:
                      </p>
                      
                      <p style="margin: 0 0 20px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 13px; color: #4b5563;">
                        ${resetUrl}
                      </p>

                      <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                          ⏰ <strong>Este link expira em 1 hora.</strong>
                        </p>
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">
                          🔒 Se você não solicitou esta redefinição, ignore este email.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
                      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                        © 2026 STR Imobiliária. Todos os direitos reservados.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    // Registrar na auditoria
    await prisma.auditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: 'SOLICITACAO_RESET_SENHA',
        detalhes: `Reset de senha solicitado para ${email}`,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
    });

  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
