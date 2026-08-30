import React, { useState, useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Radio, 
  Link2, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Copy, 
  Download, 
  QrCode, 
  Server, 
  RefreshCw, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Zap,
  Phone,
  Settings,
  Trash2,
  Play,
  Send,
  UserCheck,
  UserX,
  CreditCard
} from 'lucide-react';
import { 
  WhatsAppGroup, 
  GroupSubscriber, 
  SmartLinkRotator, 
  GroupBroadcastTask, 
  HybridWhatsAppEngineStatus,
  BaileysQueueItem,
  BaileysGroupSyncStatus,
  BaileysEventLog
} from '../../types';
import { 
  INITIAL_WHATSAPP_GROUPS, 
  INITIAL_SMART_ROTATORS, 
  INITIAL_GROUP_SUBSCRIBERS, 
  INITIAL_HYBRID_ENGINE_STATUS,
  INITIAL_BAILEYS_QUEUE,
  INITIAL_BAILEYS_GROUP_STATUSES,
  INITIAL_BAILEYS_LOGS
} from '../../data/whatsappGroupData';
import { CreateGroupModal } from './CreateGroupModal';
import { CreateSmartLinkModal } from './CreateSmartLinkModal';
import { GroupBroadcastModal } from './GroupBroadcastModal';
import { BaileysStatusMonitor } from './BaileysStatusMonitor';
import { GroupGrowthAnalytics } from './GroupGrowthAnalytics';

interface WhatsAppGroupDashboardProps {
  onOpenFlow?: (flowId: string) => void;
}

export const WhatsAppGroupDashboard: React.FC<WhatsAppGroupDashboardProps> = ({
  onOpenFlow
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'growth_analytics' | 'groups_list' | 'monetization' | 'smart_links' | 'broadcaster' | 'baileys_monitor' | 'engine_settings'>('overview');
  
  // Data state
  const [groups, setGroups] = useState<WhatsAppGroup[]>(INITIAL_WHATSAPP_GROUPS);
  const [subscribers, setSubscribers] = useState<GroupSubscriber[]>(INITIAL_GROUP_SUBSCRIBERS);
  const [smartRotators, setSmartRotators] = useState<SmartLinkRotator[]>(INITIAL_SMART_ROTATORS);
  const [baileysQueue, setBaileysQueue] = useState<BaileysQueueItem[]>(INITIAL_BAILEYS_QUEUE);
  const [baileysGroupStatuses, setBaileysGroupStatuses] = useState<BaileysGroupSyncStatus[]>(INITIAL_BAILEYS_GROUP_STATUSES);
  const [baileysLogs, setBaileysLogs] = useState<BaileysEventLog[]>(INITIAL_BAILEYS_LOGS);
  const [broadcastTasks, setBroadcastTasks] = useState<GroupBroadcastTask[]>([
    {
      id: 'task_01',
      title: 'Aviso Live Sinais Fechamento',
      targetGroupJids: ['120363198273619283@g.us', '120363283746192847@g.us'],
      messageText: '🚨 *CALL DE FECHAMENTO AO VIVO EM 10 MINUTOS*! Link liberado no Meet.',
      mentionAll: true,
      delayMinSeconds: 5,
      delayMaxSeconds: 10,
      status: 'completed',
      sentCount: 2,
      totalCount: 2,
      createdAt: '2026-08-30T14:00:00Z'
    }
  ]);
  const [engineStatus, setEngineStatus] = useState<HybridWhatsAppEngineStatus>(INITIAL_HYBRID_ENGINE_STATUS);

  // Modals state
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateSmartLinkOpen, setIsCreateSmartLinkOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [selectedGroupForDetail, setSelectedGroupForDetail] = useState<WhatsAppGroup | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Show Toast
  const triggerToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // Metrics calculations
  const totalMembers = useMemo(() => groups.reduce((acc, g) => acc + g.memberCount, 0), [groups]);
  const totalCapacity = useMemo(() => groups.reduce((acc, g) => acc + g.maxMembers, 0), [groups]);
  const totalRevenue = useMemo(() => groups.reduce((acc, g) => acc + g.stats.revenueTotal, 0), [groups]);
  const totalActiveSubscribers = useMemo(() => subscribers.filter(s => s.status === 'active').length, [subscribers]);
  
  // Total entries today across groups
  const todayEntries = useMemo(() => {
    return groups.reduce((acc, g) => {
      const todayHistory = g.stats.dailyJoinsHistory[g.stats.dailyJoinsHistory.length - 1];
      return acc + (todayHistory ? todayHistory.count : 0);
    }, 0);
  }, [groups]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    triggerToast(`Copiado: ${label}`);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Toggle Group Mute / Read-only (Admin only)
  const handleToggleAdminOnly = (groupId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const nextStatus = g.status === 'muted' ? 'active' : 'muted';
        triggerToast(nextStatus === 'muted' ? `Grupo "${g.name}" fechado (somente admins enviam)` : `Grupo "${g.name}" aberto para todos`);
        return { ...g, status: nextStatus };
      }
      return g;
    }));
  };

  // Toggle Auto-Kick for Expired
  const handleKickExpiredSubscriber = (subscriberId: string) => {
    const sub = subscribers.find(s => s.id === subscriberId);
    if (!sub) return;

    setSubscribers(prev => prev.map(s => s.id === subscriberId ? { ...s, status: 'removed' } : s));
    triggerToast(`Membro ${sub.name} expulso do grupo via Baileys Engine`);
  };

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [groups, searchQuery, categoryFilter]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-slate-950 overflow-y-auto text-slate-900 dark:text-slate-100">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Top Banner / Hero Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5 shrink-0 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Super Administrador & Monetização de Grupos WhatsApp
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-600" />
                    Motor Híbrido Ativo
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  API Oficial Meta Cloud para Webhooks + Baileys Engine para Gestão de Grupos, Anti-Link, Disparos e Cobrança VIP
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>Disparo em Grupos</span>
            </button>

            <button
              onClick={() => setIsCreateSmartLinkOpen(true)}
              className="py-2 px-3.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100/70 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Link Rotacionador</span>
            </button>

            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Grupo</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-1 mt-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral & Métricas', icon: TrendingUp },
            { id: 'growth_analytics', label: 'Gráficos de Crescimento & Retenção', icon: TrendingUp, badge: '+96.8%' },
            { id: 'groups_list', label: `Grupos Administrados (${groups.length})`, icon: Users },
            { id: 'baileys_monitor', label: 'Monitor Baileys API & Fila', icon: Zap, badge: `${baileysQueue.filter(q => q.status === 'queued' || q.status === 'sending').length} na fila` },
            { id: 'monetization', label: `Monetização VIP & Assinantes (${subscribers.length})`, icon: DollarSign, badge: 'R$ 243k' },
            { id: 'smart_links', label: `Links Inteligentes / Tráfego (${smartRotators.length})`, icon: Link2 },
            { id: 'broadcaster', label: 'Disparador em Massa', icon: Radio },
            { id: 'engine_settings', label: 'Motor Híbrido (Baileys + Meta)', icon: Server, badge: 'Online' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="max-w-7xl mx-auto p-6 w-full space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Membros Totais */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Membros em Grupos
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {totalMembers.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    / {totalCapacity.toLocaleString('pt-BR')} vagas
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.round((totalMembers / totalCapacity) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>{Math.round((totalMembers / totalCapacity) * 100)}% ocupação</span>
                  <span className="font-semibold text-emerald-600">+{todayEntries} hoje</span>
                </div>
              </div>

              {/* Card 2: Entradas Hoje */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Entradas Hoje (Leads)
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    +{todayEntries}
                  </span>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    +24.8% vs ontem
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
                  Distribuídos em {groups.length} grupos via links inteligentes
                </p>
              </div>

              {/* Card 3: MRR Monetização VIP */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Faturamento Grupos VIP
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{totalActiveSubscribers} assinantes pagantes ativos</span>
                </div>
              </div>

              {/* Card 4: Status do Motor */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status Baileys + Meta
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Híbrido 100% Operacional
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-0.5">
                  <p>• Meta Cloud: Webhook Conectado</p>
                  <p>• Baileys: {engineStatus.baileys.connectedNumber}</p>
                </div>
              </div>
            </div>

            {/* Growth & Retention Analytics Widgets (Recharts) */}
            <GroupGrowthAnalytics 
              groups={groups} 
              onSelectGroup={(grpId) => {
                setSelectedGroupForDetail(groups.find(g => g.id === grpId) || null);
                setActiveTab('groups_list');
              }}
            />

            {/* Daily Joins by Group Details & Strategies */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart Card: Entradas de Membros por Grupo */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Monitor de Entradas por Grupo (Últimos 7 Dias)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Volume diário de novos leads e taxa de retenção por sala
                    </p>
                  </div>

                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Total: +{todayEntries} novos membros hoje
                  </span>
                </div>

                {/* Bars Representation */}
                <div className="space-y-4 pt-2">
                  {groups.map((grp) => {
                    const todayCount = grp.stats.dailyJoinsHistory[grp.stats.dailyJoinsHistory.length - 1]?.count || 0;
                    const maxDailyJoins = 150;
                    const percentage = Math.min(100, Math.round((todayCount / maxDailyJoins) * 100));

                    return (
                      <div key={grp.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={grp.avatarUrl} alt="" className="w-6 h-6 rounded-lg object-cover" />
                            <span className="truncate text-slate-900 dark:text-white font-bold">{grp.name}</span>
                            {grp.isVipMonetized && (
                              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                VIP R$ {grp.pricing?.price}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-emerald-600 font-bold">+{todayCount} hoje</span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {grp.memberCount}/{grp.maxMembers} ({Math.round((grp.memberCount / grp.maxMembers) * 100)}%)
                            </span>
                          </div>
                        </div>

                        {/* Visual Bar */}
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full rounded-full transition-all ${
                              grp.memberCount >= 1000 ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.round((grp.memberCount / grp.maxMembers) * 100)}%` }}
                          />
                        </div>

                        {/* Group Mini Stats */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <span>Mensagens 24h: <strong>{grp.stats.messagesCount24h}</strong></span>
                            <span>•</span>
                            <span>Churn: <strong>{grp.stats.churnRate}%</strong></span>
                          </div>
                          <button
                            onClick={() => handleCopy(grp.inviteLink, `Link do grupo ${grp.name}`)}
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copiar Link</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Side Card: Como Ganhar $ Administrando Grupos */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Estratégias de Monetização
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Transforme comunidades e grupos em receita recorrente com automação completa:
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="font-bold text-amber-300 block">1. Assinaturas VIP Recorrentes (SaaS)</span>
                    <p className="text-slate-400 text-[11px]">
                      Cobrança mensal automática via Pix ou Cartão. O Baileys expulsa quem não renova no vencimento.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="font-bold text-blue-300 block">2. Funil de Transbordo para Lançamentos</span>
                    <p className="text-slate-400 text-[11px]">
                      Links inteligentes que enchem grupo 1, 2, 3... e disparam ofertas simultâneas com 1 clique.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="font-bold text-emerald-300 block">3. Moderação Anti-Spam com IA</span>
                    <p className="text-slate-400 text-[11px]">
                      Expulsa invasores e quem compartilha links externos, preservando o valor e autoridade do seu grupo.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('monetization')}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Gerenciar Assinantes VIP</span>
                </button>
              </div>
            </div>

            {/* Baileys Real-time Queue & Sockets Overview Strip */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Status do Motor Baileys (API Não-Oficial) & Fila de Disparos
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        v6.7.8 ONLINE
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Monitoramento em tempo real do outbox de mensagens, anti-ban delay e sincronização de grupos
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('baileys_monitor')}
                  className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>Abrir Monitor Completo da API</span>
                </button>
              </div>

              {/* Mini Queue Preview Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {baileysQueue.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                        {item.groupName}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        item.status === 'sending' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                        item.status === 'queued' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status === 'sending' ? 'Enviando...' : item.status === 'queued' ? 'Na Fila' : 'Entregue'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono truncate">
                      {item.previewContent}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Anti-ban: {item.antiBanDelaySec}s</span>
                      <span>{new Date(item.scheduledAt).toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: GROWTH & RETENTION ANALYTICS */}
        {activeTab === 'growth_analytics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <GroupGrowthAnalytics 
              groups={groups} 
              onSelectGroup={(grpId) => {
                setSelectedGroupForDetail(groups.find(g => g.id === grpId) || null);
                setActiveTab('groups_list');
              }}
            />
          </div>
        )}

        {/* TAB 2: GROUPS LIST */}
        {activeTab === 'groups_list' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar grupo por nome ou descrição..."
                  className="w-full text-xs bg-transparent border-none outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="vip_monetized">💎 VIP Monetizado</option>
                  <option value="launch_funnel">🔥 Lançamento</option>
                  <option value="community">💬 Comunidade</option>
                  <option value="leads">🎯 Leads</option>
                </select>

                <button
                  onClick={() => setIsCreateGroupOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Grupo</span>
                </button>
              </div>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups.map((grp) => {
                const isFull = grp.memberCount >= grp.maxMembers;
                const isMuted = grp.status === 'muted';

                return (
                  <div 
                    key={grp.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={grp.avatarUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {grp.name}
                              </h4>
                              {isFull && (
                                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                  LOTADO
                                </span>
                              )}
                              {isMuted && (
                                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                  SILENCIADO
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                              {grp.description || 'Sem descrição cadastrada.'}
                            </p>
                          </div>
                        </div>

                        {grp.isVipMonetized && (
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                              R$ {grp.pricing?.price.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {grp.pricing?.billingCycle}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Capacity bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {grp.memberCount} membros ({grp.maxMembers - grp.memberCount} vagas restantes)
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {Math.round((grp.memberCount / grp.maxMembers) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isFull ? 'bg-rose-500' : grp.memberCount > 800 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.round((grp.memberCount / grp.maxMembers) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Rules Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {grp.autoManagement.antiLink && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Anti-Link Ativo
                          </span>
                        )}
                        {grp.autoManagement.autoWelcome && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Boas-Vindas Auto
                          </span>
                        )}
                        {grp.autoManagement.autoMuteSchedule.enabled && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Silêncio {grp.autoManagement.autoMuteSchedule.muteTime} - {grp.autoManagement.autoMuteSchedule.unmuteTime}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopy(grp.inviteLink, `Link do grupo ${grp.name}`)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Link de Convite</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleAdminOnly(grp.id)}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            isMuted
                              ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                          title={isMuted ? 'Reabrir grupo para mensagens' : 'Silenciar grupo (somente admins)'}
                        >
                          {isMuted ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          <span className="text-[11px]">{isMuted ? 'Abrir' : 'Fechar'}</span>
                        </button>

                        <button
                          onClick={() => {
                            triggerToast(`Exportando ${grp.memberCount} contatos do grupo "${grp.name}" em formato CSV/VCF...`);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                          title="Exportar contatos (CSV / VCF)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MONETIZATION & VIP SUBSCRIBERS */}
        {activeTab === 'monetization' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* VIP Revenue Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Faturamento Total Acumulado
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  +R$ 18.420,00 nos últimos 30 dias
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assinantes VIP Ativos
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {totalActiveSubscribers}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Taxa de renovação: 94.2%
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Vencimentos nos Próximos 7 Dias
                </span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                  62 membros
                </div>
                <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
                  Alertas D-3 e D-1 enviados automaticamente
                </span>
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    Gestão de Membros VIP & Expiração Automática
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O Baileys Engine remove automaticamente membros não-pagantes após o vencimento
                  </p>
                </div>

                <button
                  onClick={() => triggerToast('Sincronização de pagamentos com Gateway/Pix concluída!')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sincronizar Pagamentos</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Membro / Telefone</th>
                      <th className="py-3 px-3">Grupo VIP</th>
                      <th className="py-3 px-3">Plano / Valor</th>
                      <th className="py-3 px-3">Vencimento</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Ação Baileys</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {sub.avatarUrl ? (
                              <img src={sub.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
                                {sub.name.slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{sub.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono">{sub.phone}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-700 dark:text-slate-300 block truncate max-w-[200px]">
                            {sub.groupName}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            R$ {sub.amountPaid.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500">{sub.plan} • {sub.paymentMethod.toUpperCase()}</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            {new Date(sub.expiresAt).toLocaleDateString('pt-BR')}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {sub.status === 'active' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Ativo
                            </span>
                          )}
                          {sub.status === 'expiring_soon' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Vence em Breve
                            </span>
                          )}
                          {sub.status === 'expired' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              Vencido
                            </span>
                          )}
                          {sub.status === 'removed' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              Removido
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          {sub.status === 'expired' || sub.status === 'expiring_soon' ? (
                            <button
                              onClick={() => handleKickExpiredSubscriber(sub.id)}
                              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Expulsar Agora
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Protegido</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SMART LINKS ROTATOR */}
        {activeTab === 'smart_links' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Links Inteligentes de Transbordo (Smart Rotators)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Use uma única URL nos seus anúncios do Meta Ads ou TikTok. O sistema envia cada novo lead para o grupo que tiver vagas abertas.
                </p>
              </div>

              <button
                onClick={() => setIsCreateSmartLinkOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Link Inteligente</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartRotators.map((rotator) => (
                <div key={rotator.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rotator.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {rotator.description}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {rotator.targetGroupJids.length} Grupos Vinculados
                    </span>
                  </div>

                  {/* URL Box */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate">
                      chat.manyflow.io/{rotator.slug}
                    </span>
                    <button
                      onClick={() => handleCopy(`https://chat.manyflow.io/${rotator.slug}`, 'Link Inteligente')}
                      className="p-1 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Cliques</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {rotator.totalClicks.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Entradas</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {rotator.totalConversions.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Conversão</span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">
                        {rotator.conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: GROUP BROADCASTER */}
        {activeTab === 'broadcaster' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Disparador em Massa com Anti-Ban
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Envie comunicados, avisos de aulas e links para dezenas de grupos simultaneamente com intervalos humanizados
                </p>
              </div>

              <button
                onClick={() => setIsBroadcastOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Novo Disparo em Grupos</span>
              </button>
            </div>

            {/* Broadcast Tasks History */}
            <div className="space-y-3">
              {broadcastTasks.map((task) => (
                <div key={task.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {task.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(task.createdAt).toLocaleString('pt-BR')} • {task.targetGroupJids.length} grupos
                      </span>
                    </div>

                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {task.status.toUpperCase()} ({task.sentCount}/{task.totalCount})
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {task.messageText}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Delay Anti-Ban: <strong>{task.delayMinSeconds}s a {task.delayMaxSeconds}s</strong></span>
                    <span>•</span>
                    <span>Marcar @todos: <strong>{task.mentionAll ? 'Sim' : 'Não'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: BAILEYS STATUS MONITOR (DISPATCH QUEUE & GROUP SOCKETS) */}
        {activeTab === 'baileys_monitor' && (
          <BaileysStatusMonitor
            engineStatus={engineStatus}
            queueItems={baileysQueue}
            groupStatuses={baileysGroupStatuses}
            eventLogs={baileysLogs}
            onTriggerTestDispatch={(groupJid, text) => {
              const targetGroup = groups.find(g => g.jid === groupJid) || groups[0];
              const newItem: BaileysQueueItem = {
                id: `queue_${Date.now()}`,
                targetGroupJid: groupJid,
                groupName: targetGroup ? targetGroup.name : 'Grupo WhatsApp',
                messageType: 'text',
                previewContent: text,
                mentionAll: false,
                antiBanDelaySec: 4.0,
                scheduledAt: new Date().toISOString(),
                status: 'queued',
                ackStatus: 'PENDING',
                retryCount: 0
              };
              setBaileysQueue(prev => [newItem, ...prev]);
            }}
            onClearQueue={() => {
              setBaileysQueue(prev => prev.filter(q => q.status === 'queued' || q.status === 'sending'));
            }}
            onForceGroupSync={() => {
              setBaileysGroupStatuses(prev => prev.map(g => ({
                ...g,
                lastSyncTimestamp: new Date().toISOString(),
                pingMs: Math.floor(Math.random() * 30) + 70
              })));
            }}
            onToggleGroupMute={(groupJid) => {
              const grp = groups.find(g => g.jid === groupJid);
              if (grp) {
                handleToggleAdminOnly(grp.id);
              }
            }}
          />
        )}

        {/* TAB 6: HYBRID ENGINE SETTINGS */}
        {activeTab === 'engine_settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: Meta Cloud API Oficial */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        1. Meta Cloud API Oficial (WhatsApp Cloud)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Usado para recepção de webhooks, segurança e verificação de empresa
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Conectado
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500">Nome Verificado:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{engineStatus.cloudApi.verifiedName}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500">Tier de Envio Oficial:</span>
                    <span className="font-bold text-emerald-600">{engineStatus.cloudApi.tier} (100k msgs/dia)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500">Webhook URL:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] truncate">{engineStatus.cloudApi.webhookUrl}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Baileys Multi-Device Engine */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        2. Baileys Multi-Device (Engine de Grupos)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Usado para criar grupos, expulsão automática de inadimplentes e anti-link
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Sessão Ativa
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500">Número Conectado:</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{engineStatus.baileys.connectedNumber}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500">Grupos Gerenciados:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{groups.length} grupos ativos</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500">Versão Baileys:</span>
                    <span className="font-mono text-emerald-600 font-bold">{engineStatus.baileys.platform}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab('baileys_monitor')}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Ver Fila & Status Socket</span>
                  </button>

                  <button
                    onClick={() => triggerToast('QR Code Baileys atualizado com sucesso')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Reconectar Sessão</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={(newGrp) => {
          setGroups(prev => [newGrp, ...prev]);
          triggerToast(`Grupo "${newGrp.name}" criado com sucesso via Baileys Engine!`);
        }}
      />

      <CreateSmartLinkModal
        isOpen={isCreateSmartLinkOpen}
        onClose={() => setIsCreateSmartLinkOpen(false)}
        groups={groups}
        onCreateSmartLink={(newRotator) => {
          setSmartRotators(prev => [newRotator, ...prev]);
          triggerToast(`Link Inteligente "chat.manyflow.io/${newRotator.slug}" gerado!`);
        }}
      />

      <GroupBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        groups={groups}
        onSendBroadcast={(task) => {
          setBroadcastTasks(prev => [task, ...prev]);
          triggerToast(`Disparo iniciado em ${task.targetGroupJids.length} grupos com anti-ban delay!`);
        }}
      />
    </div>
  );
};
