import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lista todos os imóveis com dados do proprietário
export async function GET() {
  try {
    const imoveis = await prisma.imovel.findMany({
      include: {
        proprietario: true, // Traz os dados do proprietário junto
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(imoveis);
  } catch (error: any) {
    console.error("❌ Erro ao ler banco STR:", error);
    return NextResponse.json({ error: "Erro ao ler banco STR" }, { status: 500 });
  }
}

// POST: Cria um novo imóvel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📦 Recebido para salvar:", body);

    const novoImovel = await prisma.imovel.create({
      data: {
        tipo: body.tipo,
        endereco: body.endereco,
        cidade: body.cidade,
        estado: body.estado,
        // Garantindo que valores numéricos sejam salvos corretamente
        preco: Number(body.preco),
        metragem: Number(body.metragem),
        quartos: parseInt(body.quartos) || 0,
        banheiros: parseInt(body.banheiros) || 0,
        vagas: parseInt(body.vagas) || 0,
        
        descricao: body.descricao,
        status: body.status || "ATIVO",
        disponivel: body.disponivel !== undefined ? body.disponivel : true,
        imagens: body.imagens || [],
        
        // RELAÇÃO OBRIGATÓRIA: O proprietarioId precisa existir no banco
        proprietarioId: body.proprietarioId, 
      },
    });

    return NextResponse.json(novoImovel);
  } catch (error: any) {
    console.error("❌ Erro ao salvar imóvel:", error);
    return NextResponse.json(
      { error: "Erro ao salvar no banco", detalhes: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove um imóvel específico
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) throw new Error("ID não fornecido");

    await prisma.imovel.delete({
      where: { id: id },
    });

    return NextResponse.json({ mensagem: "Imóvel removido com sucesso" });
  } catch (error: any) {
    console.error("❌ Erro ao deletar imóvel:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
