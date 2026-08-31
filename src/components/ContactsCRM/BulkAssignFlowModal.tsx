import React, { useState } from 'react';
import { 
  X, 
  GitFork, 
  Play, 
  Check, 
  Zap, 
  Search, 
  Users, 
  Clock, 
  Instagram, 
  Facebook, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Contact, Flow, ContactActivityLog } from '../../types';

interface BulkAssignFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: Contact[];
  flows: Flow[];
  onAssignFlow: (flowId: string, executeImmediately: boolean) => void;
}

export const BulkAssignFlowModal: React.FC<BulkAssignFlowModalProps> = ({
  isOpen,
  onClose,
  selectedContacts,
  flows,
  onAssignFlow
}) => {
  if (!isOpen) return null;

  const [selectedFlowId, setSelectedFlowId] = useState<string>(flows[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [executeImmediately, setExecuteImmediately] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredFlows = flows.filter((f) => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeFlow = flows.find((f) => f.id === selectedFlowId);

  const handleConfirm = () => {
    if (!selectedFlowId) return;
    setIsProcessing(true);
    setTimeout(() => {
      onAssignFlow(selectedFlowId, executeImmediately);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div 
      id="bulk_assign_flow_modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <GitFork className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Atribuir Fluxo em Massa</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30">
                  {selectedContacts.length} {selectedContacts.length === 1 ? 'contato selecionado' : 'contatos selecionados'}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Execute ou vincule uma automação para todos os contatos selecionados simultaneamente.
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
          {/* Target Contacts Preview */}
          <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#1A1D21]">
              <span className="flex items-center gap-1.5 text-[#64748B] uppercase tracking-wider text-[10px]">
                <Users className="w-3.5 h-3.5 text-[#0084FF]" />
                <span>Destinatários Selecionados</span>
              </span>
              <span className="text-blue-600 font-bold">{selectedContacts.length} Contatos</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {selectedContacts.slice(0, 8).map((c) => (
                <div 
                  key={c.id} 
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs shrink-0"
                  title={c.name}
                >
                  <img src={c.avatarUrl} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
                  <span className="font-semibold text-[#1A1D21] max-w-[90px] truncate">{c.name.split(' ')[0]}</span>
                </div>
              ))}
              {selectedContacts.length > 8 && (
                <span className="text-xs font-bold text-gray-500 px-2 py-1 rounded-lg bg-gray-100 shrink-0">
                  +{selectedContacts.length - 8} outros
                </span>
              )}
            </div>
          </div>

          {/* Search Flow */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Selecione o Fluxo de Automação:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome do fluxo..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
              />
            </div>

            {/* Flows List */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {filteredFlows.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                  Nenhum fluxo encontrado com este nome.
                </div>
              ) : (
                filteredFlows.map((flow) => {
                  const isSelected = flow.id === selectedFlowId;
                  const nodesCount = flow.nodes?.length || 0;
                  return (
                    <div
                      key={flow.id}
                      onClick={() => setSelectedFlowId(flow.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50/70 border-[#0084FF] ring-2 ring-[#0084FF]/20 shadow-xs'
                          : 'bg-white border-[#E2E8F0] hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#0084FF] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <GitFork className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                            <span>{flow.name}</span>
                            {flow.channel === 'instagram' ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-pink-50 text-pink-700 border border-pink-200">
                                Instagram
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                                Messenger
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                            {flow.description || `${nodesCount} blocos de automação configurados`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-gray-500">
                          {nodesCount} nós
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'bg-[#0084FF] border-[#0084FF] text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Execution Options */}
          <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] space-y-3">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Modo de Execução
            </span>

            <label className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="radio"
                name="exec_mode"
                checked={executeImmediately}
                onChange={() => setExecuteImmediately(true)}
                className="mt-0.5 text-[#0084FF] focus:ring-[#0084FF]"
              />
              <div>
                <span className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Disparar Fluxo Imediatamente</span>
                </span>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Envia a primeira mensagem do fluxo e inicia a automação instantaneamente para cada contato.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="radio"
                name="exec_mode"
                checked={!executeImmediately}
                onChange={() => setExecuteImmediately(false)}
                className="mt-0.5 text-[#0084FF] focus:ring-[#0084FF]"
              />
              <div>
                <span className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Apenas Registrar Atribuição no CRM</span>
                </span>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Insere o fluxo no histórico de atividades do contato sem enviar mensagens ativas agora.
                </p>
              </div>
            </label>
          </div>
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
            id="btn_confirm_bulk_assign_flow"
            type="button"
            onClick={handleConfirm}
            disabled={!selectedFlowId || isProcessing}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Atribuindo...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Confirmar e Atribuir ({selectedContacts.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
