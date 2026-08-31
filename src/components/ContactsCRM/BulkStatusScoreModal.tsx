import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Sliders, 
  Check, 
  Sparkles, 
  Users, 
  PauseCircle, 
  PlayCircle, 
  UserCheck, 
  UserX,
  TrendingUp,
  Plus
} from 'lucide-react';
import { Contact } from '../../types';

interface BulkStatusScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: Contact[];
  onApplyChanges: (changes: {
    status?: 'active' | 'bot_paused' | 'human_assigned' | 'unsubscribed';
    scoreBonus?: number;
    assignedAgent?: string;
  }) => void;
}

export const BulkStatusScoreModal: React.FC<BulkStatusScoreModalProps> = ({
  isOpen,
  onClose,
  selectedContacts,
  onApplyChanges
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'status' | 'score'>('status');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'bot_paused' | 'human_assigned' | 'unsubscribed'>('active');
  const [assignedAgent, setAssignedAgent] = useState('Lucas Santos');
  const [scoreBonusOption, setScoreBonusOption] = useState<number>(15);
  const [customScoreBonus, setCustomScoreBonus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (activeTab === 'status') {
        onApplyChanges({
          status: selectedStatus,
          assignedAgent: selectedStatus === 'human_assigned' ? assignedAgent : undefined
        });
      } else {
        const bonus = customScoreBonus ? parseInt(customScoreBonus, 10) : scoreBonusOption;
        onApplyChanges({
          scoreBonus: isNaN(bonus) ? 0 : bonus
        });
      }
      setIsProcessing(false);
      onClose();
    }, 300);
  };

  return (
    <div 
      id="bulk_status_score_modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Status & Lead Scoring em Massa</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30">
                  {selectedContacts.length} contatos
                </span>
              </div>
              <p className="text-xs text-purple-100 mt-0.5">
                Atualize o estado do bot ou credite pontos aos leads selecionados.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-[#F8F9FB]">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-gray-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('status')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'status'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Alterar Status do Bot</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('score')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'score'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Ajustar Lead Score</span>
            </button>
          </div>

          {/* Status Options */}
          {activeTab === 'status' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Escolha o Novo Status para a Seleção:
              </span>

              <div className="space-y-2">
                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedStatus === 'active'
                    ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="crm_bulk_status"
                      checked={selectedStatus === 'active'}
                      onChange={() => setSelectedStatus('active')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <PlayCircle className="w-4 h-4 text-emerald-600" />
                        <span>Automação Ativa (Bot Respondendo)</span>
                      </span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        O robô responde normalmente a palavras-chave, stories e mensagens.
                      </p>
                    </div>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedStatus === 'bot_paused'
                    ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="crm_bulk_status"
                      checked={selectedStatus === 'bot_paused'}
                      onChange={() => setSelectedStatus('bot_paused')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <PauseCircle className="w-4 h-4 text-amber-600" />
                        <span>Pausar Bot Temporariamente</span>
                      </span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Nenhuma resposta automática será disparada até a reativação.
                      </p>
                    </div>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedStatus === 'human_assigned'
                    ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="crm_bulk_status"
                      checked={selectedStatus === 'human_assigned'}
                      onChange={() => setSelectedStatus('human_assigned')}
                      className="text-[#0084FF] focus:ring-[#0084FF]"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#0084FF]" />
                        <span>Encaminhar para Atendente Humano</span>
                      </span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Move a conversa para o Inbox prioritário de atendimento.
                      </p>
                    </div>
                  </div>
                </label>

                {selectedStatus === 'human_assigned' && (
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5 ml-6">
                    <label className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                      Atribuir ao Atendente:
                    </label>
                    <select
                      value={assignedAgent}
                      onChange={(e) => setAssignedAgent(e.target.value)}
                      className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-gray-800"
                    >
                      <option value="Lucas Santos">Lucas Santos (Vendas)</option>
                      <option value="Ana Beatriz">Ana Beatriz (Customer Success)</option>
                      <option value="Carlos Menezes">Carlos Menezes (Comercial)</option>
                      <option value="Juliana Rocha">Juliana Rocha (Suporte)</option>
                    </select>
                  </div>
                )}

                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedStatus === 'unsubscribed'
                    ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="crm_bulk_status"
                      checked={selectedStatus === 'unsubscribed'}
                      onChange={() => setSelectedStatus('unsubscribed')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <UserX className="w-4 h-4 text-rose-600" />
                        <span>Marcar como Desinscrito (Opt-out)</span>
                      </span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Bloqueia disparos de transmissão e campanhas de broadcast.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Lead Scoring Adjustments */}
          {activeTab === 'score' && (
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Conceder Bônus ou Penalidade de Pontos:
              </span>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { pts: 10, label: '+10 Pontos', desc: 'Interesse Moderado' },
                  { pts: 25, label: '+25 Pontos', desc: 'Alta Intenção' },
                  { pts: 50, label: '+50 Pontos', desc: 'Cliente VIP' },
                  { pts: -15, label: '-15 Pontos', desc: 'Desengajado' },
                  { pts: -30, label: '-30 Pontos', desc: 'Sem Retorno' },
                  { pts: 100, label: '+100 Pontos', desc: 'Fechamento' }
                ].map((item) => (
                  <button
                    key={item.pts}
                    type="button"
                    onClick={() => {
                      setScoreBonusOption(item.pts);
                      setCustomScoreBonus('');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      scoreBonusOption === item.pts && !customScoreBonus
                        ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200 shadow-2xs'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-xs font-extrabold block ${item.pts > 0 ? 'text-orange-600' : 'text-rose-600'}`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Ou digite um valor personalizado (+ / - pontos):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customScoreBonus}
                    onChange={(e) => setCustomScoreBonus(e.target.value)}
                    placeholder="Ex: 35 ou -20..."
                    className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="self-center text-xs font-bold text-gray-500">pontos</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            id="btn_confirm_bulk_status_score"
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Aplicando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salvar Alterações ({selectedContacts.length} Leads)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
