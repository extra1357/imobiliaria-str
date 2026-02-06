'use client'

import { useRouter } from 'next/navigation'
import GaleriaImovel from './GaleriaImovel'

/**
 * ATENÇÃO:
 * Este tipo representa o DTO retornado por `buscarImovelPorId`
 * (não é o model Prisma diretamente)
 */
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

interface ImovelDetalhesProps {
  imovel: Imovel
}

export default function ImovelDetalhes({ imovel }: ImovelDetalhesProps) {
  const router = useRouter()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Galeria com informações integradas */}
      {imovel.imagens && imovel.imagens.length > 0 && (
        <GaleriaImovel 
          imagens={imovel.imagens} 
          titulo={imovel.title}
          endereco={imovel.addr}
          quartos={imovel.quartos}
          banheiros={imovel.banheiros}
          garagem={imovel.garagem}
          metragem={imovel.metragem}
          preco={imovel.price}
          finalidade={imovel.finalidade}
        />
      )}

      {/* Descrição */}
      {imovel.description && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded"></span>
            Sobre o Imóvel
          </h2>
          <div className="prose prose-gray max-w-none">
            {imovel.description.split('\n').map((paragrafo, index) => {
              const textoLimpo = paragrafo.trim()
              if (!textoLimpo) return null
              
              return (
                <p key={index} className="text-gray-700 leading-relaxed mb-4 text-justify">
                  {textoLimpo}
                </p>
              )
            })}
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-600 rounded"></span>
          Informações Adicionais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Tipo:</span>
            <span className="text-gray-900 font-semibold">{imovel.type}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Finalidade:</span>
            <span className="text-gray-900 font-semibold capitalize">{imovel.finalidade}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Destaque:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              imovel.destaque 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {imovel.destaque ? 'Sim' : 'Não'}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Código:</span>
            <span className="text-gray-900 font-mono font-semibold">{imovel.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-colors shadow-sm"
        >
          ← Voltar
        </button>
        
        <button
          onClick={() => {
            const mensagem = `Olá! Tenho interesse no imóvel: ${imovel.title} - ${imovel.addr}. Código: ${imovel.id.slice(0, 8).toUpperCase()}`
            const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`
            window.open(whatsappUrl, '_blank')
          }}
          className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors shadow-sm flex-1 md:flex-none"
        >
          📱 Entrar em Contato
        </button>
        
        <button
          onClick={() => {
            // Aqui você pode adicionar funcionalidade de agendar visita
            alert('Funcionalidade de agendamento em desenvolvimento')
          }}
          className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm flex-1 md:flex-none"
        >
          📅 Agendar Visita
        </button>
      </div>
    </div>
  )
}
