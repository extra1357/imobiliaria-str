"use client";

export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from 'react';
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTable,
  AdminModal,
  AdminBadge,
  AdminAlert,
  AdminSearchBar,
  AdminIcons,
} from '@/components/admin';

// ============================================
// TYPES
// ============================================
type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'GERENTE' | 'CORRETOR' | 'ASSISTENTE' | 'VISUALIZADOR';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: RoleType;
  ativo: boolean;
  ultimoLogin: Date | null;
  corretor: { id: string; nome: string } | null;
}

interface Corretor {
  id: string;
  nome: string;
  creci: string;
}

// ============================================
// CONSTANTS
// ============================================
const ROLE_CONFIG: Record<RoleType, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'; icon: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', variant: 'purple', icon: '👑' },
  ADMIN: { label: 'Admin', variant: 'danger', icon: '⚡' },
  GERENTE: { label: 'Gerente', variant: 'info', icon: '📊' },
  CORRETOR: { label: 'Corretor', variant: 'success', icon: '🤝' },
  ASSISTENTE: { label: 'Assistente', variant: 'warning', icon: '📝' },
  VISUALIZADOR: { label: 'Visualizador', variant: 'default', icon: '👁️' },
};

const ROLE_HIERARCHY: Record<RoleType, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  GERENTE: 60,
  CORRETOR: 40,
  ASSISTENTE: 20,
  VISUALIZADOR: 10
};

// ============================================
// ICON COMPONENT
// ============================================
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// ============================================
// MAIN PAGE
// ============================================
export default function UsuariosPage() {
  // State
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const currentUserRole: RoleType = 'ADMIN';
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    role: 'VISUALIZADOR' as RoleType,
    corretorId: '',
    ativo: true
  });

  // Fetch data
  useEffect(() => {
    fetchUsuarios();
    fetchCorretores();
  }, []);

  async function fetchUsuarios() {
    try {
      const response = await fetch('/api/usuarios');
      const data = await response.json();
      if (data.success) {
        setUsuarios(data.usuarios);
      }
    } catch (e) {
      console.error('Erro ao buscar usuários:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCorretores() {
    try {
      const response = await fetch('/api/corretores');
      const data = await response.json();
      if (data.success) {
        setCorretores(data.corretores || []);
      }
    } catch (e) {
      console.error('Erro ao buscar corretores:', e);
    }
  }

  // Helpers
  function canManageUser(managerRole: RoleType, targetRole: RoleType): boolean {
    return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
  }

  // Handlers
  function handleNew() {
    setEditingUser(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      role: 'VISUALIZADOR',
      corretorId: '',
      ativo: true
    });
    setShowModal(true);
  }

  function handleEdit(user: Usuario) {
    if (!canManageUser(currentUserRole, user.role)) {
      setAlert({ type: 'error', message: 'Você não tem permissão para editar este usuário' });
      return;
    }
    
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      senha: '',
      confirmarSenha: '',
      role: user.role,
      corretorId: user.corretor?.id || '',
      ativo: user.ativo
    });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!formData.nome || !formData.email) {
      setAlert({ type: 'error', message: 'Preencha todos os campos obrigatórios' });
      return;
    }
    
    if (!editingUser && !formData.senha) {
      setAlert({ type: 'error', message: 'Senha é obrigatória para novo usuário' });
      return;
    }
    
    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      setAlert({ type: 'error', message: 'As senhas não coincidem' });
      return;
    }
    
    try {
      const url = editingUser ? `/api/usuarios/${editingUser.id}` : '/api/usuarios';
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAlert({ type: 'success', message: data.message || 'Usuário salvo com sucesso!' });
        setShowModal(false);
        fetchUsuarios();
      } else {
        setAlert({ type: 'error', message: data.error || 'Erro ao salvar usuário' });
      }
    } catch (e: any) {
      setAlert({ type: 'error', message: 'Erro ao salvar usuário: ' + e.message });
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: boolean) {
    if (!confirm(`Deseja ${currentStatus ? 'desativar' : 'ativar'} este usuário?`)) return;
    
    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !currentStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAlert({ type: 'success', message: 'Status alterado com sucesso!' });
        fetchUsuarios();
      } else {
        setAlert({ type: 'error', message: data.error || 'Erro ao alterar status' });
      }
    } catch (e: any) {
      setAlert({ type: 'error', message: 'Erro ao alterar status: ' + e.message });
    }
  }

  // Filter users
  const filteredUsers = usuarios.filter(u => 
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Role options for select
  const roleOptions = (Object.entries(ROLE_HIERARCHY) as [RoleType, number][])
    .filter(([role]) => canManageUser(currentUserRole, role))
    .sort((a, b) => b[1] - a[1])
    .map(([role]) => ({
      value: role,
      label: `${ROLE_CONFIG[role].icon} ${ROLE_CONFIG[role].label}`
    }));

  // Table columns
  const columns = [
    {
      key: 'nome',
      header: 'Usuário',
      render: (user: Usuario) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20">
            {user.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user.nome}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Nível',
      render: (user: Usuario) => {
        const config = ROLE_CONFIG[user.role];
        return (
          <AdminBadge variant={config.variant}>
            {config.icon} {config.label}
          </AdminBadge>
        );
      }
    },
    {
      key: 'corretor',
      header: 'Corretor Vinculado',
      render: (user: Usuario) => (
        user.corretor ? (
          <span className="text-emerald-600 font-medium">✓ {user.corretor.nome}</span>
        ) : (
          <span className="text-slate-400">—</span>
        )
      )
    },
    {
      key: 'ultimoLogin',
      header: 'Último Login',
      render: (user: Usuario) => (
        <span className="text-sm text-slate-500">
          {user.ultimoLogin ? new Date(user.ultimoLogin).toLocaleString('pt-BR') : 'Nunca'}
        </span>
      )
    },
    {
      key: 'ativo',
      header: 'Status',
      render: (user: Usuario) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(user.id, user.ativo);
          }}
          className="focus:outline-none"
        >
          <AdminBadge variant={user.ativo ? 'success' : 'danger'}>
            {user.ativo ? '✓ Ativo' : '✗ Inativo'}
          </AdminBadge>
        </button>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (user: Usuario) => (
        <div className="flex items-center justify-end gap-2">
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(user);
            }}
            disabled={!canManageUser(currentUserRole, user.role)}
            icon={<AdminIcons.Edit />}
          >
            Editar
          </AdminButton>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <AdminAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Page Header */}
      <AdminPageHeader
        title="Gestão de Usuários"
        subtitle="Controle de acesso e permissões do sistema"
        icon={<UsersIcon />}
        actions={
          <AdminButton onClick={handleNew} icon={<AdminIcons.Plus />}>
            Novo Usuário
          </AdminButton>
        }
      />

      {/* Hierarchy Card */}
      <AdminCard>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          🔐 Hierarquia de Acesso
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.entries(ROLE_HIERARCHY) as [RoleType, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([role, level]) => {
              const config = ROLE_CONFIG[role];
              return (
                <div key={role} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{config.label}</p>
                    <p className="text-xs text-slate-500">Nível {level}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </AdminCard>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome ou email..."
          className="flex-1"
        />
      </div>

      {/* Users Table */}
      <AdminTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="Nenhum usuário encontrado"
      />

      {/* Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? '✏️ Editar Usuário' : '➕ Novo Usuário'}
        size="lg"
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </AdminButton>
            <AdminButton onClick={handleSubmit}>
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <AdminInput
            label="Nome Completo"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Digite o nome completo"
            required
          />

          <AdminInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Digite o email"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label={editingUser ? 'Nova Senha (vazio = manter)' : 'Senha'}
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              placeholder="Digite a senha"
              required={!editingUser}
            />
            <AdminInput
              label="Confirmar Senha"
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
              placeholder="Confirme a senha"
            />
          </div>

          <AdminSelect
            label="Nível de Acesso"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
            options={roleOptions}
            required
          />

          {formData.role === 'CORRETOR' && (
            <AdminSelect
              label="Vincular ao Corretor"
              value={formData.corretorId}
              onChange={(e) => setFormData({ ...formData, corretorId: e.target.value })}
              options={[
                { value: '', label: 'Selecione um corretor...' },
                ...corretores.map(c => ({ value: c.id, label: `${c.nome} - CRECI ${c.creci}` }))
              ]}
            />
          )}

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="ativo" className="font-medium text-slate-700 cursor-pointer">
              Usuário Ativo
            </label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
