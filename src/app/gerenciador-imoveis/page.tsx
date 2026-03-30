import type { Metadata } from 'next';
export const metadata: Metadata = { robots: { index: false, follow: false } };

'use client'

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';

// --------------------------------------------------------------------------------
// TIPOS
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
  disponivel: boolean;
  descricao?: string;
  imagens: string[];
  createdAt: string;
  updatedAt: string;
}

interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
}

interface Stats {
  ativos: number;
  vendidos: number;
  alugados: number;
  arquivados: number;
  total: number;
}

// --------------------------------------------------------------------------------
// COMPONENTES UI
// --------------------------------------------------------------------------------
const MessageDisplay: React.FC<{ message: Message; onClose: () => void }> = ({ message, onClose }) => {
  if (!message.text) return null;
  
  const colorClasses = message.type === 'success' 
    ? "bg-green-600 text-white" 
    : message.type === 'error' 
    ? "bg-red-600 text-white" 
    : "bg-blue-600 text-white";

  return (
    <div className={`fixed bottom-5 right-5 p-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 max-w-md ${colorClasses} animate-slideIn`}>
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
      <span className="text-xl flex-shrink-0">
        {message.type === 'success' ? 'âœ…' : message.type === 'error' ? 'âŒ' : 'â„¹ï¸'}
      </span>
      <p className="font-semibold text-sm">{message.text}</p>
      <button 
        onClick={onClose} 
        className="ml-2 text-lg font-bold hover:opacity-80 flex-shrink-0"
        aria-label="Fechar mensagem"
      >
        &times;
      </button>
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center gap-3 py-12">
    <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-600"></div>
    <span className="text-gray-600 font-medium text-lg">Carregando dados...</span>
  </div>
);

const EmptyState: React.FC<{ activeTab: string }> = ({ activeTab }) => (
  <div className="text-center py-16 px-4">
    <div className="text-6xl mb-4">ðŸ˜ï¸</div>
    <p className="text-xl font-semibold text-gray-700 mb-2">
      Nenhum imÃ³vel {activeTab === 'ativos' ? 'ativo' : 'inativo'} encontrado
    </p>
    <p className="text-sm text-gray-500">
      {activeTab === 'ativos' 
        ? 'Todos os imÃ³veis estÃ£o inativos ou nÃ£o hÃ¡ imÃ³veis cadastrados' 
        : 'NÃ£o hÃ¡ imÃ³veis inativos no momento'}
    </p>
  </div>
);

// --------------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// --------------------------------------------------------------------------------
export default function GerenciadorStatusImoveis() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>({ text: '', type: 'info' });
  const [activeTab, setActiveTab] = useState<'ativos' | 'inativos'>('ativos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stats, setStats] = useState<Stats>({
    ativos: 0,
    vendidos: 0,
    alugados: 0,
    arquivados: 0,
    total: 0
  });

  // --------------------------------------------------------------------------------
  // FETCH DE DADOS DA API
  // --------------------------------------------------------------------------------
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [imoveis]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchImoveis(), fetchProprietarios()]);
    } catch (error: any) {
      handleMessage('Erro ao carregar dados do sistema', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchImoveis = async () => {
    try {
      const response = await fetch('/api/imoveis', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const imoveisArray = Array.isArray(data) ? data : [];
      setImoveis(imoveisArray);
      
    } catch (error: any) {
      console.error('Erro ao buscar imÃ³veis:', error);
      handleMessage('Falha ao carregar lista de imÃ³veis', 'error');
      setImoveis([]);
    }
  };

  const fetchProprietarios = async () => {
    try {
      const response = await fetch('/api/proprietarios', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setProprietarios(Array.isArray(data) ? data : []);
      
    } catch (error: any) {
      console.error('Erro ao buscar proprietÃ¡rios:', error);
      setProprietarios([]);
    }
  };

  const calculateStats = () => {
    const newStats = {
      ativos: imoveis.filter(i => i.status === 'ATIVO').length,
      vendidos: imoveis.filter(i => i.status === 'VENDIDO').length,
      alugados: imoveis.filter(i => i.status === 'ALUGADO').length,
      arquivados: imoveis.filter(i => i.status === 'ARQUIVADO').length,
      total: imoveis.length
    };
    setStats(newStats);
  };

  const handleMessage = (text: string, type: Message['type'] = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'info' }), 6000);
  };

  // --------------------------------------------------------------------------------
  // MUDANÃ‡A DE STATUS (PATCH API)
  // --------------------------------------------------------------------------------
  const handleMudarStatus = async (id: string, newStatus: StatusImovel) => {
    const imovel = imoveis.find(i => i.id === id);
    if (!imovel) return;

    const isActivating = newStatus === 'ATIVO';
    const actionText = isActivating 
      ? 'REATIVAR este imÃ³vel?\n\nâœ… Ele ficarÃ¡ VISÃVEL no site para todos os clientes.' 
      : `INATIVAR este imÃ³vel como ${newStatus}?\n\nâŒ Ele serÃ¡ REMOVIDO da visualizaÃ§Ã£o pÃºblica no site.`;

    if (!window.confirm(`${actionText}\n\nImÃ³vel: ${imovel.tipo} - ${imovel.endereco}`)) {
      return;
    }
    
    setUpdating(id);

    try {
      // Atualiza o status e o campo disponivel
      const payload = {
        status: newStatus,
        disponivel: newStatus === 'ATIVO'
      };

      const response = await fetch(`/api/imoveis/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const updatedImovel = await response.json();
      
      // Atualiza o estado local imediatamente
      setImoveis(prev => prev.map(i => 
        i.id === id ? { 
          ...i, 
          status: newStatus,
          disponivel: newStatus === 'ATIVO',
          updatedAt: new Date().toISOString()
        } : i
      ));
      
      const feedback = isActivating 
        ? `âœ… ImÃ³vel REATIVADO! Agora estÃ¡ visÃ­vel no site (${imovel.tipo} - ${imovel.endereco})` 
        : `âœ… ImÃ³vel marcado como ${newStatus}! Removido da visualizaÃ§Ã£o pÃºblica (${imovel.tipo} - ${imovel.endereco})`;
        
      handleMessage(feedback, 'success');
      
      // Recarrega dados para garantir sincronizaÃ§Ã£o completa
      setTimeout(() => {
        fetchImoveis();
      }, 500);
      
    } catch (error: any) {
      console.error('Erro ao mudar status:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      handleMessage(`âŒ Falha ao atualizar: ${errorMsg}`, 'error');
      
      // Reverte mudanÃ§a local em caso de erro
      await fetchImoveis();
      
    } finally {
      setUpdating(null);
    }
  };

  // --------------------------------------------------------------------------------
  // FILTROS E BUSCA
  // --------------------------------------------------------------------------------
  const imoveisFiltrados = imoveis
    .filter(i => {
      const matchesTab = activeTab === 'ativos' ? i.status === 'ATIVO' : i.status !== 'ATIVO';
      
      if (!searchTerm) return matchesTab;
      
      const search = searchTerm.toLowerCase();
      return matchesTab && (
        i.tipo.toLowerCase().includes(search) ||
        i.endereco.toLowerCase().includes(search) ||
        i.cidade.toLowerCase().includes(search) ||
        i.estado.toLowerCase().includes(search) ||
        i.id.toLowerCase().includes(search)
      );
    })
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const proprietarioMap = proprietarios.reduce((acc: any, p: any) => {
    acc[p.id] = p.nome;
    return acc;
  }, {} as Record<string, string>);

  // --------------------------------------------------------------------------------
  // RENDERIZAÃ‡ÃƒO DA TABELA
  // --------------------------------------------------------------------------------
  const renderImovelRow = (imovel: Imovel) => {
    const statusConfig: Record<StatusImovel, { bg: string; text: string; icon: string }> = {
      ATIVO: { bg: 'bg-green-100', text: 'text-green-800', icon: 'âœ…' },
      VENDIDO: { bg: 'bg-red-100', text: 'text-red-800', icon: 'ðŸ·ï¸' },
      ALUGADO: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'ðŸ”‘' },
      ARQUIVADO: { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'ðŸ“¦' },
    };

    const config = statusConfig[imovel.status];
    const isUpdating = updating === imovel.id;

    const precoFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(imovel.preco);

    return (
      <tr 
        key={imovel.id} 
        className={`border-b hover:bg-gray-50 transition duration-200 ${isUpdating ? 'opacity-60' : ''}`}
      >
        <td className="p-4">
          <div className="flex items-center">
            <div className="relative">
              <img 
                src={imovel.imagens[0] || 'https://placehold.co/48x48/e5e7eb/6b7280?text=Sem+Foto'}
                alt="Miniatura do imÃ³vel"
                className="w-14 h-14 object-cover rounded-lg shadow-sm mr-3 border border-gray-200"
                onError={(e: any) => {
                  e.currentTarget.src = 'https://placehold.co/48x48/e5e7eb/6b7280?text=Erro';
                }}
              />
              {!imovel.disponivel && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">âŒ</span>
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{imovel.tipo}</div>
              <div className="text-xs text-gray-600 max-w-xs truncate">{imovel.endereco}</div>
              <div className="text-xs text-gray-400 font-mono mt-1">#{imovel.id.substring(0, 8)}</div>
            </div>
          </div>
        </td>
        <td className="p-4 text-sm text-gray-700">
          <div className="font-medium">{imovel.cidade}</div>
          <div className="text-xs text-gray-500">{imovel.estado}</div>
        </td>
        <td className="p-4 text-sm text-gray-700">
          <div className="max-w-xs truncate">
            {proprietarioMap[imovel.proprietarioId] || 'N/A'}
          </div>
        </td>
        <td className="p-4">
          <div className="text-sm font-bold text-blue-600">{precoFormatado}</div>
          <div className="text-xs text-gray-500">{imovel.metragem}mÂ²</div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text} border border-current border-opacity-20`}>
              {config.icon} {imovel.status}
            </span>
            {!imovel.disponivel && imovel.status === 'ATIVO' && (
              <span className="text-xs text-red-600 font-medium">âš ï¸ IndisponÃ­vel</span>
            )}
          </div>
        </td>
        <td className="p-4">
          {imovel.status === 'ATIVO' ? (
            <select
              className="px-3 py-2 text-sm border border-red-300 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 font-semibold text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onChange={(e: any) => {
                if (e.target.value) {
                  handleMudarStatus(imovel.id, e.target.value as StatusImovel);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              disabled={isUpdating || loading}
            >
              <option value="" disabled>
                {isUpdating ? 'â³ Processando...' : 'ðŸ”» Inativar como...'}
              </option>
              <option value="VENDIDO">ðŸ·ï¸ VENDIDO</option>
              <option value="ALUGADO">ðŸ”‘ ALUGADO</option>
              <option value="ARQUIVADO">ðŸ“¦ ARQUIVADO</option>
            </select>
          ) : (
            <button
              onClick={() => handleMudarStatus(imovel.id, 'ATIVO')}
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              disabled={isUpdating || loading}
            >
              {isUpdating ? 'â³ Reativando...' : 'âœ… Reativar'}
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
            ðŸ”‘ Gerenciador de Status de ImÃ³veis
          </h1>
          <p className="text-lg text-gray-600">
            Controle a visibilidade dos imÃ³veis no site pÃºblico atravÃ©s da exclusÃ£o lÃ³gica
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-5 mb-6 rounded-xl shadow-sm">
          <div className="flex items-start">
            <span className="text-3xl mr-4 flex-shrink-0">â„¹ï¸</span>
            <div>
              <h3 className="font-bold text-blue-900 mb-2 text-lg">ðŸ’¡ Como funciona a ExclusÃ£o LÃ³gica:</h3>
              <ul className="text-sm text-blue-800 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">â€¢</span>
                  <span><strong>ATIVO:</strong> ImÃ³vel visÃ­vel no site para todos os clientes (disponivel = true)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">â€¢</span>
                  <span><strong>VENDIDO/ALUGADO/ARQUIVADO:</strong> ImÃ³vel removido da visualizaÃ§Ã£o pÃºblica (disponivel = false)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">â€¢</span>
                  <span>Os dados permanecem no banco de dados para histÃ³rico e relatÃ³rios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">â€¢</span>
                  <span>A pÃ¡gina web filtra automaticamente pelos campos <code className="bg-blue-200 px-1 rounded">status</code> e <code className="bg-blue-200 px-1 rounded">disponivel</code></span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Busca */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="ðŸ” Buscar por tipo, endereÃ§o, cidade ou ID..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex space-x-2 border-b border-gray-300">
          <button 
            className={`py-3 px-6 font-semibold text-sm rounded-t-xl transition duration-200 flex items-center gap-2 ${
              activeTab === 'ativos' 
                ? 'text-green-700 border-b-4 border-green-600 bg-white shadow-sm -mb-px' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('ativos')}
          >
            <span className="text-xl">âœ…</span>
            ImÃ³veis Ativos
            <span className={`ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'ativos' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
            }`}>
              {stats.ativos}
            </span>
          </button>
          
          <button 
            className={`py-3 px-6 font-semibold text-sm rounded-t-xl transition duration-200 flex items-center gap-2 ${
              activeTab === 'inativos' 
                ? 'text-red-700 border-b-4 border-red-600 bg-white shadow-sm -mb-px' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('inativos')}
          >
            <span className="text-xl">âŒ</span>
            ImÃ³veis Inativos
            <span className={`ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'inativos' ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-700'
            }`}>
              {stats.vendidos + stats.alugados + stats.arquivados}
            </span>
          </button>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {activeTab === 'ativos' ? 'âœ… ImÃ³veis Ativos' : 'âŒ ImÃ³veis Inativos'}
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              {activeTab === 'ativos' 
                ? `${imoveisFiltrados.length} ${imoveisFiltrados.length === 1 ? 'imÃ³vel visÃ­vel' : 'imÃ³veis visÃ­veis'} no site` 
                : `${imoveisFiltrados.length} ${imoveisFiltrados.length === 1 ? 'imÃ³vel removido' : 'imÃ³veis removidos'} da visualizaÃ§Ã£o pÃºblica`}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ImÃ³vel
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    LocalizaÃ§Ã£o
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ProprietÃ¡rio
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    AÃ§Ãµes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6}>
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : imoveisFiltrados.length > 0 ? (
                  imoveisFiltrados.map(renderImovelRow)
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState activeTab={activeTab} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* EstatÃ­sticas */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600 font-medium mt-1">Total de ImÃ³veis</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-green-600">{stats.ativos}</div>
            <div className="text-sm text-gray-600 font-medium mt-1">Ativos (VisÃ­veis)</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-red-600">{stats.vendidos}</div>
            <div className="text-sm text-gray-600 font-medium mt-1">Vendidos</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-yellow-600">{stats.alugados}</div>
            <div className="text-sm text-gray-600 font-medium mt-1">Alugados</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-gray-500 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-gray-600">{stats.arquivados}</div>
            <div className="text-sm text-gray-600 font-medium mt-1">Arquivados</div>
          </div>
        </div>

        {/* RodapÃ© informativo */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">âš ï¸</span>
            <div className="text-sm text-amber-800">
              <strong className="font-bold">AtenÃ§Ã£o:</strong> Esta pÃ¡gina gerencia a exclusÃ£o lÃ³gica dos imÃ³veis. 
              ImÃ³veis marcados como VENDIDO, ALUGADO ou ARQUIVADO terÃ£o o campo <code className="bg-amber-200 px-1 rounded">disponivel</code> 
              definido como <code className="bg-amber-200 px-1 rounded">false</code>, removendo-os automaticamente da listagem pÃºblica do site.
            </div>
          </div>
        </div>

        <MessageDisplay 
          message={message} 
          onClose={() => setMessage({ text: '', type: 'info' })} 
        />
      </div>
    </div>
  );
}
