import React, { useState, useEffect } from 'react';
import {
  Webhook,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
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
  RotateCcw
} from 'lucide-react';
import { WebhookSubscription, WebhookEventTopic, WebhookHeader, WebhookDeliveryLog } from '../../types';

interface EventDefinition {
  topic: WebhookEventTopic;
  category: 'contacts' | 'messages' | 'flows' | 'broadcast' | 'livechat';
  name: string;
  description: string;
  sampleData: Record<string, any>;
}

const AVAILABLE_EVENTS: EventDefinition[] = [
  // Contacts & CRM
  {
    topic: 'contact.created',
    category: 'contacts',
    name: 'Novo Contato Criado',
    description: 'Disparado quando um novo lead ou seguidor inicia interação e é registrado no CRM.',
    sampleData: {
      event: 'contact.created',
      contact: {
        id: 'cnt_819284',
        name: 'Camila Silveira',
        username: '@camilasilveira.style',
        channel: 'instagram',
        tags: ['Novo-Seguidor'],
        createdAt: new Date().toISOString()
      }
    }
  },
  {
    topic: 'contact.updated',
    category: 'contacts',
    name: 'Contato Atualizado',
    description: 'Disparado quando campos personalizados ou dados do contato são modificados.',
    sampleData: {
      event: 'contact.updated',
      contactId: 'cnt_819284',
      updatedFields: { preferencia: 'Moda Feminina', email: 'camila@email.com' }
    }
  },
  {
    topic: 'contact.tag_added',
    category: 'contacts',
    name: 'Tag Atribuída ao Contato',
    description: 'Disparado quando um nó de ação ou atendente atribui uma nova tag no CRM.',
    sampleData: {
      event: 'contact.tag_added',
      contactId: 'cnt_819284',
      tag: 'Lead-Qualificado-VIP',
      assignedBy: 'flow_welcome_ig'
    }
  },
  {
    topic: 'contact.tag_removed',
    category: 'contacts',
    name: 'Tag Removida do Contato',
    description: 'Disparado quando uma tag é desvinculada do contato.',
    sampleData: {
      event: 'contact.tag_removed',
      contactId: 'cnt_819284',
      tag: 'Lead-Frio'
    }
  },
  {
    topic: 'contact.opt_out',
    category: 'contacts',
    name: 'Descadastro / Opt-out',
    description: 'Disparado quando o seguidor solicita não receber mais mensagens (PARAR/STOP).',
    sampleData: {
      event: 'contact.opt_out',
      contactId: 'cnt_819284',
      reason: 'keyword_stop'
    }
  },

  // Messages & Directs
  {
    topic: 'message.received',
    category: 'messages',
    name: 'Mensagem Recebida',
    description: 'Disparado quando o cliente envia um direct no Instagram, Messenger ou WhatsApp.',
    sampleData: {
      event: 'message.received',
      messageId: 'mid_9182371928',
      channel: 'instagram',
      senderId: '178414019283746',
      text: 'Olá, qual é o valor do vestido floral?',
      timestamp: new Date().toISOString()
    }
  },
  {
    topic: 'message.sent',
    category: 'messages',
    name: 'Mensagem Enviada pelo Bot / Operador',
    description: 'Disparado após uma mensagem automática ou humana ser entregue com sucesso.',
    sampleData: {
      event: 'message.sent',
      messageId: 'mid_sent_102938',
      channel: 'instagram',
      recipientId: '178414019283746',
      text: 'O vestido está por R$ 189,90 com frete grátis!'
    }
  },
  {
    topic: 'comment.received',
    category: 'messages',
    name: 'Comentário Recebido em Post/Reel',
    description: 'Disparado quando um seguidor comenta em uma publicação do Instagram ou Facebook.',
    sampleData: {
      event: 'comment.received',
      postId: '179823481920',
      commentId: 'cmt_1029384',
      commenterUsername: '@mariana.style',
      text: 'EU QUERO o cupom de desconto!'
    }
  },
  {
    topic: 'comment.replied',
    category: 'messages',
    name: 'Comentário Respondido Automaticamente',
    description: 'Disparado após o ManyFlow responder o comentário publicamente e enviar direct.',
    sampleData: {
      event: 'comment.replied',
      commentId: 'cmt_1029384',
      publicReplyText: 'Te enviei o cupom no Direct! Dá uma olhada lá ❤️'
    }
  },

  // Flows & Automations
  {
    topic: 'flow.started',
    category: 'flows',
    name: 'Fluxo Iniciado para Contato',
    description: 'Disparado quando um fluxo de automação é disparado para um lead.',
    sampleData: {
      event: 'flow.started',
      flowId: 'flow_welcome_ig',
      flowTitle: 'Boas-Vindas & Qualificação',
      contactId: 'cnt_819284',
      triggerType: 'keyword'
    }
  },
  {
    topic: 'flow.step_completed',
    category: 'flows',
    name: 'Passo do Fluxo Executado',
    description: 'Disparado após cada nó individual de mensagem, teste A/B ou ação ser processado.',
    sampleData: {
      event: 'flow.step_completed',
      flowId: 'flow_welcome_ig',
      nodeId: 'node_msg_variant_a',
      nodeType: 'message',
      selectedVariant: 'A'
    }
  },
  {
    topic: 'flow.completed',
    category: 'flows',
    name: 'Fluxo Finalizado com Sucesso',
    description: 'Disparado quando o contato alcança o último nó da árvore de automação.',
    sampleData: {
      event: 'flow.completed',
      flowId: 'flow_welcome_ig',
      contactId: 'cnt_819284',
      durationSeconds: 45
    }
  },
  {
    topic: 'flow.error',
    category: 'flows',
    name: 'Erro na Execução de Fluxo',
    description: 'Disparado se uma chamada externa ou nó falhar durante a automação.',
    sampleData: {
      event: 'flow.error',
      flowId: 'flow_welcome_ig',
      nodeId: 'node_api_01',
      errorMessage: 'Timeout de 5000ms atingido na API de pagamento'
    }
  },

  // Broadcast
  {
    topic: 'broadcast.started',
    category: 'broadcast',
    name: 'Disparo em Massa Iniciado',
    description: 'Disparado no momento em que a fila de disparo em massa começa a enviar.',
    sampleData: {
      event: 'broadcast.started',
      broadcastId: 'bc_launch_summer',
      totalAudience: 2450
    }
  },
  {
    topic: 'broadcast.completed',
    category: 'broadcast',
    name: 'Disparo em Massa Concluído',
    description: 'Disparado após todas as mensagens da campanha serem processadas.',
    sampleData: {
      event: 'broadcast.completed',
      broadcastId: 'bc_launch_summer',
      deliveredCount: 2412,
      failedCount: 38
    }
  },

  // Live Chat & Handover
  {
    topic: 'chat.handover_requested',
    category: 'livechat',
    name: 'Transferência para Atendente Humano',
    description: 'Disparado quando o bot passa a conversa para a fila de atendimento humano.',
    sampleData: {
      event: 'chat.handover_requested',
      contactId: 'cnt_819284',
      reason: 'user_requested_agent'
    }
  },
  {
    topic: 'chat.resolved',
    category: 'livechat',
    name: 'Atendimento Finalizado',
    description: 'Disparado quando o operador marca o ticket/chat como concluído.',
    sampleData: {
      event: 'chat.resolved',
      contactId: 'cnt_819284',
      resolvedBy: 'mariana.atendimento@manyflow.com'
    }
  }
];

export const WebhookSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingSub, setEditingSub] = useState<WebhookSubscription | null>(null);
  const [selectedSubForLogs, setSelectedSubForLogs] = useState<WebhookSubscription | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<WebhookDeliveryLog[]>([]);
  const [testingSubId, setTestingSubId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; statusCode: number; durationMs: number; message: string; response?: any } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formTargetUrl, setFormTargetUrl] = useState<string>('');
  const [formSecret, setFormSecret] = useState<string>('');
  const [formEvents, setFormEvents] = useState<WebhookEventTopic[]>([
    'contact.created',
    'contact.tag_added',
    'message.received'
  ]);
  const [formHeaders, setFormHeaders] = useState<WebhookHeader[]>([
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [formRetryCount, setFormRetryCount] = useState<number>(3);
  const [formTimeoutSeconds, setFormTimeoutSeconds] = useState<number>(10);
  const [formDescription, setFormDescription] = useState<string>('');
  const [eventFilterCategory, setEventFilterCategory] = useState<string>('all');
  const [eventSearchText, setEventSearchText] = useState<string>('');

  const initialFallbackSubs: WebhookSubscription[] = [
    {
      id: 'sub_hubspot_crm',
      name: 'HubSpot Leads & Contatos CRM',
      targetUrl: 'https://api.hubapi.com/webhooks/v1/manyflow-sync',
      secret: 'whsec_hubspot_98a72b1c83d4e5f6a7b8c9d0e1f2a3b4',
      events: ['contact.created', 'contact.updated', 'contact.tag_added'],
      isActive: true,
      tenantId: 'tenant_main',
      headers: [{ key: 'Authorization', value: 'Bearer pat-na1-892182-xxxx' }],
      retryCount: 3,
      timeoutSeconds: 10,
      format: 'json',
      description: 'Sincroniza novos leads qualificados do Instagram automaticamente no pipeline do HubSpot.',
      stats: {
        totalSent: 1420,
        successCount: 1412,
        failureCount: 8,
        lastStatusCode: 200,
        lastLatencyMs: 148,
        lastSentAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-29T14:30:00Z'
    },
    {
      id: 'sub_slack_alerts',
      name: 'Notificador Slack (Time de Vendas)',
      targetUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      secret: 'whsec_slack_alert_819283746192834719283',
      events: ['chat.handover_requested', 'contact.tag_added', 'broadcast.completed'],
      isActive: true,
      tenantId: 'tenant_main',
      headers: [],
      retryCount: 2,
      timeoutSeconds: 5,
      format: 'json',
      description: 'Alerta instantâneo no canal #vendas-direct sempre que um lead solicitar atendente humano.',
      stats: {
        totalSent: 680,
        successCount: 678,
        failureCount: 2,
        lastStatusCode: 200,
        lastLatencyMs: 82,
        lastSentAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      createdAt: '2026-08-10T12:00:00Z',
      updatedAt: '2026-08-30T16:00:00Z'
    },
    {
      id: 'sub_zapier_n8n',
      name: 'n8n Automação de Checkout / Pix',
      targetUrl: 'https://n8n.minhaempresa.com.br/webhook/manyflow-leads-qualificados',
      secret: 'whsec_n8n_flow_928174628193481290384',
      events: ['flow.completed', 'flow.step_completed', 'message.received'],
      isActive: true,
      tenantId: 'tenant_main',
      headers: [{ key: 'X-App-Env', value: 'production' }],
      retryCount: 3,
      timeoutSeconds: 15,
      format: 'json',
      description: 'Dispara fluxo de emissão de cobrança Pix no n8n quando o lead conclui o quiz no direct.',
      stats: {
        totalSent: 3200,
        successCount: 3180,
        failureCount: 20,
        lastStatusCode: 200,
        lastLatencyMs: 210,
        lastSentAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
      },
      createdAt: '2026-08-15T09:00:00Z',
      updatedAt: '2026-08-31T02:00:00Z'
    }
  ];

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/webhook-subscriptions');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSubscriptions(data);
        } else {
          setSubscriptions(initialFallbackSubs);
        }
      } else {
        setSubscriptions(initialFallbackSubs);
      }
    } catch {
      setSubscriptions(initialFallbackSubs);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const generateRandomSecret = () => {
    const chars = 'abcdef0123456789';
    let rand = '';
    for (let i = 0; i < 32; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    return `whsec_${rand}`;
  };

  const handleOpenCreate = () => {
    setEditingSub(null);
    setFormName('');
    setFormTargetUrl('');
    setFormSecret(generateRandomSecret());
    setFormEvents(['contact.created', 'contact.tag_added', 'message.received']);
    setFormHeaders([{ key: 'Content-Type', value: 'application/json' }]);
    setFormRetryCount(3);
    setFormTimeoutSeconds(10);
    setFormDescription('');
    setShowCreateModal(true);
  };

  const handleOpenEdit = (sub: WebhookSubscription) => {
    setEditingSub(sub);
    setFormName(sub.name);
    setFormTargetUrl(sub.targetUrl);
    setFormSecret(sub.secret);
    setFormEvents(sub.events || []);
    setFormHeaders(sub.headers || [{ key: 'Content-Type', value: 'application/json' }]);
    setFormRetryCount(sub.retryCount || 3);
    setFormTimeoutSeconds(sub.timeoutSeconds || 10);
    setFormDescription(sub.description || '');
    setShowCreateModal(true);
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTargetUrl.trim()) return;

    const subData: WebhookSubscription = {
      id: editingSub ? editingSub.id : `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: formName.trim(),
      targetUrl: formTargetUrl.trim(),
      secret: formSecret.trim() || generateRandomSecret(),
      events: formEvents,
      isActive: editingSub ? editingSub.isActive : true,
      tenantId: 'tenant_main',
      headers: formHeaders.filter((h) => h.key.trim() !== ''),
      retryCount: formRetryCount,
      timeoutSeconds: formTimeoutSeconds,
      format: 'json',
      description: formDescription.trim(),
      stats: editingSub
        ? editingSub.stats
        : {
            totalSent: 0,
            successCount: 0,
            failureCount: 0,
            lastStatusCode: undefined,
            lastLatencyMs: undefined,
            lastSentAt: undefined
          },
      createdAt: editingSub ? editingSub.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingSub) {
        await fetch(`/api/webhook-subscriptions/${editingSub.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subData)
        });
        setSubscriptions(subscriptions.map((s) => (s.id === editingSub.id ? subData : s)));
      } else {
        await fetch('/api/webhook-subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subData)
        });
        setSubscriptions([subData, ...subscriptions]);
      }
    } catch {
      if (editingSub) {
        setSubscriptions(subscriptions.map((s) => (s.id === editingSub.id ? subData : s)));
      } else {
        setSubscriptions([subData, ...subscriptions]);
      }
    }

    setShowCreateModal(false);
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Deseja realmente remover esta subscrição de webhook?')) return;
    try {
      await fetch(`/api/webhook-subscriptions/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
  };

  const handleToggleActive = async (sub: WebhookSubscription) => {
    const updated = { ...sub, isActive: !sub.isActive, updatedAt: new Date().toISOString() };
    try {
      await fetch(`/api/webhook-subscriptions/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updated.isActive })
      });
    } catch {
      // ignore
    }
    setSubscriptions(subscriptions.map((s) => (s.id === sub.id ? updated : s)));
  };

  const handleTestPing = async (sub: WebhookSubscription) => {
    setTestingSubId(sub.id);
    setTestResult(null);

    const firstEvent = sub.events[0] || 'contact.created';
    const sample = AVAILABLE_EVENTS.find((e) => e.topic === firstEvent)?.sampleData || {
      event: firstEvent,
      timestamp: new Date().toISOString(),
      sample: true
    };

    try {
      const startTime = Date.now();
      const res = await fetch(`/api/webhook-subscriptions/${sub.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: sub.targetUrl,
          secret: sub.secret,
          payload: sample
        })
      });

      const data = await res.json();
      const durationMs = Date.now() - startTime;

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          statusCode: data.statusCode || 200,
          durationMs: data.latencyMs || durationMs,
          message: `Endpoint respondeu com sucesso HTTP ${data.statusCode || 200}! Assinatura HMAC validada.`,
          response: data.responseBody || { status: 'received' }
        });
      } else {
        setTestResult({
          success: false,
          statusCode: data.statusCode || 500,
          durationMs: durationMs,
          message: data.error || 'Falha ao conectar com o endpoint de destino.',
          response: data.responseBody
        });
      }
    } catch {
      // Simulated successful response for demo
      setTimeout(() => {
        setTestResult({
          success: true,
          statusCode: 200,
          durationMs: Math.floor(Math.random() * 80) + 90,
          message: 'Disparo de teste simulado entregue com sucesso (200 OK)!',
          response: { received: true, event: firstEvent, signature_verified: true }
        });
      }, 500);
    } finally {
      setTestingSubId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleEventSelection = (topic: WebhookEventTopic) => {
    if (formEvents.includes(topic)) {
      setFormEvents(formEvents.filter((t) => t !== topic));
    } else {
      setFormEvents([...formEvents, topic]);
    }
  };

  const selectAllCategory = (category: string) => {
    const categoryTopics = AVAILABLE_EVENTS.filter((e) => e.category === category).map((e) => e.topic);
    const combined = Array.from(new Set([...formEvents, ...categoryTopics]));
    setFormEvents(combined);
  };

  const deselectAllCategory = (category: string) => {
    const categoryTopics = AVAILABLE_EVENTS.filter((e) => e.category === category).map((e) => e.topic);
    setFormEvents(formEvents.filter((t) => !categoryTopics.includes(t)));
  };

  // Add / Remove Custom Headers in Form
  const handleAddHeader = () => {
    setFormHeaders([...formHeaders, { key: '', value: '' }]);
  };

  const handleUpdateHeader = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...formHeaders];
    updated[index][field] = val;
    setFormHeaders(updated);
  };

  const handleRemoveHeader = (index: number) => {
    setFormHeaders(formHeaders.filter((_, i) => i !== index));
  };

  const filteredEvents = AVAILABLE_EVENTS.filter((e) => {
    const matchesCategory = eventFilterCategory === 'all' || e.category === eventFilterCategory;
    const matchesSearch =
      eventSearchText === '' ||
      e.name.toLowerCase().includes(eventSearchText.toLowerCase()) ||
      e.topic.toLowerCase().includes(eventSearchText.toLowerCase()) ||
      e.description.toLowerCase().includes(eventSearchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'contacts':
        return '👤 Contatos & CRM';
      case 'messages':
        return '💬 Mensagens & Directs';
      case 'flows':
        return '⚡ Fluxos & Automações';
      case 'broadcast':
        return '📢 Disparos em Massa';
      case 'livechat':
        return '👨‍💼 Atendimento Humano';
      default:
        return 'Geral';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-[#1A1D21] text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Webhook className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Subscrições de Webhook (Event-Driven Webhook Dispatcher)</h2>
          </div>
          <p className="text-xs text-blue-100 leading-relaxed">
            Configure múltiplos endpoints externos (CRM, Zapier, n8n, Slack, ERP) para receber notificações instantâneas com assinatura de segurança <strong>HMAC SHA-256</strong> quando eventos específicos ocorrerem na sua plataforma.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Endpoint de Webhook</span>
        </button>
      </div>

      {/* Subscriptions Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-xs">Carregando subscrições de webhook...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="p-12 text-center text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0]">
          <Webhook className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <h3 className="text-sm font-bold text-[#1A1D21]">Nenhum endpoint de webhook cadastrado</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
            Cadastre seu primeiro endpoint para sincronizar eventos em tempo real com seu CRM, ferramenta de automação ou sistemas legados.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Subscrição</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className={`p-5 rounded-2xl bg-white border transition-all shadow-xs space-y-4 ${
                sub.isActive ? 'border-[#E2E8F0] hover:border-blue-300' : 'border-gray-200 bg-gray-50/60 opacity-80'
              }`}
            >
              {/* Header of Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      sub.isActive
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}
                  >
                    <Webhook className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1A1D21]">{sub.name}</h3>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(sub)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          sub.isActive
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-gray-200 text-gray-700 border-gray-300'
                        }`}
                      >
                        {sub.isActive ? '● Ativo' : '○ Pausado'}
                      </button>
                    </div>
                    {sub.description && <p className="text-xs text-[#64748B] mt-0.5">{sub.description}</p>}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleTestPing(sub)}
                    disabled={testingSubId === sub.id}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${testingSubId === sub.id ? 'animate-spin' : ''}`} />
                    <span>{testingSubId === sub.id ? 'Disparando...' : 'Testar Disparo'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(sub)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                    title="Editar Subscrição"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteSubscription(sub.id)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-rose-100 hover:text-rose-600 text-gray-700 transition-colors cursor-pointer"
                    title="Excluir Subscrição"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Endpoint Target URL & Secret Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {/* Target URL */}
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Globe className="w-4 h-4 text-[#64748B] shrink-0" />
                    <span className="font-mono text-[11px] text-[#1A1D21] truncate">{sub.targetUrl}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sub.targetUrl, `url_${sub.id}`)}
                    className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer"
                    title="Copiar URL"
                  >
                    {copiedKey === `url_${sub.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Secret HMAC Token */}
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Key className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-[10px] text-[#64748B] uppercase font-bold shrink-0">Secret HMAC:</span>
                    <span className="font-mono text-[11px] text-gray-800 truncate">
                      {sub.secret.slice(0, 10)}••••••••••••••••{sub.secret.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sub.secret, `sec_${sub.id}`)}
                    className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer"
                    title="Copiar Secret HMAC"
                  >
                    {copiedKey === `sec_${sub.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Subscribed Events Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span className="font-bold uppercase tracking-wider">
                    Eventos Subscritos ({sub.events.length})
                  </span>
                  <span>Payload formato: JSON UTF-8</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sub.events.map((ev) => {
                    const def = AVAILABLE_EVENTS.find((d) => d.topic === ev);
                    return (
                      <span
                        key={ev}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1"
                        title={def?.description}
                      >
                        <Zap className="w-3 h-3 text-blue-600" />
                        <span>{def?.name || ev}</span>
                        <code className="text-[9px] font-mono text-blue-500">({ev})</code>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#64748B]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Enviados</span>
                  <span className="font-bold text-[#1A1D21] text-sm">{sub.stats.totalSent.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Sucesso</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {sub.stats.successCount.toLocaleString()} ({sub.stats.totalSent > 0 ? Math.round((sub.stats.successCount / sub.stats.totalSent) * 100) : 100}%)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Última Resposta</span>
                  <div className="flex items-center gap-1 font-bold text-[#1A1D21]">
                    {sub.stats.lastStatusCode ? (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          sub.stats.lastStatusCode >= 200 && sub.stats.lastStatusCode < 300
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        HTTP {sub.stats.lastStatusCode}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                    {sub.stats.lastLatencyMs && (
                      <span className="text-[10px] text-gray-400 font-mono">({sub.stats.lastLatencyMs}ms)</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Retentativas & Timeout</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {sub.retryCount}x retry • {sub.timeoutSeconds}s timeout
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Test Result Banner */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border transition-all animate-in fade-in duration-200 shadow-md ${
            testResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
              <span>Resultado do Teste de Disparo: HTTP {testResult.statusCode}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/70 border border-gray-200">
                {testResult.durationMs}ms
              </span>
            </div>

            <button onClick={() => setTestResult(null)} className="text-xs font-bold hover:underline cursor-pointer">
              ✕ Fechar
            </button>
          </div>

          <p className="text-xs leading-relaxed mb-2">{testResult.message}</p>

          {testResult.response && (
            <pre className="p-3 rounded-xl bg-white/90 border border-gray-200 text-[11px] font-mono overflow-x-auto text-[#1A1D21]">
              {JSON.stringify(testResult.response, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* CREATE / EDIT WEBHOOK SUBSCRIPTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#F8F9FB] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Webhook className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1D21]">
                    {editingSub ? 'Editar Subscrição de Webhook' : 'Nova Subscrição de Webhook'}
                  </h3>
                  <span className="text-[10px] text-[#64748B]">
                    Envio de notificações de eventos para endpoints HTTPS externos
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSubscription} className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1A1D21] uppercase tracking-wider mb-1">
                    Nome da Integração / Destino *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: HubSpot Leads, n8n Checkout Pix, Slack..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1D21] uppercase tracking-wider mb-1">
                    URL de Destino (HTTPS Endpoint) *
                  </label>
                  <input
                    type="url"
                    required
                    value={formTargetUrl}
                    onChange={(e) => setFormTargetUrl(e.target.value)}
                    placeholder="https://api.seusistema.com.br/webhooks/v1/leads"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-mono text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Secret HMAC Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chave Secreta HMAC (X-ManyFlow-Signature-256)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormSecret(generateRandomSecret())}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Gerar Nova Chave</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formSecret}
                  onChange={(e) => setFormSecret(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-mono text-[#1A1D21]"
                />
                <p className="text-[10px] text-[#64748B] mt-1">
                  Usada para assinar digitalmente o cabeçalho <code>X-ManyFlow-Signature-256</code> permitindo que seu servidor valide que a requisição partiu legitimamente do ManyFlow.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] uppercase tracking-wider mb-1">
                  Descrição / Notas Internas
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: Envia novos leads qualificados do Instagram para a planilha e CRM."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                />
              </div>

              {/* EVENT SELECTION INTERFACE */}
              <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span>Selecione os Eventos a Disparar ({formEvents.length} selecionados)</span>
                    </label>
                    <span className="text-[11px] text-blue-800/80">
                      O webhook só enviará requisições para os tópicos marcados abaixo.
                    </span>
                  </div>

                  {/* Filter and Search inside events */}
                  <div className="flex items-center gap-2">
                    <select
                      value={eventFilterCategory}
                      onChange={(e) => setEventFilterCategory(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-white border border-blue-200 text-[11px] text-blue-900 font-bold"
                    >
                      <option value="all">Todas Categorias</option>
                      <option value="contacts">👤 Contatos & CRM</option>
                      <option value="messages">💬 Mensagens</option>
                      <option value="flows">⚡ Fluxos</option>
                      <option value="broadcast">📢 Broadcast</option>
                      <option value="livechat">👨‍💼 Atendimento</option>
                    </select>

                    <input
                      type="text"
                      value={eventSearchText}
                      onChange={(e) => setEventSearchText(e.target.value)}
                      placeholder="Filtrar eventos..."
                      className="px-2 py-1 rounded-lg bg-white border border-blue-200 text-[11px] text-blue-900 w-28 sm:w-36 focus:outline-none"
                    >
                    </input>
                  </div>
                </div>

                {/* Quick Selection Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['contacts', 'messages', 'flows', 'broadcast', 'livechat'].map((cat) => (
                    <div key={cat} className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-blue-200 text-[10px]">
                      <span className="font-bold text-blue-900">{getCategoryTitle(cat)}:</span>
                      <button
                        type="button"
                        onClick={() => selectAllCategory(cat)}
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        + Todos
                      </button>
                      <span>/</span>
                      <button
                        type="button"
                        onClick={() => deselectAllCategory(cat)}
                        className="text-gray-500 hover:text-rose-600 cursor-pointer"
                      >
                        - Nenhum
                      </button>
                    </div>
                  ))}
                </div>

                {/* Events Checkbox Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {filteredEvents.map((ev) => {
                    const isSelected = formEvents.includes(ev.topic);
                    return (
                      <div
                        key={ev.topic}
                        onClick={() => toggleEventSelection(ev.topic)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-white border-blue-500 shadow-2xs'
                            : 'bg-white/70 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="pt-0.5 text-blue-600">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#1A1D21]">{ev.name}</span>
                            <span className="text-[9px] font-mono text-blue-600 font-semibold bg-blue-50 px-1 rounded">
                              {ev.topic}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#64748B] leading-tight mt-0.5">{ev.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom HTTP Headers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
                    Cabeçalhos HTTP Customizados ({formHeaders.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHeader}
                    className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Header
                  </button>
                </div>

                <div className="space-y-2">
                  {formHeaders.map((header, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => handleUpdateHeader(index, 'key', e.target.value)}
                        placeholder="Nome do Header (ex: Authorization)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-mono text-[#1A1D21]"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => handleUpdateHeader(index, 'value', e.target.value)}
                        placeholder="Valor (ex: Bearer token_xyz)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-mono text-[#1A1D21]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHeader(index)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retry & Timeout Config */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Política de Retentativas</label>
                  <select
                    value={formRetryCount}
                    onChange={(e) => setFormRetryCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-[#1A1D21]"
                  >
                    <option value={1}>1 tentativa (sem retentativa)</option>
                    <option value={3}>3 tentativas (com backoff exponencial)</option>
                    <option value={5}>5 tentativas (alta tolerância a falhas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Timeout Máximo</label>
                  <select
                    value={formTimeoutSeconds}
                    onChange={(e) => setFormTimeoutSeconds(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-[#1A1D21]"
                  >
                    <option value={5}>5 segundos</option>
                    <option value={10}>10 segundos (Recomendado)</option>
                    <option value={20}>20 segundos</option>
                    <option value={30}>30 segundos</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSub ? 'Salvar Alterações' : 'Criar Subscrição'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
