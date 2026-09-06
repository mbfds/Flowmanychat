import { Contact, LiveConversation } from '../types';

export interface UnresponsiveStatus {
  isUnresponsive48h: boolean;
  hoursInactive: number;
  daysInactive: number;
  badgeLabel: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  urgency: 'warning' | 'critical' | 'none';
  formattedTime: string;
}

/**
 * Calculates whether a contact in a live conversation has been unresponsive for more than 48 hours.
 */
export function getConversationUnresponsiveDetails(conv: LiveConversation): UnresponsiveStatus {
  const now = Date.now();
  let hoursInactive = 0;
  let daysInactive = 0;

  // 1. Check contact's last interaction
  const rawInteraction = conv.contact?.lastInteractionAt || '';
  const lower = rawInteraction.toLowerCase().trim();

  // Parse hours from raw interaction string (e.g. "Há 52 horas", "50h atrás")
  const hoursMatch = lower.match(/(?:h[aá]|\b)\s*(\d+)\s*(?:horas?|h)\b/i);
  if (hoursMatch && hoursMatch[1]) {
    hoursInactive = parseInt(hoursMatch[1], 10);
    daysInactive = Math.floor(hoursInactive / 24);
  } else {
    // Check days using existing helper
    daysInactive = getContactDaysInactive(conv.contact);
    hoursInactive = daysInactive * 24;
  }

  // Also check if lastMessage has a parseable timestamp or date
  if (conv.lastMessage?.timestamp) {
    const parsedLastMsg = new Date(conv.lastMessage.timestamp).getTime();
    if (!isNaN(parsedLastMsg)) {
      const diffHours = Math.floor((now - parsedLastMsg) / (1000 * 60 * 60));
      if (diffHours > 0) {
        hoursInactive = Math.max(hoursInactive, diffHours);
        daysInactive = Math.floor(hoursInactive / 24);
      }
    }
  }

  // Also check if conv.messages has timestamps
  if (conv.messages && conv.messages.length > 0) {
    const lastUserMsg = [...conv.messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg?.timestamp) {
      const parsedUserTime = new Date(lastUserMsg.timestamp).getTime();
      if (!isNaN(parsedUserTime)) {
        const diffUserHours = Math.floor((now - parsedUserTime) / (1000 * 60 * 60));
        if (diffUserHours > 0) {
          hoursInactive = Math.max(hoursInactive, diffUserHours);
          daysInactive = Math.floor(hoursInactive / 24);
        }
      }
    }
  }

  const isUnresponsive48h = hoursInactive >= 48 || daysInactive >= 2;

  if (!isUnresponsive48h) {
    return {
      isUnresponsive48h: false,
      hoursInactive,
      daysInactive,
      badgeLabel: 'Em dia',
      shortLabel: 'Recente',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-600',
      badgeBorder: 'border-slate-200',
      urgency: 'none',
      formattedTime: hoursInactive > 0 ? `${hoursInactive}h` : 'recente'
    };
  }

  // Determine urgency level: >= 72h or >= 3 days is critical, 48h-71h is warning
  const isCritical = hoursInactive >= 72 || daysInactive >= 3;
  const urgency: 'warning' | 'critical' = isCritical ? 'critical' : 'warning';

  const formattedTime = daysInactive >= 2 
    ? `${daysInactive} dias` 
    : `${hoursInactive} horas`;

  const badgeLabel = daysInactive >= 2
    ? `Follow-up (${daysInactive}d sem resposta)`
    : `Follow-up (>48h sem resposta)`;

  const shortLabel = daysInactive >= 2
    ? `> ${daysInactive}d s/ resposta`
    : `> 48h s/ resposta`;

  return {
    isUnresponsive48h: true,
    hoursInactive,
    daysInactive,
    badgeLabel,
    shortLabel,
    badgeBg: isCritical ? 'bg-rose-50 dark:bg-rose-950/40' : 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: isCritical ? 'text-rose-700 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300',
    badgeBorder: isCritical ? 'border-rose-300 dark:border-rose-800' : 'border-amber-300 dark:border-amber-800',
    urgency,
    formattedTime
  };
}

/**
 * Calculates the number of days since the contact's last interaction.
 */
export function getContactDaysInactive(contact: Contact): number {
  const now = Date.now();
  const raw = contact.lastInteractionAt;

  if (!raw || raw.toLowerCase().includes('sem interação')) {
    if (contact.createdAt) {
      const createdDate = new Date(contact.createdAt).getTime();
      if (!isNaN(createdDate)) {
        return Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      }
    }
    return 999;
  }

  const lower = raw.toLowerCase().trim();

  // Relative recent interactions (today, hours, minutes, seconds)
  if (
    lower.includes('min') ||
    lower.includes('hora') ||
    lower.includes('seg') ||
    lower.includes('hoje') ||
    lower.includes('agora')
  ) {
    return 0;
  }

  // Match relative days: "Há 45 dias", "45 dias atrás"
  const daysMatch = lower.match(/(?:h[aá]|\b)\s*(\d+)\s*dias?/i);
  if (daysMatch && daysMatch[1]) {
    return parseInt(daysMatch[1], 10);
  }

  // Match relative months: "Há 3 meses"
  const monthsMatch = lower.match(/(?:h[aá]|\b)\s*(\d+)\s*m[eê]s(?:es)?/i);
  if (monthsMatch && monthsMatch[1]) {
    return parseInt(monthsMatch[1], 10) * 30;
  }

  // Match relative years: "Há 1 ano"
  const yearsMatch = lower.match(/(?:h[aá]|\b)\s*(\d+)\s*ano(?:s)?/i);
  if (yearsMatch && yearsMatch[1]) {
    return parseInt(yearsMatch[1], 10) * 365;
  }

  // Try parsing ISO date or standard timestamp string
  const parsed = new Date(raw).getTime();
  if (!isNaN(parsed)) {
    const diff = Math.floor((now - parsed) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  // Fallback to createdAt if valid
  if (contact.createdAt) {
    const createdDate = new Date(contact.createdAt).getTime();
    if (!isNaN(createdDate)) {
      return Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    }
  }

  return 0;
}

/**
 * Returns a human-friendly inactivity badge string.
 */
export function formatInactivityBadge(days: number): {
  label: string;
  severity: 'active' | 'low' | 'medium' | 'high' | 'critical';
} {
  if (days === 0) {
    return { label: 'Ativo hoje', severity: 'active' };
  }
  if (days < 30) {
    return { label: `Ativo há ${days}d`, severity: 'active' };
  }
  if (days < 60) {
    return { label: `Inativo há ${days}d`, severity: 'low' };
  }
  if (days < 90) {
    return { label: `Inativo há ${days}d`, severity: 'medium' };
  }
  if (days < 180) {
    const months = Math.floor(days / 30);
    return { label: `Inativo há ~${months}m (${days}d)`, severity: 'high' };
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return { label: `Inativo há ~${months}m (${days}d)`, severity: 'critical' };
  }
  const years = (days / 365).toFixed(1);
  return { label: `Inativo há ${years}a (${days}d)`, severity: 'critical' };
}

export type EngagementStatus = 'Ativo' | 'Inativo' | 'Novo' | 'Bloqueado';

export interface EngagementConfigItem {
  id: EngagementStatus;
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  description: string;
}

export const ENGAGEMENT_CONFIG: Record<EngagementStatus, EngagementConfigItem> = {
  Ativo: {
    id: 'Ativo',
    label: 'Ativo',
    color: '#10B981', // Emerald 500
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    border: 'border-emerald-200',
    description: 'Interagiu com o robô ou atendente nos últimos 30 dias'
  },
  Inativo: {
    id: 'Inativo',
    label: 'Inativo',
    color: '#F59E0B', // Amber 500
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    border: 'border-amber-200',
    description: 'Sem interação há 30 dias ou mais'
  },
  Novo: {
    id: 'Novo',
    label: 'Novo',
    color: '#0084FF', // ManyFlow Blue
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    border: 'border-blue-200',
    description: 'Lead cadastrado recentemente (≤ 7 dias ou primeira interação)'
  },
  Bloqueado: {
    id: 'Bloqueado',
    label: 'Bloqueado',
    color: '#EF4444', // Red 500
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    border: 'border-rose-200',
    description: 'Descadastrado (opt-out), marcado como spam ou bloqueado'
  }
};

/**
 * Categorizes a contact into one of the 4 Engagement Statuses:
 * - Bloqueado: unsubscribed or blocked/spam tag
 * - Novo: registered within 7 days or has 0-2 total interactions
 * - Inativo: daysInactive >= 30
 * - Ativo: interacting regularly within 30 days
 */
export function getContactEngagementStatus(contact: Contact): EngagementStatus {
  // 1. Bloqueado / Descadastrado
  if (
    contact.status === 'unsubscribed' ||
    contact.tags?.some((t) => {
      const lower = t.toLowerCase();
      return lower.includes('bloqueado') || lower.includes('spam') || lower.includes('blacklist') || lower.includes('desengajado_bloqueado');
    })
  ) {
    return 'Bloqueado';
  }

  // 2. Novo
  const now = Date.now();
  if (contact.createdAt) {
    const createdTimestamp = new Date(contact.createdAt).getTime();
    if (!isNaN(createdTimestamp)) {
      const daysSinceCreated = Math.floor((now - createdTimestamp) / (1000 * 60 * 60 * 24));
      if (daysSinceCreated <= 7 || (contact.totalInteractions ?? 0) <= 2) {
        return 'Novo';
      }
    }
  } else if ((contact.totalInteractions ?? 0) <= 1) {
    return 'Novo';
  }

  // 3. Inativo vs Ativo based on days since last interaction
  const days = getContactDaysInactive(contact);
  if (days >= 30) {
    return 'Inativo';
  }

  return 'Ativo';
}
