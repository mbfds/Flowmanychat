import { 
  WhatsAppGroup, 
  GroupSubscriber, 
  SmartLinkRotator, 
  GroupBroadcastTask, 
  HybridWhatsAppEngineStatus, 
  TelegramBotConfig, 
  BaileysQueueItem, 
  BaileysGroupSyncStatus, 
  BaileysEventLog,
  AutoModerationConfig,
  ModerationIncident,
  BlacklistedMember,
  KeywordModerationRule,
  DomainFilterRule
} from '../types';

export const INITIAL_WHATSAPP_GROUPS: WhatsAppGroup[] = [
  {
    id: 'grp_vip_invest_01',
    name: '💎 VIP Alpha Investidores & DayTrade #01',
    jid: '120363198273619283@g.us',
    description: 'Sala de Sinais e Recomendações diárias com os analistas certificados. Proibido spam ou links externos.',
    avatarUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
    inviteLink: 'https://chat.whatsapp.com/K8s9xL2019aZ',
    smartRotatorId: 'rotator_invest_01',
    category: 'vip_monetized',
    status: 'active',
    memberCount: 894,
    maxMembers: 1024,
    isAdmin: true,
    isVipMonetized: true,
    pricing: {
      price: 197.00,
      currency: 'BRL',
      billingCycle: 'monthly',
      checkoutUrl: 'https://pay.manyflow.io/vip-alpha-197',
      pixKey: 'financeiro@manyflow.io',
      benefits: [
        '📈 Relatórios diários pré-market às 08h30',
        '⚡ Sinais em tempo real no mini-índice e dólar',
        '🎙️ Calls de fechamento no Google Meet',
        '🤝 Networking exclusivo com grandes players'
      ]
    },
    autoManagement: {
      antiLink: true,
      antiLinkAction: 'kick_member',
      antiSpam: true,
      antiPorn: true,
      antiForeignNumbers: true,
      autoWelcome: true,
      welcomeMessage: '👋 Seja muito bem-vindo(a) ao *VIP Alpha*, @membro! Seu acesso está validado com sucesso. Leia as regras fixadas na descrição!',
      autoMuteSchedule: {
        enabled: true,
        muteTime: '22:00',
        unmuteTime: '07:30'
      },
      autoKickExpiredVip: true,
      smartLinkRotation: true,
      sendDailyDigest: true
    },
    stats: {
      totalJoined: 1420,
      totalLeft: 86,
      currentMembers: 894,
      dailyJoinsHistory: [
        { date: '24/08', count: 42, leftCount: 2 },
        { date: '25/08', count: 58, leftCount: 3 },
        { date: '26/08', count: 65, leftCount: 1 },
        { date: '27/08', count: 71, leftCount: 4 },
        { date: '28/08', count: 89, leftCount: 2 },
        { date: '29/08', count: 94, leftCount: 5 },
        { date: '30/08', count: 112, leftCount: 3 }
      ],
      messagesCount24h: 840,
      activeMembersPercent: 78.4,
      churnRate: 3.2,
      revenueTotal: 176118.00,
      activeSubscribers: 894,
      expiringIn7Days: 48
    },
    engine: 'hybrid',
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-08-30T14:30:00Z'
  },
  {
    id: 'grp_vip_invest_02',
    name: '💎 VIP Alpha Investidores & DayTrade #02',
    jid: '120363283746192847@g.us',
    description: 'Sala 02 de Transbordo Automático. Mesmas recomendações e sinais ao vivo.',
    avatarUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
    inviteLink: 'https://chat.whatsapp.com/J28xkL9102bY',
    smartRotatorId: 'rotator_invest_01',
    category: 'vip_monetized',
    status: 'active',
    memberCount: 340,
    maxMembers: 1024,
    isAdmin: true,
    isVipMonetized: true,
    pricing: {
      price: 197.00,
      currency: 'BRL',
      billingCycle: 'monthly',
      checkoutUrl: 'https://pay.manyflow.io/vip-alpha-197',
      pixKey: 'financeiro@manyflow.io',
      benefits: ['Acesso idêntico ao grupo 01']
    },
    autoManagement: {
      antiLink: true,
      antiLinkAction: 'kick_member',
      antiSpam: true,
      antiPorn: true,
      antiForeignNumbers: true,
      autoWelcome: true,
      welcomeMessage: '🚀 Bem-vindo à Sala VIP 02 @membro!',
      autoMuteSchedule: {
        enabled: true,
        muteTime: '22:00',
        unmuteTime: '07:30'
      },
      autoKickExpiredVip: true,
      smartLinkRotation: true,
      sendDailyDigest: true
    },
    stats: {
      totalJoined: 360,
      totalLeft: 20,
      currentMembers: 340,
      dailyJoinsHistory: [
        { date: '24/08', count: 18, leftCount: 1 },
        { date: '25/08', count: 24, leftCount: 0 },
        { date: '26/08', count: 32, leftCount: 2 },
        { date: '27/08', count: 45, leftCount: 1 },
        { date: '28/08', count: 62, leftCount: 3 },
        { date: '29/08', count: 78, leftCount: 2 },
        { date: '30/08', count: 81, leftCount: 1 }
      ],
      messagesCount24h: 310,
      activeMembersPercent: 82.1,
      churnRate: 2.8,
      revenueTotal: 66980.00,
      activeSubscribers: 340,
      expiringIn7Days: 14
    },
    engine: 'hybrid',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-30T15:00:00Z'
  },
  {
    id: 'grp_launch_mentoria_01',
    name: '🔥 Lançamento Black: Mentoria Escala 100k #01 (LOTADO)',
    jid: '120363948372615243@g.us',
    description: 'Grupo silencioso exclusivo para avisos e links de aulas ao vivo do lançamento.',
    avatarUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
    inviteLink: 'https://chat.whatsapp.com/M92kL10294cA',
    category: 'launch_funnel',
    status: 'full',
    memberCount: 1024,
    maxMembers: 1024,
    isAdmin: true,
    isVipMonetized: false,
    autoManagement: {
      antiLink: true,
      antiLinkAction: 'kick_member',
      antiSpam: true,
      antiPorn: true,
      antiForeignNumbers: false,
      autoWelcome: false,
      welcomeMessage: '',
      autoMuteSchedule: {
        enabled: true,
        muteTime: '00:00',
        unmuteTime: '23:59' // apenas admins enviam
      },
      autoKickExpiredVip: false,
      smartLinkRotation: true,
      sendDailyDigest: false
    },
    stats: {
      totalJoined: 1080,
      totalLeft: 56,
      currentMembers: 1024,
      dailyJoinsHistory: [
        { date: '24/08', count: 120, leftCount: 5 },
        { date: '25/08', count: 140, leftCount: 8 },
        { date: '26/08', count: 190, leftCount: 12 },
        { date: '27/08', count: 210, leftCount: 6 },
        { date: '28/08', count: 180, leftCount: 9 },
        { date: '29/08', count: 110, leftCount: 4 },
        { date: '30/08', count: 74, leftCount: 12 }
      ],
      messagesCount24h: 12,
      activeMembersPercent: 94.2,
      churnRate: 5.1,
      revenueTotal: 0,
      activeSubscribers: 0,
      expiringIn7Days: 0
    },
    engine: 'baileys_unofficial',
    createdAt: '2026-08-15T12:00:00Z',
    updatedAt: '2026-08-30T12:00:00Z'
  },
  {
    id: 'grp_launch_mentoria_02',
    name: '🔥 Lançamento Black: Mentoria Escala 100k #02 (ABERTO)',
    jid: '120363948372615299@g.us',
    description: 'Sala 02 de avisos e links de aulas ao vivo do lançamento.',
    avatarUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
    inviteLink: 'https://chat.whatsapp.com/X82kL90184dZ',
    category: 'launch_funnel',
    status: 'active',
    memberCount: 612,
    maxMembers: 1024,
    isAdmin: true,
    isVipMonetized: false,
    autoManagement: {
      antiLink: true,
      antiLinkAction: 'kick_member',
      antiSpam: true,
      antiPorn: true,
      antiForeignNumbers: false,
      autoWelcome: false,
      welcomeMessage: '',
      autoMuteSchedule: {
        enabled: true,
        muteTime: '00:00',
        unmuteTime: '23:59'
      },
      autoKickExpiredVip: false,
      smartLinkRotation: true,
      sendDailyDigest: false
    },
    stats: {
      totalJoined: 630,
      totalLeft: 18,
      currentMembers: 612,
      dailyJoinsHistory: [
        { date: '24/08', count: 0, leftCount: 0 },
        { date: '25/08', count: 0, leftCount: 0 },
        { date: '26/08', count: 0, leftCount: 0 },
        { date: '27/08', count: 90, leftCount: 2 },
        { date: '28/08', count: 180, leftCount: 6 },
        { date: '29/08', count: 210, leftCount: 5 },
        { date: '30/08', count: 132, leftCount: 5 }
      ],
      messagesCount24h: 8,
      activeMembersPercent: 91.0,
      churnRate: 2.8,
      revenueTotal: 0,
      activeSubscribers: 0,
      expiringIn7Days: 0
    },
    engine: 'baileys_unofficial',
    createdAt: '2026-08-27T14:00:00Z',
    updatedAt: '2026-08-30T15:10:00Z'
  },
  {
    id: 'grp_community_free',
    name: '💬 Comunidade Aberta: Tráfego & IA',
    jid: '120363112233445566@g.us',
    description: 'Troca de experiências, dúvidas e novidades do mercado. Respeite os membros.',
    avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    inviteLink: 'https://chat.whatsapp.com/P40kL81920eC',
    category: 'community',
    status: 'active',
    memberCount: 780,
    maxMembers: 1024,
    isAdmin: true,
    isVipMonetized: false,
    autoManagement: {
      antiLink: true,
      antiLinkAction: 'warn',
      antiSpam: true,
      antiPorn: true,
      antiForeignNumbers: false,
      autoWelcome: true,
      welcomeMessage: '🎉 Bem-vindo à Comunidade, @membro! Apresente-se e diga qual seu nicho.',
      autoMuteSchedule: {
        enabled: true,
        muteTime: '23:00',
        unmuteTime: '08:00'
      },
      autoKickExpiredVip: false,
      smartLinkRotation: false,
      sendDailyDigest: true
    },
    stats: {
      totalJoined: 920,
      totalLeft: 140,
      currentMembers: 780,
      dailyJoinsHistory: [
        { date: '24/08', count: 15, leftCount: 4 },
        { date: '25/08', count: 22, leftCount: 6 },
        { date: '26/08', count: 18, leftCount: 3 },
        { date: '27/08', count: 30, leftCount: 5 },
        { date: '28/08', count: 28, leftCount: 7 },
        { date: '29/08', count: 35, leftCount: 4 },
        { date: '30/08', count: 40, leftCount: 8 }
      ],
      messagesCount24h: 1420,
      activeMembersPercent: 64.5,
      churnRate: 8.2,
      revenueTotal: 0,
      activeSubscribers: 0,
      expiringIn7Days: 0
    },
    engine: 'baileys_unofficial',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-08-30T15:15:00Z'
  }
];

export const INITIAL_SMART_ROTATORS: SmartLinkRotator[] = [
  {
    id: 'rotator_invest_01',
    title: 'Rotacionador VIP Alpha (Tráfego Pago Meta Ads)',
    slug: 'vip-alpha-oficial',
    description: 'Redireciona leads de anúncios automaticamente para o Grupo 1 (se < 980 membros) ou Grupo 2 (se Grupo 1 lotar).',
    targetGroupJids: ['120363198273619283@g.us', '120363283746192847@g.us'],
    maxMembersPerGroup: 980,
    totalClicks: 3840,
    totalConversions: 1234,
    conversionRate: 32.1,
    isActive: true,
    redirectMode: 'least_filled',
    createdAt: '2026-06-10T10:00:00Z'
  },
  {
    id: 'rotator_launch_01',
    title: 'Rotacionador Aulas Gratuitas (Lançamento)',
    slug: 'mentoria-escala-black',
    description: 'Enche o Grupo 01 até 1020 membros e pula para o Grupo 02 sem perder nenhum lead de anúncio.',
    targetGroupJids: ['120363948372615243@g.us', '120363948372615299@g.us'],
    maxMembersPerGroup: 1020,
    totalClicks: 8920,
    totalConversions: 1636,
    conversionRate: 18.3,
    isActive: true,
    redirectMode: 'sequential',
    createdAt: '2026-08-15T12:00:00Z'
  }
];

export const INITIAL_GROUP_SUBSCRIBERS: GroupSubscriber[] = [
  {
    id: 'sub_01',
    name: 'Rodrigo Mendonça',
    phone: '+55 11 98765-4321',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    groupJid: '120363198273619283@g.us',
    groupName: '💎 VIP Alpha Investidores & DayTrade #01',
    status: 'active',
    plan: 'Mensal VIP',
    amountPaid: 197.00,
    paymentMethod: 'pix',
    joinedAt: '2026-08-10T14:20:00Z',
    expiresAt: '2026-09-10T14:20:00Z',
    lastPaymentAt: '2026-08-10T14:20:00Z',
    autoRenew: true
  },
  {
    id: 'sub_02',
    name: 'Camila Albuquerque',
    phone: '+55 21 97654-3210',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    groupJid: '120363198273619283@g.us',
    groupName: '💎 VIP Alpha Investidores & DayTrade #01',
    status: 'active',
    plan: 'Anual VIP',
    amountPaid: 1780.00,
    paymentMethod: 'credit_card',
    joinedAt: '2026-03-15T09:00:00Z',
    expiresAt: '2027-03-15T09:00:00Z',
    lastPaymentAt: '2026-03-15T09:00:00Z',
    autoRenew: true
  },
  {
    id: 'sub_03',
    name: 'Felipe Santana',
    phone: '+55 31 99123-8877',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    groupJid: '120363198273619283@g.us',
    groupName: '💎 VIP Alpha Investidores & DayTrade #01',
    status: 'expiring_soon',
    plan: 'Mensal VIP',
    amountPaid: 197.00,
    paymentMethod: 'pix',
    joinedAt: '2026-08-02T11:30:00Z',
    expiresAt: '2026-09-02T11:30:00Z', // Vence em 3 dias
    lastPaymentAt: '2026-08-02T11:30:00Z',
    autoRenew: false,
    notes: 'Aviso de renovação D-3 enviado via WhatsApp.'
  },
  {
    id: 'sub_04',
    name: 'Guilherme Siqueira',
    phone: '+55 41 98822-1144',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    groupJid: '120363283746192847@g.us',
    groupName: '💎 VIP Alpha Investidores & DayTrade #02',
    status: 'expired',
    plan: 'Mensal VIP',
    amountPaid: 197.00,
    paymentMethod: 'pix',
    joinedAt: '2026-07-25T16:00:00Z',
    expiresAt: '2026-08-25T16:00:00Z', // Venceu
    lastPaymentAt: '2026-07-25T16:00:00Z',
    autoRenew: false,
    notes: 'Kick automático agendado pelo Baileys Engine.'
  },
  {
    id: 'sub_05',
    name: 'Juliana Barros',
    phone: '+55 19 99345-6789',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    groupJid: '120363283746192847@g.us',
    groupName: '💎 VIP Alpha Investidores & DayTrade #02',
    status: 'active',
    plan: 'Trimestral',
    amountPaid: 497.00,
    paymentMethod: 'pix',
    joinedAt: '2026-08-15T18:00:00Z',
    expiresAt: '2026-11-15T18:00:00Z',
    lastPaymentAt: '2026-08-15T18:00:00Z',
    autoRenew: true
  }
];

export const INITIAL_HYBRID_ENGINE_STATUS: HybridWhatsAppEngineStatus = {
  cloudApi: {
    isConnected: true,
    phoneNumberId: '109283746192837',
    wabaId: '394827162534120',
    webhookUrl: 'https://app.manyflow.io/api/webhooks/whatsapp/cloud-api',
    verifiedName: 'ManyFlow Tecnologia & Automação',
    tier: 'TIER_100K',
    qualityRating: 'GREEN'
  },
  baileys: {
    isConnected: true,
    sessionId: 'session_manyflow_master_prod',
    connectedNumber: '+55 11 94002-8922',
    pushName: 'Admin Master Grupos (Baileys v6.7.8)',
    batteryLevel: 98,
    platform: 'multi-device-baileys-v6.7',
    groupsCount: 14,
    lastPing: new Date().toISOString(),
    socketUptimeSeconds: 148290,
    reconnectCount: 1,
    pendingQueueCount: 3,
    heapMemoryMb: 68.4,
    circuitBreakerOpen: false
  }
};

export const INITIAL_BAILEYS_QUEUE: BaileysQueueItem[] = [
  {
    id: 'queue_01',
    targetGroupJid: '120363198273619283@g.us',
    groupName: '💎 VIP Alpha Investidores & DayTrade #01',
    messageType: 'text',
    previewContent: '🚨 *RELATÓRIO PRÉ-MARKET*: Índice futuro abrindo com gap de +0.8%. Alvos de resistência em 134.500.',
    mentionAll: true,
    antiBanDelaySec: 4.5,
    scheduledAt: '2026-08-30T15:35:00Z',
    dispatchedAt: '2026-08-30T15:35:04Z',
    status: 'sending',
    ackStatus: 'SERVER_ACK',
    retryCount: 0,
    latencyMs: 142
  },
  {
    id: 'queue_02',
    targetGroupJid: '120363283746192847@g.us',
    groupName: '💎 VIP Alpha Investidores & DayTrade #02',
    messageType: 'text',
    previewContent: '🚨 *RELATÓRIO PRÉ-MARKET*: Índice futuro abrindo com gap de +0.8%. Alvos de resistência em 134.500.',
    mentionAll: true,
    antiBanDelaySec: 6.2,
    scheduledAt: '2026-08-30T15:35:10Z',
    status: 'queued',
    ackStatus: 'PENDING',
    retryCount: 0
  },
  {
    id: 'queue_03',
    targetGroupJid: '120363948372615299@g.us',
    groupName: '🔥 Lançamento Black: Mentoria Escala 100k #02',
    messageType: 'image',
    previewContent: '🖼️ [Banner Promocional] Aula 02 Liberada: A anatomia dos funis de 7 dígitos.',
    mentionAll: false,
    antiBanDelaySec: 8.0,
    scheduledAt: '2026-08-30T15:35:30Z',
    status: 'queued',
    ackStatus: 'PENDING',
    retryCount: 0
  },
  {
    id: 'queue_04',
    targetGroupJid: '120363948372615243@g.us',
    groupName: '🔥 Lançamento Black: Mentoria Escala 100k #01 (LOTADO)',
    messageType: 'mute_chat',
    previewContent: '🔒 [Ação de Sistema] Grupo silenciado automaticamente (horário programado 22h).',
    mentionAll: false,
    antiBanDelaySec: 3.0,
    scheduledAt: '2026-08-30T15:20:00Z',
    dispatchedAt: '2026-08-30T15:20:03Z',
    status: 'delivered',
    ackStatus: 'READ_ACK',
    retryCount: 0,
    latencyMs: 98
  },
  {
    id: 'queue_05',
    targetGroupJid: '120363283746192847@g.us',
    groupName: '💎 VIP Alpha Investidores & DayTrade #02',
    messageType: 'kick_member',
    previewContent: '👢 [Auto-Kick Baileys] Expulsão do membro Guilherme Siqueira (Assinatura VIP Expirada).',
    mentionAll: false,
    antiBanDelaySec: 2.5,
    scheduledAt: '2026-08-30T15:10:00Z',
    dispatchedAt: '2026-08-30T15:10:02Z',
    status: 'delivered',
    ackStatus: 'DEVICE_ACK',
    retryCount: 0,
    latencyMs: 115
  },
  {
    id: 'queue_06',
    targetGroupJid: '120363198273619283@g.us',
    groupName: '💎 VIP Alpha Investidores & DayTrade #01',
    messageType: 'audio_ptt',
    previewContent: '🎙️ [Áudio PTT Gravado 0:42s] Análise de fechamento do trader head.',
    mentionAll: true,
    antiBanDelaySec: 7.5,
    scheduledAt: '2026-08-30T14:45:00Z',
    dispatchedAt: '2026-08-30T14:45:08Z',
    status: 'delivered',
    ackStatus: 'READ_ACK',
    retryCount: 0,
    latencyMs: 230
  }
];

export const INITIAL_BAILEYS_GROUP_STATUSES: BaileysGroupSyncStatus[] = [
  {
    groupJid: '120363198273619283@g.us',
    groupName: '💎 VIP Alpha Investidores & DayTrade #01',
    category: 'vip_monetized',
    connectionState: 'synced',
    memberCount: 894,
    role: 'superadmin',
    announceOnly: false,
    lastSyncTimestamp: '2026-08-30T15:34:50Z',
    pingMs: 82,
    deliveryRatePercent: 99.8,
    queuedMessagesCount: 1,
    antiLinkActive: true,
    antiSpamActive: true
  },
  {
    groupJid: '120363283746192847@g.us',
    groupName: '💎 VIP Alpha Investidores & DayTrade #02',
    category: 'vip_monetized',
    connectionState: 'synced',
    memberCount: 340,
    role: 'superadmin',
    announceOnly: false,
    lastSyncTimestamp: '2026-08-30T15:34:42Z',
    pingMs: 94,
    deliveryRatePercent: 99.4,
    queuedMessagesCount: 1,
    antiLinkActive: true,
    antiSpamActive: true
  },
  {
    groupJid: '120363948372615243@g.us',
    groupName: '🔥 Lançamento Black: Mentoria Escala 100k #01 (LOTADO)',
    category: 'launch_funnel',
    connectionState: 'synced',
    memberCount: 1024,
    role: 'admin',
    announceOnly: true,
    lastSyncTimestamp: '2026-08-30T15:33:10Z',
    pingMs: 110,
    deliveryRatePercent: 98.9,
    queuedMessagesCount: 0,
    antiLinkActive: true,
    antiSpamActive: true
  },
  {
    groupJid: '120363948372615299@g.us',
    groupName: '🔥 Lançamento Black: Mentoria Escala 100k #02',
    category: 'launch_funnel',
    connectionState: 'synced',
    memberCount: 612,
    role: 'admin',
    announceOnly: true,
    lastSyncTimestamp: '2026-08-30T15:34:02Z',
    pingMs: 105,
    deliveryRatePercent: 99.1,
    queuedMessagesCount: 1,
    antiLinkActive: true,
    antiSpamActive: true
  }
];

export const INITIAL_BAILEYS_LOGS: BaileysEventLog[] = [
  {
    id: 'log_01',
    timestamp: '15:35:04',
    event: 'messages.upsert (outbox)',
    level: 'info',
    details: 'Despachado texto com @todos para 120363198273619283@g.us com delay 4.5s (Anti-Ban OK)',
    groupJid: '120363198273619283@g.us'
  },
  {
    id: 'log_02',
    timestamp: '15:34:50',
    event: 'group-metadata.refresh',
    level: 'success',
    details: 'Metadados de participantes atualizados para 4 grupos (3.870 participantes indexados)',
  },
  {
    id: 'log_03',
    timestamp: '15:32:15',
    event: 'group-participants.update',
    level: 'warn',
    details: 'Detectado link de terceiro postado por +55 81 99887-2211 em Sala 01. Ação Anti-Link: Mensagem deletada e membro banido.',
    groupJid: '120363198273619283@g.us'
  },
  {
    id: 'log_04',
    timestamp: '15:30:00',
    event: 'connection.update',
    level: 'success',
    details: 'Socket Baileys multi-device ativo. Handshake Noise protocol verificado. Latência: 82ms.',
  },
  {
    id: 'log_05',
    timestamp: '15:20:03',
    event: 'group.update (mute)',
    level: 'info',
    details: 'Grupo "Mentoria Escala 100k #01" alterado para Somente Administradores (announce: true)',
    groupJid: '120363948372615243@g.us'
  }
];

export const INITIAL_TELEGRAM_CONFIG: TelegramBotConfig = {
  botToken: '7192837461:AAH82kL90184dZM92kL10294cAK8s9xL2',
  botUsername: '@ManyFlowBot',
  isConnected: true,
  webhookUrl: 'https://app.manyflow.io/api/webhooks/telegram',
  allowedUpdates: ['message', 'callback_query', 'chat_member'],
  activeChatsCount: 642
};

export const INITIAL_KEYWORD_RULES: KeywordModerationRule[] = [
  {
    id: 'kw_01',
    phrase: 'urubu do pix',
    matchType: 'contains',
    severity: 'high',
    action: 'kick_and_blacklist',
    enabled: true,
    category: 'scam_crypto'
  },
  {
    id: 'kw_02',
    phrase: 'renda extra sem sair de casa',
    matchType: 'contains',
    severity: 'high',
    action: 'kick_and_blacklist',
    enabled: true,
    category: 'scam_crypto'
  },
  {
    id: 'kw_03',
    phrase: 'robô do pix',
    matchType: 'contains',
    severity: 'high',
    action: 'kick_and_blacklist',
    enabled: true,
    category: 'scam_crypto'
  },
  {
    id: 'kw_04',
    phrase: 'compre seguidores instagram',
    matchType: 'contains',
    severity: 'medium',
    action: 'warn_and_delete',
    enabled: true,
    category: 'scam_crypto'
  },
  {
    id: 'kw_05',
    phrase: 'grupo vip telegram',
    matchType: 'contains',
    severity: 'high',
    action: 'warn_and_delete',
    enabled: true,
    category: 'external_groups'
  },
  {
    id: 'kw_06',
    phrase: 't.me/joinchat',
    matchType: 'contains',
    severity: 'high',
    action: 'instant_kick',
    enabled: true,
    category: 'external_groups'
  },
  {
    id: 'kw_07',
    phrase: 'vagas home office r$',
    matchType: 'contains',
    severity: 'medium',
    action: 'warn_and_delete',
    enabled: true,
    category: 'scam_crypto'
  },
  {
    id: 'kw_08',
    phrase: 'aposta certa 100% green',
    matchType: 'contains',
    severity: 'high',
    action: 'kick_and_blacklist',
    enabled: true,
    category: 'scam_crypto'
  }
];

export const INITIAL_DOMAIN_RULES: DomainFilterRule[] = [
  {
    id: 'dom_01',
    domainOrPattern: 'chat.whatsapp.com',
    type: 'blacklist',
    description: 'Links de outros grupos do WhatsApp (Prevenção de roubo de leads)',
    enabled: true,
    actionIfBlacklisted: 'instant_kick'
  },
  {
    id: 'dom_02',
    domainOrPattern: 't.me',
    type: 'blacklist',
    description: 'Canais e grupos do Telegram',
    enabled: true,
    actionIfBlacklisted: 'instant_kick'
  },
  {
    id: 'dom_03',
    domainOrPattern: 'bit.ly',
    type: 'blacklist',
    description: 'Encurtadores anônimos de URLs suspeitas',
    enabled: true,
    actionIfBlacklisted: 'warn_and_delete'
  },
  {
    id: 'dom_04',
    domainOrPattern: 'cutt.ly',
    type: 'blacklist',
    description: 'Encurtador de links Cutt.ly',
    enabled: true,
    actionIfBlacklisted: 'warn_and_delete'
  },
  {
    id: 'dom_05',
    domainOrPattern: 'hotmart.com',
    type: 'whitelist',
    description: 'Domínio oficial de checkout seguro Hotmart',
    enabled: true,
    actionIfBlacklisted: 'delete_only'
  },
  {
    id: 'dom_06',
    domainOrPattern: 'kiwify.com.br',
    type: 'whitelist',
    description: 'Plataforma oficial de pagamentos Kiwify',
    enabled: true,
    actionIfBlacklisted: 'delete_only'
  },
  {
    id: 'dom_07',
    domainOrPattern: 'youtube.com',
    type: 'whitelist',
    description: 'Aulas e transmissões no YouTube',
    enabled: true,
    actionIfBlacklisted: 'delete_only'
  },
  {
    id: 'dom_08',
    domainOrPattern: 'manyflow.io',
    type: 'whitelist',
    description: 'Domínio da plataforma e rotadores ManyFlow',
    enabled: true,
    actionIfBlacklisted: 'delete_only'
  }
];

export const INITIAL_MODERATION_CONFIG: AutoModerationConfig = {
  id: 'mod_config_global',
  name: 'Escudo Global Anti-Spam & Moderação Baileys',
  enabled: true,
  keywordFilter: {
    enabled: true,
    sensitivity: 'high',
    customKeywords: INITIAL_KEYWORD_RULES,
    presetPacks: {
      antiScamCrypto: true,
      antiAdultContent: true,
      antiExternalGroupInvites: true,
      antiAggressiveProfanity: true
    },
    defaultAction: 'warn_and_delete'
  },
  linkBlocker: {
    enabled: true,
    mode: 'block_all_except_whitelist',
    allowAdminsToSendLinks: true,
    allowMediaWithCaptionLinks: false,
    domains: INITIAL_DOMAIN_RULES,
    action: 'instant_kick',
    strikeLimitBeforeKick: 1
  },
  spamBehavior: {
    enabled: true,
    maxMessagesWindow: 4,
    windowSeconds: 5,
    blockDuplicateConsecutiveMsgs: true,
    duplicateThreshold: 2,
    blockForeignPhoneNumbers: true,
    allowedCountryCodes: ['+55', '+351', '+1'],
    blockMassMentions: true,
    blockContactCardsAndInvites: true,
    actionOnViolation: 'instant_kick',
    strikeLimit: 3,
    autoBlacklistOnKick: true
  },
  strikeSystem: {
    enabled: true,
    maxStrikes: 3,
    strikeExpirationHours: 24,
    sendPublicWarningInGroup: true,
    sendPrivateWarningDm: true,
    warningMessageTemplate: '⚠️ @membro Atenção: A sua mensagem infringiu as regras da comunidade ({motivo}). Você recebeu o aviso {strike}/{maxStrikes}.',
    kickMessageTemplate: '🚫 @membro foi removido automaticamente do grupo por atingir o limite de infrações anti-spam.'
  },
  stats: {
    messagesScanned: 248920,
    linksBlocked: 142,
    keywordsFiltered: 87,
    spamFloodsStopped: 34,
    membersKicked: 19,
    membersWarned: 48
  }
};

export const INITIAL_MODERATION_INCIDENTS: ModerationIncident[] = [
  {
    id: 'inc_01',
    timestamp: '2026-08-30T15:32:15Z',
    groupJid: '120363198273619283@g.us',
    groupName: '💎 VIP Alpha Investidores #01',
    memberPhone: '+55 81 99887-2211',
    memberName: 'Lucas Sampaio (Lead)',
    triggerType: 'link_blocker',
    triggerDetail: 'Link proibido de convite Telegram detectado: t.me/sinais_gratuitos_vip',
    originalMessage: 'Galera entrem no grupo vip gratuito de sinais aqui t.me/sinais_gratuitos_vip lucrando 500 reais por dia',
    actionTaken: 'member_kicked',
    strikeCount: 1,
    maxStrikes: 1,
    status: 'active',
    canRevert: true
  },
  {
    id: 'inc_02',
    timestamp: '2026-08-30T15:18:40Z',
    groupJid: '120363948372615243@g.us',
    groupName: '🔥 Lançamento Black #01',
    memberPhone: '+1 202 555-0192',
    memberName: 'WhatsApp Bot US',
    triggerType: 'foreign_prefix',
    triggerDetail: 'Número estrangeiro não autorizado (+1) em grupo restrito a +55 (Brasil)',
    originalMessage: 'Hello check my bio for cheap followers and crypto investment',
    actionTaken: 'member_blacklisted',
    strikeCount: 1,
    maxStrikes: 1,
    status: 'banned_permanently',
    canRevert: false
  },
  {
    id: 'inc_03',
    timestamp: '2026-08-30T14:45:10Z',
    groupJid: '120363198273619283@g.us',
    groupName: '💎 VIP Alpha Investidores #01',
    memberPhone: '+55 11 97766-4433',
    memberName: 'Rodrigo M.',
    triggerType: 'keyword_violation',
    triggerDetail: 'Palavra-chave restrita de golpe detectada: "urubu do pix"',
    originalMessage: 'Quem quer participar do urubu do pix manda 50 volta 500 no pix na hora',
    actionTaken: 'member_kicked',
    strikeCount: 1,
    maxStrikes: 1,
    status: 'banned_permanently',
    canRevert: false
  },
  {
    id: 'inc_04',
    timestamp: '2026-08-30T13:20:00Z',
    groupJid: '120363198273619299@g.us',
    groupName: '💎 VIP Alpha Investidores #02',
    memberPhone: '+55 47 98833-1122',
    memberName: 'Gabriel Nunes',
    triggerType: 'flood_spam',
    triggerDetail: 'Flood: 5 mensagens idênticas enviadas em menos de 3 segundos',
    originalMessage: 'VENDO CONTA COM 100K SEGUIDORES CHAMA NO PV',
    actionTaken: 'member_warned',
    strikeCount: 2,
    maxStrikes: 3,
    status: 'active',
    canRevert: true
  },
  {
    id: 'inc_05',
    timestamp: '2026-08-30T11:05:22Z',
    groupJid: '120363948372615299@g.us',
    groupName: '🔥 Lançamento Black #02',
    memberPhone: '+55 31 99122-3344',
    memberName: 'Marcos Vinicius',
    triggerType: 'link_blocker',
    triggerDetail: 'Link encurtado não autorizado (bit.ly/desconto-maluco)',
    originalMessage: 'Clica aqui no link pra ver a promoção bit.ly/desconto-maluco',
    actionTaken: 'message_deleted',
    strikeCount: 1,
    maxStrikes: 3,
    status: 'active',
    canRevert: true
  }
];

export const INITIAL_BLACKLISTED_MEMBERS: BlacklistedMember[] = [
  {
    id: 'blk_01',
    phone: '+55 81 99887-2211',
    name: 'Lucas Sampaio (Lead)',
    reason: 'Divulgação recorrente de links de grupos concorrentes Telegram',
    category: 'spammer',
    blockedAt: '2026-08-30 15:32',
    blockedBy: 'Auto-Moderação Baileys Shield',
    autoKickOnJoin: true,
    totalAttemptsBlocked: 4
  },
  {
    id: 'blk_02',
    phone: '+1 202 555-0192',
    name: 'WhatsApp Bot US',
    reason: 'Bot de spam internacional e phishing de cartões',
    category: 'phishing',
    blockedAt: '2026-08-30 15:18',
    blockedBy: 'Filtro de DDI Estrangeiro',
    autoKickOnJoin: true,
    totalAttemptsBlocked: 12
  },
  {
    id: 'blk_03',
    phone: '+55 11 97766-4433',
    name: 'Rodrigo M.',
    reason: 'Tentativa de golpe de falso Pix no grupo VIP',
    category: 'bad_actor',
    blockedAt: '2026-08-30 14:45',
    blockedBy: 'Filtro de Palavras-Chave',
    autoKickOnJoin: true,
    totalAttemptsBlocked: 2
  }
];

