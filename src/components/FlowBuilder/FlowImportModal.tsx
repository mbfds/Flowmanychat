import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  GitFork, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Instagram,
  Facebook,
  MessageCircle,
  Send,
  Zap,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { Flow } from '../../types';
import { FlowValidationResult } from '../../services/flowTemplateService';

interface FlowImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationResult: FlowValidationResult | null;
  currentFlowTitle: string;
  onConfirmImport: (flow: Flow, asNewFlow: boolean) => void;
}

export const FlowImportModal: React.FC<FlowImportModalProps> = ({
  isOpen,
  onClose,
  validationResult,
  currentFlowTitle,
  onConfirmImport
}) => {
  const [importMode, setImportMode] = useState<'new_flow' | 'replace_current'>('new_flow');
  const [customTitle, setCustomTitle] = useState('');

  if (!isOpen || !validationResult || !validationResult.flow) return null;

  const flow = validationResult.flow;
  const metadata = validationResult.metadata;
  const warnings = validationResult.warnings || [];

  const handleConfirm = () => {
    const finalFlow: Flow = {
      ...flow,
      title: customTitle.trim() ? customTitle.trim() : flow.title,
      updatedAt: new Date().toISOString()
    };
    onConfirmImport(finalFlow, importMode === 'new_flow');
    onClose();
  };

  const nodeTypeLabels: Record<string, { label: string; color: string }> = {
    trigger: { label: 'Gatilhos', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    message: { label: 'Mensagens', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    condition: { label: 'Condições', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    action: { label: 'Ações / CRM', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    ai_step: { label: 'Agentes IA', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    delay: { label: 'Pausas', color: 'bg-slate-100 text-slate-800 border-slate-300' },
    ab_split: { label: 'Split Test A/B', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300' },
  };

  const getChannelBadge = () => {
    switch (flow.channel) {
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">
            <Instagram className="w-3.5 h-3.5" /> Instagram Direct
          </span>
        );
      case 'messenger':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Facebook className="w-3.5 h-3.5" /> Messenger
          </span>
        );
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </span>
        );
      case 'telegram':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Send className="w-3.5 h-3.5" /> Telegram
          </span>
        );
      case 'omnichannel':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Zap className="w-3.5 h-3.5" /> Omnichannel
          </span>
        );
    }
  };

  return (
    <div 
      id="modal_import_flow_backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="modal_import_flow_content"
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Importar Modelo de Automação
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Arquivo de fluxo validado com sucesso. Escolha como deseja carregá-lo.
              </p>
            </div>
          </div>
          <button
            id="btn_close_import_modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Warnings Banner if any */}
          {warnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300">
                {warnings.map((w, i) => (
                  <p key={i}>{w}</p>
                ))}
              </div>
            </div>
          )}

          {/* Flow Info Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Modelo Detectado
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {flow.title}
                </h4>
              </div>
              {getChannelBadge()}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {flow.description || 'Modelo de fluxo sem descrição informada.'}
            </p>

            {/* Structure stats */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                {flow.nodes.length} nós no canvas
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                {flow.connections.length} conexões lógicas
              </span>
            </div>

            {/* Node breakdown pills */}
            {metadata?.nodeTypesCount && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.entries(metadata.nodeTypesCount).map(([type, count]) => {
                  const info = nodeTypeLabels[type] || { label: type, color: 'bg-gray-100 text-gray-800 border-gray-300' };
                  return (
                    <span 
                      key={type}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${info.color}`}
                    >
                      {count}x {info.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Import Destination Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Modo de Importação
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: As New Flow */}
              <div
                id="btn_import_as_new_flow"
                onClick={() => setImportMode('new_flow')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  importMode === 'new_flow'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-950 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <PlusCircle className={`w-4 h-4 ${importMode === 'new_flow' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">Criar como Novo Fluxo</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Recomendado
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Adiciona este fluxo à sua lista de automações sem alterar o fluxo atual.
                </p>
              </div>

              {/* Option 2: Replace Current Flow */}
              <div
                id="btn_import_replace_current"
                onClick={() => setImportMode('replace_current')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  importMode === 'replace_current'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${importMode === 'replace_current' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Substituir Fluxo Atual</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Substitui os nós de <strong>{currentFlowTitle}</strong> pelos nós importados.
                </p>
              </div>
            </div>
          </div>

          {/* Title Customization Field if New Flow */}
          {importMode === 'new_flow' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nome para o novo fluxo (opcional):
              </label>
              <input
                id="input_imported_flow_title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={flow.title}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-end gap-3">
          <button
            id="btn_cancel_import"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="btn_confirm_import_flow"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 hover:scale-102 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar e Carregar no Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
