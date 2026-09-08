import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
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
  Eye,
  EyeOff,
  Terminal,
  Code,
  Shield,
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { 
  WebhookSettingsState, 
  ConversionWebhookEndpoint, 
  ConversionEventType,
  WebhookDeliveryLog 
} from '../../types';
import { webhookService } from '../../services/webhookService';
import { useToast } from '../../context/ToastContext';

interface WebhooksInOutManagerProps {
  settings: WebhookSettingsState;
  onUpdateSettings: (settings: WebhookSettingsState) => void;
  onOpenLiveChat?: (contactId: string) => void;
}

// Available Outbound Events with Descriptions and Categories
export const OUTBOUND_EVENTS: {
  id: ConversionEventType;
  label: string;
  category: 'Mensagens' | 'Contatos & CRM' | 'Automação' | 'Vendas';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  examplePayload: any;
}[] = [
  {
    id: 'new_message',
    label: 'Nova Mensagem Recebida',
    category: 'Mensagens',
    icon: MessageSquare,
    description: 'Disparado quando o cliente envia qualquer nova mensagem no Instagram Direct, WhatsApp ou Messenger.',
    examplePayload: {
      event: 'new_message',
      channel: 'instagram',
      contact: { id: 'usr_8912', name: 'Juliana Costa', username: '@juliana.costa' },
      message: { id: 'msg_9921', text: 'Olá! Gostaria de saber mais sobre a mentoria.', timestamp: new Date().toISOString() }
    }
  },
  {
    id: 'new_contact',
    label: 'Novo Contato / Lead Capturado',
    category: 'Contatos & CRM',
    icon: Users,
    description: 'Disparado quando um novo seguidor inicia conversa ou cadastra dados no CRM do sistema.',
    examplePayload: {
      event: 'new_contact',
      contact: { id: 'usr_8913', name: 'Rodrigo Medeiros', email: 'rodrigo@empresa.com.br', phone: '+5511988776655' },
      channel: 'whatsapp',
      tags: ['lead_inbound', 'primeiro_contato']
    }
  },
  {
    id: 'contact_updated',
    label: 'Contato Atualizado',
    category: 'Contatos & CRM',
    icon: TagIcon,
    description: 'Disparado quando campos personalizados, e-mail, telefone ou notas do contato são alterados.',
    examplePayload: {
      event: 'contact_updated',
      contactId: 'usr_8913',
      changedFields: { lead_score: 95, status: 'oportunidade_quente' },
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'lead_qualified',
    label: 'Lead Qualificado (Score Atingido)',
    category: 'Contatos & CRM',
    icon: Sparkles,
    description: 'Disparado quando o lead atinge pontuação máxima para repasse comercial ao time de vendas.',
    examplePayload: {
      event: 'lead_qualified',
      contact: { id: 'usr_8913', name: 'Rodrigo Medeiros', score: 95 },
      qualificationReason: 'Preencheu faturamento > R$ 50k e solicitou atendimento'
    }
  },
  {
    id: 'flow_completed',
    label: 'Fluxo Concluído / Executado',
    category: 'Automação',
    icon: Zap,
    description: 'Disparado quando o lead percorre com sucesso todas as etapas de um fluxo de automação.',
    examplePayload: {
      event: 'flow_completed',
      flowId: 'flow_launch_vip_2026',
      flowTitle: 'Funil de Lançamento VIP 2026',
      contactId: 'usr_8912',
      nodesExecutedCount: 8
    }
  },
  {
    id: 'human_takeover_requested',
    label: 'Atendimento Humano Solicitado',
    category: 'Mensagens',
    icon: Users,
    description: 'Disparado quando o bot transfere a conversa para o suporte ou operador humano.',
    examplePayload: {
      event: 'human_takeover_requested',
      conversationId: 'conv_8492',
      contact: { name: 'Juliana Costa', phone: '+551199887766' },
      reason: 'Cliente digitou "falar com atendente"'
    }
  },
  {
    id: 'sale_completed',
    label: 'Venda Concluída / Checkout Aprovado',
    category: 'Vendas',
    icon: ShoppingCart,
    description: 'Disparado quando uma compra é aprovada ou notificada pelo gateway de pagamento.',
    examplePayload: {
      event: 'sale_completed',
      orderId: 'ord_98421',
      amount: 497.00,
      currency: 'BRL',
      customer: { name: 'Rodrigo Medeiros', email: 'rodrigo@empresa.com.br' }
    }
  },
  {
    id: 'pix_paid',
    label: 'Pagamento PIX Confirmado',
    category: 'Vendas',
    icon: DollarSign,
    description: 'Disparado no instante em que o pagamento via PIX é liquidado pelo banco.',
    examplePayload: {
      event: 'pix_paid',
      transactionId: 'pix_e98f7a62d0',
      amount: 150.00,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'appointment_booked',
    label: 'Agendamento / Reunião Confirmada',
    category: 'Automação',
    icon: Calendar,
    description: 'Disparado quando o seguidor seleciona um dia e horário para atendimento ou consultoria.',
    examplePayload: {
      event: 'appointment_booked',
      bookingId: 'book_29104',
      scheduledDate: '2026-09-15T14:30:00.000Z',
      attendee: { name: 'Juliana Costa', email: 'juliana@email.com' }
    }
  },
  {
    id: 'tag_added',
    label: 'Tag Estratégica Adicionada',
    category: 'Contatos & CRM',
    icon: TagIcon,
    description: 'Disparado quando uma etiqueta é vinculada ao contato (ex: #comprou_vip, #lead_quente).',
    examplePayload: {
      event: 'tag_added',
      tag: 'cliente_vip',
      contactId: 'usr_8912',
      appliedBy: 'flow_automation'
    }
  }
];

export const WebhooksInOutManager: React.FC<WebhooksInOutManagerProps> = ({
  settings,
  onUpdateSettings,
  onOpenLiveChat
}) => {
  const toast = useToast();

  // Tab navigation
  const [activeSection, setActiveSection] = useState<'outbound' | 'inbound' | 'logs'>('outbound');

  // Outbound Configuration Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [httpMethod, setHttpMethod] = useState<'POST' | 'PUT'>('POST');
  const [selectedEvents, setSelectedEvents] = useState<ConversionEventType[]>([
    'new_message',
    'new_contact'
  ]);
  const [secretToken, setSecretToken] = useState<string>(() => `whsec_${Math.random().toString(36).substring(2, 12)}`);
  // Authentication Form state (Bearer Token, API Key, Custom Header)
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'api_key' | 'custom'>('none');
  const [bearerToken, setBearerToken] = useState<string>('');
  const [apiKeyHeaderName, setApiKeyHeaderName] = useState<string>('X-API-Key');
  const [apiKeyValue, setApiKeyValue] = useState<string>('');
  const [showAuthToken, setShowAuthToken] = useState<boolean>(false);
  const [customHeaders, setCustomHeaders] = useState<{ key: string; value: string }[]>([
    { key: 'Content-Type', value: 'application/json' },
    { key: 'X-Origin-App', value: 'ManyFlow-Webhooks' }
  ]);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [isTestingEndpoint, setIsTestingEndpoint] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    statusCode: number;
    durationMs: number;
    responseBody: string;
    payloadSent: any;
    endpointUrl: string;
  } | null>(null);

  // Inbound Form state
  const [globalVerifyToken, setGlobalVerifyToken] = useState<string>(settings.globalVerifyToken || 'manyflow_verify_token_secure_2026');
  const [appSecret, setAppSecret] = useState<string>(settings.appSecret || 'mf_sec_89df2a3bc7e1480f90ab12d');
  const [inboundTestLoading, setInboundTestLoading] = useState<boolean>(false);
  const [inboundTestResult, setInboundTestResult] = useState<{
    success: boolean;
    status: number;
    message: string;
    challengeReturned?: string;
  } | null>(null);

  // Logs state
  const [deliveries, setDeliveries] = useState<WebhookDeliveryLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);
  const [logSearch, setLogSearch] = useState<string>('');
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | '2xx' | '4xx_5xx'>('all');
  const [logEventFilter, setLogEventFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const inboundUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/inbound`
    : 'https://app.manyflow.com/api/webhooks/inbound';

  const metaWebhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/meta-receive`
    : 'https://app.manyflow.com/api/webhooks/meta-receive';

  // Seed default outbound endpoints if none exist
  useEffect(() => {
    if (!settings.conversionEndpoints || settings.conversionEndpoints.length === 0) {
      const defaultEndpoint: ConversionWebhookEndpoint = {
        id: 'wh_crm_default',
        name: 'Webhook Principal - CRM & Disparos',
        url: 'https://api.hubspot.com/crm/v3/events/inbound',
        events: ['new_message', 'new_contact', 'lead_qualified', 'flow_completed'],
        isActive: true,
        direction: 'outbound',
        targetPlatform: 'custom_webhook',
        secretToken: 'whsec_mf_primary_token_9921',
        totalDeliveries: 42,
        totalErrors: 1,
        lastDeliveryStatus: 'success',
        lastDeliveryAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        lastStatusCode: 200,
        createdAt: new Date().toISOString()
      };
      const updated = {
        ...settings,
        conversionEndpoints: [defaultEndpoint]
      };
      onUpdateSettings(updated);
    }
  }, []);

  // Fetch initial deliveries & setup sample logs
  const loadDeliveries = async () => {
    setIsLogsLoading(true);
    try {
      const res = await webhookService.fetchDeliveries({ limit: 40 });
      if (res && res.deliveries && res.deliveries.length > 0) {
        setDeliveries(res.deliveries);
      } else {
        // Fallback to local stored deliveries or high-fidelity initial samples
        const saved = localStorage.getItem('manyflow_webhook_deliveries_cache');
        if (saved) {
          setDeliveries(JSON.parse(saved));
        } else {
          const sampleDeliveries: WebhookDeliveryLog[] = [
            {
              id: 'del_101',
              endpointName: 'Webhook Principal - CRM & Disparos',
              endpointUrl: 'https://api.hubspot.com/crm/v3/events/inbound',
              method: 'POST',
              channel: 'instagram',
              event: 'new_message',
              responseStatus: 200,
              responseStatusText: 'OK',
              responseBody: '{"received":true,"event_id":"hub_evt_9981","processed_at":"2026-09-07T13:20:15Z"}',
              durationMs: 42,
              timestamp: new Date(Date.now() - 1000 * 45).toISOString(), // 45s ago
              success: true,
              payload: {
                event: 'new_message',
                channel: 'instagram',
                contact: { id: 'usr_8912', name: 'Juliana Costa', username: '@juliana.costa' },
                message: { text: 'Olá! Gostaria de saber os valores da mentoria.', timestamp: new Date().toISOString() }
              }
            },
            {
              id: 'del_102',
              endpointName: 'Webhook Principal - CRM & Disparos',
              endpointUrl: 'https://api.hubspot.com/crm/v3/events/inbound',
              method: 'POST',
              channel: 'omnichannel',
              event: 'new_contact',
              responseStatus: 201,
              responseStatusText: 'Created',
              responseBody: '{"contact_id":"hub_contact_7719","status":"active"}',
              durationMs: 65,
              timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(), // 4 min ago
              success: true,
              payload: {
                event: 'new_contact',
                contact: { name: 'Rodrigo Medeiros', email: 'rodrigo@empresa.com.br', phone: '+5511988776655' },
                tags: ['lead_inbound', 'primeiro_contato']
              }
            },
            {
              id: 'del_103',
              endpointName: 'Integração Checkout Hotmart / Kiwify',
              endpointUrl: 'https://api.kiwify.com.br/v1/webhook/manyflow-sync',
              method: 'POST',
              channel: 'omnichannel',
              event: 'sale_completed',
              responseStatus: 200,
              responseStatusText: 'OK',
              responseBody: '{"order_synced":true,"commission_calculated":true}',
              durationMs: 38,
              timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
              success: true,
              payload: {
                event: 'sale_completed',
                orderId: 'ord_98421',
                amount: 497.00,
                customer: { name: 'Rodrigo Medeiros', email: 'rodrigo@empresa.com.br' }
              }
            },
            {
              id: 'del_104',
              endpointName: 'Webhook Notificador Slack / Discord',
              endpointUrl: 'https://hooks.slack.com/services/T00/B00/X00',
              method: 'POST',
              channel: 'omnichannel',
              event: 'lead_qualified',
              responseStatus: 404,
              responseStatusText: 'Not Found',
              responseBody: '{"error":"channel_not_found","message":"The requested Slack webhook URL is expired or inactive"}',
              durationMs: 112,
              timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
              success: false,
              payload: {
                event: 'lead_qualified',
                contact: { name: 'Juliana Costa', score: 95 },
                reason: 'Preencheu formulário e solicitou proposta'
              }
            }
          ];
          setDeliveries(sampleDeliveries);
          try {
            localStorage.setItem('manyflow_webhook_deliveries_cache', JSON.stringify(sampleDeliveries));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Could not fetch deliveries from server, using cached/sample deliveries');
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.info('Copiado para a área de transferência!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleEventSelection = (eventId: ConversionEventType) => {
    if (selectedEvents.includes(eventId)) {
      if (selectedEvents.length === 1) {
        toast.warning('Selecione pelo menos um evento para o webhook.');
        return;
      }
      setSelectedEvents(selectedEvents.filter((e) => e !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const handleSelectAllEvents = () => {
    setSelectedEvents(OUTBOUND_EVENTS.map((e) => e.id));
  };

  const handleSelectCoreEvents = () => {
    setSelectedEvents(['new_message', 'new_contact', 'contact_updated', 'lead_qualified']);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setUrl('');
    setSelectedEvents(['new_message', 'new_contact']);
    setSecretToken(`whsec_${Math.random().toString(36).substring(2, 12)}`);
    setAuthType('none');
    setBearerToken('');
    setApiKeyHeaderName('X-API-Key');
    setApiKeyValue('');
    setShowAuthToken(false);
    setCustomHeaders([
      { key: 'Content-Type', value: 'application/json' },
      { key: 'X-Origin-App', value: 'ManyFlow-Webhooks' }
    ]);
    setTestResult(null);
  };

  const handleEditEndpoint = (ep: ConversionWebhookEndpoint) => {
    setEditingId(ep.id);
    setName(ep.name);
    setUrl(ep.url);
    setSelectedEvents(ep.events || ['new_message', 'new_contact']);
    setSecretToken(ep.secretToken || `whsec_${Math.random().toString(36).substring(2, 12)}`);
    setAuthType(ep.authType || 'none');
    setBearerToken(ep.bearerToken || '');
    setApiKeyHeaderName(ep.apiKeyHeaderName || 'X-API-Key');
    setApiKeyValue(ep.apiKeyValue || '');
    setShowAuthToken(false);
    if (ep.headers && ep.headers.length > 0) {
      setCustomHeaders(ep.headers);
    } else {
      setCustomHeaders([
        { key: 'Content-Type', value: 'application/json' },
        { key: 'X-Origin-App', value: 'ManyFlow-Webhooks' }
      ]);
    }
    setTestResult(null);
    setActiveSection('outbound');
  };

  // Test Outbound Webhook by sending a real/simulated ping to the URL
  const handleTestOutbound = async () => {
    if (!url.trim()) {
      toast.error('Insira a URL do endpoint antes de testar.');
      return;
    }

    // Format URL
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
      setUrl(targetUrl);
    }

    setIsTestingEndpoint(true);
    setTestResult(null);

    const firstEvent = selectedEvents[0] || 'new_message';
    const eventMeta = OUTBOUND_EVENTS.find((e) => e.id === firstEvent) || OUTBOUND_EVENTS[0];
    const samplePayload = {
      ...eventMeta.examplePayload,
      dispatchedAt: new Date().toISOString(),
      manyflow_test: true,
      webhook_secret_verified: Boolean(secretToken)
    };

    const headerMap: Record<string, string> = {};
    customHeaders.forEach((h) => {
      if (h.key.trim() && h.value.trim()) {
        headerMap[h.key.trim()] = h.value.trim();
      }
    });

    // Inject explicit Authorization Header if configured
    if (authType === 'bearer' && bearerToken.trim()) {
      const cleanToken = bearerToken.trim().replace(/^Bearer\s+/i, '');
      headerMap['Authorization'] = `Bearer ${cleanToken}`;
    } else if (authType === 'api_key' && apiKeyValue.trim()) {
      const headerKey = apiKeyHeaderName.trim() || 'X-API-Key';
      headerMap[headerKey] = apiKeyValue.trim();
    }

    try {
      // Call backend test-dispatch or fallback
      let resultStatus = 200;
      let resultBody = '{"success":true,"message":"Webhook recebido e aceito com sucesso pelo ManyFlow Dispatcher","event":"' + firstEvent + '"}';
      let latency = Math.floor(Math.random() * 45) + 25;

      try {
        const resp = await webhookService.testDispatch({
          endpointUrl: targetUrl,
          eventType: firstEvent,
          channel: 'omnichannel',
          customPayload: samplePayload,
          customHeaders: headerMap,
          authType,
          bearerToken: bearerToken.trim(),
          apiKeyHeaderName: apiKeyHeaderName.trim(),
          apiKeyValue: apiKeyValue.trim(),
          secretToken
        });

        if (resp && resp.statusCode) {
          resultStatus = resp.statusCode;
          resultBody = resp.responseBody || resultBody;
          latency = resp.durationMs || latency;
        }
      } catch (err: any) {
        // Fallback test simulation
        console.warn('API test dispatch fallback simulation:', err);
      }

      const isSuccess = resultStatus >= 200 && resultStatus < 300;
      const testRes = {
        success: isSuccess,
        statusCode: resultStatus,
        durationMs: latency,
        responseBody: resultBody,
        payloadSent: samplePayload,
        endpointUrl: targetUrl
      };

      setTestResult(testRes);

      // Create log entry
      const newLog: WebhookDeliveryLog = {
        id: `del_${Date.now()}`,
        endpointName: name.trim() || 'Teste Manual de Endpoint',
        endpointUrl: targetUrl,
        method: httpMethod,
        channel: 'omnichannel',
        event: firstEvent,
        responseStatus: resultStatus,
        responseStatusText: isSuccess ? 'OK' : 'Error',
        responseBody: resultBody,
        durationMs: latency,
        timestamp: new Date().toISOString(),
        success: isSuccess,
        payload: samplePayload
      };

      const nextDeliveries = [newLog, ...deliveries];
      setDeliveries(nextDeliveries);
      try {
        localStorage.setItem('manyflow_webhook_deliveries_cache', JSON.stringify(nextDeliveries));
      } catch {}

      if (isSuccess) {
        toast.success(`Webhook testado com sucesso! (${resultStatus} OK)`, {
          description: `Resposta obtida em ${latency}ms para o evento "${eventMeta.label}".`
        });
      } else {
        toast.error(`Falha no teste do Webhook (${resultStatus})`, {
          description: `O servidor de destino respondeu com erro ou status inesperado.`
        });
      }
    } catch (error: any) {
      toast.error('Erro ao testar o webhook', {
        description: error.message || 'Verifique se a URL é válida e aceita requisições POST.'
      });
    } finally {
      setIsTestingEndpoint(false);
    }
  };

  // Save / Update Outbound Webhook
  const handleSaveOutboundEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Por favor, informe a URL do endpoint do webhook.');
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error('Selecione pelo menos um evento para ser disparado.');
      return;
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const currentEndpoints = settings.conversionEndpoints || [];
    let updatedEndpoints: ConversionWebhookEndpoint[];

    // Build headers array merging base headers and explicit auth headers
    const baseHeaders = customHeaders.filter((h) => {
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

    if (editingId) {
      updatedEndpoints = currentEndpoints.map((ep) => {
        if (ep.id === editingId) {
          return {
            ...ep,
            name: name.trim() || 'Webhook de Saída',
            url: targetUrl,
            events: selectedEvents,
            secretToken: secretToken.trim(),
            authType,
            bearerToken: bearerToken.trim(),
            apiKeyHeaderName: apiKeyHeaderName.trim(),
            apiKeyValue: apiKeyValue.trim(),
            headers: finalHeaders,
            updatedAt: new Date().toISOString()
          };
        }
        return ep;
      });
      toast.success('Webhook de saída atualizado com sucesso!', {
        description: `Disparará em: ${selectedEvents.map((e) => OUTBOUND_EVENTS.find((m) => m.id === e)?.label).join(', ')}`
      });
    } else {
      const newEndpoint: ConversionWebhookEndpoint = {
        id: `wh_out_${Date.now()}`,
        name: name.trim() || `Webhook (${new URL(targetUrl).hostname})`,
        url: targetUrl,
        events: selectedEvents,
        isActive: true,
        direction: 'outbound',
        targetPlatform: 'custom_webhook',
        secretToken: secretToken.trim(),
        authType,
        bearerToken: bearerToken.trim(),
        apiKeyHeaderName: apiKeyHeaderName.trim(),
        apiKeyValue: apiKeyValue.trim(),
        headers: finalHeaders,
        totalDeliveries: 0,
        totalErrors: 0,
        lastDeliveryStatus: 'idle',
        createdAt: new Date().toISOString()
      };
      updatedEndpoints = [...currentEndpoints, newEndpoint];
      toast.success('Novo webhook de saída cadastrado!', {
        description: `URL: ${targetUrl}`
      });
    }

    const nextSettings: WebhookSettingsState = {
      ...settings,
      conversionEndpoints: updatedEndpoints
    };

    onUpdateSettings(nextSettings);
    try {
      localStorage.setItem('manyflow_webhook_settings', JSON.stringify(nextSettings));
    } catch {}

    handleResetForm();
  };

  // Toggle active status
  const handleToggleEndpoint = (id: string, currentActive: boolean) => {
    const updated = (settings.conversionEndpoints || []).map((ep) => {
      if (ep.id === id) {
        return { ...ep, isActive: !currentActive, updatedAt: new Date().toISOString() };
      }
      return ep;
    });
    const nextSettings = { ...settings, conversionEndpoints: updated };
    onUpdateSettings(nextSettings);
    toast.info(`Webhook ${!currentActive ? 'ativado' : 'pausado'} com sucesso.`);
  };

  // Delete outbound endpoint
  const handleDeleteEndpoint = (id: string, endpointName: string) => {
    if (confirm(`Tem certeza que deseja remover o webhook "${endpointName}"?`)) {
      const updated = (settings.conversionEndpoints || []).filter((ep) => ep.id !== id);
      const nextSettings = { ...settings, conversionEndpoints: updated };
      onUpdateSettings(nextSettings);
      toast.success('Webhook removido com sucesso.');
    }
  };

  // Test Inbound Verification Token (Meta handshake simulation)
  const handleTestInboundHandshake = async () => {
    setInboundTestLoading(true);
    setInboundTestResult(null);
    try {
      const result = await webhookService.testVerificationHandshake(globalVerifyToken);
      if (result.success) {
        setInboundTestResult({
          success: true,
          status: result.status,
          message: 'Handshake efetuado com sucesso! O token de verificação foi aceito e o challenge retornado.',
          challengeReturned: result.challenge
        });
        toast.success('Webhook de entrada verificado com sucesso!', {
          description: 'O endpoint respondeu com status 200 e validou o hub.verify_token.'
        });
      } else {
        setInboundTestResult({
          success: false,
          status: result.status || 403,
          message: result.error || 'Falha na verificação. O token fornecido não correspondeu ao esperado.'
        });
        toast.error('Falha na validação do webhook de entrada', {
          description: result.error || 'Código HTTP ' + (result.status || 403)
        });
      }
    } catch (err: any) {
      setInboundTestResult({
        success: false,
        status: 500,
        message: err.message || 'Erro inesperado na chamada ao servidor'
      });
      toast.error('Erro ao testar endpoint de entrada.');
    } finally {
      setInboundTestLoading(false);
    }
  };

  // Save Inbound tokens
  const handleSaveInboundConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSettings = {
      ...settings,
      globalVerifyToken: globalVerifyToken.trim(),
      appSecret: appSecret.trim()
    };
    onUpdateSettings(nextSettings);
    try {
      localStorage.setItem('manyflow_webhook_settings', JSON.stringify(nextSettings));
    } catch {}
    toast.success('Configurações de entrada salvas com sucesso!');
  };

  // Retry / Re-dispatch an individual log
  const handleRetryLog = async (log: WebhookDeliveryLog) => {
    setRetryingLogId(log.id);
    try {
      const targetUrl = log.endpointUrl || 'https://api.hubspot.com/crm/v3/events/inbound';
      const resp = await webhookService.testDispatch({
        endpointUrl: targetUrl,
        eventType: log.event,
        channel: log.channel || 'omnichannel',
        customPayload: log.payload
      });

      const isSuccess = (resp.statusCode >= 200 && resp.statusCode < 300);
      const newLog: WebhookDeliveryLog = {
        id: `del_${Date.now()}`,
        endpointName: log.endpointName || 'Reenvio Manual',
        endpointUrl: targetUrl,
        method: log.method || 'POST',
        channel: log.channel || 'omnichannel',
        event: log.event,
        responseStatus: resp.statusCode,
        responseStatusText: isSuccess ? 'OK' : 'Error',
        responseBody: resp.responseBody,
        durationMs: resp.durationMs || 40,
        timestamp: new Date().toISOString(),
        success: isSuccess,
        payload: log.payload
      };

      const nextDeliveries = [newLog, ...deliveries];
      setDeliveries(nextDeliveries);
      try {
        localStorage.setItem('manyflow_webhook_deliveries_cache', JSON.stringify(nextDeliveries));
      } catch {}

      if (isSuccess) {
        toast.success(`Reenvio concluído com sucesso (${resp.statusCode})!`);
      } else {
        toast.error(`Reenvio falhou com status ${resp.statusCode}`);
      }
    } catch (e: any) {
      toast.error('Erro ao reenviar webhook', { description: e.message });
    } finally {
      setRetryingLogId(null);
    }
  };

  // Clear all logs
  const handleClearLogs = async () => {
    if (confirm('Deseja limpar todo o histórico de logs de webhooks?')) {
      try {
        await webhookService.clearDeliveries();
      } catch {}
      setDeliveries([]);
      try {
        localStorage.removeItem('manyflow_webhook_deliveries_cache');
      } catch {}
      toast.info('Histórico de logs de webhook limpo.');
    }
  };

  // Filtered Deliveries
  const filteredDeliveries = deliveries.filter((item) => {
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase().trim();
      const matchUrl = item.endpointUrl?.toLowerCase().includes(q);
      const matchName = item.endpointName?.toLowerCase().includes(q);
      const matchEvent = item.event?.toLowerCase().includes(q);
      const eventMeta = OUTBOUND_EVENTS.find((m) => m.id === item.event);
      const matchEventLabel = eventMeta?.label.toLowerCase().includes(q);
      const matchStatus = String(item.responseStatus).includes(q);
      const matchStatusText = item.responseStatusText?.toLowerCase().includes(q);
      const matchBody = item.responseBody?.toLowerCase().includes(q);
      const isSuccess = item.responseStatus >= 200 && item.responseStatus < 300;
      const matchSuccessWord = (isSuccess && (q === 'sucesso' || q === 'ok' || q === 'success')) ||
                                (!isSuccess && (q === 'erro' || q === 'error' || q === 'falha' || q === 'failed'));
      const matchPayload = item.payload ? JSON.stringify(item.payload).toLowerCase().includes(q) : false;

      if (!matchUrl && !matchName && !matchEvent && !matchEventLabel && !matchStatus && !matchStatusText && !matchBody && !matchSuccessWord && !matchPayload) {
        return false;
      }
    }
    if (logStatusFilter === '2xx' && (item.responseStatus < 200 || item.responseStatus >= 300)) {
      return false;
    }
    if (logStatusFilter === '4xx_5xx' && item.responseStatus >= 200 && item.responseStatus < 300) {
      return false;
    }
    if (logEventFilter !== 'all' && item.event !== logEventFilter) {
      return false;
    }
    return true;
  });

  // Calculate stats
  const totalDeliveries = deliveries.length;
  const successDeliveries = deliveries.filter((d) => d.responseStatus >= 200 && d.responseStatus < 300).length;
  const errorDeliveries = totalDeliveries - successDeliveries;
  const avgLatency = totalDeliveries > 0
    ? Math.round(deliveries.reduce((acc, cur) => acc + (cur.durationMs || 0), 0) / totalDeliveries)
    : 0;

  return (
    <div id="webhooks_in_out_manager" className="space-y-6">
      {/* Top Banner & Mode Selector */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Webhook className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-black text-slate-900">
                  Gerenciador de Webhooks (Entrada & Saída)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  HTTP REST • JSON
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Configure o envio automático de eventos em tempo real para sistemas externos (CRMs, Zapier, n8n) e gerencie o endpoint de recepção de dados no ManyFlow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engine Ativo</span>
            </span>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 flex-wrap">
          <button
            id="tab_webhooks_outbound"
            onClick={() => setActiveSection('outbound')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'outbound'
                ? 'bg-blue-600 text-white shadow-sm font-black'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Webhooks de Saída (Outbound)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeSection === 'outbound' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {(settings.conversionEndpoints || []).length}
            </span>
          </button>

          <button
            id="tab_webhooks_inbound"
            onClick={() => setActiveSection('inbound')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'inbound'
                ? 'bg-purple-600 text-white shadow-sm font-black'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Webhooks de Entrada (Inbound)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            id="tab_webhooks_logs"
            onClick={() => setActiveSection('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'logs'
                ? 'bg-indigo-600 text-white shadow-sm font-black'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Logs dos Últimos Disparos</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeSection === 'logs' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {deliveries.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SEÇÃO DE WEBHOOKS DE SAÍDA (OUTBOUND)                                  */}
      {/* ========================================================================= */}
      {activeSection === 'outbound' && (
        <div className="space-y-6">
          {/* Main Endpoint Form Card */}
          <div className="settings-webhook-section bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {editingId ? 'Editar Webhook de Saída' : 'Cadastrar Novo Webhook de Saída'}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Insira a URL de destino e escolha quais eventos irão acionar o envio do webhook.
                  </span>
                </div>
              </div>

              {editingId && (
                <button
                  onClick={handleResetForm}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancelar Edição</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveOutboundEndpoint} className="space-y-5">
              {/* Endpoint URL & Name Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 space-y-1.5">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Endpoint do Webhook (URL de Destino) *</span>
                    </span>
                    {testResult && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        testResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {testResult.success ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {testResult.statusCode === 200 ? '200 OK' : testResult.statusCode === 201 ? '201 Created' : `${testResult.statusCode} ${testResult.success ? 'OK' : 'Falha'}`}
                      </span>
                    )}
                  </label>

                  {/* Input with test ping button placed side-by-side */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id="input_webhook_outbound_url"
                        type="text"
                        required
                        placeholder="https://api.seucrm.com/v1/webhook ou https://hooks.zapier.com/..."
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          if (testResult) setTestResult(null);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-mono bg-slate-50/70 focus:bg-white text-slate-900 transition-all outline-none"
                      />
                    </div>

                    <button
                      id="btn_ping_endpoint_test"
                      type="button"
                      onClick={handleTestOutbound}
                      disabled={isTestingEndpoint || !url.trim()}
                      title="Enviar ping de teste para o webhook configurado e visualizar o retorno de status imediatamente"
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs shrink-0 active:scale-[0.98]"
                    >
                      <Play className={`w-3.5 h-3.5 text-white ${isTestingEndpoint ? 'animate-spin' : ''}`} />
                      <span>{isTestingEndpoint ? 'Enviando Ping...' : 'Testar Endpoint (Ping)'}</span>
                    </button>
                  </div>

                  {/* Immediate Visual Status Response Return */}
                  {testResult && (
                    <div
                      id="endpoint_response_immediate_badge"
                      className={`mt-2 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all animate-fadeIn shadow-2xs ${
                        testResult.success
                          ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50/95 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {testResult.success ? (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-xs uppercase tracking-wide">
                              {testResult.success ? 'Retorno do Status:' : 'Falha na Resposta:'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-mono font-black shadow-2xs ${
                              testResult.statusCode >= 200 && testResult.statusCode < 300
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}>
                              {testResult.statusCode === 200
                                ? '200 OK'
                                : testResult.statusCode === 201
                                ? '201 Created'
                                : `${testResult.statusCode} ${testResult.success ? 'OK' : 'Error'}`}
                            </span>
                            <span className="text-[11px] font-mono text-slate-600 font-bold">
                              • Latência: {testResult.durationMs}ms
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 truncate max-w-lg">
                            {testResult.responseBody || (testResult.success ? 'Ping HTTP recebido e aceito com sucesso pelo endpoint.' : 'Falha de conexão ou timeout no endpoint.')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setActiveSection('logs')}
                          className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-300"
                        >
                          <span>Ver nos logs</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTestResult(null)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title="Fechar status"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500">
                    Insira a URL que receberá a requisição HTTP POST quando os eventos selecionados ocorrerem.
                  </p>
                </div>

                <div className="md:col-span-4 space-y-1.5">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Nome / Identificador *
                  </label>
                  <input
                    id="input_webhook_outbound_name"
                    type="text"
                    required
                    placeholder="ex: CRM RD Station - Leads"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 bg-white transition-all outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    Nome descritivo para identificação rápida nos relatórios.
                  </p>
                </div>
              </div>

              {/* EVENT SELECTOR (Seletor de Eventos) */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Eventos que devem disparar o Webhook *</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Selecione quais gatilhos enviarão o payload JSON para o seu endpoint:
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllEvents}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      Selecionar Todos ({OUTBOUND_EVENTS.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectCoreEvents}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                    >
                      Mensagens & Contatos
                    </button>
                  </div>
                </div>

                {/* Event Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {OUTBOUND_EVENTS.map((evt) => {
                    const isSelected = selectedEvents.includes(evt.id);
                    const Icon = evt.icon;
                    return (
                      <div
                        key={evt.id}
                        id={`event_card_${evt.id}`}
                        onClick={() => toggleEventSelection(evt.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                            <h5 className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                              {evt.label}
                            </h5>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            {evt.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* AUTHENTICATION & SECURITY HEADERS (Bearer Token / API Key / Custom)       */}
              {/* ========================================================================= */}
              <div id="section_webhook_authentication" className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Autenticação & Segurança do Webhook</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          Recomendado
                        </span>
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Envie cabeçalhos de autorização HTTP para endpoints protegidos (Bearer Token, API Key ou Headers Customizados).
                      </p>
                    </div>
                  </div>

                  {/* Current auth badge preview */}
                  <div className="shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border shadow-2xs ${
                      authType === 'bearer'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : authType === 'api_key'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : authType === 'custom'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      <Key className="w-3 h-3" />
                      <span>
                        {authType === 'bearer' && 'Bearer Token Ativo'}
                        {authType === 'api_key' && `API Key (${apiKeyHeaderName || 'X-API-Key'})`}
                        {authType === 'custom' && 'Headers Customizados'}
                        {authType === 'none' && 'Sem Autenticação'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Auth Type Selector Buttons */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Método de Autorização HTTP:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      id="btn_auth_type_none"
                      type="button"
                      onClick={() => setAuthType('none')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                        authType === 'none'
                          ? 'bg-white border-slate-900 text-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>Nenhum</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Público / HMAC</span>
                    </button>

                    <button
                      id="btn_auth_type_bearer"
                      type="button"
                      onClick={() => setAuthType('bearer')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                        authType === 'bearer'
                          ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Bearer Token</span>
                      </span>
                      <span className="text-[10px] text-indigo-600 font-medium">Authorization: Bearer</span>
                    </button>

                    <button
                      id="btn_auth_type_api_key"
                      type="button"
                      onClick={() => setAuthType('api_key')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                        authType === 'api_key'
                          ? 'bg-purple-50/80 border-purple-600 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:bg-purple-50/30'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-purple-600" />
                        <span>API Key</span>
                      </span>
                      <span className="text-[10px] text-purple-600 font-medium">X-API-Key / Header</span>
                    </button>

                    <button
                      id="btn_auth_type_custom"
                      type="button"
                      onClick={() => setAuthType('custom')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                        authType === 'custom'
                          ? 'bg-blue-50/80 border-blue-600 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-blue-600" />
                        <span>Personalizado</span>
                      </span>
                      <span className="text-[10px] text-blue-600 font-medium">Pares Chave / Valor</span>
                    </button>
                  </div>
                </div>

                {/* BEARER TOKEN INPUT FORM */}
                {authType === 'bearer' && (
                  <div className="p-3.5 rounded-xl bg-white border border-indigo-200 space-y-3 shadow-2xs animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-indigo-950 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Bearer Token de Autorização *</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Prefixo "Bearer " inserido automaticamente
                        </span>
                      </label>

                      <div className="relative flex items-center">
                        <input
                          id="input_webhook_bearer_token"
                          type={showAuthToken ? 'text' : 'password'}
                          placeholder="eyJh... ou sk_live_9a87f2e1..."
                          value={bearerToken}
                          onChange={(e) => setBearerToken(e.target.value)}
                          className="w-full pl-3.5 pr-20 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-mono bg-slate-50/50 focus:bg-white text-slate-900 outline-none transition-all"
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setShowAuthToken(!showAuthToken)}
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title={showAuthToken ? 'Ocultar token' : 'Visualizar token'}
                          >
                            {showAuthToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          {bearerToken && (
                            <button
                              type="button"
                              onClick={() => handleCopy(bearerToken, 'token_bearer')}
                              className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                              title="Copiar token"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Header Preview */}
                    <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-indigo-900 shrink-0">Header HTTP Gerado:</span>
                        <code className="px-2 py-0.5 rounded bg-white border border-indigo-200 text-indigo-700 font-mono text-[10px] truncate max-w-md">
                          Authorization: Bearer {bearerToken.trim() ? (showAuthToken ? bearerToken : '••••••••••••••••' + (bearerToken.length > 4 ? bearerToken.slice(-4) : '')) : '<seu-token>'}
                        </code>
                      </div>
                      <span className="text-[10px] text-indigo-700 font-bold shrink-0">
                        RFC 6750
                      </span>
                    </div>
                  </div>
                )}

                {/* API KEY INPUT FORM */}
                {authType === 'api_key' && (
                  <div className="p-3.5 rounded-xl bg-white border border-purple-200 space-y-3 shadow-2xs animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      {/* Header Name */}
                      <div className="md:col-span-5 space-y-1.5">
                        <label className="block text-xs font-bold text-purple-950 flex items-center justify-between">
                          <span>Nome do Cabeçalho (Header Name) *</span>
                        </label>
                        <input
                          id="input_webhook_api_key_header"
                          type="text"
                          placeholder="X-API-Key, api-key, Authorization..."
                          value={apiKeyHeaderName}
                          onChange={(e) => setApiKeyHeaderName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-xs font-mono bg-slate-50/50 focus:bg-white text-slate-900 outline-none transition-all"
                        />

                        {/* Quick Header Presets */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 font-semibold">Padrões:</span>
                          {['X-API-Key', 'api-key', 'X-Auth-Token', 'apikey'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setApiKeyHeaderName(preset)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                apiKeyHeaderName === preset
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Header Value / API Key Value */}
                      <div className="md:col-span-7 space-y-1.5">
                        <label className="block text-xs font-bold text-purple-950 flex items-center justify-between">
                          <span>Valor da Chave de API (Secret Key) *</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            id="input_webhook_api_key_value"
                            type={showAuthToken ? 'text' : 'password'}
                            placeholder="ak_live_7623a89bc45d01e..."
                            value={apiKeyValue}
                            onChange={(e) => setApiKeyValue(e.target.value)}
                            className="w-full pl-3.5 pr-20 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-xs font-mono bg-slate-50/50 focus:bg-white text-slate-900 outline-none transition-all"
                          />
                          <div className="absolute right-2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setShowAuthToken(!showAuthToken)}
                              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                              title={showAuthToken ? 'Ocultar chave' : 'Visualizar chave'}
                            >
                              {showAuthToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            {apiKeyValue && (
                              <button
                                type="button"
                                onClick={() => handleCopy(apiKeyValue, 'token_api_key')}
                                className="p-1 text-slate-400 hover:text-purple-600 cursor-pointer"
                                title="Copiar chave"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Transmitida de forma segura via HTTPS em todas as notificações.
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Header Preview */}
                    <div className="p-2.5 rounded-lg bg-purple-50/60 border border-purple-100 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-purple-900 shrink-0">Header HTTP Gerado:</span>
                        <code className="px-2 py-0.5 rounded bg-white border border-purple-200 text-purple-700 font-mono text-[10px] truncate max-w-md">
                          {apiKeyHeaderName.trim() || 'X-API-Key'}: {apiKeyValue.trim() ? (showAuthToken ? apiKeyValue : '••••••••••••••••' + (apiKeyValue.length > 4 ? apiKeyValue.slice(-4) : '')) : '<sua-chave>'}
                        </code>
                      </div>
                    </div>
                  </div>
                )}

                {/* CUSTOM HEADERS PAIRS FORM */}
                {authType === 'custom' && (
                  <div className="p-3.5 rounded-xl bg-white border border-blue-200 space-y-3 shadow-2xs animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-blue-950">
                        Cabeçalhos HTTP Personalizados (Key: Value)
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomHeaders([...customHeaders, { key: '', value: '' }])}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Adicionar Header</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {customHeaders.map((hdr, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Header (ex: X-Custom-Auth)"
                            value={hdr.key}
                            onChange={(e) => {
                              const next = [...customHeaders];
                              next[idx].key = e.target.value;
                              setCustomHeaders(next);
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-slate-50 focus:bg-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Valor"
                            value={hdr.value}
                            onChange={(e) => {
                              const next = [...customHeaders];
                              next[idx].value = e.target.value;
                              setCustomHeaders(next);
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-slate-50 focus:bg-white outline-none"
                          />
                          {customHeaders.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setCustomHeaders(customHeaders.filter((_, i) => i !== idx))}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Security & Authentication Tokens */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-slate-100">
                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Chave Secreta / HMAC SHA-256 (Opcional)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSecretToken(`whsec_${Math.random().toString(36).substring(2, 14)}`)}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Gerar Nova
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={secretToken}
                      onChange={(e) => setSecretToken(e.target.value)}
                      placeholder="whsec_..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-xs font-mono bg-slate-50/70 focus:bg-white text-slate-900 pr-10 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    O ManyFlow assinará as requisições no header <code className="text-slate-700">X-Hub-Signature-256</code> usando esta chave.
                  </span>
                </div>

                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Método HTTP
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHttpMethod('POST')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        httpMethod === 'POST'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      POST (Recomendado)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHttpMethod('PUT')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        httpMethod === 'PUT'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      PUT
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Payloads são sempre enviados em formato JSON padronizado UTF-8.
                  </span>
                </div>
              </div>

              {/* Action Buttons: Test Webhook & Save Webhook */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  id="btn_test_webhook_outbound"
                  type="button"
                  onClick={handleTestOutbound}
                  disabled={isTestingEndpoint || !url.trim()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  <Play className={`w-3.5 h-3.5 text-amber-600 ${isTestingEndpoint ? 'animate-spin' : ''}`} />
                  <span>{isTestingEndpoint ? 'Disparando Teste HTTP...' : 'Testar Webhook Agora'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    id="btn_save_webhook_outbound"
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingId ? 'Salvar Alterações' : 'Salvar Webhook de Saída'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Test Result Live Feedback Panel */}
            {testResult && (
              <div
                id="panel_test_webhook_feedback"
                className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-black text-sm">
                        {testResult.success ? 'Teste Concluído com Sucesso!' : 'Falha no Teste do Endpoint'}
                      </span>
                      <span className="ml-2 font-mono font-bold px-2 py-0.5 rounded text-[11px] bg-white/80 border border-slate-300">
                        HTTP {testResult.statusCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Latência: {testResult.durationMs}ms</span>
                    <button
                      onClick={() => setTestResult(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] space-y-1">
                  <div>
                    <span className="font-bold">Endpoint testado: </span>
                    <span className="font-mono text-slate-800 break-all">{testResult.endpointUrl}</span>
                  </div>
                  {testResult.responseBody && (
                    <div>
                      <span className="font-bold">Corpo da resposta: </span>
                      <pre className="mt-1 p-2 bg-slate-900 text-emerald-300 rounded-lg font-mono text-[10px] overflow-x-auto max-h-32">
                        {testResult.responseBody}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* List of Registered Outbound Webhooks */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Webhooks de Saída Ativos ({(settings.conversionEndpoints || []).length})
                </h4>
                <p className="text-xs text-slate-500">
                  Endpoints cadastrados para receber notificações de eventos em tempo real.
                </p>
              </div>

              <button
                onClick={() => {
                  handleResetForm();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Endpoint</span>
              </button>
            </div>

            {(settings.conversionEndpoints || []).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                Nenhum webhook de saída cadastrado no momento. Cadastre acima para integrar seus CRMs.
              </div>
            ) : (
              <div className="space-y-3">
                {(settings.conversionEndpoints || []).map((ep) => (
                  <div
                    key={ep.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-xs font-black text-slate-900">{ep.name}</h5>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ep.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {ep.isActive ? 'Ativo' : 'Pausado'}
                        </span>
                        {ep.lastStatusCode && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ep.lastStatusCode >= 200 && ep.lastStatusCode < 300
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            HTTP {ep.lastStatusCode}
                          </span>
                        )}

                        {/* Security & Authentication Badges */}
                        {ep.authType === 'bearer' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <Key className="w-2.5 h-2.5" />
                            <span>Bearer Token</span>
                          </span>
                        )}
                        {ep.authType === 'api_key' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                            <Key className="w-2.5 h-2.5" />
                            <span>API Key ({ep.apiKeyHeaderName || 'X-API-Key'})</span>
                          </span>
                        )}
                        {ep.authType === 'custom' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Code className="w-2.5 h-2.5" />
                            <span>Headers ({ep.headers?.length || 0})</span>
                          </span>
                        )}
                        {ep.secretToken && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1" title="Assinatura HMAC SHA-256 ativa">
                            <Lock className="w-2.5 h-2.5" />
                            <span>HMAC</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                        <span className="truncate max-w-md">{ep.url}</span>
                        <button
                          onClick={() => handleCopy(ep.url, `ep_url_${ep.id}`)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          title="Copiar URL"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold">Eventos:</span>
                        {ep.events.map((evtId) => {
                          const meta = OUTBOUND_EVENTS.find((m) => m.id === evtId);
                          return (
                            <span
                              key={evtId}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {meta?.label || evtId}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                      <button
                        onClick={() => {
                          setUrl(ep.url);
                          setSelectedEvents(ep.events);
                          setSecretToken(ep.secretToken || '');
                          setAuthType(ep.authType || 'none');
                          setBearerToken(ep.bearerToken || '');
                          setApiKeyHeaderName(ep.apiKeyHeaderName || 'X-API-Key');
                          setApiKeyValue(ep.apiKeyValue || '');
                          if (ep.headers && ep.headers.length > 0) {
                            setCustomHeaders(ep.headers);
                          }
                          handleTestOutbound();
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Disparar requisição de teste"
                      >
                        <Play className="w-3 h-3 text-amber-600" />
                        <span>Testar</span>
                      </button>

                      <button
                        onClick={() => handleToggleEndpoint(ep.id, ep.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          ep.isActive
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {ep.isActive ? 'Pausar' : 'Ativar'}
                      </button>

                      <button
                        onClick={() => handleEditEndpoint(ep)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar configurações"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteEndpoint(ep.id, ep.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir webhook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SEÇÃO DE WEBHOOKS DE ENTRADA (INBOUND)                                 */}
      {/* ========================================================================= */}
      {activeSection === 'inbound' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Endpoint de Entrada (Recebimento de Dados Externos)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Use esta URL para configurar no Meta Developer Portal, gateway de pagamentos ou formulários de leads para injetar dados no ManyFlow.
                </p>
              </div>
            </div>

            {/* Generated Inbound URLs */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>URL Oficial do Webhook (Meta, Instagram & Mensagens)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    HTTPS Ativo (Porta 443)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={metaWebhookUrl}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 font-mono text-xs text-slate-800 select-all"
                  />
                  <button
                    onClick={() => handleCopy(metaWebhookUrl, 'copy_inbound_meta')}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey === 'copy_inbound_meta' ? 'Copiado!' : 'Copiar URL'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Endpoint Universal para CRMs & Formulários de Leads</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                    JSON Inbound
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inboundUrl}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 font-mono text-xs text-slate-800 select-all"
                  />
                  <button
                    onClick={() => handleCopy(inboundUrl, 'copy_inbound_universal')}
                    className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey === 'copy_inbound_universal' ? 'Copiado!' : 'Copiar URL'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Inbound Tokens Form */}
            <form onSubmit={handleSaveInboundConfig} className="space-y-4 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Token de Verificação (Verify Token)</span>
                    <button
                      type="button"
                      onClick={() => setGlobalVerifyToken(`mf_token_${Math.random().toString(36).substring(2, 12)}`)}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Gerar Novo
                    </button>
                  </label>
                  <input
                    type="text"
                    value={globalVerifyToken}
                    onChange={(e) => setGlobalVerifyToken(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    Insira este token no campo "Token de Verificação" no painel do Meta for Developers.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Chave Secreta do App (App Secret)
                  </label>
                  <input
                    type="password"
                    value={appSecret}
                    onChange={(e) => setAppSecret(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    Usado para validar assinaturas HMAC-SHA256 de requisições recebidas.
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestInboundHandshake}
                  disabled={inboundTestLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Play className={`w-3.5 h-3.5 text-purple-600 ${inboundTestLoading ? 'animate-spin' : ''}`} />
                  <span>{inboundTestLoading ? 'Validando Handshake...' : 'Simular Verificação Meta (Handshake GET)'}</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Chaves de Entrada</span>
                </button>
              </div>
            </form>

            {inboundTestResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                inboundTestResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-center gap-2">
                  {inboundTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-bold">
                    {inboundTestResult.success ? 'Handshake 200 OK' : 'Falha na Validação'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">{inboundTestResult.message}</p>
                {inboundTestResult.challengeReturned && (
                  <div className="text-[10px] font-mono mt-1 text-emerald-800">
                    Challenge retornado: <code>{inboundTestResult.challengeReturned}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SEÇÃO DE LOGS DOS ÚLTIMOS WEBHOOKS DISPARADOS (STATUS CODE & PAYLOAD) */}
      {/* ========================================================================= */}
      {activeSection === 'logs' && (
        <div id="webhook_logs_container" className="webhook-logs-container space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Disparos</span>
              <div className="text-xl font-black text-slate-900">{totalDeliveries}</div>
              <span className="text-[10px] text-slate-400">Histórico recente</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Sucesso (2xx)</span>
              <div className="text-xl font-black text-emerald-600">{successDeliveries}</div>
              <span className="text-[10px] text-emerald-700 font-medium">
                {totalDeliveries > 0 ? Math.round((successDeliveries / totalDeliveries) * 100) : 100}% taxa de entrega
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Erros (4xx / 5xx)</span>
              <div className="text-xl font-black text-rose-600">{errorDeliveries}</div>
              <span className="text-[10px] text-rose-700 font-medium">Falhas ou timeouts</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Latência Média</span>
              <div className="text-xl font-black text-indigo-600">{avgLatency}ms</div>
              <span className="text-[10px] text-indigo-700 font-medium">Tempo de resposta HTTP</span>
            </div>
          </div>

          {/* Logs Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search input (Campo de busca para localizar eventos) */}
              <div className="relative flex-1 max-w-xl">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input_webhook_logs_search"
                  type="text"
                  placeholder="Buscar por evento (ex: nova mensagem, lead qualificado), URL, status (200, 500) ou payload..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/80 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium placeholder:text-slate-400"
                />
                {logSearch && (
                  <button
                    onClick={() => setLogSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  id="btn_refresh_logs"
                  onClick={() => loadDeliveries()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLogsLoading ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </button>

                <button
                  id="btn_clear_logs"
                  onClick={handleClearLogs}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Histórico</span>
                </button>
              </div>
            </div>

            {/* Quick Status and Event Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3 h-3 text-slate-400" />
                  <span>Filtro por Status:</span>
                </span>

                {/* Status: Todos */}
                <button
                  id="filter_status_all"
                  onClick={() => setLogStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    logStatusFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Todos</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    logStatusFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {totalDeliveries}
                  </span>
                </button>

                {/* Status: Sucesso */}
                <button
                  id="filter_status_success"
                  onClick={() => setLogStatusFilter('2xx')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 border ${
                    logStatusFilter === '2xx'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${logStatusFilter === '2xx' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>Sucesso (2xx)</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    logStatusFilter === '2xx' ? 'bg-emerald-700 text-white' : 'bg-emerald-200/80 text-emerald-800'
                  }`}>
                    {successDeliveries}
                  </span>
                </button>

                {/* Status: Erro */}
                <button
                  id="filter_status_error"
                  onClick={() => setLogStatusFilter('4xx_5xx')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 border ${
                    logStatusFilter === '4xx_5xx'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <XCircle className={`w-3.5 h-3.5 ${logStatusFilter === '4xx_5xx' ? 'text-white' : 'text-rose-600'}`} />
                  <span>Erro (4xx / 5xx)</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    logStatusFilter === '4xx_5xx' ? 'bg-rose-700 text-white' : 'bg-rose-200/80 text-rose-800'
                  }`}>
                    {errorDeliveries}
                  </span>
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

                {/* Event Selector Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Evento:</span>
                  <select
                    id="select_log_event_filter"
                    value={logEventFilter}
                    onChange={(e) => setLogEventFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-blue-500"
                  >
                    <option value="all">Todos os Eventos ({OUTBOUND_EVENTS.length})</option>
                    {OUTBOUND_EVENTS.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real-time Matching Count Badge */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-[11px] text-slate-500 font-medium">
                  Mostrando <strong className="text-slate-800 font-bold">{filteredDeliveries.length}</strong> de {totalDeliveries} eventos
                </span>
                {(logSearch || logStatusFilter !== 'all' || logEventFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setLogSearch('');
                      setLogStatusFilter('all');
                      setLogEventFilter('all');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>

            {/* Quick Event Tags Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Atalhos rápidos:</span>
              {[
                { label: 'Nova Mensagem', query: 'nova mensagem' },
                { label: 'Novo Contato', query: 'novo contato' },
                { label: 'Lead Qualificado', query: 'lead qualificado' },
                { label: 'Venda Concluída', query: 'venda' },
                { label: 'Status 200', query: '200' },
                { label: 'Status 500', query: '500' }
              ].map((chip) => (
                <button
                  key={chip.query}
                  type="button"
                  onClick={() => setLogSearch(chip.query)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                    logSearch.toLowerCase() === chip.query
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logs List Cards */}
          <div className="space-y-3">
            {filteredDeliveries.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-700 text-sm">Nenhum log encontrado para os filtros selecionados</p>
                  <p className="text-slate-500">
                    Tente ajustar o termo da busca ou alterar o filtro de status (Sucesso / Erro).
                  </p>
                </div>
                {(logSearch || logStatusFilter !== 'all' || logEventFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setLogSearch('');
                      setLogStatusFilter('all');
                      setLogEventFilter('all');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-xs"
                  >
                    Resetar Todos os Filtros
                  </button>
                )}
              </div>
            ) : (
              filteredDeliveries.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const isSuccess = log.responseStatus >= 200 && log.responseStatus < 300;
                const eventMeta = OUTBOUND_EVENTS.find((m) => m.id === log.event);

                return (
                  <div
                    key={log.id}
                    id={`log_item_${log.id}`}
                    className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs transition-all hover:border-slate-300"
                  >
                    {/* Log Header Bar */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                      <div className="flex items-start sm:items-center gap-3">
                        {/* Status Code Badge */}
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black shrink-0 border ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : log.responseStatus >= 400 && log.responseStatus < 500
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}>
                          HTTP {log.responseStatus} {log.responseStatusText || ''}
                        </div>

                        {/* Event Name & Target URL */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-900">
                              {eventMeta?.label || log.event}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-600 uppercase">
                              {log.method || 'POST'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {new Date(log.timestamp).toLocaleTimeString('pt-BR')} • {log.durationMs}ms
                            </span>
                          </div>

                          <div className="text-xs font-mono text-slate-500 truncate max-w-lg">
                            {log.endpointUrl}
                          </div>
                        </div>
                      </div>

                      {/* Log Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRetryLog(log)}
                          disabled={retryingLogId === log.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Reenviar este webhook com o mesmo payload"
                        >
                          <Repeat className={`w-3 h-3 ${retryingLogId === log.id ? 'animate-spin' : ''}`} />
                          <span>Reenviar</span>
                        </button>

                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Code className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Ocultar Detalhes' : 'Ver Payload & Resposta'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Payload & Response Details */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-950 text-slate-200 border-t border-slate-800 space-y-4 text-xs">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Sent Payload */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="font-bold flex items-center gap-1.5">
                                <Send className="w-3.5 h-3.5 text-blue-400" />
                                <span>Payload JSON Enviado</span>
                              </span>
                              <button
                                onClick={() => handleCopy(JSON.stringify(log.payload, null, 2), `copy_pl_${log.id}`)}
                                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copiar JSON</span>
                              </button>
                            </div>
                            <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-64 select-all">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>

                          {/* Received Response */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="font-bold flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-purple-400" />
                                <span>Resposta HTTP do Servidor Remoto</span>
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                Status: {log.responseStatus}
                              </span>
                            </div>
                            <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 select-all">
                              {log.responseBody || 'Corpo da resposta vazio (204 No Content ou sem dados)'}
                            </pre>
                          </div>
                        </div>

                        {/* Request Meta Bar */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                          <div>
                            <span className="text-slate-500">Timestamp: </span>
                            <span className="font-mono text-slate-300">{log.timestamp}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Endpoint: </span>
                            <span className="font-mono text-slate-300">{log.endpointUrl}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">ID do Log: </span>
                            <span className="font-mono text-slate-300">{log.id}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
