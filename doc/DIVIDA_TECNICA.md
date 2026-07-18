# Relatório de Sustentação — Dívida Técnica, Trade-offs e Código Órfão
**Sistema:** ImobiliáriaPerto (imobiliaria-str)
**Repositório:** `github.com/extra1357/imobiliaria-str`
**Método:** análise estática do código-fonte (clone local, `main`), não apenas do README
**Data:** julho de 2026

> Este documento é focado em manutenção/sustentação (escala e sustaining engineering): o que existe no código que não aparece na documentação funcional, o que é risco real, o que é decisão consciente (trade-off) e o que é lixo esquecido (órfão). Cada achado inclui como reproduzi-lo.

---

## 1. Resumo executivo

| # | Achado | Categoria | Severidade |
|---|---|---|---|
| 1 | `JWT_SECRET` tem **3 valores de fallback diferentes** em arquivos distintos | Segurança / Dívida crítica | 🔴 Alta |
| 2 | 14 de 19 pontos que instanciam `PrismaClient` **não usam singleton** | Confiabilidade / Escala | 🔴 Alta |
| 3 | 4 páginas de gestão (`/gerenciador-imoveis`, `/proprietarios`, `/proprietarios/novo`, `/toolbox`) ficam **fora do escopo do middleware de autenticação** | Segurança | 🟠 Média-Alta |
| 4 | Arquivo órfão `src/Ddw` é uma **versão antiga e divergente do middleware** de segurança, ainda no repositório | Código órfão / Segurança | 🟠 Média |
| 5 | `base-service.ts` existe em **3 versões divergentes** (raiz, `services/`, `api/leads/`) | Dívida arquitetural | 🟠 Média |
| 6 | Imagens de imóveis salvas como **base64 no banco** — SDKs de storage (S3, Vercel Blob) instalados mas nunca usados | Trade-off não resolvido | 🟠 Média-Alta |
| 7 | Scripts `npm run scan` / `npm run fix` apontam para arquivos que **não existem** no repositório | Dívida / CI quebrado | 🟡 Média |
| 8 | 5 arquivos ainda com **corrupção de encoding UTF-8** (mojibake), fora do escopo já corrigido no Footer | Qualidade | 🟡 Média |
| 9 | Suíte de testes = **1 arquivo**, sem mocks/seed/teardown, depende de servidor local rodando | Cobertura de testes | 🟡 Média |
| 10 | 6 dependências instaladas e **nunca importadas** (`next-auth`, `swiper`, `react-medium-image-zoom`, `decimal.js`, `@aws-sdk/client-s3`, `@vercel/blob`) | Dívida / bundle | 🟢 Baixa |
| 11 | 339 ocorrências de `any` no TypeScript | Qualidade de tipos | 🟢 Baixa |
| 12 | 129 chamadas de `console.log`/`console.error` espalhadas, sem logger estruturado | Observabilidade | 🟢 Baixa |
| 13 | Regra `*.backup` no `.gitignore` não cobre `*.backup.tsx` — permitiu vazamento de 2 arquivos de backup pro Git | Higiene de repositório | 🟢 Baixa |
| 14 | Módulos `api/server.py` e `core/*.py` na raiz são um protótipo de agente **não executável** (imports quebrados) | Código órfão | 🟡 Média |

---

## 2. Dívidas técnicas críticas (detalhado)

### 2.1 `JWT_SECRET` com três fallbacks divergentes 🔴

O segredo usado para assinar/verificar o JWT não é único no código — existem **três strings de fallback diferentes**, usadas quando a variável de ambiente não está definida:

| Arquivo | Fallback |
|---|---|
| `src/middleware.ts` | `'TROQUE_AQUI'` |
| `src/lib/auth.ts` | `'TROQUE_ESTA_CHAVE'` |
| `src/app/api/auth/login/route.ts` | `'TROQUE'` |
| `src/Ddw` (órfão, ver 3.1) | `'TROQUE'` |

**Risco real:** se `JWT_SECRET` não estiver setado em algum ambiente (staging, preview da Vercel, container local), o token gerado no login (`auth.ts`) é assinado com um segredo e validado no middleware (`middleware.ts`) com **outro segredo** — todo login falha silenciosamente com "token inválido", um bug muito difícil de diagnosticar porque não aparece em ambiente com `.env` correto.

**Como reproduzir:**
```bash
grep -rn "TROQUE" src
```

**Recomendação:** centralizar a leitura do `JWT_SECRET` em um único módulo (`src/lib/env.ts` ou similar) que **falha o build/boot** se a variável não estiver definida em produção, em vez de usar fallback silencioso.

---

### 2.2 `PrismaClient` instanciado sem singleton na maioria das rotas 🔴

O padrão correto em Next.js + Prisma (documentado pela própria Prisma para evitar esgotar conexões em serverless) é usar uma instância global reaproveitada entre requisições. Apenas **5 arquivos** seguem esse padrão; os outros **14** criam uma instância nova a cada import:

**Usam singleton corretamente (`globalForPrisma`):**
- `src/base-service.ts`, `src/database/prisma-client.ts`, `src/lib/prisma.ts`, `src/app/api/auth/solicitar-reset/route.ts`, `src/app/api/corretores/[id]/route.ts`

**Instanciam `new PrismaClient()` direto (sem singleton):**
`src/app/admin/analise-mercado/route/route.ts`, `src/app/imoveis/route.ts`, `src/app/api/auth/redefinir-senha/route.ts`, `src/app/api/auth/route.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/imoveis/[id]/route.ts`, `src/app/api/usuarios/route.ts`, `src/app/api/usuarios/[id]/route.ts`, `src/app/api/leads/base-service.ts`, `src/app/api/leads/route.ts`, `src/app/api/consultas/route.ts`, `src/app/api/consultas/funil/route.ts`, `src/app/api/proprietarios/route.ts`, `src/app/sitemap.ts`

**Risco real:** o banco é **Neon PostgreSQL serverless**, que tem limite de conexões simultâneas relativamente baixo no plano padrão. Em picos de tráfego (ou em cold starts simultâneos na Vercel), cada rota acima abre uma conexão nova sem fechar a anterior — o sintoma típico é erro `too many connections` ou timeouts intermitentes, difícil de reproduzir localmente porque em dev geralmente há pouca concorrência.

**Como reproduzir:**
```bash
grep -rln "new PrismaClient" src | grep -v node_modules
grep -rl "globalForPrisma" src | grep -v node_modules   # os que fazem certo
```

**Recomendação:** unificar todos os pontos para importar de um único `src/lib/prisma.ts` (o singleton já existe e está correto — o problema é que nem todo mundo usa). É um refactor mecânico, baixo risco, alto retorno.

---

### 2.3 Rotas de gestão fora do escopo do middleware de autenticação 🟠

O `middleware.ts` protege apenas o que casa com o `matcher`:
```ts
export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
```

Só que existem páginas de **gestão administrativa** (CRUD de imóveis, cadastro de proprietários, painel de navegação interna) que **não vivem sob `/admin`**, logo o middleware simplesmente não roda para elas:

| Rota | O que é | Proteção atual |
|---|---|---|
| `/gerenciador-imoveis` | CRUD de imóveis (ativar/arquivar, editar status) | Nenhuma — só `robots: { index: false }` |
| `/proprietarios` | Listagem de proprietários | Nenhuma |
| `/proprietarios/novo` | Cadastro de proprietário | Nenhuma |
| `/toolbox` | Painel de navegação interna (lista rotas administrativas) | Nenhuma |

**Risco real:** `robots: { index: false, follow: false }` impede indexação pelo Google, **não** impede acesso direto por URL. Qualquer pessoa com o link consegue abrir essas páginas no navegador. O impacto prático depende de quais chamadas de API elas fazem por baixo (as APIs em `/api/*` continuam protegidas pelo middleware), mas a própria **interface de gestão fica exposta** — inclusive listando estrutura interna do sistema, como o `/toolbox` faz explicitamente.

**Como reproduzir:** acessar diretamente (sem login) `https://www.imobiliariaperto.com.br/toolbox` ou `/gerenciador-imoveis`.

**Recomendação:** mover essas quatro rotas para dentro de `/admin/*` (o padrão que já é protegido), ou ajustar o `matcher` do middleware para cobrir explicitamente essas rotas legadas.

---

### 2.4 `src/Ddw` — versão antiga e divergente do middleware, ainda versionada 🟠

Existe um arquivo chamado `src/Ddw` (sem extensão, 250 linhas) cujo conteúdo é, na prática, **uma versão anterior do `src/middleware.ts`** — mesmo cabeçalho de comentário (`🛡️ MIDDLEWARE DE SEGURANÇA`), mesma lista de `PUBLIC_ROUTES`, mas com regras diferentes das do middleware ativo hoje (por exemplo, essa versão antiga inclui `/imoveis` inteiro como rota pública, enquanto o middleware atual não lista `/imoveis` da mesma forma).

Esse arquivo **não é importado por nada** — é código morto — mas o nome sem extensão (`Ddw`, sem `.ts`) sugere fortemente um acidente de escrita via terminal (heredoc/PowerShell), coerente com o processo de trabalho conhecido do time (arquivos grandes colados via `$content = @'...'@` no PowerShell, com risco de truncamento e nomes de arquivo errados).

**Risco real:** baixo diretamente (não roda), mas é uma **fonte de confusão real para quem for mexer em segurança** — alguém pode editar `Ddw` pensando que é o middleware ativo, ou usá-lo como referência e reintroduzir uma regra de acesso público já removida por motivo de segurança.

**Como reproduzir:**
```bash
file src/Ddw && diff src/Ddw src/middleware.ts
```

**Recomendação:** remover o arquivo. Se houver dúvida sobre qual versão é a correta, o `src/middleware.ts` atual é o que está de fato no `matcher`/build — ele é a fonte da verdade.

---

### 2.5 `base-service.ts` triplicado e divergente 🟠

Existem três arquivos com o mesmo nome, mesma intenção (classe base para camada de serviço com acesso ao Prisma), mas **implementações diferentes**:

| Arquivo | Fonte do Prisma | Tratamento de erro |
|---|---|---|
| `src/base-service.ts` | Singleton local (`globalForPrisma`) | Sem `handleError`/`validate` |
| `src/services/base-service.ts` | Importa de `@/database/prisma-client` | Tem `handleError` e `validate` (schema genérico `any`) |
| `src/app/api/leads/base-service.ts` | `new PrismaClient()` direto (sem singleton) | Tem `handleError` e `validate` (tipado com `z.ZodSchema`) |

**Risco real:** três padrões de "camada de serviço" coexistindo é sintoma de que o projeto não convergiu numa arquitetura de acesso a dados — cada dev/sessão de trabalho recriou a abstração do zero. Isso dificulta manutenção (qual usar em código novo?) e reforça o problema 2.2, já que a versão usada em `api/leads` não usa singleton.

**Recomendação:** escolher uma única versão como canônica (a de `src/services/base-service.ts` parece a mais madura, exceto pelo `schema: any` que deveria virar `z.ZodSchema` como na versão de `leads`), apagar as outras duas e migrar os usos.

---

### 2.6 Corrupção de encoding UTF-8 ainda presente em 5 arquivos 🟡

O relatório de manutenção interno (`doc/README.md`) documenta a correção de mojibake (`Ã¡`, `Ã§`, `â€™`...) no `Footer.tsx`, atribuída a edições via PowerShell sem encoding explícito. A correção **não foi generalizada**: os mesmos padrões de corrupção continuam em:

- `src/app/gerenciador-imoveis/page.tsx`
- `src/app/imoveis-publicos/page.tsx`
- `src/app/proprietarios/page.tsx`
- `src/app/proprietarios/novo/page.tsx`
- `src/app/toolbox/page.tsx`

Não é coincidência que sejam exatamente as páginas apontadas na seção 2.3 como "fora do `/admin`" — tudo indica que são páginas mais antigas, de uma fase anterior do projeto, que não passaram pelas rodadas de manutenção mais recentes.

**Como reproduzir:**
```bash
grep -rlE "Ã©|Ã£|Ã§|Ã³|â€™|â€œ|â€" src --include="*.tsx" --include="*.ts" | grep -v node_modules
```

**Recomendação:** aplicar o mesmo processo já usado no Footer (`Get-Content -Encoding UTF8` + `WriteAllText` com `UTF8` explícito) nesses 5 arquivos.

---

### 2.7 Scripts de `package.json` quebrados 🟡

O `package.json` define:
```json
"scan": "node scanner-tipos.js",
"fix": "node corrigir-tipos.js",
"scan:watch": "nodemon scanner-tipos.js --watch src",
"validate": "npm run scan"
```
Nenhum dos dois arquivos (`scanner-tipos.js`, `corrigir-tipos.js`) existe no repositório. `npm run scan`, `npm run fix`, `npm run scan:watch` e `npm run validate` falham imediatamente com `Cannot find module`.

**Recomendação:** ou os scripts foram removidos por engano em algum "chore: limpeza do repositório" (há um commit com esse nome no histórico) e precisam ser restaurados, ou as entradas em `package.json` devem ser removidas para não confundir quem tenta rodar `npm run validate` esperando uma checagem de tipos.

---

### 2.8 Cobertura de testes mínima e frágil 🟡

Toda a suíte de testes automatizados é um único arquivo, `__tests__/integration/api.test.ts`, com 2 casos:

```ts
const baseUrl = 'http://localhost:3000/api'
// POST /leads cria lead
// GET /leads retorna lista
```

Características que limitam seu valor como rede de segurança:
- Depende de um **servidor Next.js já rodando** em `localhost:3000` — não sobe a aplicação, não roda em isolamento, não funciona "out of the box" num pipeline de CI sem um passo extra de `npm run dev &` antes.
- Sem mocks: bate no banco **real** configurado em `DATABASE_URL`, criando um `Lead` de teste (`test@test.com`) a cada execução, sem teardown — o banco de desenvolvimento acumula lixo de teste indefinidamente.
- Cobre só o domínio de Leads. Nenhum teste automatizado para autenticação, RBAC do middleware, vendas, aluguéis, comissões ou o fluxo de upload de imagem.

**Recomendação:** não é preciso reescrever tudo — o ganho mais barato é isolar um banco de teste (ou usar `prisma migrate reset` num schema dedicado) e adicionar teardown (`afterAll` deletando os registros criados), o que já tornaria a suíte segura para rodar em CI.

---

## 3. Trade-offs conhecidos (decisões conscientes, não "erros")

Estes itens não são bugs — são escolhas que fizeram sentido em algum momento, mas que carregam um custo que vale registrar para quem for decidir se e quando revisitá-las.

### 3.1 Imagens de imóveis em base64 no banco de dados

- **Decisão atual:** `FormularioImovelProfissional.tsx` comprime a imagem no cliente (`canvas.toDataURL('image/jpeg', 0.7)`) e envia a string base64 para `/api/imoveis/cadastro`, que grava direto no campo `imagens String[]` do Postgres.
- **Por que provavelmente foi feito assim:** é a forma mais rápida de implementar upload sem configurar um bucket, credenciais e URL pública — resolve o problema imediato (imóvel precisa de foto) com uma linha de código a mais no schema, zero infraestrutura nova.
- **Custo carregado:** consumo de armazenamento do Neon cresce com cada imagem (base64 é ~33% maior que o binário original); toda vez que a lista de imóveis é carregada, o payload da resposta HTTP inclui todas as imagens em texto, o que já foi identificado internamente como causa de Performance baixa no PageSpeed Insights.
- **Evidência de que a solução "correta" já foi cogitada, mas não implementada:** `@aws-sdk/client-s3` e `@vercel/blob` estão instalados em `package.json` — nenhum dos dois é importado em nenhum lugar do código (`grep` não retorna resultado). Ou seja, alguém chegou a planejar a migração e não terminou.
- **Quando revisitar:** se o número de imóveis ativos crescer, ou se o consumo da franquia do Neon virar custo relevante — o trade-off que hoje "economiza tempo de dev" passa a "custar dinheiro de infra e performance".

### 3.2 Fluxo de escrita de código via PowerShell heredoc no Windows

- **Decisão atual (processo, não código):** arquivos novos são colados no terminal via `$content = @'...'@` + `[System.IO.File]::WriteAllText(...)`, em vez de um editor.
- **Custo carregado:** é a causa mais provável de pelo menos dois achados deste relatório — o arquivo `src/Ddw` sem extensão (nome truncado/errado numa colagem) e o histórico de corrupção de encoding UTF-8 (Windows-1252 sendo usado por padrão quando o encoding não é passado explicitamente no `WriteAllText`).
- **Quando revisitar:** vale considerar esse processo como uma dívida técnica *de workflow*, não só de código — arquivos acima de ~60 linhas já são divididos em partes por causa de truncamento conhecido; a raiz do problema (colar código grande direto no console) continua.

### 3.3 Middleware cobrindo só `/admin` e `/api`, não todo o app

- **Decisão atual:** o `matcher` do middleware é deliberadamente restrito a duas árvores de rota, provavelmente por performance (Edge Middleware roda em toda requisição que casar o matcher; cobrir `/*` inteiro adicionaria overhead a páginas 100% públicas).
- **Custo carregado:** como mostrado na seção 2.3, esse desenho deixa qualquer página nova criada fora de `/admin` **sem proteção por padrão** — o oposto de "seguro por padrão". Quem cria uma página administrativa precisa **lembrar** de colocá-la sob `/admin`, e isso já falhou pelo menos 4 vezes.
- **Quando revisitar:** ao criar qualquer página nova com dados sensíveis, ou considerar inverter a lógica (proteger tudo por padrão, com uma lista explícita de exceções públicas — que já existe como `PUBLIC_ROUTES`/`PUBLIC_APIS`, só que aplicada ao universo errado).

---

## 4. Código órfão — inventário completo

| Item | Localização | Situação |
|---|---|---|
| Protótipo de agente Python não executável | `api/server.py`, `core/orchestrator.py`, `core/tool_registry.py`, `core/llm_router.py` | Importa módulos inexistentes (`workflows.autonomous_pipeline`, `agents.*`, `tools.default_tools`); não roda. Não é o agente Sofia real (esse vive no repo separado `imobiliaria-agente`). |
| Middleware antigo | `src/Ddw` | Versão anterior e divergente de `src/middleware.ts`, sem extensão `.ts`, não importado em lugar nenhum. Ver 2.4. |
| Backups de layout versionados | `src/app/admin/layout.backup.tsx`, `src/app/admin/page.backup.tsx` | Deveriam ter sido ignorados pelo `.gitignore` (regra `*.backup`), mas como a extensão real é `.tsx`, a regra não pega. Ver seção 5.1. |
| Lógica de busca de imóveis duplicada | `src/lib/antigo` | Arquivo sem extensão contendo uma versão anterior de `buscarImoveis()`, sobreposta pela versão atual em `src/lib/imoveis.ts`. |
| `base-service.ts` triplicado | `src/base-service.ts`, `src/services/base-service.ts`, `src/app/api/leads/base-service.ts` | Três implementações divergentes da mesma abstração. Ver 2.5. |
| Endpoint duplicado fora do padrão `/api` | `src/app/imoveis/route.ts` | Expõe `GET /imoveis?id=...` fora da árvore `/api`, duplicando o que `/api/imoveis/[id]` já faz, e fora do escopo do middleware (embora seja uma leitura pública, quebra o padrão arquitetural do resto do projeto). |
| Scripts de `package.json` sem arquivo correspondente | `scanner-tipos.js`, `corrigir-tipos.js` | Referenciados em 4 scripts npm, arquivos não existem no repo. |

---

## 5. Achados menores (qualidade / higiene)

### 5.1 `.gitignore` não cobre os backups que gera

```
# Backups
backups/
backup_*/
*.backup
```
`*.backup` casa apenas com arquivos que **terminam** em `.backup` (ex.: `layout.backup`), não com `layout.backup.tsx`. Como o projeto nomeia backups como `<nome>.backup.tsx`, a regra nunca funciona na prática — daí os dois arquivos da seção 4 estarem versionados.

**Correção sugerida:** trocar por `*.backup.*` ou `*backup*`.

### 5.2 Dependências instaladas e nunca importadas

```bash
# comando usado para verificar cada uma:
grep -rl "<pacote>" src --include="*.ts" --include="*.tsx" | grep -v node_modules
```

| Pacote | Uso encontrado |
|---|---|
| `next-auth` | Nenhum |
| `swiper` | Nenhum |
| `react-medium-image-zoom` | Nenhum |
| `decimal.js` | Nenhum |
| `@aws-sdk/client-s3` | Nenhum (ver trade-off 3.1) |
| `@vercel/blob` | Nenhum (ver trade-off 3.1) |
| `resend` | ✅ Usado em `src/app/api/auth/solicitar-reset/route.ts` |

Cada dependência não usada aumenta `node_modules`, tempo de `npm install` e superfície de auditoria de segurança (`npm audit`) sem benefício.

### 5.3 Tipagem `any` (339 ocorrências)

```bash
grep -ro ": any\b\|<any>\|as any" src --include="*.ts" --include="*.tsx" | wc -l
```
Alto uso de `any` reduz o valor do TypeScript como rede de segurança — erros que o compilador pegaria em tempo de build só aparecem em runtime. Não é bloqueante, mas é um indicador de saúde do código a monitorar (ex.: configurar `no-explicit-any` como *warning* no ESLint e medir a tendência ao longo do tempo, em vez de proibir de uma vez).

### 5.4 Logging não estruturado

129 ocorrências de `console.log`/`console.error`/`console.warn` espalhadas pelo código, sem correlação de request-id, sem níveis configuráveis por ambiente. Em produção na Vercel isso vai para o log da função serverless, mas sem estrutura (JSON) fica difícil de filtrar/agregar num observability tool depois.

### 5.5 Line endings mistos (CRLF)

O `Dockerfile` e ao menos um `route.ts` (`src/app/api/auth/route.ts`) têm `\r\n` (CRLF) em vez de `\n` — sintoma direto do desenvolvimento em Windows/PowerShell sem `.gitattributes` normalizando o encoding de linha. Não quebra nada hoje, mas pode gerar diffs ruidosos e, em edge cases, problemas de parsing dependendo da ferramenta.

---

## 6. Matriz de priorização sugerida

| Ação | Risco se ignorado | Esforço estimado | Prioridade |
|---|---|---|---|
| Unificar `JWT_SECRET` num único ponto, sem fallback silencioso | Login quebra de forma intermitente e difícil de debugar | Baixo (1 arquivo + validação de boot) | 🔴 Imediata |
| Migrar todas as rotas para o `PrismaClient` singleton | Falhas em produção sob carga (limite de conexões Neon) | Médio (refactor mecânico em ~14 arquivos) | 🔴 Imediata |
| Mover `/gerenciador-imoveis`, `/proprietarios*`, `/toolbox` para dentro de `/admin` (ou ajustar matcher) | Exposição de UI de gestão sem autenticação | Baixo-Médio | 🟠 Curto prazo |
| Remover `src/Ddw`, `src/lib/antigo`, os `.backup.tsx` | Confusão em manutenções futuras, risco de reintroduzir regra de acesso removida | Baixo (é só deletar + validar que nada importa) | 🟠 Curto prazo |
| Consolidar os 3 `base-service.ts` em um só | Inconsistência arquitetural cresce a cada feature nova | Médio | 🟡 Médio prazo |
| Decidir o destino de `api/server.py` / `core/*.py` (completar, isolar em outro repo, ou remover) | Ambiguidade sobre o que é o "agente real" do sistema | Baixo (decisão) + variável (execução) | 🟡 Médio prazo |
| Corrigir encoding dos 5 arquivos restantes | Texto quebrado visível ao usuário nessas páginas | Baixo | 🟡 Médio prazo |
| Restaurar ou remover `scanner-tipos.js`/`corrigir-tipos.js` e os scripts npm associados | `npm run validate` quebrado, falsa sensação de que há checagem automatizada | Baixo | 🟢 Quando conveniente |
| Adicionar teardown/isolamento à suíte de testes | Testes sujam o banco real e não rodam em CI | Médio | 🟢 Quando conveniente |
| Remover dependências não usadas | Bundle e superfície de auditoria maiores que o necessário | Baixo | 🟢 Quando conveniente |
| Migrar imagens de base64 para S3/Blob (trade-off 3.1) | Custo de infra e performance crescem com o catálogo de imóveis | Alto (schema + migração de dados existentes) | 🟠 Avaliar por volume |

---

## 7. Como este relatório foi produzido

Todos os achados vêm de inspeção direta do código-fonte (clone raso da branch `main`), não de suposição. Os comandos-chave usados, para permitir reprodução ou automação futura (ex.: como *lint* de sustentação em CI):

```bash
# Fallbacks de JWT divergentes
grep -rn "TROQUE" src

# PrismaClient sem singleton
grep -rln "new PrismaClient" src | grep -v node_modules
grep -rl "globalForPrisma" src | grep -v node_modules

# Encoding corrompido
grep -rlE "Ã©|Ã£|Ã§|Ã³|â€™|â€œ|â€" src --include="*.tsx" --include="*.ts" | grep -v node_modules

# Arquivos backup/órfãos versionados por engano
find . -iname "*.backup*" -o -iname "*_old*" -o -iname "*antigo*" | grep -v node_modules | grep -v ".git/"

# Dependências não usadas (repetir por pacote)
grep -rl "<nome-do-pacote>" src --include="*.ts" --include="*.tsx" | grep -v node_modules

# Scripts npm quebrados
ls scanner-tipos.js corrigir-tipos.js   # ambos ausentes

# Uso de any / console.*
grep -ro ": any\b\|<any>\|as any" src --include="*.ts" --include="*.tsx" | wc -l
grep -ro "console\.\(log\|error\|warn\)" src --include="*.ts" --include="*.tsx" | wc -l
```

---

## 8. Próximos passos sugeridos

1. Tratar os itens 🔴 da seção 6 como um "bloco único" de sustentação — ambos são pequenos individualmente e têm risco desproporcional ao esforço.
2. Depois de resolver os 🔴, rodar novamente os comandos da seção 7 num script (`npm run debt-check`, por exemplo) e versionar esse script — transforma este relatório manual num check recorrente, em vez de um evento único.
3. Ao decidir o destino de `api/`/`core/` (item médio prazo), documentar a decisão em um `ADR` (Architecture Decision Record) simples, para que a próxima pessoa não precise reconstruir esse raciocínio do zero.
