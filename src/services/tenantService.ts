import { Tenant, TenantDomain, ProductionAuditReport } from '../types';

export const tenantService = {
  async resolveHost(): Promise<{ success: boolean; host: string; tenant: Tenant }> {
    try {
      const res = await fetch('/api/domains/resolve-host');
      return await res.json();
    } catch (err) {
      return {
        success: false,
        host: window.location.hostname,
        tenant: {
          id: 'tenant_main',
          name: 'ManyFlow',
          slug: 'manyflow',
          domains: [],
          branding: { brandName: 'ManyFlow', primaryColor: '#0084FF' },
          ownerId: 'usr_admin_default',
          maxUsers: 50,
          maxFlows: 200,
          maxContacts: 500000,
          plan: 'whitelabel',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
  },

  async getTenants(): Promise<Tenant[]> {
    try {
      const res = await fetch('/api/tenants');
      const data = await res.json();
      return data.tenants || [];
    } catch {
      return [];
    }
  },

  async createTenant(tenantData: Partial<Tenant>): Promise<{ success: boolean; tenant?: Tenant; error?: string }> {
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<{ success: boolean; tenant?: Tenant; error?: string }> {
    try {
      const res = await fetch(`/api/tenants/${encodeURIComponent(tenantId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getDomains(): Promise<TenantDomain[]> {
    try {
      const res = await fetch('/api/domains');
      const data = await res.json();
      return data.domains || [];
    } catch {
      return [];
    }
  },

  async registerDomain(domain: string, tenantId: string, isPrimary = false): Promise<{ success: boolean; domain?: TenantDomain; error?: string }> {
    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, tenantId, isPrimary }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async verifyDomain(domainId: string): Promise<{ success: boolean; domain?: TenantDomain; message?: string; error?: string }> {
    try {
      const res = await fetch(`/api/domains/${encodeURIComponent(domainId)}/verify`, {
        method: 'POST',
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteDomain(domainId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/domains/${encodeURIComponent(domainId)}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getProductionAudit(): Promise<ProductionAuditReport | null> {
    try {
      const res = await fetch('/api/production/audit');
      return await res.json();
    } catch (err) {
      return null;
    }
  }
};
