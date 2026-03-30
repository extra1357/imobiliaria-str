export const dynamic = 'force-dynamic';
import { prisma } from './prisma';

export async function buscarImoveis(cidade?: string) {
  const imoveis = await prisma.imovel.findMany({
    where: {
      disponivel: true,
      ...(cidade ? { cidade: { contains: cidade, mode: 'insensitive' } } : {}),
    },
    include: { proprietario: true },
    orderBy: { createdAt: 'desc' },
  });

  return imoveis.map((i: any) => ({
    id: i.id,
    type: i.tipo,
    title: `${i.tipo} em ${i.cidade}`,
    addr: `${i.endereco}${i.bairro ? ' - ' + i.bairro : ''}, ${i.cidade}/${i.estado}`,
    price: Number(i.preco),
    imagens: i.imagens || [],
    description: i.descricao,
    quartos: i.quartos,
    banheiros: i.banheiros,
    garagem: i.vagas,
    suites: i.suites,
    metragem: Number(i.metragem),
    finalidade: i.finalidade,
    destaque: i.destaque,
    slug: i.slug,
    codigo: i.codigo,
    precoAluguel: i.precoAluguel ? Number(i.precoAluguel) : null,
    caracteristicas: i.caracteristicas || [],
    whatsapp: i.proprietario?.telefone || '5511976661297',
    proprietarioNome: i.proprietario?.nome || '',
  }));
}

export async function buscarImovelPorId(id: string) {
  const imovel = await prisma.imovel.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { proprietario: true },
  });
  if (!imovel) return null;

  return {
    id: imovel.id,
    type: imovel.tipo,
    title: `${imovel.tipo} em ${imovel.cidade}`,
    addr: `${imovel.endereco}${imovel.bairro ? ' - ' + imovel.bairro : ''}, ${imovel.cidade}/${imovel.estado}`,
    price: Number(imovel.preco),
    imagens: imovel.imagens || [],
    description: imovel.descricao,
    quartos: imovel.quartos,
    banheiros: imovel.banheiros,
    garagem: imovel.vagas,
    suites: imovel.suites,
    metragem: Number(imovel.metragem),
    finalidade: imovel.finalidade,
    destaque: imovel.destaque,
    slug: imovel.slug,
    codigo: imovel.codigo,
    precoAluguel: imovel.precoAluguel ? Number(imovel.precoAluguel) : null,
    caracteristicas: imovel.caracteristicas || [],
    whatsapp: imovel.proprietario?.telefone || '5511976661297',
    proprietarioNome: imovel.proprietario?.nome || '',
  };
}

export async function buscarImovelPorSlug(slug: string) {
  const imovel = await prisma.imovel.findUnique({
    where: { slug },
    include: { proprietario: true },
  });
  if (!imovel) return null;

  return {
    id: imovel.id,
    type: imovel.tipo,
    title: `${imovel.tipo} em ${imovel.cidade}`,
    addr: `${imovel.endereco}${imovel.bairro ? ' - ' + imovel.bairro : ''}, ${imovel.cidade}/${imovel.estado}`,
    price: Number(imovel.preco),
    imagens: imovel.imagens || [],
    description: imovel.descricao,
    quartos: imovel.quartos,
    banheiros: imovel.banheiros,
    garagem: imovel.vagas,
    suites: imovel.suites,
    metragem: Number(imovel.metragem),
    finalidade: imovel.finalidade,
    destaque: imovel.destaque,
    slug: imovel.slug,
    codigo: imovel.codigo,
    precoAluguel: imovel.precoAluguel ? Number(imovel.precoAluguel) : null,
    caracteristicas: imovel.caracteristicas || [],
    whatsapp: imovel.proprietario?.telefone || '5511976661297',
    proprietarioNome: imovel.proprietario?.nome || '',
  };
}
