import { Flow, KeywordTrigger, PostCommentGrowthTool, Contact, LiveConversation, BotKnowledgeBase, MetaConnectionConfig, CustomFieldDefinition, BroadcastCampaign, UtilityMessageTemplate, ConnectedMetaAccount, MetaPostItem, FacebookApp } from '../types';
import { FLOW_TEMPLATES } from './flowTemplates';

export const INITIAL_FLOWS: Flow[] = [
  ...FLOW_TEMPLATES.map(t => t.flow),
  {
    id: "flow_pricing_keyword",
    title: "💰 Planos, Preços & Checkout Automático",
    description: "Enviado automaticamente quando o lead pergunta sobre valores, planos ou preços.",
    channel: "omnichannel",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { runs: 1650, completed: 1540, ctr: 88.5 },
    nodes: [
      {
        id: "node_p_1",
        type: "trigger",
        title: "Gatilho: Palavra-Chave 'Preço'",
        data: { triggerType: "keyword", keywords: ["PREÇO", "VALOR", "PLANOS", "QUANTO CUSTA"] },
        position: { x: 100, y: 100 }
      },
      {
        id: "node_p_2",
        type: "message",
        title: "Apresentação dos Planos",
        data: {
          text: "Olá! Nossos planos começam a partir de R$ 97/mês com acesso total ao robô de automação ManyFlow. Qual plano melhor atende seu negócio hoje?",
          buttons: [
            { id: "btn_p_starter", text: "🚀 Plano Starter (R$ 97)", type: "url", value: "https://checkout.manyflow.io/starter" },
            { id: "btn_p_pro", text: "⚡ Plano Pro Ilimitado", type: "url", value: "https://checkout.manyflow.io/pro" }
          ]
        },
        position: { x: 450, y: 100 }
      }
    ],
    connections: [
      { id: "e_p_1", fromNodeId: "node_p_1", toNodeId: "node_p_2" }
    ]
  },
  {
    id: "flow_discount_keyword",
    title: "🎁 Cupom Especial & Desconto Relâmpago",
    description: "Libera código de cupom de 20% OFF para leads que pedem desconto.",
    channel: "omnichannel",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { runs: 2310, completed: 2190, ctr: 92.4 },
    nodes: [
      {
        id: "node_d_1",
        type: "trigger",
        title: "Gatilho: Palavra-Chave 'Desconto'",
        data: { triggerType: "keyword", keywords: ["DESCONTO", "CUPOM", "PROMOÇÃO", "CÓDIGO"] },
        position: { x: 100, y: 100 }
      },
      {
        id: "node_d_2",
        type: "message",
        title: "Entrega do Cupom",
        data: {
          text: "Você ganhou 20% OFF exclusivo! Use o cupom VIP20 no carrinho para resgatar agora mesmo.",
          buttons: [
            { id: "btn_d_use", text: "🎟️ Ativar Cupom VIP20", type: "url", value: "https://manyflow.io/cupom?c=VIP20" }
          ]
        },
        position: { x: 450, y: 100 }
      }
    ],
    connections: [
      { id: "e_d_1", fromNodeId: "node_d_1", toNodeId: "node_d_2" }
    ]
  },
  {
    id: "flow_support_keyword",
    title: "🎧 Suporte & Transição para Atendente Humano",
    description: "Transfere o atendimento para o Live Chat quando o cliente solicita atendente.",
    channel: "omnichannel",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { runs: 1120, completed: 1080, ctr: 79.1 },
    nodes: [
      {
        id: "node_s_1",
        type: "trigger",
        title: "Gatilho: Suporte Humano",
        data: { triggerType: "keyword", keywords: ["SUPORTE", "HUMANO", "ATENDENTE", "AJUDA"] },
        position: { x: 100, y: 100 }
      },
      {
        id: "node_s_2",
        type: "message",
        title: "Mensagem de Espera",
        data: {
          text: "Um de nossos especialistas humanos já foi notificado e assumirá esta conversa em instantes!"
        },
        position: { x: 450, y: 100 }
      }
    ],
    connections: [
      { id: "e_s_1", fromNodeId: "node_s_1", toNodeId: "node_s_2" }
    ]
  },
  {
    id: "flow_welcome_instagram",
    title: "👋 Boas-Vindas Instagram Direct",
    description: "Primeiro contato com novos seguidores e direct messages.",
    channel: "instagram",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { runs: 5400, completed: 5100, ctr: 91.0 },
    nodes: [
      {
        id: "node_w_1",
        type: "trigger",
        title: "Gatilho: Novo Direct",
        data: { triggerType: "get_started" },
        position: { x: 100, y: 100 }
      },
      {
        id: "node_w_2",
        type: "message",
        title: "Boas-Vindas",
        data: {
          text: "Olá! Seja muito bem-vindo ao nosso canal oficial no Instagram! Como posso te ajudar hoje?",
          buttons: [
            { id: "btn_w_catalog", text: "🛍️ Ver Produtos", type: "url", value: "https://manyflow.io" },
            { id: "btn_w_human", text: "💬 Falar com Atendente", type: "flow", value: "flow_support_keyword" }
          ]
        },
        position: { x: 450, y: 100 }
      }
    ],
    connections: [
      { id: "e_w_1", fromNodeId: "node_w_1", toNodeId: "node_w_2" }
    ]
  },
  {
    id: "flow_welcome_messenger",
    title: "💬 Boas-Vindas Facebook Messenger",
    description: "Primeiro contato com visitantes da Página do Facebook.",
    channel: "messenger",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { runs: 3200, completed: 3050, ctr: 88.0 },
    nodes: [
      {
        id: "node_wm_1",
        type: "trigger",
        title: "Gatilho: Boas-Vindas Messenger",
        data: { triggerType: "get_started" },
        position: { x: 100, y: 100 }
      },
      {
        id: "node_wm_2",
        type: "message",
        title: "Boas-Vindas Messenger",
        data: {
          text: "Olá! Bem-vindo à nossa página do Facebook! Selecione uma das opções abaixo:",
          buttons: [
            { id: "btn_wm_1", text: "🚀 Conhecer Soluções", type: "url", value: "https://manyflow.io" }
          ]
        },
        position: { x: 450, y: 100 }
      }
    ],
    connections: [
      { id: "e_wm_1", fromNodeId: "node_wm_1", toNodeId: "node_wm_2" }
    ]
  },
  {
    id: "flow_no_match_default",
    title: "🤖 Resposta Padrão de Fallback (No Match)",
    description: "Acionado quando nenhuma palavra-chave coincide com a mensagem do cliente.",
    channel: "omnichannel",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { runs: 890, completed: 850, ctr: 65.0 },
    nodes: [
      {
        id: "node_nm_1",
        type: "trigger",
        title: "Gatilho: Fallback",
        data: { triggerType: "default_reply" },
        position: { x: 100, y: 100 }
      },
      {
        id: "node_nm_2",
        type: "message",
        title: "Menu Principal de Ajuda",
        data: {
          text: "Não entendi completamente sua mensagem, mas estou aqui para ajudar! Escolha uma das opções:",
          buttons: [
            { id: "btn_nm_1", text: "💰 Ver Preços", type: "flow", value: "flow_pricing_keyword" },
            { id: "btn_nm_2", text: "👤 Falar com Humano", type: "flow", value: "flow_support_keyword" }
          ]
        },
        position: { x: 450, y: 100 }
      }
    ],
    connections: [
      { id: "e_nm_1", fromNodeId: "node_nm_1", toNodeId: "node_nm_2" }
    ]
  }
];

export const INITIAL_TRIGGERS: KeywordTrigger[] = [
  {
    id: "trig_pricing",
    name: "Gatilho de Preço & Planos ('pricing', 'preço', 'valor')",
    channel: "omnichannel",
    keywords: ["PRICING", "PRICE", "PLANS", "COST", "PREÇO", "VALOR", "TABELA", "PLANOS", "QUANTO CUSTA", "RATES"],
    matchType: "contains",
    targetFlowId: "flow_pricing_keyword",
    isActive: true,
    priority: 1,
    cooldownMinutes: 15,
    stats: {
      triggeredCount: 1650,
      lastTriggeredAt: "Hoje às 14:30"
    }
  },
  {
    id: "trig_discount",
    name: "Gatilho de Desconto & Cupom ('discount', 'desconto', 'cupom')",
    channel: "omnichannel",
    keywords: ["DISCOUNT", "COUPON", "PROMO", "OFFER", "DEAL", "DESCONTO", "CUPOM", "PROMOÇÃO", "CÓDIGO", "QUERO DESCONTO", "20% OFF"],
    matchType: "contains",
    targetFlowId: "flow_discount_keyword",
    isActive: true,
    priority: 1,
    cooldownMinutes: 30,
    stats: {
      triggeredCount: 2310,
      lastTriggeredAt: "Hoje às 14:22"
    }
  },
  {
    id: "trig_support",
    name: "Gatilho de Suporte & Atendente ('support', 'suporte', 'help')",
    channel: "omnichannel",
    keywords: ["SUPPORT", "HELP", "SUPORTE", "AJUDA", "CONTACT SUPPORT", "HUMANO", "ATENDENTE", "AGENT", "ATENDIMENTO", "FALAR COM HUMANO"],
    matchType: "contains",
    targetFlowId: "flow_support_keyword",
    isActive: true,
    priority: 1,
    cooldownMinutes: 5,
    stats: {
      triggeredCount: 1120,
      lastTriggeredAt: "Hoje às 13:55"
    }
  },
  {
    id: "trig_welcome_instagram",
    name: "Gatilho de Boas-Vindas Instagram (Welcome Message)",
    channel: "instagram",
    keywords: ["START", "COMEÇAR", "OI", "OLÁ", "HELLO", "HI", "BOAS VINDAS", "INICIAR"],
    matchType: "contains",
    targetFlowId: "flow_welcome_instagram",
    isActive: true,
    priority: 2,
    cooldownMinutes: 1440,
    stats: {
      triggeredCount: 2840,
      lastTriggeredAt: "Hoje às 14:40"
    }
  },
  {
    id: "trig_welcome_messenger",
    name: "Gatilho de Boas-Vindas Messenger (Welcome Screen)",
    channel: "messenger",
    keywords: ["GET_STARTED", "COMEÇAR", "START_FB", "HELLO_FB", "OI MESSENGER"],
    matchType: "contains",
    targetFlowId: "flow_welcome_messenger",
    isActive: true,
    priority: 2,
    cooldownMinutes: 1440,
    stats: {
      triggeredCount: 1920,
      lastTriggeredAt: "Hoje às 14:10"
    }
  },
  {
    id: "trig_nomatch_default",
    name: "Resposta Padrão quando Nenhuma Palavra-Chave Coincidir (No Match)",
    channel: "omnichannel",
    keywords: ["DEFAULT_FALLBACK_REPLY"],
    matchType: "exact",
    targetFlowId: "flow_no_match_default",
    isActive: true,
    priority: 99,
    cooldownMinutes: 0,
    stats: {
      triggeredCount: 3410,
      lastTriggeredAt: "Hoje às 14:38"
    }
  }
];

export const INITIAL_CONNECTED_ACCOUNTS: ConnectedMetaAccount[] = [];

export const INITIAL_META_POSTS: MetaPostItem[] = [];

export const INITIAL_COMMENT_TOOLS: PostCommentGrowthTool[] = [];

export const INITIAL_CONTACTS: Contact[] = [];

export const INITIAL_CONVERSATIONS: LiveConversation[] = [];

export const INITIAL_KNOWLEDGE_BASE: BotKnowledgeBase = {
  companyName: "Minha Empresa",
  businessSummary: "Atendimento inteligente e automação de mensagens no Instagram Direct e Facebook Messenger.",
  productsAndPricing: "Consulte nosso catálogo ou converse com nossa equipe para detalhes sobre produtos e serviços.",
  shippingAndReturns: "Garantia e suporte dedicados para todos os clientes.",
  workingHours: "Atendimento automático 24/7 com suporte da equipe em horário comercial.",
  contactWhatsapp: "",
  toneOfVoice: "friendly",
  enableAIFallback: true,
  humanHandoverKeywords: ["humano", "atendente", "falar com pessoa", "reclamacao", "cancelar", "ajuda"]
};

export const INITIAL_META_CONFIG: MetaConnectionConfig = {
  instagramConnected: false,
  instagramHandle: "",
  instagramFollowers: "0",
  facebookConnected: false,
  facebookPageName: "",
  metaAppId: "",
  webhookStatus: "pending",
  tokenExpiresAt: "",
  lastSyncAt: ""
};

export const INITIAL_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: "cf_data_nascimento",
    name: "Data de Nascimento",
    key: "data_nascimento",
    type: "date",
    description: "Data de nascimento ou aniversário do seguidor para campanhas e saudações",
    defaultValue: "15/05/1995",
    createdAt: "2026-08-20T10:00:00Z"
  },
  {
    id: "cf_preferencia",
    name: "Preferência de Produto",
    key: "preferencia",
    type: "text",
    description: "Categoria, nicho ou produto preferido escolhido pelo seguidor no direct",
    defaultValue: "Moda Feminina & Acessórios",
    createdAt: "2026-08-20T10:00:00Z"
  },
  {
    id: "cf_cupom",
    name: "Cupom de Desconto",
    key: "cupom",
    type: "text",
    description: "Código promocional personalizado gerado para o cliente",
    defaultValue: "BEMVINDO15",
    createdAt: "2026-08-20T10:00:00Z"
  },
  {
    id: "cf_link_oferta",
    name: "Link da Oferta",
    key: "link_oferta",
    type: "text",
    description: "URL direta da página de checkout ou catálogo com UTM",
    defaultValue: "https://manyflow.io/promo-vip",
    createdAt: "2026-08-20T10:00:00Z"
  },
  {
    id: "cf_cidade",
    name: "Cidade / Região",
    key: "cidade",
    type: "text",
    description: "Localização informada pelo seguidor nas mensagens",
    defaultValue: "São Paulo - SP",
    createdAt: "2026-08-21T14:30:00Z"
  },
  {
    id: "cf_cargo",
    name: "Cargo / Ocupação",
    key: "cargo",
    type: "text",
    description: "Profissão, empresa ou nicho de atuação do lead B2B",
    defaultValue: "Gerente Comercial",
    createdAt: "2026-08-22T09:15:00Z"
  }
];

export const INITIAL_BROADCASTS: BroadcastCampaign[] = [];

export const INITIAL_UTILITY_TEMPLATES: UtilityMessageTemplate[] = [
  {
    id: "tpl_order_shipped",
    name: "atualizacao_rastreio_pedido_v1",
    displayName: "Atualização de Envio & Rastreamento de Pedido",
    category: "UTILITY",
    language: "pt_BR",
    channel: "instagram",
    status: "APPROVED",
    qualityScore: "HIGH",
    metaTemplateId: "meta_tpl_98412903",
    headerType: "text",
    headerContent: "📦 Status do Pedido #{1}",
    bodyText: "Olá {{1}}! Seu pedido #{{2}} foi faturado e enviado pela transportadora para {{3}}.\n\nCódigo de Rastreamento: *{{4}}*\nPrevisão estimada: até 48 horas úteis.",
    footerText: "Notificação oficial ManyFlow Direct • Pós-Venda",
    variables: [
      { key: "1", sampleValue: "Camila", description: "Nome do cliente ({first_name})" },
      { key: "2", sampleValue: "PED-98421", description: "Número do Pedido" },
      { key: "3", sampleValue: "São Paulo, SP", description: "Cidade / Destino" },
      { key: "4", sampleValue: "BR88391209X", description: "Código de Rastreamento" }
    ],
    buttons: [
      { id: "btn_tpl_track", text: "🚚 Rastrear em Tempo Real", type: "url", value: "https://rastreio.manyflow.io" },
      { id: "btn_tpl_support", text: "💬 Falar com Suporte", type: "handover" }
    ],
    submittedAt: "2026-08-20T14:30:00Z",
    approvedAt: "2026-08-20T14:34:20Z",
    usageCount: 1420
  },
  {
    id: "tpl_appointment_reminder",
    name: "lembrete_agendamento_consulta_v2",
    displayName: "Lembrete de Agendamento & Consulta",
    category: "UTILITY",
    language: "pt_BR",
    channel: "omnichannel",
    status: "APPROVED",
    qualityScore: "HIGH",
    metaTemplateId: "meta_tpl_77341205",
    headerType: "text",
    headerContent: "🗓️ Lembrete de Agendamento",
    bodyText: "Olá {{1}}, este é um lembrete do seu atendimento com {{2}} marcado para o dia *{{3}}* às *{{4}}*.\n\nEndereço: {{5}}.\nPor favor, confirme ou remarque pelo botão abaixo.",
    footerText: "Atendimento automático verificado",
    variables: [
      { key: "1", sampleValue: "Rodrigo", description: "Nome do cliente" },
      { key: "2", sampleValue: "Dra. Fernanda", description: "Profissional / Serviço" },
      { key: "3", sampleValue: "30/08/2026", description: "Data do agendamento" },
      { key: "4", sampleValue: "15:30", description: "Horário" },
      { key: "5", sampleValue: "Av. Paulista, 1000 - Cj 52", description: "Local do atendimento" }
    ],
    buttons: [
      { id: "btn_tpl_conf", text: "✅ Confirmar Presença", type: "flow" },
      { id: "btn_tpl_resched", text: "🔄 Reagendar Horário", type: "flow" }
    ],
    submittedAt: "2026-08-22T09:10:00Z",
    approvedAt: "2026-08-22T09:13:40Z",
    usageCount: 890
  },
  {
    id: "tpl_invoice_alert",
    name: "aviso_fatura_cobranca_v1",
    displayName: "Aviso de Fatura & Código PIX / Boleto",
    category: "UTILITY",
    language: "pt_BR",
    channel: "messenger",
    status: "APPROVED",
    qualityScore: "HIGH",
    metaTemplateId: "meta_tpl_33918210",
    headerType: "none",
    bodyText: "Olá {{1}}! Sua fatura referente a {{2}} no valor de *R$ {{3}}* já está disponível.\n\nVencimento: *{{4}}*.\nCopie a chave PIX ou acesse a 2ª via pelo link oficial abaixo:",
    footerText: "Setor Financeiro ManyFlow",
    variables: [
      { key: "1", sampleValue: "Mariana", description: "Nome do cliente" },
      { key: "2", sampleValue: "Assinatura Pro", description: "Descrição do serviço" },
      { key: "3", sampleValue: "197,00", description: "Valor da fatura" },
      { key: "4", sampleValue: "05/09/2026", description: "Data de vencimento" }
    ],
    buttons: [
      { id: "btn_tpl_pay", text: "💳 Pagar via PIX / Boleto", type: "url", value: "https://financeiro.manyflow.io" },
      { id: "btn_tpl_fin_sup", text: "📄 Segunda Via PDF", type: "url", value: "https://financeiro.manyflow.io/pdf" }
    ],
    submittedAt: "2026-08-25T11:00:00Z",
    approvedAt: "2026-08-25T11:04:12Z",
    usageCount: 630
  },
  {
    id: "tpl_security_otp",
    name: "codigo_seguranca_acesso_2fa",
    displayName: "Código de Verificação 2FA & Segurança",
    category: "AUTHENTICATION",
    language: "pt_BR",
    channel: "omnichannel",
    status: "APPROVED",
    qualityScore: "HIGH",
    metaTemplateId: "meta_tpl_12049188",
    headerType: "none",
    bodyText: "{{1}} é o seu código de segurança para autenticar seu acesso no ManyFlow. Este código expira em 10 minutos. Não compartilhe este código com ninguém.",
    footerText: "Segurança da Conta ManyFlow",
    variables: [
      { key: "1", sampleValue: "482-910", description: "Código OTP / PIN de 6 dígitos" }
    ],
    buttons: [
      { id: "btn_tpl_copy", text: "📋 Copiar Código", type: "url", value: "https://app.manyflow.io" }
    ],
    submittedAt: "2026-08-18T16:00:00Z",
    approvedAt: "2026-08-18T16:01:50Z",
    usageCount: 3120
  },
  {
    id: "tpl_delivery_delay",
    name: "notificacao_reprogramacao_entrega",
    displayName: "Notificação de Reprogramação de Entrega",
    category: "UTILITY",
    language: "pt_BR",
    channel: "instagram",
    status: "PENDING_APPROVAL",
    qualityScore: "MEDIUM",
    metaTemplateId: "meta_tpl_pending_001",
    headerType: "text",
    headerContent: "⚠️ Informação sobre a sua Entrega",
    bodyText: "Olá {{1}}, informamos que devido a condições operacionais na rota de {{2}}, a entrega do pedido #{{3}} foi reprogramada para {{4}}.\n\nPedimos desculpas pelo transtorno. Você pode acompanhar a localização ao vivo:",
    footerText: "Central de Logística & Rastreio",
    variables: [
      { key: "1", sampleValue: "Felipe", description: "Nome do cliente" },
      { key: "2", sampleValue: "Rio de Janeiro, RJ", description: "Região" },
      { key: "3", sampleValue: "PED-7712", description: "Número do Pedido" },
      { key: "4", sampleValue: "02/09/2026", description: "Nova Data" }
    ],
    buttons: [
      { id: "btn_tpl_live_track", text: "📍 Ver Localização do Pacote", type: "url", value: "https://rastreio.manyflow.io" }
    ],
    submittedAt: "2026-08-29T14:10:00Z",
    usageCount: 0
  },
  {
    id: "tpl_promo_attempt_rejected",
    name: "super_cupom_desconto_aniversario",
    displayName: "Tentativa de Cupom de Desconto (Rejeitado como Utility)",
    category: "UTILITY",
    language: "pt_BR",
    channel: "instagram",
    status: "REJECTED",
    rejectionReason: "Rejeitado pela Meta: O texto contém termos estritamente promocionais ('50% OFF', 'imperdível', 'aproveite agora'). Modelos promocionais devem ser submetidos sob a categoria MARKETING com opt-in explícito do usuário.",
    headerType: "text",
    headerContent: "🎉 Super Presente de Aniversário!",
    bodyText: "Olá {{1}}! Como você é cliente especial, liberamos 50% de desconto com o cupom {{2}} válido apenas hoje! Aproveite e compre agora:",
    variables: [
      { key: "1", sampleValue: "Cliente", description: "Nome" },
      { key: "2", sampleValue: "NIVER50", description: "Cupom" }
    ],
    buttons: [
      { id: "btn_rej_buy", text: "🛍️ Comprar com Desconto", type: "url", value: "https://manyflow.io" }
    ],
    submittedAt: "2026-08-28T18:00:00Z",
    usageCount: 0
  }
];

export const INITIAL_WEBHOOK_SETTINGS: import('../types').WebhookSettingsState = {
  globalVerifyToken: "manyflow_verify_token_secure_2026",
  appSecret: "mf_sec_89df2a3bc7e1480f90ab12d",
  serverBaseUrl: "https://seu-dominio-aapanel.com/api/webhooks",
  enableLogging: true,
  endpoints: [
    {
      id: "wh_endpoint_1",
      name: "Webhook Principal (Instagram Direct & Comentários)",
      url: "https://seu-dominio-aapanel.com/api/webhooks/instagram",
      channel: "instagram",
      secretToken: "whsec_ig_893fa012bd8491",
      verifyToken: "manyflow_verify_token_secure_2026",
      isActive: true,
      events: ["messages", "messaging_postbacks", "comments", "story_insights"],
      retryOnFailure: true,
      maxRetries: 3,
      timeoutMs: 5000,
      headers: [
        { key: "X-ManyFlow-Source", value: "aapanel-production" },
        { key: "X-Environment", value: "live" }
      ],
      description: "Recebe mensagens diretas, comentários de Reels/Posts e reações de stories em tempo real.",
      createdAt: "2026-08-25T10:00:00Z",
      updatedAt: "2026-08-29T14:30:00Z",
      lastDeliveryStatus: "success",
      lastDeliveryAt: "2026-08-29T16:32:10Z",
      lastStatusCode: 200,
      totalDeliveries: 1420,
      totalErrors: 2
    },
    {
      id: "wh_endpoint_2",
      name: "Webhook Secundário (Facebook Messenger & Leads)",
      url: "https://seu-dominio-aapanel.com/api/webhooks/messenger",
      channel: "messenger",
      secretToken: "whsec_ms_29dfa11200bc45",
      verifyToken: "manyflow_verify_token_secure_2026",
      isActive: true,
      events: ["messages", "messaging_postbacks", "messaging_optins", "leadgen"],
      retryOnFailure: true,
      maxRetries: 5,
      timeoutMs: 6000,
      headers: [
        { key: "X-ManyFlow-Source", value: "aapanel-messenger" }
      ],
      description: "Encaminha eventos da Página do Facebook, respostas de anúncios Click-to-Messenger e formulários Instant Leads.",
      createdAt: "2026-08-26T11:20:00Z",
      updatedAt: "2026-08-29T15:00:00Z",
      lastDeliveryStatus: "success",
      lastDeliveryAt: "2026-08-29T16:28:44Z",
      lastStatusCode: 200,
      totalDeliveries: 685,
      totalErrors: 0
    }
  ]
};

export const INITIAL_FACEBOOK_APPS: FacebookApp[] = [
  {
    id: "fb_app_default_1",
    name: "ManyFlow Principal (Meta Business Suite)",
    appId: "10482910482910",
    appSecret: "9df82a01bc74e92a01cd45ef",
    appType: "business",
    apiVersion: "v21.0",
    isDefault: true,
    status: "active",
    systemUserToken: "EAABwzLix8921048_system_user_token_live_manyflow_2026",
    webhookCallbackUrl: "https://seu-dominio-aapanel.com/api/webhooks/facebook",
    verifyToken: "manyflow_verify_token_secure_2026",
    isWebhookLive: true,
    approvedPermissions: [
      "pages_messaging",
      "instagram_manage_messages",
      "pages_read_engagement",
      "pages_manage_metadata",
      "instagram_basic"
    ],
    pages: [
      {
        id: "10982736451",
        name: "Loja & Marca Oficial",
        pageAccessToken: "EAA_PAGE_TOKEN_SECURE_98271",
        instagramBusinessId: "1784140029381029",
        instagramUsername: "manyflow_oficial",
        instagramAvatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
        followersCount: 48200,
        isWebhookSubscribed: true
      }
    ],
    whatsAppAccounts: [],
    ownerUserId: "usr_super_1",
    ownerUserName: "Administrador do Sistema",
    tenantId: "tenant_main",
    assignedUserIds: ["all"],
    rateLimitUsagePercent: 12,
    createdAt: "2026-08-20T10:00:00Z",
    updatedAt: "2026-08-29T10:00:00Z",
    lastCheckedAt: "2026-08-29T10:00:00Z"
  }
];


