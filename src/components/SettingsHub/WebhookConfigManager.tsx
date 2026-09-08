import React, { useState } from 'react';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Sliders, 
  Key, 
  ShieldCheck, 
  Send, 
  Sparkles, 
  Layers, 
  FileCode, 
  Activity, 
  Save, 
  X, 
  Radio, 
  Zap, 
  Globe, 
  Lock, 
  HelpCircle,
  Tag as TagIcon,
  ShoppingCart,
  Calendar,
  Users,
  DollarSign,
  RotateCw,
  Repeat,
  Timer,
  Gauge,
  AlertTriangle,
  Eye,
  EyeOff,
  Terminal,
  Code,
  Shield
} from 'lucide-react';
import { 
  WebhookSettingsState, 
  ConversionWebhookEndpoint, 
  ConversionEventType 
} from '../../types';
import { webhookService } from '../../services/webhookService';
import { 
  WebhookResponseInspectorModal, 
  WebhookResponseInspectorData 
} from './WebhookResponseInspectorModal';

interface WebhookConfigManagerProps {
  settings: WebhookSettingsState;
  onUpdateSettings: (settings: WebhookSettingsState) => void;
  onOpenLogs?: () => void;
}

const CONVERSION_EVENTS_METADATA: {
  id: ConversionEventType;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  exampleValue: string;
}[] = [
  {
    id: 'lead_generated',
    label: 'Lead Gerado / Formulário Preenchido',
    category: 'Leads & Aquisição',
    icon: Users,
    description: 'Disparado quando um novo lead informa seus dados (e-mail, WhatsApp, nome) no chat.',
    exampleValue: 'Novo contato qualificado com campos customizados'
  },
  {
    id: 'sale_completed',
    label: 'Venda Concluída / Checkout Aprovado',
    category: 'Vendas & Receita',
    icon: ShoppingCart,
    description: 'Disparado quando uma compra é finalizada via Direct ou confirmada pelo gateway de pagamento.',
    exampleValue: 'R$ 297,00 (Plano Pro Anual)'
  },
  {
    id: 'appointment_booked',
    label: 'Agendamento Realizado / Reunião Confirmada',
    category: 'Conversões & Reuniões',
    icon: Calendar,
    description: 'Disparado quando o seguidor agenda um horário de atendimento ou consulta pelo fluxo.',
    exampleValue: 'Reunião de Diagnóstico (Google Meet)'
  },
  {
    id: 'tag_added',
    label: 'Tag de Conversão Adicionada ao Contato',
    category: 'Segmentação',
    icon: TagIcon,
    description: 'Disparado assim que uma tag estratégica de conversão (ex: #comprou_vip, #lead_quente) é aplicada.',
    exampleValue: 'Tag: lead_quente_oportunidade'
  },
  {
    id: 'flow_completed',
    label: 'Fluxo de Conversão Concluído com Sucesso',
    category: 'Automação',
    icon: Zap,
    description: 'Disparado quando o usuário finaliza todas as etapas de um funil automatizado de conversão.',
    exampleValue: 'Funil: Lançamento VIP 2026'
  },
  {
    id: 'cart_abandoned',
    label: 'Carrinho Abandonado / Recuperação',
    category: 'E-commerce',
    icon: ShoppingCart,
    description: 'Disparado quando o usuário clica no link do checkout mas não finaliza o pagamento em até 30 min.',
    exampleValue: 'Recuperação com cupom DESCONTO10'
  },
  {
    id: 'pix_paid',
    label: 'Pagamento PIX Confirmado Instantaneamente',
    category: 'Vendas & Receita',
    icon: DollarSign,
    description: 'Disparado no momento exato em que a notificação de confirmação do PIX é recebida.',
    exampleValue: 'PIX Copia e Cola validado via Banco Central'
  },
  {
    id: 'contact_qualified',
    label: 'Lead Qualificado / Lead Score Atingido',
    category: 'Leads & Aquisição',
    icon: Sparkles,
    description: 'Disparado quando o lead atinge pontuação suficiente para repasse à equipe de corretores/vendedores.',
    exampleValue: 'Score > 80 pontos (MQL)'
  }
];

const PLATFORM_PRESETS = [
  { id: 'custom_webhook', label: 'Webhook REST / JSON Genérico', badge: 'Universal' },
  { id: 'rd_station', label: 'RD Station Marketing / CRM', badge: 'CRM BR' },
  { id: 'hubspot', label: 'HubSpot CRM', badge: 'CRM Global' },
  { id: 'active_campaign', label: 'ActiveCampaign', badge: 'Automação' },
  { id: 'zapier', label: 'Zapier Webhooks', badge: 'iPaaS' },
  { id: 'n8n', label: 'n8n Workflow Automation', badge: 'Self-Hosted' },
  { id: 'make', label: 'Make (Integromat)', badge: 'iPaaS' },
  { id: 'hotmart', label: 'Hotmart / Kiwify / Eduzz', badge: 'Checkout' }
] as const;

export const WebhookConfigManager: React.FC<WebhookConfigManagerProps> = ({
  settings,
  onUpdateSettings,
  onOpenLogs
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'conversions' | 'retries' | 'general' | 'docs'>('conversions');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Endpoint Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEndpointId, setEditingEndpointId] = useState<string | null>(null);

  // Form Fields (Endpoint-level)
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<ConversionEventType[]>([
    'lead_generated',
    'sale_completed'
  ]);
  const [targetPlatform, setTargetPlatform] = useState<ConversionWebhookEndpoint['targetPlatform']>('custom_webhook');
  const [secretToken, setSecretToken] = useState('');
  // Authentication Form state (Bearer Token, API Key, Custom Header)
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'api_key' | 'custom'>('none');
  const [bearerToken, setBearerToken] = useState<string>('');
  const [apiKeyHeaderName, setApiKeyHeaderName] = useState<string>('X-API-Key');
  const [apiKeyValue, setApiKeyValue] = useState<string>('');
  const [showAuthToken, setShowAuthToken] = useState<boolean>(false);
  const [includeCustomFields, setIncludeCustomFields] = useState(true);
  const [includeContactData, setIncludeContactData] = useState(true);
  const [description, setDescription] = useState('');
  const [headersList, setHeadersList] = useState<{ key: string; value: string }[]>([
    { key: 'X-Origin-App', value: 'ManyFlow-Conversion-Engine' }
  ]);

  // Retry Policy Fields (Endpoint-level)
  const [retryOnFailure, setRetryOnFailure] = useState(true);
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryIntervalSeconds, setRetryIntervalSeconds] = useState(30);
  const [backoffStrategy, setBackoffStrategy] = useState<'exponential' | 'fixed' | 'linear'>('exponential');
  const [timeoutSeconds, setTimeoutSeconds] = useState(10);
  const [retryableStatusCodes, setRetryableStatusCodes] = useState<number[]>([408, 429, 500, 502, 503, 504]);

  // Global Retry Policy Form (Server & Dispatch-level)
  const [autoRetryFailed, setAutoRetryFailed] = useState(settings.autoRetryFailed ?? true);
  const [globalMaxRetries, setGlobalMaxRetries] = useState(settings.maxRetryAttempts ?? 3);
  const [globalRetryIntervalSeconds, setGlobalRetryIntervalSeconds] = useState(settings.retryIntervalSeconds ?? 30);
  const [globalBackoffStrategy, setGlobalBackoffStrategy] = useState<'exponential' | 'fixed' | 'linear'>(settings.retryBackoffStrategy ?? 'exponential');
  const [globalTimeoutSeconds, setGlobalTimeoutSeconds] = useState(settings.retryTimeoutSeconds ?? 10);
  const [globalStatusCodes, setGlobalStatusCodes] = useState<number[]>(settings.retryableStatusCodes || [408, 429, 500, 502, 503, 504]);
  const [deadLetterQueueEnabled, setDeadLetterQueueEnabled] = useState(settings.deadLetterQueueEnabled ?? true);
  const [jitterEnabled, setJitterEnabled] = useState(settings.jitterEnabled ?? true);

  // Global Settings Form
  const [globalVerifyToken, setGlobalVerifyToken] = useState(settings.globalVerifyToken || 'manyflow_verify_token_secure_2026');
  const [appSecret, setAppSecret] = useState(settings.appSecret || 'mf_sec_89df2a3bc7e1480f90ab12d');
  const [serverBaseUrl, setServerBaseUrl] = useState(settings.serverBaseUrl || window.location.origin + '/api/webhooks');
  const [enableLogging, setEnableLogging] = useState(settings.enableLogging ?? true);

  // Test Dispatch State
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    endpointId: string;
    endpointName?: string;
    endpointUrl?: string;
    success: boolean;
    statusCode: number;
    durationMs: number;
    responseBody: string;
    payloadSent: any;
    requestHeaders?: Record<string, string>;
    calculatedHmac?: string;
    hasRealHmac?: boolean;
    secretProvided?: boolean;
  } | null>(null);

  // Inspector Modal State
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);
  const [inspectorData, setInspectorData] = useState<WebhookResponseInspectorData | null>(null);

  // Card & Modal Secret Visibility States
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [showSecretToken, setShowSecretToken] = useState(false);

  // Modal In-Form Test State
  const [modalTesting, setModalTesting] = useState(false);
  const [modalTestFeedback, setModalTestFeedback] = useState<{
    success: boolean;
    statusCode: number;
    durationMs: number;
    responseBody: string;
    calculatedHmac?: string;
    payloadSent?: any;
    headersSent?: Record<string, string>;
  } | null>(null);

  // Documentation sample selector
  const [selectedDocEvent, setSelectedDocEvent] = useState<ConversionEventType>('lead_generated');

  const conversionEndpoints = settings.conversionEndpoints || [];

  // Helper for computing retry timelines
  const calculateRetryTimeline = (
    attempts: number,
    interval: number,
    strategy: 'exponential' | 'fixed' | 'linear'
  ) => {
    const steps: { attempt: number; delay: number; cumulative: number }[] = [];
    let sum = 0;
    for (let i = 1; i <= attempts; i++) {
      let delay = interval;
      if (strategy === 'exponential') {
        delay = interval * Math.pow(2, i - 1);
      } else if (strategy === 'linear') {
        delay = interval * i;
      } else {
        delay = interval;
      }
      sum += delay;
      steps.push({ attempt: i, delay, cumulative: sum });
    }
    return { steps, totalSeconds: sum };
  };

  const formatSecondsText = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return rem > 0 ? `${mins}m ${rem}s` : `${mins}min`;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setEditingEndpointId(null);
    setName('');
    setUrl('');
    setSelectedEvents(['lead_generated', 'contact_qualified']);
    setTargetPlatform('rd_station');
    setSecretToken(`whsec_${Math.random().toString(36).substring(2, 12)}`);
    setIncludeCustomFields(true);
    setIncludeContactData(true);
    setRetryOnFailure(true);
    setMaxRetries(3);
    setRetryIntervalSeconds(30);
    setBackoffStrategy('exponential');
    setTimeoutSeconds(10);
    setRetryableStatusCodes([408, 429, 500, 502, 503, 504]);
    setDescription('');
    setAuthType('none');
    setBearerToken('');
    setApiKeyHeaderName('X-API-Key');
    setApiKeyValue('');
    setShowAuthToken(false);
    setHeadersList([{ key: 'X-Origin-App', value: 'ManyFlow-Conversion-Engine' }]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ep: ConversionWebhookEndpoint) => {
    setEditingEndpointId(ep.id);
    setName(ep.name);
    setUrl(ep.url);
    setSelectedEvents(ep.events || ['lead_generated']);
    setTargetPlatform(ep.targetPlatform || 'custom_webhook');
    setSecretToken(ep.secretToken || '');
    setAuthType(ep.authType || 'none');
    setBearerToken(ep.bearerToken || '');
    setApiKeyHeaderName(ep.apiKeyHeaderName || 'X-API-Key');
    setApiKeyValue(ep.apiKeyValue || '');
    setShowAuthToken(false);
    setIncludeCustomFields(ep.includeCustomFields ?? true);
    setIncludeContactData(ep.includeContactData ?? true);
    setRetryOnFailure(ep.retryOnFailure ?? true);
    setMaxRetries(ep.maxRetries ?? 3);
    setRetryIntervalSeconds(ep.retryIntervalSeconds ?? 30);
    setBackoffStrategy(ep.backoffStrategy ?? 'exponential');
    setTimeoutSeconds(ep.timeoutSeconds ?? 10);
    setRetryableStatusCodes(ep.retryableStatusCodes || [408, 429, 500, 502, 503, 504]);
    setDescription(ep.description || '');
    setHeadersList(ep.headers && ep.headers.length > 0 ? ep.headers : [{ key: 'X-Origin-App', value: 'ManyFlow' }]);
    setIsModalOpen(true);
  };

  const persistSettings = async (updated: WebhookSettingsState) => {
    setIsSaving(true);
    try {
      localStorage.setItem('manyflow_webhook_settings', JSON.stringify(updated));
      await webhookService.saveConfig(updated);
      onUpdateSettings(updated);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 2500);
    } catch (e) {
      console.error('Failed to save webhook settings:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || selectedEvents.length === 0) return;

    let updatedEndpoints: ConversionWebhookEndpoint[];

    // Build headers array merging base headers and explicit auth headers
    const baseHeaders = headersList.filter((h) => {
      const k = h.key.trim().toLowerCase();
      if (authType === 'bearer' && k === 'authorization') return false;
      if (authType === 'api_key' && k === (apiKeyHeaderName.trim().toLowerCase() || 'x-api-key')) return false;
      return Boolean(h.key.trim() && h.value.trim());
    });

    const finalHeaders = [...baseHeaders];
    if (authType === 'bearer' && bearerToken.trim()) {
      const cleanToken = bearerToken.trim().replace(/^Bearer\s+/i, '');
      finalHeaders.push({
        key: 'Authorization',
        value: `Bearer ${cleanToken}`
      });
    } else if (authType === 'api_key' && apiKeyValue.trim()) {
      finalHeaders.push({
        key: apiKeyHeaderName.trim() || 'X-API-Key',
        value: apiKeyValue.trim()
      });
    }

    if (editingEndpointId) {
      updatedEndpoints = conversionEndpoints.map((ep) => {
        if (ep.id === editingEndpointId) {
          return {
            ...ep,
            name: name.trim(),
            url: url.trim(),
            events: selectedEvents,
            targetPlatform,
            secretToken: secretToken.trim(),
            authType,
            bearerToken: bearerToken.trim(),
            apiKeyHeaderName: apiKeyHeaderName.trim(),
            apiKeyValue: apiKeyValue.trim(),
            includeCustomFields,
            includeContactData,
            retryOnFailure,
            maxRetries,
            retryIntervalSeconds,
            backoffStrategy,
            timeoutSeconds,
            retryableStatusCodes,
            description: description.trim(),
            headers: finalHeaders,
            updatedAt: new Date().toISOString()
          };
        }
        return ep;
      });
    } else {
      const newEp: ConversionWebhookEndpoint = {
        id: `wh_conv_${Date.now()}`,
        name: name.trim(),
        url: url.trim(),
        events: selectedEvents,
        isActive: true,
        direction: 'outbound',
        targetPlatform,
        secretToken: secretToken.trim(),
        authType,
        bearerToken: bearerToken.trim(),
        apiKeyHeaderName: apiKeyHeaderName.trim(),
        apiKeyValue: apiKeyValue.trim(),
        includeCustomFields,
        includeContactData,
        retryOnFailure,
        maxRetries,
        retryIntervalSeconds,
        backoffStrategy,
        timeoutSeconds,
        retryableStatusCodes,
        description: description.trim(),
        headers: finalHeaders,
        totalDeliveries: 0,
        totalErrors: 0,
        lastDeliveryStatus: 'idle',
        createdAt: new Date().toISOString()
      };
      updatedEndpoints = [...conversionEndpoints, newEp];
    }

    const updatedState: WebhookSettingsState = {
      ...settings,
      conversionEndpoints: updatedEndpoints
    };

    persistSettings(updatedState);
    setIsModalOpen(false);
  };

  const handleSaveGlobalRetryPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: WebhookSettingsState = {
      ...settings,
      autoRetryFailed,
      maxRetryAttempts: globalMaxRetries,
      retryIntervalSeconds: globalRetryIntervalSeconds,
      retryBackoffStrategy: globalBackoffStrategy,
      retryTimeoutSeconds: globalTimeoutSeconds,
      retryableStatusCodes: globalStatusCodes,
      deadLetterQueueEnabled,
      jitterEnabled
    };
    persistSettings(updated);
  };

  const handleToggleEndpointActive = (id: string, current: boolean) => {
    const updated = conversionEndpoints.map((ep) => {
      if (ep.id === id) {
        return { ...ep, isActive: !current, updatedAt: new Date().toISOString() };
      }
      return ep;
    });
    persistSettings({ ...settings, conversionEndpoints: updated });
  };

  const handleDeleteEndpoint = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta URL de webhook de conversão?')) {
      const updated = conversionEndpoints.filter((ep) => ep.id !== id);
      persistSettings({ ...settings, conversionEndpoints: updated });
    }
  };

  const handleSaveGlobalConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: WebhookSettingsState = {
      ...settings,
      globalVerifyToken: globalVerifyToken.trim(),
      appSecret: appSecret.trim(),
      serverBaseUrl: serverBaseUrl.trim(),
      enableLogging
    };
    persistSettings(updated);
  };

  const handleTestDispatch = async (endpoint: ConversionWebhookEndpoint) => {
    setTestingEndpointId(endpoint.id);
    setTestResult(null);

    const eventToTest = endpoint.events[0] || 'lead_generated';
    const sampleConversionPayload = {
      event: eventToTest,
      event_id: `evt_test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      app: 'ManyFlow',
      source: 'instagram',
      environment: 'production',
      data: {
        contact: {
          id: 'ct_test_lead_8829',
          name: 'Mariana Souza',
          username: 'mariana.souza',
          channel: 'instagram',
          email: 'mariana.souza@empresa.com.br',
          phone: '+5511987654321',
          status: 'active'
        },
        custom_fields: {
          email_lead: 'mariana.souza@empresa.com.br',
          whatsapp_lead: '11987654321',
          data_nascimento: '15/05/1995',
          cidade: 'São Paulo - SP',
          preferencia: 'Moda Feminina & Acessórios'
        },
        conversion: {
          type: eventToTest,
          value: eventToTest === 'sale_completed' ? 297.00 : eventToTest === 'pix_paid' ? 149.90 : 0.00,
          currency: 'BRL',
          flow_id: 'flow_onboarding_vip',
          flow_title: 'Qualificação de Leads VIP'
        }
      }
    };

    const headersMap: Record<string, string> = {};
    if (endpoint.headers) {
      endpoint.headers.forEach((h) => {
        if (h.key && h.value) headersMap[h.key] = h.value;
      });
    }

    try {
      const res = await webhookService.testDispatch({
        endpointUrl: endpoint.url,
        eventType: eventToTest,
        channel: 'instagram',
        customPayload: sampleConversionPayload,
        customHeaders: headersMap,
        secretToken: endpoint.secretToken || '',
        endpointName: endpoint.name,
        timeoutSeconds: endpoint.timeoutSeconds || 10,
        authType: endpoint.authType || 'none',
        bearerToken: endpoint.bearerToken || '',
        apiKeyHeaderName: endpoint.apiKeyHeaderName || 'X-API-Key',
        apiKeyValue: endpoint.apiKeyValue || ''
      });

      const fullResult = {
        endpointId: endpoint.id,
        endpointName: endpoint.name,
        endpointUrl: endpoint.url,
        success: res.success,
        statusCode: res.statusCode,
        durationMs: res.durationMs,
        responseBody: res.responseBody,
        payloadSent: sampleConversionPayload,
        requestHeaders: res.requestHeaders || headersMap,
        calculatedHmac: res.calculatedHmac,
        hasRealHmac: res.hasRealHmac,
        secretProvided: res.secretProvided || Boolean(endpoint.secretToken)
      };

      setTestResult(fullResult);
      setInspectorData(fullResult);

      // Update delivery stats on the endpoint
      const updated = conversionEndpoints.map((ep) => {
        if (ep.id === endpoint.id) {
          return {
            ...ep,
            totalDeliveries: (ep.totalDeliveries || 0) + 1,
            totalErrors: res.success ? (ep.totalErrors || 0) : (ep.totalErrors || 0) + 1,
            lastDeliveryStatus: (res.success ? 'success' : 'failed') as any,
            lastDeliveryAt: new Date().toISOString(),
            lastStatusCode: res.statusCode
          };
        }
        return ep;
      });

      persistSettings({ ...settings, conversionEndpoints: updated });
    } catch (err: any) {
      const errorResult = {
        endpointId: endpoint.id,
        endpointName: endpoint.name,
        endpointUrl: endpoint.url,
        success: false,
        statusCode: 502,
        durationMs: 0,
        responseBody: err.message || 'Falha de conexão com o endpoint externo.',
        payloadSent: sampleConversionPayload,
        requestHeaders: headersMap,
      };
      setTestResult(errorResult);
      setInspectorData(errorResult);
    } finally {
      setTestingEndpointId(null);
    }
  };

  const handleModalTestDispatch = async () => {
    if (!url || !url.startsWith('http')) {
      alert('Por favor, informe uma URL válida antes de testar a conexão.');
      return;
    }
    setModalTesting(true);
    setModalTestFeedback(null);
    try {
      const eventToTest = selectedEvents[0] || 'lead_generated';
      const samplePayload = {
        event: eventToTest,
        event_id: `evt_test_modal_${Date.now()}`,
        timestamp: new Date().toISOString(),
        app: 'ManyFlow',
        source: 'instagram',
        data: {
          contact: {
            id: 'ct_test_lead_9901',
            name: 'Mariana Souza',
            username: 'mariana.souza',
            channel: 'instagram',
            email: 'mariana.souza@empresa.com.br',
            phone: '+5511987654321',
            status: 'active'
          },
          conversion: {
            type: eventToTest,
            value: 297.00,
            currency: 'BRL',
            flow_id: 'flow_teste_modal',
            flow_title: 'Teste de Integração de Webhook'
          }
        }
      };

      const customHeaders: Record<string, string> = {};
      headersList.forEach((h) => {
        if (h.key && h.value) customHeaders[h.key] = h.value;
      });

      const res = await webhookService.testDispatch({
        endpointUrl: url.trim(),
        eventType: eventToTest,
        channel: 'instagram',
        customPayload: samplePayload,
        customHeaders,
        secretToken: secretToken.trim(),
        endpointName: name.trim() || 'Teste em Modal',
        timeoutSeconds: timeoutSeconds || 10,
        authType,
        bearerToken,
        apiKeyHeaderName,
        apiKeyValue
      });

      const feedbackData = {
        success: res.success,
        statusCode: res.statusCode,
        durationMs: res.durationMs,
        responseBody: res.responseBody,
        calculatedHmac: res.calculatedHmac,
        payloadSent: samplePayload,
        headersSent: res.requestHeaders || customHeaders
      };

      setModalTestFeedback(feedbackData);

      // Pre-populate inspector data in case user clicks to inspect
      setInspectorData({
        endpointName: name.trim() || 'Endpoint em Configuração',
        endpointUrl: url.trim(),
        success: res.success,
        statusCode: res.statusCode,
        durationMs: res.durationMs,
        responseBody: res.responseBody,
        payloadSent: samplePayload,
        requestHeaders: res.requestHeaders || customHeaders,
        calculatedHmac: res.calculatedHmac,
        hasRealHmac: res.hasRealHmac,
        secretProvided: Boolean(secretToken.trim())
      });
    } catch (err: any) {
      setModalTestFeedback({
        success: false,
        statusCode: 502,
        durationMs: 0,
        responseBody: err.message || 'Erro ao conectar ao endpoint.',
      });
    } finally {
      setModalTesting(false);
    }
  };

  const toggleEventSelection = (eventId: ConversionEventType) => {
    if (selectedEvents.includes(eventId)) {
      if (selectedEvents.length === 1) return; // keep at least one
      setSelectedEvents(selectedEvents.filter((id) => id !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const getSampleJsonForEvent = (event: ConversionEventType) => {
    return {
      event,
      event_id: `evt_sample_${Date.now()}`,
      timestamp: new Date().toISOString(),
      app: 'ManyFlow',
      source: 'instagram',
      data: {
        contact: {
          id: 'ct_lead_10928',
          name: 'Juliana Mendes',
          username: 'juliana.mendes',
          channel: 'instagram',
          email: 'juliana@empresa.com.br',
          phone: '+5511998765432'
        },
        custom_fields: {
          email_lead: 'juliana@empresa.com.br',
          whatsapp_lead: '11998765432',
          cidade: 'Curitiba - PR',
          cargo: 'Diretora Comercial'
        },
        conversion: {
          type: event,
          value: event === 'sale_completed' ? 490.00 : event === 'pix_paid' ? 250.00 : 0.00,
          currency: 'BRL',
          flow_name: 'Funil de Alta Conversão'
        }
      }
    };
  };

  return (
    <div className="space-y-6" id="webhook_config_manager_container">
      {/* Top Banner & State Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#0084FF] flex items-center justify-center">
            <Webhook className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
              <span>Configuração de Webhooks & Eventos de Conversão</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {conversionEndpoints.length} {conversionEndpoints.length === 1 ? 'URL configurada' : 'URLs configuradas'}
              </span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Defina as URLs externas para recebimento automático de eventos de conversão (Leads, Vendas, Agendamentos, PIX) e integre com CRMs externos, n8n ou Zapier.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {saveSuccessMsg && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Estado Atualizado no App!</span>
            </span>
          )}

          <button
            id="btn_create_conversion_webhook"
            onClick={handleOpenCreateModal}
            className="py-2.5 px-4 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar URL de Webhook</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('conversions')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'conversions'
                ? 'border-[#0084FF] text-[#0084FF]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Zap className="w-4 h-4 text-blue-600" />
            <span>URLs de Eventos de Conversão ({conversionEndpoints.length})</span>
          </button>

          <button
            id="subtab_webhook_retries"
            onClick={() => setActiveSubTab('retries')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'retries'
                ? 'border-[#0084FF] text-[#0084FF]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <RotateCw className="w-4 h-4 text-amber-600" />
            <span>Políticas de Retentativa & Resiliência</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              {globalMaxRetries}x / {globalRetryIntervalSeconds}s
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('general')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'general'
                ? 'border-[#0084FF] text-[#0084FF]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Credenciais Globais & HMAC</span>
          </button>

          <button
            onClick={() => setActiveSubTab('docs')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'docs'
                ? 'border-[#0084FF] text-[#0084FF]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Estrutura do Payload JSON (Doc)</span>
          </button>
        </div>

        {onOpenLogs && (
          <button
            onClick={onOpenLogs}
            className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Ver Logs de Entrega em Tempo Real</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CONVERSION WEBHOOK ENDPOINTS                       */}
      {/* ========================================================= */}
      {activeSubTab === 'conversions' && (
        <div className="settings-webhook-section space-y-4">
          {conversionEndpoints.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-gray-200 space-y-3">
              <Webhook className="w-10 h-10 text-gray-400 mx-auto" />
              <h4 className="text-sm font-bold text-gray-800">Nenhuma URL de Webhook de Conversão Configurada</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Adicione uma URL para receber eventos em tempo real quando clientes realizarem compras, preencherem formulários de qualificação ou agendarem reuniões.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-[#0084FF] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Configurar Primeira URL</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {conversionEndpoints.map((ep) => {
                const isTesting = testingEndpointId === ep.id;
                const result = testResult?.endpointId === ep.id ? testResult : null;

                return (
                  <div
                    key={ep.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden transition-all hover:border-blue-300"
                  >
                    {/* Endpoint Card Header */}
                    <div className="p-4 bg-[#F8F9FB] border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${ep.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#1A1D21]">{ep.name}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                              {ep.targetPlatform ? ep.targetPlatform.replace('_', ' ') : 'REST'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ep.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {ep.isActive ? 'Ativo' : 'Pausado'}
                            </span>
                          </div>
                          {ep.description && (
                            <p className="text-[11px] text-gray-500 mt-0.5">{ep.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Active Button */}
                        <button
                          onClick={() => handleToggleEndpointActive(ep.id, ep.isActive)}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
                            ep.isActive
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {ep.isActive ? 'Pausar' : 'Ativar'}
                        </button>

                        {/* Testar Conexão Button */}
                        <button
                          id={`btn_test_conn_${ep.id}`}
                          onClick={() => handleTestDispatch(ep)}
                          disabled={isTesting}
                          title="Enviar payload de teste e inspecionar resposta do servidor"
                          className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:shadow cursor-pointer"
                        >
                          {isTesting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Testando Conexão...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                              <span>Testar Conexão</span>
                            </>
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(ep)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-[#0084FF] hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Editar configuração do webhook"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteEndpoint(ep.id)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir endpoint"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Endpoint Details */}
                    <div className="p-4 space-y-3 text-xs">
                      {/* URL Display */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-semibold shrink-0">URL de Destino:</span>
                        <div className="flex-1 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 font-mono text-[11px] text-gray-800 flex items-center justify-between overflow-x-auto">
                          <span className="truncate">{ep.url}</span>
                          <button
                            onClick={() => handleCopy(ep.url, `url_${ep.id}`)}
                            className="text-gray-400 hover:text-gray-700 ml-2 cursor-pointer shrink-0"
                            title="Copiar URL"
                          >
                            {copiedKey === `url_${ep.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Secret Key / Token de Assinatura HMAC Display */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-semibold shrink-0">Secret Key / HMAC:</span>
                        <div className="flex-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 flex items-center justify-between overflow-x-auto">
                          {ep.secretToken ? (
                            <div className="flex items-center gap-2">
                              <span className="text-purple-700 font-bold">
                                {revealedSecrets[ep.id] ? ep.secretToken : `••••••••••••••••${ep.secretToken.slice(-4)}`}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-sans font-bold flex items-center gap-1">
                                <Shield className="w-3 h-3 text-purple-600" />
                                HMAC SHA-256 Ativo
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Nenhum token de assinatura definido</span>
                          )}

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {ep.secretToken && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setRevealedSecrets((prev) => ({ ...prev, [ep.id]: !prev[ep.id] }))}
                                  className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                                  title={revealedSecrets[ep.id] ? 'Ocultar Secret' : 'Revelar Secret'}
                                >
                                  {revealedSecrets[ep.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(ep.secretToken || '', `sec_${ep.id}`)}
                                  className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                                  title="Copiar Secret Key"
                                >
                                  {copiedKey === `sec_${ep.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Authentication HTTP Display */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-semibold shrink-0">Autenticação HTTP:</span>
                        <div className="flex-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 flex items-center justify-between overflow-x-auto">
                          {ep.authType === 'bearer' && (
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-sans font-bold flex items-center gap-1">
                                <Key className="w-3 h-3 text-indigo-600" />
                                Bearer Token
                              </span>
                              <span className="text-indigo-700 font-mono text-[10px]">
                                Authorization: Bearer {ep.bearerToken ? (revealedSecrets[`auth_${ep.id}`] ? ep.bearerToken : `••••••••${ep.bearerToken.slice(-4)}`) : '••••••••'}
                              </span>
                            </div>
                          )}
                          {ep.authType === 'api_key' && (
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-sans font-bold flex items-center gap-1">
                                <Key className="w-3 h-3 text-purple-600" />
                                API Key
                              </span>
                              <span className="text-purple-700 font-mono text-[10px]">
                                {ep.apiKeyHeaderName || 'X-API-Key'}: {ep.apiKeyValue ? (revealedSecrets[`auth_${ep.id}`] ? ep.apiKeyValue : `••••••••${ep.apiKeyValue.slice(-4)}`) : '••••••••'}
                              </span>
                            </div>
                          )}
                          {ep.authType === 'custom' && (
                            <span className="text-blue-700 text-[10px] font-bold">
                              {ep.headers?.length || 0} Cabeçalho(s) Personalizado(s)
                            </span>
                          )}
                          {(!ep.authType || ep.authType === 'none') && (
                            <span className="text-gray-400 italic">Nenhuma autorização configurada</span>
                          )}

                          {(ep.bearerToken || ep.apiKeyValue) && (
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={() => setRevealedSecrets((prev) => ({ ...prev, [`auth_${ep.id}`]: !prev[`auth_${ep.id}`] }))}
                                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                                title={revealedSecrets[`auth_${ep.id}`] ? 'Ocultar Auth' : 'Revelar Auth'}
                              >
                                {revealedSecrets[`auth_${ep.id}`] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Subscribed Conversion Events Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-500 font-semibold shrink-0">Eventos Inscritos:</span>
                        {ep.events.map((evtId) => {
                          const meta = CONVERSION_EVENTS_METADATA.find((m) => m.id === evtId);
                          return (
                            <span
                              key={evtId}
                              className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-bold inline-flex items-center gap-1"
                            >
                              <Zap className="w-2.5 h-2.5 text-purple-600" />
                              <span>{meta?.label || evtId}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Options & Metrics Summary */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                        <div className="text-gray-600">
                          <span>Custom Fields: </span>
                          <strong className={ep.includeCustomFields ? 'text-emerald-700' : 'text-gray-500'}>
                            {ep.includeCustomFields ? 'Sim (Inclusos)' : 'Não'}
                          </strong>
                        </div>
                        <div className="text-gray-600">
                          <span>Política de Retry: </span>
                          <strong className={ep.retryOnFailure ? 'text-blue-700 font-semibold' : 'text-gray-500 font-normal'}>
                            {ep.retryOnFailure ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                                <RotateCw className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                {ep.maxRetries || 3}x • {ep.retryIntervalSeconds || 30}s ({ep.backoffStrategy === 'fixed' ? 'Fixo' : ep.backoffStrategy === 'linear' ? 'Linear' : 'Exponencial'})
                              </span>
                            ) : (
                              'Desativado'
                            )}
                          </strong>
                        </div>
                        <div className="text-gray-600">
                          <span>Total de Disparos: </span>
                          <strong>{ep.totalDeliveries || 0}</strong>
                        </div>
                        <div className="text-gray-600">
                          <span>Último Status: </span>
                          <span className={`font-bold ${
                            ep.lastDeliveryStatus === 'success' 
                              ? 'text-emerald-600' 
                              : ep.lastDeliveryStatus === 'failed' 
                              ? 'text-rose-600' 
                              : 'text-gray-400'
                          }`}>
                            {ep.lastDeliveryStatus === 'success' 
                              ? `200 OK (${ep.lastStatusCode || 200})` 
                              : ep.lastDeliveryStatus === 'failed' 
                              ? `Erro (${ep.lastStatusCode || 'Falha'})` 
                              : 'Sem disparos'}
                          </span>
                        </div>
                      </div>

                      {/* Live Test Results Box */}
                      {result && (
                        <div className={`p-3.5 rounded-xl border text-xs space-y-2.5 ${
                          result.success 
                            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs' 
                            : 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-xs'
                        }`}>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              {result.success ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                              <span className="font-bold">
                                Conexão Testada: HTTP {result.statusCode} {result.success ? 'OK' : 'Falha'}
                              </span>
                              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/80 border border-gray-200 text-gray-700">
                                ⏱️ {result.durationMs}ms
                              </span>
                              {result.hasRealHmac && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center gap-1 border border-blue-200">
                                  <Shield className="w-3 h-3 text-blue-600" />
                                  HMAC Verificado
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setInspectorData(result as any);
                                setIsInspectorModalOpen(true);
                              }}
                              className="px-3 py-1 bg-white hover:bg-gray-50 text-gray-800 rounded-lg text-xs font-bold border border-gray-300 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Terminal className="w-3.5 h-3.5 text-blue-600" />
                              <span>Inspecionar Resposta Completa & Headers HMAC</span>
                            </button>
                          </div>

                          <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] max-h-24 overflow-y-auto leading-relaxed">
                            <div className="text-slate-400 text-[10px] mb-1 font-sans">Resposta do Servidor Externo:</div>
                            {result.responseBody || '(corpo da resposta vazio)'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: RETRY POLICIES & DELIVERY RESILIENCE               */}
      {/* ========================================================= */}
      {activeSubTab === 'retries' && (
        <form onSubmit={handleSaveGlobalRetryPolicy} className="space-y-5 text-xs" id="form_webhook_retry_policies">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <RotateCw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
                    <span>Políticas de Retentativa & Resiliência na Entrega de Eventos</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      {globalMaxRetries} tentativas • {globalRetryIntervalSeconds}s
                    </span>
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Garanta a resiliência na comunicação com servidores externos (ex: CRMs, Webhooks de terceiros, n8n, Zapier) mesmo durante instabilidade de rede ou manutenções temporárias.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#0084FF] hover:bg-[#0073E6] disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Políticas de Retentativa</span>
                </button>
              </div>
            </div>

            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-200">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-gray-900">
                    Habilitar Política de Retentativa Automática para Servidores Externos
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/70 text-amber-900">
                    Recomendado
                  </span>
                </div>
                <p className="text-[11px] text-gray-600">
                  Quando ativado, falhas transitórias (HTTP 408, 429, 500, 502, 503, 504) entram automaticamente no ciclo de retentativas programadas sem perda de dados do lead ou venda.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={autoRetryFailed}
                  onChange={(e) => setAutoRetryFailed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0084FF]"></div>
              </label>
            </div>

            {/* Config Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Field 1: Max Retries */}
              <div className="space-y-2 p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Repeat className="w-4 h-4 text-blue-600" />
                    <span>Número Máximo de Tentativas</span>
                  </label>
                  <span className="text-xs font-bold text-blue-600 font-mono">{globalMaxRetries} retentativas</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Quantidade máxima de tentativas de entrega subsequentes antes de marcar o evento como falho ou direcioná-lo para a DLQ.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={globalMaxRetries}
                    onChange={(e) => setGlobalMaxRetries(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-24 px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] font-bold text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                  />
                  <div className="flex items-center gap-1.5">
                    {[3, 5, 10].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setGlobalMaxRetries(preset)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          globalMaxRetries === preset
                            ? 'bg-[#0084FF] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {preset}x {preset === 3 ? '(Padrão)' : preset === 5 ? '(Resiliente)' : '(Missão Crítica)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 2: Retry Interval in Seconds */}
              <div className="space-y-2 p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-emerald-600" />
                    <span>Intervalo de Tempo Base (em segundos)</span>
                  </label>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{globalRetryIntervalSeconds} segundos</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Tempo em segundos para a primeira retentativa. Nas tentativas seguintes, este valor é escalonado conforme a estratégia de backoff.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min={5}
                    max={600}
                    step={5}
                    value={globalRetryIntervalSeconds}
                    onChange={(e) => setGlobalRetryIntervalSeconds(Math.min(600, Math.max(5, parseInt(e.target.value) || 5)))}
                    className="w-24 px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] font-bold text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[15, 30, 60, 120].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setGlobalRetryIntervalSeconds(sec)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          globalRetryIntervalSeconds === sec
                            ? 'bg-[#0084FF] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 3: Backoff Strategy */}
              <div className="space-y-2 p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0]">
                <label className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-purple-600" />
                  <span>Estratégia de Backoff (Curva de Recuo)</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  Define como o intervalo entre as retentativas cresce ao longo do tempo para evitar sobrecarregar o servidor remoto.
                </p>
                <select
                  value={globalBackoffStrategy}
                  onChange={(e) => setGlobalBackoffStrategy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                >
                  <option value="exponential">Backoff Exponencial (2ⁿ × base) — Recomendado para APIs externas</option>
                  <option value="linear">Linear Progressivo (n × base) — Crescimento constante suave</option>
                  <option value="fixed">Intervalo Fixo (constante) — Mesmo tempo entre todas as tentativas</option>
                </select>
              </div>

              {/* Field 4: Request Timeout */}
              <div className="space-y-2 p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0]">
                <label className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Timeout Máximo por Requisição (Segundos)</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  Tempo limite de espera pela resposta HTTP do servidor remoto antes de abortar e agendar a próxima tentativa.
                </p>
                <select
                  value={globalTimeoutSeconds}
                  onChange={(e) => setGlobalTimeoutSeconds(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                >
                  <option value={5}>5 segundos (Para APIs rápidas de alta performance)</option>
                  <option value={10}>10 segundos (Padrão recomendado para a maioria dos CRMs)</option>
                  <option value={15}>15 segundos (Para redes móveis ou integrações complexas)</option>
                  <option value={30}>30 segundos (Para processamento pesado no webhook)</option>
                </select>
              </div>
            </div>

            {/* Retryable Status Codes */}
            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2">
              <label className="font-bold text-gray-900 block">
                Códigos de Resposta HTTP que Disparam Retentativa Automática:
              </label>
              <p className="text-[11px] text-gray-500">
                Se o endpoint responder com algum destes códigos ou a conexão sofrer timeout/queda de rede, o ManyFlow agendará automaticamente uma nova tentativa. Erros como 400 (Bad Request) ou 401 (Não autorizado) não devem ser re-tentados.
              </p>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {[
                  { code: 408, label: '408 Request Timeout', desc: 'Servidor demorou a responder' },
                  { code: 429, label: '429 Rate Limit', desc: 'Excesso de requisições / Throttling' },
                  { code: 500, label: '500 Internal Error', desc: 'Erro temporário interno no servidor' },
                  { code: 502, label: '502 Bad Gateway', desc: 'Falha no gateway intermediário' },
                  { code: 503, label: '503 Unavailable', desc: 'Servidor temporariamente indisponível' },
                  { code: 504, label: '504 Gateway Timeout', desc: 'Timeout no gateway de upstream' }
                ].map(({ code, label, desc }) => {
                  const isSelected = globalStatusCodes.includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (globalStatusCodes.length > 1) {
                            setGlobalStatusCodes(globalStatusCodes.filter((c) => c !== code));
                          }
                        } else {
                          setGlobalStatusCodes([...globalStatusCodes, code]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                      title={desc}
                    >
                      <span>{label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Resilience Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50/70 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={jitterEnabled}
                  onChange={(e) => setJitterEnabled(e.target.checked)}
                  className="rounded text-[#0084FF] focus:ring-0 mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="font-bold block text-xs text-gray-900">Proteção contra Thundering Herd (Jitter Aleatório ±15%)</span>
                  <p className="text-[11px] text-gray-500">
                    Aplica uma variação aleatória suave nos tempos de espera para que múltiplos eventos não atinjam o servidor externo exatamente no mesmo milissegundo.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50/70 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={deadLetterQueueEnabled}
                  onChange={(e) => setDeadLetterQueueEnabled(e.target.checked)}
                  className="rounded text-[#0084FF] focus:ring-0 mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="font-bold block text-xs text-gray-900">Fila de Mensagens Não Entregues (Dead-Letter Queue - DLQ)</span>
                  <p className="text-[11px] text-gray-500">
                    Se todas as {globalMaxRetries} tentativas falharem, o payload é retido em quarentena segura para auditoria, notificação e reenvio manual posterior.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Interactive Resilience Simulator Timeline Card */}
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div>
                <h4 className="text-xs font-bold text-[#1A1D21] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Simulador Visual do Cronograma de Retentativas</span>
                </h4>
                <p className="text-[11px] text-gray-500">
                  Veja exatamente em quais momentos no tempo as requisições serão re-disparadas em caso de falha de entrega externa.
                </p>
              </div>

              {(() => {
                const { totalSeconds } = calculateRetryTimeline(globalMaxRetries, globalRetryIntervalSeconds, globalBackoffStrategy);
                return (
                  <div className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs flex items-center gap-2 shrink-0">
                    <span>Janela Total de Tolerância:</span>
                    <strong className="text-blue-950 font-mono text-sm">~{formatSecondsText(totalSeconds)}</strong>
                  </div>
                );
              })()}
            </div>

            {/* Visual Timeline Steps */}
            {(() => {
              const { steps, totalSeconds } = calculateRetryTimeline(globalMaxRetries, globalRetryIntervalSeconds, globalBackoffStrategy);
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 overflow-x-auto py-3 px-1">
                    {/* Step 0: Initial Dispatch Failure */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 bg-rose-50 border border-rose-200 p-3 rounded-xl min-w-[130px] text-center">
                      <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        T0
                      </div>
                      <span className="font-bold text-xs text-rose-900">1º Disparo (Falha)</span>
                      <span className="text-[10px] text-rose-600 font-mono">Status: 502 / 503 / 504</span>
                      <span className="text-[9px] text-gray-500 bg-white px-2 py-0.5 rounded border border-rose-100">Tempo: 0s</span>
                    </div>

                    {steps.map((step) => (
                      <React.Fragment key={step.attempt}>
                        <div className="flex flex-col items-center justify-center shrink-0 px-1 text-gray-400">
                          <span className="text-xs font-bold font-mono text-blue-600">+{formatSecondsText(step.delay)}</span>
                          <span className="text-gray-300">━━━━▶</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 shrink-0 bg-blue-50/70 border border-blue-200 p-3 rounded-xl min-w-[130px] text-center">
                          <div className="w-7 h-7 rounded-full bg-[#0084FF] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            #{step.attempt}
                          </div>
                          <span className="font-bold text-xs text-blue-950">Tentativa {step.attempt}</span>
                          <span className="text-[10px] text-blue-700 font-medium">Espera: +{formatSecondsText(step.delay)}</span>
                          <span className="text-[9px] text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold">
                            T+{formatSecondsText(step.cumulative)}
                          </span>
                        </div>
                      </React.Fragment>
                    ))}

                    <div className="flex flex-col items-center justify-center shrink-0 px-1 text-gray-400">
                      <span className="text-[10px] font-bold text-amber-600">Esgotado</span>
                      <span className="text-gray-300">━━━━▶</span>
                    </div>

                    {/* Step Final: DLQ or Finished */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 bg-slate-900 text-white p-3 rounded-xl min-w-[140px] text-center">
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-900 font-black text-xs flex items-center justify-center shadow-xs">
                        DLQ
                      </div>
                      <span className="font-bold text-xs text-amber-300">Quarentena DLQ</span>
                      <span className="text-[10px] text-slate-300">Retenção de Payload</span>
                      <span className="text-[9px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        Após {formatSecondsText(totalSeconds)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Se em <strong>qualquer</strong> uma das {globalMaxRetries} tentativas o servidor remoto responder com HTTP 2xx (ex: 200 OK ou 201 Created), a entrega é finalizada imediatamente com sucesso e as tentativas restantes são canceladas.
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 3: GLOBAL CREDENTIALS & HMAC                          */}
      {/* ========================================================= */}
      {activeSubTab === 'general' && (
        <form onSubmit={handleSaveGlobalConfig} className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-5 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Key className="w-4 h-4 text-[#0084FF]" />
            <h4 className="text-xs font-bold text-[#1A1D21]">Credenciais de Autenticação & Endereço do Servidor</h4>
          </div>

          <div className="space-y-4">
            {/* Global Verify Token */}
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Token de Verificação Global (Meta Hub Verify Token)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={globalVerifyToken}
                  onChange={(e) => setGlobalVerifyToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                />
                <button
                  type="button"
                  onClick={() => setGlobalVerifyToken(`manyflow_token_${Math.random().toString(36).substring(2, 10)}`)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold shrink-0 cursor-pointer"
                >
                  Gerar Novo
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Token informado no painel de desenvolvedores do Facebook para o handshake do Webhook.
              </p>
            </div>

            {/* App Secret for HMAC */}
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Segredo do Aplicativo Meta (App Secret para HMAC SHA-256)
              </label>
              <input
                type="text"
                required
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Utilizado para verificar a assinatura <code className="bg-gray-100 px-1 py-0.5 rounded">X-Hub-Signature-256</code> de eventos recebidos da Meta.
              </p>
            </div>

            {/* Server Base URL */}
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                URL Base dos Webhooks ManyFlow
              </label>
              <input
                type="url"
                required
                value={serverBaseUrl}
                onChange={(e) => setServerBaseUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
              />
            </div>

            {/* Enable Detailed Logs */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div>
                <span className="font-bold text-gray-800 block text-xs">Registro Detalhado de Logs</span>
                <span className="text-[11px] text-gray-500">Salvar histórico de requisições, payloads e status HTTP no banco de dados</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableLogging}
                  onChange={(e) => setEnableLogging(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0084FF]"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#0084FF] hover:bg-[#0073E6] disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações Globais</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 3: JSON PAYLOAD DOCUMENTATION                         */}
      {/* ========================================================= */}
      {activeSubTab === 'docs' && (
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h4 className="text-xs font-bold text-[#1A1D21]">Dicionário de Eventos & Esquema do Payload JSON</h4>
              <p className="text-[11px] text-gray-500">
                Visualize a estrutura enviada para suas URLs externas e copie o payload para testes em ferramentas de automação.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-bold text-gray-700">Selecione o Evento:</label>
              <select
                value={selectedDocEvent}
                onChange={(e) => setSelectedDocEvent(e.target.value as ConversionEventType)}
                className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
              >
                {CONVERSION_EVENTS_METADATA.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Code Viewer with Copy Button */}
          <div className="relative">
            <div className="absolute right-3 top-3">
              <button
                onClick={() => handleCopy(JSON.stringify(getSampleJsonForEvent(selectedDocEvent), null, 2), 'doc_json')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                {copiedKey === 'doc_json' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {JSON.stringify(getSampleJsonForEvent(selectedDocEvent), null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT CONVERSION WEBHOOK URL                  */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#0084FF] flex items-center justify-center">
                  <Webhook className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1D21]">
                    {editingEndpointId ? 'Editar URL de Webhook de Conversão' : 'Nova URL para Receber Eventos de Conversão'}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Receba notificações em tempo real no seu CRM, n8n ou plataforma de vendas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEndpoint} className="p-6 space-y-4 text-xs">
              {/* Endpoint Name */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                  Nome Identificador do Webhook <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: CRM RD Station - Leads & Vendas, n8n Automações, Hubspot..."
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                />
              </div>

              {/* Destination URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1A1D21]">
                    URL de Destino (Endpoint HTTPS) <span className="text-rose-500">*</span>
                  </label>
                  {modalTestFeedback && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      modalTestFeedback.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {modalTestFeedback.success ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {modalTestFeedback.statusCode === 200 ? '200 OK' : `${modalTestFeedback.statusCode} ${modalTestFeedback.success ? 'OK' : 'Falha'}`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://seu-crm.com/api/webhooks ou https://n8n.suaempresa.com/webhook/..."
                    className="flex-1 px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] font-mono text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                  />
                  <button
                    type="button"
                    onClick={handleModalTestDispatch}
                    disabled={modalTesting || !url.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                    title="Enviar ping de teste para o webhook configurado e visualizar retorno"
                  >
                    <Play className={`w-3.5 h-3.5 ${modalTesting ? 'animate-spin' : ''}`} />
                    <span>{modalTesting ? 'Testando...' : 'Testar Endpoint'}</span>
                  </button>
                </div>
                {modalTestFeedback && (
                  <div className={`mt-2 p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    modalTestFeedback.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Retorno do status:</span>
                      <span className="font-mono font-black px-1.5 py-0.5 rounded bg-white border border-current">
                        {modalTestFeedback.statusCode === 200 ? '200 OK' : `${modalTestFeedback.statusCode} ${modalTestFeedback.success ? 'OK' : 'Erro'}`}
                      </span>
                      <span className="text-[11px] text-gray-500">({modalTestFeedback.durationMs}ms)</span>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-gray-500 mt-1">
                  O ManyFlow enviará requisições HTTP POST com payload JSON neste endereço.
                </p>
              </div>

              {/* Target Platform Preset */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                  Plataforma / Destino
                </label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                >
                  {PLATFORM_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.badge})
                    </option>
                  ))}
                </select>
              </div>

              {/* Conversion Events Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] mb-2">
                  Selecione os Eventos de Conversão que Disparam este Webhook <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-gray-200 rounded-lg">
                  {CONVERSION_EVENTS_METADATA.map((meta) => {
                    const isSelected = selectedEvents.includes(meta.id);
                    const Icon = meta.icon;
                    return (
                      <button
                        key={meta.id}
                        type="button"
                        onClick={() => toggleEventSelection(meta.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-300 text-blue-950 font-bold shadow-xs'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-[#0084FF] border-[#0084FF] text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[11px] block truncate">{meta.label}</span>
                          <span className="text-[10px] text-gray-500 block truncate">{meta.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Autenticação HTTP (Bearer Token / API Key / Custom) */}
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-600" />
                    <div>
                      <label className="block text-xs font-bold text-gray-900">
                        Autenticação do Endpoint (Bearer Token / API Key)
                      </label>
                      <span className="text-[10px] text-gray-500">
                        Injeta cabeçalho de autorização HTTP de segurança para APIs externas protegidas
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    authType === 'bearer'
                      ? 'bg-indigo-100 text-indigo-800'
                      : authType === 'api_key'
                      ? 'bg-purple-100 text-purple-800'
                      : authType === 'custom'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {authType === 'bearer' && 'Bearer Ativo'}
                    {authType === 'api_key' && 'API Key Ativa'}
                    {authType === 'custom' && 'Headers Personalizados'}
                    {authType === 'none' && 'Sem Autenticação'}
                  </span>
                </div>

                {/* Method selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthType('none')}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                      authType === 'none'
                        ? 'bg-white border-indigo-600 text-indigo-900 shadow-2xs'
                        : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                    }`}
                  >
                    Nenhum
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthType('bearer')}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                      authType === 'bearer'
                        ? 'bg-white border-indigo-600 text-indigo-900 shadow-2xs'
                        : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                    }`}
                  >
                    Bearer Token
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthType('api_key')}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                      authType === 'api_key'
                        ? 'bg-white border-indigo-600 text-indigo-900 shadow-2xs'
                        : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                    }`}
                  >
                    API Key
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthType('custom')}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                      authType === 'custom'
                        ? 'bg-white border-indigo-600 text-indigo-900 shadow-2xs'
                        : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>

                {/* Bearer Token Input */}
                {authType === 'bearer' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-indigo-950">
                        Token de Autorização (Bearer Token) *
                      </label>
                      <span className="text-[10px] text-gray-400">Enviado como 'Authorization: Bearer &lt;token&gt;'</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showAuthToken ? 'text' : 'password'}
                        value={bearerToken}
                        onChange={(e) => setBearerToken(e.target.value)}
                        placeholder="sk_live_... ou eyJhbGciOi..."
                        className="w-full pl-3 pr-20 py-2 rounded-lg bg-white border border-indigo-300 font-mono text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowAuthToken(!showAuthToken)}
                          className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                        >
                          {showAuthToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        {bearerToken && (
                          <button
                            type="button"
                            onClick={() => handleCopy(bearerToken, 'modal_bearer')}
                            className="p-1 text-gray-400 hover:text-indigo-600 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* API Key Inputs */}
                {authType === 'api_key' && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                    <div className="sm:col-span-5 space-y-1">
                      <label className="block text-[11px] font-bold text-indigo-950">
                        Nome do Header *
                      </label>
                      <input
                        type="text"
                        value={apiKeyHeaderName}
                        onChange={(e) => setApiKeyHeaderName(e.target.value)}
                        placeholder="X-API-Key"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-indigo-300 font-mono text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex items-center gap-1">
                        {['X-API-Key', 'api-key', 'X-Auth-Token'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setApiKeyHeaderName(preset)}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-7 space-y-1">
                      <label className="block text-[11px] font-bold text-indigo-950">
                        Chave de API (Secret Key) *
                      </label>
                      <div className="relative">
                        <input
                          type={showAuthToken ? 'text' : 'password'}
                          value={apiKeyValue}
                          onChange={(e) => setApiKeyValue(e.target.value)}
                          placeholder="ak_live_7623a89bc45d01e..."
                          className="w-full pl-3 pr-16 py-2 rounded-lg bg-white border border-indigo-300 font-mono text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setShowAuthToken(!showAuthToken)}
                            className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                          >
                            {showAuthToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          {apiKeyValue && (
                            <button
                              type="button"
                              onClick={() => handleCopy(apiKeyValue, 'modal_api_key')}
                              className="p-1 text-gray-400 hover:text-indigo-600 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Secret Key / HMAC Configuration */}
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <div>
                      <label className="block text-xs font-bold text-gray-900">
                        Chave Secreta de Assinatura (Secret Key / HMAC SHA-256)
                      </label>
                      <span className="text-[10px] text-gray-500">
                        Permite que seu servidor externo valide se a requisição originou autenticamente do ManyFlow
                      </span>
                    </div>
                  </div>
                  {secretToken && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Assinatura Ativa
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showSecretToken ? 'text' : 'password'}
                      value={secretToken}
                      onChange={(e) => setSecretToken(e.target.value)}
                      placeholder="whsec_8f92a3c71..."
                      className="w-full pl-3 pr-10 py-2 rounded-lg bg-white border border-gray-300 font-mono text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretToken(!showSecretToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                      title={showSecretToken ? 'Ocultar chave secreta' : 'Visualizar chave secreta'}
                    >
                      {showSecretToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newSecret = `whsec_${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 8)}`;
                      setSecretToken(newSecret);
                    }}
                    className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                    title="Gerar uma nova chave de alta entropia"
                  >
                    Gerar Nova
                  </button>

                  {secretToken && (
                    <button
                      type="button"
                      onClick={() => handleCopy(secretToken, 'modal_secret')}
                      className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-bold shrink-0 cursor-pointer shadow-xs"
                      title="Copiar Secret Key"
                    >
                      {copiedKey === 'modal_secret' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                <div className="p-2 rounded-lg bg-white border border-blue-100 text-[11px] text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-700 flex items-center gap-1">
                    <span>Transmissão nos Headers:</span>
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-700 font-mono text-[10px]">X-ManyFlow-Signature</code>
                    <span>e</span>
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-700 font-mono text-[10px]">X-Hub-Signature-256</code>
                  </p>
                  <p className="text-[10px] text-gray-500">
                    O cabeçalho conterá <code className="font-mono text-gray-700">sha256=&lt;hash&gt;</code> calculado via HMAC com esta chave secreta e o corpo cru da mensagem JSON.
                  </p>
                </div>
              </div>

              {/* Data Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCustomFields}
                    onChange={(e) => setIncludeCustomFields(e.target.checked)}
                    className="rounded text-[#0084FF] focus:ring-0"
                  />
                  <div>
                    <span className="font-bold block text-[11px]">Incluir Custom Fields</span>
                    <span className="text-[10px] text-gray-500">Envia variáveis dinâmicas do lead no JSON</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeContactData}
                    onChange={(e) => setIncludeContactData(e.target.checked)}
                    className="rounded text-[#0084FF] focus:ring-0"
                  />
                  <div>
                    <span className="font-bold block text-[11px]">Dados de Contato</span>
                    <span className="text-[10px] text-gray-500">Inclui nome, telefone, e-mail e canal</span>
                  </div>
                </label>
              </div>

              {/* Endpoint Specific Retry Policy Configuration */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCw className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">
                        Política de Retentativa (Resiliência contra Falhas)
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Reenvia o evento automaticamente em caso de timeout ou indisponibilidade externa (5xx / 429)
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                    <input
                      type="checkbox"
                      checked={retryOnFailure}
                      onChange={(e) => setRetryOnFailure(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0084FF]"></div>
                  </label>
                </div>

                {retryOnFailure && (
                  <div className="space-y-3 pt-2 border-t border-amber-200/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Max retries */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 mb-1 flex items-center justify-between">
                          <span>Número de Tentativas</span>
                          <span className="text-amber-800 font-mono font-bold">{maxRetries}x</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={maxRetries}
                            onChange={(e) => setMaxRetries(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="w-16 px-2 py-1.5 rounded-lg bg-white border border-gray-300 font-bold text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                          />
                          {[3, 5, 10].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setMaxRetries(preset)}
                              className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                maxRetries === preset
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              {preset}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interval in seconds */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 mb-1 flex items-center justify-between">
                          <span>Intervalo Base</span>
                          <span className="text-amber-800 font-mono font-bold">{retryIntervalSeconds}s</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={5}
                            max={600}
                            step={5}
                            value={retryIntervalSeconds}
                            onChange={(e) => setRetryIntervalSeconds(Math.min(600, Math.max(5, parseInt(e.target.value) || 5)))}
                            className="w-16 px-2 py-1.5 rounded-lg bg-white border border-gray-300 font-bold text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                          />
                          {[15, 30, 60, 120].map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => setRetryIntervalSeconds(sec)}
                              className={`px-1.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                retryIntervalSeconds === sec
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              {sec}s
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Backoff Strategy */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 mb-1">
                          Estratégia de Backoff
                        </label>
                        <select
                          value={backoffStrategy}
                          onChange={(e) => setBackoffStrategy(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 text-[11px] font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                        >
                          <option value="exponential">Exponencial (2ⁿ × base - Recomendado)</option>
                          <option value="linear">Linear Progressivo (n × base)</option>
                          <option value="fixed">Intervalo Fixo (constante)</option>
                        </select>
                      </div>

                      {/* Timeout */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-800 mb-1">
                          Timeout de Conexão
                        </label>
                        <select
                          value={timeoutSeconds}
                          onChange={(e) => setTimeoutSeconds(parseInt(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 text-[11px] font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                        >
                          <option value={5}>5 segundos</option>
                          <option value={10}>10 segundos (Padrão)</option>
                          <option value={15}>15 segundos</option>
                          <option value={30}>30 segundos</option>
                        </select>
                      </div>
                    </div>

                    {/* Timeline summary preview */}
                    {(() => {
                      const { steps, totalSeconds } = calculateRetryTimeline(maxRetries, retryIntervalSeconds, backoffStrategy);
                      return (
                        <div className="p-2 rounded-lg bg-amber-100/60 border border-amber-300/60 text-[10px] text-amber-950 flex items-center justify-between flex-wrap gap-1">
                          <span className="font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>Janela de tolerância calculada: ~{formatSecondsText(totalSeconds)}</span>
                          </span>
                          <span className="font-mono text-amber-800">
                            Tentativas: {steps.map((s) => `+${formatSecondsText(s.delay)}`).join(' ➔ ')}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                  Observações / Finalidade
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Dispara dados completos do lead para o funil de pós-venda..."
                  className="w-full p-2.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                />
              </div>

              {/* In-Modal Test Connection Section */}
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">
                        Testar Conexão com este Endpoint
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Dispara um payload de teste imediato com a URL e Secret Key acima para validar a recepção
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleModalTestDispatch}
                    disabled={modalTesting || !url.trim()}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    {modalTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Testando...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>Testar Conexão</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Modal Test Feedback Box */}
                {modalTestFeedback && (
                  <div className={`p-3 rounded-lg border text-xs space-y-2 animate-in fade-in duration-200 ${
                    modalTestFeedback.success 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        {modalTestFeedback.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-bold">
                          HTTP {modalTestFeedback.statusCode} {modalTestFeedback.success ? 'OK - Resposta Recebida' : 'Falha na Conexão'}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-600">
                          {modalTestFeedback.durationMs}ms
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsInspectorModalOpen(true)}
                        className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-800 text-[11px] font-bold rounded border border-gray-300 shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Terminal className="w-3 h-3 text-blue-600" />
                        <span>Ver Resposta & HMAC Completo</span>
                      </button>
                    </div>

                    <div className="bg-slate-900 text-slate-100 p-2 rounded font-mono text-[10px] max-h-20 overflow-y-auto">
                      {modalTestFeedback.responseBody || '(resposta com corpo vazio)'}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleModalTestDispatch}
                  disabled={modalTesting || !url.trim()}
                  className="py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Testar Antes de Salvar</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-2 px-4 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-gray-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || !url.trim() || selectedEvents.length === 0}
                    className="py-2 px-5 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingEndpointId ? 'Salvar Alterações' : 'Cadastrar Webhook'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Webhook Response Inspector Modal */}
      <WebhookResponseInspectorModal
        isOpen={isInspectorModalOpen}
        onClose={() => setIsInspectorModalOpen(false)}
        data={inspectorData}
      />
    </div>
  );
};
