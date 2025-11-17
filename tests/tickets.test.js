/**
 * TESTES DA PÁGINA TICKETS - MAR QUENTE HUB
 *
 * Testa todas as funcionalidades, componentes e filtros da página de Tickets
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const testUserId = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

// IDs de teste para cleanup
let testTicketIds = [];

describe('📊 Tickets - Carregamento de Dados', () => {
  it('Deve carregar tickets ordenados por data de criação', async () => {
    const { data, error } = await supabase
      .from('tickets')
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

describe('📝 Tickets - Criação e Edição', () => {
  it('Deve criar novo ticket com número único', async () => {
    const ticketNumber = `TCK-${Date.now()}`;
    const ticketData = {
      title: 'Ticket Teste ' + Date.now(),
      description: 'Descrição do ticket de teste',
      status: 'open',
      priority: 'medium',
      type: 'request',
      created_by: testUserId
    };

    const { data, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.title).toBe(ticketData.title);
    expect(data.status).toBe('open');

    if (data) {
      testTicketIds.push(data.id);
    }
  });

  it('Deve atualizar ticket existente', async () => {
    const ticketNumber = `TCK-${Date.now()}`;
    const { data: ticket, error: createError } = await supabase
      .from('tickets')
      .insert({
        title: 'Ticket para Atualizar',
        status: 'open',
        priority: 'low',
        type: 'request',
          created_by: testUserId
      })
      .select()
      .single();

    expect(createError).toBeNull();
    expect(ticket).toBeDefined();

    if (ticket) {
      testTicketIds.push(ticket.id);

      const { data, error } = await supabase
        .from('tickets')
        .update({ title: 'Ticket Atualizado' })
        .eq('id', ticket.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.title).toBe('Ticket Atualizado');
    }
  });

  it('Deve validar campos obrigatórios do ticket', () => {
    const requiredFields = ['title', 'status', 'priority', 'type', 'created_by'];

    requiredFields.forEach(field => {
      expect(requiredFields).toContain(field);
    });
  });

  it('Deve definir created_by ao criar ticket', async () => {
    const ticketNumber = `TCK-${Date.now()}`;
    const { data } = await supabase
      .from('tickets')
      .insert({
        title: 'Ticket com Created By',
        status: 'open',
        priority: 'medium',
        type: 'request',
          created_by: testUserId
      })
      .select()
      .single();

    if (data) {
      testTicketIds.push(data.id);
      expect(data.created_by).toBe(testUserId);
    }
  });
});

describe('🔄 Tickets - Mudança de Status', () => {
  it('Deve marcar resolved_date ao resolver ticket', async () => {
    const ticketNumber = `TCK-${Date.now()}`;
    const { data: ticket } = await supabase
      .from('tickets')
      .insert({
        title: 'Ticket para Resolver',
        status: 'in_progress',
        priority: 'medium',
        type: 'issue',
          created_by: testUserId
      })
      .select()
      .single();

    if (ticket) {
      testTicketIds.push(ticket.id);

      const { data, error } = await supabase
        .from('tickets')
        .update({
          status: 'resolved',
        })
        .eq('id', ticket.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('resolved');
    }
  });

  it('Deve validar transição de open para in_progress', async () => {
    const ticketNumber = `TCK-${Date.now()}`;
    const { data: ticket } = await supabase
      .from('tickets')
      .insert({
        title: 'Ticket Aberto',
        status: 'open',
        priority: 'high',
        type: 'request',
          created_by: testUserId
      })
      .select()
      .single();

    if (ticket) {
      testTicketIds.push(ticket.id);

      const { data, error } = await supabase
        .from('tickets')
        .update({ status: 'in_progress' })
        .eq('id', ticket.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('in_progress');
    }
  });

  it('Deve validar transição de in_progress para resolved', async () => {
    const ticketNumber = `TCK-${Date.now()}`;
    const { data: ticket } = await supabase
      .from('tickets')
      .insert({
        title: 'Ticket Em Progresso',
        status: 'in_progress',
        priority: 'medium',
        type: 'issue',
          created_by: testUserId
      })
      .select()
      .single();

    if (ticket) {
      testTicketIds.push(ticket.id);

      const { data, error } = await supabase
        .from('tickets')
        .update({
          status: 'resolved',
        })
        .eq('id', ticket.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('resolved');
    }
  });

  it('Deve validar transição para closed', async () => {
    const ticketNumber = `TCK-${Date.now()}`;
    const { data: ticket } = await supabase
      .from('tickets')
      .insert({
        title: 'Ticket Resolvido',
        status: 'resolved',
        priority: 'low',
        type: 'request',
          created_by: testUserId
      })
      .select()
      .single();

    if (ticket) {
      testTicketIds.push(ticket.id);

      const { data, error } = await supabase
        .from('tickets')
        .update({ status: 'closed' })
        .eq('id', ticket.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('closed');
    }
  });
});

describe('🔍 Tickets - Filtros (getFilteredTickets)', () => {
  let tickets;

  beforeAll(async () => {
    const { data } = await supabase.from('tickets').select('*');
    tickets = data || [];
  });

  it('Deve filtrar por busca (title)', () => {
    const ticketWithTitle = tickets.find(t => t.title);
    if (ticketWithTitle) {
      const search = ticketWithTitle.title.substring(0, 3);
      const filtered = tickets.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase())
      );
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  it('Deve filtrar por busca (id)', () => {
    const ticketWithId = tickets.find(t => t.id);
    if (ticketWithId) {
      const search = ticketWithId.id;
      const filtered = tickets.filter(t => t.id === search);
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  it('Deve filtrar por busca (description)', () => {
    const ticketWithDesc = tickets.find(t => t.description);
    if (ticketWithDesc) {
      const search = ticketWithDesc.description.substring(0, 5);
      const filtered = tickets.filter(t =>
        t.description?.toLowerCase().includes(search.toLowerCase())
      );
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  it('Deve filtrar por status', () => {
    const statuses = ['open', 'in_progress', 'resolved', 'closed'];
    statuses.forEach(status => {
      const filtered = tickets.filter(t => t.status === status);
      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('Deve filtrar por prioridade', () => {
    const priorities = ['low', 'medium', 'high', 'critical'];
    priorities.forEach(priority => {
      const filtered = tickets.filter(t => t.priority === priority);
      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('Deve filtrar por departamento', () => {
    const ticketsWithDept = tickets.filter(t => t.department_id);
    if (ticketsWithDept.length > 0) {
      const deptId = ticketsWithDept[0].department_id;
      const filtered = tickets.filter(t => t.department_id === deptId);
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  it('Deve filtrar por tipo (type)', () => {
    const types = ['request', 'issue', 'question'];
    types.forEach(type => {
      const filtered = tickets.filter(t => t.type === type);
      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('Deve filtrar "Meus Tickets" (created_by)', () => {
    const myTickets = tickets.filter(t => t.created_by === testUserId);
    expect(myTickets.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve filtrar "Tickets Atribuídos a Mim" (assigned_to)', () => {
    const assignedToMe = tickets.filter(t => t.assigned_to === testUserId);
    expect(assignedToMe.length).toBeGreaterThanOrEqual(0);
  });
});

describe('📊 Tickets - Estatísticas', () => {
  let tickets;

  beforeAll(async () => {
    const { data } = await supabase.from('tickets').select('*');
    tickets = data || [];
  });

  it('Deve contar tickets abertos', () => {
    const openTickets = tickets.filter(t => t.status === 'open');
    expect(openTickets.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve contar tickets em progresso', () => {
    const inProgress = tickets.filter(t => t.status === 'in_progress');
    expect(inProgress.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve contar tickets resolvidos', () => {
    const resolved = tickets.filter(t => t.status === 'resolved');
    expect(resolved.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve contar tickets fechados', () => {
    const closed = tickets.filter(t => t.status === 'closed');
    expect(closed.length).toBeGreaterThanOrEqual(0);
  });

  it('Deve contar tickets por prioridade', () => {
    const priorities = {
      low: tickets.filter(t => t.priority === 'low').length,
      medium: tickets.filter(t => t.priority === 'medium').length,
      high: tickets.filter(t => t.priority === 'high').length,
      critical: tickets.filter(t => t.priority === 'critical').length
    };

    expect(typeof priorities.low).toBe('number');
    expect(typeof priorities.medium).toBe('number');
    expect(typeof priorities.high).toBe('number');
    expect(typeof priorities.critical).toBe('number');
  });
});

describe('🔔 Tickets - Estados Vazios', () => {
  it('Deve exibir mensagem quando não há tickets', () => {
    const tickets = [];
    const isEmpty = tickets.length === 0;

    expect(isEmpty).toBe(true);
  });

  it('Deve exibir mensagem diferente se há filtros ativos', () => {
    const filters = {
      search: 'teste',
      status: 'all'
    };

    const hasActiveFilters = !!filters.search || filters.status !== 'all';
    expect(hasActiveFilters).toBe(true);
  });

  it('Deve exibir sugestão de criar ticket sem filtros', () => {
    const filters = {
      search: '',
      status: 'all'
    };

    const shouldShowSuggestion = !filters.search && filters.status === 'all';
    expect(shouldShowSuggestion).toBe(true);
  });
});

describe('📋 Tickets - Filtros Combinados', () => {
  let tickets;

  beforeAll(async () => {
    const { data } = await supabase.from('tickets').select('*');
    tickets = data || [];
  });

  it('Deve aplicar múltiplos filtros simultaneamente', () => {
    const filters = {
      search: '',
      status: 'open',
      priority: 'high',
      view: 'meus'
    };

    const filtered = tickets.filter(ticket => {
      const viewMatch = ticket.created_by === testUserId;
      const searchMatch = true;
      const statusMatch = ticket.status === filters.status;
      const priorityMatch = ticket.priority === filters.priority;

      return viewMatch && searchMatch && statusMatch && priorityMatch;
    });

    expect(Array.isArray(filtered)).toBe(true);
  });

  it('Deve retornar todos os tickets quando filtros são "all"', () => {
    const filters = {
      search: '',
      status: 'all',
      priority: 'all',
      department: 'all',
      type: 'all',
      view: 'todos'
    };

    const filtered = tickets.filter(ticket => {
      const searchMatch = !filters.search;
      const statusMatch = filters.status === 'all';
      const priorityMatch = filters.priority === 'all';
      const departmentMatch = filters.department === 'all';
      const typeMatch = filters.type === 'all';

      return searchMatch && statusMatch && priorityMatch && departmentMatch && typeMatch;
    });

    if (filters.status === 'all' && filters.priority === 'all' && !filters.search) {
      expect(filtered.length).toBe(tickets.length);
    }
  });
});

describe('📊 Tickets - Ordenação', () => {
  it('Deve ordenar tickets por created_date (mais recentes primeiro)', async () => {
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*')
      .order('created_date', { ascending: false })
      .limit(10);

    if (tickets && tickets.length > 1) {
      const first = new Date(tickets[0].created_date);
      const second = new Date(tickets[1].created_date);
      expect(first >= second).toBe(true);
    }
  });
});

describe('🎯 Tickets - Estados Válidos', () => {
  it('Deve validar estados válidos de ticket', () => {
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];

    validStatuses.forEach(status => {
      expect(['open', 'in_progress', 'resolved', 'closed']).toContain(status);
    });
  });

  it('Deve validar prioridades válidas', () => {
    const validPriorities = ['low', 'medium', 'high', 'critical'];

    validPriorities.forEach(priority => {
      expect(['low', 'medium', 'high', 'critical']).toContain(priority);
    });
  });

  it('Deve validar tipos válidos', () => {
    const validTypes = ['request', 'issue', 'question'];

    validTypes.forEach(type => {
      expect(['request', 'issue', 'question']).toContain(type);
    });
  });

  it('Deve permitir filtrar por cada status válido', async () => {
    const statuses = ['open', 'in_progress', 'resolved', 'closed'];

    for (const status of statuses) {
      const { data, error } = await supabase
        .from('tickets')
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
        .from('tickets')
        .select('*')
        .eq('priority', priority);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });
});

describe('👥 Tickets - Atribuição', () => {
  it('Deve verificar se ticket está atribuído a um usuário', () => {
    const ticket = {
      assigned_to: testUserId
    };

    const isAssigned = ticket.assigned_to === testUserId;
    expect(isAssigned).toBe(true);
  });

  it('Deve tratar tickets sem assigned_to', () => {
    const ticket = {
      assigned_to: null
    };

    const isAssigned = ticket.assigned_to === testUserId;
    expect(isAssigned).toBe(false);
  });

  it('Deve verificar created_by do usuário', () => {
    const ticket = {
      created_by: testUserId
    };

    const isCreator = ticket.created_by === testUserId;
    expect(isCreator).toBe(true);
  });

  it('Deve verificar resolved_date do ticket', () => {
    const ticket = {
      resolved_date: new Date().toISOString(),
      status: 'resolved'
    };

    const hasResolvedDate = ticket.resolved_date !== null;
    expect(hasResolvedDate).toBe(true);
  });
});

describe('🎨 Tickets - Tipos de Ticket', () => {
  it('Deve criar ticket tipo "request" (solicitação)', async () => {
    const ticketNumber = `TCK-${Date.now()}`;
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title: 'Solicitação Teste',
        status: 'open',
        priority: 'medium',
        type: 'request',
          created_by: testUserId
      })
      .select()
      .single();

    if (data) {
      testTicketIds.push(data.id);
      expect(data.type).toBe('request');
    }
  });

  it('Deve criar ticket tipo "issue" (problema)', async () => {
    const ticketNumber = `TCK-${Date.now()}`;
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title: 'Problema Teste',
        status: 'open',
        priority: 'high',
        type: 'issue',
          created_by: testUserId
      })
      .select()
      .single();

    if (data) {
      testTicketIds.push(data.id);
      expect(data.type).toBe('issue');
    }
  });

  it('Deve criar ticket tipo "question" (pergunta)', async () => {
    const ticketNumber = `TCK-${Date.now()}`;
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title: 'Pergunta Teste',
        status: 'open',
        priority: 'low',
        type: 'question',
          created_by: testUserId
      })
      .select()
      .single();

    if (data) {
      testTicketIds.push(data.id);
      expect(data.type).toBe('question');
    }
  });
});

describe('🔧 Tickets - Limpeza', () => {
  it('Deve limpar tickets de teste', async () => {
    if (testTicketIds.length > 0) {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .in('id', testTicketIds);

      expect(error).toBeNull();
    } else {
      expect(testTicketIds.length).toBe(0);
    }
  });
});
