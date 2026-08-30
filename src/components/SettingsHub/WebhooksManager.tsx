import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Play, 
  Check, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Server, 
  Database, 
  Radio, 
  Sliders, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Instagram, 
  Facebook, 
  Zap, 
  ArrowRight,
  HelpCircle,
  FileCode,
  Activity,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { 
  WebhookEndpointConfig, 
  WebhookEventType, 
  WebhookSettingsState,
  MetaWebhookEventLog,
  WebhookStatsSummary,
  WebhookAutomationRouteResult
} from '../../types';
import { webhookService, SimulateMetaEventParams, SimulateMetaEventResponse } from '../../services/webhookService';
import { WebhookRequestHistoryTable } from './WebhookRequestHistoryTable';

interface WebhooksManagerProps {
  initialSettings?: WebhookSettingsState;
  onSaveSettings?: (settings: WebhookSettingsState) => void;
  onOpenFlow?: (flowId: string) => void;
  onOpenLiveChat?: (contactId: string) => void;
}

const AVAILABLE_EVENTS: { id: WebhookEventType; label: string; description: string; channel: 'instagram' | 'messenger' | 'omnichannel' }[] = [
  {
    id: 'messages',
    label: 'Mensagens Diretas (DMs)',
    description: 'Recebe quando um usuário envia uma nova mensagem de texto, áudio, vídeo ou arquivo.',
    channel: 'omnichannel'
  },
  {
    id: 'messaging_postbacks',
    label: 'Cliques em Botões (Postbacks)',
    description: 'Disparado quando o usuário clica em botões de fluxo ou respostas rápidas.',
    channel: 'omnichannel'
  },
  {
    id: 'comments',
    label: 'Comentários em Posts & Reels',
    description: 'Recebe novos comentários em publicações do Instagram e Página do Facebook.',
    channel: 'instagram'
  },
  {
    id: 'story_insights',
    label: 'Respostas & Menções em Stories',
    description: 'Disparado quando alguém responde ao seu Story ou marca seu perfil em um Story.',
    channel: 'instagram'
  },
  {
    id: 'messaging_optins',
    label: 'Opt-ins e Plugins de Check-in',
    description: 'Recebe confirmações de opt-in de botões do site e plugins da Meta.',
    channel: 'messenger'
  },
  {
    id: 'leadgen',
    label: 'Leads de Anúncios (Instant Forms)',
    description: 'Disparado automaticamente quando um usuário preenche um formulário de Lead Ads.',
    channel: 'messenger'
  },
  {
    id: 'message_reactions',
    label: 'Reações a Mensagens',
    description: 'Recebe reações de emoji (❤️, 🔥, 👍) adicionadas a mensagens do chat.',
    channel: 'instagram'
  },
  {
    id: 'live_comments',
    label: 'Comentários em Lives ao Vivo',
    description: 'Disparado durante transmissões ao vivo no Instagram.',
    channel: 'instagram'
  }
];

export const WebhooksManager: React.FC<WebhooksManagerProps> = ({
  initialSettings,
  onSaveSettings,
  onOpenFlow,
  onOpenLiveChat
}) => {
  // Navigation tabs inside Webhooks Manager
  const [activeTab, setActiveTab] = useState<'endpoints' | 'deliveries' | 'simulator' | 'stream' | 'handshake'>('endpoints');

  // State for settings
  const [settings, setSettings] = useState<WebhookSettingsState>(() => {
    if (initialSettings) return initialSettings;
    try {
      const saved = localStorage.getItem('manyflow_webhook_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      endpoints: [],
      globalVerifyToken: 'manyflow_verify_token_secure_2026',
      appSecret: 'mf_sec_89df2a3bc7e1480f90ab12d',
      serverBaseUrl: window.location.origin + '/api/webhooks',
      enableLogging: true
    };
  });

  // Selected endpoint for editing/inspecting
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(
    settings.endpoints[0]?.id || null
  );

  // Status states
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mongoStatus, setMongoStatus] = useState<{ connected: boolean; dbName?: string; source?: string } | null>(null);
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    statusCode: number;
    durationMs: number;
    responseBody?: string;
  } | null>(null);

  // Handshake Token Validator State
  const [verifyTokenInput, setVerifyTokenInput] = useState(settings.globalVerifyToken);
  const [isTestingHandshake, setIsTestingHandshake] = useState(false);
  const [handshakeResult, setHandshakeResult] = useState<{ success: boolean; challenge?: string; status: number; error?: string } | null>(null);

  // Simulator State
  const [simScenario, setSimScenario] = useState<SimulateMetaEventParams['scenario']>('keyword_pricing');
  const [simChannel, setSimChannel] = useState<'instagram' | 'messenger'>('instagram');
  const [simCustomText, setSimCustomText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimulateMetaEventResponse | null>(null);

  // Live Stream Events State
  const [eventsList, setEventsList] = useState<MetaWebhookEventLog[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventChannelFilter, setEventChannelFilter] = useState('all');
  const [selectedEventModal, setSelectedEventModal] = useState<MetaWebhookEventLog | null>(null);
  const [stats, setStats] = useState<WebhookStatsSummary | null>(null);

  // New endpoint modal / inline form state
  const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);
  const [newEndpointName, setNewEndpointName] = useState('');
  const [newEndpointUrl, setNewEndpointUrl] = useState('');
  const [newEndpointChannel, setNewEndpointChannel] = useState<'instagram' | 'messenger' | 'omnichannel'>('instagram');

  // Load from MongoDB on mount
  useEffect(() => {
    fetch('/api/webhooks/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setSettings(data.config);
          setVerifyTokenInput(data.config.globalVerifyToken || 'manyflow_verify_token_secure_2026');
          if (data.config.endpoints?.length > 0 && !selectedEndpointId) {
            setSelectedEndpointId(data.config.endpoints[0].id);
          }
        }
      })
      .catch(() => {});

    fetch('/api/db/status')
      .then((res) => res.json())
      .then((data) => {
        setMongoStatus(data);
      })
      .catch(() => {
        setMongoStatus({ connected: false });
      });

    loadLiveEvents();
    loadStats();
  }, []);

  const loadLiveEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const res = await webhookService.getEvents({ channel: eventChannelFilter, limit: 30 });
      setEventsList(res.events);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadStats = async () => {
    try {
      const s = await webhookService.getStats();
      setStats(s);
    } catch (e) {}
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToMongoDB = async (updatedSettings: WebhookSettingsState) => {
    setIsSaving(true);
    try {
      localStorage.setItem('manyflow_webhook_settings', JSON.stringify(updatedSettings));
      await webhookService.saveConfig(updatedSettings);

      if (onSaveSettings) {
        onSaveSettings(updatedSettings);
      }

      setIsSavedSuccess(true);
      setTimeout(() => setIsSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save to MongoDB:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestHandshake = async () => {
    setIsTestingHandshake(true);
    setHandshakeResult(null);
    try {
      const res = await webhookService.testVerificationHandshake(verifyTokenInput);
      setHandshakeResult(res);
    } catch (err: any) {
      setHandshakeResult({ success: false, status: 500, error: err.message });
    } finally {
      setIsTestingHandshake(false);
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimResult(null);
    try {
      const result = await webhookService.simulateEvent({
        scenario: simScenario,
        channel: simChannel,
        customText: simCustomText.trim() || undefined
      });
      setSimResult(result);
      loadLiveEvents();
      loadStats();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClearEvents = async () => {
    if (confirm('Deseja limpar todo o histórico de eventos de Webhook registrados?')) {
      await webhookService.clearEvents();
      setEventsList([]);
      loadStats();
    }
  };

  const handleToggleEndpointActive = (id: string) => {
    const updated = {
      ...settings,
      endpoints: settings.endpoints.map((ep) =>
        ep.id === id ? { ...ep, isActive: !ep.isActive, updatedAt: new Date().toISOString() } : ep
      )
    };
    setSettings(updated);
    handleSaveToMongoDB(updated);
  };

  const handleDeleteEndpoint = (id: string) => {
    const updated = {
      ...settings,
      endpoints: settings.endpoints.filter((ep) => ep.id !== id)
    };
    setSettings(updated);
    if (selectedEndpointId === id) {
      setSelectedEndpointId(updated.endpoints[0]?.id || null);
    }
    handleSaveToMongoDB(updated);
  };

  const handleCreateEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEndpointName.trim() || !newEndpointUrl.trim()) return;

    const newEndpoint: WebhookEndpointConfig = {
      id: `wh_${Date.now()}`,
      name: newEndpointName.trim(),
      url: newEndpointUrl.trim(),
      channel: newEndpointChannel,
      secretToken: `whsec_${Math.random().toString(36).substring(2, 12)}`,
      verifyToken: settings.globalVerifyToken,
      isActive: true,
      events: ['messages', 'messaging_postbacks', 'comments'],
      retryOnFailure: true,
      maxRetries: 3,
      timeoutMs: 5000,
      headers: [{ key: 'X-ManyFlow-Source', value: 'aapanel-production' }],
      description: `Endpoint criado para eventos de ${newEndpointChannel.toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastDeliveryStatus: 'idle',
      totalDeliveries: 0,
      totalErrors: 0
    };

    const updated = {
      ...settings,
      endpoints: [newEndpoint, ...settings.endpoints]
    };
    setSettings(updated);
    setSelectedEndpointId(newEndpoint.id);
    setIsAddingEndpoint(false);
    setNewEndpointName('');
    setNewEndpointUrl('');
    handleSaveToMongoDB(updated);
  };

  const handleToggleEvent = (endpointId: string, eventId: WebhookEventType) => {
    const updated = {
      ...settings,
      endpoints: settings.endpoints.map((ep) => {
        if (ep.id !== endpointId) return ep;
        const exists = ep.events.includes(eventId);
        const newEvents = exists
          ? ep.events.filter((ev) => ev !== eventId)
          : [...ep.events, eventId];
        return { ...ep, events: newEvents, updatedAt: new Date().toISOString() };
      })
    };
    setSettings(updated);
    handleSaveToMongoDB(updated);
  };

  const handleTestPing = async (endpoint: WebhookEndpointConfig) => {
    setTestingEndpointId(endpoint.id);
    setTestResult(null);
    try {
      const res = await fetch('/api/webhooks/test-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl: endpoint.url,
          eventType: endpoint.events[0] || 'messages',
          channel: endpoint.channel === 'omnichannel' ? 'instagram' : endpoint.channel
        })
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        statusCode: data.statusCode || (data.success ? 200 : 500),
        durationMs: data.durationMs || 45,
        responseBody: data.responseBody || (data.success ? 'HTTP 200 OK - Evento Entregue' : 'Falha na resposta')
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        statusCode: 500,
        durationMs: 0,
        responseBody: err.message
      });
    } finally {
      setTestingEndpointId(null);
    }
  };

  const activeEndpoint = settings.endpoints.find((ep) => ep.id === selectedEndpointId);
  const currentAppDomain = window.location.origin;
  const metaCallbackUrl = `${currentAppDomain}/api/webhooks/meta-receive`;

  return (
    <div id="webhooks_manager_view" className="space-y-6">
      {/* Top Banner: MongoDB & Meta Webhook Status */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Webhook className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1A1D21]">Serviço de Gerenciamento de Webhooks Meta (Graph API)</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                Ingestão & Roteamento Ativos
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Validação de tokens em tempo real, verificação criptográfica SHA-256 e roteamento automático para gatilhos e fluxos.
            </p>
          </div>
        </div>

        {/* MongoDB Connection Status Pill & Save */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold text-[#1A1D21]">
                {mongoStatus?.connected ? 'MongoDB Conectado' : 'Modo Local / aaPanel'}
              </span>
              <span className={`w-2 h-2 rounded-full ${mongoStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </div>
            <span className="text-[10px] text-[#64748B] font-mono block">
              DB: {mongoStatus?.dbName || 'manyflow'} (Coleção: webhook_events)
            </span>
          </div>

          <button
            id="btn_save_all_webhooks"
            onClick={() => handleSaveToMongoDB(settings)}
            disabled={isSaving}
            className="py-2.5 px-4 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isSavedSuccess ? (
              <Check className="w-4 h-4 text-emerald-200" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            <span>{isSavedSuccess ? 'Salvo no MongoDB!' : 'Salvar no MongoDB'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Total de Disparos</span>
            <div className="text-xl font-black text-[#1A1D21] mt-1">{stats.totalReceived}</div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Eventos Inbound Processados</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Assinaturas Validadas</span>
            <div className="text-xl font-black text-emerald-600 mt-1">{stats.totalVerified}</div>
            <span className="text-[10px] text-[#64748B] font-semibold mt-0.5 block">HMAC SHA-256 Verificados</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Automações Disparadas</span>
            <div className="text-xl font-black text-[#0084FF] mt-1">{stats.totalAutomated}</div>
            <span className="text-[10px] text-[#64748B] font-semibold mt-0.5 block">Fluxos / Gatilhos Roteados</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Latência Média</span>
            <div className="text-xl font-black text-purple-600 mt-1">{stats.avgLatencyMs} ms</div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Resposta Rápida &lt; 50ms</span>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 border border-[#E2E8F0] w-fit">
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'endpoints'
              ? 'bg-white text-[#1A1D21] shadow-xs'
              : 'text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-[#0084FF]" />
          <span>Endpoints & Credenciais</span>
        </button>

        <button
          onClick={() => setActiveTab('handshake')}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'handshake'
              ? 'bg-white text-[#1A1D21] shadow-xs'
              : 'text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Validação de Token (Handshake)</span>
        </button>

        <button
          onClick={() => setActiveTab('deliveries')}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'deliveries'
              ? 'bg-white text-[#1A1D21] shadow-xs'
              : 'text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#0084FF]" />
          <span>Histórico de Requisições & Status HTTP</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
            200/404/500
          </span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-white text-[#1A1D21] shadow-xs'
              : 'text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Simulador & Roteador de Automações</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('stream');
            loadLiveEvents();
          }}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'stream'
              ? 'bg-white text-[#1A1D21] shadow-xs'
              : 'text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-purple-600" />
          <span>Stream Inbound Meta</span>
          {eventsList.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-purple-100 text-purple-700">
              {eventsList.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB: REQUEST HISTORY & HTTP STATUS (200, 404, 500) */}
      {activeTab === 'deliveries' && (
        <WebhookRequestHistoryTable onOpenFlow={onOpenFlow} onOpenLiveChat={onOpenLiveChat} />
      )}

      {/* TAB 1: ENDPOINTS & GRAPH API CREDENTIALS */}
      {activeTab === 'endpoints' && (
        <div className="space-y-6">
          {/* Meta Graph API Credentials & Callback Setup Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-[#1A1D21] text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-200">
                  Dados Oficiais para Cadastro no Painel de Desenvolvedores da Meta (developers.facebook.com)
                </h4>
              </div>
              <span className="text-[10px] font-semibold bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
                Graph API v21.0 Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Callback URL */}
              <div className="p-3 rounded-xl bg-gray-800/80 border border-gray-700 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 block">URL de Retorno de Chamada (Callback URL)</span>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs text-sky-300 font-mono select-all truncate">{metaCallbackUrl}</code>
                  <button
                    onClick={() => handleCopy(metaCallbackUrl, 'callbackUrl')}
                    className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer shrink-0"
                    title="Copiar Callback URL"
                  >
                    {copiedKey === 'callbackUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Global Verify Token */}
              <div className="p-3 rounded-xl bg-gray-800/80 border border-gray-700 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 block">Token de Verificação (Verify Token)</span>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs text-amber-300 font-mono select-all">{settings.globalVerifyToken}</code>
                  <button
                    onClick={() => handleCopy(settings.globalVerifyToken, 'verifyToken')}
                    className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer shrink-0"
                    title="Copiar Verify Token"
                  >
                    {copiedKey === 'verifyToken' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>
                No painel da Meta, adicione o produto <strong>Webhooks</strong> e cole estes dois campos para assinar os campos <code>messages</code>, <code>messaging_postbacks</code>, <code>comments</code> e <code>leadgen</code>.
              </span>
            </div>
          </div>

          {/* Main Grid: Endpoints List & Detail/Config Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 Cols): Registered Webhook Endpoints */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-[#0084FF]" />
                      <span>Endpoints Registrados ({settings.endpoints.length})</span>
                    </h4>
                    <p className="text-[11px] text-[#64748B]">Destinos que recebem o payload de eventos em tempo real</p>
                  </div>
                  <button
                    id="btn_add_new_webhook"
                    onClick={() => setIsAddingEndpoint(true)}
                    className="py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0084FF] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Webhook</span>
                  </button>
                </div>

                {/* Inline Creation Form */}
                {isAddingEndpoint && (
                  <form onSubmit={handleCreateEndpoint} className="p-4 rounded-xl bg-[#F8F9FB] border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-[#0084FF]" />
                        Novo Endpoint de Webhook
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingEndpoint(false)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#1A1D21]">Nome do Webhook</label>
                      <input
                        type="text"
                        placeholder="ex: Webhook CRM Hubspot / Zapier"
                        value={newEndpointName}
                        onChange={(e) => setNewEndpointName(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#0084FF] outline-hidden bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#1A1D21]">URL de Destino (Endpoint URL)</label>
                      <input
                        type="url"
                        placeholder="https://seu-servidor.com/webhook/meta-inbound"
                        value={newEndpointUrl}
                        onChange={(e) => setNewEndpointUrl(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#0084FF] outline-hidden bg-white font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#1A1D21]">Canal Principal</label>
                      <select
                        value={newEndpointChannel}
                        onChange={(e) => setNewEndpointChannel(e.target.value as any)}
                        className="w-full text-xs p-2 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#0084FF] outline-hidden bg-white"
                      >
                        <option value="instagram">Instagram Direct & Comentários</option>
                        <option value="messenger">Facebook Messenger</option>
                        <option value="omnichannel">Omnichannel (Todos os Canais)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Salvar e Cadastrar Endpoint
                    </button>
                  </form>
                )}

                {/* Endpoints List */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {settings.endpoints.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#64748B]">
                      Nenhum endpoint secundário cadastrado. Clique em "Novo Webhook" acima.
                    </div>
                  ) : (
                    settings.endpoints.map((ep) => {
                      const isSelected = selectedEndpointId === ep.id;
                      return (
                        <div
                          key={ep.id}
                          onClick={() => setSelectedEndpointId(ep.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-blue-50/60 border-[#0084FF] shadow-xs'
                              : 'bg-white border-[#E2E8F0] hover:border-gray-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#1A1D21] truncate">{ep.name}</span>
                              <span className={`w-2 h-2 rounded-full ${ep.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            </div>
                            <span className="text-[11px] text-[#64748B] font-mono truncate block mt-0.5">{ep.url}</span>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                                {ep.events.length} eventos
                              </span>
                              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                                {ep.channel}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleEndpointActive(ep.id);
                              }}
                              className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                ep.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                              }`}
                              title={ep.isActive ? 'Pausar Webhook' : 'Ativar Webhook'}
                            >
                              {ep.isActive ? <Check className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (7 Cols): Selected Endpoint Detailed Config & Event Subscriptions */}
            <div className="lg:col-span-7 space-y-4">
              {activeEndpoint ? (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-6">
                  {/* Endpoint Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1A1D21]">{activeEndpoint.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          activeEndpoint.channel === 'instagram'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {activeEndpoint.channel.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] font-mono mt-0.5">{activeEndpoint.url}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestPing(activeEndpoint)}
                        disabled={testingEndpointId === activeEndpoint.id}
                        className="py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                        title="Disparar payload de teste para este webhook"
                      >
                        {testingEndpointId === activeEndpoint.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                        )}
                        <span>Testar Envio</span>
                      </button>

                      <button
                        onClick={() => handleToggleEndpointActive(activeEndpoint.id)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                          activeEndpoint.isActive
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {activeEndpoint.isActive ? 'Pausar' : 'Ativar'}
                      </button>

                      <button
                        onClick={() => handleDeleteEndpoint(activeEndpoint.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Excluir Webhook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Test Result Toast Banner */}
                  {testResult && (
                    <div className={`p-4 rounded-xl border space-y-2 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold flex items-center gap-1.5">
                          {testResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                          <span>
                            Resultado do Teste: Status {testResult.statusCode} ({testResult.durationMs}ms)
                          </span>
                        </span>
                        <button
                          onClick={() => setTestResult(null)}
                          className="text-xs font-bold opacity-60 hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="p-2 rounded bg-white/80 font-mono text-[11px] truncate">
                        Resposta: {testResult.responseBody || 'Payload recebido com sucesso'}
                      </div>
                    </div>
                  )}

                  {/* Event Subscriptions Checklist */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#0084FF]" />
                        <span>Eventos Assinados para este Endpoint</span>
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        {activeEndpoint.events.length} selecionados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {AVAILABLE_EVENTS.map((ev) => {
                        const isChecked = activeEndpoint.events.includes(ev.id);
                        return (
                          <div
                            key={ev.id}
                            onClick={() => handleToggleEvent(activeEndpoint.id, ev.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                              isChecked
                                ? 'bg-blue-50/50 border-blue-300 shadow-2xs'
                                : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="mt-0.5 rounded text-[#0084FF] focus:ring-[#0084FF]"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-[#1A1D21] block">{ev.label}</span>
                              <span className="text-[10px] text-[#64748B] line-clamp-2 leading-relaxed">{ev.description}</span>
                              <code className="text-[9px] text-gray-500 font-mono mt-1 block">evento: {ev.id}</code>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Security & Secret Signature */}
                  <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-3">
                    <span className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      <span>Assinatura Criptográfica de Segurança (HMAC-SHA256)</span>
                    </span>
                    <p className="text-[11px] text-[#64748B]">
                      O ManyFlow anexa o cabeçalho <code className="font-mono text-gray-700">X-ManyFlow-Signature</code> em cada requisição para você validar a autenticidade no seu backend.
                    </p>

                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-[#E2E8F0]">
                      <code className="text-xs text-gray-700 font-mono truncate select-all">{activeEndpoint.secretToken}</code>
                      <button
                        onClick={() => handleCopy(activeEndpoint.secretToken, 'endpointSecret')}
                        className="p-1 rounded text-[#0084FF] hover:bg-blue-50 transition-colors text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'endpointSecret' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copiar Secret</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center text-xs text-[#64748B]">
                  Selecione um endpoint à esquerda para inspecionar os detalhes e eventos.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HANDSHAKE TOKEN VALIDATION TESTER */}
      {activeTab === 'handshake' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h4 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Validador de Handshake & Token de Verificação da Meta (GET Challenge)</span>
            </h4>
            <p className="text-xs text-[#64748B] mt-1">
              Quando você cadastra a URL de Webhook no painel da Meta, os servidores do Facebook realizam uma requisição <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">GET /api/webhooks/meta-receive?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...</code> para autenticar o servidor. Teste esse handshake aqui.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#1A1D21]">Token de Verificação a Testar (hub.verify_token)</label>
                <input
                  type="text"
                  value={verifyTokenInput}
                  onChange={(e) => setVerifyTokenInput(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0] font-mono focus:ring-1 focus:ring-[#0084FF] outline-hidden bg-white"
                  placeholder="manyflow_verify_token_secure_2026"
                />
              </div>

              <button
                onClick={handleTestHandshake}
                disabled={isTestingHandshake}
                className="py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTestingHandshake ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>Executar Handshake de Teste</span>
              </button>
            </div>

            {handshakeResult && (
              <div className={`p-4 rounded-xl border ${
                handshakeResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
              } space-y-2`}>
                <div className="flex items-center gap-2">
                  {handshakeResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span className="text-xs font-bold">
                    {handshakeResult.success
                      ? `Handshake Aprovado! Status HTTP ${handshakeResult.status} OK`
                      : `Falha no Handshake (Status ${handshakeResult.status})`}
                  </span>
                </div>
                <div className="text-[11px] font-mono bg-white/80 p-2.5 rounded-lg">
                  {handshakeResult.success
                    ? `Challenge retornado pelo backend com sucesso: "${handshakeResult.challenge}"`
                    : `Erro retornado: ${handshakeResult.error}`}
                </div>
                {handshakeResult.success && (
                  <p className="text-[11px] text-emerald-800">
                    Seu servidor backend está 100% pronto para ser validado no painel da Meta sem erros!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SIMULATOR & AUTOMATION ROUTING */}
      {activeTab === 'simulator' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h4 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Simulador de Disparos em Tempo Real & Roteador de Automações</span>
            </h4>
            <p className="text-xs text-[#64748B] mt-1">
              Dispare eventos simulados no formato oficial da API da Meta para inspecionar como o backend valida tokens, atualiza contatos no MongoDB CRM e roteia para os fluxos e gatilhos de automação existentes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Simulation Controls */}
            <div className="space-y-4 p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0]">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1D21]">Cenário de Teste</label>
                <select
                  value={simScenario}
                  onChange={(e) => setSimScenario(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0] bg-white outline-hidden font-semibold"
                >
                  <option value="keyword_pricing">DM com Gatilho "PRICING" (Preço & Planos)</option>
                  <option value="keyword_discount">DM com Gatilho "DISCOUNT" (Cupom de Desconto)</option>
                  <option value="button_click">Clique em Botão de Fluxo (Postback)</option>
                  <option value="post_comment">Comentário em Post/Reel ("QUERO o link")</option>
                  <option value="lead_ad">Formulário de Lead Ads do Facebook</option>
                  <option value="general_dm">Mensagem Geral (Boas-Vindas / Fallback IA)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1D21]">Canal de Origem</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimChannel('instagram')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      simChannel === 'instagram'
                        ? 'bg-pink-50 border-pink-300 text-pink-700'
                        : 'bg-white border-[#E2E8F0] text-[#64748B]'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimChannel('messenger')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      simChannel === 'messenger'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-[#E2E8F0] text-[#64748B]'
                    }`}
                  >
                    <Facebook className="w-3.5 h-3.5" />
                    <span>Messenger</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1D21]">Texto Customizado (Opcional)</label>
                <input
                  type="text"
                  value={simCustomText}
                  onChange={(e) => setSimCustomText(e.target.value)}
                  placeholder="ex: Olá, qual o preço do plano anual?"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0] bg-white outline-hidden"
                />
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2.5 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Disparar Webhook no Backend</span>
              </button>
            </div>

            {/* Simulation Trace & Routing Result */}
            <div className="md:col-span-2 space-y-4">
              {simResult ? (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Roteador de Automação Executado ({simResult.routing.durationMs}ms)
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        Trace: {simResult.routing.traceId}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white/90 border border-emerald-100">
                        <span className="text-[10px] font-bold text-gray-500 block uppercase">Tipo de Roteamento</span>
                        <span className="font-bold text-emerald-900">{simResult.routing.routedType}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/90 border border-emerald-100">
                        <span className="text-[10px] font-bold text-gray-500 block uppercase">Assinatura HMAC</span>
                        <span className="font-bold text-emerald-900">
                          {simResult.signature.isValid ? 'Válida (SHA-256)' : 'Simulada'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white/90 border border-emerald-100 space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 block uppercase">Ação Executada</span>
                      <p className="text-xs font-semibold text-gray-900">{simResult.routing.actionTaken}</p>
                    </div>

                    {simResult.routing.responseSent && (
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 space-y-1">
                        <span className="text-[10px] font-bold text-blue-700 block uppercase">
                          Mensagem / Fluxo Disparado para o Usuário
                        </span>
                        <p className="text-xs text-blue-950 font-medium italic">
                          "{simResult.routing.responseSent}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Raw Payload Preview Accordion */}
                  <div className="p-3 rounded-xl bg-gray-900 text-gray-300 font-mono text-[11px] overflow-x-auto">
                    <span className="text-gray-400 font-bold block mb-1">Payload JSON Injetado no Backend:</span>
                    <pre className="text-sky-300">{JSON.stringify(simResult.payload, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="p-12 border border-dashed border-[#E2E8F0] rounded-xl text-center text-xs text-[#64748B] flex flex-col items-center justify-center gap-2">
                  <Zap className="w-8 h-8 text-gray-300" />
                  <span>Escolha um cenário à esquerda e clique em "Disparar Webhook no Backend" para ver a execução em tempo real.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE STREAM INBOUND EVENTS */}
      {activeTab === 'stream' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <h4 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span>Histórico de Eventos Inbound do Webhook (MongoDB)</span>
              </h4>
              <p className="text-xs text-[#64748B]">
                Registro em tempo real de todos os eventos recebidos na rota <code className="bg-gray-100 px-1 py-0.5 rounded">POST /api/webhooks/meta-receive</code>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadLiveEvents}
                disabled={isLoadingEvents}
                className="py-1.5 px-3 rounded-lg border border-[#E2E8F0] bg-white hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvents ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>

              <button
                onClick={handleClearEvents}
                className="py-1.5 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Histórico</span>
              </button>
            </div>
          </div>

          {/* Events Table */}
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8F9FB] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                <tr>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Canal</th>
                  <th className="p-3">Tipo de Evento</th>
                  <th className="p-3">Assinatura HMAC</th>
                  <th className="p-3">Ação Roteada</th>
                  <th className="p-3 text-right">Inspecionar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {eventsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#64748B]">
                      Nenhum evento registrado no MongoDB ainda. Use a aba "Simulador" para gerar disparos de teste.
                    </td>
                  </tr>
                ) : (
                  eventsList.map((ev) => (
                    <tr key={ev.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-gray-600">
                        {new Date(ev.receivedAt).toLocaleTimeString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.channel === 'instagram' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {ev.channel}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-[#1A1D21]">
                        {ev.eventType}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                          ev.signatureVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ev.signatureVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {ev.signatureVerified ? 'Válida' : 'Bypass / Teste'}
                        </span>
                      </td>
                      <td className="p-3 text-[#64748B] max-w-[280px] truncate">
                        {ev.routing?.actionTaken || 'Processado com sucesso'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedEventModal(ev)}
                          className="py-1 px-2.5 rounded bg-gray-100 hover:bg-gray-200 text-[#1A1D21] font-semibold text-[11px] cursor-pointer"
                        >
                          Ver JSON
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JSON Inspection Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-sm font-bold text-[#1A1D21]">Inspeção Detalhada do Payload do Webhook</h3>
                <span className="text-xs font-mono text-[#64748B]">ID: {selectedEventModal.id}</span>
              </div>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-3 rounded-xl bg-gray-900 text-sky-300 font-mono text-xs">
              <pre>{JSON.stringify(selectedEventModal, null, 2)}</pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="py-2 px-4 rounded-xl bg-[#1A1D21] text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
