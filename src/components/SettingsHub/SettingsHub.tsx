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
  MessageCircle,
  Users,
  FileText,
  RotateCcw,
  Server
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
import { ExternalMessageWebhooksManager } from './ExternalMessageWebhooksManager';
import { WebhookSignatureTool } from './WebhookSignatureTool';
import { WebhookRetryPolicyManager } from './WebhookRetryPolicyManager';
import { FacebookGraphApiManager } from './FacebookGraphApiManager';
import { MetaAppSetupWizard } from './MetaAppSetupWizard';
import { MetaWebhooksValidator } from './MetaWebhooksValidator';
import { MetaTokenValidator } from './MetaTokenValidator';

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
  // Main simplified categories: 6 clean intuitive tabs
  const [activeTab, setActiveTab] = useState<'facebook' | 'webhooks' | 'meta_ai' | 'team_crm' | 'domains' | 'system'>('facebook');
  
  // Secondary sub-tab states for cleaner navigation
  const [facebookSubTab, setFacebookSubTab] = useState<'token_validator' | 'wizard' | 'apps' | 'graph_api'>('token_validator');
  const [webhooksSubTab, setWebhooksSubTab] = useState<'meta_validator' | 'config' | 'logs' | 'advanced'>('meta_validator');
  const [teamCrmSubTab, setTeamCrmSubTab] = useState<'team' | 'fields'>('team');
  const [systemSubTab, setSystemSubTab] = useState<'database' | 'deploy' | 'rate_limits' | 'audit'>('database');

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
            <span>Configurações & Conexões</span>
          </h2>
          <p className="text-xs text-[#64748B]">
            Gerencie páginas do Facebook/Instagram, webhooks de mensagens, equipe, domínios e inteligência artificial de forma simples.
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

      {/* Primary Tabs Navigation (Simplified Clean Tabs) */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-1 overflow-x-auto">
        <button
          id="tab_settings_facebook"
          onClick={() => setActiveTab('facebook')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'facebook'
              ? 'border-blue-600 text-blue-900 bg-blue-50/80 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Facebook className="w-4 h-4 text-blue-600" />
          <span>Facebook & Instagram</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200">
            Graph API v21.0
          </span>
        </button>

        <button
          id="tab_settings_webhooks"
          onClick={() => setActiveTab('webhooks')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'webhooks'
              ? 'border-indigo-600 text-indigo-900 bg-indigo-50/80 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Webhook className="w-4 h-4 text-indigo-600" />
          <span>Webhooks & Notificações</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ativo
          </span>
        </button>

        <button
          id="tab_settings_meta_ai"
          onClick={() => setActiveTab('meta_ai')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'meta_ai'
              ? 'border-purple-600 text-purple-800 bg-purple-50/70 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Inteligência Artificial (IA)</span>
        </button>

        <button
          id="tab_settings_team_crm"
          onClick={() => setActiveTab('team_crm')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'team_crm'
              ? 'border-indigo-600 text-indigo-800 bg-indigo-50/70 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Equipe & CRM</span>
        </button>

        <button
          id="tab_settings_domains"
          onClick={() => setActiveTab('domains')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'domains'
              ? 'border-blue-600 text-blue-800 bg-blue-50/70 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-600" />
          <span>Domínios & Marca</span>
        </button>

        <button
          id="tab_settings_system"
          onClick={() => setActiveTab('system')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-slate-800 text-slate-900 bg-slate-100 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Server className="w-4 h-4 text-slate-700" />
          <span>Servidor & Sistema</span>
        </button>
      </div>

      {/* 1. TAB: FACEBOOK & INSTAGRAM */}
      {activeTab === 'facebook' && (
        <div className="space-y-4">
          {/* Sub-selector */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 w-fit flex-wrap">
            <button
              onClick={() => setFacebookSubTab('token_validator')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                facebookSubTab === 'token_validator'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Validador & Renovador de Token</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-400 text-slate-900">
                1-Clique
              </span>
            </button>
            <button
              onClick={() => setFacebookSubTab('wizard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                facebookSubTab === 'wizard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assistente Passo a Passo</span>
            </button>
            <button
              onClick={() => setFacebookSubTab('apps')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                facebookSubTab === 'apps'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aplicativos Cadastrados
            </button>
            <button
              onClick={() => setFacebookSubTab('graph_api')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                facebookSubTab === 'graph_api'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Páginas & Graph API
            </button>
          </div>

          {facebookSubTab === 'token_validator' ? (
            <MetaTokenValidator onOpenWizard={() => setFacebookSubTab('wizard')} />
          ) : facebookSubTab === 'wizard' ? (
            <MetaAppSetupWizard
              onAppCreated={() => {
                setFacebookSubTab('apps');
              }}
            />
          ) : facebookSubTab === 'graph_api' ? (
            <FacebookGraphApiManager />
          ) : (
            <FacebookAppsManager onOpenWizard={() => setFacebookSubTab('wizard')} />
          )}
        </div>
      )}

      {/* 2. TAB: WEBHOOKS & NOTIFICAÇÕES */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          {/* Sub-selector */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 flex-wrap">
            <button
              onClick={() => setWebhooksSubTab('meta_validator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                webhooksSubTab === 'meta_validator'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Webhook className="w-3.5 h-3.5" />
              <span>Validador Webhook Meta (Instagram/Messenger)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-500 text-white">
                Live
              </span>
            </button>
            <button
              onClick={() => setWebhooksSubTab('config')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                webhooksSubTab === 'config'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Configurações & URLs
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
              onClick={() => setWebhooksSubTab('advanced')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                webhooksSubTab === 'advanced'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Avançado (HMAC & Subscrições)
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
          {webhooksSubTab === 'advanced' && (
            <div className="space-y-6">
              <WebhookSignatureTool />
              <WebhookSubscriptions />
              <WebhookRetryPolicyManager />
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: EQUIPE & CRM */}
      {activeTab === 'team_crm' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 w-fit">
            <button
              onClick={() => setTeamCrmSubTab('team')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                teamCrmSubTab === 'team' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Membros da Equipe & Permissões
            </button>
            <button
              onClick={() => setTeamCrmSubTab('fields')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                teamCrmSubTab === 'fields' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Campos Personalizados ({customFields.length})
            </button>
          </div>

          {teamCrmSubTab === 'team' ? (
            <TeamUserManager />
          ) : (
            <CustomFieldsManager
              customFields={customFields}
              onUpdateCustomFields={onUpdateCustomFields}
            />
          )}
        </div>
      )}

      {/* 6. TAB: INTELIGÊNCIA ARTIFICIAL */}
      {activeTab === 'meta_ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Meta Connections */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Canais Conectados</span>
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

              {/* WhatsApp Hybrid Engine */}
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
            </div>
          </div>

          {/* Right Column: AI Knowledge Base */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-[#1A1D21]">
                  Base de Conhecimento do Robô IA (Gemini & Meta AI)
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

      {/* 7. TAB: SERVIDOR & SISTEMA */}
      {activeTab === 'system' && (
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
              Deploy em Produção (aaPanel)
            </button>
            <button
              onClick={() => setSystemSubTab('rate_limits')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                systemSubTab === 'rate_limits'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monitor de Consumo Meta API
            </button>
            <button
              onClick={() => setSystemSubTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                systemSubTab === 'audit'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Auditoria de Logs
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
