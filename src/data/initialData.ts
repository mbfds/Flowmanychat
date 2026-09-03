import { Flow, KeywordTrigger, PostCommentGrowthTool, Contact, LiveConversation, BotKnowledgeBase, MetaConnectionConfig, CustomFieldDefinition, BroadcastCampaign, UtilityMessageTemplate, ConnectedMetaAccount, MetaPostItem, FacebookApp, Appointment, ChannelBookingConfig, AppointmentService } from '../types';
import { FLOW_TEMPLATES } from './flowTemplates';

export const DEMO_FLOWS: Flow[] = [
  ...FLOW_TEMPLATES.map(t => ({
    ...t.flow,
    stats: { runs: 0, completed: 0, ctr: 0 }
  })),
  {
    id: "flow_appointment_booking",
    title: "📅 Agendamento de Horário & Reunião VIP (Omnichannel)",
    description: "Fluxo pré-definido e ativo em todos os canais (Instagram Direct, WhatsApp, Facebook Messenger, Telegram e Webchat) para agendamento automático de reuniões, consultas ou demonstrações.",
    channel: "omnichannel",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { runs: 0, completed: 0, ctr: 0 },
    nodes: [
      {
        id: "node_ap_trig",
        type: "trigger",
        title: "Gatilho: Palavra-Chave 'Agendamento'",
        data: {
          triggerType: "keyword",
          keywords: ["AGENDAR", "AGENDAMENTO", "MARCAR", "MARCAR HORÁRIO", "REUNIÃO", "CONSULTA", "DEMO", "DEMONSTRAÇÃO", "HORÁRIOS", "RESERVA", "CALENDÁRIO", "BOOKING", "SCHEDULE", "AGENDA", "HORÁRIO"]
        },
        position: { x: 50, y: 150 }
      },
      {
        id: "node_ap_welcome",
        type: "message",
        title: "Escolha do Tipo de Atendimento",
        data: {
          text: "Olá! 📅 Que excelente notícia que você deseja agendar um horário conosco!\n\nNossa agenda inteligente está integrada e ativa em todos os nossos canais. Qual tipo de agendamento melhor atende seu objetivo hoje?",
          buttons: [
            { id: "btn_ap_demo", text: "🎯 Demonstração ManyFlow (30 min)", type: "flow", targetNodeId: "node_ap_slots", assignTag: "Agendamento-Demo" },
            { id: "btn_ap_consult", text: "💼 Consultoria Especializada (45 min)", type: "flow", targetNodeId: "node_ap_slots", assignTag: "Agendamento-Consultoria" },
            { id: "btn_ap_support", text: "🎧 Atendimento com Especialista (30 min)", type: "flow", targetNodeId: "node_ap_slots", assignTag: "Agendamento-Suporte" }
          ],
          quickReplies: [
            { id: "qr_ap_demo", text: "🎯 Demonstração (30m)", targetNodeId: "node_ap_slots", assignTag: "Agendamento-Demo" },
            { id: "qr_ap_consult", text: "💼 Consultoria (45m)", targetNodeId: "node_ap_slots", assignTag: "Agendamento-Consultoria" }
          ]
        },
        position: { x: 420, y: 150 }
      },
      {
        id: "node_ap_slots",
        type: "message",
        title: "Seleção de Data & Horário Disponível",
        data: {
          text: "Perfeito! Nossos próximos horários disponíveis esta semana são:\n\n1️⃣ **Amanhã às 10:00** (Horário de Brasília)\n2️⃣ **Amanhã às 15:30** (Horário de Brasília)\n3️⃣ **Quinta-feira às 14:00** (Horário de Brasília)\n\nSelecione uma das opções abaixo para reservar sua vaga instantaneamente:",
          buttons: [
            { id: "btn_slot_1", text: "🕒 Amanhã às 10:00", type: "flow", targetNodeId: "node_ap_confirm_action", assignTag: "Slot-Amanha-10h" },
            { id: "btn_slot_2", text: "🕒 Amanhã às 15:30", type: "flow", targetNodeId: "node_ap_confirm_action", assignTag: "Slot-Amanha-15h30" },
            { id: "btn_slot_3", text: "🕒 Quinta às 14:00", type: "flow", targetNodeId: "node_ap_confirm_action", assignTag: "Slot-Quinta-14h" }
          ],
          quickReplies: [
            { id: "qr_slot_1", text: "Amanhã às 10:00", targetNodeId: "node_ap_confirm_action", assignTag: "Slot-Amanha-10h" },
            { id: "qr_slot_2", text: "Amanhã às 15:30", targetNodeId: "node_ap_confirm_action", assignTag: "Slot-Amanha-15h30" },
            { id: "qr_slot_3", text: "Quinta às 14:00", targetNodeId: "node_ap_confirm_action", assignTag: "Slot-Quinta-14h" }
          ]
        },
        position: { x: 800, y: 150 }
      },
      {
        id: "node_ap_confirm_action",
        type: "action",
        title: "Ação: Gravar Agendamento no CRM & Sincronizar",
        data: {
          actionType: "add_tag",
          tagToAdd: "Agendamento-Confirmado",
          fieldToSet: "status_agendamento",
          fieldValue: "Confirmado - Notificação Enviada"
        },
        position: { x: 1180, y: 150 }
      },
      {
        id: "node_ap_success_msg",
        type: "message",
        title: "Confirmação & Sincronização Google Calendar",
        data: {
          text: "✅ **Agendamento Confirmado com Sucesso!**\n\n📅 **Data:** Amanhã\n⏰ **Horário:** 10:00 (Horário de Brasília)\n📍 **Canal:** Google Meet / Atendimento Online\n\nEnviaremos um lembrete automático aqui neste mesmo canal 2 horas antes do encontro. Salve na sua agenda pelo botão abaixo:",
          buttons: [
            { id: "btn_gcal", text: "📅 Adicionar ao Google Calendar", type: "url", value: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Reuni%C3%A3o+ManyFlow&details=Agendamento+confirmado+no+canal+de+atendimento" },
            { id: "btn_reschedule", text: "🔄 Reagendar Horário", type: "flow", targetNodeId: "node_ap_slots" },
            { id: "btn_talk_human", text: "💬 Falar com Atendente Humano", type: "flow", value: "flow_support_keyword" }
          ],
          quickReplies: [
            { id: "qr_ap_ok", text: "Combinado, nos vemos lá! 👍" },
            { id: "qr_ap_change", text: "Preciso mudar o horário", targetNodeId: "node_ap_slots" }
          ]
        },
        position: { x: 1540, y: 150 }
      }
    ],
    connections: [
      { id: "e_ap_1", fromNodeId: "node_ap_trig", toNodeId: "node_ap_welcome" },
      { id: "e_ap_2", fromNodeId: "node_ap_welcome", toNodeId: "node_ap_slots" },
      { id: "e_ap_3", fromNodeId: "node_ap_slots", toNodeId: "node_ap_confirm_action" },
      { id: "e_ap_4", fromNodeId: "node_ap_confirm_action", toNodeId: "node_ap_success_msg" }
    ]
  },
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
    description: "Primeiro contato com novos seguidores e direct messages com agendamento pré-definido.",
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
        title: "Boas-Vindas Instagram",
        data: {
          text: "Olá! Seja muito bem-vindo ao nosso canal oficial no Instagram! Como posso te ajudar hoje?",
          buttons: [
            { id: "btn_w_schedule", text: "📅 Agendar Horário / Reunião", type: "flow", value: "flow_appointment_booking", assignTag: "Interesse-Agendamento-Instagram" },
            { id: "btn_w_catalog", text: "🛍️ Ver Produtos & Planos", type: "flow", value: "flow_pricing_keyword" },
            { id: "btn_w_human", text: "💬 Falar com Atendente", type: "flow", value: "flow_support_keyword" }
          ],
          quickReplies: [
            { id: "qr_w_schedule", text: "📅 Agendar Horário", assignTag: "Interesse-Agendamento" },
            { id: "qr_w_preco", text: "💰 Ver Preços" },
            { id: "qr_w_human", text: "💬 Atendente Humano" }
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
    description: "Primeiro contato com visitantes da Página do Facebook com agendamento pré-definido.",
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
          text: "Olá! Bem-vindo à nossa página no Facebook! Selecione uma das opções abaixo:",
          buttons: [
            { id: "btn_wm_schedule", text: "📅 Agendar Demonstração / Consulta", type: "flow", value: "flow_appointment_booking", assignTag: "Interesse-Agendamento-Messenger" },
            { id: "btn_wm_1", text: "🚀 Conhecer Soluções & Planos", type: "flow", value: "flow_pricing_keyword" },
            { id: "btn_wm_support", text: "🎧 Suporte Humano", type: "flow", value: "flow_support_keyword" }
          ],
          quickReplies: [
            { id: "qr_wm_schedule", text: "📅 Agendar Horário" },
            { id: "qr_wm_planos", text: "💰 Conhecer Planos" }
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
    id: "flow_welcome_whatsapp",
    title: "🟢 Boas-Vindas WhatsApp (Meta Cloud & Baileys)",
    description: "Atendimento imediato para novos contatos via WhatsApp com agendamento pré-definido.",
    channel: "whatsapp",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { runs: 4120, completed: 3950, ctr: 93.2 },
    nodes: [
      {
        id: "node_ww_1",
        type: "trigger",
        title: "Gatilho: Primeira Mensagem WhatsApp",
        data: { triggerType: "get_started" },
        position: { x: 100, y: 100 }
      },
      {
        id: "node_ww_2",
        type: "message",
        title: "Menu Interativo WhatsApp",
        data: {
          text: "Olá! Seja bem-vindo ao nosso atendimento oficial no WhatsApp! 👋\n\nNosso agendamento automatizado está disponível 24h para você marcar reuniões e atendimentos:",
          buttons: [
            { id: "btn_ww_schedule", text: "📅 Agendar Horário / Reunião", type: "flow", value: "flow_appointment_booking", assignTag: "Interesse-Agendamento-WhatsApp" },
            { id: "btn_ww_pricing", text: "💰 Ver Preços & Planos", type: "flow", value: "flow_pricing_keyword" },
            { id: "btn_ww_support", text: "🎧 Atendimento com Humano", type: "flow", value: "flow_support_keyword" }
          ],
          quickReplies: [
            { id: "qr_ww_schedule", text: "📅 Agendar Horário", assignTag: "Interesse-Agendamento" },
            { id: "qr_ww_atendente", text: "👤 Falar com Atendente" }
          ]
        },
        position: { x: 450, y: 100 }
      }
    ],
    connections: [
      { id: "e_ww_1", fromNodeId: "node_ww_1", toNodeId: "node_ww_2" }
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
          text: "Não entendi completamente sua mensagem, mas estou aqui para ajudar! Escolha uma das opções abaixo:",
          buttons: [
            { id: "btn_nm_schedule", text: "📅 Agendar Horário", type: "flow", value: "flow_appointment_booking", assignTag: "Interesse-Agendamento" },
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

// Clean initial flows for authenticated real users (empty so user can build or import flows)
export const INITIAL_FLOWS: Flow[] = [];

export const DEMO_TRIGGERS: KeywordTrigger[] = [
  {
    id: "trig_appointment_omnichannel",
    name: "📅 Agendamento de Horário & Reunião em Todos os Canais",
    channel: "omnichannel",
    keywords: ["AGENDAR", "AGENDAMENTO", "MARCAR", "MARCAR HORÁRIO", "REUNIÃO", "CONSULTA", "DEMO", "DEMONSTRAÇÃO", "HORÁRIOS", "RESERVA", "CALENDÁRIO", "BOOKING", "SCHEDULE", "AGENDA", "HORÁRIO"],
    matchType: "contains",
    targetFlowId: "flow_appointment_booking",
    isActive: true,
    priority: 1,
    cooldownMinutes: 10,
    stats: {
      triggeredCount: 0
    }
  },
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
      triggeredCount: 0
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
      triggeredCount: 0
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
      triggeredCount: 0
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
      triggeredCount: 0
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
      triggeredCount: 0
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
      triggeredCount: 0
    }
  }
];

// Clean initial triggers for authenticated real users (empty)
export const INITIAL_TRIGGERS: KeywordTrigger[] = [];

export const INITIAL_CONNECTED_ACCOUNTS: ConnectedMetaAccount[] = [];

export const INITIAL_META_POSTS: MetaPostItem[] = [];

export const INITIAL_COMMENT_TOOLS: PostCommentGrowthTool[] = [];

export const INITIAL_CONTACTS: Contact[] = [];

export const DEMO_CONTACTS: Contact[] = [
  {
    id: "demo_c_1",
    name: "Camila Silveira",
    username: "camilasilveira.style",
    channel: "instagram",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    email: "camila@moda.com.br",
    phone: "+55 (11) 98765-1001",
    tags: ["Lead-VIP", "Moda-Feminina", "Agendamento-Demo"],
    customFields: { status_agendamento: "Confirmado" },
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastInteractionAt: "Há 15 min",
    totalInteractions: 8
  },
  {
    id: "demo_c_2",
    name: "Rodrigo Fernandes",
    username: "rodrigo.fernandes",
    channel: "messenger",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    email: "rodrigo@agenciax.com",
    phone: "+55 (21) 99887-2002",
    tags: ["Agência", "Interesse-Whitelabel"],
    customFields: {},
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastInteractionAt: "Há 1 hora",
    totalInteractions: 12
  }
];

export const INITIAL_CONVERSATIONS: LiveConversation[] = [];

export const DEMO_CONVERSATIONS: LiveConversation[] = [
  {
    id: "demo_conv_1",
    contactId: "demo_c_1",
    contact: {
      id: "demo_c_1",
      name: "Camila Silveira",
      username: "camilasilveira.style",
      channel: "instagram",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      email: "camila@moda.com.br",
      phone: "+55 (11) 98765-1001",
      tags: ["Lead-VIP", "Moda-Feminina", "Agendamento-Demo"],
      customFields: { status_agendamento: "Confirmado" },
      status: "active",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      lastInteractionAt: "Há 15 min",
      totalInteractions: 8
    },
    channel: "instagram",
    status: "open",
    unreadCount: 0,
    isBotActive: true,
    lastMessage: {
      text: "Olá Camila! Que excelente notícia. Qual o melhor horário para você?",
      timestamp: "14:10",
      sender: "bot"
    },
    messages: [
      {
        id: "m_1",
        sender: "user",
        channel: "instagram",
        text: "Olá! Gostaria de agendar uma demonstração.",
        timestamp: "14:10"
      },
      {
        id: "m_2",
        sender: "bot",
        channel: "instagram",
        text: "Olá Camila! Que excelente notícia. Qual o melhor horário para você?",
        timestamp: "14:10"
      }
    ]
  }
];

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
    id: "cf_email_lead",
    name: "E-mail do Lead (CRM)",
    key: "email_lead",
    type: "text",
    description: "E-mail capturado do lead para sincronização imediata com HubSpot e RD Station",
    defaultValue: "lead@empresa.com.br",
    validationType: "email",
    regexPattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    validationErrorMessage: "Por favor, informe um endereço de e-mail válido (ex: contato@suaempresa.com).",
    isRequired: true,
    crmTargetField: "email",
    crmPlatformPreset: "rd_station",
    normalizationRule: "lowercase",
    createdAt: "2026-08-19T08:00:00Z"
  },
  {
    id: "cf_whatsapp_lead",
    name: "WhatsApp / Telefone",
    key: "whatsapp_lead",
    type: "text",
    description: "Número de celular/WhatsApp com DDD no padrão brasileiro ou internacional E.164",
    defaultValue: "(11) 98765-4321",
    validationType: "phone_br",
    regexPattern: "^(\\+?55\\s?)?(\\(?\\d{2}\\)?\\s?)?(9?\\d{4}[-\\s]?\\d{4})$",
    validationErrorMessage: "Informe um número de telefone com DDD válido (ex: 11 98888-7777).",
    isRequired: true,
    crmTargetField: "mobile_phone",
    crmPlatformPreset: "hubspot",
    normalizationRule: "digits_only",
    createdAt: "2026-08-19T08:30:00Z"
  },
  {
    id: "cf_data_nascimento",
    name: "Data de Nascimento",
    key: "data_nascimento",
    type: "date",
    description: "Data de nascimento ou aniversário do seguidor para campanhas e saudações",
    defaultValue: "15/05/1995",
    validationType: "date_iso",
    regexPattern: "^(\\d{4}-\\d{2}-\\d{2}|\\d{2}\\/\\d{2}\\/\\d{4})$",
    validationErrorMessage: "Formato de data inválido. Use DD/MM/AAAA ou AAAA-MM-DD.",
    crmTargetField: "birthdate",
    crmPlatformPreset: "active_campaign",
    normalizationRule: "trim",
    createdAt: "2026-08-20T10:00:00Z"
  },
  {
    id: "cf_preferencia",
    name: "Preferência de Produto",
    key: "preferencia",
    type: "text",
    description: "Categoria, nicho ou produto preferido escolhido pelo seguidor no direct",
    defaultValue: "Moda Feminina & Acessórios",
    validationType: "none",
    crmTargetField: "product_interest",
    crmPlatformPreset: "rd_station",
    createdAt: "2026-08-20T10:00:00Z"
  },
  {
    id: "cf_cupom",
    name: "Cupom de Desconto",
    key: "cupom",
    type: "text",
    description: "Código promocional personalizado gerado para o cliente",
    defaultValue: "BEMVINDO15",
    validationType: "none",
    crmTargetField: "discount_coupon",
    normalizationRule: "uppercase",
    createdAt: "2026-08-20T10:00:00Z"
  },
  {
    id: "cf_link_oferta",
    name: "Link da Oferta",
    key: "link_oferta",
    type: "text",
    description: "URL direta da página de checkout ou catálogo com UTM",
    defaultValue: "https://manyflow.io/promo-vip",
    validationType: "url",
    regexPattern: "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$",
    validationErrorMessage: "A URL deve começar com https:// ou http:// e ser um link válido.",
    crmTargetField: "offer_url",
    createdAt: "2026-08-20T10:00:00Z"
  },
  {
    id: "cf_cidade",
    name: "Cidade / Região",
    key: "cidade",
    type: "text",
    description: "Localização informada pelo seguidor nas mensagens",
    defaultValue: "São Paulo - SP",
    validationType: "none",
    crmTargetField: "city",
    crmPlatformPreset: "hubspot",
    normalizationRule: "trim",
    createdAt: "2026-08-21T14:30:00Z"
  },
  {
    id: "cf_cargo",
    name: "Cargo / Ocupação",
    key: "cargo",
    type: "text",
    description: "Profissão, empresa ou nicho de atuação do lead B2B",
    defaultValue: "Gerente Comercial",
    validationType: "none",
    crmTargetField: "job_title",
    crmPlatformPreset: "salesforce",
    normalizationRule: "trim",
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
  ],
  conversionEndpoints: [
    {
      id: "wh_conv_1",
      name: "CRM RD Station & HubSpot (Leads & Qualificação)",
      url: "https://api.crm-hubspot.com/v3/webhooks/manyflow-conversions",
      events: ["lead_generated", "contact_qualified", "tag_added"],
      isActive: true,
      direction: "outbound",
      targetPlatform: "rd_station",
      secretToken: "crm_sec_99a812bd0",
      headers: [
        { key: "Authorization", value: "Bearer crm_token_secure_live" },
        { key: "X-Origin-App", value: "ManyFlow-Conversion-Engine" }
      ],
      includeCustomFields: true,
      includeContactData: true,
      retryOnFailure: true,
      description: "Dispara dados completos do lead e campos personalizados para o CRM assim que um formulário ou qualificação for atingida.",
      lastDeliveryStatus: "success",
      lastDeliveryAt: "2026-08-30T11:42:00Z",
      lastStatusCode: 200,
      totalDeliveries: 342,
      totalErrors: 0,
      createdAt: "2026-08-25T14:00:00Z"
    },
    {
      id: "wh_conv_2",
      name: "Plataforma de Pagamentos / Checkout (Vendas & PIX Aprovados)",
      url: "https://api.meusistema.com/webhooks/vendas-aprovadas",
      events: ["sale_completed", "pix_paid"],
      isActive: true,
      direction: "outbound",
      targetPlatform: "custom_webhook",
      secretToken: "pay_sec_51bc90a12",
      headers: [
        { key: "X-Webhook-Secret", value: "pay_sec_51bc90a12" }
      ],
      includeCustomFields: true,
      includeContactData: true,
      retryOnFailure: true,
      description: "Notifica o sistema interno quando o cliente conclui uma compra pelo chat ou realiza pagamento de PIX.",
      lastDeliveryStatus: "success",
      lastDeliveryAt: "2026-08-30T10:15:30Z",
      lastStatusCode: 200,
      totalDeliveries: 128,
      totalErrors: 1,
      createdAt: "2026-08-27T09:30:00Z"
    },
    {
      id: "wh_conv_3",
      name: "n8n / Zapier (Agendamentos & Funil de Conversão)",
      url: "https://n8n.workflow-automations.io/webhook/manyflow-appointments",
      events: ["appointment_booked", "flow_completed"],
      isActive: false,
      direction: "outbound",
      targetPlatform: "n8n",
      secretToken: "n8n_sec_7781a",
      includeCustomFields: true,
      includeContactData: true,
      retryOnFailure: true,
      description: "Aciona fluxos complexos no n8n ou Zapier após o agendamento de reuniões e consultas pelo Direct.",
      lastDeliveryStatus: "idle",
      totalDeliveries: 0,
      totalErrors: 0,
      createdAt: "2026-08-28T16:00:00Z"
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

export const INITIAL_CHANNEL_BOOKING_CONFIGS: ChannelBookingConfig[] = [
  {
    channel: 'instagram',
    channelName: 'Instagram Direct',
    channelHandleOrNumber: '',
    enabled: false,
    autoConfirm: true,
    triggerKeywords: ['AGENDAR', 'AGENDAMENTO', 'MARCAR HORÁRIO', 'CONSULTA', 'REUNIÃO', 'DEMO'],
    welcomeButtonEnabled: true,
    defaultFlowId: '',
    calendarSyncEnabled: true,
    notifyStaffWhatsapp: '',
    totalBookings: 0
  },
  {
    channel: 'whatsapp',
    channelName: 'WhatsApp Oficial & Híbrido',
    channelHandleOrNumber: '',
    enabled: false,
    autoConfirm: true,
    triggerKeywords: ['AGENDAR', 'MARCAR', 'HORÁRIOS', 'RESERVA', 'CONSULTORIA', 'AGENDA'],
    welcomeButtonEnabled: true,
    defaultFlowId: '',
    calendarSyncEnabled: true,
    notifyStaffWhatsapp: '',
    totalBookings: 0
  },
  {
    channel: 'messenger',
    channelName: 'Facebook Messenger',
    channelHandleOrNumber: '',
    enabled: false,
    autoConfirm: true,
    triggerKeywords: ['AGENDAR', 'DEMONSTRAÇÃO', 'CONSULTA', 'REUNIÃO', 'SCHEDULE'],
    welcomeButtonEnabled: true,
    defaultFlowId: '',
    calendarSyncEnabled: true,
    notifyStaffWhatsapp: '',
    totalBookings: 0
  },
  {
    channel: 'telegram',
    channelName: 'Telegram Bot',
    channelHandleOrNumber: '',
    enabled: false,
    autoConfirm: true,
    triggerKeywords: ['/agendar', 'AGENDAR', 'CONSULTA', 'MARCAR HORÁRIO'],
    welcomeButtonEnabled: true,
    defaultFlowId: '',
    calendarSyncEnabled: true,
    totalBookings: 0
  },
  {
    channel: 'omnichannel',
    channelName: 'Live Chat & Webchat',
    channelHandleOrNumber: 'Widget Incorporado',
    enabled: false,
    autoConfirm: true,
    triggerKeywords: ['AGENDAR', 'AGENDAMENTO', 'MARCAR', 'CONSULTA', 'BOOKING'],
    welcomeButtonEnabled: true,
    defaultFlowId: '',
    calendarSyncEnabled: true,
    totalBookings: 0
  }
];

export const INITIAL_APPOINTMENT_SERVICES: AppointmentService[] = [
  {
    id: 'srv_demo',
    title: '🎯 Demonstração ManyFlow VIP',
    description: 'Apresentação prática da plataforma ManyFlow, integrações Meta Graph API e automação de funis.',
    durationMinutes: 30,
    price: 'Gratuito',
    active: true,
    color: 'emerald'
  },
  {
    id: 'srv_consulting',
    title: '💼 Consultoria de Escala & Tráfego Pago',
    description: 'Análise aprofundada de funis de conversão Instagram Direct, WhatsApp Cloud API e ROI.',
    durationMinutes: 45,
    price: 'R$ 250,00',
    active: true,
    color: 'indigo'
  },
  {
    id: 'srv_tech_support',
    title: '🎧 Atendimento & Onboarding Técnico',
    description: 'Configuração guiada de webhooks, tokens permanentes de sistema e testes de entrega.',
    durationMinutes: 30,
    price: 'Incluso no Plano',
    active: true,
    color: 'blue'
  }
];

// Clean initial appointments for real accounts (empty)
export const INITIAL_APPOINTMENTS: Appointment[] = [];

// Demo appointments for demonstration / unauthenticated guest mode
export const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_101',
    contactId: 'c_1',
    contactName: 'Camila Silveira',
    contactHandle: '@camilasilveira.style',
    contactPhone: '+55 11 98765-1001',
    contactEmail: 'camila.silveira@moda.com.br',
    channel: 'instagram',
    serviceTitle: '🎯 Demonstração ManyFlow VIP',
    serviceDurationMinutes: 30,
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
    scheduledTime: '10:00',
    status: 'confirmed',
    notes: 'Cliente veio pelo Reels de Look do Dia e quer integrar automação de direct.',
    meetingLink: 'https://meet.google.com/abc-many-flow',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    reminderSent24h: true,
    reminderSent2h: false
  },
  {
    id: 'apt_102',
    contactId: 'c_2',
    contactName: 'Rodrigo Fernandes',
    contactHandle: '+55 21 99887-2002',
    contactPhone: '+55 21 99887-2002',
    contactEmail: 'rodrigo.fernandes@agenciax.com',
    channel: 'whatsapp',
    serviceTitle: '💼 Consultoria de Escala & Tráfego Pago',
    serviceDurationMinutes: 45,
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
    scheduledTime: '15:30',
    status: 'confirmed',
    notes: 'Agência com 30 clientes interessada em revenda White-Label ManyFlow.',
    meetingLink: 'https://meet.google.com/xyz-scale-wpp',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    reminderSent24h: true,
    reminderSent2h: false
  },
  {
    id: 'apt_103',
    contactId: 'c_3',
    contactName: 'Mariana Duarte',
    contactHandle: 'Mariana Duarte (Facebook)',
    contactPhone: '+55 31 98456-3003',
    contactEmail: 'mariana.duarte@infoprodutos.com',
    channel: 'messenger',
    serviceTitle: '🎯 Demonstração ManyFlow VIP',
    serviceDurationMinutes: 30,
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Depois de amanhã
    scheduledTime: '14:00',
    status: 'pending',
    notes: 'Dúvida sobre disparos em massa e conformidade de 24h na Meta Graph API.',
    meetingLink: 'https://meet.google.com/qwe-demo-msg',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    reminderSent24h: false,
    reminderSent2h: false
  },
  {
    id: 'apt_104',
    contactId: 'c_4',
    contactName: 'Lucas Alencar',
    contactHandle: '@lucas_dev_crypto',
    contactPhone: '+55 41 99123-4004',
    contactEmail: 'lucas@cryptotrading.io',
    channel: 'telegram',
    serviceTitle: '🎧 Atendimento & Onboarding Técnico',
    serviceDurationMinutes: 30,
    scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    scheduledTime: '16:00',
    status: 'confirmed',
    notes: 'Integração de bot Telegram com alertas de sinais e webhook ManyFlow.',
    meetingLink: 'https://meet.google.com/tl-tech-flow',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    reminderSent24h: false,
    reminderSent2h: false
  },
  {
    id: 'apt_105',
    contactId: 'c_5',
    contactName: 'Beatriz Vasconcelos',
    contactHandle: 'beatriz.v@ecommercebrasil.com',
    contactPhone: '+55 19 97654-5005',
    contactEmail: 'beatriz.v@ecommercebrasil.com',
    channel: 'omnichannel',
    serviceTitle: '💼 Consultoria de Escala & Tráfego Pago',
    serviceDurationMinutes: 45,
    scheduledDate: new Date().toISOString().split('T')[0], // Hoje
    scheduledTime: '11:00',
    status: 'completed',
    notes: 'Reunião realizada com sucesso. Lead avançou para o Plano Pro Anual.',
    meetingLink: 'https://meet.google.com/omni-concluido',
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    reminderSent24h: true,
    reminderSent2h: true
  }
];



