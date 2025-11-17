/**
 * TESTE MANUAL DE CRIAÇÃO DE USUÁRIO VIA INTERFACE
 *
 * Para executar este teste:
 * 1. Iniciar o servidor: npm run dev
 * 2. Fazer login como admin@teste.com (senha: teste123)
 * 3. Ir para /users
 * 4. Clicar em "Novo Usuário"
 * 5. Preencher o formulário com os dados abaixo
 * 6. Verificar os logs no console do navegador
 *
 * Dados de teste:
 * - Nome: Teste Interface
 * - Email: teste.interface@teste.com
 * - Senha: teste12
 * - Cargo: Testador
 * - Role: membro
 */

import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

describe('🧪 Teste de Criação de Usuário via createUser', () => {

  const testEmail = 'teste.api@teste.com';
  let createdUserId = null;

  it('Deve criar usuário completo (Auth + tabela users)', async () => {
    // Limpar teste anterior se existir
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from('users').delete().eq('id', existing.id);
      await supabaseAdmin.auth.admin.deleteUser(existing.id);
      console.log('🧹 Limpou usuário de teste anterior');
    }

    // Dados do usuário de teste
    const userData = {
      email: testEmail,
      password: 'teste12',
      full_name: 'Teste API',
      role: 'membro',
      position: 'Testador',
      is_active: true
    };

    console.log('🔵 Criando usuário no Auth...');

    // PASSO 1: Criar no Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role,
      },
    });

    expect(authError).toBeNull();
    expect(authData.user).toBeDefined();
    createdUserId = authData.user.id;
    console.log('✅ Usuário criado no Auth:', createdUserId);

    // PASSO 2: Criar na tabela users
    console.log('🔵 Criando registro na tabela users...');
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: createdUserId,
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
    expect(user.email).toBe(testEmail);
    expect(user.role).toBe('membro');
    console.log('✅ Usuário criado na tabela users:', user.id);

    // Verificar se pode fazer login
    console.log('🔵 Testando login...');
    const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email: testEmail,
      password: 'teste12'
    });

    expect(loginError).toBeNull();
    expect(loginData.session).toBeDefined();
    console.log('✅ Login funcionando!');
  });

  it('Deve verificar que usuário existe em ambos (Auth e users)', async () => {
    // Verificar na tabela users
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();

    expect(userRecord).toBeDefined();
    expect(userRecord.email).toBe(testEmail);
    console.log('✅ Usuário encontrado na tabela users');

    // Verificar no Auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers.users.find(u => u.email === testEmail);

    expect(authUser).toBeDefined();
    expect(authUser.id).toBe(userRecord.id);
    console.log('✅ Usuário encontrado no Auth com mesmo ID');
  });

  // Cleanup
  afterAll(async () => {
    if (createdUserId) {
      console.log('🧹 Limpando usuário de teste...');
      await supabaseAdmin.from('users').delete().eq('id', createdUserId);
      await supabaseAdmin.auth.admin.deleteUser(createdUserId);
      console.log('✅ Limpeza concluída');
    }
  });
});
