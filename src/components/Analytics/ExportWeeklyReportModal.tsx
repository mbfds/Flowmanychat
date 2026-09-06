import React, { useState } from 'react';
import { 
  FileDown, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  Users, 
  Sparkles, 
  X, 
  Download, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Printer
} from 'lucide-react';
import { Flow, Contact, LiveConversation, BroadcastCampaign } from '../../types';
import { generateWeeklyReportPdf, calculateWeeklyReportMetrics } from './WeeklyReportPdfGenerator';

interface ExportWeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  flows: Flow[];
  contacts?: Contact[];
  conversations?: LiveConversation[];
  broadcasts?: BroadcastCampaign[];
}

export const ExportWeeklyReportModal: React.FC<ExportWeeklyReportModalProps> = ({
  isOpen,
  onClose,
  flows,
  contacts = [],
  conversations = [],
  broadcasts = []
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [includeFunnelBreakdown, setIncludeFunnelBreakdown] = useState(true);
  const [includeGrowthMetrics, setIncludeGrowthMetrics] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);

  if (!isOpen) return null;

  const metrics = calculateWeeklyReportMetrics(flows, contacts, conversations, broadcasts);

  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      setDownloadSuccess(false);

      // Brief timeout to ensure smooth animation and state update
      await new Promise((res) => setTimeout(res, 350));

      const doc = generateWeeklyReportPdf(flows, contacts, conversations, broadcasts, {
        includeFunnelBreakdown,
        includeGrowthMetrics,
        includeRecommendations
      });

      const todayStr = new Date().toISOString().split('T')[0];
      doc.save(`manyflow_resumo_semanal_performance_${todayStr}.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Erro ao gerar relatório semanal em PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0084FF] border border-blue-100 dark:border-blue-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Exportar Resumo Semanal (PDF)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase tracking-wider">
                  Programático
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Relatório executivo completo de performance de funis e crescimento da base.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Quick Metrics Snapshot */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Runs de Funis
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {metrics.totalRuns.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                {metrics.avgRetention}% retenção
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Novos Leads
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                +{metrics.newContactsWeek}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                +{metrics.growthRatePercent}% na semana
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Base Total
              </span>
              <span className="text-lg font-black text-[#0084FF]">
                {metrics.totalContacts.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                Contatos qualificados
              </span>
            </div>
          </div>

          {/* Document Content Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Conteúdo do Documento (2 Páginas A4):
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeFunnelBreakdown}
                  onChange={(e) => setIncludeFunnelBreakdown(e.target.checked)}
                  className="mt-0.5 rounded text-[#0084FF] focus:ring-[#0084FF]"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Página 1: Resumo Executivo & Tabela de Funis
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                    KPIs consolidados, tabela nó a nó com runs, taxa de conclusão, CTR e identificação do fluxo campeão e gargalos.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeGrowthMetrics}
                  onChange={(e) => setIncludeGrowthMetrics(e.target.checked)}
                  className="mt-0.5 rounded text-[#0084FF] focus:ring-[#0084FF]"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Página 2: Gráficos de Crescimento da Base & Canais
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                    Gráfico vetorial de novos contatos por dia da semana (Seg a Dom), divisão Instagram vs Messenger e saúde da base.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeRecommendations}
                  onChange={(e) => setIncludeRecommendations(e.target.checked)}
                  className="mt-0.5 rounded text-[#0084FF] focus:ring-[#0084FF]"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Alertas Operacionais & Recomendações Estratégicas
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                    Alerta de follow-up para contatos sem resposta há mais de 48h e plano de ação tático para a próxima semana.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>PDF gerado com sucesso!</strong> O download do relatório semanal foi iniciado automaticamente no seu navegador.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Formato A4 Vetorial de alta precisão (jsPDF)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Fechar
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0084FF] hover:bg-[#0073E6] transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Compilando PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Gerar e Baixar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
