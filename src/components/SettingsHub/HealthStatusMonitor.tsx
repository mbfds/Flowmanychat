import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Database, 
  ShieldCheck, 
  Clock, 
  Server, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Zap, 
  Cpu, 
  HardDrive,
  Layers,
  Terminal,
  Key
} from 'lucide-react';

interface HealthData {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  healthCheckDurationMs: number;
  database: {
    provider: string;
    connected: boolean;
    uriConfigured: boolean;
    dbName: string;
    collectionsCount: number;
    pingLatencyMs: number;
    serverVersion?: string;
    error: string | null;
  };
  auth: {
    sessionPersistence: string;
    jwtExpiration: string;
    status: string;
  };
  cron: {
    engine: string;
    status: string;
    activeWorkers: number;
    totalWorkers: number;
    successRate: number;
  };
  system: {
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
    nodeVersion: string;
    platform: string;
  };
}

export const HealthStatusMonitor: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const json = await res.json();
        setHealth(json);
        setLastCheck(new Date());
      } else {
        const errJson = await res.json().catch(() => ({}));
        setErrorMsg(errJson.error || `HTTP ${res.status}: Erro na verificação`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao conectar no endpoint /api/health');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    if (!autoRefresh) return;
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const healthUrl = `${currentHost}/api/health`;
  const readinessUrl = `${currentHost}/api/health?probe=readiness`;

  return (
    <div id="health_status_monitor" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
              health?.status === 'ok'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
                : health?.status === 'degraded'
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20'
                : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20'
            }`}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Monitor de Saúde & Disponibilidade (/api/health)
                </h2>
                {health && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1.5 border ${
                    health.status === 'ok'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : health.status === 'degraded'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-rose-100 text-rose-800 border-rose-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      health.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    {health.status === 'ok' ? 'ONLINE (100% Operacional)' : 'DEGRADADO (Atenção)'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Endpoint público de health check para monitoramento contínuo por serviços de deploy (Vercel, Cloud Run, Kubernetes, UptimeRobot, Railway).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                autoRefresh
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh && isLoading ? 'animate-spin' : ''}`} />
              <span>{autoRefresh ? 'Auto (10s)' : 'Pausado'}</span>
            </button>

            <button
              onClick={fetchHealth}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Testar Agora</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Conexão MongoDB</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-black ${health?.database.connected ? 'text-emerald-600' : 'text-amber-600'}`}>
                {health?.database.connected ? 'Conectado' : 'Modo Fallback'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Latência: {health?.database.pingLatencyMs ?? 0}ms
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Sessões JWT</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-indigo-600">
                Ativo
              </span>
              <span className="text-xs text-slate-500 font-bold">
                ({health?.auth.jwtExpiration || '7d'})
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Persistência criptografada
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tarefas node-cron</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-emerald-600">
                {health?.cron.activeWorkers ?? 6}/{health?.cron.totalWorkers ?? 6}
              </span>
              <span className="text-xs text-slate-500">ativos</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Sucesso: {health?.cron.successRate ?? 100}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tempo de Atividade</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-slate-900">
                {formatUptime(health?.uptimeSeconds ?? 0)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Node {health?.system.nodeVersion || process.version}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 3 Main Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Block 1: MongoDB Database Health */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Banco de Dados (MongoDB)</h3>
            </div>
            <span className={`w-2.5 h-2.5 rounded-full ${
              health?.database.connected ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Status da Conexão</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {health?.database.connected ? 'OK / Ativo' : 'Aguardando URI'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Nome do Banco</span>
              <span className="font-mono font-bold text-slate-800">
                {health?.database.dbName || 'manyflow'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Latência de Ping</span>
              <span className="font-mono font-bold text-indigo-700">
                {health?.database.pingLatencyMs ?? 0} ms
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Coleções Monitoradas</span>
              <span className="font-bold text-slate-800">
                {health?.database.collectionsCount ?? 0} coleções ativas
              </span>
            </div>
          </div>
        </div>

        {/* Block 2: JWT Session Engine */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sessões & Autenticação</h3>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Modelo de Persistência</span>
              <span className="font-bold text-slate-800">JWT + MongoDB Store</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Validade do Token</span>
              <span className="font-mono font-bold text-emerald-700">
                {health?.auth.jwtExpiration || '7 dias (JWT_EXPIRES_IN)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Algoritmo</span>
              <span className="font-mono font-bold text-slate-800">HMAC-SHA256</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Revogação & Logout</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Suportado em tempo real
              </span>
            </div>
          </div>
        </div>

        {/* Block 3: Node-Cron Tasks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Motor de Agendamentos</h3>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Motor de Execução</span>
              <span className="font-mono font-bold text-purple-700">node-cron 3.x</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Fuso Horário</span>
              <span className="font-mono font-bold text-slate-800">America/Sao_Paulo</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Broadcasts Automáticos</span>
              <span className="font-bold text-emerald-700">A cada 1 min (* * * * *)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium">Limpeza de Logs do BD</span>
              <span className="font-bold text-emerald-700">Diariamente 03:00 (0 3 * * *)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Integration URLs for Deploy & Monitoring */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">URLs de Monitoramento para Serviços de Deploy</h3>
          </div>
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{showRawJson ? 'Ocultar JSON Bruto' : 'Ver Resposta JSON'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Configure estas URLs nos probes de integridade da sua infraestrutura (Vercel, Cloud Run, Render, Railway, AWS Route53 ou UptimeRobot) para alertas automáticos de queda de serviço.
        </p>

        <div className="space-y-3">
          {/* URL 1 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Health Check Geral (Liveness Probe)
              </span>
              <code className="text-xs font-mono text-blue-700 font-bold break-all">
                {healthUrl}
              </code>
            </div>
            <button
              onClick={() => handleCopy(healthUrl, 'healthUrl')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
            >
              {copiedKey === 'healthUrl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'healthUrl' ? 'Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>

          {/* URL 2 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Probe Estrito de Prontidão (Readiness Probe com validação mandatória de DB)
              </span>
              <code className="text-xs font-mono text-purple-700 font-bold break-all">
                {readinessUrl}
              </code>
            </div>
            <button
              onClick={() => handleCopy(readinessUrl, 'readinessUrl')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
            >
              {copiedKey === 'readinessUrl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'readinessUrl' ? 'Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible raw JSON */}
        {showRawJson && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-80 border border-slate-800">
            <pre>{JSON.stringify(health, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
