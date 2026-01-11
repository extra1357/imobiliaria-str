#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🆘 CORREÇÃO URGENTE - ADICIONAR LINK NO LOGIN          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cd ~/imobiliaria_str/

echo "📋 Verificando situação atual..."
echo ""

# Verificar se os arquivos existem
echo "1. Verificando arquivos:"
[ -f "src/app/admin/login/page.tsx" ] && echo "   ✅ Login existe" || echo "   ❌ Login NÃO existe"
[ -f "src/app/admin/esqueci-senha/page.tsx" ] && echo "   ✅ Esqueci senha existe" || echo "   ❌ Esqueci senha NÃO existe"
[ -f "src/app/admin/redefinir-senha/page.tsx" ] && echo "   ✅ Redefinir senha existe" || echo "   ❌ Redefinir senha NÃO existe"
[ -f "src/app/api/auth/redefinir-senha/route.ts" ] && echo "   ✅ API existe" || echo "   ❌ API NÃO existe"

echo ""
echo "2. Verificando link no login:"
if grep -q "esqueci" src/app/admin/login/page.tsx 2>/dev/null; then
    echo "   ✅ Login JÁ TEM o link 'Esqueci minha senha'"
    echo ""
    echo "   🤔 O problema pode ser outro..."
    echo "   Possíveis causas:"
    echo "   1. Cache do navegador (teste em aba anônima)"
    echo "   2. Deploy ainda processando (aguarde 1-2 min)"
    echo "   3. Variáveis de ambiente faltando na Vercel"
    echo ""
    read -p "Deseja RECRIAR a página de login mesmo assim? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Operação cancelada"
        exit 0
    fi
else
    echo "   ❌ Login NÃO TEM o link 'Esqueci minha senha'"
    echo "   📝 Vou adicionar agora!"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Criando página de login COMPLETA com link de recuperação..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Criar backup
if [ -f "src/app/admin/login/page.tsx" ]; then
    cp src/app/admin/login/page.tsx src/app/admin/login/page.tsx.backup
    echo "✅ Backup criado: page.tsx.backup"
fi

# Criar nova página de login
cat > src/app/admin/login/page.tsx << 'ENDOFFILE'
// src/app/admin/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      router.push('/admin/dashboard');
      
    } catch (err: any) {
      setErro(err.message || 'Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-3xl font-bold text-gray-800">STR Imobiliária</h1>
          <p className="text-gray-500 mt-2">Faça login para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Senha
            </label>
            <input
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={loading}
            />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              ❌ {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>

          <div className="text-center mt-4">
            <Link 
              href="/admin/esqueci-senha"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>

        </form>

        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>&copy; 2026 STR Imobiliária. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
ENDOFFILE

echo "✅ Página de login atualizada com link 'Esqueci minha senha'!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Fazendo commit e push..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

git add src/app/admin/login/page.tsx

if git diff --staged --quiet; then
    echo "⚠️  Nenhuma mudança para commitar (arquivo já estava correto)"
else
    git commit -m "fix: adicionar link 'Esqueci minha senha' na página de login"
    echo "✅ Commit realizado!"
    echo ""
    
    echo "Fazendo push..."
    git push origin main
    echo "✅ Push realizado!"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ CORREÇÃO CONCLUÍDA!                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "⏱️  Aguarde 1-2 minutos para o deploy terminar"
echo ""
echo "🧪 COMO TESTAR:"
echo ""
echo "1. Aguarde o deploy terminar na Vercel"
echo ""
echo "2. Abra em ABA ANÔNIMA (importante!):"
echo "   Ctrl+Shift+N (Chrome) ou Ctrl+Shift+P (Firefox)"
echo ""
echo "3. Acesse:"
echo "   https://seu-projeto.vercel.app/admin/login"
echo ""
echo "4. Deve aparecer o link 'Esqueci minha senha' abaixo do botão"
echo ""
echo "5. Clique e teste o fluxo completo!"
echo ""
echo "🎯 Se ainda não aparecer:"
echo "   - Limpe cache: Ctrl+Shift+Delete"
echo "   - Ou force refresh: Ctrl+F5"
echo ""
echo "📞 Pode falar pro seu chefe que está resolvido! 💪"
echo ""
