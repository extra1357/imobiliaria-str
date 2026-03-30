# 📋 Relatório de Manutenção — Imobiliária Perto
**Data:** 29 de março de 2026  
**Horário:** 14:00 – 21:10 BRT  
**Repositório:** `https://github.com/extra1357/imobiliaria-str`  
**Commit:** `4b50b72`  
**Branch:** `main`  
**Ambiente:** Produção — `https://www.imobiliariaperto.com.br`

---

## 1. 🔗 WhatsApp Dinâmico por Proprietário

### Defeito identificado
O botão de contato via WhatsApp em todas as páginas de imóvel apontava para um número genérico fixo, independente do proprietário cadastrado no imóvel. Isso fazia com que o contato chegasse sempre para a mesma pessoa, mesmo que o imóvel pertencesse a outro proprietário.

### Causa raiz
O arquivo `ImovelDetalhes.tsx` usava um número hardcoded no link do WhatsApp, sem buscar o telefone do proprietário associado ao imóvel. Além disso, a query no `imoveis.ts` não fazia `include: { proprietario: true }`, portanto os dados do proprietário nunca chegavam ao componente.

### Medidas adotadas
- Adicionado `include: { proprietario: true }` nas três funções de busca do arquivo `src/lib/imoveis.ts` (`buscarImoveis`, `buscarImovelPorId`, `buscarImovelPorSlug`)
- Adicionados os campos `whatsapp` e `proprietarioNome` no retorno mapeado de cada função
- Atualizado `ImovelDetalhes.tsx` para usar `imovel.whatsapp` dinamicamente, com limpeza de formatação (`replace(/\D/g, '')`) e prefixo DDI `55` garantido
- Gerado script `corrigir-whatsapp.ps1` para substituição local dos arquivos

### Arquivos modificados
- `src/lib/imoveis.ts`
- `src/app/imoveis/[id]/ImovelDetalhes.tsx`

---

## 2. 🦶 Footer — Corrupção UTF-8 e Link Sobre Nós

### Defeito identificado
O componente `Footer.tsx` apresentava corrupção generalizada de encoding UTF-8, com caracteres como `Ã¡`, `ðŸ"`, `â€¢` aparecendo no lugar de acentos, emojis e símbolos. Além disso, o footer não possuía link direto para a página `/sobre`, dificultando o acesso dos visitantes à página institucional.

### Causa raiz
O arquivo foi editado por scripts PowerShell anteriores sem especificação explícita de encoding `UTF8`, fazendo com que o Windows salvasse com encoding `Windows-1252` (padrão do sistema). Isso corrompeu todos os caracteres especiais do arquivo.

### Medidas adotadas
- Leitura do arquivo via `Get-Content -Encoding UTF8` para preservar o conteúdo original
- Reescrita completa do `Footer.tsx` com `[System.IO.File]::WriteAllText(..., [System.Text.Encoding]::UTF8)` garantindo encoding correto
- Corrigidos todos os caracteres especiais: `ã`, `ç`, `é`, `ó`, emojis `📝`, `🏛️`, `📍`
- Adicionado link `<Link href="/sobre">Sobre Nós</Link>` na seção "Links Rápidos", após o link "Início"
- Gerado script `corrigir-footer.ps1` para substituição local

### Arquivos modificados
- `src/app/components/Footer.tsx`

---

## 3. 🔍 SEO — Metadata Ausente ou Genérico

### Defeito identificado
O PageSpeed Insights apontou SEO em **100/100 em produção**, porém o código local (`layout.tsx`, `page.tsx` e `imoveis/[id]/page.tsx`) estava com metadados completamente genéricos ou ausentes:
- `title: "Sistema Imobiliário"` — título de painel interno, não de site público
- `description: "Gerenciamento de Imóveis e Leads"` — linguagem de backoffice
- Nenhum `openGraph`, `twitter card`, `canonical`, `keywords` ou `robots`
- A página principal (`page.tsx`) sem `generateMetadata` dinâmico
- A página de imóvel sem metadata alguma

### Causa raiz
O projeto foi originado de um sistema interno de gestão imobiliária e os metadados nunca foram atualizados para o contexto de site público voltado ao visitante e ao Google.

### Medidas adotadas

#### `src/app/layout.tsx`
- Definido `metadataBase` apontando para `https://www.imobiliariaperto.com.br`
- Configurado `title.default` e `title.template` com nome da marca
- Adicionada `description` completa com cidades atendidas
- Adicionadas `keywords` segmentadas por cidade e tipo de imóvel
- Configurado `openGraph` com `type`, `locale`, `siteName`, `images`
- Configurado `twitter card` com `summary_large_image`
- Definido `alternates.canonical`
- Configurado `robots` com `index: true, follow: true`

#### `src/app/page.tsx`
- Adicionada função `generateMetadata` dinâmica que adapta `title` e `description` conforme os `searchParams`:
  - Filtro por `cidade` → título e description específicos da cidade
  - Filtro por `finalidade=venda` → "Imóveis à Venda..."
  - Filtro por `finalidade=aluguel` → "Imóveis para Alugar..."
  - Sem filtros → metadata padrão da home
- Canonical dinâmico por filtro ativo

#### `src/app/imoveis/[id]/page.tsx`
- Adicionada função `generateMetadata` que busca os dados do imóvel e gera:
  - `title` com tipo e cidade do imóvel
  - `description` com tipo, finalidade, quartos, metragem e preço
  - `openGraph` com imagem real do imóvel
  - `twitter card` com imagem real
  - `canonical` único por imóvel
- Adicionado `notFound()` para imóveis inexistentes

### Arquivos modificados
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/imoveis/[id]/page.tsx`

---

## 4. 🖼️ Logo — Arquivo Extremamente Pesado

### Defeito identificado
O arquivo `public/logo.png` estava com **1.469 KB (1,4 MB)**, um tamanho absurdo para um logotipo usado no footer. Isso impactava diretamente o tempo de carregamento da página, contribuindo para o score de Performance de **58/100** no PageSpeed Insights.

### Causa raiz
O arquivo foi exportado sem otimização, provavelmente direto de um editor gráfico em resolução original, sem passar por nenhum processo de compressão.

### Medidas adotadas
- Gerado backup `logo-original.png` antes de qualquer alteração
- Redimensionamento para largura máxima de 300px (suficiente para uso no footer) mantendo proporção
- Recompressão usando `System.Drawing` do .NET via PowerShell, sem necessidade de instalar ferramentas externas
- Resultado: **1.469 KB → 161 KB** (redução de **89%**)
- Backup removido após confirmação visual de qualidade

### Arquivos modificados
- `public/logo.png`

---

## 5. 🏷️ Favicon — Impacto na Indexação Google

### Defeito identificado
O Google Search Console apontou problema com o favicon impactando a indexação. O arquivo `public/favicon.ico` estava com **159 KB**, tamanho excessivo para um favicon (ideal: 2–10 KB).

### Causa raiz
Arquivo gerado sem otimização, em alta resolução e sem compressão adequada para o formato `.ico`.

### Medidas adotadas
- Problema identificado e corrigido diretamente no Google Search Console pelo usuário
- Aguardando re-rastreamento do Google (prazo estimado: 2–14 dias)
- Recomendação futura: substituir o `favicon.ico` por versão otimizada com menos de 10 KB

### Arquivos a otimizar futuramente
- `public/favicon.ico` (159 KB → meta: < 10 KB)
- `public/apple-touch-icon.png` (57 KB — aceitável)
- `public/icon-512.png` (365 KB — pode ser otimizado)

---

## 6. 🗄️ Imagens — Base64 no Banco de Dados

### Defeito identificado
As imagens dos imóveis estão sendo salvas como **base64 diretamente no banco Neon (PostgreSQL)**, em vez de URLs apontando para um serviço de storage externo. Isso causa:
- Alto consumo da franquia do banco Neon
- Carregamento extremamente lento das páginas de imóvel
- Payload de rede excessivo (cada imagem pode ter centenas de KB em base64)
- Score de Performance 58/100 no PageSpeed Insights

### Causa raiz
O componente `FormularioImovelProfissional.tsx` usa `FileReader.readAsDataURL()` + `canvas.toDataURL('image/jpeg', 0.7)` para comprimir a imagem localmente e envia o resultado base64 diretamente para a API `/api/imoveis/cadastro`, que salva a string no campo `imagens String[]` do banco.

### Status
⚠️ **Pendente** — decidido manter temporariamente enquanto se avalia serviço de storage externo. O Neon teve franquia gratuita esgotada e foi feito upgrade de plano.

### Medidas recomendadas (próxima sprint)
- Migrar para **Supabase Storage** (1 GB gratuito, estável)
- Criar rota `/api/upload` que recebe o arquivo, faz upload para Supabase e retorna a URL pública
- Atualizar `FormularioImovelProfissional.tsx` para enviar a URL em vez do base64
- Executar script de migração para converter base64 existentes no banco para URLs externas

### Arquivos a modificar futuramente
- `src/components/admin/FormularioImovelProfissional.tsx`
- `src/app/api/imoveis/cadastro/route.ts`
- Novo: `src/app/api/upload/route.ts`

---

## 📊 Métricas antes e depois (PageSpeed — Desktop)

| Métrica | Antes (estimado) | Depois (meta) |
|---|---|---|
| Performance | 58 | 75+ |
| SEO | 100 ✅ | 100 ✅ |
| Acessibilidade | 86 | 88+ |
| Práticas recomendadas | 100 ✅ | 100 ✅ |
| Logo (tamanho) | 1.469 KB | 161 KB ✅ |
| CLS | 1.615 ⚠️ | < 0.1 (pendente) |

---

## 📁 Arquivos commitados nesta sessão

```
modified:   package-lock.json
modified:   public/logo.png
modified:   src/app/components/Footer.tsx
modified:   src/app/imoveis/[id]/ImovelDetalhes.tsx
modified:   src/app/imoveis/[id]/page.tsx
modified:   src/app/layout.tsx
modified:   src/app/page.tsx
modified:   src/lib/imoveis.ts
```

**Commit:** `4b50b72`  
**Mensagem:** `feat: SEO completo, footer corrigido, whatsapp dinamico, logo comprimido`

---

## ⏭️ Pendências para próxima sessão

- [ ] Migrar imagens base64 → Supabase Storage
- [ ] Corrigir CLS 1.615 (imagens sem width/height nos cards)
- [ ] Otimizar favicon.ico (159 KB → < 10 KB)
- [ ] Otimizar icon-512.png (365 KB)
- [ ] Melhorar acessibilidade: botões sem aria-label, selects sem label
- [ ] Verificar re-indexação do favicon no Google Search Console
- [ ] Testar SEO dinâmico por imóvel no Google Search Console

---

*Relatório gerado em 29/03/2026 às 21:10 BRT*
