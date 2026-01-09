const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const senha = await bcrypt.hash('Admin@123', 10);
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@imobiliaria-str.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@imobiliaria-str.com',
      senha,
      role: 'admin',
      ativo: true
    }
  });
  
  console.log('✅ Admin criado!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Senha: Admin@123');
  console.log('⚠️  TROQUE A SENHA APÓS O PRIMEIRO LOGIN!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
