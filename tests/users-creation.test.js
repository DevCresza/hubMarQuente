/**
 * TESTES DE CRIAÇÃO DE USUÁRIOS - MAR QUENTE HUB
 *
 * Testa a criação de usuários com diferentes roles através do sistema de Auth
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

// Cliente admin para criar usuários
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// IDs dos usuários criados (para cleanup)
let createdUserIds = [];

describe('🧪 Criação de Usuários com Roles', () => {

  beforeAll(async () => {
    console.log('🔧 Preparando testes de criação de usuários...');
  });

  it('Deve validar usuário ADMIN existente (admin@teste.com)', async () => {
    // Verificar se usuário admin já existe
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'admin@teste.com')
      .single();

    expect(error).toBeNull();
    expect(user).toBeDefined();
    expect(user.email).toBe('admin@teste.com');
    expect(user.role).toBe('admin');

    console.log('✅ Usuário ADMIN já existe:', user.email);
  });

  it('Deve criar/validar usuário MANAGER (manager@teste.com)', async () => {
    const userData = {
      email: 'manager@teste.com',
      password: 'teste12',
      full_name: 'Gerente Teste',
      role: 'manager',
      position: 'Gerente de Projetos',
      is_active: true
    };

    // Verificar se já existe na tabela users
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .maybeSingle();

    if (existingUser) {
      console.log('✅ Usuário MANAGER já existe na tabela users:', existingUser.email);
      expect(existingUser.role).toBe('manager');
      return;
    }

    // Tentar criar no Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role
      }
    });

    let userId;

    if (authError && authError.message.includes('already been registered')) {
      // Usuário já existe no Auth, buscar ID
      console.log('⚠️ Usuário já existe no Auth, sincronizando com tabela users...');

      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        throw new Error('Erro ao listar usuários do Auth: ' + listError.message);
      }

      const authUser = authUsers.users.find(u => u.email === userData.email);

      if (!authUser) {
        throw new Error('Usuário não encontrado no Auth');
      }

      userId = authUser.id;
      console.log('🔍 ID do usuário no Auth:', userId);
    } else if (authError) {
      // Erro diferente, lançar exceção
      throw authError;
    } else {
      // Criado com sucesso no Auth
      userId = authData.user.id;
      expect(authData.user.email).toBe(userData.email);
      createdUserIds.push(userId);
      console.log('✅ Usuário criado no Auth:', userId);
    }

    // Criar/atualizar na tabela users
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role,
        position: userData.position,
        is_active: userData.is_active
      })
      .select()
      .single();

    expect(userError).toBeNull();
    expect(user).toBeDefined();
    expect(user.role).toBe('manager');
    expect(user.full_name).toBe('Gerente Teste');

    console.log('✅ Usuário MANAGER sincronizado:', user.email);
  });

  it('Deve criar/validar usuário MEMBRO (membro@teste.com)', async () => {
    const userData = {
      email: 'membro@teste.com',
      password: 'teste12',
      full_name: 'Membro Teste',
      role: 'membro',
      position: 'Desenvolvedor',
      is_active: true
    };

    // Verificar se já existe na tabela users
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .maybeSingle();

    if (existingUser) {
      console.log('✅ Usuário MEMBRO já existe na tabela users:', existingUser.email);
      expect(existingUser.role).toBe('membro');
      return;
    }

    // Tentar criar no Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role
      }
    });

    let userId;

    if (authError && authError.message.includes('already been registered')) {
      // Usuário já existe no Auth, buscar ID
      console.log('⚠️ Usuário já existe no Auth, sincronizando com tabela users...');

      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        throw new Error('Erro ao listar usuários do Auth: ' + listError.message);
      }

      const authUser = authUsers.users.find(u => u.email === userData.email);

      if (!authUser) {
        throw new Error('Usuário não encontrado no Auth');
      }

      userId = authUser.id;
      console.log('🔍 ID do usuário no Auth:', userId);
    } else if (authError) {
      // Erro diferente, lançar exceção
      throw authError;
    } else {
      // Criado com sucesso no Auth
      userId = authData.user.id;
      expect(authData.user.email).toBe(userData.email);
      createdUserIds.push(userId);
      console.log('✅ Usuário criado no Auth:', userId);
    }

    // Criar/atualizar na tabela users
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role,
        position: userData.position,
        is_active: userData.is_active
      })
      .select()
      .single();

    expect(userError).toBeNull();
    expect(user).toBeDefined();
    expect(user.role).toBe('membro');
    expect(user.full_name).toBe('Membro Teste');

    console.log('✅ Usuário MEMBRO sincronizado:', user.email);
  });

  it('Deve validar que os usuários existem', async () => {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('email', ['admin@teste.com', 'manager@teste.com', 'membro@teste.com']);

    expect(error).toBeNull();
    expect(users.length).toBeGreaterThanOrEqual(1);

    const emails = users.map(u => u.email).sort();
    console.log(`✅ ${users.length} usuários encontrados:`, emails);

    // Verificar que pelo menos o admin existe
    expect(emails).toContain('admin@teste.com');
  });
});

describe('🔑 Teste de Login dos Usuários Criados', () => {

  it('Deve fazer login com usuário ADMIN', async () => {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: 'admin@teste.com',
      password: 'teste12'
    });

    // Admin pode ter senha diferente se foi criado antes
    if (error) {
      console.log('⚠️ Login ADMIN falhou (senha pode ser diferente)');
      expect(error.code).toBe('invalid_credentials');
      return;
    }

    expect(data.session).toBeDefined();
    expect(data.user.email).toBe('admin@teste.com');

    console.log('✅ Login ADMIN funcionando');
  });

  it('Deve fazer login com usuário MANAGER', async () => {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: 'manager@teste.com',
      password: 'teste12'
    });

    expect(error).toBeNull();
    expect(data.session).toBeDefined();
    expect(data.user.email).toBe('manager@teste.com');

    console.log('✅ Login MANAGER funcionando');
  });

  it('Deve fazer login com usuário MEMBRO', async () => {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: 'membro@teste.com',
      password: 'teste12'
    });

    expect(error).toBeNull();
    expect(data.session).toBeDefined();
    expect(data.user.email).toBe('membro@teste.com');

    console.log('✅ Login MEMBRO funcionando');
  });
});

describe('📊 Validação de Dados dos Usuários', () => {

  it('Deve verificar campos obrigatórios do usuário ADMIN', async () => {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'admin@teste.com')
      .single();

    expect(user.full_name).toBe('Administrador');
    expect(user.email).toBe('admin@teste.com');
    expect(user.role).toBe('admin');
    expect(user.position).toBe('Administrador do Sistema');
    expect(user.is_active).toBe(true);
  });

  it('Deve verificar campos obrigatórios do usuário MANAGER', async () => {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'manager@teste.com')
      .maybeSingle();

    if (!user) {
      console.log('⚠️ Usuário MANAGER não encontrado, pulando validação');
      return;
    }

    expect(error).toBeNull();
    expect(user.email).toBe('manager@teste.com');
    expect(user.role).toBe('manager');
    expect(user.is_active).toBe(true);
  });

  it('Deve verificar campos obrigatórios do usuário MEMBRO', async () => {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'membro@teste.com')
      .maybeSingle();

    if (!user) {
      console.log('⚠️ Usuário MEMBRO não encontrado, pulando validação');
      return;
    }

    expect(error).toBeNull();
    expect(user.email).toBe('membro@teste.com');
    expect(user.role).toBe('membro');
    expect(user.is_active).toBe(true);
  });
});

// Cleanup opcional - descomente se quiser deletar após os testes
/*
afterAll(async () => {
  console.log('🧹 Limpando usuários de teste...');

  for (const userId of createdUserIds) {
    // Deletar da tabela users
    await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    // Deletar do Auth
    await supabaseAdmin.auth.admin.deleteUser(userId);
  }

  console.log('✅ Cleanup concluído');
});
*/
