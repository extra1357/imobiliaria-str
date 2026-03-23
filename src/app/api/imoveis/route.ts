export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateCodigo } from '@/lib/generateSlug';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cidade = searchParams.get('cidade');

    const imoveis = await prisma.imovel.findMany({
      where: cidade
        ? { cidade: { contains: cidade, mode: 'insensitive' } }
        : undefined,
      include: {
        proprietario: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(imoveis);
  } catch (error: any) {
    console.error('❌ Erro ao ler banco STR:', error);
    return NextResponse.json({ error: 'Erro ao ler banco STR' }, { status: 500 });
  }
}

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
      imagens,
      finalidade,
      cep,
      suites,
      precoAluguel,
      caracteristicas,
      destaque
    } = body;

    // Validação dos campos obrigatórios que o site público precisa para renderizar
    if (!tipo || !endereco || !cidade || !estado || !preco || !metragem || !proprietarioId) {
      return NextResponse.json({ 
        error: "Campos obrigatórios faltando", 
        campos: "tipo, endereco, cidade, estado, preco, metragem, proprietarioId" 
      }, { status: 400 });
    }

    // Extração segura do bairro para alimentar as páginas de cidades
    const bairroExtraido = endereco.split(',')[1]?.trim() || body.bairro || '';

    const codigo = body.codigo || generateCodigo(tipo);
    const slug = generateSlug({
      tipo,
      cidade,
      bairro: bairroExtraido,
      quartos: quartos ? parseInt(quartos) : 0,
      codigo
    });

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
        status: 'ATIVO', // Força o status exigido pela rota /publico
        disponivel: true, // Força a disponibilidade exigida pela rota /publico
        codigo,
        slug,
        bairro: bairroExtraido || null,
        finalidade: finalidade || 'venda',
        cep: cep || null,
        suites: suites ? parseInt(suites) : 0,
        precoAluguel: precoAluguel ? parseFloat(precoAluguel) : null,
        caracteristicas: caracteristicas || [],
        destaque: destaque || false,
      }
    });

    return NextResponse.json(novoImovel, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar imóvel:', error);
    return NextResponse.json({ error: "Erro ao gravar no banco STR", detalhes: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) throw new Error('ID não fornecido');

    await prisma.imovel.delete({ where: { id } });

    return NextResponse.json({ mensagem: 'Imóvel removido com sucesso' });
  } catch (error: any) {
    console.error('❌ Erro ao deletar imóvel:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
