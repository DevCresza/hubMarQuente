// Dados mockados para todas as entidades do sistema

// Usuários
export const mockUsers = [
  {
    id: "user-1",
    name: "Ana Silva",
    email: "ana.silva@marquente.com",
    role: "admin",
    department: "dept-1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    created_date: "2024-01-15T10:00:00Z",
    task_completion_streak: 5,
    total_tasks_completed: 42
  },
  {
    id: "user-2",
    name: "Carlos Santos",
    email: "carlos.santos@marquente.com",
    role: "manager",
    department: "dept-2",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    created_date: "2024-01-20T10:00:00Z",
    task_completion_streak: 3,
    total_tasks_completed: 28
  },
  {
    id: "user-3",
    name: "Beatriz Costa",
    email: "beatriz.costa@marquente.com",
    role: "user",
    department: "dept-1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beatriz",
    created_date: "2024-02-01T10:00:00Z",
    task_completion_streak: 7,
    total_tasks_completed: 56
  },
  {
    id: "user-4",
    name: "Diego Oliveira",
    email: "diego.oliveira@marquente.com",
    role: "user",
    department: "dept-3",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego",
    created_date: "2024-02-10T10:00:00Z",
    task_completion_streak: 2,
    total_tasks_completed: 19
  },
  {
    id: "user-5",
    name: "Elena Ferreira",
    email: "elena.ferreira@marquente.com",
    role: "user",
    department: "dept-4",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    created_date: "2024-02-15T10:00:00Z",
    task_completion_streak: 4,
    total_tasks_completed: 31
  }
];

// Departamentos
export const mockDepartments = [
  {
    id: "dept-1",
    name: "Marketing",
    description: "Equipe responsável por estratégias de marketing e comunicação",
    color: "#FF6B9D",
    icon: "megaphone",
    created_date: "2024-01-01T10:00:00Z",
    member_count: 8,
    active_projects: 5
  },
  {
    id: "dept-2",
    name: "Comercial",
    description: "Equipe de vendas e relacionamento com clientes",
    color: "#4ECDC4",
    icon: "shopping-bag",
    created_date: "2024-01-01T10:00:00Z",
    member_count: 6,
    active_projects: 3
  },
  {
    id: "dept-3",
    name: "Desenvolvimento",
    description: "Equipe de desenvolvimento de produtos e tecnologia",
    color: "#95E1D3",
    icon: "code",
    created_date: "2024-01-01T10:00:00Z",
    member_count: 10,
    active_projects: 7
  },
  {
    id: "dept-4",
    name: "Manutenção",
    description: "Equipe de suporte e manutenção de sistemas",
    color: "#F38181",
    icon: "wrench",
    created_date: "2024-01-01T10:00:00Z",
    member_count: 4,
    active_projects: 2
  }
];

// Projetos
export const mockProjects = [
  {
    id: "proj-1",
    name: "Campanha Verão 2025",
    description: "Lançamento da coleção verão com foco em sustentabilidade",
    status: "in_progress",
    priority: "high",
    department: "dept-1",
    owner: "user-1",
    start_date: "2024-11-01T00:00:00Z",
    end_date: "2025-01-15T00:00:00Z",
    progress: 65,
    budget: 150000,
    spent: 97500,
    created_date: "2024-10-15T10:00:00Z",
    tags: ["campanha", "verão", "sustentabilidade"]
  },
  {
    id: "proj-2",
    name: "Parceria Influenciadores",
    description: "Programa de parcerias com influenciadores digitais",
    status: "planning",
    priority: "medium",
    department: "dept-1",
    owner: "user-2",
    start_date: "2024-12-01T00:00:00Z",
    end_date: "2025-03-31T00:00:00Z",
    progress: 25,
    budget: 80000,
    spent: 20000,
    created_date: "2024-11-01T10:00:00Z",
    tags: ["marketing", "influencers", "social"]
  },
  {
    id: "proj-3",
    name: "Redesign E-commerce",
    description: "Atualização completa da plataforma de e-commerce",
    status: "in_progress",
    priority: "high",
    department: "dept-3",
    owner: "user-4",
    start_date: "2024-10-01T00:00:00Z",
    end_date: "2024-12-31T00:00:00Z",
    progress: 78,
    budget: 200000,
    spent: 156000,
    created_date: "2024-09-15T10:00:00Z",
    tags: ["tecnologia", "ecommerce", "ux"]
  }
];

// Tarefas
export const mockTasks = [
  {
    id: "task-1",
    title: "Criar artes para Instagram",
    description: "Desenvolver 15 posts para feed do Instagram sobre a nova coleção",
    status: "todo",
    priority: "high",
    assigned_to: "user-3",
    department: "dept-1",
    project: "proj-1",
    due_date: "2024-11-20T00:00:00Z",
    created_date: "2024-11-10T10:00:00Z",
    tags: ["design", "social-media"],
    estimated_hours: 8,
    actual_hours: 0
  },
  {
    id: "task-2",
    title: "Revisar lookbook digital",
    description: "Fazer revisão final das fotos e textos do lookbook",
    status: "in_progress",
    priority: "high",
    assigned_to: "user-1",
    department: "dept-1",
    project: "proj-1",
    due_date: "2024-11-18T00:00:00Z",
    created_date: "2024-11-08T10:00:00Z",
    tags: ["conteúdo", "revisão"],
    estimated_hours: 4,
    actual_hours: 2
  },
  {
    id: "task-3",
    title: "Configurar Google Analytics",
    description: "Implementar tracking avançado no novo e-commerce",
    status: "done",
    priority: "medium",
    assigned_to: "user-4",
    department: "dept-3",
    project: "proj-3",
    due_date: "2024-11-15T00:00:00Z",
    completed_date: "2024-11-14T16:30:00Z",
    created_date: "2024-11-05T10:00:00Z",
    tags: ["analytics", "tracking"],
    estimated_hours: 6,
    actual_hours: 5
  },
  {
    id: "task-4",
    title: "Pesquisa de mercado - concorrentes",
    description: "Analisar estratégias de marketing dos principais concorrentes",
    status: "todo",
    priority: "medium",
    assigned_to: "user-2",
    department: "dept-2",
    project: "proj-2",
    due_date: "2024-11-25T00:00:00Z",
    created_date: "2024-11-11T10:00:00Z",
    tags: ["pesquisa", "análise"],
    estimated_hours: 12,
    actual_hours: 0
  },
  {
    id: "task-5",
    title: "Otimizar performance do site",
    description: "Melhorar tempo de carregamento das páginas principais",
    status: "in_progress",
    priority: "high",
    assigned_to: "user-4",
    department: "dept-3",
    project: "proj-3",
    due_date: "2024-11-22T00:00:00Z",
    created_date: "2024-11-09T10:00:00Z",
    tags: ["performance", "otimização"],
    estimated_hours: 10,
    actual_hours: 6
  }
];

// Coleções
export const mockCollections = [
  {
    id: "coll-1",
    name: "Verão Sustentável 2025",
    description: "Coleção focada em tecidos orgânicos e processos sustentáveis",
    season: "Verão",
    year: 2025,
    status: "active",
    launch_date: "2024-12-15T00:00:00Z",
    stylist: "stylist-1",
    color_palette: ["#E8F5E9", "#81C784", "#4CAF50", "#2E7D32"],
    piece_count: 42,
    target_audience: "Jovens conscientes 18-35 anos",
    created_date: "2024-09-01T10:00:00Z"
  },
  {
    id: "coll-2",
    name: "Urban Street Fall",
    description: "Streetwear urbano com influências do outono",
    season: "Outono",
    year: 2024,
    status: "completed",
    launch_date: "2024-03-20T00:00:00Z",
    stylist: "stylist-2",
    color_palette: ["#FFF3E0", "#FFB74D", "#F57C00", "#E65100"],
    piece_count: 38,
    target_audience: "Público urbano 20-40 anos",
    created_date: "2024-01-15T10:00:00Z"
  },
  {
    id: "coll-3",
    name: "Inverno Minimalista",
    description: "Peças essenciais com design minimalista",
    season: "Inverno",
    year: 2025,
    status: "planning",
    launch_date: "2025-05-10T00:00:00Z",
    stylist: "stylist-1",
    color_palette: ["#ECEFF1", "#90A4AE", "#546E7A", "#263238"],
    piece_count: 0,
    target_audience: "Profissionais 25-45 anos",
    created_date: "2024-11-01T10:00:00Z"
  }
];

// Estilistas
export const mockStylists = [
  {
    id: "stylist-1",
    name: "Marina Almeida",
    email: "marina.almeida@marquente.com",
    specialty: "Moda Sustentável",
    bio: "10 anos de experiência em design de moda com foco em sustentabilidade",
    portfolio_url: "https://marina-design.com",
    collections_count: 8,
    created_date: "2023-06-01T10:00:00Z"
  },
  {
    id: "stylist-2",
    name: "Roberto Mendes",
    email: "roberto.mendes@marquente.com",
    specialty: "Streetwear",
    bio: "Especialista em moda urbana e tendências de rua",
    portfolio_url: "https://roberto-street.com",
    collections_count: 12,
    created_date: "2023-03-15T10:00:00Z"
  }
];

// Estilos
export const mockStyles = [
  {
    id: "style-1",
    name: "Casual Chic",
    description: "Elegância casual para o dia a dia",
    collection: "coll-1",
    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
    created_date: "2024-09-10T10:00:00Z"
  },
  {
    id: "style-2",
    name: "Street Urban",
    description: "Estilo urbano moderno",
    collection: "coll-2",
    image_url: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=400",
    created_date: "2024-02-05T10:00:00Z"
  }
];

// Calendário de Lançamentos
export const mockLaunchCalendar = [
  {
    id: "event-1",
    title: "Lançamento Coleção Verão",
    description: "Evento de lançamento da nova coleção sustentável",
    type: "launch",
    start_date: "2024-12-15T18:00:00Z",
    end_date: "2024-12-15T22:00:00Z",
    collection: "coll-1",
    department: "dept-1",
    attendees: ["user-1", "user-2", "user-3"],
    location: "Showroom Mar Quente - São Paulo",
    status: "scheduled",
    created_date: "2024-10-20T10:00:00Z"
  },
  {
    id: "event-2",
    title: "Sessão de Fotos - Lookbook",
    description: "Fotografia profissional para o lookbook digital",
    type: "photoshoot",
    start_date: "2024-11-25T09:00:00Z",
    end_date: "2024-11-25T18:00:00Z",
    collection: "coll-1",
    department: "dept-1",
    attendees: ["user-1", "user-3"],
    location: "Estúdio Luz",
    status: "confirmed",
    created_date: "2024-10-15T10:00:00Z"
  },
  {
    id: "event-3",
    title: "Reunião de Planejamento - Inverno",
    description: "Planejamento estratégico da coleção inverno",
    type: "meeting",
    start_date: "2024-11-20T14:00:00Z",
    end_date: "2024-11-20T16:00:00Z",
    collection: "coll-3",
    department: "dept-1",
    attendees: ["user-1", "user-2"],
    location: "Sala de Reuniões - Online",
    status: "scheduled",
    created_date: "2024-11-05T10:00:00Z"
  }
];

// Tickets
export const mockTickets = [
  {
    id: "ticket-1",
    title: "Bug no checkout - pagamento não finaliza",
    description: "Clientes reportam erro ao finalizar compra com cartão de crédito",
    type: "bug",
    priority: "critical",
    status: "open",
    department: "dept-3",
    created_by: "user-2",
    assigned_to: "user-4",
    created_date: "2024-11-12T09:30:00Z",
    tags: ["ecommerce", "pagamento", "urgente"]
  },
  {
    id: "ticket-2",
    title: "Solicitar nova campanha de email",
    description: "Criar campanha de email marketing para Black Friday",
    type: "request",
    priority: "high",
    status: "in_progress",
    department: "dept-1",
    created_by: "user-2",
    assigned_to: "user-3",
    created_date: "2024-11-10T14:20:00Z",
    tags: ["marketing", "email", "black-friday"]
  },
  {
    id: "ticket-3",
    title: "Atualizar inventário no sistema",
    description: "Sincronizar estoque físico com sistema online",
    type: "task",
    priority: "medium",
    status: "resolved",
    department: "dept-4",
    created_by: "user-2",
    assigned_to: "user-5",
    created_date: "2024-11-08T11:15:00Z",
    resolved_date: "2024-11-11T16:45:00Z",
    tags: ["estoque", "sistema"]
  }
];

// UGC (User Generated Content)
export const mockUGC = [
  {
    id: "ugc-1",
    content_type: "instagram_post",
    author_name: "Julia Fashion",
    author_handle: "@juliafashion",
    content_url: "https://instagram.com/p/abc123",
    image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
    caption: "Amando essa peça da nova coleção! #MarQuente #ModaSustentável",
    likes: 1243,
    comments: 87,
    engagement_rate: 4.2,
    collection: "coll-1",
    approved: true,
    featured: true,
    created_date: "2024-11-10T15:30:00Z"
  },
  {
    id: "ugc-2",
    content_type: "tiktok_video",
    author_name: "Carlos Style",
    author_handle: "@carlosstyle",
    content_url: "https://tiktok.com/@carlosstyle/video/123456",
    image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
    caption: "Look do dia com Mar Quente",
    likes: 3421,
    comments: 156,
    engagement_rate: 5.8,
    collection: "coll-2",
    approved: true,
    featured: false,
    created_date: "2024-11-09T12:20:00Z"
  }
];

// Marcas/Brands
export const mockBrands = [
  {
    id: "brand-1",
    name: "Mar Quente",
    description: "Moda sustentável e consciente",
    logo_url: "https://via.placeholder.com/200x80?text=Mar+Quente",
    website: "https://marquente.com",
    founded_year: 2020,
    category: "Fashion",
    created_date: "2023-01-10T10:00:00Z"
  }
];

// Campanhas
export const mockCampaigns = [
  {
    id: "campaign-1",
    name: "Black Friday 2024",
    description: "Campanha especial de Black Friday com descontos de até 50%",
    type: "promotional",
    status: "active",
    start_date: "2024-11-25T00:00:00Z",
    end_date: "2024-11-30T23:59:59Z",
    budget: 50000,
    target_audience: "Todos os clientes",
    channels: ["email", "social-media", "website"],
    created_date: "2024-10-15T10:00:00Z"
  },
  {
    id: "campaign-2",
    name: "Lançamento Verão Sustentável",
    description: "Campanha de awareness para nova coleção sustentável",
    type: "awareness",
    status: "scheduled",
    start_date: "2024-12-01T00:00:00Z",
    end_date: "2024-12-31T23:59:59Z",
    budget: 80000,
    target_audience: "Jovens 18-35 conscientes",
    channels: ["instagram", "tiktok", "influencers"],
    created_date: "2024-11-01T10:00:00Z"
  }
];

// Cupons
export const mockCoupons = [
  {
    id: "coupon-1",
    code: "BLACKFRIDAY50",
    description: "50% de desconto em toda a loja",
    discount_type: "percentage",
    discount_value: 50,
    min_purchase: 100,
    max_uses: 1000,
    used_count: 342,
    valid_from: "2024-11-25T00:00:00Z",
    valid_until: "2024-11-30T23:59:59Z",
    active: true,
    created_date: "2024-10-20T10:00:00Z"
  },
  {
    id: "coupon-2",
    code: "BEMVINDO20",
    description: "20% de desconto para novos clientes",
    discount_type: "percentage",
    discount_value: 20,
    min_purchase: 50,
    max_uses: null,
    used_count: 156,
    valid_from: "2024-01-01T00:00:00Z",
    valid_until: "2024-12-31T23:59:59Z",
    active: true,
    created_date: "2024-01-01T10:00:00Z"
  }
];

// Assets de Marketing
export const mockMarketingAssets = [
  {
    id: "asset-1",
    name: "Banner Homepage - Verão 2025",
    description: "Banner principal para homepage",
    type: "image",
    category: "web",
    file_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    file_size: 245678,
    dimensions: "1920x600",
    format: "jpg",
    campaign: "campaign-2",
    created_by: "user-3",
    created_date: "2024-11-05T10:00:00Z",
    tags: ["banner", "homepage", "verão"]
  },
  {
    id: "asset-2",
    name: "Vídeo Instagram - Black Friday",
    description: "Vídeo promocional para stories",
    type: "video",
    category: "social",
    file_url: "https://example.com/videos/blackfriday.mp4",
    file_size: 5432100,
    dimensions: "1080x1920",
    format: "mp4",
    campaign: "campaign-1",
    created_by: "user-3",
    created_date: "2024-11-08T14:30:00Z",
    tags: ["video", "instagram", "stories", "black-friday"]
  }
];

// Links de Compartilhamento
export const mockShareLinks = [
  {
    id: "link-1",
    asset: "asset-1",
    short_url: "https://mrq.ht/abc123",
    password_protected: false,
    expires_at: "2024-12-31T23:59:59Z",
    view_count: 234,
    download_count: 45,
    created_by: "user-1",
    created_date: "2024-11-06T10:00:00Z"
  }
];

// Transações Financeiras
export const mockFinancialTransactions = [
  {
    id: "trans-1",
    type: "expense",
    category: "marketing",
    description: "Pagamento influencer @juliafashion",
    amount: 5000,
    currency: "BRL",
    date: "2024-11-10T00:00:00Z",
    project: "proj-2",
    department: "dept-1",
    status: "completed",
    created_date: "2024-11-10T14:30:00Z"
  },
  {
    id: "trans-2",
    type: "expense",
    category: "production",
    description: "Sessão fotográfica - Lookbook",
    amount: 12000,
    currency: "BRL",
    date: "2024-11-11T00:00:00Z",
    project: "proj-1",
    department: "dept-1",
    status: "completed",
    created_date: "2024-11-11T16:20:00Z"
  }
];

// Dados do usuário atual (simulando base44.auth.me())
export const mockCurrentUser = mockUsers[0]; // Ana Silva - Admin

// Exportar todas as entidades
export const mockData = {
  users: mockUsers,
  departments: mockDepartments,
  projects: mockProjects,
  tasks: mockTasks,
  collections: mockCollections,
  stylists: mockStylists,
  styles: mockStyles,
  launchCalendar: mockLaunchCalendar,
  tickets: mockTickets,
  ugc: mockUGC,
  brands: mockBrands,
  campaigns: mockCampaigns,
  coupons: mockCoupons,
  marketingAssets: mockMarketingAssets,
  shareLinks: mockShareLinks,
  financialTransactions: mockFinancialTransactions,
  currentUser: mockCurrentUser
};
