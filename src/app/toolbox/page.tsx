import type { Metadata } from 'next';
export const metadata: Metadata = { robots: { index: false, follow: false } };

'use client'

export const dynamic = 'force-dynamic';

import React from 'react';
import { 
  Users, 
  Home, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  LayoutDashboard,
  Plus,
  List,
  BarChart3,
  FileText
} from 'lucide-react';

export default function Toolbox() {
  const sections = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      color: 'bg-blue-500',
      items: [
        { name: 'Painel Principal', path: '/dashboard', icon: BarChart3 }
      ]
    },
    {
      title: 'Leads',
      icon: Users,
      color: 'bg-green-500',
      items: [
        { name: 'Lista de Leads', path: '/leads', icon: List },
        { name: 'Novo Lead', path: '/leads/novo', icon: Plus },
        { name: 'RelatÃ³rio de Leads', path: '/leads/relatorio', icon: FileText }
      ]
    },
    {
      title: 'ImÃ³veis',
      icon: Home,
      color: 'bg-purple-500',
      items: [
        { name: 'Lista de ImÃ³veis', path: '/imoveis', icon: List },
        { name: 'Novo ImÃ³vel', path: '/imoveis/novo', icon: Plus },
        { name: 'ImÃ³veis DisponÃ­veis', path: '/imoveis/disponiveis', icon: Home }
      ]
    },
    {
      title: 'ProprietÃ¡rios',
      icon: UserCheck,
      color: 'bg-orange-500',
      items: [
        { name: 'Lista de ProprietÃ¡rios', path: '/proprietarios', icon: List },
        { name: 'Novo ProprietÃ¡rio', path: '/proprietarios/novo', icon: Plus }
      ]
    },
    {
      title: 'Consultas',
      icon: Calendar,
      color: 'bg-red-500',
      items: [
        { name: 'Agenda de Consultas', path: '/consultas', icon: Calendar },
        { name: 'Nova Consulta', path: '/consultas/nova', icon: Plus },
        { name: 'HistÃ³rico', path: '/consultas/historico', icon: List }
      ]
    },
    {
      title: 'AnÃ¡lise de Mercado',
      icon: TrendingUp,
      color: 'bg-cyan-500',
      items: [
        { name: 'AnÃ¡lises', path: '/analise-mercado', icon: TrendingUp },
        { name: 'Nova AnÃ¡lise', path: '/analise-mercado/nova', icon: Plus },
        { name: 'RelatÃ³rios', path: '/analise-mercado/relatorios', icon: FileText }
      ]
    }
  ];

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">CRM ImobiliÃ¡rio</h1>
          <p className="text-gray-600">Painel de NavegaÃ§Ã£o - Acesse todas as funcionalidades</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section: any, idx: number) => {
            const SectionIcon = section.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className={`${section.color} p-4 flex items-center gap-3`}>
                  <SectionIcon className="text-white" size={28} />
                  <h2 className="text-xl font-bold text-white">{section.title}</h2>
                </div>
                
                <div className="p-4 space-y-2">
                  {section.items.map((item: any, itemIdx: number) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={itemIdx}
                        onClick={() => handleNavigate(item.path)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left group"
                      >
                        <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          <ItemIcon size={20} className="text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 group-hover:text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">{item.path}</p>
                        </div>
                        <svg 
                          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Rotas da API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold text-gray-700">GET /api/leads</p>
              <p className="text-sm text-gray-500">Listar todos os leads</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-semibold text-gray-700">POST /api/leads</p>
              <p className="text-sm text-gray-500">Criar novo lead</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="font-semibold text-gray-700">GET /api/imoveis</p>
              <p className="text-sm text-gray-500">Listar todos os imÃ³veis</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="font-semibold text-gray-700">GET /api/proprietarios</p>
              <p className="text-sm text-gray-500">Listar proprietÃ¡rios</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="font-semibold text-gray-700">GET /api/consultas</p>
              <p className="text-sm text-gray-500">Listar consultas</p>
            </div>
            <div className="border-l-4 border-cyan-500 pl-4">
              <p className="font-semibold text-gray-700">GET /api/analise-mercado</p>
              <p className="text-sm text-gray-500">AnÃ¡lises de mercado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
