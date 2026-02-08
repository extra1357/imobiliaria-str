# 🚀 GUIA DE IMPLEMENTAÇÃO - SEO LOCAL
## Imobiliária Perto - Salto, Itu e Indaiatuba

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **FASE 1: Componentes de Schema (30 minutos)**

1. **Criar pasta de componentes SEO:**
```bash
mkdir -p src/components/seo
```

2. **Copiar componentes:**
```bash
# Copiar os 4 arquivos .tsx para src/components/seo/
cp LocalBusinessSchema.tsx src/components/seo/
cp BreadcrumbSchema.tsx src/components/seo/
cp FAQSchema.tsx src/components/seo/
cp RealEstateSchema.tsx src/components/seo/
```

---

### **FASE 2: Páginas de Cidade (1 hora)**

3. **Criar pastas das páginas:**
```bash
mkdir -p src/app/imoveis-salto
mkdir -p src/app/imoveis-itu
mkdir -p src/app/imoveis-indaiatuba
```

4. **Copiar páginas:**
```bash
# Renomear e copiar os arquivos page-*.tsx
cp page-salto.tsx src/app/imoveis-salto/page.tsx
cp page-itu.tsx src/app/imoveis-itu/page.tsx
cp page-indaiatuba.tsx src/app/imoveis-indaiatuba/page.tsx
```

---

### **FASE 3: Utilitários (15 minutos)**

5. **Copiar utilitário de SEO local:**
```bash
cp local-seo.ts src/lib/
```

---

### **FASE 4: Atualizar Sitemap (30 minutos)**

6. **Editar `src/app/sitemap.ts`:**

Adicionar as novas rotas ao sitemap existente:

```typescript
// Adicionar no final do arquivo src/app/sitemap.ts

// URLs de páginas de cidade
const cidadesURLs = [
  {
    url: 'https://www.imobiliariaperto.com.br/imoveis-salto',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  {
    url: 'https://www.imobiliariaperto.com.br/imoveis-itu',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  {
    url: 'https://www.imobiliariaperto.com.br/imoveis-indaiatuba',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
];

// Adicionar cidadesURLs ao array final que é retornado
```

---

### **FASE 5: Atualizar Robots.txt (5 minutos)**

7. **Verificar `src/app/robots.ts`:**

Certifique-se de que as novas páginas não estão bloqueadas:

```typescript
// src/app/robots.ts deve permitir:
Allow: /imoveis-salto
Allow: /imoveis-itu
Allow: /imoveis-indaiatuba
```

---

### **FASE 6: Configurações Finais (30 minutos)**

8. **Atualizar contatos nos arquivos:**

Editar em CADA página (page.tsx de Salto, Itu e Indaiatuba):

```typescript
// Trocar:
telefone = '+55-11-99999-9999'
email = 'contato@imobiliariaperto.com.br'

// Pelos dados reais da imobiliária
```

9. **Atualizar link do WhatsApp:**

Trocar em cada página:
```typescript
href="https://wa.me/5511999999999?text=..."
// Por:
href="https://wa.me/55SEUNUMERO?text=..."
```

---

### **FASE 7: Google Search Console (1 hora)**

10. **Cadastrar no Google Search Console:**
- Acessar: https://search.google.com/search-console
- Adicionar propriedade: `imobiliariaperto.com.br`
- Verificar propriedade (via DNS ou arquivo HTML)
- Submeter sitemap: `https://www.imobiliariaperto.com.br/sitemap.xml`

11. **Solicitar indexação das páginas novas:**
- Solicitar indexação de `/imoveis-salto`
- Solicitar indexação de `/imoveis-itu`
- Solicitar indexação de `/imoveis-indaiatuba`

---

### **FASE 8: Google Meu Negócio (2 horas)**

12. **Criar perfis do Google Meu Negócio:**

**Opção 1: Escritório Físico (Recomendado)**
- Criar perfil para cada cidade se houver escritório físico

**Opção 2: Área de Serviço**
- Criar 1 perfil principal
- Configurar área de atendimento: Salto, Itu, Indaiatuba

**Dados para preencher:**
```
Nome: Imobiliária Perto
Categoria: Imobiliária, Agente Imobiliário
Telefone: [SEU TELEFONE]
Site: https://www.imobiliariaperto.com.br
Descrição: Imobiliária especializada em Salto, Itu e Indaiatuba...
```

13. **Adicionar fotos:**
- Logo da imobiliária
- Fachada (se houver)
- Imóveis (mínimo 10 fotos)
- Equipe

---

### **FASE 9: Schema Markup em Imóveis Existentes (1 hora)**

14. **Adicionar Schema em páginas de imóveis:**

Editar `src/app/imoveis-publicos/[id]/page.tsx`:

```typescript
import RealEstateSchema from '@/components/seo/RealEstateSchema';

export default async function ImovelDetalhePage({ params }: Props) {
  const imovel = await getImovel(params.id);
  
  return (
    <>
      <RealEstateSchema imovel={imovel} />
      {/* resto do código */}
    </>
  );
}
```

---

### **FASE 10: Testes (1 hora)**

15. **Testar localmente:**
```bash
npm run dev
```

Acessar e verificar:
- http://localhost:3000/imoveis-salto
- http://localhost:3000/imoveis-itu
- http://localhost:3000/imoveis-indaiatuba

16. **Verificar Schema Markup:**
- Usar: https://validator.schema.org/
- Colar URL de cada página
- Verificar se não há erros

17. **Testar responsividade:**
- Chrome DevTools (F12)
- Testar em mobile, tablet, desktop

---

### **FASE 11: Deploy (30 minutos)**

18. **Fazer deploy:**
```bash
git add .
git commit -m "Implementar SEO local para Salto, Itu e Indaiatuba"
git push origin main
```

19. **Verificar deploy:**
- Aguardar build finalizar
- Acessar páginas em produção
- Verificar se tudo está funcionando

---

## 🎯 MÉTRICAS PARA ACOMPANHAR

### **Google Search Console (Semanal)**
- Impressões nas buscas
- Cliques nas buscas
- CTR (taxa de cliques)
- Posição média das palavras-chave

### **Google Analytics (Semanal)**
- Visitas às páginas de cidade
- Taxa de conversão (formulários enviados)
- Tempo na página
- Taxa de rejeição

### **Google Meu Negócio (Semanal)**
- Visualizações do perfil
- Cliques no site
- Solicitações de direção
- Chamadas telefônicas

---

## 📊 PALAVRAS-CHAVE PARA MONITORAR

### **Salto:**
- "imobiliária salto"
- "apartamento para alugar salto"
- "casas salto sp"
- "imóveis portal das águas"

### **Itu:**
- "imobiliária itu"
- "apartamento itu"
- "casas para alugar itu"
- "imóveis cidade nova itu"

### **Indaiatuba:**
- "imobiliária indaiatuba"
- "apartamento indaiatuba"
- "casas morada do sol"
- "imóveis indaiatuba"

---

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### **Problema: Páginas não aparecem no Google**
**Solução:** 
- Verificar se o sitemap foi submetido
- Solicitar indexação manual no Google Search Console
- Aguardar 7-14 dias

### **Problema: Erros no Schema Markup**
**Solução:**
- Validar em https://validator.schema.org/
- Verificar se todos os campos obrigatórios estão preenchidos
- Corrigir sintaxe JSON

### **Problema: Imagens não carregam**
**Solução:**
- Verificar URLs das imagens
- Garantir que imagens existem no banco de dados
- Adicionar placeholder para imóveis sem foto

---

## 🚀 PRÓXIMOS PASSOS (APÓS IMPLEMENTAÇÃO)

### **Semana 1-2:**
- Monitorar indexação das páginas
- Corrigir problemas técnicos
- Adicionar mais conteúdo (blog)

### **Semana 3-4:**
- Criar páginas de bairros específicos
- Otimizar meta descriptions baseado em CTR
- Adicionar mais FAQs

### **Mês 2:**
- Análise de concorrência
- Link building local
- Cadastro em diretórios

### **Mês 3:**
- Criar landing pages para tipos específicos
- Implementar remarketing
- A/B testing de títulos

---

## ✅ CHECKLIST FINAL

Antes de considerar a implementação completa, verificar:

- [ ] Todos os componentes foram criados
- [ ] Todas as páginas estão acessíveis
- [ ] Schema Markup validado sem erros
- [ ] Sitemap atualizado e submetido
- [ ] Google Search Console configurado
- [ ] Google Meu Negócio criado
- [ ] Contatos e telefones atualizados
- [ ] Páginas responsivas em todos os dispositivos
- [ ] Imagens com alt text adequado
- [ ] Links internos funcionando
- [ ] CTAs (botões de contato) funcionando
- [ ] Integração com WhatsApp configurada

---

## 📞 SUPORTE

Se encontrar problemas durante a implementação, verifique:
1. Logs do console do navegador (F12)
2. Logs do terminal onde roda `npm run dev`
3. Erros no Google Search Console

---

## 📈 RESULTADOS ESPERADOS

### **Curto Prazo (1-2 meses):**
- Indexação de todas as páginas
- Aparição em buscas locais
- Aumento de 20-30% no tráfego orgânico

### **Médio Prazo (3-6 meses):**
- Posições Top 5 para palavras-chave locais
- Aumento de 50-100% no tráfego orgânico
- Aumento de leads vindos de busca orgânica

### **Longo Prazo (6-12 meses):**
- Domínio das buscas locais em Salto, Itu e Indaiatuba
- Aumento de 100-200% no tráfego orgânico
- ROI positivo do investimento em SEO

---

**Boa implementação! 🚀**
