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
  // Main simplified categories: 7 intuitive tabs for laypeople
  const [activeTab, setActiveTab] = useState<'facebook' | 'webhooks' | 'domains' | 'custom_fields' | 'team' | 'meta_ai' | 'system'>('facebook');
  
  // Secondary sub-tab states for cleaner navigation
  const [facebookSubTab, setFacebookSubTab] = useState<'graph_api' | 'apps'>('graph_api');
  const [webhooksSubTab, setWebhooksSubTab] = useState<'config' | 'events' | 'callbacks' | 'signatures' | 'retries' | 'logs'>('config');
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

      {/* Primary Tabs Navigation (Simplified 7 Essential Tabs) */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-1 overflow-x-auto">
        <button
          id="tab_settings_facebook"
          onClick={() => setActiveTab('facebook')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'facebook'
              ? 'border-blue-600 text-blue-900 dark:text-blue-200 bg-blue-50/80 rounded-t-lg font-black'
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
          id="tab_settings_custom_fields"
          onClick={() => setActiveTab('custom_fields')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'custom_fields'
              ? 'border-purple-600 text-purple-900 bg-purple-50/70 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Variable className="w-4 h-4 text-purple-600" />
          <span>Campos do CRM</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
            {customFields.length}
          </span>
        </button>

        <button
          id="tab_settings_team"
          onClick={() => setActiveTab('team')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'team'
              ? 'border-indigo-600 text-indigo-800 bg-indigo-50/70 rounded-t-lg font-black'
              : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Equipe & Permissões</span>
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
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 w-fit">
            <button
              onClick={() => setFacebookSubTab('graph_api')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                facebookSubTab === 'graph_api'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Páginas & Tokens Oficiais (Graph API)
            </button>
            <button
              onClick={() => setFacebookSubTab('apps')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                facebookSubTab === 'apps'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aplicativos Meta (App IDs & Secrets)
            </button>
          </div>

          {facebookSubTab === 'graph_api' ? (
            <FacebookGraphApiManager />
          ) : (
            <FacebookAppsManager />
          )}
        </div>
      )}

      {/* 2. TAB: WEBHOOKS & NOTIFICAÇÕES */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          {/* Sub-selector */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 flex-wrap">
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
              onClick={() => setWebhooksSubTab('events')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                webhooksSubTab === 'events'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Subscrição de Eventos
            </button>
            <button
              onClick={() => setWebhooksSubTab('callbacks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                webhooksSubTab === 'callbacks'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recepção Externa
            </button>
            <button
              onClick={() => setWebhooksSubTab('signatures')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                webhooksSubTab === 'signatures'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Validação de Assinatura (HMAC)
            </button>
            <button
              onClick={() => setWebhooksSubTab('retries')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                webhooksSubTab === 'retries'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Políticas de Retentativa
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
          </div>

          {webhooksSubTab === 'config' && (
            <WebhooksManager
              initialSettings={webhookSettings}
              onSaveSettings={onUpdateWebhookSettings}
              onOpenFlow={onOpenFlow}
              onOpenLiveChat={onOpenLiveChat}
            />
          )}
          {webhooksSubTab === 'events' && <WebhookSubscriptions />}
          {webhooksSubTab === 'callbacks' && <ExternalMessageWebhooksManager />}
          {webhooksSubTab === 'signatures' && <WebhookSignatureTool />}
          {webhooksSubTab === 'retries' && <WebhookRetryPolicyManager />}
          {webhooksSubTab === 'logs' && (
            <WebhookLogsViewer
              onOpenFlow={onOpenFlow}
              onOpenLiveChat={onOpenLiveChat}
            />
          )}
        </div>
      )}

      {/* 3. TAB: DOMÍNIOS & MARCA */}
      {activeTab === 'domains' && (
        <DomainManager />
      )}

      {/* 4. TAB: CAMPOS DO CRM */}
      {activeTab === 'custom_fields' && (
        <CustomFieldsManager
          customFields={customFields}
          onUpdateCustomFields={onUpdateCustomFields}
        />
      )}

      {/* 5. TAB: EQUIPE & PERMISSÕES */}
      {activeTab === 'team' && (
        <TeamUserManager />
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
