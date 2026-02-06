'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Bed, Bath, Car, Maximize2, MapPin } from 'lucide-react'

interface GaleriaImovelProps {
  imagens: string[]
  titulo: string
  endereco?: string
  quartos?: number
  banheiros?: number
  garagem?: number
  metragem?: number
  preco?: number
  finalidade?: string
}

export default function GaleriaImovel({ 
  imagens, 
  titulo, 
  endereco,
  quartos,
  banheiros,
  garagem,
  metragem,
  preco,
  finalidade
}: GaleriaImovelProps) {
  const [imagemAtual, setImagemAtual] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  if (!imagens || imagens.length === 0) {
    return (
      <div className="bg-gray-100 p-8 text-center rounded-lg">
        <p className="text-gray-500">Nenhuma imagem disponível</p>
      </div>
    )
  }

  const proximaImagem = () => {
    setImagemAtual((prev) => (prev + 1) % imagens.length)
  }

  const imagemAnterior = () => {
    setImagemAtual((prev) => (prev - 1 + imagens.length) % imagens.length)
  }

  const irParaImagem = (index: number) => {
    setImagemAtual(index)
  }

  return (
    <div className="space-y-6">
      {/* Carrossel Principal */}
      <div 
        className="relative w-full h-[500px] bg-gray-900 rounded-xl overflow-hidden group shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Imagem Principal - object-contain para não esticar */}
        <img
          src={imagens[imagemAtual]}
          alt={`${titulo} - Imagem ${imagemAtual + 1}`}
          className="w-full h-full object-contain transition-opacity duration-300"
        />

        {/* Contador de Imagens */}
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
          {imagemAtual + 1} / {imagens.length}
        </div>

        {/* Badge de Finalidade */}
        {finalidade && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold uppercase backdrop-blur-sm">
            {finalidade}
          </div>
        )}

        {/* Setas de Navegação - Aparecem no Hover */}
        {imagens.length > 1 && (
          <>
            <button
              onClick={imagemAnterior}
              className={`absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition-all duration-300 shadow-lg ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={proximaImagem}
              className={`absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition-all duration-300 shadow-lg ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              aria-label="Próxima imagem"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Indicadores de Posição */}
        {imagens.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {imagens.map((_, index) => (
              <button
                key={index}
                onClick={() => irParaImagem(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === imagemAtual
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75 w-1.5'
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Informações do Imóvel - Card com Ícones */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {/* Título e Endereço */}
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {titulo}
          </h1>
          {endereco && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm md:text-base">{endereco}</p>
            </div>
          )}
        </div>

        {/* Preço */}
        {preco !== undefined && (
          <div className="mb-5 pb-5 border-b border-gray-200">
            <p className="text-3xl font-bold text-green-600">
              R$ {preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {/* Características com Ícones */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quartos !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Bed className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Quartos</p>
                <p className="text-lg font-bold text-gray-900">{quartos}</p>
              </div>
            </div>
          )}

          {banheiros !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-cyan-100 p-2 rounded-lg">
                <Bath className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Banheiros</p>
                <p className="text-lg font-bold text-gray-900">{banheiros}</p>
              </div>
            </div>
          )}

          {garagem !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Car className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Garagem</p>
                <p className="text-lg font-bold text-gray-900">{garagem}</p>
              </div>
            </div>
          )}

          {metragem !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-lg">
                <Maximize2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Área</p>
                <p className="text-lg font-bold text-gray-900">{metragem} m²</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Miniaturas */}
      {imagens.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {imagens.map((img, idx) => (
            <button
              key={idx}
              onClick={() => irParaImagem(idx)}
              className={`relative h-20 bg-gray-100 rounded-lg overflow-hidden transition-all ${
                idx === imagemAtual
                  ? 'ring-2 ring-blue-500 opacity-100 scale-105'
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              <img
                src={img}
                alt={`${titulo} - Miniatura ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
