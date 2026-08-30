import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant, TenantDomain } from '../types';
import { authService } from '../services/authService';
import { tenantService } from '../services/tenantService';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  tenants: Tenant[];
  domains: TenantDomain[];
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, workspaceName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshDomains: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getLocalUser());
  const [tenant, setTenant] = useState<Tenant | null>(authService.getLocalTenant());
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshDomains = async () => {
    try {
      const doms = await tenantService.getDomains();
      setDomains(doms);
    } catch {
      // Ignored
    }
  };

  const refreshSession = async () => {
    try {
      // 1. Resolve active tenant by current domain
      const hostRes = await tenantService.resolveHost();
      if (hostRes?.tenant) {
        setTenant(hostRes.tenant);
      }

      // 2. Check user session
      const meRes = await authService.getMe();
      if (meRes?.success && meRes.user) {
        setUser(meRes.user);
        if (meRes.tenant) {
          setTenant(meRes.tenant);
        }
      }

      // 3. Fetch all tenants
      const allTenants = await tenantService.getTenants();
      setTenants(allTenants);

      // 4. Fetch all domains
      await refreshDomains();
    } catch (err) {
      console.warn('[AuthContext] Session init error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    const res = await authService.login(email, password);
    setIsLoading(false);

    if (res.success && res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      if (res.tenant) setTenant(res.tenant);
      await refreshSession();
      return { success: true };
    }
    return { success: false, error: res.error || 'Credenciais inválidas' };
  };

  const register = async (name: string, email: string, password?: string, workspaceName?: string) => {
    setIsLoading(true);
    const res = await authService.register(name, email, password, workspaceName);
    setIsLoading(false);

    if (res.success && res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      if (res.tenant) setTenant(res.tenant);
      await refreshSession();
      return { success: true };
    }
    return { success: false, error: res.error || 'Erro ao registrar' };
  };

  const logout = () => {
    authService.clearSession();
    setUser(null);
    setToken(null);
  };

  const switchTenant = async (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (target) {
      setTenant(target);
      if (user) {
        const updatedUser = { ...user, tenantId };
        setUser(updatedUser);
        if (token) {
          authService.setSession(token, updatedUser, target);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        tenants,
        domains,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        switchTenant,
        refreshSession,
        refreshDomains,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
