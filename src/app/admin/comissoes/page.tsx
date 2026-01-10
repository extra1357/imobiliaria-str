'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ComissoesPage() {
  const [data, setData] = useState<any>({ comissoes: [], totais: { pendente: 0, aprovada: 0, paga: 0 } });
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');

  useEffect(() => {
    const url = filtroStatus ? `/api/comissoes?status=${filtroStatus}` : '/api/comissoes';
    fetch(url)
      .then((res: any) => res.json())
      .then((result: any) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filtroStatus]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return date ? new Date(date).toLocaleDateString('pt-BR') : '-';
  };

  const statusColors: Record<string, string> = {
    pendente: 'bg-yellow-100 text-yellow-800',
    aprovada: 'bg-blue-100 text-blue-800',
    paga: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800'
  };

  const handleStatusChange = async (id: string, novoStatus: string) => {
    try {
      const response = await fetch('/api/comissoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: novoStatus })
      });

      if (response.ok) {
        // Recarrega os dados
        const url = filtroStatus ? `/api/comissoes?status=${filtroStatus}` : '/api/comissoes';
        const result = await fetch(url).then(r => r.json());
        setData(result);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Comissões</h1>
            <p className="text-gray-600">Controle de comissões dos corretores</p>
          </div>
          <Link
            href="/admin"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Voltar
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(data.totais.pendente)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Aprovadas (a pagar)</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.totais.aprovada)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Pagas</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totais.paga)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4 items-center">
            <span className="text-gray-600">Filtrar por status:</span>
            <select
              value={filtroStatus}
              onChange={(e: any) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovada">Aprovadas</option>
              <option value="paga">Pagas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Corretor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referência</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Base</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.comissoes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma comissão encontrada.
                  </td>
                </tr>
              ) : (
                data.comissoes.map((comissao: any) => (
                  <tr key={comissao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{comissao.corretor?.nome}</p>
                      <p className="text-sm text-gray-500">{comissao.corretor?.creci}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        comissao.tipo === 'VENDA' ? 'bg-green-100 text-green-800' :
                        comissao.tipo === 'ALUGUEL' ? 'bg-orange-100 text-orange-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {comissao.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {comissao.venda?.imovel?.endereco || 
                       comissao.aluguel?.imovel?.endereco || 
                       'Bônus/Outros'}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {formatCurrency(Number(comissao.valorBase))}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {Number(comissao.percentual)}%
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      {formatCurrency(Number(comissao.valorComissao))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[comissao.status]}`}>
                        {comissao.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {comissao.status === 'pendente' && (
                        <button
                          onClick={() => handleStatusChange(comissao.id, 'aprovada')}
                          className="text-blue-600 hover:underline text-sm mr-2"
                        >
                          Aprovar
                        </button>
                      )}
                      {comissao.status === 'aprovada' && (
                        <button
                          onClick={() => handleStatusChange(comissao.id, 'paga')}
                          className="text-green-600 hover:underline text-sm"
                        >
                          Marcar Paga
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
