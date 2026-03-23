import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateCodigo } from '@/lib/generateSlug';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// ─── Logger ──────────────────────────────────────────────────────────────────
const log = {
  info:  (msg: string, data?: unknown) => console.log (`[IMOVEL][INFO]  ${msg}`, data ?? ''),
  warn:  (msg: string, data?: unknown) => console.warn(`[IMOVEL][WARN]  ${msg}`, data ?? ''),
  error: (msg: string, data?: unknown) => console.error(`[IMOVEL][ERROR] ${msg}`, data ?? ''),
};

// ─── Traduz erros do Prisma em respostas HTTP legíveis ───────────────────────
function prismaErrorMessage(error: unknown): {
  mensagem: string;
  codigo?: string;
  status: number;
} {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          mensagem: `Valor duplicado no campo único: ${(error.meta?.target as string[])?.join(', ')}`,
          codigo: error.code,
          status: 409,
        };
      case 'P2003':
        return {
          mensagem: `Chave estrangeira inválida: ${error.meta?.field_name}`,
          codigo: error.code,
          status: 400,
        };
      case 'P2025':
        return {
          mensagem: 'Registro relacionado não encontrado no banco',
          codigo: error.code,
          status: 404,
        };
      default:
        return {
          mensagem: `Erro Prisma (${error.code}): ${error.message}`,
          codigo: error.code,
          status: 500,
        };
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return { mensagem: `Dados inválidos enviados ao banco: ${error.message}`, status: 422 };
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return { mensagem: 'Falha ao conectar no banco de dados (Neon/Prisma init)', status: 503 };
  }
  if (error instanceof Error) {
    return { mensagem: error.message, status: 500 };
  }
  return { mensagem: 'Erro interno desconhecido', status: 500 };
}

// ─── GET — listar imóveis ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cidade     = searchParams.get('cidade')     ?? undefined;
  const tipo       = searchParams.get('tipo')       ?? undefined;
  const finalidade = searchParams.get('finalidade') ?? undefined;
  const status     = searchParams.get('status')     ?? 'ATIVO';

  log.info('GET /api/imoveis/cadastro', { cidade, tipo, finalidade, status });

  try {
    const imoveis = await prisma.imovel.findMany({
      where: {
        ...(cidade     && { cidade: { contains: cidade, mode: 'insensitive' } }),
        ...(tipo       && { tipo }),
        ...(finalidade && { finalidade }),
        status,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        proprietario: { select: { nome: true, telefone: true, email: true } },
      },
    });

    log.info(`GET /api/imoveis/cadastro → ${imoveis.length} registro(s) retornado(s)`);
    return NextResponse.json(imoveis);
  } catch (error) {
    const { mensagem, codigo, status: httpStatus } = prismaErrorMessage(error);
    log.error('GET /api/imoveis/cadastro falhou', { mensagem, codigo, raw: error });
    return NextResponse.json({ error: mensagem, codigo }, { status: httpStatus });
  }
}

// ─── POST — cadastrar imóvel ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  log.info('POST /api/imoveis/cadastro → iniciando');

  // ── Parse do body ──────────────────────────────────────────────────────────
  let body: Record<string, any>;
  try {
    body = await request.json();
    log.info('POST /api/imoveis/cadastro → body recebido', body);
  } catch {
    log.error('POST /api/imoveis/cadastro → body não é JSON válido');
    return NextResponse.json({ error: 'Body deve ser JSON válido' }, { status: 400 });
  }

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
    suites,
    descricao,
    proprietarioId,
    imagens,
    finalidade,
    bairro,
    cep,
    caracteristicas,
    precoAluguel,
    destaque,
  } = body;

  // ── Validação dos campos obrigatórios ──────────────────────────────────────
  const obrigatorios: Record<string, unknown> = {
    tipo, endereco, cidade, estado, preco, metragem, proprietarioId,
  };
  const faltando = Object.entries(obrigatorios)
    .filter(([, v]) => v === undefined || v === null || v === '')
    .map(([k]) => k);

  if (faltando.length > 0) {
    log.warn('POST /api/imoveis/cadastro → campos obrigatórios ausentes', faltando);
    return NextResponse.json(
      { error: 'Campos obrigatórios faltando', campos: faltando },
      { status: 400 }
    );
  }

  // ── Geração automática de código e slug ────────────────────────────────────
  const codigo = generateCodigo(tipo);
  const slug = generateSlug({
    tipo,
    cidade,
    bairro: bairro ?? endereco.split(',')[1]?.trim() ?? '',
    quartos: quartos ? parseInt(quartos) : 0,
    codigo,
  });

  log.info('POST /api/imoveis/cadastro → slug/código gerados', { codigo, slug });

  // ── Persistência no banco ──────────────────────────────────────────────────
  try {
    const novoImovel = await prisma.imovel.create({
      data: {
        tipo,
        endereco,
        cidade,
        estado,
        preco:           parseFloat(preco),
        metragem:        parseFloat(metragem),
        quartos:         quartos     ? parseInt(quartos)     : 0,
        banheiros:       banheiros   ? parseInt(banheiros)   : 0,
        vagas:           vagas       ? parseInt(vagas)       : 0,
        suites:          suites      ? parseInt(suites)      : 0,
        descricao:       descricao   ?? null,
        bairro:          bairro      ?? null,
        cep:             cep         ?? null,
        finalidade:      finalidade  ?? 'venda',
        destaque:        destaque    ?? false,
        precoAluguel:    precoAluguel ? parseFloat(precoAluguel) : null,
        caracteristicas: Array.isArray(caracteristicas) ? caracteristicas : [],
        imagens:         Array.isArray(imagens) ? imagens : (imagens ? [imagens] : []),
        proprietarioId,
        status:          'ATIVO',
        codigo,
        slug,
      },
    });

    log.info('POST /api/imoveis/cadastro → imóvel criado', {
      id: novoImovel.id,
      codigo,
      slug,
    });

    return NextResponse.json(novoImovel, { status: 201 });
  } catch (error) {
    const { mensagem, codigo: errCodigo, status: httpStatus } = prismaErrorMessage(error);
    log.error('POST /api/imoveis/cadastro → falha ao gravar no banco', {
      mensagem,
      errCodigo,
      body,
      raw: error,
    });
    return NextResponse.json(
      { error: mensagem, codigo: errCodigo },
      { status: httpStatus }
    );
  }
}
