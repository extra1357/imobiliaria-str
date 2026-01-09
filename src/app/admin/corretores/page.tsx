'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/corretores')
      .then(res => res.json())
      .then((data: any) => {
        setCorretores(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatPhone = (phone: string) => {
    return phone?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') || phone;
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
            <h1 className="text-3xl font-bold text-gray-800">Corretores</h1>
            <p className="text-gray-600">Gerencie sua equipe de corretores</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              ← Voltar
            </Link>
            <Link
              href="/admin/corretores/novo"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              + Novo Corretor
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total de Corretores</p>
            <p className="text-3xl font-bold text-blue-600">{corretores.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Ativos</p>
            <p className="text-3xl font-bold text-green-600">
              {corretores.filter(c => c.ativo).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Vendas Realizadas</p>
            <p className="text-3xl font-bold text-purple-600">
              {corretores.reduce((acc, c) => acc + (c._count?.vendas || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Aluguéis Ativos</p>
            <p className="text-3xl font-bold text-orange-600">
              {corretores.reduce((acc, c) => acc + (c._count?.alugueis || 0), 0)}
            </p>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Corretor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CRECI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {corretores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum corretor cadastrado ainda.
                    <Link href="/admin/corretores/novo" className="text-blue-600 hover:underline ml-2">
                      Cadastrar primeiro corretor
                    </Link>
                  </td>
                </tr>
              ) : (
                corretores.map((corretor) => (
                  <tr key={corretor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">
                            {corretor.nome?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{corretor.nome}</p>
                          <p className="text-sm text-gray-500">{corretor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-mono">{corretor.creci}</td>
                    <td className="px-6 py-4 text-gray-600">{formatPhone(corretor.telefone)}</td>
                    <td className="px-6 py-4 text-gray-900">{Number(corretor.comissaoPadrao)}%</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">{corretor._count?.vendas || 0} vendas</span>
                        <span className="text-blue-600">{corretor._count?.alugueis || 0} aluguéis</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        corretor.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {corretor.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/corretores/${corretor.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver detalhes
                      </Link>
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
