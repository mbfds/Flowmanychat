import { Flow, ChannelType } from '../types';

export interface FlowTemplate {
  id: string;
  title: string;
  category: 'influencer' | 'infoproduct' | 'ecommerce' | 'adsense';
  categoryLabel: string;
  description: string;
  channel: ChannelType;
  expectedMetric: string;
  highlightBadge: string;
  tags: string[];
  flow: Flow;
}

export const FLOW_TEMPLATES: FlowTemplate[] = [
  // ==========================================
  // 1. INFLUENCIADORES DIGITAIS & CREATORS
  // ==========================================
  {
    id: 'tpl_influencer_comment_link',
    title: '📸 Comente "LINK" ou "QUERO" no Reel ➔ Entrega do Link de Afiliado/Parceria na DM',
    category: 'influencer',
    categoryLabel: '🌟 Influenciadores & Creators',
    description: 'Automatize a entrega de links de parcerias, looks do dia, produtos da Shopee/Amazon ou presets sempre que um seguidor comentar no seu Reels ou Post.',
    channel: 'instagram',
    expectedMetric: '94% Taxa de Entrega • +3.8x Cliques em Afiliados',
    highlightBadge: 'Mais Usado por Influenciadores',
    tags: ['Reels', 'Afiliados', 'Amazon', 'Shopee', 'Look do Dia', 'Instagram DM'],
    flow: {
      id: 'flow_tpl_influencer_link',
      title: '📸 Influencer: Entrega de Link de Afiliado / Look do Dia na DM',
      description: 'Disparado automaticamente quando um seguidor comenta palavras como LINK, QUERO, LOOK, COMPRAR no Reels ou Post.',
      channel: 'instagram',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { runs: 4210, completed: 3980, ctr: 94.2 },
      nodes: [
        {
          id: 'node_inf_trig_1',
          type: 'trigger',
          title: 'Gatilho: Comentou no Reels / Post',
          data: {
            triggerType: 'post_comment',
            keywords: ['LINK', 'QUERO', 'EU QUERO', 'LOOK', 'ONDE COMPROU', 'QUAL O LINK', 'PREÇO', 'SHOPEE', 'AMAZON'],
            matchType: 'contains',
            commentAutoLike: true,
            commentPublicReplies: [
              'Te enviei o link completo no Direct! Dá uma olhadinha lá 💖',
              'Prontinho! Link direto enviado no seu privado ✨',
              'Opa, acabei de te mandar na DM com cupom exclusivo! 🛍️'
            ]
          },
          position: { x: 40, y: 160 }
        },
        {
          id: 'node_inf_tag_lead',
          type: 'action',
          title: 'Ação: Tag "Seguidor-Interesse-Look"',
          data: {
            actionType: 'add_tag',
            tagToAdd: 'Influencer-Lead-Afiliado',
            fieldToSet: 'origem_campanha',
            fieldValue: 'Reels_Look_Shopee'
          },
          position: { x: 380, y: 160 }
        },
        {
          id: 'node_inf_delay',
          type: 'delay',
          title: 'Digitação Natural (1.5s)',
          data: {
            delaySeconds: 2,
            showTypingIndicator: true
          },
          position: { x: 680, y: 160 }
        },
        {
          id: 'node_inf_msg_dm',
          type: 'message',
          title: 'Mensagem DM: Link do Produto + Cupom',
          data: {
            text: 'Oiii {first_name}! Tudo bem? 💕\n\nVi que você pediu o link do look/produto no meu post! Aqui está o link com desconto exclusivo da minha parceria:\n\n👗 **Item:** Vestido / Look em Destaque\n🏷️ **Cupom Extra:** VIP10 (10% OFF no Checkout)\n\nClique no botão abaixo para ir direto para a loja:',
            buttons: [
              { id: 'btn_inf_buy', text: '🛍️ Ver Produto na Loja Oficial', type: 'url', value: 'https://shopee.com.br/link-afiliado-exclusivo', assignTag: 'Clicou-Link-Afiliado' },
              { id: 'btn_inf_other', text: '✨ Ver Outros Looks & Achadinhos', type: 'flow', targetNodeId: 'node_inf_achadinhos', assignTag: 'Interesse-Outros-Looks' }
            ],
            quickReplies: [
              { id: 'qr_inf_1', text: '🛍️ Abrir Link da Loja', assignTag: 'Clicou-Link-Afiliado' },
              { id: 'qr_inf_2', text: '📲 Entrar no Grupo VIP de Achados', targetNodeId: 'node_inf_grupo_vip', assignTag: 'Lead-Grupo-VIP' }
            ]
          },
          position: { x: 980, y: 160 }
        },
        {
          id: 'node_inf_achadinhos',
          type: 'message',
          title: 'Carrossel / Vitrine de Achadinhos',
          data: {
            text: 'Aqui estão outros itens favoritos com links diretos e descontos:\n\n1️⃣ Calça Alfaiataria Trend\n2️⃣ Bolsa Baguette Minimalista\n3️⃣ Acessórios Dourados',
            buttons: [
              { id: 'btn_inf_vitrine', text: '🌐 Minha Vitrine de Afiliados Completa', type: 'url', value: 'https://manyflow.io/vitrine-influencer' },
              { id: 'btn_inf_vip', text: '💎 Grupo VIP de Descontos no WhatsApp', type: 'flow', targetNodeId: 'node_inf_grupo_vip' }
            ]
          },
          position: { x: 1380, y: 80 }
        },
        {
          id: 'node_inf_grupo_vip',
          type: 'message',
          title: 'Convite para Comunidade VIP',
          data: {
            text: 'No meu Grupo VIP do WhatsApp eu aviso em primeira mão sempre que tem cupom bugado, promoções relâmpago e lançamentos!\n\nÉ 100% gratuito. Te espero lá 👇',
            buttons: [
              { id: 'btn_inf_wpp_vip', text: '🟢 Entrar no Grupo VIP Grátis', type: 'url', value: 'https://chat.whatsapp.com/exemplo-grupo-vip-influencer', assignTag: 'Entrou-Grupo-VIP' }
            ]
          },
          position: { x: 1380, y: 320 }
        }
      ],
      connections: [
        { fromNodeId: 'node_inf_trig_1', toNodeId: 'node_inf_tag_lead', handleType: 'default' },
        { fromNodeId: 'node_inf_tag_lead', toNodeId: 'node_inf_delay', handleType: 'default' },
        { fromNodeId: 'node_inf_delay', toNodeId: 'node_inf_msg_dm', handleType: 'default' },
        { fromNodeId: 'node_inf_msg_dm', toNodeId: 'node_inf_achadinhos', handleType: 'button', label: '✨ Ver Outros Looks' },
        { fromNodeId: 'node_inf_msg_dm', toNodeId: 'node_inf_grupo_vip', handleType: 'quick_reply', label: '📲 Entrar no Grupo VIP' },
        { fromNodeId: 'node_inf_achadinhos', toNodeId: 'node_inf_grupo_vip', handleType: 'button', label: '💎 Grupo VIP' }
      ]
    }
  },

  {
    id: 'tpl_influencer_story_mention',
    title: '📸 Menção nos Stories (@mention) ➔ Agradecimento Automático + Presente VIP',
    category: 'influencer',
    categoryLabel: '🌟 Influenciadores & Creators',
    description: 'Sempre que um seguidor marcar o seu @ nos Stories dele, envie um agradecimento imediato em vídeo/áudio ou um cupom exclusivo para fidelizar a audiência.',
    channel: 'instagram',
    expectedMetric: '98% Engajamento • Fortalecimento de Comunidade',
    highlightBadge: 'Fidelização & Brand Equity',
    tags: ['Stories', '@mention', 'Reconhecimento', 'Presente VIP', 'Engajamento'],
    flow: {
      id: 'flow_tpl_story_mention',
      title: '📸 Stories @Mention: Agradecimento Imediato + Cupom Fidelidade',
      description: 'Responde automaticamente seguidores que marcaram o perfil nos Stories.',
      channel: 'instagram',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { runs: 1850, completed: 1790, ctr: 96.5 },
      nodes: [
        {
          id: 'node_mention_trig',
          type: 'trigger',
          title: 'Gatilho: Menção nos Stories (@mention)',
          data: {
            triggerType: 'story_mention'
          },
          position: { x: 40, y: 150 }
        },
        {
          id: 'node_mention_tag',
          type: 'action',
          title: 'Tag "Super-Fã-Stories"',
          data: {
            actionType: 'add_tag',
            tagToAdd: 'Super-Fa-Engajado'
          },
          position: { x: 380, y: 150 }
        },
        {
          id: 'node_mention_msg',
          type: 'message',
          title: 'Agradecimento Carinhoso + Mimo Exclusivo',
          data: {
            text: 'Aaaah {first_name}! 😍 Muito obrigado por me marcar nos seus Stories!\n\nFico muito feliz com seu carinho de verdade! Como forma de agradecimento, separei um presentinho especial só para quem compartilha nossos conteúdos:\n\n🎁 **Cupom:** MEUS_STORIES (15% OFF)\n✨ Ou baixe meu Preset de Edição de Fotos gratuito!',
            buttons: [
              { id: 'btn_m_preset', text: '🎨 Baixar Preset Grátis (Lightroom)', type: 'url', value: 'https://manyflow.io/preset-gratis', assignTag: 'Baixou-Preset-Gratis' },
              { id: 'btn_m_cupom', text: '🛍️ Usar Cupom na Minha Loja', type: 'url', value: 'https://manyflow.io/loja?cupom=MEUS_STORIES', assignTag: 'Usou-Cupom-Stories' }
            ],
            quickReplies: [
              { id: 'qr_m1', text: 'Adorei o presente! ❤️' },
              { id: 'qr_m2', text: 'Qual sua próxima live?' }
            ]
          },
          position: { x: 740, y: 150 }
        }
      ],
      connections: [
        { fromNodeId: 'node_mention_trig', toNodeId: 'node_mention_tag', handleType: 'default' },
        { fromNodeId: 'node_mention_tag', toNodeId: 'node_mention_msg', handleType: 'default' }
      ]
    }
  },

  // ==========================================
  // 2. INFOPRODUTOS & CURSOS DIGITAIS
  // ==========================================
  {
    id: 'tpl_infoproduct_leadmagnet_upsell',
    title: '🎓 Entrega de E-book / Isca Digital VIP ➔ Oferta Flash de Upsell (Kiwify/Hotmart)',
    category: 'infoproduct',
    categoryLabel: '💻 Infoprodutos & Cursos',
    description: 'Entrega o PDF/Planilha prometido no Reels em 2 segundos e apresenta uma oferta relâmpago do curso completo com desconto de 15 minutos.',
    channel: 'omnichannel',
    expectedMetric: '31.4% Conversão em Upsell • Zero Fuga de Leads',
    highlightBadge: 'Campeão de Vendas em Infoproduto',
    tags: ['Kiwify', 'Hotmart', 'Eduzz', 'E-book', 'Isca Digital', 'Upsell', 'Curso'],
    flow: {
      id: 'flow_tpl_leadmagnet_upsell',
      title: '🎓 Infoproduto: Entrega de Isca Digital + Upsell Flash',
      description: 'Funil de alta conversão para captura de leads e venda direta de infoproduto na DM.',
      channel: 'omnichannel',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { runs: 3820, completed: 3510, ctr: 91.8 },
      nodes: [
        {
          id: 'node_lm_trig',
          type: 'trigger',
          title: 'Gatilho: Palavras "EBOOK", "GUIA", "MAPA", "AULA"',
          data: {
            triggerType: 'keyword',
            keywords: ['EBOOK', 'GUIA', 'MAPA', 'AULA', 'MATERIAL', 'PDF', 'PLANILHA', 'QUERO O EBOOK', 'BAIXAR'],
            matchType: 'contains'
          },
          position: { x: 40, y: 180 }
        },
        {
          id: 'node_lm_tag',
          type: 'action',
          title: 'Tag CRM: "Lead-Isca-Entregue"',
          data: {
            actionType: 'add_tag',
            tagToAdd: 'Lead-Isca-Baixada',
            fieldToSet: 'etapa_funil',
            fieldValue: 'Isca_Entregue'
          },
          position: { x: 380, y: 180 }
        },
        {
          id: 'node_lm_delivery',
          type: 'message',
          title: 'Entrega Imediata do Material (PDF)',
          data: {
            text: 'Prontinho {first_name}! 🚀 Seu material está liberado:\n\n📘 **Guia Prático: O Passo a Passo Definitivo para Escalar**\n\nClique no botão abaixo para baixar ou abrir no seu celular agora:',
            buttons: [
              { id: 'btn_download_pdf', text: '📥 Baixar E-book em PDF Grátis', type: 'url', value: 'https://cdn.manyflow.io/materiais/guia_estrategico.pdf', assignTag: 'Download-Concluido' }
            ]
          },
          position: { x: 740, y: 180 }
        },
        {
          id: 'node_lm_delay',
          type: 'delay',
          title: 'Pausa Estratégica (8 segundos)',
          data: {
            delaySeconds: 8,
            showTypingIndicator: true
          },
          position: { x: 1100, y: 180 }
        },
        {
          id: 'node_lm_upsell',
          type: 'message',
          title: 'Oferta Flash de Upsell (Com Cupom)',
          data: {
            text: 'Ei {first_name}, uma oportunidade única antes de você começar a ler! ⏳\n\nLiberamos uma condição especial para quem baixou o guia hoje: o **Curso Completo + 5 Mentorias Gravadas** de ~~R$ 297~~ por apenas **12x de R$ 9,70** (ou R$ 97 à vista)!\n\n*Apenas para os 20 primeiros de hoje.* Deseja garantir sua vaga?',
            buttons: [
              { id: 'btn_buy_upsell', text: '💳 Garantir Vaga com 67% OFF', type: 'url', value: 'https://pay.kiwify.com.br/exemplo-checkout?cupom=FLASH67', assignTag: 'Clicou-Checkout-Upsell' },
              { id: 'btn_doubt_ai', text: '🤖 Tirar Dúvidas sobre o Curso', type: 'flow', targetNodeId: 'node_lm_ai_qa', assignTag: 'Duvida-Infoproduto' }
            ],
            quickReplies: [
              { id: 'qr_up_sim', text: 'Sim, quero a oferta de R$97!' },
              { id: 'qr_up_duvida', text: 'Tem certificado e garantia?', targetNodeId: 'node_lm_ai_qa' }
            ]
          },
          position: { x: 1420, y: 180 }
        },
        {
          id: 'node_lm_ai_qa',
          type: 'ai_step',
          title: 'IA Especialista em Vendas & Objeções',
          data: {
            aiPrompt: 'Responda dúvidas sobre acesso vitalício, garantia de 7 dias incondicional, formas de pagamento via PIX e cartão em até 12x, e incentive a finalizar a compra pelo link oficial.'
          },
          position: { x: 1820, y: 180 }
        }
      ],
      connections: [
        { fromNodeId: 'node_lm_trig', toNodeId: 'node_lm_tag', handleType: 'default' },
        { fromNodeId: 'node_lm_tag', toNodeId: 'node_lm_delivery', handleType: 'default' },
        { fromNodeId: 'node_lm_delivery', toNodeId: 'node_lm_delay', handleType: 'default' },
        { fromNodeId: 'node_lm_delay', toNodeId: 'node_lm_upsell', handleType: 'default' },
        { fromNodeId: 'node_lm_upsell', toNodeId: 'node_lm_ai_qa', handleType: 'button', label: '🤖 Tirar Dúvidas' }
      ]
    }
  },

  {
    id: 'tpl_infoproduct_mentorship_application',
    title: '🎓 Aplicação & Qualificação para Mentoria High-Ticket / Consultoria',
    category: 'infoproduct',
    categoryLabel: '💻 Infoprodutos & Cursos',
    description: 'Qualifique leads para produtos de ticket alto (R$ 2.000 a R$ 15.000) perguntando faturamento, nicho e principal gargalo antes de transferir para o Closer.',
    channel: 'omnichannel',
    expectedMetric: 'Lead Score Automático • 100% Leads Qualificados',
    highlightBadge: 'High-Ticket & Closer',
    tags: ['Mentoria', 'High-Ticket', 'Qualificação', 'Closer', 'Formulário DM', 'WhatsApp'],
    flow: {
      id: 'flow_tpl_mentorship_qualify',
      title: '🎓 Mentoria High-Ticket: Formulário de Aplicação & Agendamento',
      description: 'Filtra leads com poder de investimento e agenda ligação com o time comercial.',
      channel: 'omnichannel',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { runs: 940, completed: 860, ctr: 91.4 },
      nodes: [
        {
          id: 'node_men_trig',
          type: 'trigger',
          title: 'Gatilho: "MENTORIA", "CONSULTORIA", "APLICAR"',
          data: {
            triggerType: 'keyword',
            keywords: ['MENTORIA', 'CONSULTORIA', 'APLICAÇÃO', 'QUERO MENTORIA', 'HIGH TICKET', 'INDIVIDUAL'],
            matchType: 'contains'
          },
          position: { x: 40, y: 150 }
        },
        {
          id: 'node_men_q1',
          type: 'message',
          title: 'Pergunta 1: Faturamento Mensal Atual',
          data: {
            text: 'Olá {first_name}! 🦅 Seja muito bem-vindo à aplicação para a nossa **Mentoria Individual de Escala**.\n\nPara sabermos se sua empresa está no momento ideal para o nosso acompanhamento, qual é a sua média de faturamento mensal hoje?',
            buttons: [
              { id: 'btn_fat_1', text: '💵 Até R$ 10.000/mês', type: 'flow', targetNodeId: 'node_men_low_ticket', assignTag: 'Faturamento-Ate-10k' },
              { id: 'btn_fat_2', text: '🚀 De R$ 10k a R$ 50k/mês', type: 'flow', targetNodeId: 'node_men_approved', assignTag: 'Faturamento-10k-50k' },
              { id: 'btn_fat_3', text: '🏆 Acima de R$ 50k/mês', type: 'flow', targetNodeId: 'node_men_vip_approved', assignTag: 'Faturamento-50k-Plus' }
            ]
          },
          position: { x: 380, y: 150 }
        },
        {
          id: 'node_men_approved',
          type: 'message',
          title: 'Aprovado para Diagnóstico VIP',
          data: {
            text: 'Excelente {first_name}! O seu negócio tem exatamente o perfil que escalamos na Mentoria.\n\nNosso especialista reservou um horário de 30 minutos para traçar seu plano de ação individual.',
            buttons: [
              { id: 'btn_agendar_call', text: '📅 Agendar Sessão Estratégica (Google Meet)', type: 'url', value: 'https://calendly.com/mentoria-escala/sessao-diagnostico', assignTag: 'Agendou-Call-Mentoria' },
              { id: 'btn_falar_wpp', text: '📲 Falar com Especialista no WhatsApp', type: 'url', value: 'https://wa.me/5511999998888?text=Ola%20fui%20aprovado%20na%20mentoria', assignTag: 'Chamou-WhatsApp-Closer' }
            ]
          },
          position: { x: 800, y: 80 }
        },
        {
          id: 'node_men_vip_approved',
          type: 'action',
          title: 'Ação: Lead Black VIP ➔ Notificar Closer',
          data: {
            actionType: 'human_handover',
            tagToAdd: 'Lead-Black-VIP-50k'
          },
          position: { x: 800, y: 260 }
        },
        {
          id: 'node_men_low_ticket',
          type: 'message',
          title: 'Recomendação de Programa Acelerador',
          data: {
            text: 'Perfeito {first_name}! Para o seu momento atual, o programa ideal para você atingir seus primeiros R$ 10k/mês com baixo custo é o nosso **Treinamento Acelerador de Vendas**.',
            buttons: [
              { id: 'btn_acelerador', text: '🚀 Conhecer o Acelerador de Vendas', type: 'url', value: 'https://manyflow.io/acelerador' }
            ]
          },
          position: { x: 800, y: 440 }
        }
      ],
      connections: [
        { fromNodeId: 'node_men_trig', toNodeId: 'node_men_q1', handleType: 'default' },
        { fromNodeId: 'node_men_q1', toNodeId: 'node_men_approved', handleType: 'button', label: '🚀 De R$ 10k a 50k' },
        { fromNodeId: 'node_men_q1', toNodeId: 'node_men_vip_approved', handleType: 'button', label: '🏆 Acima de 50k' },
        { fromNodeId: 'node_men_q1', toNodeId: 'node_men_low_ticket', handleType: 'button', label: '💵 Até R$ 10k' }
      ]
    }
  },

  // ==========================================
  // 3. ADSENSE, PORTAIS & TRÁFEGO MONETIZADO
  // ==========================================
  {
    id: 'tpl_adsense_story_traffic',
    title: '📰 AdSense & Blog: Link da Matéria/Receita dos Stories + Alerta Diário VIP',
    category: 'adsense',
    categoryLabel: '📰 AdSense & Portais de Conteúdo',
    description: 'Transforme visualizações dos Stories em milhares de cliques diários no seu portal ou blog monetizado com Google AdSense, aumentando seu RPM e Pageviews.',
    channel: 'instagram',
    expectedMetric: '+450% Pageviews AdSense • Alta Retenção',
    highlightBadge: 'Monetização Máxima de AdSense',
    tags: ['AdSense', 'Blog', 'Receitas', 'Notícias', 'Tráfego Orgânico', 'Stories Link', 'RPM'],
    flow: {
      id: 'flow_tpl_adsense_traffic',
      title: '📰 AdSense: Envio Imediato de Matéria/Artigo + Canal de Tráfego Recorrente',
      description: 'Entrega o link do artigo do blog publicado no Story e cadastra o seguidor para receber notícias diárias.',
      channel: 'instagram',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { runs: 8940, completed: 8650, ctr: 96.8 },
      nodes: [
        {
          id: 'node_ads_trig',
          type: 'trigger',
          title: 'Gatilho: "MATÉRIA", "RECEITA", "NOTÍCIA", "POST"',
          data: {
            triggerType: 'keyword',
            keywords: ['MATÉRIA', 'RECEITA', 'NOTÍCIA', 'LER', 'LINK DO STORY', 'QUERO A RECEITA', 'VER ARTIGO', 'SITE'],
            matchType: 'contains'
          },
          position: { x: 40, y: 160 }
        },
        {
          id: 'node_ads_tag',
          type: 'action',
          title: 'Tag CRM: "Leitor-Ativo-AdSense"',
          data: {
            actionType: 'add_tag',
            tagToAdd: 'Leitor-AdSense-Portal',
            fieldToSet: 'categoria_leitura',
            fieldValue: 'Geral_Noticias'
          },
          position: { x: 380, y: 160 }
        },
        {
          id: 'node_ads_msg',
          type: 'message',
          title: 'Entrega Direta do Link da Matéria',
          data: {
            text: 'Olá {first_name}! 📰 Aqui está o link completo da matéria que você viu nos Stories:\n\n👉 **"Dica do Dia / Receita Completa & Passo a Passo"**\n\nClique abaixo para ler o artigo completo:',
            buttons: [
              { id: 'btn_ads_read', text: '📖 Ler Artigo Completo no Portal', type: 'url', value: 'https://seuportaldenoticias.com/artigo-destaque-adsense', assignTag: 'Clicou-Artigo-AdSense' },
              { id: 'btn_ads_more', text: '🔥 Mais Notícias & Tendências', type: 'url', value: 'https://seuportaldenoticias.com/populares', assignTag: 'Navegou-Outros-Artigos' }
            ],
            quickReplies: [
              { id: 'qr_ads_wpp', text: '📲 Quero receber notícias no WhatsApp!', targetNodeId: 'node_ads_wpp_channel', assignTag: 'Lead-Canal-Noticias' },
              { id: 'qr_ads_rec', text: '🍰 Ver Receitas Fáceis' }
            ]
          },
          position: { x: 740, y: 160 }
        },
        {
          id: 'node_ads_wpp_channel',
          type: 'message',
          title: 'Canal de Notícias VIP (WhatsApp/Telegram)',
          data: {
            text: 'Quer receber nossas melhores matérias e dicas diárias direto no seu WhatsApp sem perder nada? 🚀\n\nEntre no nosso canal oficial gratuito:',
            buttons: [
              { id: 'btn_ads_channel', text: '🟢 Entrar no Canal de Notícias VIP', type: 'url', value: 'https://whatsapp.com/channel/exemplo-canal-portal-noticias', assignTag: 'Inscrito-Canal-Noticias' }
            ]
          },
          position: { x: 1140, y: 160 }
        }
      ],
      connections: [
        { fromNodeId: 'node_ads_trig', toNodeId: 'node_ads_tag', handleType: 'default' },
        { fromNodeId: 'node_ads_tag', toNodeId: 'node_ads_msg', handleType: 'default' },
        { fromNodeId: 'node_ads_msg', toNodeId: 'node_ads_wpp_channel', handleType: 'quick_reply', label: '📲 Notícias no WhatsApp' }
      ]
    }
  },

  // ==========================================
  // 4. E-COMMERCE & PRODUTOS FÍSICOS
  // ==========================================
  {
    id: 'tpl_ecommerce_welcome_discount',
    title: '🛍️ E-commerce: Catálogo Visual de Produtos + Cupom de 1ª Compra',
    category: 'ecommerce',
    categoryLabel: '🛍️ E-commerce & Produtos Físicos',
    description: 'Apresente os produtos mais vendidos da sua loja em carrossel, capture o e-mail/WhatsApp do cliente e libere cupom de frete grátis ou 15% OFF.',
    channel: 'omnichannel',
    expectedMetric: '22.8% Conversão em Venda • Aumento de Ticket Médio',
    highlightBadge: 'Vendas Automáticas 24/7',
    tags: ['E-commerce', 'Shopify', 'Nuvemshop', 'WooCommerce', 'Cupom', 'Frete Grátis'],
    flow: {
      id: 'flow_tpl_ecommerce_catalog',
      title: '🛍️ E-commerce: Vitrine de Mais Vendidos + Cupom de Desconto',
      description: 'Guia o visitante pelos produtos em alta e entrega cupom de boas-vindas.',
      channel: 'omnichannel',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { runs: 5120, completed: 4720, ctr: 92.4 },
      nodes: [
        {
          id: 'node_ecom_trig',
          type: 'trigger',
          title: 'Gatilho: "PRODUTOS", "CATÁLOGO", "LOJA", "CUPOM"',
          data: {
            triggerType: 'keyword',
            keywords: ['PRODUTOS', 'CATALOGO', 'CATÁLOGO', 'LOJA', 'COMPRAR', 'ROUPAS', 'MODELOS', 'CUPOM 1 COMPRA', 'FRETE GRÁTIS'],
            matchType: 'contains'
          },
          position: { x: 40, y: 150 }
        },
        {
          id: 'node_ecom_msg_welcome',
          type: 'message',
          title: 'Apresentação da Loja & Categorias',
          data: {
            text: 'Olá {first_name}! 🛍️ Bem-vindo à nossa loja oficial!\n\nPara comemorar sua visita, você ganhou **15% OFF** no seu primeiro pedido com o cupom: **BEMVINDO15**.\n\nO que você procura hoje?',
            buttons: [
              { id: 'btn_ecom_best', text: '🔥 Ver Mais Vendidos da Semana', type: 'flow', targetNodeId: 'node_ecom_catalog_card', assignTag: 'Interesse-Mais-Vendidos' },
              { id: 'btn_ecom_rastreio', text: '📦 Rastrear Meu Pedido', type: 'flow', targetNodeId: 'node_ecom_tracking', assignTag: 'Consulta-Rastreio' },
              { id: 'btn_ecom_wpp', text: '💬 Falar com Vendedora', type: 'flow', targetNodeId: 'node_ecom_human', assignTag: 'Suporte-Vendedora' }
            ]
          },
          position: { x: 380, y: 150 }
        },
        {
          id: 'node_ecom_catalog_card',
          type: 'message',
          title: 'Vitrine de Destaques & Link de Compra',
          data: {
            text: '✨ **Coleção em Destaque:**\n\n1️⃣ Produto Premium Gold — De R$ 199 por R$ 149\n2️⃣ Kit Mais Vendido (3 Unidades com Frete Grátis)\n3️⃣ Lançamentos Exclusivos\n\n*Clique para comprar com cupom BEMVINDO15 já ativado:*',
            buttons: [
              { id: 'btn_ecom_shop', text: '🛒 Comprar no Site com Desconto', type: 'url', value: 'https://sualoja.com.br/colecao-vip?cupom=BEMVINDO15', assignTag: 'Clicou-Loja-Site' }
            ]
          },
          position: { x: 780, y: 60 }
        },
        {
          id: 'node_ecom_tracking',
          type: 'message',
          title: 'Status & Rastreio de Pedido',
          data: {
            text: 'Para rastrear seu pedido, informe o número do pedido (ex: #1234) ou clique no link abaixo para consultar nos Correios:',
            buttons: [
              { id: 'btn_rastreio_link', text: '🔍 Consultar Rastreamento Oficial', type: 'url', value: 'https://rastreamento.correios.com.br' }
            ]
          },
          position: { x: 780, y: 260 }
        },
        {
          id: 'node_ecom_human',
          type: 'action',
          title: 'Transferir para Vendedora WhatsApp',
          data: {
            actionType: 'human_handover',
            tagToAdd: 'Atendimento-Vendedora-Loja'
          },
          position: { x: 780, y: 440 }
        }
      ],
      connections: [
        { fromNodeId: 'node_ecom_trig', toNodeId: 'node_ecom_msg_welcome', handleType: 'default' },
        { fromNodeId: 'node_ecom_msg_welcome', toNodeId: 'node_ecom_catalog_card', handleType: 'button', label: '🔥 Mais Vendidos' },
        { fromNodeId: 'node_ecom_msg_welcome', toNodeId: 'node_ecom_tracking', handleType: 'button', label: '📦 Rastrear Pedido' },
        { fromNodeId: 'node_ecom_msg_welcome', toNodeId: 'node_ecom_human', handleType: 'button', label: '💬 Falar com Vendedora' }
      ]
    }
  }
];
