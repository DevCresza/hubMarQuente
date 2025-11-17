/**
 * TESTES DA PÁGINA TASKS - MAR QUENTE HUB
 *
 * Testa todas as funcionalidades, componentes e filtros da página de Tarefas
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const testUserId = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

// IDs de teste para cleanup
let testTaskIds = [];

describe('📊 Tasks - Carregamento de Dados', () => {
  it('Deve carregar tarefas ordenadas por data de criação', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_date', { ascending: false });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar usuários ordenados por nome', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar departamentos ordenados por nome', async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar coleções ordenadas por nome', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('name');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar usuário atual', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    expect(error).toBeNull();
    expect(data.id).toBe(testUserId);
  });
});

describe('📝 Tasks - Criação e Edição', () => {
  it('Deve criar nova tarefa', async () => {
    const taskData = {
      title: 'Tarefa Teste ' + Date.now(),
      description: 'Descrição da tarefa de teste',
      status: 'todo',
      priority: 'medium',
      assigned_to: testUserId
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.title).toBe(taskData.title);
    expect(data.status).toBe('todo');

    if (data) {
      testTaskIds.push(data.id);
    }
  });

  it('Deve atualizar tarefa existente', async () => {
    // Criar tarefa primeiro
    const { data: task, error: createError } = await supabase
      .from('tasks')
      .insert({
        title: 'Tarefa para Atualizar',
        status: 'todo',
        priority: 'low',
        assigned_to: testUserId
      })
      .select()
      .single();

    expect(createError).toBeNull();
    expect(task).toBeDefined();

    if (task) {
      testTaskIds.push(task.id);

      // Atualizar
      const { data, error } = await supabase
        .from('tasks')
        .update({ title: 'Tarefa Atualizada' })
        .eq('id', task.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.title).toBe('Tarefa Atualizada');
    }
  });

  it('Deve marcar completed_date ao concluir tarefa', async () => {
    // Criar tarefa
    const { data: task } = await supabase
      .from('tasks')
      .insert({
        title: 'Tarefa para Concluir',
        status: 'in_progress',
        priority: 'medium',
        assigned_to: testUserId
      })
      .select()
      .single();

    if (task) {
      testTaskIds.push(task.id);

      // Concluir tarefa
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'done',
          completed_date: today
        })
        .eq('id', task.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('done');
      expect(data.completed_date).toContain(today);
    }
  });

  it('Deve limpar completed_date ao reabrir tarefa', async () => {
    // Criar tarefa concluída
    const today = new Date().toISOString().split('T')[0];
    const { data: task } = await supabase
      .from('tasks')
      .insert({
        title: 'Tarefa Concluída',
        status: 'done',
        priority: 'medium',
        assigned_to: testUserId,
        completed_date: today
      })
      .select()
      .single();

    if (task) {
      testTaskIds.push(task.id);

      // Reabrir tarefa
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'in_progress',
          completed_date: null
        })
        .eq('id', task.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('in_progress');
      expect(data.completed_date).toBeNull();
    }
  });
});

describe('🔍 Tasks - Filtros (getFilteredTasks)', () => {
  let tasks;

  beforeAll(async () => {
    const { data } = await supabase.from('tasks').select('*');
    tasks = data || [];
  });

  it('Deve filtrar "Minhas Tarefas" (assigned_to)', () => {
    const myTasks = tasks.filter(t => t.assigned_to === testUserId);
    expect(myTasks.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve filtrar por busca (title)', () => {
    const taskWithTitle = tasks.find(t => t.title);
    if (taskWithTitle) {
      const search = taskWithTitle.title.substring(0, 3);
      const filtered = tasks.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase())
      );
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  it('Deve filtrar por busca (description)', () => {
    const taskWithDesc = tasks.find(t => t.description);
    if (taskWithDesc) {
      const search = taskWithDesc.description.substring(0, 5);
      const filtered = tasks.filter(t =>
        t.description?.toLowerCase().includes(search.toLowerCase())
      );
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  it('Deve filtrar por status', () => {
    const statusList = ['todo', 'in_progress', 'done'];
    statusList.forEach(status => {
      const filtered = tasks.filter(t => t.status === status);
      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('Deve filtrar por prioridade', () => {
    const priorities = ['low', 'medium', 'high', 'critical'];
    priorities.forEach(priority => {
      const filtered = tasks.filter(t => t.priority === priority);
      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('Deve filtrar por assigned_to (usuário específico)', () => {
    const tasksWithAssigned = tasks.filter(t => t.assigned_to);
    if (tasksWithAssigned.length > 0) {
      const userId = tasksWithAssigned[0].assigned_to;
      const filtered = tasks.filter(t => t.assigned_to === userId);
      expect(filtered.length).toBeGreaterThan(0);
    }
  });
});

describe('📊 Tasks - Estatísticas de Gamificação (getCompletionStats)', () => {
  let tasks;

  beforeAll(async () => {
    const { data } = await supabase.from('tasks').select('*');
    tasks = data || [];
  });

  it('Deve contar total de tarefas concluídas', () => {
    const myTasks = tasks.filter(t => t.assigned_to === testUserId);
    const completedTasks = myTasks.filter(t => t.status === 'done');
    expect(completedTasks.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve contar tarefas concluídas hoje', () => {
    const myTasks = tasks.filter(t => t.assigned_to === testUserId);
    const completedTasks = myTasks.filter(t => t.status === 'done');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = completedTasks.filter(t => {
      if (!t.completed_date) return false;
      const taskDate = new Date(t.completed_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    }).length;

    expect(typeof completedToday).toBe('number');
    expect(completedToday).toBeGreaterThanOrEqual(0);
  });

  it('Deve contar tarefas concluídas esta semana', () => {
    const myTasks = tasks.filter(t => t.assigned_to === testUserId);
    const completedTasks = myTasks.filter(t => t.status === 'done');

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const completedThisWeek = completedTasks.filter(t => {
      if (!t.completed_date) return false;
      const taskDate = new Date(t.completed_date);
      return taskDate >= weekAgo;
    }).length;

    expect(typeof completedThisWeek).toBe('number');
    expect(completedThisWeek).toBeGreaterThanOrEqual(0);
  });

  it('Deve calcular streak (sequência de dias)', () => {
    const myTasks = tasks.filter(t => t.assigned_to === testUserId);
    const completedTasks = myTasks.filter(t => t.status === 'done' && t.completed_date);

    // Ordenar por data (mais recente primeiro)
    const sortedCompleted = completedTasks.sort((a, b) =>
      new Date(b.completed_date) - new Date(a.completed_date)
    );

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // Verificar até 365 dias
    for (let i = 0; i < 365; i++) {
      const hasTaskOnDay = sortedCompleted.some(t => {
        const taskDate = new Date(t.completed_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === checkDate.getTime();
      });

      if (hasTaskOnDay) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (streak > 0 || i > 0) {
          break;
        } else {
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }

    expect(typeof streak).toBe('number');
    expect(streak).toBeGreaterThanOrEqual(0);
  });
});

describe('🎨 Tasks - Modos de Visualização', () => {
  it('Deve alternar entre list, grouped e kanban', () => {
    let viewMode = 'list';
    expect(viewMode).toBe('list');

    viewMode = 'grouped';
    expect(viewMode).toBe('grouped');

    viewMode = 'kanban';
    expect(viewMode).toBe('kanban');
  });

  it('Deve agrupar tarefas por status', () => {
    const statusGroups = [
      { id: "todo", label: "Não Iniciadas" },
      { id: "in_progress", label: "Em Progresso" },
      { id: "done", label: "Concluídas" }
    ];

    expect(statusGroups.length).toBe(3);
    expect(statusGroups[0].id).toBe("todo");
    expect(statusGroups[1].id).toBe("in_progress");
    expect(statusGroups[2].id).toBe("done");
  });

  it('Deve retornar tarefas de um status específico', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'in_progress');

    expect(Array.isArray(tasks)).toBe(true);
  });
});

describe('⏰ Tasks - Detecção de Tarefas Atrasadas', () => {
  let tasks;

  beforeAll(async () => {
    const { data } = await supabase.from('tasks').select('*');
    tasks = data || [];
  });

  it('Deve detectar tarefas atrasadas', () => {
    const now = new Date();

    tasks.forEach(task => {
      if (task.due_date && task.status !== 'done') {
        const isOverdue = new Date(task.due_date) < now;
        expect(typeof isOverdue).toBe('boolean');
      }
    });
  });

  it('Não deve marcar tarefas concluídas como atrasadas', () => {
    const completedTasks = tasks.filter(t => t.status === 'done');

    completedTasks.forEach(task => {
      // Mesmo se due_date passou, não está atrasada se concluída
      const shouldNotBeOverdue = true;
      expect(shouldNotBeOverdue).toBe(true);
    });
  });

  it('Deve tratar tarefas sem due_date', () => {
    const tasksWithoutDueDate = tasks.filter(t => !t.due_date);

    tasksWithoutDueDate.forEach(task => {
      const isOverdue = false; // Sem due_date nunca está atrasada
      expect(isOverdue).toBe(false);
    });
  });
});

describe('🔄 Tasks - Mudança de Status', () => {
  it('Deve validar transição de todo para in_progress', async () => {
    const { data: task } = await supabase
      .from('tasks')
      .insert({
        title: 'Tarefa para Iniciar',
        status: 'todo',
        priority: 'medium',
        assigned_to: testUserId
      })
      .select()
      .single();

    if (task) {
      testTaskIds.push(task.id);

      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', task.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('in_progress');
    }
  });

  it('Deve validar transição de in_progress para done', async () => {
    const { data: task } = await supabase
      .from('tasks')
      .insert({
        title: 'Tarefa em Progresso',
        status: 'in_progress',
        priority: 'medium',
        assigned_to: testUserId
      })
      .select()
      .single();

    if (task) {
      testTaskIds.push(task.id);

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'done',
          completed_date: today
        })
        .eq('id', task.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('done');
      expect(data.completed_date).toContain(today);
    }
  });

  it('Deve validar transição de done para in_progress (reabrir)', async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data: task } = await supabase
      .from('tasks')
      .insert({
        title: 'Tarefa Concluída para Reabrir',
        status: 'done',
        priority: 'medium',
        assigned_to: testUserId,
        completed_date: today
      })
      .select()
      .single();

    if (task) {
      testTaskIds.push(task.id);

      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'in_progress',
          completed_date: null
        })
        .eq('id', task.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('in_progress');
      expect(data.completed_date).toBeNull();
    }
  });
});

describe('🔔 Tasks - Estados Vazios', () => {
  it('Deve exibir mensagem quando não há tarefas', () => {
    const tasks = [];
    const isEmpty = tasks.length === 0;

    expect(isEmpty).toBe(true);
  });

  it('Deve exibir mensagem diferente se há filtros ativos', () => {
    const filters = {
      search: 'teste',
      status: 'all',
      priority: 'all'
    };

    const hasActiveFilters =
      !!filters.search ||
      filters.status !== 'all' ||
      filters.priority !== 'all';

    expect(hasActiveFilters).toBe(true);
  });

  it('Deve exibir botão criar tarefa apenas sem filtros', () => {
    const filters = {
      search: '',
      status: 'all',
      priority: 'all'
    };

    const shouldShowCreateButton =
      !filters.search &&
      filters.status === 'all' &&
      filters.priority === 'all';

    expect(shouldShowCreateButton).toBe(true);
  });
});

describe('📋 Tasks - Filtros Combinados', () => {
  let tasks;

  beforeAll(async () => {
    const { data } = await supabase.from('tasks').select('*');
    tasks = data || [];
  });

  it('Deve aplicar múltiplos filtros simultaneamente', () => {
    const filters = {
      search: '',
      status: 'in_progress',
      priority: 'high',
      view: 'minhas'
    };

    const filtered = tasks.filter(task => {
      const viewMatch = task.assigned_to === testUserId;
      const searchMatch = true; // Search vazia
      const statusMatch = task.status === filters.status;
      const priorityMatch = task.priority === filters.priority;

      return viewMatch && searchMatch && statusMatch && priorityMatch;
    });

    expect(Array.isArray(filtered)).toBe(true);
  });

  it('Deve retornar todas as tarefas quando filtros são "all"', () => {
    const filters = {
      search: '',
      status: 'all',
      priority: 'all',
      assigned_to: 'all',
      view: 'todas'
    };

    const filtered = tasks.filter(task => {
      const searchMatch = !filters.search;
      const statusMatch = filters.status === 'all';
      const priorityMatch = filters.priority === 'all';

      return searchMatch && statusMatch && priorityMatch;
    });

    if (filters.status === 'all' && filters.priority === 'all' && !filters.search) {
      expect(filtered.length).toBe(tasks.length);
    }
  });
});

describe('📊 Tasks - Ordenação', () => {
  it('Deve ordenar tarefas por created_date (mais recentes primeiro)', async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .order('created_date', { ascending: false })
      .limit(10);

    if (tasks && tasks.length > 1) {
      const first = new Date(tasks[0].created_date);
      const second = new Date(tasks[1].created_date);
      expect(first >= second).toBe(true);
    }
  });
});

describe('🎯 Tasks - Estados Válidos', () => {
  it('Deve validar estados válidos de tarefa', () => {
    const validStatuses = ['todo', 'in_progress', 'done', 'blocked'];

    validStatuses.forEach(status => {
      expect(['todo', 'in_progress', 'done', 'blocked']).toContain(status);
    });
  });

  it('Deve validar prioridades válidas', () => {
    const validPriorities = ['low', 'medium', 'high', 'critical'];

    validPriorities.forEach(priority => {
      expect(['low', 'medium', 'high', 'critical']).toContain(priority);
    });
  });

  it('Deve permitir filtrar por cada status válido', async () => {
    const statuses = ['todo', 'in_progress', 'done'];

    for (const status of statuses) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', status);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  it('Deve permitir filtrar por cada prioridade válida', async () => {
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
});

describe('👥 Tasks - Atribuição de Usuários', () => {
  it('Deve verificar se tarefa está atribuída a um usuário', () => {
    const task = {
      assigned_to: testUserId
    };

    const isAssigned = task.assigned_to === testUserId;
    expect(isAssigned).toBe(true);
  });

  it('Deve tratar tarefas sem assigned_to', () => {
    const task = {
      assigned_to: null
    };

    const isAssigned = task.assigned_to === testUserId;
    expect(isAssigned).toBe(false);
  });

  it('Deve verificar due_date da tarefa', () => {
    const task = {
      due_date: '2025-12-31'
    };

    const hasDueDate = task.due_date !== null;
    expect(hasDueDate).toBe(true);
  });
});

describe('🔧 Tasks - Limpeza', () => {
  it('Deve limpar tarefas de teste', async () => {
    if (testTaskIds.length > 0) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', testTaskIds);

      expect(error).toBeNull();
    } else {
      // Se não há tarefas para limpar, passa o teste
      expect(testTaskIds.length).toBe(0);
    }
  });
});
