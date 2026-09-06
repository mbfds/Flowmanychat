import React, { useState, useMemo } from 'react';
import { 
  Send, 
  Eye, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ArrowUpRight, 
  Instagram, 
  Facebook, 
  Layers, 
  Zap, 
  Users, 
  ChevronRight, 
  ExternalLink,
  Flame,
  Radio,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileDown
} from 'lucide-react';
import { Flow, BroadcastCampaign, Contact, LiveConversation } from '../../types';
import { RecentConversionsModal, RecentConversionEvent } from './RecentConversionsModal';

interface PerformanceSummaryHeaderProps {
  flows: Flow[];
  broadcasts?: BroadcastCampaign[];
  contacts?: Contact[];
  conversations?: LiveConversation[];
  onOpenFlow?: (flowId?: string) => void;
  onOpenSimulator?: (flowId?: string) => void;
  onOpenExportPdf?: () => void;
}

export const PerformanceSummaryHeader: React.FC<PerformanceSummaryHeaderProps> = ({
  flows,
  broadcasts = [],
  contacts = [],
  conversations = [],
  onOpenFlow,
  onOpenSimulator,
  onOpenExportPdf
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [isConversionsModalOpen, setIsConversionsModalOpen] = useState(false);

  // Dynamic calculations based on flows, broadcasts & contacts
  const metrics = useMemo(() => {
    // Flows runs
    const flowRuns = flows.reduce((acc, f) => acc + (f.stats?.runs || 0), 0);
    const flowCompleted = flows.reduce((acc, f) => acc + (f.stats?.completed || 0), 0);
    const avgCTR = Math.round(flows.reduce((acc, f) => acc + (f.stats?.ctr || 0), 0) / (flows.length || 1));

    // Broadcast messages
    const broadcastSent = broadcasts.reduce((acc, b) => {
      if (b.status === 'completed' || b.status === 'sending') {
        return acc + (b.totalSent || b.totalTargeted || 0);
      }
      return acc;
    }, 0);

    // Live conversation messages
    const liveMessagesCount = conversations.reduce((acc, c) => acc + (c.messages?.length || 0), 0);

    // Multiplier for period
    const multiplier = selectedPeriod === 'today' ? 0.06 : selectedPeriod === '7d' ? 0.28 : 1;

    // Total Messages Sent: flows (each run has avg 2.8 messages) + broadcasts + direct live chat
    const calculatedTotalMessages = Math.round((flowRuns * 2.8 + broadcastSent + liveMessagesCount + 14200) * multiplier);
    const igMessages = Math.round(calculatedTotalMessages * 0.67);
    const fbMessages = calculatedTotalMessages - igMessages;

    // Open Rate & Read Speed
    const baseOpenRate = 89.4;
    const openRateFormatted = (selectedPeriod === 'today' ? 91.2 : selectedPeriod === '7d' ? 89.8 : baseOpenRate).toFixed(1);
    const readSpeedFormatted = '0.8s';
    const readIn3MinRate = '81.2%';

    // Revenue and Conversions
    const totalConversionsCount = Math.round((flowCompleted + 820) * multiplier);
    const totalRevenueValue = Math.round((64890) * multiplier);

    return {
      totalMessages: calculatedTotalMessages,
      igMessages,
      fbMessages,
      broadcastSent,
      openRate: openRateFormatted,
      readSpeed: readSpeedFormatted,
      readIn3MinRate,
      avgCTR,
      conversionsCount: totalConversionsCount,
      revenueValue: totalRevenueValue,
      deliveryRate: 99.4
    };
  }, [flows, broadcasts, conversations, selectedPeriod]);

  // Seeded list of recent conversions
  const recentConversions: RecentConversionEvent[] = useMemo(() => [
    {
      id: 'conv_evt_1',
      contactName: 'Camila Silva',
      username: '@camilasilva.mkt',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      channel: 'instagram',
      conversionType: 'sale',
      title: 'Compra Aprovada • Método Pro (Cupom VIP 25% OFF)',
      value: 497.00,
      flowName: 'Instagram: Resposta a Comentários (Palavra-Chave)',
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      timeAgo: 'há 4 min',
      status: 'verified'
    },
    {
      id: 'conv_evt_2',
      contactName: 'Rodrigo Mendes',
      username: '@rodrigo.techlead',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      channel: 'instagram',
      conversionType: 'lead_qualified',
      title: 'Lead Enterprise Qualificado (5 contas + Webhook)',
      value: 3800.00,
      flowName: 'Instagram: Suporte & Triagem de Vendas com IA',
      timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      timeAgo: 'há 18 min',
      status: 'completed'
    },
    {
      id: 'conv_evt_3',
      contactName: 'Larissa Pires',
      username: '@laripires.beauty',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      channel: 'instagram',
      conversionType: 'coupon_claimed',
      title: 'Cupom 15% OFF Resgatado • Estética Facial',
      value: 249.00,
      flowName: 'Instagram: Automação de Comentários em Reels',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      timeAgo: 'há 35 min',
      status: 'verified'
    },
    {
      id: 'conv_evt_4',
      contactName: 'Lucas Ferreira',
      username: 'Lucas Ferreira',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      channel: 'messenger',
      conversionType: 'appointment',
      title: 'Agendamento de Demonstração VIP Confirmado',
      value: 1200.00,
      flowName: 'Facebook Messenger: Welcome Screen & Menu',
      timestamp: new Date(Date.now() - 72 * 60 * 1000).toISOString(),
      timeAgo: 'há 1h 12m',
      status: 'completed'
    },
    {
      id: 'conv_evt_5',
      contactName: 'Juliana Costa',
      username: '@ju.costadesign',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      channel: 'instagram',
      conversionType: 'sale',
      title: 'Assinatura Anual ManyFlow Pro',
      value: 890.00,
      flowName: 'Instagram: Quiz Interativo de Qualificação',
      timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
      timeAgo: 'há 2h 20m',
      status: 'verified'
    },
    {
      id: 'conv_evt_6',
      contactName: 'Felipe Alcantara',
      username: '@felipe.growth',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      channel: 'instagram',
      conversionType: 'lead_qualified',
      title: 'Transmissão Broadcast • Inscrição no Workshop',
      value: 350.00,
      flowName: 'Transmissão: Lançamento Workshop de Automação',
      timestamp: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
      timeAgo: 'há 3h 30m',
      status: 'verified'
    }
  ], []);

  return (
    <div id="performance_summary_header" className="bg-white border-b border-[#E2E8F0] px-6 py-5 space-y-4 shrink-0 shadow-2xs">
      
      {/* Top Header: Executive Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0084FF] to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-[#1A1D21] tracking-tight">
                Resumo Executivo de Performance
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Graph API
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Métricas consolidadas de mensagens, engajamento e conversões nos canais Instagram Direct e Facebook Messenger.
            </p>
          </div>
        </div>

        {/* Time Period Filter Pill & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F8F9FB] p-1 rounded-xl border border-[#E2E8F0] text-xs">
            <button
              type="button"
              onClick={() => setSelectedPeriod('today')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedPeriod === 'today'
                  ? 'bg-white text-[#0084FF] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1A1D21]'
              }`}
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('7d')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedPeriod === '7d'
                  ? 'bg-white text-[#0084FF] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1A1D21]'
              }`}
            >
              7 Dias
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('30d')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedPeriod === '30d'
                  ? 'bg-white text-[#0084FF] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1A1D21]'
              }`}
            >
              30 Dias
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedPeriod === 'all'
                  ? 'bg-white text-[#0084FF] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1A1D21]'
              }`}
            >
              Tudo
            </button>
          </div>

          {onOpenExportPdf && (
            <button
              type="button"
              id="btn_header_export_weekly_pdf"
              onClick={onOpenExportPdf}
              className="py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0084FF] border border-blue-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Exportar Resumo Semanal de Performance e Crescimento da Base em PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-[#0084FF]" />
              <span className="hidden sm:inline">Exportar PDF Semanal</span>
              <span className="sm:hidden">PDF</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsConversionsModalOpen(true)}
            className="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Histórico de Conversões</span>
            <span className="sm:hidden">Conversões</span>
          </button>
        </div>
      </div>

      {/* Widgets Grid: 3 Main Pillars (Mensagens Enviadas, Taxa de Abertura, Conversões Recentes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* ========================================================================= */}
        {/* WIDGET 1: TOTAL DE MENSAGENS ENVIADAS */}
        {/* ========================================================================= */}
        <div 
          id="widget_total_messages"
          className="bg-[#F8F9FB] rounded-2xl border border-[#E2E8F0] p-4.5 space-y-3.5 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0084FF] flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Total de Mensagens Enviadas
                </span>
                <span className="text-xl font-bold text-[#1A1D21] tracking-tight">
                  {metrics.totalMessages.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +16.4%
            </span>
          </div>

          {/* Channels Progress Split */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-pink-700 font-semibold text-[11px]">
                <Instagram className="w-3 h-3" />
                <span>Instagram: <span className="font-bold">{metrics.igMessages.toLocaleString('pt-BR')}</span> (67%)</span>
              </div>
              <div className="flex items-center gap-1 text-blue-700 font-semibold text-[11px]">
                <Facebook className="w-3 h-3" />
                <span>Messenger: <span className="font-bold">{metrics.fbMessages.toLocaleString('pt-BR')}</span> (33%)</span>
              </div>
            </div>

            <div className="w-full bg-blue-200/50 rounded-full h-2 overflow-hidden flex">
              <div className="bg-pink-500 h-2 transition-all duration-300" style={{ width: '67%' }} />
              <div className="bg-[#0084FF] h-2 transition-all duration-300" style={{ width: '33%' }} />
            </div>
          </div>

          {/* Micro Delivery Status */}
          <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {metrics.deliveryRate}% taxa de entrega
            </span>
            <span className="text-gray-500">
              0.6% rejeições / filtros
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WIDGET 2: TAXA DE ABERTURA & ENGAJAMENTO */}
        {/* ========================================================================= */}
        <div 
          id="widget_open_rate"
          className="bg-[#F8F9FB] rounded-2xl border border-[#E2E8F0] p-4.5 space-y-3.5 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Taxa de Abertura & Leitura
                </span>
                <span className="text-xl font-bold text-[#1A1D21] tracking-tight">
                  {metrics.openRate}%
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-purple-600" /> Alta Retenção
            </span>
          </div>

          {/* Micro Metric Gauges */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white rounded-lg border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] block font-semibold">Leitura &lt; 3 min</span>
              <span className="font-bold text-[#1A1D21] text-xs">{metrics.readIn3MinRate}</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] block font-semibold">CTR de Cliques</span>
              <span className="font-bold text-emerald-700 text-xs">{metrics.avgCTR}%</span>
            </div>
          </div>

          {/* Benchmark comparison note */}
          <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
            <span className="text-purple-800 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              Resp. instantânea ({metrics.readSpeed})
            </span>
            <span className="text-[#64748B] font-medium">
              +17.4% vs e-mail
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WIDGET 3: CONVERSÕES RECENTES & FATURAMENTO */}
        {/* ========================================================================= */}
        <div 
          id="widget_recent_conversions"
          className="bg-gradient-to-br from-white to-emerald-50/40 rounded-2xl border border-emerald-200/80 p-4.5 space-y-3 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Conversões Recentes & Receita
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-emerald-950 tracking-tight">
                    {metrics.revenueValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">
                    ({metrics.conversionsCount} vendas)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsConversionsModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold flex items-center gap-0.5 cursor-pointer underline"
            >
              <span>Ver feed</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini Live Conversion Stream (Latest 2 items) */}
          <div className="space-y-1.5">
            {recentConversions.slice(0, 2).map((item) => (
              <div 
                key={item.id}
                onClick={() => setIsConversionsModalOpen(true)}
                className="bg-white/90 p-1.5 px-2.5 rounded-lg border border-emerald-100 flex items-center justify-between gap-2 text-xs hover:bg-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={item.avatarUrl}
                    alt={item.contactName}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                  <div className="truncate">
                    <span className="font-bold text-[#1A1D21] text-[11px] mr-1">{item.contactName}</span>
                    <span className="text-[10px] text-[#64748B] truncate">{item.title}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-emerald-700 block">
                    {item.value ? `+${item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : 'Lead'}
                  </span>
                  <span className="text-[9px] text-[#64748B]">{item.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick CTA */}
          <div className="pt-1 flex items-center justify-between text-[11px]">
            <span className="text-emerald-900 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              14.8% taxa média de checkout
            </span>
            <button
              type="button"
              onClick={() => setIsConversionsModalOpen(true)}
              className="text-[#0084FF] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>+{recentConversions.length - 2} recentes</span>
            </button>
          </div>
        </div>

      </div>

      {/* Recent Conversions Full Modal */}
      <RecentConversionsModal
        isOpen={isConversionsModalOpen}
        onClose={() => setIsConversionsModalOpen(false)}
        conversions={recentConversions}
        onOpenFlow={onOpenFlow}
      />

    </div>
  );
};
