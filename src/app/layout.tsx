import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.imobiliariaperto.com.br"),
  title: {
    default: "Imobiliária Perto | Imóveis em Salto, Itu, Indaiatuba e Região",
    template: "%s | Imobiliária Perto",
  },
  description: "Encontre casas, apartamentos, terrenos e imóveis comerciais em Salto, Itu, Indaiatuba, Sorocaba, Campinas e Porto Feliz. Compra, venda e aluguel com a Imobiliária Perto.",
  keywords: ["imóveis Salto","imóveis Itu","imóveis Indaiatuba","imóveis Sorocaba","imóveis Campinas","imóveis Porto Feliz","casas à venda Salto","apartamentos Itu","terrenos Indaiatuba","imobiliária Salto SP","aluguel Salto","comprar imóvel interior SP"],
  authors: [{ name: "Imobiliária Perto" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.imobiliariaperto.com.br",
    siteName: "Imobiliária Perto",
    title: "Imobiliária Perto | Imóveis em Salto, Itu, Indaiatuba e Região",
    description: "Casas, apartamentos, terrenos e imóveis comerciais em Salto, Itu, Indaiatuba, Sorocaba, Campinas e Porto Feliz.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Imobiliária Perto" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imobiliária Perto | Imóveis em Salto, Itu e Região",
    description: "Casas, apartamentos, terrenos e imóveis comerciais em Salto, Itu, Indaiatuba e região.",
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "https://www.imobiliariaperto.com.br" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}