import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Tag,
  Mail,
  Phone,
  MousePointerClick,
  Sparkles,
  ShoppingBag,
  UserCheck,
  Radio,
  FileText,
  Activity,
  Plus,
  Minus,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { Contact, LeadScoreBreakdown } from '../../types';
import { calculateLeadScore, getLeadScoreTier, ScoringRuleConfig } from '../../utils/leadScoring';

interface LeadScoreBreakdownModalProps {
  contact: Contact;
  onClose: () => void;
  onUpdateContact: (updated: Contact) => void;
  customRules?: ScoringRuleConfig;
  onOpenRulesConfig?: () => void;
}

export const LeadScoreBreakdownModal: React.FC<LeadScoreBreakdownModalProps> = ({
  contact,
  onClose,
  onUpdateContact,
  customRules,
  onOpenRulesConfig
}) => {
  const [bonusInput, setBonusInput] = useState<string>('10');
  const [bonusNote, setBonusNote] = useState<string>('');
  const [showBonusForm, setShowBonusForm] = useState(false);

  const breakdown: LeadScoreBreakdown = calculateLeadScore(contact, customRules);
  const tierInfo = getLeadScoreTier(breakdown.totalScore);

  const handleApplyBonus = (isPositive: boolean) => {
    const val = parseInt(bonusInput, 10);
    if (isNaN(val) || val <= 0) return;

    const delta = isPositive ? val : -val;
    const currentBonus = contact.manualScoreBonus || 0;
    const newBonus = currentBonus + delta;

    const nowStr = `Hoje às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newLog = {
      id: `act_${Date.now()}`,
      type: 'status_changed' as const,
      title: isPositive ? `Bônus Manual de Lead Score (+${val} pts)` : `Penalidade de Lead Score (-${val} pts)`,
      description: bonusNote.trim() ? `Motivo: ${bonusNote.trim()}` : `Ajuste manual de pontuação pela equipe.`,
      timestamp: nowStr,
      actor: 'agent' as const
    };

    onUpdateContact({
      ...contact,
      manualScoreBonus: newBonus,
      activityLogs: [newLog, ...(contact.activityLogs || [])]
    });

    setBonusNote('');
    setShowBonusForm(false);
  };

  const getCategoryIcon = (category: string, iconName?: string) => {
    switch (category) {
      case 'engagement':
        return <MousePointerClick className="w-4 h-4 text-[#0084FF]" />;
      case 'triggers':
        return <Sparkles className="w-4 h-4 text-pink-600" />;
      case 'tags':
        return <Tag className="w-4 h-4 text-emerald-600" />;
      case 'profile':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'conversion':
        return <ShoppingBag className="w-4 h-4 text-amber-600" />;
      case 'custom':
      default:
        return <TrendingUp className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" id="lead_score_breakdown_modal">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] bg-gradient-to-r from-[#F8F9FB] to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${tierInfo.badgeClass}`}>
              {tierInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1A1D21]">Auditoria de Lead Scoring</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${tierInfo.pillClass}`}>
                  {breakdown.totalScore} Pts • {tierInfo.label}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Cálculo em tempo real para <strong>{contact.name}</strong> ({contact.username})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Visual Score Thermometer / Progress Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900 to-[#1A1D21] text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Temperatura do Lead</span>
                <div className="text-2xl font-black flex items-center gap-2 mt-0.5">
                  <span>{breakdown.totalScore}</span>
                  <span className="text-xs font-semibold text-gray-400">/ 100+ pontos</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold ${tierInfo.pillClass}`}>
                  {tierInfo.icon} Lead {tierInfo.label}
                </span>
                <div className="text-[10px] text-gray-400 mt-1">
                  {breakdown.totalScore >= 70
                    ? '🎯 Alta prontidão para fechar compra'
                    : breakdown.totalScore >= 35
                    ? '⚡ Bom engajamento no funil'
                    : '❄️ Início de relacionamento'}
                </div>
              </div>
            </div>

            {/* Score Bar */}
            <div className="space-y-1">
              <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${tierInfo.barColor} transition-all duration-500`}
                  style={{ width: `${Math.min(100, (breakdown.totalScore / 100) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>0 (Frio)</span>
                <span>35 (Morno)</span>
                <span>70+ (Quente 🔥)</span>
              </div>
            </div>
          </div>

          {/* Points Breakdown List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
                Origem dos Pontos ({breakdown.items.length} critérios atendidos)
              </h4>
              {onOpenRulesConfig && (
                <button
                  onClick={onOpenRulesConfig}
                  className="text-[11px] font-semibold text-[#0084FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Configurar Pesos & Regras</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-100 rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-2xs">
              {breakdown.items.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#64748B]">
                  Nenhum critério pontuado ainda. As interações do lead somarão pontos automaticamente.
                </div>
              ) : (
                breakdown.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                        {getCategoryIcon(item.category, item.icon)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1A1D21] truncate">{item.label}</div>
                        <div className="text-[11px] text-[#64748B] truncate">{item.detail}</div>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-md text-xs font-black shrink-0 ${
                      item.points >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {item.points >= 0 ? `+${item.points}` : item.points} pts
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Manual Bonus Adjustments Section */}
          <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#0084FF]" />
                  <span>Ajuste Manual de Pontos</span>
                </span>
                <p className="text-[11px] text-[#64748B]">
                  Bônus atual da equipe: <strong>{contact.manualScoreBonus || 0} pts</strong>
                </p>
              </div>

              {!showBonusForm && (
                <button
                  onClick={() => setShowBonusForm(true)}
                  className="py-1 px-2.5 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#0084FF] text-xs font-bold text-[#1A1D21] hover:text-[#0084FF] cursor-pointer shadow-2xs"
                >
                  Adicionar Bônus/Penalidade
                </button>
              )}
            </div>

            {showBonusForm && (
              <div className="pt-2 border-t border-gray-200 space-y-2 animate-in fade-in duration-100">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase">Pontos</label>
                    <input
                      type="number"
                      value={bonusInput}
                      onChange={(e) => setBonusInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-bold text-[#1A1D21]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase">Motivo / Justificativa</label>
                    <input
                      type="text"
                      placeholder="Ex: Reunião agendada, interesse alto..."
                      value={bonusNote}
                      onChange={(e) => setBonusNote(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1A1D21]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowBonusForm(false)}
                    className="px-2.5 py-1 text-xs text-[#64748B] hover:bg-gray-200 rounded-md cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleApplyBonus(false)}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-md cursor-pointer flex items-center gap-1"
                  >
                    <Minus className="w-3 h-3" /> Subtrair (-{bonusInput})
                  </button>
                  <button
                    onClick={() => handleApplyBonus(true)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Somar (+{bonusInput})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-gray-50 flex items-center justify-between">
          <div className="text-[11px] text-[#64748B]">
            Leads com pontuação <strong>≥ 70</strong> são categorizados automaticamente como <strong>Leads Quentes 🔥</strong>.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
