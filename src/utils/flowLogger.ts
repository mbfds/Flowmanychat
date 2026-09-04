import { Flow } from '../types';

export interface FlowLogEntry {
  id: string;
  timestamp: string;
  isoTimestamp: string;
  action: 'FLOW_CREATED' | 'FLOW_UPDATED' | 'FLOW_DELETED' | 'FLOW_SYNCED' | 'FLOW_SYNC_FAILED';
  flowId: string;
  flowTitle: string;
  channel: string;
  nodesCount: number;
  connectionsCount: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

// In-memory debug log history for production inspection
const inMemoryLogs: FlowLogEntry[] = [];
const MAX_LOG_HISTORY = 100;

function formatTimestamp(): { display: string; iso: string } {
  const now = new Date();
  const iso = now.toISOString();
  const timeStr = now.toLocaleTimeString('pt-BR', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    fractionalSecondDigits: 3 
  });
  const dateStr = now.toLocaleDateString('pt-BR');
  return {
    display: `${dateStr} ${timeStr}`,
    iso
  };
}

function pushToHistory(entry: FlowLogEntry) {
  inMemoryLogs.unshift(entry);
  if (inMemoryLogs.length > MAX_LOG_HISTORY) {
    inMemoryLogs.pop();
  }

  // Expose on global window object for quick browser DevTools access in production
  if (typeof window !== 'undefined') {
    (window as any).__MANYFLOW_FLOW_LOGS__ = inMemoryLogs;
    (window as any).__getFlowLogs = () => inMemoryLogs;
  }
}

/**
 * Console logging system for Flow operations in ManyFlow
 * Specifically records updates and creations for debugging in production.
 */
export const flowLogger = {
  /**
   * Log when a flow is updated (handleUpdateFlow)
   */
  logUpdate(flowId: string, updatedFlow: Flow, metadata?: Record<string, any>) {
    const { display, iso } = formatTimestamp();
    const entry: FlowLogEntry = {
      id: `flog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: display,
      isoTimestamp: iso,
      action: 'FLOW_UPDATED',
      flowId,
      flowTitle: updatedFlow.title || 'Sem título',
      channel: updatedFlow.channel || 'instagram',
      nodesCount: updatedFlow.nodes?.length || 0,
      connectionsCount: updatedFlow.connections?.length || 0,
      isActive: updatedFlow.isActive ?? true,
      metadata: {
        nodeTypes: updatedFlow.nodes?.map(n => n.type) || [],
        updatedAt: updatedFlow.updatedAt || iso,
        ...metadata
      }
    };

    pushToHistory(entry);

    // Formatted production console output with CSS styling for fast scannability
    console.groupCollapsed(
      `%c[ManyFlow:FlowLogger] %c[${display}] %cFLOW_UPDATED %cID: ${flowId}`,
      'background: #1E293B; color: #38BDF8; font-weight: bold; padding: 2px 5px; border-radius: 4px;',
      'color: #64748B; font-weight: normal;',
      'background: #0284C7; color: #FFFFFF; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
      'color: #0F172A; font-weight: 600; font-family: monospace;'
    );
    console.log('📌 Timestamp:', iso);
    console.log('🆔 Flow ID:', flowId);
    console.log('🏷️ Título:', updatedFlow.title);
    console.log('📡 Canal:', updatedFlow.channel);
    console.log('🧩 Nós:', `${updatedFlow.nodes?.length || 0} nós cadastrados`, updatedFlow.nodes);
    console.log('🔗 Conexões:', `${updatedFlow.connections?.length || 0} ligações`, updatedFlow.connections);
    console.log('⚙️ Estado Ativo:', updatedFlow.isActive);
    if (metadata) {
      console.log('🔍 Metadados Adicionais:', metadata);
    }
    console.log('📦 Snapshot Completo do Fluxo:', updatedFlow);
    console.groupEnd();

    return entry;
  },

  /**
   * Log when a new flow is created (handleCreateNewFlow)
   */
  logCreate(flowId: string, newFlow: Flow, metadata?: Record<string, any>) {
    const { display, iso } = formatTimestamp();
    const entry: FlowLogEntry = {
      id: `flog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: display,
      isoTimestamp: iso,
      action: 'FLOW_CREATED',
      flowId,
      flowTitle: newFlow.title || 'Novo Fluxo',
      channel: newFlow.channel || 'instagram',
      nodesCount: newFlow.nodes?.length || 0,
      connectionsCount: newFlow.connections?.length || 0,
      isActive: newFlow.isActive ?? true,
      metadata: {
        createdAt: newFlow.createdAt || iso,
        initialNodes: newFlow.nodes?.map(n => n.type) || [],
        ...metadata
      }
    };

    pushToHistory(entry);

    // Formatted production console output
    console.groupCollapsed(
      `%c[ManyFlow:FlowLogger] %c[${display}] %cFLOW_CREATED %cID: ${flowId}`,
      'background: #1E293B; color: #38BDF8; font-weight: bold; padding: 2px 5px; border-radius: 4px;',
      'color: #64748B; font-weight: normal;',
      'background: #10B981; color: #FFFFFF; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
      'color: #0F172A; font-weight: 600; font-family: monospace;'
    );
    console.log('📌 Timestamp:', iso);
    console.log('🆔 Novo Flow ID:', flowId);
    console.log('🏷️ Título:', newFlow.title);
    console.log('📡 Canal:', newFlow.channel);
    console.log('🧩 Nós Iniciais:', `${newFlow.nodes?.length || 0} nós`, newFlow.nodes);
    console.log('🔗 Conexões Iniciais:', `${newFlow.connections?.length || 0} ligações`, newFlow.connections);
    if (metadata) {
      console.log('🔍 Metadados de Criação:', metadata);
    }
    console.log('📦 Snapshot Inicial do Fluxo:', newFlow);
    console.groupEnd();

    return entry;
  },

  /**
   * Log asynchronous sync results to database
   */
  logSyncResult(flowId: string, action: 'create' | 'update', success: boolean, error?: any, durationMs?: number) {
    const { display, iso } = formatTimestamp();
    if (success) {
      console.log(
        `%c[ManyFlow:FlowLogger] %c[${display}] %cSYNC_SUCCESS %cID: ${flowId} (${action}) ${durationMs !== undefined ? `[${durationMs}ms]` : ''}`,
        'background: #1E293B; color: #38BDF8; font-weight: bold; padding: 2px 5px; border-radius: 4px;',
        'color: #64748B;',
        'background: #059669; color: #FFFFFF; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
        'color: #0F172A; font-family: monospace;'
      );
    } else {
      console.warn(
        `%c[ManyFlow:FlowLogger] %c[${display}] %cSYNC_FAILED %cID: ${flowId} (${action})`,
        'background: #1E293B; color: #38BDF8; font-weight: bold; padding: 2px 5px; border-radius: 4px;',
        'color: #64748B;',
        'background: #DC2626; color: #FFFFFF; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
        'color: #DC2626; font-family: monospace;',
        error
      );
    }
  },

  /**
   * Get all in-memory logged entries
   */
  getHistory(): FlowLogEntry[] {
    return [...inMemoryLogs];
  },

  /**
   * Clear in-memory history
   */
  clearHistory() {
    inMemoryLogs.length = 0;
  }
};

export default flowLogger;
