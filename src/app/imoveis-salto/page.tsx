// src/app/imoveis-salto/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import FAQSchema from '@/components/seo/FAQSchema';

export const metadata: Metadata = {
  title: 'Imobiliária em Salto SP - Apartamentos e Casas Perto de Você | Imobiliária Perto',
  description: 'Encontre apartamentos e casas para alugar em Salto SP. Imóveis no Centro, Portal das Águas, Jardim Itália. Imobiliária especializada em Salto.',
  keywords: 'imobiliária salto, apartamento salto, casa para alugar salto, imóveis salto sp, aluguel salto',
  openGraph: {
    title: 'Imobiliária em Salto SP - Imóveis Perto de Você',
    description: 'Os melhores apartamentos e casas para alugar em Salto SP',
    url: 'https://www.imobiliariaperto.com.br/imoveis-salto',
    siteName: 'Imobiliária Perto',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.imobiliariaperto.com.br/imoveis-salto',
  },
};

const faqItems = [
  {
    question: 'Qual o valor médio do aluguel em Salto SP?',
    answer: 'O valor médio de aluguel em Salto varia de R$ 800 a R$ 1.500 para apartamentos e R$ 1.200 a R$ 2.500 para casas, dependendo do bairro e tamanho do imóvel.',
  },
  {
    question: 'Quais os melhores bairros para morar em Salto?',
    answer: 'Os bairros mais procurados em Salto são: Centro (infraestrutura completa), Portal das Águas (moderno), Jardim Itália (tranquilo) e Vila Nova (valorizado).',
  },
  {
    question: 'Como alugar um imóvel em Salto pela Imobiliária Perto?',
    answer: 'É simples! Navegue pelos nossos imóveis disponíveis, escolha o que mais gosta e entre em contato conosco. Nossa equipe irá te guiar em todo o processo de locação.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Imóveis em Salto', url: '/imoveis-salto' },
];

async function getImoveisSalto() {
  try {
    const imoveis = await prisma.imovel.findMany({
      where: {
        cidade: 'Salto',
        status: 'ATIVO',
        disponivel: true,
      },
      take: 12,
      orderBy: [
        { destaque: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        tipo: true,
        endereco: true,
        bairro: true,
        preco: true,
        precoAluguel: true,
        metragem: true,
        quartos: true,
        banheiros: true,
        vagas: true,
        finalidade: true,
        imagens: true,
        destaque: true,
      },
    });
    return imoveis;
  } catch (error) {
    console.error('Erro ao buscar imóveis:', error);
    return [];
  }
}

async function getEstatisticas() {
  try {
    const [total, casas, apartamentos, aluguel, venda] = await Promise.all([
      prisma.imovel.count({
        where: { cidade: 'Salto', status: 'ATIVO', disponivel: true },
      }),
      prisma.imovel.count({
        where: { cidade: 'Salto', status: 'ATIVO', disponivel: true, tipo: 'Casa' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Salto', status: 'ATIVO', disponivel: true, tipo: 'Apartamento' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Salto', status: 'ATIVO', disponivel: true, finalidade: 'aluguel' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Salto', status: 'ATIVO', disponivel: true, finalidade: 'venda' },
      }),
    ]);
    return { total, casas, apartamentos, aluguel, venda };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { total: 0, casas: 0, apartamentos: 0, aluguel: 0, venda: 0 };
  }
}

export default async function ImoveisSaltoPage() {
  const imoveis = await getImoveisSalto();
  const stats = await getEstatisticas();

  return (
    <>
      {/* Schema Markup */}
      <LocalBusinessSchema cidade="Salto" />
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema items={faqItems} />

      {/* Breadcrumb visual */}
      <nav aria-label="breadcrumb" className="container mx-auto px-4 py-4">
        <ol className="flex space-x-2 text-sm text-gray-600">
          {breadcrumbs.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              <Link href={item.url} className="hover:text-blue-600">
                {item.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Imobiliária em Salto SP - Encontre seu Imóvel Perto de Você
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Procurando <strong>apartamentos ou casas para alugar em Salto SP</strong>? 
            A <strong>Imobiliária Perto</strong> é especialista no mercado imobiliário de 
            Salto e região, com os melhores imóveis no Centro, Portal das Águas, Jardim 
            Itália e Vila Nova.
          </p>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Imóveis Disponíveis</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{stats.casas}</div>
              <div className="text-sm text-gray-600">Casas</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.apartamentos}</div>
              <div className="text-sm text-gray-600">Apartamentos</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.aluguel}</div>
              <div className="text-sm text-gray-600">Para Alugar</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-600">{stats.venda}</div>
              <div className="text-sm text-gray-600">Para Venda</div>
            </div>
          </div>
        </section>

        {/* Bairros de Salto */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Imóveis em Salto SP por Bairro</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Apartamentos e Casas no Centro de Salto
              </h3>
              <p className="text-gray-700 mb-4">
                O <strong>centro de Salto</strong> oferece a melhor infraestrutura da cidade, 
                com fácil acesso a bancos, comércio, escolas e transporte público. Encontre 
                apartamentos e casas próximos à Rua XV de Novembro, Praça Barão de Monte Santo 
                e Prefeitura Municipal.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Salto&bairro=Centro" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Centro →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Imóveis no Portal das Águas - Salto
              </h3>
              <p className="text-gray-700 mb-4">
                Bairro residencial moderno com excelente infraestrutura. Próximo ao Shopping 
                Portal das Águas, escolas e Rodovia Santos Dumont. Ideal para famílias que 
                buscam qualidade de vida em Salto.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Salto&bairro=Portal das Águas" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Portal das Águas →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Casas e Apartamentos no Jardim Itália
              </h3>
              <p className="text-gray-700 mb-4">
                Bairro tranquilo e valorizado, próximo à Via Anhanguera. Ótima opção para 
                quem trabalha em Itu, Indaiatuba ou Campinas e busca imóveis em Salto com 
                fácil acesso às principais rodovias.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Salto&bairro=Jardim Itália" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Jardim Itália →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Imóveis na Vila Nova - Salto
              </h3>
              <p className="text-gray-700 mb-4">
                Bairro tradicional e consolidado, com comércio local e boa infraestrutura. 
                Próximo ao centro de Salto, oferece apartamentos e casas com excelente 
                custo-benefício.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Salto&bairro=Vila Nova" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis na Vila Nova →
              </Link>
            </div>
          </div>
        </section>

        {/* Imóveis em Destaque */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Imóveis Disponíveis em Salto</h2>
          
          {imoveis.length === 0 ? (
            <p className="text-gray-600">
              Não há imóveis disponíveis no momento. Entre em contato conosco para mais informações.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {imoveis.map((imovel) => {
                const preco = imovel.finalidade === 'aluguel' && imovel.precoAluguel 
                  ? Number(imovel.precoAluguel) 
                  : Number(imovel.preco);
                
                return (
                  <Link 
                    key={imovel.id} 
                    href={`/imoveis-publicos/${imovel.id}`}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {imovel.imagens && imovel.imagens.length > 0 ? (
                      <img 
                        src={imovel.imagens[0]} 
                        alt={`${imovel.tipo} em ${imovel.bairro || 'Salto'}`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {imovel.tipo} - {imovel.bairro || 'Salto'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {imovel.quartos} quartos • {imovel.banheiros} banheiros • {Number(imovel.metragem)}m²
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-600">
                          R$ {preco.toLocaleString('pt-BR')}
                          {imovel.finalidade === 'aluguel' && '/mês'}
                        </span>
                        {imovel.destaque && (
                          <span className="bg-yellow-400 text-xs px-2 py-1 rounded">
                            Destaque
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-8">
            <Link 
              href="/imoveis-publicos?cidade=Salto"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Todos os Imóveis em Salto
            </Link>
          </div>
        </section>

        {/* Por que Morar em Salto */}
        <section className="mb-12 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Por que Morar em Salto SP?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">🏭 Polo Industrial</h3>
              <p className="text-gray-700">
                Empresas de grande porte como Mondial, Eucatex e Bristol-Myers Squibb geram 
                milhares de empregos na cidade.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">📚 Educação</h3>
              <p className="text-gray-700">
                Boas escolas públicas e particulares, além de ETEC e FATEC para ensino técnico 
                e superior.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🚗 Localização Estratégica</h3>
              <p className="text-gray-700">
                20 minutos de Itu, 25 minutos de Indaiatuba, próximo às rodovias Anhanguera e 
                Castelo Branco.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">💰 Custo de Vida</h3>
              <p className="text-gray-700">
                Mais acessível que Campinas e Sorocaba, mantendo boa qualidade de vida e 
                infraestrutura.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Perguntas Frequentes - Imóveis em Salto SP</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                <p className="text-gray-700">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-blue-600 text-white p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">
            Encontre seu Imóvel Ideal em Salto SP
          </h2>
          <p className="text-lg mb-6">
            Nossa equipe está pronta para ajudar você a encontrar o imóvel perfeito perto de você.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href="/imoveis-publicos?cidade=Salto"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver Todos os Imóveis
            </Link>
            <a 
              href="https://wa.me/5511976661297?text=Olá! Gostaria de mais informações sobre imóveis em Salto"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Falar no WhatsApp
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
