'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Corretor {
  id: string
  nome: string
  email: string
  telefone: string
  creci: string
  ativo: boolean
  comissaoPadrao: string
  _count?: {
    vendas: number
    comissoes: number
    leads: number
    alugueis: number
  }
}

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  useEffect(() => {
    fetchCorretores()
  }, [])

  const fetchCorretores = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/corretores')
      const data = await res.json()
      
      if (data.success && data.data) {
        setCorretores(data.data)
      } else {
        console.error('Erro ao carregar corretores:', data.error)
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const corretoresFiltrados = corretores.filter(corretor => {
    const matchStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativo' && corretor.ativo) ||
      (filtroStatus === 'inativo' && !corretor.ativo)
    
    const matchBusca = busca === '' ||
      corretor.nome.toLowerCase().includes(busca.toLowerCase()) ||
      corretor.email.toLowerCase().includes(busca.toLowerCase()) ||
      corretor.creci.toLowerCase().includes(busca.toLowerCase())
    
    return matchStatus && matchBusca
  })

  const calcularStats = () => {
    return {
      total: corretores.length,
      ativos: corretores.filter(c => c.ativo).length,
      vendas: corretores.reduce((acc, c) => acc + (c._count?.vendas || 0), 0),
      comissoes: corretores.reduce((acc, c) => acc + (c._count?.comissoes || 0), 0)
    }
  }

  const stats = calcularStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-pulse">👨‍💼</div>
          <p className="text-2xl font-black text-white uppercase tracking-widest">
            Carregando corretores...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12">
      {/* HEADER */}
      <div className="mb-12 bg-gradient-to-r from-blue-400 to-purple-500 p-1">
        <div className="bg-black p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter">
                CORRETORES
              </h1>
              <p className="text-blue-400 font-black text-lg uppercase tracking-widest mt-2">
                Gerenciamento da equipe
              </p>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/admin"
                className="bg-gray-700 text-white px-8 py-4 font-black uppercase hover:bg-gray-600 transition-all text-xl"
              >
                ← VOLTAR
              </Link>
              <Link 
                href="/admin/corretores/novo"
                className="bg-blue-400 text-black px-8 py-4 font-black uppercase hover:bg-blue-300 transition-all text-xl"
              >
                + NOVO CORRETOR
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <StatCard 
          label="TOTAL"
          value={stats.total.toString()}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard 
          label="ATIVOS"
          value={stats.ativos.toString()}
          color="from-green-500 to-emerald-500"
        />
        <StatCard 
          label="VENDAS"
          value={stats.vendas.toString()}
          color="from-purple-500 to-pink-500"
        />
        <StatCard 
          label="COMISSÕES"
          value={stats.comissoes.toString()}
          color="from-yellow-500 to-orange-500"
        />
      </div>

      {/* FILTROS */}
      <div className="bg-white text-black p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-black text-xs uppercase mb-2">
              🔍 Buscar
            </label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome, e-mail ou CRECI..."
              className="w-full border-4 border-black p-3 font-bold"
            />
          </div>

          <div>
            <label className="block font-black text-xs uppercase mb-2">
              📊 Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full border-4 border-black p-3 font-bold"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTA DE CORRETORES */}
      <div className="bg-white text-black">
        {corretoresFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-6">👨‍💼</div>
            <p className="text-3xl font-black">
              {busca || filtroStatus !== 'todos' 
                ? 'Nenhum corretor encontrado com os filtros aplicados' 
                : 'Nenhum corretor cadastrado'
              }
            </p>
            {(busca || filtroStatus !== 'todos') && (
              <button
                onClick={() => {
                  setBusca('')
                  setFiltroStatus('todos')
                }}
                className="mt-6 bg-black text-white px-6 py-3 font-black uppercase"
              >
                Limpar Filtros
              </button>
            )}
            {!busca && filtroStatus === 'todos' && (
              <Link
                href="/admin/corretores/novo"
                className="mt-6 inline-block bg-blue-500 text-white px-8 py-4 font-black uppercase"
              >
                + Cadastrar Primeiro Corretor
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-black uppercase text-xs tracking-widest">
                    CORRETOR
                  </th>
                  <th className="px-6 py-4 text-left font-black uppercase text-xs tracking-widest">
                    CRECI
                  </th>
                  <th className="px-6 py-4 text-left font-black uppercase text-xs tracking-widest">
                    CONTATO
                  </th>
                  <th className="px-6 py-4 text-left font-black uppercase text-xs tracking-widest">
                    COMISSÃO
                  </th>
                  <th className="px-6 py-4 text-left font-black uppercase text-xs tracking-widest">
                    PERFORMANCE
                  </th>
                  <th className="px-6 py-4 text-left font-black uppercase text-xs tracking-widest">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left font-black uppercase text-xs tracking-widest">
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-black">
                {corretoresFiltrados.map((corretor) => (
                  <CorretorRow key={corretor.id} corretor={corretor} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// COMPONENTE DE CARD ESTATÍSTICO
function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} p-1`}>
      <div className="bg-black p-6 h-full">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
          {label}
        </p>
        <p className="text-4xl font-black text-white">
          {value}
        </p>
      </div>
    </div>
  )
}

// COMPONENTE DE LINHA DA TABELA
function CorretorRow({ corretor }: { corretor: Corretor }) {
  const formatPhone = (phone: string) => {
    return phone?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') || phone
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
            <span className="text-white font-black text-xl">
              {corretor.nome?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-black text-lg">{corretor.nome}</p>
            <p className="text-sm text-gray-500">{corretor.email}</p>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <span className="font-black text-blue-600">{corretor.creci}</span>
      </td>
      
      <td className="px-6 py-4">
        <span className="font-bold">{formatPhone(corretor.telefone)}</span>
      </td>
      
      <td className="px-6 py-4">
        <span className="font-black text-green-600">
          {parseFloat(corretor.comissaoPadrao || '0')}%
        </span>
      </td>
      
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-500">VENDAS:</span>
            <span className="font-black text-purple-600">{corretor._count?.vendas || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-500">COMISSÕES:</span>
            <span className="font-black text-green-600">{corretor._count?.comissoes || 0}</span>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <span className={`px-4 py-2 font-black text-xs uppercase ${
          corretor.ativo 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {corretor.ativo ? '✓ ATIVO' : '✗ INATIVO'}
        </span>
      </td>
      
      <td className="px-6 py-4">
        <Link
          href={`/admin/corretores/${corretor.id}`}
          className="bg-black text-white px-4 py-2 font-black uppercase text-xs hover:bg-gray-800 transition-all inline-block"
        >
          VER DETALHES →
        </Link>
      </td>
    </tr>
  )
}
