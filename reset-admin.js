// reset-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function criarSuperAdmin() {
  try {
    const email = 'admin@str.com';
    const senha = 'Admin@123'; // TROQUE DEPOIS DO LOGIN!
    const senhaHash = await bcrypt.hash(senha, 10);

    // Deleta admin antigo se existir
    await prisma.usuario.deleteMany({
      where: { email: email }
    });

    // Cria novo super admin
    const usuario = await prisma.usuario.create({
      data: {
        nome: 'Super Administrador',
        email: email,
        senha: senhaHash,
        role: 'SUPER_ADMIN',
        ativo: true,
        tentativasLogin: 0
      }
    });

    console.log('✅ SUPER ADMIN CRIADO COM SUCESSO!');
    console.log('');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', senha);
    console.log('');
    console.log('⚠️  IMPORTANTE: Troque a senha após o primeiro login!');

  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await prisma.$disconnect();
  }
}

criarSuperAdmin();
