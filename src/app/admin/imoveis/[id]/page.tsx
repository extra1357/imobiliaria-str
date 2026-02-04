'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic';

interface Imovel {
  id: string
  tipo: string
  endereco: string
  cidade: string
  estado: string
  bairro: string | null
  cep: string | null
  codigo: string | null
  preco: number
  precoAluguel: number | null
  metragem: number
  descricao: string | null
  imagens: string[]
  quartos: number
  suites: number
  banheiros: number
  vagas: number
  caracteristicas: string[]
  finalidade: string
  destaque: boolean
  disponivel: boolean
  status: string
  createdAt: string
  updatedAt: string
}

export default function ImovelAdminPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [imovel, setImovel] = useState<Imovel | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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

  const nextImage = () => {
    if (imovel && imovel.imagens) {
      setCurrentImageIndex((prev) => 
        prev === imovel.imagens.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (imovel && imovel.imagens) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? imovel.imagens.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!imovel) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Imóvel não encontrado</h2>
          <p className="text-red-600 mb-4">O imóvel que você está procurando não existe ou foi removido.</p>
          <button
            onClick={() => router.push('/admin/imoveis')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    )
  }

  // Formata o preço baseado na finalidade
  const precoExibicao = imovel.finalidade === 'aluguel' && imovel.precoAluguel 
    ? Number(imovel.precoAluguel) 
    : Number(imovel.preco);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Botão Voltar */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/imoveis')}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Lista
        </button>
      </div>

      {/* Título e Badges */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {imovel.endereco}
          </h1>
          {imovel.destaque && (
            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
              ⭐ Destaque
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            imovel.disponivel 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {imovel.disponivel ? '✓ Disponível' : '✗ Indisponível'}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-2">
          <span>📍 {imovel.bairro ? `${imovel.bairro}, ` : ''}{imovel.cidade} - {imovel.estado}</span>
          {imovel.codigo && <span className="text-sm">Cód: {imovel.codigo}</span>}
        </div>

        <p className="text-2xl text-blue-600 font-bold">
          {imovel.finalidade === 'aluguel' ? 'R$/mês ' : 'R$ '}
          {precoExibicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Carrossel de Imagens */}
      {imovel.imagens && imovel.imagens.length > 0 ? (
        <div className="mb-8">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
            {/* Imagem Principal */}
            <img
              src={imovel.imagens[currentImageIndex]}
              alt={`${imovel.endereco} - Imagem ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Imagem+Indisponível'
              }}
            />

            {/* Contador de Imagens */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {imovel.imagens.length}
            </div>

            {/* Botões de Navegação */}
            {imovel.imagens.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
                  aria-label="Imagem anterior"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
                  aria-label="Próxima imagem"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {imovel.imagens.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {imovel.imagens.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex 
                      ? 'border-blue-600 shadow-lg' 
                      : 'border-gray-300 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/80x80?text=Img'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 bg-gray-100 rounded-lg p-12 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600">Nenhuma imagem cadastrada</p>
        </div>
      )}

      {/* Informações do Imóvel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card de Características */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Características</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-semibold">{imovel.tipo}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Finalidade:</span>
              <span className="font-semibold capitalize">{imovel.finalidade}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Metragem:</span>
              <span className="font-semibold">{Number(imovel.metragem).toFixed(2)}m²</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold">{imovel.status}</span>
            </div>
            {imovel.cep && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">CEP:</span>
                <span className="font-semibold">{imovel.cep}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card de Comodidades */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Comodidades</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">🛏️</div>
              <div className="text-sm text-gray-600">Quartos</div>
              <div className="text-lg font-bold">{imovel.quartos}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">👑</div>
              <div className="text-sm text-gray-600">Suítes</div>
              <div className="text-lg font-bold">{imovel.suites}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">🚿</div>
              <div className="text-sm text-gray-600">Banheiros</div>
              <div className="text-lg font-bold">{imovel.banheiros}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">🚗</div>
              <div className="text-sm text-gray-600">Vagas</div>
              <div className="text-lg font-bold">{imovel.vagas}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Características */}
      {imovel.caracteristicas && imovel.caracteristicas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Características Adicionais</h2>
          <div className="flex flex-wrap gap-2">
            {imovel.caracteristicas.map((carac, idx) => (
              <span 
                key={idx}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {carac}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Descrição */}
      {imovel.descricao && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Descrição</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {imovel.descricao}
          </p>
        </div>
      )}

      {/* Informações de Preço */}
      {imovel.finalidade === 'venda' && imovel.precoAluguel && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800">
            💡 Este imóvel também está disponível para aluguel por <strong>R$ {Number(imovel.precoAluguel).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</strong>
          </p>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => router.push(`/admin/imoveis/${params.id}/editar`)}
          className="flex-1 min-w-[200px] bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          ✏️ Editar Imóvel
        </button>
        <button
          onClick={() => {
            if (confirm('Tem certeza que deseja excluir este imóvel?')) {
              fetch(`/api/imoveis/${params.id}`, { method: 'DELETE' })
                .then(res => {
                  if (res.ok) {
                    router.push('/admin/imoveis')
                  } else {
                    alert('Erro ao excluir imóvel')
                  }
                })
                .catch(err => {
                  console.error(err)
                  alert('Erro ao excluir imóvel')
                })
            }
          }}
          className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
        >
          🗑️ Excluir
        </button>
      </div>

      {/* Informações de Auditoria */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        Criado em: {new Date(imovel.createdAt).toLocaleDateString('pt-BR')} | 
        Última atualização: {new Date(imovel.updatedAt).toLocaleDateString('pt-BR')}
      </div>
    </div>
  )
}
