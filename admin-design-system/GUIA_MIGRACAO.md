# 🎨 STR Admin Design System

## Guia Completo de Migração

Este Design System foi criado para padronizar toda a área administrativa do sistema STR Imóveis, oferecendo uma interface moderna, consistente e profissional.

---

## 📁 Estrutura dos Arquivos

```
src/
├── app/
│   └── admin/
│       └── layout.tsx          ← Layout principal (sidebar, header, etc)
│
├── components/
│   └── admin/
│       └── index.tsx           ← Componentes reutilizáveis
│
└── styles/
    └── (tailwind já configurado)
```

---

## 🚀 Instalação

### Passo 1: Copie os arquivos

```bash
# 1. Copie o layout
cp layout.tsx seu-projeto/src/app/admin/layout.tsx

# 2. Copie os componentes
mkdir -p seu-projeto/src/components/admin
cp components/admin/index.tsx seu-projeto/src/components/admin/index.tsx
```

### Passo 2: Verifique o tsconfig.json

Certifique-se de ter o alias `@/` configurado:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Passo 3: Reinicie o servidor

```bash
npm run dev
```

---

## 📦 Componentes Disponíveis

### Importação

```tsx
import {
  // Layout
  AdminPageHeader,
  AdminCard,
  AdminStatCard,
  
  // Formulários
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminSearchBar,
  
  // Tabelas e Dados
  AdminTable,
  AdminBadge,
  AdminPagination,
  
  // Feedback
  AdminModal,
  AdminAlert,
  AdminEmptyState,
  
  // Ícones
  AdminIcons,
} from '@/components/admin';
```

---

## 🎯 Exemplos de Uso

### AdminPageHeader

```tsx
<AdminPageHeader
  title="Gestão de Usuários"
  subtitle="Controle de acesso e permissões"
  icon={<UsersIcon />}
  actions={
    <AdminButton onClick={handleNew} icon={<AdminIcons.Plus />}>
      Novo Usuário
    </AdminButton>
  }
/>
```

### AdminCard

```tsx
// Card simples
<AdminCard>
  <h3>Título</h3>
  <p>Conteúdo</p>
</AdminCard>

// Card com hover
<AdminCard hover>
  Conteúdo clicável
</AdminCard>

// Card sem padding
<AdminCard padding="none">
  <table>...</table>
</AdminCard>
```

### AdminStatCard

```tsx
<AdminStatCard
  title="Total de Vendas"
  value="R$ 1.250.000"
  subtitle="Este mês"
  variant="success"
  trend={{ value: 12.5, label: "vs mês anterior" }}
  icon={<DollarIcon />}
/>
```

### AdminButton

```tsx
// Variantes
<AdminButton variant="primary">Salvar</AdminButton>
<AdminButton variant="secondary">Cancelar</AdminButton>
<AdminButton variant="danger">Excluir</AdminButton>
<AdminButton variant="success">Aprovar</AdminButton>
<AdminButton variant="ghost">Ver mais</AdminButton>

// Tamanhos
<AdminButton size="sm">Pequeno</AdminButton>
<AdminButton size="md">Médio</AdminButton>
<AdminButton size="lg">Grande</AdminButton>

// Com ícone e loading
<AdminButton icon={<AdminIcons.Plus />} loading={isLoading}>
  Adicionar
</AdminButton>
```

### AdminInput

```tsx
<AdminInput
  label="Email"
  type="email"
  placeholder="Digite o email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  hint="Usaremos para login"
  required
/>
```

### AdminSelect

```tsx
<AdminSelect
  label="Status"
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  options={[
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
  ]}
/>
```

### AdminTable

```tsx
const columns = [
  {
    key: 'nome',
    header: 'Nome',
    render: (item) => <span className="font-bold">{item.nome}</span>
  },
  {
    key: 'status',
    header: 'Status',
    render: (item) => (
      <AdminBadge variant={item.ativo ? 'success' : 'danger'}>
        {item.ativo ? 'Ativo' : 'Inativo'}
      </AdminBadge>
    )
  },
];

<AdminTable
  columns={columns}
  data={usuarios}
  loading={isLoading}
  emptyMessage="Nenhum usuário encontrado"
  onRowClick={(item) => handleEdit(item)}
/>
```

### AdminBadge

```tsx
<AdminBadge variant="success">Ativo</AdminBadge>
<AdminBadge variant="danger">Inativo</AdminBadge>
<AdminBadge variant="warning">Pendente</AdminBadge>
<AdminBadge variant="info">Em análise</AdminBadge>
<AdminBadge variant="purple">Admin</AdminBadge>
```

### AdminModal

```tsx
<AdminModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Editar Usuário"
  size="lg"
  footer={
    <>
      <AdminButton variant="secondary" onClick={handleClose}>
        Cancelar
      </AdminButton>
      <AdminButton onClick={handleSubmit}>
        Salvar
      </AdminButton>
    </>
  }
>
  <form>
    {/* conteúdo do form */}
  </form>
</AdminModal>
```

### AdminAlert

```tsx
{alert && (
  <AdminAlert
    type={alert.type}
    title="Sucesso!"
    message={alert.message}
    onClose={() => setAlert(null)}
  />
)}
```

### AdminSearchBar

```tsx
<AdminSearchBar
  value={search}
  onChange={setSearch}
  placeholder="Buscar por nome ou email..."
  className="w-full max-w-md"
/>
```

### AdminPagination

```tsx
<AdminPagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

---

## 🔄 Migrando uma Página Existente

### Antes (estilo antigo):

```tsx
export default function UsuariosPage() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans p-12">
      <header className="flex justify-between items-start mb-12">
        <h1 className="text-6xl font-black">Gestão de Usuários</h1>
        <button className="bg-purple-600 text-white px-6 py-4">
          + Novo Usuário
        </button>
      </header>

      <section className="bg-white border-[3px] border-slate-900">
        <table>...</table>
      </section>
    </div>
  );
}
```

### Depois (Design System):

```tsx
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminTable,
  AdminIcons,
} from '@/components/admin';

export default function UsuariosPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestão de Usuários"
        subtitle="Controle de acesso"
        actions={
          <AdminButton icon={<AdminIcons.Plus />}>
            Novo Usuário
          </AdminButton>
        }
      />

      <AdminTable
        columns={columns}
        data={usuarios}
        loading={loading}
      />
    </div>
  );
}
```

---

## 🎨 Customização

### Alterando cores do tema

Edite as classes de gradiente no `layout.tsx`:

```tsx
// Sidebar background
className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"

// Accent color (violet -> blue, por exemplo)
className="from-blue-600 to-cyan-600"
```

### Alterando o logo

No arquivo `layout.tsx`, procure a seção "Logo" e altere:

```tsx
<div className="flex items-center gap-3">
  <img src="/logo.png" className="w-10 h-10" />
  <div>
    <h1 className="text-lg font-bold text-white">Sua Empresa</h1>
    <p className="text-[10px] text-slate-400">Painel Admin</p>
  </div>
</div>
```

### Adicionando novos itens ao menu

No arquivo `layout.tsx`, edite o array `menuItems`:

```tsx
const menuItems: MenuItem[] = [
  // ... itens existentes
  { 
    label: 'Novo Módulo', 
    href: '/admin/novo-modulo',
    icon: 'FileText',
  },
];
```

---

## 📱 Responsividade

O Design System é **100% responsivo**:

- **Mobile**: Sidebar oculta, abre com menu hamburger
- **Tablet**: Layout adaptado com menos colunas
- **Desktop**: Layout completo com sidebar fixa

---

## ⚡ Performance

- Componentes otimizados com `forwardRef`
- Ícones SVG inline (sem dependência de bibliotecas)
- CSS com Tailwind (tree-shaking automático)
- Backdrop blur otimizado com GPU

---

## 📝 Checklist de Migração

Use este checklist para migrar cada página:

- [ ] Importar componentes do Design System
- [ ] Substituir header por `AdminPageHeader`
- [ ] Substituir cards/sections por `AdminCard`
- [ ] Substituir tabelas por `AdminTable`
- [ ] Substituir botões por `AdminButton`
- [ ] Substituir inputs por `AdminInput` / `AdminSelect`
- [ ] Substituir modais por `AdminModal`
- [ ] Substituir alerts por `AdminAlert`
- [ ] Remover padding/margin do container (layout já gerencia)
- [ ] Testar responsividade

---

## 🆘 Suporte

Dúvidas ou problemas? Verifique:

1. Se os arquivos estão nos caminhos corretos
2. Se o `tsconfig.json` tem o alias `@/`
3. Se o Tailwind está configurado
4. Console do navegador para erros

---

**Criado com ❤️ para STR Imóveis**
