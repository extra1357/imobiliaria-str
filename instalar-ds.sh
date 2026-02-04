#!/bin/bash

# STR Admin Design System - Instalação
cd ~/imobiliaria_str

echo "🎨 Instalando Design System..."

# Backup
cp src/app/admin/layout.tsx src/app/admin/layout.backup.tsx 2>/dev/null && echo "✓ Backup do layout criado"

# Criar pasta se não existir
mkdir -p src/components/admin

echo "✓ Criando arquivos..."

# ARQUIVO 1: Componentes Admin
cat > src/components/admin/index.tsx << 'EOF'
"use client";
import React, { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";

export const AdminIcons = {
  Loader: () => <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  AlertCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  ArrowUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>,
  ArrowDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>,
};

interface PageHeaderProps { title: string; subtitle?: string; icon?: React.ReactNode; actions?: React.ReactNode; }
export function AdminPageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-violet-500/30">{icon}</div>}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

interface CardProps { children: React.ReactNode; className?: string; padding?: "none" | "sm" | "md" | "lg"; hover?: boolean; }
export function AdminCard({ children, className = "", padding = "md", hover = false }: CardProps) {
  const p = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };
  return <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 ${hover ? "hover:shadow-2xl transition-shadow" : ""} ${p[padding]} ${className}`}>{children}</div>;
}

interface StatCardProps { title: string; value: string | number; subtitle?: string; icon?: React.ReactNode; trend?: { value: number; label?: string }; variant?: "default" | "success" | "warning" | "danger" | "info"; }
export function AdminStatCard({ title, value, subtitle, icon, trend, variant = "default" }: StatCardProps) {
  const v: Record<string, string> = { default: "from-slate-500 to-slate-600", success: "from-emerald-500 to-teal-600", warning: "from-amber-500 to-orange-600", danger: "from-red-500 to-rose-600", info: "from-blue-500 to-cyan-600" };
  const tc = trend && trend.value >= 0 ? "text-emerald-600" : "text-red-600";
  return (
    <AdminCard hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          {trend && <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${tc}`}>{trend.value >= 0 ? <AdminIcons.ArrowUp /> : <AdminIcons.ArrowDown />}<span>{Math.abs(trend.value)}%</span>{trend.label && <span className="text-slate-400 font-normal">{trend.label}</span>}</div>}
        </div>
        {icon && <div className={`p-3 bg-gradient-to-br ${v[variant]} rounded-xl text-white shadow-lg`}>{icon}</div>}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${v[variant]}`} />
    </AdminCard>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: "primary" | "secondary" | "danger" | "ghost" | "success"; size?: "sm" | "md" | "lg"; loading?: boolean; icon?: React.ReactNode; }
export const AdminButton = forwardRef<HTMLButtonElement, ButtonProps>(({ children, variant = "primary", size = "md", loading, icon, className = "", disabled, ...props }, ref) => {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const v: Record<string, string> = { primary: "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30 focus:ring-violet-500", secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400", danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/30 focus:ring-red-500", ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400", success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 focus:ring-emerald-500" };
  const s: Record<string, string> = { sm: "px-3 py-2 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  return <button ref={ref} disabled={disabled || loading} className={`${base} ${v[variant]} ${s[size]} ${className}`} {...props}>{loading ? <AdminIcons.Loader /> : icon}{children}</button>;
});
AdminButton.displayName = "AdminButton";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; hint?: string; }
export const AdminInput = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className = "", ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}
    <input ref={ref} className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 disabled:bg-slate-50 ${error ? "border-red-300" : "border-slate-300"} ${className}`} {...props} />
    {error && <p className="flex items-center gap-1 text-sm text-red-600"><AdminIcons.AlertCircle />{error}</p>}
    {hint && !error && <p className="text-sm text-slate-500">{hint}</p>}
  </div>
));
AdminInput.displayName = "AdminInput";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; options: { value: string; label: string }[]; }
export const AdminSelect = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className = "", ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}
    <select ref={ref} className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 ${error ? "border-red-300" : "border-slate-300"} ${className}`} {...props}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="flex items-center gap-1 text-sm text-red-600"><AdminIcons.AlertCircle />{error}</p>}
  </div>
));
AdminSelect.displayName = "AdminSelect";

interface BadgeProps { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" | "purple"; size?: "sm" | "md"; }
export function AdminBadge({ children, variant = "default", size = "md" }: BadgeProps) {
  const v: Record<string, string> = { default: "bg-slate-100 text-slate-700", success: "bg-emerald-100 text-emerald-700", warning: "bg-amber-100 text-amber-700", danger: "bg-red-100 text-red-700", info: "bg-blue-100 text-blue-700", purple: "bg-violet-100 text-violet-700" };
  const s: Record<string, string> = { sm: "px-2 py-0.5 text-xs", md: "px-3 py-1 text-sm" };
  return <span className={`inline-flex items-center font-semibold rounded-full ${v[variant]} ${s[size]}`}>{children}</span>;
}

interface Column<T> { key: string; header: string; render?: (item: T) => React.ReactNode; className?: string; }
interface TableProps<T> { columns: Column<T>[]; data: T[]; loading?: boolean; emptyMessage?: string; onRowClick?: (item: T) => void; }
export function AdminTable<T extends { id: string }>({ columns, data, loading, emptyMessage = "Nenhum registro", onRowClick }: TableProps<T>) {
  if (loading) return <AdminCard padding="lg"><div className="flex items-center justify-center py-12"><AdminIcons.Loader /><span className="ml-3 text-slate-500">Carregando...</span></div></AdminCard>;
  if (!data.length) return <AdminCard padding="lg"><div className="text-center py-12 text-slate-500">{emptyMessage}</div></AdminCard>;
  return (
    <AdminCard padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-slate-200">{columns.map((c) => <th key={c.key} className={`px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${c.className || ""}`}>{c.header}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, i) => <tr key={item.id} onClick={() => onRowClick?.(item)} className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} ${onRowClick ? "cursor-pointer hover:bg-violet-50/50" : ""} transition-colors`}>{columns.map((c) => <td key={c.key} className={`px-6 py-4 ${c.className || ""}`}>{c.render ? c.render(item) : (item as any)[c.key]}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}

interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: "sm" | "md" | "lg" | "xl"; footer?: React.ReactNode; }
export function AdminModal({ isOpen, onClose, title, children, size = "md", footer }: ModalProps) {
  if (!isOpen) return null;
  const s: Record<string, string> = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full ${s[size]} bg-white rounded-2xl shadow-2xl`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><AdminIcons.X /></button>
          </div>
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
          {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

interface AlertProps { type: "success" | "error" | "warning" | "info"; title?: string; message: string; onClose?: () => void; }
export function AdminAlert({ type, title, message, onClose }: AlertProps) {
  const t: Record<string, string> = { success: "bg-emerald-50 border-emerald-200 text-emerald-800", error: "bg-red-50 border-red-200 text-red-800", warning: "bg-amber-50 border-amber-200 text-amber-800", info: "bg-blue-50 border-blue-200 text-blue-800" };
  const icons = { success: <AdminIcons.Check />, error: <AdminIcons.X />, warning: <AdminIcons.AlertCircle />, info: <AdminIcons.Info /> };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${t[type]}`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1">{title && <p className="font-semibold">{title}</p>}<p className={title ? "mt-1" : ""}>{message}</p></div>
      {onClose && <button onClick={onClose} className="flex-shrink-0 hover:opacity-70"><AdminIcons.X /></button>}
    </div>
  );
}

interface SearchBarProps { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; }
export function AdminSearchBar({ value, onChange, placeholder = "Buscar...", className = "" }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><AdminIcons.Search /></div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500" />
    </div>
  );
}

interface PaginationProps { currentPage: number; totalPages: number; onPageChange: (p: number) => void; }
export function AdminPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages: number[] = [];
  let start = Math.max(1, currentPage - 2), end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <div className="flex items-center justify-center gap-2">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50"><AdminIcons.ChevronLeft /></button>
      {pages.map((p) => <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1.5 text-sm rounded-lg ${p === currentPage ? "bg-violet-600 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>)}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50"><AdminIcons.ChevronRight /></button>
    </div>
  );
}
EOF

echo "✓ Componentes criados: src/components/admin/index.tsx"

# ARQUIVO 2: Layout Admin
cat > src/app/admin/layout.tsx << 'EOF'
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Icons: Record<string, () => JSX.Element> = {
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Building: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Handshake: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>,
  Key: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/></svg>,
  DollarSign: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Wallet: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>,
  BarChart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>,
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  UserCog: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="15" r="3"/><circle cx="9" cy="7" r="4"/><path d="M10 15H6a4 4 0 0 0-4 4v2"/><path d="m21.7 16.4-.9-.3"/><path d="m15.2 13.9-.9-.3"/><path d="m16.6 18.7.3-.9"/><path d="m19.1 12.2.3-.9"/><path d="m19.6 18.7-.4-1"/><path d="m16.8 12.3-.4-1"/><path d="m14.3 16.6 1-.4"/><path d="m20.7 13.8 1-.4"/></svg>,
  LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Bell: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
};

type MenuItem = { label: string; href?: string; icon: string; badge?: number; children?: { label: string; href: string }[] };
const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "Home" },
  { label: "Imóveis", icon: "Building", children: [{ label: "Todos", href: "/admin/imoveis" }, { label: "Disponíveis", href: "/admin/imoveis/disponiveis" }, { label: "Vendidos", href: "/admin/imoveis/vendidos" }, { label: "Alugados", href: "/admin/imoveis/alugados" }, { label: "Novo", href: "/admin/imoveis/novo" }] },
  { label: "Leads", icon: "Users", children: [{ label: "Todos", href: "/admin/leads" }, { label: "Novo", href: "/admin/leads/novo" }, { label: "Relatório", href: "/admin/leads/relatorio" }] },
  { label: "Corretores", icon: "Handshake", children: [{ label: "Todos", href: "/admin/corretores" }, { label: "Novo", href: "/admin/corretores/novo" }] },
  { label: "Proprietários", icon: "UserCog", children: [{ label: "Todos", href: "/admin/proprietarios" }, { label: "Novo", href: "/admin/proprietarios/novo" }] },
  { label: "Vendas", icon: "DollarSign", children: [{ label: "Todas", href: "/admin/vendas" }, { label: "Nova", href: "/admin/vendas/nova" }] },
  { label: "Aluguéis", icon: "Key", children: [{ label: "Todos", href: "/admin/alugueis" }, { label: "Novo", href: "/admin/alugueis/novo" }] },
  { label: "Comissões", href: "/admin/comissoes", icon: "Wallet" },
  { label: "Consultas", icon: "Calendar", children: [{ label: "Agendadas", href: "/admin/consultas" }, { label: "Nova", href: "/admin/consultas/nova" }, { label: "Histórico", href: "/admin/consultas/historico" }, { label: "Funil", href: "/admin/consultas/funil" }] },
  { label: "Análise Mercado", icon: "TrendingUp", children: [{ label: "Dashboard", href: "/admin/analise-mercado" }, { label: "Nova", href: "/admin/analise-mercado/nova" }, { label: "Relatórios", href: "/admin/analise-mercado/relatorios" }] },
  { label: "Performance", href: "/admin/performance", icon: "BarChart" },
  { label: "Usuários", href: "/admin/usuarios", icon: "Users" },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (l: string) => setExpanded((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]));
  const active = (h?: string, c?: { href: string }[]) => (h && pathname === h) || (c && c.some((x) => pathname === x.href));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 text-white"><Icons.Building /></div>
            <div><h1 className="text-lg font-bold text-white">STR Imóveis</h1><p className="text-[10px] text-slate-400 uppercase tracking-widest">Painel Admin</p></div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white"><Icons.X /></button>
        </div>
        <div className="p-4"><div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Search /></div><input placeholder="Buscar..." className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50" /></div></div>
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = Icons[item.icon];
            const isActive = active(item.href, item.children);
            const isExpanded = expanded.includes(item.label);
            if (item.children) {
              return (
                <div key={item.label}>
                  <button onClick={() => toggle(item.label)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive ? "bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"}`}>
                    <div className="flex items-center gap-3"><div className={`${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-violet-400"}`}><Icon /></div><span className="font-medium text-sm">{item.label}</span>{item.badge && <span className="px-2 py-0.5 text-xs font-bold bg-violet-500 text-white rounded-full">{item.badge}</span>}</div>
                    <div className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}><Icons.ChevronDown /></div>
                  </button>
                  <div className={`overflow-hidden transition-all ${isExpanded ? "max-h-96" : "max-h-0"}`}>
                    <div className="ml-4 pl-4 border-l border-slate-700/50 mt-1 space-y-1">
                      {item.children.map((c) => <Link key={c.href} href={c.href} onClick={onClose} className={`block px-4 py-2.5 rounded-lg text-sm ${pathname === c.href ? "bg-violet-500/10 text-violet-400 font-medium" : "text-slate-500 hover:text-white hover:bg-slate-800/30"}`}>{c.label}</Link>)}
                    </div>
                  </div>
                </div>
              );
            }
            return <Link key={item.label} href={item.href!} onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive ? "bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"}`}><div className={`${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-violet-400"}`}><Icon /></div><span className="font-medium text-sm">{item.label}</span></Link>;
          })}
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <Link href="/admin/perfil" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-sm font-bold">AD</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">Admin</p><p className="text-xs text-slate-500 truncate">admin@str.com</p></div>
            <Icons.ChevronRight />
          </Link>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const crumbs = pathname.split("/").filter(Boolean).map((p, i, a) => ({ label: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "), href: "/" + a.slice(0, i + 1).join("/"), isLast: i === a.length - 1 }));
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/admin/login"); };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"><Icons.Menu /></button>
          <nav className="hidden sm:flex items-center gap-2 text-sm">{crumbs.map((c, i) => <React.Fragment key={c.href}>{i > 0 && <Icons.ChevronRight />}{c.isLast ? <span className="font-semibold text-slate-900">{c.label}</span> : <Link href={c.href} className="text-slate-500 hover:text-slate-700">{c.label}</Link>}</React.Fragment>)}</nav>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"><Icons.Bell /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" /></button>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/20">AD</div>
              <div className="hidden md:block text-left"><p className="text-sm font-semibold text-slate-900">Admin</p><p className="text-xs text-slate-500">Super Admin</p></div>
              <Icons.ChevronDown />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/50 py-2 z-50">
                  <Link href="/admin/perfil" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Icons.User />Meu Perfil</Link>
                  <Link href="/admin/trocar-senha" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Icons.Settings />Configurações</Link>
                  <div className="border-t border-slate-100 my-2" />
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><Icons.LogOut />Sair</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const noLayout = ["/admin/login", "/admin/esqueci-senha", "/admin/redefinir-senha"];
  if (noLayout.some((p) => pathname.startsWith(p))) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl" />
      </div>
      <div className="relative flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-8">{children}</main>
          <footer className="border-t border-slate-200/50 bg-white/50 backdrop-blur-sm px-4 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-500">
              <p>© 2025 STR Imóveis</p><p>v2.0.0</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
EOF

echo "✓ Layout criado: src/app/admin/layout.tsx"
echo ""
echo "══════════════════════════════════════════"
echo "✅ INSTALAÇÃO CONCLUÍDA!"
echo "══════════════════════════════════════════"
echo ""
echo "Próximos passos:"
echo "  1. npm run dev"
echo "  2. Acesse http://localhost:3000/admin/dashboard"
echo ""
echo "Para usar componentes nas páginas:"
echo "  import { AdminCard, AdminButton } from '@/components/admin'"
echo ""
