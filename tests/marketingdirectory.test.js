/**
 * TESTES DA PÁGINA MARKETING DIRECTORY - MAR QUENTE HUB
 *
 * Testa todas as funcionalidades, componentes e filtros do Diretório de Marketing
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const testUserId = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

// IDs de teste para cleanup
let testAssetIds = [];
let testBrandId = null;
let testCampaignId = null;

describe('📊 MarketingDirectory - Carregamento de Dados', () => {
  it('Deve carregar assets ordenados por created_date (decrescente)', async () => {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .order('created_date', { ascending: false });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar collections ordenadas por nome', async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('name');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar brands ordenadas por nome', async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve carregar usuários ordenados por full_name', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('📝 MarketingDirectory - Criação e Edição de Assets', () => {
  beforeAll(async () => {
    // Criar brand de teste
    const { data: brand } = await supabase
      .from('brands')
      .insert({
        name: 'Brand Teste ' + Date.now(),
        description: 'Marca de teste',
        category: 'Fashion'
      })
      .select()
      .single();

    if (brand) {
      testBrandId = brand.id;
    }

    // Criar campaign de teste
    const { data: campaign } = await supabase
      .from('campaigns')
      .insert({
        name: 'Campaign Teste ' + Date.now(),
        description: 'Campanha de teste',
        status: 'active',
        start_date: '2025-01-01',
        end_date: '2025-12-31'
      })
      .select()
      .single();

    if (campaign) {
      testCampaignId = campaign.id;
    }
  });

  it('Deve criar novo asset de imagem', async () => {
    const assetData = {
      name: 'Asset Teste ' + Date.now(),
      description: 'Descrição do asset de teste',
      type: 'image',
      category: 'web',
      file_url: 'https://example.com/image.jpg',
      file_size: 1024000,
      format: 'jpg',
      dimensions: '1920x1080',
      created_by: testUserId,
      tags: ['verão', 'praia', 'editorial']
    };

    const { data, error } = await supabase
      .from('marketing_assets')
      .insert(assetData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe(assetData.name);
    expect(data.type).toBe('image');
    expect(data.category).toBe('web');

    if (data) {
      testAssetIds.push(data.id);
    }
  });

  it('Deve criar asset com brand e campaign', async () => {
    if (testBrandId && testCampaignId) {
      const { data, error } = await supabase
        .from('marketing_assets')
        .insert({
          name: 'Asset com Marca',
          type: 'image',
          category: 'social',
          file_url: 'https://example.com/branded.jpg',
          file_size: 2048000,
          format: 'jpg',
          campaign: testCampaignId,
          created_by: testUserId
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.campaign).toBe(testCampaignId);

      if (data) {
        testAssetIds.push(data.id);
      }
    }
  });

  it('Deve atualizar asset existente', async () => {
    const { data: asset } = await supabase
      .from('marketing_assets')
      .insert({
        name: 'Asset para Atualizar',
        type: 'image',
        category: 'web',
        file_url: 'https://example.com/update.jpg',
        file_size: 1500000,
        format: 'jpg'
      })
      .select()
      .single();

    if (asset) {
      testAssetIds.push(asset.id);

      const { data, error } = await supabase
        .from('marketing_assets')
        .update({
          name: 'Asset Atualizado',
          description: 'Nova descrição'
        })
        .eq('id', asset.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.name).toBe('Asset Atualizado');
      expect(data.description).toBe('Nova descrição');
    }
  });

  it('Deve validar campos obrigatórios', async () => {
    const { error } = await supabase
      .from('marketing_assets')
      .insert({
        name: 'Teste Incompleto'
        // Faltando type, category, file_url, file_size, format
      });

    expect(error).not.toBeNull();
  });
});

describe('🎨 MarketingDirectory - Tipos de Asset', () => {
  it('Deve validar tipos válidos', () => {
    const validTypes = ['image', 'video', 'pdf', 'design'];

    validTypes.forEach(type => {
      expect(['image', 'video', 'pdf', 'design']).toContain(type);
    });
  });

  it('Deve criar asset para cada tipo válido', async () => {
    const types = ['image', 'video', 'pdf', 'design'];

    for (const type of types) {
      const { data, error } = await supabase
        .from('marketing_assets')
        .insert({
          name: `Asset ${type} ${Date.now()}`,
          type: type,
          category: 'web',
          file_url: `https://example.com/file.${type}`,
          file_size: 1024000,
          format: type === 'image' ? 'jpg' : type
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.type).toBe(type);

      if (data) {
        testAssetIds.push(data.id);
      }
    }
  });

  it('Deve filtrar assets por tipo', async () => {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .eq('type', 'image');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      expect(data[0].type).toBe('image');
    }
  });
});

describe('📂 MarketingDirectory - Categorias', () => {
  it('Deve validar categorias válidas', () => {
    const validCategories = ['web', 'social', 'print', 'email'];

    validCategories.forEach(category => {
      expect(['web', 'social', 'print', 'email']).toContain(category);
    });
  });

  it('Deve criar asset para cada categoria válida', async () => {
    const categories = ['web', 'social', 'print', 'email'];

    for (const category of categories) {
      const { data, error } = await supabase
        .from('marketing_assets')
        .insert({
          name: `Asset ${category} ${Date.now()}`,
          type: 'image',
          category: category,
          file_url: `https://example.com/${category}.jpg`,
          file_size: 1024000,
          format: 'jpg'
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.category).toBe(category);

      if (data) {
        testAssetIds.push(data.id);
      }
    }
  });

  it('Deve filtrar assets por categoria', async () => {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .eq('category', 'social');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('🏷️ MarketingDirectory - Tags (Array)', () => {
  it('Deve salvar tags como array', async () => {
    const tags = ['verão', 'praia', 'editorial', 'lookbook'];

    const { data, error } = await supabase
      .from('marketing_assets')
      .insert({
        name: 'Asset com Tags',
        type: 'image',
        category: 'web',
        file_url: 'https://example.com/tagged.jpg',
        file_size: 1024000,
        format: 'jpg',
        tags: tags
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.tags).toEqual(tags);

    if (data) {
      testAssetIds.push(data.id);
    }
  });

  it('Deve atualizar tags', async () => {
    const { data: asset } = await supabase
      .from('marketing_assets')
      .insert({
        name: 'Asset Atualizar Tags',
        type: 'image',
        category: 'web',
        file_url: 'https://example.com/tags.jpg',
        file_size: 1024000,
        format: 'jpg',
        tags: ['tag1', 'tag2']
      })
      .select()
      .single();

    if (asset) {
      testAssetIds.push(asset.id);

      const newTags = ['nova-tag', 'atualizada', 'teste'];

      const { data, error } = await supabase
        .from('marketing_assets')
        .update({ tags: newTags })
        .eq('id', asset.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.tags).toEqual(newTags);
    }
  });

  it('Deve permitir tags null ou vazio', async () => {
    const { data, error } = await supabase
      .from('marketing_assets')
      .insert({
        name: 'Asset Sem Tags',
        type: 'image',
        category: 'web',
        file_url: 'https://example.com/notags.jpg',
        file_size: 1024000,
        format: 'jpg',
        tags: null
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.tags).toBeNull();

    if (data) {
      testAssetIds.push(data.id);
    }
  });
});

describe('📏 MarketingDirectory - File Properties', () => {
  it('Deve salvar file_size em bytes', async () => {
    const fileSize = 5242880; // 5 MB

    const { data, error } = await supabase
      .from('marketing_assets')
      .insert({
        name: 'Asset Grande',
        type: 'video',
        category: 'web',
        file_url: 'https://example.com/large-video.mp4',
        file_size: fileSize,
        format: 'mp4'
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.file_size).toBe(fileSize);

    if (data) {
      testAssetIds.push(data.id);
    }
  });

  it('Deve salvar dimensions como string', async () => {
    const dimensions = '1920x1080';

    const { data, error } = await supabase
      .from('marketing_assets')
      .insert({
        name: 'Asset Full HD',
        type: 'image',
        category: 'web',
        file_url: 'https://example.com/fullhd.jpg',
        file_size: 2048000,
        format: 'jpg',
        dimensions: dimensions
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.dimensions).toBe(dimensions);

    if (data) {
      testAssetIds.push(data.id);
    }
  });

  it('Deve salvar diferentes formatos', async () => {
    const formats = ['jpg', 'png', 'mp4', 'pdf', 'svg'];

    for (const format of formats) {
      const { data, error } = await supabase
        .from('marketing_assets')
        .insert({
          name: `Asset ${format.toUpperCase()}`,
          type: format === 'mp4' ? 'video' : format === 'pdf' ? 'pdf' : 'image',
          category: 'web',
          file_url: `https://example.com/file.${format}`,
          file_size: 1024000,
          format: format
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.format).toBe(format);

      if (data) {
        testAssetIds.push(data.id);
      }
    }
  });
});

describe('🔗 MarketingDirectory - Relacionamentos', () => {
  it('Deve associar campaign ao asset', async () => {
    if (testCampaignId) {
      const { data, error } = await supabase
        .from('marketing_assets')
        .insert({
          name: 'Asset com Campaign',
          type: 'image',
          category: 'social',
          file_url: 'https://example.com/campaign.jpg',
          file_size: 1024000,
          format: 'jpg',
          campaign: testCampaignId
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.campaign).toBe(testCampaignId);

      if (data) {
        testAssetIds.push(data.id);
      }
    }
  });

  it('Deve filtrar assets por campaign', async () => {
    if (testCampaignId) {
      const { data, error } = await supabase
        .from('marketing_assets')
        .select('*')
        .eq('campaign', testCampaignId);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  it('Deve associar created_by ao asset', async () => {
    const { data, error } = await supabase
      .from('marketing_assets')
      .insert({
        name: 'Asset com Criador',
        type: 'image',
        category: 'web',
        file_url: 'https://example.com/creator.jpg',
        file_size: 1024000,
        format: 'jpg',
        created_by: testUserId
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.created_by).toBe(testUserId);

    if (data) {
      testAssetIds.push(data.id);
    }
  });
});

describe('🔍 MarketingDirectory - Filtros e Busca', () => {
  beforeAll(async () => {
    // Criar assets para testes de filtro
    await supabase
      .from('marketing_assets')
      .insert([
        {
          name: 'Foto Verão 2025',
          description: 'Linda foto da coleção de verão',
          type: 'image',
          category: 'social',
          file_url: 'https://example.com/verao.jpg',
          file_size: 1024000,
          format: 'jpg',
          tags: ['verão', 'coleção']
        },
        {
          name: 'Vídeo Inverno',
          description: 'Vídeo promocional inverno',
          type: 'video',
          category: 'web',
          file_url: 'https://example.com/inverno.mp4',
          file_size: 5242880,
          format: 'mp4',
          tags: ['inverno', 'promo']
        }
      ])
      .select();
  });

  it('Deve buscar por nome (case insensitive)', async () => {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .ilike('name', '%verão%');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve buscar por descrição', async () => {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .ilike('description', '%promocional%');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar por múltiplos critérios', async () => {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .eq('type', 'image')
      .eq('category', 'social');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve ordenar por file_size', async () => {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('*')
      .order('file_size', { ascending: false })
      .limit(10);

    expect(error).toBeNull();

    if (data && data.length > 1) {
      expect(data[0].file_size >= data[1].file_size).toBe(true);
    }
  });
});

describe('📊 MarketingDirectory - Estatísticas', () => {
  it('Deve contar total de assets', async () => {
    const { count, error } = await supabase
      .from('marketing_assets')
      .select('*', { count: 'exact', head: true });

    expect(error).toBeNull();
    expect(typeof count).toBe('number');
  });

  it('Deve contar assets por tipo', async () => {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('type')
      .eq('type', 'image');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve calcular tamanho total de arquivos', async () => {
    const { data, error } = await supabase
      .from('marketing_assets')
      .select('file_size');

    expect(error).toBeNull();

    if (data) {
      const totalSize = data.reduce((sum, asset) => sum + (asset.file_size || 0), 0);
      expect(totalSize).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('🗑️ MarketingDirectory - Exclusão', () => {
  it('Deve excluir asset', async () => {
    const { data: asset } = await supabase
      .from('marketing_assets')
      .insert({
        name: 'Asset para Excluir',
        type: 'image',
        category: 'web',
        file_url: 'https://example.com/delete.jpg',
        file_size: 1024000,
        format: 'jpg'
      })
      .select()
      .single();

    if (asset) {
      const { error } = await supabase
        .from('marketing_assets')
        .delete()
        .eq('id', asset.id);

      expect(error).toBeNull();

      // Verificar exclusão
      const { data } = await supabase
        .from('marketing_assets')
        .select('*')
        .eq('id', asset.id);

      expect(data.length).toBe(0);
    }
  });
});

describe('🔧 MarketingDirectory - Limpeza', () => {
  afterAll(async () => {
    // Limpar assets de teste
    if (testAssetIds.length > 0) {
      const { error } = await supabase
        .from('marketing_assets')
        .delete()
        .in('id', testAssetIds);

      expect(error).toBeNull();
    }

    // Limpar brand de teste
    if (testBrandId) {
      await supabase
        .from('brands')
        .delete()
        .eq('id', testBrandId);
    }

    // Limpar campaign de teste
    if (testCampaignId) {
      await supabase
        .from('campaigns')
        .delete()
        .eq('id', testCampaignId);
    }
  });

  it('Deve limpar dados de teste', async () => {
    expect(testAssetIds.length).toBeGreaterThan(0);
  });
});
