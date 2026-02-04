import { notFound } from 'next/navigation'
import { buscarImovelPorId } from '@/lib/imoveis'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const imovel = await buscarImovelPorId(params.id)
  
  if (!imovel) {
    return { 
      title: 'Imóvel não encontrado | Imobiliária Perto',
      description: 'O imóvel que você está procurando não foi encontrado.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br'
  const imovelUrl = `${baseUrl}/imoveis/${params.id}`
  
  // Formatar preço
  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(imovel.price)

  // Descrição otimizada para SEO
  const descricao = imovel.description || 
    `${imovel.type} em ${imovel.addr}. ${precoFormatado}. ${imovel.quartos ? `${imovel.quartos} quartos` : ''}${imovel.banheiros ? `, ${imovel.banheiros} banheiros` : ''}${imovel.metragem ? `, ${imovel.metragem}m²` : ''}. Agende sua visita!`

  return {
    title: `${imovel.title} | Imobiliária Perto`,
    description: descricao.substring(0, 160), // Limita a 160 caracteres
    keywords: [
      imovel.type,
      `${imovel.type} à venda`,
      imovel.addr,
      `imóvel ${imovel.addr}`,
      'imobiliária',
      `${imovel.type} ${imovel.quartos} quartos`,
    ],
    openGraph: {
      title: `${imovel.title} - ${precoFormatado}`,
      description: descricao,
      url: imovelUrl,
      siteName: 'Imobiliária Perto',
      locale: 'pt_BR',
      type: 'website',
      images: imovel.imagens?.length ? [
        {
          url: imovel.imagens[0],
          width: 1200,
          height: 630,
          alt: `${imovel.title} - ${imovel.addr}`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${imovel.title} - ${precoFormatado}`,
      description: descricao,
      images: imovel.imagens?.[0] ? [imovel.imagens[0]] : [],
    },
    alternates: {
      canonical: imovelUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function ImovelPage({ params }: Props) {
  const imovel = await buscarImovelPorId(params.id)

  if (!imovel) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br'

  // Schema.org Product para Rich Snippets
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: imovel.title,
    description: imovel.description || `${imovel.type} em ${imovel.addr}`,
    image: imovel.imagens || [],
    offers: {
      '@type': 'Offer',
      price: imovel.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock', // Sempre disponível se está na página
      url: `${baseUrl}/imoveis/${params.id}`,
      seller: {
        '@type': 'Organization',
        name: 'Imobiliária Perto',
      },
    },
    ...(imovel.metragem && {
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Área',
          value: `${imovel.metragem} m²`,
        },
        ...(imovel.quartos ? [{
          '@type': 'PropertyValue',
          name: 'Quartos',
          value: imovel.quartos,
        }] : []),
        ...(imovel.banheiros ? [{
          '@type': 'PropertyValue',
          name: 'Banheiros',
          value: imovel.banheiros,
        }] : []),
      ],
    }),
  }

  // Schema.org BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Imóveis',
        item: `${baseUrl}/imoveis`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: imovel.title,
        item: `${baseUrl}/imoveis/${params.id}`,
      },
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Seu conteúdo aqui - substitua pela sua interface existente */}
      <div className="container mx-auto p-4">
        <h1>{imovel.title}</h1>
        <p>{imovel.description}</p>
        {/* ... resto do seu layout ... */}
      </div>
    </div>
  )
}
