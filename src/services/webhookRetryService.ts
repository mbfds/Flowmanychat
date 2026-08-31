import {
  WebhookRetryPolicy,
  WebhookRetryStepInfo,
  WebhookRetryAttemptLog,
  WebhookRetryQueueItem,
  WebhookDeadLetterItem,
  ExternalMessageWebhookEndpoint,
  ExternalWebhookDeliveryEvent,
  ExternalMessageEventType
} from '../types';

const GLOBAL_POLICY_STORAGE_KEY = 'manyflow_webhook_default_retry_policy';
const DLQ_STORAGE_KEY = 'manyflow_webhook_dead_letter_queue';
const RETRY_QUEUE_STORAGE_KEY = 'manyflow_webhook_retry_queue';

export const DEFAULT_RETRY_POLICY: WebhookRetryPolicy = {
  enabled: true,
  maxRetries: 4,
  initialIntervalSeconds: 2,
  multiplier: 2.0,
  maxIntervalSeconds: 300,
  strategy: 'exponential_jitter',
  enableJitter: true,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524],
  nonRetryableStatusCodes: [400, 401, 403, 404, 405, 410, 422],
  deadLetterQueue: {
    enabled: true,
    notifyOnExhausted: true,
    autoPurgeDays: 14
  }
};

export const RETRY_POLICY_PRESETS: Record<string, { name: string; description: string; policy: WebhookRetryPolicy }> = {
  recommended: {
    name: 'Equilibrado (Recomendado)',
    description: '4 tentativas com backoff exponencial 2x e Jitter. Ideal para a maioria das APIs e CRMs.',
    policy: {
      enabled: true,
      maxRetries: 4,
      initialIntervalSeconds: 2,
      multiplier: 2.0,
      maxIntervalSeconds: 300,
      strategy: 'exponential_jitter',
      enableJitter: true,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524],
      nonRetryableStatusCodes: [400, 401, 403, 404, 405, 410, 422],
      deadLetterQueue: { enabled: true, notifyOnExhausted: true, autoPurgeDays: 14 }
    }
  },
  aggressive: {
    name: 'Agressivo (Rápida Recuperação)',
    description: 'Intervalos curtos (1s, 1.5s, 2.2s) para microsserviços internos de alta prioridade.',
    policy: {
      enabled: true,
      maxRetries: 3,
      initialIntervalSeconds: 1,
      multiplier: 1.5,
      maxIntervalSeconds: 30,
      strategy: 'exponential',
      enableJitter: false,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      nonRetryableStatusCodes: [400, 401, 403, 404, 422],
      deadLetterQueue: { enabled: true, notifyOnExhausted: true, autoPurgeDays: 7 }
    }
  },
  conservative: {
    name: 'Conservador / Anti-Sobrecarga',
    description: 'Maior espaçamento (10s, 20s, 40s, 80s) para não sobrecarregar servidores de terceiros instáveis.',
    policy: {
      enabled: true,
      maxRetries: 5,
      initialIntervalSeconds: 10,
      multiplier: 2.0,
      maxIntervalSeconds: 1800,
      strategy: 'exponential_jitter',
      enableJitter: true,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524],
      nonRetryableStatusCodes: [400, 401, 403, 404, 405, 410, 422],
      deadLetterQueue: { enabled: true, notifyOnExhausted: true, autoPurgeDays: 30 }
    }
  },
  fibonacci: {
    name: 'Sequência Fibonacci',
    description: 'Intervalos baseados na série de Fibonacci (1s, 2s, 3s, 5s, 8s, 13s) com curva de crescimento suave.',
    policy: {
      enabled: true,
      maxRetries: 5,
      initialIntervalSeconds: 1,
      multiplier: 1.618,
      maxIntervalSeconds: 600,
      strategy: 'fibonacci',
      enableJitter: true,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      nonRetryableStatusCodes: [400, 401, 403, 404, 422],
      deadLetterQueue: { enabled: true, notifyOnExhausted: true, autoPurgeDays: 14 }
    }
  }
};

const FIBONACCI_SERIES = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

export const webhookRetryService = {
  // Get global default policy
  getGlobalPolicy(): WebhookRetryPolicy {
    try {
      const saved = localStorage.getItem(GLOBAL_POLICY_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_RETRY_POLICY, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse global retry policy', e);
    }
    return DEFAULT_RETRY_POLICY;
  },

  // Save global default policy
  saveGlobalPolicy(policy: WebhookRetryPolicy): void {
    localStorage.setItem(GLOBAL_POLICY_STORAGE_KEY, JSON.stringify(policy));
  },

  // Calculate backoff seconds for a specific attempt (attempt 1 = 1st retry)
  calculateBackoffSeconds(
    attemptNumber: number,
    policy: WebhookRetryPolicy = DEFAULT_RETRY_POLICY,
    applyJitter = true
  ): number {
    if (attemptNumber <= 0) return 0;

    const t0 = Math.max(0.5, policy.initialIntervalSeconds || 2);
    const multiplier = Math.max(1.0, policy.multiplier || 2.0);
    const maxT = Math.max(t0, policy.maxIntervalSeconds || 300);

    let rawDelay = t0;

    switch (policy.strategy) {
      case 'fixed':
        rawDelay = t0;
        break;
      case 'linear':
        rawDelay = t0 * attemptNumber;
        break;
      case 'fibonacci': {
        const fibIndex = Math.min(attemptNumber - 1, FIBONACCI_SERIES.length - 1);
        rawDelay = t0 * FIBONACCI_SERIES[fibIndex];
        break;
      }
      case 'exponential':
      case 'exponential_jitter':
      default:
        // T = T0 * (multiplier ^ (attempt - 1))
        rawDelay = t0 * Math.pow(multiplier, attemptNumber - 1);
        break;
    }

    // Cap at max interval
    rawDelay = Math.min(rawDelay, maxT);

    // Apply Jitter if enabled
    if (applyJitter && (policy.enableJitter || policy.strategy === 'exponential_jitter')) {
      // Full Jitter: Uniform between 50% and 100% of rawDelay to preserve minimum floor
      const jitterFactor = 0.65 + Math.random() * 0.35;
      rawDelay = Math.max(0.5, Number((rawDelay * jitterFactor).toFixed(1)));
    } else {
      rawDelay = Number(rawDelay.toFixed(1));
    }

    return rawDelay;
  },

  // Generate full schedule projection for UI preview
  calculateSchedule(policy: WebhookRetryPolicy = DEFAULT_RETRY_POLICY): WebhookRetryStepInfo[] {
    const steps: WebhookRetryStepInfo[] = [];
    let cumulative = 0;
    const now = Date.now();

    // Step 0: Immediate attempt
    steps.push({
      attempt: 0,
      delaySeconds: 0,
      cumulativeWaitSeconds: 0,
      scheduledAtEstimateIso: new Date(now).toISOString(),
      description: 'Envio Inicial (Imediato)'
    });

    for (let i = 1; i <= policy.maxRetries; i++) {
      // Nominal delay without random jitter for schedule table
      const delay = this.calculateBackoffSeconds(i, policy, false);
      cumulative += delay;
      steps.push({
        attempt: i,
        delaySeconds: delay,
        cumulativeWaitSeconds: Math.round(cumulative * 10) / 10,
        scheduledAtEstimateIso: new Date(now + cumulative * 1000).toISOString(),
        description: `Retentativa #${i} (Esperar +${delay}s)`
      });
    }

    return steps;
  },

  // Check if an HTTP status code is retryable according to policy
  isStatusCodeRetryable(statusCode: number, policy: WebhookRetryPolicy = DEFAULT_RETRY_POLICY): boolean {
    if (!policy.enabled) return false;

    // Explicit non-retryable check
    if (policy.nonRetryableStatusCodes?.includes(statusCode)) {
      return false;
    }

    // Success codes (2xx) do not retry
    if (statusCode >= 200 && statusCode < 300) {
      return false;
    }

    // Explicit retryable list
    if (policy.retryableStatusCodes?.includes(statusCode)) {
      return true;
    }

    // Default network / timeout / 5xx error rules
    if (statusCode === 0 || statusCode === 408 || statusCode === 429 || (statusCode >= 500 && statusCode <= 599)) {
      return true;
    }

    return false;
  },

  // Add failed delivery event to Dead Letter Queue
  async addToDeadLetterQueue(
    event: ExternalWebhookDeliveryEvent,
    tenantId: string
  ): Promise<WebhookDeadLetterItem> {
    const dlqItem: WebhookDeadLetterItem = {
      id: `dlq_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      deliveryId: event.id,
      endpointId: event.endpointId,
      endpointName: event.endpointName,
      targetUrl: event.targetUrl,
      event: event.event,
      channel: event.channel,
      totalAttempts: event.attempts || 1,
      lastStatusCode: event.statusCode,
      lastErrorMessage: event.errorMessage || `Falha após ${event.attempts} tentativas esgotadas.`,
      payload: event.requestPayload,
      headers: event.requestHeaders || {},
      retryHistory: event.retryHistory || [],
      failedAt: new Date().toISOString(),
      status: 'queued',
      tenantId: tenantId || 'tenant_main'
    };

    try {
      const existing = await this.getDeadLetterQueue(tenantId);
      const updated = [dlqItem, ...existing].slice(0, 200);
      localStorage.setItem(DLQ_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to DLQ', e);
    }

    return dlqItem;
  },

  // Get DLQ items
  async getDeadLetterQueue(tenantId?: string): Promise<WebhookDeadLetterItem[]> {
    try {
      const raw = localStorage.getItem(DLQ_STORAGE_KEY);
      if (raw) {
        const items: WebhookDeadLetterItem[] = JSON.parse(raw);
        if (tenantId) {
          return items.filter((i) => !i.tenantId || i.tenantId === tenantId);
        }
        return items;
      }
    } catch (e) {
      console.warn('Error reading DLQ', e);
    }
    return [];
  },

  // Clear DLQ
  async clearDeadLetterQueue(): Promise<void> {
    localStorage.setItem(DLQ_STORAGE_KEY, JSON.stringify([]));
  },

  // Mark DLQ item as reprocessed
  async markDlqReprocessed(dlqId: string): Promise<boolean> {
    try {
      const items = await this.getDeadLetterQueue();
      const idx = items.findIndex((i) => i.id === dlqId);
      if (idx >= 0) {
        items[idx].status = 'reprocessed';
        items[idx].reprocessedAt = new Date().toISOString();
        localStorage.setItem(DLQ_STORAGE_KEY, JSON.stringify(items));
        return true;
      }
    } catch (e) {
      console.warn('Failed to mark DLQ reprocessed', e);
    }
    return false;
  },

  // Delete single DLQ item
  async deleteDlqItem(dlqId: string): Promise<void> {
    const items = await this.getDeadLetterQueue();
    const filtered = items.filter((i) => i.id !== dlqId);
    localStorage.setItem(DLQ_STORAGE_KEY, JSON.stringify(filtered));
  },

  // Get active retry queue items
  async getRetryQueue(tenantId?: string): Promise<WebhookRetryQueueItem[]> {
    try {
      const raw = localStorage.getItem(RETRY_QUEUE_STORAGE_KEY);
      if (raw) {
        const items: WebhookRetryQueueItem[] = JSON.parse(raw);
        const now = Date.now();
        // Compute seconds remaining in real time
        const processed = items.map((item) => {
          const targetTime = new Date(item.scheduledExecutionAt).getTime();
          const remaining = Math.max(0, Math.round((targetTime - now) / 1000));
          return { ...item, secondsRemaining: remaining };
        });

        if (tenantId) {
          return processed.filter((i) => !i.tenantId || i.tenantId === tenantId);
        }
        return processed;
      }
    } catch (e) {
      console.warn('Error reading retry queue', e);
    }
    return [];
  },

  // Add task to retry queue
  async enqueueRetryTask(task: Omit<WebhookRetryQueueItem, 'id' | 'createdAt'>): Promise<WebhookRetryQueueItem> {
    const queueItem: WebhookRetryQueueItem = {
      ...task,
      id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };

    try {
      const queue = await this.getRetryQueue();
      const updated = [queueItem, ...queue.filter((q) => q.deliveryId !== task.deliveryId)].slice(0, 100);
      localStorage.setItem(RETRY_QUEUE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to enqueue retry task', e);
    }

    return queueItem;
  },

  // Remove task from retry queue
  async dequeueRetryTask(taskId: string): Promise<void> {
    const queue = await this.getRetryQueue();
    const filtered = queue.filter((q) => q.id !== taskId);
    localStorage.setItem(RETRY_QUEUE_STORAGE_KEY, JSON.stringify(filtered));
  }
};
