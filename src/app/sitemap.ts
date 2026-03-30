import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.imobiliariaperto.com.br'

  try {
    const imoveis = await prisma.imovel.findMany({
      where: { status: 'ATIVO' },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    const staticRoutes: MetadataRoute.Sitemap = [
      { url: baseUrl,                              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
      { url: \/sobre,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: \/imoveis-salto,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
      { url: \/imoveis-itu,            lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
      { url: \/imoveis-indaiatuba,     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
      { url: \/imoveis-sorocaba,       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
      { url: \/imoveis-campinas,       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
      { url: \/imoveis-porto-feliz,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    ]

    const imovelRoutes: MetadataRoute.Sitemap = imoveis.map((imovel) => ({
      url: \/imoveis/\,
      lastModified: imovel.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticRoutes, ...imovelRoutes]

  } catch (error) {
    console.error('Erro ao gerar sitemap:', error)
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ]
  } finally {
    await prisma.\()
  }
}
