import ListaImoveisClient from './components/ListaImoveisClient'
import { buscarImoveis } from '@/lib/imoveis'

export const metadata = {
  title: 'Imóveis à venda | Imobiliária Perto',
  description: 'Casas e apartamentos à venda em São Paulo e região'
}

export default async function Page() {
  const imoveis = await buscarImoveis()
  return <ListaImoveisClient initialData={imoveis} />
}

