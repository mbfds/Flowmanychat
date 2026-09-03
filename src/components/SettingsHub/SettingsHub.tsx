import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Instagram, 
  Facebook, 
  Bot, 
  Key, 
  ShieldCheck, 
  Sparkles, 
  Save, 
  Check, 
  Link, 
  RefreshCw, 
  Clock, 
  HelpCircle, 
  Variable, 
  Layers, 
  Webhook, 
  Database, 
  Cpu, 
  Activity, 
  Gauge,
  Terminal,
  Radio,
  Globe,
  Rocket,
  MessageCircle,
  Users,
  FileText,
  RotateCcw,
  Server,
  Code2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Zap,
  Wrench,
  CalendarCheck,
  ToggleLeft,
  ToggleRight,
  Info,
  Download,
  HardDrive,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { 
  BotKnowledgeBase, 
  CustomFieldDefinition, 
  WebhookSettingsState,
  Flow,
  Contact,
  KeywordTrigger,
  PostCommentGrowthTool,
  BroadcastCampaign
} from '../../types';
import { CustomFieldsManager } from './CustomFieldsManager';
import { WebhooksManager } from './WebhooksManager';
import { WebhookLogsViewer } from './WebhookLogsViewer';
import { DatabaseManager } from './DatabaseManager';
import { FacebookRateLimitMonitor } from './FacebookRateLimitMonitor';
import { DomainManager } from './DomainManager';
import { ProductionDeployHub } from './ProductionDeployHub';
import { TeamUserManager } from './TeamUserManager';
import { FacebookAppsManager } from './FacebookAppsManager';
import { ActivityLogsViewer } from './ActivityLogsViewer';
import { WebhookSubscriptions } from './WebhookSubscriptions';
import { ExternalMessageWebhooksManager } from './ExternalMessageWebhooksManager';
import { WebhookSignatureTool } from './WebhookSignatureTool';
import { WebhookRetryPolicyManager } from './WebhookRetryPolicyManager';
import { FacebookGraphApiManager } from './FacebookGraphApiManager';
import { MetaAppSetupWizard } from './MetaAppSetupWizard';
import { MetaWebhooksValidator } from './MetaWebhooksValidator';
import { MetaTokenValidator } from './MetaTokenValidator';
import { BackupExportManager } from './BackupExportManager';
import { PlansPackagesManager } from './PlansPackagesManager';
import { AffiliateResellerHub } from './AffiliateResellerHub';
import { McpServerHub } from './McpServerHub';
import { WebhookStatusManager } from './WebhookStatusManager';
import { WebhookConfigManager } from './WebhookConfigManager';

interface SettingsHubProps {
  knowledgeBase: BotKnowledgeBase;
  onUpdateKnowledgeBase: (kb: BotKnowledgeBase) => void;
  customFields: CustomFieldDefinition[];
  onUpdateCustomFields: (fields: CustomFieldDefinition[]) => void;
  webhookSettings?: WebhookSettingsState;
  onUpdateWebhookSettings?: (settings: WebhookSettingsState) => void;
  flows?: Flow[];
  onUpdateFlows?: (flows: Flow[]) => void;
  contacts?: Contact[];
  onUpdateContacts?: (contacts: Contact[]) => void;
  triggers?: KeywordTrigger[];
  growthTools?: PostCommentGrowthTool[];
  broadcasts?: BroadcastCampaign[];
  onOpenFlow?: (flowId: string) => void;
  onOpenLiveChat?: (contactId: string) => void;
  onRestoreBackup?: (backupData: any, mode: 'replace' | 'merge') => void;
}

// Available tabs across standard and tech modes
type SettingsTab = 
  | 'channels' 
  | 'webhook_status'
  | 'webhook_config'
  | 'webhook_logs'
  | 'mcp'
  | 'plans'
  | 'affiliates'
  | 'team' 
  | 'backup'
  | 'meta_ai' 
  | 'custom_fields' 
  | 'domains'
  // Tech tabs
  | 'graph_api'
  | 'webhooks' 
  | 'system';

export const SettingsHub: React.FC<SettingsHubProps> = ({
  knowledgeBase,
  onUpdateKnowledgeBase,
  customFields,
  onUpdateCustomFields,
  webhookSettings,
  onUpdateWebhookSettings,
  flows = [],
  onUpdateFlows,
  contacts = [],
  onUpdateContacts,
  triggers = [],
  growthTools = [],
  broadcasts = [],
  onOpenFlow,
  onOpenLiveChat,
  onRestoreBackup
}) => {
  // Technical mode toggle with persistent state
  const [isTechMode, setIsTechMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('manyflow_tech_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Main active tab
  const [activeTab, setActiveTab] = useState<SettingsTab>('channels');
  
  // Secondary sub-tab states
  const [facebookSubTab, setFacebookSubTab] = useState<'token_validator' | 'wizard' | 'apps' | 'graph_api'>('token_validator');
  const [webhooksSubTab, setWebhooksSubTab] = useState<'meta_validator' | 'config' | 'logs' | 'signature' | 'subscriptions' | 'retries'>('meta_validator');
  const [systemSubTab, setSystemSubTab] = useState<'database' | 'deploy' | 'rate_limits' | 'audit'>('database');
  const [channelsSubView, setChannelsSubView] = useState<'overview' | 'token_validator'>('overview');

  // Track Webhook Connection Status for tab badge
  const [currentWebhookStatus, setCurrentWebhookStatus] = useState<'verified' | 'pending' | 'error'>(() => {
    try {
      const saved = localStorage.getItem('manyflow_webhook_status');
      if (saved === 'verified' || saved === 'pending' || saved === 'error') return saved;
    } catch {}
    return 'verified';
  });

  // Sync webhook status from storage periodically
  useEffect(() => {
    const checkStatus = () => {
      try {
        const saved = localStorage.getItem('manyflow_webhook_status');
        if (saved === 'verified' || saved === 'pending' || saved === 'error') {
          setCurrentWebhookStatus(saved);
        }
      } catch {}
    };
    window.addEventListener('storage', checkStatus);
    const timer = setInterval(checkStatus, 2000);
    return () => {
      window.removeEventListener('storage', checkStatus);
      clearInterval(timer);
    };
  }, []);

  const [formData, setFormData] = useState<BotKnowledgeBase>(knowledgeBase);
  const [isSaved, setIsSaved] = useState(false);

  // Sync tech mode changes to localStorage
  const handleToggleTechMode = () => {
    const nextMode = !isTechMode;
    setIsTechMode(nextMode);
    try {
      localStorage.setItem('manyflow_tech_mode', String(nextMode));
    } catch {
      // ignore
    }

    // If currently on a tech-only tab and turning off, gracefully redirect to essential channels
    if (!nextMode && ['graph_api', 'webhooks', 'system'].includes(activeTab)) {
      setActiveTab('channels');
    }
  };

  const handleSave = () => {
    onUpdateKnowledgeBase(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div id="settings_hub_view" className="flex-1 flex flex-col h-full bg-[#F8F9FB] p-6 lg:p-8 overflow-y-auto space-y-6 select-none">
      {/* Top Header with Tech Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900">
                Configurações & Conexões
              </h1>
              {isTechMode ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-indigo-600" />
                  Modo Técnico Ativo
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Manutenção Essencial
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isTechMode 
                ? 'Painel estendido com acesso a Webhooks brutos, Graph API Explorer, HMAC e Infraestrutura de Servidor.' 
                : 'Gerenciamento focado dos canais de atendimento, Inteligência Artificial, equipe e domínio.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Quick 1-Click Backup Export Button in Header */}
          <button
            id="btn_header_quick_backup"
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
              activeTab === 'backup'
                ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
            title="Acessar utilitário de exportação e backup em 1 clique"
          >
            <Download className={`w-3.5 h-3.5 ${activeTab === 'backup' ? 'text-white' : 'text-blue-600'}`} />
            <span>Backup & Exportar</span>
          </button>

          {/* AI Save button if in AI tab */}
          {activeTab === 'meta_ai' && (
            <button
              onClick={handleSave}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Configurações Salvas!' : 'Salvar Alterações'}</span>
            </button>
          )}

          {/* Modo Técnico Toggle Button */}
          <button
            id="btn_toggle_technical_mode"
            onClick={handleToggleTechMode}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer border shadow-2xs ${
              isTechMode
                ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-950 shadow-slate-900/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Alternar entre modo essencial simples e modo avançado para desenvolvedores"
          >
            <div className="flex items-center gap-1.5">
              <Code2 className={`w-3.5 h-3.5 ${isTechMode ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>Modo Técnico</span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
              isTechMode ? 'bg-indigo-600' : 'bg-slate-300'
            }`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                isTechMode ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </button>
        </div>
      </div>

      {/* Smart Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 overflow-x-auto">
        {/* ESSENTIAL TAB 1: CANAIS & CONEXÕES */}
        <button
          id="tab_settings_channels"
          onClick={() => setActiveTab('channels')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'channels'
              ? 'border-blue-600 text-blue-900 bg-blue-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Facebook className="w-4 h-4 text-blue-600" />
          <span>Canais & Conexões</span>
          <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            4 Conectados
          </span>
        </button>

        {/* ESSENTIAL TAB: STATUS DE CONEXÃO DOS WEBHOOKS (VERIFICADO / PENDENTE) */}
        <button
          id="tab_settings_webhook_status"
          onClick={() => setActiveTab('webhook_status')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'webhook_status'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-600" />
          <span>Status do Webhook</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 border ${
            currentWebhookStatus === 'verified'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-amber-100 text-amber-800 border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              currentWebhookStatus === 'verified' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`} />
            {currentWebhookStatus === 'verified' ? 'Verificado' : 'Pendente'}
          </span>
        </button>

        {/* ESSENTIAL TAB: CONFIGURAÇÃO DE WEBHOOKS & EVENTOS DE CONVERSÃO */}
        <button
          id="tab_settings_webhook_config"
          onClick={() => setActiveTab('webhook_config')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'webhook_config'
              ? 'border-blue-600 text-blue-900 bg-blue-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Webhook className="w-4 h-4 text-blue-600" />
          <span>Configuração de Webhooks</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-blue-100 text-blue-800">
            {webhookSettings?.conversionEndpoints?.length || 0} URLs
          </span>
        </button>

        {/* ESSENTIAL TAB 2: MONITOR DE LOGS DE WEBHOOK (TEMPO REAL) */}
        <button
          id="tab_settings_webhook_logs"
          onClick={() => setActiveTab('webhook_logs')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'webhook_logs'
              ? 'border-indigo-600 text-indigo-900 bg-indigo-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Radio className="w-4 h-4 text-indigo-600" />
          <span>Logs de Webhook (Instagram & Messenger)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ao Vivo
          </span>
        </button>

        {/* ESSENTIAL TAB 2: PACOTES & MENSALIDADES (ADMIN CRUD) */}
        <button
          id="tab_settings_plans"
          onClick={() => setActiveTab('plans')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'plans'
              ? 'border-indigo-600 text-indigo-900 bg-indigo-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <CreditCard className="w-4 h-4 text-indigo-600" />
          <span>Pacotes & Mensalidades</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-indigo-100 text-indigo-800">
            Admin
          </span>
        </button>

        {/* ESSENTIAL TAB 3: AFILIADOS & REVENDA */}
        <button
          id="tab_settings_affiliates"
          onClick={() => setActiveTab('affiliates')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'affiliates'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Afiliados & Revenda</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
            30%-40%
          </span>
        </button>

        {/* ESSENTIAL TAB 4: INTELIGÊNCIA ARTIFICIAL */}
        <button
          id="tab_settings_meta_ai"
          onClick={() => setActiveTab('meta_ai')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'meta_ai'
              ? 'border-purple-600 text-purple-900 bg-purple-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Inteligência Artificial (IA)</span>
        </button>

        {/* ESSENTIAL TAB 5: MCP SERVER (MODEL CONTEXT PROTOCOL) */}
        <button
          id="tab_settings_mcp"
          onClick={() => setActiveTab('mcp')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'mcp'
              ? 'border-indigo-600 text-indigo-900 bg-indigo-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-600" />
          <span>MCP Server (Model Context Protocol)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-purple-100 text-purple-800 flex items-center gap-1 border border-purple-200">
            <Bot className="w-2.5 h-2.5" />
            Claude & Cursor
          </span>
        </button>

        {/* ESSENTIAL TAB 3: BACKUP & PORTABILIDADE (1-CLIQUE) */}
        <button
          id="tab_settings_backup"
          onClick={() => setActiveTab('backup')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'backup'
              ? 'border-blue-600 text-blue-900 bg-blue-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <HardDrive className="w-4 h-4 text-blue-600" />
          <span>Backup & Exportação</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
            1-Clique
          </span>
        </button>

        {/* ESSENTIAL TAB 4: EQUIPE */}
        <button
          id="tab_settings_team"
          onClick={() => setActiveTab('team')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'team'
              ? 'border-indigo-600 text-indigo-900 bg-indigo-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Equipe & Acessos</span>
        </button>

        {/* ESSENTIAL TAB 5: CAMPOS & CRM */}
        <button
          id="tab_settings_custom_fields"
          onClick={() => setActiveTab('custom_fields')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'custom_fields'
              ? 'border-blue-600 text-blue-900 bg-blue-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Variable className="w-4 h-4 text-blue-600" />
          <span>Campos & CRM</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
            {customFields.length}
          </span>
        </button>

        {/* ESSENTIAL TAB 6: DOMÍNIOS & MARCA */}
        <button
          id="tab_settings_domains"
          onClick={() => setActiveTab('domains')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'domains'
              ? 'border-blue-600 text-blue-900 bg-blue-50/70 rounded-t-xl font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-600" />
          <span>Domínios & Marca</span>
        </button>

        {/* TECHNICAL DEVELOPER TABS (Rendered only when isTechMode === true) */}
        {isTechMode && (
          <>
            {/* Visual separator */}
            <div className="h-5 w-px bg-slate-300 mx-2 self-center shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider shrink-0 border border-indigo-200">
                Dev
              </span>

              {/* TECH TAB 1: META GRAPH API & APPS */}
              <button
                id="tab_settings_graph_api"
                onClick={() => setActiveTab('graph_api')}
                className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'graph_api'
                    ? 'border-indigo-600 text-indigo-900 bg-indigo-50/80 rounded-t-xl font-black'
                    : 'border-transparent text-indigo-700/80 hover:text-indigo-900 hover:bg-indigo-50/40 rounded-t-lg'
                }`}
              >
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>Meta Graph API & Apps</span>
              </button>

              {/* TECH TAB 2: WEBHOOKS & HMAC */}
              <button
                id="tab_settings_webhooks"
                onClick={() => setActiveTab('webhooks')}
                className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'webhooks'
                    ? 'border-indigo-600 text-indigo-900 bg-indigo-50/80 rounded-t-xl font-black'
                    : 'border-transparent text-indigo-700/80 hover:text-indigo-900 hover:bg-indigo-50/40 rounded-t-lg'
                }`}
              >
                <Webhook className="w-4 h-4 text-indigo-600" />
                <span>Webhooks & HMAC</span>
              </button>

              {/* TECH TAB 3: INFRAESTRUTURA & SISTEMA */}
              <button
                id="tab_settings_system"
                onClick={() => setActiveTab('system')}
                className={`pb-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'system'
                    ? 'border-slate-800 text-slate-900 bg-slate-200/80 rounded-t-xl font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-lg'
                }`}
              >
                <Server className="w-4 h-4 text-slate-700" />
                <span>Servidor & Deploy</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. ESSENTIAL TAB: CANAIS & CONEXÕES                      */}
      {/* ========================================================= */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          {/* Sub-selector for simple maintenance vs token validator */}
          <div className="flex items-center justify-between gap-3 bg-white p-1.5 rounded-xl border border-slate-200 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setChannelsSubView('overview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  channelsSubView === 'overview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Visão dos Canais Ativos
              </button>
              <button
                onClick={() => setChannelsSubView('token_validator')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  channelsSubView === 'token_validator'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Validador & Renovador de Token (1-Clique)</span>
              </button>
              <button
                id="btn_channels_jump_to_webhook_status"
                onClick={() => setActiveTab('webhook_status')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Status de Conexão Webhooks</span>
              </button>
              <button
                id="btn_channels_jump_to_webhook_logs"
                onClick={() => setActiveTab('webhook_logs')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>Monitor de Webhooks Meta (Ao Vivo)</span>
              </button>
              <button
                id="btn_channels_jump_to_mcp"
                onClick={() => setActiveTab('mcp')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-purple-600" />
                <span>Servidor MCP (Claude & Cursor)</span>
              </button>
            </div>

            {/* Quick Helper to Tech Mode */}
            {!isTechMode && (
              <button
                onClick={() => {
                  setIsTechMode(true);
                  setActiveTab('graph_api');
                }}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <span>Configuração avançada de App ID / Graph API</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {channelsSubView === 'overview' ? (
            <div className="space-y-5">
              {/* Omnichannel Pre-defined Appointments Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5 shadow-xs">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Motor de Agendamento Pré-Definido & Omnichannel
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Ativo nos 5 Canais
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Todos os canais de atendimento conectados (Instagram, WhatsApp, Messenger, Telegram e Live Chat) já contam com fluxos de agendamento automático integrados aos gatilhos de palavras-chave.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-slate-500">
                    Sincronizado com Google Calendar & CRM
                  </span>
                </div>
              </div>

              {/* Connected channels grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Instagram Channel */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 border border-pink-200">
                          <Instagram className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Instagram Direct</h4>
                          <span className="text-xs text-slate-500 font-medium">@manyflow.oficial</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Conectado
                      </span>
                    </div>
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Permissões:</span>
                        <span className="font-semibold text-slate-800">Mensagens, Comentários, Stories</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status da Sessão:</span>
                        <span className="font-bold text-emerald-600">Token Válido (Permanente)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => setChannelsSubView('token_validator')}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-3 h-3" />
                      <span>Verificar Token</span>
                    </button>
                  </div>
                </div>

                {/* Facebook Page Channel */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                          <Facebook className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Facebook Messenger</h4>
                          <span className="text-xs text-slate-500 font-medium">ManyFlow Soluções Digitais</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Conectado
                      </span>
                    </div>
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>ID da Página:</span>
                        <span className="font-mono font-semibold text-slate-800">1084920492</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Webhooks Subscritos:</span>
                        <span className="font-semibold text-slate-800">messages, messaging_postbacks</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => setChannelsSubView('token_validator')}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-3 h-3" />
                      <span>Renovar / Testar</span>
                    </button>
                  </div>
                </div>

                {/* WhatsApp Hybrid Channel */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">WhatsApp Híbrido</h4>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase">
                              Cloud + Baileys
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">+55 (11) 98765-4321 • 32 Grupos</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        100% Online
                      </span>
                    </div>
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Recepção Oficial:</span>
                        <span className="font-semibold text-emerald-700">Meta Cloud API</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disparo & Grupos:</span>
                        <span className="font-semibold text-emerald-700">Baileys Engine</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <span className="text-[11px] text-slate-400 self-center">Sessão estável há 42 dias</span>
                  </div>
                </div>

                {/* Telegram Bot Channel */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                          <Radio className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Telegram Bot</h4>
                          <span className="text-xs text-slate-500 font-medium">@ManyFlowOfficialBot</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Conectado
                      </span>
                    </div>
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Webhook Telegram:</span>
                        <span className="font-semibold text-slate-800">Ativo (Porta 443 SSL)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comandos:</span>
                        <span className="font-semibold text-slate-800">/start, botões interativos</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <span className="text-[11px] text-slate-400 self-center">Bot API v7.2</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Callout Banner */}
              {!isTechMode && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300 shrink-0">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Precisa de configurações de desenvolvedor?</h4>
                      <p className="text-[11px] text-slate-300">
                        Ative o <strong>Modo Técnico</strong> para acessar o Graph API Debugger, validação HMAC SHA-256, logs brutos e deploy MongoDB.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsTechMode(true);
                      setActiveTab('graph_api');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    Ativar Modo Técnico
                  </button>
                </div>
              )}
            </div>
          ) : (
            <MetaTokenValidator 
              onOpenWizard={() => {
                setIsTechMode(true);
                setActiveTab('graph_api');
                setFacebookSubTab('wizard');
              }} 
            />
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ESSENTIAL TAB: STATUS DE CONEXÃO DOS WEBHOOKS             */}
      {/* ========================================================= */}
      {activeTab === 'webhook_status' && (
        <div className="space-y-4">
          <WebhookStatusManager
            webhookSettings={webhookSettings}
            onUpdateWebhookSettings={onUpdateWebhookSettings}
            onOpenLogs={() => setActiveTab('webhook_logs')}
            onOpenConfig={() => setActiveTab('webhook_config')}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* ESSENTIAL TAB: CONFIGURAÇÃO DE WEBHOOKS (CONVERSÕES)     */}
      {/* ========================================================= */}
      {activeTab === 'webhook_config' && (
        <div className="space-y-4">
          <WebhookConfigManager
            settings={webhookSettings || {
              globalVerifyToken: 'manyflow_verify_token_secure_2026',
              appSecret: 'mf_sec_89df2a3bc7e1480f90ab12d',
              serverBaseUrl: window.location.origin + '/api/webhooks',
              enableLogging: true,
              verificationStatus: 'verified',
              autoRetryFailed: true,
              maxRetryAttempts: 3,
              activeFields: ['messages', 'messaging_postbacks'],
              conversionEndpoints: []
            }}
            onUpdateSettings={(updated) => {
              if (onUpdateWebhookSettings) {
                onUpdateWebhookSettings(updated);
              }
            }}
            onOpenLogs={() => setActiveTab('webhook_logs')}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ESSENTIAL TAB: MONITOR DE LOGS DE WEBHOOK (TEMPO REAL) */}
      {/* ========================================================= */}
      {activeTab === 'webhook_logs' && (
        <div className="space-y-4">
          <WebhookLogsViewer
            onOpenFlow={onOpenFlow}
            onOpenLiveChat={onOpenLiveChat}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2.5 ESSENTIAL TAB: MCP SERVER (MODEL CONTEXT PROTOCOL)    */}
      {/* ========================================================= */}
      {activeTab === 'mcp' && (
        <div className="space-y-4">
          <McpServerHub />
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ESSENTIAL TAB: PACOTES & MENSALIDADES (ADMIN CRUD)     */}
      {/* ========================================================= */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <PlansPackagesManager />
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ESSENTIAL TAB: SISTEMA DE AFILIADOS & REVENDA          */}
      {/* ========================================================= */}
      {activeTab === 'affiliates' && (
        <div className="space-y-4">
          <AffiliateResellerHub />
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ESSENTIAL TAB: INTELIGÊNCIA ARTIFICIAL (IA)            */}
      {/* ========================================================= */}
      {activeTab === 'meta_ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Channels AI Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Canais Integrados com IA</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <span className="font-semibold text-slate-800">Instagram Direct</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Ativo
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-800">Facebook Messenger</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Ativo
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">WhatsApp Oficial</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Ativo
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  O robô utilizará as diretrizes ao lado para responder dúvidas, qualificar leads e agendar atendimentos humanos.
                </p>
              </div>
            </div>

            {/* MCP Banner */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-700/60 rounded-2xl p-4 text-white shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-bold text-white">Servidor MCP (Claude & Cursor)</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                Controle o ManyFlow diretamente do Claude Desktop ou Cursor IDE com ferramentas para ler leads, disparar fluxos e enviar mensagens.
              </p>
              <button
                onClick={() => setActiveTab('mcp')}
                className="w-full py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer"
              >
                <span>Abrir Hub MCP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: AI Knowledge Base Editor */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Diretrizes de Negócio & Conhecimento da IA
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                Gemini 2.5 Flash
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Resumo da Sua Empresa & Serviços Principais
                </label>
                <textarea
                  rows={3}
                  value={formData.businessSummary}
                  onChange={(e) => setFormData({ ...formData, businessSummary: e.target.value })}
                  placeholder="Ex: Somos uma agência especializada em automação de vendas pelo Instagram e WhatsApp..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Produtos, Planos, Preços e Links de Compra
                </label>
                <textarea
                  rows={3}
                  value={formData.productsAndPricing}
                  onChange={(e) => setFormData({ ...formData, productsAndPricing: e.target.value })}
                  placeholder="Ex: Plano Starter R$ 97/mês, Plano Pro R$ 197/mês. Link de pagamento: ..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Tom de Voz da IA
                  </label>
                  <select
                    value={formData.toneOfVoice}
                    onChange={(e) => setFormData({ ...formData, toneOfVoice: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="friendly">Simpático & Consultivo</option>
                    <option value="professional">Formal & Corporativo</option>
                    <option value="energetic">Jovem & Descontraído</option>
                    <option value="minimalist">Focado em Vendas Diretas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Horário de Suporte Humano
                  </label>
                  <input
                    type="text"
                    value={formData.workingHours}
                    onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                    placeholder="Ex: Seg a Sex, das 09h às 18h"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ESSENTIAL TAB: BACKUP & PORTABILIDADE (1-CLIQUE)       */}
      {/* ========================================================= */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <BackupExportManager
            flows={flows}
            contacts={contacts}
            customFields={customFields}
            knowledgeBase={knowledgeBase}
            triggers={triggers}
            growthTools={growthTools}
            broadcasts={broadcasts}
            webhookSettings={webhookSettings}
            onRestoreBackup={onRestoreBackup}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ESSENTIAL TAB: EQUIPE & ACESSOS                        */}
      {/* ========================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <TeamUserManager />
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ESSENTIAL TAB: CAMPOS & CRM                            */}
      {/* ========================================================= */}
      {activeTab === 'custom_fields' && (
        <div className="space-y-4">
          <CustomFieldsManager
            customFields={customFields}
            onUpdateCustomFields={onUpdateCustomFields}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. ESSENTIAL TAB: DOMÍNIOS & MARCA                        */}
      {/* ========================================================= */}
      {activeTab === 'domains' && (
        <div className="space-y-4">
          <DomainManager isTechnicalMode={isTechMode} />
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. TECH TAB: META GRAPH API & APPS                        */}
      {/* ========================================================= */}
      {isTechMode && activeTab === 'graph_api' && (
        <div className="space-y-4">
          {/* Sub-selector */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 flex-wrap">
            <button
              onClick={() => setFacebookSubTab('token_validator')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                facebookSubTab === 'token_validator'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Validador de Token Profundo</span>
            </button>
            <button
              onClick={() => setFacebookSubTab('graph_api')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                facebookSubTab === 'graph_api'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Páginas & Graph API Explorer
            </button>
            <button
              onClick={() => setFacebookSubTab('apps')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                facebookSubTab === 'apps'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Meta Apps Cadastrados
            </button>
            <button
              onClick={() => setFacebookSubTab('wizard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                facebookSubTab === 'wizard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assistente de Criação de App</span>
            </button>
          </div>

          {facebookSubTab === 'token_validator' && (
            <MetaTokenValidator onOpenWizard={() => setFacebookSubTab('wizard')} />
          )}
          {facebookSubTab === 'graph_api' && (
            <FacebookGraphApiManager />
          )}
          {facebookSubTab === 'apps' && (
            <FacebookAppsManager onOpenWizard={() => setFacebookSubTab('wizard')} />
          )}
          {facebookSubTab === 'wizard' && (
            <MetaAppSetupWizard onAppCreated={() => setFacebookSubTab('apps')} />
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. TECH TAB: WEBHOOKS & HMAC                              */}
      {/* ========================================================= */}
      {isTechMode && activeTab === 'webhooks' && (
        <div className="space-y-4">
          {/* Sub-selector */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 flex-wrap">
            <button
              onClick={() => setWebhooksSubTab('meta_validator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                webhooksSubTab === 'meta_validator'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Webhook className="w-3.5 h-3.5" />
              <span>Validador Meta Webhook (Instagram/Messenger)</span>
            </button>
            <button
              onClick={() => setWebhooksSubTab('config')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                webhooksSubTab === 'config'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Endpoints & URLs
            </button>
            <button
              onClick={() => setWebhooksSubTab('logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                webhooksSubTab === 'logs'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Logs ao Vivo</span>
            </button>
            <button
              onClick={() => setWebhooksSubTab('signature')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                webhooksSubTab === 'signature'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HMAC SHA-256
            </button>
            <button
              onClick={() => setWebhooksSubTab('subscriptions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                webhooksSubTab === 'subscriptions'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Subscrições de Campos
            </button>
            <button
              onClick={() => setWebhooksSubTab('retries')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                webhooksSubTab === 'retries'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Política de Retentativas
            </button>
          </div>

          {webhooksSubTab === 'meta_validator' && (
            <MetaWebhooksValidator />
          )}
          {webhooksSubTab === 'config' && (
            <WebhooksManager
              initialSettings={webhookSettings}
              onSaveSettings={onUpdateWebhookSettings}
              onOpenFlow={onOpenFlow}
              onOpenLiveChat={onOpenLiveChat}
            />
          )}
          {webhooksSubTab === 'logs' && (
            <WebhookLogsViewer
              onOpenFlow={onOpenFlow}
              onOpenLiveChat={onOpenLiveChat}
            />
          )}
          {webhooksSubTab === 'signature' && (
            <WebhookSignatureTool />
          )}
          {webhooksSubTab === 'subscriptions' && (
            <WebhookSubscriptions />
          )}
          {webhooksSubTab === 'retries' && (
            <WebhookRetryPolicyManager />
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. TECH TAB: INFRAESTRUTURA & SISTEMA                     */}
      {/* ========================================================= */}
      {isTechMode && activeTab === 'system' && (
        <div className="space-y-4">
          {/* Sub-selector */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 flex-wrap">
            <button
              onClick={() => setSystemSubTab('database')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                systemSubTab === 'database'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Banco de Dados MongoDB
            </button>
            <button
              onClick={() => setSystemSubTab('deploy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                systemSubTab === 'deploy'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deploy em Produção (aaPanel/Nginx)
            </button>
            <button
              onClick={() => setSystemSubTab('rate_limits')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                systemSubTab === 'rate_limits'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monitor de Quota & Rate Limit
            </button>
            <button
              onClick={() => setSystemSubTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                systemSubTab === 'audit'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Auditoria de Logs de Sistema
            </button>
          </div>

          {systemSubTab === 'database' && <DatabaseManager />}
          {systemSubTab === 'deploy' && <ProductionDeployHub />}
          {systemSubTab === 'rate_limits' && <FacebookRateLimitMonitor />}
          {systemSubTab === 'audit' && <ActivityLogsViewer />}
        </div>
      )}
    </div>
  );
};
