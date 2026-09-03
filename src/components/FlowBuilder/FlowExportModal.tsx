import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Share2, 
  Sparkles, 
  Layers, 
  GitFork,
  Instagram,
  Facebook,
  MessageCircle,
  Send,
  Zap
} from 'lucide-react';
import { Flow } from '../../types';
import { createFlowExportPackage, downloadFlowAsJson, copyFlowJsonToClipboard } from '../../services/flowTemplateService';

interface FlowExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: Flow;
}

export const FlowExportModal: React.FC<FlowExportModalProps> = ({
  isOpen,
  onClose,
  flow
}) => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'summary' | 'json'>('summary');

  if (!isOpen) return null;

  const exportPackage = createFlowExportPackage(flow);
  const jsonPreview = JSON.stringify(exportPackage, null, 2);

  const handleDownload = () => {
    downloadFlowAsJson(flow);
  };

  const handleCopy = async () => {
    const success = await copyFlowJsonToClipboard(flow);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
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
            <Zap className="w-3.5 h-3.5" /> Omnichannel (Todos)
          </span>
        );
    }
  };

  return (
    <div 
      id="modal_export_flow_backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="modal_export_flow_content"
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Exportar Modelo de Automação
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere um arquivo JSON portátil para compartilhar ou reutilizar este fluxo.
              </p>
            </div>
          </div>
          <button
            id="btn_close_export_modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flow Meta Card */}
        <div className="px-6 pt-5 pb-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {flow.title}
              </span>
              {getChannelBadge()}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {flow.description || 'Sem descrição definida.'}
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
              <span><strong>{flow.nodes.length}</strong> Nós visuais</span>
              <span>•</span>
              <span><strong>{flow.connections.length}</strong> Conexões lógicas</span>
              <span>•</span>
              <span>Compatível com Drag & Drop</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <button
            id="btn_export_view_summary"
            onClick={() => setActiveView('summary')}
            className={`py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'summary'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Resumo da Estrutura</span>
          </button>
          <button
            id="btn_export_view_json"
            onClick={() => setActiveView('json')}
            className={`py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'json'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Código JSON</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeView === 'summary' ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Distribuição dos Nós no Fluxo
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(exportPackage.templateMetadata.nodeTypesCount).map(([type, count]) => {
                    const info = nodeTypeLabels[type] || { label: type, color: 'bg-gray-100 text-gray-800 border-gray-300' };
                    return (
                      <div
                        key={type}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between"
                      >
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {info.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${info.color}`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-blue-950 dark:text-blue-200">
                      Como reutilizar este arquivo em outro espaço de trabalho?
                    </p>
                    <p className="text-blue-900/80 dark:text-blue-300/80 leading-relaxed">
                      Baixe o arquivo <code>.json</code> e simplesmente <strong>arraste e solte</strong> diretamente sobre o canvas visual de qualquer fluxo ManyFlow para carregar todos os nós e conexões instantaneamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed max-h-[260px] overflow-auto border border-slate-800 selection:bg-blue-600">
                {jsonPreview}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3 flex-wrap">
          <button
            id="btn_copy_flow_json"
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">JSON Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copiar JSON</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn_cancel_export"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              id="btn_download_flow_json"
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 hover:scale-102 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo .JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
