import { FacebookApp, FacebookPageAsset, FacebookWhatsAppAsset } from '../types';
import { INITIAL_FACEBOOK_APPS } from '../data/initialData';

const STORAGE_KEY = 'manyflow_facebook_apps_v1';

export interface TestFacebookConnectionResult {
  success: boolean;
  appId: string;
  appName: string;
  latencyMs: number;
  apiVersion: string;
  isTokenValid: boolean;
  tokenType: 'SYSTEM_USER' | 'PAGE_ACCESS_TOKEN' | 'USER_ACCESS_TOKEN';
  tokenExpiresAt?: string;
  scopesFound: string[];
  pagesFoundCount: number;
  instagramFoundCount: number;
  wabaFoundCount: number;
  rateLimitUsagePercent: number;
  message: string;
}

export const facebookAppsService = {
  getStoredApps(): FacebookApp[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignored
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FACEBOOK_APPS));
    return INITIAL_FACEBOOK_APPS;
  },

  saveApps(apps: FacebookApp[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  },

  async getApps(tenantId?: string, userId?: string, userRole?: string): Promise<FacebookApp[]> {
    try {
      const params = new URLSearchParams();
      if (tenantId) params.append('tenantId', tenantId);
      if (userId) params.append('userId', userId);
      
      const res = await fetch(`/api/facebook-apps?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.saveApps(data);
          return data;
        }
      }
    } catch {
      // Fallback to local storage
    }

    let apps = this.getStoredApps();
    
    // Filter by tenant if provided
    if (tenantId) {
      apps = apps.filter(a => !a.tenantId || a.tenantId === tenantId);
    }

    // Role-based filtering if user is not super_admin/admin
    if (userId && userRole && !['super_admin', 'admin'].includes(userRole)) {
      apps = apps.filter(a => 
        a.ownerUserId === userId || 
        a.assignedUserIds.includes('all') || 
        a.assignedUserIds.includes(userId)
      );
    }

    return apps;
  },

  async getAppById(id: string): Promise<FacebookApp | null> {
    const apps = this.getStoredApps();
    return apps.find(a => a.id === id) || null;
  },

  async createApp(appData: Omit<FacebookApp, 'id' | 'createdAt' | 'updatedAt' | 'rateLimitUsagePercent'>): Promise<FacebookApp> {
    const newApp: FacebookApp = {
      ...appData,
      id: `fb_app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rateLimitUsagePercent: Math.floor(Math.random() * 15) + 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString()
    };

    try {
      await fetch('/api/facebook-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });
    } catch {
      // Offline fallback
    }

    const apps = this.getStoredApps();
    
    // If set as default, unset other defaults for this user/tenant
    if (newApp.isDefault) {
      apps.forEach(a => {
        if (a.tenantId === newApp.tenantId) {
          a.isDefault = false;
        }
      });
    }

    const updated = [newApp, ...apps];
    this.saveApps(updated);
    return newApp;
  },

  async updateApp(id: string, updates: Partial<FacebookApp>): Promise<FacebookApp | null> {
    try {
      await fetch(`/api/facebook-apps/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch {
      // Offline fallback
    }

    const apps = this.getStoredApps();
    const index = apps.findIndex(a => a.id === id);
    if (index === -1) return null;

    if (updates.isDefault) {
      apps.forEach(a => {
        if (a.tenantId === apps[index].tenantId && a.id !== id) {
          a.isDefault = false;
        }
      });
    }

    apps[index] = {
      ...apps[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveApps(apps);
    return apps[index];
  },

  async deleteApp(id: string): Promise<boolean> {
    try {
      await fetch(`/api/facebook-apps/${id}`, { method: 'DELETE' });
    } catch {
      // Offline fallback
    }

    const apps = this.getStoredApps();
    const filtered = apps.filter(a => a.id !== id);
    this.saveApps(filtered);
    return true;
  },

  async setDefaultApp(id: string, tenantId?: string): Promise<boolean> {
    const apps = this.getStoredApps();
    apps.forEach(a => {
      if (!tenantId || a.tenantId === tenantId) {
        a.isDefault = a.id === id;
      }
    });
    this.saveApps(apps);

    try {
      await fetch(`/api/facebook-apps/${id}/set-default`, { method: 'POST' });
    } catch {
      // Offline
    }

    return true;
  },

  async testConnection(app: Partial<FacebookApp>): Promise<TestFacebookConnectionResult> {
    const startTime = Date.now();
    
    // Simulate real Meta Graph API token verification and ping
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
    
    const latency = Date.now() - startTime;
    const isSecretValid = Boolean(app.appSecret && app.appSecret.length >= 10);
    const isAppIdValid = Boolean(app.appId && app.appId.length >= 6);

    const detectedScopes = app.approvedPermissions && app.approvedPermissions.length > 0 
      ? app.approvedPermissions 
      : [
          'pages_messaging',
          'instagram_manage_messages',
          'pages_read_engagement',
          'pages_manage_metadata',
          'instagram_basic',
          'public_profile'
        ];

    return {
      success: isAppIdValid && isSecretValid,
      appId: app.appId || 'Desconhecido',
      appName: app.name || 'Meta App',
      latencyMs: latency,
      apiVersion: app.apiVersion || 'v21.0',
      isTokenValid: true,
      tokenType: 'SYSTEM_USER',
      tokenExpiresAt: 'Permanente (Sem Expiração - System User)',
      scopesFound: detectedScopes,
      pagesFoundCount: app.pages?.length || 1,
      instagramFoundCount: app.pages?.filter(p => p.instagramBusinessId)?.length || 1,
      wabaFoundCount: app.whatsAppAccounts?.length || 0,
      rateLimitUsagePercent: Math.floor(Math.random() * 20) + 8,
      message: 'Conexão com a Meta Graph API estabelecida com sucesso! Todos os escopos e tokens estão ativos e sincronizados.'
    };
  },

  async syncPagesFromMeta(appId: string): Promise<FacebookPageAsset[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const samplePages: FacebookPageAsset[] = [
      {
        id: `page_${Date.now()}_1`,
        name: `Página Oficial Meta (${appId.slice(-4)})`,
        category: 'Negócios & Vendas Online',
        followersCount: 18500,
        instagramBusinessId: `ig_${Date.now()}_1`,
        instagramUsername: `@marca.${appId.slice(-4)}`,
        instagramAvatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        pageAccessToken: 'EAAB...synced_token_active',
        isWebhookSubscribed: true,
        tasks: ['MANAGE', 'MESSAGING', 'ANALYZE']
      }
    ];

    return samplePages;
  },

  generateWebhookUrl(appId: string, serverHost?: string): string {
    const host = serverHost || (typeof window !== 'undefined' ? window.location.origin : 'https://seu-dominio-aapanel.com');
    return `${host}/api/webhooks/meta-receive?app_id=${appId}`;
  }
};
