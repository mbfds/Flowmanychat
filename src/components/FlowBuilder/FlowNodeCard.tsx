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
  BarChart2
} from 'lucide-react';
import { FlowNode, NodeType } from '../../types';

interface FlowNodeCardProps {
  node: FlowNode;
  isSelected: boolean;
  onSelect: (node: FlowNode) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (node: FlowNode) => void;
  onStartConnection?: (nodeId: string, handleType?: string, sourceHandleId?: string) => void;
}

export const FlowNodeCard: React.FC<FlowNodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onStartConnection
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
      className={`w-84 rounded-xl bg-white border shadow-sm transition-all duration-150 cursor-pointer select-none group ${
        isSelected
          ? 'border-[#0084FF] ring-2 ring-[#0084FF]/20 shadow-md scale-[1.01]'
          : 'border-[#E2E8F0] hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Node Header */}
      <div className={`px-4 py-3 flex items-center justify-between rounded-t-xl ${config.headerBg}`}>
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


