import { MetaRateLimitDashboardData } from '../types';

class FacebookRateLimitService {
  private baseUrl = '/api/meta/rate-limits';

  async getDashboardData(): Promise<MetaRateLimitDashboardData> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Falha ao buscar métricas de rate limit`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('[FacebookRateLimitService] Erro ao carregar dados:', error);
      throw error;
    }
  }

  async pingGraphApi(accessToken?: string): Promise<{
    success: boolean;
    latency_ms: number;
    trace_id: string;
    status: number;
    timestamp: string;
    headers: {
      'x-app-usage': string;
      'x-fb-trace-id': string;
      'facebook-api-version': string;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Falha no ping da Graph API`);
    }
    return response.json();
  }

  async simulateBurst(targetPercent: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/simulate-burst`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetPercent }),
    });
    return response.json();
  }

  async toggleProtection(settings: {
    automaticThrottling?: boolean;
    adaptiveBackoff?: boolean;
    batchOptimization?: boolean;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/toggle-protection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return response.json();
  }

  async resetLimits(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/reset`, {
      method: 'POST',
    });
    return response.json();
  }
}

export const facebookRateLimitService = new FacebookRateLimitService();
export default facebookRateLimitService;
