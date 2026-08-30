import React, { useState, useMemo } from 'react';
import {
  Filter,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  MousePointerClick,
  Sparkles,
  Zap,
  MessageSquare,
  Split,
  Tag,
  Clock,
  ArrowRight,
  ArrowDown,
  Bot,
  ExternalLink,
  Info,
  ChevronRight,
  BarChart2,
  RefreshCw,
  Lightbulb,
  Sliders,
  Check,
  ChevronDown,
  Layers,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Play
} from 'lucide-react';
import { Flow, FlowNode, NodeType } from '../../types';

interface FlowFunnelViewProps {
  flows: Flow[];
  selectedFlowId?: string;
  onSelectFlow?: (flowId: string) => void;
  onOpenSimulator?: (flowId?: string) => void;
  onOpenABComparison?: (flowId?: string) => void;
}

export interface FunnelStepMetric {
  nodeId: string;
  nodeTitle: string;
  nodeType: NodeType;
  stepIndex: number;
  previewText?: string;
  visitors: number;
  completed: number;
  dropOffs: number;
  retentionRate: number; // vs previous step (0 - 100)
  overallRetention: number; // vs step 0 (0 - 100)
  dropOffRate: number; // (0 - 100)
  avgTimeSpent: string;
  isBottleneck: boolean;
  status: 'healthy' | 'warning' | 'critical';
  buttonClicks?: { label: string; clicks: number; percent: number }[];
  branchInfo?: {
    isSplit: boolean;
    variantA?: { name: string; visitors: number; retention: number };
    variantB?: { name: string; visitors: number; retention: number };
  };
  recommendation?: string;
}

export const FlowFunnelView: React.FC<FlowFunnelViewProps> = ({
  flows,
  selectedFlowId,
  onSelectFlow,
  onOpenSimulator,
  onOpenABComparison
}) => {
  const [activeFlowId, setActiveFlowId] = useState<string>(
    selectedFlowId || flows[0]?.id || ''
  );
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'new_followers' | 'leads'>('all');
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<FunnelStepMetric | null>(null);
  const [showAiAdvisor, setShowAiAdvisor] = useState(true);

  // Find currently active flow
  const currentFlow = useMemo(() => {
    return flows.find((f) => f.id === activeFlowId) || flows[0];
  }, [flows, activeFlowId]);

  // Compute funnel steps and metrics based on topological node ordering
  const funnelSteps: FunnelStepMetric[] = useMemo(() => {
    if (!currentFlow || !currentFlow.nodes || currentFlow.nodes.length === 0) {
      return [];
    }

    const { nodes, connections, stats } = currentFlow;
    const baseTotal = stats?.runs || 2840;

    // Order nodes starting from trigger
    const triggerNode = nodes.find((n) => n.type === 'trigger') || nodes[0];
    const orderedNodes: FlowNode[] = [];
    const visited = new Set<string>();

    const traverse = (currId: string) => {
      if (visited.has(currId)) return;
      visited.add(currId);
      const curr = nodes.find((n) => n.id === currId);
      if (curr) orderedNodes.push(curr);

      const outgoing = connections.filter((c) => c.fromNodeId === currId);
      for (const edge of outgoing) {
        traverse(edge.toNodeId);
      }
    };

    if (triggerNode) {
      traverse(triggerNode.id);
    }

    // Add any remaining unvisited nodes
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        orderedNodes.push(node);
      }
    }

    // Build funnel metrics with realistic, proportional drops
    let currentVisitors = baseTotal;
    const steps: FunnelStepMetric[] = [];

    // Pre-calculated deterministic retention curves for high fidelity
    const defaultDropMultipliers = [1.0, 0.94, 0.82, 0.73, 0.61, 0.52, 0.45];

    orderedNodes.forEach((node, index) => {
      // Calculate realistic visitors for this node
      let factor = defaultDropMultipliers[index] || Math.max(0.2, 1 - index * 0.12);
      
      // Node-type specific retention modifiers
      if (node.type === 'trigger') {
        factor = 1.0;
      } else if (node.type === 'ab_split') {
        factor = 0.98; // virtually no drop at the split router
      } else if (node.type === 'action') {
        factor = 0.95; // actions are automated
      }

      const visitors = Math.round(baseTotal * factor);
      const previousVisitors = index === 0 ? baseTotal : steps[index - 1]?.visitors || baseTotal;
      const completed = Math.round(visitors * (index === orderedNodes.length - 1 ? 0.88 : 0.92));
      const dropOffs = Math.max(0, previousVisitors - visitors);
      const retentionRate = previousVisitors > 0 ? Number(((visitors / previousVisitors) * 100).toFixed(1)) : 100;
      const overallRetention = Number(((visitors / baseTotal) * 100).toFixed(1));
      const dropOffRate = Number((100 - retentionRate).toFixed(1));

      // Determine bottleneck threshold (if drop-off is over 22% between consecutive steps)
      const isBottleneck = dropOffRate > 20 && index > 0;
      const status: 'healthy' | 'warning' | 'critical' = 
        dropOffRate > 25 ? 'critical' : dropOffRate > 15 ? 'warning' : 'healthy';

      // Preview text
      let preview = '';
      if (node.type === 'message') {
        preview = node.data.text?.slice(0, 80) + (node.data.text && node.data.text.length > 80 ? '...' : '') || '';
      } else if (node.type === 'trigger') {
        preview = `Palavras-chave: ${node.data.keywords?.join(', ') || 'Direct / Comentário'}`;
      } else if (node.type === 'ab_split') {
        preview = `Divisão: ${node.data.splitRatioA ?? 50}% A / ${node.data.splitRatioB ?? 50}% B (${node.data.variantAName || 'A'} vs ${node.data.variantBName || 'B'})`;
      } else if (node.type === 'action') {
        preview = `Ação: ${node.data.actionType === 'add_tag' ? `Adicionar Tag "${node.data.tagToAdd}"` : 'Atendimento Humano'}`;
      }

      // Button clicks breakdown if message has buttons
      let buttonClicks: { label: string; clicks: number; percent: number }[] | undefined;
      if (node.data.buttons && node.data.buttons.length > 0) {
        const totalBtnClicks = Math.round(visitors * 0.78);
        const weights = [0.54, 0.31, 0.15];
        buttonClicks = node.data.buttons.map((b, bIdx) => {
          const w = weights[bIdx] || 0.1;
          const clicks = Math.round(totalBtnClicks * w);
          return {
            label: b.text,
            clicks,
            percent: Math.round(w * 100)
          };
        });
      }

      // A/B branch info
      let branchInfo: FunnelStepMetric['branchInfo'] | undefined;
      if (node.type === 'ab_split') {
        const ratioA = node.data.splitRatioA ?? 50;
        const vA = Math.round(visitors * (ratioA / 100));
        const vB = visitors - vA;
        branchInfo = {
          isSplit: true,
          variantA: {
            name: node.data.variantAName || 'Variante A (Cupom)',
            visitors: vA,
            retention: node.data.statsA?.ctr || 72.4
          },
          variantB: {
            name: node.data.variantBName || 'Variante B (Menu)',
            visitors: vB,
            retention: node.data.statsB?.ctr || 85.2
          }
        };
      }

      // Contextual recommendation
      let recommendation = '';
      if (isBottleneck) {
        if (node.type === 'message' && (node.data.buttons?.length || 0) > 2) {
          recommendation = 'Reduza o número de botões ou simplifique o texto para diminuir a sobrecarga de decisão do lead.';
        } else if (node.type === 'message' && (!node.data.buttons || node.data.buttons.length === 0)) {
          recommendation = 'Adicione botões de Resposta Rápida (Quick Replies) para facilitar a resposta com um único toque no celular.';
        } else {
          recommendation = 'Implemente um Teste A/B nesta etapa para avaliar uma abordagem mais direta com menor taxa de saída.';
        }
      } else {
        recommendation = 'Etapa com excelente retenção e fluidez de engajamento.';
      }

      const times = ['0s', '4s', '18s', '35s', '1m 12s', '2m 04s'];

      steps.push({
        nodeId: node.id,
        nodeTitle: node.title,
        nodeType: node.type,
        stepIndex: index + 1,
        previewText: preview,
        visitors,
        completed,
        dropOffs,
        retentionRate,
        overallRetention,
        dropOffRate,
        avgTimeSpent: times[index] || '45s',
        isBottleneck,
        status,
        buttonClicks,
        branchInfo,
        recommendation
      });
    });

    return steps;
  }, [currentFlow]);

  // Overall Funnel Summary Stats
  const topVisitors = funnelSteps[0]?.visitors || 0;
  const finalCompleted = funnelSteps[funnelSteps.length - 1]?.completed || 0;
  const overallConversionRate = topVisitors > 0 ? ((finalCompleted / topVisitors) * 100).toFixed(1) : '0.0';
  const totalDropOffs = topVisitors - finalCompleted;
  
  // Find critical bottleneck
  const worstStep = useMemo(() => {
    if (funnelSteps.length <= 1) return null;
    const sorted = [...funnelSteps.slice(1)].sort((a, b) => b.dropOffRate - a.dropOffRate);
    return sorted[0];
  }, [funnelSteps]);

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'trigger': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-[#0084FF]" />;
      case 'ab_split': return <Split className="w-4 h-4 text-fuchsia-600" />;
      case 'condition': return <Filter className="w-4 h-4 text-purple-600" />;
      case 'action': return <Tag className="w-4 h-4 text-emerald-600" />;
      case 'ai_step': return <Sparkles className="w-4 h-4 text-indigo-600" />;
      case 'delay': return <Clock className="w-4 h-4 text-orange-500" />;
      default: return <Layers className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNodeTypeBadge = (type: NodeType) => {
    switch (type) {
      case 'trigger': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'message': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ab_split': return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      case 'condition': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'action': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ai_step': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'delay': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FB] p-5 lg:p-7 overflow-y-auto space-y-6 select-none">
      {/* Top Header & Flow Selector Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-[#0084FF] border border-blue-100">
              <BarChart2 className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-bold text-[#1A1D21] tracking-tight">
              Visualização de Funil & Taxa de Retenção
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Passo a Passo (Nó a Nó)
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Acompanhe o caminho exato dos contatos pelo fluxo, medindo a retenção e identificando com precisão os gargalos de desistência.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Flow Selection Dropdown */}
          <div className="relative min-w-[260px] flex-1 md:flex-initial">
            <select
              value={activeFlowId}
              onChange={(e) => {
                setActiveFlowId(e.target.value);
                if (onSelectFlow) onSelectFlow(e.target.value);
              }}
              className="w-full pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] focus:ring-2 focus:ring-[#0084FF]/20 focus:border-[#0084FF] cursor-pointer appearance-none"
            >
              {flows.map((flow) => (
                <option key={flow.id} value={flow.id}>
                  {flow.channel === 'instagram' ? '📸' : flow.channel === 'messenger' ? '💬' : '🌐'} {flow.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center bg-[#F8F9FB] p-1 rounded-xl border border-[#E2E8F0] text-xs font-semibold">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeRange === '7d' ? 'bg-white text-[#1A1D21] shadow-xs' : 'text-[#64748B] hover:text-[#1A1D21]'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeRange === '30d' ? 'bg-white text-[#1A1D21] shadow-xs' : 'text-[#64748B] hover:text-[#1A1D21]'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeRange === 'all' ? 'bg-white text-[#1A1D21] shadow-xs' : 'text-[#64748B] hover:text-[#1A1D21]'
              }`}
            >
              Tudo
            </button>
          </div>

          {/* Simulator Test Button */}
          {onOpenSimulator && (
            <button
              onClick={() => onOpenSimulator(activeFlowId)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#0084FF] to-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:shadow-md transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Simular Fluxo</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Macro Metric Cards for this Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Leads Started */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold uppercase tracking-wider">
            <span>Início do Funil (Gatilho)</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-1.5 text-[#1A1D21] tracking-tight">
            {topVisitors.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>100% de alcance inicial</span>
          </div>
        </div>

        {/* Card 2: Completed / Converted */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold uppercase tracking-wider">
            <span>Concluíram o Fluxo</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-1.5 text-emerald-600 tracking-tight">
            {finalCompleted.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">
            Taxa Final: {overallConversionRate}% de conversão
          </div>
        </div>

        {/* Card 3: Total Drop-offs */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold uppercase tracking-wider">
            <span>Total de Desistências</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold mt-1.5 text-rose-600 tracking-tight">
            {totalDropOffs.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">
            {topVisitors > 0 ? ((totalDropOffs / topVisitors) * 100).toFixed(1) : 0}% de perda total
          </div>
        </div>

        {/* Card 4: Worst Bottleneck Alert */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold uppercase tracking-wider">
            <span>Maior Ponto de Queda</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base font-bold mt-1.5 text-[#1A1D21] truncate">
            {worstStep ? `Passo ${worstStep.stepIndex}: ${worstStep.nodeTitle}` : 'Nenhum gargalo crítico'}
          </div>
          <div className="text-[11px] text-amber-700 font-bold mt-1">
            {worstStep ? `Perda de ${worstStep.dropOffRate}% dos contatos (${worstStep.dropOffs.toLocaleString()} leads)` : 'Fluxo fluindo perfeitamente'}
          </div>
        </div>
      </div>

      {/* AI Smart Bottleneck Diagnostic Alert Banner */}
      {showAiAdvisor && worstStep && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 z-10">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                  Diagnóstico IA ManyFlow
                </span>
                <span className="text-xs text-blue-200 font-medium">Gargalo Crítico Identificado</span>
              </div>
              <p className="text-sm font-semibold text-white">
                O passo <strong className="text-amber-300">"{worstStep.nodeTitle}"</strong> apresenta uma taxa de desistência de <strong className="text-amber-300">{worstStep.dropOffRate}%</strong>.
              </p>
              <p className="text-xs text-blue-100/80">
                {worstStep.recommendation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0 z-10">
            <button
              onClick={() => setSelectedNodeDetails(worstStep)}
              className="px-3.5 py-1.5 rounded-xl bg-white text-indigo-950 text-xs font-bold hover:bg-blue-50 transition-colors cursor-pointer shadow-xs"
            >
              Ver Detalhes do Nó
            </button>
            <button
              onClick={() => setShowAiAdvisor(false)}
              className="px-2 py-1.5 text-xs text-blue-200 hover:text-white transition-colors cursor-pointer"
            >
              Dispensar
            </button>
          </div>

          {/* Background Decorative Pattern */}
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Main Funnel Pipeline View (Step-by-Step Waterfall & Drop-off Flow) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 lg:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#1A1D21] tracking-tight flex items-center gap-2">
              <span>Etapas do Fluxo & Quedas Entre Nós</span>
              <span className="text-xs font-semibold text-[#64748B]">
                ({funnelSteps.length} nós sequenciados)
              </span>
            </h2>
            <p className="text-xs text-[#64748B]">
              A barra visual representa o volume de usuários ativos em cada ponto da conversa.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] font-semibold text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Alta Retenção (&gt;85%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Atenção (60-85%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Gargalo Crítico (&lt;60%)</span>
            </div>
          </div>
        </div>

        {/* Funnel Steps Cascade */}
        <div className="space-y-4">
          {funnelSteps.map((step, idx) => {
            const isLast = idx === funnelSteps.length - 1;
            const nextStep = funnelSteps[idx + 1];
            const barWidthPercent = Math.max(12, step.overallRetention);

            return (
              <div key={step.nodeId} className="space-y-3">
                {/* Step Card */}
                <div
                  onClick={() => setSelectedNodeDetails(step)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    step.isBottleneck
                      ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/50'
                      : 'bg-[#F8F9FB] hover:bg-white border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left: Node Info */}
                    <div className="flex items-start gap-3 min-w-[280px] flex-1">
                      {/* Step Number Badge */}
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-center font-bold text-xs text-[#1A1D21] shrink-0 mt-0.5">
                        {step.stepIndex}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getNodeTypeBadge(step.nodeType)}`}>
                            {getNodeIcon(step.nodeType)}
                            <span className="uppercase">{step.nodeType}</span>
                          </span>
                          <span className="text-sm font-bold text-[#1A1D21]">
                            {step.nodeTitle}
                          </span>
                          {step.isBottleneck && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Ponto Crítico
                            </span>
                          )}
                        </div>

                        {/* Preview snippet */}
                        {step.previewText && (
                          <p className="text-xs text-[#64748B] line-clamp-1 italic">
                            "{step.previewText}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Middle: Visual Bar & Volume */}
                    <div className="w-full lg:w-[45%] space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#1A1D21] flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#0084FF]" />
                          <strong>{step.visitors.toLocaleString()}</strong> usuários
                        </span>
                        <span className="text-[#64748B]">
                          Retenção global: <strong className="text-[#1A1D21]">{step.overallRetention}%</strong>
                        </span>
                      </div>

                      {/* Visual Funnel Bar */}
                      <div className="h-4 rounded-full bg-gray-200/80 overflow-hidden flex shadow-inner relative">
                        <div
                          className={`h-full transition-all duration-500 rounded-full flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-sm ${
                            step.status === 'critical'
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : step.status === 'warning'
                              ? 'bg-gradient-to-r from-blue-500 to-amber-500'
                              : 'bg-gradient-to-r from-[#0084FF] to-emerald-500'
                          }`}
                          style={{ width: `${barWidthPercent}%` }}
                        >
                          {barWidthPercent > 20 && `${step.overallRetention}%`}
                        </div>
                      </div>
                    </div>

                    {/* Right: Retention vs Previous Step */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto text-right shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-gray-100">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#64748B]">
                          Taxa de Avanço
                        </div>
                        <div className={`text-base font-bold ${
                          step.retentionRate >= 85 ? 'text-emerald-600' : step.retentionRate >= 65 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {step.retentionRate}%
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-[#64748B]">
                          Tempo Médio
                        </div>
                        <div className="text-xs font-semibold text-[#1A1D21] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#64748B]" />
                          {step.avgTimeSpent}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0084FF] transition-colors" />
                    </div>
                  </div>

                  {/* Branch A/B Special Preview if ab_split */}
                  {step.branchInfo && (
                    <div className="mt-3 pt-3 border-t border-fuchsia-200/80 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-blue-800">Variante A</span>
                            <p className="text-xs font-semibold text-[#1A1D21]">{step.branchInfo.variantA?.name}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-blue-700">{step.branchInfo.variantA?.visitors.toLocaleString()} leads</span>
                            <div className="text-[10px] text-[#64748B]">CTR: {step.branchInfo.variantA?.retention}%</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-fuchsia-50/60 border border-fuchsia-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-fuchsia-800">Variante B (Líder 🏆)</span>
                            <p className="text-xs font-semibold text-[#1A1D21]">{step.branchInfo.variantB?.name}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-fuchsia-700">{step.branchInfo.variantB?.visitors.toLocaleString()} leads</span>
                            <div className="text-[10px] text-emerald-700 font-bold">CTR: {step.branchInfo.variantB?.retention}%</div>
                          </div>
                        </div>
                      </div>

                      {onOpenABComparison && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenABComparison(currentFlow?.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-fuchsia-50 hover:bg-fuchsia-100 border border-fuchsia-200 text-fuchsia-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Split className="w-3.5 h-3.5 text-fuchsia-600" />
                            <span>Ver Gráficos Comparativos & Conversão Final do Teste A/B</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Button Click distribution badges if message */}
                  {step.buttonClicks && step.buttonClicks.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                        <MousePointerClick className="w-3 h-3 text-[#0084FF]" />
                        Cliques nos Botões:
                      </span>
                      {step.buttonClicks.map((btn, bIdx) => (
                        <div
                          key={bIdx}
                          className="px-2 py-1 rounded-md bg-white border border-[#E2E8F0] text-[11px] text-[#1A1D21] flex items-center gap-1.5 shadow-2xs"
                        >
                          <span className="font-semibold">{btn.label}</span>
                          <span className="text-[10px] font-bold px-1 rounded bg-blue-50 text-[#0084FF]">
                            {btn.percent}% ({btn.clicks.toLocaleString()})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drop-off connector between steps */}
                {!isLast && nextStep && (
                  <div className="flex items-center justify-center my-1">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold shadow-2xs">
                      <ArrowDown className="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        🔻 {nextStep.dropOffRate}% de Desistência
                      </span>
                      <span className="text-[10px] text-rose-600 font-semibold">
                        ({nextStep.dropOffs.toLocaleString()} usuários saíram nesta transição)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Detail Drawer / Modal when clicking a node */}
      {selectedNodeDetails && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNodeDetails(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0084FF] border border-blue-100">
                  {getNodeIcon(selectedNodeDetails.nodeType)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Passo {selectedNodeDetails.stepIndex} • {selectedNodeDetails.nodeType}
                  </span>
                  <h3 className="text-base font-bold text-[#1A1D21]">
                    {selectedNodeDetails.nodeTitle}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedNodeDetails(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Chegaram ao Nó</div>
                <div className="text-lg font-bold text-[#1A1D21] mt-0.5">
                  {selectedNodeDetails.visitors.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">Taxa de Avanço</div>
                <div className="text-lg font-bold text-emerald-600 mt-0.5">
                  {selectedNodeDetails.retentionRate}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <div className="text-[10px] font-bold text-rose-800 uppercase">Abandonos</div>
                <div className="text-lg font-bold text-rose-600 mt-0.5">
                  {selectedNodeDetails.dropOffs.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Content Preview */}
            {selectedNodeDetails.previewText && (
              <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-1">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Conteúdo do Nó</div>
                <p className="text-xs text-[#1A1D21] font-medium">
                  {selectedNodeDetails.previewText}
                </p>
              </div>
            )}

            {/* AI Optimization Tip */}
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Recomendação de Otimização ManyFlow</span>
              </div>
              <p className="text-xs text-purple-950/80">
                {selectedNodeDetails.recommendation}
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedNodeDetails(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#1A1D21] cursor-pointer"
              >
                Fechar
              </button>
              {onOpenSimulator && (
                <button
                  onClick={() => {
                    setSelectedNodeDetails(null);
                    onOpenSimulator(activeFlowId);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0084FF] text-white text-xs font-bold hover:bg-blue-600 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Simular a partir deste nó</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
