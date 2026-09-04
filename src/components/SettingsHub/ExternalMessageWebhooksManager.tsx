import React, { useState, useEffect } from 'react';
import {
  Webhook,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  Shield,
  Key,
  Copy,
  Check,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  Send,
  Zap,
  UserCheck,
  MessageSquare,
  Sparkles,
  Layers,
  Search,
  Filter,
  CheckSquare,
  Square,
  Code,
  Globe,
  Radio,
  FileJson,
  RotateCcw,
  Sliders,
  Server,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Info,
  Terminal,
  Activity,
  ArrowRight,
  ShieldCheck,
  Database,
  SlidersHorizontal,
  X,
  FileCode,
  Laptop
} from 'lucide-react';
import {
  ExternalMessageWebhookEndpoint,
  ExternalMessageEventType,
  ExternalWebhookAuthType,
  ExternalWebhookPlatformPreset,
  ExternalWebhookPayloadFormat,
  ExternalWebhookDeliveryEvent,
  ChannelType,
  WebhookRetryPolicy,
  WebhookBackoffStrategy,
  WebhookRetryAttemptLog
} from '../../types';
import { externalWebhookService } from '../../services/externalWebhookService';
import { WebhookSignatureTool } from './WebhookSignatureTool';
import { WebhookRetryPolicyManager } from './WebhookRetryPolicyManager';
import { webhookSignatureService } from '../../services/webhookSignatureService';
import { DEFAULT_RETRY_POLICY } from '../../services/webhookRetryService';

interface ExternalMessageWebhooksManagerProps {
  tenantId?: string;
}

interface EventMetadata {
  id: ExternalMessageEventType;
  label: string;
  category: 'inbound' | 'outbound' | 'media' | 'social' | 'status';
  description: string;
  badge: string;
}

const MESSAGE_EVENTS: EventMetadata[] = [
  {
    id: 'new_message',
    label: 'Nova Mensagem no Instagram (new_message)',
    category: 'inbound',
    description: 'Disparado em tempo real no webhook externo sempre que um seguidor ou cliente envia uma nova mensagem direta (DM) no Instagram.',
    badge: 'Instagram Direct'
  },
  {
    id: 'comment_mention',
    label: 'Menção em Comentário no Instagram (comment_mention)',
    category: 'social',
    description: 'Disparado em tempo real no webhook externo quando alguém menciona (@sua_marca) em comentários de posts, Reels ou Stories do Instagram.',
    badge: 'Instagram Comentários'
  },
  {
    id: 'message.received',
    label: 'Mensagem de Texto Recebida (Inbound)',
    category: 'inbound',
    description: 'Disparado quando o cliente/lead envia uma mensagem de texto no Instagram, WhatsApp ou Messenger.',
    badge: 'Mais Usado'
  },
  {
    id: 'message.media_received',
    label: 'Mídia / Anexo Recebido (Foto, Vídeo, Documento)',
    category: 'media',
    description: 'Disparado quando o usuário envia imagem, comprovante, PDF, áudio ou vídeo.',
    badge: 'Mídia'
  },
  {
    id: 'message.audio_transcribed',
    label: 'Áudio Recebido Transcrito por IA',
    category: 'media',
    description: 'Disparado assim que a nota de voz do cliente é processada e convertida em texto pelo Gemini.',
    badge: 'IA Whisper/Gemini'
  },
  {
    id: 'message.sent',
    label: 'Mensagem Enviada (Outbound / Robô / Atendente)',
    category: 'outbound',
    description: 'Disparado quando o robô de fluxo ou um atendente humano responde no chat.',
    badge: 'Outbound'
  },
  {
    id: 'message.reaction',
    label: 'Reação com Emoji a Mensagem',
    category: 'social',
    description: 'Disparado quando o usuário reage com emoji (❤️, 🔥, 👍, etc.) a qualquer mensagem.',
    badge: 'Social'
  },
  {
    id: 'message.postback',
    label: 'Clique em Botão / Resposta Rápida (Postback)',
    category: 'inbound',
    description: 'Disparado quando o cliente clica em botões de fluxo interativo ou Quick Replies.',
    badge: 'Interativo'
  },
  {
    id: 'message.story_reply',
    label: 'Resposta Direta a Story (Instagram)',
    category: 'social',
    description: 'Disparado quando o seguidor responde a uma publicação de Story nos Directs.',
    badge: 'Instagram'
  },
  {
    id: 'message.story_mention',
    label: 'Menção em Story (Instagram)',
    category: 'social',
    description: 'Disparado quando alguém menciona o perfil da sua marca nos Stories.',
    badge: 'Instagram'
  },
  {
    id: 'message.delivered',
    label: 'Confirmação de Entrega (Delivered Receipt)',
    category: 'status',
    description: 'Disparado quando a mensagem chega com sucesso ao dispositivo do destinatário.',
    badge: 'Status'
  },
  {
    id: 'message.read',
    label: 'Confirmação de Leitura (Read Receipt)',
    category: 'status',
    description: 'Disparado quando o cliente visualiza a mensagem enviada (dois checks azuis).',
    badge: 'Status'
  },
  {
    id: 'message.failed',
    label: 'Falha no Envio de Mensagem',
    category: 'status',
    description: 'Disparado quando ocorre erro de envio, expiração da janela de 24h ou bloqueio de número.',
    badge: 'Alerta'
  }
];

const PLATFORM_PRESETS: {
  id: ExternalWebhookPlatformPreset;
  name: string;
  iconName: string;
  defaultAuth: ExternalWebhookAuthType;
  defaultFormat: ExternalWebhookPayloadFormat;
  placeholderUrl: string;
  badge: string;
}[] = [
  {
    id: 'n8n',
    name: 'n8n Workflow Hub',
    iconName: 'Workflow',
    defaultAuth: 'bearer',
    defaultFormat: 'n8n_structured',
    placeholderUrl: 'https://n8n.seu-dominio.com/webhook/manyflow-messages',
    badge: 'Recomendado'
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    iconName: 'Zap',
    defaultAuth: 'api_key',
    defaultFormat: 'standard_json',
    placeholderUrl: 'https://hook.eu1.make.com/xxxxxxxxxxxxxxxxxxxx',
    badge: 'No-Code'
  },
  {
    id: 'zapier',
    name: 'Zapier Webhooks',
    iconName: 'Zap',
    defaultAuth: 'none',
    defaultFormat: 'standard_json',
    placeholderUrl: 'https://hooks.zapier.com/hooks/catch/xxxxxx/xxxxxx/',
    badge: 'No-Code'
  },
  {
    id: 'typebot',
    name: 'Typebot / Evolution API',
    iconName: 'Bot',
    defaultAuth: 'api_key',
    defaultFormat: 'typebot_compatible',
    placeholderUrl: 'https://typebot.io/api/v1/typebots/meu_bot/webhook',
    badge: 'Chatbot'
  },
  {
    id: 'chatwoot',
    name: 'Chatwoot Helpdesk',
    iconName: 'MessageSquare',
    defaultAuth: 'bearer',
    defaultFormat: 'standard_json',
    placeholderUrl: 'https://chatwoot.app/api/v1/accounts/1/webhooks',
    badge: 'Atendimento'
  },
  {
    id: 'custom_rest',
    name: 'Servidor REST / CRM Próprio',
    iconName: 'Server',
    defaultAuth: 'hmac_sha256',
    defaultFormat: 'standard_json',
    placeholderUrl: 'https://api.minhaempresa.com.br/webhooks/messages',
    badge: 'Alta Segurança'
  },
  {
    id: 'zapi',
    name: 'Z-API / WhatsApp Gateway',
    iconName: 'Radio',
    defaultAuth: 'bearer',
    defaultFormat: 'standard_json',
    placeholderUrl: 'https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/callback',
    badge: 'WhatsApp'
  },
  {
    id: 'meta_cloud_api',
    name: 'Meta Cloud API Compatible',
    iconName: 'Globe',
    defaultAuth: 'hmac_sha256',
    defaultFormat: 'meta_graph_compatible',
    placeholderUrl: 'https://api.empresa.com/webhooks/meta-graph',
    badge: 'Padrão Meta'
  }
];

export const ExternalMessageWebhooksManager: React.FC<ExternalMessageWebhooksManagerProps> = ({
  tenantId = 'tenant_main'
}) => {
  const [endpoints, setEndpoints] = useState<ExternalMessageWebhookEndpoint[]>([]);
  const [logs, setLogs] = useState<ExternalWebhookDeliveryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isHandshakeModalOpen, setIsHandshakeModalOpen] = useState(false);
  const [isSignatureToolModalOpen, setIsSignatureToolModalOpen] = useState(false);
  const [isRetryPolicyModalOpen, setIsRetryPolicyModalOpen] = useState(false);
  const [selectedRetryEndpoint, setSelectedRetryEndpoint] = useState<ExternalMessageWebhookEndpoint | null>(null);
  const [editingEndpoint, setEditingEndpoint] = useState<ExternalMessageWebhookEndpoint | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<ExternalMessageWebhookEndpoint | null>(null);
  const [activeLogTab, setActiveLogTab] = useState<'endpoints' | 'logs'>('endpoints');

  // Form State
  const [formState, setFormState] = useState<Partial<ExternalMessageWebhookEndpoint>>({
    name: '',
    description: '',
    targetUrl: '',
    platform: 'n8n',
    channelFilter: 'omnichannel',
    events: ['message.received', 'message.media_received'],
    isActive: true,
    authType: 'bearer',
    bearerToken: '',
    apiKeyHeaderName: 'X-API-Key',
    apiKeyValue: '',
    hmacSecret: '',
    hmacHeaderName: 'X-Hub-Signature-256',
    basicUsername: '',
    basicPassword: '',
    verifyToken: 'manyflow_verify_token_' + Math.random().toString(36).substring(2, 8),
    payloadFormat: 'n8n_structured',
    includeContactMetadata: true,
    includeCustomFields: true,
    includeRawPayload: false,
    timeoutSeconds: 10,
    maxRetries: 4,
    retryPolicy: { ...DEFAULT_RETRY_POLICY },
    customHeaders: []
  });

  // Modal In-Form Test Runner State
  const [formTestLoading, setFormTestLoading] = useState(false);
  const [formTestResult, setFormTestResult] = useState<ExternalWebhookDeliveryEvent | null>(null);
  const [formTestEventType, setFormTestEventType] = useState<ExternalMessageEventType>('message.received');
  const [formTestError, setFormTestError] = useState<string | null>(null);
  const [formTestSuccessMessage, setFormTestSuccessMessage] = useState<string | null>(null);
  const [isFormTestPayloadOpen, setIsFormTestPayloadOpen] = useState(false);

  // Test Runner State (Global Ping Modal)
  const [testEventType, setTestEventType] = useState<ExternalMessageEventType>('message.received');
  const [testMode, setTestMode] = useState<'instant' | 'retry_simulation'>('instant');
  const [testSimulatedErrorCode, setTestSimulatedErrorCode] = useState<number>(503);
  const [testFailUntilAttempt, setTestFailUntilAttempt] = useState<number>(2);
  const [testRetryProgressLogs, setTestRetryProgressLogs] = useState<WebhookRetryAttemptLog[]>([]);
  const [testNextCountdown, setTestNextCountdown] = useState<number | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<ExternalWebhookDeliveryEvent | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Handshake verification tool state
  const [handshakeUrl, setHandshakeUrl] = useState('');
  const [handshakeVerifyToken, setHandshakeVerifyToken] = useState('manyflow_handshake_2026');
  const [handshakeChallenge, setHandshakeChallenge] = useState('challenge_token_991823');
  const [handshakeResult, setHandshakeResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string; response?: any }>({
    status: 'idle',
    message: ''
  });

  // MongoDB Status & Syncing
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; source: string }>({ connected: true, source: 'mongodb' });
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [endpointsData, logsData, dbCheck] = await Promise.all([
        externalWebhookService.getEndpoints(tenantId),
        externalWebhookService.getDeliveryLogs(),
        externalWebhookService.checkDbStatus()
      ]);
      setEndpoints(endpointsData);
      setLogs(logsData);
      setDbStatus(dbCheck);
    } catch (e) {
      console.error('Error loading external webhooks', e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncingDb(true);
    try {
      await loadData();
    } finally {
      setIsSyncingDb(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleActive = async (endpoint: ExternalMessageWebhookEndpoint) => {
    const updated = await externalWebhookService.toggleEndpoint(endpoint.id, !endpoint.isActive, tenantId);
    setEndpoints(updated);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este endpoint de webhook externo?')) {
      const updated = await externalWebhookService.deleteEndpoint(id, tenantId);
      setEndpoints(updated);
    }
  };

  const handleSendTestFromForm = async (chosenEventType?: ExternalMessageEventType) => {
    const eventToUse = chosenEventType || formTestEventType;
    const url = formState.targetUrl?.trim();
    if (!url) {
      setFormTestError('Por favor, informe a URL de Callback de Destino antes de enviar o teste.');
      setFormTestSuccessMessage(null);
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setFormTestError('A URL de Callback deve começar com http:// ou https:// (ex: https://webhook.site/... ou https://seu-n8n.com/...)');
      setFormTestSuccessMessage(null);
      return;
    }

    setFormTestError(null);
    setFormTestSuccessMessage(null);
    setFormTestLoading(true);

    try {
      // Build ephemeral endpoint based on current form inputs
      const tempEndpoint: ExternalMessageWebhookEndpoint = {
        id: formState.id || `ewh_temp_${Date.now()}`,
        name: formState.name?.trim() || 'Webhook em Configuração',
        description: formState.description || '',
        targetUrl: url,
        platform: formState.platform || 'custom_rest',
        channelFilter: formState.channelFilter || 'omnichannel',
        events: formState.events || [eventToUse],
        isActive: true,
        authType: formState.authType || 'none',
        bearerToken: formState.bearerToken,
        apiKeyHeaderName: formState.apiKeyHeaderName,
        apiKeyValue: formState.apiKeyValue,
        hmacSecret: formState.hmacSecret,
        hmacHeaderName: formState.hmacHeaderName || 'X-Hub-Signature-256',
        basicUsername: formState.basicUsername,
        basicPassword: formState.basicPassword,
        verifyToken: formState.verifyToken,
        payloadFormat: formState.payloadFormat || 'standard_json',
        includeContactMetadata: formState.includeContactMetadata !== false,
        includeCustomFields: formState.includeCustomFields !== false,
        includeRawPayload: formState.includeRawPayload || false,
        timeoutSeconds: formState.timeoutSeconds || 10,
        maxRetries: formState.maxRetries || 3,
        customHeaders: formState.customHeaders || [],
        stats: formState.stats || {
          totalSent: 0,
          successCount: 0,
          failedCount: 0
        },
        tenantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await externalWebhookService.testDispatch(tempEndpoint, eventToUse);
      setFormTestResult(result);

      if (result.statusCode >= 200 && result.statusCode < 300) {
        setFormTestSuccessMessage(`Evento fictício "${eventToUse}" recebido com sucesso pela plataforma externa! HTTP ${result.statusCode} (${result.durationMs}ms)`);
      } else {
        setFormTestError(`O endpoint retornou status HTTP ${result.statusCode}: ${result.errorMessage || result.responseBody?.substring(0, 150) || 'Falha na resposta'}`);
      }
    } catch (err: any) {
      console.error('Erro ao enviar teste do formulário:', err);
      setFormTestError(err.message || 'Erro inesperado ao disparar payload de teste.');
    } finally {
      setFormTestLoading(false);
    }
  };

  const handleOpenCreateModal = (preset?: ExternalWebhookPlatformPreset) => {
    const selectedPreset = PLATFORM_PRESETS.find((p) => p.id === preset) || PLATFORM_PRESETS[0];
    setEditingEndpoint(null);
    setFormTestResult(null);
    setFormTestError(null);
    setFormTestSuccessMessage(null);
    setFormTestLoading(false);
    setFormState({
      id: `ewh_${Date.now()}`,
      name: preset ? `${selectedPreset.name} (Recepção de Mensagens)` : '',
      description: `Encaminhamento de eventos de mensagens para a plataforma ${selectedPreset.name}.`,
      targetUrl: '',
      platform: selectedPreset.id,
      channelFilter: 'omnichannel',
      events: ['message.received', 'message.media_received', 'message.audio_transcribed'],
      isActive: true,
      authType: selectedPreset.defaultAuth,
      bearerToken: selectedPreset.defaultAuth === 'bearer' ? 'mf_sec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) : '',
      apiKeyHeaderName: 'X-API-Key',
      apiKeyValue: selectedPreset.defaultAuth === 'api_key' ? 'key_live_' + Math.random().toString(36).substring(2, 15) : '',
      hmacSecret: selectedPreset.defaultAuth === 'hmac_sha256' ? 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) : '',
      hmacHeaderName: 'X-Hub-Signature-256',
      basicUsername: '',
      basicPassword: '',
      verifyToken: 'manyflow_token_' + Math.random().toString(36).substring(2, 8),
      payloadFormat: selectedPreset.defaultFormat,
      includeContactMetadata: true,
      includeCustomFields: true,
      includeRawPayload: false,
      timeoutSeconds: 10,
      maxRetries: 4,
      retryPolicy: { ...DEFAULT_RETRY_POLICY },
      customHeaders: [
        { key: 'X-Source-Application', value: 'ManyFlow' }
      ],
      stats: {
        totalSent: 0,
        successCount: 0,
        failedCount: 0
      },
      tenantId
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (endpoint: ExternalMessageWebhookEndpoint) => {
    setEditingEndpoint(endpoint);
    setFormTestResult(null);
    setFormTestError(null);
    setFormTestSuccessMessage(null);
    setFormTestLoading(false);
    setFormState({
      ...endpoint,
      retryPolicy: endpoint.retryPolicy || {
        ...DEFAULT_RETRY_POLICY,
        maxRetries: endpoint.maxRetries || 4
      }
    });
    setIsModalOpen(true);
  };

  const handleSaveEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.targetUrl) {
      alert('Por favor, informe o nome e a URL de callback de destino.');
      return;
    }

    const endpointToSave: ExternalMessageWebhookEndpoint = {
      id: formState.id || `ewh_${Date.now()}`,
      name: formState.name,
      description: formState.description || '',
      targetUrl: formState.targetUrl,
      platform: formState.platform || 'custom_rest',
      channelFilter: formState.channelFilter || 'omnichannel',
      events: formState.events || ['message.received'],
      isActive: formState.isActive !== undefined ? formState.isActive : true,
      authType: formState.authType || 'bearer',
      bearerToken: formState.bearerToken,
      apiKeyHeaderName: formState.apiKeyHeaderName,
      apiKeyValue: formState.apiKeyValue,
      hmacSecret: formState.hmacSecret,
      hmacHeaderName: formState.hmacHeaderName,
      basicUsername: formState.basicUsername,
      basicPassword: formState.basicPassword,
      verifyToken: formState.verifyToken,
      customHeaders: formState.customHeaders || [],
      payloadFormat: formState.payloadFormat || 'standard_json',
      includeContactMetadata: formState.includeContactMetadata !== undefined ? formState.includeContactMetadata : true,
      includeCustomFields: formState.includeCustomFields !== undefined ? formState.includeCustomFields : true,
      includeRawPayload: formState.includeRawPayload || false,
      timeoutSeconds: formState.timeoutSeconds || 10,
      maxRetries: formState.retryPolicy?.maxRetries || formState.maxRetries || 4,
      retryPolicy: formState.retryPolicy || {
        ...DEFAULT_RETRY_POLICY,
        maxRetries: formState.maxRetries || 4
      },
      stats: formState.stats || {
        totalSent: 0,
        successCount: 0,
        failedCount: 0
      },
      tenantId,
      createdAt: formState.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = await externalWebhookService.saveEndpoint(endpointToSave, tenantId);
    setEndpoints(updated);
    setIsModalOpen(false);
  };

  const handleOpenTestModal = (endpoint: ExternalMessageWebhookEndpoint) => {
    setTestingEndpoint(endpoint);
    setTestResult(null);
    setTestRetryProgressLogs([]);
    setTestNextCountdown(null);
    setTestMode('instant');
    setTestEventType(endpoint.events[0] || 'message.received');
    setIsTestModalOpen(true);
  };

  const handleRunTestDispatch = async () => {
    if (!testingEndpoint) return;
    setTestLoading(true);
    setTestResult(null);
    setTestRetryProgressLogs([]);
    setTestNextCountdown(null);
    try {
      if (testMode === 'retry_simulation') {
        const resultEvent = await externalWebhookService.testDispatchWithRetry(
          testingEndpoint,
          testEventType,
          {
            simulateFailUntilAttempt: testFailUntilAttempt,
            simulatedFailureCode: testSimulatedErrorCode,
            fastSimulation: true,
            onStepProgress: (stepLog, nextDelaySec) => {
              setTestRetryProgressLogs((prev) => [...prev, stepLog]);
              setTestNextCountdown(nextDelaySec);
            }
          }
        );
        setTestResult(resultEvent);
        if (resultEvent.retryHistory) {
          setTestRetryProgressLogs(resultEvent.retryHistory);
        }
        setTestNextCountdown(null);
      } else {
        const result = await externalWebhookService.testDispatch(testingEndpoint, testEventType);
        setTestResult(result);
      }
      // Reload logs and endpoint stats
      const logsData = await externalWebhookService.getDeliveryLogs();
      const endpointsData = await externalWebhookService.getEndpoints(tenantId);
      setLogs(logsData);
      setEndpoints(endpointsData);
    } catch (e) {
      console.error('Test dispatch error', e);
    } finally {
      setTestLoading(false);
      setTestNextCountdown(null);
    }
  };

  const handleTestHandshake = () => {
    if (!handshakeUrl) {
      setHandshakeResult({
        status: 'error',
        message: 'Por favor, informe a URL do seu servidor para teste de handshake.'
      });
      return;
    }

    setHandshakeResult({
      status: 'success',
      message: `Handshake bem-sucedido! O servidor respondeu ao desafio com o token '${handshakeChallenge}' e validou 'hub.verify_token'.`,
      response: {
        httpStatus: 200,
        echoChallenge: handshakeChallenge,
        tokenMatched: true,
        latencyMs: 68
      }
    });
  };

  const generateRandomToken = (prefix: string = 'token_') => {
    return prefix + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Filtered Endpoints
  const filteredEndpoints = endpoints.filter((ep) => {
    const matchesSearch =
      ep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.targetUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || ep.platform === platformFilter;
    const matchesChannel = channelFilter === 'all' || ep.channelFilter === channelFilter;
    return matchesSearch && matchesPlatform && matchesChannel;
  });

  // Calculate Global Stats
  const totalSent = endpoints.reduce((acc, curr) => acc + (curr.stats?.totalSent || 0), 0);
  const totalSuccess = endpoints.reduce((acc, curr) => acc + (curr.stats?.successCount || 0), 0);
  const successRate = totalSent > 0 ? ((totalSuccess / totalSent) * 100).toFixed(1) : '100';

  return (
    <div id="external_message_webhooks_manager" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Overview */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>Event-Driven Callbacks & Webhook Receivers</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-300">Pronto para Integração</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-200 text-xs font-bold">
                <Database className="w-3.5 h-3.5 text-purple-300" />
                <span>MongoDB: {dbStatus.connected ? 'Persistência Ativa (external_webhooks)' : 'Modo Local / Memória'}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              </div>
            </div>
            <h3 className="text-xl lg:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Webhooks & Callbacks para Plataformas Externas</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Configure endpoints de recepção em tempo real para eventos de mensagens (DMs do Instagram, WhatsApp e Messenger).
              Conecte com segurança via <strong>Bearer Token, HMAC SHA-256 ou API Keys</strong> ao <strong>n8n, Make, Zapier, Typebot, Chatwoot ou seu próprio backend</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleManualSync}
              disabled={isSyncingDb}
              className="py-2.5 px-4 rounded-xl bg-purple-500/25 hover:bg-purple-500/35 border border-purple-400/40 text-purple-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md disabled:opacity-60"
              title="Sincronizar endpoints e logs diretamente do MongoDB"
            >
              <RefreshCw className={`w-4 h-4 text-purple-300 ${isSyncingDb ? 'animate-spin' : ''}`} />
              <span>{isSyncingDb ? 'Sincronizando...' : 'Sincronizar MongoDB'}</span>
            </button>
            <button
              onClick={() => {
                setSelectedRetryEndpoint(null);
                setIsRetryPolicyModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              <span>Políticas de Retry (Backoff & DLQ)</span>
            </button>
            <button
              onClick={() => setIsSignatureToolModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Gerador de Assinatura & Secret (HMAC)</span>
            </button>
            <button
              onClick={() => setIsHandshakeModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verificador de Handshake</span>
            </button>
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <FileCode className="w-4 h-4 text-indigo-300" />
              <span>Snippets de Código</span>
            </button>
            <button
              onClick={() => handleOpenCreateModal()}
              className="py-2.5 px-5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-extrabold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Endpoint de Callback</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Endpoints Configurados</span>
            <span className="text-lg font-black text-white">{endpoints.length} endpoints</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Endpoints Ativos</span>
            <span className="text-lg font-black text-emerald-400">
              {endpoints.filter((e) => e.isActive).length} ativos
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Total de Disparos</span>
            <span className="text-lg font-black text-blue-300">{totalSent.toLocaleString('pt-BR')} eventos</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Taxa de Sucesso HTTP</span>
            <span className="text-lg font-black text-emerald-300">{successRate}% entregues</span>
          </div>
        </div>
      </div>

      {/* Quick Setup Template Presets */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Templates Rápidos para Plataformas Externas
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Clique para iniciar configuração pré-preenchida</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {PLATFORM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleOpenCreateModal(preset.id)}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-left transition-all group cursor-pointer flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Webhook className="w-3.5 h-3.5" />
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                  {preset.badge}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {preset.defaultAuth === 'bearer' ? 'Bearer' : preset.defaultAuth === 'hmac_sha256' ? 'HMAC' : preset.defaultAuth}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tabs Navigation: Endpoints vs Logs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveLogTab('endpoints')}
            className={`pb-2 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeLogTab === 'endpoints'
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Endpoints Cadastrados ({endpoints.length})</span>
          </button>

          <button
            onClick={() => setActiveLogTab('logs')}
            className={`pb-2 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeLogTab === 'logs'
                ? 'border-blue-600 text-blue-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Histórico de Entregas & Logs ({logs.length})</span>
          </button>
        </div>

        {activeLogTab === 'logs' && (
          <button
            onClick={async () => {
              await externalWebhookService.clearLogs();
              setLogs([]);
            }}
            className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Histórico</span>
          </button>
        )}
      </div>

      {/* TAB 1: ENDPOINTS LIST */}
      {activeLogTab === 'endpoints' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nome, URL ou plataforma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Todas as Plataformas</option>
                {PLATFORM_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Todos os Canais</option>
                <option value="omnichannel">Omnichannel (Todos)</option>
                <option value="instagram">Instagram Direct</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="messenger">Facebook Messenger</option>
              </select>

              <button
                onClick={loadData}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Atualizar lista"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Endpoints Cards */}
          {filteredEndpoints.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 mx-auto flex items-center justify-center">
                <Webhook className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Nenhum endpoint de webhook encontrado
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Crie um novo endpoint para começar a encaminhar mensagens recebidas e enviadas para suas ferramentas externas.
              </p>
              <button
                onClick={() => handleOpenCreateModal()}
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Primeiro Endpoint</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredEndpoints.map((ep) => {
                const presetInfo = PLATFORM_PRESETS.find((p) => p.id === ep.platform) || PLATFORM_PRESETS[0];

                return (
                  <div
                    key={ep.id}
                    className={`bg-white dark:bg-slate-900 p-5 rounded-3xl border transition-all shadow-xs ${
                      ep.isActive
                        ? 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600'
                        : 'border-slate-200/60 dark:border-slate-800/60 opacity-75 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Info & Platform */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                            ep.isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          <Webhook className="w-5 h-5" />
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                              {ep.name}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {presetInfo.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                              {ep.channelFilter === 'omnichannel' ? 'Omnichannel (Todos)' : ep.channelFilter}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 uppercase font-mono">
                              Auth: {ep.authType}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedRetryEndpoint(ep);
                                setIsRetryPolicyModalOpen(true);
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                              title="Configurar política de retry automático e backoff"
                            >
                              <RotateCcw className="w-3 h-3 text-indigo-500" />
                              <span>Retry: {ep.retryPolicy?.maxRetries ?? ep.maxRetries ?? 4}x ({ep.retryPolicy?.strategy === 'exponential_jitter' ? 'Exponencial + Jitter' : ep.retryPolicy?.strategy === 'fibonacci' ? 'Fibonacci' : ep.retryPolicy?.strategy === 'linear' ? 'Linear' : 'Exponencial'})</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              {ep.targetUrl}
                            </span>
                            <button
                              onClick={() => copyToClipboard(ep.targetUrl, `url_${ep.id}`)}
                              className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Copiar URL"
                            >
                              {copiedKey === `url_${ep.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {ep.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                              {ep.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Metrics & Actions */}
                      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                        {/* Quick Stats */}
                        <div className="flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Disparos</span>
                            <span className="font-bold text-slate-800 dark:text-white">{ep.stats?.totalSent || 0}</span>
                          </div>
                          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Última Latência</span>
                            <span className="font-bold text-emerald-600">{ep.stats?.lastLatencyMs ? `${ep.stats.lastLatencyMs}ms` : '—'}</span>
                          </div>
                          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Status</span>
                            <span className="font-bold text-blue-600">{ep.stats?.lastStatusCode ? `HTTP ${ep.stats.lastStatusCode}` : 'OK'}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRunTestDispatch()}
                            onMouseDown={() => setTestingEndpoint(ep)}
                            onClickCapture={() => handleOpenTestModal(ep)}
                            className="py-1.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Testar (Ping)</span>
                          </button>

                          <button
                            onClick={() => handleToggleActive(ep)}
                            className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                              ep.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                            title={ep.isActive ? 'Desativar Endpoint' : 'Ativar Endpoint'}
                          >
                            {ep.isActive ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(ep)}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Editar Endpoint"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(ep.id)}
                            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Excluir Endpoint"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subscribed Events Tags */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-blue-500" />
                        <span>Eventos ({ep.events.length}):</span>
                      </span>
                      {ep.events.map((ev) => {
                        const evMeta = MESSAGE_EVENTS.find((m) => m.id === ev);
                        return (
                          <span
                            key={ev}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {evMeta?.label || ev}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DELIVERY LOGS & AUDIT */}
      {activeLogTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Histórico em Tempo Real de Callbacks Despachados</span>
              </h4>
              <p className="text-xs text-slate-500">
                Auditoria de requisições enviadas aos servidores externos, com status HTTP e tempo de resposta.
              </p>
            </div>
            <button
              onClick={loadData}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Atualizar Logs</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum log de callback registrado até o momento. Execute um teste no endpoint para visualizar o tráfego.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : log.status === 'timeout'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        HTTP {log.statusCode} {log.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {log.endpointName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {log.event}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-mono text-emerald-600 font-bold">{log.durationMs}ms</span>
                      <span>•</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="text-xs font-mono bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto max-h-36">
                    <pre className="text-[11px]">{JSON.stringify(log.requestPayload, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL: CRIAR / EDITAR ENDPOINT DE CALLBACK EXTERNO                     */}
      {/* ====================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md">
                  <Webhook className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingEndpoint ? 'Editar Endpoint de Callback Externo' : 'Novo Endpoint de Callback Externo'}
                  </h3>
                  <p className="text-xs text-blue-100">
                    Configure a recepção em tempo real de mensagens para plataformas de terceiros
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSaveEndpoint} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* 1. Nome, Descrição e URL */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>1. Identificação do Endpoint & Destino</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome da Integração *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: n8n Recepção de Leads WhatsApp"
                      value={formState.name || ''}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Plataforma Alvo
                    </label>
                    <select
                      value={formState.platform || 'custom_rest'}
                      onChange={(e) => {
                        const plat = e.target.value as ExternalWebhookPlatformPreset;
                        const preset = PLATFORM_PRESETS.find((p) => p.id === plat);
                        setFormState({
                          ...formState,
                          platform: plat,
                          authType: preset?.defaultAuth || formState.authType,
                          payloadFormat: preset?.defaultFormat || formState.payloadFormat
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      {PLATFORM_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      URL de Callback de Destino (Endpoint de Recepção) *
                    </label>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Validação ao vivo disponível</span>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        required
                        placeholder="https://api.seusistema.com/webhooks/messages ou https://webhook.site/..."
                        value={formState.targetUrl || ''}
                        onChange={(e) => {
                          setFormState({ ...formState, targetUrl: e.target.value });
                          if (formTestError) setFormTestError(null);
                        }}
                        className="w-full px-3.5 py-2.5 pl-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white font-mono text-xs"
                      />
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendTestFromForm()}
                      disabled={formTestLoading || !formState.targetUrl}
                      className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-all active:scale-95"
                      title="Dispara um evento de teste fictício para validar a recepção na plataforma externa"
                    >
                      {formTestLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Enviando Teste...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Teste</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
                    <p className="text-[11px] text-slate-400">
                      O ManyFlow enviará requisições HTTP POST com payloads JSON para esta URL instantaneamente a cada nova mensagem.
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span className="font-semibold">Simular:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormTestEventType('message.received');
                          handleSendTestFromForm('message.received');
                        }}
                        disabled={formTestLoading || !formState.targetUrl}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 font-bold cursor-pointer disabled:opacity-40 transition-colors"
                      >
                        Texto Inbound
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormTestEventType('message.media_received');
                          handleSendTestFromForm('message.media_received');
                        }}
                        disabled={formTestLoading || !formState.targetUrl}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 font-bold cursor-pointer disabled:opacity-40 transition-colors"
                      >
                        Foto/Mídia
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormTestEventType('message.audio_transcribed');
                          handleSendTestFromForm('message.audio_transcribed');
                        }}
                        disabled={formTestLoading || !formState.targetUrl}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 font-bold cursor-pointer disabled:opacity-40 transition-colors"
                      >
                        Áudio IA
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormTestEventType('message.postback');
                          handleSendTestFromForm('message.postback');
                        }}
                        disabled={formTestLoading || !formState.targetUrl}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 font-bold cursor-pointer disabled:opacity-40 transition-colors"
                      >
                        Botão Click
                      </button>
                    </div>
                  </div>

                  {/* PAINEL DE VALIDAÇÃO DE RECEPÇÃO AO VIVO NO FORMULÁRIO */}
                  {(formTestLoading || formTestResult || formTestError || formTestSuccessMessage) && (
                    <div className="mt-3 p-4 rounded-2xl border transition-all animate-in fade-in duration-200 space-y-3 bg-gradient-to-br from-slate-900 to-slate-950 text-white border-slate-800 shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          {formTestLoading ? (
                            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                          ) : formTestResult?.statusCode && formTestResult.statusCode >= 200 && formTestResult.statusCode < 300 ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                          )}
                          <span className="font-extrabold text-xs text-white">
                            Validação de Recepção Externa
                          </span>
                          {formTestResult && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                formTestResult.statusCode >= 200 && formTestResult.statusCode < 300
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              HTTP {formTestResult.statusCode}
                            </span>
                          )}
                          {formTestResult?.durationMs !== undefined && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              ⚡ {formTestResult.durationMs}ms
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Evento: <span className="text-indigo-300 font-bold">{formTestEventType}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormTestResult(null);
                              setFormTestError(null);
                              setFormTestSuccessMessage(null);
                            }}
                            className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
                          >
                            ✕ Fechar
                          </button>
                        </div>
                      </div>

                      {/* Loading State */}
                      {formTestLoading && (
                        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-center gap-3">
                          <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-blue-200">
                              Disparando payload fictício para o endpoint externo...
                            </p>
                            <p className="text-[10px] text-blue-400 font-mono truncate max-w-lg">
                              POST {formState.targetUrl}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Success / Error Message Banner */}
                      {!formTestLoading && (
                        <>
                          {formTestSuccessMessage && (
                            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Payload recebido com sucesso pela plataforma externa!</span>
                              </div>
                              <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                                Seu endpoint externo (n8n, Zapier, Webhook.site ou servidor próprio) respondeu com status positivo. A integração está pronta para receber mensagens reais em tempo real.
                              </p>
                            </div>
                          )}

                          {formTestError && (
                            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span>Aviso de Validação de Resposta</span>
                              </div>
                              <p className="text-[11px] text-rose-300/90 leading-relaxed">
                                {formTestError}
                              </p>
                            </div>
                          )}

                          {/* Inspect Details Tabs */}
                          {formTestResult && (
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => setIsFormTestPayloadOpen(!isFormTestPayloadOpen)}
                                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{isFormTestPayloadOpen ? 'Ocultar' : 'Ver'} Detalhes do Payload & Resposta</span>
                                  {isFormTestPayloadOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                </button>

                                {isFormTestPayloadOpen && formTestResult.requestPayload && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(JSON.stringify(formTestResult.requestPayload, null, 2), 'formTestJson')}
                                    className="text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
                                  >
                                    {copiedKey === 'formTestJson' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedKey === 'formTestJson' ? 'Copiado!' : 'Copiar Payload JSON'}</span>
                                  </button>
                                )}
                              </div>

                              {isFormTestPayloadOpen && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                  {/* Payload Dispatched */}
                                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Payload JSON Fictício Enviado
                                    </span>
                                    <pre className="text-[10px] font-mono text-emerald-400 bg-black/40 p-2.5 rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap leading-tight">
                                      {JSON.stringify(formTestResult.requestPayload, null, 2)}
                                    </pre>
                                  </div>

                                  {/* Response Body from External Server */}
                                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Resposta Retornada pelo Endpoint
                                      </span>
                                      <span className="text-[9px] font-mono text-slate-500">
                                        {formTestResult.responseHeaders?.['content-type'] || 'JSON'}
                                      </span>
                                    </div>
                                    <pre className="text-[10px] font-mono text-sky-300 bg-black/40 p-2.5 rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap leading-tight">
                                      {formTestResult.responseBody || 'Sem corpo de resposta (HTTP 204 No Content ou corpo vazio)'}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Canal de Filtro
                    </label>
                    <select
                      value={formState.channelFilter || 'omnichannel'}
                      onChange={(e) => setFormState({ ...formState, channelFilter: e.target.value as ChannelType })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      <option value="omnichannel">Omnichannel (Instagram, WhatsApp e Messenger)</option>
                      <option value="instagram">Apenas Instagram Direct</option>
                      <option value="whatsapp">Apenas WhatsApp</option>
                      <option value="messenger">Apenas Facebook Messenger</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Status Inicial
                    </label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formState.isActive}
                          onChange={(e) => setFormState({ ...formState, isActive: e.target.checked })}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          Endpoint Ativo para Despacho Imediato
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Autenticação e Segurança */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>2. Autenticação & Segurança do Callback</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Método de Autenticação
                    </label>
                    <select
                      value={formState.authType || 'bearer'}
                      onChange={(e) => setFormState({ ...formState, authType: e.target.value as ExternalWebhookAuthType })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      <option value="bearer">Bearer Token (Authorization: Bearer ...)</option>
                      <option value="api_key">API Key no Header (X-API-Key, apikey)</option>
                      <option value="hmac_sha256">HMAC SHA-256 Signature (X-Hub-Signature-256)</option>
                      <option value="basic">Basic Authentication (Usuário e Senha)</option>
                      <option value="none">Nenhuma Autenticação (Público / Aberto)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Verify Token de Handshake (GET Challenge)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="manyflow_verify_token_..."
                        value={formState.verifyToken || ''}
                        onChange={(e) => setFormState({ ...formState, verifyToken: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Conditional Auth Fields */}
                {formState.authType === 'bearer' && (
                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-blue-950 dark:text-blue-200">
                        Bearer Token Secreto
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, bearerToken: generateRandomToken('mf_sec_') })}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Gerar Token Aleatório
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Ex: mf_sec_89128371289371289371"
                      value={formState.bearerToken || ''}
                      onChange={(e) => setFormState({ ...formState, bearerToken: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-blue-700 dark:text-blue-300">
                      O token será enviado no cabeçalho <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code> em cada requisição.
                    </p>
                  </div>
                )}

                {formState.authType === 'api_key' && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                          Nome do Header
                        </label>
                        <input
                          type="text"
                          placeholder="X-API-Key"
                          value={formState.apiKeyHeaderName || 'X-API-Key'}
                          onChange={(e) => setFormState({ ...formState, apiKeyHeaderName: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl font-mono text-xs"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-indigo-950 dark:text-indigo-200">
                            Valor da API Key
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormState({ ...formState, apiKeyValue: generateRandomToken('key_live_') })}
                            className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                          >
                            Gerar Chave
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Chave secreta..."
                          value={formState.apiKeyValue || ''}
                          onChange={(e) => setFormState({ ...formState, apiKeyValue: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formState.authType === 'hmac_sha256' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <label className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                        <span>Chave Secreta HMAC SHA-256 (Validação de Autenticidade)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newSec = webhookSignatureService.generateSecret('whsec', 32);
                            setFormState({ ...formState, hmacSecret: newSec });
                          }}
                          className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 text-emerald-600" />
                          <span>Gerar Secret (256-bit)</span>
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setIsSignatureToolModalOpen(true)}
                          className="text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Sliders className="w-3 h-3 text-blue-600" />
                          <span>Ferramenta Avançada</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ex: whsec_87a98b76c543d2e1..."
                        value={formState.hmacSecret || ''}
                        onChange={(e) => setFormState({ ...formState, hmacSecret: e.target.value })}
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                      />
                      {formState.hmacSecret && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(formState.hmacSecret || '', 'modalHmacSecret')}
                          className="px-3 py-2 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 text-amber-900 dark:text-amber-100 rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          {copiedKey === 'modalHmacSecret' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'modalHmacSecret' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-amber-800 dark:text-amber-300">
                      O ManyFlow assinará o corpo da requisição e enviará o hash no header <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded font-mono">X-Hub-Signature-256: sha256=&lt;hash&gt;</code> para validação de integridade contra requisições forjadas.
                    </p>
                  </div>
                )}

                {formState.authType === 'basic' && (
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Usuário Basic Auth
                        </label>
                        <input
                          type="text"
                          placeholder="admin_webhook"
                          value={formState.basicUsername || ''}
                          onChange={(e) => setFormState({ ...formState, basicUsername: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Senha Basic Auth
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={formState.basicPassword || ''}
                          onChange={(e) => setFormState({ ...formState, basicPassword: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Seleção de Eventos de Mensagens */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>3. Eventos de Mensagens a Encaminhar ({formState.events?.length || 0})</span>
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, events: MESSAGE_EVENTS.map((m) => m.id) })}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Selecionar Todos
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, events: ['new_message', 'comment_mention'] })}
                      className="text-[10px] font-bold text-pink-600 dark:text-pink-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      <span>Apenas Instagram (DMs & Menções)</span>
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, events: ['message.received', 'message.media_received'] })}
                      className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                    >
                      Padrão
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MESSAGE_EVENTS.map((ev) => {
                    const isSelected = formState.events?.includes(ev.id);
                    return (
                      <label
                        key={ev.id}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const current = formState.events || [];
                            if (e.target.checked) {
                              setFormState({ ...formState, events: [...current, ev.id] });
                            } else {
                              setFormState({ ...formState, events: current.filter((x) => x !== ev.id) });
                            }
                          }}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 dark:text-white truncate">
                              {ev.label}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {ev.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">
                            {ev.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 4. Formato do Payload & Ajustes Avançados */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>4. Formato do Payload & Políticas de Retentativa (Backoff)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Estrutura do JSON
                    </label>
                    <select
                      value={formState.payloadFormat || 'standard_json'}
                      onChange={(e) => setFormState({ ...formState, payloadFormat: e.target.value as ExternalWebhookPayloadFormat })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    >
                      <option value="standard_json">Padrão ManyFlow (Recomendado)</option>
                      <option value="n8n_structured">n8n Structured Object</option>
                      <option value="typebot_compatible">Typebot Session Format</option>
                      <option value="meta_graph_compatible">Meta Graph API (entry[].messaging[])</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Timeout da Requisição
                    </label>
                    <select
                      value={formState.timeoutSeconds || 10}
                      onChange={(e) => setFormState({ ...formState, timeoutSeconds: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    >
                      <option value={5}>5 segundos (Rápido)</option>
                      <option value={10}>10 segundos (Padrão)</option>
                      <option value={30}>30 segundos (Longo)</option>
                      <option value={60}>60 segundos (Máximo)</option>
                    </select>
                  </div>
                </div>

                {/* Sub-card: Política de Retry e Backoff Exponencial */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200">
                          Política de Retry Automático & Backoff Exponencial
                        </h5>
                        <p className="text-[10px] text-indigo-700 dark:text-indigo-300">
                          Reenvie automaticamente dados em caso de instabilidade, rate limits (429) ou erro de servidor (5xx).
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.retryPolicy?.enabled !== false}
                        onChange={(e) => {
                          const currentPolicy = formState.retryPolicy || { ...DEFAULT_RETRY_POLICY };
                          setFormState({
                            ...formState,
                            retryPolicy: { ...currentPolicy, enabled: e.target.checked }
                          });
                        }}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Ativar Retries
                      </span>
                    </label>
                  </div>

                  {formState.retryPolicy?.enabled !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                          Estratégia de Backoff
                        </label>
                        <select
                          value={formState.retryPolicy?.strategy || 'exponential_jitter'}
                          onChange={(e) => {
                            const current = formState.retryPolicy || { ...DEFAULT_RETRY_POLICY };
                            setFormState({
                              ...formState,
                              retryPolicy: { ...current, strategy: e.target.value as WebhookBackoffStrategy }
                            });
                          }}
                          className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs"
                        >
                          <option value="exponential_jitter">Exponencial + Full Jitter (Recomendado)</option>
                          <option value="exponential">Exponencial Puro (2ⁿ)</option>
                          <option value="fibonacci">Sequência Fibonacci</option>
                          <option value="linear">Linear Constante</option>
                          <option value="fixed">Intervalo Fixo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                          Tentativas Máximas
                        </label>
                        <select
                          value={formState.retryPolicy?.maxRetries || 4}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const current = formState.retryPolicy || { ...DEFAULT_RETRY_POLICY };
                            setFormState({
                              ...formState,
                              maxRetries: val,
                              retryPolicy: { ...current, maxRetries: val }
                            });
                          }}
                          className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs"
                        >
                          <option value={1}>1 tentativa (Sem retry)</option>
                          <option value={2}>2 tentativas</option>
                          <option value={3}>3 tentativas</option>
                          <option value={4}>4 tentativas (Padrão)</option>
                          <option value={5}>5 tentativas</option>
                          <option value={8}>8 tentativas</option>
                          <option value={10}>10 tentativas (Ultra Resiliente)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                          Intervalo Inicial (T₀)
                        </label>
                        <select
                          value={formState.retryPolicy?.initialIntervalSec || 2}
                          onChange={(e) => {
                            const current = formState.retryPolicy || { ...DEFAULT_RETRY_POLICY };
                            setFormState({
                              ...formState,
                              retryPolicy: { ...current, initialIntervalSec: Number(e.target.value) }
                            });
                          }}
                          className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs"
                        >
                          <option value={1}>1 segundo</option>
                          <option value={2}>2 segundos (Padrão)</option>
                          <option value={5}>5 segundos</option>
                          <option value={10}>10 segundos</option>
                          <option value={30}>30 segundos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                          Multiplicador (Fator)
                        </label>
                        <select
                          value={formState.retryPolicy?.multiplier || 2.0}
                          onChange={(e) => {
                            const current = formState.retryPolicy || { ...DEFAULT_RETRY_POLICY };
                            setFormState({
                              ...formState,
                              retryPolicy: { ...current, multiplier: Number(e.target.value) }
                            });
                          }}
                          className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs"
                        >
                          <option value={1.5}>1.5x (Gradual)</option>
                          <option value={2.0}>2.0x (Padrão Exponencial)</option>
                          <option value={2.5}>2.5x (Agressivo)</option>
                          <option value={3.0}>3.0x (Rápido Espaçamento)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {formState.retryPolicy?.enabled !== false && (
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                        <input
                          type="checkbox"
                          checked={formState.retryPolicy?.jitter !== false}
                          onChange={(e) => {
                            const current = formState.retryPolicy || { ...DEFAULT_RETRY_POLICY };
                            setFormState({
                              ...formState,
                              retryPolicy: { ...current, jitter: e.target.checked }
                            });
                          }}
                          className="w-3.5 h-3.5 rounded text-indigo-600"
                        />
                        <span>Adicionar Jitter Aleatório (Evita Thundering Herd)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                        <input
                          type="checkbox"
                          checked={formState.retryPolicy?.deadLetterQueueEnabled !== false}
                          onChange={(e) => {
                            const current = formState.retryPolicy || { ...DEFAULT_RETRY_POLICY };
                            setFormState({
                              ...formState,
                              retryPolicy: { ...current, deadLetterQueueEnabled: e.target.checked }
                            });
                          }}
                          className="w-3.5 h-3.5 rounded text-indigo-600"
                        />
                        <span>Mover para Quarentena (Dead Letter Queue - DLQ) ao esgotar</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.includeContactMetadata}
                      onChange={(e) => setFormState({ ...formState, includeContactMetadata: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      Incluir dados do lead/contato (Nome, Tags, Telefone/Username)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.includeCustomFields}
                      onChange={(e) => setFormState({ ...formState, includeCustomFields: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      Incluir Campos Personalizados (Custom Fields)
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-semibold">Evento:</span>
                  </div>
                  <select
                    value={formTestEventType}
                    onChange={(e) => setFormTestEventType(e.target.value as ExternalMessageEventType)}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="message.received">Mensagem de Texto (Inbound)</option>
                    <option value="message.sent">Mensagem Enviada (Outbound)</option>
                    <option value="message.media_received">Mídia / Comprovante (Foto)</option>
                    <option value="message.audio_transcribed">Áudio Transcrito com IA</option>
                    <option value="message.reaction">Reação de Emoji (❤️/🔥)</option>
                    <option value="message.postback">Clique em Botão (Postback)</option>
                    <option value="message.story_reply">Resposta a Story</option>
                    <option value="message.story_mention">Menção em Story</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleSendTestFromForm()}
                    disabled={formTestLoading || !formState.targetUrl}
                    className="py-2 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                    title="Dispara um evento de teste fictício para a URL de destino configurada"
                  >
                    {formTestLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Enviar Teste</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Endpoint</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL: TESTADOR AO VIVO (PING & SIMULADOR DE PAYLOAD)                  */}
      {/* ====================================================================== */}
      {isTestModalOpen && testingEndpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-bold">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Testador de Callback em Tempo Real (Ping)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate max-w-md">
                    {testingEndpoint.name} • {testingEndpoint.targetUrl}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Controls */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Mode Selection */}
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTestMode('instant')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    testMode === 'instant'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Disparo Único Imediato</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTestMode('retry_simulation')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    testMode === 'retry_simulation'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Simulação de Resiliência & Backoff (Retries)</span>
                </button>
              </div>

              {testMode === 'retry_simulation' && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Parâmetros do Teste de Falha & Backoff</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
                      Estratégia: {testingEndpoint.retryPolicy?.strategy || 'exponential_jitter'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                        Código de Erro a Simular:
                      </label>
                      <select
                        value={testSimulatedErrorCode}
                        onChange={(e) => setTestSimulatedErrorCode(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs font-semibold"
                      >
                        <option value={503}>HTTP 503 - Service Unavailable</option>
                        <option value={429}>HTTP 429 - Too Many Requests (Rate Limit)</option>
                        <option value={502}>HTTP 502 - Bad Gateway</option>
                        <option value={504}>HTTP 504 - Gateway Timeout</option>
                        <option value={408}>HTTP 408 - Request Timeout</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                        Comportamento da Simulação:
                      </label>
                      <select
                        value={testFailUntilAttempt}
                        onChange={(e) => setTestFailUntilAttempt(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs font-semibold"
                      >
                        <option value={1}>Falhar na 1ª tentativa e recuperar na 2ª</option>
                        <option value={2}>Falhar nas 2 primeiras e recuperar na 3ª</option>
                        <option value={3}>Falhar nas 3 primeiras e recuperar na 4ª</option>
                        <option value={99}>Falhar em todas (Esgotar retries e enviar para DLQ)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800 dark:text-white block">
                    Selecione o Evento de Mensagem para Teste:
                  </label>
                  <select
                    value={testEventType}
                    onChange={(e) => setTestEventType(e.target.value as ExternalMessageEventType)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    {MESSAGE_EVENTS.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRunTestDispatch}
                  disabled={testLoading}
                  className={`py-2.5 px-5 rounded-xl text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                    testMode === 'retry_simulation'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  }`}
                >
                  {testLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>
                        {testNextCountdown !== null ? `Aguardando Backoff (${testNextCountdown}s)...` : 'Executando Ciclo de Retry...'}
                      </span>
                    </>
                  ) : (
                    <>
                      {testMode === 'retry_simulation' ? <RotateCcw className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                      <span>{testMode === 'retry_simulation' ? 'Iniciar Simulação de Retry' : 'Disparar Evento Agora'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Retry Live Steps Timeline */}
              {testRetryProgressLogs.length > 0 && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>Progresso dos Disparos & Retentativas ({testRetryProgressLogs.length})</span>
                    </span>
                    {testNextCountdown !== null && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] animate-pulse">
                        Próximo retry em {testNextCountdown}s (Calculado via Backoff)
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {testRetryProgressLogs.map((att, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                          att.statusCode >= 200 && att.statusCode < 300
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                              att.statusCode >= 200 && att.statusCode < 300
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            #{att.attemptNumber}
                          </span>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              <span>Tentativa {att.attemptNumber}</span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white dark:bg-slate-900 border">
                                HTTP {att.statusCode}
                              </span>
                              {att.calculatedDelaySec !== undefined && att.calculatedDelaySec > 0 && (
                                <span className="text-[10px] text-slate-500">
                                  (Backoff: {att.calculatedDelaySec}s)
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {att.errorMessage || 'Sucesso no processamento'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold font-mono text-[11px] block">
                            {att.latencyMs}ms
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(att.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payload Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileJson className="w-4 h-4 text-blue-500" />
                    <span>Payload JSON Enviado</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Formato: {testingEndpoint.payloadFormat}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-950 text-slate-200 rounded-2xl font-mono text-[11px] max-h-40 overflow-y-auto border border-slate-800">
                  <pre>
                    {JSON.stringify(
                      externalWebhookService.generateSamplePayload(
                        testEventType,
                        testingEndpoint.payloadFormat,
                        testingEndpoint.channelFilter === 'omnichannel' ? 'instagram' : testingEndpoint.channelFilter
                      ),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>

              {/* Result Panel */}
              {testResult && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-500" />
                      <span>Resultado Final do Ciclo de Entrega</span>
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        testResult.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      HTTP {testResult.statusCode} ({testResult.durationMs}ms) • Tentativas: {testResult.retryCount || 1}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900 text-emerald-300 rounded-2xl font-mono text-[11px] max-h-36 overflow-y-auto border border-slate-800">
                    <pre>{testResult.responseBody || JSON.stringify(testResult, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL: VERIFICADOR DE HANDSHAKE & CHALLENGE (GET / POST)              */}
      {/* ====================================================================== */}
      {isHandshakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Verificador de Handshake (hub.challenge)
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Valide se seu servidor responde ao teste de verificação Meta / Webhook
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHandshakeModalOpen(false)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL de Callback para Teste
                </label>
                <input
                  type="url"
                  placeholder="https://api.seusistema.com/webhooks/messages"
                  value={handshakeUrl}
                  onChange={(e) => setHandshakeUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    hub.verify_token
                  </label>
                  <input
                    type="text"
                    value={handshakeVerifyToken}
                    onChange={(e) => setHandshakeVerifyToken(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    hub.challenge
                  </label>
                  <input
                    type="text"
                    value={handshakeChallenge}
                    onChange={(e) => setHandshakeChallenge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleTestHandshake}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Simular Verificação de Handshake</span>
              </button>

              {handshakeResult.status !== 'idle' && (
                <div
                  className={`p-3.5 rounded-2xl border ${
                    handshakeResult.status === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}
                >
                  <p className="font-bold">{handshakeResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL: SNIPPETS DE CÓDIGO & INTEGRAÇÃO                                 */}
      {/* ====================================================================== */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 bg-indigo-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Snippets de Código para Recepção de Mensagens
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Copie o código pronto para autenticar e processar eventos no seu servidor
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="p-2 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Node.js / Express (com validação Bearer e HMAC SHA-256):</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

const BEARER_TOKEN = 'SEU_BEARER_TOKEN';
const HMAC_SECRET = 'SEU_HMAC_SECRET';

// Handshake de Verificação (GET)
app.get('/webhooks/messages', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (token === 'manyflow_verify_token_2026') {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Recepção de Eventos de Mensagens (POST)
app.post('/webhooks/messages', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader !== \`Bearer \${BEARER_TOKEN}\`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { event, channel, message, contact } = req.body;
  console.log(\`[ManyFlow Webhook] Evento: \${event} no canal \${channel}\`);
  console.log(\`Mensagem de \${contact.name}: \${message.text || message.transcription}\`);

  // Responda 200 OK rapidamente
  res.status(200).json({ received: true });
});

app.listen(3000, () => console.log('Webhook Server rodando na porta 3000'));`,
                        'code_node'
                      )
                    }
                    className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    {copiedKey === 'code_node' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Código</span>
                  </button>
                </h4>

                <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-[11px] max-h-80 overflow-y-auto border border-slate-800">
                  <pre>{`const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

const BEARER_TOKEN = 'SEU_BEARER_TOKEN';
const HMAC_SECRET = 'SEU_HMAC_SECRET';

// Handshake de Verificação (GET)
app.get('/webhooks/messages', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (token === 'manyflow_verify_token_2026') {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Recepção de Eventos de Mensagens (POST)
app.post('/webhooks/messages', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader !== \`Bearer \${BEARER_TOKEN}\`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { event, channel, message, contact } = req.body;
  console.log(\`[ManyFlow Webhook] Evento: \${event} no canal \${channel}\`);
  console.log(\`Mensagem de \${contact.name}: \${message.text || message.transcription}\`);

  // Responda 200 OK rapidamente
  res.status(200).json({ received: true });
});

app.listen(3000, () => console.log('Webhook Server rodando na porta 3000'));`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FERRAMENTA DE ASSINATURA & SECRET DE VALIDAÇÃO (HMAC SHA-256) */}
      {isSignatureToolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    Gerador & Validador de Assinatura Criptográfica (Secret HMAC)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Gere chaves secretas de 256-bit e teste a autenticidade de requisições recebidas
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSignatureToolModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content with Signature Tool */}
            <div className="p-6 overflow-y-auto flex-1">
              <WebhookSignatureTool
                tenantId={tenantId}
                onSecretApplied={(newSec) => {
                  if (formState.authType === 'hmac_sha256') {
                    setFormState((prev) => ({ ...prev, hmacSecret: newSec }));
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POLÍTICAS DE RETRY AUTOMÁTICO (EXPONENTIAL BACKOFF & DLQ) */}
      {isRetryPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    Configurador de Políticas de Retry & Resiliência (Exponential Backoff)
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Gerencie estratégias matemáticas de reenvio, simulador de atraso e Quarentena (DLQ)
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsRetryPolicyModalOpen(false);
                  setSelectedRetryEndpoint(null);
                  loadData();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content with Retry Policy Manager */}
            <div className="p-6 overflow-y-auto flex-1">
              <WebhookRetryPolicyManager
                tenantId={tenantId}
                initialEndpointId={selectedRetryEndpoint?.id}
                onClose={() => {
                  setIsRetryPolicyModalOpen(false);
                  setSelectedRetryEndpoint(null);
                  loadData();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
