import React, { useState, Suspense, lazy } from 'react';
import { 
  TrendingUp, 
  Users, 
  Send, 
  CheckCircle2, 
  Bot, 
  DollarSign, 
  Zap, 
  Instagram, 
  Facebook, 
  ArrowUpRight,
  Clock,
  ExternalLink,
  BarChart2,
  Filter,
  Layers,
  AlertTriangle,
  Sparkles,
  Play,
  ArrowRight,
  TrendingDown,
  Split,
  Tag,
  Trophy
} from 'lucide-react';
import { Flow, BroadcastCampaign, Contact, LiveConversation } from '../../types';
import { ComponentLoader } from '../Common/ComponentLoader';
import { PerformanceSummaryHeader } from './PerformanceSummaryHeader';

const FlowFunnelView = lazy(() =>
  import('./FlowFunnelView').then((m) => ({ default: m.FlowFunnelView }))
);
const ABComparisonView = lazy(() =>
  import('./ABComparisonView').then((m) => ({ default: m.ABComparisonView }))
);

interface AnalyticsDashboardProps {
  flows: Flow[];
  broadcasts?: BroadcastCampaign[];
  contacts?: Contact[];
  conversations?: LiveConversation[];
  selectedFlowId?: string;
  onSelectFlow?: (flowId: string) => void;
  onOpenSimulator?: (flowId?: string) => void;
  onUpdateFlow?: (updatedFlow: Flow) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  flows,
  broadcasts = [],
  contacts = [],
  conversations = [],
  selectedFlowId,
  onSelectFlow,
  onOpenSimulator,
  onUpdateFlow
}) => {
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'funnel' | 'overview' | 'ab_testing' | 'bottlenecks'>('funnel');
  const [targetFlowForFunnel, setTargetFlowForFunnel] = useState<string>(
    selectedFlowId || flows[0]?.id || ''
  );

  const totalRuns = flows.reduce((acc, f) => acc + f.stats.runs, 0);
  const totalCompleted = flows.reduce((acc, f) => acc + f.stats.completed, 0);
  const avgCTR = Math.round(flows.reduce((acc, f) => acc + f.stats.ctr, 0) / (flows.length || 1));
  const avgRetention = Math.round((totalCompleted / (totalRuns || 1)) * 100);

  const statsCards = [
    {
      title: 'RECEITA TOTAL GERADA',
      value: 'R$ 64.890,00',
      change: '↑ 18.5% este mês',
      changeColor: 'text-emerald-600',
      changeSub: 'Vendas via automação Direct'
    },
    {
      title: 'LEADS NO FUNIL (RUNS)',
      value: totalRuns.toLocaleString(),
      change: `↑ ${avgRetention}% retenção global`,
      changeColor: 'text-[#0084FF]',
      changeSub: 'Total de conversas ativadas'
    },
    {
      title: 'CTR MÉDIO (CLIQUES)',
      value: `${avgCTR}%`,
      change: 'Taxa acima da média de mercado',
      changeColor: 'text-emerald-600',
      changeSub: 'Engajamento em botões e links'
    },
    {
      title: 'TEMPO MÉDIO DE RESPOSTA',
      value: '0.8s',
      change: 'Instantâneo via Bot IA',
      changeColor: 'text-emerald-600',
      changeSub: 'Primeira interação automatizada'
    }
  ];

  // Calculate bottlenecks across all flows
  const allFlowsBottlenecks = flows.map((f) => {
    const trigger = f.nodes.find((n) => n.type === 'trigger');
    const runs = f.stats.runs || 1000;
    const completed = f.stats.completed || 800;
    const dropOffs = runs - completed;
    const dropRate = Number(((dropOffs / runs) * 100).toFixed(1));

    // Find likely bottleneck node in this flow (usually middle message or selection)
    const middleNode = f.nodes.find((n) => n.type === 'message' && n.id !== f.nodes[0]?.id) || f.nodes[1] || f.nodes[0];

    return {
      flowId: f.id,
      flowTitle: f.title,
      channel: f.channel,
      runs,
      completed,
      dropOffs,
      dropRate,
      criticalNode: middleNode?.title || 'Etapa de Opções',
      criticalNodeType: middleNode?.type || 'message',
      urgency: dropRate > 25 ? 'alta' : dropRate > 15 ? 'media' : 'baixa'
    };
  }).sort((a, b) => b.dropRate - a.dropRate);

  const handleInspectFunnel = (flowId: string) => {
    setTargetFlowForFunnel(flowId);
    if (onSelectFlow) onSelectFlow(flowId);
    setActiveAnalyticsTab('funnel');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FB] overflow-y-auto select-none">
      {/* Top Performance Summary Widgets Bar */}
      <PerformanceSummaryHeader
        flows={flows}
        broadcasts={broadcasts}
        contacts={contacts}
        conversations={conversations}
        onOpenFlow={handleInspectFunnel}
        onOpenSimulator={onOpenSimulator}
      />

      {/* Secondary Navigation Subheader */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-[#F8F9FB] p-1 rounded-xl border border-[#E2E8F0] overflow-x-auto">
          <button
            onClick={() => setActiveAnalyticsTab('funnel')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAnalyticsTab === 'funnel'
                ? 'bg-white text-[#0084FF] shadow-xs border border-blue-100'
                : 'text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Visualização de Funil (Nó a Nó)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
              Novo
            </span>
          </button>

          <button
            onClick={() => setActiveAnalyticsTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAnalyticsTab === 'overview'
                ? 'bg-white text-[#0084FF] shadow-xs border border-blue-100'
                : 'text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Visão Geral & Fluxos Ativos</span>
          </button>

          <button
            onClick={() => setActiveAnalyticsTab('ab_testing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAnalyticsTab === 'ab_testing'
                ? 'bg-white text-fuchsia-700 shadow-xs border border-fuchsia-200'
                : 'text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <Split className="w-3.5 h-3.5 text-fuchsia-600" />
            <span>Testes A/B (Boas-Vindas)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-fuchsia-100 text-fuchsia-800 font-bold">
              🏆 Variações
            </span>
          </button>

          <button
            onClick={() => setActiveAnalyticsTab('bottlenecks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAnalyticsTab === 'bottlenecks'
                ? 'bg-white text-[#0084FF] shadow-xs border border-blue-100'
                : 'text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Diagnóstico de Gargalos (IA)</span>
          </button>
        </div>

        {/* Global Quick Action */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <span>Métricas sincronizadas com Graph API</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 flex overflow-hidden">
        <Suspense fallback={<ComponentLoader variant="analytics" label="Carregando visualização analítica..." />}>
        {/* TAB 1: FUNNEL VISUALIZATION (Nó a Nó) */}
        {activeAnalyticsTab === 'funnel' && (
          <FlowFunnelView
            flows={flows}
            selectedFlowId={targetFlowForFunnel}
            onSelectFlow={(id) => {
              setTargetFlowForFunnel(id);
              if (onSelectFlow) onSelectFlow(id);
            }}
            onOpenSimulator={onOpenSimulator}
            onOpenABComparison={(flowId) => {
              if (flowId) setTargetFlowForFunnel(flowId);
              setActiveAnalyticsTab('ab_testing');
            }}
          />
        )}

        {/* TAB 2: OVERVIEW KPI CARDS & FLOWS TABLE */}
        {activeAnalyticsTab === 'overview' && (
          <div className="flex-1 flex flex-col h-full bg-[#F8F9FB] p-6 lg:p-8 overflow-y-auto space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider">
                    {card.title}
                  </div>
                  <div className="text-2xl font-bold mt-1 text-[#1A1D21] tracking-tight">
                    {card.value}
                  </div>
                  <div className={`text-[11px] ${card.changeColor} font-bold mt-1 flex items-center gap-1`}>
                    <span>{card.change}</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">{card.changeSub}</div>
                </div>
              ))}
            </div>

            {/* Main Grid: Active Automations Table + Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Active Automations Table with Funnel Shortcut */}
              <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col overflow-hidden">
                <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
                  <div>
                    <h2 className="font-bold text-sm uppercase tracking-tight text-[#1A1D21]">
                      Fluxos & Desempenho de Conversão
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Clique em qualquer fluxo para abrir sua Visualização de Funil detalhada nó a nó.
                    </p>
                  </div>
                  <span className="text-xs text-[#0084FF] font-semibold">
                    {flows.length} fluxos configurados
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F8F9FB] sticky top-0 border-b border-[#E2E8F0]">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold text-[#64748B] text-xs uppercase tracking-wider">
                          Fluxo
                        </th>
                        <th className="px-4 py-2.5 font-semibold text-[#64748B] text-xs uppercase tracking-wider">
                          Canal
                        </th>
                        <th className="px-4 py-2.5 font-semibold text-[#64748B] text-xs uppercase tracking-wider">
                          Entradas
                        </th>
                        <th className="px-4 py-2.5 font-semibold text-[#64748B] text-xs uppercase tracking-wider">
                          Retenção
                        </th>
                        <th className="px-4 py-2.5 font-semibold text-[#64748B] text-xs uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-2.5 font-semibold text-[#64748B] text-xs uppercase tracking-wider text-right">
                          Ação
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[#1A1D21]">
                      {flows.map((f) => {
                        const ret = Math.round(((f.stats.completed || 1) / (f.stats.runs || 1)) * 100);
                        return (
                          <tr key={f.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3 font-medium text-xs text-[#1A1D21]">
                              <div className="font-semibold">{f.title}</div>
                              <div className="text-[11px] text-[#64748B] truncate max-w-[240px]">{f.description}</div>
                            </td>
                            <td className="px-4 py-3">
                              {f.channel === 'instagram' ? (
                                <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                  IG
                                </span>
                              ) : f.channel === 'messenger' ? (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                  FB
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                  BOTH
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-[#1A1D21]">
                              {f.stats.runs.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${ret >= 80 ? 'text-emerald-600' : ret >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                                  {ret}%
                                </span>
                                <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                  <div className="h-full bg-[#0084FF] rounded-full" style={{ width: `${ret}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="flex items-center text-xs font-medium text-[#1A1D21]">
                                <span className={`w-2 h-2 inline-block ${f.isActive ? 'bg-green-500' : 'bg-amber-500'} rounded-full mr-2`}></span>
                                {f.isActive ? 'Ativo' : 'Pausado'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleInspectFunnel(f.id)}
                                className="px-2.5 py-1 text-xs font-bold text-[#0084FF] hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              >
                                <BarChart2 className="w-3 h-3" />
                                <span>Ver Funil</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Macro Funnel Highlight */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm uppercase tracking-tight text-[#1A1D21]">
                    Funil Global de Aquisição
                  </h3>
                  <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Live Direct
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {/* Stage 1 */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                    <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">
                      1. Descoberta & Gatilhos
                    </div>
                    <div className="text-lg font-bold text-[#1A1D21]">24.8k leads</div>
                    <div className="text-[10px] text-gray-500 italic">Interações em Posts, Reels e Stories</div>
                  </div>

                  <div className="flex justify-center py-0.5">
                    <span className="text-xs text-gray-400 font-bold">↓ 68% iniciaram mensagem</span>
                  </div>

                  {/* Stage 2 */}
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r-lg">
                    <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1">
                      2. Conversação no Direct
                    </div>
                    <div className="text-lg font-bold text-[#1A1D21]">{totalRuns.toLocaleString()} DMs</div>
                    <div className="text-[10px] text-gray-500 italic">Interações ativas pelo chatbot</div>
                  </div>

                  <div className="flex justify-center py-0.5">
                    <span className="text-xs text-gray-400 font-bold">↓ {avgCTR}% clicaram em botões</span>
                  </div>

                  {/* Stage 3 */}
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-lg">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">
                      3. Conversão & Checkout
                    </div>
                    <div className="text-lg font-bold text-[#1A1D21]">{totalCompleted.toLocaleString()} conversões</div>
                    <div className="text-[10px] text-gray-500 italic">Leads qualificados ou compras concluídas</div>
                  </div>
                </div>

                {/* Funnel Deep Dive CTA Button */}
                <button
                  onClick={() => setActiveAnalyticsTab('funnel')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0084FF] to-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:shadow-md transition-all cursor-pointer"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Explorar Funil Nó a Nó Completo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: A/B TESTING VARIATION COMPARISON (WELCOME MESSAGES & CONVERSION) */}
        {activeAnalyticsTab === 'ab_testing' && (
          <ABComparisonView
            flows={flows}
            selectedFlowId={targetFlowForFunnel}
            onSelectFlow={(id) => {
              setTargetFlowForFunnel(id);
              if (onSelectFlow) onSelectFlow(id);
            }}
            onOpenSimulator={onOpenSimulator}
            onUpdateFlow={onUpdateFlow}
          />
        )}

        {/* TAB 4: BOTTLENECKS & AI OPTIMIZATION DIAGNOSTICS */}
        {activeAnalyticsTab === 'bottlenecks' && (
          <div className="flex-1 flex flex-col h-full bg-[#F8F9FB] p-6 lg:p-8 overflow-y-auto space-y-6">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="flex items-start gap-4 z-10 relative max-w-3xl">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      Inteligência de Retenção
                    </span>
                    <span className="text-xs text-blue-200">Varredura em tempo real em {flows.length} fluxos</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">
                    Diagnóstico Automático de Gargalos e Pontos de Abandono
                  </h2>
                  <p className="text-xs text-blue-100/80 leading-relaxed">
                    Nossa IA analisa o comportamento dos seus contatos em cada nó de mensagem e identifica exatamente onde há desistência anormal, sugerindo melhorias na cópia, botões e delays.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottlenecks Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1D21] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Fluxos Classificados por Taxa de Desistência</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allFlowsBottlenecks.map((item, idx) => (
                  <div
                    key={item.flowId}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.urgency === 'alta' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.urgency === 'alta' ? '🚨 Gargalo Crítico' : '⚠️ Atenção'}
                          </span>
                          <span className="text-xs text-[#64748B]">
                            Canal: {item.channel.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#1A1D21]">
                          {item.flowTitle}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] uppercase font-bold text-[#64748B]">Abandono Total</div>
                        <div className="text-lg font-bold text-rose-600">{item.dropRate}%</div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0] space-y-1">
                      <div className="text-[10px] font-bold text-[#64748B] uppercase">Etapa com Maior Queda:</div>
                      <div className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>{item.criticalNode}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Perda estimada de {item.dropOffs.toLocaleString()} contatos antes da conclusão do objetivo.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold text-emerald-700">
                        Recomendado: Adicionar Teste A/B de Cópia
                      </span>
                      <button
                        onClick={() => handleInspectFunnel(item.flowId)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0084FF] hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Abrir Funil</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </Suspense>
      </div>
    </div>
  );
};
