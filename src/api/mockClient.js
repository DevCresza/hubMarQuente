// Cliente Mock para gerenciamento de dados locais
import { mockData } from './mockData';

// Função auxiliar para simular delay de rede
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Função auxiliar para gerar IDs únicos
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Classe Mock para simular operações de entidade
class MockEntity {
  constructor(entityName, dataKey) {
    this.entityName = entityName;
    this.dataKey = dataKey;
    this.data = [...mockData[dataKey]]; // Cópia dos dados para permitir modificações
  }

  // Listar todos os itens (com ordenação opcional)
  async list(sortField = '-created_date') {
    await delay();

    let sortedData = [...this.data];

    if (sortField) {
      const descending = sortField.startsWith('-');
      const field = descending ? sortField.slice(1) : sortField;

      sortedData.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        if (aVal === bVal) return 0;
        const comparison = aVal > bVal ? 1 : -1;
        return descending ? -comparison : comparison;
      });
    }

    return sortedData;
  }

  // Obter um item por ID
  async get(id) {
    await delay();
    const item = this.data.find(item => item.id === id);
    if (!item) {
      throw new Error(`${this.entityName} with id ${id} not found`);
    }
    return item;
  }

  // Criar novo item
  async create(data) {
    await delay();
    const newItem = {
      ...data,
      id: generateId(this.dataKey.slice(0, 4)),
      created_date: new Date().toISOString()
    };
    this.data.push(newItem);
    return newItem;
  }

  // Atualizar item existente
  async update(id, updates) {
    await delay();
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`${this.entityName} with id ${id} not found`);
    }
    this.data[index] = {
      ...this.data[index],
      ...updates,
      id, // Garantir que o ID não seja modificado
      updated_date: new Date().toISOString()
    };
    return this.data[index];
  }

  // Deletar item
  async delete(id) {
    await delay();
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`${this.entityName} with id ${id} not found`);
    }
    const deleted = this.data.splice(index, 1)[0];
    return { success: true, deleted };
  }

  // Buscar itens com filtros
  async search(filters = {}) {
    await delay();
    let results = [...this.data];

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      results = results.filter(item => {
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        return item[key] === value;
      });
    });

    return results;
  }
}

// Cliente Mock principal
export const createMockClient = () => {
  // Entidades
  const entities = {
    User: new MockEntity('User', 'users'),
    Task: new MockEntity('Task', 'tasks'),
    Department: new MockEntity('Department', 'departments'),
    Collection: new MockEntity('Collection', 'collections'),
    Stylist: new MockEntity('Stylist', 'stylists'),
    Style: new MockEntity('Style', 'styles'),
    Model: new MockEntity('Model', 'models'),
    Photoshoot: new MockEntity('Photoshoot', 'photoshoots'),
    CostItem: new MockEntity('CostItem', 'costItems'),
    Brand: new MockEntity('Brand', 'brands'),
    UGC: new MockEntity('UGC', 'ugc'),
    Campaign: new MockEntity('Campaign', 'campaigns'),
    Coupon: new MockEntity('Coupon', 'coupons'),
    Partnership: new MockEntity('Partnership', 'partnerships'),
    Delivery: new MockEntity('Delivery', 'deliveries'),
    FinancialTransaction: new MockEntity('FinancialTransaction', 'financialTransactions'),
    Ticket: new MockEntity('Ticket', 'tickets'),
    LaunchCalendar: new MockEntity('LaunchCalendar', 'launchCalendar'),
    Project: new MockEntity('Project', 'projects'),
    MarketingAsset: new MockEntity('MarketingAsset', 'marketingAssets'),
    MarketingShareLink: new MockEntity('MarketingShareLink', 'shareLinks')
  };

  // Auth Mock
  const auth = {
    // Retorna o usuário atual
    me: async () => {
      await delay();
      return mockData.currentUser;
    },

    // Login (mock)
    login: async (email, password) => {
      await delay();
      const user = mockData.users.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      return { user, token: 'mock-token-' + Date.now() };
    },

    // Logout (mock)
    logout: async () => {
      await delay();
      return { success: true };
    },

    // Listar usuários
    listUsers: async () => {
      await delay();
      return mockData.users;
    },

    // Criar usuário
    createUser: async (userData) => {
      await delay();
      const newUser = {
        ...userData,
        id: generateId('user'),
        created_date: new Date().toISOString(),
        task_completion_streak: 0,
        total_tasks_completed: 0
      };
      mockData.users.push(newUser);
      return newUser;
    },

    // Atualizar usuário
    updateUser: async (id, updates) => {
      await delay();
      const index = mockData.users.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error('User not found');
      }
      mockData.users[index] = {
        ...mockData.users[index],
        ...updates,
        id
      };
      return mockData.users[index];
    },

    // Deletar usuário
    deleteUser: async (id) => {
      await delay();
      const index = mockData.users.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error('User not found');
      }
      mockData.users.splice(index, 1);
      return { success: true };
    }
  };

  // Integrations Mock
  const integrations = {
    // LLM Integration
    InvokeLLM: async ({ prompt, model = 'gpt-4', context = {} }) => {
      await delay(500);
      return {
        response: `Esta é uma resposta mockada para o prompt: "${prompt.substring(0, 50)}..."`,
        model,
        tokens_used: 150,
        context
      };
    },

    // Email Integration
    SendEmail: async ({ to, subject, body, attachments = [] }) => {
      await delay(400);
      return {
        success: true,
        message_id: `msg-${Date.now()}`,
        to,
        subject,
        sent_at: new Date().toISOString()
      };
    },

    // File Upload Integration
    UploadFile: async (file) => {
      await delay(600);
      return {
        success: true,
        file_id: `file-${Date.now()}`,
        file_url: `https://mock-storage.com/files/${Date.now()}-${file.name}`,
        file_name: file.name,
        file_size: file.size,
        uploaded_at: new Date().toISOString()
      };
    },

    // Private File Upload
    UploadPrivateFile: async (file) => {
      await delay(600);
      return {
        success: true,
        file_id: `private-file-${Date.now()}`,
        file_url: `https://mock-storage.com/private/${Date.now()}-${file.name}`,
        file_name: file.name,
        file_size: file.size,
        uploaded_at: new Date().toISOString()
      };
    },

    // Generate Image
    GenerateImage: async ({ prompt, size = '1024x1024', style = 'realistic' }) => {
      await delay(1000);
      return {
        success: true,
        image_url: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800`,
        prompt,
        size,
        style,
        generated_at: new Date().toISOString()
      };
    },

    // Extract Data from File
    ExtractDataFromUploadedFile: async ({ file_id, extraction_type = 'text' }) => {
      await delay(800);
      return {
        success: true,
        file_id,
        extracted_data: {
          type: extraction_type,
          content: 'Dados extraídos mockados do arquivo',
          metadata: {
            pages: 3,
            words: 1500
          }
        },
        extracted_at: new Date().toISOString()
      };
    },

    // Create File Signed URL
    CreateFileSignedUrl: async ({ file_id, expires_in = 3600 }) => {
      await delay(200);
      return {
        success: true,
        signed_url: `https://mock-storage.com/signed/${file_id}?token=mock-token&expires=${expires_in}`,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString()
      };
    }
  };

  // Retornar cliente mockado com mesma interface do SDK
  return {
    entities,
    auth,
    integrations
  };
};
