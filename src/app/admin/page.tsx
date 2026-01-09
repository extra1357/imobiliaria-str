'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ imoveis: 0, leads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/teste-conexao');
        const data = await res.json();
        if (data.status === "CONECTADO") {
          setStats(prev => ({ ...prev, imoveis: data.estatisticas.total_imoveis_cadastrados }));
        }
      } catch (e) { 
        console.error("Erro ao carregar estatísticas"); 
      } finally { 
        setLoading(false); 
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] font-sans antialiased text-slate-900">
      {/* SIDEBAR STR GENETICS */}
      <aside className="w-[280px] bg-slate-900 text-white min-h-screen fixed flex flex-col border-r-[6px] border-blue-600">
        <div className="p-8 border-b border-slate-800">
          <h2 className="text-2xl font-black tracking-tighter italic uppercase text-blue-500 leading-none">
            STR <br /> <span className="text-white">MANAGER</span>
          </h2>
          <p className="text-[9px] font-black tracking-[0.3em] uppercase mt-2 text-slate-500">v2.0 Production</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {/* Seção Principal */}
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-4">Principal</p>
          <Link href="/admin" className="block p-4 font-black uppercase italic tracking-widest text-sm bg-blue-600 shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)]">
            📊 Painel Geral
          </Link>
          <Link href="/admin/dashboard" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-blue-600 transition-all">
            📈 Dashboard
          </Link>

          {/* Seção Cadastros */}
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-6">Cadastros</p>
          <Link href="/admin/imoveis" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-blue-600 transition-all">
            🏠 Imóveis
          </Link>
          <Link href="/admin/proprietarios" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-blue-600 transition-all">
            👤 Proprietários
          </Link>
          <Link href="/admin/corretores" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-green-500 transition-all">
            👥 Corretores
          </Link>
          <Link href="/admin/leads" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-blue-600 transition-all">
            📋 Leads
          </Link>

          {/* Seção Negócios */}
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-6">Negócios</p>
          <Link href="/admin/vendas" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-green-500 transition-all">
            💰 Vendas
          </Link>
          <Link href="/admin/alugueis" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-orange-500 transition-all">
            🏘️ Aluguéis
          </Link>
          <Link href="/admin/comissoes" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-yellow-500 transition-all">
            💵 Comissões
          </Link>
          <Link href="/admin/consultas" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-blue-600 transition-all">
            📅 Consultas
          </Link>

          {/* Seção Relatórios */}
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-6">Relatórios</p>
          <Link href="/admin/analise-mercado" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-purple-500 transition-all">
            📊 Análise Mercado
          </Link>
          <Link href="/admin/leads/relatorio" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-blue-600 transition-all">
            📈 Relatório Leads
          </Link>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
            ← Ver Site Público
          </Link>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="ml-[280px] flex-1 p-12">
        <header className="flex justify-between items-start mb-16 border-l-[12px] border-blue-600 pl-8">
          <div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900">
              Painel de <br />
              <span className="text-blue-600">Controle</span>
            </h1>
            <p className="font-black text-slate-500 text-xs tracking-[0.3em] uppercase mt-4 italic">
              Gestão IMOBILIÁRIA PERTO — Database: PostgreSQL
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/admin/corretores/novo" 
              className="bg-green-600 text-white px-6 py-4 font-black rounded-sm hover:bg-green-700 transition-all shadow-[6px_6px_0px_0px_rgba(22,163,74,0.5)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 uppercase italic tracking-tighter text-sm"
            >
              + Corretor
            </Link>
            <Link 
              href="/admin/imoveis/novo" 
              className="bg-slate-900 text-white px-6 py-4 font-black rounded-sm hover:bg-blue-600 transition-all shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 uppercase italic tracking-tighter text-sm"
            >
              + Imóvel
            </Link>
          </div>
        </header>

        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Imóveis */}
          <div className="bg-white border-[3px] border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.08)] group hover:shadow-none transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Imóveis</span>
            <div className="text-5xl font-black text-slate-900 mt-3 italic tracking-tighter group-hover:text-blue-600 transition-colors">
              {loading ? '...' : stats.imoveis}
            </div>
            <Link href="/admin/imoveis" className="text-[9px] font-bold text-blue-600 uppercase mt-2 block hover:underline">
              Ver todos →
            </Link>
          </div>
          
          {/* Leads */}
          <div className="bg-white border-[3px] border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(37,99,235,0.1)] group hover:shadow-none transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Leads</span>
            <div className="text-5xl font-black text-blue-600 mt-3 italic tracking-tighter">
              0
            </div>
            <Link href="/admin/leads" className="text-[9px] font-bold text-blue-600 uppercase mt-2 block hover:underline">
              Ver todos →
            </Link>
          </div>

          {/* Vendas */}
          <div className="bg-white border-[3px] border-green-600 p-6 shadow-[8px_8px_0px_0px_rgba(22,163,74,0.15)] group hover:shadow-none transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Vendas</span>
            <div className="text-5xl font-black text-green-600 mt-3 italic tracking-tighter">
              0
            </div>
            <Link href="/admin/vendas" className="text-[9px] font-bold text-green-600 uppercase mt-2 block hover:underline">
              Ver todas →
            </Link>
          </div>

          {/* Aluguéis */}
          <div className="bg-white border-[3px] border-orange-500 p-6 shadow-[8px_8px_0px_0px_rgba(249,115,22,0.15)] group hover:shadow-none transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Aluguéis Ativos</span>
            <div className="text-5xl font-black text-orange-500 mt-3 italic tracking-tighter">
              0
            </div>
            <Link href="/admin/alugueis" className="text-[9px] font-bold text-orange-500 uppercase mt-2 block hover:underline">
              Ver todos →
            </Link>
          </div>
        </div>

        {/* AÇÕES RÁPIDAS */}
        <section className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-black uppercase italic tracking-tighter text-xl">Ações Rápidas</h3>
            <div className="flex-1 h-[3px] bg-slate-200"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/proprietarios/novo" className="bg-white border-2 border-slate-200 p-6 text-center hover:border-blue-600 hover:bg-blue-50 transition-all rounded-lg">
              <span className="text-3xl">👤</span>
              <p className="font-bold text-sm mt-2 text-slate-700">Novo Proprietário</p>
            </Link>
            <Link href="/admin/leads/novo" className="bg-white border-2 border-slate-200 p-6 text-center hover:border-blue-600 hover:bg-blue-50 transition-all rounded-lg">
              <span className="text-3xl">📋</span>
              <p className="font-bold text-sm mt-2 text-slate-700">Novo Lead</p>
            </Link>
            <Link href="/admin/vendas/nova" className="bg-white border-2 border-slate-200 p-6 text-center hover:border-green-600 hover:bg-green-50 transition-all rounded-lg">
              <span className="text-3xl">💰</span>
              <p className="font-bold text-sm mt-2 text-slate-700">Nova Venda</p>
            </Link>
            <Link href="/admin/alugueis/novo" className="bg-white border-2 border-slate-200 p-6 text-center hover:border-orange-500 hover:bg-orange-50 transition-all rounded-lg">
              <span className="text-3xl">🏘️</span>
              <p className="font-bold text-sm mt-2 text-slate-700">Novo Contrato</p>
            </Link>
          </div>
        </section>

        {/* COMISSÕES PENDENTES */}
        <section className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-black uppercase italic tracking-tighter text-xl">💵 Comissões</h3>
            <div className="flex-1 h-[3px] bg-slate-200"></div>
            <Link href="/admin/comissoes" className="text-sm font-bold text-blue-600 hover:underline">
              Ver todas →
            </Link>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-50 border-2 border-yellow-400 p-6 rounded-lg">
              <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Pendentes</p>
              <p className="text-3xl font-black text-yellow-600 mt-2">R$ 0,00</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-400 p-6 rounded-lg">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Aprovadas</p>
              <p className="text-3xl font-black text-blue-600 mt-2">R$ 0,00</p>
            </div>
            <div className="bg-green-50 border-2 border-green-400 p-6 rounded-lg">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Pagas (Mês)</p>
              <p className="text-3xl font-black text-green-600 mt-2">R$ 0,00</p>
            </div>
          </div>
        </section>

        {/* System Status */}
        <section className="mt-12">
          <div className="bg-slate-900 p-8 border-[3px] border-slate-900 shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Status do Sistema</span>
                <div className="text-3xl font-black text-white mt-2 italic tracking-tighter uppercase">
                  Online
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">PostgreSQL Conectado</span>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER TÉCNICO */}
        <footer className="mt-16 py-6 border-t-[3px] border-slate-200 flex justify-between">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">STR_GENETICS_SYSTEM_MODULE_LOADED</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">2026 © PROD_ENVIRONMENT</span>
        </footer>
      </main>
    </div>
  );
}
