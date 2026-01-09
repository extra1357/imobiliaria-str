'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NovoCorretorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    creci: '',
    banco: '',
    agencia: '',
    conta: '',
    tipoConta: 'corrente',
    pix: '',
    comissaoPadrao: '50',
    observacoes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/corretores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          comissaoPadrao: parseFloat(form.comissaoPadrao)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar corretor');
      }

      router.push('/admin/corretores');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Novo Corretor</h1>
            <p className="text-gray-600">Cadastre um novo corretor na equipe</p>
          </div>
          <Link
            href="/admin/corretores"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Voltar
          </Link>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Dados Pessoais */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do corretor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CRECI *
              </label>
              <input
                type="text"
                name="creci"
                value={form.creci}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 123456-F"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comissão Padrão (%)
              </label>
              <input
                type="number"
                name="comissaoPadrao"
                value={form.comissaoPadrao}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Percentual da comissão da imobiliária que vai para o corretor
              </p>
            </div>
          </div>

          {/* Dados Bancários */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados Bancários</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banco
              </label>
              <input
                type="text"
                name="banco"
                value={form.banco}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Banco do Brasil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agência
              </label>
              <input
                type="text"
                name="agencia"
                value={form.agencia}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conta
              </label>
              <input
                type="text"
                name="conta"
                value={form.conta}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="00000-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Conta
              </label>
              <select
                name="tipoConta"
                value={form.tipoConta}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="corrente">Conta Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave PIX
              </label>
              <input
                type="text"
                name="pix"
                value={form.pix}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="CPF, email, telefone ou chave aleatória"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Informações adicionais sobre o corretor"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/corretores"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Cadastrar Corretor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
