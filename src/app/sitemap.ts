import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br'

  try {
    // Buscar todos os imóveis ativos
    const imoveis = await prisma.imovel.findMany({
      where: {
        status: 'disponivel', // Apenas imóveis disponíveis
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // URLs estáticas do site
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/imoveis`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/proprietarios`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/proprietarios/novo`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ]

    // URLs dinâmicas dos imóveis
    const imovelRoutes: MetadataRoute.Sitemap = imoveis.map((imovel) => ({
      url: `${baseUrl}/imoveis/${imovel.id}`,
      lastModified: imovel.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Combinar todas as rotas
    return [...staticRoutes, ...imovelRoutes]
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error)
    
    // Fallback: retornar apenas URLs estáticas se der erro
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/imoveis`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ]
  } finally {
    await prisma.$disconnect()
  }
}
