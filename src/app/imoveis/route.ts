import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const imovel = await prisma.imovel.findUnique({
      where: { id: params.id }
    });
    
    if (!imovel) {
      return NextResponse.json(
        { error: 'Imóvel não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(imovel);
  } catch (error: any) {
    console.error('Erro ao buscar imóvel:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
