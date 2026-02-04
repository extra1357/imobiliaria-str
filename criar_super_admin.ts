export const dynamic = 'force-dynamic';

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const senhaHash = await bcrypt.hash('super123', 10)
  
  const user = await prisma.usuario.upsert({
    where: { email: 'super@str.com' },
    update: { senha: senhaHash, role: 'SUPER_ADMIN' },
    create: {
      nome: 'Super Administrador',
      email: 'super@str.com',
      senha: senhaHash,
      role: 'SUPER_ADMIN'
    }
  })
  
  console.log('✅ Super Admin criado/atualizado!')
  console.log('   Email: super@str.com')
  console.log('   Senha: super123')
}

main()
  .finally(() => prisma.$disconnect())
