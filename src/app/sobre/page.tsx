import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nós | Imobiliária Perto – Consultoria de Marketing Imobiliário',
  description:
    'A Imobiliária Perto é uma consultoria especializada em Marketing Imobiliário. Conheça nossa história, nossa empresa controladora WebSeguros (CNPJ 23.659.612/0001-96), nossas marcas STRsoftware.com.br e Tributoimoveis.com.br e nosso portfólio de soluções para o mercado imobiliário.',
  keywords: [
    'Imobiliária Perto',
    'consultoria marketing imobiliário',
    'WebSeguros',
    'STRsoftware',
    'Tributoimoveis',
    'marketing imobiliário',
    'software imobiliário',
    'gestão imobiliária',
    'imoveis Salto',
    'imoveis Itu',
    'imoveis Sorocaba',
  ],
  alternates: {
    canonical: 'https://www.imobiliariaperto.com.br/sobre',
  },
  openGraph: {
    title: 'Sobre Nós | Imobiliária Perto',
    description:
      'Conheça a Imobiliária Perto, consultoria de Marketing Imobiliário do grupo WebSeguros, criadora das marcas STRsoftware e Tributoimoveis.',
    url: 'https://www.imobiliariaperto.com.br/sobre',
    siteName: 'Imobiliária Perto',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateAgent',
      '@id': 'https://www.imobiliariaperto.com.br/#organization',
      name: 'Imobiliária Perto',
      description:
        'Consultoria especializada em Marketing Imobiliário, parte do grupo WebSeguros.',
      url: 'https://www.imobiliariaperto.com.br',
      logo: 'https://www.imobiliariaperto.com.br/logo.png',
      sameAs: [
        'https://www.strsoftware.com.br',
        'https://www.tributoimoveis.com.br',
      ],
      parentOrganization: {
        '@type': 'Organization',
        name: 'WebSeguros',
        taxID: '23.659.612/0001-96',
      },
      areaServed: [
        { '@type': 'City', name: 'Salto' },
        { '@type': 'City', name: 'Itu' },
        { '@type': 'City', name: 'Sorocaba' },
        { '@type': 'City', name: 'Indaiatuba' },
        { '@type': 'City', name: 'Porto Feliz' },
        { '@type': 'City', name: 'Campinas' },
      ],
      knowsAbout: [
        'Marketing Imobiliário',
        'Software para Imobiliárias',
        'Gestão de Imóveis',
        'SEO Imobiliário',
        'Tributação Imobiliária',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.imobiliariaperto.com.br' },
        { '@type': 'ListItem', position: 2, name: 'Sobre', item: 'https://www.imobiliariaperto.com.br/sobre' },
      ],
    },
  ],
};

export default function SobrePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: '#1a1a2e', background: '#fff' }}>

        {/* ── HERO ── */}
        <section style={{
          background: 'linear-gradient(135deg, #0f3460 0%, #16213e 60%, #1a1a2e 100%)',
          color: '#fff',
          padding: '80px 24px 64px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(212,175,55,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,175,55,0.08) 0%, transparent 40%)',
          }} />
          <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
            <p style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: '#d4af37', marginBottom: 16, fontFamily: 'sans-serif' }}>
              Consultoria de Marketing Imobiliário
            </p>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: 24 }}>
              Imobiliária Perto:<br />
              <span style={{ color: '#d4af37' }}>Próximos de você,</span><br />
              especialistas no mercado
            </h1>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.8, opacity: 0.88, fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
              Mais do que um nome — uma promessa. A Imobiliária Perto nasceu para transformar
              a forma como pessoas encontram, compram, vendem e gerenciam imóveis no interior
              de São Paulo.
            </p>
          </div>
        </section>

        {/* ── QUEM SOMOS ── */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <span style={{ display: 'inline-block', width: 48, height: 4, background: '#d4af37', marginBottom: 20 }} />
              <h2 style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: 20, lineHeight: 1.3 }}>
                Quem somos
              </h2>
              <p style={{ lineHeight: 1.9, color: '#444', fontFamily: 'sans-serif', marginBottom: 16 }}>
                A <strong>Imobiliária Perto</strong> é uma consultoria especializada em <strong>Marketing Imobiliário</strong>,
                com atuação estratégica nas regiões de Salto, Itu, Sorocaba, Indaiatuba, Porto Feliz e Campinas.
                Nosso nome reflete nossa essência: estamos <em>perto</em> de cada cliente, de cada imóvel,
                de cada oportunidade.
              </p>
              <p style={{ lineHeight: 1.9, color: '#444', fontFamily: 'sans-serif' }}>
                Combinamos tecnologia proprietária, inteligência de mercado e presença local para conectar
                pessoas aos imóveis certos — e proprietários aos compradores e locatários ideais.
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #0f3460, #16213e)',
              borderRadius: 16,
              padding: '40px 32px',
              color: '#fff',
            }}>
              <p style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: '#d4af37', marginBottom: 16, fontFamily: 'sans-serif' }}>Grupo empresarial</p>
              <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>WebSeguros</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', marginBottom: 24 }}>CNPJ: 23.659.612/0001-96</p>
              <p style={{ lineHeight: 1.8, opacity: 0.88, fontFamily: 'sans-serif', fontSize: '0.95rem' }}>
                A <strong>WebSeguros</strong> é a empresa controladora da Imobiliária Perto e detentora
                de todas as marcas e produtos do ecossistema. Uma holding de tecnologia e serviços
                voltados ao mercado imobiliário.
              </p>
            </div>
          </div>
        </section>

        {/* ── DIFERENCIAIS ── */}
        <section style={{ background: '#f8f7f2', padding: '64px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span style={{ display: 'inline-block', width: 48, height: 4, background: '#d4af37', marginBottom: 20 }} />
              <h2 style={{ fontSize: '1.9rem', fontWeight: 700 }}>Nossa expertise</h2>
              <p style={{ color: '#666', fontFamily: 'sans-serif', marginTop: 12, maxWidth: 560, margin: '12px auto 0' }}>
                Décadas de experiência condensadas em metodologias, ferramentas e resultados concretos.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {[
                { icon: '📍', title: 'Presença Local', desc: 'Cobrimos Salto, Itu, Sorocaba, Indaiatuba, Porto Feliz e Campinas com conhecimento profundo de cada mercado regional.' },
                { icon: '📊', title: 'Inteligência de Mercado', desc: 'Análises de precificação, tendências e demanda para posicionar cada imóvel com máxima performance de venda ou locação.' },
                { icon: '🎯', title: 'Marketing de Alta Performance', desc: 'Estratégias digitais, SEO imobiliário, campanhas segmentadas e conteúdo que converte visitantes em clientes.' },
                { icon: '⚙️', title: 'Tecnologia Proprietária', desc: 'Sistemas desenvolvidos internamente pelo STRsoftware, desenhados especificamente para o fluxo imobiliário moderno.' },
              ].map((item) => (
                <div key={item.title} style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '32px 24px',
                  borderTop: '3px solid #d4af37',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>{item.title}</h3>
                  <p style={{ color: '#666', fontFamily: 'sans-serif', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MARCAS / PORTFÓLIO ── */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ display: 'inline-block', width: 48, height: 4, background: '#d4af37', marginBottom: 20 }} />
            <h2 style={{ fontSize: '1.9rem', fontWeight: 700 }}>Nosso ecossistema de marcas</h2>
            <p style={{ color: '#666', fontFamily: 'sans-serif', marginTop: 12 }}>
              A WebSeguros detém e opera um portfólio completo de soluções para o mercado imobiliário.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              {
                marca: 'Imobiliária Perto',
                url: 'imobiliariaperto.com.br',
                cor: '#0f3460',
                desc: 'Portal e consultoria de Marketing Imobiliário. Especializada em conectar compradores, vendedores e locatários nas regiões de atuação com foco em experiência e conversão.',
                tags: ['Marketing Imobiliário', 'Portal de Imóveis', 'Consultoria'],
              },
              {
                marca: 'STRsoftware',
                url: 'strsoftware.com.br',
                cor: '#1a6b3c',
                desc: 'Casa de Software do grupo WebSeguros. Desenvolve soluções tecnológicas proprietárias para o mercado imobiliário, incluindo sistemas de gestão, CRM e automação de marketing.',
                tags: ['Software Imobiliário', 'CRM', 'Tecnologia'],
              },
              {
                marca: 'Tributoimoveis',
                url: 'tributoimoveis.com.br',
                cor: '#7b3f00',
                desc: 'Plataforma especializada em inteligência tributária imobiliária. Orientação e suporte sobre ITBI, ITCMD, ganho de capital e obrigações fiscais em transações imobiliárias.',
                tags: ['Tributação', 'ITBI', 'Ganho de Capital'],
              },
            ].map((item) => (
              <div key={item.marca} style={{
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #eee',
              }}>
                <div style={{ background: item.cor, padding: '28px 24px' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{item.marca}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'monospace' }}>{item.url}</p>
                </div>
                <div style={{ padding: '24px' }}>
                  <p style={{ color: '#555', fontFamily: 'sans-serif', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 16 }}>{item.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {item.tags.map((tag) => (
                      <span key={tag} style={{
                        background: '#f0f0f0',
                        borderRadius: 20,
                        padding: '3px 10px',
                        fontSize: 11,
                        fontFamily: 'sans-serif',
                        color: '#555',
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── NÚMEROS ── */}
        <section style={{
          background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
          color: '#fff',
          padding: '64px 24px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: '#d4af37', marginBottom: 40, fontFamily: 'sans-serif' }}>
              Nossa presença
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32 }}>
              {[
                { num: '6+', label: 'Cidades atendidas' },
                { num: '3', label: 'Marcas do grupo' },
                { num: '100%', label: 'Foco imobiliário' },
                { num: '1', label: 'Missão: estar perto' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#d4af37', marginBottom: 8 }}>{item.num}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.7, fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MISSÃO VISÃO VALORES ── */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ display: 'inline-block', width: 48, height: 4, background: '#d4af37', marginBottom: 20 }} />
            <h2 style={{ fontSize: '1.9rem', fontWeight: 700 }}>Missão, Visão e Valores</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {[
              {
                titulo: 'Missão',
                texto: 'Aproximar pessoas dos imóveis certos através de tecnologia, marketing inteligente e atendimento humanizado — tornando cada transação imobiliária mais simples, segura e satisfatória.',
              },
              {
                titulo: 'Visão',
                texto: 'Ser referência em consultoria de Marketing Imobiliário no interior de São Paulo, reconhecidos pela inovação tecnológica e pela proximidade genuína com clientes e parceiros.',
              },
              {
                titulo: 'Valores',
                texto: 'Transparência nas relações. Inovação contínua. Responsabilidade com dados e contratos. Excelência no atendimento. Compromisso com resultados reais.',
              },
            ].map((item) => (
              <div key={item.titulo} style={{ borderLeft: '3px solid #d4af37', paddingLeft: 24 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, color: '#0f3460' }}>{item.titulo}</h3>
                <p style={{ color: '#555', fontFamily: 'sans-serif', lineHeight: 1.8, fontSize: '0.93rem' }}>{item.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: '#f8f7f2', padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 16 }}>
              Pronto para encontrar o imóvel ideal?
            </h2>
            <p style={{ color: '#666', fontFamily: 'sans-serif', lineHeight: 1.8, marginBottom: 32 }}>
              Nossa equipe está pronta para oferecer uma consultoria personalizada.
              Fale com a Imobiliária Perto e descubra como podemos ajudar.
            </p>
            <a href="/" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #0f3460, #16213e)',
              color: '#fff',
              padding: '14px 36px',
              borderRadius: 8,
              textDecoration: 'none',
              fontFamily: 'sans-serif',
              fontWeight: 600,
              fontSize: '0.95rem',
              letterSpacing: 0.5,
              marginRight: 12,
            }}>
              Ver imóveis disponíveis
            </a>
            <a href="/#contato" style={{
              display: 'inline-block',
              border: '2px solid #0f3460',
              color: '#0f3460',
              padding: '12px 32px',
              borderRadius: 8,
              textDecoration: 'none',
              fontFamily: 'sans-serif',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}>
              Fale conosco
            </a>
          </div>
        </section>

        {/* ── AVISO LEGAL ── */}
        <section style={{ background: '#1a1a2e', color: 'rgba(255,255,255,0.5)', padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'sans-serif', fontSize: '0.78rem', lineHeight: 1.8, maxWidth: 700, margin: '0 auto' }}>
            Imobiliária Perto é uma marca registrada da <strong style={{ color: 'rgba(255,255,255,0.7)' }}>WebSeguros</strong> — CNPJ: 23.659.612/0001-96.
            {' '}A WebSeguros é detentora exclusiva das marcas <strong style={{ color: 'rgba(255,255,255,0.7)' }}>STRsoftware.com.br</strong> e{' '}
            <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Tributoimoveis.com.br</strong>, reservando todos os direitos sobre seus produtos,
            sistemas, conteúdos e propriedade intelectual. É proibida a reprodução parcial ou total sem autorização expressa.
          </p>
        </section>

      </main>
    </>
  );
}
