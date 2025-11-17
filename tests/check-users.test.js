/**
 * TESTE RÁPIDO - Verificar se há usuários no banco
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

describe('🔍 Verificar Usuários no Banco', () => {

  it('Deve listar todos os usuários na tabela users', async () => {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_date', { ascending: false });

    expect(error).toBeNull();
    expect(users).toBeDefined();

    console.log('\n📊 TOTAL DE USUÁRIOS:', users.length);
    console.log('\n👥 LISTA DE USUÁRIOS:\n');

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name || 'SEM NOME'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Ativo: ${user.is_active ? 'SIM' : 'NÃO'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Criado em: ${user.created_date}`);
      console.log('');
    });

    expect(users.length).toBeGreaterThan(0);
  });

  it('Deve verificar usuários no Auth', async () => {
    const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers();

    expect(error).toBeNull();
    expect(authData.users).toBeDefined();

    console.log('\n🔐 TOTAL NO AUTH:', authData.users.length);
    console.log('\n🔐 LISTA NO AUTH:\n');

    authData.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Criado em: ${user.created_at}`);
      console.log('');
    });
  });

  it('Deve comparar Auth vs Tabela Users', async () => {
    // Buscar do Auth
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const authEmails = authData.users.map(u => u.email).sort();

    // Buscar da tabela
    const { data: usersData } = await supabaseAdmin
      .from('users')
      .select('email');
    const tableEmails = usersData.map(u => u.email).sort();

    console.log('\n📧 Emails no Auth:', authEmails);
    console.log('📧 Emails na Tabela:', tableEmails);

    // Verificar diferenças
    const onlyInAuth = authEmails.filter(e => !tableEmails.includes(e));
    const onlyInTable = tableEmails.filter(e => !authEmails.includes(e));

    if (onlyInAuth.length > 0) {
      console.log('\n⚠️ APENAS NO AUTH (não na tabela):', onlyInAuth);
    }

    if (onlyInTable.length > 0) {
      console.log('\n⚠️ APENAS NA TABELA (não no Auth):', onlyInTable);
    }

    if (onlyInAuth.length === 0 && onlyInTable.length === 0) {
      console.log('\n✅ Todos os usuários estão sincronizados!');
    }
  });

  it('Deve verificar usuários com role "membro"', async () => {
    const { data: members, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'membro');

    expect(error).toBeNull();

    console.log(`\n👤 MEMBROS ENCONTRADOS: ${members.length}`);

    if (members.length > 0) {
      console.log('\n📋 Lista de membros:\n');
      members.forEach((member, index) => {
        console.log(`${index + 1}. ${member.full_name}`);
        console.log(`   Email: ${member.email}`);
        console.log(`   Ativo: ${member.is_active ? 'SIM' : 'NÃO'}`);
        console.log('');
      });
    } else {
      console.log('⚠️ Nenhum membro encontrado!');
    }
  });
});
