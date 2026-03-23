'use client';

import { useState } from 'react';
import { compressImage } from '@/lib/compressImage';

export default function FormularioImovelProfissional() {
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [imagensBase64, setImagensBase64] = useState<string[]>([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const [formData, setFormData] = useState({
    tipo: 'Casa', // Valor padrão
    endereco: '',
    cidade: '',
    estado: 'SP',
    preco: '',
    metragem: '',
    quartos: '',
    banheiros: '',
    vagas: '',
    descricao: '',
    proprietarioId: '', // Integrar com busca de proprietário depois
    finalidade: 'venda',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const novasImagens: string[] = [];

    setCompressing(true);
    setStatus({ type: '', message: '' });

    for (const file of filesArray) {
      try {
        // Reduz a imagem para max 1280px de largura e 70% de qualidade
        const compressedFile = await compressImage(file, 1280, 0.7);

        // Converte o arquivo leve para Base64 para mandar no JSON
        const base64 = await fileToBase64(compressedFile);
        novasImagens.push(base64);
      } catch (error) {
        console.error('Erro ao comprimir imagem:', error);
        setStatus({ type: 'error', message: `Erro ao processar imagem: ${file.name}` });
      }
    }

    setImagensBase64((prev) => [...prev, ...novasImagens]);
    setCompressing(false);
  };

  const removeImage = (indexToRemove: number) => {
    setImagensBase64((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    if (!formData.proprietarioId) {
      setStatus({ type: 'error', message: 'Por favor, selecione um Proprietário.' });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        imagens: imagensBase64,
      };

      const res = await fetch('/api/imoveis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.error || 'Erro ao cadastrar imóvel');
      }

      const dadosSalvos = await res.json();
      setStatus({ type: 'success', message: `Imóvel cadastrado com sucesso! Código: ${dadosSalvos.codigo}` });
      
      // Limpar formulário após sucesso
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
      {/* Feedback Status */}
      {status.message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {status.message}
        </div>
      )}

      {/* Seção 1: Dados Básicos */}
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

      {/* Seção 2: Localização e Estrutura */}
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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
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
             <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Proprietário (Temporário)</label>
              <input type="text" name="proprietarioId" value={formData.proprietarioId} onChange={handleChange} required placeholder="Cole o ID aqui" className="w-full border border-red-300 bg-red-50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Seção 3: Descrição e Fotos */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Mídia e Detalhes</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Imóvel</label>
            <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200" placeholder="Descreva os diferenciais do imóvel..."></textarea>
          </div>

          {/* Input de Imagens Profissional */}
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

          {/* Preview de Imagens Miniaturas com Botão de Remover */}
          {imagensBase64.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4 pt-4">
              {imagensBase64.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img src={img} alt="Imóvel preview" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-red-600">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Botão de Ação Fixo no final */}
      <div className="flex justify-end pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading || compressing}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md transition-all transform hover:-translate-y-0.5"
        >
          {loading ? (
            <>⏳ Enviando...</>
          ) : compressing ? (
            <>✨ Otimizando...</>
          ) : (
            <>✅ Finalizar Cadastro do Imóvel</>
          )}
        </button>
      </div>
    </form>
  );
}
