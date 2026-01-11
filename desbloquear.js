const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function desbloquear() {
  await prisma.usuario.update({
    where: { email: 'admin@str.com' },
    data: {
      tentativasLogin: 0,
      bloqueadoAte: null
    }
  });
  
  console.log('✅ Usuário desbloqueado!');
  await prisma.$disconnect();
}

desbloquear();
