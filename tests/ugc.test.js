/**
 * TESTES DA PÁGINA UGC - MAR QUENTE HUB
 *
 * Testa todas as funcionalidades de gestão de UGC (User Generated Content)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// IDs de teste para cleanup
let testUgcIds = [];
let testCollectionId = null;

describe('📊 UGC - Carregamento de Dados', () => {
  it('Deve carregar UGCs ordenados por likes (decrescente)', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*')
      .order('likes', { ascending: false });

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

  it('Deve carregar campaigns ordenadas por start_date', async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('start_date', { ascending: false });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('📝 UGC - Criação e Edição', () => {
  beforeAll(async () => {
    // Criar coleção de teste
    const { data: collection } = await supabase
      .from('collections')
      .insert({
        name: 'Coleção Teste UGC',
        season: 'Verão',
        year: 2025,
        status: 'active'
      })
      .select()
      .single();

    if (collection) {
      testCollectionId = collection.id;
    }
  });

  it('Deve criar novo UGC', async () => {
    const ugcData = {
      content_type: 'instagram',
      author_name: 'Influencer Teste',
      author_handle: '@influencer_teste',
      content_url: 'https://instagram.com/p/test123',
      image_url: 'https://example.com/ugc-image.jpg',
      caption: 'Amando essa coleção! #MarQuente',
      likes: 1500,
      comments: 45,
      engagement_rate: 5.2,
      collection: testCollectionId,
      approved: true,
      featured: false
    };

    const { data, error } = await supabase
      .from('ugc')
      .insert(ugcData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.author_name).toBe(ugcData.author_name);
    expect(data.content_type).toBe('instagram');
    expect(data.likes).toBe(1500);

    if (data) {
      testUgcIds.push(data.id);
    }
  });

  it('Deve criar UGC com collection', async () => {
    if (testCollectionId) {
      const { data, error } = await supabase
        .from('ugc')
        .insert({
          content_type: 'tiktok',
          author_name: 'Creator TikTok',
          author_handle: '@creator_tiktok',
          content_url: 'https://tiktok.com/@user/video/123',
          image_url: 'https://example.com/tiktok.jpg',
          caption: 'Vídeo incrível!',
          likes: 5000,
          comments: 120,
          engagement_rate: 8.5,
          collection: testCollectionId,
          approved: false,
          featured: false
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.collection).toBe(testCollectionId);

      if (data) {
        testUgcIds.push(data.id);
      }
    }
  });

  it('Deve atualizar UGC existente', async () => {
    const { data: ugc } = await supabase
      .from('ugc')
      .insert({
        content_type: 'instagram',
        author_name: 'UGC para Atualizar',
        author_handle: '@update_test',
        content_url: 'https://instagram.com/p/update',
        image_url: 'https://example.com/update.jpg',
        caption: 'Original caption',
        likes: 100,
        comments: 5,
        engagement_rate: 2.5,
        approved: false,
        featured: false
      })
      .select()
      .single();

    if (ugc) {
      testUgcIds.push(ugc.id);

      const { data, error } = await supabase
        .from('ugc')
        .update({
          approved: true,
          featured: true,
          likes: 200
        })
        .eq('id', ugc.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.approved).toBe(true);
      expect(data.featured).toBe(true);
      expect(data.likes).toBe(200);
    }
  });

  it('Deve validar campos obrigatórios', async () => {
    const { error } = await supabase
      .from('ugc')
      .insert({
        author_name: 'Teste Incompleto'
        // Faltando content_type, author_handle, content_url, image_url
      });

    expect(error).not.toBeNull();
  });
});

describe('📱 UGC - Content Types', () => {
  it('Deve criar UGC para Instagram', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .insert({
        content_type: 'instagram',
        author_name: 'Instagram User',
        author_handle: '@instagram_user',
        content_url: 'https://instagram.com/p/abc',
        image_url: 'https://example.com/ig.jpg',
        caption: 'Instagram post',
        likes: 500,
        comments: 20,
        engagement_rate: 4.0,
        approved: true,
        featured: false
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.content_type).toBe('instagram');

    if (data) {
      testUgcIds.push(data.id);
    }
  });

  it('Deve criar UGC para TikTok', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .insert({
        content_type: 'tiktok',
        author_name: 'TikTok Creator',
        author_handle: '@tiktok_creator',
        content_url: 'https://tiktok.com/@user/video/456',
        image_url: 'https://example.com/tiktok.jpg',
        caption: 'TikTok video',
        likes: 10000,
        comments: 300,
        engagement_rate: 12.0,
        approved: true,
        featured: true
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.content_type).toBe('tiktok');

    if (data) {
      testUgcIds.push(data.id);
    }
  });

  it('Deve filtrar UGCs por content_type', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*')
      .eq('content_type', 'instagram');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      expect(data[0].content_type).toBe('instagram');
    }
  });
});

describe('✅ UGC - Aprovação e Destaque', () => {
  it('Deve aprovar UGC', async () => {
    const { data: ugc } = await supabase
      .from('ugc')
      .insert({
        content_type: 'instagram',
        author_name: 'UGC para Aprovar',
        author_handle: '@approve_test',
        content_url: 'https://instagram.com/p/approve',
        image_url: 'https://example.com/approve.jpg',
        caption: 'Pending approval',
        likes: 300,
        comments: 15,
        engagement_rate: 3.5,
        approved: false,
        featured: false
      })
      .select()
      .single();

    if (ugc) {
      testUgcIds.push(ugc.id);

      const { data, error } = await supabase
        .from('ugc')
        .update({ approved: true })
        .eq('id', ugc.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.approved).toBe(true);
    }
  });

  it('Deve marcar UGC como featured', async () => {
    const { data: ugc } = await supabase
      .from('ugc')
      .insert({
        content_type: 'instagram',
        author_name: 'UGC Destaque',
        author_handle: '@featured_test',
        content_url: 'https://instagram.com/p/featured',
        image_url: 'https://example.com/featured.jpg',
        caption: 'Amazing content',
        likes: 5000,
        comments: 200,
        engagement_rate: 10.0,
        approved: true,
        featured: false
      })
      .select()
      .single();

    if (ugc) {
      testUgcIds.push(ugc.id);

      const { data, error } = await supabase
        .from('ugc')
        .update({ featured: true })
        .eq('id', ugc.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.featured).toBe(true);
    }
  });

  it('Deve filtrar UGCs aprovados', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*')
      .eq('approved', true);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      expect(data[0].approved).toBe(true);
    }
  });

  it('Deve filtrar UGCs em destaque', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*')
      .eq('featured', true);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('📊 UGC - Métricas de Engajamento', () => {
  it('Deve salvar número de likes', async () => {
    const likes = 2500;

    const { data, error } = await supabase
      .from('ugc')
      .insert({
        content_type: 'instagram',
        author_name: 'Popular Creator',
        author_handle: '@popular',
        content_url: 'https://instagram.com/p/popular',
        image_url: 'https://example.com/popular.jpg',
        caption: 'Viral post',
        likes: likes,
        comments: 80,
        engagement_rate: 6.5,
        approved: true,
        featured: false
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.likes).toBe(likes);

    if (data) {
      testUgcIds.push(data.id);
    }
  });

  it('Deve salvar número de comentários', async () => {
    const comments = 150;

    const { data, error } = await supabase
      .from('ugc')
      .insert({
        content_type: 'tiktok',
        author_name: 'Engaging Creator',
        author_handle: '@engaging',
        content_url: 'https://tiktok.com/@user/video/789',
        image_url: 'https://example.com/engaging.jpg',
        caption: 'Lots of comments',
        likes: 3000,
        comments: comments,
        engagement_rate: 8.0,
        approved: true,
        featured: false
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.comments).toBe(comments);

    if (data) {
      testUgcIds.push(data.id);
    }
  });

  it('Deve salvar taxa de engajamento', async () => {
    const engagementRate = 15.5;

    const { data, error } = await supabase
      .from('ugc')
      .insert({
        content_type: 'instagram',
        author_name: 'High Engagement',
        author_handle: '@high_engage',
        content_url: 'https://instagram.com/p/engage',
        image_url: 'https://example.com/engage.jpg',
        caption: 'High engagement post',
        likes: 10000,
        comments: 500,
        engagement_rate: engagementRate,
        approved: true,
        featured: true
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.engagement_rate).toBe(engagementRate);

    if (data) {
      testUgcIds.push(data.id);
    }
  });

  it('Deve ordenar por engagement_rate', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*')
      .not('engagement_rate', 'is', null)
      .order('engagement_rate', { ascending: false })
      .limit(10);

    expect(error).toBeNull();

    if (data && data.length > 1) {
      expect(data[0].engagement_rate >= data[1].engagement_rate).toBe(true);
    }
  });
});

describe('🔗 UGC - Relacionamento com Collection', () => {
  it('Deve associar UGC a uma coleção', async () => {
    if (testCollectionId) {
      const { data, error } = await supabase
        .from('ugc')
        .insert({
          content_type: 'instagram',
          author_name: 'Collection UGC',
          author_handle: '@collection_ugc',
          content_url: 'https://instagram.com/p/collection',
          image_url: 'https://example.com/collection.jpg',
          caption: 'Amazing collection',
          likes: 1000,
          comments: 40,
          engagement_rate: 5.0,
          collection: testCollectionId,
          approved: true,
          featured: false
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.collection).toBe(testCollectionId);

      if (data) {
        testUgcIds.push(data.id);
      }
    }
  });

  it('Deve filtrar UGCs por coleção', async () => {
    if (testCollectionId) {
      const { data, error } = await supabase
        .from('ugc')
        .select('*')
        .eq('collection', testCollectionId);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  it('Deve permitir UGC sem coleção', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .insert({
        content_type: 'instagram',
        author_name: 'No Collection',
        author_handle: '@no_collection',
        content_url: 'https://instagram.com/p/nocollection',
        image_url: 'https://example.com/nocollection.jpg',
        caption: 'General content',
        likes: 500,
        comments: 20,
        engagement_rate: 3.0,
        collection: null,
        approved: true,
        featured: false
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.collection).toBeNull();

    if (data) {
      testUgcIds.push(data.id);
    }
  });
});

describe('🔍 UGC - Filtros e Busca', () => {
  it('Deve buscar por author_name', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*')
      .ilike('author_name', '%creator%');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve buscar por author_handle', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*')
      .ilike('author_handle', '%@%');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve filtrar por múltiplos critérios', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*')
      .eq('content_type', 'instagram')
      .eq('approved', true)
      .gt('likes', 1000);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('Deve ordenar por likes (mais populares)', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('*')
      .order('likes', { ascending: false })
      .limit(10);

    expect(error).toBeNull();

    if (data && data.length > 1) {
      expect(data[0].likes >= data[1].likes).toBe(true);
    }
  });
});

describe('📊 UGC - Estatísticas', () => {
  it('Deve contar total de UGCs', async () => {
    const { count, error } = await supabase
      .from('ugc')
      .select('*', { count: 'exact', head: true });

    expect(error).toBeNull();
    expect(typeof count).toBe('number');
  });

  it('Deve calcular total de likes', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('likes');

    expect(error).toBeNull();

    if (data) {
      const totalLikes = data.reduce((sum, ugc) => sum + (ugc.likes || 0), 0);
      expect(totalLikes).toBeGreaterThanOrEqual(0);
    }
  });

  it('Deve calcular média de engagement_rate', async () => {
    const { data, error } = await supabase
      .from('ugc')
      .select('engagement_rate')
      .not('engagement_rate', 'is', null);

    expect(error).toBeNull();

    if (data && data.length > 0) {
      const avgEngagement = data.reduce((sum, ugc) => sum + ugc.engagement_rate, 0) / data.length;
      expect(avgEngagement).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('🗑️ UGC - Exclusão', () => {
  it('Deve excluir UGC', async () => {
    const { data: ugc } = await supabase
      .from('ugc')
      .insert({
        content_type: 'instagram',
        author_name: 'UGC para Excluir',
        author_handle: '@delete_test',
        content_url: 'https://instagram.com/p/delete',
        image_url: 'https://example.com/delete.jpg',
        caption: 'To be deleted',
        likes: 100,
        comments: 5,
        engagement_rate: 2.0,
        approved: false,
        featured: false
      })
      .select()
      .single();

    if (ugc) {
      const { error } = await supabase
        .from('ugc')
        .delete()
        .eq('id', ugc.id);

      expect(error).toBeNull();

      // Verificar exclusão
      const { data } = await supabase
        .from('ugc')
        .select('*')
        .eq('id', ugc.id);

      expect(data.length).toBe(0);
    }
  });
});

describe('🔧 UGC - Limpeza', () => {
  afterAll(async () => {
    // Limpar UGCs de teste
    if (testUgcIds.length > 0) {
      const { error } = await supabase
        .from('ugc')
        .delete()
        .in('id', testUgcIds);

      expect(error).toBeNull();
    }

    // Limpar coleção de teste
    if (testCollectionId) {
      await supabase
        .from('collections')
        .delete()
        .eq('id', testCollectionId);
    }
  });

  it('Deve limpar dados de teste', async () => {
    expect(testUgcIds.length).toBeGreaterThan(0);
  });
});
