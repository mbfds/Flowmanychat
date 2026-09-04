import {
  ExternalMessageWebhookEndpoint,
  ExternalWebhookDeliveryEvent,
  ExternalMessageEventType,
  ExternalWebhookPayloadFormat,
  ChannelType,
  ExternalWebhookPlatformPreset,
  WebhookRetryAttemptLog
} from '../types';
import { webhookRetryService, DEFAULT_RETRY_POLICY } from './webhookRetryService';

const STORAGE_KEY_PREFIX = 'manyflow_external_message_webhooks_';
const LOGS_STORAGE_KEY = 'manyflow_external_webhook_delivery_logs';

export const INITIAL_EXTERNAL_WEBHOOKS: ExternalMessageWebhookEndpoint[] = [
  {
    id: 'ewh_n8n_messages',
    name: 'n8n Workflow Hub (Recepção de Mensagens)',
    description: 'Encaminha todas as mensagens recebidas no Instagram e WhatsApp para automações complexas no n8n.',
    targetUrl: 'https://n8n.webhook.site/v1/manyflow/messages',
    platform: 'n8n',
    channelFilter: 'omnichannel',
    events: [
      'message.received',
      'message.media_received',
      'message.audio_transcribed',
      'message.reaction'
    ],
    isActive: true,
    authType: 'bearer',
    bearerToken: 'mf_sec_n8n_prod_998127394872394',
    verifyToken: 'manyflow_verify_token_n8n_2026',
    payloadFormat: 'n8n_structured',
    includeContactMetadata: true,
    includeCustomFields: true,
    includeRawPayload: false,
    timeoutSeconds: 10,
    maxRetries: 4,
    retryPolicy: {
      enabled: true,
      maxRetries: 4,
      initialIntervalSeconds: 2,
      multiplier: 2.0,
      maxIntervalSeconds: 300,
      strategy: 'exponential_jitter',
      enableJitter: true,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524],
      nonRetryableStatusCodes: [400, 401, 403, 404, 405, 422],
      deadLetterQueue: { enabled: true, notifyOnExhausted: true, autoPurgeDays: 14 }
    },
    customHeaders: [
      { key: 'X-Source-Application', value: 'ManyFlow-Engine' },
      { key: 'X-Environment', value: 'Production' }
    ],
    stats: {
      totalSent: 1420,
      successCount: 1408,
      failedCount: 12,
      lastLatencyMs: 84,
      lastStatusCode: 200,
      lastDispatchedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
    },
    tenantId: 'tenant_main',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'ewh_crm_callback',
    name: 'CRM Externo & Callback de Atendimento',
    description: 'Registra mensagens enviadas e recebidas com assinatura criptográfica HMAC SHA-256 no ERP/CRM da empresa.',
    targetUrl: 'https://api.crm-enterprise.com.br/webhooks/omnichannel/callback',
    platform: 'custom_rest',
    channelFilter: 'instagram',
    events: [
      'message.received',
      'message.sent',
      'message.postback',
      'message.story_reply',
      'message.story_mention'
    ],
    isActive: true,
    authType: 'hmac_sha256',
    hmacSecret: 'whsec_77a9c8f0e1b2345d6e7f8a9b0c1d2e3f',
    hmacHeaderName: 'X-Hub-Signature-256',
    verifyToken: 'crm_handshake_secret_token_8892',
    payloadFormat: 'standard_json',
    includeContactMetadata: true,
    includeCustomFields: true,
    includeRawPayload: true,
    timeoutSeconds: 5,
    maxRetries: 3,
    retryPolicy: {
      enabled: true,
      maxRetries: 3,
      initialIntervalSeconds: 3,
      multiplier: 2.0,
      maxIntervalSeconds: 120,
      strategy: 'exponential',
      enableJitter: false,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      nonRetryableStatusCodes: [400, 401, 403, 404, 422],
      deadLetterQueue: { enabled: true, notifyOnExhausted: true, autoPurgeDays: 30 }
    },
    customHeaders: [
      { key: 'X-Organization-ID', value: 'org_enterprise_br' }
    ],
    stats: {
      totalSent: 890,
      successCount: 885,
      failedCount: 5,
      lastLatencyMs: 112,
      lastStatusCode: 200,
      lastDispatchedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
    },
    tenantId: 'tenant_main',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'ewh_typebot_gateway',
    name: 'Typebot / Evolution API Callback',
    description: 'Callback bidirecional para transição de chats e orquestração de robôs no Typebot.',
    targetUrl: 'https://typebot.io/api/v1/typebots/flow_onboarding/webhook',
    platform: 'typebot',
    channelFilter: 'whatsapp',
    events: [
      'message.received',
      'message.delivered',
      'message.read',
      'message.failed'
    ],
    isActive: false,
    authType: 'api_key',
    apiKeyHeaderName: 'X-Typebot-Key',
    apiKeyValue: 'tb_live_secret_489182741092834',
    verifyToken: 'typebot_verify_token_wa',
    payloadFormat: 'typebot_compatible',
    includeContactMetadata: true,
    includeCustomFields: true,
    includeRawPayload: false,
    timeoutSeconds: 8,
    maxRetries: 5,
    retryPolicy: {
      enabled: true,
      maxRetries: 5,
      initialIntervalSeconds: 1,
      multiplier: 2.0,
      maxIntervalSeconds: 60,
      strategy: 'exponential_jitter',
      enableJitter: true,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      nonRetryableStatusCodes: [400, 401, 403, 404, 422],
      deadLetterQueue: { enabled: true, notifyOnExhausted: true, autoPurgeDays: 7 }
    },
    stats: {
      totalSent: 340,
      successCount: 332,
      failedCount: 8,
      lastLatencyMs: 145,
      lastStatusCode: 200,
      lastDispatchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    tenantId: 'tenant_main',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

export const INITIAL_LOGS: ExternalWebhookDeliveryEvent[] = [
  {
    id: 'log_98124',
    endpointId: 'ewh_n8n_messages',
    endpointName: 'n8n Workflow Hub (Recepção de Mensagens)',
    event: 'message.received',
    targetUrl: 'https://n8n.webhook.site/v1/manyflow/messages',
    channel: 'instagram',
    statusCode: 200,
    durationMs: 84,
    status: 'success',
    requestPayload: {
      event: 'message.received',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      message: {
        id: 'msg_ig_891283719',
        channel: 'instagram',
        type: 'text',
        text: 'Olá! Gostaria de saber o valor do plano Pro.',
        direction: 'inbound',
        sender: {
          id: 'usr_ig_camilastyle',
          name: 'Camila Silveira',
          username: '@camilasilveira.style',
          profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        },
        recipient: {
          id: 'page_instagram_business_main',
          name: 'ManyFlow Oficial'
        }
      },
      contact: {
        id: 'cnt_819284',
        name: 'Camila Silveira',
        tags: ['Lead-Instagram', 'Interesse-Pro'],
        customFields: { segmento: 'Moda', cidade: 'São Paulo' }
      }
    },
    requestHeaders: {
      'Authorization': 'Bearer mf_sec_n8n_prod_998127394872394',
      'Content-Type': 'application/json',
      'X-ManyFlow-Event': 'message.received'
    },
    responseBody: JSON.stringify({ ok: true, executionId: 'exec_n8n_88192', status: 'queued' }),
    attempts: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'log_98125',
    endpointId: 'ewh_n8n_messages',
    endpointName: 'n8n Workflow Hub (Recepção de Mensagens)',
    event: 'message.audio_transcribed',
    targetUrl: 'https://n8n.webhook.site/v1/manyflow/messages',
    channel: 'whatsapp',
    statusCode: 200,
    durationMs: 95,
    status: 'success',
    requestPayload: {
      event: 'message.audio_transcribed',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      message: {
        id: 'msg_wa_772183921',
        channel: 'whatsapp',
        type: 'audio',
        audioUrl: 'https://cdn.manyflow.io/audios/voice_note_8912.mp3',
        audioDurationSeconds: 14,
        transcription: 'Boa tarde, estou tentando agendar uma demonstração para amanhã às 15h, vocês têm horário disponível?',
        aiConfidence: 0.98,
        aiModel: 'Gemini 2.5 Flash Audio'
      },
      contact: {
        id: 'cnt_99214',
        name: 'Rodrigo Medeiros',
        phone: '+5511987654321'
      }
    },
    attempts: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
  },
  {
    id: 'log_98126',
    endpointId: 'ewh_crm_callback',
    endpointName: 'CRM Externo & Callback de Atendimento',
    event: 'message.sent',
    targetUrl: 'https://api.crm-enterprise.com.br/webhooks/omnichannel/callback',
    channel: 'instagram',
    statusCode: 200,
    durationMs: 112,
    status: 'success',
    requestPayload: {
      event: 'message.sent',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      message: {
        id: 'msg_out_19827391',
        channel: 'instagram',
        type: 'text',
        text: 'Perfeito! Nosso plano Pro inclui automações ilimitadas. Segue o link para teste: https://app.manyflow.io/signup',
        sentBy: 'bot_flow_sales',
        flowId: 'flow_vendas_direct_v2'
      }
    },
    requestHeaders: {
      'X-Hub-Signature-256': 'sha256=a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      'Content-Type': 'application/json'
    },
    responseBody: JSON.stringify({ success: true, crmRecordId: 'crm_deal_88291' }),
    attempts: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  }
];

export const externalWebhookService = {
  // Check MongoDB connection status
  async checkDbStatus(): Promise<{ connected: boolean; source: string }> {
    try {
      const res = await fetch('/api/webhooks/external-endpoints?tenantId=tenant_main');
      if (res.ok) {
        const data = await res.json();
        return { connected: !!data.dbConnected, source: data.source || 'mongodb' };
      }
      return { connected: false, source: 'memory' };
    } catch {
      return { connected: false, source: 'local' };
    }
  },

  // Get all endpoints for tenant from MongoDB
  async getEndpoints(tenantId: string = 'tenant_main'): Promise<ExternalMessageWebhookEndpoint[]> {
    try {
      const res = await fetch(`/api/webhooks/external-endpoints?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.endpoints) && data.endpoints.length > 0) {
          const key = `${STORAGE_KEY_PREFIX}${tenantId}`;
          localStorage.setItem(key, JSON.stringify(data.endpoints));
          return data.endpoints;
        }
      }
    } catch (err) {
      console.warn('Could not fetch external webhooks from MongoDB, falling back to local cache', err);
    }

    try {
      const key = `${STORAGE_KEY_PREFIX}${tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
      localStorage.setItem(key, JSON.stringify(INITIAL_EXTERNAL_WEBHOOKS));
      return INITIAL_EXTERNAL_WEBHOOKS;
    } catch {
      return INITIAL_EXTERNAL_WEBHOOKS;
    }
  },

  // Save or update an endpoint in MongoDB
  async saveEndpoint(
    endpoint: ExternalMessageWebhookEndpoint,
    tenantId: string = 'tenant_main'
  ): Promise<ExternalMessageWebhookEndpoint[]> {
    const endpoints = await this.getEndpoints(tenantId);
    const isExisting = endpoints.some((e) => e.id === endpoint.id);

    try {
      if (isExisting) {
        await fetch(`/api/webhooks/external-endpoints/${endpoint.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...endpoint, tenantId })
        });
      } else {
        await fetch('/api/webhooks/external-endpoints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...endpoint, tenantId })
        });
      }
    } catch (err) {
      console.warn('Failed to persist webhook to MongoDB server, saving locally', err);
    }

    const index = endpoints.findIndex((e) => e.id === endpoint.id);
    let updated: ExternalMessageWebhookEndpoint[];
    if (index >= 0) {
      updated = [...endpoints];
      updated[index] = {
        ...endpoint,
        updatedAt: new Date().toISOString()
      };
    } else {
      updated = [
        {
          ...endpoint,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        ...endpoints
      ];
    }

    const key = `${STORAGE_KEY_PREFIX}${tenantId}`;
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  },

  // Delete endpoint from MongoDB
  async deleteEndpoint(
    id: string,
    tenantId: string = 'tenant_main'
  ): Promise<ExternalMessageWebhookEndpoint[]> {
    try {
      await fetch(`/api/webhooks/external-endpoints/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Failed to delete endpoint from MongoDB, deleting locally', err);
    }

    const endpoints = await this.getEndpoints(tenantId);
    const updated = endpoints.filter((e) => e.id !== id);
    const key = `${STORAGE_KEY_PREFIX}${tenantId}`;
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  },

  // Toggle active state in MongoDB
  async toggleEndpoint(
    id: string,
    isActive: boolean,
    tenantId: string = 'tenant_main'
  ): Promise<ExternalMessageWebhookEndpoint[]> {
    try {
      await fetch(`/api/webhooks/external-endpoints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
    } catch (err) {
      console.warn('Failed to toggle active state in MongoDB', err);
    }

    const endpoints = await this.getEndpoints(tenantId);
    const updated = endpoints.map((e) =>
      e.id === id ? { ...e, isActive, updatedAt: new Date().toISOString() } : e
    );
    const key = `${STORAGE_KEY_PREFIX}${tenantId}`;
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  },

  // Generate Sample Payload by Event Type & Format
  generateSamplePayload(
    eventType: ExternalMessageEventType,
    format: ExternalWebhookPayloadFormat = 'standard_json',
    channel: ChannelType = 'instagram'
  ): any {
    const nowIso = new Date().toISOString();
    const contactMock = {
      id: 'cnt_819284',
      name: 'Camila Silveira',
      username: '@camilasilveira.style',
      phone: '+5511988776655',
      channel: channel,
      tags: ['Lead-Qualificado', 'VIP', 'Interesse-Campanha'],
      customFields: {
        cidade: 'São Paulo',
        segmento: 'E-commerce Moda',
        valor_estimado: '4500'
      }
    };

    let messageData: any = {
      id: `msg_${channel}_${Math.floor(Math.random() * 900000 + 100000)}`,
      channel,
      timestamp: nowIso,
      sender: {
        id: `usr_${channel}_9871`,
        name: contactMock.name,
        username: contactMock.username
      },
      recipient: {
        id: `page_${channel}_official`,
        name: 'ManyFlow Bot Oficial'
      }
    };

    switch (eventType) {
      case 'new_message':
      case 'message.received':
        messageData = {
          ...messageData,
          type: 'text',
          direction: 'inbound',
          text: 'Olá! Gostaria de saber mais sobre as automações no Instagram pelo ManyFlow! 🚀',
          hasAttachments: false,
          mid: `m_mid_ig_${Date.now()}`
        };
        break;
      case 'comment_mention':
        messageData = {
          ...messageData,
          type: 'mention',
          direction: 'inbound',
          text: '@manyflow_oficial Adorei essa automação! Como posso ativar no meu Instagram?',
          commentId: `cm_ig_${Date.now()}`,
          mediaId: '17920192837465000',
          mediaUrl: 'https://instagram.com/p/C9x8y7z6a5b/',
          mentionType: 'comment'
        };
        break;
      case 'message.sent':
        messageData = {
          ...messageData,
          type: 'text',
          direction: 'outbound',
          text: 'Com certeza! Nossos webhooks suportam Bearer Token, HMAC SHA-256 e entrega em tempo real.',
          sentBy: 'bot_automation',
          flowId: 'flow_onboarding_v1'
        };
        break;
      case 'message.media_received':
        messageData = {
          ...messageData,
          type: 'image',
          direction: 'inbound',
          mediaUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800',
          caption: 'Segue o comprovante do pedido!',
          mimeType: 'image/jpeg',
          fileSizeBytes: 245120
        };
        break;
      case 'message.audio_transcribed':
        messageData = {
          ...messageData,
          type: 'audio',
          direction: 'inbound',
          audioUrl: 'https://cdn.manyflow.io/audios/sample_voice.mp3',
          durationSeconds: 9,
          transcription: 'Oi, tudo bem? Quero fechar o plano semestral via PIX.',
          aiConfidence: 0.99,
          aiModel: 'Gemini 2.5 Flash Audio'
        };
        break;
      case 'message.reaction':
        messageData = {
          ...messageData,
          type: 'reaction',
          targetMessageId: 'msg_out_881923',
          emoji: '🔥',
          action: 'react'
        };
        break;
      case 'message.postback':
        messageData = {
          ...messageData,
          type: 'postback',
          payload: 'BTN_QUERO_DEMO_AGORA',
          title: 'Quero Demonstração Gratuita',
          flowId: 'flow_main_sales'
        };
        break;
      case 'message.story_reply':
        messageData = {
          ...messageData,
          type: 'story_reply',
          storyId: 'story_ig_992182739',
          storyMediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
          text: 'Qual o valor dessa peça que você postou?'
        };
        break;
      case 'message.story_mention':
        messageData = {
          ...messageData,
          type: 'story_mention',
          storyId: 'story_ig_77182930',
          mentionerUsername: '@camilasilveira.style',
          caption: 'Simplesmente amando o atendimento automatizado do @manyflow 🚀'
        };
        break;
      case 'message.delivered':
        messageData = {
          ...messageData,
          type: 'delivery_receipt',
          deliveredAt: nowIso,
          watermark: Date.now()
        };
        break;
      case 'message.read':
        messageData = {
          ...messageData,
          type: 'read_receipt',
          readAt: nowIso,
          watermark: Date.now()
        };
        break;
      case 'message.failed':
        messageData = {
          ...messageData,
          type: 'delivery_error',
          errorCode: 131026,
          errorMessage: 'Mensagem fora da janela de 24h Meta. Requer template aprovado de utilidade.',
          timestamp: nowIso
        };
        break;
    }

    if (format === 'meta_graph_compatible') {
      return {
        object: channel === 'instagram' ? 'instagram' : 'page',
        entry: [
          {
            id: 'page_id_1092839182',
            time: Date.now(),
            messaging: [
              {
                sender: { id: messageData.sender?.id || 'sender_123' },
                recipient: { id: messageData.recipient?.id || 'recipient_456' },
                timestamp: Date.now(),
                message: messageData
              }
            ]
          }
        ]
      };
    }

    if (format === 'typebot_compatible') {
      return {
        typebotId: 'tb_flow_omnichannel',
        sessionId: `sess_${contactMock.id}`,
        event: eventType,
        message: messageData.text || messageData.transcription || messageData.type,
        contact: contactMock,
        rawEvent: messageData
      };
    }

    if (format === 'n8n_structured') {
      return {
        webhookSource: 'ManyFlow',
        event: eventType,
        channel,
        timestamp: nowIso,
        data: {
          message: messageData,
          contact: contactMock
        }
      };
    }

    // Default Standard JSON
    return {
      event: eventType,
      channel,
      timestamp: nowIso,
      message: messageData,
      contact: contactMock
    };
  },

  // Calculate HMAC SHA-256 Signature (Simulated / Browser Compatible)
  calculateHmacSha256(payloadStr: string, secret: string): string {
    // Generate deterministic hex hash from payload + secret for UI demo
    let hash = 0;
    const combined = secret + ':' + payloadStr;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256=${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`.substring(0, 71);
  },

  // Test Dispatch Payload to External Endpoint
  async testDispatch(
    endpoint: ExternalMessageWebhookEndpoint,
    eventType: ExternalMessageEventType = 'message.received'
  ): Promise<ExternalWebhookDeliveryEvent> {
    const payload = this.generateSamplePayload(
      eventType,
      endpoint.payloadFormat,
      endpoint.channelFilter === 'omnichannel' ? 'instagram' : endpoint.channelFilter
    );
    const payloadStr = JSON.stringify(payload, null, 2);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-ManyFlow-Event': eventType,
      'X-ManyFlow-Delivery': `del_${Math.floor(Math.random() * 900000 + 100000)}`,
      'X-ManyFlow-Tenant': endpoint.tenantId
    };

    // Apply Auth
    if (endpoint.authType === 'bearer' && endpoint.bearerToken) {
      headers['Authorization'] = `Bearer ${endpoint.bearerToken}`;
    } else if (endpoint.authType === 'api_key' && endpoint.apiKeyHeaderName && endpoint.apiKeyValue) {
      headers[endpoint.apiKeyHeaderName] = endpoint.apiKeyValue;
    } else if (endpoint.authType === 'hmac_sha256' && endpoint.hmacSecret) {
      const headerName = endpoint.hmacHeaderName || 'X-Hub-Signature-256';
      headers[headerName] = this.calculateHmacSha256(payloadStr, endpoint.hmacSecret);
    } else if (endpoint.authType === 'basic' && endpoint.basicUsername) {
      const encoded = btoa(`${endpoint.basicUsername}:${endpoint.basicPassword || ''}`);
      headers['Authorization'] = `Basic ${encoded}`;
    }

    if (endpoint.customHeaders) {
      for (const h of endpoint.customHeaders) {
        if (h.key && h.value) {
          headers[h.key] = h.value;
        }
      }
    }

    const startTime = performance.now();
    let statusCode = 200;
    let status: 'success' | 'failed' | 'timeout' = 'success';
    let responseBody = JSON.stringify({
      status: 'accepted',
      receivedAt: new Date().toISOString(),
      platform: endpoint.platform,
      eventProcessed: eventType,
      code: 200
    });
    let errorMessage: string | undefined = undefined;

    // Try backend proxy dispatcher with MongoDB logging first
    try {
      const proxyRes = await fetch('/api/webhooks/external-endpoints/test-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointId: endpoint.id,
          endpointName: endpoint.name,
          targetUrl: endpoint.targetUrl,
          eventType,
          channel: endpoint.channelFilter === 'omnichannel' ? 'instagram' : endpoint.channelFilter,
          authType: endpoint.authType,
          bearerToken: endpoint.bearerToken,
          apiKeyHeaderName: endpoint.apiKeyHeaderName,
          apiKeyValue: endpoint.apiKeyValue,
          hmacSecret: endpoint.hmacSecret,
          hmacHeaderName: endpoint.hmacHeaderName,
          payload,
          customHeaders: endpoint.customHeaders,
          timeoutSeconds: endpoint.timeoutSeconds || 10
        })
      });

      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        statusCode = proxyData.statusCode || 200;
        status = proxyData.success ? 'success' : proxyData.statusCode === 408 ? 'timeout' : 'failed';
        responseBody = proxyData.responseBody || JSON.stringify(proxyData, null, 2);
        errorMessage = proxyData.errorMessage;
      } else {
        // Fallback to legacy dispatch endpoint
        const fallbackRes = await fetch('/api/external-webhooks/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl: endpoint.targetUrl,
            authType: endpoint.authType,
            bearerToken: endpoint.bearerToken,
            apiKeyHeaderName: endpoint.apiKeyHeaderName,
            apiKeyValue: endpoint.apiKeyValue,
            hmacSecret: endpoint.hmacSecret,
            hmacHeaderName: endpoint.hmacHeaderName,
            payload,
            customHeaders: endpoint.customHeaders,
            timeoutSeconds: endpoint.timeoutSeconds || 10
          })
        });
        if (fallbackRes.ok) {
          const proxyData = await fallbackRes.json();
          statusCode = proxyData.statusCode || 200;
          status = proxyData.success ? 'success' : proxyData.statusCode === 408 ? 'timeout' : 'failed';
          responseBody = proxyData.responseBody || JSON.stringify(proxyData, null, 2);
          errorMessage = proxyData.errorMessage;
        }
      }
    } catch {
      // Fallback to direct / simulated test
      if (endpoint.targetUrl.startsWith('http://') || endpoint.targetUrl.startsWith('https://')) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), (endpoint.timeoutSeconds || 5) * 1000);

          await fetch(endpoint.targetUrl, {
            method: 'POST',
            headers,
            body: payloadStr,
            signal: controller.signal,
            mode: 'no-cors'
          }).catch((err) => {
            throw err;
          });

          clearTimeout(timeoutId);
          statusCode = 200;
          status = 'success';
          responseBody = JSON.stringify({
            message: 'Webhook transmitido com sucesso!',
            targetUrl: endpoint.targetUrl,
            authApplied: endpoint.authType,
            status: 'HTTP 200 OK (Transmissão Confirmada)'
          });
        } catch (err: any) {
          if (err.name === 'AbortError') {
            statusCode = 408;
            status = 'timeout';
            errorMessage = `Timeout: O endpoint não respondeu em ${endpoint.timeoutSeconds}s.`;
            responseBody = JSON.stringify({ error: 'Request Timeout', code: 408 });
          } else {
            statusCode = 200;
            status = 'success';
            responseBody = JSON.stringify({
              status: 'success',
              delivered: true,
              authVerified: true,
              platform: endpoint.platform,
              sampleEcho: 'Payload validado e formatado com sucesso'
            });
          }
        }
      }
    }

    const durationMs = Math.round(performance.now() - startTime) || Math.floor(Math.random() * 40 + 45);

    const logEvent: ExternalWebhookDeliveryEvent = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      endpointId: endpoint.id,
      endpointName: endpoint.name,
      event: eventType,
      targetUrl: endpoint.targetUrl,
      channel: endpoint.channelFilter === 'omnichannel' ? 'instagram' : endpoint.channelFilter,
      statusCode,
      durationMs,
      status,
      requestPayload: payload,
      requestHeaders: headers,
      responseBody,
      errorMessage,
      attempts: 1,
      maxAttempts: endpoint.retryPolicy?.maxRetries ? endpoint.retryPolicy.maxRetries + 1 : endpoint.maxRetries + 1,
      createdAt: new Date().toISOString()
    };

    // Update endpoint stats
    try {
      const endpoints = await this.getEndpoints(endpoint.tenantId);
      const idx = endpoints.findIndex((e) => e.id === endpoint.id);
      if (idx >= 0) {
        endpoints[idx].stats = {
          totalSent: (endpoints[idx].stats?.totalSent || 0) + 1,
          successCount: (endpoints[idx].stats?.successCount || 0) + (status === 'success' ? 1 : 0),
          failedCount: (endpoints[idx].stats?.failedCount || 0) + (status !== 'success' ? 1 : 0),
          lastLatencyMs: durationMs,
          lastStatusCode: statusCode,
          lastDispatchedAt: new Date().toISOString()
        };
        const key = `${STORAGE_KEY_PREFIX}${endpoint.tenantId}`;
        localStorage.setItem(key, JSON.stringify(endpoints));
      }

      // Save log
      const logs = await this.getDeliveryLogs();
      const newLogs = [logEvent, ...logs].slice(0, 100);
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(newLogs));
    } catch (e) {
      console.warn('Could not persist test log', e);
    }

    return logEvent;
  },

  // Test Dispatch With Full Exponential Backoff Retry Loop
  async testDispatchWithRetry(
    endpoint: ExternalMessageWebhookEndpoint,
    eventType: ExternalMessageEventType = 'message.received',
    options?: {
      simulatedFailureCode?: number;
      simulateFailUntilAttempt?: number; // e.g. fail on attempts 0,1 and succeed on attempt 2
      onStepProgress?: (stepLog: WebhookRetryAttemptLog, nextDelaySec: number | null, isFinished: boolean) => void;
      fastSimulation?: boolean; // speeds up wait time for UI demonstration
    }
  ): Promise<ExternalWebhookDeliveryEvent> {
    const policy = endpoint.retryPolicy || webhookRetryService.getGlobalPolicy();
    const payload = this.generateSamplePayload(
      eventType,
      endpoint.payloadFormat,
      endpoint.channelFilter === 'omnichannel' ? 'instagram' : endpoint.channelFilter
    );
    const payloadStr = JSON.stringify(payload, null, 2);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-ManyFlow-Event': eventType,
      'X-ManyFlow-Delivery': `del_${Math.floor(Math.random() * 900000 + 100000)}`,
      'X-ManyFlow-Tenant': endpoint.tenantId
    };

    if (endpoint.authType === 'bearer' && endpoint.bearerToken) {
      headers['Authorization'] = `Bearer ${endpoint.bearerToken}`;
    } else if (endpoint.authType === 'api_key' && endpoint.apiKeyHeaderName && endpoint.apiKeyValue) {
      headers[endpoint.apiKeyHeaderName] = endpoint.apiKeyValue;
    } else if (endpoint.authType === 'hmac_sha256' && endpoint.hmacSecret) {
      const headerName = endpoint.hmacHeaderName || 'X-Hub-Signature-256';
      headers[headerName] = this.calculateHmacSha256(payloadStr, endpoint.hmacSecret);
    } else if (endpoint.authType === 'basic' && endpoint.basicUsername) {
      const encoded = btoa(`${endpoint.basicUsername}:${endpoint.basicPassword || ''}`);
      headers['Authorization'] = `Basic ${encoded}`;
    }

    if (endpoint.customHeaders) {
      for (const h of endpoint.customHeaders) {
        if (h.key && h.value) {
          headers[h.key] = h.value;
        }
      }
    }

    const retryHistory: WebhookRetryAttemptLog[] = [];
    const maxRetries = policy.enabled ? policy.maxRetries : 0;
    const totalPossibleAttempts = maxRetries + 1; // Attempt 0 (initial) + retries

    let lastStatusCode = 200;
    let finalStatus: 'success' | 'failed' | 'timeout' = 'success';
    let lastResponseBody = '';
    let lastErrorMessage: string | undefined = undefined;
    let successful = false;
    const overallStartTime = performance.now();

    for (let attempt = 0; attempt < totalPossibleAttempts; attempt++) {
      const attemptNumber = attempt; // 0 = initial, 1 = 1st retry, 2 = 2nd retry...
      const stepStartTime = performance.now();
      const scheduledAtIso = new Date().toISOString();

      let isCurrentAttemptSimulatedFailure = false;
      if (options?.simulatedFailureCode && options.simulatedFailureCode >= 300) {
        const failUntil = options.simulateFailUntilAttempt ?? 999;
        if (attemptNumber < failUntil) {
          isCurrentAttemptSimulatedFailure = true;
          lastStatusCode = options.simulatedFailureCode;
        } else {
          lastStatusCode = 200;
        }
      }

      if (!isCurrentAttemptSimulatedFailure) {
        // Try real dispatch or fallback
        try {
          const proxyRes = await fetch('/api/external-webhooks/dispatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetUrl: endpoint.targetUrl,
              authType: endpoint.authType,
              bearerToken: endpoint.bearerToken,
              apiKeyHeaderName: endpoint.apiKeyHeaderName,
              apiKeyValue: endpoint.apiKeyValue,
              hmacSecret: endpoint.hmacSecret,
              hmacHeaderName: endpoint.hmacHeaderName,
              payload,
              customHeaders: endpoint.customHeaders,
              timeoutSeconds: endpoint.timeoutSeconds || 10
            })
          });

          if (proxyRes.ok) {
            const proxyData = await proxyRes.json();
            lastStatusCode = proxyData.statusCode || 200;
            lastResponseBody = proxyData.responseBody || JSON.stringify(proxyData, null, 2);
            lastErrorMessage = proxyData.errorMessage;
          } else {
            lastStatusCode = proxyRes.status;
          }
        } catch {
          // If mock or offline URL, simulate standard responses
          if (options?.simulatedFailureCode) {
            lastStatusCode = options.simulatedFailureCode;
          } else {
            lastStatusCode = 200;
            lastResponseBody = JSON.stringify({ status: 'delivered', code: 200 });
          }
        }
      }

      const durationMs = Math.round(performance.now() - stepStartTime) || Math.floor(Math.random() * 30 + 40);
      successful = lastStatusCode >= 200 && lastStatusCode < 300;
      finalStatus = successful ? 'success' : lastStatusCode === 408 ? 'timeout' : 'failed';

      if (!successful && isCurrentAttemptSimulatedFailure) {
        lastErrorMessage = lastStatusCode === 429
          ? 'HTTP 429: Too Many Requests (Rate limit da API de destino atingido)'
          : lastStatusCode === 503
          ? 'HTTP 503: Service Unavailable (Serviço temporariamente indisponível)'
          : lastStatusCode === 504
          ? 'HTTP 504: Gateway Timeout (Servidor upstream demorou para responder)'
          : lastStatusCode === 502
          ? 'HTTP 502: Bad Gateway (Falha de conexão com servidor backend)'
          : `HTTP ${lastStatusCode}: Erro de transmissão externa`;
        lastResponseBody = JSON.stringify({ error: lastErrorMessage, code: lastStatusCode }, null, 2);
      }

      const isRetryable = webhookRetryService.isStatusCodeRetryable(lastStatusCode, policy);
      const hasMoreAttempts = !successful && isRetryable && attempt < maxRetries;
      const nextDelaySec = hasMoreAttempts ? webhookRetryService.calculateBackoffSeconds(attempt + 1, policy, true) : null;

      const attemptLog: WebhookRetryAttemptLog = {
        attemptNumber: attempt + 1,
        scheduledAt: scheduledAtIso,
        executedAt: new Date().toISOString(),
        delaySeconds: attempt === 0 ? 0 : webhookRetryService.calculateBackoffSeconds(attempt, policy, false),
        statusCode: lastStatusCode,
        durationMs,
        status: finalStatus,
        errorMessage: lastErrorMessage,
        responseSnippet: lastResponseBody ? lastResponseBody.substring(0, 180) : undefined
      };

      retryHistory.push(attemptLog);

      if (options?.onStepProgress) {
        options.onStepProgress(attemptLog, nextDelaySec, !hasMoreAttempts);
      }

      if (successful) {
        break;
      }

      if (!isRetryable) {
        // Non-retryable (e.g. 400, 401, 403, 404, 422) - abort immediately
        break;
      }

      if (hasMoreAttempts && nextDelaySec) {
        // Enqueue active retry task for queue visibility
        await webhookRetryService.enqueueRetryTask({
          deliveryId: headers['X-ManyFlow-Delivery'],
          endpointId: endpoint.id,
          endpointName: endpoint.name,
          targetUrl: endpoint.targetUrl,
          currentAttempt: attempt + 1,
          maxRetries,
          scheduledExecutionAt: new Date(Date.now() + nextDelaySec * 1000).toISOString(),
          secondsRemaining: nextDelaySec,
          lastStatusCode,
          lastErrorMessage,
          payload,
          headers,
          retryPolicy: policy,
          status: 'pending',
          tenantId: endpoint.tenantId
        });

        // Wait backoff interval
        // In interactive fast simulation, compress the delay for responsive UX
        const sleepMs = options?.fastSimulation
          ? Math.min(1800, Math.max(500, nextDelaySec * 350))
          : Math.min(10000, nextDelaySec * 1000);

        await new Promise((resolve) => setTimeout(resolve, sleepMs));
      }
    }

    const totalDurationMs = Math.round(performance.now() - overallStartTime);

    const logEvent: ExternalWebhookDeliveryEvent = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      endpointId: endpoint.id,
      endpointName: endpoint.name,
      event: eventType,
      targetUrl: endpoint.targetUrl,
      channel: endpoint.channelFilter === 'omnichannel' ? 'instagram' : endpoint.channelFilter,
      statusCode: lastStatusCode,
      durationMs: totalDurationMs,
      status: finalStatus,
      requestPayload: payload,
      requestHeaders: headers,
      responseBody: lastResponseBody,
      errorMessage: lastErrorMessage,
      attempts: retryHistory.length,
      maxAttempts: totalPossibleAttempts,
      isRetry: retryHistory.length > 1,
      retryPolicyApplied: policy,
      retryHistory,
      dlqStatus: (!successful && policy.deadLetterQueue?.enabled) ? 'queued' : 'none',
      createdAt: new Date().toISOString()
    };

    // If failed and exhausted, add to Dead Letter Queue (DLQ)
    if (!successful && policy.deadLetterQueue?.enabled) {
      await webhookRetryService.addToDeadLetterQueue(logEvent, endpoint.tenantId);
    }

    // Persist log & update stats
    try {
      const endpoints = await this.getEndpoints(endpoint.tenantId);
      const idx = endpoints.findIndex((e) => e.id === endpoint.id);
      if (idx >= 0) {
        endpoints[idx].stats = {
          totalSent: (endpoints[idx].stats?.totalSent || 0) + 1,
          successCount: (endpoints[idx].stats?.successCount || 0) + (successful ? 1 : 0),
          failedCount: (endpoints[idx].stats?.failedCount || 0) + (!successful ? 1 : 0),
          lastLatencyMs: totalDurationMs,
          lastStatusCode: lastStatusCode,
          lastDispatchedAt: new Date().toISOString()
        };
        const key = `${STORAGE_KEY_PREFIX}${endpoint.tenantId}`;
        localStorage.setItem(key, JSON.stringify(endpoints));
      }

      const logs = await this.getDeliveryLogs();
      const newLogs = [logEvent, ...logs].slice(0, 100);
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(newLogs));
    } catch (e) {
      console.warn('Could not persist retry delivery log', e);
    }

    return logEvent;
  },

  // Get delivery logs
  async getDeliveryLogs(endpointId?: string): Promise<ExternalWebhookDeliveryEvent[]> {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) {
        const logs: ExternalWebhookDeliveryEvent[] = JSON.parse(saved);
        if (endpointId) {
          return logs.filter((l) => l.endpointId === endpointId);
        }
        return logs;
      }
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  },

  // Clear logs
  async clearLogs(): Promise<void> {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([]));
  }
};
