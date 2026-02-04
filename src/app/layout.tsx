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
  verification: {
    google: 'VGfmJGkqdjqaKZO74GVmrmh9JoPIt3g2A8ehuXrHMIY',
  },
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
