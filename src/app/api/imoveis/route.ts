export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateCodigo } from '@/lib/generateSlug';

// GET: Lista todos os imóveis com dados do proprietário
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

// POST: Cria um novo imóvel
export async function POST(request: Request) {
  try {
    // Para evitar 413 do Next.js/Vercel com Base64 muito grandes
    const body = await request.json();
    console.log('📦 Recebido para salvar:', body.codigo || 'Novo Imóvel');

    const codigo = body.codigo || generateCodigo(body.tipo);
    
    // Fallback seguro caso o split do endereço falhe
    const bairroFallback = body.endereco && body.endereco.includes(',') 
      ? body.endereco.split(',')[1]?.trim() 
      : '';

    const slug = generateSlug({
      tipo: body.tipo,
      cidade: body.cidade,
      bairro: body.bairro || bairroFallback,
      quartos: parseInt(body.quartos) || 0,
      codigo,
    });

    const novoImovel = await prisma.imovel.create({
      data: {
        tipo: body.tipo,
        endereco: body.endereco,
        cidade: body.cidade,
        estado: body.estado,
        preco: Number(body.preco) || 0,
        metragem: Number(body.metragem) || 0,
        quartos: parseInt(body.quartos) || 0,
        banheiros: parseInt(body.banheiros) || 0,
        vagas: parseInt(body.vagas) || 0,
        descricao: body.descricao || '',
        status: body.status || 'ATIVO',
        disponivel: body.disponivel !== undefined ? body.disponivel : true,
        imagens: body.imagens || [], // Se for Base64, garanta que não passe de 4.5MB no total na Vercel
        proprietarioId: body.proprietarioId,
        finalidade: body.finalidade || 'venda',
        bairro: body.bairro || null,
        cep: body.cep || null,
        suites: parseInt(body.suites) || 0,
        precoAluguel: body.precoAluguel ? Number(body.precoAluguel) : null,
        caracteristicas: body.caracteristicas || [],
        destaque: body.destaque || false,
        codigo,
        slug,
      },
    });

    return NextResponse.json(novoImovel);
  } catch (error: any) {
    console.error('❌ Erro ao salvar imóvel:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar no banco', detalhes: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove um imóvel específico
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
