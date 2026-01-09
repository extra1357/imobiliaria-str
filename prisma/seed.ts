import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed completo no padrão STR Production...\n')

  // Limpar ordem correta (tabelas dependentes primeiro)
  await prisma.consulta.deleteMany()
  await prisma.historico.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.imovel.deleteMany()
  await prisma.proprietario.deleteMany()
  await prisma.analiseMercado.deleteMany()
  await prisma.relatorio.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.auditoria.deleteMany()
  
  console.log('➡️  Dados antigos apagados de todas as tabelas (Auditoria, Relatórios, etc)')

  // ========================================
  // USUÁRIOS
  // ========================================
  const senhaHash = await bcrypt.hash('admin123', 10)
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Administrador STR',
      email: 'admin@str.com',
      senha: senhaHash,
      role: 'admin'
    }
  })
  console.log('➡️  Usuário admin criado')

  // ========================================
  // PROPRIETÁRIOS
  // ========================================
  const prop1 = await prisma.proprietario.create({
    data: { nome: 'João Silva', telefone: '11987654321', email: 'joao@email.com', cpf: '12345678900' }
  })
  const prop2 = await prisma.proprietario.create({
    data: { nome: 'Maria Souza', telefone: '11976543210', email: 'maria.souza@email.com', cpf: '98765432100' }
  })
  const prop3 = await prisma.proprietario.create({
    data: { nome: 'Pedro Alvares', telefone: '11965432109', email: 'pedro.alvares@email.com', cpf: '45678912300' }
  })
  console.log('➡️  Proprietários criados (3)')

  // ========================================
  // IMÓVEIS (Ajustados com Múltiplas Imagens para Swiper/Zoom)
  // ========================================
  const imovel1 = await prisma.imovel.create({
    data: {
      tipo: 'Apartamento',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      preco: 450000,
      metragem: 80,
      quartos: 2,
      banheiros: 2,
      vagas: 1,
      descricao: 'Apartamento moderno com sala ampla, acabamento premium e automação residencial.',
      status: 'ATIVO',
      disponivel: true,
      proprietarioId: prop1.id,
      imagens: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1000',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1000'
      ]
    }
  })

  const imovel2 = await prisma.imovel.create({
    data: {
      tipo: 'Casa',
      endereco: 'Av. Brasil, 500',
      cidade: 'Salto',
      estado: 'SP',
      preco: 250000,
      metragem: 120,
      quartos: 3,
      banheiros: 2,
      vagas: 2,
      descricao: 'Casa com quintal amplo, área gourmet com churrasqueira e excelente iluminação natural.',
      status: 'ATIVO',
      disponivel: true,
      proprietarioId: prop2.id,
      imagens: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000'
      ]
    }
  })

  const imovel3 = await prisma.imovel.create({
    data: {
      tipo: 'Sobrado',
      endereco: 'Rua das Palmeiras, 789',
      cidade: 'Campinas',
      estado: 'SP',
      preco: 680000,
      metragem: 180,
      quartos: 4,
      banheiros: 4,
      vagas: 3,
      descricao: 'Sobrado novo com 4 suítes, acabamento em porcelanato e piscina privativa.',
      status: 'ATIVO',
      disponivel: true,
      proprietarioId: prop1.id,
      imagens: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000',
        'https://images.unsplash.com/photo-1600607687940-4e524cb35297?q=80&w=1000'
      ]
    }
  })

  // Imóveis Inativos para teste de filtro
  await prisma.imovel.create({
    data: {
      tipo: 'Apartamento', endereco: 'Rua Augusta, 456', cidade: 'São Paulo', estado: 'SP',
      preco: 520000, metragem: 95, quartos: 3, banheiros: 2, vagas: 1,
      descricao: 'Vendido recentemente', status: 'VENDIDO', disponivel: false, proprietarioId: prop2.id,
      imagens: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1000']
    }
  })

  console.log('➡️  Imóveis criados (Ativos e Inativos) com suporte a Swiper')

  // ========================================
  // LEADS
  // ========================================
  const lead1 = await prisma.lead.create({
    data: { nome: 'Maria Santos', email: 'maria@gmail.com', telefone: '11999999999', origem: 'site', status: 'quente' }
  })
  const lead2 = await prisma.lead.create({
    data: { nome: 'Pedro Costa', email: 'pedro@hotmail.com', telefone: '11988888888', origem: 'redes-sociais', status: 'morno' }
  })
  console.log('➡️  Leads criados (2)')

  // ========================================
  // HISTÓRICO
  // ========================================
  await prisma.historico.create({
    data: {
      leadId: lead1.id,
      tipo: 'WHATSAPP',
      detalhes: 'Cliente confirmou interesse na visita após ver fotos do Apartamento em SP.'
    }
  })
  console.log('➡️  Histórico de atendimento inicial criado')

  // ========================================
  // CONSULTAS
  // ========================================
  await prisma.consulta.create({
    data: {
      leadId: lead1.id,
      imovelId: imovel1.id,
      tipo: 'visita',
      status: 'agendada',
      observacoes: 'Cliente quer visitar no sábado às 14h'
    }
  })

  console.log('\n🎉 Seed finalizado com sucesso no padrão STR Production!')
}

main()
  .catch(e => { console.error('❌ Erro no seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
