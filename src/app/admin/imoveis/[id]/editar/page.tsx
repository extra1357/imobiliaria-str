'use client'

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Proprietario {
  id: string
  nome: string
  email: string
}

export default function EditarImovel() {
  const router = useRouter()
  const params = useParams()
  const imovelId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([])
  
  const [form, setForm] = useState({
    tipo: '',
    endereco: '',
    cidade: '',
    estado: 'SP',
    bairro: '',
    cep: '',
    preco: '',
    precoAluguel: '',
    metragem: '',
    quartos: '0',
    suites: '0',
    banheiros: '0',
    vagas: '0',
    descricao: '',
    codigo: '',
    proprietarioId: '',
    finalidade: 'venda',
    status: 'ATIVO',
    disponivel: true,
    destaque: false,
    caracteristicas: [] as string[],
    imagens: [] as string[]
  })

  const [novaCaracteristica, setNovaCaracteristica] = useState('')
  const [novaImagem, setNovaImagem] = useState('')

  useEffect(() => {
    fetchProprietarios()
    if (imovelId) {
      fetchImovel()
    }
  }, [imovelId])

  const fetchProprietarios = async () => {
    try {
      const res = await fetch('/api/proprietarios')
      const data = await res.json()
      if (data.success) {
        setProprietarios(data.data || [])
      }
    } catch (error: any) {
      console.error('Erro ao carregar proprietários:', error)
    }
  }

  const fetchImovel = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/imoveis/${imovelId}`)
      const data = await res.json()
      
      if (data.success && data.data) {
        const imovel = data.data
        setForm({
          tipo: imovel.tipo || '',
          endereco: imovel.endereco || '',
          cidade: imovel.cidade || '',
          estado: imovel.estado || 'SP',
          bairro: imovel.bairro || '',
          cep: imovel.cep || '',
          preco: imovel.preco?.toString() || '',
          precoAluguel: imovel.precoAluguel?.toString() || '',
          metragem: imovel.metragem?.toString() || '',
          quartos: imovel.quartos?.toString() || '0',
          suites: imovel.suites?.toString() || '0',
          banheiros: imovel.banheiros?.toString() || '0',
          vagas: imovel.vagas?.toString() || '0',
          descricao: imovel.descricao || '',
          codigo: imovel.codigo || '',
          proprietarioId: imovel.proprietarioId || '',
          finalidade: imovel.finalidade || 'venda',
          status: imovel.status || 'ATIVO',
          disponivel: imovel.disponivel !== false,
          destaque: imovel.destaque || false,
          caracteristicas: Array.isArray(imovel.caracteristicas) ? imovel.caracteristicas : [],
          imagens: Array.isArray(imovel.imagens) ? imovel.imagens : []
        })
      }
    } catch (error: any) {
      console.error('Erro ao carregar imóvel:', error)
      alert('Erro ao carregar dados do imóvel')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.tipo || !form.endereco || !form.cidade || !form.preco || !form.metragem || !form.proprietarioId) {
      alert('Preencha todos os campos obrigatórios: Tipo, Endereço, Cidade, Preço, Metragem e Proprietário')
      return
    }

    try {
      setSaving(true)
      
      const payload = {
        ...form,
        preco: parseFloat(form.preco.replace(/\D/g, '')) / 100,
        precoAluguel: form.precoAluguel ? parseFloat(form.precoAluguel.replace(/\D/g, '')) / 100 : null,
        metragem: parseFloat(form.metragem),
        quartos: parseInt(form.quartos),
        suites: parseInt(form.suites),
        banheiros: parseInt(form.banheiros),
        vagas: parseInt(form.vagas)
      }

      const res = await fetch(`/api/imoveis/${imovelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok && data.success) {
        alert('✅ Imóvel atualizado com sucesso!')
        router.push('/admin/imoveis')
      } else {
        throw new Error(data.error || 'Erro ao atualizar imóvel')
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      alert(`❌ Erro ao atualizar imóvel: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const adicionarCaracteristica = () => {
    if (novaCaracteristica.trim()) {
      setForm({
        ...form,
        caracteristicas: [...form.caracteristicas, novaCaracteristica.trim()]
      })
      setNovaCaracteristica('')
    }
  }

  const removerCaracteristica = (index: number) => {
    setForm({
      ...form,
      caracteristicas: form.caracteristicas.filter((_, i) => i !== index)
    })
  }

  const adicionarImagem = () => {
    if (novaImagem.trim()) {
      setForm({
        ...form,
        imagens: [...form.imagens, novaImagem.trim()]
      })
      setNovaImagem('')
    }
  }

  const removerImagem = (index: number) => {
    setForm({
      ...form,
      imagens: form.imagens.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl font-bold text-slate-500">Carregando dados do imóvel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-12 font-sans">
      {/* HEADER */}
      <div className="mb-12 border-l-[12px] border-orange-500 pl-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none text-slate-900">
              Editar <br />
              <span className="text-orange-600">Imóvel</span>
            </h1>
            <p className="font-black text-slate-500 text-sm tracking-widest uppercase mt-4">
              Atualizar Informações • STR Genetics
            </p>
          </div>
          <Link 
            href="/admin/imoveis"
            className="bg-slate-900 text-white px-8 py-4 font-black uppercase italic tracking-tighter shadow-lg shadow-orange-600 hover:shadow-none transition-all"
          >
            ← Cancelar
          </Link>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div className="bg-white border-4 border-slate-900 p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tipo */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Tipo de Imóvel *
            </label>
            <select
              value={form.tipo}
              onChange={e => setForm({...form, tipo: e.target.value})}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
              required
            >
              <option value="">Selecione...</option>
              <option value="CASA">Casa</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="SOBRADO">Sobrado</option>
              <option value="TERRENO">Terreno</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="RURAL">Rural</option>
            </select>
          </div>

          {/* Código */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Código (Referência)
            </label>
            <input
              type="text"
              value={form.codigo}
              onChange={e => setForm({...form, codigo: e.target.value})}
              placeholder="Ex: IMO-001"
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            />
          </div>

          {/* Endereço */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Endereço Completo *
            </label>
            <input
              type="text"
              value={form.endereco}
              onChange={e => setForm({...form, endereco: e.target.value})}
              placeholder="Rua, Número, Complemento"
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
              required
            />
          </div>

          {/* Bairro */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Bairro
            </label>
            <input
              type="text"
              value={form.bairro}
              onChange={e => setForm({...form, bairro: e.target.value})}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            />
          </div>

          {/* CEP */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              CEP
            </label>
            <input
              type="text"
              value={form.cep}
              onChange={e => setForm({...form, cep: e.target.value})}
              placeholder="00000-000"
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            />
          </div>

          {/* Cidade */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Cidade *
            </label>
            <input
              type="text"
              value={form.cidade}
              onChange={e => setForm({...form, cidade: e.target.value})}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
              required
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Estado *
            </label>
            <select
              value={form.estado}
              onChange={e => setForm({...form, estado: e.target.value})}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            >
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              <option value="RS">Rio Grande do Sul</option>
              {/* Adicione outros estados conforme necessário */}
            </select>
          </div>

          {/* Finalidade */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Finalidade
            </label>
            <select
              value={form.finalidade}
              onChange={e => setForm({...form, finalidade: e.target.value})}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            >
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
              <option value="ambos">Venda e Aluguel</option>
            </select>
          </div>

          {/* Proprietário */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Proprietário *
            </label>
            <select
              value={form.proprietarioId}
              onChange={e => setForm({...form, proprietarioId: e.target.value})}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
              required
            >
              <option value="">Selecione...</option>
              {proprietarios.map(p => (
                <option key={p.id} value={p.id}>{p.nome} - {p.email}</option>
              ))}
            </select>
          </div>

          {/* Preço Venda */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Preço de Venda (R$) *
            </label>
            <input
              type="text"
              value={form.preco}
              onChange={e => setForm({...form, preco: e.target.value})}
              placeholder="500000.00"
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
              required
            />
          </div>

          {/* Preço Aluguel */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Preço de Aluguel (R$)
            </label>
            <input
              type="text"
              value={form.precoAluguel}
              onChange={e => setForm({...form, precoAluguel: e.target.value})}
              placeholder="2500.00"
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            />
          </div>

          {/* Metragem */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Metragem (m²) *
            </label>
            <input
              type="number"
              value={form.metragem}
              onChange={e => setForm({...form, metragem: e.target.value})}
              placeholder="120.50"
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
              required
            />
          </div>

          {/* Quartos */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Quartos
            </label>
            <input
              type="number"
              value={form.quartos}
              onChange={e => setForm({...form, quartos: e.target.value})}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            />
          </div>

          {/* Suítes */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Suítes
            </label>
            <input
              type="number"
              value={form.suites}
              onChange={e => setForm({...form, suites: e.target.value})}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            />
          </div>

          {/* Banheiros */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Banheiros
            </label>
            <input
              type="number"
              value={form.banheiros}
              onChange={e => setForm({...form, banheiros: e.target.value})}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            />
          </div>

          {/* Vagas */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Vagas de Garagem
            </label>
            <input
              type="number"
              value={form.vagas}
              onChange={e => setForm({...form, vagas: e.target.value})}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Status
            </label>
            <select
              value={form.status}
              onChange={e => setForm({...form, status: e.target.value})}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            >
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="VENDIDO">Vendido</option>
              <option value="ALUGADO">Alugado</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="md:col-span-2 flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.disponivel}
                onChange={e => setForm({...form, disponivel: e.target.checked})}
                className="w-6 h-6"
              />
              <span className="font-black uppercase text-sm">Disponível</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.destaque}
                onChange={e => setForm({...form, destaque: e.target.checked})}
                className="w-6 h-6"
              />
              <span className="font-black uppercase text-sm">Destaque</span>
            </label>
          </div>

          {/* Descrição */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Descrição
            </label>
            <textarea
              value={form.descricao}
              onChange={e => setForm({...form, descricao: e.target.value})}
              rows={4}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
              placeholder="Descreva as características do imóvel..."
            />
          </div>
        </div>

        {/* Características */}
        <div className="mt-8">
          <label className="block mb-4 font-black uppercase tracking-widest text-xs text-slate-400">
            Características
          </label>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={novaCaracteristica}
              onChange={e => setNovaCaracteristica(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), adicionarCaracteristica())}
              placeholder="Ex: Piscina, Churrasqueira..."
              className="flex-1 bg-slate-50 p-4 border-4 border-slate-900 font-bold focus:outline-none"
            />
            <button
              onClick={adicionarCaracteristica}
              type="button"
              className="bg-blue-600 text-white px-6 font-black uppercase hover:bg-blue-700 transition-all"
            >
              + Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.caracteristicas.map((c: any, i: number) => (
              <span key={i} className="bg-blue-100 text-blue-600 px-4 py-2 font-bold text-sm flex items-center gap-2">
                {c}
                <button onClick={() => removerCaracteristica(i)} className="text-red-600 font-black">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Imagens */}
        <div className="mt-8">
          <label className="block mb-4 font-black uppercase tracking-widest text-xs text-slate-400">
            Imagens (URLs)
          </label>
          <div className="flex gap-4 mb-4">
            <input
              type="url"
              value={novaImagem}
              onChange={e => setNovaImagem(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), adicionarImagem())}
              placeholder="https://exemplo.com/imagem.jpg"
              className="flex-1 bg-slate-50 p-4 border-4 border-slate-900 font-bold focus:outline-none"
            />
            <button
              onClick={adicionarImagem}
              type="button"
              className="bg-green-600 text-white px-6 font-black uppercase hover:bg-green-700 transition-all"
            >
              + Adicionar
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {form.imagens.map((img: any, i: number) => (
              <div key={i} className="relative group">
                <img src={img} alt={`Imagem ${i + 1}`} className="w-full h-40 object-cover border-4 border-slate-900" />
                <button
                  onClick={() => removerImagem(i)}
                  className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 font-black opacity-0 group-hover:opacity-100 transition-all"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTÕES */}
      <div className="flex gap-6">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 bg-orange-600 text-white p-6 font-black text-2xl uppercase italic tracking-tighter shadow-lg shadow-slate-900 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:bg-slate-300 disabled:shadow-none"
        >
          {saving ? '💾 SALVANDO...' : '✅ SALVAR ALTERAÇÕES'}
        </button>
        <Link
          href="/admin/imoveis"
          className="bg-white border-4 border-slate-900 text-slate-900 px-12 py-6 font-black text-xl uppercase italic tracking-tighter hover:bg-slate-100 transition-all flex items-center"
        >
          ❌ CANCELAR
        </Link>
      </div>
    </div>
  )
}
