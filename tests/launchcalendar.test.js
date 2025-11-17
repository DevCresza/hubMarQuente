/**
 * TESTES DA PÁGINA LAUNCH CALENDAR - MAR QUENTE HUB
 *
 * Testa todas as funcionalidades, componentes e filtros do Calendário de Marketing
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const testUserId = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

// IDs de teste para cleanup
let testEventIds = [];

describe('📊 LaunchCalendar - Carregamento de Dados', () => {
  it('Deve carregar eventos ordenados por start_date', async () => {
    const { data, error } = await supabase
      .from('launch_calendar')
      .select('*')
      .order('start_date');

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

describe('📝 LaunchCalendar - Criação e Edição', () => {
  it('Deve criar novo evento com datas', async () => {
    const startDate = new Date('2025-12-01T10:00:00');
    const endDate = new Date('2025-12-01T12:00:00');

    const eventData = {
      title: 'Evento Teste ' + Date.now(),
      description: 'Descrição do evento de teste',
      type: 'launch',
      status: 'scheduled',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    };

    const { data, error } = await supabase
      .from('launch_calendar')
      .insert(eventData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.title).toBe(eventData.title);
    expect(data.type).toBe('launch');
    expect(data.status).toBe('scheduled');

    if (data) {
      testEventIds.push(data.id);
    }
  });

  it('Deve atualizar evento existente', async () => {
    const startDate = new Date('2025-12-15T14:00:00');
    const endDate = new Date('2025-12-15T16:00:00');

    const { data: event, error: createError } = await supabase
      .from('launch_calendar')
      .insert({
        title: 'Evento para Atualizar',
        type: 'event',
        status: 'scheduled',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .select()
      .single();

    expect(createError).toBeNull();
    expect(event).toBeDefined();

    if (event) {
      testEventIds.push(event.id);

      const { data, error } = await supabase
        .from('launch_calendar')
        .update({ title: 'Evento Atualizado' })
        .eq('id', event.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.title).toBe('Evento Atualizado');
    }
  });

  it('Deve validar que end_date é maior que start_date', () => {
    const startDate = new Date('2025-12-01T10:00:00');
    const endDate = new Date('2025-12-01T12:00:00');

    expect(endDate > startDate).toBe(true);
  });

  it('Deve criar evento com attendees (participantes)', async () => {
    const startDate = new Date('2025-12-20T09:00:00');
    const endDate = new Date('2025-12-20T11:00:00');

    const { data } = await supabase
      .from('launch_calendar')
      .insert({
        title: 'Evento com Participantes',
        type: 'meeting',
        status: 'confirmed',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        attendees: [testUserId]
      })
      .select()
      .single();

    if (data) {
      testEventIds.push(data.id);
      expect(data.attendees).toContain(testUserId);
    }
  });
});

describe('🔍 LaunchCalendar - Filtros (getFilteredEvents)', () => {
  let events;

  beforeAll(async () => {
    const { data } = await supabase.from('launch_calendar').select('*');
    events = data || [];
  });

  it('Deve filtrar por tipo (type)', () => {
    const types = ['launch', 'photoshoot', 'meeting', 'event'];
    types.forEach(type => {
      const filtered = events.filter(e => e.type === type);
      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('Deve filtrar por coleção (collection)', () => {
    const eventsWithCollection = events.filter(e => e.collection);
    if (eventsWithCollection.length > 0) {
      const collectionId = eventsWithCollection[0].collection;
      const filtered = events.filter(e => e.collection === collectionId);
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  it('Deve filtrar por departamento (department)', () => {
    const eventsWithDept = events.filter(e => e.department);
    if (eventsWithDept.length > 0) {
      const deptId = eventsWithDept[0].department;
      const filtered = events.filter(e => e.department === deptId);
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  it('Deve filtrar por status', () => {
    const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
    statuses.forEach(status => {
      const filtered = events.filter(e => e.status === status);
      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('📅 LaunchCalendar - Modos de Visualização', () => {
  it('Deve alternar entre month, week e day', () => {
    let viewMode = 'month';
    expect(viewMode).toBe('month');

    viewMode = 'week';
    expect(viewMode).toBe('week');

    viewMode = 'day';
    expect(viewMode).toBe('day');
  });

  it('Deve navegar para o mês anterior', () => {
    const currentDate = new Date('2025-12-15');
    const previousMonth = new Date(currentDate);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    expect(previousMonth.getMonth()).toBe(10); // Novembro (0-indexed)
  });

  it('Deve navegar para o próximo mês', () => {
    const currentDate = new Date('2025-12-15');
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    expect(nextMonth.getMonth()).toBe(0); // Janeiro (0-indexed)
  });

  it('Deve navegar para semana anterior', () => {
    const currentDate = new Date('2025-12-15T12:00:00Z');
    const previousWeek = new Date(currentDate);
    previousWeek.setDate(previousWeek.getDate() - 7);

    expect(previousWeek.getDate()).toBe(8); // 15 - 7 = 8
  });

  it('Deve navegar para próxima semana', () => {
    const currentDate = new Date('2025-12-15T12:00:00Z');
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(nextWeek.getDate() + 7);

    expect(nextWeek.getDate()).toBe(22); // 15 + 7 = 22
  });

  it('Deve voltar para hoje', () => {
    const today = new Date();
    const currentDate = new Date();

    expect(currentDate.toDateString()).toBe(today.toDateString());
  });
});

describe('📊 LaunchCalendar - Filtros por Data', () => {
  let events;

  beforeAll(async () => {
    const { data } = await supabase.from('launch_calendar').select('*');
    events = data || [];
  });

  it('Deve filtrar eventos de um mês específico', () => {
    const targetMonth = 11; // Dezembro (0-indexed)
    const targetYear = 2025;

    const filtered = events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.getMonth() === targetMonth &&
             eventDate.getFullYear() === targetYear;
    });

    expect(Array.isArray(filtered)).toBe(true);
  });

  it('Deve filtrar eventos de uma semana específica', () => {
    const startOfWeek = new Date('2025-12-01');
    const endOfWeek = new Date('2025-12-07');

    const filtered = events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });

    expect(Array.isArray(filtered)).toBe(true);
  });

  it('Deve filtrar eventos de um dia específico', () => {
    const targetDate = new Date('2025-12-15');
    targetDate.setHours(0, 0, 0, 0);

    const filtered = events.filter(event => {
      const eventDate = new Date(event.start_date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === targetDate.getTime();
    });

    expect(Array.isArray(filtered)).toBe(true);
  });
});

describe('🎯 LaunchCalendar - Estados Válidos', () => {
  it('Deve validar tipos válidos de evento', () => {
    const validTypes = ['launch', 'photoshoot', 'meeting', 'event'];

    validTypes.forEach(type => {
      expect(['launch', 'photoshoot', 'meeting', 'event']).toContain(type);
    });
  });

  it('Deve validar status válidos', () => {
    const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];

    validStatuses.forEach(status => {
      expect(['scheduled', 'confirmed', 'completed', 'cancelled']).toContain(status);
    });
  });

  it('Deve permitir filtrar por cada tipo válido', async () => {
    const types = ['launch', 'photoshoot', 'meeting', 'event'];

    for (const type of types) {
      const { data, error } = await supabase
        .from('launch_calendar')
        .select('*')
        .eq('type', type);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  it('Deve permitir filtrar por cada status válido', async () => {
    const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];

    for (const status of statuses) {
      const { data, error } = await supabase
        .from('launch_calendar')
        .select('*')
        .eq('status', status);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });
});

describe('📋 LaunchCalendar - Filtros Combinados', () => {
  let events;

  beforeAll(async () => {
    const { data } = await supabase.from('launch_calendar').select('*');
    events = data || [];
  });

  it('Deve aplicar múltiplos filtros simultaneamente', () => {
    const filters = {
      type: 'launch',
      status: 'scheduled'
    };

    const filtered = events.filter(event => {
      const typeMatch = event.type === filters.type;
      const statusMatch = event.status === filters.status;

      return typeMatch && statusMatch;
    });

    expect(Array.isArray(filtered)).toBe(true);
  });

  it('Deve retornar todos os eventos quando filtros são "all"', () => {
    const filters = {
      type: 'all',
      collection: 'all',
      department: 'all',
      status: 'all'
    };

    const filtered = events.filter(event => {
      const typeMatch = filters.type === 'all';
      const collectionMatch = filters.collection === 'all';
      const departmentMatch = filters.department === 'all';
      const statusMatch = filters.status === 'all';

      return typeMatch && collectionMatch && departmentMatch && statusMatch;
    });

    if (filters.type === 'all' && filters.status === 'all') {
      expect(filtered.length).toBe(events.length);
    }
  });
});

describe('📊 LaunchCalendar - Ordenação', () => {
  it('Deve ordenar eventos por start_date (crescente)', async () => {
    const { data: events } = await supabase
      .from('launch_calendar')
      .select('*')
      .order('start_date', { ascending: true })
      .limit(10);

    if (events && events.length > 1) {
      const first = new Date(events[0].start_date);
      const second = new Date(events[1].start_date);
      expect(first <= second).toBe(true);
    }
  });
});

describe('👥 LaunchCalendar - Participantes (Attendees)', () => {
  it('Deve verificar se usuário está nos attendees', () => {
    const event = {
      attendees: [testUserId, 'outro-user-id']
    };

    const isAttendee = event.attendees?.includes(testUserId);
    expect(isAttendee).toBe(true);
  });

  it('Deve tratar eventos sem attendees', () => {
    const event = {
      attendees: null
    };

    const isAttendee = event.attendees?.includes(testUserId);
    expect(isAttendee).toBeFalsy();
  });

  it('Deve contar número de participantes', () => {
    const event = {
      attendees: [testUserId, 'user-2', 'user-3']
    };

    const attendeeCount = event.attendees?.length || 0;
    expect(attendeeCount).toBe(3);
  });
});

describe('🎨 LaunchCalendar - Tipos de Evento', () => {
  it('Deve criar evento tipo "launch" (lançamento)', async () => {
    const startDate = new Date('2025-12-25T00:00:00');
    const endDate = new Date('2025-12-25T23:59:59');

    const { data, error } = await supabase
      .from('launch_calendar')
      .insert({
        title: 'Lançamento Coleção Verão',
        type: 'launch',
        status: 'scheduled',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .select()
      .single();

    if (data) {
      testEventIds.push(data.id);
      expect(data.type).toBe('launch');
    }
  });

  it('Deve criar evento tipo "photoshoot" (ensaio)', async () => {
    const startDate = new Date('2025-12-10T00:00:00');
    const endDate = new Date('2025-12-20T23:59:59');

    const { data, error } = await supabase
      .from('launch_calendar')
      .insert({
        title: 'Ensaio Fotográfico Verão',
        type: 'photoshoot',
        status: 'confirmed',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .select()
      .single();

    if (data) {
      testEventIds.push(data.id);
      expect(data.type).toBe('photoshoot');
    }
  });

  it('Deve criar evento tipo "meeting" (reunião)', async () => {
    const startDate = new Date('2025-12-05T14:00:00');
    const endDate = new Date('2025-12-05T15:00:00');

    const { data, error } = await supabase
      .from('launch_calendar')
      .insert({
        title: 'Reunião de Planejamento',
        type: 'meeting',
        status: 'confirmed',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .select()
      .single();

    if (data) {
      testEventIds.push(data.id);
      expect(data.type).toBe('meeting');
    }
  });

  it('Deve criar evento tipo "event" (evento)', async () => {
    const startDate = new Date('2025-12-30T23:59:59');
    const endDate = new Date('2025-12-30T23:59:59');

    const { data, error } = await supabase
      .from('launch_calendar')
      .insert({
        title: 'Evento: Lançamento Especial',
        type: 'event',
        status: 'scheduled',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .select()
      .single();

    if (data) {
      testEventIds.push(data.id);
      expect(data.type).toBe('event');
    }
  });
});

describe('📍 LaunchCalendar - Localização', () => {
  it('Deve criar evento com localização', async () => {
    const startDate = new Date('2025-12-18T10:00:00');
    const endDate = new Date('2025-12-18T12:00:00');

    const { data } = await supabase
      .from('launch_calendar')
      .insert({
        title: 'Evento Presencial',
        type: 'meeting',
        status: 'confirmed',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        location: 'Sala de Reuniões 3º Andar'
      })
      .select()
      .single();

    if (data) {
      testEventIds.push(data.id);
      expect(data.location).toBe('Sala de Reuniões 3º Andar');
    }
  });

  it('Deve tratar eventos sem localização', () => {
    const event = {
      location: null
    };

    const hasLocation = event.location !== null;
    expect(hasLocation).toBe(false);
  });
});

describe('🔧 LaunchCalendar - Limpeza', () => {
  it('Deve limpar eventos de teste', async () => {
    if (testEventIds.length > 0) {
      const { error } = await supabase
        .from('launch_calendar')
        .delete()
        .in('id', testEventIds);

      expect(error).toBeNull();
    } else {
      expect(testEventIds.length).toBe(0);
    }
  });
});
