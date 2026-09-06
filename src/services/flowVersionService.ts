import { FlowVersion, FlowNode, FlowConnection } from '../types';

const LOCAL_STORAGE_KEY_PREFIX = 'manyflow_flow_versions_';

/**
 * Retrieves saved snapshots/versions for a flow from MongoDB with localStorage fallback.
 */
export async function fetchFlowVersions(flowId: string): Promise<FlowVersion[]> {
  try {
    const res = await fetch(`/api/flows/${encodeURIComponent(flowId)}/versions`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.versions) && data.versions.length > 0) {
        // Cache in localStorage as backup
        try {
          localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${flowId}`, JSON.stringify(data.versions));
        } catch {}
        return data.versions;
      }
    }
  } catch (err) {
    console.warn('[flowVersionService] Erro ao consultar MongoDB, recorrendo ao cache local:', err);
  }

  // Fallback to local storage
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${flowId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}

  return [];
}

/**
 * Saves a new snapshot of nodes and connections to MongoDB.
 */
export async function saveFlowSnapshot(
  flowId: string,
  payload: {
    name: string;
    description?: string;
    nodes: FlowNode[];
    connections: FlowConnection[];
    isAutoSave?: boolean;
    createdBy?: string;
  }
): Promise<{ success: boolean; version?: FlowVersion; error?: string; source?: string }> {
  try {
    const res = await fetch(`/api/flows/${encodeURIComponent(flowId)}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.version) {
        // Update local cache
        updateLocalCacheWithNewVersion(flowId, data.version);
        return { success: true, version: data.version, source: data.source || 'mongodb' };
      }
    }
  } catch (err: any) {
    console.warn('[flowVersionService] Falha na requisição para MongoDB, salvando localmente:', err);
  }

  // Fallback local snapshot creation
  const fallbackVersion: FlowVersion = {
    id: `ver_local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    flowId,
    name: payload.name || `Versão Local ${new Date().toLocaleTimeString('pt-BR')}`,
    description: payload.description || 'Snapshot salvo localmente no navegador',
    nodes: payload.nodes,
    connections: payload.connections,
    nodeCount: payload.nodes.length,
    connectionCount: payload.connections.length,
    isAutoSave: Boolean(payload.isAutoSave),
    createdBy: payload.createdBy || 'Usuário ManyFlow',
    createdAt: new Date().toISOString(),
    source: 'local',
  };

  updateLocalCacheWithNewVersion(flowId, fallbackVersion);
  return { success: true, version: fallbackVersion, source: 'local' };
}

/**
 * Restores a snapshot of nodes and connections from MongoDB or local cache.
 */
export async function restoreFlowVersion(
  flowId: string,
  versionId: string
): Promise<{ success: boolean; version?: FlowVersion; error?: string }> {
  try {
    const res = await fetch(`/api/flows/${encodeURIComponent(flowId)}/versions/${encodeURIComponent(versionId)}/restore`, {
      method: 'POST',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.restoredVersion) {
        return { success: true, version: data.restoredVersion };
      }
    }
  } catch (err) {
    console.warn('[flowVersionService] Erro ao restaurar via MongoDB API:', err);
  }

  // Fallback to local storage lookup
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${flowId}`);
    if (cached) {
      const list: FlowVersion[] = JSON.parse(cached);
      const found = list.find((v) => v.id === versionId);
      if (found) {
        return { success: true, version: found };
      }
    }
  } catch {}

  return { success: false, error: 'Versão não encontrada para restauração.' };
}

/**
 * Deletes a snapshot.
 */
export async function deleteFlowVersion(flowId: string, versionId: string): Promise<boolean> {
  try {
    await fetch(`/api/flows/${encodeURIComponent(flowId)}/versions/${encodeURIComponent(versionId)}`, {
      method: 'DELETE',
    });
  } catch {}

  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${flowId}`);
    if (cached) {
      const list: FlowVersion[] = JSON.parse(cached);
      const filtered = list.filter((v) => v.id !== versionId);
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${flowId}`, JSON.stringify(filtered));
    }
  } catch {}

  return true;
}

function updateLocalCacheWithNewVersion(flowId: string, newVersion: FlowVersion) {
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${flowId}`);
    const list: FlowVersion[] = cached ? JSON.parse(cached) : [];
    const updated = [newVersion, ...list.filter((v) => v.id !== newVersion.id)];
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${flowId}`, JSON.stringify(updated));
  } catch {}
}
