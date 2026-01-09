'use client'
import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';

// --------------------------------------------------------------------------------
// 1. Definição de Tipos (Interfaces)
// --------------------------------------------------------------------------------

type StatusImovel = 'ATIVO' | 'VENDIDO' | 'ALUGADO' | 'ARQUIVADO';

interface Proprietario {
    id: string;
    nome: string;
    email: string;
}

interface Imovel {
    id: string;
    tipo: string;
    endereco: string;
    cidade: string;
    estado: string;
    preco: number;
    metragem: number;
    proprietarioId: string;
    status: StatusImovel;
    descricao?: string;
    imagens: string[]; // URLs base64 ou de imagem
}

interface FormState {
    tipo: string;
    endereco: string;
    cidade: string;
    estado: string;
    preco: string; // Mantido como string para input field
    metragem: string; // Mantido como string para input field
    descricao: string;
    proprietarioId: string;
}

interface Message {
    text: string;
    type: 'success' | 'error' | 'info' | '';
}

// --------------------------------------------------------------------------------
// 2. Simulação de Dados
// --------------------------------------------------------------------------------
const initialProprietarios: Proprietario[] = [
    { id: 'prop-1', nome: 'João Silva', email: 'joao@example.com' },
    { id: 'prop-2', nome: 'Maria Souza', email: 'maria@example.com' },
    { id: 'prop-3', nome: 'Pedro Alvares', email: 'pedro@example.com' },
];

const initialImoveis: Imovel[] = [
    { 
        id: 'imov-101', 
        tipo: 'Apartamento', 
        endereco: 'Rua A, 123', 
        cidade: 'São Paulo', 
        estado: 'SP', 
        preco: 450000, 
        metragem: 80, 
        proprietarioId: 'prop-1', 
        status: 'ATIVO',
        imagens: ['https://placehold.co/100x100/A0C4FF/ffffff?text=Apto+1'],
    },
    { 
        id: 'imov-102', 
        tipo: 'Casa', 
        endereco: 'Av. Brasil, 456', 
        cidade: 'Rio de Janeiro', 
        estado: 'RJ', 
        preco: 890000, 
        metragem: 150, 
        proprietarioId: 'prop-2', 
        status: 'ATIVO',
        imagens: ['https://placehold.co/100x100/BDB2FF/ffffff?text=Casa+2'],
    },
    { 
        id: 'imov-103', 
        tipo: 'Terreno', 
        endereco: 'Estrada do Sol, 789', 
        cidade: 'Belo Horizonte', 
        estado: 'MG', 
        preco: 120000, 
        metragem: 300, 
        proprietarioId: 'prop-3', 
        status: 'VENDIDO', // Exemplo de imóvel vendido (Exclusão Lógica)
        imagens: ['https://placehold.co/100x100/FFC6FF/ffffff?text=Terreno+3'],
    },
];

// --------------------------------------------------------------------------------
// 3. Componentes de UI
// --------------------------------------------------------------------------------

const Container: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-inter">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{title}</h1>
      <p className="text-xl text-gray-500 mb-8">{subtitle}</p>
      {children}
    </div>
  </div>
);

const MessageDisplay: React.FC<{ message: Message; onClose: () => void }> = ({ message, onClose }) => {
  if (!message.text) return null;
  
  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-xl shadow-2xl z-50 transform transition-all duration-300 flex items-center gap-3";
  let colorClasses = "";
  
  if (message.type === 'success') {
    colorClasses = "bg-green-600 text-white";
  } else if (message.type === 'error') {
    colorClasses = "bg-red-600 text-white";
  } else {
    colorClasses = "bg-blue-600 text-white";
  }

  return (
    <div className={`${baseClasses} ${colorClasses} animate-slideIn`}>
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
      <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
      <p className="font-semibold">{message.text}</p>
      <button onClick={onClose} className="ml-4 text-lg font-bold hover:opacity-80">
        &times;
      </button>
    </div>
  );
};

// --------------------------------------------------------------------------------
// 4. Componente Principal
// --------------------------------------------------------------------------------

type Tab = 'ativos' | 'inativos' | 'cadastro';

export default function GerenciadorImoveis() {
  const [imoveis, setImoveis] = useState<Imovel[]>(initialImoveis);
  const [proprietarios] = useState<Proprietario[]>(initialProprietarios); 
  const [imagens, setImagens] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message>({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState<Tab>('ativos'); 

  const initialFormState: FormState = {
    tipo: 'Apartamento',
    endereco: '',
    cidade: '',
    estado: 'SP',
    preco: '',
    metragem: '',
    descricao: '',
    proprietarioId: ''
  };
  const [form, setForm] = useState<FormState>(initialFormState);

  const handleMessage = (text: string, type: Message['type'] = 'info'): void => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };
  
  const proprietarioMap = useMemo<Record<string, string>>(() => {
    return proprietarios.reduce((acc, p) => {
        acc[p.id] = p.nome;
        return acc;
    }, {} as Record<string, string>);
  }, [proprietarios]);

  // Filtra os imóveis.
  const imoveisFiltrados = useMemo<Imovel[]>(() => {
    return imoveis.filter(i => {
        if (activeTab === 'ativos') return i.status === 'ATIVO'; 
        if (activeTab === 'inativos') return i.status !== 'ATIVO'; // Exclusão Lógica: Inativos são todos que não são ATIVO
        return false;
    }).sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()); // Ordena pelo ID (mais recente primeiro)
  }, [imoveis, activeTab]);

  // Função para cadastrar novo imóvel
  const handleCadastro = (e: FormEvent): void => {
    e.preventDefault();
    if (!form.proprietarioId || imagens.length === 0 || !form.preco || !form.metragem || !form.endereco) {
      handleMessage('Preencha todos os campos obrigatórios e adicione fotos!', 'error');
      return;
    }

    setLoading(true);
    
    // Simulação do POST API
    setTimeout(() => {
        const novoImovel: Imovel = {
            id: `imov-${Date.now()}`,
            ...form,
            preco: parseFloat(form.preco),
            metragem: parseFloat(form.metragem),
            status: 'ATIVO', // Novo imóvel é sempre ATIVO e visível ao público
            imagens: imagens,
        };

        setImoveis(prev => [novoImovel, ...prev]);
        setForm(initialFormState); // Reseta o formulário
        setImagens([]);
        handleMessage('Imóvel cadastrado com sucesso e ATIVO no site!', 'success');
        setActiveTab('ativos'); 
        setLoading(false);
    }, 500);
  };

  // Função para mudar o status (Exclusão Lógica / PATCH API Simulado)
  const handleMudarStatus = (id: string, newStatus: StatusImovel): void => {
    const isActivating = newStatus === 'ATIVO';
    const actionText = isActivating 
        ? 'Reativar (Tornar Visível ao Cliente)' 
        : `Inativar (Remover da Visualização Pública) como ${newStatus}`;

    // Usando window.confirm (embora um modal customizado seja o ideal em produção)
    if (!window.confirm(`Você irá ${actionText}. Deseja prosseguir com a mudança de status do imóvel ${id}?`)) {
        return;
    }
    
    setLoading(true);

    // Simulação da requisição PATCH API
    setTimeout(() => {
        setImoveis(prev => prev.map(i => 
            i.id === id ? { ...i, status: newStatus } : i
        ));
        
        const feedback = isActivating 
            ? 'Imóvel REATIVADO com sucesso e VISÍVEL no site.' 
            : `Imóvel INATIVADO como ${newStatus} e REMOVIDO da visualização pública.`;
            
        handleMessage(feedback, 'success');
        setLoading(false);
    }, 500);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        handleMessage('Imagem muito grande! Máximo 5MB por imagem.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagens(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removerImagem = (index: number): void => {
    setImagens(prev => prev.filter((_, i) => i !== index));
  };

  // --------------------------------------------------------------------------------
  // 5. Renderização do Painel (Tabela de Gestão)
  // --------------------------------------------------------------------------------
  
  const renderImovelRow = (imovel: Imovel) => {
    const statusClasses: Record<StatusImovel, string> = {
        ATIVO: 'bg-green-100 text-green-800 border border-green-300',
        VENDIDO: 'bg-red-100 text-red-800 border border-red-300',
        ALUGADO: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
        ARQUIVADO: 'bg-gray-100 text-gray-800 border border-gray-300',
    };

    const precoFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(imovel.preco);

    return (
      <tr key={imovel.id} className="border-b hover:bg-gray-50 transition duration-150">
        <td className="p-4 flex items-center">
            <img 
                src={imovel.imagens[0] || 'https://placehold.co/40x40/cccccc/ffffff?text=No+Img'}
                alt="Miniatura"
                className="w-10 h-10 object-cover rounded-md shadow-sm mr-3"
            />
            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                {imovel.tipo} - {imovel.endereco}
                <div className="text-xs text-gray-500 font-mono mt-1">ID: {imovel.id.substring(5)}</div>
            </div>
        </td>
        <td className="p-4 whitespace-nowrap text-sm text-gray-700">{proprietarioMap[imovel.proprietarioId] || 'Desconhecido'}</td>
        <td className="p-4 whitespace-nowrap text-sm font-bold text-blue-600">{precoFormatado}</td>
        <td className="p-4 whitespace-nowrap">
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[imovel.status]}`}>
                {imovel.status}
            </span>
        </td>
        <td className="p-4 whitespace-nowrap text-sm font-medium">
          {imovel.status === 'ATIVO' ? (
            <div className="flex space-x-2">
              <select
                className="px-3 py-2 text-sm border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 font-semibold text-red-600"
                onChange={(e) => handleMudarStatus(imovel.id, e.target.value as StatusImovel)}
                defaultValue=""
                disabled={loading}
              >
                <option value="" disabled>Inativar como...</option>
                <option value="VENDIDO">VENDIDO</option>
                <option value="ALUGADO">ALUGADO</option>
                <option value="ARQUIVADO">ARQUIVAR</option>
              </select>
            </div>
          ) : (
            <button
                onClick={() => handleMudarStatus(imovel.id, 'ATIVO')}
                className="px-3 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition font-semibold"
                disabled={loading}
            >
                Reativar (Visível)
            </button>
          )}
        </td>
      </tr>
    );
  };

  const renderCurrentView = () => {
    if (activeTab === 'cadastro') {
      return (
        <CadastroForm 
            form={form} 
            setForm={setForm} 
            imagens={imagens} 
            proprietarios={proprietarios}
            loading={loading}
            handleCadastro={handleCadastro}
            handleImageUpload={handleImageUpload}
            removerImagem={removerImagem}
            setActiveTab={setActiveTab}
        />
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Imóveis {activeTab === 'ativos' ? 'Ativos no Site (Visíveis)' : 'Inativos/Fechados (Excluídos Logicamente)'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
            Apenas imóveis com status **ATIVO** são visíveis para os clientes no site. Mudar o status para VENDIDO/ALUGADO/ARQUIVADO realiza a exclusão lógica, removendo-o da visualização pública.
        </p>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tl-xl">Imóvel e ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proprietário</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tr-xl">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {imoveisFiltrados.length > 0 ? (
                imoveisFiltrados.map(renderImovelRow)
            ) : (
                <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500 font-medium">
                        Nenhum imóvel {activeTab === 'ativos' ? 'ativo' : 'inativo'} encontrado.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Container
      title="🔑 Gerenciador de Imóveis"
      subtitle="Cadastre e administre o status (ativação e inativação) de todos os imóveis."
    >
        {/* Tab Navigation */}
        <div className="mb-6 flex space-x-4 border-b border-gray-200">
            <TabButton 
                label="Imóveis Ativos (Visíveis ao Cliente)" 
                count={imoveis.filter(i => i.status === 'ATIVO').length}
                isActive={activeTab === 'ativos'} 
                onClick={() => setActiveTab('ativos')} 
            />
            <TabButton 
                label="Imóveis Inativos (Excluídos Logicamente)" 
                count={imoveis.filter(i => i.status !== 'ATIVO').length}
                isActive={activeTab === 'inativos'} 
                onClick={() => setActiveTab('inativos')} 
            />
            <TabButton 
                label="➕ Novo Imóvel" 
                isActive={activeTab === 'cadastro'} 
                onClick={() => setActiveTab('cadastro')} 
                isPrimary={true}
            />
        </div>

        {/* Content View */}
        {renderCurrentView()}

        <MessageDisplay 
            message={message} 
            onClose={() => setMessage({ text: '', type: '' })} 
        />
    </Container>
  );
}

// --------------------------------------------------------------------------------
// 6. Componente Auxiliar: Botão de Aba
// --------------------------------------------------------------------------------
interface TabButtonProps {
    label: string;
    count?: number;
    isActive: boolean;
    onClick: () => void;
    isPrimary?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ label, count, isActive, onClick, isPrimary = false }) => {
    const baseClasses = "py-3 px-4 font-semibold text-sm rounded-t-xl transition duration-200 flex items-center";
    let classes = "";

    if (isPrimary) {
        classes = isActive
            ? "bg-blue-600 text-white shadow-lg"
            : "text-blue-600 border border-blue-600 hover:bg-blue-50 bg-white";
    } else {
        classes = isActive
            ? "text-blue-600 border-b-2 border-blue-600 bg-white"
            : "text-gray-500 hover:text-gray-700 hover:border-gray-300";
    }

    return (
        <button 
            className={`${baseClasses} ${classes}`} 
            onClick={onClick}
        >
            {label} 
            {count !== undefined && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${isActive && !isPrimary ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                    {count}
                </span>
            )}
        </button>
    );
};

// --------------------------------------------------------------------------------
// 7. Componente Auxiliar: Formulário de Cadastro
// --------------------------------------------------------------------------------
interface CadastroFormProps {
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    imagens: string[];
    proprietarios: Proprietario[];
    loading: boolean;
    handleCadastro: (e: FormEvent) => void;
    handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    removerImagem: (index: number) => void;
    setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
}

const CadastroForm: React.FC<CadastroFormProps> = ({ 
    form, 
    setForm, 
    imagens, 
    proprietarios, 
    loading,
    handleCadastro, 
    handleImageUpload, 
    removerImagem,
    setActiveTab
}) => (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Formulário de Cadastro
        </h2>
        <form onSubmit={handleCadastro} className="space-y-8">
            
            {/* Upload de Imagens */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-500 transition duration-300">
                <label className="block text-center cursor-pointer">
                <div className="text-6xl mb-3 text-blue-500">📸</div>
                <div className="text-lg font-bold text-gray-700 mb-2">
                    Adicionar Fotos do Imóvel
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Clique para selecionar imagens (máx. 5MB cada)
                </p>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                />
                <div className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition transform hover:scale-[1.01]">
                    Selecionar Imagens ({imagens.length} adicionadas)
                </div>
                </label>

                {/* Preview das Imagens */}
                {imagens.length > 0 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagens.map((img, index) => (
                    <div key={index} className="relative group overflow-hidden rounded-xl shadow-md">
                        <img 
                        src={img} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover transition duration-300 group-hover:opacity-75"
                        />
                        <button
                        type="button"
                        onClick={() => removerImagem(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition transform hover:scale-110"
                        aria-label="Remover Imagem"
                        >
                        ✕
                        </button>
                    </div>
                    ))}
                </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo */}
                <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Imóvel</label>
                <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={form.tipo}
                    onChange={(e) => setForm({...form, tipo: e.target.value})}
                    required
                >
                    <option value="Apartamento">Apartamento</option>
                    <option value="Casa">Casa</option>
                    <option value="Sobrado">Sobrado</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Chácara">Chácara</option>
                </select>
                </div>
                {/* Proprietário */}
                <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Proprietário</label>
                <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={form.proprietarioId}
                    onChange={(e) => setForm({...form, proprietarioId: e.target.value})}
                    required
                >
                    <option value="">Selecione um proprietário...</option>
                    {proprietarios.map((p) => (
                    <option key={p.id} value={p.id}>
                        {p.nome} - {p.email}
                    </option>
                    ))}
                </select>
                </div>
            </div>
            
            {/* Endereço */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Endereço Completo</label>
                <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={form.endereco}
                onChange={(e) => setForm({...form, endereco: e.target.value})}
                placeholder="Rua, Número, Bairro"
                required
                />
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cidade</label>
                <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={form.cidade}
                    onChange={(e) => setForm({...form, cidade: e.target.value})}
                    placeholder="Ex: São Paulo"
                    required
                />
                </div>
                <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={form.estado}
                    onChange={(e) => setForm({...form, estado: e.target.value})}
                    required
                >
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="PR">Paraná</option>
                    <option value="SC">Santa Catarina</option>
                </select>
                </div>
            </div>

            {/* Preço e Metragem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preço (R$)</label>
                <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={form.preco}
                    onChange={(e) => setForm({...form, preco: e.target.value})}
                    placeholder="450000.00"
                    required
                />
                </div>
                <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Metragem (m²)</label>
                <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={form.metragem}
                    onChange={(e) => setForm({...form, metragem: e.target.value})}
                    placeholder="80.5"
                    required
                />
                </div>
            </div>

            {/* Descrição */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition"
                rows={4}
                value={form.descricao}
                onChange={(e) => setForm({...form, descricao: e.target.value})}
                placeholder="Descreva as características e diferenciais do imóvel..."
                />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
                <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg transform hover:scale-[1.005]"
                >
                {loading ? '⏳ Cadastrando...' : '✅ Cadastrar Imóvel'}
                </button>
                <button
                type="button"
                onClick={() => setActiveTab('ativos')}
                className="px-6 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                Voltar à Gestão
                </button>
            </div>
        </form>
    </div>
);