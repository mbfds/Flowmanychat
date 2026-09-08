import { User, Tenant, AuthSession } from '../types';

const TOKEN_KEY = 'manyflow_auth_token';
const USER_KEY = 'manyflow_auth_user';
const TENANT_KEY = 'manyflow_auth_tenant';

export const DEFAULT_USER: User = {
  id: 'usr_admin_01',
  name: 'Administrador',
  email: 'admin@manyflow.io',
  role: 'super_admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  tenantId: 'tenant_main',
  allowedTenants: ['tenant_main'],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const DEFAULT_TENANT: Tenant = {
  id: 'tenant_main',
  name: 'Workspace Principal',
  slug: 'principal',
  plan: 'enterprise',
  maxContacts: 100000,
  maxFlows: 500,
  maxUsers: 50,
  ownerId: 'usr_admin_01',
  isActive: true,
  domains: [],
  branding: {
    brandName: 'ManyFlow',
    primaryColor: '#0084FF'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setSession(token: string, user: User, tenant: Tenant) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TENANT_KEY, JSON.stringify(tenant));
    try {
      if (typeof document !== 'undefined') {
        document.cookie = `manyflow_token=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
      }
    } catch {
      // Ignored in non-browser environments
    }
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TENANT_KEY);
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'manyflow_token=; path=/; max-age=0; SameSite=Lax';
      }
    } catch {
      // Ignored
    }
  },

  getLocalUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getLocalTenant(): Tenant | null {
    try {
      const stored = localStorage.getItem(TENANT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  async login(email: string, password?: string): Promise<{ success: boolean; token?: string; user?: User; tenant?: Tenant; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setSession(data.token, data.user, data.tenant);
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao conectar com o servidor' };
    }
  },

  async register(name: string, email: string, password?: string, workspaceName?: string): Promise<{ success: boolean; token?: string; user?: User; tenant?: Tenant; error?: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, workspaceName }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setSession(data.token, data.user, data.tenant);
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao cadastrar usuário' };
    }
  },

  async getMe(): Promise<{ success: boolean; user?: User; tenant?: Tenant }> {
    try {
      const token = this.getToken();
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async getUsers(tenantId?: string): Promise<User[]> {
    try {
      const res = await fetch(`/api/auth/users?tenantId=${encodeURIComponent(tenantId || 'tenant_main')}`);
      const data = await res.json();
      return data.users || [];
    } catch {
      return [];
    }
  },

  async inviteUser(user: { name: string; email: string; role: string; tenantId: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async resetPassword(email: string, code?: string, newPassword?: string): Promise<{ success: boolean; message?: string; demoCode?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao processar redefinição' };
    }
  },

  async updateProfile(data: { id: string; name?: string; avatarUrl?: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        const storedTenant = this.getLocalTenant();
        const storedToken = this.getToken();
        if (storedToken && storedTenant) {
          this.setSession(storedToken, resData.user, storedTenant);
        }
      }
      return resData;
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao atualizar perfil' };
    }
  },

  async updateUser(userId: string, data: { name?: string; role?: string; isActive?: boolean }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch(`/api/auth/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao atualizar usuário' };
    }
  },

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/auth/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao remover usuário' };
    }
  },

  // --- MASTER SECURITY METHODS ---
  async getMasterStatus(): Promise<{
    success: boolean;
    isConfigured: boolean;
    isLockdownActive: boolean;
    masterAdminEmail: string;
    updatedAt: string;
    hasCustomPassword: boolean;
    totalAuditLogs: number;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/auth/master-status');
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        isConfigured: true,
        isLockdownActive: false,
        masterAdminEmail: 'admin@manyflow.com',
        updatedAt: new Date().toISOString(),
        hasCustomPassword: false,
        totalAuditLogs: 0,
        error: err.message
      };
    }
  },

  async updateMasterPassword(currentMasterPassword: string, newMasterPassword: string, masterAdminEmail?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/master-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentMasterPassword, newMasterPassword, masterAdminEmail }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao atualizar Senha Master' };
    }
  },

  async loginWithMasterPassword(masterPassword: string, targetTenantId?: string): Promise<{ success: boolean; token?: string; user?: User; tenant?: Tenant; error?: string }> {
    try {
      const res = await fetch('/api/auth/master-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterPassword, targetTenantId }),
      });
      const data = await res.json();
      if (data.success && data.token && data.user && data.tenant) {
        this.setSession(data.token, data.user, data.tenant);
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao autenticar com Senha Master' };
    }
  },

  async toggleLockdown(enabled: boolean, masterPassword: string): Promise<{ success: boolean; isLockdownActive?: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/master-lockdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, masterPassword }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao alterar modo Lockdown' };
    }
  },

  async getMasterLogs(): Promise<{ success: boolean; logs?: any[]; error?: string }> {
    try {
      const res = await fetch('/api/auth/master-logs');
      return await res.json();
    } catch (err: any) {
      return { success: false, logs: [], error: err.message };
    }
  }
};

// Automatic cookie synchronization for browser sessions
if (typeof document !== 'undefined') {
  try {
    const existingToken = localStorage.getItem(TOKEN_KEY);
    if (existingToken && !document.cookie.includes('manyflow_token=')) {
      document.cookie = `manyflow_token=${encodeURIComponent(existingToken)}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
    }
  } catch {
    // Ignore
  }
}

