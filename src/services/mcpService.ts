export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
      items?: { type: string };
    }>;
    required?: string[];
  };
}

export interface McpResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface McpPrompt {
  name: string;
  description: string;
  arguments?: {
    name: string;
    description: string;
    required?: boolean;
  }[];
}

export interface McpToken {
  id: string;
  name: string;
  token: string;
  role: 'full_access' | 'read_only';
  createdAt: string;
  lastUsedAt?: string;
  callCount: number;
}

export interface McpActivityLog {
  id: string;
  timestamp: string;
  method: string;
  toolOrResource?: string;
  clientInfo?: string;
  latencyMs: number;
  status: 'success' | 'error';
  statusCode: number;
  errorMessage?: string;
  requestPayload?: any;
  responseSummary?: string;
}

export interface McpServerInfo {
  name: string;
  protocolVersion: string;
  version: string;
  description: string;
  endpoints: {
    jsonRpc: string;
    sse: string;
    messages: string;
  };
  capabilities: {
    tools: { listChanged: boolean };
    resources: { subscribe: boolean; listChanged: boolean };
    prompts: { listChanged: boolean };
  };
  counts: {
    tools: number;
    resources: number;
    prompts: number;
  };
  tools: McpTool[];
  resources: McpResource[];
  prompts: McpPrompt[];
}

export const mcpService = {
  // 1. Fetch Server Status & Manifest
  async getServerInfo(): Promise<McpServerInfo> {
    const res = await fetch('/api/mcp/info');
    if (!res.ok) {
      throw new Error(`Falha ao obter informações do MCP Server: ${res.statusText}`);
    }
    return res.json();
  },

  // 2. Fetch Client Configuration (Claude Desktop, Cursor)
  async getClientConfig(type: 'claude_desktop' | 'cursor'): Promise<any> {
    const res = await fetch(`/api/mcp/config?type=${type}`);
    if (!res.ok) {
      throw new Error(`Falha ao obter arquivo de configuração: ${res.statusText}`);
    }
    return res.json();
  },

  // 3. Tokens CRUD
  async getTokens(): Promise<McpToken[]> {
    const res = await fetch('/api/mcp/tokens');
    if (!res.ok) return [];
    const data = await res.json();
    return data.tokens || [];
  },

  async createToken(name: string, role: 'full_access' | 'read_only' = 'full_access'): Promise<McpToken> {
    const res = await fetch('/api/mcp/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role }),
    });
    if (!res.ok) throw new Error('Erro ao gerar token');
    const data = await res.json();
    return data.token;
  },

  async revokeToken(id: string): Promise<boolean> {
    const res = await fetch(`/api/mcp/tokens/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // 4. Activity Logs
  async getActivityLogs(): Promise<McpActivityLog[]> {
    const res = await fetch('/api/mcp/activity');
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  },

  async clearActivityLogs(): Promise<boolean> {
    const res = await fetch('/api/mcp/activity', { method: 'DELETE' });
    return res.ok;
  },

  // 5. Test Tool Execution (Sandbox)
  async executeTestTool(toolName: string, args: Record<string, any>): Promise<{ success: boolean; latencyMs: number; result: any; error?: string }> {
    const res = await fetch('/api/mcp/execute-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolName, args }),
    });
    return res.json();
  },

  // 6. Direct JSON-RPC Call
  async callJsonRpc(method: string, params: any = {}, token?: string): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/mcp', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `rpc_${Date.now()}`,
        method,
        params,
      }),
    });
    return res.json();
  },
};
