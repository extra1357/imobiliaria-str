'use client';

import { useState, useEffect, useRef } from 'react';

interface Proprietario {
  id: string;
  nome: string;
  telefone: string;
  email: string;
}

export default function FormularioImovelProfissional() {
  const [formData, setFormData] = useState({
    tipo: 'Casa',
    endereco: '',
    cidade: '',
    estado: 'SP',
    preco: '',
    metragem: '',
    quartos: '',
    banheiros: '',
    vagas: '',
    descricao: '',
    proprietarioId: '',
    finalidade: 'venda',
  });

  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [loadingProprietarios, setLoadingProprietarios] = useState(true);
  const [imagensBase64, setImagensBase64] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Carrega proprietários ao montar
  useEffect(() => {
    fetch('/api/proprietarios')
      .then(r => r.json())
      .then(data => {
        setProprietarios(Array.isArray(data) ? data : []);
        setLoadingProprietarios(false);
      })
      .catch(() => {
        setStatus({ type: 'error', message: 'Erro ao carregar proprietários. Recarregue a página.' });
        setLoadingProprietarios(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setCompressing(true);
    const results: string[] = [];
    for (const file of files) {
      const base64 = await compressImage(file, 800, 0.7);
      results.push(base64);
    }
    setImagensBase64(prev => [...prev, ...results]);
    setCompressing(false);
  };

  const removeImage = (idx: number) => {
    setImagensBase64(prev => prev.filter((_, i) => i !== idx));
  };

  async function compressImage(file: File, maxWidth: number, quality: number): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width  = img.width  * scale;
          canvas.height = img.height * scale;
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = ev.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    if (!formData.proprietarioId) {
      setStatus({ type: 'error', message: 'Selecione um proprietário.' });
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData, imagens: imagensBase64 };

      const res = await fetch('/api/imoveis/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const dadosResposta = await res.json();

      if (!res.ok) {
        throw new Error(dadosResposta.error || `Erro ${res.status}`);
      }

      setStatus({ type: 'success', message: `Imóvel cadastrado com sucesso! Código: ${dadosResposta.codigo}` });
      setFormData({ tipo: 'Casa', endereco: '', cidade: '', estado: 'SP', preco: '', metragem: '', quartos: '', banheiros: '', vagas: '', descricao: '', proprietarioId: '', finalidade: 'venda' });
      setImagensBase64([]);

    } catch (error: any) {
      setStatus({ type: 'error', message: `Erro: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {status.message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {status.message}
        </div>
      )}

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Imóvel</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200">
              <option>Casa</option>
              <option>Apartamento</option>
              <option>Terreno</option>
              <option>Comercial</option>
              <option>Chácara</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade</label>
            <select name="finalidade" value={formData.finalidade} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200">
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
              <option value="venda_aluguel">Venda ou Aluguel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
            <input type="number" name="preco" value={formData.preco} onChange={handleChange} placeholder="Ex: 550000" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Proprietário</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Proprietário</label>
          {loadingProprietarios ? (
            <div className="text-sm text-gray-500 py-2">Carregando proprietários...</div>
          ) : proprietarios.length === 0 ? (
            <div className="text-sm text-red-600 py-2">
              Nenhum proprietário cadastrado.{' '}
              <a href="/admin/proprietarios/novo" className="underline font-medium">Cadastrar agora</a>
            </div>
          ) : (
            <select
              name="proprietarioId"
              value={formData.proprietarioId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">— Selecione —</option>
              {proprietarios.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {p.telefone} ({p.email})
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Localização e Estrutura</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo (com bairro)</label>
              <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Rua Nome, 123 - Bairro Centro" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input type="text" name="estado" value={formData.estado} onChange={handleChange} maxLength={2} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">M² Área Útil</label>
              <input type="number" name="metragem" value={formData.metragem} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quartos</label>
              <input type="number" name="quartos" value={formData.quartos} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
              <input type="number" name="banheiros" value={formData.banheiros} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vagas</label>
              <input type="number" name="vagas" value={formData.vagas} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Mídia e Detalhes</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Imóvel</label>
            <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200" placeholder="Descreva os diferenciais do imóvel..."></textarea>
          </div>
          <div className="border-2 border-dashed border-gray-300 p-8 rounded-2xl text-center bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer relative">
            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {compressing ? (
              <div className="text-blue-600 font-medium">✨ Comprimindo e Otimizando Fotos...</div>
            ) : (
              <>
                <div className="text-3xl mb-2">📸</div>
                <div className="font-semibold text-gray-800">Clique ou Arraste as Fotos</div>
                <div className="text-sm text-gray-600 mt-1">O sistema otimiza as imagens automaticamente (Máx 4.5MB total Vercel)</div>
              </>
            )}
          </div>
          {imagensBase64.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4 pt-4">
              {imagensBase64.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img src={img} alt="Imóvel preview" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-red-600">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading || compressing || loadingProprietarios || proprietarios.length === 0}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md transition-all transform hover:-translate-y-0.5"
        >
          {loading ? <>⏳ Enviando...</> : compressing ? <>✨ Otimizando...</> : <>✅ Finalizar Cadastro do Imóvel</>}
        </button>
      </div>
    </form>
  );
}
