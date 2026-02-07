import { buscarImoveis } from '@/lib/imoveis'
import ListaImoveisClient from './components/ListaImoveisClient'
import Footer from './components/Footer'

export default async function HomePage() {
  const imoveis = await buscarImoveis()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ListaImoveisClient initialData={imoveis} />
      <Footer />
    </div>
  )
}
