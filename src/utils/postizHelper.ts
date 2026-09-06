import { 
  PostizSocialAccount, 
  PostizScheduledPost, 
  PostizConfig, 
  PostizSocialPlatform, 
  PostizPostType 
} from '../types';

const POSTIZ_CONFIG_KEY = 'manyflow_postiz_config_v1';
const POSTIZ_ACCOUNTS_KEY = 'manyflow_postiz_accounts_v1';
const POSTIZ_POSTS_KEY = 'manyflow_postiz_posts_v1';

export const DEFAULT_POSTIZ_CONFIG: PostizConfig = {
  apiUrl: 'https://api.postiz.com', // or self-hosted http://localhost:5200
  selfHostedUrl: 'https://postiz.minhaempresa.com.br',
  apiKey: 'ptz_live_89fa71b023e4d9c7',
  accessToken: 'ptz_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.postiz_gitroomhq_live',
  workspaceId: 'ws_manyflow_prod',
  isConnected: true,
  autoSyncComments: true,
  syncScheduleEnabled: true,
  autoSyncIntervalMinutes: 15,
  defaultPlatforms: ['instagram', 'facebook', 'tiktok'],
  lastSyncedAt: new Date().toISOString(),
  serverVersion: 'gitroomhq/postiz-app v1.18.0 (Self-Hosted)',
  syncStatus: 'connected'
};

export const DEFAULT_POSTIZ_ACCOUNTS: PostizSocialAccount[] = [
  {
    id: 'acc_ig_manyflow',
    platform: 'instagram',
    username: 'manyflow.automacoes',
    displayName: 'ManyFlow Oficial 🚀',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    followerCount: 28450,
    profileUrl: 'https://instagram.com/manyflow.automacoes',
    accountType: 'creator'
  },
  {
    id: 'acc_fb_manyflow',
    platform: 'facebook',
    username: 'manyflowbrasil',
    displayName: 'ManyFlow Brasil - Automação',
    avatarUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    followerCount: 14200,
    profileUrl: 'https://facebook.com/manyflowbrasil',
    accountType: 'business'
  },
  {
    id: 'acc_tiktok_manyflow',
    platform: 'tiktok',
    username: '@manyflow_growth',
    displayName: 'ManyFlow Growth Hacks',
    avatarUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    followerCount: 52300,
    profileUrl: 'https://tiktok.com/@manyflow_growth',
    accountType: 'creator'
  },
  {
    id: 'acc_linkedin_manyflow',
    platform: 'linkedin',
    username: 'manyflow-software',
    displayName: 'ManyFlow Technologies',
    avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    followerCount: 8900,
    profileUrl: 'https://linkedin.com/company/manyflow',
    accountType: 'business'
  },
  {
    id: 'acc_x_manyflow',
    platform: 'x',
    username: '@manyflow_hq',
    displayName: 'ManyFlow HQ',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    followerCount: 6420,
    profileUrl: 'https://x.com/manyflow_hq',
    accountType: 'business'
  },
  {
    id: 'acc_threads_manyflow',
    platform: 'threads',
    username: '@manyflow.automacoes',
    displayName: 'ManyFlow Threads',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    followerCount: 12100,
    profileUrl: 'https://threads.net/@manyflow.automacoes',
    accountType: 'creator'
  }
];

// Helper to get dates relative to today
const getRelativeDate = (dayOffset: number, hour: number, minute: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const DEFAULT_POSTIZ_POSTS: PostizScheduledPost[] = [
  {
    id: 'post_postiz_1',
    caption: '🔥 3 Estratégias Secretas para Transformar Comentários do Instagram em Vendas Automáticas nos DMs!\n\nComente "EU QUERO" abaixo para receber o nosso PDF exclusivo com os fluxos prontos para importar! 👇🚀\n\n#marketingdigital #automacao #growth #instagramdms',
    mediaUrls: [
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'image',
    platforms: ['instagram', 'facebook', 'threads'],
    postType: 'post',
    scheduledAt: getRelativeDate(0, 18, 30), // Hoje às 18:30
    status: 'scheduled',
    firstComment: 'Link direto e materiais extras no direct de quem comentar "EU QUERO"! ⚡',
    bindGrowthToolId: 'gt_default_1', // Vinculado à Growth Tool de Comentários ManyFlow!
    tags: ['Estratégia', 'Direct Automático', 'Lançamento'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'post_postiz_2',
    caption: 'Como configuramos uma IA no WhatsApp e Instagram que responde dúvidas em 3 segundos e qualifica leads 24/7. Assista até o final!\n\n👉 Salve este Reels para não esquecer.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'video',
    platforms: ['instagram', 'tiktok', 'youtube'],
    postType: 'reel',
    scheduledAt: getRelativeDate(1, 12, 0), // Amanhã às 12:00
    status: 'scheduled',
    firstComment: 'Tem dúvidas sobre automação com IA? Manda uma DM!',
    tags: ['Reels', 'IA', 'WhatsApp'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'post_postiz_3',
    caption: '🎉 NOVIDADE NO MANYFLOW: Lançamento oficial da integração com Postiz e HttpSMS!\n\nAgora você agenda seus conteúdos para todas as redes sociais e dispara notificações via SMS a partir do mesmo painel.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'mixed',
    platforms: ['linkedin', 'x', 'facebook'],
    postType: 'carousel',
    scheduledAt: getRelativeDate(2, 9, 15), // Depois de amanhã às 09:15
    status: 'scheduled',
    firstComment: 'Acesse https://manyflow.io e experimente hoje mesmo.',
    tags: ['Novidade', 'Postiz', 'HttpSMS'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'post_postiz_4',
    caption: '🏆 Case de Sucesso: Como a clínica Estética & Laser gerou R$ 48.000 em agendamentos em apenas 7 dias usando resposta automática no feed!',
    mediaUrls: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'image',
    platforms: ['instagram', 'facebook'],
    postType: 'post',
    scheduledAt: getRelativeDate(-2, 14, 0), // Publicado há 2 dias
    publishedAt: getRelativeDate(-2, 14, 0),
    status: 'published',
    analytics: {
      likes: 842,
      comments: 314,
      shares: 98,
      clicks: 420,
      reach: 12400
    },
    tags: ['Case de Sucesso', 'Estética'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'post_postiz_5',
    caption: 'Rascunho: Comparativo entre atendimento manual x automação inteligente ManyFlow.',
    mediaUrls: [],
    mediaType: 'text_only',
    platforms: ['instagram', 'linkedin'],
    postType: 'post',
    scheduledAt: getRelativeDate(4, 15, 0),
    status: 'draft',
    tags: ['Rascunho', 'Conteúdo'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function loadPostizConfig(): PostizConfig {
  try {
    const raw = localStorage.getItem(POSTIZ_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading Postiz config:', e);
  }
  return DEFAULT_POSTIZ_CONFIG;
}

export function savePostizConfig(config: PostizConfig): void {
  try {
    localStorage.setItem(POSTIZ_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving Postiz config:', e);
  }
}

export function loadPostizAccounts(): PostizSocialAccount[] {
  try {
    const raw = localStorage.getItem(POSTIZ_ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading Postiz accounts:', e);
  }
  return DEFAULT_POSTIZ_ACCOUNTS;
}

export function savePostizAccounts(accounts: PostizSocialAccount[]): void {
  try {
    localStorage.setItem(POSTIZ_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving Postiz accounts:', e);
  }
}

export function loadPostizPosts(): PostizScheduledPost[] {
  try {
    const raw = localStorage.getItem(POSTIZ_POSTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading Postiz posts:', e);
  }
  return DEFAULT_POSTIZ_POSTS;
}

export function savePostizPosts(posts: PostizScheduledPost[]): void {
  try {
    localStorage.setItem(POSTIZ_POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Error saving Postiz posts:', e);
  }
}
