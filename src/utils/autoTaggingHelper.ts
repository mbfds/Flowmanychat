import { AutoTaggingRule, AutoTaggingExecutionLog, Contact, ContactActivityLog } from '../types';

export const STORAGE_KEY_AUTO_TAGGING_RULES = 'manyflow_auto_tagging_rules';
export const STORAGE_KEY_AUTO_TAGGING_LOGS = 'manyflow_auto_tagging_logs';

export const DEFAULT_AUTO_TAGGING_RULES: AutoTaggingRule[] = [
  {
    id: 'rule_pricing_interest',
    name: 'Interesse Comercial & Tabela de Preços',
    description: 'Detecta intenção de compra ou dúvidas sobre valores e planos, marcando o lead para a equipe de vendas.',
    enabled: true,
    keywords: ['preço', 'preco', 'valor', 'quanto custa', 'tabela', 'plano', 'mensalidade', 'desconto', 'orçamento', 'orcamento', 'comprar'],
    matchType: 'contains',
    tagsToAdd: ['Lead Quente', 'Interesse Comercial', 'Dúvida de Preço'],
    tagsToRemove: ['Lead Frio'],
    channelFilter: 'all',
    caseSensitive: false,
    priority: 'high',
    timesTriggered: 42,
    lastTriggeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
  },
  {
    id: 'rule_support_help',
    name: 'Dúvidas Técnicas & Suporte Urgente',
    description: 'Identifica problemas, dúvidas de configuração ou bugs para sinalizar atendimento técnico.',
    enabled: true,
    keywords: ['ajuda', 'suporte', 'problema', 'erro', 'não funciona', 'nao funciona', 'defeito', 'bug', 'dúvida', 'duvida', 'falha'],
    matchType: 'contains',
    tagsToAdd: ['Suporte Técnico', 'Atendimento Humano'],
    tagsToRemove: [],
    channelFilter: 'all',
    caseSensitive: false,
    priority: 'high',
    timesTriggered: 19,
    lastTriggeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'rule_booking_demo',
    name: 'Solicitação de Agendamento & Reunião VIP',
    description: 'Captura solicitações de horários de demonstração, consultoria ou reuniões 1-a-1.',
    enabled: true,
    keywords: ['agendar', 'reunião', 'reuniao', 'marcar horário', 'marcar horario', 'consulta', 'demo', 'demonstração', 'demonstracao', 'horários', 'horarios', 'calendário'],
    matchType: 'contains',
    tagsToAdd: ['Lead Agendamento', 'Interesse Demo'],
    tagsToRemove: [],
    channelFilter: 'all',
    caseSensitive: false,
    priority: 'medium',
    timesTriggered: 27,
    lastTriggeredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString()
  },
  {
    id: 'rule_positive_feedback',
    name: 'Feedback Positivo & Elogios de Clientes',
    description: 'Etiqueta promotores e clientes satisfeitos para futuras campanhas de depoimento e upsell.',
    enabled: true,
    keywords: ['adorei', 'excelente', 'parabéns', 'parabens', 'ótimo', 'otimo', 'maravilhoso', 'sensacional', 'recomendo', 'muito bom', 'top'],
    matchType: 'contains',
    tagsToAdd: ['Cliente Satisfeito', 'Promotor NPS'],
    tagsToRemove: [],
    channelFilter: 'all',
    caseSensitive: false,
    priority: 'low',
    timesTriggered: 15,
    lastTriggeredAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 'rule_churn_risk',
    name: 'Risco de Churn & Cancelamento Imediato',
    description: 'Alerta crítico sobre clientes solicitando estorno, desistência ou encerramento de conta.',
    enabled: true,
    keywords: ['cancelar', 'cancelamento', 'reembolso', 'estorno', 'desistir', 'não quero mais', 'nao quero mais', 'reclamação', 'reclamacao', 'procon'],
    matchType: 'contains',
    tagsToAdd: ['Risco Churn', 'Urgente Retenção'],
    tagsToRemove: ['Lead Quente'],
    channelFilter: 'all',
    caseSensitive: false,
    priority: 'high',
    timesTriggered: 8,
    lastTriggeredAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
  }
];

export const DEFAULT_EXECUTION_LOGS: AutoTaggingExecutionLog[] = [
  {
    id: 'log_1',
    ruleId: 'rule_pricing_interest',
    ruleName: 'Interesse Comercial & Tabela de Preços',
    contactId: 'contact-1',
    contactName: 'Mariana Silva',
    contactUsername: 'mariana.silva',
    channel: 'instagram',
    matchedKeyword: 'preço',
    tagsAdded: ['Lead Quente', 'Interesse Comercial', 'Dúvida de Preço'],
    tagsRemoved: ['Lead Frio'],
    messageSnippet: 'Olá! Qual o preço do plano profissional para 3 atendentes?',
    executedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'log_2',
    ruleId: 'rule_booking_demo',
    ruleName: 'Solicitação de Agendamento & Reunião VIP',
    contactId: 'contact-2',
    contactName: 'Carlos Eduardo',
    contactUsername: 'carlos.edu',
    channel: 'instagram',
    matchedKeyword: 'demo',
    tagsAdded: ['Lead Agendamento', 'Interesse Demo'],
    tagsRemoved: [],
    messageSnippet: 'Gostaria de agendar uma demo para ver como funciona na prática.',
    executedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'log_3',
    ruleId: 'rule_support_help',
    ruleName: 'Dúvidas Técnicas & Suporte Urgente',
    contactId: 'contact-3',
    contactName: 'Beatriz Costa',
    contactUsername: 'beatriz.costa',
    channel: 'messenger',
    matchedKeyword: 'suporte',
    tagsAdded: ['Suporte Técnico', 'Atendimento Humano'],
    tagsRemoved: [],
    messageSnippet: 'Preciso de suporte com a integração do meu webhook no Meta.',
    executedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

/**
 * Normalize string by removing diacritics/accents for resilient keyword matching
 */
export function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Tests if a keyword matches inside a message according to match type
 */
export function testKeywordMatch(
  messageText: string,
  keyword: string,
  matchType: 'contains' | 'exact' | 'regex',
  caseSensitive: boolean = false
): boolean {
  if (!messageText || !keyword) return false;

  const targetText = caseSensitive ? messageText : messageText.toLowerCase();
  const targetKeyword = caseSensitive ? keyword.trim() : keyword.trim().toLowerCase();

  if (matchType === 'regex') {
    try {
      const regex = new RegExp(keyword.trim(), caseSensitive ? '' : 'i');
      return regex.test(messageText);
    } catch {
      return false;
    }
  }

  if (matchType === 'exact') {
    // Exact word or exact whole message match
    const normText = removeDiacritics(targetText).trim();
    const normKeyword = removeDiacritics(targetKeyword).trim();

    if (normText === normKeyword) return true;

    // Check as independent whole word boundary
    const boundaryRegex = new RegExp(`(^|[\\s,.;:!?()'"\\-])${escapeRegex(normKeyword)}($|[\\s,.;:!?()'"\\-])`, 'i');
    return boundaryRegex.test(removeDiacritics(targetText));
  }

  // 'contains': Substring or accent-insensitive partial match
  const normText = removeDiacritics(targetText);
  const normKeyword = removeDiacritics(targetKeyword);
  return normText.includes(normKeyword);
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface AutoTaggingMatchResult {
  matchedRules: AutoTaggingRule[];
  matchedKeywords: string[];
  tagsToAdd: string[];
  tagsToRemove: string[];
}

/**
 * Evaluates an incoming message text against a list of active rules
 */
export function evaluateMessageAutoTagging(
  messageText: string,
  channel: 'instagram' | 'messenger',
  rules: AutoTaggingRule[]
): AutoTaggingMatchResult {
  const matchedRules: AutoTaggingRule[] = [];
  const matchedKeywordsSet = new Set<string>();
  const tagsToAddSet = new Set<string>();
  const tagsToRemoveSet = new Set<string>();

  for (const rule of rules) {
    if (!rule.enabled) continue;

    // Check channel filter
    if (rule.channelFilter !== 'all' && rule.channelFilter !== channel) {
      continue;
    }

    let ruleMatched = false;
    for (const kw of rule.keywords) {
      if (testKeywordMatch(messageText, kw, rule.matchType, rule.caseSensitive)) {
        ruleMatched = true;
        matchedKeywordsSet.add(kw);
      }
    }

    if (ruleMatched) {
      matchedRules.push(rule);
      rule.tagsToAdd.forEach((t) => tagsToAddSet.add(t));
      if (rule.tagsToRemove) {
        rule.tagsToRemove.forEach((t) => tagsToRemoveSet.add(t));
      }
    }
  }

  return {
    matchedRules,
    matchedKeywords: Array.from(matchedKeywordsSet),
    tagsToAdd: Array.from(tagsToAddSet),
    tagsToRemove: Array.from(tagsToRemoveSet)
  };
}

/**
 * Applies the matched tags to a contact, registering activity log
 */
export function applyAutoTaggingToContact(
  contact: Contact,
  evaluation: { tagsToAdd: string[]; tagsToRemove: string[] },
  ruleNames: string[] = []
): { updatedContact: Contact; tagsAdded: string[]; tagsRemoved: string[]; changed: boolean } {
  const currentTags = contact.tags || [];
  
  // Calculate newly added tags
  const tagsAdded = evaluation.tagsToAdd.filter((t) => !currentTags.includes(t));
  
  // Calculate actually removed tags
  const tagsRemoved = (evaluation.tagsToRemove || []).filter((t) => currentTags.includes(t));

  if (tagsAdded.length === 0 && tagsRemoved.length === 0) {
    return {
      updatedContact: contact,
      tagsAdded: [],
      tagsRemoved: [],
      changed: false
    };
  }

  // Merge tags: add new ones, remove removed ones
  const newTags = [
    ...currentTags.filter((t) => !evaluation.tagsToRemove.includes(t)),
    ...tagsAdded
  ];

  const nowIso = new Date().toISOString();
  const ruleSummary = ruleNames.length > 0 ? ` [Regra: ${ruleNames.join(', ')}]` : '';

  const newActivityLogs: ContactActivityLog[] = [
    ...(contact.activityLogs || [])
  ];

  if (tagsAdded.length > 0) {
    newActivityLogs.unshift({
      id: `act_${Date.now()}_add`,
      type: 'tag_added',
      actor: 'system',
      title: `Auto-Tagging: ${tagsAdded.join(', ')}`,
      description: `Tags adicionadas automaticamente por detecção de palavra-chave${ruleSummary}.`,
      timestamp: nowIso,
      tagName: tagsAdded[0]
    });
  }

  if (tagsRemoved.length > 0) {
    newActivityLogs.unshift({
      id: `act_${Date.now()}_rem`,
      type: 'tag_removed',
      actor: 'system',
      title: `Auto-Tagging (Remoção): ${tagsRemoved.join(', ')}`,
      description: `Tags limpas automaticamente por regra de auto-tagging${ruleSummary}.`,
      timestamp: nowIso,
      tagName: tagsRemoved[0]
    });
  }

  const updatedContact: Contact = {
    ...contact,
    tags: newTags,
    activityLogs: newActivityLogs
  };

  return {
    updatedContact,
    tagsAdded,
    tagsRemoved,
    changed: true
  };
}

/**
 * Storage helpers
 */
export function loadAutoTaggingRules(): AutoTaggingRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTO_TAGGING_RULES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading auto-tagging rules from localStorage:', e);
  }
  return DEFAULT_AUTO_TAGGING_RULES;
}

export function saveAutoTaggingRules(rules: AutoTaggingRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTO_TAGGING_RULES, JSON.stringify(rules));
  } catch (e) {
    console.error('Error saving auto-tagging rules to localStorage:', e);
  }
}

export function loadAutoTaggingLogs(): AutoTaggingExecutionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTO_TAGGING_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading auto-tagging logs from localStorage:', e);
  }
  return DEFAULT_EXECUTION_LOGS;
}

export function saveAutoTaggingLogs(logs: AutoTaggingExecutionLog[]): void {
  try {
    // Keep last 100 logs
    const trimmed = logs.slice(0, 100);
    localStorage.setItem(STORAGE_KEY_AUTO_TAGGING_LOGS, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving auto-tagging logs to localStorage:', e);
  }
}
