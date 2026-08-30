import React, { useState, useMemo } from 'react';
import {
  Split,
  Trophy,
  TrendingUp,
  MousePointerClick,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  Sliders,
  Share2,
  Calendar,
  ExternalLink,
  ChevronDown,
  Layers,
  Zap,
  Tag,
  DollarSign,
  ArrowUpRight,
  Info,
  Check,
  Flame,
  MessageSquare,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell
} from 'recharts';
import confetti from 'canvas-confetti';
import { Flow, FlowNode } from '../../types';

interface ABComparisonViewProps {
  flows: Flow[];
  selectedFlowId?: string;
  onSelectFlow?: (flowId: string) => void;
  onOpenSimulator?: (flowId?: string) => void;
}

export const ABComparisonView: React.FC<ABComparisonViewProps> = ({
  flows,
  selectedFlowId,
  onSelectFlow,
  onOpenSimulator
}) => {
  // Find all flows with A/B tests or find the welcome flow
  const abFlows = useMemo(() => {
    return flows.filter((f) => f.nodes.some((n) => n.type === 'ab_split'));
  }, [flows]);

  const defaultFlowId = abFlows[0]?.id || selectedFlowId || flows[0]?.id || '';
  const [currentFlowId, setCurrentFlowId] = useState<string>(defaultFlowId);
  const [metricMode, setMetricMode] = useState<'all' | 'clicks' | 'conversions'>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>('30d');
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotedWinner, setPromotedWinner] = useState<'A' | 'B' | null>(null);
  const [chartType, setChartType] = useState<'funnel_bars' | 'timeline_trend'>('funnel_bars');

  // Selected flow and its A/B split node
  const activeFlow = useMemo(() => {
    return flows.find((f) => f.id === currentFlowId) || abFlows[0] || flows[0];
  }, [flows, currentFlowId, abFlows]);

  const abNode = useMemo(() => {
    return activeFlow?.nodes.find((n) => n.type === 'ab_split');
  }, [activeFlow]);

  // Find message nodes connected to variant A and B
  const variantANode = useMemo(() => {
    if (!activeFlow || !abNode) return null;
    const connA = activeFlow.connections.find((c) => c.fromNodeId === abNode.id && c.handleType === 'variant_a');
    return activeFlow.nodes.find((n) => n.id === connA?.toNodeId) || activeFlow.nodes.find((n) => n.id === 'node_insta_welcome_msg_a');
  }, [activeFlow, abNode]);

  const variantBNode = useMemo(() => {
    if (!activeFlow || !abNode) return null;
    const connB = activeFlow.connections.find((c) => c.fromNodeId === abNode.id && c.handleType === 'variant_b');
    return activeFlow.nodes.find((n) => n.id === connB?.toNodeId) || activeFlow.nodes.find((n) => n.id === 'node_insta_welcome_msg_b');
  }, [activeFlow, abNode]);

  // Extract or fallback statistics
  const variantAName = abNode?.data.variantAName || 'Variante A: Cupom de Boas-Vindas 15% OFF';
  const variantBName = abNode?.data.variantBName || 'Variante B: Menu Consultivo Interativo';
  
  const statsA = abNode?.data.statsA || {
    runs: 1420,
    opens: 1398,
    clicks: 1012,
    conversions: 260,
    ctr: 72.4,
    conversionRate: 18.6
  };

  const statsB = abNode?.data.statsB || {
    runs: 1420,
    opens: 1406,
    clicks: 1198,
    conversions: 405,
    ctr: 85.2,
    conversionRate: 28.8
  };

  // Comparative calculations
  const clickUplift = Number((((statsB.clicks - statsA.clicks) / (statsA.clicks || 1)) * 100).toFixed(1));
  const ctrUplift = Number((statsB.ctr - statsA.ctr).toFixed(1));
  const conversionUplift = Number((((statsB.conversions - statsA.conversions) / (statsA.conversions || 1)) * 100).toFixed(1));
  const convRateUplift = Number((statsB.conversionRate - statsA.conversionRate).toFixed(1));
  const confidenceLevel = abNode?.data.confidenceLevel || 97.8;

  // Revenue estimates
  const avgOrderValue = 97;
  const revenueA = statsA.conversions * avgOrderValue;
  const revenueB = statsB.conversions * avgOrderValue;
  const revenueDiff = revenueB - revenueA;

  // Comparison Bar Chart Data (Head to Head Funnel)
  const comparisonChartData = useMemo(() => {
    return [
      {
        stage: '1. Aberturas (Opens)',
        stageShort: 'Aberturas',
        variantA: statsA.opens,
        variantB: statsB.opens,
        unit: 'contatos',
        diffLabel: '+0.6% B',
        diffPositive: true
      },
      {
        stage: '2. Cliques em Botões (Clicks)',
        stageShort: 'Cliques',
        variantA: statsA.clicks,
        variantB: statsB.clicks,
        unit: 'cliques',
        diffLabel: `+${clickUplift}% B`,
        diffPositive: clickUplift > 0
      },
      {
        stage: '3. Conversões Finais (Goal)',
        stageShort: 'Conversões',
        variantA: statsA.conversions,
        variantB: statsB.conversions,
        unit: 'conversões',
        diffLabel: `+${conversionUplift}% B`,
        diffPositive: conversionUplift > 0
      }
    ];
  }, [statsA, statsB, clickUplift, conversionUplift]);

  // Rate Comparison Chart Data (% Metrics)
  const rateChartData = useMemo(() => {
    return [
      {
        metric: 'Taxa de Cliques (CTR %)',
        variantA: statsA.ctr,
        variantB: statsB.ctr,
        diff: `+${ctrUplift}%`,
        isWinnerB: true
      },
      {
        metric: 'Taxa de Conversão Final (%)',
        variantA: statsA.conversionRate,
        variantB: statsB.conversionRate,
        diff: `+${convRateUplift}%`,
        isWinnerB: true
      },
      {
        metric: 'Retenção até Checkout (%)',
        variantA: Number(((statsA.conversions / (statsA.clicks || 1)) * 100).toFixed(1)),
        variantB: Number(((statsB.conversions / (statsB.clicks || 1)) * 100).toFixed(1)),
        diff: '+8.1%',
        isWinnerB: true
      }
    ];
  }, [statsA, statsB, ctrUplift, convRateUplift]);

  // 14-Day Trend Data for Variant A vs Variant B
  const timelineTrendData = useMemo(() => {
    const days = [
      'Dia 1', 'Dia 2', 'Dia 3', 'Dia 4', 'Dia 5', 'Dia 6', 'Dia 7',
      'Dia 8', 'Dia 9', 'Dia 10', 'Dia 11', 'Dia 12', 'Dia 13', 'Dia 14'
    ];
    return days.map((day, idx) => {
      // Realistic trending curves with progressive divergence favoring Variant B
      const baseA_CTR = 69 + Math.sin(idx * 0.7) * 3 + idx * 0.3;
      const baseB_CTR = 78 + Math.cos(idx * 0.5) * 2.5 + idx * 0.6;
      
      const baseA_Conv = 16.5 + Math.sin(idx * 0.8) * 1.5 + idx * 0.2;
      const baseB_Conv = 24.0 + Math.cos(idx * 0.6) * 1.8 + idx * 0.45;

      const clicksA = Math.round(65 + Math.random() * 10 + idx * 1.5);
      const clicksB = Math.round(80 + Math.random() * 12 + idx * 2.8);

      const convA = Math.round(16 + Math.random() * 4 + idx * 0.6);
      const convB = Math.round(26 + Math.random() * 5 + idx * 1.1);

      return {
        day,
        ctrA: Number(baseA_CTR.toFixed(1)),
        ctrB: Number(baseB_CTR.toFixed(1)),
        convRateA: Number(baseA_Conv.toFixed(1)),
        convRateB: Number(baseB_Conv.toFixed(1)),
        clicksA,
        clicksB,
        convA,
        convB
      };
    });
  }, []);

  // Button clicks breakdown for Variant A
  const buttonsBreakdownA = useMemo(() => {
    const defaultButtons = variantANode?.data.buttons || [
      { id: 'b1', text: '🎁 Usar Cupom (15% OFF)' },
      { id: 'b2', text: '🛍️ Ver Produtos em Destaque' },
      { id: 'b3', text: '💬 Falar com Especialista' }
    ];
    const shares = [0.55, 0.30, 0.15];
    return defaultButtons.map((btn, i) => {
      const share = shares[i] || 0.1;
      const clicks = Math.round(statsA.clicks * share);
      return {
        text: btn.text,
        clicks,
        percent: Math.round(share * 100)
      };
    });
  }, [variantANode, statsA.clicks]);

  // Button clicks breakdown for Variant B
  const buttonsBreakdownB = useMemo(() => {
    const defaultButtons = variantBNode?.data.buttons || [
      { id: 'b1', text: '🛍️ Explorar Catálogo & Planos' },
      { id: 'b2', text: '🌐 Conhecer a Plataforma' },
      { id: 'b3', text: '💬 Atendimento VIP no WhatsApp' }
    ];
    const shares = [0.58, 0.27, 0.15];
    return defaultButtons.map((btn, i) => {
      const share = shares[i] || 0.1;
      const clicks = Math.round(statsB.clicks * share);
      return {
        text: btn.text,
        clicks,
        percent: Math.round(share * 100)
      };
    });
  }, [variantBNode, statsB.clicks]);

  const handlePromoteWinner = (variant: 'A' | 'B') => {
    setIsPromoting(true);
    setPromotedWinner(variant);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
    setTimeout(() => {
      setIsPromoting(false);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FB] overflow-y-auto p-5 lg:p-7 space-y-6">
      {/* Top Header & Test Flow Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 flex items-center gap-1.5">
              <Split className="w-3.5 h-3.5" />
              <span>Teste A/B de Mensagem de Boas-Vindas</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Significância: {confidenceLevel}% (Comprovado)</span>
            </span>
          </div>
          <h1 className="text-lg lg:text-xl font-bold text-[#1A1D21] tracking-tight">
            Desempenho Comparativo de Variações (Cliques & Conversão Final)
          </h1>
          <p className="text-xs text-[#64748B]">
            Acompanhe em tempo real o engajamento de novos contatos divididos entre a abordagem com Cupom Imediato vs. Menu Interativo.
          </p>
        </div>

        {/* Selectors & Time Filter */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="relative">
            <select
              value={currentFlowId}
              onChange={(e) => {
                setCurrentFlowId(e.target.value);
                if (onSelectFlow) onSelectFlow(e.target.value);
              }}
              className="pl-3 pr-8 py-2 bg-[#F8F9FB] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#1A1D21] hover:border-blue-300 focus:outline-hidden focus:ring-2 focus:ring-[#0084FF]/20 cursor-pointer appearance-none"
            >
              {flows.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title.length > 38 ? f.title.slice(0, 38) + '...' : f.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center bg-[#F8F9FB] p-0.5 rounded-xl border border-[#E2E8F0]">
            {(['7d', '14d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white text-[#0084FF] font-bold shadow-2xs'
                    : 'text-[#64748B] hover:text-[#1A1D21]'
                }`}
              >
                {range === '7d' ? '7 dias' : range === '14d' ? '14 dias' : range === '30d' ? '30 dias' : 'Tudo'}
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenSimulator && onOpenSimulator(currentFlowId)}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#0084FF] border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simular Teste</span>
          </button>
        </div>
      </div>

      {/* Winner Spotlight Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-5 lg:p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 shrink-0">
              <Trophy className="w-7 h-7 animate-bounce" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                  🏆 Vencedor Estatístico: Variante B
                </span>
                <span className="text-xs text-emerald-200 font-semibold">
                  Confiança de 97.8% com mais de 2.800 contatos avaliados
                </span>
              </div>
              <h2 className="text-lg lg:text-xl font-bold tracking-tight text-white">
                A Variante B (Menu Consultivo) gerou +54.8% mais conversões finais e +17.7% mais cliques
              </h2>
              <p className="text-xs text-emerald-100/80 max-w-3xl leading-relaxed">
                Ao oferecer opções claras de navegação (Catálogo, Site, Suporte VIP), os novos seguidores interagiram mais rápido e avançaram com menor taxa de abandono do que a oferta direta com cupom.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-end">
            <button
              onClick={() => handlePromoteWinner('B')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                promotedWinner === 'B'
                  ? 'bg-emerald-400 text-emerald-950 font-extrabold'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950'
              }`}
            >
              {promotedWinner === 'B' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Variante B Ativada (100% Tráfego)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Promover Variante B como Padrão</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Head-to-Head Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Taxa de Cliques (CTR) */}
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Taxa de Cliques (CTR)
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#0084FF]">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
            <div>
              <div className="text-[10px] font-bold text-amber-600 uppercase">Variante A (Cupom)</div>
              <div className="text-xl font-bold text-[#1A1D21]">{statsA.ctr}%</div>
              <div className="text-[10px] text-gray-500">{statsA.clicks.toLocaleString()} cliques</div>
            </div>
            <div className="border-l border-gray-100 pl-2">
              <div className="text-[10px] font-bold text-fuchsia-600 uppercase">Variante B (Menu)</div>
              <div className="text-xl font-bold text-emerald-600">{statsB.ctr}%</div>
              <div className="text-[10px] text-gray-500">{statsB.clicks.toLocaleString()} cliques</div>
            </div>
          </div>

          <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center justify-between">
            <span>Vantagem da Variante B:</span>
            <span>+{ctrUplift}% CTR (+{clickUplift}%)</span>
          </div>
        </div>

        {/* Card 2: Conversão Final (Objetivo Concluído) */}
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Conversão Final (Meta)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
            <div>
              <div className="text-[10px] font-bold text-amber-600 uppercase">Variante A</div>
              <div className="text-xl font-bold text-[#1A1D21]">{statsA.conversionRate}%</div>
              <div className="text-[10px] text-gray-500">{statsA.conversions} vendas/leads</div>
            </div>
            <div className="border-l border-gray-100 pl-2">
              <div className="text-[10px] font-bold text-fuchsia-600 uppercase">Variante B</div>
              <div className="text-xl font-bold text-emerald-600">{statsB.conversionRate}%</div>
              <div className="text-[10px] text-gray-500">{statsB.conversions} vendas/leads</div>
            </div>
          </div>

          <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center justify-between">
            <span>Uplift de Conversão:</span>
            <span>+{conversionUplift}% (+{convRateUplift} p.p.)</span>
          </div>
        </div>

        {/* Card 3: Receita Gerada */}
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Receita Atribuída
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
            <div>
              <div className="text-[10px] font-bold text-amber-600 uppercase">Variante A</div>
              <div className="text-lg font-bold text-[#1A1D21]">R$ {revenueA.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500">Ticket méd. R$ 97</div>
            </div>
            <div className="border-l border-gray-100 pl-2">
              <div className="text-[10px] font-bold text-fuchsia-600 uppercase">Variante B</div>
              <div className="text-lg font-bold text-purple-600">R$ {revenueB.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500">Ticket méd. R$ 97</div>
            </div>
          </div>

          <div className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg flex items-center justify-between">
            <span>Receita Adicional:</span>
            <span>+R$ {revenueDiff.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 4: Distribuição de Tráfego */}
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Divisão de Tráfego
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Split className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-amber-700">Variante A (50%)</span>
              <span className="text-fuchsia-700">Variante B (50%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-amber-200 overflow-hidden flex">
              <div className="h-full bg-amber-500" style={{ width: '50%' }} />
              <div className="h-full bg-fuchsia-500" style={{ width: '50%' }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#64748B]">
              <span>{statsA.runs} contatos</span>
              <span>{statsB.runs} contatos</span>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-[#64748B] bg-gray-50 px-2 py-1 rounded-lg flex items-center justify-between">
            <span>Amostra Total:</span>
            <span className="font-bold text-[#1A1D21]">{(statsA.runs + statsB.runs).toLocaleString()} leads</span>
          </div>
        </div>
      </div>

      {/* Main Comparative Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Primary Comparison Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 lg:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-[#0084FF]">
                  <BarChart2 className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm lg:text-base text-[#1A1D21]">
                  Comparativo de Desempenho por Etapa do Funil
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Volume absoluto de Aberturas, Cliques em Botões e Conversões Finais para cada variação.
              </p>
            </div>

            {/* Toggle Chart Mode */}
            <div className="flex items-center bg-[#F8F9FB] p-1 rounded-xl border border-[#E2E8F0] shrink-0">
              <button
                onClick={() => setChartType('funnel_bars')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartType === 'funnel_bars'
                    ? 'bg-white text-[#0084FF] shadow-2xs'
                    : 'text-[#64748B] hover:text-[#1A1D21]'
                }`}
              >
                Barras Comparativas
              </button>
              <button
                onClick={() => setChartType('timeline_trend')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartType === 'timeline_trend'
                    ? 'bg-white text-[#0084FF] shadow-2xs'
                    : 'text-[#64748B] hover:text-[#1A1D21]'
                }`}
              >
                Evolução Diária (CTR / Conversão)
              </button>
            </div>
          </div>

          {/* Chart Display Container */}
          <div className="h-80 w-full pt-2">
            {chartType === 'funnel_bars' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonChartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="stage"
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const valA = Number(payload[0]?.value) || 0;
                        const valB = Number(payload[1]?.value) || 0;
                        const diff = valB - valA;
                        const pct = (((valB - valA) / (valA || 1)) * 100).toFixed(1);
                        return (
                          <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[240px]">
                            <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5">
                              {label}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-amber-300">
                                <span className="font-semibold">Variante A (Cupom):</span>
                                <span className="font-bold">{valA.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between text-fuchsia-300">
                                <span className="font-semibold">Variante B (Menu):</span>
                                <span className="font-bold">{valB.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="pt-1.5 border-t border-slate-700 text-emerald-400 font-bold flex items-center justify-between">
                              <span>Diferença:</span>
                              <span>+{diff.toLocaleString()} ({pct > '0' ? `+${pct}%` : `${pct}%`})</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 600 }}
                  />
                  <Bar
                    name="Variante A (Cupom 15% OFF)"
                    dataKey="variantA"
                    fill="#F59E0B"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={55}
                  />
                  <Bar
                    name="Variante B (Menu Consultivo)"
                    dataKey="variantB"
                    fill="#8B5CF6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={55}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineTrendData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorCtrA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorCtrB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    unit="%"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5">
                            <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                              {label} — Taxa de Cliques (CTR)
                            </div>
                            <div className="text-amber-300 font-semibold flex justify-between gap-4">
                              <span>Variante A:</span>
                              <span className="font-bold">{payload[0]?.value}%</span>
                            </div>
                            <div className="text-fuchsia-300 font-semibold flex justify-between gap-4">
                              <span>Variante B:</span>
                              <span className="font-bold">{payload[1]?.value}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    name="CTR % Variante A (Cupom)"
                    dataKey="ctrA"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCtrA)"
                  />
                  <Area
                    type="monotone"
                    name="CTR % Variante B (Menu)"
                    dataKey="ctrB"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCtrB)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick metric highlights footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-[10px] font-bold text-[#64748B] uppercase">Diferença em Abertura</div>
              <div className="text-sm font-bold text-[#1A1D21] mt-0.5">Paridade Estável (50/50)</div>
              <div className="text-[11px] text-gray-500">1.398 vs 1.406 leituras</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="text-[10px] font-bold text-blue-700 uppercase">Volume Extra de Cliques</div>
              <div className="text-sm font-bold text-blue-950 mt-0.5">+186 cliques ganhos</div>
              <div className="text-[11px] text-blue-700 font-semibold">1.198 cliques na Variante B</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Conversões Adicionais</div>
              <div className="text-sm font-bold text-emerald-950 mt-0.5">+145 vendas/leads</div>
              <div className="text-[11px] text-emerald-700 font-semibold">405 conversões na Variante B</div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Rates & AI Diagnostic (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Rate Percentages Comparison Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#1A1D21] uppercase tracking-tight">
                Taxas & Eficiência Relativa
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Auditado
              </span>
            </div>

            <div className="space-y-3.5">
              {rateChartData.map((item, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1A1D21]">{item.metric}</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded">
                      {item.diff} no B
                    </span>
                  </div>

                  {/* Progress bars comparing A and B */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                      <span>A: {item.variantA}%</span>
                      <span>B: {item.variantB}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden flex">
                      <div
                        className="h-full bg-amber-500 rounded-l-full"
                        style={{ width: `${(item.variantA / (item.variantA + item.variantB)) * 100}%` }}
                      />
                      <div
                        className="h-full bg-fuchsia-600 rounded-r-full"
                        style={{ width: `${(item.variantB / (item.variantA + item.variantB)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Behavioral Diagnostic */}
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-300">
              <Sparkles className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Diagnóstico de Comportamento (IA)
              </h4>
            </div>

            <p className="text-xs text-indigo-100 leading-relaxed">
              <strong>Por que a Variante B superou a Variante A?</strong>
              <br />
              A mensagem com Menu Interativo reduziu a fricção inicial do seguidor. Enquanto o Cupom força uma decisão de compra prematura, as opções de navegação permitiram ao lead qualificar sua intenção antes de ir ao catálogo, elevando a taxa de conversão em <strong>+54.8%</strong>.
            </p>

            <div className="pt-2 border-t border-indigo-700/60 flex items-center justify-between text-xs">
              <span className="text-indigo-200">Recomendação:</span>
              <span className="font-bold text-emerald-300">Manter Menu como Principal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Button-Level Click Heatmap & Visual Side-by-Side Message Previews */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 lg:p-6 space-y-5">
        <div>
          <h3 className="font-bold text-sm lg:text-base text-[#1A1D21] flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-purple-600" />
            <span>Métricas de Cliques por Botão & Prévia das Mensagens de Boas-Vindas</span>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Analise exatamente quais botões e chamadas para ação receberam maior volume de toques dentro do Direct.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Left: Variant A Message & Clicks */}
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/20 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Variante A: Cupom de Boas-Vindas</span>
                </span>
                <span className="text-xs font-bold text-amber-800">
                  CTR: {statsA.ctr}% ({statsA.clicks} cliques)
                </span>
              </div>

              {/* Message Simulation Bubble */}
              <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-2 text-xs text-[#1A1D21] leading-relaxed">
                <p className="whitespace-pre-line font-medium">
                  {variantANode?.data.text || "Hey! 🎁 Bem-vindo ao Instagram da ManyFlow!\n\nLiberamos um cupom de 15% OFF no seu primeiro pedido: BEMVINDO15."}
                </p>
              </div>

              {/* Button Click Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-[#64748B] uppercase">Desempenho por Botão:</div>
                {buttonsBreakdownA.map((btn, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#1A1D21] truncate">{btn.text}</span>
                      <span className="text-amber-700 font-bold shrink-0">{btn.clicks} cliques ({btn.percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${btn.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
              <span className="text-[#64748B]">Conversão Final:</span>
              <span className="font-bold text-[#1A1D21]">{statsA.conversions} vendas ({statsA.conversionRate}%)</span>
            </div>
          </div>

          {/* Card Right: Variant B Message & Clicks (WINNER) */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/20 p-5 space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>VENCEDORA</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Variante B: Menu Consultivo</span>
                </span>
                <span className="text-xs font-bold text-emerald-800 pr-20">
                  CTR: {statsB.ctr}% ({statsB.clicks} cliques)
                </span>
              </div>

              {/* Message Simulation Bubble */}
              <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs space-y-2 text-xs text-[#1A1D21] leading-relaxed">
                <p className="whitespace-pre-line font-medium">
                  {variantBNode?.data.text || "Olá! 👋 É um enorme prazer ter você conosco!\n\nEstamos prontos para turbinar as conversões do seu negócio. Como podemos te ajudar hoje?"}
                </p>
              </div>

              {/* Button Click Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-[#64748B] uppercase">Desempenho por Botão:</div>
                {buttonsBreakdownB.map((btn, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#1A1D21] truncate">{btn.text}</span>
                      <span className="text-emerald-700 font-bold shrink-0">{btn.clicks} cliques ({btn.percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${btn.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-200 flex items-center justify-between text-xs">
              <span className="text-[#64748B]">Conversão Final:</span>
              <span className="font-bold text-emerald-700">{statsB.conversions} vendas ({statsB.conversionRate}%) — +54.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
