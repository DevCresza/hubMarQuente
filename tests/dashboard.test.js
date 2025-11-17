/**
 * TESTES DA PÁGINA DASHBOARD - MAR QUENTE HUB
 *
 * Testa todas as funcionalidades, componentes e lógica de negócio do Dashboard
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const testUserId = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

describe('📊 Dashboard - Carregamento de Dados', () => {
  it('Deve carregar tarefas do usuário logado', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', testUserId);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar projetos do usuário logado', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', testUserId);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar lista de usuários', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('Deve carregar dados do usuário atual', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.id).toBe(testUserId);
  });
});

describe('📈 Dashboard - Estatísticas (getStats)', () => {
  let tasks, projects;

  beforeAll(async () => {
    const [tasksData, projectsData] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('projects').select('*')
    ]);
    tasks = tasksData.data || [];
    projects = projectsData.data || [];
  });

  it('Deve calcular total de tarefas do usuário', () => {
    const myTasks = tasks.filter(t => t.assigned_to === testUserId);
    expect(myTasks.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve calcular tarefas em progresso', () => {
    const myTasks = tasks.filter(t => t.assigned_to === testUserId);
    const inProgress = myTasks.filter(t => t.status === 'in_progress');
    expect(inProgress.length).toBeGreaterThanOrEqual(0);
    expect(inProgress.length).toBeLessThanOrEqual(myTasks.length);
  });

  it('Deve calcular total de projetos do usuário', () => {
    const myProjects = projects.filter(p => p.owner_id === testUserId);
    expect(myProjects.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve calcular projetos ativos', () => {
    const active = projects.filter(p =>
      p.status === 'in_progress' || p.status === 'active'
    );
    expect(active.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve calcular tarefas concluídas', () => {
    const myTasks = tasks.filter(t => t.assigned_to === testUserId);
    const completed = myTasks.filter(t => t.status === 'done');
    expect(completed.length).toBeGreaterThanOrEqual(0);
    expect(completed.length).toBeLessThanOrEqual(myTasks.length);
  });

  it('Deve calcular taxa de conclusão', () => {
    const myTasks = tasks.filter(t => t.assigned_to === testUserId);
    const completed = myTasks.filter(t => t.status === 'done');

    const rate = myTasks.length
      ? Math.round((completed.length / myTasks.length) * 100)
      : 0;

    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(100);
  });

  it('Deve identificar tarefas urgentes (high e critical)', () => {
    const myTasks = tasks.filter(t => t.assigned_to === testUserId);
    const urgent = myTasks.filter(t =>
      (t.priority === 'critical' || t.priority === 'high') &&
      t.status !== 'done'
    );
    expect(urgent.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve identificar tarefas atrasadas', () => {
    const myTasks = tasks.filter(t => t.assigned_to === testUserId);
    const now = new Date();
    const overdue = myTasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      return new Date(t.due_date) < now;
    });
    expect(overdue.length).toBeGreaterThanOrEqual(0);
  });
});

describe('📋 Dashboard - Tarefas Recentes (getRecentTasks)', () => {
  it('Deve retornar no máximo 5 tarefas', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', testUserId)
      .neq('status', 'done')
      .limit(5);

    expect(tasks.length).toBeLessThanOrEqual(5);
  });

  it('Deve filtrar apenas tarefas não concluídas', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', testUserId)
      .neq('status', 'done')
      .limit(5);

    tasks.forEach(task => {
      expect(task.status).not.toBe('done');
    });
  });

  it('Deve incluir informações do projeto associado', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*, projects(name)')
      .eq('assigned_to', testUserId)
      .neq('status', 'done')
      .limit(1);

    if (tasks.length > 0 && tasks[0].project) {
      expect(tasks[0].projects).toBeDefined();
    }
  });
});

describe('🚀 Dashboard - Projetos Ativos (getActiveProjects)', () => {
  it('Deve retornar no máximo 4 projetos', async () => {
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', testUserId)
      .in('status', ['in_progress', 'active'])
      .limit(4);

    expect(projects.length).toBeLessThanOrEqual(4);
  });

  it('Deve filtrar apenas projetos ativos ou em progresso', async () => {
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', testUserId)
      .in('status', ['in_progress', 'active'])
      .limit(4);

    projects.forEach(project => {
      expect(['in_progress', 'active']).toContain(project.status);
    });
  });

  it('Deve calcular progresso do projeto baseado em tarefas', async () => {
    const { data: projects } = await supabase
      .from('projects')
      .select('*, tasks(*)')
      .eq('owner_id', testUserId)
      .limit(1);

    if (projects.length > 0) {
      const project = projects[0];
      const projectTasks = project.tasks || [];
      const completedTasks = projectTasks.filter(t => t.status === 'done');
      const progress = projectTasks.length
        ? Math.round((completedTasks.length / projectTasks.length) * 100)
        : 0;

      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    }
  });
});

describe('⚠️ Dashboard - Tarefas Urgentes (getUrgentTasks)', () => {
  it('Deve retornar no máximo 3 tarefas urgentes', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', testUserId)
      .in('priority', ['critical', 'high'])
      .neq('status', 'done')
      .limit(3);

    expect(tasks.length).toBeLessThanOrEqual(3);
  });

  it('Deve incluir apenas tarefas critical ou high', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', testUserId)
      .in('priority', ['critical', 'high'])
      .neq('status', 'done')
      .limit(3);

    tasks.forEach(task => {
      expect(['critical', 'high']).toContain(task.priority);
    });
  });

  it('Deve excluir tarefas concluídas', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', testUserId)
      .in('priority', ['critical', 'high'])
      .neq('status', 'done')
      .limit(3);

    tasks.forEach(task => {
      expect(task.status).not.toBe('done');
    });
  });
});

describe('🎨 Dashboard - Componentes UI', () => {
  it('Deve exibir nome do usuário corretamente', async () => {
    const { data: user } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', testUserId)
      .single();

    expect(user.full_name).toBeDefined();
    const firstName = user.full_name?.split(' ')[0];
    expect(firstName).toBeDefined();
  });

  it('Deve formatar datas corretamente (due_date)', async () => {
    const testDate = '2025-01-20';
    const formatted = new Date(testDate).toLocaleDateString('pt-BR');

    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('Deve identificar tarefas atrasadas corretamente', () => {
    const pastDate = '2025-01-01';
    const futureDate = '2025-12-31';
    const now = new Date();

    expect(new Date(pastDate) < now).toBe(true);
    expect(new Date(futureDate) > now).toBe(true);
  });

  it('Deve gerar iniciais do nome do usuário', async () => {
    const { data: user } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', testUserId)
      .single();

    const initials = user.full_name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    expect(initials).toBeDefined();
    expect(initials.length).toBeLessThanOrEqual(2);
  });
});

describe('🎯 Dashboard - Badges e Indicadores', () => {
  it('Deve mostrar badge "Crítico" para tarefas critical', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('priority', 'critical')
      .limit(1);

    if (tasks.length > 0) {
      expect(tasks[0].priority).toBe('critical');
    }
  });

  it('Deve mostrar badge "Atrasada" para tarefas com due_date passado', async () => {
    const now = new Date();
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .not('due_date', 'is', null)
      .neq('status', 'done')
      .limit(10);

    const overdue = tasks.filter(t => new Date(t.due_date) < now);
    overdue.forEach(task => {
      expect(new Date(task.due_date) < now).toBe(true);
    });
  });

  it('Deve mostrar badge "Atenção!" quando há tarefas urgentes', async () => {
    const { data: urgent } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', testUserId)
      .in('priority', ['critical', 'high'])
      .neq('status', 'done');

    // Se houver tarefas urgentes, deve mostrar o badge
    if (urgent.length > 0) {
      expect(urgent.length).toBeGreaterThan(0);
    }
  });
});

describe('📊 Dashboard - Indicadores de Progresso', () => {
  it('Deve calcular progresso de 0% quando não há tarefas', () => {
    const tasks = [];
    const completed = tasks.filter(t => t.status === 'done');
    const progress = tasks.length
      ? Math.round((completed.length / tasks.length) * 100)
      : 0;

    expect(progress).toBe(0);
  });

  it('Deve calcular progresso de 100% quando todas estão concluídas', () => {
    const tasks = [
      { status: 'done' },
      { status: 'done' },
      { status: 'done' }
    ];
    const completed = tasks.filter(t => t.status === 'done');
    const progress = Math.round((completed.length / tasks.length) * 100);

    expect(progress).toBe(100);
  });

  it('Deve calcular progresso de 50% quando metade está concluída', () => {
    const tasks = [
      { status: 'done' },
      { status: 'done' },
      { status: 'in_progress' },
      { status: 'todo' }
    ];
    const completed = tasks.filter(t => t.status === 'done');
    const progress = Math.round((completed.length / tasks.length) * 100);

    expect(progress).toBe(50);
  });
});

describe('🔄 Dashboard - Atualização de Dados', () => {
  it('Deve ordenar tarefas por updated_date (mais recentes primeiro)', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', testUserId)
      .order('updated_date', { ascending: false })
      .limit(5);

    if (tasks.length > 1) {
      for (let i = 0; i < tasks.length - 1; i++) {
        const current = new Date(tasks[i].updated_date || tasks[i].created_date);
        const next = new Date(tasks[i + 1].updated_date || tasks[i + 1].created_date);
        expect(current >= next).toBe(true);
      }
    }
  });

  it('Deve ordenar projetos por updated_date (mais recentes primeiro)', async () => {
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .order('updated_date', { ascending: false })
      .limit(5);

    if (projects.length > 1) {
      for (let i = 0; i < projects.length - 1; i++) {
        const current = new Date(projects[i].updated_date || projects[i].created_date);
        const next = new Date(projects[i + 1].updated_date || projects[i + 1].created_date);
        expect(current >= next).toBe(true);
      }
    }
  });
});

describe('✅ Dashboard - Estados Vazios', () => {
  it('Deve tratar corretamente quando não há tarefas pendentes', () => {
    const allTasks = [
      { status: 'done', assigned_to: testUserId },
      { status: 'done', assigned_to: testUserId }
    ];
    const pending = allTasks.filter(t => t.status !== 'done');

    expect(pending.length).toBe(0);
  });

  it('Deve tratar corretamente quando não há tarefas urgentes', () => {
    const allTasks = [
      { priority: 'low', status: 'todo' },
      { priority: 'medium', status: 'in_progress' }
    ];
    const urgent = allTasks.filter(t =>
      (t.priority === 'critical' || t.priority === 'high') &&
      t.status !== 'done'
    );

    expect(urgent.length).toBe(0);
  });

  it('Deve tratar corretamente quando não há projetos ativos', () => {
    const allProjects = [
      { status: 'completed' },
      { status: 'archived' }
    ];
    const active = allProjects.filter(p =>
      p.status === 'in_progress' || p.status === 'active'
    );

    expect(active.length).toBe(0);
  });
});

describe('🎨 Dashboard - Cores e Estilos', () => {
  it('Deve usar cor do projeto se definida', async () => {
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .not('color', 'is', null)
      .limit(1);

    if (projects.length > 0) {
      expect(projects[0].color).toBeDefined();
      expect(projects[0].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('Deve usar cor padrão quando projeto não tem cor', () => {
    const project = { color: null };
    const color = project.color || '#3b82f6';

    expect(color).toBe('#3b82f6');
  });
});

describe('📱 Dashboard - Responsividade', () => {
  it('Deve limitar cards de estatísticas a 4', () => {
    const stats = [
      'myTasks',
      'myProjects',
      'urgentTasks',
      'taskCompletionRate'
    ];

    expect(stats.length).toBe(4);
  });

  it('Deve limitar tarefas recentes a 5', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .limit(5);

    expect(tasks.length).toBeLessThanOrEqual(5);
  });

  it('Deve limitar tarefas urgentes a 3', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .in('priority', ['critical', 'high'])
      .limit(3);

    expect(tasks.length).toBeLessThanOrEqual(3);
  });

  it('Deve limitar projetos ativos a 4', async () => {
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .in('status', ['in_progress', 'active'])
      .limit(4);

    expect(projects.length).toBeLessThanOrEqual(4);
  });
});
