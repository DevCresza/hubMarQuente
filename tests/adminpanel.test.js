/**
 * TESTES DA PÁGINA ADMIN PANEL - MAR QUENTE HUB
 *
 * Testa funcionalidades administrativas: usuários, departamentos, projetos e tarefas
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const testUserId = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

// IDs de teste para cleanup
let testDepartmentIds = [];
let testProjectIds = [];
let testTaskIds = [];

describe('📊 AdminPanel - Overview - Carregamento de Dados', () => {
  it('Deve carregar total de projetos', async () => {
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    expect(error).toBeNull();
    expect(typeof count).toBe('number');
  });

  it('Deve carregar total de tarefas', async () => {
    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    expect(error).toBeNull();
    expect(typeof count).toBe('number');
  });

  it('Deve carregar total de usuários', async () => {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    expect(error).toBeNull();
    expect(typeof count).toBe('number');
  });

  it('Deve carregar total de departamentos', async () => {
    const { count, error } = await supabase
      .from('departments')
      .select('*', { count: 'exact', head: true });

    expect(error).toBeNull();
    expect(typeof count).toBe('number');
  });
});

describe('🏢 AdminPanel - Departamentos', () => {
  it('Deve listar todos os departamentos', async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve criar novo departamento', async () => {
    const deptData = {
      name: 'Departamento Teste ' + Date.now(),
      description: 'Descrição do departamento de teste',
      color: '#3B82F6',
      icon: 'building'
    };

    const { data, error } = await supabase
      .from('departments')
      .insert(deptData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe(deptData.name);
    expect(data.color).toBe(deptData.color);

    if (data) {
      testDepartmentIds.push(data.id);
    }
  });

  it('Deve atualizar departamento existente', async () => {
    const { data: dept } = await supabase
      .from('departments')
      .insert({
        name: 'Departamento Atualizar',
        description: 'Original',
        color: '#000000'
      })
      .select()
      .single();

    if (dept) {
      testDepartmentIds.push(dept.id);

      const { data, error } = await supabase
        .from('departments')
        .update({
          description: 'Atualizada',
          color: '#FF0000'
        })
        .eq('id', dept.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.description).toBe('Atualizada');
      expect(data.color).toBe('#FF0000');
    }
  });

  it('Deve excluir departamento', async () => {
    const { data: dept } = await supabase
      .from('departments')
      .insert({
        name: 'Departamento para Excluir',
        description: 'Temporário'
      })
      .select()
      .single();

    if (dept) {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', dept.id);

      expect(error).toBeNull();

      // Verificar exclusão
      const { data } = await supabase
        .from('departments')
        .select('*')
        .eq('id', dept.id);

      expect(data.length).toBe(0);
    }
  });
});

describe('📊 AdminPanel - Projetos', () => {
  it('Deve listar todos os projetos', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_date', { ascending: false });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve contar projetos por status', async () => {
    const statuses = ['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'];

    for (const status of statuses) {
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      expect(error).toBeNull();
      expect(typeof count).toBe('number');
    }
  });

  it('Deve calcular taxa de conclusão de projetos', async () => {
    const { count: total } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    const { count: completed } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    expect(typeof total).toBe('number');
    expect(typeof completed).toBe('number');

    if (total > 0) {
      const completionRate = (completed / total) * 100;
      expect(completionRate).toBeGreaterThanOrEqual(0);
      expect(completionRate).toBeLessThanOrEqual(100);
    }
  });

  it('Deve filtrar projetos por prioridade', async () => {
    const priorities = ['low', 'medium', 'high', 'critical'];

    for (const priority of priorities) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('priority', priority);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  it('Deve listar projetos com dados de owner', async () => {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, owner_id')
      .limit(10);

    expect(error).toBeNull();
    expect(Array.isArray(projects)).toBe(true);

    // Verificar que owner_id existe
    if (projects && projects.length > 0) {
      const projectWithOwner = projects.find(p => p.owner_id !== null);
      if (projectWithOwner) {
        expect(projectWithOwner.owner_id).toBeDefined();
      }
    }
  });
});

describe('✅ AdminPanel - Tarefas', () => {
  it('Deve listar todas as tarefas', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_date', { ascending: false });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve contar tarefas por status', async () => {
    const statuses = ['todo', 'in_progress', 'done', 'blocked'];

    for (const status of statuses) {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      expect(error).toBeNull();
      expect(typeof count).toBe('number');
    }
  });

  it('Deve calcular taxa de conclusão de tarefas', async () => {
    const { count: total } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    const { count: done } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'done');

    expect(typeof total).toBe('number');
    expect(typeof done).toBe('number');

    if (total > 0) {
      const completionRate = (done / total) * 100;
      expect(completionRate).toBeGreaterThanOrEqual(0);
      expect(completionRate).toBeLessThanOrEqual(100);
    }
  });

  it('Deve filtrar tarefas por prioridade', async () => {
    const priorities = ['low', 'medium', 'high', 'critical'];

    for (const priority of priorities) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('priority', priority);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  it('Deve listar tarefas atrasadas', async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lt('due_date', today)
      .neq('status', 'done');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve listar tarefas com assignee', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, users!tasks_assigned_to_fkey(full_name, email)')
      .limit(10);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('👥 AdminPanel - Usuários', () => {
  it('Deve listar todos os usuários', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar usuários por role', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve contar usuários por departamento', async () => {
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')
      .limit(5);

    if (departments && departments.length > 0) {
      for (const dept of departments) {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('department', dept.id);

        expect(error).toBeNull();
        expect(typeof count).toBe('number');
      }
    }
  });

  it('Deve verificar campos de gamificação', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('gamification_points, gamification_level, gamification_badges')
      .eq('id', testUserId)
      .single();

    expect(error).toBeNull();

    if (data) {
      expect(typeof data.gamification_points === 'number' || data.gamification_points === null).toBe(true);
      expect(typeof data.gamification_level === 'number' || data.gamification_level === null).toBe(true);
    }
  });
});

describe('📊 AdminPanel - Estatísticas e Métricas', () => {
  it('Deve calcular produtividade geral (tarefas concluídas)', async () => {
    const { count: totalTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    const { count: doneTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'done');

    expect(typeof totalTasks).toBe('number');
    expect(typeof doneTasks).toBe('number');

    if (totalTasks > 0) {
      const productivity = (doneTasks / totalTasks) * 100;
      expect(productivity).toBeGreaterThanOrEqual(0);
      expect(productivity).toBeLessThanOrEqual(100);
    }
  });

  it('Deve listar projetos mais ativos (mais tarefas)', async () => {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name')
      .limit(10);

    expect(error).toBeNull();

    if (projects && projects.length > 0) {
      for (const project of projects) {
        const { count } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('project', project.id);

        expect(typeof count).toBe('number');
      }
    }
  });

  it('Deve calcular média de pontos de gamificação', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('gamification_points')
      .not('gamification_points', 'is', null);

    expect(error).toBeNull();

    if (data && data.length > 0) {
      const avgPoints = data.reduce((sum, user) => sum + user.gamification_points, 0) / data.length;
      expect(avgPoints).toBeGreaterThanOrEqual(0);
    }
  });

  it('Deve listar top 10 usuários por pontos', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('full_name, gamification_points')
      .not('gamification_points', 'is', null)
      .order('gamification_points', { ascending: false })
      .limit(10);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);

    if (data && data.length > 1) {
      expect(data[0].gamification_points >= data[1].gamification_points).toBe(true);
    }
  });
});

describe('🔍 AdminPanel - Filtros e Buscas', () => {
  it('Deve buscar projetos por nome', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .ilike('name', '%projeto%');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve buscar tarefas por título', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .ilike('title', '%tarefa%');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve buscar usuários por nome', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('full_name', '%a%');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar por data de criação', async () => {
    const startDate = '2025-01-01';

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .gte('created_date', startDate);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('📈 AdminPanel - Relatórios', () => {
  it('Deve gerar relatório de projetos por status', async () => {
    const statuses = ['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'];
    const report = {};

    for (const status of statuses) {
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      report[status] = count;
    }

    expect(Object.keys(report).length).toBe(5);
    Object.values(report).forEach(count => {
      expect(typeof count).toBe('number');
    });
  });

  it('Deve gerar relatório de tarefas por status', async () => {
    const statuses = ['todo', 'in_progress', 'done', 'blocked'];
    const report = {};

    for (const status of statuses) {
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      report[status] = count;
    }

    expect(Object.keys(report).length).toBe(4);
    Object.values(report).forEach(count => {
      expect(typeof count).toBe('number');
    });
  });

  it('Deve gerar relatório de usuários por departamento', async () => {
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')
      .limit(5);

    if (departments && departments.length > 0) {
      const report = {};

      for (const dept of departments) {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('department', dept.id);

        report[dept.name] = count;
      }

      expect(Object.keys(report).length).toBeGreaterThan(0);
    }
  });
});

describe('🔧 AdminPanel - Limpeza', () => {
  afterAll(async () => {
    // Limpar departamentos de teste
    if (testDepartmentIds.length > 0) {
      const { error } = await supabase
        .from('departments')
        .delete()
        .in('id', testDepartmentIds);

      expect(error).toBeNull();
    }

    // Limpar projetos de teste
    if (testProjectIds.length > 0) {
      await supabase
        .from('projects')
        .delete()
        .in('id', testProjectIds);
    }

    // Limpar tarefas de teste
    if (testTaskIds.length > 0) {
      await supabase
        .from('tasks')
        .delete()
        .in('id', testTaskIds);
    }
  });

  it('Deve limpar dados de teste', async () => {
    expect(testDepartmentIds.length).toBeGreaterThanOrEqual(0);
  });
});
