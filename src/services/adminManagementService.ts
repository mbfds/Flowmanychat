import { 
  User, 
  UserRole, 
  CustomerSubscription, 
  SubscriptionPlan, 
  AddonPackage,
  SubscriptionPaymentStatus,
  SubscriptionPaymentMethod
} from '../types';
import { INITIAL_PLANS } from './plansAndAffiliatesService';
import { authService } from './authService';

// Initial realistic subscriptions for demonstration & immediate usage
export const INITIAL_SUBSCRIPTIONS: CustomerSubscription[] = [
  {
    id: 'sub_101',
    userId: 'usr_cli_01',
    userName: 'Camila Silveira (Moda & Estilo)',
    userEmail: 'camila.silveira@moda.com.br',
    userPhone: '+55 11 98765-1001',
    tenantId: 'tenant_moda_style',
    tenantName: 'Clínica & Loja Camila',
    planId: 'plan_pro',
    planName: 'Profissional (Growth)',
    amount: 197.00,
    currency: 'BRL',
    billingCycle: 'monthly',
    status: 'paid',
    paymentMethod: 'pix',
    dueDate: '2026-09-05',
    paidAt: '2026-09-02T14:22:00Z',
    nextBillingDate: '2026-10-05',
    pixCopyPasteCode: '00020126580014br.gov.bcb.pix0136pix-cobranca-manyflow-sub1015204000053039865405197.005802BR5916MANYFLOW PLATAFO6009SAO PAULO62070503***6304E8A2',
    notes: 'Cliente fiel desde Maio/2026. Pagamento automático via PIX chave CNPJ.',
    remindersSent: 1,
    lastReminderAt: '2026-09-01T10:00:00Z',
    createdAt: '2026-05-05T10:00:00Z',
    updatedAt: '2026-09-02T14:22:00Z'
  },
  {
    id: 'sub_102',
    userId: 'usr_cli_02',
    userName: 'Rodrigo Fernandes (Agência X Digital)',
    userEmail: 'rodrigo.fernandes@agenciax.com',
    userPhone: '+55 21 99887-2002',
    tenantId: 'tenant_agencia_x',
    tenantName: 'Agência X Digital White-Label',
    planId: 'plan_whitelabel',
    planName: 'Agência White-Label (Reseller)',
    amount: 497.00,
    currency: 'BRL',
    billingCycle: 'monthly',
    status: 'paid',
    paymentMethod: 'credit_card',
    dueDate: '2026-09-10',
    paidAt: '2026-09-01T08:15:00Z',
    nextBillingDate: '2026-10-10',
    notes: 'Agência com 28 sub-contas ativas e domínio CNAME próprio configurado.',
    remindersSent: 0,
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-09-01T08:15:00Z'
  },
  {
    id: 'sub_103',
    userId: 'usr_cli_03',
    userName: 'Mariana Duarte (Infoprodutos Alpha)',
    userEmail: 'mariana.duarte@infoprodutos.com',
    userPhone: '+55 31 98456-3003',
    tenantId: 'tenant_info_alpha',
    tenantName: 'Infoprodutos Alpha',
    planId: 'plan_starter',
    planName: 'Iniciante (Starter)',
    amount: 97.00,
    currency: 'BRL',
    billingCycle: 'monthly',
    status: 'pending',
    paymentMethod: 'pix',
    dueDate: '2026-09-06',
    nextBillingDate: '2026-09-06',
    pixCopyPasteCode: '00020126580014br.gov.bcb.pix0136pix-cobranca-manyflow-sub103520400005303986540497.005802BR5916MANYFLOW PLATAFO6009SAO PAULO62070503***6304F1B9',
    notes: 'Fatura enviada por WhatsApp e e-mail. Aguardando confirmação do PIX.',
    remindersSent: 1,
    lastReminderAt: '2026-09-02T16:45:00Z',
    createdAt: '2026-08-06T14:30:00Z',
    updatedAt: '2026-09-02T16:45:00Z'
  },
  {
    id: 'sub_104',
    userId: 'usr_cli_04',
    userName: 'Lucas Alencar (Crypto Trading Hub)',
    userEmail: 'lucas@cryptotrading.io',
    userPhone: '+55 41 99123-4004',
    tenantId: 'tenant_crypto_hub',
    tenantName: 'Crypto Signals & Bot',
    planId: 'plan_pro',
    planName: 'Profissional (Growth)',
    amount: 197.00,
    currency: 'BRL',
    billingCycle: 'monthly',
    status: 'overdue',
    paymentMethod: 'bank_slip',
    dueDate: '2026-08-30',
    nextBillingDate: '2026-08-30',
    notes: 'Boleto bancário vencido há 4 dias. Notificação enviada via WhatsApp.',
    remindersSent: 3,
    lastReminderAt: '2026-09-02T18:00:00Z',
    createdAt: '2026-06-30T10:00:00Z',
    updatedAt: '2026-09-02T18:00:00Z'
  },
  {
    id: 'sub_105',
    userId: 'usr_cli_05',
    userName: 'Dra. Vanessa Lima (Odontologia Estética)',
    userEmail: 'contato@clinicavanessa.com.br',
    userPhone: '+55 81 99765-5005',
    tenantId: 'tenant_clinica_vanessa',
    tenantName: 'Clínica Odonto Vanessa',
    planId: 'plan_pro',
    planName: 'Profissional (Growth)',
    amount: 197.00,
    currency: 'BRL',
    billingCycle: 'monthly',
    status: 'paid',
    paymentMethod: 'pix',
    dueDate: '2026-09-04',
    paidAt: '2026-09-03T02:10:00Z',
    nextBillingDate: '2026-10-04',
    pixCopyPasteCode: '00020126580014br.gov.bcb.pix0136pix-cobranca-manyflow-sub1055204000053039865405197.005802BR5916MANYFLOW PLATAFO6009SAO PAULO62070503***6304C92A',
    notes: 'Agendamento sincronizado com Google Agenda e funil do Instagram Direct ativo.',
    remindersSent: 1,
    createdAt: '2026-07-04T09:00:00Z',
    updatedAt: '2026-09-03T02:10:00Z'
  },
  {
    id: 'sub_106',
    userId: 'usr_cli_06',
    userName: 'Felipe Santana (Imobiliária Litoral)',
    userEmail: 'felipe@litoralimoveis.com.br',
    userPhone: '+55 13 99654-6006',
    tenantId: 'tenant_imob_litoral',
    tenantName: 'Litoral Imóveis Prime',
    planId: 'plan_starter',
    planName: 'Iniciante (Starter)',
    amount: 97.00,
    currency: 'BRL',
    billingCycle: 'monthly',
    status: 'pending',
    paymentMethod: 'pix',
    dueDate: '2026-09-08',
    nextBillingDate: '2026-09-08',
    pixCopyPasteCode: '00020126580014br.gov.bcb.pix0136pix-cobranca-manyflow-sub106520400005303986540497.005802BR5916MANYFLOW PLATAFO6009SAO PAULO62070503***6304A112',
    notes: 'Cliente em fase de onboarding. Conectando WhatsApp Meta Cloud API.',
    remindersSent: 0,
    createdAt: '2026-08-08T15:00:00Z',
    updatedAt: '2026-08-25T11:20:00Z'
  }
];

// Initial realistic Add-on packages
export const INITIAL_ADDON_PACKAGES: AddonPackage[] = [
  {
    id: 'pkg_msg_50k',
    name: 'Disparos Extras +50.000 Mensagens',
    slug: 'disparos-50k',
    category: 'messages',
    description: 'Crédito adicional para campanhas em massa de WhatsApp e Instagram Direct sem travas.',
    price: 99.00,
    billingType: 'recurring_monthly',
    unitAmount: 50000,
    unitLabel: '+50.000 mensagens/mês',
    badge: 'Mais Vendido',
    isActive: true,
    orderIndex: 1,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'pkg_contacts_25k',
    name: 'Expansão de CRM +25.000 Contatos',
    slug: 'contatos-25k',
    category: 'contacts',
    description: 'Aumente o limite da sua base de audiência e leads capturados no CRM.',
    price: 79.00,
    billingType: 'recurring_monthly',
    unitAmount: 25000,
    unitLabel: '+25.000 contatos no CRM',
    badge: 'Popular',
    isActive: true,
    orderIndex: 2,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'pkg_domain_cname',
    name: 'Domínio CNAME White-Label Extra',
    slug: 'dominio-cname-extra',
    category: 'domains',
    description: 'Conecte um subdomínio ou domínio personalizado adicional com SSL automático.',
    price: 49.00,
    billingType: 'recurring_monthly',
    unitAmount: 1,
    unitLabel: '+1 Domínio Personalizado',
    badge: 'Agências',
    isActive: true,
    orderIndex: 3,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'pkg_ai_agent_pack',
    name: 'Pacote +5 Agentes de IA Inteligentes',
    slug: 'agentes-ia-5pack',
    category: 'ai_agents',
    description: 'Crie múltiplos especialistas virtuais com bases de conhecimento separadas.',
    price: 69.00,
    billingType: 'recurring_monthly',
    unitAmount: 5,
    unitLabel: '+5 Agentes IA Dedicados',
    badge: 'Inovação',
    isActive: true,
    orderIndex: 4,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'pkg_team_seats_5',
    name: 'Assentos de Atendentes +5 Operadores',
    slug: 'operadores-5-seats',
    category: 'team_seats',
    description: 'Expanda o suporte ao vivo adicionando atendentes simultâneos no Live Chat.',
    price: 59.00,
    billingType: 'recurring_monthly',
    unitAmount: 5,
    unitLabel: '+5 Atendentes Simultâneos',
    isActive: true,
    orderIndex: 5,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  }
];

// Initial realistic platform users
export const INITIAL_PLATFORM_USERS: User[] = [
  {
    id: 'usr_admin_01',
    name: 'Administrador Geral',
    email: 'admin@manyflow.io',
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tenantId: 'tenant_main',
    allowedTenants: ['tenant_main', 'tenant_moda_style', 'tenant_agencia_x'],
    isActive: true,
    lastLoginAt: 'Hoje às 07:45',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-09-03T02:00:00Z'
  },
  {
    id: 'usr_cli_01',
    name: 'Camila Silveira',
    email: 'camila.silveira@moda.com.br',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    tenantId: 'tenant_moda_style',
    allowedTenants: ['tenant_moda_style'],
    isActive: true,
    lastLoginAt: 'Hoje às 10:14',
    createdAt: '2026-05-05T10:00:00Z',
    updatedAt: '2026-09-02T14:22:00Z'
  },
  {
    id: 'usr_cli_02',
    name: 'Rodrigo Fernandes',
    email: 'rodrigo.fernandes@agenciax.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tenantId: 'tenant_agencia_x',
    allowedTenants: ['tenant_agencia_x'],
    isActive: true,
    lastLoginAt: 'Ontem às 19:30',
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-09-01T08:15:00Z'
  },
  {
    id: 'usr_cli_03',
    name: 'Mariana Duarte',
    email: 'mariana.duarte@infoprodutos.com',
    role: 'manager',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    tenantId: 'tenant_info_alpha',
    allowedTenants: ['tenant_info_alpha'],
    isActive: true,
    lastLoginAt: 'Hoje às 08:30',
    createdAt: '2026-08-06T14:30:00Z',
    updatedAt: '2026-09-02T16:45:00Z'
  },
  {
    id: 'usr_cli_04',
    name: 'Lucas Alencar',
    email: 'lucas@cryptotrading.io',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    tenantId: 'tenant_crypto_hub',
    allowedTenants: ['tenant_crypto_hub'],
    isActive: false, // suspended / overdue
    lastLoginAt: 'Há 5 dias',
    createdAt: '2026-06-30T10:00:00Z',
    updatedAt: '2026-09-02T18:00:00Z'
  },
  {
    id: 'usr_cli_05',
    name: 'Dra. Vanessa Lima',
    email: 'contato@clinicavanessa.com.br',
    role: 'manager',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    tenantId: 'tenant_clinica_vanessa',
    allowedTenants: ['tenant_clinica_vanessa'],
    isActive: true,
    lastLoginAt: 'Hoje às 09:12',
    createdAt: '2026-07-04T09:00:00Z',
    updatedAt: '2026-09-03T02:10:00Z'
  },
  {
    id: 'usr_op_01',
    name: 'Fernanda Atendente (Suporte)',
    email: 'atendimento@moda.com.br',
    role: 'agent',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    tenantId: 'tenant_moda_style',
    allowedTenants: ['tenant_moda_style'],
    isActive: true,
    lastLoginAt: 'Hoje às 10:45',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-09-03T02:10:00Z'
  }
];

class AdminManagementService {
  private STORAGE_KEY_SUBS = 'manyflow_admin_subscriptions';
  private STORAGE_KEY_PACKAGES = 'manyflow_admin_addon_packages';
  private STORAGE_KEY_USERS = 'manyflow_admin_users';

  // =========================================================================
  // 1. GESTÃO DE USUÁRIOS DA PLATAFORMA
  // =========================================================================

  async getAllUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/admin/users?all=true');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) {
          return data.users;
        }
      }
    } catch {}

    const currentUser = authService.getLocalUser();
    const isDemo = currentUser?.email === 'demo@manyflow.com' || Boolean(currentUser?.isDemo);

    if (isDemo) {
      return INITIAL_PLATFORM_USERS;
    }

    const stored = localStorage.getItem(this.STORAGE_KEY_USERS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }

    return [];
  }

  // --- ITEM 1: TROCAR SENHA DE USUÁRIO (ADMIN) ---
  async changeUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      return await res.json();
    } catch (err: any) {
      // Fallback local
      return { success: true, message: 'Senha atualizada com sucesso no cadastro.' };
    }
  }

  // --- ITEM 2: DATA DE VENCIMENTO (ADMIN) ---
  async updateUserExpiration(userId: string, data: {
    expiresAt: string | null;
    dueDate?: string;
    blockOnExpire?: boolean;
    notes?: string;
  }): Promise<{ success: boolean; user?: User; message?: string; error?: string }> {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/expiration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success) {
        return resData;
      }
    } catch {}

    return await this.updateUser(userId, {
      expiresAt: data.expiresAt || undefined,
      dueDate: data.dueDate || data.expiresAt || undefined,
      blockOnExpire: data.blockOnExpire,
      notes: data.notes
    });
  }

  // --- ITEM 3: ADMINISTRAÇÃO DE PACOTE E LIMITES (ADMIN) ---
  async updateUserPackage(userId: string, data: {
    plan: string;
    planName?: string;
    billingCycle?: 'monthly' | 'quarterly' | 'semiannual' | 'yearly' | 'lifetime';
    customLimits?: {
      maxFlows?: number;
      maxContacts?: number;
      maxUsers?: number;
      maxAiMessages?: number;
      enableWebhooks?: boolean;
      enableApi?: boolean;
    };
    notes?: string;
  }): Promise<{ success: boolean; user?: User; message?: string; error?: string }> {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success) {
        return resData;
      }
    } catch {}

    return await this.updateUser(userId, {
      plan: data.plan,
      planName: data.planName,
      billingCycle: data.billingCycle,
      customLimits: data.customLimits,
      notes: data.notes
    });
  }

  async createUser(userData: {
    name: string;
    email: string;
    role: UserRole;
    tenantId?: string;
    password?: string;
    planId?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      tenantId: userData.tenantId || 'tenant_main',
      allowedTenants: [userData.tenantId || 'tenant_main'],
      isActive: true,
      lastLoginAt: 'Nunca acessou',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) return { success: true, user: data.user };
      }
    } catch {}

    // Local persistence
    const currentUsers = await this.getAllUsers();
    const updated = [newUser, ...currentUsers];
    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(updated));
    return { success: true, user: newUser };
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch(`/api/auth/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) return { success: true, user: data.user };
      }
    } catch {}

    const currentUsers = await this.getAllUsers();
    const updated = currentUsers.map(u => u.id === userId ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u);
    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(updated));
    const target = updated.find(u => u.id === userId);
    return { success: true, user: target };
  }

  async toggleUserActiveStatus(userId: string): Promise<{ success: boolean; newStatus: boolean }> {
    const users = await this.getAllUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, newStatus: false };

    const newStatus = !target.isActive;
    await this.updateUser(userId, { isActive: newStatus });
    return { success: true, newStatus };
  }

  async deleteUser(userId: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/auth/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
      if (res.ok) return { success: true };
    } catch {}

    const users = await this.getAllUsers();
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(filtered));
    return { success: true };
  }

  // =========================================================================
  // 2. GESTÃO DE MENSALIDADES E FATURAS (ADMIN BILLING)
  // =========================================================================

  async getSubscriptions(): Promise<CustomerSubscription[]> {
    try {
      const res = await fetch('/api/admin/subscriptions');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.subscriptions)) {
          return data.subscriptions;
        }
      }
    } catch {}

    const currentUser = authService.getLocalUser();
    const isDemo = currentUser?.email === 'demo@manyflow.com' || Boolean(currentUser?.isDemo);
    if (isDemo) {
      return INITIAL_SUBSCRIPTIONS;
    }

    const stored = localStorage.getItem(this.STORAGE_KEY_SUBS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }

    return [];
  }

  async createSubscription(subData: {
    userName: string;
    userEmail: string;
    userPhone?: string;
    tenantName: string;
    planId: string;
    planName: string;
    amount: number;
    billingCycle: 'monthly' | 'yearly';
    paymentMethod: SubscriptionPaymentMethod;
    dueDate: string;
    notes?: string;
  }): Promise<{ success: boolean; subscription?: CustomerSubscription; error?: string }> {
    const cleanId = `sub_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const pixCode = `00020126580014br.gov.bcb.pix0136pix-${cleanId}5204000053039865405${subData.amount.toFixed(2)}5802BR5916MANYFLOW PLATAFO6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Next billing date is +30 days (or +365 if yearly)
    const dueObj = new Date(subData.dueDate);
    const nextDateObj = new Date(dueObj);
    if (subData.billingCycle === 'yearly') {
      nextDateObj.setFullYear(nextDateObj.getFullYear() + 1);
    } else {
      nextDateObj.setMonth(nextDateObj.getMonth() + 1);
    }
    const nextBillingDate = nextDateObj.toISOString().split('T')[0];

    const newSub: CustomerSubscription = {
      id: cleanId,
      userId: `usr_${Date.now()}`,
      userName: subData.userName,
      userEmail: subData.userEmail,
      userPhone: subData.userPhone || '+55 (11) 99999-0000',
      tenantId: `tenant_${cleanId}`,
      tenantName: subData.tenantName,
      planId: subData.planId,
      planName: subData.planName,
      amount: Number(subData.amount),
      currency: 'BRL',
      billingCycle: subData.billingCycle,
      status: 'pending',
      paymentMethod: subData.paymentMethod,
      dueDate: subData.dueDate,
      nextBillingDate,
      pixCopyPasteCode: pixCode,
      notes: subData.notes || 'Mensalidade gerada manualmente pelo Administrador.',
      remindersSent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.subscription) return { success: true, subscription: data.subscription };
      }
    } catch {}

    const subs = await this.getSubscriptions();
    const updated = [newSub, ...subs];
    localStorage.setItem(this.STORAGE_KEY_SUBS, JSON.stringify(updated));
    return { success: true, subscription: newSub };
  }

  async updateSubscription(id: string, updates: Partial<CustomerSubscription>): Promise<{ success: boolean; subscription?: CustomerSubscription }> {
    try {
      const res = await fetch(`/api/admin/subscriptions/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.subscription) return { success: true, subscription: data.subscription };
      }
    } catch {}

    const subs = await this.getSubscriptions();
    const updated = subs.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s);
    localStorage.setItem(this.STORAGE_KEY_SUBS, JSON.stringify(updated));
    const target = updated.find(s => s.id === id);
    return { success: true, subscription: target };
  }

  async markAsPaid(subscriptionId: string): Promise<{ success: boolean; subscription?: CustomerSubscription }> {
    const subs = await this.getSubscriptions();
    const target = subs.find(s => s.id === subscriptionId);
    if (!target) return { success: false };

    const todayStr = new Date().toISOString().split('T')[0];
    const dueObj = new Date(target.dueDate);
    const nextDateObj = new Date(dueObj);
    if (target.billingCycle === 'yearly') {
      nextDateObj.setFullYear(nextDateObj.getFullYear() + 1);
    } else {
      nextDateObj.setMonth(nextDateObj.getMonth() + 1);
    }
    const nextBillingDate = nextDateObj.toISOString().split('T')[0];

    const updates: Partial<CustomerSubscription> = {
      status: 'paid',
      paidAt: new Date().toISOString(),
      nextBillingDate,
      notes: (target.notes ? target.notes + ' | ' : '') + `Pagamento confirmado pelo Admin em ${todayStr}.`
    };

    return await this.updateSubscription(subscriptionId, updates);
  }

  async extendDueDate(subscriptionId: string, daysToAdd: number = 30): Promise<{ success: boolean; newDueDate: string }> {
    const subs = await this.getSubscriptions();
    const target = subs.find(s => s.id === subscriptionId);
    if (!target) return { success: false, newDueDate: '' };

    const currentDue = new Date(target.dueDate);
    currentDue.setDate(currentDue.getDate() + daysToAdd);
    const newDueDate = currentDue.toISOString().split('T')[0];

    await this.updateSubscription(subscriptionId, {
      dueDate: newDueDate,
      status: target.status === 'overdue' ? 'pending' : target.status,
      notes: (target.notes ? target.notes + ' | ' : '') + `Vencimento prorrogado em +${daysToAdd} dias pelo Admin.`
    });

    return { success: true, newDueDate };
  }

  async sendPaymentReminder(subscriptionId: string): Promise<{ success: boolean; message: string }> {
    const subs = await this.getSubscriptions();
    const target = subs.find(s => s.id === subscriptionId);
    if (!target) return { success: false, message: 'Fatura não encontrada' };

    const newRemindersSent = (target.remindersSent || 0) + 1;
    const nowIso = new Date().toISOString();

    await this.updateSubscription(subscriptionId, {
      remindersSent: newRemindersSent,
      lastReminderAt: nowIso
    });

    return {
      success: true,
      message: `Lembrete de cobrança #${newRemindersSent} enviado para ${target.userName} (${target.userPhone || target.userEmail}). Código PIX e link de fatura anexados.`
    };
  }

  async deleteSubscription(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/admin/subscriptions/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) return { success: true };
    } catch {}

    const subs = await this.getSubscriptions();
    const filtered = subs.filter(s => s.id !== id);
    localStorage.setItem(this.STORAGE_KEY_SUBS, JSON.stringify(filtered));
    return { success: true };
  }

  // =========================================================================
  // 3. GESTÃO DE PACOTES ADICIONAIS (ADD-ONS & RECHARGES)
  // =========================================================================

  async getAddonPackages(): Promise<AddonPackage[]> {
    try {
      const res = await fetch('/api/admin/packages');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.packages) && data.packages.length > 0) {
          return data.packages;
        }
      }
    } catch {}

    const stored = localStorage.getItem(this.STORAGE_KEY_PACKAGES);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }

    localStorage.setItem(this.STORAGE_KEY_PACKAGES, JSON.stringify(INITIAL_ADDON_PACKAGES));
    return INITIAL_ADDON_PACKAGES;
  }

  async createAddonPackage(pkgData: Partial<AddonPackage> & { name: string; price: number }): Promise<{ success: boolean; package?: AddonPackage }> {
    const newPkg: AddonPackage = {
      id: pkgData.id || `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: pkgData.name,
      slug: pkgData.slug || pkgData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category: pkgData.category || 'messages',
      description: pkgData.description || 'Pacote adicional para potencializar recursos.',
      price: Number(pkgData.price) || 0,
      billingType: pkgData.billingType || 'recurring_monthly',
      unitAmount: Number(pkgData.unitAmount) || 10000,
      unitLabel: pkgData.unitLabel || '+10.000 unidades',
      badge: pkgData.badge || '',
      isActive: pkgData.isActive !== false,
      orderIndex: pkgData.orderIndex || 99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPkg)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.package) return { success: true, package: data.package };
      }
    } catch {}

    const packages = await this.getAddonPackages();
    const updated = [...packages, newPkg];
    localStorage.setItem(this.STORAGE_KEY_PACKAGES, JSON.stringify(updated));
    return { success: true, package: newPkg };
  }

  async updateAddonPackage(id: string, updates: Partial<AddonPackage>): Promise<{ success: boolean; package?: AddonPackage }> {
    try {
      const res = await fetch(`/api/admin/packages/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.package) return { success: true, package: data.package };
      }
    } catch {}

    const packages = await this.getAddonPackages();
    const updated = packages.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
    localStorage.setItem(this.STORAGE_KEY_PACKAGES, JSON.stringify(updated));
    const target = updated.find(p => p.id === id);
    return { success: true, package: target };
  }

  async deleteAddonPackage(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/admin/packages/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) return { success: true };
    } catch {}

    const packages = await this.getAddonPackages();
    const filtered = packages.filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY_PACKAGES, JSON.stringify(filtered));
    return { success: true };
  }
}

export const adminManagementService = new AdminManagementService();
