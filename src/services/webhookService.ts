import { 
  WebhookSettingsState, 
  MetaWebhookEventLog, 
  WebhookStatsSummary,
  WebhookAutomationRouteResult,
  WebhookDeliveryLog
} from '../types';

export interface SimulateMetaEventParams {
  scenario: 'keyword_pricing' | 'keyword_discount' | 'button_click' | 'post_comment' | 'lead_ad' | 'general_dm';
  channel: 'instagram' | 'messenger';
  customText?: string;
}

export interface SimulateMetaEventResponse {
  success: boolean;
  scenario: string;
  payload: any;
  signature: {
    isValid: boolean;
    calculatedSignature: string;
    reason?: string;
  };
  routing: WebhookAutomationRouteResult;
}

export interface SignatureValidationResult {
  success: boolean;
  isValid: boolean;
  calculatedSignature: string;
  reason?: string;
}

export const webhookService = {
  // 1. Fetch Webhook Configuration from MongoDB
  async getConfig(): Promise<WebhookSettingsState | null> {
    try {
      const response = await fetch('/api/webhooks/config');
      if (!response.ok) return null;
      const data = await response.json();
      return data.config || null;
    } catch (error) {
      console.error('[webhookService] Error fetching config:', error);
      return null;
    }
  },

  // 2. Save Webhook Configuration to MongoDB
  async saveConfig(config: WebhookSettingsState): Promise<boolean> {
    try {
      const response = await fetch('/api/webhooks/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      return response.ok;
    } catch (error) {
      console.error('[webhookService] Error saving config:', error);
      return false;
    }
  },

  // 3. Test Meta Verification Handshake (GET /api/webhooks/meta-receive?hub.mode=subscribe&hub.challenge=xyz)
  async testVerificationHandshake(verifyToken: string): Promise<{ success: boolean; challenge?: string; status: number; error?: string }> {
    const testChallenge = `challenge_${Math.random().toString(36).substring(2, 9)}`;
    const url = `/api/webhooks/meta-receive?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=${encodeURIComponent(testChallenge)}`;

    try {
      const startTime = performance.now();
      const res = await fetch(url);
      const text = await res.text();
      const duration = Math.round(performance.now() - startTime);

      if (res.ok && text.trim() === testChallenge) {
        return { success: true, challenge: text, status: res.status };
      } else {
        return { success: false, status: res.status, error: text || 'Falha no handshake de validação do token' };
      }
    } catch (error: any) {
      return { success: false, status: 0, error: error.message };
    }
  },

  // 4. Simulate Live Meta Webhook Inbound Event & Flow Routing
  async simulateEvent(params: SimulateMetaEventParams): Promise<SimulateMetaEventResponse> {
    const response = await fetch('/api/webhooks/simulate-meta-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Falha ao simular disparo do Webhook: ${errorText}`);
    }

    return await response.json();
  },

  // 5. Query Received Events Stream from MongoDB
  async getEvents(filters?: { 
    channel?: string; 
    eventType?: string; 
    status?: string; 
    signature?: string; 
    search?: string; 
    limit?: number; 
    skip?: number 
  }): Promise<{ events: MetaWebhookEventLog[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.channel && filters.channel !== 'all') params.set('channel', filters.channel);
      if (filters?.eventType && filters.eventType !== 'all') params.set('eventType', filters.eventType);
      if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters?.signature && filters.signature !== 'all') params.set('signature', filters.signature);
      if (filters?.search && filters.search.trim()) params.set('search', filters.search.trim());
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.skip) params.set('skip', String(filters.skip));

      const response = await fetch(`/api/webhooks/events?${params.toString()}`);
      if (!response.ok) return { events: [], total: 0 };
      const data = await response.json();
      return { events: data.events || [], total: data.total || 0 };
    } catch (error) {
      console.error('[webhookService] Error fetching events:', error);
      return { events: [], total: 0 };
    }
  },

  // 5.1 Replay Webhook Event
  async replayEvent(eventId: string, payload?: any, channel?: string): Promise<{ success: boolean; message: string; routing?: WebhookAutomationRouteResult }> {
    try {
      const response = await fetch('/api/webhooks/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, payload, channel }),
      });
      return await response.json();
    } catch (error: any) {
      console.error('[webhookService] Error replaying event:', error);
      return { success: false, message: error.message };
    }
  },

  // 6. Query Webhook Performance & Routing Statistics
  async getStats(): Promise<WebhookStatsSummary> {
    try {
      const response = await fetch('/api/webhooks/stats');
      if (!response.ok) throw new Error('Falha ao obter métricas');
      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('[webhookService] Error fetching stats:', error);
      return {
        totalReceived: 0,
        totalVerified: 0,
        totalAutomated: 0,
        avgLatencyMs: 0,
        successRatePercent: 100,
        byEventType: {},
        byRoutedType: {},
        byChannel: { instagram: 0, messenger: 0 },
      };
    }
  },

  // 7. Validate HMAC SHA256 Signature
  async validateSignature(payload: any, signatureHeader?: string, appSecret?: string): Promise<SignatureValidationResult> {
    const response = await fetch('/api/webhooks/validate-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, signatureHeader, appSecret }),
    });
    return await response.json();
  },

  // 8. Clear Webhook Events History
  async clearEvents(): Promise<number> {
    try {
      const response = await fetch('/api/webhooks/events', { method: 'DELETE' });
      if (!response.ok) return 0;
      const data = await response.json();
      return data.deletedCount || 0;
    } catch (error) {
      console.error('[webhookService] Error clearing events:', error);
      return 0;
    }
  },

  // 9. Fetch Webhook Delivery History (Requests & HTTP Status Codes)
  async fetchDeliveries(params?: {
    statusGroup?: string;
    statusCode?: string | number;
    channel?: string;
    event?: string;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ deliveries: WebhookDeliveryLog[]; total: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.statusGroup && params.statusGroup !== 'all') query.append('statusGroup', params.statusGroup);
      if (params?.statusCode && params.statusCode !== 'all') query.append('statusCode', String(params.statusCode));
      if (params?.channel && params.channel !== 'all') query.append('channel', params.channel);
      if (params?.event && params.event !== 'all') query.append('event', params.event);
      if (params?.search) query.append('search', params.search);
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.skip) query.append('skip', String(params.skip));

      const response = await fetch(`/api/webhooks/deliveries?${query.toString()}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      return {
        deliveries: data.deliveries || [],
        total: data.total || 0,
      };
    } catch (error) {
      console.error('[webhookService] Error fetching deliveries:', error);
      return { deliveries: [], total: 0 };
    }
  },

  // 10. Retry / Re-dispatch a Specific Delivery
  async retryDelivery(logId: string, simulatedStatus?: number): Promise<{ success: boolean; message: string; newLog?: WebhookDeliveryLog }> {
    try {
      const response = await fetch('/api/webhooks/deliveries/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, simulatedStatus }),
      });
      return await response.json();
    } catch (error: any) {
      console.error('[webhookService] Error retrying delivery:', error);
      return { success: false, message: error.message };
    }
  },

  // 11. Clear Webhook Delivery History
  async clearDeliveries(): Promise<number> {
    try {
      const response = await fetch('/api/webhooks/deliveries', { method: 'DELETE' });
      if (!response.ok) return 0;
      const data = await response.json();
      return data.deletedCount || 0;
    } catch (error) {
      console.error('[webhookService] Error clearing deliveries:', error);
      return 0;
    }
  },

  // 12. Fetch Delivery Summary Stats
  async fetchDeliveryStats(): Promise<{
    total: number;
    s2xx: number;
    s4xx: number;
    s5xx: number;
    avgLatencyMs: number;
    successRate: number;
  }> {
    try {
      const response = await fetch('/api/webhooks/deliveries/stats');
      if (!response.ok) throw new Error('Stats request failed');
      const data = await response.json();
      return data.stats || { total: 0, s2xx: 0, s4xx: 0, s5xx: 0, avgLatencyMs: 0, successRate: 100 };
    } catch (error) {
      console.error('[webhookService] Error fetching delivery stats:', error);
      return { total: 0, s2xx: 0, s4xx: 0, s5xx: 0, avgLatencyMs: 0, successRate: 100 };
    }
  },

  // 13. Test Dispatch / Outbound Webhook Ping with HMAC calculation
  async testDispatch(params: {
    endpointUrl: string;
    eventType: string;
    channel: string;
    customPayload?: any;
    customHeaders?: Record<string, string>;
    authType?: 'none' | 'bearer' | 'api_key' | 'custom';
    bearerToken?: string;
    apiKeyHeaderName?: string;
    apiKeyValue?: string;
    secretToken?: string;
    secretKey?: string;
    endpointName?: string;
    timeoutSeconds?: number;
  }): Promise<{
    success: boolean;
    statusCode: number;
    durationMs: number;
    responseBody: string;
    log: WebhookDeliveryLog;
    requestHeaders?: Record<string, string>;
    requestPayload?: any;
    calculatedHmac?: string;
    hasRealHmac?: boolean;
    secretProvided?: boolean;
  }> {
    const response = await fetch('/api/webhooks/test-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await response.json();
  },

  // 14. Comprehensive Meta Webhook Connection Test (Verify Token Handshake + App Secret HMAC validation)
  async testMetaWebhookConnection(verifyToken: string, appSecret?: string): Promise<{
    success: boolean;
    handshakeSuccess: boolean;
    secretValid: boolean;
    statusCode: number;
    latencyMs: number;
    challenge?: string;
    details: string;
    testedAt: string;
    hmacSignature?: string;
  }> {
    const startTime = performance.now();
    const testChallenge = `challenge_${Math.random().toString(36).substring(2, 9)}`;
    const handshakeUrl = `/api/webhooks/meta-receive?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=${encodeURIComponent(testChallenge)}`;

    try {
      const res = await fetch(handshakeUrl);
      const text = await res.text();
      const latencyMs = Math.round(performance.now() - startTime);
      const handshakeSuccess = res.ok && text.trim() === testChallenge;

      let secretValid = true;
      let hmacSignature: string | undefined;

      // If appSecret is provided, test HMAC calculation
      if (appSecret && appSecret.trim().length > 0) {
        try {
          const testPayload = JSON.stringify({ object: 'instagram', entry: [{ time: Date.now(), id: 'meta_test_ping' }] });
          const sigRes = await fetch('/api/webhooks/sign-payload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: testPayload, secret: appSecret.trim() })
          });
          if (sigRes.ok) {
            const sigData = await sigRes.json();
            hmacSignature = sigData.signature;
            secretValid = Boolean(sigData.signature && sigData.signature.startsWith('sha256='));
          }
        } catch {
          secretValid = true;
        }
      }

      const overallSuccess = handshakeSuccess && secretValid;

      return {
        success: overallSuccess,
        handshakeSuccess,
        secretValid,
        statusCode: res.status,
        latencyMs,
        challenge: text,
        details: overallSuccess
          ? `Conexão validada com sucesso! O endpoint respondeu com HTTP 200 e confirmou o challenge retornado da Meta.`
          : !handshakeSuccess
          ? `Falha no handshake: o token '${verifyToken}' não foi validado pelo endpoint (HTTP ${res.status}). Salve as alterações para persistir o novo token antes de testar.`
          : `Falha na chave App Secret.`,
        testedAt: new Date().toISOString(),
        hmacSignature
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        handshakeSuccess: false,
        secretValid: false,
        statusCode: 0,
        latencyMs,
        details: `Erro de rede ou servidor inacessível: ${err.message || 'Falha ao conectar'}`,
        testedAt: new Date().toISOString()
      };
    }
  }
};
