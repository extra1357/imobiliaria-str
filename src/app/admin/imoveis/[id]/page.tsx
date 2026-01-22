'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Imovel {
  id: string
  tipo: string
  endereco: string
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string
  estado: string
  cep: string | null
  codigo: string | null
  area: string | null
  quartos: number | null
  banheiros: number | null
  vagas: number | null
  preco: string
  iptu: string | null
  condominio: string | null
  descricao: string | null
  observacoes: string | null
  disponivel: boolean
  status: string
  motivoDesabilitacao: string | null
  dataDesabilitacao: string | null
  proprietarioId: string | null
}

export default function EditarImovelPage() {
  const params = useParams()
  const router = useRouter()
  const imovelId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [imovel, setImovel] = useState<Imovel | null>(null)
  const [showMotivo, setShowMotivo] = useState(false)

  useEffect(() => {
    if (imovelId) {
      fetchImovel()
    }
  }, [imovelId])

  const fetchImovel = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/imoveis/${imovelId}`)
      const data = await res.json()
      
      if (data.success && data.data) {
        setImovel(data.data)
      } else {
        setErro('Erro ao carregar imóvel')
      }
    } catch (error) {
      console.error('Erro:', error)
      setErro('Erro ao carregar imóvel')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setImovel(prev => prev ? {
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    } : null)
  }

  const handleDesabilitar = async (motivo: string) => {
    if (!imovel) return

    setShowMotivo(false)
    setSalvando(true)
    setErro('')

    try {
      const response = await fetch(`/api/imoveis/${imovelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disponivel: false,
          status: 'INATIVO',
          motivoDesabilitacao: motivo,
          dataDesabilitacao: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Imóvel desabilitado! Motivo: ${motivo}`)
        fetchImovel()
      } else {
        setErro(data.error || 'Erro ao desabilitar imóvel')
      }
    } catch (error: any) {
      console.error('Erro:', error)
      setErro('Erro ao desabilitar imóvel')
    } finally {
      setSalvando(false)
    }
  }

  const handleHabilitar = async () => {
    if (!imovel) return

    setSalvando(true)
    setErro('')

    try {
      const response = await fetch(`/api/imoveis/${imovelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disponivel: true,
          status: 'ATIVO',
          motivoDesabilitacao: null,
          dataDesabilitacao: null
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Imóvel habilitado e disponível novamente!')
        fetchImovel()
      } else {
        setErro(data.error || 'Erro ao habilitar imóvel')
      }
    } catch (error: any) {
      console.error('Erro:', error)
      setErro('Erro ao habilitar imóvel')
    } finally {
      setSalvando(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imovel) return

    setErro('')
    setSalvando(true)

    try {
      const response = await fetch(`/api/imoveis/${imovelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imovel)
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Imóvel atualizado com sucesso!')
        router.push('/admin/imoveis')
      } else {
        setErro(data.error || 'Erro ao atualizar imóvel')
      }
    } catch (error: any) {
      console.error('Erro:', error)
      setErro('Erro ao atualizar imóvel')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-pulse">🏠</div>
          <p className="text-2xl font-black text-white uppercase tracking-widest">
            Carregando imóvel...
          </p>
        </div>
      </div>
    )
  }

  if (!imovel) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">❌</div>
          <p className="text-3xl font-black text-white uppercase mb-8">Imóvel não encontrado</p>
          <Link 
            href="/admin/imoveis"
            className="inline-block bg-yellow-400 text-black px-10 py-5 font-black text-xl uppercase hover:bg-yellow-300 transition-all"
          >
            ← Voltar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12">
      {/* HEADER */}
      <div className="mb-12 bg-gradient-to-r from-orange-400 to-red-500 p-1">
        <div className="bg-black p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter">
                EDITAR IMÓVEL
              </h1>
              <p className="text-orange-400 font-black text-lg uppercase tracking-widest mt-2">
                {imovel.codigo || 'Sem código'} • {imovel.tipo}
              </p>
            </div>
            <Link 
              href="/admin/imoveis"
              className="bg-orange-400 text-black px-8 py-4 font-black uppercase hover:bg-orange-300 transition-all text-xl"
            >
              ← VOLTAR
            </Link>
          </div>
        </div>
      </div>

      {/* STATUS ATUAL */}
      <div className={`mb-8 p-6 border-l-8 ${
        imovel.disponivel 
          ? 'bg-green-900 border-green-500' 
          : 'bg-red-900 border-red-500'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-2xl font-black uppercase mb-2">
              {imovel.disponivel ? '✓ IMÓVEL HABILITADO' : '✗ IMÓVEL DESABILITADO'}
            </p>
            {!imovel.disponivel && imovel.motivoDesabilitacao && (
              <p className="text-lg">
                <span className="font-black">Motivo:</span> {imovel.motivoDesabilitacao.toUpperCase()}
              </p>
            )}
            {!imovel.disponivel && imovel.dataDesabilitacao && (
              <p className="text-sm opacity-75">
                Desabilitado em: {new Date(imovel.dataDesabilitacao).toLocaleString('pt-BR')}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            {imovel.disponivel ? (
              <button
                onClick={() => setShowMotivo(true)}
                disabled={salvando}
                className="bg-red-500 text-white px-8 py-4 font-black uppercase hover:bg-red-400 transition-all disabled:opacity-50"
              >
                🔒 DESABILITAR IMÓVEL
              </button>
            ) : (
              <button
                onClick={handleHabilitar}
                disabled={salvando}
                className="bg-green-500 text-white px-8 py-4 font-black uppercase hover:bg-green-400 transition-all disabled:opacity-50"
              >
                ✓ HABILITAR IMÓVEL
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL MOTIVO DESABILITAÇÃO */}
      {showMotivo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-black p-8 max-w-md w-full">
            <h3 className="text-3xl font-black uppercase mb-6">
              MOTIVO DA DESABILITAÇÃO
            </h3>
            <p className="mb-6 text-sm">
              Selecione o motivo pelo qual este imóvel será desabilitado:
            </p>
            <div className="space-y-4">
              <button
                onClick={() => handleDesabilitar('VENDIDO')}
                className="w-full bg-green-500 text-white p-4 font-black uppercase hover:bg-green-400 transition-all"
              >
                💰 VENDIDO
              </button>
              <button
                onClick={() => handleDesabilitar('ALUGADO')}
                className="w-full bg-blue-500 text-white p-4 font-black uppercase hover:bg-blue-400 transition-all"
              >
                🏠 ALUGADO
              </button>
              <button
                onClick={() => handleDesabilitar('SUSPENSO')}
                className="w-full bg-yellow-500 text-black p-4 font-black uppercase hover:bg-yellow-400 transition-all"
              >
                ⏸️ SUSPENSO
              </button>
              <button
                onClick={() => setShowMotivo(false)}
                className="w-full bg-gray-300 text-black p-4 font-black uppercase hover:bg-gray-200 transition-all"
              >
                ✗ CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERRO */}
      {erro && (
        <div className="mb-8 bg-red-500 text-white p-6 border-l-8 border-red-700">
          <p className="font-black text-xl">❌ {erro}</p>
        </div>
      )}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="bg-white text-black p-8">
        {/* DADOS DO IMÓVEL */}
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-orange-400 pb-4">
            🏠 DADOS DO IMÓVEL
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InputField
              label="Tipo *"
              name="tipo"
              value={imovel.tipo}
              onChange={handleChange}
              required
            />
            
            <InputField
              label="Código"
              name="codigo"
              value={imovel.codigo || ''}
              onChange={handleChange}
            />
            
            <InputField
              label="Preço *"
              name="preco"
              type="number"
              value={imovel.preco}
              onChange={handleChange}
              required
            />
            
            <InputField
              label="Área (m²)"
              name="area"
              value={imovel.area || ''}
              onChange={handleChange}
            />
            
            <InputField
              label="Quartos"
              name="quartos"
              type="number"
              value={imovel.quartos?.toString() || ''}
              onChange={handleChange}
            />
            
            <InputField
              label="Banheiros"
              name="banheiros"
              type="number"
              value={imovel.banheiros?.toString() || ''}
              onChange={handleChange}
            />
            
            <InputField
              label="Vagas"
              name="vagas"
              type="number"
              value={imovel.vagas?.toString() || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ENDEREÇO */}
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-blue-400 pb-4">
            📍 ENDEREÇO
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InputField
              label="Endereço *"
              name="endereco"
              value={imovel.endereco}
              onChange={handleChange}
              required
              className="lg:col-span-2"
            />
            
            <InputField
              label="Número"
              name="numero"
              value={imovel.numero || ''}
              onChange={handleChange}
            />
            
            <InputField
              label="Complemento"
              name="complemento"
              value={imovel.complemento || ''}
              onChange={handleChange}
            />
            
            <InputField
              label="Bairro"
              name="bairro"
              value={imovel.bairro || ''}
              onChange={handleChange}
            />
            
            <InputField
              label="CEP"
              name="cep"
              value={imovel.cep || ''}
              onChange={handleChange}
            />
            
            <InputField
              label="Cidade *"
              name="cidade"
              value={imovel.cidade}
              onChange={handleChange}
              required
            />
            
            <InputField
              label="Estado *"
              name="estado"
              value={imovel.estado}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* CUSTOS */}
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-green-400 pb-4">
            💰 CUSTOS ADICIONAIS
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InputField
              label="IPTU (R$/mês)"
              name="iptu"
              type="number"
              value={imovel.iptu || ''}
              onChange={handleChange}
            />
            
            <InputField
              label="Condomínio (R$/mês)"
              name="condominio"
              type="number"
              value={imovel.condominio || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* DESCRIÇÃO */}
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-purple-400 pb-4">
            📝 DESCRIÇÃO E OBSERVAÇÕES
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block font-black text-xs uppercase mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={imovel.descricao || ''}
                onChange={handleChange}
                rows={4}
                className="w-full border-4 border-black p-4 font-bold"
                placeholder="Descrição completa do imóvel..."
              />
            </div>

            <div>
              <label className="block font-black text-xs uppercase mb-2">
                Observações Internas
              </label>
              <textarea
                name="observacoes"
                value={imovel.observacoes || ''}
                onChange={handleChange}
                rows={3}
                className="w-full border-4 border-black p-4 font-bold"
                placeholder="Observações para uso interno..."
              />
            </div>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={salvando || !imovel.disponivel}
            className="flex-1 bg-gradient-to-r from-orange-400 to-red-500 text-black px-8 py-6 font-black text-xl uppercase hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {salvando ? '⏳ SALVANDO...' : '✓ SALVAR ALTERAÇÕES'}
          </button>
          
          <Link
            href="/admin/imoveis"
            className="bg-gray-800 text-white px-8 py-6 font-black text-xl uppercase hover:bg-gray-700 transition-all text-center"
          >
            ✗ CANCELAR
          </Link>
        </div>

        {!imovel.disponivel && (
          <p className="mt-4 text-center text-red-600 font-black">
            ⚠️ Imóvel desabilitado não pode ser editado. Habilite-o primeiro.
          </p>
        )}
      </form>
    </div>
  )
}

// COMPONENTE DE INPUT
function InputField({ 
  label, 
  className = '',
  ...props 
}: { 
  label: string
  className?: string
  [key: string]: any 
}) {
  return (
    <div className={className}>
      <label className="block font-black text-xs uppercase mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full border-4 border-black p-4 font-bold uppercase text-sm placeholder:text-gray-400 disabled:bg-gray-100"
      />
    </div>
  )
}
