'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NovaAnalise() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [resultado, setResultado] = useState<any>(null)
  const [form, setForm] = useState<any>({
    cidade: '',
    estado: 'SP'
  })

  const gerarAnalise = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const resImoveis = await fetch(`/api/imoveis?cidade=${form.cidade}`)
      const dataImoveis = await resImoveis.json()
      const imoveis = dataImoveis.data || []

      if (imoveis.length === 0) {
        alert('CRITICAL_EMPTY_RESULT: Nenhum imóvel encontrado para esta cidade')
        setLoading(false)
        return
      }

      const valorM2Medio = imoveis.reduce((acc: number, i: any) => 
        acc + (i.preco / i.metragem), 0) / imoveis.length

      const valores = imoveis.map((i: any) => i.preco / i.metragem).sort((a: number, b: number) => a - b)
      const valorMinimo = valores[0]
      const valorMaximo = valores[valores.length - 1]

      const mediaRecente = valores.slice(-3).reduce((a: number, b: number) => a + b, 0) / 3
      const mediaAntiga = valores.slice(0, 3).reduce((a: number, b: number) => a + b, 0) / 3
      
      let tendencia = 'estavel'
      let observacoes = ''

      if (mediaRecente > mediaAntiga * 1.1) {
        tendencia = 'alta'
        observacoes = `🤖 IA detectou crescimento de ${((mediaRecente/mediaAntiga - 1) * 100).toFixed(1)}% no valor/m². Mercado aquecido! Momento ideal para vendas.`
      } else if (mediaRecente < mediaAntiga * 0.9) {
        tendencia = 'baixa'
        observacoes = `🤖 IA detectou queda de ${((1 - mediaRecente/mediaAntiga) * 100).toFixed(1)}% no valor/m². Oportunidade para compradores.`
      } else {
        observacoes = `🤖 IA indica mercado estável. Variação inferior a 10%. Momento neutro para negociações.`
      }

      const analise = {
        cidade: form.cidade,
        estado: form.estado,
        valorM2: Math.round(valorM2Medio),
        valorMinimo: Math.round(valorMinimo),
        valorMaximo: Math.round(valorMaximo),
        fonte: 'IA Sistema STR',
        tendencia,
        observacoes
      }

      const res = await fetch('/api/analise-mercado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analise)
      })

      if (res.ok) {
        setResultado(analise)
      }
    } catch (error: any) {
      console.error(' [STR GENETICS ERROR]:', error)
      alert('PROTOCOL_FAILURE: Erro ao gerar análise')
    }

    setLoading(false)
  }

  // TELA DE SUCESSO / RESULTADO
  if (resultado) {
    return (
      <div className="p-10 bg-[#f1f5f9] min-h-screen font-sans">
        <div className="mb-12 border-l-[12px] border-green-500 pl-8">
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900">
            Analysis <br />
            <span className="text-green-600">Generated</span>
          </h1>
          <p className="font-black text-slate-500 text-sm tracking-[0.3em] uppercase mt-4">
            PostgreSQL Write Success / Logic Processed
          </p>
        </div>

        <section className="bg-white border-[3px] border-slate-900 mb-12 shadow-[20px_20px_0px_0px_rgba(15,23,42,0.08)]">
          <div className="bg-slate-900 text-white px-10 py-4 flex justify-between items-center">
            <span className="font-black tracking-[0.4em] text-xs uppercase italic text-blue-400">Analysis Result Node</span>
            <span className="text-xl">{resultado.tendencia === 'alta' ? '📈' : resultado.tendencia === 'baixa' ? '📉' : '➡️'}</span>
          </div>

          <div className="p-12">
            <h2 className="text-6xl font-black text-slate-900 uppercase italic mb-10 tracking-tighter">
              {resultado.cidade}/{resultado.estado}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
              <div className="bg-slate-50 border-[3px] border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">AVG m²</span>
                <p className="text-4xl font-black text-blue-600">R$ {resultado.valorM2.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-slate-50 border-[3px] border-slate-900 p-8">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">MIN m²</span>
                <p className="text-4xl font-black text-green-600">R$ {resultado.valorMinimo.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-slate-50 border-[3px] border-slate-900 p-8">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">MAX m²</span>
                <p className="text-4xl font-black text-slate-900">R$ {resultado.valorMaximo.toLocaleString('pt-BR')}</p>
              </div>
            </div>

            <div className="bg-blue-600 p-8 border-[3px] border-slate-900 relative">
              <span className="absolute -top-4 left-10 bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">IA RECOMMENDATION</span>
              <p className="text-white text-2xl font-bold italic">"{resultado.observacoes}"</p>
            </div>
          </div>
        </section>

        <div className="flex gap-6">
          <Link href="/admin/analise-mercado" className="bg-slate-900 text-white px-10 py-5 font-black uppercase italic tracking-tighter shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:shadow-none transition-all">
            📊 View Dashboard
          </Link>
          <button onClick={() => setResultado(null)} className="bg-white border-[3px] border-slate-900 text-slate-900 px-10 py-5 font-black uppercase italic tracking-tighter hover:bg-slate-100 transition-all">
            🔄 New Analysis
          </button>
        </div>
      </div>
    )
  }

  // TELA DE FORMULÁRIO
  return (
    <div className="p-10 bg-[#f1f5f9] min-h-screen font-sans">
      <div className="flex justify-between items-start mb-16 border-l-[12px] border-blue-600 pl-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900">
            Generate <br />
            <span className="text-blue-600">IA Analysis</span>
          </h1>
          <p className="font-black text-slate-500 text-sm tracking-[0.3em] uppercase mt-4">
            Intelligence Module / Market Execution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Info Box */}
        <div className="bg-slate-900 text-white p-10 border-[3px] border-slate-900 shadow-[15px_15px_0px_0px_rgba(37,99,235,1)]">
          <p className="font-black text-2xl uppercase italic mb-8 border-b border-blue-500 pb-4 tracking-tighter">System Protocol:</p>
          <ul className="space-y-6">
            {[
              "Scan all database records for target location",
              "Execute range calculation (Min/Max/Avg)",
              "Apply Trend Detection Algorithm",
              "Generate strategic investment insights"
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-4 group">
                <span className="text-blue-500 font-black text-xl select-none group-hover:translate-x-2 transition-transform">0{i+1}</span>
                <span className="text-sm font-bold uppercase tracking-widest text-slate-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Formulário */}
        <div className="bg-white border-[3px] border-slate-900 p-10">
          <form onSubmit={gerarAnalise} className="space-y-10">
            <div>
              <label className="block mb-4 font-black uppercase tracking-widest text-xs text-slate-400">Target City</label>
              <input 
                className="w-full bg-slate-50 p-6 border-[3px] border-slate-900 font-black text-xl uppercase italic focus:bg-blue-50 focus:outline-none transition-all placeholder:text-slate-200"
                value={form.cidade}
                onChange={e => setForm({...form, cidade: e.target.value})}
                placeholder="Ex: São Paulo, Osasco..."
                required
              />
            </div>

            <div>
              <label className="block mb-4 font-black uppercase tracking-widest text-xs text-slate-400">State Node</label>
              <select 
                className="w-full bg-slate-50 p-6 border-[3px] border-slate-900 font-black text-xl uppercase italic focus:outline-none appearance-none"
                value={form.estado}
                onChange={e => setForm({...form, estado: e.target.value})}
              >
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <option value="RS">Rio Grande do Sul</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white p-8 font-black text-3xl uppercase italic tracking-tighter shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {loading ? '🤖 EXECUTING...' : '🚀 Execute Analysis'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
