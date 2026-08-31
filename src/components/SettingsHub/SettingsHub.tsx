import React, { useState } from 'react';
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
  MessageCircle
} from 'lucide-react';
import { BotKnowledgeBase, CustomFieldDefinition, WebhookSettingsState } from '../../types';
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
import { MasterSecurityManager } from './MasterSecurityManager';
import { ExternalMessageWebhooksManager } from './ExternalMessageWebhooksManager';
import { WebhookSignatureTool } from './WebhookSignatureTool';
import { WebhookRetryPolicyManager } from './WebhookRetryPolicyManager';
import { FacebookGraphApiManager } from './FacebookGraphApiManager';
import { Users, FileText, KeyRound, RotateCcw } from 'lucide-react';

interface SettingsHubProps {
  knowledgeBase: BotKnowledgeBase;
  onUpdateKnowledgeBase: (kb: BotKnowledgeBase) => void;
  customFields: CustomFieldDefinition[];
  onUpdateCustomFields: (fields: CustomFieldDefinition[]) => void;
  webhookSettings?: WebhookSettingsState;
  onUpdateWebhookSettings?: (settings: WebhookSettingsState) => void;
  onOpenFlow?: (flowId: string) => void;
  onOpenLiveChat?: (contactId: string) => void;
}

export const SettingsHub: React.FC<SettingsHubProps> = ({
  knowledgeBase,
  onUpdateKnowledgeBase,
  customFields,
  onUpdateCustomFields,
  webhookSettings,
  onUpdateWebhookSettings,
  onOpenFlow,
  onOpenLiveChat
}) => {
  const [activeTab, setActiveTab] = useState<'master_security' | 'facebook_graph' | 'webhook_retries' | 'webhook_signatures' | 'external_message_webhooks' | 'activity_logs' | 'webhook_subscriptions' | 'production' | 'fb_apps' | 'domains' | 'team' | 'rate_limits' | 'webhook_logs' | 'webhooks' | 'custom_fields' | 'database' | 'meta_ai'>('facebook_graph');
  const [formData, setFormData] = useState<BotKnowledgeBase>(knowledgeBase);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdateKnowledgeBase(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div id="settings_hub_view" className="flex-1 flex flex-col h-full bg-[#F8F9FB] p-6 lg:p-8 overflow-y-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1A1D21] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#64748B]" />
            <span>Configurações, Multi-Domínio & Produção</span>
          </h2>
          <p className="text-xs text-[#64748B]">
            Gerencie múltiplos domínios em servidor único, logs de webhooks em tempo real, banco MongoDB, deploy para aaPanel e cotas Meta API.
          </p>
        </div>

        {activeTab === 'meta_ai' && (
          <button
            onClick={handleSave}
            className="py-2 px-5 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Configurações Salvas!' : 'Salvar Alterações'}</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-1 overflow-x-auto">
        <button
          id="tab_settings_master_security"
          onClick={() => setActiveTab('master_security')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'master_security'
              ? 'border-amber-500 text-amber-900 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/40 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-500" />
          <span>Segurança Master & Senha Central</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
            Root Admin
          </span>
        </button>

        <button
          id="tab_settings_facebook_graph"
          onClick={() => setActiveTab('facebook_graph')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'facebook_graph'
              ? 'border-blue-600 text-blue-900 dark:text-blue-200 bg-blue-50/80 dark:bg-blue-950/40 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Facebook className="w-4 h-4 text-blue-600" />
          <span>Facebook Graph API (Páginas & Tokens)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300">
            v21.0 Oficial
          </span>
        </button>

        <button
          id="tab_settings_webhook_retries"
          onClick={() => setActiveTab('webhook_retries')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'webhook_retries'
              ? 'border-indigo-600 text-indigo-900 dark:text-indigo-200 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-indigo-600" />
          <span>Políticas de Retry (Backoff & DLQ)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-300">
            Resiliência
          </span>
        </button>

        <button
          id="tab_settings_webhook_signatures"
          onClick={() => setActiveTab('webhook_signatures')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'webhook_signatures'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Assinatura & Secret (Validação HMAC)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            Genuinidade
          </span>
        </button>

        <button
          id="tab_settings_external_message_webhooks"
          onClick={() => setActiveTab('external_message_webhooks')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'external_message_webhooks'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Webhooks & Callbacks Externos</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200">
            Recepção de Mensagens
          </span>
        </button>

        <button
          id="tab_settings_activity_logs"
          onClick={() => setActiveTab('activity_logs')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'activity_logs'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Logs de Atividade (Auditoria)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Audit Trail
          </span>
        </button>

        <button
          id="tab_settings_webhook_subscriptions"
          onClick={() => setActiveTab('webhook_subscriptions')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'webhook_subscriptions'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Webhook className="w-4 h-4 text-indigo-600" />
          <span>Subscrições de Webhook</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-900">
            Event-Driven
          </span>
        </button>

        <button
          id="tab_settings_fb_apps"
          onClick={() => setActiveTab('fb_apps')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'fb_apps'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Facebook className="w-4 h-4 text-blue-600" />
          <span>Apps Meta / Facebook (Multi-App)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900">
            Multi-Contas
          </span>
        </button>

        <button
          id="tab_settings_production"
          onClick={() => setActiveTab('production')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'production'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Rocket className="w-4 h-4 text-emerald-600" />
          <span>Deploy & Produção (aaPanel)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900">
            98% Pronto
          </span>
        </button>

        <button
          id="tab_settings_webhook_logs"
          onClick={() => setActiveTab('webhook_logs')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'webhook_logs'
              ? 'border-[#0084FF] text-[#0084FF] bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Terminal className="w-4 h-4 text-[#0084FF]" />
          <span>Logs de Webhook (Tempo Real)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ao Vivo
          </span>
        </button>

        <button
          id="tab_settings_webhooks"
          onClick={() => setActiveTab('webhooks')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'webhooks'
              ? 'border-[#0084FF] text-[#0084FF]'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Webhook className="w-4 h-4 text-blue-600" />
          <span>Webhooks Meta (Configuração)</span>
        </button>

        <button
          id="tab_settings_rate_limits"
          onClick={() => setActiveTab('rate_limits')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'rate_limits'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-600" />
          <span>Monitor de Rate Limits (Meta API)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            14% Seguro
          </span>
        </button>

        <button
          id="tab_settings_domains"
          onClick={() => setActiveTab('domains')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'domains'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-600" />
          <span>Domínios & Multi-Tenant</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
            1 Banco Único
          </span>
        </button>

        <button
          id="tab_settings_team"
          onClick={() => setActiveTab('team')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'team'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Equipe & Permissões (RBAC)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
            Multi-User
          </span>
        </button>

        <button
          id="tab_settings_custom_fields"
          onClick={() => setActiveTab('custom_fields')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'custom_fields'
              ? 'border-[#0084FF] text-[#0084FF]'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Variable className="w-4 h-4" />
          <span>Campos Personalizados</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
            {customFields.length}
          </span>
        </button>

        <button
          id="tab_settings_database"
          onClick={() => setActiveTab('database')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'database'
              ? 'border-[#0084FF] text-[#0084FF]'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Database className="w-4 h-4 text-indigo-600" />
          <span>MongoDB & Pooler</span>
        </button>

        <button
          id="tab_settings_meta_ai"
          onClick={() => setActiveTab('meta_ai')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'meta_ai'
              ? 'border-[#0084FF] text-[#0084FF]'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Conexões Meta & IA</span>
        </button>
      </div>

      {/* Tab: MASTER SECURITY MANAGER (ROOT ACCESS & LOCKDOWN) */}
      {activeTab === 'master_security' && (
        <MasterSecurityManager />
      )}

      {/* Tab: FACEBOOK GRAPH API & PAGE LINKING (SCOPES & LONG-LIVED TOKENS) */}
      {activeTab === 'facebook_graph' && (
        <FacebookGraphApiManager />
      )}

      {/* Tab: WEBHOOK SIGNATURE & SECRET TOOL (HMAC VALIDATION & GENUINE CHECK) */}
      {activeTab === 'webhook_signatures' && (
        <WebhookSignatureTool />
      )}

      {/* Tab: WEBHOOK RETRY POLICIES & EXPONENTIAL BACKOFF */}
      {activeTab === 'webhook_retries' && (
        <WebhookRetryPolicyManager />
      )}

      {/* Tab: EXTERNAL MESSAGE WEBHOOKS & AUTHENTICATION CALLBACKS */}
      {activeTab === 'external_message_webhooks' && (
        <ExternalMessageWebhooksManager />
      )}

      {/* Tab: ACTIVITY AUDIT LOGS (AUDIT TRAIL) */}
      {activeTab === 'activity_logs' && (
        <ActivityLogsViewer />
      )}

      {/* Tab: WEBHOOK SUBSCRIPTIONS (EVENT-DRIVEN DISPATCH) */}
      {activeTab === 'webhook_subscriptions' && (
        <WebhookSubscriptions />
      )}

      {/* Tab: MULTI-APP FACEBOOK / META DEVELOPER APPS */}
      {activeTab === 'fb_apps' && (
        <FacebookAppsManager />
      )}

      {/* Tab: PRODUCTION DEPLOY & AUDIT */}
      {activeTab === 'production' && (
        <ProductionDeployHub />
      )}

      {/* Tab: WEBHOOK REAL-TIME LOGS VIEWER */}
      {activeTab === 'webhook_logs' && (
        <WebhookLogsViewer
          onOpenFlow={onOpenFlow}
          onOpenLiveChat={onOpenLiveChat}
        />
      )}

      {/* Tab: MULTI-DOMAIN & WHITE-LABEL */}
      {activeTab === 'domains' && (
        <DomainManager />
      )}

      {/* Tab: TEAM & RBAC PERMISSIONS */}
      {activeTab === 'team' && (
        <TeamUserManager />
      )}

      {/* Tab: RATE LIMITS MONITOR */}
      {activeTab === 'rate_limits' && (
        <FacebookRateLimitMonitor />
      )}

      {/* Tab: CUSTOM FIELDS MANAGER */}
      {activeTab === 'custom_fields' && (
        <CustomFieldsManager
          customFields={customFields}
          onUpdateCustomFields={onUpdateCustomFields}
        />
      )}

      {/* Tab: DATABASE & CONNECTION POOLER MANAGER */}
      {activeTab === 'database' && (
        <DatabaseManager />
      )}

      {/* Tab: WEBHOOKS MANAGER WITH MONGODB PERSISTENCE */}
      {activeTab === 'webhooks' && (
        <WebhooksManager
          initialSettings={webhookSettings}
          onSaveSettings={onUpdateWebhookSettings}
          onOpenFlow={onOpenFlow}
          onOpenLiveChat={onOpenLiveChat}
        />
      )}

      {/* Tab 3: META CONNECTIONS & AI KNOWLEDGE */}
      {activeTab === 'meta_ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Meta Connections */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Contas Meta Conectadas</span>
              </h3>

              {/* Instagram Account */}
              <div className="p-4 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-pink-50 text-pink-600 border border-pink-200">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1D21]">@manyflow.oficial</h4>
                      <span className="text-[10px] text-[#64748B]">Instagram Profissional / Creator</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Conectado
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Permissões ativas: <code className="font-mono text-gray-600">instagram_manage_messages</code>, <code className="font-mono text-gray-600">instagram_manage_comments</code>.
                </p>
              </div>

              {/* Facebook Page */}
              <div className="p-4 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                      <Facebook className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1D21]">ManyFlow Soluções Digitais</h4>
                      <span className="text-[10px] text-[#64748B]">Página do Facebook ID: 1084920492</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Conectado
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Permissões ativas: <code className="font-mono text-gray-600">pages_messaging</code>, <code className="font-mono text-gray-600">pages_manage_metadata</code>.
                </p>
              </div>

              {/* WhatsApp Hybrid Engine (Cloud API + Baileys) */}
              <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#1A1D21]">WhatsApp Híbrido</h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                          Cloud API + Baileys
                        </span>
                      </div>
                      <span className="text-[10px] text-[#64748B]">+55 (11) 98765-4321 • 32 Grupos Ativos</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    100% Online
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-white/80 p-2 rounded border border-emerald-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Recepção de Dados</span>
                    <span className="font-bold text-emerald-700">Meta Cloud API (Oficial)</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded border border-emerald-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Envio & Grupos</span>
                    <span className="font-bold text-emerald-700">Baileys Engine (Admin)</span>
                  </div>
                </div>
              </div>

              {/* Telegram Bot */}
              <div className="p-4 rounded-lg bg-sky-50/40 border border-sky-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-sky-500 text-white shadow-xs">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1D21]">@ManyFlowOfficialBot</h4>
                      <span className="text-[10px] text-[#64748B]">Telegram Bot API v7.2</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    Conectado
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Webhook registrado e ouvindo comandos <code className="font-mono text-sky-700">/start</code>, inline buttons e canais.
                </p>
              </div>

              {/* Webhook Configuration Info */}
              <div className="pt-2 border-t border-[#E2E8F0] space-y-2 text-xs">
                <span className="font-semibold text-[#1A1D21] block">Webhook Callback URL</span>
                <div className="p-2.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] font-mono text-[11px] text-[#0084FF] select-all truncate">
                  https://api.manyflow.app/webhooks/meta-messenger
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Knowledge Base */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-[#1A1D21]">
                  Base de Conhecimento do Robô IA (Gemini 2.5)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                Auto-Aprendizado
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Resumo da Sua Empresa & Serviços
                </label>
                <textarea
                  rows={3}
                  value={formData.businessSummary}
                  onChange={(e) => setFormData({ ...formData, businessSummary: e.target.value })}
                  className="w-full p-3 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Produtos, Planos e Preços
                </label>
                <textarea
                  rows={3}
                  value={formData.productsAndPricing}
                  onChange={(e) => setFormData({ ...formData, productsAndPricing: e.target.value })}
                  className="w-full p-3 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    Tom de Voz do Robô
                  </label>
                  <select
                    value={formData.toneOfVoice}
                    onChange={(e) => setFormData({ ...formData, toneOfVoice: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                  >
                    <option value="friendly">Simpático & Consultivo</option>
                    <option value="professional">Formal & Corporativo</option>
                    <option value="energetic">Jovem & Descontraído</option>
                    <option value="minimalist">Focado em Vendas Diretas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    Horário de Suporte Humano
                  </label>
                  <input
                    type="text"
                    value={formData.workingHours}
                    onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

