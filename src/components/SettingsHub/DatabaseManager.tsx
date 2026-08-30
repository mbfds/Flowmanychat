import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Activity, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Shield, 
  Layers, 
  Trash2, 
  Filter, 
  Search, 
  Plus, 
  Zap,
  Terminal,
  Cpu
} from 'lucide-react';
import { dbService } from '../../services/db';
import { SystemLogEntry, SystemLogCategory, SystemLogLevel, MongoPoolStats, MongoStatusInfo } from '../../types';

export const DatabaseManager: React.FC = () => {
  const [status, setStatus] = useState<MongoStatusInfo | null>(null);
  const [poolStats, setPoolStats] = useState<MongoPoolStats | null>(null);
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [logStats, setLogStats] = useState<{
    total: number;
    last24hCount: number;
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
  }>({ total: 0, last24hCount: 0, byCategory: {}, byLevel: {} });

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<SystemLogCategory | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<SystemLogLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; latencyMs: number } | null>(null);
  const [isCreatingLog, setIsCreatingLog] = useState(false);
  const [testLogMessage, setTestLogMessage] = useState('');

  const refreshAll = async () => {
    setIsLoading(true);
    try {
      const [currentStatus, currentPool, logsData, currentStats] = await Promise.all([
        dbService.getStatus(),
        dbService.getPoolStats(),
        dbService.getLogs({
          category: selectedCategory,
          level: selectedLevel,
          search: searchQuery,
          limit: 50,
        }),
        dbService.getLogStats(),
      ]);

      setStatus(currentStatus);
      setPoolStats(currentPool || currentStatus.poolStats || null);
      setLogs(logsData.logs);
      setTotalLogs(logsData.total);
      setLogStats(currentStats);
    } catch (err) {
      console.warn('[DatabaseManager] Erro ao carregar métricas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 15000);
    return () => clearInterval(interval);
  }, [selectedCategory, selectedLevel]);

  const handleTestPing = async () => {
    setIsPinging(true);
    try {
      const res = await dbService.testPing();
      setPingResult(res);
      await dbService.createLog({
        category: 'database',
        level: 'info',
        message: `Teste de Ping do Connection Pooler executado: ${res.latencyMs}ms`,
        details: { ok: res.ok, latencyMs: res.latencyMs },
        source: 'DatabaseManager',
      });
      refreshAll();
    } catch (err) {
      setPingResult({ ok: false, latencyMs: 0 });
    } finally {
      setIsPinging(false);
    }
  };

  const handleCreateTestLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testLogMessage.trim()) return;

    setIsCreatingLog(true);
    try {
      await dbService.createLog({
        category: 'system',
        level: 'info',
        message: testLogMessage.trim(),
        details: { triggeredBy: 'admin_ui', timestamp: new Date().toISOString() },
        source: 'manual_test',
        actor: 'admin',
      });
      setTestLogMessage('');
      refreshAll();
    } catch (err) {
      console.error('Falha ao criar log de teste:', err);
    } finally {
      setIsCreatingLog(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Tem certeza que deseja limpar os logs do banco de dados?')) return;
    try {
      await dbService.clearLogs();
      refreshAll();
    } catch (err) {
      console.error('Falha ao limpar logs:', err);
    }
  };

  const getLevelBadge = (level: SystemLogLevel) => {
    switch (level) {
      case 'error':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 uppercase">ERRO</span>;
      case 'warn':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 uppercase">AVISO</span>;
      case 'success':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">SUCESSO</span>;
      case 'debug':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 uppercase">DEBUG</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 uppercase">INFO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* MongoDB Pooler Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Status do Pooler</span>
            <div className={`w-2.5 h-2.5 rounded-full ${status?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-black text-[#1A1D21] flex items-center gap-1.5">
              {status?.connected ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Pool Ativo & Conectado</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span>Modo Local / Standby</span>
                </>
              )}
            </h3>
            <p className="text-xs text-[#64748B] mt-1 font-mono">
              Database: <strong className="text-indigo-600">{status?.dbName || 'manyflow'}</strong>
            </p>
          </div>
        </div>

        {/* Connection Pool Limits */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Capacidade do Pool</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-900">{poolStats?.maxPoolSize || 50}</span>
              <span className="text-xs text-[#64748B] font-medium">conexões máx. simultâneas</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1 font-medium">
              Min Pool Size: {poolStats?.minPoolSize || 5} conexões ativas pré-aquecidas
            </p>
          </div>
        </div>

        {/* Latency & Ping */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Latência de Ping</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#1A1D21]">
                {pingResult ? `${pingResult.latencyMs} ms` : `${poolStats?.pingLatencyMs || 2} ms`}
              </span>
              <span className="text-xs text-emerald-600 font-bold">Excelente</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Engine: {poolStats?.serverVersion || 'MongoDB 6.0+'}
            </p>
          </div>
        </div>

        {/* System Logs Count */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Registros de Log</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#1A1D21]">{logStats.total}</span>
              <span className="text-xs text-purple-600 font-bold">({logStats.last24hCount} em 24h)</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Coleção: <code className="font-mono text-purple-700">system_logs</code>
            </p>
          </div>
        </div>
      </div>

      {/* Connection Pooler Settings & Test Action Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Configuração da Camada de Serviço (src/services/db.ts)</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Conexão estável com pool de conexões e índices automáticos para Fluxos, Contatos e Auditoria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestPing}
              disabled={isPinging}
              className="py-1.5 px-3.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${isPinging ? 'animate-bounce' : ''}`} />
              <span>{isPinging ? 'Testando Ping...' : 'Testar Conexão Pooler'}</span>
            </button>

            <button
              type="button"
              onClick={refreshAll}
              disabled={isLoading}
              className="py-1.5 px-3.5 rounded-lg bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#1A1D21] text-xs font-bold border border-[#E2E8F0] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar Métricas</span>
            </button>
          </div>
        </div>

        {/* Environment Reference & Collections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-[#E2E8F0]">
          <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0]">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              String de Conexão (.env)
            </span>
            <code className="text-xs text-indigo-900 font-mono font-bold block truncate">
              MONGODB_URI=mongodb://127.0.0.1:27017/manyflow
            </code>
            <span className="text-[10px] text-emerald-700 mt-1 block">
              ✓ Gerenciado via Secrets / .env (aaPanel & Atlas)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0]">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Parâmetros do Pooler
            </span>
            <div className="text-xs text-[#1A1D21] space-y-0.5 font-mono">
              <div>maxPoolSize: <strong>50</strong> | minPoolSize: <strong>5</strong></div>
              <div>maxIdleTimeMS: <strong>30000ms</strong> | retryWrites: <strong>true</strong></div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0]">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Coleções Indexadas no MongoDB
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(status?.collections && status.collections.length > 0 
                ? status.collections 
                : ['contacts', 'flows', 'system_logs', 'webhook_events', 'settings']
              ).map((col) => (
                <span key={col} className="px-2 py-0.5 rounded text-[11px] font-bold bg-white border border-[#E2E8F0] text-gray-700">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System & Audit Logs Viewer */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-600" />
              <span>Auditoria e Logs de Execução (system_logs)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                {totalLogs} registros
              </span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Histórico persistido em tempo real de disparos de fluxos, atualizações de contatos e webhooks.
            </p>
          </div>

          {/* Log Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearLogs}
              className="py-1.5 px-3 rounded-lg hover:bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Logs</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 bg-[#F8F9FB] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-[#64748B] font-bold">
              <Filter className="w-3.5 h-3.5" />
              <span>Categoria:</span>
            </div>
            {(['all', 'system', 'flow', 'contact', 'webhook', 'broadcast', 'ai', 'database'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#1A1D21]'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar mensagem de log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && refreshAll()}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-[#1A1D21] w-48 sm:w-64 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Manual Test Log Insertion */}
        <form onSubmit={handleCreateTestLog} className="p-3 bg-indigo-50/40 border-b border-indigo-100 flex items-center gap-2 text-xs">
          <span className="font-bold text-indigo-900 text-[11px] whitespace-nowrap">
            Registrar Log Manual:
          </span>
          <input
            type="text"
            placeholder="Digite uma mensagem para testar a persistência imediata no MongoDB..."
            value={testLogMessage}
            onChange={(e) => setTestLogMessage(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs focus:outline-none"
          />
          <button
            type="submit"
            disabled={isCreatingLog || !testLogMessage.trim()}
            className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Gravar no MongoDB</span>
          </button>
        </form>

        {/* Logs Table / List */}
        <div className="divide-y divide-[#E2E8F0] max-h-96 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-[#64748B] font-sans">
              <Terminal className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-[#1A1D21]">Nenhum registro de log encontrado</p>
              <p className="text-xs text-[#64748B] mt-0.5">
                Os eventos gerados por automações e contatos serão listados aqui em tempo real.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3.5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-2.5">
                  {getLevelBadge(log.level)}
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">
                    {log.category}
                  </span>
                  <span className="text-[#1A1D21] font-sans font-medium text-xs">
                    {log.message}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                  {log.source && (
                    <span className="text-gray-500 font-mono">[{log.source}]</span>
                  )}
                  <span className="whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
