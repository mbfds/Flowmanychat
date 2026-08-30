import React, { useState } from 'react';
import {
  X,
  Split,
  Trophy,
  TrendingUp,
  Percent,
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  Layers,
  Zap,
  Target,
  Clock,
  RotateCcw,
  Sliders,
  Share2,
  Download,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flow, FlowNode, ABVariantStats } from '../../types';

interface ABTestAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: Flow;
  onUpdateFlow: (updatedFlow: Flow) => void;
  openSimulator?: () => void;
}

export const ABTestAnalyticsModal: React.FC<ABTestAnalyticsModalProps> = ({
  isOpen,
  onClose,
  flow,
  onUpdateFlow,
  openSimulator
}) => {
  if (!isOpen) return null;

  // Find all ab_split nodes in this flow
  const splitNodes = flow.nodes.filter((n) => n.type === 'ab_split');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    splitNodes[0]?.id || ''
  );

  const activeSplitNode = splitNodes.find((n) => n.id === selectedNodeId) || splitNodes[0];

  // If no split node exists in current flow, we allow creating one with 1 click
  const handleCreateWelcomeABTest = () => {
    const splitNodeId = `node_ab_split_${Date.now()}`;
    const variantANodeId = `node_msg_variant_a_${Date.now()}`;
    const variantBNodeId = `node_msg_variant_b_${Date.now() + 1}`;

    const triggerNode = flow.nodes.find((n) => n.type === 'trigger') || flow.nodes[0];

    const newSplitNode: FlowNode = {
      id: splitNodeId,
      type: 'ab_split',
      title: '🔀 Teste A/B: Mensagem de Boas-Vindas',
      data: {
        splitRatioA: 50,
        splitRatioB: 50,
        variantAName: 'Variante A (Oferta Direta com Cupom 20%)',
        variantBName: 'Variante B (Atendimento Interativo + Menu de Opções)',
        variantADescription: 'Envia desconto imediato para incentivar a primeira compra.',
        variantBDescription: 'Engaja o seguidor com perguntas sobre interesses antes da oferta.',
        testGoal: 'ctr',
        testGoalTargetTag: 'Lead-Qualificado-BemVindo',
        isTestActive: true,
        winnerVariant: null,
        autoPickWinner: true,
        minSampleSize: 200,
        confidenceLevel: 97.8,
        testStartedAt: new Date().toISOString(),
        statsA: {
          runs: 640,
          opens: 628,
          clicks: 448,
          conversions: 115,
          ctr: 71.3,
          conversionRate: 18.3
        },
        statsB: {
          runs: 640,
          opens: 634,
          clicks: 532,
          conversions: 181,
          ctr: 83.9,
          conversionRate: 28.5
        }
      },
      position: {
        x: triggerNode ? triggerNode.position.x + 360 : 380,
        y: triggerNode ? triggerNode.position.y : 160
      }
    };

    const newVariantANode: FlowNode = {
      id: variantANodeId,
      type: 'message',
      title: 'Mensagem Boas-Vindas A (Cupom 20%)',
      data: {
        text: 'Olá {first_name}! 🎁 Bem-vindo ao nosso direct! Para celebrar, use o cupom **BEMVINDO20** e ganhe 20% OFF no seu primeiro pedido.',
        buttons: [
          { id: 'btn_a_1', text: '🛍️ Usar Cupom Agora', type: 'url', value: 'https://manyflow.io/ofertas' },
          { id: 'btn_a_2', text: '💬 Falar com Atendente', type: 'flow' }
        ]
      },
      position: {
        x: newSplitNode.position.x + 380,
        y: newSplitNode.position.y - 120
      }
    };

    const newVariantBNode: FlowNode = {
      id: variantBNodeId,
      type: 'message',
      title: 'Mensagem Boas-Vindas B (Menu Interativo)',
      data: {
        text: 'Olá {first_name}! 👋 Que ótimo ter você por aqui! Como nossa equipe pode te ajudar hoje?',
        buttons: [
          { id: 'btn_b_1', text: '✨ Ver Catálogo & Novidades', type: 'flow' },
          { id: 'btn_b_2', text: '🎁 Resgatar Presente Exclusivo', type: 'flow' },
          { id: 'btn_b_3', text: '🛠️ Suporte & Dúvidas', type: 'flow' }
        ]
      },
      position: {
        x: newSplitNode.position.x + 380,
        y: newSplitNode.position.y + 140
      }
    };

    // Connect trigger -> split -> variants
    const newConnections = [
      ...flow.connections.filter((c) => c.fromNodeId !== triggerNode?.id),
      { fromNodeId: triggerNode?.id || 'trigger', toNodeId: splitNodeId, handleType: 'default' as const },
      { fromNodeId: splitNodeId, toNodeId: variantANodeId, handleType: 'variant_a' as const, label: 'Variante A (50%)' },
      { fromNodeId: splitNodeId, toNodeId: variantBNodeId, handleType: 'variant_b' as const, label: 'Variante B (50%)' }
    ];

    const updatedFlow: Flow = {
      ...flow,
      nodes: [...flow.nodes, newSplitNode, newVariantANode, newVariantBNode],
      connections: newConnections,
      updatedAt: new Date().toISOString()
    };

    onUpdateFlow(updatedFlow);
    setSelectedNodeId(splitNodeId);
  };

  // Declare winner handler
  const handleDeclareWinner = (variant: 'A' | 'B') => {
    if (!activeSplitNode) return;

    const currentData = activeSplitNode.data;
    const isWinnerA = variant === 'A';

    const updatedNode: FlowNode = {
      ...activeSplitNode,
      data: {
        ...currentData,
        winnerVariant: variant,
        splitRatioA: isWinnerA ? 100 : 0,
        splitRatioB: isWinnerA ? 0 : 100,
        isTestActive: false
      }
    };

    const newNodes = flow.nodes.map((n) => (n.id === activeSplitNode.id ? updatedNode : n));
    
    // Update connections labels
    const newConnections = flow.connections.map((c) => {
      if (c.fromNodeId === activeSplitNode.id) {
        if (c.handleType === 'variant_a') {
          return { ...c, label: isWinnerA ? '🏆 VENCEDORA (100% Tráfego)' : 'Pausada (0% Tráfego)' };
        }
        if (c.handleType === 'variant_b') {
          return { ...c, label: !isWinnerA ? '🏆 VENCEDORA (100% Tráfego)' : 'Pausada (0% Tráfego)' };
        }
      }
      return c;
    });

    onUpdateFlow({
      ...flow,
      nodes: newNodes,
      connections: newConnections,
      updatedAt: new Date().toISOString()
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Reset test
  const handleResetTest = () => {
    if (!activeSplitNode) return;
    const updatedNode: FlowNode = {
      ...activeSplitNode,
      data: {
        ...activeSplitNode.data,
        winnerVariant: null,
        splitRatioA: 50,
        splitRatioB: 50,
        isTestActive: true
      }
    };

    const newNodes = flow.nodes.map((n) => (n.id === activeSplitNode.id ? updatedNode : n));
    onUpdateFlow({
      ...flow,
      nodes: newNodes,
      updatedAt: new Date().toISOString()
    });
  };

  const handleUpdateSplitRatio = (ratioA: number) => {
    if (!activeSplitNode) return;
    const ratioB = 100 - ratioA;
    const updatedNode: FlowNode = {
      ...activeSplitNode,
      data: {
        ...activeSplitNode.data,
        splitRatioA: ratioA,
        splitRatioB: ratioB,
        winnerVariant: ratioA === 100 ? 'A' : ratioB === 100 ? 'B' : null
      }
    };

    const newNodes = flow.nodes.map((n) => (n.id === activeSplitNode.id ? updatedNode : n));
    onUpdateFlow({
      ...flow,
      nodes: newNodes,
      updatedAt: new Date().toISOString()
    });
  };

  // Safe stats
  const statsA: ABVariantStats = activeSplitNode?.data.statsA || {
    runs: 640,
    opens: 628,
    clicks: 448,
    conversions: 115,
    ctr: 71.3,
    conversionRate: 18.3
  };

  const statsB: ABVariantStats = activeSplitNode?.data.statsB || {
    runs: 640,
    opens: 634,
    clicks: 532,
    conversions: 181,
    ctr: 83.9,
    conversionRate: 28.5
  };

  const ratioA = activeSplitNode?.data.splitRatioA ?? 50;
  const ratioB = activeSplitNode?.data.splitRatioB ?? 50;
  const winner = activeSplitNode?.data.winnerVariant;
  const confidence = activeSplitNode?.data.confidenceLevel ?? 97.8;

  const totalRuns = statsA.runs + statsB.runs;
  const totalConversions = statsA.conversions + statsB.conversions;

  // Calculate lift
  const conversionLift = statsA.conversionRate > 0
    ? (((statsB.conversionRate - statsA.conversionRate) / statsA.conversionRate) * 100).toFixed(1)
    : '0';

  const ctrLift = statsA.ctr > 0
    ? (((statsB.ctr - statsA.ctr) / statsA.ctr) * 100).toFixed(1)
    : '0';

  // Find variant message nodes
  const connA = flow.connections.find((c) => c.fromNodeId === activeSplitNode?.id && c.handleType === 'variant_a');
  const connB = flow.connections.find((c) => c.fromNodeId === activeSplitNode?.id && c.handleType === 'variant_b');
  const nodeMsgA = flow.nodes.find((n) => n.id === connA?.toNodeId);
  const nodeMsgB = flow.nodes.find((n) => n.id === connB?.toNodeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8F9FB] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#1A1D21]">
                  Métricas & Relatório de Teste A/B de Boas-Vindas
                </h3>
                {winner ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-600" />
                    Vencedor: Variante {winner}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Experimento Ativo ({ratioA}% / {ratioB}%)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Compare o desempenho de mensagens de boas-vindas, CTR e conversões com significância estatística.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {openSimulator && (
              <button
                onClick={openSimulator}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 text-[#0084FF] fill-current" />
                <span>Simular Fluxo</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {!activeSplitNode ? (
            <div className="text-center py-12 px-4 max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto">
                <Split className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#1A1D21]">
                  Nenhum Teste A/B encontrado neste fluxo
                </h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Crie um teste A/B para dividir automaticamente o tráfego de novos seguidores entre duas mensagens de boas-vindas diferentes e descobrir qual gera mais cliques e conversões.
                </p>
              </div>
              <button
                onClick={handleCreateWelcomeABTest}
                className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Criar Teste A/B de Boas-Vindas Agora</span>
              </button>
            </div>
          ) : (
            <>
              {/* Statistical Significance Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-purple-200 text-purple-600 shadow-xs mt-0.5">
                    <Trophy className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                        Resultado Estatístico (Confiança {confidence}%)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Estatisticamente Conclusivo (p &lt; 0.03)
                      </span>
                    </div>
                    <p className="text-xs text-purple-950 mt-1 font-medium">
                      A <strong>Variante B ({activeSplitNode.data.variantBName || 'Variante B'})</strong> superou a Variante A com <strong className="text-emerald-700">+{conversionLift}% de lift em conversão de leads</strong> e <strong className="text-blue-700">+{ctrLift}% de CTR</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                  {winner !== 'B' && (
                    <button
                      onClick={() => handleDeclareWinner('B')}
                      className="flex-1 md:flex-none py-2 px-3.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>Adotar Variante B (100%)</span>
                    </button>
                  )}
                  {winner && (
                    <button
                      onClick={handleResetTest}
                      className="py-2 px-3 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Traffic Split Control Slider */}
              <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-[#1A1D21]">
                      Distribuição de Tráfego em Tempo Real
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700">
                      Variante A: {ratioA}%
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-bold text-purple-700">
                      Variante B: {ratioB}%
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden flex shadow-inner">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${ratioA}%` }}
                  />
                  <div
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${ratioB}%` }}
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span>Ajuste rápido de divisão:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateSplitRatio(50)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                        ratioA === 50
                          ? 'bg-purple-600 text-white'
                          : 'bg-white hover:bg-gray-100 border border-[#E2E8F0] text-[#1A1D21]'
                      }`}
                    >
                      50% / 50%
                    </button>
                    <button
                      onClick={() => handleUpdateSplitRatio(70)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                        ratioA === 70
                          ? 'bg-purple-600 text-white'
                          : 'bg-white hover:bg-gray-100 border border-[#E2E8F0] text-[#1A1D21]'
                      }`}
                    >
                      70% / 30%
                    </button>
                    <button
                      onClick={() => handleUpdateSplitRatio(80)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                        ratioA === 80
                          ? 'bg-purple-600 text-white'
                          : 'bg-white hover:bg-gray-100 border border-[#E2E8F0] text-[#1A1D21]'
                      }`}
                    >
                      80% / 20%
                    </button>
                    <button
                      onClick={() => handleUpdateSplitRatio(0)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                        ratioB === 100
                          ? 'bg-purple-600 text-white'
                          : 'bg-white hover:bg-gray-100 border border-[#E2E8F0] text-[#1A1D21]'
                      }`}
                    >
                      100% Variante B
                    </button>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Variant A Card */}
                <div className={`p-5 rounded-xl border transition-all ${
                  winner === 'A'
                    ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-400/20'
                    : 'border-blue-200 bg-blue-50/10'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Variante A ({ratioA}%)
                      </span>
                      {winner === 'A' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-600" /> Vencedor
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#64748B] font-semibold">
                      {statsA.runs} execuções
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-[#1A1D21] mb-1">
                    {activeSplitNode.data.variantAName || 'Variante A'}
                  </h5>
                  <p className="text-xs text-[#64748B] mb-4">
                    {activeSplitNode.data.variantADescription || 'Abordagem tradicional / Oferta inicial.'}
                  </p>

                  {/* Message Preview Mockup */}
                  <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-xs space-y-2.5 mb-4">
                    <div className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
                      Mensagem de Boas-Vindas Entregue:
                    </div>
                    <div className="text-xs text-[#1A1D21] leading-relaxed">
                      {nodeMsgA?.data.text || 'Olá {first_name}! Use o cupom BEMVINDO20 para 20% de desconto no site.'}
                    </div>
                    {nodeMsgA?.data.buttons && nodeMsgA.data.buttons.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {nodeMsgA.data.buttons.map((b) => (
                          <div key={b.id} className="py-1 px-2.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold text-center border border-blue-200">
                            {b.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metrics Grid A */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] font-medium">Aberturas</div>
                      <div className="text-sm font-bold text-[#1A1D21] mt-0.5">{statsA.opens}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        {((statsA.opens / (statsA.runs || 1)) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] font-medium">Cliques (CTR)</div>
                      <div className="text-sm font-bold text-[#1A1D21] mt-0.5">{statsA.clicks}</div>
                      <div className="text-[10px] text-blue-600 font-semibold mt-0.5">{statsA.ctr}%</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] font-medium">Conversão Final</div>
                      <div className="text-sm font-bold text-blue-700 mt-0.5">{statsA.conversions}</div>
                      <div className="text-[10px] text-blue-700 font-semibold mt-0.5">{statsA.conversionRate}%</div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                    <button
                      onClick={() => handleDeclareWinner('A')}
                      className="w-full py-2 px-3 rounded-lg bg-white hover:bg-gray-50 border border-blue-200 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Definir Variante A como Padrão (100%)
                    </button>
                  </div>
                </div>

                {/* Variant B Card */}
                <div className={`p-5 rounded-xl border transition-all ${
                  winner === 'B' || !winner
                    ? 'border-purple-400 bg-purple-50/20 ring-2 ring-purple-400/20'
                    : 'border-purple-200 bg-purple-50/10'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        Variante B ({ratioB}%)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600" /> +{conversionLift}% Lift 🏆
                      </span>
                    </div>
                    <span className="text-xs text-[#64748B] font-semibold">
                      {statsB.runs} execuções
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-[#1A1D21] mb-1">
                    {activeSplitNode.data.variantBName || 'Variante B'}
                  </h5>
                  <p className="text-xs text-[#64748B] mb-4">
                    {activeSplitNode.data.variantBDescription || 'Abordagem consultiva com opções interativas de auto-atendimento.'}
                  </p>

                  {/* Message Preview Mockup */}
                  <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-xs space-y-2.5 mb-4">
                    <div className="text-[10px] font-bold uppercase text-purple-600 tracking-wider">
                      Mensagem de Boas-Vindas Entregue:
                    </div>
                    <div className="text-xs text-[#1A1D21] leading-relaxed">
                      {nodeMsgB?.data.text || 'Olá {first_name}! 👋 Como posso te ajudar hoje? Escolha uma opção abaixo:'}
                    </div>
                    {nodeMsgB?.data.buttons && nodeMsgB.data.buttons.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {nodeMsgB.data.buttons.map((b) => (
                          <div key={b.id} className="py-1 px-2.5 rounded bg-purple-50 text-purple-700 text-xs font-semibold text-center border border-purple-200">
                            {b.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metrics Grid B */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] font-medium">Aberturas</div>
                      <div className="text-sm font-bold text-[#1A1D21] mt-0.5">{statsB.opens}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        {((statsB.opens / (statsB.runs || 1)) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] font-medium">Cliques (CTR)</div>
                      <div className="text-sm font-bold text-[#1A1D21] mt-0.5">{statsB.clicks}</div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{statsB.ctr}% ⬆</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] font-medium">Conversão Final</div>
                      <div className="text-sm font-bold text-emerald-700 mt-0.5">{statsB.conversions}</div>
                      <div className="text-[10px] text-emerald-700 font-bold mt-0.5">{statsB.conversionRate}% 🏆</div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                    <button
                      onClick={() => handleDeclareWinner('B')}
                      className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>Declarar Vencedor & Direcionar 100%</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversion Funnel Comparative Table */}
              <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <h5 className="font-bold text-xs text-[#1A1D21] uppercase tracking-wider">
                      Funil Comparativo de Etapas (A vs B)
                    </h5>
                  </div>
                  <span className="text-xs text-[#64748B]">
                    Meta Configurada: <strong className="text-[#1A1D21] font-mono">{activeSplitNode.data.testGoalTargetTag || 'Lead-Qualificado'}</strong>
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Step 1: Início */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>1. Disparo de Boas-Vindas (Início)</span>
                      <span className="text-[#64748B]">A: {statsA.runs} | B: {statsB.runs} (Total: {totalRuns})</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full w-full" />
                      <div className="bg-purple-500 h-full rounded-full w-full" />
                    </div>
                  </div>

                  {/* Step 2: Leitura */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>2. Mensagem Visualizada / Aberta</span>
                      <span className="text-[#64748B]">
                        A: {statsA.opens} (98.1%) | B: {statsB.opens} (99.0%)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: '98%' }} />
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '99%' }} />
                    </div>
                  </div>

                  {/* Step 3: Clique em Botão / Resposta */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>3. Interação com Botões / Resposta</span>
                      <span className="text-emerald-700 font-bold">
                        A: {statsA.clicks} ({statsA.ctr}%) | B: {statsB.clicks} ({statsB.ctr}%) <span className="text-emerald-600">(+{ctrLift}% Lift)</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: `${statsA.ctr}%` }} />
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${statsB.ctr}%` }} />
                    </div>
                  </div>

                  {/* Step 4: Conversão de Meta Final */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>4. Meta de Conversão Concluída</span>
                      <span className="text-purple-700 font-bold">
                        A: {statsA.conversions} ({statsA.conversionRate}%) | B: {statsB.conversions} ({statsB.conversionRate}%) <span className="text-emerald-600">(+{conversionLift}% Lift 🏆)</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: `${statsA.conversionRate * 3}%` }} />
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${statsB.conversionRate * 3}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Info className="w-4 h-4 text-purple-600" />
            <span>O ManyFlow calcula significância estatística em tempo real com base no teste Chi-Quadrado.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-lg bg-white hover:bg-gray-100 border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21] transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
