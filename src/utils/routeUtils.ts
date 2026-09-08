import { NavigationTab } from '../types';

export const TAB_NAMES: Record<NavigationTab, string> = {
  flows: 'Construtor de Fluxos',
  triggers: 'Gatilhos & Palavras-Chave',
  comment_tools: 'Automação de Comentários',
  broadcast: 'Transmissões & Disparos',
  inbox: 'Live Chat & Inbox',
  contacts: 'Contatos & CRM',
  appointments: 'Agendamentos & Agenda',
  analytics: 'Métricas & Relatórios',
  whatsapp_groups: 'Grupos VIP de WhatsApp',
  affiliates: 'Programa de Afiliados',
  settings: 'Configurações do Sistema',
  ab_testing: 'Testes A/B',
  admin_users: 'Gestão de Usuários',
  admin_subscriptions: 'Planos & Assinaturas',
  admin_packages: 'Módulos & Pacotes',
  postiz_planner: 'Planejador de Conteúdo'
};

const TAB_ALIASES: Record<string, NavigationTab> = {
  // Flows
  flows: 'flows',
  flow: 'flows',
  fluxos: 'flows',
  fluxo: 'flows',
  builder: 'flows',
  canvas: 'flows',

  // Triggers
  triggers: 'triggers',
  trigger: 'triggers',
  gatilhos: 'triggers',
  gatilho: 'triggers',
  keywords: 'triggers',

  // Comment tools
  comment_tools: 'comment_tools',
  comments: 'comment_tools',
  comentarios: 'comment_tools',
  comentario: 'comment_tools',
  instagram_comments: 'comment_tools',

  // Broadcast
  broadcast: 'broadcast',
  broadcasts: 'broadcast',
  transmissao: 'broadcast',
  transmissoes: 'broadcast',
  disparos: 'broadcast',
  campanhas: 'broadcast',

  // Inbox
  inbox: 'inbox',
  chat: 'inbox',
  livechat: 'inbox',
  conversas: 'inbox',
  mensagens: 'inbox',
  direct: 'inbox',

  // Contacts / CRM
  contacts: 'contacts',
  contatos: 'contacts',
  crm: 'contacts',
  leads: 'contacts',
  clientes: 'contacts',

  // Appointments
  appointments: 'appointments',
  agenda: 'appointments',
  agendamentos: 'appointments',
  calendario: 'appointments',
  calendar: 'appointments',

  // Analytics
  analytics: 'analytics',
  metricas: 'analytics',
  relatorios: 'analytics',
  stats: 'analytics',
  dashboard: 'analytics',

  // WhatsApp Groups
  whatsapp_groups: 'whatsapp_groups',
  grupos: 'whatsapp_groups',
  groups: 'whatsapp_groups',
  grupos_whatsapp: 'whatsapp_groups',

  // Affiliates
  affiliates: 'affiliates',
  afiliados: 'affiliates',
  parceiros: 'affiliates',

  // Settings
  settings: 'settings',
  configuracoes: 'settings',
  config: 'settings',
  integracoes: 'settings',

  // AB Testing
  ab_testing: 'ab_testing',
  ab: 'ab_testing',
  testes: 'ab_testing',
  split: 'ab_testing',

  // Admin
  admin_users: 'admin_users',
  users: 'admin_users',
  usuarios: 'admin_users',
  equipe: 'admin_users',
  team: 'admin_users',

  admin_subscriptions: 'admin_subscriptions',
  subscriptions: 'admin_subscriptions',
  planos: 'admin_subscriptions',
  assinaturas: 'admin_subscriptions',

  admin_packages: 'admin_packages',
  packages: 'admin_packages',
  pacotes: 'admin_packages',
  modulos: 'admin_packages',

  // Postiz Planner
  postiz_planner: 'postiz_planner',
  planner: 'postiz_planner',
  postiz: 'postiz_planner',
  planejador: 'postiz_planner'
};

const REDIRECT_STORAGE_KEY = 'manyflow_intended_redirect';
const ACTIVE_TAB_STORAGE_KEY = 'manyflow_active_tab';
const IN_WORKSPACE_STORAGE_KEY = 'manyflow_in_workspace';

export interface RouteTarget {
  tab: NavigationTab;
  flowId?: string;
  channel?: string;
  sourceUrl?: string;
}

/**
 * Parses current location (hash and query string) to identify target destination
 */
export function parseCurrentRoute(): {
  isExplicitHome: boolean;
  target: RouteTarget | null;
} {
  try {
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    const searchParams = new URLSearchParams(window.location.search);

    // 1. Check if user explicitly asked for home landing page
    if (hash === 'home' || hash === 'landing' || searchParams.get('view') === 'home') {
      return { isExplicitHome: true, target: null };
    }

    // 2. Check tab from hash or search params
    // Example: #inbox, #flows/flow_123, ?tab=inbox, ?tab=flows&flowId=abc
    let rawTab = searchParams.get('tab') || '';
    let flowId = searchParams.get('flowId') || undefined;

    if (!rawTab && hash) {
      // Split on ? or / if user navigated like #flows?flowId=xyz or #flows/xyz
      const [hashPath, hashQuery] = hash.split('?');
      const segments = hashPath.split('/');
      rawTab = segments[0];

      if (segments.length > 1 && segments[1]) {
        flowId = segments[1];
      }

      if (hashQuery) {
        const hashParams = new URLSearchParams(hashQuery);
        if (!flowId && hashParams.get('flowId')) {
          flowId = hashParams.get('flowId') || undefined;
        }
      }
    }

    const normalizedKey = rawTab.toLowerCase().trim();
    const resolvedTab = TAB_ALIASES[normalizedKey];

    if (resolvedTab) {
      return {
        isExplicitHome: false,
        target: {
          tab: resolvedTab,
          flowId,
          sourceUrl: window.location.href
        }
      };
    }

    return { isExplicitHome: false, target: null };
  } catch (err) {
    console.warn('[routeUtils] Error parsing current route:', err);
    return { isExplicitHome: false, target: null };
  }
}

/**
 * Stores the destination when an unauthenticated user attempts to access a protected URL
 */
export function saveIntendedDestination(target: RouteTarget): void {
  try {
    sessionStorage.setItem(REDIRECT_STORAGE_KEY, JSON.stringify(target));
  } catch (err) {
    console.warn('[routeUtils] Failed to save intended destination in sessionStorage:', err);
  }
}

/**
 * Retrieves and clears the stored destination after successful login
 */
export function popIntendedDestination(): RouteTarget | null {
  try {
    const raw = sessionStorage.getItem(REDIRECT_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    if (parsed && parsed.tab && TAB_NAMES[parsed.tab as NavigationTab]) {
      return parsed as RouteTarget;
    }
  } catch (err) {
    console.warn('[routeUtils] Failed to retrieve intended destination:', err);
  }
  return null;
}

/**
 * Gets the last saved active tab from localStorage
 */
export function getLastSavedTab(): NavigationTab {
  try {
    const saved = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY) as NavigationTab;
    if (saved && TAB_NAMES[saved]) {
      return saved;
    }
  } catch {
    // Ignore
  }
  return 'flows';
}

/**
 * Saves current active tab to localStorage and updates URL hash seamlessly
 */
export function syncActiveTab(tab: NavigationTab, flowId?: string): void {
  try {
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
    localStorage.setItem(IN_WORKSPACE_STORAGE_KEY, 'true');

    // Update browser URL hash without full reload
    const newHash = flowId && tab === 'flows' ? `#${tab}?flowId=${encodeURIComponent(flowId)}` : `#${tab}`;
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  } catch (err) {
    console.warn('[routeUtils] Failed to sync active tab:', err);
  }
}

/**
 * Records that the user is currently viewing the public landing page
 */
export function setLandingPageView(): void {
  try {
    localStorage.setItem(IN_WORKSPACE_STORAGE_KEY, 'false');
    window.history.replaceState(null, '', '#home');
  } catch (err) {
    console.warn('[routeUtils] Failed to set landing page view:', err);
  }
}

/**
 * Checks if user was in workspace when last seen
 */
export function wasInWorkspace(): boolean {
  try {
    const val = localStorage.getItem(IN_WORKSPACE_STORAGE_KEY);
    // Default to true if user is logged in
    return val !== 'false';
  } catch {
    return true;
  }
}
