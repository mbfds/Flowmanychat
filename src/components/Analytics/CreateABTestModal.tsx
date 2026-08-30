import React, { useState } from 'react';
import {
  X,
  Split,
  Sparkles,
  Sliders,
  Target,
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Percent,
  TrendingUp,
  MessageSquare,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flow, FlowNode } from '../../types';

interface CreateABTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  flows: Flow[];
  currentFlowId?: string;
  onSaveTest: (updatedFlow: Flow) => void;
}

export const CreateABTestModal: React.FC<CreateABTestModalProps> = ({
  isOpen,
  onClose,
  flows,
  currentFlowId,
  onSaveTest
}) => {
  const [selectedFlowId, setSelectedFlowId] = useState<string>(
    currentFlowId || flows[0]?.id || ''
  );
  const [testTitle, setTestTitle] = useState('Teste A/B: Otimização de Boas-Vindas & Conversão');
  const [testGoal, setTestGoal] = useState<'ctr' | 'conversions' | 'lead_qualification'>('ctr');
  const [splitRatioA, setSplitRatioA] = useState<number>(50);

  // Variant A config
  const [variantAName, setVariantAName] = useState('Variante A: Oferta Imediata (Cupom 15% OFF)');
  const [variantADesc, setVariantADesc] = useState('Envia código promocional direto na primeira interação.');
  const [variantAText, setVariantAText] = useState(
    'Olá {first_name}! 🎁 Que bom ter você por aqui!\n\nLiberamos um cupom especial de **15% OFF** para o seu primeiro pedido: use **BEMVINDO15** no nosso site.'
  );
  const [variantABtn1, setVariantABtn1] = useState('🛍️ Usar Cupom Agora');
  const [variantABtn2, setVariantABtn2] = useState('💬 Falar com Especialista');

  // Variant B config
  const [variantBName, setVariantBName] = useState('Variante B: Menu Consultivo & Personalização');
  const [variantBDesc, setVariantBDesc] = useState('Oferece opções de navegação antes da oferta comercial.');
  const [variantBText, setVariantBText] = useState(
    'Olá {first_name}! 👋 É um prazer ter você conosco!\n\nComo podemos te ajudar a transformar seus resultados hoje? Escolha uma das opções abaixo:'
  );
  const [variantBBtn1, setVariantBBtn1] = useState('✨ Ver Catálogo & Preços');
  const [variantBBtn2, setVariantBBtn2] = useState('🎁 Resgatar Presente VIP');
  const [variantBBtn3, setVariantBBtn3] = useState('🛠️ Atendimento Humanizado');

  const [minSampleSize, setMinSampleSize] = useState<number>(300);
  const [confidenceLevelTarget, setConfidenceLevelTarget] = useState<number>(95);

  if (!isOpen) return null;

  const targetFlow = flows.find((f) => f.id === selectedFlowId) || flows[0];

  const handleCreate = () => {
    if (!targetFlow) return;

    const timestamp = Date.now();
    const splitNodeId = `node_ab_split_${timestamp}`;
    const variantANodeId = `node_msg_variant_a_${timestamp}`;
    const variantBNodeId = `node_msg_variant_b_${timestamp + 1}`;

    const triggerNode = targetFlow.nodes.find((n) => n.type === 'trigger') || targetFlow.nodes[0];

    const splitNode: FlowNode = {
      id: splitNodeId,
      type: 'ab_split',
      title: testTitle,
      data: {
        splitRatioA,
        splitRatioB: 100 - splitRatioA,
        variantAName,
        variantBName,
        variantADescription: variantADesc,
        variantBDescription: variantBDesc,
        testGoal,
        isTestActive: true,
        winnerVariant: null,
        autoPickWinner: true,
        minSampleSize,
        confidenceLevel: 95.0,
        testStartedAt: new Date().toISOString(),
        statsA: {
          runs: 0,
          opens: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          conversionRate: 0
        },
        statsB: {
          runs: 0,
          opens: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          conversionRate: 0
        }
      },
      position: {
        x: triggerNode ? triggerNode.position.x + 360 : 380,
        y: triggerNode ? triggerNode.position.y : 160
      }
    };

    const variantANode: FlowNode = {
      id: variantANodeId,
      type: 'message',
      title: variantAName,
      data: {
        text: variantAText,
        buttons: [
          { id: `btn_a_1_${timestamp}`, text: variantABtn1, type: 'url', value: 'https://seusite.com/ofertas' },
          ...(variantABtn2 ? [{ id: `btn_a_2_${timestamp}`, text: variantABtn2, type: 'flow' as const }] : [])
        ]
      },
      position: {
        x: splitNode.position.x + 380,
        y: splitNode.position.y - 120
      }
    };

    const variantBNode: FlowNode = {
      id: variantBNodeId,
      type: 'message',
      title: variantBName,
      data: {
        text: variantBText,
        buttons: [
          { id: `btn_b_1_${timestamp}`, text: variantBBtn1, type: 'flow' },
          ...(variantBBtn2 ? [{ id: `btn_b_2_${timestamp}`, text: variantBBtn2, type: 'flow' as const }] : []),
          ...(variantBBtn3 ? [{ id: `btn_b_3_${timestamp}`, text: variantBBtn3, type: 'flow' as const }] : [])
        ]
      },
      position: {
        x: splitNode.position.x + 380,
        y: splitNode.position.y + 140
      }
    };

    // Construct connections
    const remainingConnections = targetFlow.connections.filter(
      (c) => c.fromNodeId !== triggerNode?.id
    );

    const newConnections = [
      ...remainingConnections,
      {
        fromNodeId: triggerNode?.id || 'trigger',
        toNodeId: splitNodeId,
        handleType: 'default' as const
      },
      {
        fromNodeId: splitNodeId,
        toNodeId: variantANodeId,
        handleType: 'variant_a' as const,
        label: `Variante A (${splitRatioA}%)`
      },
      {
        fromNodeId: splitNodeId,
        toNodeId: variantBNodeId,
        handleType: 'variant_b' as const,
        label: `Variante B (${100 - splitRatioA}%)`
      }
    ];

    const updatedFlow: Flow = {
      ...targetFlow,
      nodes: [...targetFlow.nodes, splitNode, variantANode, variantBNode],
      connections: newConnections,
      updatedAt: new Date().toISOString()
    };

    onSaveTest(updatedFlow);

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    onClose();
  };

  return (
    <div
      id="create_ab_test_modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#1A1D21]">
                  Criar Novo Teste A/B de Fluxo
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200">
                  Divisor Estatístico
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Divida o tráfego de novos contatos entre duas mensagens ou caminhos distintos para descobrir a abordagem mais lucrativa.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 text-[#64748B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Target Flow Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Selecionar Fluxo para Aplicação do Teste</span>
            </label>
            <select
              value={selectedFlowId}
              onChange={(e) => setSelectedFlowId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1A1D21] focus:ring-2 focus:ring-[#0084FF] focus:outline-none cursor-pointer"
            >
              {flows.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} ({f.channel.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Test Name & Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
                Nome do Teste A/B
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1A1D21] focus:ring-2 focus:ring-[#0084FF] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>Métrica de Vitória (Objetivo)</span>
              </label>
              <select
                value={testGoal}
                onChange={(e) => setTestGoal(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1A1D21] focus:ring-2 focus:ring-[#0084FF] focus:outline-none cursor-pointer"
              >
                <option value="ctr">Maior Taxa de Cliques (CTR em Botões)</option>
                <option value="conversions">Maior Conversão Final & Vendas</option>
                <option value="lead_qualification">Maior Qualificação de Leads</option>
              </select>
            </div>
          </div>

          {/* Split Ratio Slider */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/60 via-fuchsia-50/60 to-purple-50/60 border border-fuchsia-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-fuchsia-600" />
                <span>Divisão Proporcional de Tráfego</span>
              </label>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Variante A: {splitRatioA}%</span>
                <span className="text-gray-400">×</span>
                <span className="text-purple-800 bg-purple-100 px-2 py-0.5 rounded">Variante B: {100 - splitRatioA}%</span>
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={splitRatioA}
              onChange={(e) => setSplitRatioA(Number(e.target.value))}
              className="w-full accent-fuchsia-600 cursor-pointer"
            />

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSplitRatioA(50)}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  splitRatioA === 50
                    ? 'bg-fuchsia-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-gray-100 border border-[#E2E8F0] text-gray-700'
                }`}
              >
                50% / 50% (Padrão)
              </button>
              <button
                type="button"
                onClick={() => setSplitRatioA(70)}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  splitRatioA === 70
                    ? 'bg-fuchsia-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-gray-100 border border-[#E2E8F0] text-gray-700'
                }`}
              >
                70% / 30%
              </button>
              <button
                type="button"
                onClick={() => setSplitRatioA(80)}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  splitRatioA === 80
                    ? 'bg-fuchsia-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-gray-100 border border-[#E2E8F0] text-gray-700'
                }`}
              >
                80% / 20%
              </button>
            </div>
          </div>

          {/* Side-by-Side Variations Definition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            
            {/* Variant A Box */}
            <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/20 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Variante A ({splitRatioA}%)</span>
                </span>
                <span className="text-[10px] font-bold text-amber-700 uppercase">Mensagem 1</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Título / Hipótese:</label>
                <input
                  type="text"
                  value={variantAName}
                  onChange={(e) => setVariantAName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#1A1D21] focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Texto da Mensagem (Direct):</label>
                <textarea
                  rows={4}
                  value={variantAText}
                  onChange={(e) => setVariantAText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1A1D21] focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-700">Botões de Ação:</label>
                <input
                  type="text"
                  value={variantABtn1}
                  onChange={(e) => setVariantABtn1(e.target.value)}
                  placeholder="Botão 1 (Ex: 🛍️ Usar Cupom)"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1A1D21]"
                />
                <input
                  type="text"
                  value={variantABtn2}
                  onChange={(e) => setVariantABtn2(e.target.value)}
                  placeholder="Botão 2 (Opcional)"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1A1D21]"
                />
              </div>
            </div>

            {/* Variant B Box */}
            <div className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50/20 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>Variante B ({100 - splitRatioA}%)</span>
                </span>
                <span className="text-[10px] font-bold text-purple-700 uppercase">Mensagem 2</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Título / Hipótese:</label>
                <input
                  type="text"
                  value={variantBName}
                  onChange={(e) => setVariantBName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#1A1D21] focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Texto da Mensagem (Direct):</label>
                <textarea
                  rows={4}
                  value={variantBText}
                  onChange={(e) => setVariantBText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1A1D21] focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-700">Botões de Ação:</label>
                <input
                  type="text"
                  value={variantBBtn1}
                  onChange={(e) => setVariantBBtn1(e.target.value)}
                  placeholder="Botão 1 (Ex: ✨ Ver Catálogo)"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1A1D21]"
                />
                <input
                  type="text"
                  value={variantBBtn2}
                  onChange={(e) => setVariantBBtn2(e.target.value)}
                  placeholder="Botão 2 (Ex: 🎁 Resgatar VIP)"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1A1D21]"
                />
                <input
                  type="text"
                  value={variantBBtn3}
                  onChange={(e) => setVariantBBtn3(e.target.value)}
                  placeholder="Botão 3 (Opcional)"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1A1D21]"
                />
              </div>
            </div>

          </div>

          {/* Sample Size & Statistical Significance settings */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-[#64748B]">
                Amostra mínima para cálculo de significância: <strong className="text-[#1A1D21]">{minSampleSize} interações</strong> (95% confiança).
              </span>
            </div>

            <span className="text-emerald-700 font-bold flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Roteamento Dinâmico Automático
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Split className="w-4 h-4" />
            <span>Publicar Teste A/B no Fluxo</span>
          </button>
        </div>

      </div>
    </div>
  );
};
