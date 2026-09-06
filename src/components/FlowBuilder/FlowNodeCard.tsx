import React from 'react';
import { 
  Zap, 
  MessageSquare, 
  Split, 
  Tag, 
  Sparkles, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Copy, 
  Settings2,
  ChevronRight,
  ArrowRight,
  Bot,
  Trophy,
  Percent,
  TrendingUp,
  TrendingDown,
  BarChart2, 
  Smartphone,
  AlertTriangle,
  Check,
  Activity,
  Target
} from 'lucide-react';
import { FlowNode, NodeType } from '../../types';

export interface NodePerformanceData {
  traversalCount: number;
  traversalRate: number; // percentage e.g. 94.2%
  dropoffRate: number;   // percentage e.g. 5.8%
  conversionRate: number; // percentage e.g. 78.4%
  avgResponseTimeSec?: number;
  status?: 'optimal' | 'good' | 'warning' | 'critical';
}

interface FlowNodeCardProps {
  node: FlowNode;
  isSelected: boolean;
  isMultiSelected?: boolean;
  onSelect: (node: FlowNode) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (node: FlowNode) => void;
  onStartConnection?: (nodeId: string, handleType?: string, sourceHandleId?: string) => void;
  isAuditActive?: boolean;
  isOrphan?: boolean;
  orphanReason?: string;
  incomingCount?: number;
  outgoingCount?: number;
  isPerformanceActive?: boolean;
  performanceData?: NodePerformanceData;
}

export const FlowNodeCard: React.FC<FlowNodeCardProps> = ({
  node,
  isSelected,
  isMultiSelected = false,
  onSelect,
  onDelete,
  onDuplicate,
  onStartConnection,
  isAuditActive = false,
  isOrphan = false,
  orphanReason,
  incomingCount = 0,
  outgoingCount = 0,
  isPerformanceActive = false,
  performanceData
}) => {
  const getNodeConfig = (type: NodeType) => {
    switch (type) {
      case 'trigger':
        return {
          icon: Zap,
          headerBg: 'bg-amber-50 text-amber-800 border-b border-amber-100',
          iconBg: 'bg-amber-100 text-amber-700',
          badgeText: 'Gatilho de Início',
          badgeClass: 'bg-amber-100 text-amber-800'
        };
      case 'message':
        return {
          icon: MessageSquare,
          headerBg: 'bg-blue-50 text-blue-800 border-b border-blue-100',
          iconBg: 'bg-blue-100 text-blue-700',
          badgeText: 'Mensagem Direct',
          badgeClass: 'bg-blue-100 text-blue-800'
        };
      case 'condition':
        return {
          icon: Split,
          headerBg: 'bg-cyan-50 text-cyan-800 border-b border-cyan-100',
          iconBg: 'bg-cyan-100 text-cyan-700',
          badgeText: 'Condição Lógica',
          badgeClass: 'bg-cyan-100 text-cyan-800'
        };
      case 'action':
        return {
          icon: Tag,
          headerBg: 'bg-emerald-50 text-emerald-800 border-b border-emerald-100',
          iconBg: 'bg-emerald-100 text-emerald-700',
          badgeText: 'Ação no CRM',
          badgeClass: 'bg-emerald-100 text-emerald-800'
        };
      case 'ai_step':
        return {
          icon: Sparkles,
          headerBg: 'bg-purple-50 text-purple-800 border-b border-purple-100',
          iconBg: 'bg-purple-100 text-purple-700',
          badgeText: 'IA Gemini 2.5',
          badgeClass: 'bg-purple-100 text-purple-800'
        };
      case 'delay':
        return {
          icon: Clock,
          headerBg: 'bg-gray-50 text-gray-800 border-b border-gray-200',
          iconBg: 'bg-gray-200 text-gray-700',
          badgeText: 'Pausa & Digitando',
          badgeClass: 'bg-gray-100 text-gray-700'
        };
      case 'ab_split':
        return {
          icon: Split,
          headerBg: 'bg-fuchsia-50 text-fuchsia-900 border-b border-fuchsia-100',
          iconBg: 'bg-fuchsia-100 text-fuchsia-700',
          badgeText: 'Teste A/B Split',
          badgeClass: 'bg-fuchsia-100 text-fuchsia-800'
        };
    }
  };

  const config = getNodeConfig(node.type);
  const Icon = config.icon;

  const ratioA = node.data.splitRatioA ?? 50;
  const ratioB = node.data.splitRatioB ?? 50;
  const winner = node.data.winnerVariant;
  const statsA = node.data.statsA;
  const statsB = node.data.statsB;

  return (
    <div
      id={`flow_node_${node.id}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node);
      }}
      className={`w-84 rounded-xl bg-white border transition-all duration-150 cursor-pointer select-none group relative ${
        isMultiSelected
          ? 'border-blue-600 ring-4 ring-blue-500/30 shadow-2xl shadow-blue-500/20 scale-[1.015]'
          : isAuditActive && isOrphan
          ? 'border-amber-500 ring-4 ring-amber-400/50 shadow-2xl shadow-amber-500/20 scale-[1.02]'
          : isSelected
          ? 'border-[#0084FF] ring-2 ring-[#0084FF]/20 shadow-md scale-[1.01]'
          : isAuditActive
          ? 'border-[#E2E8F0] opacity-60 hover:opacity-100 hover:border-gray-300 hover:shadow-md'
          : 'border-[#E2E8F0] hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Multi-Selection Badge */}
      {isMultiSelected && (
        <div 
          id={`multiselect_badge_${node.id}`}
          className="absolute -top-2.5 -left-2.5 bg-blue-600 text-white rounded-full p-1 shadow-md border-2 border-white dark:border-slate-900 z-30 flex items-center justify-center animate-in zoom-in-75"
          title="Nó selecionado em grupo"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Flow Performance Overview - Metrics Overlay Directly On Top of Workflow Node */}
      {isPerformanceActive && performanceData && (
        <div 
          id={`node_performance_overlay_${node.id}`}
          className={`px-3 py-2 rounded-t-xl border-b text-xs font-sans shadow-inner transition-all ${
            performanceData.dropoffRate > 25
              ? 'bg-gradient-to-r from-rose-950/95 via-rose-900/90 to-slate-900 text-rose-100 border-rose-700/60'
              : performanceData.dropoffRate > 12
              ? 'bg-gradient-to-r from-amber-950/95 via-amber-900/90 to-slate-900 text-amber-100 border-amber-700/60'
              : 'bg-gradient-to-r from-slate-950/95 via-slate-900 to-indigo-950/90 text-slate-100 border-slate-700/60'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-300">Travessia:</span>
              <span className="text-white font-mono font-bold text-[11px]">{performanceData.traversalCount.toLocaleString()}</span>
              <span className="text-[10px] text-blue-300 font-mono font-bold">({performanceData.traversalRate}%)</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono flex items-center gap-0.5 ${
                performanceData.dropoffRate > 20
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                  : performanceData.dropoffRate > 10
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
              }`}>
                <TrendingDown className="w-3 h-3" />
                <span>-{performanceData.dropoffRate}% drop</span>
              </span>
            </div>
          </div>

          {/* Traversal Retention & Drop-off Bar */}
          <div className="w-full bg-slate-800/90 rounded-full h-1.5 overflow-hidden flex my-1">
            <div 
              className={`h-full transition-all duration-500 ${
                performanceData.traversalRate >= 80 
                  ? 'bg-emerald-400' 
                  : performanceData.traversalRate >= 50 
                  ? 'bg-blue-400' 
                  : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, performanceData.traversalRate))}%` }}
              title={`Taxa de Travessia: ${performanceData.traversalRate}%`}
            />
            <div 
              className="h-full bg-rose-500/80 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, performanceData.dropoffRate))}%` }}
              title={`Taxa de Abandono (Drop-off): ${performanceData.dropoffRate}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" />
              <span>Conversão: <strong className="text-emerald-300 font-mono font-bold">{performanceData.conversionRate}%</strong></span>
            </span>
            {performanceData.avgResponseTimeSec !== undefined && (
              <span className="font-mono text-slate-400">~{performanceData.avgResponseTimeSec}s latência</span>
            )}
          </div>
        </div>
      )}

      {/* Visual Audit Orphan Warning Bar */}
      {isAuditActive && isOrphan && (
        <div 
          id={`audit_orphan_badge_${node.id}`}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-t-xl flex items-center justify-between text-[11px] font-bold shadow-xs animate-pulse"
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Nó Órfão Desconectado</span>
          </span>
          <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono font-bold">
            {incomingCount} entrada • {outgoingCount} saída
          </span>
        </div>
      )}

      {/* Node Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${(isAuditActive && isOrphan) || (isPerformanceActive && performanceData) ? '' : 'rounded-t-xl'} ${config.headerBg}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-lg shrink-0 ${config.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#1A1D21] truncate">{node.title}</h4>
            <span className="text-[10px] font-semibold opacity-75">{config.badgeText}</span>
          </div>
        </div>

        {/* Action icons on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            title="Duplicar nó"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(node);
            }}
            className="p-1 rounded hover:bg-white/80 text-[#64748B] hover:text-[#1A1D21] cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {node.type !== 'trigger' && (
            <button
              title="Excluir nó"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-1 rounded hover:bg-rose-100 text-[#64748B] hover:text-rose-600 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Node Body Content */}
      <div className="p-4 space-y-3 bg-white">
        {/* Trigger Node Body */}
        {node.type === 'trigger' && (
          <div className="space-y-2">
            <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider">
              Palavras-chave ativadoras:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {node.data.keywords && node.data.keywords.length > 0 ? (
                node.data.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    "{kw}"
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#64748B] italic">
                  {node.data.text || 'Qualquer mensagem recebida'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Message Node Body */}
        {node.type === 'message' && (
          <div className="space-y-2.5">
            {node.data.isMessageABTestEnabled && (
              <div className="p-2 rounded-lg bg-gradient-to-r from-fuchsia-50 to-purple-50 border border-fuchsia-200/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-fuchsia-900 flex items-center gap-1">
                    <Split className="w-3 h-3 text-fuchsia-600" />
                    <span>Teste A/B Ativo</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-fuchsia-700 bg-white/80 px-1.5 py-0.5 rounded border border-fuchsia-200">
                    {node.data.messageVariants?.length || 2} Variações
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold">
                  {node.data.messageVariants && node.data.messageVariants.length > 0 ? (
                    node.data.messageVariants.map((v, i) => (
                      <div
                        key={v.id}
                        className={`flex-1 py-1 px-1.5 rounded text-center truncate ${
                          i === 0
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : i === 1
                            ? 'bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200'
                            : 'bg-purple-100 text-purple-900 border border-purple-200'
                        }`}
                      >
                        <span className="opacity-75">{v.name.slice(0, 10)}:</span>{' '}
                        <span>{v.trafficPercent}%</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex-1 py-1 px-1.5 rounded text-center bg-blue-100 text-blue-900 border border-blue-200">
                        Var A: 50%
                      </div>
                      <div className="flex-1 py-1 px-1.5 rounded text-center bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200">
                        Var B: 50%
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] leading-relaxed font-sans line-clamp-3">
              {node.data.text ? (
                node.data.text.split(/({[a-zA-Z_]+})/).map((part, idx) =>
                  part.startsWith('{') && part.endsWith('}') ? (
                    <span key={idx} className="font-semibold text-[#0084FF] bg-blue-50 px-1 rounded">
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )
              ) : (
                <span className="text-[#64748B] italic">Clique para escrever a mensagem...</span>
              )}
            </div>

            {/* Buttons list */}
            {node.data.buttons && node.data.buttons.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {node.data.buttons.map((btn) => (
                  <div
                    key={btn.id}
                    className="px-3 py-1.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs font-semibold text-[#0084FF] hover:bg-blue-100/70 transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{btn.text}</span>
                      {btn.type === 'url' ? (
                        <ExternalLink className="w-3 h-3 text-[#0084FF] shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#0084FF] shrink-0" />
                      )}
                    </div>

                    {/* Tag Badge on Button */}
                    {btn.assignTag && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-1.5 py-0.5 rounded w-fit">
                        <Tag className="w-2.5 h-2.5 shrink-0 text-emerald-600" />
                        <span className="truncate">+Tag: {btn.assignTag}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick replies preview */}
            {node.data.quickReplies && node.data.quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {node.data.quickReplies.map((qr) => (
                  <span
                    key={qr.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    <span>{qr.text}</span>
                    {qr.assignTag && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                        +{qr.assignTag}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Node Body */}
        {node.type === 'action' && (
          <div className="space-y-2">
            {(node.data.actionType === 'add_tag' || !node.data.actionType) && node.data.tagToAdd && (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Tag className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span className="truncate">Atribuir Tag: {node.data.tagToAdd}</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span>⚡ Sincronizado com Broadcast</span>
                </div>
              </div>
            )}
            {node.data.actionType === 'remove_tag' && node.data.tagToRemove && (
              <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg">
                <Tag className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span className="font-semibold truncate">Remover Tag: {node.data.tagToRemove}</span>
              </div>
            )}
            {node.data.actionType === 'human_handover' && (
              <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span className="font-semibold">Pausar Bot ➔ Fila Humana</span>
              </div>
            )}
            {node.data.actionType === 'send_sms_httpsms' && (
              <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 font-bold text-teal-800">
                    <Smartphone className="w-3 h-3 text-teal-600 shrink-0" />
                    <span>SMS (HttpSMS)</span>
                  </div>
                  <span className="text-[9px] font-mono bg-teal-200/80 text-teal-800 px-1 py-0.2 rounded font-bold">Android GSM</span>
                </div>
                <div className="text-[10px] text-teal-800 line-clamp-1 italic">
                  "{node.data.smsMessageText || 'Disparo SMS'}"
                </div>
                <div className="text-[9px] text-teal-600 font-mono truncate">
                  Para: {node.data.smsRecipientPhone || '{phone}'}
                </div>
              </div>
            )}
            {node.data.fieldToSet && (
              <div className="text-[11px] text-[#64748B]">
                Campo: <span className="text-[#1A1D21] font-mono">{node.data.fieldToSet}</span> = {node.data.fieldValue || 'definido'}
              </div>
            )}
          </div>
        )}

        {/* AI Step Body */}
        {node.type === 'ai_step' && (
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-200 text-xs text-purple-900 line-clamp-3">
              <div className="flex items-center gap-1.5 text-purple-700 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Instrução de Resposta IA:</span>
              </div>
              <span className="text-gray-700">{node.data.aiPrompt || 'Responde automaticamente com base nas FAQs da empresa.'}</span>
            </div>
          </div>
        )}

        {/* Delay Node Body */}
        {node.type === 'delay' && (
          <div className="flex items-center justify-between text-xs text-[#1A1D21] bg-[#F8F9FB] p-2.5 rounded-lg border border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#64748B]" />
              <span>Aguardar {node.data.delaySeconds || 2} segundos</span>
            </div>
            {node.data.showTypingIndicator && (
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0084FF] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#0084FF] animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#0084FF] animate-bounce delay-200" />
              </span>
            )}
          </div>
        )}

        {/* Condition Node Body */}
        {node.type === 'condition' && (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] font-mono text-[11px]">
              IF {node.data.conditionKey || 'tag'} == "{node.data.conditionValue || 'VIP'}"
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-center font-bold text-[10px]">
                ✓ VERDADEIRO
              </div>
              <div className="p-1.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-center font-bold text-[10px]">
                ✕ FALSO
              </div>
            </div>
          </div>
        )}

        {/* A/B Split Test Node Body */}
        {node.type === 'ab_split' && (
          <div className="space-y-3">
            {/* Split Distribution Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-blue-700">Variante A: {ratioA}%</span>
                <span className="text-fuchsia-700">Variante B: {ratioB}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-200 flex overflow-hidden shadow-inner">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${ratioA}%` }}
                />
                <div
                  className="bg-fuchsia-500 h-full transition-all duration-300"
                  style={{ width: `${ratioB}%` }}
                />
              </div>
            </div>

            {/* Side-by-Side Mini Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {/* Branch A Mini Box */}
              <div className={`p-2 rounded-lg border text-left space-y-1 ${
                winner === 'A'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-blue-50/50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-800">Caminho A</span>
                  {winner === 'A' && <Trophy className="w-3 h-3 text-amber-600" />}
                </div>
                <div className="text-[11px] font-bold text-[#1A1D21] truncate">
                  {node.data.variantAName || 'Mensagem A'}
                </div>
                {statsA && (
                  <div className="text-[10px] text-[#64748B]">
                    CTR: <strong className="text-blue-700">{statsA.ctr}%</strong> • Conv: <strong className="text-blue-700">{statsA.conversionRate}%</strong>
                  </div>
                )}
              </div>

              {/* Branch B Mini Box */}
              <div className={`p-2 rounded-lg border text-left space-y-1 ${
                winner === 'B'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-fuchsia-50/50 border-fuchsia-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-fuchsia-800">Caminho B</span>
                  {(winner === 'B' || (!winner && (statsB?.conversionRate || 0) > (statsA?.conversionRate || 0))) && (
                    <span className="text-[9px] font-bold px-1 rounded bg-emerald-100 text-emerald-800">🏆 Líder</span>
                  )}
                </div>
                <div className="text-[11px] font-bold text-[#1A1D21] truncate">
                  {node.data.variantBName || 'Mensagem B'}
                </div>
                {statsB && (
                  <div className="text-[10px] text-[#64748B]">
                    CTR: <strong className="text-fuchsia-700">{statsB.ctr}%</strong> • Conv: <strong className="text-emerald-700">{statsB.conversionRate}%</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics Footer */}
            <div className="p-2 rounded-lg bg-purple-50/80 border border-purple-200 flex items-center justify-between text-[11px]">
              <span className="text-purple-900 font-semibold flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5 text-purple-600" />
                Significância: <strong>{node.data.confidenceLevel ?? 97.8}%</strong>
              </span>
              <span className="text-emerald-700 font-bold">
                +55.1% Lift em B
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Connect Port Action */}
      <div className="px-4 py-2 border-t border-[#E2E8F0] bg-[#F8F9FB] rounded-b-xl flex items-center justify-between text-[11px] text-[#64748B]">
        <span className="flex items-center gap-1 hover:text-[#0084FF]">
          <Settings2 className="w-3 h-3" /> Clique para editar
        </span>
        <div className="flex items-center gap-1 text-[#0084FF] font-semibold">
          <span>{node.type === 'ab_split' ? '2 Variações' : 'Próximo Passo'}</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};


