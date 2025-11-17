/**
 * TESTES DE INTEGRAÇÃO - MAR QUENTE HUB
 *
 * Usando Vitest para testes automatizados
 * Executar: npm run test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzU2MzMsImV4cCI6MjA3ODU1MTYzM30.ZhbzonRvHk6T0CqThNwnxnuR8j9Mm4LnXucYggLHtUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let testUserId = '75157fa7-5927-492a-b4af-3405e7c3a1dc';
let createdProjectId = null;
let createdTaskId = null;
let createdDepartmentId = null;

// ====================================
// SETUP E TEARDOWN
// ====================================

beforeAll(async () => {
  // Autenticar antes dos testes
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@teste.com',
    password: 'teste123'
  });

  if (error) {
    throw new Error(`Falha na autenticação: ${error.message}`);
  }

  console.log('✅ Autenticado com sucesso');
});

afterAll(async () => {
  // Limpar dados de teste criados
  if (createdTaskId) {
    await supabase.from('tasks').delete().eq('id', createdTaskId);
  }
  if (createdProjectId) {
    await supabase.from('projects').delete().eq('id', createdProjectId);
  }
  if (createdDepartmentId) {
    await supabase.from('departments').delete().eq('id', createdDepartmentId);
  }

  await supabase.auth.signOut();
  console.log('✅ Limpeza concluída');
});

// ====================================
// TESTES DE AUTENTICAÇÃO
// ====================================

describe('🔐 Autenticação', () => {
  it('Deve fazer login com credenciais corretas', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@teste.com',
      password: 'teste123'
    });

    expect(error).toBeNull();
    expect(data.session).toBeDefined();
    expect(data.user.email).toBe('admin@teste.com');
  });

  it('Deve falhar com senha incorreta', async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'admin@teste.com',
      password: 'senhaerrada'
    });

    expect(error).not.toBeNull();
    expect(error.message).toContain('Invalid');
  });

  it('Deve ter sessão ativa após login', async () => {
    const { data } = await supabase.auth.getSession();
    expect(data.session).not.toBeNull();
  });
});

// ====================================
// TESTES DE USERS
// ====================================

describe('👥 Users', () => {
  it('Deve listar todos os usuários', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('Deve buscar usuário por email', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@teste.com')
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.email).toBe('admin@teste.com');
  });

  it('Deve filtrar usuários por role', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve contar total de usuários', async () => {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    expect(error).toBeNull();
    expect(count).toBeGreaterThan(0);
  });
});

// ====================================
// TESTES DE PROJECTS (CRUD COMPLETO)
// ====================================

describe('📊 Projects', () => {
  it('Deve listar todos os projetos', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve criar novo projeto', async () => {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: 'Projeto Teste Vitest',
        description: 'Criado via testes automatizados',
        status: 'planning',
        priority: 'medium',
        owner_id: testUserId
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe('Projeto Teste Vitest');

    createdProjectId = data.id;
  });

  it('Deve buscar projeto por ID', async () => {
    if (!createdProjectId) {
      // Skip se projeto não foi criado
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', createdProjectId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.id).toBe(createdProjectId);
  });

  it('Deve atualizar projeto', async () => {
    if (!createdProjectId) {
      // Skip se projeto não foi criado
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .update({ name: 'Projeto Teste Vitest ATUALIZADO' })
      .eq('id', createdProjectId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.name).toBe('Projeto Teste Vitest ATUALIZADO');
  });

  it('Deve filtrar projetos por owner', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', testUserId);

    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
  });

  it('Deve filtrar projetos por status', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'planning');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve fazer JOIN com users', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, users(full_name)')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

// ====================================
// TESTES DE TASKS (CRUD COMPLETO)
// ====================================

describe('✅ Tasks', () => {
  it('Deve listar todas as tarefas', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve criar nova tarefa', async () => {
    // Buscar um projeto existente primeiro
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: 'Tarefa Teste Vitest',
        description: 'Criada via testes',
        status: 'todo',
        priority: 'medium',
        assigned_to: testUserId,
        project: projects?.id || createdProjectId,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.title).toBe('Tarefa Teste Vitest');

    createdTaskId = data.id;
  });

  it('Deve atualizar status da tarefa', async () => {
    if (!createdTaskId) {
      // Skip se tarefa não foi criada
      return;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ status: 'in_progress' })
      .eq('id', createdTaskId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.status).toBe('in_progress');
  });

  it('Deve filtrar tarefas por status', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'pending');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar tarefas por prioridade', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('priority', 'high');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar tarefas por responsável', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', testUserId);

    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
  });

  it('Deve buscar tarefas atrasadas', async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lt('due_date', today)
      .neq('status', 'completed');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve fazer JOIN com projects', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, projects!tasks_project_fkey(name)')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

// ====================================
// TESTES DE DEPARTMENTS
// ====================================

describe('🏢 Departments', () => {
  it('Deve listar todos os departamentos', async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
  });

  it('Deve criar novo departamento', async () => {
    const { data, error } = await supabase
      .from('departments')
      .insert({
        name: 'Dept Teste Vitest',
        description: 'Criado via testes',
        color: '#123456',
        icon: 'test'
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe('Dept Teste Vitest');

    createdDepartmentId = data.id;
  });

  it('Deve atualizar departamento', async () => {
    const { data, error } = await supabase
      .from('departments')
      .update({ description: 'Atualizado' })
      .eq('id', createdDepartmentId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.description).toBe('Atualizado');
  });
});

// ====================================
// TESTES DE COLLECTIONS
// ====================================

describe('👗 Collections', () => {
  it('Deve listar todas as coleções', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar coleções por temporada', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('season', 'summer');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar coleções por status', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('status', 'active');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve buscar coleções com stylist_id', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('id, name, stylist')
      .not('stylist', 'is', null)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });
});

// ====================================
// TESTES DE TICKETS
// ====================================

describe('🎫 Tickets', () => {
  it('Deve listar todos os tickets', async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar tickets por tipo', async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('type', 'bug');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar tickets por prioridade', async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('priority', 'high');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar tickets por status', async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'open');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

// ====================================
// TESTES DE UGC
// ====================================

describe('📸 UGC', () => {
  it('Deve listar todo UGC', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar UGC aprovado', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*')
      .eq('approved', true);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar UGC featured', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*')
      .eq('featured', true);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

// ====================================
// TESTES DE LAUNCH CALENDAR
// ====================================

describe('📅 Launch Calendar', () => {
  it('Deve listar todos os eventos', async () => {
    const { data, error } = await supabase
      .from('launch_calendar')
      .select('*');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar eventos futuros', async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('launch_calendar')
      .select('*')
      .gte('start_date', today);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar eventos por tipo', async () => {
    const { data, error } = await supabase
      .from('launch_calendar')
      .select('*')
      .eq('type', 'launch');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

// ====================================
// TESTES DE INTEGRIDADE
// ====================================

describe('🔍 Integridade de Dados', () => {
  it('Não deve ter tarefas órfãs', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, project')
      .not('project', 'is', null);

    expect(error).toBeNull();

    // Verificar se todos os projects existem
    for (const task of data || []) {
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('id', task.project);

      expect(count).toBeGreaterThan(0);
    }
  });

  it('Não deve ter projetos sem owner válido', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, owner_id')
      .not('owner_id', 'is', null);

    expect(error).toBeNull();

    for (const project of data || []) {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('id', project.owner_id);

      expect(count).toBeGreaterThan(0);
    }
  });
});
