const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarBanco() {
  try {
    console.log('🔍 Testando conexão com o banco...\n');
    
    // 1. Testar contagem de registros
    console.log('📊 Contagem de registros:');
    const leads = await prisma.lead.count();
    const proprietarios = await prisma.proprietario.count();
    const imoveis = await prisma.imovel.count();
    
    console.log(`  Leads: ${leads}`);
    console.log(`  Proprietários: ${proprietarios}`);
    console.log(`  Imóveis: ${imoveis}\n`);
    
    // 2. Testar criação de proprietário
    console.log('🧪 Testando criação de proprietário...');
    const novoProprietario = await prisma.proprietario.create({
      data: {
        nome: 'Teste Silva',
        telefone: '(11) 98765-4321',
        email: `teste${Date.now()}@teste.com`,
        cpf: `${Math.floor(Math.random() * 100000000000)}`
      }
    });
    console.log('✅ Proprietário criado:', novoProprietario.id);
    
    // 3. Testar criação de imóvel
    console.log('\n🧪 Testando criação de imóvel...');
    const novoImovel = await prisma.imovel.create({
      data: {
        tipo: 'Apartamento',
        endereco: 'Rua Teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        preco: 500000,
        metragem: 80,
        descricao: 'Imóvel de teste',
        proprietarioId: novoProprietario.id
      }
    });
    console.log('✅ Imóvel criado:', novoImovel.id);
    
    // 4. Testar criação de lead
    console.log('\n🧪 Testando criação de lead...');
    const novoLead = await prisma.lead.create({
      data: {
        nome: 'Lead Teste',
        email: `lead${Date.now()}@teste.com`,
        telefone: '(11) 91234-5678',
        origem: 'teste'
      }
    });
    console.log('✅ Lead criado:', novoLead.id);
    
    console.log('\n✅ TODOS OS TESTES PASSARAM! O banco está funcionando corretamente.');
    
  } catch (error) {
    console.error('\n❌ ERRO ENCONTRADO:');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('\nDetalhes completos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarBanco();