import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Bot,
  Sparkles,
  Terminal,
  Copy,
  Check,
  Play,
  RefreshCw,
  Key,
  Shield,
  ExternalLink,
  Code2,
  Layers,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Send,
  Zap,
  HelpCircle,
} from 'lucide-react';
import {
  mcpService,
  McpServerInfo,
  McpTool,
  McpToken,
  McpActivityLog,
} from '../../services/mcpService';

export const McpServerHub: React.FC = () => {
  const [serverInfo, setServerInfo] = useState<McpServerInfo | null>(null);
  const [tokens, setTokens] = useState<McpToken[]>([]);
  const [logs, setLogs] = useState<McpActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'sandbox' | 'tokens' | 'resources' | 'logs'>('clients');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Client config generator state
  const [selectedClient, setSelectedClient] = useState<'claude' | 'cursor' | 'windsurf' | 'curl'>('claude');

  // Sandbox state
  const [selectedToolName, setSelectedToolName] = useState<string>('list_leads');
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({
    channel: 'all',
    status: 'all',
    limit: 10,
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; result: any } | null>(null);

  // New Token Modal State
  const [showNewTokenModal, setShowNewTokenModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenRole, setNewTokenRole] = useState<'full_access' | 'read_only'>('full_access');
  const [createdTokenAlert, setCreatedTokenAlert] = useState<string | null>(null);

  // Resource preview
  const [previewResourceUri, setPreviewResourceUri] = useState<string | null>(null);
  const [resourcePreviewData, setResourcePreviewData] = useState<any>(null);
  const [loadingResource, setLoadingResource] = useState(false);

  // Auto refresh logs
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [info, tokenList, activityList] = await Promise.all([
        mcpService.getServerInfo().catch(() => null),
        mcpService.getTokens().catch(() => []),
        mcpService.getActivityLogs().catch(() => []),
      ]);
      setServerInfo(info);
      setTokens(tokenList);
      setLogs(activityList);
    } catch (err) {
      console.error('Erro ao carregar dados do MCP Server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Periodic log refresh
  useEffect(() => {
    if (!autoRefreshLogs) return;
    const interval = setInterval(async () => {
      try {
        const freshLogs = await mcpService.getActivityLogs();
        setLogs(freshLogs);
      } catch {
        // silent
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefreshLogs]);

  // Handle copy helper
  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Helper current baseUrl
  const currentBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://seu-dominio.com';
  const activeToken = tokens[0]?.token || 'mf_mcp_live_sec_994821a8f9037e2b104c';

  // Config snippets for AI clients
  const getClaudeConfig = () => {
    return JSON.stringify(
      {
        mcpServers: {
          manyflow: {
            url: `${currentBaseUrl}/api/mcp/sse`,
            headers: {
              Authorization: `Bearer ${activeToken}`,
            },
          },
        },
      },
      null,
      2
    );
  };

  const getCursorConfig = () => {
    return JSON.stringify(
      {
        mcpServers: {
          manyflow: {
            url: `${currentBaseUrl}/api/mcp/sse`,
            headers: {
              Authorization: `Bearer ${activeToken}`,
            },
          },
        },
      },
      null,
      2
    );
  };

  const getWindsurfConfig = () => {
    return JSON.stringify(
      {
        mcpServers: {
          manyflow: {
            serverUrl: `${currentBaseUrl}/api/mcp/sse`,
            headers: {
              Authorization: `Bearer ${activeToken}`,
            },
          },
        },
      },
      null,
      2
    );
  };

  const getCurlSnippet = () => {
    return `curl -X POST "${currentBaseUrl}/api/mcp" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${activeToken}" \\
  -d '{
    "jsonrpc": "2.0",
    "id": "req_1",
    "method": "tools/call",
    "params": {
      "name": "list_leads",
      "arguments": { "channel": "instagram", "limit": 5 }
    }
  }'`;
  };

  // Select tool and reset args
  const handleSelectTool = (tool: McpTool) => {
    setSelectedToolName(tool.name);
    setTestResult(null);

    // Default sample arguments based on tool
    if (tool.name === 'list_leads') {
      setToolArgs({ channel: 'instagram', status: 'all', limit: 5 });
    } else if (tool.name === 'get_lead_details') {
      setToolArgs({ leadId: 'lead_ig_9921' });
    } else if (tool.name === 'send_message') {
      setToolArgs({
        recipientId: 'igsid_908123984',
        channel: 'instagram',
        message: 'Olá! Estou entrando em contato via automação assistida por IA.',
        quickReplies: ['Quero Saber Mais', 'Ver Preços', 'Falar com Atendente'],
      });
    } else if (tool.name === 'trigger_automation_flow') {
      setToolArgs({
        flowId: 'flow_meta_dm_boasvindas',
        contactId: 'lead_ig_9921',
        variables: { cupom: 'IA20', desconto: '20%' },
      });
    } else if (tool.name === 'get_webhook_logs') {
      setToolArgs({ limit: 10, status: 'all', channel: 'all' });
    } else if (tool.name === 'simulate_meta_webhook') {
      setToolArgs({
        channel: 'instagram',
        eventType: 'message',
        senderId: 'igsid_simulated_771',
        text: 'Olá, quero mais informações',
      });
    } else if (tool.name === 'query_knowledge_base') {
      setToolArgs({ query: 'preço e formas de pagamento', limit: 3 });
    } else if (tool.name === 'manage_lead_tag') {
      setToolArgs({ leadId: 'lead_ig_9921', action: 'add', tag: 'interesse_ia' });
    } else {
      setToolArgs({});
    }
  };

  // Execute tool test
  const handleExecuteTool = async () => {
    setIsExecuting(true);
    setTestResult(null);
    try {
      const res = await mcpService.executeTestTool(selectedToolName, toolArgs);
      setTestResult(res);
      // reload logs to show execution
      const updatedLogs = await mcpService.getActivityLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        result: { error: err.message },
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Read resource preview
  const handleReadResource = async (uri: string) => {
    setPreviewResourceUri(uri);
    setLoadingResource(true);
    try {
      const response = await mcpService.callJsonRpc('resources/read', { uri }, activeToken);
      setResourcePreviewData(response?.result || response);
    } catch (err: any) {
      setResourcePreviewData({ error: err.message });
    } finally {
      setLoadingResource(false);
    }
  };

  // Create token
  const handleCreateToken = async () => {
    if (!newTokenName.trim()) return;
    try {
      const created = await mcpService.createToken(newTokenName.trim(), newTokenRole);
      setTokens([created, ...tokens]);
      setCreatedTokenAlert(created.token);
      setNewTokenName('');
      setShowNewTokenModal(false);
    } catch (err: any) {
      alert(`Erro ao criar token: ${err.message}`);
    }
  };

  // Revoke token
  const handleRevokeToken = async (id: string) => {
    if (!confirm('Deseja realmente revogar esta chave de acesso MCP?')) return;
    await mcpService.revokeToken(id);
    setTokens(tokens.filter((t) => t.id !== id));
  };

  const currentToolObj = serverInfo?.tools.find((t) => t.name === selectedToolName);

  return (
    <div className="space-y-6" id="mcp_server_hub_container">
      {/* Top Banner: MCP Server Status & Connectivity Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Servidor MCP (Model Context Protocol)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online & Pronto
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 uppercase tracking-wide">
                Protocolo v2024-11-05
              </span>
            </div>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Conecte seus agentes de IA favoritos (<strong className="text-white">Claude Desktop</strong>, <strong className="text-white">Cursor IDE</strong>, <strong className="text-white">Windsurf</strong> ou agentes autônomos) diretamente à sua conta do ManyFlow. Permita que a IA consulte leads, envie mensagens pelo Instagram Direct, dispare fluxos e depure webhooks em tempo real.
            </p>

            {/* Quick URL chips */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">SSE Endpoint:</span>
                <code className="font-mono text-[11px] text-purple-200">{currentBaseUrl}/api/mcp/sse</code>
                <button
                  onClick={() => copyToClipboard(`${currentBaseUrl}/api/mcp/sse`, 'sse_endpoint')}
                  className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Copiar URL SSE"
                >
                  {copiedKey === 'sse_endpoint' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">JSON-RPC 2.0:</span>
                <code className="font-mono text-[11px] text-blue-200">{currentBaseUrl}/api/mcp</code>
                <button
                  onClick={() => copyToClipboard(`${currentBaseUrl}/api/mcp`, 'rpc_endpoint')}
                  className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Copiar URL JSON-RPC"
                >
                  {copiedKey === 'rpc_endpoint' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Metric counter cards */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3 text-center min-w-[90px]">
              <div className="text-xl font-black text-purple-300">{serverInfo?.counts.tools || 10}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Ferramentas</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3 text-center min-w-[90px]">
              <div className="text-xl font-black text-blue-300">{serverInfo?.counts.resources || 4}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Recursos</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3 text-center min-w-[90px]">
              <div className="text-xl font-black text-emerald-300">{serverInfo?.counts.prompts || 3}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Prompts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            id="tab_mcp_clients"
            onClick={() => setActiveSubTab('clients')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'clients'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-600" />
            <span>Conexão & Clientes (1-Clique)</span>
          </button>

          <button
            id="tab_mcp_sandbox"
            onClick={() => setActiveSubTab('sandbox')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'sandbox'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>Sandbox de Ferramentas ({serverInfo?.counts.tools || 10})</span>
          </button>

          <button
            id="tab_mcp_tokens"
            onClick={() => setActiveSubTab('tokens')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'tokens'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4 text-emerald-600" />
            <span>Chaves de Acesso ({tokens.length})</span>
          </button>

          <button
            id="tab_mcp_resources"
            onClick={() => setActiveSubTab('resources')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'resources'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Recursos & Prompts</span>
          </button>

          <button
            id="tab_mcp_logs"
            onClick={() => setActiveSubTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Logs de Atividade</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="Recarregar Servidor MCP"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Recarregar</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: CLIENT CONNECTION SETUP (1-CLICK COPY)         */}
      {/* ========================================================= */}
      {activeSubTab === 'clients' && (
        <div className="space-y-6">
          {/* Created token success notice if recently created */}
          {createdTokenAlert && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="text-xs font-bold text-emerald-900">Nova Chave de Acesso MCP Gerada com Sucesso!</div>
                <div className="text-xs text-emerald-800">
                  Sua chave foi configurada automaticamente nos snippets abaixo:
                </div>
                <div className="bg-white border border-emerald-200 rounded-lg p-2 font-mono text-xs text-emerald-900 flex items-center justify-between gap-2 mt-2">
                  <span>{createdTokenAlert}</span>
                  <button
                    onClick={() => copyToClipboard(createdTokenAlert, 'created_token_alert')}
                    className="p-1 hover:bg-emerald-100 rounded text-emerald-700 cursor-pointer"
                  >
                    {copiedKey === 'created_token_alert' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Client Selector & Snippet */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-purple-600" />
                      Configuração Automática para Clientes de IA
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Copie o JSON e cole no arquivo de configuração do seu aplicativo.
                    </p>
                  </div>

                  {/* Client Selector Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setSelectedClient('claude')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedClient === 'claude'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Claude Desktop
                    </button>
                    <button
                      onClick={() => setSelectedClient('cursor')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedClient === 'cursor'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Cursor IDE
                    </button>
                    <button
                      onClick={() => setSelectedClient('windsurf')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedClient === 'windsurf'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Windsurf
                    </button>
                    <button
                      onClick={() => setSelectedClient('curl')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedClient === 'curl'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      cURL / API
                    </button>
                  </div>
                </div>

                {/* File Path Guide */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900">Onde colar este arquivo:</span>
                    {selectedClient === 'claude' && (
                      <div className="space-y-0.5 text-slate-600 font-mono text-[11px]">
                        <div>• <strong>macOS:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code></div>
                        <div>• <strong>Windows:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded">%APPDATA%\Claude\claude_desktop_config.json</code></div>
                        <div>• <strong>Linux:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded">~/.config/Claude/claude_desktop_config.json</code></div>
                      </div>
                    )}
                    {selectedClient === 'cursor' && (
                      <div className="text-slate-600 font-mono text-[11px]">
                        No Cursor, acesse <strong>Cursor Settings &gt; Features &gt; MCP Servers &gt; Add New MCP Server</strong> (ou edite o arquivo <code className="bg-slate-200 px-1 py-0.5 rounded">~/.cursor/mcp.json</code>).
                      </div>
                    )}
                    {selectedClient === 'windsurf' && (
                      <div className="text-slate-600 font-mono text-[11px]">
                        No Windsurf / Codeium, acesse as preferências de MCP ou configure em <code className="bg-slate-200 px-1 py-0.5 rounded">~/.codeium/windsurf/mcp_config.json</code>.
                      </div>
                    )}
                    {selectedClient === 'curl' && (
                      <div className="text-slate-600 font-mono text-[11px]">
                        Qualquer cliente HTTP pode realizar requisições POST seguindo a especificação JSON-RPC 2.0 padrão.
                      </div>
                    )}
                  </div>
                </div>

                {/* Code display with copy button */}
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed max-h-96">
                    {selectedClient === 'claude' && getClaudeConfig()}
                    {selectedClient === 'cursor' && getCursorConfig()}
                    {selectedClient === 'windsurf' && getWindsurfConfig()}
                    {selectedClient === 'curl' && getCurlSnippet()}
                  </pre>

                  <button
                    onClick={() => {
                      let textToCopy = '';
                      if (selectedClient === 'claude') textToCopy = getClaudeConfig();
                      else if (selectedClient === 'cursor') textToCopy = getCursorConfig();
                      else if (selectedClient === 'windsurf') textToCopy = getWindsurfConfig();
                      else textToCopy = getCurlSnippet();
                      copyToClipboard(textToCopy, 'client_config');
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {copiedKey === 'client_config' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Configuração</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: How it works & Capabilities summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  O que a IA poderá fazer?
                </h3>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-900">Buscar e Triar Leads:</strong>
                      <p className="mt-0.5 text-slate-500">
                        O Claude pode pesquisar "me mostre os leads mais quentes do Instagram hoje" e receber os dados instantaneamente.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-900">Enviar Mensagens no Instagram:</strong>
                      <p className="mt-0.5 text-slate-500">
                        Você pode pedir "Envie uma mensagem para a @camila_fit oferecendo 20% de desconto" e a IA despacha diretamente via Meta API.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-900">Disparar Funis de Automação:</strong>
                      <p className="mt-0.5 text-slate-500">
                        Ative fluxos de chatbot, envie carrosséis ou inicie a recuperação de checkout para qualquer contato.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <strong className="text-slate-900">Depurar Falhas de Webhook:</strong>
                      <p className="mt-0.5 text-slate-500">
                        Peça "Investigue porque o webhook da Meta falhou nos últimos 10 minutos" e receba a causa e a correção exata.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Todas as chamadas são auditadas com criptografia e tokens seguros.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: INTERACTIVE TOOLS SANDBOX (RUN TOOLS ONLINE)   */}
      {/* ========================================================= */}
      {activeSubTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Tool Selection List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ferramentas Disponíveis ({serverInfo?.tools.length || 10})
                </div>

                <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                  {serverInfo?.tools.map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => handleSelectTool(tool)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedToolName === tool.name
                          ? 'bg-purple-50/80 border-purple-300 text-purple-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-bold font-mono text-indigo-700">{tool.name}</code>
                        {selectedToolName === tool.name && (
                          <span className="w-2 h-2 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Selected Tool Form & Live Response Output */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Ferramenta:</span>
                      <code className="text-sm font-black font-mono text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                        {selectedToolName}
                      </code>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {currentToolObj?.description}
                    </p>
                  </div>

                  <button
                    onClick={handleExecuteTool}
                    disabled={isExecuting}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isExecuting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Executando...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Executar Ferramenta</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Parameters Editor */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Parâmetros de Entrada (JSON Schema):</span>
                    <span className="text-[11px] font-normal text-slate-400">Edite os valores para testar</span>
                  </div>

                  <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    {/* Dynamic Fields */}
                    {selectedToolName === 'list_leads' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Canal:</label>
                          <select
                            value={toolArgs.channel || 'all'}
                            onChange={(e) => setToolArgs({ ...toolArgs, channel: e.target.value })}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="all">Todos os Canais</option>
                            <option value="instagram">Instagram</option>
                            <option value="messenger">Messenger</option>
                            <option value="whatsapp">WhatsApp</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Status:</label>
                          <select
                            value={toolArgs.status || 'all'}
                            onChange={(e) => setToolArgs({ ...toolArgs, status: e.target.value })}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="all">Todos</option>
                            <option value="hot">Quente (Hot)</option>
                            <option value="lead">Lead</option>
                            <option value="customer">Cliente</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Limite:</label>
                          <input
                            type="number"
                            value={toolArgs.limit || 10}
                            onChange={(e) => setToolArgs({ ...toolArgs, limit: Number(e.target.value) })}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {selectedToolName === 'send_message' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">Destinatário (ID):</label>
                            <input
                              type="text"
                              value={toolArgs.recipientId || ''}
                              onChange={(e) => setToolArgs({ ...toolArgs, recipientId: e.target.value })}
                              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                              placeholder="igsid_908123984"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">Canal:</label>
                            <select
                              value={toolArgs.channel || 'instagram'}
                              onChange={(e) => setToolArgs({ ...toolArgs, channel: e.target.value })}
                              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                            >
                              <option value="instagram">Instagram Direct</option>
                              <option value="messenger">Facebook Messenger</option>
                              <option value="whatsapp">WhatsApp</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Mensagem:</label>
                          <textarea
                            rows={3}
                            value={toolArgs.message || ''}
                            onChange={(e) => setToolArgs({ ...toolArgs, message: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                            placeholder="Digite o texto da mensagem enviada pela IA..."
                          />
                        </div>
                      </div>
                    )}

                    {selectedToolName === 'trigger_automation_flow' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">ID do Fluxo (Flow):</label>
                          <input
                            type="text"
                            value={toolArgs.flowId || ''}
                            onChange={(e) => setToolArgs({ ...toolArgs, flowId: e.target.value })}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                            placeholder="flow_meta_dm_boasvindas"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">ID do Contato:</label>
                          <input
                            type="text"
                            value={toolArgs.contactId || ''}
                            onChange={(e) => setToolArgs({ ...toolArgs, contactId: e.target.value })}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                            placeholder="lead_ig_9921"
                          />
                        </div>
                      </div>
                    )}

                    {/* Raw JSON editor fallback for any other tools */}
                    {!['list_leads', 'send_message', 'trigger_automation_flow'].includes(selectedToolName) && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Argumentos (JSON):</label>
                        <textarea
                          rows={4}
                          value={JSON.stringify(toolArgs, null, 2)}
                          onChange={(e) => {
                            try {
                              setToolArgs(JSON.parse(e.target.value));
                            } catch {
                              // keep raw
                            }
                          }}
                          className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Output Inspector */}
                {testResult && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">Resposta da Execução:</span>
                        {testResult.success ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            200 OK (Sucesso)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Erro na Execução
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        Latência: <strong className="text-slate-700">{testResult.latencyMs}ms</strong>
                      </span>
                    </div>

                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 max-h-72">
                      {JSON.stringify(testResult.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: ACCESS KEYS / API TOKENS (CRUD & SECURITY)     */}
      {/* ========================================================= */}
      {activeSubTab === 'tokens' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                Chaves de Acesso MCP (API Tokens)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chaves utilizadas para autenticar clientes de IA como Claude Desktop, Cursor e scripts externos.
              </p>
            </div>

            <button
              onClick={() => setShowNewTokenModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Gerar Nova Chave MCP</span>
            </button>
          </div>

          {/* Tokens Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Nome / Identificador</th>
                  <th className="p-3.5">Chave de Acesso</th>
                  <th className="p-3.5">Permissões</th>
                  <th className="p-3.5">Chamadas Realizadas</th>
                  <th className="p-3.5">Último Uso</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tokens.map((token) => (
                  <tr key={token.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3.5 font-bold text-slate-900">{token.name}</td>
                    <td className="p-3.5 font-mono text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {token.token.substring(0, 14)}••••••••••••
                        </span>
                        <button
                          onClick={() => copyToClipboard(token.token, `token_${token.id}`)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                          title="Copiar chave completa"
                        >
                          {copiedKey === `token_${token.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        {token.role === 'full_access' ? 'Acesso Total (R/W)' : 'Somente Leitura'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-700">{token.callCount || 0} reqs</td>
                    <td className="p-3.5 text-slate-500">
                      {token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleString('pt-BR') : 'Nunca utilizada'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleRevokeToken(token.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                        title="Revogar chave"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* New Token Modal */}
          {showNewTokenModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-indigo-600" />
                    Criar Chave de Acesso MCP
                  </h3>
                  <button
                    onClick={() => setShowNewTokenModal(false)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nome da Chave / Aplicação:</label>
                    <input
                      type="text"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      placeholder="Ex: Claude Desktop MacBook Pro"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nível de Permissão:</label>
                    <select
                      value={newTokenRole}
                      onChange={(e) => setNewTokenRole(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-indigo-600"
                    >
                      <option value="full_access">Acesso Total (Leitura, Disparo de Mensagens e Fluxos)</option>
                      <option value="read_only">Somente Leitura (Consulta de Leads e Webhooks)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowNewTokenModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateToken}
                    disabled={!newTokenName.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                  >
                    Gerar Chave
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 4: RESOURCES & PROMPTS EXPLORER                   */}
      {/* ========================================================= */}
      {activeSubTab === 'resources' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resources Column */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      Recursos MCP Registrados ({serverInfo?.resources.length || 4})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fontes de dados em tempo real acessíveis pelo Claude e Cursor via URI.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {serverInfo?.resources.map((resource) => (
                    <div
                      key={resource.uri}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 space-y-2 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{resource.name}</span>
                        <button
                          onClick={() => handleReadResource(resource.uri)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
                        >
                          Ler Recurso
                        </button>
                      </div>
                      <code className="text-[11px] font-mono text-purple-700 block bg-purple-50 px-2 py-0.5 rounded">
                        {resource.uri}
                      </code>
                      <p className="text-xs text-slate-500">{resource.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Preview Box */}
              {previewResourceUri && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Preview: {previewResourceUri}</span>
                    <button
                      onClick={() => setPreviewResourceUri(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Fechar
                    </button>
                  </div>
                  {loadingResource ? (
                    <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      Carregando dados do recurso...
                    </div>
                  ) : (
                    <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono overflow-x-auto max-h-60">
                      {JSON.stringify(resourcePreviewData, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Prompts Column */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Prompts & Agentes Pré-Configurados ({serverInfo?.prompts.length || 3})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Roteiros otimizados que os modelos de IA podem puxar com um clique.
                  </p>
                </div>

                <div className="space-y-3">
                  {serverInfo?.prompts.map((prompt) => (
                    <div
                      key={prompt.name}
                      className="p-3.5 rounded-xl border border-slate-200 bg-purple-50/30 hover:bg-purple-50/60 space-y-2 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <code className="font-bold text-xs font-mono text-purple-900">{prompt.name}</code>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          {prompt.arguments?.length || 0} argumento(s)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{prompt.description}</p>
                      {prompt.arguments && prompt.arguments.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1.5">
                          {prompt.arguments.map((arg) => (
                            <span
                              key={arg.name}
                              className="text-[10px] font-mono bg-white border border-purple-200 px-1.5 py-0.5 rounded text-purple-700"
                            >
                              ${arg.name} {arg.required ? '(obrigatório)' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 5: REAL-TIME ACTIVITY LOGS                        */}
      {/* ========================================================= */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Monitor de Requisições MCP em Tempo Real
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Acompanhe as invocações de ferramentas e leitura de recursos feitas por Claude, Cursor ou Agentes de IA.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefreshLogs(!autoRefreshLogs)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  autoRefreshLogs
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${autoRefreshLogs ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>Auto-Refresh (4s)</span>
              </button>

              <button
                onClick={async () => {
                  if (confirm('Limpar histórico de logs de atividade MCP?')) {
                    await mcpService.clearActivityLogs();
                    setLogs([]);
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 border border-slate-200 hover:bg-rose-50 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Logs</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Horário</th>
                  <th className="p-3.5">Método MCP</th>
                  <th className="p-3.5">Ferramenta / Recurso</th>
                  <th className="p-3.5">Cliente Solicitante</th>
                  <th className="p-3.5">Latência</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Detalhes da Execução</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Nenhuma requisição MCP registrada ainda. Execute uma ferramenta no Sandbox ou conecte o Claude Desktop!
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {log.method}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-purple-700">
                        {log.toolOrResource || '—'}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-[140px] truncate" title={log.clientInfo}>
                        {log.clientInfo || 'MCP Client'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{log.latencyMs}ms</td>
                      <td className="p-3.5">
                        {log.status === 'success' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {log.statusCode || 200} OK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            {log.statusCode || 500} ERRO
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-[220px] truncate" title={log.responseSummary || log.errorMessage}>
                        {log.responseSummary || log.errorMessage || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
