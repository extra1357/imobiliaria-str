export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      tipo, 
      endereco, 
      cidade, 
      estado,
      preco, 
      metragem,
      quartos,
      banheiros,
      vagas,
      descricao,
      proprietarioId,
      imagens 
    } = body;

    // Validação dos campos obrigatórios
    if (!tipo || !endereco || !cidade || !estado || !preco || !metragem || !proprietarioId) {
      return NextResponse.json({ 
        error: "Campos obrigatórios faltando", 
        campos: "tipo, endereco, cidade, estado, preco, metragem, proprietarioId" 
      }, { status: 400 });
    }

    const novoImovel = await prisma.imovel.create({
      data: {
        tipo,
        endereco,
        cidade,
        estado,
        preco: parseFloat(preco),
        metragem: parseFloat(metragem),
        quartos: quartos ? parseInt(quartos) : 0,
        banheiros: banheiros ? parseInt(banheiros) : 0,
        vagas: vagas ? parseInt(vagas) : 0,
        descricao: descricao || null,
        proprietarioId,
        imagens: Array.isArray(imagens) ? imagens : (imagens ? [imagens] : []),
        status: 'ATIVO'
      }
    });

    return NextResponse.json(novoImovel, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar imóvel:', error);
    return NextResponse.json({ error: "Erro ao gravar no banco STR", detalhes: error.message }, { status: 500 });
  }
}
