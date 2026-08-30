import { Contact, LeadScoreBreakdown, LeadScoreItem, LeadScoreTier } from '../types';

export interface ScoringRuleConfig {
  buttonClickPoints: number;
  quickReplyPoints: number;
  commentKeywordPoints: number;
  storyReplyPoints: number;
  flowTriggerPoints: number;
  humanHandoverPoints: number;
  broadcastPoints: number;
  emailPoints: number;
  phonePoints: number;
  customFieldPoints: number;
  hotTierThreshold: number;
  warmTierThreshold: number;
}

export const DEFAULT_SCORING_RULES: ScoringRuleConfig = {
  buttonClickPoints: 10,
  quickReplyPoints: 8,
  commentKeywordPoints: 15,
  storyReplyPoints: 15,
  flowTriggerPoints: 5,
  humanHandoverPoints: 15,
  broadcastPoints: 5,
  emailPoints: 10,
  phonePoints: 15,
  customFieldPoints: 4,
  hotTierThreshold: 70,
  warmTierThreshold: 35
};

export const HIGH_VALUE_TAGS: Record<string, { points: number; label: string }> = {
  'Comprou-Colecao': { points: 30, label: 'Cliente com Compra Confirmada' },
  'VIP': { points: 25, label: 'Lead / Cliente VIP' },
  'Lead-Qualificado': { points: 25, label: 'Lead Qualificado pelo Funil' },
  'Quer-Consultoria': { points: 20, label: 'Interesse em Consultoria/Serviço' },
  'Lead-Quente-Instagram': { points: 15, label: 'Lead Quente no Direct' },
  'Interesse-Planos': { points: 15, label: 'Interesse em Planos Comerciais' },
  'Duvida-API': { points: 12, label: 'Interesse Técnico / Integração' },
  'Agencia': { points: 15, label: 'Perfil Agência / B2B' },
  'Interesse-Cupom': { points: 10, label: 'Resgatou Cupom de Desconto' },
  'Interesse-Catalogo': { points: 10, label: 'Navegou no Catálogo' },
  'Comentou-Reel': { points: 10, label: 'Engajou em Comentário de Post/Reel' },
  'E-commerce': { points: 10, label: 'Segmento E-commerce' },
  'Messenger-Lead': { points: 5, label: 'Origem Messenger' }
};

/**
 * Calculates complete lead scoring with granular breakdown of where points came from.
 */
export function calculateLeadScore(
  contact: Contact,
  rules: ScoringRuleConfig = DEFAULT_SCORING_RULES
): LeadScoreBreakdown {
  const items: LeadScoreItem[] = [];

  // 1. Activity Logs Clicks & Interactions
  const logs = contact.activityLogs || [];
  
  const buttonClicks = logs.filter((l) => l.type === 'button_clicked');
  if (buttonClicks.length > 0) {
    const pts = buttonClicks.length * rules.buttonClickPoints;
    items.push({
      id: 'item_button_clicks',
      category: 'engagement',
      label: `Cliques em Botões Interativos (${buttonClicks.length}x)`,
      detail: buttonClicks.map((b) => b.buttonText ? `"${b.buttonText}"` : 'Botão').slice(0, 3).join(', '),
      points: pts,
      icon: 'MousePointerClick'
    });
  }

  const quickReplies = logs.filter((l) => l.type === 'quick_reply_clicked');
  if (quickReplies.length > 0) {
    const pts = quickReplies.length * rules.quickReplyPoints;
    items.push({
      id: 'item_quick_replies',
      category: 'engagement',
      label: `Respostas Rápidas Clicadas (${quickReplies.length}x)`,
      detail: quickReplies.map((q) => q.buttonText ? `"${q.buttonText}"` : 'Opção').slice(0, 3).join(', '),
      points: pts,
      icon: 'Zap'
    });
  }

  // 2. Automated Trigger Events (Comments, Stories, Keyword Flows)
  const commentTriggers = logs.filter((l) => l.type === 'comment_keyword_triggered');
  if (commentTriggers.length > 0) {
    const pts = commentTriggers.length * rules.commentKeywordPoints;
    items.push({
      id: 'item_comment_triggers',
      category: 'triggers',
      label: `Gatilho de Comentário em Reel/Post (${commentTriggers.length}x)`,
      detail: 'Comentou palavra-chave disparadora de automação',
      points: pts,
      icon: 'Sparkles'
    });
  }

  const storyTriggers = logs.filter((l) => l.type === 'story_reply_triggered');
  if (storyTriggers.length > 0) {
    const pts = storyTriggers.length * rules.storyReplyPoints;
    items.push({
      id: 'item_story_triggers',
      category: 'triggers',
      label: `Resposta a Story do Instagram (${storyTriggers.length}x)`,
      detail: 'Interagiu diretamente com Stories da marca',
      points: pts,
      icon: 'Flame'
    });
  }

  const flowTriggers = logs.filter((l) => l.type === 'flow_triggered');
  if (flowTriggers.length > 0) {
    const pts = flowTriggers.length * rules.flowTriggerPoints;
    items.push({
      id: 'item_flow_triggers',
      category: 'triggers',
      label: `Fluxos de Automação Iniciados (${flowTriggers.length}x)`,
      detail: flowTriggers.map((f) => f.flowTitle).filter(Boolean).slice(0, 2).join(', '),
      points: pts,
      icon: 'Workflow'
    });
  }

  const broadcastEvents = logs.filter((l) => l.type === 'broadcast_received');
  if (broadcastEvents.length > 0) {
    const pts = broadcastEvents.length * rules.broadcastPoints;
    items.push({
      id: 'item_broadcast_events',
      category: 'engagement',
      label: `Transmissões Recebidas/Abertas (${broadcastEvents.length}x)`,
      detail: 'Receptivo a campanhas de disparo em massa',
      points: pts,
      icon: 'Radio'
    });
  }

  // 3. Human Handover / Sales Request
  const handovers = logs.filter((l) => l.type === 'human_handover') || (contact.status === 'human_assigned' ? [1] : []);
  if (handovers.length > 0 || contact.status === 'human_assigned') {
    items.push({
      id: 'item_human_handover',
      category: 'conversion',
      label: 'Solicitou / Roteado para Atendente Humano',
      detail: 'Fase avançada de interesse com suporte ou vendas',
      points: rules.humanHandoverPoints,
      icon: 'UserCheck'
    });
  }

  // 4. Contact Profile Data Completeness
  if (contact.email && contact.email.trim().length > 0) {
    items.push({
      id: 'item_email_provided',
      category: 'profile',
      label: 'E-mail Cadastrado / Capturado',
      detail: contact.email,
      points: rules.emailPoints,
      icon: 'Mail'
    });
  }

  if (contact.phone && contact.phone.trim().length > 0) {
    items.push({
      id: 'item_phone_provided',
      category: 'profile',
      label: 'Telefone / WhatsApp Fornecido',
      detail: contact.phone,
      points: rules.phonePoints,
      icon: 'Phone'
    });
  }

  const customFieldKeys = Object.keys(contact.customFields || {}).filter(
    (k) => contact.customFields[k] && contact.customFields[k].trim().length > 0
  );
  if (customFieldKeys.length > 0) {
    const pts = Math.min(customFieldKeys.length * rules.customFieldPoints, 20);
    items.push({
      id: 'item_custom_fields',
      category: 'profile',
      label: `Campos Customizados Preenchidos (${customFieldKeys.length})`,
      detail: customFieldKeys.slice(0, 3).map((k) => `{${k}}`).join(', '),
      points: pts,
      icon: 'FileText'
    });
  }

  // 5. Tags Scoring
  (contact.tags || []).forEach((tag, idx) => {
    if (HIGH_VALUE_TAGS[tag]) {
      const tagInfo = HIGH_VALUE_TAGS[tag];
      items.push({
        id: `item_tag_${tag}_${idx}`,
        category: 'tags',
        label: `Tag: ${tag}`,
        detail: tagInfo.label,
        points: tagInfo.points,
        icon: 'Tag'
      });
    } else {
      items.push({
        id: `item_tag_gen_${tag}_${idx}`,
        category: 'tags',
        label: `Tag: ${tag}`,
        detail: 'Rotulagem de segmentação',
        points: 5,
        icon: 'Tag'
      });
    }
  });

  // 6. Total Interactions Frequency Bonus
  if (contact.totalInteractions && contact.totalInteractions >= 5) {
    const interactionBonus = Math.min(Math.floor(contact.totalInteractions / 2) * 2, 20);
    items.push({
      id: 'item_total_interactions',
      category: 'engagement',
      label: `Alto Volume de Interações (${contact.totalInteractions} msgs/ações)`,
      detail: 'Lead altamente engajado e responsivo',
      points: interactionBonus,
      icon: 'Activity'
    });
  }

  // 7. Lifetime Value
  if (contact.lifetimeValue && contact.lifetimeValue > 0) {
    items.push({
      id: 'item_ltv',
      category: 'conversion',
      label: `Cliente com LTV de R$ ${contact.lifetimeValue.toFixed(2)}`,
      detail: 'Histórico financeiro aprovado',
      points: 30,
      icon: 'ShoppingBag'
    });
  }

  // 8. Manual Bonus
  if (contact.manualScoreBonus && contact.manualScoreBonus !== 0) {
    items.push({
      id: 'item_manual_bonus',
      category: 'custom',
      label: 'Ajuste Manual da Equipe',
      detail: contact.manualScoreBonus > 0 ? 'Pontuação extra atribuída' : 'Penalidade manual',
      points: contact.manualScoreBonus,
      icon: 'Sparkles'
    });
  }

  // Calculate sum
  const rawSum = items.reduce((acc, curr) => acc + curr.points, 0);
  const totalScore = Math.max(0, rawSum);

  let tier: LeadScoreTier = 'cold';
  let tierLabel = 'Lead Frio';
  let tierColor = 'text-slate-600 bg-slate-100 border-slate-200';

  if (totalScore >= rules.hotTierThreshold) {
    tier = 'hot';
    tierLabel = 'Lead Quente 🔥';
    tierColor = 'text-orange-700 bg-orange-50 border-orange-200';
  } else if (totalScore >= rules.warmTierThreshold) {
    tier = 'warm';
    tierLabel = 'Lead Morno ⚡';
    tierColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else {
    tier = 'cold';
    tierLabel = 'Lead Frio ❄️';
    tierColor = 'text-sky-700 bg-sky-50 border-sky-200';
  }

  return {
    totalScore,
    tier,
    tierLabel,
    tierColor,
    items
  };
}

export function getLeadScoreTier(score: number): {
  tier: LeadScoreTier;
  label: string;
  badgeClass: string;
  pillClass: string;
  barColor: string;
  icon: string;
} {
  if (score >= 70) {
    return {
      tier: 'hot',
      label: 'Quente',
      badgeClass: 'bg-orange-500/10 text-orange-700 border-orange-200/80',
      pillClass: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-xs',
      barColor: 'from-amber-400 via-orange-500 to-rose-500',
      icon: '🔥'
    };
  }
  if (score >= 35) {
    return {
      tier: 'warm',
      label: 'Morno',
      badgeClass: 'bg-amber-500/10 text-amber-800 border-amber-200/80',
      pillClass: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-xs',
      barColor: 'from-amber-300 to-amber-500',
      icon: '⚡'
    };
  }
  return {
    tier: 'cold',
    label: 'Frio',
    badgeClass: 'bg-sky-500/10 text-sky-700 border-sky-200/80',
    pillClass: 'bg-gradient-to-r from-slate-400 to-sky-500 text-white shadow-xs',
    barColor: 'from-slate-300 to-sky-400',
    icon: '❄️'
  };
}
