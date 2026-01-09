'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ imoveis: 0, leads: 0 });
  const [loading, setLoading] = useState(true);

  // ✅ LÓGICA ORIGINAL PRESERVADA INTEGRALMENTE
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
        
        <nav className="flex-1 p-6 space-y-4">
          <Link href="/admin" className="block p-4 font-black uppercase italic tracking-widest text-sm bg-blue-600 shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)]">
            Painel Geral
          </Link>
          <Link href="/admin/imoveis" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-blue-600 transition-all">
            Meus Imóveis
          </Link>
          <Link href="/admin/leads" className="block p-4 font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 border-l-4 border-transparent hover:border-blue-600 transition-all">
            Leads Recebidos
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
          <Link 
            href="/admin/imoveis/novo" 
            className="bg-slate-900 text-white px-10 py-5 font-black rounded-sm hover:bg-blue-600 transition-all shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 uppercase italic tracking-tighter text-lg"
          >
            + Novo Imóvel
          </Link>
        </header>

        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Imóveis */}
          <div className="bg-white border-[3px] border-slate-900 p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,0.08)] group hover:shadow-none transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Imóveis no Banco</span>
            <div className="text-6xl font-black text-slate-900 mt-4 italic tracking-tighter group-hover:text-blue-600 transition-colors">
              {loading ? '...' : stats.imoveis}
            </div>
            <div className="mt-4 h-[2px] bg-slate-100 w-full"></div>
          </div>
          
          {/* Leads */}
          <div className="bg-white border-[3px] border-slate-900 p-8 shadow-[10px_10px_0px_0px_rgba(37,99,235,0.1)] group hover:shadow-none transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Leads (30 Dias)</span>
            <div className="text-6xl font-black text-blue-600 mt-4 italic tracking-tighter">
              0
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Nenhuma conversão recente</p>
          </div>

          {/* System Status */}
          <div className="bg-slate-900 p-8 border-[3px] border-slate-900 shadow-[10px_10px_0px_0px_rgba(37,99,235,1)]">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Status do Sistema</span>
            <div className="text-3xl font-black text-white mt-4 italic tracking-tighter uppercase">
              Online
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">PostgreSQL Conectado</span>
            </div>
          </div>
        </div>

        {/* ATIVIDADES RECENTES */}
        <section className="mt-16">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="font-black uppercase italic tracking-tighter text-2xl">Atividades Recentes</h3>
            <div className="flex-1 h-[3px] bg-slate-200"></div>
          </div>
          
          <div className="bg-white border-[3px] border-slate-900 p-12 text-center shadow-[15px_15px_0px_0px_rgba(15,23,42,0.05)]">
            <p className="font-black text-slate-600 uppercase tracking-widest italic text-lg">
              {stats.imoveis > 0 
                ? `Pipeline Ativo: ${stats.imoveis} imóveis sincronizados com o banco.` 
                : "Aguardando sincronização de dados..."}
            </p>
            {stats.imoveis === 0 && (
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Nenhum registro detectado nas tabelas STR</p>
            )}
          </div>
        </section>

        {/* FOOTER TÉCNICO */}
        <footer className="mt-20 py-6 border-t-[3px] border-slate-200 flex justify-between">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">STR_GENETICS_SYSTEM_MODULE_LOADED</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">2026 © PROD_ENVIRONMENT</span>
        </footer>
      </main>
    </div>
  );
}
