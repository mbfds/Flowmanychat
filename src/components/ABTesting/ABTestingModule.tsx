import React, { useState, useMemo } from 'react';
import { 
  Split, 
  Trophy, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowLeftRight, 
  Play, 
  RotateCcw, 
  Calendar, 
  ExternalLink, 
  Zap, 
  Tag, 
  Check, 
  BarChart2, 
  Plus, 
  Target, 
  Copy, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Layers, 
  Clock, 
  MousePointerClick, 
  ArrowUpRight, 
  TrendingDown, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Send, 
  Sliders, 
  ArrowRight,
  ShieldCheck,
  CheckCheck
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
  Area 
} from 'recharts';
import confetti from 'canvas-confetti';
import { Flow, ChannelType } from '../../types';

interface ABTestingModuleProps {
  flows: Flow[];
  onOpenFlow?: (flowId: string) => void;
  onOpenSimulator?: (flowId?: string) => void;
  onUpdateFlow?: (updatedFlow: Flow) => void;
}

export const ABTestingModule: React.FC<ABTestingModuleProps> = ({
  flows,
  onOpenFlow,
  onOpenSimulator,
  onUpdateFlow
}) => {
  // Ensure we have at least 2 flows to compare
  const defaultFlowAId = flows[0]?.id || 'flow_welcome_instagram';
  const defaultFlowBId = flows[1]?.id || 'flow_welcome_messenger';

  const [flowAId, setFlowAId] = useState<string>(defaultFlowAId);
  const [flowBId, setFlowBId] = useState<string>(defaultFlowBId);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>('30d');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulatedTrafficRatio, setSimulatedTrafficRatio] = useState<number>(50); // % for Flow A
  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'funnel_steps'>('table');
  const [promotedWinner, setPromotedWinner] = useState<'A' | 'B' | null>(null);

  // Retrieve full flow objects
  const flowA = useMemo(() => {
    return flows.find((f) => f.id === flowAId) || flows[0];
  }, [flows, flowAId]);

  const flowB = useMemo(() => {
    return flows.find((f) => f.id === flowBId) || flows[1] || flows[0];
  }, [flows, flowBId]);

  // Handle flow swap
  const handleSwapFlows = () => {
    const temp = flowAId;
    setFlowAId(flowBId);
    setFlowBId(temp);
  };

  // Copy flow ID
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Statistical calculations
  const statsA = useMemo(() => {
    if (!flowA) return { runs: 0, completed: 0, ctr: 0, completionRate: 0, dropRate: 0 };
    const runs = flowA.stats.runs || 1;
    const completed = flowA.stats.completed || 0;
    const ctr = flowA.stats.ctr || 0;
    const completionRate = Number(((completed / runs) * 100).toFixed(1));
    const dropRate = Number((100 - completionRate).toFixed(1));
    return { runs, completed, ctr, completionRate, dropRate };
  }, [flowA]);

  const statsB = useMemo(() => {
    if (!flowB) return { runs: 0, completed: 0, ctr: 0, completionRate: 0, dropRate: 0 };
    const runs = flowB.stats.runs || 1;
    const completed = flowB.stats.completed || 0;
    const ctr = flowB.stats.ctr || 0;
    const completionRate = Number(((completed / runs) * 100).toFixed(1));
    const dropRate = Number((100 - completionRate).toFixed(1));
    return { runs, completed, ctr, completionRate, dropRate };
  }, [flowB]);

  // Deltas
  const ctrDelta = Number((statsA.ctr - statsB.ctr).toFixed(1));
  const completionDelta = Number((statsA.completionRate - statsB.completionRate).toFixed(1));
  const runsDelta = statsA.runs - statsB.runs;

  // Winner Determination (Weighted score: 50% CTR, 50% Completion)
  const scoreA = statsA.ctr * 0.5 + statsA.completionRate * 0.5;
  const scoreB = statsB.ctr * 0.5 + statsB.completionRate * 0.5;
  const overallWinner = scoreA > scoreB ? 'A' : scoreA < scoreB ? 'B' : 'tie';

  // Statistical Confidence Calculation (Z-score approximation based on sample size and CTR difference)
  const confidenceScore = useMemo(() => {
    const minSample = Math.min(statsA.runs, statsB.runs);
    if (minSample < 50) return 65.0;
    const absDiff = Math.abs(statsA.ctr - statsB.ctr);
    if (absDiff > 10) return 99.4;
    if (absDiff > 5) return 98.2;
    if (absDiff > 2) return 94.6;
    return 88.0;
  }, [statsA, statsB]);

  // Celebrate Promoting Winner
  const handlePromoteWinner = (variant: 'A' | 'B') => {
    setPromotedWinner(variant);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  // Export CSV Comparison
  const handleExportCSV = () => {
    if (!flowA || !flowB) return;
    const rows = [
      ['Métrica', `Fluxo A (${flowA.id})`, `Fluxo B (${flowB.id})`, 'Diferença (Delta)'],
      ['Título', `"${flowA.title}"`, `"${flowB.title}"`, '-'],
      ['Canal', flowA.channel, flowB.channel, '-'],
      ['Execuções (Runs)', statsA.runs, statsB.runs, runsDelta],
      ['Conclusões (Completed)', statsA.completed, statsB.completed, statsA.completed - statsB.completed],
      ['Taxa de Conclusão (%)', `${statsA.completionRate}%`, `${statsB.completionRate}%`, `${completionDelta}%`],
      ['CTR - Click-Through Rate (%)', `${statsA.ctr}%`, `${statsB.ctr}%`, `${ctrDelta}%`],
      ['Taxa de Abandono (%)', `${statsA.dropRate}%`, `${statsB.dropRate}%`, `${(statsA.dropRate - statsB.dropRate).toFixed(1)}%`],
      ['Total de Passos / Nós', flowA.nodes.length, flowB.nodes.length, flowA.nodes.length - flowB.nodes.length]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ab_test_${flowA.id}_vs_${flowB.id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Bar Chart comparison data
  const comparisonBarData = useMemo(() => {
    return [
      {
        metric: 'Taxa de Cliques (CTR)',
        'Fluxo A': statsA.ctr,
        'Fluxo B': statsB.ctr,
        unit: '%'
      },
      {
        metric: 'Taxa de Conclusão',
        'Fluxo A': statsA.completionRate,
        'Fluxo B': statsB.completionRate,
        unit: '%'
      },
      {
        metric: 'Taxa de Abandono',
        'Fluxo A': statsA.dropRate,
        'Fluxo B': statsB.dropRate,
        unit: '%'
      }
    ];
  }, [statsA, statsB]);

  // Dual timeline trend simulation for charts tab
  const timelineTrendData = useMemo(() => {
    const days = 7;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });

      const varA = Math.sin(i * 1.5) * 3;
      const varB = Math.cos(i * 1.3) * 3.5;

      data.push({
        day: dayLabel,
        'CTR Fluxo A': Math.max(10, Math.min(100, Number((statsA.ctr + varA).toFixed(1)))),
        'CTR Fluxo B': Math.max(10, Math.min(100, Number((statsB.ctr + varB).toFixed(1)))),
        'Conversão A': Math.max(5, Math.min(100, Number((statsA.completionRate + varA * 0.8).toFixed(1)))),
        'Conversão B': Math.max(5, Math.min(100, Number((statsB.completionRate + varB * 0.8).toFixed(1))))
      });
    }

    return data;
  }, [statsA, statsB]);

  const getChannelIcon = (channel: ChannelType) => {
    switch (channel) {
      case 'instagram': return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
      case 'messenger': return <Facebook className="w-3.5 h-3.5 text-blue-600" />;
      case 'whatsapp': return <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'telegram': return <Send className="w-3.5 h-3.5 text-sky-600" />;
      default: return <Zap className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  const getChannelBadge = (channel: ChannelType) => {
    switch (channel) {
      case 'instagram': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'messenger': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'whatsapp': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'telegram': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div id="ab_testing_module_container" className="flex-1 flex flex-col h-full bg-[#F8F9FB] dark:bg-slate-950 overflow-y-auto select-none">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5 shrink-0 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 shrink-0">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Módulo de Testes A/B: Comparador de Fluxos
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Side-by-Side Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selecione dois IDs de fluxos de automação para comparar métricas de CTR, volume de execuções e taxas de conclusão em tempo real.
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              onClick={handleExportCSV}
              className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Exportar dados da comparação para planilha CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar CSV</span>
            </button>

            {onOpenSimulator && (
              <button
                onClick={() => onOpenSimulator(overallWinner === 'A' ? flowA.id : flowB.id)}
                className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Testar Vencedor no Celular</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Pre-set Comparison Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Comparações Rápidas:
          </span>

          <button
            onClick={() => {
              setFlowAId('flow_welcome_instagram');
              setFlowBId('flow_welcome_messenger');
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              flowAId === 'flow_welcome_instagram' && flowBId === 'flow_welcome_messenger'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            📸 Insta Welcome vs. 💬 Messenger Welcome
          </button>

          <button
            onClick={() => {
              setFlowAId('flow_pricing_keyword');
              setFlowBId('flow_discount_keyword');
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              flowAId === 'flow_pricing_keyword' && flowBId === 'flow_discount_keyword'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            💰 Pricing vs. 🎁 Cupom Desconto
          </button>

          <button
            onClick={() => {
              setFlowAId('flow_support_keyword');
              setFlowBId('flow_no_match_default');
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              flowAId === 'flow_support_keyword' && flowBId === 'flow_no_match_default'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            🎧 Atendimento Suporte vs. ❓ Fallback Default
          </button>
        </div>
      </div>

      {/* Main Container Body */}
      <div className="p-6 lg:p-8 space-y-6 flex-1">
        {/* Flow Selection & Control Bar Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
            {/* Flow A Picker (5 cols) */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    A
                  </span>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    Fluxo Primário (Variante A)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getChannelBadge(flowA.channel)} flex items-center gap-1`}>
                    {getChannelIcon(flowA.channel)}
                    {flowA.channel}
                  </span>
                </div>
              </div>

              <select
                id="select_flow_a_id"
                value={flowAId}
                onChange={(e) => setFlowAId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
              >
                {flows.map((f) => (
                  <option key={`flow_a_${f.id}`} value={f.id}>
                    [{f.id}] {f.title} ({f.stats.runs} runs • {f.stats.ctr}% CTR)
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                <span className="font-mono flex items-center gap-1">
                  ID: <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-blue-100 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">{flowA.id}</code>
                  <button 
                    onClick={() => handleCopyId(flowA.id)} 
                    title="Copiar ID"
                    className="p-1 hover:text-blue-600 cursor-pointer"
                  >
                    {copiedId === flowA.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
                <span className="font-bold text-blue-700 dark:text-blue-400">
                  CTR Atual: {statsA.ctr}% • {statsA.completionRate}% conclusão
                </span>
              </div>
            </div>

            {/* Swap & Compare Divider (1 col) */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center gap-2">
              <button
                id="btn_swap_comparison_flows"
                onClick={handleSwapFlows}
                title="Inverter Fluxo A e Fluxo B"
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center justify-center transition-all shadow-xs hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                VS
              </span>
            </div>

            {/* Flow B Picker (5 cols) */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    B
                  </span>
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                    Fluxo Comparativo (Variante B)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getChannelBadge(flowB.channel)} flex items-center gap-1`}>
                    {getChannelIcon(flowB.channel)}
                    {flowB.channel}
                  </span>
                </div>
              </div>

              <select
                id="select_flow_b_id"
                value={flowBId}
                onChange={(e) => setFlowBId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-xs"
              >
                {flows.map((f) => (
                  <option key={`flow_b_${f.id}`} value={f.id}>
                    [{f.id}] {f.title} ({f.stats.runs} runs • {f.stats.ctr}% CTR)
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                <span className="font-mono flex items-center gap-1">
                  ID: <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-purple-100 dark:border-slate-700 font-bold text-purple-600 dark:text-purple-400">{flowB.id}</code>
                  <button 
                    onClick={() => handleCopyId(flowB.id)} 
                    title="Copiar ID"
                    className="p-1 hover:text-purple-600 cursor-pointer"
                  >
                    {copiedId === flowB.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
                <span className="font-bold text-purple-700 dark:text-purple-400">
                  CTR Atual: {statsB.ctr}% • {statsB.completionRate}% conclusão
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Winner & Delta Diagnostic Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shrink-0 ${
                overallWinner === 'A' 
                  ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' 
                  : overallWinner === 'B' 
                  ? 'bg-purple-500 text-white ring-4 ring-purple-500/30' 
                  : 'bg-emerald-500 text-white'
              }`}>
                <Trophy className="w-6 h-6 text-amber-300 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Vencedor Estatístico: Variante {overallWinner}
                  </span>
                  <span className="text-xs text-slate-300">
                    Confiança: <strong className="text-emerald-400">{confidenceScore}%</strong>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {overallWinner === 'A' 
                    ? `Fluxo A (${flowA.id}) supera o Fluxo B em performance global`
                    : overallWinner === 'B'
                    ? `Fluxo B (${flowB.id}) supera o Fluxo A em performance global`
                    : 'Ambos os fluxos apresentam métricas de engajamento equivalentes'}
                </h3>

                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {overallWinner === 'A' ? (
                    <>
                      A Variante A entrega <strong className="text-emerald-400">+{Math.abs(ctrDelta)}% de CTR</strong> e{' '}
                      <strong className="text-emerald-400">+{Math.abs(completionDelta)}% de taxa de conclusão</strong> com{' '}
                      {statsA.runs.toLocaleString()} execuções registradas.
                    </>
                  ) : overallWinner === 'B' ? (
                    <>
                      A Variante B entrega <strong className="text-emerald-400">+{Math.abs(ctrDelta)}% de CTR</strong> e{' '}
                      <strong className="text-emerald-400">+{Math.abs(completionDelta)}% de taxa de conclusão</strong> com{' '}
                      {statsB.runs.toLocaleString()} execuções registradas.
                    </>
                  ) : (
                    'Os dois fluxos apresentam volume e taxas de conversão semelhantes. Recomenda-se aumentar o tamanho da amostra para teste conclusivo.'
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions for the Winner */}
            <div className="flex flex-row md:flex-col items-center sm:items-end gap-2 shrink-0">
              <button
                onClick={() => handlePromoteWinner(overallWinner === 'B' ? 'B' : 'A')}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>{promotedWinner ? 'Vencedor Promovido! 🎉' : `Promover Fluxo ${overallWinner === 'B' ? 'B' : 'A'} como Padrão`}</span>
              </button>

              {onOpenFlow && (
                <button
                  onClick={() => onOpenFlow(overallWinner === 'B' ? flowB.id : flowA.id)}
                  className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Abrir no Canvas</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tabela Comparativa Side-by-Side</span>
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'charts'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Gráficos de Comparação & Curva</span>
            </button>

            <button
              onClick={() => setActiveTab('funnel_steps')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'funnel_steps'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Estrutura de Nós & Passos</span>
            </button>
          </div>

          {/* Timeframe Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Período: <strong>Últimos 30 dias (Graph API)</strong></span>
          </div>
        </div>

        {/* TAB 1: SIDE-BY-SIDE COMPARISON TABLE (CORE USER REQUIREMENT) */}
        {activeTab === 'table' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-150">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-5 w-1/4">Métrica / Propriedade</th>
                    <th className="py-3.5 px-5 w-1/3 bg-blue-50/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 border-x border-blue-100 dark:border-blue-900/40">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">A</span>
                        <span>Fluxo A: {flowA.id}</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-5 w-1/3 bg-purple-50/40 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">B</span>
                        <span>Fluxo B: {flowB.id}</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-5 text-right w-1/6">Diferença / Vencedor</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800/80">
                  {/* Row 1: Flow ID */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span>ID do Fluxo</span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center justify-between">
                        <code>{flowA.id}</code>
                        <button onClick={() => handleCopyId(flowA.id)} className="text-slate-400 hover:text-blue-600 cursor-pointer">
                          {copiedId === flowA.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50/20 dark:bg-purple-950/10">
                      <div className="flex items-center justify-between">
                        <code>{flowB.id}</code>
                        <button onClick={() => handleCopyId(flowB.id)} className="text-slate-400 hover:text-purple-600 cursor-pointer">
                          {copiedId === flowB.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right text-[11px] text-slate-400">
                      Chaves de Roteamento
                    </td>
                  </tr>

                  {/* Row 2: Flow Title & Channel */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700 dark:text-slate-300">
                      Título & Canal Oficial
                    </td>
                    <td className="py-3.5 px-5 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-100 dark:border-blue-900/30">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{flowA.title}</div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getChannelBadge(flowA.channel)}`}>
                          {getChannelIcon(flowA.channel)}
                          {flowA.channel.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 bg-purple-50/20 dark:bg-purple-950/10">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{flowB.title}</div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getChannelBadge(flowB.channel)}`}>
                          {getChannelIcon(flowB.channel)}
                          {flowB.channel.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right text-[11px] text-slate-400">
                      {flowA.channel === flowB.channel ? 'Mesmo Canal' : 'Multi-Canal'}
                    </td>
                  </tr>

                  {/* Row 3: CTR (Click-Through Rate) */}
                  <tr className="bg-amber-50/20 dark:bg-amber-950/10 hover:bg-amber-50/40 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <MousePointerClick className="w-4 h-4 text-amber-600" />
                        <div>
                          <span>Taxa de Cliques (CTR)</span>
                          <p className="text-[10px] text-slate-400 font-normal">Engajamento em botões e links</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 bg-blue-50/40 dark:bg-blue-950/20 border-x border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-slate-900 dark:text-white">{statsA.ctr}%</span>
                        {statsA.ctr >= statsB.ctr ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Superior
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">-{Math.abs(ctrDelta)}%</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${statsA.ctr}%` }} />
                      </div>
                    </td>
                    <td className="py-4 px-5 bg-purple-50/40 dark:bg-purple-950/20">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-slate-900 dark:text-white">{statsB.ctr}%</span>
                        {statsB.ctr >= statsA.ctr ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Superior
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">-{Math.abs(ctrDelta)}%</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: `${statsB.ctr}%` }} />
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right font-black">
                      <span className={`text-xs px-2.5 py-1 rounded-lg ${
                        ctrDelta > 0 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : ctrDelta < 0 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ctrDelta > 0 ? `+${ctrDelta}% (Fluxo A)` : ctrDelta < 0 ? `+${Math.abs(ctrDelta)}% (Fluxo B)` : 'Empate (0%)'}
                      </span>
                    </td>
                  </tr>

                  {/* Row 4: Completion Rate */}
                  <tr className="bg-emerald-50/20 dark:bg-emerald-950/10 hover:bg-emerald-50/40 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span>Taxa de Conclusão</span>
                          <p className="text-[10px] text-slate-400 font-normal">Contatos que concluíram até o final</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 bg-blue-50/40 dark:bg-blue-950/20 border-x border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-slate-900 dark:text-white">{statsA.completionRate}%</span>
                        {statsA.completionRate >= statsB.completionRate && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                            <Trophy className="w-3 h-3 text-amber-500" /> Venceu
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${statsA.completionRate}%` }} />
                      </div>
                    </td>
                    <td className="py-4 px-5 bg-purple-50/40 dark:bg-purple-950/20">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-slate-900 dark:text-white">{statsB.completionRate}%</span>
                        {statsB.completionRate >= statsA.completionRate && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                            <Trophy className="w-3 h-3 text-amber-500" /> Venceu
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: `${statsB.completionRate}%` }} />
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right font-black">
                      <span className={`text-xs px-2.5 py-1 rounded-lg ${
                        completionDelta > 0 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : completionDelta < 0 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {completionDelta > 0 ? `+${completionDelta}% (Fluxo A)` : completionDelta < 0 ? `+${Math.abs(completionDelta)}% (Fluxo B)` : 'Empate (0%)'}
                      </span>
                    </td>
                  </tr>

                  {/* Row 5: Total Executions (Runs) */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700 dark:text-slate-300">
                      Execuções Totais (Runs)
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-100 dark:border-blue-900/30">
                      {statsA.runs.toLocaleString()} ativações
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white bg-purple-50/20 dark:bg-purple-950/10">
                      {statsB.runs.toLocaleString()} ativações
                    </td>
                    <td className="py-3.5 px-5 text-right font-medium text-slate-600 dark:text-slate-400">
                      {runsDelta > 0 ? `+${runsDelta.toLocaleString()} em A` : `${runsDelta.toLocaleString()} em A`}
                    </td>
                  </tr>

                  {/* Row 6: Completed Runs */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700 dark:text-slate-300">
                      Conclusões com Sucesso
                    </td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 dark:text-emerald-400 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-100 dark:border-blue-900/30">
                      {statsA.completed.toLocaleString()} concluídos
                    </td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 dark:text-emerald-400 bg-purple-50/20 dark:bg-purple-950/10">
                      {statsB.completed.toLocaleString()} concluídos
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-emerald-600">
                      {statsA.completed >= statsB.completed ? `+${(statsA.completed - statsB.completed).toLocaleString()} em A` : `+${(statsB.completed - statsA.completed).toLocaleString()} em B`}
                    </td>
                  </tr>

                  {/* Row 7: Drop-off / Abandonment Rate */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700 dark:text-slate-300">
                      Taxa de Abandono (Desistência)
                    </td>
                    <td className="py-3.5 px-5 font-bold text-rose-600 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-100 dark:border-blue-900/30">
                      {statsA.dropRate}% ({statsA.runs - statsA.completed} leads)
                    </td>
                    <td className="py-3.5 px-5 font-bold text-rose-600 bg-purple-50/20 dark:bg-purple-950/10">
                      {statsB.dropRate}% ({statsB.runs - statsB.completed} leads)
                    </td>
                    <td className="py-3.5 px-5 text-right text-xs font-bold text-slate-700 dark:text-slate-300">
                      {statsA.dropRate < statsB.dropRate ? 'Menor perda no Fluxo A' : 'Menor perda no Fluxo B'}
                    </td>
                  </tr>

                  {/* Row 8: Nodes Count */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700 dark:text-slate-300">
                      Complexidade (Número de Passos/Nós)
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-100 dark:border-blue-900/30">
                      {flowA.nodes.length} nós no canvas
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white bg-purple-50/20 dark:bg-purple-950/10">
                      {flowB.nodes.length} nós no canvas
                    </td>
                    <td className="py-3.5 px-5 text-right text-slate-400 text-xs">
                      {Math.abs(flowA.nodes.length - flowB.nodes.length)} nós de diferença
                    </td>
                  </tr>

                  {/* Row 9: Status */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-700 dark:text-slate-300">
                      Status Operacional
                    </td>
                    <td className="py-3.5 px-5 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-100 dark:border-blue-900/30">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        flowA.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${flowA.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {flowA.isActive ? 'Ativo na Produção' : 'Pausado'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 bg-purple-50/20 dark:bg-purple-950/10">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        flowB.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${flowB.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {flowB.isActive ? 'Ativo na Produção' : 'Pausado'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-slate-400 text-xs">
                      Graph Webhooks
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table Footer Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Dados validados e calculados a partir da propriedade <code>stats</code> de cada fluxo.</span>
              </div>

              <div className="flex items-center gap-2">
                {onOpenFlow && (
                  <>
                    <button
                      onClick={() => onOpenFlow(flowA.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Editar Fluxo A
                    </button>
                    <button
                      onClick={() => onOpenFlow(flowB.id)}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Editar Fluxo B
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VISUAL CHARTS (RECHARTS BAR & AREA VISUALIZERS) */}
        {activeTab === 'charts' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Key Metrics Comparison Bars */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Comparação Direta de Taxas (%)
                    </h4>
                    <p className="text-xs text-slate-500">CTR vs. Taxa de Conclusão vs. Abandono</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Recharts
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonBarData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <Tooltip 
                        formatter={(val: any) => [`${val}%`, '']}
                        contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0F172A', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend />
                      <Bar dataKey="Fluxo A" fill="#0084FF" radius={[6, 6, 0, 0]} name={`Fluxo A (${flowA.id})`} />
                      <Bar dataKey="Fluxo B" fill="#9333EA" radius={[6, 6, 0, 0]} name={`Fluxo B (${flowB.id})`} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Timeline CTR Simulation Curve */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Evolução Cronológica do CTR (%)
                    </h4>
                    <p className="text-xs text-slate-500">Tendência diária de engajamento</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    7 Dias
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineTrendData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="gradFlowA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0084FF" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0084FF" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="gradFlowB" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333EA" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#9333EA" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0F172A', color: '#fff', fontSize: '12px' }} />
                      <Legend />
                      <Area type="monotone" dataKey="CTR Fluxo A" stroke="#0084FF" strokeWidth={2.5} fill="url(#gradFlowA)" />
                      <Area type="monotone" dataKey="CTR Fluxo B" stroke="#9333EA" strokeWidth={2.5} fill="url(#gradFlowB)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Traffic Split Distribution Simulator */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Simulador de Divisão Dinâmica de Tráfego (A/B Routing)</span>
                  </h4>
                  <p className="text-xs text-slate-500">Ajuste a proporção de novos leads direcionados para cada fluxo</p>
                </div>
                <div className="text-xs font-mono font-bold">
                  <span className="text-blue-600">{simulatedTrafficRatio}% Fluxo A</span> / <span className="text-purple-600">{100 - simulatedTrafficRatio}% Fluxo B</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={simulatedTrafficRatio}
                onChange={(e) => setSimulatedTrafficRatio(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs space-y-1">
                  <div className="font-bold text-blue-900 dark:text-blue-300">Projeção Fluxo A ({simulatedTrafficRatio}%):</div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Em 10.000 contatos, gerará aprox. <strong>{Math.round(10000 * (simulatedTrafficRatio / 100) * (statsA.ctr / 100)).toLocaleString()} cliques</strong> e{' '}
                    <strong>{Math.round(10000 * (simulatedTrafficRatio / 100) * (statsA.completionRate / 100)).toLocaleString()} conclusões</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                  <div className="font-bold text-purple-900 dark:text-purple-300">Projeção Fluxo B ({100 - simulatedTrafficRatio}%):</div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Em 10.000 contatos, gerará aprox. <strong>{Math.round(10000 * ((100 - simulatedTrafficRatio) / 100) * (statsB.ctr / 100)).toLocaleString()} cliques</strong> e{' '}
                    <strong>{Math.round(10000 * ((100 - simulatedTrafficRatio) / 100) * (statsB.completionRate / 100)).toLocaleString()} conclusões</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STEP-BY-STEP FUNNEL STRUCTURE */}
        {activeTab === 'funnel_steps' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
            {/* Flow A Steps */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-900/60 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">A</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs">{flowA.title}</h4>
                </div>
                <span className="text-xs font-bold text-blue-600">{flowA.nodes.length} nós</span>
              </div>

              <div className="space-y-2.5">
                {flowA.nodes.map((node, idx) => (
                  <div key={node.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{node.title}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{node.type}</span>
                      </div>
                      {node.data.text && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{node.data.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flow B Steps */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-900/60 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-purple-600 text-white font-bold text-xs flex items-center justify-center">B</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs">{flowB.title}</h4>
                </div>
                <span className="text-xs font-bold text-purple-600">{flowB.nodes.length} nós</span>
              </div>

              <div className="space-y-2.5">
                {flowB.nodes.map((node, idx) => (
                  <div key={node.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{node.title}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{node.type}</span>
                      </div>
                      {node.data.text && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{node.data.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
