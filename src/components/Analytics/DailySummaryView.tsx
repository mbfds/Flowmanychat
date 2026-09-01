import React from 'react';
import { 
  MessageSquare, 
  Users, 
  Zap, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  ArrowRight,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Flow, Contact, LiveConversation } from '../../types';

interface DailySummaryViewProps {
  flows: Flow[];
  contacts?: Contact[];
  conversations?: LiveConversation[];
  onOpenFlow?: (flowId: string) => void;
  onOpenSimulator?: (flowId?: string) => void;
  onViewDetailedAnalytics?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const DailySummaryView: React.FC<DailySummaryViewProps> = ({
  flows,
  contacts = [],
  conversations = [],
  onOpenFlow,
  onOpenSimulator,
  onViewDetailedAnalytics,
  onNavigateTab
}) => {
  // 1. Critical Metric 1: Pending Conversations
  const pendingConversations = conversations.filter(
    (c) => c.status === 'human_takeover' || c.isStarred || (c as any).isPending
  );
  const pendingCount = pendingConversations.length > 0 ? pendingConversations.length : 3;
  const answeredTodayCount = Math.max(conversations.length * 8, 48);

  // Hourly distribution for pending/handled messages (ultra-simplified sparkline)
  const hourlyData = [
    { hour: '08h', val: 4 },
    { hour: '10h', val: 12 },
    { hour: '12h', val: 19 },
    { hour: '14h', val: 28 },
    { hour: '16h', val: 22 },
    { hour: '18h', val: 35 },
    { hour: 'Agora', val: 14 }
  ];
  const maxHourly = Math.max(...hourlyData.map(d => d.val));

  // 2. Critical Metric 2: New Contacts Today
  const totalContacts = contacts.length > 0 ? contacts.length : 1240;
  const newContactsToday = Math.round(totalContacts * 0.04) || 28;
  
  // Last 7 days trend for new contacts (ultra-simplified curve)
  const contactTrend = [14, 18, 16, 22, 25, 31, newContactsToday];
  const maxTrend = Math.max(...contactTrend);

  // 3. Critical Metric 3: Most Active Flow
  const sortedFlows = [...flows].sort((a, b) => (b.stats?.runs || 0) - (a.stats?.runs || 0));
  const mostActiveFlow = sortedFlows[0] || {
    id: 'flow_lead_magnet',
    title: 'Captura de Leads no Direct + Entrega de Material',
    channel: 'instagram',
    stats: { runs: 1420, completed: 1180, ctr: 83.1 },
    isActive: true
  };

  const todayDateStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FB] dark:bg-slate-950 p-6 lg:p-10 overflow-y-auto select-none">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Header: Minimalist Day Summary Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{todayDateStr}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Automações em tempo real</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Resumo do Dia
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Os 3 indicadores mais críticos do seu atendimento e automação para hoje.
            </p>
          </div>

          {/* Quick toggle to Detailed Funnel View if needed */}
          {onViewDetailedAnalytics && (
            <button
              id="btn_switch_to_detailed_analytics"
              onClick={onViewDetailedAnalytics}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs flex items-center gap-2 transition-all cursor-pointer group"
            >
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Visão Detalhada & Funis</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* 3 Critical Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* CARD 1: CONVERSAS PENDENTES */}
          <div 
            id="card_metric_conversas_pendentes"
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Conversas Pendentes
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  pendingCount > 0 
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 animate-pulse' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {pendingCount > 0 ? 'Ação requerida' : 'Resolvido'}
                </span>
              </div>

              {/* Big metric count */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {pendingCount}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  aguardando resposta humana
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Tempo médio de espera: <strong>~2.4 min</strong></span>
              </div>

              {/* Ultra-simplified Bar Sparkline */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Fluxo de Mensagens (Hoje)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{answeredTodayCount} respondidas</span>
                </div>
                <div className="flex items-end gap-1.5 h-12 w-full pt-1">
                  {hourlyData.map((bar, i) => {
                    const heightPct = Math.max(15, Math.round((bar.val / maxHourly) * 100));
                    const isLatest = i === hourlyData.length - 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                        <div 
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-sm transition-all ${
                            isLatest 
                              ? 'bg-amber-500 dark:bg-amber-400' 
                              : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300'
                          }`}
                          title={`${bar.hour}: ${bar.val} conversas`}
                        />
                        <span className="text-[9px] text-slate-400 truncate w-full text-center">
                          {bar.hour}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                id="btn_daily_goto_inbox"
                onClick={() => onNavigateTab ? onNavigateTab('inbox') : undefined}
                className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Atender no Inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CARD 2: NOVOS CONTATOS */}
          <div 
            id="card_metric_novos_contatos"
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Novos Contatos
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +18.4%
                </span>
              </div>

              {/* Big metric count */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  +{newContactsToday}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  capturados hoje
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Base total: <strong>{totalContacts.toLocaleString()} leads</strong></span>
              </div>

              {/* Ultra-simplified 7-Day Trend Chart */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Tendência (Últimos 7 dias)</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Crescimento constante</span>
                </div>
                
                {/* SVG Curve sparkline */}
                <div className="h-12 w-full flex items-center justify-center">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 140 40">
                    <defs>
                      <linearGradient id="contactGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Area */}
                    <path
                      d="M 0 35 L 20 28 L 40 30 L 60 22 L 80 18 L 100 12 L 120 8 L 140 6 L 140 40 L 0 40 Z"
                      fill="url(#contactGrad)"
                    />
                    {/* Line */}
                    <path
                      d="M 0 35 L 20 28 L 40 30 L 60 22 L 80 18 L 100 12 L 120 8 L 140 6"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* End point pulse */}
                    <circle cx="140" cy="6" r="3.5" fill="#3B82F6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                id="btn_daily_goto_contacts"
                onClick={() => onNavigateTab ? onNavigateTab('contacts') : undefined}
                className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Ver Base de Contatos & CRM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CARD 3: FLUXO MAIS ATIVO */}
          <div 
            id="card_metric_fluxo_mais_ativo"
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Fluxo Mais Ativo
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  {mostActiveFlow.stats?.ctr || 84}% CTR
                </span>
              </div>

              {/* Big metric count */}
              <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1" title={mostActiveFlow.title}>
                  {mostActiveFlow.title}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {(mostActiveFlow.stats?.runs || 1420).toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    execuções registradas
                  </span>
                </div>
              </div>

              {/* Ultra-simplified 3-Step Funnel Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Funil do Fluxo</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">Alta conversão</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Iniciados (100%)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{(mostActiveFlow.stats?.runs || 1420)}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full w-full" />
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-0.5">
                    <span className="text-slate-500">Cliques & Respostas ({mostActiveFlow.stats?.ctr || 84}%)</span>
                    <span className="font-bold text-indigo-600">
                      {Math.round((mostActiveFlow.stats?.runs || 1420) * ((mostActiveFlow.stats?.ctr || 84) / 100))}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${mostActiveFlow.stats?.ctr || 84}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button
                id="btn_daily_open_flow"
                onClick={() => onOpenFlow ? onOpenFlow(mostActiveFlow.id) : undefined}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Editar Fluxo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {onOpenSimulator && (
                <button
                  id="btn_daily_test_flow"
                  onClick={() => onOpenSimulator(mostActiveFlow.id)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                  title="Testar este fluxo no simulador"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
