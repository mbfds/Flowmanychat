import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Activity, 
  Zap, 
  Terminal, 
  Layers, 
  Calendar, 
  Share2, 
  Radio, 
  RefreshCw,
  ShieldCheck,
  Server,
  ArrowRight,
  Edit2,
  Trash2,
  Save,
  Sliders
} from 'lucide-react';

interface CronWorkerStats {
  id: string;
  name: string;
  description: string;
  cronExpression?: string;
  intervalDescription?: string;
  intervalMs?: number;
  engine?: string;
  enabled: boolean;
  isRunning: boolean;
  lastRunAt: string | null;
  lastDurationMs: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastError: string | null;
  itemsProcessedTotal: number;
  recentLogs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    details?: any;
  }>;
}

interface CronStatusResponse {
  status: string;
  engine?: string;
  timezone?: string;
  startedAt: string;
  uptimeSeconds: number;
  summary: {
    totalWorkers: number;
    activeWorkers: number;
    totalRuns: number;
    totalSuccess: number;
    totalFailed: number;
    successRate: number;
    totalProcessedItems: number;
  };
  workers: CronWorkerStats[];
}

export const CronJobsManager: React.FC = () => {
  const [data, setData] = useState<CronStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [triggeringWorkerId, setTriggeringWorkerId] = useState<string | null>(null);
  const [selectedLogsWorker, setSelectedLogsWorker] = useState<CronWorkerStats | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Editing cron schedule
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [newCronExpression, setNewCronExpression] = useState<string>('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  const fetchCronStatus = async () => {
    try {
      const res = await fetch('/api/system/cron-status');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (selectedLogsWorker) {
          const updated = json.workers?.find((w: CronWorkerStats) => w.id === selectedLogsWorker.id);
          if (updated) setSelectedLogsWorker(updated);
        }
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchCronStatus();
    const interval = setInterval(fetchCronStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerWorker = async (workerId: string) => {
    setTriggeringWorkerId(workerId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/system/cron/trigger/${workerId}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        setActionMessage({
          text: `Worker disparado com sucesso! Duração: ${result.durationMs}ms | Itens processados: ${result.itemsProcessed || 0}`,
          type: 'success'
        });
      } else {
        setActionMessage({
          text: `Falha ao executar worker: ${result.error || 'Erro desconhecido'}`,
          type: 'error'
        });
      }
      await fetchCronStatus();
    } catch (err: any) {
      setActionMessage({ text: err.message, type: 'error' });
    } finally {
      setTriggeringWorkerId(null);
    }
  };

  const handleToggleWorker = async (workerId: string, currentEnabled: boolean) => {
    try {
      await fetch(`/api/system/cron/toggle/${workerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled })
      });
      await fetchCronStatus();
    } catch {
      // Ignored
    }
  };

  const handleSaveSchedule = async (workerId: string) => {
    if (!newCronExpression.trim()) return;
    setIsSavingSchedule(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/system/cron/schedule/${workerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cronExpression: newCronExpression.trim() })
      });
      const result = await res.json();
      if (result.success) {
        setActionMessage({
          text: `Horário do worker reprogramado com sucesso para "${newCronExpression.trim()}"!`,
          type: 'success'
        });
        setEditingWorkerId(null);
        await fetchCronStatus();
      } else {
        setActionMessage({
          text: result.error || 'Erro ao alterar horário da tarefa',
          type: 'error'
        });
      }
    } catch (err: any) {
      setActionMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div id="cron_jobs_manager" className="space-y-6">
      {/* Top Banner & Summary Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Agendador de Tarefas em Background (node-cron)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  node-cron 3.x
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Execução programada autônoma no servidor: disparos automáticos de broadcasts e limpeza de logs do sistema em horários definidos. Fuso horário: <strong>America/Sao_Paulo</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setIsLoading(true);
                fetchCronStatus().finally(() => setIsLoading(false));
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              title="Atualizar status dos workers"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Action message feedback */}
        {actionMessage && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tarefas Ativas</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">
                {data?.summary.activeWorkers ?? 6}
              </span>
              <span className="text-xs text-slate-500 font-bold">
                / {data?.summary.totalWorkers ?? 6}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Taxa de Sucesso</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">
                {data?.summary.successRate ?? 100}%
              </span>
              <span className="text-xs text-slate-500">
                ({data?.summary.totalSuccess ?? 0} ok)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total de Disparos</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-600">
                {data?.summary.totalRuns ?? 0}
              </span>
              <span className="text-xs text-slate-500">ciclos</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Uptime do Servidor</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-slate-900 truncate">
                {formatUptime(data?.uptimeSeconds ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Tarefas Agendadas no node-cron ({data?.workers?.length || 6})</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            Sincronização em tempo real com o backend
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {data?.workers?.map((worker) => {
            const isTriggering = triggeringWorkerId === worker.id;
            const isEditing = editingWorkerId === worker.id;
            const timeSinceRun = worker.lastRunAt 
              ? `${Math.max(1, Math.floor((Date.now() - new Date(worker.lastRunAt).getTime()) / 1000))}s atrás`
              : 'Aguardando próximo ciclo';

            const isBroadcast = worker.id === 'broadcast_scheduler_worker';
            const isDbMaintenance = worker.id === 'db_maintenance_worker';

            return (
              <div 
                key={worker.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs p-5 ${
                  worker.enabled 
                    ? isBroadcast || isDbMaintenance
                      ? 'border-indigo-200 bg-gradient-to-r from-white via-indigo-50/20 to-white'
                      : 'border-slate-200 hover:border-indigo-300' 
                    : 'border-slate-200/60 bg-slate-50/50 opacity-75'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Worker Title & Metadata */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      worker.isRunning 
                        ? 'bg-amber-100 text-amber-700 animate-spin'
                        : isBroadcast
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : isDbMaintenance
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : worker.enabled 
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {worker.isRunning ? (
                        <RotateCw className="w-5 h-5" />
                      ) : isBroadcast ? (
                        <Zap className="w-5 h-5" />
                      ) : isDbMaintenance ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : worker.id.includes('webhook') ? (
                        <Radio className="w-5 h-5" />
                      ) : worker.id.includes('postiz') ? (
                        <Share2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{worker.name}</h4>
                        
                        {/* Cron Expression badge */}
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-600" />
                          <span>{worker.cronExpression || worker.intervalDescription}</span>
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                          worker.isRunning
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : worker.enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            worker.isRunning ? 'bg-amber-500' : worker.enabled ? 'bg-emerald-500' : 'bg-slate-500'
                          }`} />
                          {worker.isRunning ? 'Executando...' : worker.enabled ? 'Ativo' : 'Pausado'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                        {worker.description}
                      </p>
                    </div>
                  </div>

                  {/* Worker Statistics & Controls */}
                  <div className="flex items-center gap-2.5 self-end lg:self-auto flex-wrap">
                    {/* Stats pills */}
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      <span>Ciclos: <strong className="text-slate-900">{worker.totalRuns}</strong></span>
                      <span className="text-slate-300">|</span>
                      <span>Duração: <strong className="text-slate-900">{worker.lastDurationMs}ms</strong></span>
                      <span className="text-slate-300">|</span>
                      <span>Último: <strong className="text-slate-900">{timeSinceRun}</strong></span>
                    </div>

                    {/* Edit schedule button */}
                    <button
                      onClick={() => {
                        setEditingWorkerId(isEditing ? null : worker.id);
                        setNewCronExpression(worker.cronExpression || '* * * * *');
                      }}
                      className="p-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                      title="Editar Horário Cron"
                    >
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    </button>

                    {/* View Logs Button */}
                    <button
                      onClick={() => setSelectedLogsWorker(worker)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                      title="Ver logs de execução"
                    >
                      <Terminal className="w-3.5 h-3.5 text-slate-600" />
                      <span>Logs ({worker.recentLogs?.length || 0})</span>
                    </button>

                    {/* Trigger Now Button */}
                    <button
                      disabled={isTriggering || worker.isRunning}
                      onClick={() => handleTriggerWorker(worker.id)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      title="Forçar execução imediata agora"
                    >
                      <Play className={`w-3.5 h-3.5 fill-current ${isTriggering ? 'animate-pulse' : ''}`} />
                      <span>{isTriggering ? 'Executando...' : 'Executar Agora'}</span>
                    </button>

                    {/* Pause/Resume Toggle */}
                    <button
                      onClick={() => handleToggleWorker(worker.id, worker.enabled)}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                        worker.enabled 
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                      }`}
                      title={worker.enabled ? 'Pausar worker' : 'Ativar worker'}
                    >
                      {worker.enabled ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>
                  </div>
                </div>

                {/* Inline Cron Editor Form */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-700">Expressão node-cron:</span>
                      <input
                        type="text"
                        value={newCronExpression}
                        onChange={(e) => setNewCronExpression(e.target.value)}
                        className="px-3 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44"
                        placeholder="* * * * *"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setNewCronExpression('* * * * *')}
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-mono"
                        >
                          1m (* * * * *)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewCronExpression('*/5 * * * *')}
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-mono"
                        >
                          5m (*/5 * * * *)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewCronExpression('0 3 * * *')}
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-mono"
                        >
                          03:00 (0 3 * * *)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setEditingWorkerId(null)}
                        className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800"
                      >
                        Cancelar
                      </button>
                      <button
                        disabled={isSavingSchedule}
                        onClick={() => handleSaveSchedule(worker.id)}
                        className="px-3.5 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingSchedule ? 'Salvando...' : 'Salvar Horário'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logs Modal / Slide-in Drawer */}
      {selectedLogsWorker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedLogsWorker.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Expressão Cron: {selectedLogsWorker.cronExpression || selectedLogsWorker.intervalDescription} | node-cron
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogsWorker(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-2 select-text">
              {selectedLogsWorker.recentLogs?.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  Nenhum log registrado ainda. Acione o botão "Executar Agora" para gerar histórico imediato.
                </div>
              ) : (
                selectedLogsWorker.recentLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2 rounded-lg border ${
                      log.level === 'error' 
                        ? 'bg-rose-950/30 border-rose-900 text-rose-300' 
                        : log.level === 'warn'
                        ? 'bg-amber-950/30 border-amber-900 text-amber-300'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 mb-1">
                      <span>{new Date(log.timestamp).toLocaleTimeString()} ({log.timestamp})</span>
                      <span className={`uppercase font-bold ${
                        log.level === 'error' ? 'text-rose-400' : log.level === 'warn' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{log.level}</span>
                    </div>
                    <div>{log.message}</div>
                    {log.details && (
                      <pre className="mt-1 text-[10px] text-slate-400 overflow-x-auto bg-black/40 p-1.5 rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
              <span>Histórico retido em memória (últimos 30 ciclos)</span>
              <button
                onClick={() => setSelectedLogsWorker(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
