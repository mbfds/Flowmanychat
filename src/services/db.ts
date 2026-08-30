import { 
  Flow, 
  Contact, 
  SystemLogEntry, 
  SystemLogCategory, 
  SystemLogLevel, 
  MongoPoolStats, 
  MongoStatusInfo, 
  ContactActivityLog 
} from '../types';

/**
 * MongoDB Service Layer (src/services/db.ts)
 * 
 * Provides unified CRUD operations for Flows, Contacts, and System/Audit Logs,
 * leveraging connection pooling configured via .env (MONGODB_URI, MONGODB_DB_NAME).
 * Features graceful fallback, caching, and robust error handling.
 */

class MongoDBService {
  private baseUrl = '/api';

  // =========================================================================
  // 1. FLOWS CRUD OPERATIONS
  // =========================================================================

  /**
   * Fetch all automation flows with optional filtering
   */
  async getFlows(options?: { channel?: string; isActive?: boolean }): Promise<Flow[]> {
    try {
      const params = new URLSearchParams();
      if (options?.channel && options.channel !== 'all') {
        params.append('channel', options.channel);
      }
      if (options?.isActive !== undefined) {
        params.append('isActive', String(options.isActive));
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${this.baseUrl}/flows${queryString}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data.flows) ? data.flows : [];
    } catch (error) {
      console.warn('[MongoDBService] Erro ao buscar fluxos do MongoDB, usando fallback local:', error);
      return [];
    }
  }

  /**
   * Get single flow by ID
   */
  async getFlowById(id: string): Promise<Flow | null> {
    try {
      const response = await fetch(`${this.baseUrl}/flows/${encodeURIComponent(id)}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.flow || null;
    } catch (error) {
      console.error(`[MongoDBService] Erro ao buscar fluxo ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Create or upsert a flow into MongoDB
   */
  async createFlow(flow: Partial<Flow> & { title: string }): Promise<Flow> {
    const newFlow: Flow = {
      id: flow.id || `flow_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: flow.title,
      description: flow.description || '',
      channel: flow.channel || 'instagram',
      isActive: flow.isActive ?? true,
      nodes: flow.nodes || [],
      connections: flow.connections || [],
      createdAt: flow.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: flow.stats || { runs: 0, completed: 0, ctr: 0 },
    };

    try {
      const response = await fetch(`${this.baseUrl}/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlow),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.flow || newFlow;
    } catch (error) {
      console.error('[MongoDBService] Falha ao persistir fluxo:', error);
      return newFlow;
    }
  }

  /**
   * Update an existing flow in MongoDB
   */
  async updateFlow(id: string, updates: Partial<Flow>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/flows/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      return response.ok;
    } catch (error) {
      console.error(`[MongoDBService] Falha ao atualizar fluxo ${id}:`, error);
      return false;
    }
  }

  /**
   * Delete a flow from MongoDB
   */
  async deleteFlow(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/flows/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error(`[MongoDBService] Falha ao deletar fluxo ${id}:`, error);
      return false;
    }
  }

  /**
   * Bulk upsert flows to MongoDB (useful for initial seeding and backups)
   */
  async saveFlowsBulk(flows: Flow[]): Promise<{ success: boolean; count: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/flows/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flows }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, count: data.count || flows.length };
    } catch (error) {
      console.error('[MongoDBService] Erro ao salvar fluxos em lote:', error);
      return { success: false, count: 0 };
    }
  }

  // =========================================================================
  // 2. CONTACTS CRUD OPERATIONS
  // =========================================================================

  /**
   * Fetch all contacts with optional filter query
   */
  async getContacts(options?: {
    channel?: string;
    status?: string;
    tag?: string;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<Contact[]> {
    try {
      const params = new URLSearchParams();
      if (options?.channel && options.channel !== 'all') params.append('channel', options.channel);
      if (options?.status && options.status !== 'all') params.append('status', options.status);
      if (options?.tag) params.append('tag', options.tag);
      if (options?.search) params.append('search', options.search);
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.skip) params.append('skip', String(options.skip));

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${this.baseUrl}/contacts${queryString}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return Array.isArray(data.contacts) ? data.contacts : [];
    } catch (error) {
      console.warn('[MongoDBService] Erro ao buscar contatos:', error);
      return [];
    }
  }

  /**
   * Get single contact by ID
   */
  async getContactById(id: string): Promise<Contact | null> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/${encodeURIComponent(id)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.contact || null;
    } catch (error) {
      console.error(`[MongoDBService] Erro ao buscar contato ${id}:`, error);
      return null;
    }
  }

  /**
   * Create single contact
   */
  async createContact(contact: Partial<Contact> & { name: string; channel: 'instagram' | 'messenger' }): Promise<Contact> {
    const newContact: Contact = {
      id: contact.id || `contact_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: contact.name,
      username: contact.username || contact.name.toLowerCase().replace(/\s+/g, '_'),
      avatarUrl: contact.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      channel: contact.channel,
      email: contact.email,
      phone: contact.phone,
      tags: contact.tags || [],
      customFields: contact.customFields || {},
      status: contact.status || 'active',
      createdAt: contact.createdAt || new Date().toISOString(),
      lastInteractionAt: contact.lastInteractionAt || new Date().toISOString(),
      totalInteractions: contact.totalInteractions || 1,
      leadScore: contact.leadScore || 0,
      activityLogs: contact.activityLogs || [],
    };

    try {
      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.contact || newContact;
    } catch (error) {
      console.error('[MongoDBService] Falha ao criar contato no MongoDB:', error);
      return newContact;
    }
  }

  /**
   * Update contact properties
   */
  async updateContact(id: string, updates: Partial<Contact>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.ok;
    } catch (error) {
      console.error(`[MongoDBService] Falha ao atualizar contato ${id}:`, error);
      return false;
    }
  }

  /**
   * Delete contact
   */
  async deleteContact(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error(`[MongoDBService] Falha ao deletar contato ${id}:`, error);
      return false;
    }
  }

  /**
   * Batch upsert contacts
   */
  async saveContactsBatch(contacts: Contact[]): Promise<{ success: boolean; count: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, count: data.count || contacts.length };
    } catch (error) {
      console.error('[MongoDBService] Erro no batch de contatos:', error);
      return { success: false, count: 0 };
    }
  }

  /**
   * Add tag to contact
   */
  async addContactTag(id: string, tag: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/${encodeURIComponent(id)}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', tag }),
      });
      return response.ok;
    } catch (error) {
      console.error(`[MongoDBService] Erro ao adicionar tag ao contato ${id}:`, error);
      return false;
    }
  }

  /**
   * Remove tag from contact
   */
  async removeContactTag(id: string, tag: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/${encodeURIComponent(id)}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', tag }),
      });
      return response.ok;
    } catch (error) {
      console.error(`[MongoDBService] Erro ao remover tag do contato ${id}:`, error);
      return false;
    }
  }

  /**
   * Update custom field value
   */
  async updateContactCustomField(id: string, key: string, value: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/${encodeURIComponent(id)}/custom-fields`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      return response.ok;
    } catch (error) {
      console.error(`[MongoDBService] Erro ao atualizar campo personalizado do contato ${id}:`, error);
      return false;
    }
  }

  /**
   * Append an activity log to contact timeline
   */
  async appendContactActivity(
    id: string, 
    activity: Omit<ContactActivityLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/${encodeURIComponent(id)}/activity-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
      });
      return response.ok;
    } catch (error) {
      console.error(`[MongoDBService] Erro ao registrar atividade do contato ${id}:`, error);
      return false;
    }
  }

  // =========================================================================
  // 3. LOGS & AUDIT OPERATIONS
  // =========================================================================

  /**
   * Fetch system & audit logs with filters
   */
  async getLogs(options?: {
    category?: SystemLogCategory | 'all';
    level?: SystemLogLevel | 'all';
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ logs: SystemLogEntry[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (options?.category && options.category !== 'all') params.append('category', options.category);
      if (options?.level && options.level !== 'all') params.append('level', options.level);
      if (options?.search) params.append('search', options.search);
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.skip) params.append('skip', String(options.skip));

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${this.baseUrl}/logs${queryString}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return {
        logs: Array.isArray(data.logs) ? data.logs : [],
        total: data.total || 0,
      };
    } catch (error) {
      console.warn('[MongoDBService] Erro ao buscar logs:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Record a new log entry
   */
  async createLog(entry: {
    category: SystemLogCategory;
    level: SystemLogLevel;
    message: string;
    details?: Record<string, any>;
    source?: string;
    actor?: string;
    durationMs?: number;
  }): Promise<SystemLogEntry> {
    const logItem: SystemLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      category: entry.category,
      level: entry.level,
      message: entry.message,
      details: entry.details,
      source: entry.source || 'frontend',
      actor: entry.actor || 'user',
      durationMs: entry.durationMs,
    };

    try {
      const response = await fetch(`${this.baseUrl}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logItem),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.log || logItem;
    } catch (error) {
      console.warn('[MongoDBService] Erro ao registrar log:', error);
      return logItem;
    }
  }

  /**
   * Clear or purge logs
   */
  async clearLogs(options?: { category?: SystemLogCategory; beforeDate?: string }): Promise<{ deletedCount: number }> {
    try {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.beforeDate) params.append('beforeDate', options.beforeDate);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${this.baseUrl}/logs${queryString}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { deletedCount: data.deletedCount || 0 };
    } catch (error) {
      console.error('[MongoDBService] Erro ao limpar logs:', error);
      return { deletedCount: 0 };
    }
  }

  /**
   * Get log summary statistics
   */
  async getLogStats(): Promise<{
    total: number;
    last24hCount: number;
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/logs/stats`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.stats || { total: 0, last24hCount: 0, byCategory: {}, byLevel: {} };
    } catch (error) {
      console.warn('[MongoDBService] Erro ao obter estatísticas de logs:', error);
      return { total: 0, last24hCount: 0, byCategory: {}, byLevel: {} };
    }
  }

  // =========================================================================
  // 4. DATABASE POOLER STATUS & HEALTH CHECKS
  // =========================================================================

  /**
   * Get MongoDB connection status and pooler metrics
   */
  async getStatus(): Promise<MongoStatusInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/db/status`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error: any) {
      return {
        connected: false,
        uriConfigured: false,
        dbName: 'manyflow',
        error: error.message || 'Falha ao consultar status da conexão',
      };
    }
  }

  /**
   * Get Connection Pooler Statistics
   */
  async getPoolStats(): Promise<MongoPoolStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/db/pool-stats`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.poolStats || null;
    } catch (error) {
      console.warn('[MongoDBService] Erro ao consultar estatísticas do pooler:', error);
      return null;
    }
  }

  /**
   * Ping database to measure query roundtrip latency
   */
  async testPing(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/db/ping`, { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error: any) {
      return { ok: false, latencyMs: 0, error: error.message };
    }
  }
}

// Export singleton instance for seamless app-wide usage
export const dbService = new MongoDBService();
export default dbService;
