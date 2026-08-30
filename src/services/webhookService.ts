import { 
  WebhookSettingsState, 
  MetaWebhookEventLog, 
  WebhookStatsSummary,
  WebhookAutomationRouteResult
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
  async getEvents(filters?: { channel?: string; eventType?: string; limit?: number; skip?: number }): Promise<{ events: MetaWebhookEventLog[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.channel && filters.channel !== 'all') params.set('channel', filters.channel);
      if (filters?.eventType && filters.eventType !== 'all') params.set('eventType', filters.eventType);
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
  }
};
