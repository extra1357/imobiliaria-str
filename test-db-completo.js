const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarBancoCompleto() {
  console.log('='.repeat(60));
  console.log('🔍 TESTE COMPLETO DO BANCO DE DADOS');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. TESTE DE CONEXÃO
    console.log('📡 1. Testando conexão com o banco...');
    await prisma.$connect();
    console.log('   ✅ Conexão estabelecida com sucesso!\n');

    // 2. VERIFICAR TABELAS
    console.log('📊 2. Verificando estrutura do banco...');
    const tabelas = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log(`   ✅ ${tabelas.length} tabelas encontradas:`);
    tabelas.forEach(t => console.log(`      - ${t.table_name}`));
    console.log('');

    // 3. CONTAGEM DE REGISTROS
    console.log('📈 3. Contando registros existentes...');
    const counts = {
      leads: await prisma.lead.count(),
      proprietarios: await prisma.proprietario.count(),
      imoveis: await prisma.imovel.count(),
      consultas: await prisma.consulta.count(),
      usuarios: await prisma.usuario.count(),
      auditorias: await prisma.auditoria.count(),
      analisesMercado: await prisma.analiseMercado.count(),
      relatorios: await prisma.relatorio.count()
    };
    
    console.log('   Registros por tabela:');
    Object.entries(counts).forEach(([tabela, count]) => {
      console.log(`      ${tabela.padEnd(20)} : ${count}`);
    });
    console.log('');

    // 4. TESTE DE CRIAÇÃO - PROPRIETÁRIO
    console.log('🧪 4. Testando criação de PROPRIETÁRIO...');
    const timestamp = Date.now();
    const novoProprietario = await prisma.proprietario.create({
      data: {
        nome: 'João da Silva Teste',
        telefone: '(11) 98765-4321',
        email: `joao.teste.${timestamp}@email.com`,
        cpf: `${String(timestamp).slice(-11)}`
      }
    });
    console.log(`   ✅ Proprietário criado com ID: ${novoProprietario.id}`);
    console.log(`      Nome: ${novoProprietario.nome}`);
    console.log(`      Email: ${novoProprietario.email}\n`);

    // 5. TESTE DE CRIAÇÃO - IMÓVEL
    console.log('🏠 5. Testando criação de IMÓVEL...');
    const novoImovel = await prisma.imovel.create({
      data: {
        tipo: 'Apartamento',
        endereco: 'Rua das Flores, 123 - Apto 45',
        cidade: 'São Paulo',
        estado: 'SP',
        preco: 450000.00,
        metragem: 75.50,
        descricao: 'Apartamento de teste com 2 quartos, sala, cozinha e banheiro. Próximo ao metrô.',
        proprietarioId: novoProprietario.id,
        disponivel: true,
        status: 'ATIVO',
        imagens: ['imagem1.jpg', 'imagem2.jpg']
      }
    });
    console.log(`   ✅ Imóvel criado com ID: ${novoImovel.id}`);
    console.log(`      Tipo: ${novoImovel.tipo}`);
    console.log(`      Endereço: ${novoImovel.endereco}`);
    console.log(`      Preço: R$ ${novoImovel.preco}\n`);

    // 6. TESTE DE CRIAÇÃO - LEAD
    console.log('👤 6. Testando criação de LEAD...');
    const novoLead = await prisma.lead.create({
      data: {
        nome: 'Maria Santos Teste',
        email: `maria.teste.${timestamp}@email.com`,
        telefone: '(11) 91234-5678',
        origem: 'website',
        status: 'quente'
      }
    });
    console.log(`   ✅ Lead criado com ID: ${novoLead.id}`);
    console.log(`      Nome: ${novoLead.nome}`);
    console.log(`      Email: ${novoLead.email}`);
    console.log(`      Status: ${novoLead.status}\n`);

    // 7. TESTE DE CRIAÇÃO - CONSULTA
    console.log('📅 7. Testando criação de CONSULTA...');
    const novaConsulta = await prisma.consulta.create({
      data: {
        leadId: novoLead.id,
        imovelId: novoImovel.id,
        tipo: 'visita',
        status: 'agendada',
        observacoes: 'Cliente interessado, primeira visita agendada',
        data: new Date()
      }
    });
    console.log(`   ✅ Consulta criada com ID: ${novaConsulta.id}`);
    console.log(`      Tipo: ${novaConsulta.tipo}`);
    console.log(`      Status: ${novaConsulta.status}\n`);

    // 8. TESTE DE LEITURA COM RELACIONAMENTOS
    console.log('🔗 8. Testando leitura com relacionamentos...');
    const imovelComRelacionamentos = await prisma.imovel.findUnique({
      where: { id: novoImovel.id },
      include: {
        proprietario: true,
        consultas: {
          include: {
            lead: true
          }
        }
      }
    });
    console.log(`   ✅ Imóvel recuperado com relacionamentos:`);
    console.log(`      Proprietário: ${imovelComRelacionamentos.proprietario.nome}`);
    console.log(`      Consultas: ${imovelComRelacionamentos.consultas.length}`);
    if (imovelComRelacionamentos.consultas.length > 0) {
      console.log(`      Lead da consulta: ${imovelComRelacionamentos.consultas[0].lead.nome}`);
    }
    console.log('');

    // 9. TESTE DE ATUALIZAÇÃO
    console.log('✏️ 9. Testando atualização de registro...');
    const leadAtualizado = await prisma.lead.update({
      where: { id: novoLead.id },
      data: { status: 'fechado' }
    });
    console.log(`   ✅ Lead atualizado:`);
    console.log(`      Status anterior: quente`);
    console.log(`      Status novo: ${leadAtualizado.status}\n`);

    // 10. TESTE DE BUSCA
    console.log('🔍 10. Testando busca com filtros...');
    const imoveisDisponiveis = await prisma.imovel.findMany({
      where: {
        disponivel: true,
        cidade: 'São Paulo'
      },
      take: 5
    });
    console.log(`   ✅ Encontrados ${imoveisDisponiveis.length} imóveis disponíveis em São Paulo\n`);

    // 11. RESUMO FINAL
    console.log('='.repeat(60));
    console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📊 Resumo dos testes realizados:');
    console.log('   ✓ Conexão com banco de dados');
    console.log('   ✓ Verificação de estrutura');
    console.log('   ✓ Contagem de registros');
    console.log('   ✓ Criação de proprietário');
    console.log('   ✓ Criação de imóvel');
    console.log('   ✓ Criação de lead');
    console.log('   ✓ Criação de consulta');
    console.log('   ✓ Leitura com relacionamentos');
    console.log('   ✓ Atualização de registros');
    console.log('   ✓ Busca com filtros');
    console.log('');
    console.log('🎉 Seu banco de dados está funcionando perfeitamente!');
    console.log('');

  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.log('❌ ERRO ENCONTRADO!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Tipo do erro:', error.constructor.name);
    console.log('Mensagem:', error.message);
    console.log('');
    console.log('Detalhes completos:');
    console.log(error);
    console.log('');
    console.log('='.repeat(60));
    
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com banco encerrada.');
  }
}

// Executar o teste
testarBancoCompleto();
