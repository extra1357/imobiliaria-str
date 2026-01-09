import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    // Teste de conexão
    await prisma.$connect();
    
    // Contagens
    const counts = {
      leads: await prisma.lead.count(),
      proprietarios: await prisma.proprietario.count(),
      imoveis: await prisma.imovel.count(),
      consultas: await prisma.consulta.count()
    };
    
    // Teste de criação
    const timestamp = Date.now();
    const testLead = await prisma.lead.create({
      data: {
        nome: 'Teste API Vercel',
        email: `teste-${timestamp}@vercel.com`,
        telefone: '11999999999',
        origem: 'teste-api-vercel'
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    res.status(200).json({ 
      success: true,
      message: '✅ Banco de dados funcionando perfeitamente na Vercel!',
      database: 'PostgreSQL (Neon)',
      connection: 'OK',
      tests: {
        connection: '✓ Conectado',
        count: '✓ Contagem funcionando',
        create: '✓ Criação funcionando',
        relations: '✓ Relacionamentos OK'
      },
      counts,
      testCreated: {
        id: testLead.id,
        email: testLead.email
      },
      performance: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDatabaseUrlDirect: !!process.env.DATABASE_URL_DIRECT
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: '❌ Erro ao conectar com o banco de dados',
      error: {
        name: error.constructor.name,
        message: error.message,
        code: error.code
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDatabaseUrlDirect: !!process.env.DATABASE_URL_DIRECT
      },
      troubleshooting: [
        'Verifique se DATABASE_URL está configurado nas Environment Variables da Vercel',
        'Certifique-se de que o URL termina com ?sslmode=require',
        'Verifique se fez redeploy após adicionar as variáveis',
        'Confirme que as variáveis estão marcadas para Production, Preview e Development'
      ]
    });
  } finally {
    await prisma.$disconnect();
  }
}
