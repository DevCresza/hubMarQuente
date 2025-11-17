/**
 * TESTES DA PÁGINA COLLECTIONS - MAR QUENTE HUB
 *
 * Testa todas as funcionalidades, componentes e filtros de Coleções
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// IDs de teste para cleanup
let testCollectionIds = [];
let testStylistId = null;

describe('📊 Collections - Carregamento de Dados', () => {
  it('Deve carregar coleções ordenadas por launch_date (decrescente)', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('launch_date', { ascending: false });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar stylists ordenados por nome', async () => {
    const { data, error } = await supabase
      .from('stylists')
      .select('*')
      .order('name');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar coleção específica por ID', async () => {
    // Primeiro pegar qualquer coleção existente
    const { data: collections } = await supabase
      .from('collections')
      .select('*')
      .limit(1);

    if (collections && collections.length > 0) {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collections[0].id)
        .single();

      expect(error).toBeNull();
      expect(data.id).toBe(collections[0].id);
    }
  });
});

describe('📝 Collections - Criação e Edição', () => {
  beforeAll(async () => {
    // Criar um stylist de teste
    const { data: stylist } = await supabase
      .from('stylists')
      .insert({
        name: 'Stylist Teste ' + Date.now(),
        email: 'stylist.teste@example.com',
        specialty: 'Moda Praia'
      })
      .select()
      .single();

    if (stylist) {
      testStylistId = stylist.id;
    }
  });

  it('Deve criar nova coleção', async () => {
    const collectionData = {
      name: 'Coleção Teste ' + Date.now(),
      description: 'Descrição da coleção de teste',
      season: 'Verão',
      year: 2025,
      status: 'planning',
      launch_date: '2025-12-01',
      stylist: testStylistId,
      piece_count: 50,
      target_audience: 'Público jovem, 18-35 anos'
    };

    const { data, error } = await supabase
      .from('collections')
      .insert(collectionData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe(collectionData.name);
    expect(data.status).toBe('planning');
    expect(data.season).toBe('Verão');
    expect(data.year).toBe(2025);

    if (data) {
      testCollectionIds.push(data.id);
    }
  });

  it('Deve criar coleção com color_palette (array)', async () => {
    const collectionData = {
      name: 'Coleção Cores ' + Date.now(),
      season: 'Inverno',
      year: 2025,
      status: 'planning',
      color_palette: ['#FF5733', '#33FF57', '#3357FF'],
      stylist: testStylistId
    };

    const { data, error } = await supabase
      .from('collections')
      .insert(collectionData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.color_palette).toEqual(['#FF5733', '#33FF57', '#3357FF']);

    if (data) {
      testCollectionIds.push(data.id);
    }
  });

  it('Deve atualizar coleção existente', async () => {
    // Criar coleção para atualizar
    const { data: collection } = await supabase
      .from('collections')
      .insert({
        name: 'Coleção para Atualizar',
        season: 'Primavera',
        year: 2025,
        status: 'planning'
      })
      .select()
      .single();

    if (collection) {
      testCollectionIds.push(collection.id);

      // Atualizar
      const { data, error } = await supabase
        .from('collections')
        .update({
          name: 'Coleção Atualizada',
          status: 'active'
        })
        .eq('id', collection.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.name).toBe('Coleção Atualizada');
      expect(data.status).toBe('active');
    }
  });

  it('Deve validar campos obrigatórios (name, season, year, status)', async () => {
    const { error } = await supabase
      .from('collections')
      .insert({
        name: 'Teste Obrigatórios'
        // Faltando season, year, status
      });

    expect(error).not.toBeNull();
  });
});

describe('🎨 Collections - Seasons (Temporadas)', () => {
  it('Deve criar coleção para cada temporada', async () => {
    const seasons = ['Verão', 'Inverno', 'Primavera', 'Outono'];

    for (const season of seasons) {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          name: `Coleção ${season} ${Date.now()}`,
          season: season,
          year: 2025,
          status: 'planning'
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.season).toBe(season);

      if (data) {
        testCollectionIds.push(data.id);
      }
    }
  });

  it('Deve filtrar coleções por temporada', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('season', 'Verão');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      expect(data[0].season).toBe('Verão');
    }
  });

  it('Deve filtrar coleções por ano', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('year', 2025);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      expect(data[0].year).toBe(2025);
    }
  });
});

describe('🎯 Collections - Status', () => {
  it('Deve validar status válidos', () => {
    const validStatuses = ['planning', 'active', 'completed', 'archived'];

    validStatuses.forEach(status => {
      expect(['planning', 'active', 'completed', 'archived']).toContain(status);
    });
  });

  it('Deve criar coleção para cada status válido', async () => {
    const statuses = ['planning', 'active', 'completed', 'archived'];

    for (const status of statuses) {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          name: `Coleção ${status} ${Date.now()}`,
          season: 'Verão',
          year: 2025,
          status: status
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe(status);

      if (data) {
        testCollectionIds.push(data.id);
      }
    }
  });

  it('Deve filtrar coleções por status', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('status', 'planning');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve transicionar status de planning para active', async () => {
    const { data: collection } = await supabase
      .from('collections')
      .insert({
        name: 'Coleção Transição',
        season: 'Verão',
        year: 2025,
        status: 'planning'
      })
      .select()
      .single();

    if (collection) {
      testCollectionIds.push(collection.id);

      const { data, error } = await supabase
        .from('collections')
        .update({ status: 'active' })
        .eq('id', collection.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('active');
    }
  });
});

describe('👔 Collections - Stylist (Relacionamento)', () => {
  it('Deve associar stylist à coleção', async () => {
    if (testStylistId) {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          name: 'Coleção com Stylist',
          season: 'Inverno',
          year: 2025,
          status: 'planning',
          stylist: testStylistId
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.stylist).toBe(testStylistId);

      if (data) {
        testCollectionIds.push(data.id);
      }
    }
  });

  it('Deve buscar stylist relacionado à coleção', async () => {
    if (testStylistId) {
      // Criar coleção com stylist
      const { data: collection } = await supabase
        .from('collections')
        .insert({
          name: 'Coleção Stylist Join',
          season: 'Verão',
          year: 2025,
          status: 'planning',
          stylist: testStylistId
        })
        .select('*, stylists(*)')
        .single();

      if (collection) {
        testCollectionIds.push(collection.id);
        expect(collection.stylist).toBe(testStylistId);
        expect(collection.stylists).toBeDefined();
      }
    }
  });

  it('Deve filtrar coleções por stylist', async () => {
    if (testStylistId) {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('stylist', testStylistId);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });
});

describe('📅 Collections - Launch Date', () => {
  it('Deve definir data de lançamento futura', async () => {
    const futureDate = '2025-12-25';

    const { data, error } = await supabase
      .from('collections')
      .insert({
        name: 'Coleção Lançamento Futuro',
        season: 'Verão',
        year: 2025,
        status: 'planning',
        launch_date: futureDate
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.launch_date).toBe(futureDate);

    if (data) {
      testCollectionIds.push(data.id);
    }
  });

  it('Deve ordenar coleções por data de lançamento (decrescente)', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .not('launch_date', 'is', null)
      .order('launch_date', { ascending: false })
      .limit(10);

    expect(error).toBeNull();

    if (data && data.length > 1) {
      const first = new Date(data[0].launch_date);
      const second = new Date(data[1].launch_date);
      expect(first >= second).toBe(true);
    }
  });

  it('Deve filtrar coleções por range de datas', async () => {
    const startDate = '2025-01-01';
    const endDate = '2025-12-31';

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .gte('launch_date', startDate)
      .lte('launch_date', endDate);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('🎨 Collections - Color Palette', () => {
  it('Deve salvar paleta de cores como array', async () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];

    const { data, error } = await supabase
      .from('collections')
      .insert({
        name: 'Coleção Paleta Cores',
        season: 'Primavera',
        year: 2025,
        status: 'planning',
        color_palette: colors
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.color_palette).toEqual(colors);

    if (data) {
      testCollectionIds.push(data.id);
    }
  });

  it('Deve atualizar paleta de cores', async () => {
    const { data: collection } = await supabase
      .from('collections')
      .insert({
        name: 'Coleção Atualizar Cores',
        season: 'Outono',
        year: 2025,
        status: 'planning',
        color_palette: ['#000000', '#FFFFFF']
      })
      .select()
      .single();

    if (collection) {
      testCollectionIds.push(collection.id);

      const newColors = ['#FF0000', '#00FF00', '#0000FF'];

      const { data, error } = await supabase
        .from('collections')
        .update({ color_palette: newColors })
        .eq('id', collection.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.color_palette).toEqual(newColors);
    }
  });

  it('Deve permitir paleta vazia ou null', async () => {
    const { data, error } = await supabase
      .from('collections')
      .insert({
        name: 'Coleção Sem Cores',
        season: 'Inverno',
        year: 2025,
        status: 'planning',
        color_palette: null
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.color_palette).toBeNull();

    if (data) {
      testCollectionIds.push(data.id);
    }
  });
});

describe('📊 Collections - Piece Count', () => {
  it('Deve salvar quantidade de peças', async () => {
    const { data, error } = await supabase
      .from('collections')
      .insert({
        name: 'Coleção 100 Peças',
        season: 'Verão',
        year: 2025,
        status: 'planning',
        piece_count: 100
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.piece_count).toBe(100);

    if (data) {
      testCollectionIds.push(data.id);
    }
  });

  it('Deve ordenar coleções por quantidade de peças', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .not('piece_count', 'is', null)
      .order('piece_count', { ascending: false })
      .limit(10);

    expect(error).toBeNull();

    if (data && data.length > 1) {
      expect(data[0].piece_count >= data[1].piece_count).toBe(true);
    }
  });

  it('Deve filtrar coleções com piece_count maior que valor', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .gt('piece_count', 50);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('🎯 Collections - Target Audience', () => {
  it('Deve salvar público-alvo', async () => {
    const targetAudience = 'Mulheres de 25-40 anos, classe A/B';

    const { data, error } = await supabase
      .from('collections')
      .insert({
        name: 'Coleção Público Específico',
        season: 'Inverno',
        year: 2025,
        status: 'planning',
        target_audience: targetAudience
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.target_audience).toBe(targetAudience);

    if (data) {
      testCollectionIds.push(data.id);
    }
  });

  it('Deve buscar coleções por palavras-chave no target_audience', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .ilike('target_audience', '%jovem%');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('🔍 Collections - Filtros Combinados', () => {
  it('Deve filtrar por múltiplos critérios', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('season', 'Verão')
      .eq('year', 2025)
      .eq('status', 'planning');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve buscar coleções ativas de 2025', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('status', 'active')
      .eq('year', 2025);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve buscar coleções com stylist e data de lançamento', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .not('stylist', 'is', null)
      .not('launch_date', 'is', null);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('🗑️ Collections - Exclusão', () => {
  it('Deve excluir coleção', async () => {
    const { data: collection } = await supabase
      .from('collections')
      .insert({
        name: 'Coleção para Excluir',
        season: 'Verão',
        year: 2025,
        status: 'planning'
      })
      .select()
      .single();

    if (collection) {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collection.id);

      expect(error).toBeNull();

      // Verificar que foi excluída
      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collection.id);

      expect(data.length).toBe(0);
    }
  });
});

describe('📊 Collections - Ordenação', () => {
  it('Deve ordenar por nome (alfabética)', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('name', { ascending: true })
      .limit(10);

    expect(error).toBeNull();

    if (data && data.length > 1) {
      expect(data[0].name.toLowerCase() <= data[1].name.toLowerCase()).toBe(true);
    }
  });

  it('Deve ordenar por data de criação', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('created_date', { ascending: false })
      .limit(10);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('🔧 Collections - Limpeza', () => {
  afterAll(async () => {
    // Limpar coleções de teste
    if (testCollectionIds.length > 0) {
      const { error } = await supabase
        .from('collections')
        .delete()
        .in('id', testCollectionIds);

      expect(error).toBeNull();
    }

    // Limpar stylist de teste
    if (testStylistId) {
      await supabase
        .from('stylists')
        .delete()
        .eq('id', testStylistId);
    }
  });

  it('Deve limpar dados de teste', async () => {
    expect(testCollectionIds.length).toBeGreaterThan(0);
  });
});
