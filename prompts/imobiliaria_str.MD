# 🏢 Sistema Imobiliário STR — Prompts para Desenvolvimento com IA
**Base tecnológica:** Next.js + TypeScript + TailwindCSS + Prisma + PostgreSQL + Jest + IA integrada  
**Objetivo:** Criar uma aplicação imobiliária profissional com IA capaz de captar leads, analisar mercado e recomendar imóveis conforme o perfil do cliente.

---

## 🔹 PROMPT 1 — Estrutura Inicial do Projeto

Crie a estrutura base de um projeto imobiliário profissional chamado `imobiliaria-str`, desenvolvido em **Next.js + TypeScript**.  
O sistema deve ser modular, preparado para integração futura com IA.  
Configure pastas para `/components`, `/pages`, `/services`, `/database`, `/api`, `/hooks`, `/tests` e `/utils`.  
Implemente o padrão **Clean Architecture** e **SOLID**.  
Prepare o ambiente para uso de **TailwindCSS**, **Prisma** (como ORM), e **PostgreSQL** como banco de dados.  
Inclua setup inicial de testes com **Jest**.  
Crie um arquivo `README.md` com as instruções básicas de instalação e execução do projeto.

---

## 🔹 PROMPT 2 — Banco de Dados e ORM (Prisma + PostgreSQL)

Crie o esquema de banco de dados usando **Prisma ORM** para a Imobiliária STR.  
As tabelas devem incluir:

- **Leads** (id, nome, email, telefone, origem, data_captura, status)  
- **Imóveis** (id, tipo, endereço, cidade, estado, preço, metragem, descrição, disponível, proprietárioId)  
- **Proprietários** (id, nome, telefone, email)  
- **Consultas** (id, leadId, imovelId, data, resultado)  
- **AnálisesMercado** (id, cidade, valor_m2, data_analise, fonte)

Relacione as tabelas adequadamente (1:N e N:N).  
Gere o script de migração inicial e o código de conexão ao banco.  
Crie testes unitários para garantir a criação e leitura das tabelas.

---

## 🔹 PROMPT 3 — Módulo de Captação de Leads via IA

Desenvolva um módulo de **captação inteligente de leads**.  
A IA deve coletar leads automaticamente de fontes externas (ex: formulários no site, redes sociais, campanhas, ou API simulada).  
Ela deve:
- Validar dados (nome, email, telefone);  
- Detectar intenção (compra, venda, aluguel);  
- Classificar a qualidade do lead (frio, morno, quente).

Esses leads devem ser armazenados no banco e exibidos em um dashboard administrativo.  
Implemente também uma **API REST `/api/leads`** com endpoints para CRUD.  
Crie testes unitários e mocks para simular a chegada de leads externos.

---

## 🔹 PROMPT 4 — IA de Análise de Mercado e Aluguéis

Crie um módulo de **análise de valores de mercado e aluguel** usando IA.  
A IA deve cruzar:
- Dados internos de imóveis cadastrados;  
- Dados externos de mercado (valores médios por região e m²);  
- Tendências de preço histórico.

O sistema deve gerar **gráficos comparativos interativos** (usando `recharts` ou `chart.js`) e **relatórios automáticos** com insights de mercado.  
Armazene os resultados na tabela `AnálisesMercado`.  
Inclua testes unitários para verificar cálculos e integridade dos dados.

---

## 🔹 PROMPT 5 — Módulo de Busca Inteligente de Imóveis

Implemente um **mecanismo de busca inteligente**.  
A IA deve interpretar a descrição textual que o cliente digita (ex: “Procuro apartamento de 2 quartos em Osasco até 400 mil”) e:
- Extrair critérios (tipo, cidade, faixa de preço, metragem etc.);  
- Vasculhar o banco de dados;  
- Retornar os imóveis mais adequados.

Inclua uma camada de **ranking de relevância** e filtros avançados (localização, valor, disponibilidade).  
Crie uma interface intuitiva e responsiva para o usuário realizar essa busca.

---

## 🔹 PROMPT 6 — Dashboard Administrativo e Relatórios

Crie um **Dashboard Administrativo** completo.  
Deve conter:
- Gráficos de leads captados por canal e status;  
- Tabela de imóveis disponíveis e em negociação;  
- Indicadores de performance de mercado;  
- Relatórios automáticos da IA.

Use **Tailwind + shadcn/ui** para design moderno e responsivo.  
Adicione exportação de relatórios em PDF e Excel.  
Implemente testes unitários para os principais componentes visuais e funções de cálculo.

---

## 🔹 PROMPT 7 — Módulo de Relatórios e Aconselhamento de Investimento

Implemente um sistema de **relatórios e aconselhamento automatizado**.  
Com base nas análises geradas pela IA, produza:
- Relatórios em linguagem natural (como um resumo explicativo para o gestor ou cliente);  
- Sugestões de investimento (ex: “O valor médio nesta região subiu 12% nos últimos 6 meses. Recomendamos manter o imóvel listado.”).

Esses relatórios devem ser armazenados e acessíveis via painel administrativo.  
Crie testes unitários para validar a geração e formatação dos relatórios.

---

## 🔹 PROMPT 8 — Segurança, Auditoria e Compliance

Implemente **camadas de segurança e auditoria**.  
Cada operação (cadastro, exclusão, atualização) deve gerar um registro de auditoria.  
Use autenticação JWT para o painel administrativo e criptografia para dados sensíveis.  
Crie logs detalhados e função de exportação para fins de compliance.  
Testes unitários devem validar autenticação e integridade das operações.

---

## 🔹 PROMPT 9 — Testes Finais e Deploy

Execute uma rotina de testes unitários e integrados para todos os módulos (Leads, Imóveis, IA, Dashboard, Relatórios e Auditoria).  
Gere uma pipeline de CI/CD (GitHub Actions) que rode os testes e faça deploy automático em ambiente de produção (ex: Vercel ou AWS).  
Inclua um relatório final com métricas de desempenho e cobertura de testes.

---

## 🔹 PROMPT 10 — Manutenção de Contexto e Documentação Técnica

Mantenha o contexto de desenvolvimento da aplicação durante todo o processo.  
Gere documentação técnica automática (em Markdown) explicando:
- Estrutura do projeto  
- Fluxos de IA  
- Modelos de dados  
- Regras de negócio  
- APIs e endpoints  
- Regras de auditoria e segurança  

Atualize a documentação a cada módulo concluído.

---

### 🧠 Observação Final

Esses prompts foram elaborados para orientar a IA na construção de uma **plataforma imobiliária completa, corporativa e funcional**, com foco em:
- Inteligência Artificial aplicada a leads e busca de imóveis  
- Integração com dados externos de mercado  
- Relatórios automáticos e painéis interativos  
- Segurança e compliance corporativo  
- Qualidade e robustez de software (com testes unitários e CI/CD)

---
