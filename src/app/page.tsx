import { buscarImoveis } from '@/lib/imoveis'
import ListaImoveisClient from './components/ListaImoveisClient'
import Footer from './components/Footer'

export default async function HomePage() {
  // Fetch de imóveis no servidor
  const imoveis = await buscarImoveis()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Client Component recebe os dados */}
      <ListaImoveisClient initialData={imoveis} />
      <Footer />
    </div>
  )
}

