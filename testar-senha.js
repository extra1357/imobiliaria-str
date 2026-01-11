const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testar() {
  const usuario = await prisma.usuario.findUnique({
    where: { email: 'admin@str.com' }
  });

  console.log('📧 Email encontrado:', usuario?.email);
  console.log('🔑 Hash da senha no banco:', usuario?.senha);
  console.log('');

  const senhaCorreta = await bcrypt.compare('Admin@123', usuario.senha);
  console.log('✅ Senha Admin@123 está correta?', senhaCorreta);

  await prisma.$disconnect();
}

testar();
