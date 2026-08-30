import { User, Tenant, AuthSession } from '../types';

const TOKEN_KEY = 'manyflow_auth_token';
const USER_KEY = 'manyflow_auth_user';
const TENANT_KEY = 'manyflow_auth_tenant';

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setSession(token: string, user: User, tenant: Tenant) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TENANT_KEY, JSON.stringify(tenant));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TENANT_KEY);
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
  }
};
