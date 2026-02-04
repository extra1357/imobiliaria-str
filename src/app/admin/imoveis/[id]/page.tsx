'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic';

interface Imovel {
  id: string
  type: string
  title: string
  addr: string
  price: number
  imagens: string[]
  description: string | null
  quartos: number
  banheiros: number
  garagem: number
  metragem: number
  finalidade: string
  destaque: boolean
}

export default function ImovelAdminPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [imovel, setImovel] = useState<Imovel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/imoveis/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setImovel(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [params.id])

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  if (!imovel) {
    return <div className="p-8">Imóvel não encontrado</div>
  }

  return (
    <div className="p-8">
      <div className="mb-4">
        <button
          onClick={() => router.push('/admin/imoveis')}
          className="text-blue-600 hover:underline"
        >
          ← Voltar
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-4">{imovel.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p><strong>Tipo:</strong> {imovel.type}</p>
          <p><strong>Endereço:</strong> {imovel.addr}</p>
          <p><strong>Preço:</strong> R$ {imovel.price.toLocaleString('pt-BR')}</p>
          <p><strong>Finalidade:</strong> {imovel.finalidade}</p>
        </div>
        <div>
          <p><strong>Quartos:</strong> {imovel.quartos}</p>
          <p><strong>Banheiros:</strong> {imovel.banheiros}</p>
          <p><strong>Garagem:</strong> {imovel.garagem}</p>
          <p><strong>Metragem:</strong> {imovel.metragem}m²</p>
          <p><strong>Destaque:</strong> {imovel.destaque ? 'Sim' : 'Não'}</p>
        </div>
      </div>

      {imovel.description && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Descrição</h2>
          <p>{imovel.description}</p>
        </div>
      )}

      {imovel.imagens && imovel.imagens.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Imagens</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imovel.imagens.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${imovel.title} - ${idx + 1}`}
                className="w-full h-48 object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => router.push(`/admin/imoveis/${params.id}/editar`)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Editar Imóvel
        </button>
      </div>
    </div>
  )
}
