import { Flow, KeywordTrigger, PostCommentGrowthTool, Contact, LiveConversation, BotKnowledgeBase, MetaConnectionConfig, CustomFieldDefinition, BroadcastCampaign, UtilityMessageTemplate, ConnectedMetaAccount, MetaPostItem } from '../types';

export const INITIAL_FLOWS: Flow[] = [
  {
    id: "flow_welcome_instagram",
    title: "📸 Instagram Direct: Boas-Vindas com Teste A/B de Alta Conversão",
    description: "Divide automaticamente novos seguidores entre 2 variações de Mensagem de Boas-Vindas (Oferta com Cupom vs. Menu Interativo) e compara métricas de cliques, respostas e conversão em tempo real.",
    channel: "instagram",
    isActive: true,
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-29T15:00:00Z",
    stats: {
      runs: 2840,
      completed: 2610,
      ctr: 91.9
    },
    nodes: [
      {
        id: "node_insta_welcome_trig",
        type: "trigger",
        title: "Gatilho: Novo Seguidor / Primeira DM",
        data: {
          triggerType: "get_started",
          keywords: ["START", "OI", "OLÁ", "HELLO", "HI", "BOAS VINDAS", "COMEÇAR", "INICIAR"],
          matchType: "contains"
        },
        position: { x: 40, y: 220 }
      },
      {
        id: "node_insta_ab_split",
        type: "ab_split",
        title: "🧪 Teste A/B: Boas-Vindas (Oferta vs. Menu)",
        data: {
          splitRatioA: 50,
          splitRatioB: 50,
          variantAName: "Variante A: Cupom de Boas-Vindas 15% OFF",
          variantBName: "Variante B: Menu Consultivo Interativo",
          variantADescription: "Entrega imediata de cupom de desconto para acelerar a primeira compra",
          variantBDescription: "Apresenta opções personalizadas de navegação e atendimento consultivo",
          testGoal: "ctr",
          testGoalTargetTag: "Lead-Qualificado",
          isTestActive: true,
          confidenceLevel: 97.8,
          minSampleSize: 200,
          autoPickWinner: true,
          statsA: {
            runs: 1420,
            opens: 1398,
            clicks: 1012,
            conversions: 260,
            ctr: 72.4,
            conversionRate: 18.6
          },
          statsB: {
            runs: 1420,
            opens: 1406,
            clicks: 1198,
            conversions: 405,
            ctr: 85.2,
            conversionRate: 28.8
          }
        },
        position: { x: 380, y: 200 }
      },
      {
        id: "node_insta_welcome_msg_a",
        type: "message",
        title: "Variante A: Cupom Boas-Vindas",
        data: {
          text: "Hey {first_name}! 🎁 Bem-vindo ao Instagram da ManyFlow!\n\nComo presente especial de boas-vindas, liberamos um cupom de 15% OFF no seu primeiro pedido: **BEMVINDO15**.\n\nAproveite para resgatar agora mesmo:",
          buttons: [
            { id: "btn_insta_cupom_a", text: "🎁 Usar Cupom (15% OFF)", type: "url", value: "https://manyflow.io/cupom-15", assignTag: "Interesse-Cupom" },
            { id: "btn_insta_prods_a", text: "🛍️ Ver Produtos em Destaque", type: "flow", targetNodeId: "node_insta_prods_card", assignTag: "Interesse-Catalogo" },
            { id: "btn_insta_supp_a", text: "💬 Falar com Especialista", type: "flow", targetNodeId: "node_insta_supp_handover", assignTag: "Lead-VIP-Atendimento" }
          ],
          quickReplies: [
            { id: "qr_a1", text: "🎁 Cupom 15% OFF", assignTag: "Interesse-Cupom" },
            { id: "qr_a2", text: "🛍️ Ver Catálogo", targetNodeId: "node_insta_prods_card", assignTag: "Interesse-Catalogo" }
          ]
        },
        position: { x: 780, y: 80 }
      },
      {
        id: "node_insta_welcome_msg_b",
        type: "message",
        title: "Variante B: Menu Interativo",
        data: {
          text: "Olá {first_name}! 👋 É um enorme prazer ter você conosco no direct da ManyFlow!\n\nEstamos prontos para turbinar as conversões do seu negócio. Como podemos te ajudar hoje?",
          buttons: [
            { id: "btn_insta_prods_b", text: "🛍️ Explorar Catálogo & Planos", type: "flow", targetNodeId: "node_insta_prods_card", assignTag: "Interesse-Planos" },
            { id: "btn_insta_site_b", text: "🌐 Conhecer a Plataforma", type: "url", value: "https://manyflow.io", assignTag: "Interesse-Plataforma" },
            { id: "btn_insta_supp_b", text: "💬 Atendimento VIP no WhatsApp", type: "flow", targetNodeId: "node_insta_supp_handover", assignTag: "Lead-VIP-WhatsApp" }
          ],
          quickReplies: [
            { id: "qr_b1", text: "🛍️ Ver Catálogo", targetNodeId: "node_insta_prods_card", assignTag: "Interesse-Catalogo" },
            { id: "qr_b2", text: "💬 Suporte VIP", targetNodeId: "node_insta_supp_handover", assignTag: "Lead-VIP-Atendimento" }
          ]
        },
        position: { x: 780, y: 380 }
      },
      {
        id: "node_insta_prods_card",
        type: "message",
        title: "Catálogo de Produtos & Soluções",
        data: {
          text: "Aqui estão nossas principais soluções e produtos em destaque:\n\n✨ **ManyFlow Pro**: Automação completa para Instagram & Messenger\n✨ **AI Smart Agent**: Atendimento 24/7 com Gemini AI\n✨ **Growth Engine**: Conversor de comentários em vendas",
          buttons: [
            { id: "btn_prods_explore", text: "🚀 Ver Todos os Detalhes", type: "url", value: "https://manyflow.io/products" },
            { id: "btn_prods_discount", text: "🎁 Resgatar Cupom de Desconto", type: "flow", targetNodeId: "node_insta_discount_tag" }
          ]
        },
        position: { x: 1200, y: 80 }
      },
      {
        id: "node_insta_discount_tag",
        type: "action",
        title: "Tag 'Lead-Qualificado-Cupom'",
        data: {
          actionType: "add_tag",
          tagToAdd: "Lead-Qualificado"
        },
        position: { x: 1580, y: 80 }
      },
      {
        id: "node_insta_supp_handover",
        type: "action",
        title: "Encaminhar para Time de Suporte",
        data: {
          actionType: "human_handover",
          tagToAdd: "Suporte-Instagram-Aberto"
        },
        position: { x: 1200, y: 380 }
      },
      {
        id: "node_insta_supp_reply",
        type: "message",
        title: "Confirmação de Suporte",
        data: {
          text: "Prontinho {first_name}! 🛠️ Nosso time de suporte especializado já recebeu sua solicitação e um atendente vai te responder em instantes por aqui.",
          buttons: [
            { id: "btn_supp_docs", text: "📖 Central de Ajuda & FAQ", type: "url", value: "https://manyflow.io/docs" }
          ]
        },
        position: { x: 1580, y: 380 }
      }
    ],
    connections: [
      { fromNodeId: "node_insta_welcome_trig", toNodeId: "node_insta_ab_split", handleType: "default" },
      { fromNodeId: "node_insta_ab_split", toNodeId: "node_insta_welcome_msg_a", handleType: "variant_a", label: "Variante A (50%)" },
      { fromNodeId: "node_insta_ab_split", toNodeId: "node_insta_welcome_msg_b", handleType: "variant_b", label: "Variante B (50%)" },
      { fromNodeId: "node_insta_welcome_msg_a", toNodeId: "node_insta_prods_card", handleType: "button", label: "🛍️ Ver Produtos" },
      { fromNodeId: "node_insta_welcome_msg_a", toNodeId: "node_insta_supp_handover", handleType: "button", label: "💬 Suporte" },
      { fromNodeId: "node_insta_welcome_msg_b", toNodeId: "node_insta_prods_card", handleType: "button", label: "🛍️ Explorar Catálogo" },
      { fromNodeId: "node_insta_welcome_msg_b", toNodeId: "node_insta_supp_handover", handleType: "button", label: "💬 Atendimento VIP" },
      { fromNodeId: "node_insta_prods_card", toNodeId: "node_insta_discount_tag", handleType: "button", label: "🎁 Resgatar Cupom" },
      { fromNodeId: "node_insta_supp_handover", toNodeId: "node_insta_supp_reply", handleType: "default" }
    ]
  },
  {
    id: "flow_welcome_messenger",
    title: "💬 Facebook Messenger: Mensagem de Boas-Vindas Automatizada (Welcome Screen)",
    description: "Exibida assim que o usuário clica em 'Começar' ou envia a primeira mensagem no Messenger, apresentando as opções: 'Visit our website', 'See our products', 'Contact support'.",
    channel: "messenger",
    isActive: true,
    createdAt: "2026-08-20T08:30:00Z",
    updatedAt: "2026-08-29T13:00:00Z",
    stats: {
      runs: 1920,
      completed: 1750,
      ctr: 91.1
    },
    nodes: [
      {
        id: "node_fb_welcome_trig",
        type: "trigger",
        title: "Gatilho: Botão Começar no Messenger",
        data: {
          triggerType: "get_started",
          keywords: ["GET_STARTED", "COMEÇAR", "START", "HELLO", "HI", "OLÁ"],
          matchType: "contains"
        },
        position: { x: 40, y: 160 }
      },
      {
        id: "node_fb_welcome_msg",
        type: "message",
        title: "Mensagem de Boas-Vindas Messenger",
        data: {
          text: "Hello {first_name}! 🚀 Bem-vindo ao canal oficial da ManyFlow no Facebook Messenger!\n\nEstamos disponíveis 24 horas por dia para te atender. O que você gostaria de fazer hoje?",
          buttons: [
            { id: "btn_fb_site", text: "🌐 Visit our website", type: "url", value: "https://manyflow.io" },
            { id: "btn_fb_prods", text: "🛍️ See our products", type: "flow", targetNodeId: "node_fb_prods_card" },
            { id: "btn_fb_supp", text: "💬 Contact support", type: "flow", targetNodeId: "node_fb_supp_handover" }
          ],
          quickReplies: [
            { id: "qr_fb_site", text: "🌐 Visit our website" },
            { id: "qr_fb_prods", text: "🛍️ See our products", targetNodeId: "node_fb_prods_card" },
            { id: "qr_fb_supp", text: "💬 Contact support", targetNodeId: "node_fb_supp_handover" }
          ]
        },
        position: { x: 400, y: 140 }
      },
      {
        id: "node_fb_prods_card",
        type: "message",
        title: "Catálogo de Produtos & Demonstração",
        data: {
          text: "Conheça nossas ferramentas para escalar suas conversões no Facebook e Instagram:\n\n⭐ **ManyFlow Starter**: Ideal para pequenos negócios (R$ 97/mês)\n⭐ **ManyFlow Pro**: Atendimento inteligente com IA ilimitada (R$ 197/mês)\n⭐ **ManyFlow Enterprise**: Multi-páginas e integração via API",
          buttons: [
            { id: "btn_fb_plans", text: "💳 Ver Tabela de Planos", type: "url", value: "https://manyflow.io/pricing" },
            { id: "btn_fb_demo", text: "🎥 Assistir Demonstração Rápida", type: "url", value: "https://manyflow.io/demo" }
          ]
        },
        position: { x: 800, y: 80 }
      },
      {
        id: "node_fb_supp_handover",
        type: "action",
        title: "Ação: Fila de Atendimento Humano",
        data: {
          actionType: "human_handover",
          tagToAdd: "Suporte-Messenger-Aberto"
        },
        position: { x: 800, y: 320 }
      },
      {
        id: "node_fb_supp_msg",
        type: "message",
        title: "Mensagem Suporte Messenger",
        data: {
          text: "Perfeito {first_name}! 🎧 Transferi sua conversa para nosso time de suporte. Um especialista responderá você aqui no Messenger em instantes!",
          buttons: [
            { id: "btn_fb_faq", text: "❓ Perguntas Frequentes", type: "url", value: "https://manyflow.io/faq" }
          ]
        },
        position: { x: 1180, y: 320 }
      }
    ],
    connections: [
      { fromNodeId: "node_fb_welcome_trig", toNodeId: "node_fb_welcome_msg", handleType: "default" },
      { fromNodeId: "node_fb_welcome_msg", toNodeId: "node_fb_prods_card", handleType: "button", label: "🛍️ See our products" },
      { fromNodeId: "node_fb_welcome_msg", toNodeId: "node_fb_supp_handover", handleType: "button", label: "💬 Contact support" },
      { fromNodeId: "node_fb_supp_handover", toNodeId: "node_fb_supp_msg", handleType: "default" }
    ]
  },
  {
    id: "flow_pricing_keyword",
    title: "💰 Gatilho de Palavra-Chave: 'Pricing' & Informações de Planos",
    description: "Disparado quando o usuário digita 'pricing', 'preço', 'valor', 'plans' ou 'quanto custa'. Apresenta planos, valores e botão de contratação.",
    channel: "omnichannel",
    isActive: true,
    createdAt: "2026-08-21T11:00:00Z",
    updatedAt: "2026-08-29T13:10:00Z",
    stats: {
      runs: 1650,
      completed: 1480,
      ctr: 89.7
    },
    nodes: [
      {
        id: "node_price_trig",
        type: "trigger",
        title: "Gatilho: Palavras-chave 'Pricing'",
        data: {
          triggerType: "keyword",
          keywords: ["PRICING", "PRICE", "PLANS", "COST", "PREÇO", "VALOR", "TABELA", "PLANOS", "QUANTO CUSTA"],
          matchType: "contains"
        },
        position: { x: 40, y: 150 }
      },
      {
        id: "node_price_msg",
        type: "message",
        title: "Mensagem com Tabela de Preços & Planos",
        data: {
          text: "Olá {first_name}! 💳 Aqui estão nossos planos flexíveis para alavancar suas vendas e atendimento:\n\n🔹 **Starter**: R$ 97/mês (Até 2.500 contatos + Automações Direct & Comentários)\n🔹 **Pro (Mais Escolhido)**: R$ 197/mês (Até 10.000 contatos + IA Gemini Flash Ilimitada)\n🔹 **Enterprise**: R$ 497/mês (Múltiplas contas + Suporte Dedicado + Webhook API)\n\n✅ *Todos os planos incluem 14 dias de garantia incondicional de reembolso!*",
          buttons: [
            { id: "btn_price_start", text: "🚀 Iniciar Teste Grátis de 14 Dias", type: "url", value: "https://manyflow.io/pricing" },
            { id: "btn_price_discount", text: "🎁 Quero Desconto Especial", type: "flow", targetNodeId: "node_price_discount_flow" },
            { id: "btn_price_sales", text: "👨‍💼 Falar com Consultor de Vendas", type: "flow", targetNodeId: "node_price_sales_handover" }
          ],
          quickReplies: [
            { id: "qr_p_pro", text: "Plano Pro R$197" },
            { id: "qr_p_cupom", text: "Tem cupom de desconto?" },
            { id: "qr_p_demo", text: "Agendar Demonstração" }
          ]
        },
        position: { x: 420, y: 130 }
      },
      {
        id: "node_price_tag",
        type: "action",
        title: "Tag CRM 'Lead-Interesse-Preco'",
        data: {
          actionType: "add_tag",
          tagToAdd: "Lead-Consultou-Preco"
        },
        position: { x: 820, y: 50 }
      },
      {
        id: "node_price_discount_flow",
        type: "message",
        title: "Oferta de Cupom para Lead de Preço",
        data: {
          text: "Temos uma condição exclusiva para você hoje {first_name}! 🌟\n\nUse o cupom **SPECIAL20** para garantir 20% de desconto adicional nos 3 primeiros meses de qualquer plano!",
          buttons: [
            { id: "btn_apply_disc", text: "🛒 Aplicar Desconto Agora", type: "url", value: "https://manyflow.io/checkout?cupom=SPECIAL20" }
          ]
        },
        position: { x: 820, y: 220 }
      },
      {
        id: "node_price_sales_handover",
        type: "action",
        title: "Transferir para Time Comercial",
        data: {
          actionType: "human_handover",
          tagToAdd: "Fila-Comercial-Planos"
        },
        position: { x: 820, y: 390 }
      }
    ],
    connections: [
      { fromNodeId: "node_price_trig", toNodeId: "node_price_msg", handleType: "default" },
      { fromNodeId: "node_price_msg", toNodeId: "node_price_tag", handleType: "default" },
      { fromNodeId: "node_price_msg", toNodeId: "node_price_discount_flow", handleType: "button", label: "🎁 Quero Desconto Especial" },
      { fromNodeId: "node_price_msg", toNodeId: "node_price_sales_handover", handleType: "button", label: "👨‍💼 Falar com Consultor" }
    ]
  },
  {
    id: "flow_discount_keyword",
    title: "🎁 Gatilho de Palavra-Chave: 'Discount' & Cupom Promocional",
    description: "Disparado quando o usuário digita 'discount', 'desconto', 'cupom', 'coupon', 'promo' ou 'offer'. Entrega cupom e link direto de checkout.",
    channel: "omnichannel",
    isActive: true,
    createdAt: "2026-08-21T12:00:00Z",
    updatedAt: "2026-08-29T13:15:00Z",
    stats: {
      runs: 2310,
      completed: 2150,
      ctr: 93.1
    },
    nodes: [
      {
        id: "node_disc_trig",
        type: "trigger",
        title: "Gatilho: Palavras 'Discount / Cupom'",
        data: {
          triggerType: "keyword",
          keywords: ["DISCOUNT", "COUPON", "PROMO", "OFFER", "DEAL", "DESCONTO", "CUPOM", "PROMOÇÃO", "CÓDIGO", "20% OFF", "25% OFF"],
          matchType: "contains"
        },
        position: { x: 40, y: 150 }
      },
      {
        id: "node_disc_tag",
        type: "action",
        title: "Tag 'Lead-Resgatou-Desconto'",
        data: {
          actionType: "add_tag",
          tagToAdd: "Lead-Desconto-Ativo"
        },
        position: { x: 380, y: 150 }
      },
      {
        id: "node_disc_delay",
        type: "delay",
        title: "Gerando Cupom Personalizado (2s)",
        data: {
          delaySeconds: 2,
          showTypingIndicator: true
        },
        position: { x: 680, y: 150 }
      },
      {
        id: "node_disc_msg",
        type: "message",
        title: "Entrega do Cupom com Link Exclusivo",
        data: {
          text: "Eba, {first_name}! 🎉 Você desbloqueou um cupom exclusivo de **25% OFF** para assinar a plataforma:\n\n🏷️ Código: **VIP25OFF**\n\n⏰ *Atenção: Válido apenas pelas próximas 24 horas!* Clique no botão abaixo com o desconto já ativado:",
          buttons: [
            { id: "btn_disc_claim", text: "🛍️ Resgatar 25% OFF no Checkout", type: "url", value: "https://manyflow.io/checkout?cupom=VIP25OFF" },
            { id: "btn_disc_wpp", text: "📲 Tirar Dúvidas no WhatsApp", type: "url", value: "https://wa.me/5511999998888?text=Ola%20quero%20o%20cupom%20VIP25OFF" }
          ],
          quickReplies: [
            { id: "qr_disc_sim", text: "Vou assinar agora! 🚀" },
            { id: "qr_disc_duvida", text: "Quais são as formas de pagamento?" }
          ]
        },
        position: { x: 980, y: 150 }
      }
    ],
    connections: [
      { fromNodeId: "node_disc_trig", toNodeId: "node_disc_tag", handleType: "default" },
      { fromNodeId: "node_disc_tag", toNodeId: "node_disc_delay", handleType: "default" },
      { fromNodeId: "node_disc_delay", toNodeId: "node_disc_msg", handleType: "default" }
    ]
  },
  {
    id: "flow_support_keyword",
    title: "🎧 Gatilho de Palavra-Chave: 'Support' & Central de Ajuda",
    description: "Disparado quando o usuário digita 'support', 'suporte', 'help', 'ajuda', 'humano', 'atendente' ou 'contact support'.",
    channel: "omnichannel",
    isActive: true,
    createdAt: "2026-08-21T12:30:00Z",
    updatedAt: "2026-08-29T13:20:00Z",
    stats: {
      runs: 1120,
      completed: 1040,
      ctr: 92.8
    },
    nodes: [
      {
        id: "node_supp_trig",
        type: "trigger",
        title: "Gatilho: Palavras 'Support / Suporte'",
        data: {
          triggerType: "keyword",
          keywords: ["SUPPORT", "HELP", "SUPORTE", "AJUDA", "CONTACT SUPPORT", "HUMANO", "ATENDENTE", "AGENT", "ATENDIMENTO", "FALAR COM ALGUÉM"],
          matchType: "contains"
        },
        position: { x: 40, y: 150 }
      },
      {
        id: "node_supp_action",
        type: "action",
        title: "Ação: Abrir Ticket de Suporte",
        data: {
          actionType: "add_tag",
          tagToAdd: "Ticket-Suporte-Aberto"
        },
        position: { x: 380, y: 150 }
      },
      {
        id: "node_supp_msg",
        type: "message",
        title: "Menu de Opções de Suporte & Central de Ajuda",
        data: {
          text: "Olá {first_name}! 🛠️ Nossa equipe de suporte e especialistas técnicos está à sua total disposição!\n\nComo você prefere ser atendido agora?",
          buttons: [
            { id: "btn_supp_agent", text: "👨‍💼 Falar com Atendente Humano", type: "flow", targetNodeId: "node_supp_handover_final" },
            { id: "btn_supp_helpcenter", text: "📖 Acessar Central de Ajuda & Tutoriais", type: "url", value: "https://manyflow.io/docs" },
            { id: "btn_supp_status", text: "⚡ Status dos Servidores em Tempo Real", type: "url", value: "https://status.manyflow.io" }
          ],
          quickReplies: [
            { id: "qr_supp_humano", text: "Falar com Humano", targetNodeId: "node_supp_handover_final" },
            { id: "qr_supp_duvida_tec", text: "Dúvida Técnica" },
            { id: "qr_supp_financeiro", text: "Financeiro / Faturas" }
          ]
        },
        position: { x: 740, y: 150 }
      },
      {
        id: "node_supp_handover_final",
        type: "action",
        title: "Pausar Bot & Transferir para Fila Humana",
        data: {
          actionType: "human_handover",
          tagToAdd: "Fila-Atendimento-Prioritario"
        },
        position: { x: 1120, y: 150 }
      }
    ],
    connections: [
      { fromNodeId: "node_supp_trig", toNodeId: "node_supp_action", handleType: "default" },
      { fromNodeId: "node_supp_action", toNodeId: "node_supp_msg", handleType: "default" },
      { fromNodeId: "node_supp_msg", toNodeId: "node_supp_handover_final", handleType: "button", label: "👨‍💼 Falar com Atendente" }
    ]
  },
  {
    id: "flow_no_match_default",
    title: "❓ Resposta Padrão & Fallback (No Match Reply Flow)",
    description: "Executado automaticamente quando a mensagem enviada pelo usuário não corresponde a nenhuma palavra-chave cadastrada, orientando o lead com as principais opções ou acionando a IA.",
    channel: "omnichannel",
    isActive: true,
    createdAt: "2026-08-22T09:00:00Z",
    updatedAt: "2026-08-29T13:25:00Z",
    stats: {
      runs: 3410,
      completed: 3120,
      ctr: 91.5
    },
    nodes: [
      {
        id: "node_nomatch_trig",
        type: "trigger",
        title: "Gatilho: Nenhuma Palavra-Chave Reconhecida (Default)",
        data: {
          triggerType: "default_reply"
        },
        position: { x: 40, y: 150 }
      },
      {
        id: "node_nomatch_msg",
        type: "message",
        title: "Mensagem de Orientação Fallback",
        data: {
          text: "Desculpe {first_name}, não entendi exatamente o que você precisa 🤔\n\nSou o assistente virtual da ManyFlow. Aqui estão alguns tópicos rápidos que posso te ajudar imediatamente:",
          buttons: [
            { id: "btn_nm_pricing", text: "💰 Ver Preços & Planos (Pricing)", type: "flow", targetNodeId: "node_nm_go_pricing" },
            { id: "btn_nm_discount", text: "🎁 Pegar Cupom de Desconto", type: "flow", targetNodeId: "node_nm_go_discount" },
            { id: "btn_nm_support", text: "🎧 Suporte & Ajuda Humana", type: "flow", targetNodeId: "node_nm_go_support" }
          ],
          quickReplies: [
            { id: "qr_nm_p", text: "Pricing" },
            { id: "qr_nm_d", text: "Discount" },
            { id: "qr_nm_s", text: "Support" },
            { id: "qr_nm_w", text: "Visit our website" }
          ]
        },
        position: { x: 420, y: 140 }
      },
      {
        id: "node_nm_go_pricing",
        type: "message",
        title: "Redirecionando para Preços",
        data: {
          text: "Nossos planos começam a partir de R$ 97/mês com 14 dias de garantia!",
          buttons: [
            { id: "btn_nm_p_link", text: "💳 Ver Tabela Completa", type: "url", value: "https://manyflow.io/pricing" }
          ]
        },
        position: { x: 840, y: 40 }
      },
      {
        id: "node_nm_go_discount",
        type: "message",
        title: "Redirecionando para Desconto",
        data: {
          text: "Use o código **SAVE20NOW** para 20% de desconto no seu plano!",
          buttons: [
            { id: "btn_nm_d_link", text: "🎁 Aplicar Cupom", type: "url", value: "https://manyflow.io/checkout?cupom=SAVE20NOW" }
          ]
        },
        position: { x: 840, y: 180 }
      },
      {
        id: "node_nm_go_support",
        type: "action",
        title: "Transferindo para Suporte",
        data: {
          actionType: "human_handover",
          tagToAdd: "Fallback-Humano-Solicitado"
        },
        position: { x: 840, y: 320 }
      }
    ],
    connections: [
      { fromNodeId: "node_nomatch_trig", toNodeId: "node_nomatch_msg", handleType: "default" },
      { fromNodeId: "node_nomatch_msg", toNodeId: "node_nm_go_pricing", handleType: "button", label: "💰 Ver Preços" },
      { fromNodeId: "node_nomatch_msg", toNodeId: "node_nm_go_discount", handleType: "button", label: "🎁 Pegar Cupom" },
      { fromNodeId: "node_nomatch_msg", toNodeId: "node_nm_go_support", handleType: "button", label: "🎧 Suporte" }
    ]
  },
  {
    id: "flow_comment_dm",
    title: "📸 Instagram Comentário no Post ➔ Envio no Direct (Lead Magnet)",
    description: "Quando o seguidor comenta 'QUERO' ou 'CUPOM' no Reel/Post, o bot responde o comentário e envia o link com desconto no Direct.",
    channel: "instagram",
    isActive: true,
    createdAt: "2026-08-20T10:00:00Z",
    updatedAt: "2026-08-28T14:30:00Z",
    stats: {
      runs: 1420,
      completed: 1180,
      ctr: 83.1
    },
    nodes: [
      {
        id: "node_trigger_1",
        type: "trigger",
        title: "Gatilho: Comentou no Post",
        data: {
          triggerType: "post_comment",
          keywords: ["QUERO", "CUPOM", "DESCONTO", "EU QUERO", "LINK"],
          matchType: "contains"
        },
        position: { x: 40, y: 180 }
      },
      {
        id: "node_msg_1",
        type: "message",
        title: "Mensagem 1: Boas-vindas & Oferta VIP",
        data: {
          text: "Olá {first_name}! 🚀 Vi seu comentário e vim correndo te entregar o acesso VIP.\n\nLiberamos 25% de desconto para novos alunos hoje! Deseja resgatar agora?",
          buttons: [
            { id: "btn_cupom", text: "🎁 Quero o Cupom 25%", type: "flow", targetNodeId: "node_action_tag" },
            { id: "btn_duvidas", text: "❓ Tenho uma dúvida", type: "flow", targetNodeId: "node_ai_support" }
          ],
          quickReplies: [
            { id: "qr_sim", text: "Sim, enviar link!", targetNodeId: "node_action_tag" },
            { id: "qr_atendente", text: "Falar com Humano", targetNodeId: "node_handover" }
          ]
        },
        position: { x: 380, y: 150 }
      },
      {
        id: "node_action_tag",
        type: "action",
        title: "Ação: Tag 'Lead-Quente-Cupom'",
        data: {
          actionType: "add_tag",
          tagToAdd: "Lead-Quente-Instagram",
          fieldToSet: "interesse",
          fieldValue: "Cupom_25_Off"
        },
        position: { x: 750, y: 80 }
      },
      {
        id: "node_delay_1",
        type: "delay",
        title: "Digitação Simulada (2s)",
        data: {
          delaySeconds: 2,
          showTypingIndicator: true
        },
        position: { x: 1060, y: 80 }
      },
      {
        id: "node_msg_link",
        type: "message",
        title: "Mensagem 2: Link com Cupom Aplicado",
        data: {
          text: "Perfeito {first_name}! 🥳\n\nClique no botão abaixo para garantir sua vaga com 25% OFF já aplicado no checkout:\n\n👉 https://metodo-pro.com/checkout?cupom=VIP25\n\n*Oferta válida somente pelas próximas 2 horas!*",
          buttons: [
            { id: "btn_acessar", text: "🛒 Acessar Oferta Agora", type: "url", value: "https://metodo-pro.com" },
            { id: "btn_whats", text: "📲 Finalizar pelo WhatsApp", type: "url", value: "https://wa.me/5511999998888" }
          ]
        },
        position: { x: 1350, y: 80 }
      },
      {
        id: "node_ai_support",
        type: "ai_step",
        title: "IA Inteligente: Resposta a Dúvidas",
        data: {
          aiPrompt: "Responda a dúvida do cliente sobre formas de pagamento, garantia de 7 dias e acesso imediato. Mantenha tom encorajador e convide a aproveitar o desconto de 25%."
        },
        position: { x: 750, y: 300 }
      },
      {
        id: "node_handover",
        type: "action",
        title: "Ação: Chamar Atendente Humano",
        data: {
          actionType: "human_handover",
          tagToAdd: "Fila-Atendimento-Humano"
        },
        position: { x: 750, y: 460 }
      }
    ],
    connections: [
      { fromNodeId: "node_trigger_1", toNodeId: "node_msg_1", handleType: "default" },
      { fromNodeId: "node_msg_1", toNodeId: "node_action_tag", handleType: "button", label: "🎁 Quero o Cupom 25%" },
      { fromNodeId: "node_msg_1", toNodeId: "node_ai_support", handleType: "button", label: "❓ Tenho uma dúvida" },
      { fromNodeId: "node_msg_1", toNodeId: "node_handover", handleType: "quick_reply", label: "Falar com Humano" },
      { fromNodeId: "node_action_tag", toNodeId: "node_delay_1", handleType: "default" },
      { fromNodeId: "node_delay_1", toNodeId: "node_msg_link", handleType: "default" }
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

export const INITIAL_CONNECTED_ACCOUNTS: ConnectedMetaAccount[] = [
  {
    id: "acc_ig_main",
    name: "ManyFlow Oficial",
    handle: "@manyflow.oficial",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    channel: "instagram",
    category: "Software & Tecnologia",
    followersCount: 142800,
    isConnected: true,
    activeAutomationsCount: 5
  },
  {
    id: "acc_ig_store",
    name: "ManyFlow Loja & Cursos",
    handle: "@manyflow.academy",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    channel: "instagram",
    category: "Educação & Treinamentos",
    followersCount: 58400,
    isConnected: true,
    activeAutomationsCount: 3
  },
  {
    id: "acc_fb_page",
    name: "ManyFlow Brasil - Página Oficial",
    handle: "facebook.com/manyflowbrasil",
    avatarUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80",
    channel: "messenger",
    category: "Empresa de Automação",
    followersCount: 89300,
    isConnected: true,
    activeAutomationsCount: 4
  },
  {
    id: "acc_fb_support",
    name: "ManyFlow Atendimento & Comunidade",
    handle: "facebook.com/manyflowcommunity",
    avatarUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80",
    channel: "messenger",
    category: "Suporte ao Cliente",
    followersCount: 24100,
    isConnected: true,
    activeAutomationsCount: 2
  }
];

export const INITIAL_META_POSTS: MetaPostItem[] = [
  {
    id: "post_reel_01",
    type: "reel",
    mediaUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80",
    caption: "3 Segredos para Escalar Vendas no Instagram usando automação inteligente no Direct! Comente 'AULA' para receber o treinamento completo 🔥🚀",
    permalink: "https://instagram.com/reel/C8qL9z_xYz1",
    publishedAt: "Há 2 dias",
    likesCount: 1420,
    commentsCount: 348,
    channel: "instagram",
    accountHandle: "@manyflow.oficial"
  },
  {
    id: "post_carrossel_02",
    type: "carousel",
    mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
    caption: "Lançamento oficial da Coleção Outono / Inverno! Desconto exclusivo de 20% para quem comentar 'CUPOM' aqui embaixo agora! 👇✨",
    permalink: "https://instagram.com/p/C7xP3k_mNop",
    publishedAt: "Há 4 dias",
    likesCount: 980,
    commentsCount: 215,
    channel: "instagram",
    accountHandle: "@manyflow.oficial"
  },
  {
    id: "post_reel_03",
    type: "reel",
    mediaUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
    caption: "Como transformar seguidores em compradores recorrentes sem gastar mais em anúncios. Comente 'PLANILHA' para baixar o template grátis!",
    permalink: "https://instagram.com/reel/C6mKl2_qWe3",
    publishedAt: "Há 1 semana",
    likesCount: 2310,
    commentsCount: 512,
    channel: "instagram",
    accountHandle: "@manyflow.oficial"
  },
  {
    id: "post_fb_04",
    type: "video",
    mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    caption: "Demonstração ao vivo: Integração de CRM e Chatbot no Facebook Messenger. Deixe 'DEMO' nos comentários para testar no seu perfil!",
    permalink: "https://facebook.com/manyflowbrasil/posts/109283741",
    publishedAt: "Há 5 dias",
    likesCount: 420,
    commentsCount: 89,
    channel: "messenger",
    accountHandle: "facebook.com/manyflowbrasil"
  },
  {
    id: "post_img_05",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
    caption: "Checklist definitivo de automação de Direct para o mês que vem. Salve este post e comente 'CHECKLIST' para receber em PDF!",
    permalink: "https://instagram.com/p/C5vB1x_zYw4",
    publishedAt: "Há 2 semanas",
    likesCount: 1840,
    commentsCount: 430,
    channel: "instagram",
    accountHandle: "@manyflow.academy"
  }
];

export const INITIAL_COMMENT_TOOLS: PostCommentGrowthTool[] = [
  {
    id: "cg_global_all_posts",
    title: "🌟 Regra Global: TODOS os Posts & Reels Atuais e Futuros",
    channel: "omnichannel",
    postType: "all_posts",
    postId: undefined,
    postPreviewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    postCaption: "⚡ Aplica-se automaticamente a todas as publicações, Reels e vídeos de todas as contas conectadas sem necessidade de selecionar post a post.",
    targetPages: ["all_pages"],
    applyToAllPages: true,
    includeReels: true,
    includeFeedPosts: true,
    includeLiveComments: true,
    includeMetaAds: true,
    triggerMode: "keywords_only",
    triggerKeywords: ["QUERO", "CUPOM", "LINK", "DESCONTO", "EU QUERO", "PREÇO", "VALOR"],
    matchAnyKeyword: true,
    publicReplyVariations: [
      "Acabei de te enviar no Direct com acesso liberado! 🚀",
      "Prontinho! Te mandei o link na sua mensagem privada ✨",
      "Olha seu Direct! Acabei de te mandar todos os detalhes 📲",
      "Enviado no inbox com muito carinho! Qualquer dúvida estou por lá 😉",
      "Te respondi no privado! Dá uma olhadinha nas suas mensagens 🎁"
    ],
    publicReplyDelaySeconds: 2,
    autoLikeComment: true,
    targetFlowId: "flow_comment_dm",
    isActive: true,
    stats: {
      commentsChecked: 4890,
      dmsSent: 4320,
      conversionRate: 88.3
    }
  },
  {
    id: "cg_1",
    title: "Reel Específico: '3 Segredos para Escalar Vendas no Instagram'",
    channel: "instagram",
    postType: "specific_post",
    postId: "post_reel_01",
    postPreviewUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80",
    postCaption: "Comente 'AULA' para receber o link completo do treinamento gratuitamente no seu Direct! 👇🔥",
    targetPages: ["acc_ig_main"],
    applyToAllPages: false,
    includeReels: true,
    includeFeedPosts: true,
    triggerMode: "keywords_only",
    triggerKeywords: ["AULA", "TREINAMENTO", "CURSO", "ASSISTIR"],
    matchAnyKeyword: true,
    publicReplyVariations: [
      "Aula liberada! Acabei de enviar o link de acesso no seu Direct 🚀",
      "Prontinho! Link da aula enviado na sua mensagem privada ✨",
      "Te mandei o treinamento no inbox com acesso liberado! Confere lá 📲"
    ],
    publicReplyDelaySeconds: 3,
    autoLikeComment: true,
    targetFlowId: "flow_comment_dm",
    isActive: true,
    stats: {
      commentsChecked: 2150,
      dmsSent: 1840,
      conversionRate: 85.5
    }
  },
  {
    id: "cg_2",
    title: "Post Único: 'Lançamento Coleção Outono / Inverno'",
    channel: "instagram",
    postType: "specific_post",
    postId: "post_carrossel_02",
    postPreviewUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
    postCaption: "Quer o cupom de 20% OFF exclusivo de lançamento? Comente 'CUPOM' que eu te mando no privado!",
    targetPages: ["acc_ig_main", "acc_ig_store"],
    applyToAllPages: false,
    includeReels: true,
    includeFeedPosts: true,
    triggerMode: "keywords_only",
    triggerKeywords: ["CUPOM", "DESCONTO", "20%", "VIP"],
    matchAnyKeyword: true,
    publicReplyVariations: [
      "Cupom enviado no seu Direct com carinho! 🎁",
      "Te chamei no direct com o código de 20% OFF! Aproveite ✨",
      "Olha seu direct! Cupom exclusivo liberado 🛍️"
    ],
    publicReplyDelaySeconds: 2,
    autoLikeComment: true,
    targetFlowId: "flow_comment_dm",
    isActive: true,
    stats: {
      commentsChecked: 870,
      dmsSent: 790,
      conversionRate: 90.8
    }
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: "contact_1",
    name: "Camila Silveira",
    username: "@camilasilveira.style",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    channel: "instagram",
    email: "camila.silveira@gmail.com",
    phone: "+55 11 98877-6655",
    tags: ["Lead-Quente-Instagram", "Comprou-Colecao", "VIP", "Interesse-Cupom"],
    customFields: {
      interesse: "Moda Feminina",
      cupom_utilizado: "VIP25",
      cidade: "São Paulo - SP"
    },
    status: "active",
    internalNotes: [
      {
        id: "note_1",
        author: "Ana Beatriz",
        authorRole: "Sucesso do Cliente",
        content: "Cliente comprou com o cupom VIP25 após receber a automação no Direct. Extremamente receptiva!",
        category: "sales",
        createdAt: "Hoje às 14:20",
        isPinned: true
      },
      {
        id: "note_2",
        author: "Carlos Menezes",
        authorRole: "Vendas",
        content: "Tem interesse na próxima coleção de verão. Enviar link antecipado de pré-venda.",
        category: "followup",
        createdAt: "Hoje às 14:35"
      }
    ],
    activityLogs: [
      {
        id: "act_1_1",
        type: "tag_added",
        title: "Tag Atribuída pelo Bot",
        description: "Bot atribuiu a tag 'Comprou-Colecao' após confirmação do checkout com cupom VIP25.",
        timestamp: "Hoje às 14:18",
        actor: "bot",
        tagName: "Comprou-Colecao",
        flowTitle: "Automação Pós-Venda"
      },
      {
        id: "act_1_2",
        type: "button_clicked",
        title: "Clique em Botão no Direct",
        description: "Lead clicou no botão '🎁 Usar Cupom (15% OFF)' e foi redirecionada para a página de checkout.",
        timestamp: "Hoje às 14:15",
        actor: "user",
        buttonText: "🎁 Usar Cupom (15% OFF)",
        flowTitle: "Instagram Boas-Vindas (Variante B)",
        nodeTitle: "Mensagem 1: Oferta Boas-Vindas"
      },
      {
        id: "act_1_3",
        type: "tag_added",
        title: "Tag Atribuída via Clique",
        description: "Bot atribuiu automaticamente a tag 'Interesse-Cupom' configurada no botão de oferta.",
        timestamp: "Hoje às 14:15",
        actor: "bot",
        tagName: "Interesse-Cupom",
        buttonText: "🎁 Usar Cupom (15% OFF)"
      },
      {
        id: "act_1_4",
        type: "node_executed",
        title: "Mensagem de Boas-Vindas Enviada",
        description: "Bot enviou a mensagem 'Olá {first_name}! 🎁 Bem-vindo ao Instagram da ManyFlow...' com botões interativos.",
        timestamp: "Hoje às 14:14",
        actor: "bot",
        flowTitle: "Instagram Boas-Vindas (Variante B)",
        nodeTitle: "Mensagem 1 (Variante B)"
      },
      {
        id: "act_1_5",
        type: "comment_keyword_triggered",
        title: "Gatilho de Comentário Acionado",
        description: "Lead comentou a palavra 'QUERO' no Reel de Nova Coleção (#3412). Bot curtiu o comentário, respondeu publicamente e abriu conversa no Direct.",
        timestamp: "Hoje às 14:14",
        actor: "system",
        postCaption: "Lançamento Nova Coleção Primavera/Verão ✨ Comente QUERO para receber cupom!",
        flowTitle: "Instagram Comentário no Post ➔ Envio no Direct"
      },
      {
        id: "act_1_6",
        type: "broadcast_received",
        title: "Transmissão em Massa Recebida",
        description: "Lead recebeu a mensagem da campanha de transmissão 'Super Desconto de Sexta - 20% OFF'.",
        timestamp: "Ontem às 10:00",
        actor: "bot",
        campaignName: "Super Desconto de Sexta"
      },
      {
        id: "act_1_7",
        type: "tag_added",
        title: "Tag Atribuída no Cadastro",
        description: "Bot atribuiu a tag 'Lead-Quente-Instagram' e 'VIP' no momento da entrada no funil.",
        timestamp: "27 de Agosto às 10:15",
        actor: "bot",
        tagName: "Lead-Quente-Instagram"
      }
    ],
    createdAt: "2026-08-27T10:15:00Z",
    lastInteractionAt: "Hoje às 14:15",
    totalInteractions: 14,
    lifetimeValue: 489.90
  },
  {
    id: "contact_2",
    name: "Rodrigo Mendonça",
    username: "@rodrigo_techdev",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    channel: "instagram",
    email: "rodrigo.mendonca@empresa.com.br",
    phone: "+55 21 97766-5544",
    tags: ["Lead-Qualificado", "Duvida-API", "Interesse-Planos"],
    customFields: {
      interesse: "Plano Anual ManyFlow",
      tamanho_time: "5 atendentes"
    },
    status: "human_assigned",
    assignedAgent: "Lucas Santos (Vendas)",
    notes: "Interesse em integrar com CRM próprio via webhook.",
    internalNotes: [
      {
        id: "note_3",
        author: "Lucas Santos",
        authorRole: "Executivo de Contas",
        content: "Lead corporativo quente com time de 5 atendentes. Solicitou documentação de Webhooks e API REST para homologação.",
        category: "important",
        createdAt: "Hoje às 13:45",
        isPinned: true
      },
      {
        id: "note_4",
        author: "Lucas Santos",
        authorRole: "Executivo de Contas",
        content: "Agendada call técnica para amanhã às 10h com o CTO da empresa dele.",
        category: "followup",
        createdAt: "Hoje às 13:50"
      }
    ],
    activityLogs: [
      {
        id: "act_2_1",
        type: "human_handover",
        title: "Transferência para Atendente Humano",
        description: "Bot foi pausado automaticamente após o lead solicitar suporte técnico avançado sobre Webhooks e API.",
        timestamp: "Hoje às 13:42",
        actor: "bot",
        flowTitle: "Instagram Boas-Vindas & Suporte",
        nodeTitle: "Pausar Bot & Handover"
      },
      {
        id: "act_2_2",
        type: "tag_added",
        title: "Tag Atribuída via Ação",
        description: "Bot atribuiu a tag 'Lead-Qualificado' e 'Duvida-API' para roteamento na fila de vendas.",
        timestamp: "Hoje às 13:42",
        actor: "bot",
        tagName: "Duvida-API"
      },
      {
        id: "act_2_3",
        type: "button_clicked",
        title: "Clique em Botão de Suporte VIP",
        description: "Lead clicou no botão '💬 Falar com Especialista' dentro da mensagem de opções.",
        timestamp: "Hoje às 13:41",
        actor: "user",
        buttonText: "💬 Falar com Especialista",
        flowTitle: "Instagram Boas-Vindas",
        nodeTitle: "Mensagem Inicial"
      },
      {
        id: "act_2_4",
        type: "button_clicked",
        title: "Clique em Botão de Planos",
        description: "Lead clicou no botão '🛍️ Explorar Catálogo & Planos'.",
        timestamp: "Hoje às 13:40",
        actor: "user",
        buttonText: "🛍️ Explorar Catálogo & Planos",
        flowTitle: "Instagram Boas-Vindas"
      },
      {
        id: "act_2_5",
        type: "tag_added",
        title: "Tag Atribuída pelo Bot",
        description: "Bot rotulou o lead com 'Interesse-Planos' ao navegar pelas opções de precificação.",
        timestamp: "Hoje às 13:40",
        actor: "bot",
        tagName: "Interesse-Planos"
      },
      {
        id: "act_2_6",
        type: "flow_triggered",
        title: "Fluxo de Entrada Disparado",
        description: "Lead enviou a palavra-chave 'PLANOS' no Direct, ativando o fluxo de Boas-Vindas e Qualificação.",
        timestamp: "Hoje às 13:39",
        actor: "system",
        flowTitle: "Instagram Boas-Vindas & Qualificação de Leads"
      }
    ],
    createdAt: "2026-08-28T08:30:00Z",
    lastInteractionAt: "Hoje às 13:40",
    totalInteractions: 8,
    lifetimeValue: 0
  },
  {
    id: "contact_3",
    name: "Mariana Costa",
    username: "mariana.costa.fb",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    channel: "messenger",
    email: "mari.costa@yahoo.com.br",
    phone: "+55 31 99123-4567",
    tags: ["Messenger-Lead", "E-commerce", "Interesse-Catalogo"],
    customFields: {
      segmento: "Cosméticos Naturais",
      volume_msgs: "100 a 300 msgs/dia"
    },
    status: "active",
    internalNotes: [
      {
        id: "note_5",
        author: "Juliana Rocha",
        authorRole: "Atendimento",
        content: "Chegou pelo botão Começar no Facebook Messenger. Respondeu quiz de qualificação para loja de cosméticos.",
        category: "general",
        createdAt: "Ontem às 18:05"
      }
    ],
    activityLogs: [
      {
        id: "act_3_1",
        type: "custom_field_updated",
        title: "Campo Customizado Atualizado",
        description: "Bot capturou o segmento da loja: {segmento} = 'Cosméticos Naturais' através do quiz interativo.",
        timestamp: "Ontem às 18:02",
        actor: "bot",
        fieldName: "segmento",
        fieldValue: "Cosméticos Naturais"
      },
      {
        id: "act_3_2",
        type: "quick_reply_clicked",
        title: "Resposta Rápida Clicada",
        description: "Lead selecionou a opção '🛍️ Ver Catálogo' no Messenger.",
        timestamp: "Ontem às 18:01",
        actor: "user",
        buttonText: "🛍️ Ver Catálogo",
        flowTitle: "Facebook Messenger Boas-Vindas"
      },
      {
        id: "act_3_3",
        type: "tag_added",
        title: "Tag Atribuída pelo Bot",
        description: "Bot aplicou a tag 'Interesse-Catalogo' após o clique no catálogo.",
        timestamp: "Ontem às 18:01",
        actor: "bot",
        tagName: "Interesse-Catalogo"
      },
      {
        id: "act_3_4",
        type: "flow_triggered",
        title: "Gatilho Botão 'Começar' no Messenger",
        description: "Lead iniciou a conversa pelo botão 'Começar' na Página do Facebook.",
        timestamp: "Ontem às 18:00",
        actor: "system",
        flowTitle: "Facebook Messenger Boas-Vindas"
      }
    ],
    createdAt: "2026-08-25T14:20:00Z",
    lastInteractionAt: "Ontem às 18:00",
    totalInteractions: 5,
    lifetimeValue: 199.00
  },
  {
    id: "contact_4",
    name: "Felipe Almeida",
    username: "@felipe.personalfit",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    channel: "instagram",
    email: "felipe.personal@hotmail.com",
    phone: "+55 11 97111-2233",
    tags: ["Comentou-Reel", "Quer-Consultoria", "VIP", "Interesse-Cupom"],
    customFields: {
      interesse: "Consultoria Fitness & Treinos",
      cidade: "São Paulo - SP",
      cupom: "FITNESS20",
      cargo: "Personal Trainer"
    },
    status: "active",
    internalNotes: [
      {
        id: "note_6",
        author: "Carlos Menezes",
        authorRole: "Vendas",
        content: "Comentou no Reel sobre automação de agendamentos para consultoria fitness.",
        category: "sales",
        createdAt: "Hoje às 11:30"
      }
    ],
    activityLogs: [
      {
        id: "act_4_1",
        type: "button_clicked",
        title: "Clique em Botão de Resgate",
        description: "Lead clicou no botão '🎁 Quero o Cupom 25%' no Direct.",
        timestamp: "Hoje às 11:22",
        actor: "user",
        buttonText: "🎁 Quero o Cupom 25%",
        flowTitle: "Instagram Comentário no Post ➔ Envio no Direct"
      },
      {
        id: "act_4_2",
        type: "tag_added",
        title: "Tag Atribuída via Ação no Fluxo",
        description: "Bot executou o nó de ação 'Adicionar Tag: Quer-Consultoria' e 'Interesse-Cupom'.",
        timestamp: "Hoje às 11:22",
        actor: "bot",
        tagName: "Quer-Consultoria",
        flowTitle: "Instagram Comentário no Post ➔ Envio no Direct",
        nodeTitle: "Ação: Tag 'Lead-Quente-Cupom'"
      },
      {
        id: "act_4_3",
        type: "node_executed",
        title: "Envio de Oferta Personalizada",
        description: "Bot entregou mensagem com apresentação do plano para personal trainers e link de agendamento.",
        timestamp: "Hoje às 11:21",
        actor: "bot",
        flowTitle: "Instagram Comentário no Post ➔ Envio no Direct",
        nodeTitle: "Mensagem 1: Boas-vindas & Oferta VIP"
      },
      {
        id: "act_4_4",
        type: "comment_keyword_triggered",
        title: "Comentário Detectado no Reel",
        description: "Comentou a palavra 'CONSULTORIA' no Reel #4819. Resposta pública enviada em 2 segundos.",
        timestamp: "Hoje às 11:20",
        actor: "system",
        postCaption: "Como automatizar agendamentos de personal trainer pelo Instagram Direct 🏋️‍♂️",
        flowTitle: "Instagram Comentário no Post ➔ Envio no Direct"
      }
    ],
    createdAt: "2026-08-29T09:10:00Z",
    lastInteractionAt: "Hoje às 11:20",
    totalInteractions: 6
  },
  {
    id: "contact_5",
    name: "Juliana Duarte",
    username: "@juliana.duarte.arq",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    channel: "instagram",
    email: "juliana@duartearquitetura.com.br",
    phone: "+55 41 98822-3344",
    tags: ["Lead-Quente-Instagram", "VIP", "Comprou-Colecao", "Interesse-Catalogo"],
    customFields: {
      interesse: "Design de Interiores & Moda",
      cidade: "Curitiba - PR",
      cupom: "ARQVIP15",
      cargo: "Arquiteta Titular"
    },
    status: "active",
    activityLogs: [
      {
        id: "act_5_1",
        type: "tag_added",
        title: "Tag Atribuída pelo Bot",
        description: "Bot atribuiu a tag 'Comprou-Colecao' após confirmação de compra.",
        timestamp: "Hoje às 09:45",
        actor: "bot",
        tagName: "Comprou-Colecao"
      },
      {
        id: "act_5_2",
        type: "button_clicked",
        title: "Clique em Botão de Catálogo",
        description: "Lead clicou em '🛍️ Ver Produtos em Destaque' e visualizou os cards da galeria.",
        timestamp: "Hoje às 09:40",
        actor: "user",
        buttonText: "🛍️ Ver Produtos em Destaque",
        flowTitle: "Instagram Boas-Vindas"
      },
      {
        id: "act_5_3",
        type: "tag_added",
        title: "Tag Atribuída via Botão",
        description: "Bot rotulou o lead com 'Interesse-Catalogo'.",
        timestamp: "Hoje às 09:40",
        actor: "bot",
        tagName: "Interesse-Catalogo"
      },
      {
        id: "act_5_4",
        type: "flow_triggered",
        title: "Gatilho de Entrada Ativado",
        description: "Lead enviou mensagem via Instagram Direct após ver publicação no feed.",
        timestamp: "Hoje às 09:38",
        actor: "system",
        flowTitle: "Instagram Boas-Vindas"
      }
    ],
    createdAt: "2026-08-26T16:00:00Z",
    lastInteractionAt: "Hoje às 09:45",
    totalInteractions: 12,
    lifetimeValue: 890.00
  },
  {
    id: "contact_6",
    name: "Beatriz Nogueira",
    username: "beatriz.nogueira.store",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    channel: "messenger",
    email: "bia.nogueira@lojaonline.com",
    phone: "+55 19 99345-6789",
    tags: ["Messenger-Lead", "E-commerce", "VIP"],
    customFields: {
      interesse: "Moda Feminina & Calçados",
      cidade: "Campinas - SP",
      cupom: "VIP25",
      cargo: "Lojista"
    },
    status: "active",
    activityLogs: [
      {
        id: "act_6_1",
        type: "broadcast_received",
        title: "Transmissão Recebida",
        description: "Lead recebeu disparo em massa de Lançamento de Inverno.",
        timestamp: "Ontem às 16:30",
        actor: "bot",
        campaignName: "Lançamento Coleção Inverno"
      },
      {
        id: "act_6_2",
        type: "button_clicked",
        title: "Clique em Botão",
        description: "Lead clicou em '🎁 Aplicar Cupom VIP25'.",
        timestamp: "Ontem às 16:32",
        actor: "user",
        buttonText: "🎁 Aplicar Cupom VIP25"
      },
      {
        id: "act_6_3",
        type: "tag_added",
        title: "Tag Atribuída",
        description: "Bot rotulou o contato como 'VIP' e 'E-commerce'.",
        timestamp: "Ontem às 16:32",
        actor: "bot",
        tagName: "VIP"
      }
    ],
    createdAt: "2026-08-24T11:20:00Z",
    lastInteractionAt: "Ontem às 16:30",
    totalInteractions: 9,
    lifetimeValue: 640.00
  },
  {
    id: "contact_7",
    name: "Thiago Ribeiro",
    username: "@thiago.growth",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    channel: "instagram",
    email: "thiago@agenciagrowth.com.br",
    phone: "+55 11 96543-2109",
    tags: ["Lead-Qualificado", "Duvida-API", "Agencia", "Interesse-Planos"],
    customFields: {
      interesse: "Plano Enterprise Multi-Contas",
      cidade: "São Paulo - SP",
      cargo: "Head de Performance"
    },
    status: "active",
    activityLogs: [
      {
        id: "act_7_1",
        type: "button_clicked",
        title: "Clique em Botão de Parcerias",
        description: "Lead clicou em '💼 Programa de Agências e Afiliados'.",
        timestamp: "Hoje às 10:15",
        actor: "user",
        buttonText: "💼 Programa de Agências"
      },
      {
        id: "act_7_2",
        type: "tag_added",
        title: "Tag Atribuída pelo Bot",
        description: "Bot aplicou a tag 'Agencia' e 'Interesse-Planos'.",
        timestamp: "Hoje às 10:15",
        actor: "bot",
        tagName: "Agencia"
      },
      {
        id: "act_7_3",
        type: "flow_triggered",
        title: "Gatilho de Palavra-Chave",
        description: "Lead digitou a palavra-chave 'AGÊNCIA' no direct.",
        timestamp: "Hoje às 10:12",
        actor: "system",
        flowTitle: "Instagram Parcerias & Agências"
      }
    ],
    createdAt: "2026-08-28T14:10:00Z",
    lastInteractionAt: "Hoje às 10:15",
    totalInteractions: 11
  },
  {
    id: "contact_8",
    name: "Larissa Pires",
    username: "@laripires.beauty",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    channel: "instagram",
    email: "larissa@esteticabeauty.com",
    tags: ["Comentou-Reel", "Lead-Quente-Instagram", "Interesse-Cupom"],
    customFields: {
      interesse: "Estética & Beleza",
      cidade: "Belo Horizonte - MG",
      cupom: "BEMVINDO15"
    },
    status: "active",
    activityLogs: [
      {
        id: "act_8_1",
        type: "button_clicked",
        title: "Clique em Botão de Cupom",
        description: "Lead clicou em '🎁 Usar Cupom (15% OFF)' e abriu o link promocional.",
        timestamp: "Hoje às 12:50",
        actor: "user",
        buttonText: "🎁 Usar Cupom (15% OFF)"
      },
      {
        id: "act_8_2",
        type: "tag_added",
        title: "Tag Atribuída pelo Bot",
        description: "Bot aplicou a tag 'Interesse-Cupom'.",
        timestamp: "Hoje às 12:50",
        actor: "bot",
        tagName: "Interesse-Cupom"
      },
      {
        id: "act_8_3",
        type: "comment_keyword_triggered",
        title: "Gatilho de Comentário",
        description: "Comentou 'CUPOM' no Reel de Estética Facial.",
        timestamp: "Hoje às 12:48",
        actor: "system",
        postCaption: "Transformação incrível! Quer 15% OFF no procedimento? Comente CUPOM 👇"
      }
    ],
    createdAt: "2026-08-29T08:00:00Z",
    lastInteractionAt: "Hoje às 12:50",
    totalInteractions: 4
  }
];

export const INITIAL_CONVERSATIONS: LiveConversation[] = [
  {
    id: "conv_1",
    contactId: "contact_1",
    contact: INITIAL_CONTACTS[0],
    channel: "instagram",
    unreadCount: 0,
    isBotActive: true,
    status: "open",
    lastMessage: {
      text: "Acabei de realizar a compra com o cupom VIP25! Muito obrigada pela rapidez no atendimento 💖",
      timestamp: "14:15",
      sender: "user"
    },
    messages: [
      {
        id: "m_1",
        sender: "user",
        channel: "instagram",
        text: "QUERO",
        timestamp: "14:10",
        status: "read"
      },
      {
        id: "m_2",
        sender: "bot",
        channel: "instagram",
        text: "Olá Camila! 🚀 Vi seu comentário e vim correndo te entregar o acesso VIP.\n\nLiberamos 25% de desconto para novos alunos hoje! Deseja resgatar agora?",
        timestamp: "14:10",
        buttons: [
          { id: "b1", text: "🎁 Quero o Cupom 25%", type: "flow" }
        ],
        status: "read"
      },
      {
        id: "m_3",
        sender: "user",
        channel: "instagram",
        text: "🎁 Quero o Cupom 25%",
        timestamp: "14:11",
        status: "read"
      },
      {
        id: "m_4",
        sender: "bot",
        channel: "instagram",
        text: "Perfeito Camila! 🥳\n\nClique no botão abaixo para garantir sua vaga com 25% OFF já aplicado no checkout:\n\n👉 https://metodo-pro.com/checkout?cupom=VIP25\n\n*Oferta válida somente pelas próximas 2 horas!*",
        timestamp: "14:11",
        buttons: [
          { id: "b2", text: "🛒 Acessar Oferta Agora", type: "url", value: "https://metodo-pro.com" }
        ],
        status: "read"
      },
      {
        id: "m_5",
        sender: "user",
        channel: "instagram",
        text: "Acabei de realizar a compra com o cupom VIP25! Muito obrigada pela rapidez no atendimento 💖",
        timestamp: "14:15",
        status: "read"
      },
      {
        id: "m_6",
        sender: "bot",
        channel: "instagram",
        text: "Que maravilha, Camila! Parabéns pela decisão! 🌟 Já te enviamos os dados de acesso no e-mail cadastrado. Seja super bem-vinda!",
        timestamp: "14:16",
        status: "delivered"
      }
    ]
  },
  {
    id: "conv_2",
    contactId: "contact_2",
    contact: INITIAL_CONTACTS[1],
    channel: "instagram",
    unreadCount: 2,
    isBotActive: false,
    assignedTo: "Lucas Santos",
    status: "human_takeover",
    lastMessage: {
      text: "Vocês conseguem me mandar a documentação da API para eu validar com os desenvolvedores da minha equipe?",
      timestamp: "13:40",
      sender: "user"
    },
    messages: [
      {
        id: "m_20",
        sender: "user",
        channel: "instagram",
        text: "Olá, gostaria de saber se a automação funciona para 5 contas do Instagram simultaneamente e tem webhook.",
        timestamp: "13:30",
        status: "read"
      },
      {
        id: "m_21",
        sender: "bot",
        channel: "instagram",
        text: "Olá Rodrigo! Sim, nosso plano Enterprise suporta múltiplas contas e dispõe de Webhooks em tempo real e API REST completa para integração com seu banco de dados.",
        timestamp: "13:31",
        status: "read"
      },
      {
        id: "m_22",
        sender: "user",
        channel: "instagram",
        text: "Vocês conseguem me mandar a documentação da API para eu validar com os desenvolvedores da minha equipe?",
        timestamp: "13:40",
        status: "delivered"
      }
    ]
  },
  {
    id: "conv_3",
    contactId: "contact_3",
    contact: INITIAL_CONTACTS[2],
    channel: "messenger",
    unreadCount: 0,
    isBotActive: true,
    status: "resolved",
    lastMessage: {
      text: "Combinado, vou aguardar o contato de vocês no WhatsApp!",
      timestamp: "Ontem às 18:00",
      sender: "user"
    },
    messages: [
      {
        id: "m_30",
        sender: "user",
        channel: "messenger",
        text: "Começar",
        timestamp: "Ontem às 17:50",
        status: "read"
      },
      {
        id: "m_31",
        sender: "bot",
        channel: "messenger",
        text: "Olá Mariana! Bem-vinda ao atendimento da ManyFlow. 🚀 Para te direcionar ao especialista certo, qual é a sua área de atuação?",
        timestamp: "Ontem às 17:50",
        status: "read"
      },
      {
        id: "m_32",
        sender: "user",
        channel: "messenger",
        text: "🛍️ E-commerce / Loja",
        timestamp: "Ontem às 17:52",
        status: "read"
      },
      {
        id: "m_33",
        sender: "user",
        channel: "messenger",
        text: "Combinado, vou aguardar o contato de vocês no WhatsApp!",
        timestamp: "Ontem às 18:00",
        status: "read"
      }
    ]
  }
];

export const INITIAL_KNOWLEDGE_BASE: BotKnowledgeBase = {
  companyName: "ManyFlow Automações",
  businessSummary: "Plataforma líder em automação inteligente de mensagens, vendas pelo direct e atendimento 24 horas no Instagram e Facebook Messenger.",
  productsAndPricing: "Plano Starter: R$ 97/mês (até 2.500 contatos). Plano Pro: R$ 197/mês (até 10.000 contatos + IA Gemini Ilimitada). Plano Enterprise: R$ 497/mês (múltiplas contas + API).",
  shippingAndReturns: "Garantia incondicional de 14 dias para cancelamento com reembolso total. Ativação imediata após a confirmação do pagamento.",
  workingHours: "Atendimento automático com IA: 24 horas por dia, 7 dias por semana. Atendimento com time humano: Segunda a Sexta, das 08h às 19h (horário de Brasília).",
  contactWhatsapp: "+55 11 99999-8888",
  toneOfVoice: "friendly",
  enableAIFallback: true,
  humanHandoverKeywords: ["humano", "atendente", "falar com pessoa", "reclamacao", "cancelar", "problema grave"]
};

export const INITIAL_META_CONFIG: MetaConnectionConfig = {
  instagramConnected: true,
  instagramHandle: "@manyflow.oficial",
  instagramFollowers: "48.2K",
  facebookConnected: true,
  facebookPageName: "ManyFlow Brasil - Automações",
  metaAppId: "982736154819203",
  webhookStatus: "active",
  tokenExpiresAt: "2027-02-28T00:00:00Z",
  lastSyncAt: "Há 2 minutos"
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

export const INITIAL_BROADCASTS: BroadcastCampaign[] = [
  {
    id: "bc_1",
    name: "⚡ Oferta VIP Relâmpago: 25% OFF em Coleção Exclusiva",
    channel: "instagram",
    status: "completed",
    messageText: "Olá {first_name}! 🌟 Como você faz parte do nosso grupo VIP no Instagram, liberamos um desconto especial!\n\nUse o cupom *{cupom}* e aproveite frete grátis para {cidade} nas compras acima de R$ 150.\n\nToque no botão abaixo para garantir suas peças antes que esgote:",
    mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    buttons: [
      {
        id: "btn_bc_1",
        text: "🛍️ Resgatar Cupom de 25%",
        type: "url",
        value: "https://manyflow.io/oferta-vip"
      },
      {
        id: "btn_bc_2",
        text: "💬 Falar com Consultor",
        type: "handover"
      }
    ],
    quickReplies: [
      { id: "qr_1", text: "Ver Catálogo 👗" },
      { id: "qr_2", text: "Tirar Dúvida ❓" }
    ],
    metaMessageTag: "MARKETING_OPT_IN",
    targetFilter: {
      channel: "instagram",
      tagMode: "any",
      tags: ["VIP", "Lead-Quente-Instagram"],
      contactStatus: "active"
    },
    createdAt: "2026-08-27T10:00:00Z",
    sentAt: "2026-08-28T19:30:00Z",
    totalTargeted: 1420,
    totalSent: 1420,
    totalDelivered: 1395,
    totalOpened: 1180,
    totalClicked: 498,
    totalFailed: 25,
    progressPercent: 100,
    throttleSpeed: "safe",
    recipients: [
      {
        contactId: "contact_1",
        contactName: "Camila Silveira",
        username: "@camilasilveira.style",
        channel: "instagram",
        status: "read",
        deliveredAt: "Ontem às 19:31"
      },
      {
        contactId: "contact_5",
        contactName: "Juliana Duarte",
        username: "@juliana.duarte.arq",
        channel: "instagram",
        status: "read",
        deliveredAt: "Ontem às 19:32"
      },
      {
        contactId: "contact_4",
        contactName: "Felipe Almeida",
        username: "@felipe.personalfit",
        channel: "instagram",
        status: "delivered",
        deliveredAt: "Ontem às 19:33"
      }
    ]
  },
  {
    id: "bc_2",
    name: "🚀 Lançamento: Masterclass de Automação & Vendas com IA",
    channel: "omnichannel",
    status: "scheduled",
    messageText: "Oi {first_name}! 🚀 Notamos que você tem interesse em {interesse}.\n\nNesta quinta-feira às 20h vamos liberar ao vivo o novo treinamento prático sobre como automatizar seu Direct no Instagram e Messenger.\n\nGaranta sua vaga gratuita tocando no botão abaixo:",
    mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    buttons: [
      {
        id: "btn_bc_3",
        text: "🎟️ Garantir Vaga Gratuita",
        type: "url",
        value: "https://manyflow.io/masterclass-ia"
      }
    ],
    metaMessageTag: "CONFIRMED_EVENT_UPDATE",
    targetFilter: {
      channel: "all",
      tagMode: "any",
      tags: ["Lead-Qualificado", "E-commerce", "Duvida-API"],
      contactStatus: "active"
    },
    scheduledFor: "2026-08-31T20:00:00Z",
    createdAt: "2026-08-29T11:00:00Z",
    totalTargeted: 890,
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalFailed: 0,
    progressPercent: 0,
    throttleSpeed: "safe",
    recipients: [
      {
        contactId: "contact_2",
        contactName: "Rodrigo Mendonça",
        username: "@rodrigo_techdev",
        channel: "instagram",
        status: "pending"
      },
      {
        contactId: "contact_3",
        contactName: "Mariana Costa",
        username: "mariana.costa.fb",
        channel: "messenger",
        status: "pending"
      },
      {
        contactId: "contact_7",
        contactName: "Thiago Ribeiro",
        username: "@thiago.growth",
        channel: "instagram",
        status: "pending"
      }
    ]
  },
  {
    id: "bc_3",
    name: "💬 Reengajamento: Clientes E-commerce & Lojas",
    broadcastType: "standard",
    channel: "messenger",
    status: "draft",
    messageText: "Olá {first_name}! Tudo bem?\n\nEstamos atualizando nossa plataforma com novos recursos para o Messenger da sua loja de {interesse}.\n\nGostaria de receber uma demonstração personalizada gratuita nesta semana?",
    metaMessageTag: "ACCOUNT_UPDATE",
    targetFilter: {
      channel: "messenger",
      tagMode: "any",
      tags: ["Messenger-Lead", "E-commerce"],
      contactStatus: "active"
    },
    buttons: [
      {
        id: "btn_bc_4",
        text: "✅ Quero uma Demonstração",
        type: "flow"
      }
    ],
    createdAt: "2026-08-29T12:30:00Z",
    totalTargeted: 340,
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalFailed: 0,
    progressPercent: 0,
    throttleSpeed: "medium"
  },
  {
    id: "bc_utility_1",
    name: "📦 Rastreio de Pedido & Atualização de Envio (Utility Meta Approved)",
    broadcastType: "utility",
    utilityTemplateId: "tpl_order_shipped",
    metaApprovalStatus: "APPROVED",
    channel: "instagram",
    status: "completed",
    messageText: "Olá {first_name}! 📦 Seu pedido #{pedido_id} foi despachado e já está a caminho de {cidade}.\n\nCódigo de rastreamento: *{codigo_rastreio}*.\nPrevisão de entrega: até 3 dias úteis.",
    metaMessageTag: "POST_PURCHASE_UPDATE",
    buttons: [
      {
        id: "btn_track_1",
        text: "🚚 Rastrear Encomenda",
        type: "url",
        value: "https://rastreio.manyflow.io"
      },
      {
        id: "btn_track_help",
        text: "❓ Dúvida sobre Entrega",
        type: "handover"
      }
    ],
    targetFilter: {
      channel: "instagram",
      tagMode: "any",
      tags: ["Cliente-Ativo", "VIP"],
      contactStatus: "active"
    },
    createdAt: "2026-08-29T08:00:00Z",
    sentAt: "2026-08-29T09:15:00Z",
    totalTargeted: 520,
    totalSent: 520,
    totalDelivered: 518,
    totalOpened: 489,
    totalClicked: 312,
    totalFailed: 2,
    progressPercent: 100,
    throttleSpeed: "safe",
    recipients: [
      {
        contactId: "contact_1",
        contactName: "Camila Silveira",
        username: "@camilasilveira.style",
        channel: "instagram",
        status: "read",
        deliveredAt: "Hoje às 09:16"
      },
      {
        contactId: "contact_5",
        contactName: "Juliana Duarte",
        username: "@juliana.duarte.arq",
        channel: "instagram",
        status: "read",
        deliveredAt: "Hoje às 09:17"
      }
    ]
  }
];

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


