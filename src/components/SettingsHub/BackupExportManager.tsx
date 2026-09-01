import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  Database, 
  Check, 
  Copy, 
  RotateCcw, 
  ShieldCheck, 
  Layers, 
  Users, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  HardDrive, 
  Share2, 
  FileText, 
  RefreshCw,
  FolderArchive,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  Flow, 
  Contact, 
  CustomFieldDefinition, 
  BotKnowledgeBase, 
  KeywordTrigger, 
  PostCommentGrowthTool, 
  BroadcastCampaign,
  WebhookSettingsState 
} from '../../types';

export interface BackupExportManagerProps {
  flows: Flow[];
  contacts: Contact[];
  customFields: CustomFieldDefinition[];
  knowledgeBase: BotKnowledgeBase;
  triggers?: KeywordTrigger[];
  growthTools?: PostCommentGrowthTool[];
  broadcasts?: BroadcastCampaign[];
  webhookSettings?: WebhookSettingsState;
  onRestoreBackup?: (backupData: any, mode: 'replace' | 'merge') => void;
}

export const BackupExportManager: React.FC<BackupExportManagerProps> = ({
  flows = [],
  contacts = [],
  customFields = [],
  knowledgeBase,
  triggers = [],
  growthTools = [],
  broadcasts = [],
  webhookSettings,
  onRestoreBackup
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    status: 'idle' | 'analyzing' | 'ready' | 'success' | 'error';
    message?: string;
    parsedData?: any;
    summary?: {
      flowsCount: number;
      contactsCount: number;
      fieldsCount: number;
      triggersCount: number;
      exportedAt?: string;
    };
  }>({ status: 'idle' });

  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate totals
  const totalNodes = flows.reduce((acc, f) => acc + (f.nodes?.length || 0), 0);
  const totalConnections = flows.reduce((acc, f) => acc + (f.connections?.length || 0), 0);

  // 1. Full Workspace Backup JSON Generator
  const generateFullBackupData = () => {
    return {
      version: '2.0',
      system: 'ManyFlow Omnichannel Automation',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalFlows: flows.length,
        totalNodes,
        totalConnections,
        totalContacts: contacts.length,
        totalCustomFields: customFields.length,
        totalTriggers: triggers.length,
        totalCommentAutomations: growthTools.length
      },
      data: {
        flows,
        contacts,
        customFields,
        knowledgeBase,
        triggers,
        growthTools,
        broadcasts,
        webhookSettings
      }
    };
  };

  // Helper to trigger file download
  const triggerDownload = (filename: string, content: string, mimeType: string, feedbackKey: string) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(feedbackKey);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error('Error triggering download:', err);
    }
  };

  // 1-Click Complete Backup
  const handleExportFullBackup = () => {
    const backup = generateFullBackupData();
    const jsonStr = JSON.stringify(backup, null, 2);
    const dateStamp = new Date().toISOString().split('T')[0];
    triggerDownload(
      `manyflow_backup_completo_${dateStamp}.json`,
      jsonStr,
      'application/json;charset=utf-8',
      'full'
    );
  };

  // Export Flows Only
  const handleExportFlowsOnly = () => {
    const flowsData = {
      version: '2.0',
      type: 'manyflow_flows_export',
      exportedAt: new Date().toISOString(),
      flowsCount: flows.length,
      flows
    };
    const jsonStr = JSON.stringify(flowsData, null, 2);
    const dateStamp = new Date().toISOString().split('T')[0];
    triggerDownload(
      `manyflow_fluxos_${dateStamp}.json`,
      jsonStr,
      'application/json;charset=utf-8',
      'flows'
    );
  };

  // Export Contacts to CSV (Excel format with UTF-8 BOM)
  const handleExportContactsCSV = () => {
    if (contacts.length === 0) return;

    // Collect all unique custom field keys
    const customFieldKeys = customFields.map(f => f.key);
    
    // Header row
    const headers = [
      'ID',
      'Nome',
      'Usuário/Handle',
      'Canal',
      'Telefone',
      'Email',
      'Status',
      'Pontuação de Lead',
      'Tags',
      'Data de Criação',
      'Última Interação',
      'Total de Interações',
      ...customFieldKeys.map(k => `Campo_${k}`)
    ];

    const rows = contacts.map(c => {
      const tagsStr = (c.tags || []).join('; ');
      const customFieldValues = customFieldKeys.map(key => {
        return c.customFields?.[key] || '';
      });

      return [
        `"${c.id}"`,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.username || '').replace(/"/g, '""')}"`,
        `"${c.channel || ''}"`,
        `"${c.phone || ''}"`,
        `"${c.email || ''}"`,
        `"${c.status || ''}"`,
        `"${c.leadScore || 0}"`,
        `"${tagsStr.replace(/"/g, '""')}"`,
        `"${c.createdAt || ''}"`,
        `"${c.lastInteractionAt || ''}"`,
        `"${c.totalInteractions || 0}"`,
        ...customFieldValues.map(val => `"${String(val).replace(/"/g, '""')}"`)
      ].join(',');
    });

    // Add UTF-8 BOM so Excel opens accents correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const dateStamp = new Date().toISOString().split('T')[0];
    triggerDownload(
      `manyflow_contatos_${dateStamp}.csv`,
      csvContent,
      'text/csv;charset=utf-8',
      'contacts_csv'
    );
  };

  // Export Contacts JSON
  const handleExportContactsJSON = () => {
    const contactsData = {
      version: '2.0',
      type: 'manyflow_contacts_export',
      exportedAt: new Date().toISOString(),
      contactsCount: contacts.length,
      contacts
    };
    const jsonStr = JSON.stringify(contactsData, null, 2);
    const dateStamp = new Date().toISOString().split('T')[0];
    triggerDownload(
      `manyflow_contatos_${dateStamp}.json`,
      jsonStr,
      'application/json;charset=utf-8',
      'contacts_json'
    );
  };

  // Copy JSON to clipboard
  const handleCopyJSON = (type: string) => {
    let content = '';
    if (type === 'full') {
      content = JSON.stringify(generateFullBackupData(), null, 2);
    } else if (type === 'flows') {
      content = JSON.stringify({ flows }, null, 2);
    } else if (type === 'contacts') {
      content = JSON.stringify({ contacts }, null, 2);
    }

    navigator.clipboard.writeText(content).then(() => {
      setCopiedSection(type);
      setTimeout(() => setCopiedSection(null), 2500);
    });
  };

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ status: 'analyzing', message: 'Lendo arquivo de backup...' });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Check format
        const flowsFound = parsed.data?.flows || parsed.flows || [];
        const contactsFound = parsed.data?.contacts || parsed.contacts || [];
        const fieldsFound = parsed.data?.customFields || parsed.customFields || [];
        const triggersFound = parsed.data?.triggers || parsed.triggers || [];

        if (!Array.isArray(flowsFound) && !Array.isArray(contactsFound)) {
          setImportStatus({
            status: 'error',
            message: 'O arquivo selecionado não contém uma estrutura válida de fluxos ou contatos do ManyFlow.'
          });
          return;
        }

        setImportStatus({
          status: 'ready',
          parsedData: parsed,
          summary: {
            flowsCount: Array.isArray(flowsFound) ? flowsFound.length : 0,
            contactsCount: Array.isArray(contactsFound) ? contactsFound.length : 0,
            fieldsCount: Array.isArray(fieldsFound) ? fieldsFound.length : 0,
            triggersCount: Array.isArray(triggersFound) ? triggersFound.length : 0,
            exportedAt: parsed.exportedAt || parsed.data?.exportedAt
          }
        });
      } catch (err) {
        setImportStatus({
          status: 'error',
          message: 'Erro ao interpretar o arquivo JSON. Verifique se o arquivo está íntegro e não foi corrompido.'
        });
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Apply Restored Data
  const handleApplyRestore = () => {
    if (!importStatus.parsedData || !onRestoreBackup) return;

    try {
      onRestoreBackup(importStatus.parsedData, restoreMode);
      setImportStatus({
        status: 'success',
        message: 'Backup restaurado com sucesso! Seus dados foram atualizados no workspace.'
      });
      setTimeout(() => {
        setImportStatus({ status: 'idle' });
      }, 4000);
    } catch (err) {
      setImportStatus({
        status: 'error',
        message: 'Ocorreu um erro ao restaurar os dados no aplicativo.'
      });
    }
  };

  return (
    <div className="space-y-6" id="backup_export_manager">
      {/* Primary 1-Click Action Hero Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-radial from-blue-500/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                Portabilidade & Segurança
              </span>
              <span className="text-xs text-slate-300">
                Última checagem: Hoje
              </span>
            </div>
            
            <h2 className="text-xl font-black text-white tracking-tight">
              Exportação Geral & Backup em 1 Clique
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gere um pacote completo contendo todos os seus fluxos de conversa, contatos cadastrados, tags, variáveis do CRM, automações de comentários e diretrizes da IA em um único arquivo JSON portátil.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                <Layers className="w-3.5 h-3.5 text-blue-300" />
                <span><strong>{flows.length}</strong> Fluxos ({totalNodes} nós)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                <Users className="w-3.5 h-3.5 text-indigo-300" />
                <span><strong>{contacts.length}</strong> Contatos no CRM</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Base IA & Configurações</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 self-start md:self-center">
            <button
              id="btn_download_full_backup"
              onClick={handleExportFullBackup}
              className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              {downloadSuccess === 'full' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Backup Baixado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Baixar Backup Completo (.json)</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleCopyJSON('full')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
            >
              {copiedSection === 'full' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">JSON Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar JSON Bruto</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Modular Exports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Flows & Automations Export */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Exportar Apenas Fluxos
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Estrutura de nós, condicionais, mensagens e testes A/B
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                {flows.length} Fluxos
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ideal para migrar sua árvore de automação entre contas ou guardar cópias de segurança de campanhas específicas.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              id="btn_export_flows_json"
              onClick={handleExportFlowsOnly}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              {downloadSuccess === 'flows' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fluxos Baixados!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Fluxos (.json)</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleCopyJSON('flows')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
              title="Copiar JSON dos fluxos"
            >
              {copiedSection === 'flows' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Contacts & CRM Export */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Exportar Base de Contatos (CRM)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Nomes, telefones, e-mails, tags e campos customizados
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {contacts.length} Leads
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Compatível com Excel, Google Planilhas, RD Station, HubSpot ou outros CRMs. Codificado em UTF-8 com suporte nativo a acentos.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              id="btn_export_contacts_csv"
              onClick={handleExportContactsCSV}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              {downloadSuccess === 'contacts_csv' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Planilha Baixada!</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Baixar Planilha (.csv)</span>
                </>
              )}
            </button>

            <button
              id="btn_export_contacts_json"
              onClick={handleExportContactsJSON}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200 flex items-center gap-1.5"
              title="Baixar JSON estruturado"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Restore / Import Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Restaurar Dados a partir de um Backup
              </h3>
              <p className="text-[11px] text-slate-500">
                Envie um arquivo <code>.json</code> exportado anteriormente pelo ManyFlow
              </p>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json" 
          className="hidden" 
        />

        {importStatus.status === 'idle' && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Clique aqui para selecionar seu arquivo de backup (.json)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Compatível com arquivos completos ou parciais de fluxos e contatos
              </p>
            </div>
          </div>
        )}

        {importStatus.status === 'analyzing' && (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <p className="text-xs font-bold text-slate-700">{importStatus.message}</p>
          </div>
        )}

        {importStatus.status === 'error' && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Falha na Leitura do Arquivo</p>
                <p className="text-rose-700 mt-0.5">{importStatus.message}</p>
              </div>
            </div>
            <button
              onClick={() => setImportStatus({ status: 'idle' })}
              className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 font-bold hover:bg-rose-100 cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {importStatus.status === 'success' && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Restauração Concluída!</p>
              <p className="text-emerald-700">{importStatus.message}</p>
            </div>
          </div>
        )}

        {importStatus.status === 'ready' && importStatus.summary && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  Arquivo Analisado com Sucesso
                </h4>
              </div>
              {importStatus.summary.exportedAt && (
                <span className="text-[10px] text-slate-500 font-medium">
                  Exportado em: {new Date(importStatus.summary.exportedAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            {/* Counts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Fluxos Encontrados</span>
                <span className="font-bold text-slate-900 text-sm">
                  {importStatus.summary.flowsCount}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Contatos</span>
                <span className="font-bold text-slate-900 text-sm">
                  {importStatus.summary.contactsCount}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Campos CRM</span>
                <span className="font-bold text-slate-900 text-sm">
                  {importStatus.summary.fieldsCount}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Gatilhos / Palavras</span>
                <span className="font-bold text-slate-900 text-sm">
                  {importStatus.summary.triggersCount}
                </span>
              </div>
            </div>

            {/* Mode selection */}
            <div className="flex items-center gap-4 text-xs">
              <span className="font-semibold text-slate-700">Modo de Restauração:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="restore_mode"
                  checked={restoreMode === 'replace'}
                  onChange={() => setRestoreMode('replace')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">Substituir dados atuais</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="restore_mode"
                  checked={restoreMode === 'merge'}
                  onChange={() => setRestoreMode('merge')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">Mesclar (adicionar novos)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setImportStatus({ status: 'idle' })}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn_confirm_restore_backup"
                onClick={handleApplyRestore}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aplicar Restauração Agora</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
