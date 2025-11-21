/**
 * TESTES DE UPLOAD - MAR QUENTE HUB
 *
 * Testa todas as funcionalidades de upload de arquivos para o Supabase Storage
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import {
  uploadAvatar,
  uploadBrandLogo,
  uploadMarketingAsset,
  uploadUGC,
  uploadPortfolio,
  deleteFile,
  getPublicUrl,
  createSignedUrl
} from '../src/utils/uploadHelper.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fpyrvmdosljoefmmsnys.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzU2MzMsImV4cCI6MjA3ODU1MTYzM30.ZhbzonRvHk6T0CqThNwnxnuR8j9Mm4LnXucYggLHtUI';
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXJ2bWRvc2xqb2VmbW1zbnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3NTYzMywiZXhwIjoyMDc4NTUxNjMzfQ.S17xWCRNclt99Fou3x8nx-e7EgXRm9XWOEQLn-YUYWo';

// Usar Service Role Key para bypassar RLS nos testes
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const testUserId = '75157fa7-5927-492a-b4af-3405e7c3a1dc';

// Helper para criar arquivo de teste
function createTestFile(name, type, size = 1024) {
  const buffer = new ArrayBuffer(size);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < size; i++) {
    view[i] = i % 256;
  }
  return new File([buffer], name, { type });
}

beforeAll(async () => {
  // Autenticar
  const { error } = await supabase.auth.signInWithPassword({
    email: 'admin@teste.com',
    password: 'teste123'
  });

  if (error) {
    throw new Error(`Falha na autenticação: ${error.message}`);
  }
});

describe('🖼️ Upload de Avatar', () => {
  it('Deve fazer upload de avatar com sucesso', async () => {
    const file = createTestFile('avatar-test.jpg', 'image/jpeg', 50 * 1024); // 50KB

    const result = await uploadAvatar(testUserId, file);

    expect(result.error).toBeNull();
    expect(result.url).toBeDefined();
    expect(result.url).toContain('supabase.co');
    expect(result.path).toContain(testUserId);
  });

  it('Deve rejeitar avatar muito grande (> 5MB)', async () => {
    const file = createTestFile('avatar-big.jpg', 'image/jpeg', 6 * 1024 * 1024); // 6MB

    const result = await uploadAvatar(testUserId, file);

    expect(result.error).not.toBeNull();
    expect(result.error).toContain('grande');
    expect(result.url).toBeNull();
  });

  it('Deve rejeitar tipo de arquivo inválido para avatar', async () => {
    const file = createTestFile('avatar.pdf', 'application/pdf', 1024);

    const result = await uploadAvatar(testUserId, file);

    expect(result.error).not.toBeNull();
    expect(result.error).toContain('permitido');
    expect(result.url).toBeNull();
  });

  it('Deve aceitar diferentes formatos de imagem válidos', async () => {
    const formats = [
      { name: 'avatar.jpg', type: 'image/jpeg' },
      { name: 'avatar.png', type: 'image/png' },
      { name: 'avatar.webp', type: 'image/webp' },
      { name: 'avatar.gif', type: 'image/gif' }
    ];

    for (const format of formats) {
      const file = createTestFile(format.name, format.type, 1024);
      const result = await uploadAvatar(testUserId, file);

      expect(result.error).toBeNull();
      expect(result.url).toBeDefined();
    }
  });
});

describe('🏢 Upload de Logo de Marca', () => {
  it('Deve fazer upload de logo com sucesso', async () => {
    const brandId = 'test-brand-' + Date.now();
    const file = createTestFile('logo.png', 'image/png', 100 * 1024); // 100KB

    const result = await uploadBrandLogo(brandId, file);

    expect(result.error).toBeNull();
    expect(result.url).toBeDefined();
    expect(result.path).toContain(brandId);
  });

  it('Deve rejeitar logo muito grande (> 10MB)', async () => {
    const brandId = 'test-brand-' + Date.now();
    const file = createTestFile('logo-big.png', 'image/png', 11 * 1024 * 1024); // 11MB

    const result = await uploadBrandLogo(brandId, file);

    expect(result.error).not.toBeNull();
    expect(result.error).toContain('grande');
  });

  it('Deve aceitar SVG para logos', async () => {
    const brandId = 'test-brand-' + Date.now();
    const file = createTestFile('logo.svg', 'image/svg+xml', 5 * 1024); // 5KB

    const result = await uploadBrandLogo(brandId, file);

    expect(result.error).toBeNull();
    expect(result.url).toBeDefined();
  });
});

describe('📢 Upload de Marketing Asset', () => {
  it('Deve fazer upload de asset com sucesso', async () => {
    const campaignId = 'campaign-test';
    const assetId = 'asset-' + Date.now();
    const file = createTestFile('marketing.jpg', 'image/jpeg', 500 * 1024); // 500KB

    const result = await uploadMarketingAsset(campaignId, assetId, file);

    expect(result.error).toBeNull();
    expect(result.url).toBeDefined();
    expect(result.path).toContain(campaignId);
    expect(result.path).toContain(assetId);
  });

  it('Deve aceitar vídeos', async () => {
    const campaignId = 'campaign-test';
    const assetId = 'video-' + Date.now();
    const file = createTestFile('video.mp4', 'video/mp4', 1024 * 1024); // 1MB

    const result = await uploadMarketingAsset(campaignId, assetId, file);

    expect(result.error).toBeNull();
  });

  it('Deve aceitar PDFs', async () => {
    const campaignId = 'campaign-test';
    const assetId = 'doc-' + Date.now();
    const file = createTestFile('document.pdf', 'application/pdf', 500 * 1024); // 500KB

    const result = await uploadMarketingAsset(campaignId, assetId, file);

    expect(result.error).toBeNull();
  });

  it('Deve aceitar arquivos ZIP', async () => {
    const campaignId = 'campaign-test';
    const assetId = 'archive-' + Date.now();
    const file = createTestFile('assets.zip', 'application/zip', 2 * 1024 * 1024); // 2MB

    const result = await uploadMarketingAsset(campaignId, assetId, file);

    expect(result.error).toBeNull();
  });

  it('Deve rejeitar asset muito grande (> 100MB)', async () => {
    const campaignId = 'campaign-test';
    const assetId = 'huge-' + Date.now();
    // Não criar arquivo de 100MB real, apenas simular
    const file = createTestFile('huge.mp4', 'video/mp4', 1024); // Pequeno para teste

    // Modificar tamanho simulado
    Object.defineProperty(file, 'size', { value: 101 * 1024 * 1024 });

    const result = await uploadMarketingAsset(campaignId, assetId, file);

    expect(result.error).not.toBeNull();
    expect(result.error).toContain('grande');
  });
});

describe('📸 Upload de UGC', () => {
  it('Deve fazer upload de UGC com sucesso', async () => {
    const ugcId = 'ugc-' + Date.now();
    const file = createTestFile('ugc-photo.jpg', 'image/jpeg', 200 * 1024); // 200KB

    const result = await uploadUGC(ugcId, file);

    expect(result.error).toBeNull();
    expect(result.url).toBeDefined();
    expect(result.path).toContain(ugcId);
  });

  it('Deve rejeitar UGC muito grande (> 20MB)', async () => {
    const ugcId = 'ugc-' + Date.now();
    const file = createTestFile('ugc-big.jpg', 'image/jpeg', 1024);
    Object.defineProperty(file, 'size', { value: 21 * 1024 * 1024 });

    const result = await uploadUGC(ugcId, file);

    expect(result.error).not.toBeNull();
  });
});

describe('🎨 Upload de Portfolio', () => {
  it('Deve fazer upload de portfolio com sucesso', async () => {
    const stylistId = 'stylist-' + Date.now();
    const file = createTestFile('portfolio.jpg', 'image/jpeg', 1024 * 1024); // 1MB

    const result = await uploadPortfolio(stylistId, file);

    expect(result.error).toBeNull();
    expect(result.url).toBeDefined();
    expect(result.path).toContain(stylistId);
  });

  it('Deve aceitar PDF para portfolio', async () => {
    const stylistId = 'stylist-' + Date.now();
    const file = createTestFile('portfolio.pdf', 'application/pdf', 2 * 1024 * 1024); // 2MB

    const result = await uploadPortfolio(stylistId, file);

    expect(result.error).toBeNull();
  });

  it('Deve rejeitar portfolio muito grande (> 50MB)', async () => {
    const stylistId = 'stylist-' + Date.now();
    const file = createTestFile('portfolio-big.pdf', 'application/pdf', 1024);
    Object.defineProperty(file, 'size', { value: 51 * 1024 * 1024 });

    const result = await uploadPortfolio(stylistId, file);

    expect(result.error).not.toBeNull();
  });
});

describe('🗑️ Exclusão de Arquivos', () => {
  it('Deve excluir arquivo do storage', async () => {
    // Primeiro fazer upload
    const file = createTestFile('temp-avatar.jpg', 'image/jpeg', 10 * 1024);
    const uploadResult = await uploadAvatar(testUserId, file);

    expect(uploadResult.error).toBeNull();
    expect(uploadResult.path).toBeDefined();

    // Depois excluir
    const deleteResult = await deleteFile('avatars', uploadResult.path);

    expect(deleteResult.error).toBeNull();
    expect(deleteResult.success).toBe(true);
  });
});

describe('🔗 URLs Públicas e Assinadas', () => {
  it('Deve gerar URL pública para bucket público', () => {
    const path = 'test-user/avatar.jpg';
    const url = getPublicUrl('avatars', path);

    expect(url).toBeDefined();
    expect(url).toContain('supabase.co');
    expect(url).toContain('avatars');
    expect(url).toContain(path);
  });

  it('Deve criar URL assinada para bucket privado', async () => {
    // Primeiro fazer upload em bucket privado
    const campaignId = 'test-campaign';
    const assetId = 'private-asset-' + Date.now();
    const file = createTestFile('private.jpg', 'image/jpeg', 10 * 1024);

    const uploadResult = await uploadMarketingAsset(campaignId, assetId, file);
    expect(uploadResult.error).toBeNull();

    // Criar URL assinada
    const signedResult = await createSignedUrl('marketing-assets', uploadResult.path, 3600);

    expect(signedResult.error).toBeNull();
    expect(signedResult.url).toBeDefined();
    expect(signedResult.url).toContain('token=');
  });
});

describe('✅ Validações Gerais', () => {
  it('Deve validar formato de nome de arquivo', async () => {
    const file = createTestFile('avatar with spaces and special!@#chars.jpg', 'image/jpeg', 10 * 1024);

    const result = await uploadAvatar(testUserId, file);

    // Deve funcionar mesmo com caracteres especiais (sanitização)
    expect(result.error).toBeNull();
    expect(result.url).toBeDefined();
  });

  it('Deve permitir sobrescrever arquivo existente (upsert)', async () => {
    const file1 = createTestFile('same-name.jpg', 'image/jpeg', 10 * 1024);
    const file2 = createTestFile('same-name.jpg', 'image/jpeg', 20 * 1024);

    // Primeiro upload
    const result1 = await uploadAvatar(testUserId, file1);
    expect(result1.error).toBeNull();

    // Segundo upload com mesmo nome (deve sobrescrever)
    const result2 = await uploadAvatar(testUserId, file2);
    expect(result2.error).toBeNull();

    // Ambos devem ter a mesma URL (arquivo sobrescrito)
    expect(result1.path).toBe(result2.path);
  });
});
