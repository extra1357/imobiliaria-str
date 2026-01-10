'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  tipo: string;
  endereco: string;
  cidade: string;
  estado: string;
  preco: string;
  metragem: string;
  quartos: string;
  banheiros: string;
  vagas: string;
  descricao: string;
  proprietarioId: string;
  status: string;
  disponivel: boolean;
}

export default function NovoImovel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagensBase64, setImagensBase64] = useState<string[]>([]);
  const [proprietarios, setProprietarios] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormData>({
    tipo: 'CASA',
    endereco: '',
    cidade: '',
    estado: 'SP',
    preco: '',
    metragem: '',
    quartos: '0',
    banheiros: '0',
    vagas: '0',
    descricao: '',
    proprietarioId: '',
    status: 'ATIVO',
    disponivel: true
  });

  // ✅ MANTIDA A LÓGICA ORIGINAL DE CARREGAMENTO
  useEffect(() => {
    fetch('/api/proprietarios')
      .then((res: any) => res.json())
      .then((data: any) => setProprietarios(Array.isArray(data) ? data : (data.data || [])))
      .catch(() => setError('Erro ao carregar proprietários do Banco STR'));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagensBase64(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.proprietarioId) throw new Error('Selecione um proprietário cadastrado.');

      const res = await fetch('/api/imoveis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preco: parseFloat(formData.preco),
          metragem: parseFloat(formData.metragem),
          quartos: parseInt(formData.quartos),
          banheiros: parseInt(formData.banheiros),
          vagas: parseInt(formData.vagas),
          imagens: imagensBase64
        })
      });

      if (!res.ok) throw new Error('Falha na gravação do registro no PostgreSQL.');

      alert('✅ Imóvel registrado com sucesso no Sistema STR!');
      router.push('/admin/imoveis');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 bg-[#f1f5f9] min-h-screen font-sans text-slate-900">
      {/* Header Original Logic Style */}
      <div className="flex justify-between items-center mb-10">
        <Link href="/admin/imoveis" className="font-black text-xs uppercase tracking-[0.3em] bg-slate-900 text-white px-6 py-2 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
          ← VOLTAR AO PAINEL
        </Link>
        <span className="font-black text-[10px] text-slate-400 uppercase tracking-[0.5em]">STR SYSTEM v2.0</span>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-[3px] border-slate-900 p-10 shadow-[15px_15px_0px_0px_rgba(15,23,42,0.1)]">
          <h1 className="text-4xl font-black mb-10 uppercase italic tracking-tighter text-blue-600 border-l-8 border-blue-600 pl-6">
            🏗️ Cadastrar Novo Imóvel
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 border-2 border-red-200 mb-8 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ✅ PROPRIETÁRIO - LÓGICA RESTAURADA */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Proprietário</label>
                <select 
                  name="proprietarioId" 
                  value={formData.proprietarioId} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 bg-slate-50 border-[3px] border-slate-900 font-bold text-black outline-none focus:bg-blue-50"
                >
                  <option value="">Selecione um proprietário</option>
                  {proprietarios.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              {/* Tipo do Imóvel */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Tipo de Imóvel</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full p-4 bg-slate-50 border-[3px] border-slate-900 font-bold text-black outline-none focus:bg-blue-50">
                  <option value="CASA">CASA</option>
                  <option value="APARTAMENTO">APARTAMENTO</option>
                  <option value="TERRENO">TERRENO</option>
                  <option value="COMERCIAL">COMERCIAL</option>
                </select>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Endereço Completo</label>
              <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} required placeholder="Rua, número, bairro..." className="w-full p-4 bg-slate-50 border-[3px] border-slate-900 font-bold text-black outline-none" />
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-3">
                <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Cidade</label>
                <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} required className="w-full p-4 bg-slate-50 border-[3px] border-slate-900 font-bold text-black outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">UF</label>
                <input type="text" name="estado" value={formData.estado} onChange={handleChange} maxLength={2} className="w-full p-4 bg-slate-50 border-[3px] border-slate-900 font-bold text-black outline-none uppercase text-center" />
              </div>
            </div>

            {/* Financeiro e Metragem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 p-6 border-[3px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)]">
                <label className="block text-[10px] font-black text-blue-400 uppercase mb-2 tracking-widest">Preço de Venda (R$)</label>
                <input type="number" name="preco" value={formData.preco} onChange={handleChange} required className="w-full p-3 bg-white border-[2px] border-slate-900 font-black text-2xl outline-none text-slate-900" />
              </div>
              <div className="bg-slate-50 p-6 border-[3px] border-slate-900">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Área Total (m²)</label>
                <input type="number" name="metragem" value={formData.metragem} onChange={handleChange} required className="w-full p-3 bg-white border-[2px] border-slate-900 font-black text-2xl outline-none" />
              </div>
            </div>

            {/* SEÇÃO DOS ÍCONES (Ambientes) */}
            <div className="p-8 border-[3px] border-blue-600 grid grid-cols-3 gap-6 bg-blue-50 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
              <div>
                <label className="block text-[10px] font-black uppercase mb-2 text-blue-600 tracking-tighter">🛏️ Quartos</label>
                <input type="number" name="quartos" value={formData.quartos} onChange={handleChange} min="0" className="w-full p-3 border-[2px] border-blue-600 font-black text-xl outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-2 text-blue-600 tracking-tighter">🚿 Banheiros</label>
                <input type="number" name="banheiros" value={formData.banheiros} onChange={handleChange} min="0" className="w-full p-3 border-[2px] border-blue-600 font-black text-xl outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-2 text-blue-600 tracking-tighter">🚗 Vagas</label>
                <input type="number" name="vagas" value={formData.vagas} onChange={handleChange} min="0" className="w-full p-3 border-[2px] border-blue-600 font-black text-xl outline-none" />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Descrição Completa</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} className="w-full p-4 bg-slate-50 border-[3px] border-slate-900 font-bold text-black outline-none" />
            </div>

            {/* Upload de Imagens */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Fotos do Ativo</label>
              <div className="relative border-[4px] border-dashed border-slate-300 p-10 text-center hover:border-blue-600 transition-all cursor-pointer">
                <p className="font-black text-slate-300 uppercase tracking-widest">Selecionar Múltiplas Imagens</p>
                <input type="file" multiple onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
              </div>
              {imagensBase64.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4">
                  {imagensBase64.map((img: any, i: number) => (
                    <div key={i} className="w-24 h-24 border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <img src={img} alt="Preview" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 text-white py-6 border-[3px] border-slate-900 font-black text-2xl uppercase italic tracking-tighter shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:bg-slate-300"
            >
              {loading ? '⏳ PROCESSANDO NO BANCO...' : '🚀 FINALIZAR CADASTRO STR'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
