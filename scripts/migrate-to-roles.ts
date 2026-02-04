export const dynamic = 'force-dynamic';

/**
 * 🔄 SCRIPT DE MIGRAÇÃO SEGURA - Adicionar Sistema de Roles
 * 
 * Este script migra o sistema atual (role: string) para o novo sistema (role: enum Role)
 * 
 * IMPORTANTE: 
 * 1. Faça backup do banco antes de executar
 * 2. Execute em ambiente de desenvolvimento primeiro
 * 3. Teste completamente antes de rodar em produção
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando migração para sistema de roles...\n');

  try {
    // ========================================================================
    // ETAPA 1: Verificar estado atual
    // ========================================================================
    console.log('📊 ETAPA 1: Verificando estado atual do banco...');
    
    const totalUsuarios = await prisma.usuario.count();
    console.log(`   ✓ Total de usuários no banco: ${totalUsuarios}`);
    
    if (totalUsuarios === 0) {
      console.log('   ⚠️  Nenhum usuário encontrado. Criando usuário SUPER_ADMIN inicial...');
      await createInitialSuperAdmin();
      console.log('✅ Migração concluída!\n');
      return;
    }

    // ========================================================================
    // ETAPA 2: Analisar roles atuais
    // ========================================================================
    console.log('\n📊 ETAPA 2: Analisando roles atuais...');
    
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true
      }
    });

    const rolesAtuais = new Map<string, number>();
    usuarios.forEach(u => {
      const role = u.role || 'indefinido';
      rolesAtuais.set(role, (rolesAtuais.get(role) || 0) + 1);
    });

    console.log('   Distribuição atual de roles:');
    rolesAtuais.forEach((count, role) => {
      console.log(`   - ${role}: ${count} usuário(s)`);
    });

    // ========================================================================
    // ETAPA 3: Mapear roles antigas para novas
    // ========================================================================
    console.log('\n🔄 ETAPA 3: Mapeando roles...');
    
    const roleMapping: Record<string, string> = {
      'admin': 'ADMIN',
      'usuario': 'VISUALIZADOR',
      'gerente': 'GERENTE',
      'corretor': 'CORRETOR',
      'assistente': 'ASSISTENTE',
      'visualizador': 'VISUALIZADOR',
      // Fallback
      'indefinido': 'VISUALIZADOR'
    };

    console.log('   Mapeamento que será aplicado:');
    Object.entries(roleMapping).forEach(([antiga, nova]) => {
      const count = rolesAtuais.get(antiga) || 0;
      if (count > 0) {
        console.log(`   - "${antiga}" → "${nova}" (${count} usuário(s))`);
      }
    });

    // ========================================================================
    // ETAPA 4: Confirmar migração
    // ========================================================================
    console.log('\n⚠️  ATENÇÃO: Esta operação irá:');
    console.log('   1. Atualizar as roles de todos os usuários');
    console.log('   2. Converter o primeiro admin encontrado para SUPER_ADMIN');
    console.log('   3. Adicionar novos campos (corretorId, ultimoLogin, etc)');
    console.log('   4. Criar tabela de LogPermissao');

    // Em produção, você pode querer adicionar um prompt aqui
    // const readline = require('readline');
    // const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // await new Promise(resolve => rl.question('\nDeseja continuar? (s/N): ', answer => {
    //   if (answer.toLowerCase() !== 's') {
    //     console.log('❌ Migração cancelada.');
    //     process.exit(0);
    //   }
    //   rl.close();
    //   resolve(null);
    // }));

    // ========================================================================
    // ETAPA 5: Executar migração
    // ========================================================================
    console.log('\n🔧 ETAPA 5: Executando migração...');

    let superAdminCriado = false;
    let migradosCount = 0;

    for (const usuario of usuarios) {
      const roleAtual = usuario.role?.toLowerCase() || 'indefinido';
      let novaRole = roleMapping[roleAtual] || 'VISUALIZADOR';

      // O primeiro admin vira SUPER_ADMIN
      if (roleAtual === 'admin' && !superAdminCriado) {
        novaRole = 'SUPER_ADMIN';
        superAdminCriado = true;
        console.log(`   👑 ${usuario.email} → SUPER_ADMIN (primeiro admin)`);
      } else {
        console.log(`   ✓ ${usuario.email} → ${novaRole}`);
      }

      // Atualizar usuário
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          role: novaRole as any, // Type assertion temporária
          // Inicializar novos campos
          tentativasLogin: 0,
          bloqueadoAte: null,
          ultimoLogin: null
        }
      });

      migradosCount++;
    }

    // ========================================================================
    // ETAPA 6: Criar SUPER_ADMIN se não existir
    // ========================================================================
    if (!superAdminCriado) {
      console.log('\n⚠️  Nenhum SUPER_ADMIN foi criado. Criando um novo...');
      await createInitialSuperAdmin();
    }

    // ========================================================================
    // ETAPA 7: Verificar resultado
    // ========================================================================
    console.log('\n📊 ETAPA 7: Verificando resultado...');
    
    const usuariosMigrados = await prisma.usuario.groupBy({
      by: ['role'],
      _count: true
    });

    console.log('   Distribuição final de roles:');
    usuariosMigrados.forEach(({ role, _count }) => {
      console.log(`   - ${role}: ${_count} usuário(s)`);
    });

    // ========================================================================
    // CONCLUSÃO
    // ========================================================================
    console.log('\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log(`   Total de usuários migrados: ${migradosCount}`);
    console.log('\n📝 Próximos passos:');
    console.log('   1. Teste o login com diferentes usuários');
    console.log('   2. Verifique as permissões no middleware');
    console.log('   3. Ajuste as roles conforme necessário no /admin/usuarios');
    console.log('   4. Execute em produção após testes completos\n');

  } catch (error) {
    console.error('\n❌ ERRO durante a migração:', error);
    console.error('\n⚠️  O banco pode estar em estado inconsistente.');
    console.error('   Restaure o backup e corrija o erro antes de tentar novamente.\n');
    throw error;
  }
}

async function createInitialSuperAdmin() {
  const bcrypt = await import('bcrypt');
  
  const email = 'admin@str.com';
  const senha = 'Admin@2026';
  const senhaHash = await bcrypt.hash(senha, 10);

  try {
    const superAdmin = await prisma.usuario.create({
      data: {
        nome: 'Super Administrador',
        email,
        senha: senhaHash,
        role: 'SUPER_ADMIN' as any,
        ativo: true,
        tentativasLogin: 0
      }
    });

    console.log('   ✅ SUPER_ADMIN criado:');
    console.log(`      Email: ${email}`);
    console.log(`      Senha: ${senha}`);
    console.log('      ⚠️  MUDE A SENHA após o primeiro login!');
    
    return superAdmin;
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log(`   ℹ️  Usuário ${email} já existe.`);
    } else {
      throw error;
    }
  }
}

// ============================================================================
// EXECUTAR
// ============================================================================

main()
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// ============================================================================
// INSTRUÇÕES DE USO
// ============================================================================

/*

COMO EXECUTAR:

1. Fazer backup do banco de dados:
   ```bash
   pg_dump sua_database > backup_antes_migracao.sql
   ```

2. Executar o script:
   ```bash
   npx ts-node scripts/migrate-to-roles.ts
   ```

3. Verificar resultado:
   ```bash
   psql sua_database
   SELECT email, role, ativo FROM usuarios;
   ```

4. Testar login:
   - Acesse /admin/login
   - Teste com cada tipo de usuário
   - Verifique permissões

5. Se algo der errado:
   ```bash
   psql sua_database < backup_antes_migracao.sql
   ```

*/
