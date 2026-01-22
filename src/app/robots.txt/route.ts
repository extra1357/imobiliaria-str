import { NextResponse } from 'next/server';

/**
 * 🤖 ROBOTS.TXT - STR GENETICS
 * Guia os bots do Google sobre o que indexar
 */

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seudominio.com.br';
  
  const robotsTxt = `# Imobiliária Perto STR - Robots.txt

# Permitir todos os bots principais
User-agent: *
Allow: /
Allow: /imoveis/
Allow: /imoveis-publicos

# Bloquear áreas administrativas
Disallow: /admin/
Disallow: /api/
Disallow: /admin/*

# Bloquear arquivos temporários
Disallow: /_next/
Disallow: /backups/

# Googlebot específico
User-agent: Googlebot
Allow: /
Allow: /imoveis/
Crawl-delay: 0

# Googlebot Images
User-agent: Googlebot-Image
Allow: /
Allow: /images/
Allow: /uploads/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400',
    },
  });
}
