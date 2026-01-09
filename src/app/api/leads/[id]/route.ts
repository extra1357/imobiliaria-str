import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { 
        consultas: {
          include: {
            imovel: true
          }
        }, 
        historicos: true 
      }
    });

    if (!lead) return NextResponse.json({ error: "Lead não localizado" }, { status: 404 });
    return NextResponse.json(lead);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro na consulta STR" }, { status: 500 });
  }
}
