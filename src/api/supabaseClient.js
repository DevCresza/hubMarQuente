// Cliente Supabase para integração com banco de dados real
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis do Supabase não configuradas. Configure o arquivo .env');
}

// Cliente normal para uso geral
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente admin para operações administrativas (criar usuários, etc)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Adapter para manter mesma interface do mockClient
class SupabaseEntity {
  constructor(tableName) {
    this.table = tableName;
  }

  async list(sortField = '-created_date') {
    const descending = sortField.startsWith('-');
    const field = descending ? sortField.slice(1) : sortField;

    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order(field, { ascending: !descending });

    if (error) {
      console.error(`Erro ao listar ${this.table}:`, error);
      throw new Error(error.message);
    }

    return data;
  }

  async get(id) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erro ao buscar ${this.table}:`, error);
      throw new Error(error.message);
    }

    return data;
  }

  async create(newData) {
    const { data, error } = await supabase
      .from(this.table)
      .insert(newData)
      .select()
      .single();

    if (error) {
      console.error(`Erro ao criar ${this.table}:`, error);
      throw new Error(error.message);
    }

    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from(this.table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erro ao atualizar ${this.table}:`, error);
      throw new Error(error.message);
    }

    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erro ao deletar ${this.table}:`, error);
      throw new Error(error.message);
    }

    return { success: true };
  }

  async search(filters = {}) {
    let query = supabase.from(this.table).select('*');

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;

    if (error) {
      console.error(`Erro ao buscar ${this.table}:`, error);
      throw new Error(error.message);
    }

    return data;
  }
}

// Cliente Supabase com mesma interface do mock
export const createSupabaseClient = () => ({
  entities: {
    User: new SupabaseEntity('users'), // Entidade para queries gerais de usuários
    Task: new SupabaseEntity('tasks'),
    Department: new SupabaseEntity('departments'),
    Project: new SupabaseEntity('projects'),
    Collection: new SupabaseEntity('collections'),
    Stylist: new SupabaseEntity('stylists'),
    Style: new SupabaseEntity('styles'),
    Model: new SupabaseEntity('models'),
    Photoshoot: new SupabaseEntity('photoshoots'),
    CostItem: new SupabaseEntity('cost_items'),
    Brand: new SupabaseEntity('brands'),
    UGC: new SupabaseEntity('ugc'),
    Campaign: new SupabaseEntity('campaigns'),
    Coupon: new SupabaseEntity('coupons'),
    Partnership: new SupabaseEntity('partnerships'),
    Delivery: new SupabaseEntity('deliveries'),
    FinancialTransaction: new SupabaseEntity('financial_transactions'),
    Ticket: new SupabaseEntity('tickets'),
    LaunchCalendar: new SupabaseEntity('launch_calendar'),
    MarketingAsset: new SupabaseEntity('marketing_assets'),
    MarketingShareLink: new SupabaseEntity('share_links'),
  },

  // Sistema de autenticação do Supabase
  auth: {
    async me() {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Erro ao buscar usuário atual:', error);
        throw new Error(error.message);
      }

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados completos do usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
        // Retornar dados básicos do auth se falhar
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || '',
          role: user.user_metadata?.role || 'membro',
        };
      }

      return userData;
    },

    async login(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro ao fazer login:', error);
        throw new Error(error.message);
      }

      // Buscar dados completos do usuário
      const user = await this.me();

      return {
        user,
        token: data.session.access_token,
        session: data.session,
      };
    },

    async logout() {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erro ao fazer logout:', error);
        throw new Error(error.message);
      }

      return { success: true };
    },

    async listUsers() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_date', { ascending: false });

      if (error) {
        console.error('Erro ao listar usuários:', error);
        throw new Error(error.message);
      }

      return data;
    },

    async createUser(userData) {
      console.log('🔵 INÍCIO createUser - Email:', userData.email);
      console.log('🔵 Dados recebidos:', JSON.stringify(userData, null, 2));

      if (!supabaseAdmin) {
        console.error('❌ VITE_SUPABASE_SERVICE_KEY não configurada');
        throw new Error('Service key não configurada. Configure VITE_SUPABASE_SERVICE_KEY no arquivo .env');
      }

      let authUserId = null;

      try {
        // Criar usuário no Auth do Supabase usando cliente admin
        console.log('🔵 PASSO 1: Criando usuário no Auth...');
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name,
            role: userData.role,
          },
        });

        if (authError) {
          console.error('❌ ERRO no Auth:', authError);
          throw new Error(`Erro no Auth: ${authError.message}`);
        }

        authUserId = authData.user.id;
        console.log('✅ PASSO 1 OK - Usuário criado no Auth:', authUserId);

        // Criar registro na tabela users usando cliente admin com TODOS os campos
        console.log('🔵 PASSO 2: Inserindo na tabela users...');
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authUserId,

            // Dados Básicos
            full_name: userData.full_name,
            email: userData.email,
            phone: userData.phone || null,
            cpf: userData.cpf || null,
            birth_date: userData.birth_date || null,
            avatar_url: userData.avatar_url || null,

            // Dados Profissionais
            department_id: userData.department_id || null,
            position: userData.position || null,
            role: userData.role,
            direct_manager: userData.direct_manager || null,
            hire_date: userData.hire_date || null,
            pis: userData.pis || null,

            // Endereço
            address: userData.address || null,
            city: userData.city || null,
            state: userData.state || null,
            zip_code: userData.zip_code || null,

            // Emergência e Saúde
            emergency_contact_name: userData.emergency_contact_name || null,
            emergency_contact_phone: userData.emergency_contact_phone || null,
            blood_type: userData.blood_type || null,
            has_disabilities: userData.has_disabilities || false,
            disability_description: userData.disability_description || null,

            // Dados Bancários
            bank_name: userData.bank_name || null,
            bank_agency: userData.bank_agency || null,
            bank_account: userData.bank_account || null,

            // Sistema
            is_active: userData.is_active !== false,
          })
          .select()
          .single();

        if (userError) {
          console.error('❌ ERRO na tabela users:', userError);
          throw new Error(`Erro ao criar registro na tabela users: ${userError.message}`);
        }

        console.log('✅ PASSO 2 OK - Registro criado na tabela users:', user.id);
        console.log('✅ SUCESSO TOTAL - Usuário completo:', user.email);
        return user;

      } catch (error) {
        console.error('❌ ERRO GERAL na criação do usuário:', error);

        // Rollback: tentar deletar usuário do auth se falhar criar na tabela
        if (authUserId) {
          console.log('⚠️ Tentando fazer rollback do Auth (deletar usuário)...');
          try {
            await supabaseAdmin.auth.admin.deleteUser(authUserId);
            console.log('✅ Rollback concluído - usuário deletado do Auth');
          } catch (deleteError) {
            console.error('❌ ERRO no rollback:', deleteError);
          }
        }

        throw error;
      }
    },

    async updateUser(id, updates) {
      console.log('🔄 Atualizando usuário:', id, 'com dados:', updates);

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw new Error(error.message);
      }

      console.log('✅ Usuário atualizado:', data);
      return data;
    },

    async deleteUser(id) {
      // Deletar da tabela users
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (userError) {
        console.error('Erro ao deletar usuário:', userError);
        throw new Error(userError.message);
      }

      // Deletar do Auth do Supabase (requer service_role key)
      // Nota: Isso só funciona se estiver usando service_role key no backend
      // Para segurança, não exponha service_role no frontend

      return { success: true };
    },

    // Aliases para compatibilidade com código existente
    async update(id, updates) {
      return this.updateUser(id, updates);
    },

    async create(userData) {
      return this.createUser(userData);
    },
  },

  // Integrações
  integrations: {
    // LLM Integration - implementar via Edge Functions
    InvokeLLM: async (params) => {
      const { data, error } = await supabase.functions.invoke('invoke-llm', {
        body: params,
      });

      if (error) throw error;
      return data;
    },

    // Email Integration - implementar via Edge Functions
    SendEmail: async (params) => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: params,
      });

      if (error) throw error;
      return data;
    },

    // File Upload - usando Supabase Storage
    UploadFile: async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Erro ao fazer upload:', error);
        throw new Error(error.message);
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      return {
        success: true,
        file_id: data.path,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
      };
    },

    // Private File Upload
    UploadPrivateFile: async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `private/${fileName}`;

      const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Erro ao fazer upload privado:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        file_id: data.path,
        file_url: `private/${data.path}`,
        file_name: file.name,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
      };
    },

    // Generate Image - via Edge Functions
    GenerateImage: async (params) => {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: params,
      });

      if (error) throw error;
      return data;
    },

    // Extract Data from File - via Edge Functions
    ExtractDataFromUploadedFile: async (params) => {
      const { data, error } = await supabase.functions.invoke('extract-data', {
        body: params,
      });

      if (error) throw error;
      return data;
    },

    // Create Signed URL
    CreateFileSignedUrl: async ({ file_id, expires_in = 3600 }) => {
      const { data, error } = await supabase.storage
        .from('files')
        .createSignedUrl(file_id, expires_in);

      if (error) {
        console.error('Erro ao criar URL assinada:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        signed_url: data.signedUrl,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      };
    },
  },
});
