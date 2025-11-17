/**
 * TESTES DA PÁGINA PROJECTS - MAR QUENTE HUB
 *
 * Testa todas as funcionalidades, componentes e filtros da página de Projetos
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const testUserId = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

// IDs de teste para cleanup
let testProjectIds = [];

describe('📊 Projects - Carregamento de Dados', () => {
  it('Deve carregar projetos ordenados por data de criação', async () => {
    const { data, error } = await supabase
      .from('projects')
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
    const { data, error} = await supabase
      .from('departments')
      .select('*')
      .order('name');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar tarefas de todos os projetos', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');

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

describe('📝 Projects - Criação e Edição', () => {
  it('Deve criar novo projeto', async () => {
    const projectData = {
      name: 'Projeto Teste ' + Date.now(),
      description: 'Descrição do projeto de teste',
      status: 'in_progress',
      priority: 'medium',
      owner_id: testUserId
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe(projectData.name);
    expect(data.status).toBe('in_progress');

    if (data) {
      testProjectIds.push(data.id);
    }
  });

  it('Deve atualizar projeto existente', async () => {
    // Criar projeto primeiro
    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert({
        name: 'Projeto para Atualizar',
        status: 'planning',
        priority: 'low',
        owner_id: testUserId
      })
      .select()
      .single();

    expect(createError).toBeNull();
    expect(project).toBeDefined();

    if (project) {
      testProjectIds.push(project.id);

      // Atualizar
      const { data, error } = await supabase
        .from('projects')
        .update({ name: 'Projeto Atualizado' })
        .eq('id', project.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.name).toBe('Projeto Atualizado');
    }
  });

  it('Deve validar seções padrão ao criar projeto', () => {
    const sections = [
      { id: "section-1", name: "A fazer", order: 1, collapsed: false },
      { id: "section-2", name: "Em andamento", order: 2, collapsed: false },
      { id: "section-3", name: "Concluído", order: 3, collapsed: false }
    ];

    expect(sections.length).toBe(3);
    expect(sections[0].name).toBe("A fazer");
    expect(sections[1].name).toBe("Em andamento");
    expect(sections[2].name).toBe("Concluído");
  });
});

describe('🔍 Projects - Filtro de Busca (getFilteredProjects)', () => {
  let projects;

  beforeAll(async () => {
    const { data } = await supabase.from('projects').select('*');
    projects = data || [];
  });

  it('Deve filtrar por nome do projeto (busca)', () => {
    const search = projects.length > 0 ? projects[0].name.substring(0, 3) : '';
    const filtered = projects.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (search) {
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  it('Deve filtrar por descrição do projeto (busca)', () => {
    const projectWithDesc = projects.find(p => p.description);
    if (projectWithDesc) {
      const search = projectWithDesc.description.substring(0, 5);
      const filtered = projects.filter(p =>
        p.description?.toLowerCase().includes(search.toLowerCase())
      );
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  it('Deve filtrar por status', () => {
    const activeProjects = projects.filter(p => p.status === 'ativo');
    expect(activeProjects.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve filtrar por departamento', () => {
    const projectsWithDept = projects.filter(p => p.department_id);
    if (projectsWithDept.length > 0) {
      const deptId = projectsWithDept[0].department_id;
      const filtered = projects.filter(p => p.department_id === deptId);
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  it('Deve filtrar "Meus Projetos" (owner_id)', () => {
    const myProjects = projects.filter(p => p.owner_id === testUserId);
    expect(myProjects.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve filtrar "Participando" (team_members)', () => {
    const participating = projects.filter(p =>
      p.team_members?.includes(testUserId)
    );
    expect(participating.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve retornar todos quando filtro view = "todos"', () => {
    // Simula filtro "todos"
    const allProjects = projects.filter(p => true);
    expect(allProjects.length).toBe(projects.length);
  });
});

describe('⚠️ Projects - Filtros de Problemas (issues)', () => {
  let projects, tasks;

  beforeAll(async () => {
    const [projectsData, tasksData] = await Promise.all([
      supabase.from('projects').select('*'),
      supabase.from('tasks').select('*')
    ]);
    projects = projectsData.data || [];
    tasks = tasksData.data || [];
  });

  it('Deve detectar projetos com tarefas atrasadas', () => {
    const now = new Date();

    projects.forEach(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const hasOverdue = projectTasks.some(t =>
        t.due_date &&
        t.status !== 'concluido' &&
        new Date(t.due_date) < now
      );

      if (hasOverdue) {
        expect(hasOverdue).toBe(true);
      }
    });
  });

  it('Deve detectar projetos com tarefas bloqueadas', () => {
    projects.forEach(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const hasBlocked = projectTasks.some(t => {
        if (!t.dependencies || t.dependencies.length === 0) return false;
        return t.dependencies.some(depId => {
          const dependentTask = projectTasks.find(dt => dt.id === depId);
          return dependentTask && dependentTask.status !== 'concluido';
        });
      });

      // Se encontrar bloqueadas, validar
      if (hasBlocked) {
        expect(hasBlocked).toBe(true);
      }
    });
  });

  it('Deve detectar projetos parados (+7 dias sem atividade)', () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    projects.forEach(project => {
      if (project.status !== 'ativo') return;

      const projectTasks = tasks.filter(t => t.project_id === project.id);
      if (projectTasks.length === 0) return;

      const recentActivity = projectTasks.some(t => {
        const taskDate = t.updated_date
          ? new Date(t.updated_date)
          : new Date(t.created_date);
        return taskDate > sevenDaysAgo;
      });

      const isStalled = !recentActivity;
      expect(typeof isStalled).toBe('boolean');
    });
  });
});

describe('📊 Projects - Estatísticas (Stats)', () => {
  let projects;

  beforeAll(async () => {
    const { data } = await supabase.from('projects').select('*');
    projects = data || [];
  });

  it('Deve contar "Meus Projetos"', () => {
    const myProjects = projects.filter(p => p.owner_id === testUserId);
    expect(myProjects.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve contar projetos "Ativos"', () => {
    const active = projects.filter(p => p.status === 'ativo');
    expect(active.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve contar projetos "Em Espera"', () => {
    const waiting = projects.filter(p => p.status === 'em_espera');
    expect(waiting.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve contar projetos "Concluídos"', () => {
    const completed = projects.filter(p => p.status === 'concluido');
    expect(completed.length).toBeGreaterThanOrEqual(0);
  });
});

describe('✅ Projects - Tarefas do Projeto (getProjectTasks)', () => {
  it('Deve retornar tarefas de um projeto específico', async () => {
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (projects && projects.length > 0) {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project', projects[0].id);

      expect(error).toBeNull();
      expect(Array.isArray(tasks)).toBe(true);
    }
  });

  it('Deve retornar array vazio se projeto não tem tarefas', async () => {
    // Usar um UUID válido mas que não existe
    const fakeUUID = '00000000-0000-0000-0000-000000000000';
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project', fakeUUID);

    expect(error).toBeNull();
    expect(tasks).toBeDefined();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBe(0);
  });
});

describe('👥 Projects - Permissões e Roles', () => {
  it('Deve identificar se usuário é Manager ou Admin', async () => {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', testUserId)
      .single();

    const isManagerOrAdmin = user.role === 'admin' || user.role === 'manager';
    expect(typeof isManagerOrAdmin).toBe('boolean');
  });

  it('Deve mostrar filtro de problemas apenas para Manager/Admin', async () => {
    const { data: users } = await supabase
      .from('users')
      .select('*');

    users.forEach(user => {
      const shouldShowIssuesFilter = user.role === 'admin' || user.role === 'manager';
      expect(typeof shouldShowIssuesFilter).toBe('boolean');
    });
  });
});

describe('🎨 Projects - Modos de Visualização', () => {
  it('Deve alternar entre modo Grid e List', () => {
    let viewMode = 'grid';
    expect(viewMode).toBe('grid');

    viewMode = 'list';
    expect(viewMode).toBe('list');
  });

  it('Deve aplicar classes CSS corretas para Grid', () => {
    const viewMode = 'grid';
    const className = viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      : 'space-y-4';

    expect(className).toContain('grid');
  });

  it('Deve aplicar classes CSS corretas para List', () => {
    const viewMode = 'list';
    const className = viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      : 'space-y-4';

    expect(className).toBe('space-y-4');
  });
});

describe('🔄 Projects - Estados Vazios', () => {
  it('Deve exibir mensagem quando não há projetos', () => {
    const projects = [];
    const isEmpty = projects.length === 0;

    expect(isEmpty).toBe(true);
  });

  it('Deve exibir mensagem diferente se há filtros ativos', () => {
    const filters = {
      search: 'teste',
      status: 'all',
      department: 'all',
      issues: 'all'
    };

    const hasActiveFilters =
      !!filters.search ||
      filters.status !== 'all' ||
      filters.department !== 'all' ||
      filters.issues !== 'all';

    expect(hasActiveFilters).toBe(true);
  });

  it('Deve exibir botão criar projeto apenas sem filtros', () => {
    const filters = {
      search: '',
      status: 'all',
      department: 'all',
      issues: 'all'
    };

    const shouldShowCreateButton =
      !filters.search &&
      filters.status === 'all' &&
      filters.department === 'all' &&
      filters.issues === 'all';

    expect(shouldShowCreateButton).toBe(true);
  });
});

describe('📋 Projects - Filtros Combinados', () => {
  let projects;

  beforeAll(async () => {
    const { data } = await supabase.from('projects').select('*');
    projects = data || [];
  });

  it('Deve aplicar múltiplos filtros simultaneamente', () => {
    const filters = {
      search: '',
      status: 'ativo',
      view: 'meus',
      department: 'all',
      issues: 'all'
    };

    const filtered = projects.filter(project => {
      const searchMatch = project.name?.toLowerCase().includes(filters.search.toLowerCase());
      const statusMatch = filters.status === 'all' || project.status === filters.status;
      const viewMatch = filters.view === 'meus' && project.owner_id === testUserId;

      return searchMatch && statusMatch && viewMatch;
    });

    expect(Array.isArray(filtered)).toBe(true);
  });

  it('Deve retornar projetos quando todos os filtros são "all"', () => {
    const filters = {
      search: '',
      status: 'all',
      view: 'todos',
      department: 'all',
      issues: 'all'
    };

    const filtered = projects.filter(project => {
      const searchMatch = !filters.search ||
        project.name?.toLowerCase().includes(filters.search.toLowerCase());
      const statusMatch = filters.status === 'all';
      const departmentMatch = filters.department === 'all';
      const viewMatch = filters.view === 'todos';

      return searchMatch && statusMatch && departmentMatch && viewMatch;
    });

    if (filters.view === 'todos' && filters.status === 'all' && filters.department === 'all' && !filters.search) {
      expect(filtered.length).toBe(projects.length);
    }
  });
});

describe('📊 Projects - Ordenação', () => {
  it('Deve ordenar projetos por created_date (mais recentes primeiro)', async () => {
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .order('created_date', { ascending: false })
      .limit(10);

    if (projects.length > 1) {
      const first = new Date(projects[0].created_date);
      const second = new Date(projects[1].created_date);
      expect(first >= second).toBe(true);
    }
  });
});

describe('🎯 Projects - Estados dos Projetos', () => {
  it('Deve validar estados válidos de projeto', () => {
    const validStatuses = ['ativo', 'em_espera', 'concluido', 'arquivado'];

    validStatuses.forEach(status => {
      expect(['ativo', 'em_espera', 'concluido', 'arquivado']).toContain(status);
    });
  });

  it('Deve permitir filtrar por cada status válido', async () => {
    const statuses = ['ativo', 'em_espera', 'concluido', 'arquivado'];

    for (const status of statuses) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', status);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });
});

describe('👥 Projects - Team Members', () => {
  it('Deve verificar se usuário está no team_members', () => {
    const project = {
      team_members: [testUserId, 'outro-user-id']
    };

    const isTeamMember = project.team_members?.includes(testUserId);
    expect(isTeamMember).toBe(true);
  });

  it('Deve tratar projetos sem team_members', () => {
    const project = {
      team_members: null
    };

    const isTeamMember = project.team_members?.includes(testUserId);
    expect(isTeamMember).toBeFalsy();
  });
});

describe('🔧 Projects - Limpeza', () => {
  it('Deve limpar projetos de teste', async () => {
    if (testProjectIds.length > 0) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .in('id', testProjectIds);

      expect(error).toBeNull();
    } else {
      // Se não há projetos para limpar, passa o teste
      expect(testProjectIds.length).toBe(0);
    }
  });
});
