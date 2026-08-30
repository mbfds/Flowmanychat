import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Tag,
  Mail,
  Phone,
  MousePointerClick,
  Sparkles,
  UserCheck,
  Radio,
  FileText,
  Sliders,
  RotateCcw,
  Check,
  X,
  Workflow
} from 'lucide-react';
import { DEFAULT_SCORING_RULES, ScoringRuleConfig } from '../../utils/leadScoring';

interface LeadScoringRulesModalProps {
  currentRules: ScoringRuleConfig;
  onSaveRules: (rules: ScoringRuleConfig) => void;
  onClose: () => void;
}

export const LeadScoringRulesModal: React.FC<LeadScoringRulesModalProps> = ({
  currentRules,
  onSaveRules,
  onClose
}) => {
  const [rules, setRules] = useState<ScoringRuleConfig>({ ...currentRules });
  const [isSaved, setIsSaved] = useState(false);

  const handleResetDefaults = () => {
    setRules({ ...DEFAULT_SCORING_RULES });
  };

  const handleSave = () => {
    onSaveRules(rules);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" id="lead_scoring_rules_modal">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] bg-gradient-to-r from-orange-50/50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1D21]">Regras de Lead Scoring</h3>
              <p className="text-xs text-[#64748B]">Personalize os pesos e pontuação atribuídos às interações</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Section: Engajamento & Cliques */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-[#0084FF]" />
              <span>Engajamento & Cliques em Mensagens</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-1">
                <label className="text-xs font-bold text-[#1A1D21]">Clique em Botão / Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rules.buttonClickPoints}
                    onChange={(e) => setRules({ ...rules, buttonClickPoints: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-white border border-[#E2E8F0] text-xs font-bold text-[#1A1D21]"
                  />
                  <span className="text-xs text-emerald-700 font-semibold">pts / clique</span>
                </div>
                <p className="text-[10px] text-[#64748B]">Botões de links, compras ou opções de fluxo</p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-1">
                <label className="text-xs font-bold text-[#1A1D21]">Respostas Rápidas</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rules.quickReplyPoints}
                    onChange={(e) => setRules({ ...rules, quickReplyPoints: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-white border border-[#E2E8F0] text-xs font-bold text-[#1A1D21]"
                  />
                  <span className="text-xs text-emerald-700 font-semibold">pts / seleção</span>
                </div>
                <p className="text-[10px] text-[#64748B]">Cliques em Quick Replies do direct</p>
              </div>
            </div>
          </div>

          {/* Section: Gatilhos de Automação & Comentários */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>Gatilhos de Automação & Conteúdo</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-1">
                <label className="text-xs font-bold text-[#1A1D21]">Comentário no Post/Reel</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rules.commentKeywordPoints}
                    onChange={(e) => setRules({ ...rules, commentKeywordPoints: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-white border border-[#E2E8F0] text-xs font-bold text-[#1A1D21]"
                  />
                  <span className="text-xs text-emerald-700 font-semibold">pts / comentário</span>
                </div>
                <p className="text-[10px] text-[#64748B]">Palavra-chave digitada em posts</p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-1">
                <label className="text-xs font-bold text-[#1A1D21]">Resposta a Stories</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rules.storyReplyPoints}
                    onChange={(e) => setRules({ ...rules, storyReplyPoints: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-white border border-[#E2E8F0] text-xs font-bold text-[#1A1D21]"
                  />
                  <span className="text-xs text-emerald-700 font-semibold">pts / resposta</span>
                </div>
                <p className="text-[10px] text-[#64748B]">Interação direta com Stories</p>
              </div>
            </div>
          </div>

          {/* Section: Roteamento & Contato Humano */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dados do Lead & Atendimento Humano</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-1">
                <label className="text-xs font-bold text-[#1A1D21]">WhatsApp / Telefone</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rules.phonePoints}
                    onChange={(e) => setRules({ ...rules, phonePoints: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-white border border-[#E2E8F0] text-xs font-bold text-[#1A1D21]"
                  />
                  <span className="text-xs text-emerald-700 font-semibold">pts</span>
                </div>
                <p className="text-[10px] text-[#64748B]">Lead forneceu número de contato</p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-1">
                <label className="text-xs font-bold text-[#1A1D21]">E-mail Fornecido</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rules.emailPoints}
                    onChange={(e) => setRules({ ...rules, emailPoints: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-white border border-[#E2E8F0] text-xs font-bold text-[#1A1D21]"
                  />
                  <span className="text-xs text-emerald-700 font-semibold">pts</span>
                </div>
                <p className="text-[10px] text-[#64748B]">Lead cadastrou endereço de e-mail</p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-[#1A1D21]">Solicitação de Atendente Humano</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rules.humanHandoverPoints}
                    onChange={(e) => setRules({ ...rules, humanHandoverPoints: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-white border border-[#E2E8F0] text-xs font-bold text-[#1A1D21]"
                  />
                  <span className="text-xs text-emerald-700 font-semibold">pts</span>
                </div>
                <p className="text-[10px] text-[#64748B]">Lead pediu para falar com vendas/suporte humano</p>
              </div>
            </div>
          </div>

          {/* Section: Limiares de Temperatura */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>Limiares de Classificação (Temperatura)</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 space-y-1">
                <label className="text-xs font-bold text-orange-900">Lead Quente 🔥 (Mínimo)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rules.hotTierThreshold}
                    onChange={(e) => setRules({ ...rules, hotTierThreshold: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-white border border-orange-300 text-xs font-black text-orange-900"
                  />
                  <span className="text-xs text-orange-800 font-bold">pontos</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <label className="text-xs font-bold text-amber-900">Lead Morno ⚡ (Mínimo)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rules.warmTierThreshold}
                    onChange={(e) => setRules({ ...rules, warmTierThreshold: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-white border border-amber-300 text-xs font-black text-amber-900"
                  />
                  <span className="text-xs text-amber-800 font-bold">pontos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#1A1D21] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[#64748B] hover:bg-gray-200 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{isSaved ? 'Salvo!' : 'Salvar Regras'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
