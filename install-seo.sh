#!/bin/bash

# ===========================================
# Script de instalação SEO - Imobiliária
# Cole este script inteiro no terminal
# ===========================================

echo "🚀 Iniciando instalação dos arquivos SEO..."

# Criar pastas necessárias
mkdir -p src/app/components
mkdir -p src/app/imoveis/\[id\]
mkdir -p src/lib

# ===========================================
# 1. CONFIG.TS - Configurações centralizadas
# ===========================================
cat > src/lib/config.ts << 'EOF'
// Configurações centralizadas da imobiliária
// Altere esses valores conforme necessário

export const CONFIG = {
  // Nome da imobiliária (será usado em todo o site)
  nome: 'Imobiliária Perto',

  // WhatsApp para contato (com código do país + DDD + número, sem traços)
  whatsapp: '5511976661297',

  // URL do site (para SEO e links)
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br',

  // Redes sociais (deixe vazio se não tiver)
  redesSociais: {
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  },

  // Endereço físico
  endereco: {
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  },

  // Telefone fixo (opcional)
  telefone: '',

  // E-mail de contato
  email: '',

  // CRECI da imobiliária
  creci: '',

  // Horário de funcionamento
  horario: 'Segunda a Sexta: 9h às 18h | Sábado: 9h às 13h',
}
EOF
echo "✅ src/lib/config.ts criado"

# ===========================================
# 2. IMOVEIS.TS - Funções do banco com Prisma
# ===========================================
cat > src/lib/imoveis.ts << 'EOF'
import { prisma } from './prisma'

// Buscar todos os imóveis disponíveis
export async function buscarImoveis() {
  const imoveis = await prisma.imovel.findMany({
    where: {
      disponivel: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return imoveis.map((i) => ({
    id: i.id,
    type: i.tipo,
    title: `${i.tipo} em ${i.cidade}`,
    addr: `${i.endereco} - ${i.bairro ?? ''}, ${i.cidade}/${i.estado}`,
    price: Number(i.preco),
    imagens: i.imagens || [],
    description: i.descricao,
    quartos: i.quartos,
    banheiros: i.banheiros,
    garagem: i.vagas,
    metragem: Number(i.metragem),
    finalidade: i.finalidade,
    destaque: i.destaque,
  }))
}

// Buscar imóvel por ID
export async function buscarImovelPorId(id: string) {
  const imovel = await prisma.imovel.findUnique({
    where: { id },
  })

  if (!imovel) {
    return null
  }

  return {
    id: imovel.id,
    type: imovel.tipo,
    title: `${imovel.tipo} em ${imovel.cidade}`,
    addr: `${imovel.endereco} - ${imovel.bairro ?? ''}, ${imovel.cidade}/${imovel.estado}`,
    price: Number(imovel.preco),
    imagens: imovel.imagens || [],
    description: imovel.descricao,
    quartos: imovel.quartos,
    banheiros: imovel.banheiros,
    garagem: imovel.vagas,
    metragem: Number(imovel.metragem),
    finalidade: imovel.finalidade,
    destaque: imovel.destaque,
  }
}
EOF
echo "✅ src/lib/imoveis.ts criado"

# ===========================================
# 3. SITEMAP.TS - Sitemap dinâmico
# ===========================================
cat > src/app/sitemap.ts << 'EOF'
import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br'

  const imoveis = await prisma.imovel.findMany({
    where: { disponivel: true },
    select: {
      id: true,
      updatedAt: true,
      cidade: true,
      tipo: true,
    },
  })

  const imoveisUrls = imoveis.map((imovel) => ({
    url: `${baseUrl}/imoveis/${imovel.id}`,
    lastModified: imovel.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const cidades = [...new Set(imoveis.map((i) => i.cidade))]
  const cidadesUrls = cidades.map((cidade) => ({
    url: `${baseUrl}/imoveis/cidade/${encodeURIComponent(cidade.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const tipos = [...new Set(imoveis.map((i) => i.tipo))]
  const tiposUrls = tipos.map((tipo) => ({
    url: `${baseUrl}/imoveis/tipo/${encodeURIComponent(tipo.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...imoveisUrls,
    ...cidadesUrls,
    ...tiposUrls,
  ]
}
EOF
echo "✅ src/app/sitemap.ts criado"

# ===========================================
# 4. ROBOTS.TS
# ===========================================
cat > src/app/robots.ts << 'EOF'
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
EOF
echo "✅ src/app/robots.ts criado"

# ===========================================
# 5. LAYOUT.TSX - Meta tags globais
# ===========================================
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Imobiliária Perto | Casas, Apartamentos e Terrenos à Venda',
    template: '%s | Imobiliária Perto',
  },
  description:
    'Encontre o imóvel dos seus sonhos. Casas, apartamentos, terrenos e imóveis comerciais à venda e para alugar nas melhores localizações.',
  keywords: [
    'imobiliária',
    'casas à venda',
    'apartamentos à venda',
    'terrenos à venda',
    'imóveis',
    'alugar imóvel',
    'comprar casa',
    'comprar apartamento',
  ],
  authors: [{ name: 'Imobiliária Perto' }],
  creator: 'Imobiliária Perto',
  publisher: 'Imobiliária Perto',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: baseUrl,
    siteName: 'Imobiliária Perto',
    title: 'Imobiliária Perto | Casas, Apartamentos e Terrenos à Venda',
    description:
      'Encontre o imóvel dos seus sonhos. Casas, apartamentos, terrenos e imóveis comerciais à venda e para alugar.',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Imobiliária Perto',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Imobiliária Perto | Casas, Apartamentos e Terrenos à Venda',
    description:
      'Encontre o imóvel dos seus sonhos. Casas, apartamentos, terrenos e imóveis comerciais à venda e para alugar.',
    images: [`${baseUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: baseUrl,
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Imobiliária Perto',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  description: 'Imobiliária especializada em venda e locação de imóveis residenciais e comerciais.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'BR',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    availableLanguage: 'Portuguese',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF
echo "✅ src/app/layout.tsx criado"

# ===========================================
# 6. SCHEMAMARKUP.TSX - Dados estruturados
# ===========================================
cat > src/app/components/SchemaMarkup.tsx << 'EOF'
interface Imovel {
  id: string
  type: string
  title: string
  addr: string
  price: number
  imagens: string[]
  description: string | null
  quartos?: number | null
  banheiros?: number | null
  garagem?: number | null
  metragem?: number | null
  finalidade?: string | null
}

interface Props {
  imovel: Imovel
}

export default function SchemaMarkup({ imovel }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: imovel.title,
    description: imovel.description || `${imovel.type} disponível em ${imovel.addr}`,
    url: `${baseUrl}/imoveis/${imovel.id}`,
    image: imovel.imagens?.[0] || `${baseUrl}/placeholder.jpg`,
    offers: {
      '@type': 'Offer',
      price: imovel.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      businessFunction: imovel.finalidade === 'Aluguel' 
        ? 'https://schema.org/LeaseOut' 
        : 'https://schema.org/Sell',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: imovel.addr,
      addressCountry: 'BR',
    },
    numberOfRooms: imovel.quartos || undefined,
    numberOfBathroomsTotal: imovel.banheiros || undefined,
    floorSize: imovel.metragem
      ? {
          '@type': 'QuantitativeValue',
          value: imovel.metragem,
          unitCode: 'MTK',
        }
      : undefined,
  }

  const cleanSchema = JSON.parse(JSON.stringify(schema))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  )
}
EOF
echo "✅ src/app/components/SchemaMarkup.tsx criado"

# ===========================================
# 7. LISTAIMOVEISCLIENT.TSX - Listagem principal
# ===========================================
cat > src/app/components/ListaImoveisClient.tsx << 'EOF'
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Imovel {
  id: string
  type: string
  title: string
  addr: string
  price: number
  imagens: string[]
  description: string
  quartos?: number
  banheiros?: number
  garagem?: number
  metragem?: number
  finalidade?: string
}

export default function ListaImoveisClient({
  initialData,
}: {
  initialData: Imovel[]
}) {
  const [properties] = useState<Imovel[]>(initialData)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [maxPrice, setMaxPrice] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadForm, setLeadForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const ITEMS_PER_PAGE = 8

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const q = searchQuery.toLowerCase()
      const matchSearch =
        p.title.toLowerCase().includes(q) ||
        p.addr.toLowerCase().includes(q) ||
        String(p.id).toLowerCase().includes(q)
      const matchType = filterType === 'all' || p.type === filterType
      const matchPrice = !maxPrice || p.price <= Number(maxPrice.replace(/\D/g, ''))
      return matchSearch && matchType && matchPrice
    })
  }, [properties, searchQuery, filterType, maxPrice])

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
  
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProperties, currentPage])

  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, filterType, maxPrice])

  async function enviarLead(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadForm, origem: 'site', status: 'novo' }),
      })
      if (res.ok) {
        setEnviado(true)
        setLeadForm({ nome: '', email: '', telefone: '', mensagem: '' })
        setTimeout(() => {
          setEnviado(false)
          setShowLeadForm(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">🏠 Imobiliária</Link>
          <Link href="/admin" className="btn-login">🔐 Entrar</Link>
        </div>
      </header>

      <main className="main-content">
        <div className="filtros">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="select"
          >
            <option value="all">Todos</option>
            <option value="Casa">Casas</option>
            <option value="Apartamento">Apartamentos</option>
            <option value="Terreno">Terrenos</option>
            <option value="Comercial">Comercial</option>
          </select>
          <input
            type="text"
            placeholder="Preço máx."
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input input-preco"
          />
        </div>

        <p className="contador">{filteredProperties.length} imóveis encontrados</p>

        <div className="grid">
          {paginatedProperties.map((p) => (
            <Link href={`/imoveis/${p.id}`} key={p.id} className="card-link">
              <article className="card">
                <div className="card-img">
                  <img src={p.imagens?.[0] || '/placeholder.jpg'} alt={p.title} />
                  <span className="tag tipo">{p.type}</span>
                  {p.finalidade && (
                    <span className={`tag finalidade ${p.finalidade.toLowerCase()}`}>
                      {p.finalidade}
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <h3>{p.title}</h3>
                  <p className="endereco">{p.addr}</p>
                  <div className="features">
                    {p.quartos ? <span>🛏️ {p.quartos}</span> : null}
                    {p.banheiros ? <span>🚿 {p.banheiros}</span> : null}
                    {p.garagem ? <span>🚗 {p.garagem}</span> : null}
                    {p.metragem ? <span>📐 {p.metragem}m²</span> : null}
                  </div>
                  <strong className="preco">R$ {p.price.toLocaleString('pt-BR')}</strong>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {paginatedProperties.length === 0 && (
          <div className="vazio">Nenhum imóvel encontrado</div>
        )}

        {totalPages > 1 && (
          <div className="paginacao">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>←</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button key={pg} onClick={() => setCurrentPage(pg)} className={currentPage === pg ? 'ativo' : ''}>{pg}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>→</button>
          </div>
        )}
      </main>

      <div className={`lead-widget ${showLeadForm ? 'aberto' : ''}`} onMouseEnter={() => setShowLeadForm(true)} onMouseLeave={() => !enviado && setShowLeadForm(false)}>
        <div className="lead-btn">💬</div>
        <div className="lead-box">
          {enviado ? (
            <div className="sucesso">✅ Enviado!</div>
          ) : (
            <form onSubmit={enviarLead}>
              <h4>Fale Conosco</h4>
              <input type="text" placeholder="Nome" value={leadForm.nome} onChange={(e) => setLeadForm(f => ({ ...f, nome: e.target.value }))} required />
              <input type="email" placeholder="E-mail" value={leadForm.email} onChange={(e) => setLeadForm(f => ({ ...f, email: e.target.value }))} required />
              <input type="tel" placeholder="WhatsApp" value={leadForm.telefone} onChange={(e) => setLeadForm(f => ({ ...f, telefone: e.target.value }))} required />
              <textarea placeholder="Mensagem" value={leadForm.mensagem} onChange={(e) => setLeadForm(f => ({ ...f, mensagem: e.target.value }))} rows={2} />
              <button type="submit" disabled={enviando}>{enviando ? '...' : 'Enviar'}</button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .header {
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          text-decoration: none;
        }
        .btn-login {
          background: #1f2937;
          color: #fff;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }
        .btn-login:hover {
          background: #374151;
        }
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }
        .filtros {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .input, .select {
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        .input {
          flex: 1;
          min-width: 150px;
        }
        .input-preco {
          flex: 0;
          width: 120px;
        }
        .contador {
          color: #6b7280;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .card-link {
          text-decoration: none;
          color: inherit;
        }
        .card {
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 8px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        }
        .card-img {
          position: relative;
          width: 100%;
          height: 160px;
          overflow: hidden;
        }
        .card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .tag {
          position: absolute;
          top: 10px;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
        }
        .tag.tipo {
          left: 10px;
          background: #2563eb;
        }
        .tag.finalidade {
          right: 10px;
        }
        .tag.venda {
          background: #16a34a;
        }
        .tag.aluguel {
          background: #ea580c;
        }
        .card-body {
          padding: 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .card-body h3 {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .endereco {
          margin: 0 0 10px;
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .features {
          display: flex;
          gap: 10px;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 10px;
        }
        .preco {
          margin-top: auto;
          font-size: 17px;
          color: #2563eb;
          font-weight: 700;
        }
        .vazio {
          text-align: center;
          padding: 60px;
          color: #9ca3af;
        }
        .paginacao {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 32px;
        }
        .paginacao button {
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          background: #f3f4f6;
          cursor: pointer;
          font-size: 14px;
        }
        .paginacao button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .paginacao button.ativo {
          background: #2563eb;
          color: #fff;
        }
        .lead-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }
        .lead-btn {
          width: 56px;
          height: 56px;
          background: #2563eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(37,99,235,0.4);
        }
        .lead-box {
          position: absolute;
          bottom: 66px;
          right: 0;
          width: 280px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          padding: 20px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.2s;
        }
        .lead-widget.aberto .lead-box {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .lead-box h4 {
          margin: 0 0 14px;
          font-size: 16px;
        }
        .lead-box input, .lead-box textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          margin-bottom: 10px;
          font-size: 13px;
          box-sizing: border-box;
        }
        .lead-box button {
          width: 100%;
          padding: 12px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .lead-box button:disabled {
          background: #93c5fd;
        }
        .sucesso {
          text-align: center;
          padding: 20px;
          font-size: 18px;
        }
        @media (max-width: 1100px) {
          .grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 800px) {
          .grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .grid { grid-template-columns: 1fr; }
          .header-content { padding: 12px 16px; }
          .main-content { padding: 16px; }
        }
      `}</style>
    </>
  )
}
EOF
echo "✅ src/app/components/ListaImoveisClient.tsx criado"

# ===========================================
# 8. PAGE.TSX (imoveis/[id]) - Página de detalhes
# ===========================================
cat > 'src/app/imoveis/[id]/page.tsx' << 'EOF'
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
    title: `${imovel.title} | Imobiliária Perto`,
    description: imovel.description || `${imovel.type} em ${imovel.addr}. R$ ${imovel.price.toLocaleString('pt-BR')}`,
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
EOF
echo "✅ src/app/imoveis/[id]/page.tsx criado"

# ===========================================
# 9. IMOVELDETALHES.TSX
# ===========================================
cat > 'src/app/imoveis/[id]/ImovelDetalhes.tsx' << 'EOF'
'use client'

import Link from 'next/link'
import GaleriaImovel from './GaleriaImovel'
import SchemaMarkup from '@/app/components/SchemaMarkup'

interface Imovel {
  id: string
  type: string
  title: string
  addr: string
  price: number
  imagens: string[]
  description: string | null
  quartos?: number | null
  banheiros?: number | null
  garagem?: number | null
  metragem?: number | null
  finalidade?: string | null
}

interface Props {
  imovel: Imovel
}

export default function ImovelDetalhes({ imovel }: Props) {
  const whatsappNumber = '5511999999999' // ALTERE AQUI

  return (
    <>
      <SchemaMarkup imovel={imovel} />

      <main className="imovel-page">
        <Link href="/" className="voltar-link">← Voltar para listagem</Link>

        <div className="conteudo-grid">
          <div>
            <GaleriaImovel imagens={imovel.imagens || []} titulo={imovel.title} />

            <section className="secao">
              <h2 className="secao-titulo">Descrição</h2>
              <p className="descricao-texto">{imovel.description || 'Sem descrição disponível.'}</p>
            </section>

            <section className="secao">
              <h2 className="secao-titulo">Características</h2>
              <div className="caracteristicas-grid">
                {imovel.quartos && imovel.quartos > 0 && (
                  <div className="caracteristica-item">
                    <div className="caracteristica-icone">🛏️</div>
                    <div className="caracteristica-valor">{imovel.quartos}</div>
                    <div className="caracteristica-label">Quartos</div>
                  </div>
                )}
                {imovel.banheiros && imovel.banheiros > 0 && (
                  <div className="caracteristica-item">
                    <div className="caracteristica-icone">🚿</div>
                    <div className="caracteristica-valor">{imovel.banheiros}</div>
                    <div className="caracteristica-label">Banheiros</div>
                  </div>
                )}
                {imovel.garagem && imovel.garagem > 0 && (
                  <div className="caracteristica-item">
                    <div className="caracteristica-icone">🚗</div>
                    <div className="caracteristica-valor">{imovel.garagem}</div>
                    <div className="caracteristica-label">Vagas</div>
                  </div>
                )}
                {imovel.metragem && imovel.metragem > 0 && (
                  <div className="caracteristica-item">
                    <div className="caracteristica-icone">📐</div>
                    <div className="caracteristica-valor">{imovel.metragem}m²</div>
                    <div className="caracteristica-label">Área</div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside>
            <div className="card-contato">
              <div className="badges">
                <span className="badge badge-tipo">{imovel.type}</span>
                {imovel.finalidade && (
                  <span className={`badge ${imovel.finalidade === 'Venda' ? 'badge-venda' : 'badge-aluguel'}`}>
                    {imovel.finalidade}
                  </span>
                )}
              </div>

              <h1 className="imovel-titulo">{imovel.title}</h1>
              <p className="imovel-endereco">📍 {imovel.addr}</p>

              <div className="preco-box">
                <div className="preco-label">Valor</div>
                <div className="preco-valor">R$ {imovel.price.toLocaleString('pt-BR')}</div>
              </div>

              <div className="codigo">Código: <strong>{imovel.id}</strong></div>

              <a
                href={`https://wa.me/${whatsappNumber}?text=Olá! Tenho interesse no imóvel ${imovel.id} - ${imovel.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                💬 Chamar no WhatsApp
              </a>

              <button className="btn-ligar">📞 Solicitar ligação</button>
            </div>
          </aside>
        </div>

        <style jsx>{`
          .imovel-page { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
          .voltar-link { display: inline-flex; align-items: center; gap: 8px; color: #2563eb; text-decoration: none; margin-bottom: 24px; font-size: 14px; font-weight: 500; }
          .conteudo-grid { display: grid; grid-template-columns: 1fr 400px; gap: 40px; }
          .secao { margin-top: 32px; }
          .secao-titulo { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #1f2937; }
          .descricao-texto { color: #4b5563; line-height: 1.8; white-space: pre-wrap; }
          .caracteristicas-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .caracteristica-item { padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center; }
          .caracteristica-icone { font-size: 24px; margin-bottom: 4px; }
          .caracteristica-valor { font-weight: 600; color: #1f2937; }
          .caracteristica-label { font-size: 13px; color: #6b7280; }
          .card-contato { position: sticky; top: 20px; background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); padding: 24px; }
          .badges { display: flex; gap: 8px; margin-bottom: 16px; }
          .badge { padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; color: #fff; }
          .badge-tipo { background: #2563eb; }
          .badge-venda { background: #16a34a; }
          .badge-aluguel { background: #ea580c; }
          .imovel-titulo { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
          .imovel-endereco { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
          .preco-box { background: #eff6ff; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
          .preco-label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
          .preco-valor { font-size: 32px; font-weight: 700; color: #2563eb; }
          .codigo { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
          .codigo strong { color: #1f2937; }
          .btn-whatsapp { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 16px; background: #25d366; color: #fff; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 12px; }
          .btn-ligar { width: 100%; padding: 16px; background: #1f2937; color: #fff; border-radius: 10px; border: none; font-weight: 600; font-size: 16px; cursor: pointer; }
          @media (max-width: 900px) {
            .conteudo-grid { grid-template-columns: 1fr; }
            .card-contato { position: static; }
            .caracteristicas-grid { grid-template-columns: repeat(2, 1fr); }
          }
        `}</style>
      </main>
    </>
  )
}
EOF
echo "✅ src/app/imoveis/[id]/ImovelDetalhes.tsx criado"

# ===========================================
# 10. GALERIAIMOVEL.TSX
# ===========================================
cat > 'src/app/imoveis/[id]/GaleriaImovel.tsx' << 'EOF'
'use client'

import { useState } from 'react'

interface Props {
  imagens: string[]
  titulo: string
}

export default function GaleriaImovel({ imagens, titulo }: Props) {
  const [imagemAtiva, setImagemAtiva] = useState(0)

  if (!imagens || imagens.length === 0) {
    return (
      <div style={{ width: '100%', height: '400px', background: '#f3f4f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        Sem imagens disponíveis
      </div>
    )
  }

  return (
    <div>
      <div style={{ width: '100%', height: '450px', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px', position: 'relative' }}>
        <img src={imagens[imagemAtiva]} alt={`${titulo} - Foto ${imagemAtiva + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
          {imagemAtiva + 1} / {imagens.length}
        </div>
        {imagens.length > 1 && (
          <>
            <button onClick={() => setImagemAtiva(i => i === 0 ? imagens.length - 1 : i - 1)} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>‹</button>
            <button onClick={() => setImagemAtiva(i => i === imagens.length - 1 ? 0 : i + 1)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>›</button>
          </>
        )}
      </div>
      {imagens.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {imagens.map((img, index) => (
            <button key={index} onClick={() => setImagemAtiva(index)} style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: index === imagemAtiva ? '3px solid #2563eb' : '3px solid transparent', cursor: 'pointer', flexShrink: 0, padding: 0, background: 'none' }}>
              <img src={img} alt={`Thumbnail ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: index === imagemAtiva ? 1 : 0.6 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
EOF
echo "✅ src/app/imoveis/[id]/GaleriaImovel.tsx criado"

# ===========================================
# FINALIZAÇÃO
# ===========================================
echo ""
echo "=========================================="
echo "✅ INSTALAÇÃO COMPLETA!"
echo "=========================================="
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Edite src/lib/config.ts com seus dados"
echo "2. Adicione no .env:"
echo "   NEXT_PUBLIC_SITE_URL=https://www.seusite.com.br"
echo ""
echo "3. Rode: npm run dev"
echo ""
echo "4. Teste:"
echo "   - http://localhost:3000/sitemap.xml"
echo "   - http://localhost:3000/robots.txt"
echo ""
