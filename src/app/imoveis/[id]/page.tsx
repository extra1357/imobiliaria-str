export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation'
import { buscarImovelPorId } from '@/lib/imoveis'
import ImovelDetalhes from './ImovelDetalhes'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  const imovel = await buscarImovelPorId(params.id)
  
  if (!imovel) {
    return { title: 'Imóvel não encontrado' }
  }

  return {
    title: `${imovel.type} - ${imovel.addr} | Imobiliária Perto`,
    description:
      imovel.description ??
      `${imovel.type} em ${imovel.addr}. R$ ${Number(imovel.price).toLocaleString('pt-BR')}`,
    openGraph: {
      images: imovel.imagens?.[0] ? [imovel.imagens[0]] : [],
    },
  }
}

export default async function ImovelPage({ params }: Props) {
  const imovel = await buscarImovelPorId(params.id)

  if (!imovel) {
    notFound()
  }

  return <ImovelDetalhes imovel={imovel} />
}

