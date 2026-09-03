import { Flow, FlowNode, FlowConnection, ChannelType, NodeType } from '../types';

export interface ExportedFlowPackage {
  schemaVersion: '1.0';
  app: 'ManyFlow';
  exportedAt: string;
  flow: Flow;
  templateMetadata: {
    totalNodes: number;
    nodeTypesCount: Record<string, number>;
    totalConnections: number;
    primaryChannel: ChannelType;
    estimatedRunDuration?: string;
  };
}

export interface FlowValidationResult {
  success: boolean;
  flow?: Flow;
  metadata?: {
    totalNodes: number;
    nodeTypesCount: Record<string, number>;
    totalConnections: number;
    primaryChannel: ChannelType;
    exportedAt?: string;
    schemaVersion?: string;
  };
  warnings?: string[];
  error?: string;
}

/**
 * Builds an export package for an individual flow with metadata.
 */
export function createFlowExportPackage(flow: Flow): ExportedFlowPackage {
  const nodeTypesCount: Record<string, number> = {};
  flow.nodes.forEach((n) => {
    nodeTypesCount[n.type] = (nodeTypesCount[n.type] || 0) + 1;
  });

  return {
    schemaVersion: '1.0',
    app: 'ManyFlow',
    exportedAt: new Date().toISOString(),
    flow: {
      ...flow,
      updatedAt: new Date().toISOString()
    },
    templateMetadata: {
      totalNodes: flow.nodes.length,
      nodeTypesCount,
      totalConnections: flow.connections.length,
      primaryChannel: flow.channel
    }
  };
}

/**
 * Downloads an individual flow as a formatted JSON file.
 */
export function downloadFlowAsJson(flow: Flow): void {
  const pkg = createFlowExportPackage(flow);
  const jsonStr = JSON.stringify(pkg, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const cleanTitle = flow.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'fluxo_automacao';

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `flow_${cleanTitle}_${flow.channel}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Copies the flow JSON to the user's clipboard.
 */
export async function copyFlowJsonToClipboard(flow: Flow): Promise<boolean> {
  try {
    const pkg = createFlowExportPackage(flow);
    const jsonStr = JSON.stringify(pkg, null, 2);
    await navigator.clipboard.writeText(jsonStr);
    return true;
  } catch (err) {
    console.warn('[flowTemplateService] Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Validates and parses raw text into a valid Flow object.
 * Supports both standalone Flow JSON, ExportedFlowPackage, and template formats.
 */
export function parseAndValidateFlowJson(rawJson: string): FlowValidationResult {
  if (!rawJson || typeof rawJson !== 'string') {
    return { success: false, error: 'O conteúdo fornecido está vazio ou não é um texto válido.' };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (parseError: any) {
    return { 
      success: false, 
      error: `Erro ao decodificar JSON: ${parseError?.message || 'Sintaxe inválida'}. Certifique-se de que o arquivo é um JSON bem formatado.` 
    };
  }

  // Check if it's wrapped in an ExportedFlowPackage or similar
  let targetFlow: any = parsed;
  let packageMetadata: any = parsed.templateMetadata;
  const warnings: string[] = [];

  if (parsed.flow && typeof parsed.flow === 'object') {
    targetFlow = parsed.flow;
  } else if (parsed.template && typeof parsed.template === 'object') {
    targetFlow = parsed.template;
  } else if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].nodes) {
    targetFlow = parsed[0];
    warnings.push('O arquivo continha uma lista de fluxos. O primeiro fluxo foi selecionado para importação.');
  }

  if (!targetFlow || typeof targetFlow !== 'object') {
    return { success: false, error: 'Estrutura de fluxo não encontrada no JSON.' };
  }

  // Validate nodes array
  if (!Array.isArray(targetFlow.nodes)) {
    return { 
      success: false, 
      error: 'O JSON não contém um conjunto válido de nós ("nodes"). Verifique se o arquivo é um template de fluxo do ManyFlow.' 
    };
  }

  // Validate and sanitize nodes
  const sanitizedNodes: FlowNode[] = [];
  const validNodeTypes: NodeType[] = ['trigger', 'message', 'condition', 'action', 'ai_step', 'delay', 'ab_split'];

  for (let i = 0; i < targetFlow.nodes.length; i++) {
    const rawNode = targetFlow.nodes[i];
    if (!rawNode || typeof rawNode !== 'object') continue;

    const nodeId = rawNode.id || `node_imported_${Date.now()}_${i}`;
    const rawType: NodeType = validNodeTypes.includes(rawNode.type) ? rawNode.type : 'message';
    
    const nodePosition = {
      x: typeof rawNode.position?.x === 'number' ? rawNode.position.x : 100 + (i % 4) * 80,
      y: typeof rawNode.position?.y === 'number' ? rawNode.position.y : 150 + (i % 3) * 70
    };

    sanitizedNodes.push({
      id: nodeId,
      type: rawType,
      title: rawNode.title || `Passo ${i + 1}`,
      data: rawNode.data && typeof rawNode.data === 'object' ? rawNode.data : {},
      position: nodePosition
    });
  }

  if (sanitizedNodes.length === 0) {
    return { 
      success: false, 
      error: 'O fluxo fornecido não contém nenhum nó válido para ser renderizado no Canvas.' 
    };
  }

  // Validate and sanitize connections
  const sanitizedConnections: FlowConnection[] = [];
  const nodeIdsSet = new Set(sanitizedNodes.map((n) => n.id));

  if (Array.isArray(targetFlow.connections)) {
    for (let i = 0; i < targetFlow.connections.length; i++) {
      const conn = targetFlow.connections[i];
      if (!conn || typeof conn !== 'object') continue;
      
      // Connection must link two existing nodes
      if (nodeIdsSet.has(conn.fromNodeId) && nodeIdsSet.has(conn.toNodeId)) {
        sanitizedConnections.push({
          id: conn.id || `conn_${Date.now()}_${i}`,
          fromNodeId: conn.fromNodeId,
          toNodeId: conn.toNodeId,
          handleType: conn.handleType || 'default',
          sourceHandleId: conn.sourceHandleId,
          label: conn.label
        });
      }
    }
  }

  const validChannels: ChannelType[] = ['instagram', 'messenger', 'whatsapp', 'telegram', 'omnichannel'];
  const flowChannel: ChannelType = validChannels.includes(targetFlow.channel) ? targetFlow.channel : 'instagram';

  const validatedFlow: Flow = {
    id: targetFlow.id || `flow_imported_${Date.now()}`,
    title: targetFlow.title || 'Fluxo Importado',
    description: targetFlow.description || 'Fluxo importado a partir de arquivo de template JSON.',
    channel: flowChannel,
    isActive: typeof targetFlow.isActive === 'boolean' ? targetFlow.isActive : true,
    nodes: sanitizedNodes,
    connections: sanitizedConnections,
    createdAt: targetFlow.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: targetFlow.stats && typeof targetFlow.stats === 'object' ? {
      runs: targetFlow.stats.runs || 0,
      completed: targetFlow.stats.completed || 0,
      ctr: targetFlow.stats.ctr || 0
    } : { runs: 0, completed: 0, ctr: 0 }
  };

  const nodeTypesCount: Record<string, number> = {};
  sanitizedNodes.forEach((n) => {
    nodeTypesCount[n.type] = (nodeTypesCount[n.type] || 0) + 1;
  });

  return {
    success: true,
    flow: validatedFlow,
    metadata: {
      totalNodes: sanitizedNodes.length,
      nodeTypesCount,
      totalConnections: sanitizedConnections.length,
      primaryChannel: flowChannel,
      exportedAt: parsed.exportedAt,
      schemaVersion: parsed.schemaVersion
    },
    warnings
  };
}
