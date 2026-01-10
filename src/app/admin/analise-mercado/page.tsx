'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Analise {
  id: string
  cidade: string
  estado: string
  valorM2: number
  valorMinimo?: number
  valorMaximo?: number
  tendencia: 'alta' | 'baixa' | 'estavel' | string
  fonte?: string
  observacoes?: string
  dataAnalise: string
}

export default function AnaliseMercado() {
  const [analises, setAnalises] = useState<Analise[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/admin/analise-mercado')
      .then(r => {
        if (!r.ok) throw new Error('STR_GENETICS_PROTOCOL_CRITICAL_FAILURE')
        return r.json()
      })
      .then(d => {
        setAnalises(d.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error("Critical Render Error:", err)
        setError('POSTGRESQL_OFFLINE_OR_UNREACHABLE')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-blue-500 font-black tracking-[0.7em] uppercase italic animate-pulse">Initializing STR Genetics Core</p>
        </div>
      </div>
    )
  }

  const ultimaAnalise = analises.length > 0 ? analises[0] : null

  return (
    <div className="p-10 bg-[#f1f5f9] min-h-screen font-sans antialiased text-slate-900">
      {/* Header Estratégico STR */}
      <div className="flex justify-between items-start mb-16 border-l-[12px] border-blue-600 pl-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.8]">
            Intelligence <br />
            <span className="text-blue-600">Market</span>
          </h1>
          <p className="font-black text-slate-500 text-sm tracking-[0.3em] uppercase mt-4">
            Production Environment / Genetic Analysis v1.0
          </p>
        </div>
        <Link 
          href="/admin/analise-mercado/nova" 
          className="bg-slate-900 text-white px-12 py-5 font-black rounded-sm hover:bg-blue-600 transition-all shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 uppercase italic tracking-tighter text-xl"
        >
          + Execute New Analysis
        </Link>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-8 mb-12 font-black uppercase tracking-[0.2em] text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] animate-pulse border-4 border-white">
          SYSTEM_CRITICAL_ERROR: {error}
        </div>
      )}

      {/* Feature Section - STR Genetics High Performance Design */}
      {ultimaAnalise && (
        <section className="bg-white border-[3px] border-slate-900 mb-16 shadow-[20px_20px_0px_0px_rgba(15,23,42,0.08)] overflow-hidden relative">
          <div className="bg-slate-900 text-white px-10 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 animate-ping rounded-full"></div>
              <span className="font-black tracking-[0.4em] text-xs uppercase italic">Live Genetic Insight</span>
            </div>
            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">PostgreSQL UUID: {ultimaAnalise.id}</span>
          </div>

          <div className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-12">
              <div className="flex flex-col justify-center">
                <span className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-3 block">Target Location</span>
                <h2 className="text-7xl font-black text-slate-900 uppercase italic leading-none truncate">
                  {ultimaAnalise.cidade}
                </h2>
                <p className="text-2xl font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">{ultimaAnalise.estado}</p>
              </div>

              <div className="bg-slate-50 p-10 border-x-[3px] border-slate-100 flex flex-col justify-center relative">
                <div className="absolute top-4 right-4 text-slate-200 font-black text-4xl opacity-50 italic uppercase leading-none">M²</div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-3 block">Market Value</span>
                <p className="text-6xl font-black text-green-600 tracking-tighter">
                  R$ {ultimaAnalise.valorM2?.toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="flex flex-col justify-center lg:items-end lg:text-right">
                <span className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-3 block">AI Trend Projection</span>
                <div className={`text-6xl font-black italic tracking-tighter ${
                  ultimaAnalise.tendencia === 'alta' ? 'text-green-600' : 
                  ultimaAnalise.tendencia === 'baixa' ? 'text-red-600' : 'text-amber-500'
                }`}>
                  {ultimaAnalise.tendencia === 'alta' ? '↑ UPWARD' : 
                   ultimaAnalise.tendencia === 'baixa' ? '↓ DOWNWARD' : '→ STABLE'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 border-t-[3px] border-slate-50">
              {ultimaAnalise.valorMinimo && ultimaAnalise.valorMaximo && (
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.5em]">Range Analysis Bracket</span>
                  <div className="flex items-center gap-6 text-3xl font-black text-slate-800 italic bg-slate-50 p-4 border-l-8 border-slate-200">
                    <span className="text-slate-400">MIN</span>
                    <span>R$ {ultimaAnalise.valorMinimo.toLocaleString('pt-BR')}</span>
                    <div className="h-1 w-16 bg-blue-600"></div>
                    <span className="text-slate-400">MAX</span>
                    <span>R$ {ultimaAnalise.valorMaximo.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              )}

              {ultimaAnalise.observacoes && (
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-sm relative shadow-xl">
                  <span className="absolute -top-4 left-10 bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">IA STRATEGIC RECOMMENDATION</span>
                  <p className="text-white text-xl font-bold italic leading-relaxed">
                    "{ultimaAnalise.observacoes}"
                  </p>
                  <div className="mt-4 flex justify-end">
                    <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest opacity-60">STR Genetics Core Intelligence</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Archive Grid - STR Pattern */}
      <div className="flex items-center gap-6 mb-10">
        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Historical Log</h3>
        <div className="h-1 flex-1 bg-slate-900 opacity-10"></div>
      </div>

      <div className="grid gap-6">
        {analises.length === 0 ? (
          <div className="p-32 border-[6px] border-dashed border-slate-200 text-center font-black text-slate-300 uppercase tracking-[1em] bg-white">
            PG_DATABASE_EMPTY_SYNC_REQUIRED
          </div>
        ) : (
          analises.map((a: any, index: number) => (
            <div key={a.id} className="bg-white border-[3px] border-slate-900 p-8 flex flex-col md:flex-row justify-between items-center hover:bg-slate-900 hover:text-white transition-all group cursor-crosshair">
              <div className="flex items-center gap-12">
                <span className="font-black text-5xl italic text-slate-100 group-hover:text-slate-800 transition-colors select-none italic">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <div>
                  <h4 className="font-black text-2xl uppercase tracking-tighter leading-none group-hover:translate-x-2 transition-transform">{a.cidade} / {a.estado}</h4>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-blue-500 transition-colors mt-2">Verified Source: {a.fonte || 'GENETICS_CORE_UNSPECIFIED'}</p>
                </div>
              </div>

              <div className="flex items-center gap-16 mt-8 md:mt-0">
                <div className="text-right">
                  <p className="text-3xl font-black tracking-tighter group-hover:text-green-400 transition-colors">R$ {a.valorM2?.toLocaleString('pt-BR')}</p>
                  <p className="text-xs font-black uppercase opacity-40 tracking-widest mt-1">
                    Entry: {new Date(a.dataAnalise).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className={`w-40 py-3 text-center text-xs font-black uppercase tracking-[0.2em] border-[3px] transition-all ${
                  a.tendencia === 'alta' ? 'border-green-500 text-green-600 group-hover:bg-green-500 group-hover:text-white' : 
                  a.tendencia === 'baixa' ? 'border-red-500 text-red-600 group-hover:bg-red-500 group-hover:text-white' : 
                  'border-amber-500 text-amber-500 group-hover:bg-amber-500 group-hover:text-white'
                }`}>
                  {a.tendencia}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="mt-24 py-12 border-t-[6px] border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <Link href="/admin/analise-mercado/relatorios" className="group text-lg font-black uppercase tracking-[0.6em] hover:text-blue-600 transition-all">
          <span className="group-hover:mr-4 transition-all">→</span> ACCESS ADVANCED ANALYTICS REPORTS
        </Link>
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Genetic Analysis Kernel</span>
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">v14.2.33_POSTGRES_NODE_PROD</span>
        </div>
      </footer>
    </div>
  )
}
