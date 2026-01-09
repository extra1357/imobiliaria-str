'use client'
import { useEffect, useState } from 'react'
import Container from '@/components/ui/Container'
import Link from 'next/link'

export default function ListaConsultas() {
  const [consultas, setConsultas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/consultas')
      .then((res: any) => res.json())
      .then((data: any) => {
        setConsultas(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <Container 
      title="📋 Lista de Leads (Consultas)" 
      subtitle="Gerencie todos os interessados em um só lugar"
      action={
        <div className="flex gap-3">
          {/* ✅ LINK PARA O FUNIL QUE ACABAMOS DE CRIAR */}
          <Link 
            href="/admin/consultas/funil" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md"
          >
            🎯 Ver Funil (Kanban)
          </Link>
          <Link 
            href="/admin/consultas/nova" 
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-all"
          >
            + Nova Consulta
          </Link>
        </div>
      }
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Lead/Cliente</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Imóvel</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {consultas.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{c.lead?.nome}</div>
                  <div className="text-xs text-gray-500">{c.lead?.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">
                    {/* ✅ Mostrando o Endereço conforme combinamos (sem título) */}
                    📍 {c.imovel?.endereco || 'Interesse Geral'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700">
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(c.data).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {consultas.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-400 font-medium">
            Nenhuma consulta encontrada.
          </div>
        )}
      </div>
    </Container>
  )
}
