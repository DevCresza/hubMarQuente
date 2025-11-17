import { supabase } from '@/api/supabaseClient';

/**
 * Limites de tamanho por bucket (em bytes)
 */
const BUCKET_LIMITS = {
  'avatars': 5 * 1024 * 1024, // 5MB
  'brands': 10 * 1024 * 1024, // 10MB
  'marketing-assets': 100 * 1024 * 1024, // 100MB
  'ugc': 20 * 1024 * 1024, // 20MB
  'portfolios': 50 * 1024 * 1024 // 50MB
};

/**
 * Tipos MIME permitidos por bucket
 */
const ALLOWED_TYPES = {
  'avatars': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  'brands': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  'marketing-assets': [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/quicktime',
    'application/pdf',
    'application/zip'
  ],
  'ugc': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'],
  'portfolios': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
};

/**
 * Formatar tamanho de arquivo para exibição
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

/**
 * Validar arquivo antes do upload
 */
function validateFile(file, bucket) {
  // Validar tamanho
  const maxSize = BUCKET_LIMITS[bucket];
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}, seu arquivo: ${formatFileSize(file.size)}`
    };
  }

  // Validar tipo
  const allowedTypes = ALLOWED_TYPES[bucket];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true, error: null };
}

/**
 * Upload de arquivo genérico para o Supabase Storage
 * @param {File} file - Arquivo a ser enviado
 * @param {string} bucket - Nome do bucket ('avatars', 'brands', etc)
 * @param {string} path - Caminho dentro do bucket
 * @param {object} options - Opções adicionais
 * @returns {Promise<{url: string, path: string, error: null}|{url: null, path: null, error: string}>}
 */
export async function uploadFile(file, bucket, path, options = {}) {
  try {
    // Validar arquivo
    const validation = validateFile(file, bucket);
    if (!validation.valid) {
      return { url: null, path: null, error: validation.error };
    }

    // Opções padrão
    const uploadOptions = {
      cacheControl: '3600',
      upsert: true, // Sobrescrever se já existir
      ...options
    };

    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, uploadOptions);

    if (error) {
      console.error('Erro no upload:', error);
      return { url: null, path: null, error: error.message };
    }

    // Obter URL pública (para buckets públicos) ou URL assinada (para privados)
    let publicUrl;

    if (bucket === 'marketing-assets') {
      // Bucket privado - gerar URL assinada (válida por 1 hora)
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600);

      if (signedError) {
        console.error('Erro ao gerar URL assinada:', signedError);
        return { url: null, path: null, error: signedError.message };
      }

      publicUrl = signedData.signedUrl;
    } else {
      // Buckets públicos - URL pública
      const { data: { publicUrl: url } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      publicUrl = url;
    }

    return { url: publicUrl, path: data.path, error: null };
  } catch (err) {
    console.error('Erro no upload:', err);
    return { url: null, path: null, error: err.message };
  }
}

/**
 * Deletar arquivo do Storage
 * @param {string} bucket - Nome do bucket
 * @param {string} path - Caminho do arquivo
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteFile(bucket, path) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Erro ao deletar:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Erro ao deletar:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Listar arquivos em um bucket
 * @param {string} bucket - Nome do bucket
 * @param {string} folder - Pasta dentro do bucket (opcional)
 * @returns {Promise<{files: Array, error: string|null}>}
 */
export async function listFiles(bucket, folder = '') {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Erro ao listar arquivos:', error);
      return { files: [], error: error.message };
    }

    return { files: data, error: null };
  } catch (err) {
    console.error('Erro ao listar arquivos:', err);
    return { files: [], error: err.message };
  }
}

// ============================================
// FUNÇÕES ESPECÍFICAS POR TIPO DE UPLOAD
// ============================================

/**
 * Upload de avatar de usuário
 * @param {string} userId - ID do usuário
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<{url: string, path: string, error: null}|{url: null, path: null, error: string}>}
 */
export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;
  return uploadFile(file, 'avatars', path);
}

/**
 * Upload de logo de marca
 * @param {string} brandId - ID da marca
 * @param {File} file - Arquivo de imagem
 */
export async function uploadBrandLogo(brandId, file) {
  const ext = file.name.split('.').pop();
  const path = `${brandId}/logo.${ext}`;
  return uploadFile(file, 'brands', path);
}

/**
 * Upload de asset de marketing
 * @param {string} campaignId - ID da campanha (ou 'general' se não vinculado)
 * @param {string} assetId - ID do asset
 * @param {File} file - Arquivo (imagem, vídeo, PDF, etc)
 */
export async function uploadMarketingAsset(campaignId, assetId, file) {
  const ext = file.name.split('.').pop();
  const filename = file.name.replace(/\.[^/.]+$/, ""); // Nome sem extensão
  const path = `${campaignId}/${assetId}_${filename}.${ext}`;
  return uploadFile(file, 'marketing-assets', path);
}

/**
 * Upload de UGC (User Generated Content)
 * @param {string} ugcId - ID do UGC
 * @param {File} file - Arquivo de imagem ou vídeo
 */
export async function uploadUGC(ugcId, file) {
  const ext = file.name.split('.').pop();
  const timestamp = Date.now();
  const path = `${ugcId}/${timestamp}.${ext}`;
  return uploadFile(file, 'ugc', path);
}

/**
 * Upload de portfolio de estilista
 * @param {string} stylistId - ID do estilista
 * @param {File} file - Arquivo (imagem ou PDF)
 */
export async function uploadPortfolio(stylistId, file) {
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${stylistId}/${sanitizedFilename}`;
  return uploadFile(file, 'portfolios', path);
}

/**
 * Obter URL pública de um arquivo
 * @param {string} bucket - Nome do bucket
 * @param {string} path - Caminho do arquivo
 * @returns {string} URL pública
 */
export function getPublicUrl(bucket, path) {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}

/**
 * Criar URL assinada (para buckets privados)
 * @param {string} bucket - Nome do bucket
 * @param {string} path - Caminho do arquivo
 * @param {number} expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
 * @returns {Promise<{url: string, error: null}|{url: null, error: string}>}
 */
export async function createSignedUrl(bucket, path, expiresIn = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Erro ao criar URL assinada:', error);
      return { url: null, error: error.message };
    }

    return { url: data.signedUrl, error: null };
  } catch (err) {
    console.error('Erro ao criar URL assinada:', err);
    return { url: null, error: err.message };
  }
}

/**
 * Criar preview de imagem antes do upload
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<string>} Data URL para preview
 */
export function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default {
  uploadFile,
  deleteFile,
  listFiles,
  uploadAvatar,
  uploadBrandLogo,
  uploadMarketingAsset,
  uploadUGC,
  uploadPortfolio,
  getPublicUrl,
  createSignedUrl,
  createImagePreview
};
