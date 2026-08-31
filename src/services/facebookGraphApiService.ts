import { 
  FacebookPageLinkItem, 
  FacebookGraphTokenDebugResult, 
  FacebookGraphPermissionDef, 
  FacebookLongLivedTokenExchangeRequest, 
  FacebookLongLivedTokenExchangeResponse 
} from '../types';

const STORAGE_KEY_PAGES = 'manyflow_facebook_linked_pages_v1';

export const GRAPH_PERMISSIONS_CATALOG: FacebookGraphPermissionDef[] = [
  {
    scope: 'pages_messaging',
    name: 'Envio & Recebimento no Messenger',
    category: 'messaging',
    description: 'Permite enviar mensagens, fluxos interativos, respostas rápidas e carrosséis aos clientes via Messenger.',
    featureImpact: 'Obrigatório para o Inbox, Chat ao Vivo, Disparos e Automações de Fluxo do Messenger.',
    requiredFor: ['Flow Builder', 'Inbox', 'Automação de Boas-Vindas', 'Respostas por Palavra-chave'],
    isEssential: true,
    requiresAppReview: true,
    status: 'granted'
  },
  {
    scope: 'instagram_manage_messages',
    name: 'Instagram Direct Messages (DMs)',
    category: 'instagram',
    description: 'Permite receber mensagens diretas, respostas a stories e menções de stories no Instagram, além de enviar fluxos automatizados.',
    featureImpact: 'Obrigatório para automação completa do Instagram Direct, DMs automáticas e respostas a stories.',
    requiredFor: ['Instagram Inbox', 'Respostas a Stories', 'Menções em Stories', 'DMs de Boas-Vindas'],
    isEssential: true,
    requiresAppReview: true,
    status: 'granted'
  },
  {
    scope: 'pages_read_engagement',
    name: 'Leitura de Engajamento da Página',
    category: 'pages',
    description: 'Permite ler curtidas, compartilhamentos, dados de posts e métricas de engajamento da Página do Facebook.',
    featureImpact: 'Necessário para monitorar atividade de posts, analytics e estatísticas de engajamento.',
    requiredFor: ['Analytics', 'Comment Growth Tools', 'Métricas de Página'],
    isEssential: true,
    requiresAppReview: true,
    status: 'granted'
  },
  {
    scope: 'pages_manage_metadata',
    name: 'Gerenciamento de Metadados & Webhooks',
    category: 'pages',
    description: 'Permite subscrever a Página ao webhook do app (subscribed_apps) para entrega em tempo real de mensagens e comentários.',
    featureImpact: 'Essencial para a entrega em tempo real de webhooks sem atrasos ou polling.',
    requiredFor: ['Subscrição de Webhook', 'Recepção em Tempo Real', 'Handshake de Notificações'],
    isEssential: true,
    requiresAppReview: false,
    status: 'granted'
  },
  {
    scope: 'pages_show_list',
    name: 'Listar Páginas Gerenciadas',
    category: 'pages',
    description: 'Permite consultar a lista de Páginas do Facebook que o usuário autenticado administra (/me/accounts).',
    featureImpact: 'Utilizado no assistente de vinculação rápida para exibir todas as páginas disponíveis para conexão.',
    requiredFor: ['Assistente de Vinculação', 'Seleção de Página', 'Descoberta de Contas'],
    isEssential: true,
    requiresAppReview: false,
    status: 'granted'
  },
  {
    scope: 'instagram_basic',
    name: 'Instagram Basic Display & Metadata',
    category: 'instagram',
    description: 'Lê dados básicos da Conta Profissional do Instagram vinculada à Página (username, foto de perfil, ID do ativo).',
    featureImpact: 'Necessário para sincronizar fotos de perfil e identificar contas profissionais do Instagram.',
    requiredFor: ['Identificação Instagram', 'Avatar & Username', 'Validação de Conta Comercial'],
    isEssential: true,
    requiresAppReview: false,
    status: 'granted'
  },
  {
    scope: 'pages_read_user_content',
    name: 'Leitura de Conteúdo & Comentários',
    category: 'pages',
    description: 'Permite que o ManyFlow capture comentários postados por usuários em posts orgânicos e anúncios da Página.',
    featureImpact: 'Obrigatório para a Ferramenta de Auto-Resposta a Comentários (Comment Growth Tools).',
    requiredFor: ['Ferramentas de Comentário', 'Auto-Like em Comentários', 'Disparo de DM por Comentário'],
    isEssential: false,
    requiresAppReview: true,
    status: 'granted'
  },
  {
    scope: 'pages_manage_posts',
    name: 'Gerenciar & Responder Posts',
    category: 'pages',
    description: 'Permite postar respostas públicas em comentários de posts na Página em nome da empresa.',
    featureImpact: 'Utilizado para postar réplicas públicas personalizadas sob o comentário do lead antes de enviar DM.',
    requiredFor: ['Resposta Pública a Comentários', 'Moderação de Feed', 'Engajamento de Anúncios'],
    isEssential: false,
    requiresAppReview: true,
    status: 'granted'
  },
  {
    scope: 'business_management',
    name: 'Acesso ao Meta Business Manager',
    category: 'business',
    description: 'Permite autenticação corporativa via Usuários do Sistema (System Users) com tokens permanentes.',
    featureImpact: 'Recomendado para agências e empresas que utilizam tokens permanentes de longa duração sem expiração.',
    requiredFor: ['System User Tokens', 'Gestão Multi-Cliente', 'Meta Business Suite'],
    isEssential: false,
    requiresAppReview: true,
    status: 'granted'
  },
  {
    scope: 'whatsapp_business_messaging',
    name: 'WhatsApp Cloud API Messaging',
    category: 'messaging',
    description: 'Permite envio e recebimento de mensagens e templates pelo canal oficial WhatsApp Cloud API.',
    featureImpact: 'Utilizado quando a conta da empresa inclui números oficiais WABA sob a mesma conta Meta.',
    requiredFor: ['WhatsApp Cloud API', 'Envio de Templates', 'Transmissões WhatsApp'],
    isEssential: false,
    requiresAppReview: true,
    status: 'granted'
  }
];

export const INITIAL_LINKED_PAGES: FacebookPageLinkItem[] = [
  {
    id: '109823481920041',
    name: 'ManyFlow Brasil Oficial',
    category: 'Empresa de Software & Automações',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    followersCount: 34200,
    appId: '982736154819203',
    pageAccessToken: 'EAABwzLIX4NkBAO8kL9Zc2mF01xPl99qA88zXvY...permanente',
    tokenExpiresAt: 'never',
    isTokenPermanent: true,
    instagramBusinessId: '17841401928374619',
    instagramUsername: '@manyflow.oficial',
    instagramAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    instagramFollowersCount: 48900,
    isWebhookSubscribed: true,
    subscribedFields: ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads', 'message_reactions', 'feed'],
    tasks: ['MANAGE', 'MESSAGING', 'CREATE_CONTENT', 'ANALYZE'],
    status: 'connected',
    tenantId: 'tenant_main',
    linkedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    lastSyncAt: new Date().toISOString(),
    lastTestResult: {
      success: true,
      latencyMs: 42,
      statusCode: 200,
      testedAt: new Date().toISOString(),
      message: 'Graph API v21.0: Página conectada e pronta para automações de Messenger e Instagram Direct.'
    }
  },
  {
    id: '204918273645129',
    name: 'Loja Conceito & Moda Premium',
    category: 'Varejo & Comércio Eletrônico',
    avatarUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&auto=format&fit=crop&q=80',
    followersCount: 12800,
    appId: '982736154819203',
    pageAccessToken: 'EAABwzLIX4NkBAK79pQ81xZ92LmK03xOp...long_lived',
    tokenExpiresAt: new Date(Date.now() + 52 * 86400000).toISOString(),
    isTokenPermanent: false,
    instagramBusinessId: '17841405928172948',
    instagramUsername: '@lojaconceito.moda',
    instagramAvatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    instagramFollowersCount: 21300,
    isWebhookSubscribed: true,
    subscribedFields: ['messages', 'messaging_postbacks', 'message_deliveries', 'feed'],
    tasks: ['MANAGE', 'MESSAGING', 'ANALYZE'],
    status: 'connected',
    tenantId: 'tenant_main',
    linkedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    lastSyncAt: new Date().toISOString(),
    lastTestResult: {
      success: true,
      latencyMs: 58,
      statusCode: 200,
      testedAt: new Date().toISOString(),
      message: 'Graph API v21.0: Token de 60 dias ativo (52 dias restantes). Webhooks sincronizados com sucesso.'
    }
  }
];

export const facebookGraphApiService = {
  getStoredPages(): FacebookPageLinkItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PAGES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignored
    }
    localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(INITIAL_LINKED_PAGES));
    return INITIAL_LINKED_PAGES;
  },

  saveStoredPages(pages: FacebookPageLinkItem[]): void {
    localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages));
  },

  async getPages(tenantId?: string, appId?: string): Promise<FacebookPageLinkItem[]> {
    try {
      const params = new URLSearchParams();
      if (tenantId) params.append('tenantId', tenantId);
      if (appId) params.append('appId', appId);

      const res = await fetch(`/api/facebook-graph/pages?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.saveStoredPages(data);
          return data;
        }
      }
    } catch {
      // Fallback
    }

    let pages = this.getStoredPages();
    if (tenantId) {
      pages = pages.filter(p => !p.tenantId || p.tenantId === tenantId);
    }
    if (appId) {
      pages = pages.filter(p => p.appId === appId);
    }
    return pages;
  },

  async linkPage(pageData: Partial<FacebookPageLinkItem>): Promise<FacebookPageLinkItem> {
    const isPermanent = pageData.isTokenPermanent ?? (pageData.tokenExpiresAt === 'never' || !pageData.tokenExpiresAt);
    
    const newPage: FacebookPageLinkItem = {
      id: pageData.id || `${Date.now()}`,
      name: pageData.name || 'Nova Página do Facebook',
      category: pageData.category || 'Página de Negócios',
      avatarUrl: pageData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      followersCount: pageData.followersCount || Math.floor(Math.random() * 20000) + 1500,
      appId: pageData.appId || '982736154819203',
      pageAccessToken: pageData.pageAccessToken || `EAABwzLIX4NkBA${Math.random().toString(36).substr(2, 10)}...token`,
      tokenExpiresAt: isPermanent ? 'never' : (pageData.tokenExpiresAt || new Date(Date.now() + 60 * 86400000).toISOString()),
      isTokenPermanent: isPermanent,
      instagramBusinessId: pageData.instagramBusinessId,
      instagramUsername: pageData.instagramUsername,
      instagramAvatarUrl: pageData.instagramAvatarUrl || (pageData.instagramUsername ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' : undefined),
      instagramFollowersCount: pageData.instagramFollowersCount || (pageData.instagramUsername ? Math.floor(Math.random() * 30000) + 2000 : undefined),
      isWebhookSubscribed: pageData.isWebhookSubscribed ?? true,
      subscribedFields: pageData.subscribedFields || ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads', 'feed'],
      tasks: pageData.tasks || ['MANAGE', 'MESSAGING', 'ANALYZE'],
      status: 'connected',
      tenantId: pageData.tenantId || 'tenant_main',
      linkedAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
      lastTestResult: {
        success: true,
        latencyMs: Math.floor(Math.random() * 35) + 30,
        statusCode: 200,
        testedAt: new Date().toISOString(),
        message: 'Conectado à Graph API v21.0 com sucesso.'
      }
    };

    try {
      await fetch('/api/facebook-graph/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage)
      });
    } catch {
      // Offline fallback
    }

    const pages = this.getStoredPages();
    const existingIndex = pages.findIndex(p => p.id === newPage.id);
    let updated: FacebookPageLinkItem[];
    if (existingIndex >= 0) {
      pages[existingIndex] = newPage;
      updated = [...pages];
    } else {
      updated = [newPage, ...pages];
    }
    this.saveStoredPages(updated);
    return newPage;
  },

  async unlinkPage(pageId: string): Promise<boolean> {
    try {
      await fetch(`/api/facebook-graph/pages/${pageId}`, { method: 'DELETE' });
    } catch {
      // Offline fallback
    }

    const pages = this.getStoredPages();
    const filtered = pages.filter(p => p.id !== pageId);
    this.saveStoredPages(filtered);
    return true;
  },

  async testPageConnection(page: FacebookPageLinkItem): Promise<{
    success: boolean;
    latencyMs: number;
    statusCode: number;
    message: string;
    details: {
      pageId: string;
      pageName: string;
      category: string;
      isWebhookSubscribed: boolean;
      instagramConnected: boolean;
      instagramUsername?: string;
      tokenExpiryText: string;
      apiVersion: string;
    };
  }> {
    const startTime = Date.now();
    
    // Simulate real Graph API call GET /{page-id}?fields=id,name,category,access_token,instagram_business_account
    await new Promise(resolve => setTimeout(resolve, 450 + Math.random() * 350));
    
    const latencyMs = Date.now() - startTime;
    const isTokenValid = Boolean(page.pageAccessToken && page.pageAccessToken.length > 10);
    const statusCode = isTokenValid ? 200 : 401;
    
    const expiryText = page.isTokenPermanent || page.tokenExpiresAt === 'never' 
      ? 'Permanente (Sem Expiração)' 
      : `Expira em ${new Date(page.tokenExpiresAt).toLocaleDateString('pt-BR')}`;

    const message = isTokenValid
      ? `HTTP 200 OK: Página "${page.name}" vinculada e responsiva na Graph API v21.0. Webhook ativo para ${page.subscribedFields.length} eventos.`
      : `HTTP 401 Unauthorized: O token da página está inválido ou expirado. Gere um novo token de longa duração.`;

    const updatedPages = this.getStoredPages().map(p => {
      if (p.id === page.id) {
        return {
          ...p,
          lastSyncAt: new Date().toISOString(),
          lastTestResult: {
            success: isTokenValid,
            latencyMs,
            statusCode,
            testedAt: new Date().toISOString(),
            message
          }
        };
      }
      return p;
    });
    this.saveStoredPages(updatedPages);

    return {
      success: isTokenValid,
      latencyMs,
      statusCode,
      message,
      details: {
        pageId: page.id,
        pageName: page.name,
        category: page.category,
        isWebhookSubscribed: page.isWebhookSubscribed,
        instagramConnected: Boolean(page.instagramBusinessId),
        instagramUsername: page.instagramUsername,
        tokenExpiryText: expiryText,
        apiVersion: 'v21.0'
      }
    };
  },

  async subscribePageWebhook(pageId: string, fields: string[] = ['messages', 'messaging_postbacks', 'message_deliveries', 'feed']): Promise<{
    success: boolean;
    subscribedFields: string[];
    message: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const pages = this.getStoredPages().map(p => {
      if (p.id === pageId) {
        return {
          ...p,
          isWebhookSubscribed: true,
          subscribedFields: fields,
          lastSyncAt: new Date().toISOString()
        };
      }
      return p;
    });
    this.saveStoredPages(pages);

    return {
      success: true,
      subscribedFields: fields,
      message: `Página ${pageId} subscrita com sucesso para os eventos: ${fields.join(', ')}.`
    };
  },

  async exchangeToLongLivedToken(params: FacebookLongLivedTokenExchangeRequest): Promise<FacebookLongLivedTokenExchangeResponse> {
    await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 400));

    if (!params.shortLivedUserToken || params.shortLivedUserToken.length < 10) {
      return {
        success: false,
        tokenType: 'USER_ACCESS_TOKEN',
        error: 'O token de acesso informado está vazio ou inválido. Cole um token válido gerado no Meta Graph API Explorer.'
      };
    }

    if (!params.appId || !params.appSecret) {
      return {
        success: false,
        tokenType: 'USER_ACCESS_TOKEN',
        error: 'App ID e App Secret são obrigatórios para trocar o token curto por um token de 60 dias.'
      };
    }

    const mockLongLivedToken = `EAABwzLIX4NkBA${Math.random().toString(36).substring(2, 12)}LLT${Math.random().toString(36).substring(2, 12)}_long_lived_60d`;
    const mockPageToken = `EAABwzLIX4NkBA${Math.random().toString(36).substring(2, 12)}PAGE${Math.random().toString(36).substring(2, 12)}_never_expire`;

    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + sixtyDaysMs).toISOString();

    return {
      success: true,
      longLivedUserToken: mockLongLivedToken,
      userTokenExpiresInSeconds: 5184000, // 60 days
      userTokenExpiresAt: expiresAt,
      pageAccessToken: mockPageToken,
      isPageTokenPermanent: true,
      tokenType: 'PAGE_ACCESS_TOKEN',
      scopes: [
        'pages_messaging',
        'instagram_manage_messages',
        'pages_read_engagement',
        'pages_manage_metadata',
        'pages_show_list',
        'instagram_basic',
        'pages_read_user_content',
        'pages_manage_posts',
        'business_management'
      ]
    };
  },

  async debugToken(token: string, appId?: string): Promise<FacebookGraphTokenDebugResult> {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));

    if (!token || token.trim().length < 8) {
      return {
        isValid: false,
        tokenType: 'USER_ACCESS_TOKEN',
        appId: appId || 'Desconhecido',
        expiresAt: 'never',
        isPermanent: false,
        scopes: [],
        error: 'Token inválido ou vazio.'
      };
    }

    const isSystemUser = token.includes('sys') || token.toLowerCase().includes('system') || token.length > 120;
    const isPageToken = token.includes('PAGE') || token.toLowerCase().includes('page');

    const determinedType = isSystemUser ? 'SYSTEM_USER' : isPageToken ? 'PAGE_ACCESS_TOKEN' : 'USER_ACCESS_TOKEN';
    const isPermanent = isSystemUser || isPageToken;
    const expiresAt = isPermanent ? 'never' : new Date(Date.now() + 58 * 86400000).toISOString();

    return {
      isValid: true,
      tokenType: determinedType,
      appId: appId || '982736154819203',
      applicationName: 'ManyFlow Omnichannel Hub',
      userId: '109823481928475',
      userName: 'Meta Developer Admin',
      pageId: isPageToken ? '109823481920041' : undefined,
      pageName: isPageToken ? 'ManyFlow Brasil Oficial' : undefined,
      expiresAt,
      isPermanent,
      issuedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      dataAccessExpiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
      scopes: [
        'pages_messaging',
        'instagram_manage_messages',
        'pages_read_engagement',
        'pages_manage_metadata',
        'pages_show_list',
        'instagram_basic',
        'pages_read_user_content',
        'pages_manage_posts',
        'business_management'
      ],
      granularScopes: [
        { scope: 'pages_messaging', targetIds: ['109823481920041', '204918273645129'] },
        { scope: 'instagram_manage_messages', targetIds: ['17841401928374619', '17841405928172948'] }
      ]
    };
  }
};
