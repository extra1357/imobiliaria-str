// src/components/seo/LocalBusinessSchema.tsx
// Componente para Schema de LocalBusiness - Imobiliária

interface LocalBusinessSchemaProps {
  cidade: 'Salto' | 'Itu' | 'Indaiatuba';
  telefone?: string;
  email?: string;
  endereco?: string;
}

const cidadeData = {
  Salto: {
    lat: '-23.2008',
    lng: '-47.2865',
    cep: '13320-000',
    descricao: 'Imobiliária especializada em Salto SP. Apartamentos e casas para alugar no Centro, Portal das Águas, Jardim Itália.',
  },
  Itu: {
    lat: '-23.2641',
    lng: '-47.2997',
    cep: '13300-000',
    descricao: 'Imobiliária especializada em Itu SP. Imóveis no Centro, Cidade Nova, Parque Residencial Potiguara.',
  },
  Indaiatuba: {
    lat: '-23.0903',
    lng: '-47.2181',
    cep: '13330-000',
    descricao: 'Imobiliária especializada em Indaiatuba SP. Imóveis em Cidade Nova, Morada do Sol, Jardim Pau Preto.',
  },
};

export default function LocalBusinessSchema({ 
  cidade, 
  telefone = '+55-11-99999-9999',
  email = 'contato@imobiliariaperto.com.br',
  endereco = 'Endereço da Imobiliária'
}: LocalBusinessSchemaProps) {
  const data = cidadeData[cidade];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: `Imobiliária Perto - ${cidade} SP`,
    description: data.descricao,
    url: `https://www.imobiliariaperto.com.br/imoveis-${cidade.toLowerCase()}`,
    telephone: telefone,
    email: email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: endereco,
      addressLocality: cidade,
      addressRegion: 'SP',
      postalCode: data.cep,
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: data.lat,
      longitude: data.lng,
    },
    areaServed: [
      {
        '@type': 'City',
        name: cidade,
      },
    ],
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
