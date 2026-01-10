import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Inserção Profissional STR
    const novoLead = await prisma.lead.create({
      data: {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        imovelInteresse: body.imovel,
        mensagem: body.mensagem,
        dataPreferencia: body.data_contato,
        origem: "Site Profissional",
        status: "frio"
      }
    });

    return NextResponse.json({ success: true, lead: novoLead });
  } catch (error: any) {
    console.error("ERRO CRÍTICO NO POSTGRES [STR]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
