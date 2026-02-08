import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Melhora performance
  variable: '--font-inter',
})

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  
  title: {
    default: 'Imobiliária Perto - Apartamentos, Casas e Terrenos à Venda em São Paulo',
    template: '%s | Imobiliária Perto',
  },
  
  description:
    'Encontre seu imóvel ideal em São Paulo e região. Apartamentos, casas, terrenos e comércios à venda com fotos HD, tour virtual e localização privilegiada. Financiamento facilitado e atendimento especializado.',
  
  keywords: [
    'imobiliária São Paulo',
    'apartamentos à venda SP',
    'casas à venda São Paulo',
    'terrenos à venda e Salto e Itu',
    'imóveis zona sul SP e Interior Salto Itu Sorocaba',
    'imóveis zona oeste SP',
    'comprar apartamento São Paulo',
    'comprar casa SP e Interior',
    'imóveis Salto',
    'imóveis Indaiatuba',
    'imóveis Itu',
    'financiamento imobiliário',
    'imobiliária perto de mim',
  ],
  
  authors: [{ name: 'Imobiliária Perto', url: baseUrl }],
  creator: 'Imobiliária Perto',
  publisher: 'Imobiliária Perto',
  
  // Informações de idioma e região
  applicationName: 'Imobiliária Perto',
  
  // Verificação do Google Search Console
  verification: {
    google: '9Qoi_kEa_An-0Z-_ew6c4aeMOpivzegRmbyuJWWkek8',
  },
  
  // Configurações de robots otimizadas
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Open Graph otimizado
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: baseUrl,
    siteName: 'Imobiliária Perto',
    title: 'Imobiliária Perto - Seu Imóvel Ideal em São Paulo e Interior',
    description:
      'Apartamentos, casas e terrenos à venda em SP  e Interior com as melhores condições. Tour virtual, fotos HD e financiamento facilitado.',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Imobiliária Perto - Imóveis à venda em São Paulo',
        type: 'image/jpeg',
      },
    ],
  },
  
  // Twitter Card otimizado
  twitter: {
    card: 'summary_large_image',
    site: '@imobiliariaperto', // Adicione seu @ se tiver
    creator: '@imobiliariaperto',
    title: 'Imobiliária Perto - Imóveis à Venda em SP',
    description:
      'Apartamentos, casas e terrenos em São Paulo e Interior. Tour virtual, fotos HD e financiamento facilitado.',
    images: [`${baseUrl}/og-image.jpg`],
  },
  
  // URL canônica
  alternates: {
    canonical: baseUrl,
    languages: {
      'pt-BR': baseUrl,
    },
  },
  
  // Ícones e manifestos
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  manifest: '/manifest.json',
  
  // Configurações adicionais
  formatDetection: {
    telephone: true, // Detecta e transforma números em links clicáveis
    email: true,
    address: true,
  },
  
  // Category para o Google
  category: 'business',
}

// Schema.org otimizado para imobiliária
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  '@id': `${baseUrl}/#organization`,
  name: 'Imobiliária Perto',
  url: baseUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${baseUrl}/logo.png`,
    width: 250,
    height: 60,
  },
  image: `${baseUrl}/og-image.jpg`,
  description: 'Imobiliária especializada em venda e locação de imóveis residenciais e comerciais em São Paulo e região metropolitana.',
  
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'São Paulo',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
  
  // Adicione seus contatos reais aqui
  telephone: '+55-11-97666-1297',
  email: 'contato@imobiliariaperto.com.br',
  
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+55-11-97666-1297',
    contactType: 'sales',
    areaServed: 'BR',
    availableLanguage: ['Portuguese'],
    contactOption: 'TollFree',
  },
  
  // Área de atuação
  areaServed: {
    '@type': 'City',
    name: 'São Paulo',
    '@id': 'https://www.wikidata.org/wiki/Q174',
  },
  
  // Redes sociais (adicione as suas)
  sameAs: [
    'https://www.facebook.com/imobiliariaperto',
    'https://www.instagram.com/imobiliariaperto',
    'https://www.linkedin.com/company/imobiliariaperto',
  ],
  
  // Horário de funcionamento
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '13:00',
    },
  ],
  
  // Classificação (adicione quando tiver avaliações)
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '127',
  },
  
  // Preço estimado (range de valores dos imóveis)
  priceRange: 'R$ 200.000 - R$ 5.000.000',
}

// WebSite Schema para SearchBox do Google
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${baseUrl}/#website`,
  url: baseUrl,
  name: 'Imobiliária Perto',
  description: 'Encontre seu imóvel ideal em São Paulo',
  publisher: {
    '@id': `${baseUrl}/#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/imoveis?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

// BreadcrumbList Schema para navegação
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Início',
      item: baseUrl,
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Preconnect para fontes (performance) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch para recursos externos */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Ícones */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Theme color para mobile */}
        <meta name="theme-color" content="#1a73e8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Schemas estruturados */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(organizationSchema) 
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(websiteSchema) 
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(breadcrumbSchema) 
          }}
        />
        
        {/* Google Analytics (adicione seu ID) */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        {/* Accessibility skip link */}
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Pular para o conteúdo principal
        </a>
        
        {children}
      </body>
    </html>
  )
}
