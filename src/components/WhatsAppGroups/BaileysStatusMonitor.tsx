import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Server, 
  Activity, 
  Wifi, 
  WifiOff, 
  Radio, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Pause, 
  Trash2, 
  Send, 
  QrCode, 
  Terminal, 
  Layers, 
  MessageSquare, 
  Image as ImageIcon, 
  Mic, 
  UserX, 
  Lock, 
  Unlock, 
  Filter, 
  ChevronRight, 
  Smartphone, 
  Cpu, 
  Database,
  ArrowUpRight,
  Sparkles,
  Search,
  CheckCheck
} from 'lucide-react';
import { 
  BaileysQueueItem, 
  BaileysGroupSyncStatus, 
  BaileysEventLog, 
  HybridWhatsAppEngineStatus 
} from '../../types';

interface BaileysStatusMonitorProps {
  engineStatus: HybridWhatsAppEngineStatus;
  queueItems: BaileysQueueItem[];
  groupStatuses: BaileysGroupSyncStatus[];
  eventLogs: BaileysEventLog[];
  onTriggerTestDispatch?: (groupJid: string, text: string) => void;
  onClearQueue?: () => void;
  onForceGroupSync?: (groupJid?: string) => void;
  onToggleQueuePause?: () => void;
  onToggleGroupMute?: (groupJid: string) => void;
}

export const BaileysStatusMonitor: React.FC<BaileysStatusMonitorProps> = ({
  engineStatus,
  queueItems: initialQueue,
  groupStatuses: initialGroupStatuses,
  eventLogs: initialLogs,
  onTriggerTestDispatch,
  onClearQueue,
  onForceGroupSync,
  onToggleQueuePause,
  onToggleGroupMute
}) => {
  // Sub-view in monitor
  const [monitorSubTab, setMonitorSubTab] = useState<'queue' | 'group_sync' | 'events' | 'session_debug'>('queue');
  
  // Local state for queue & simulation
  const [queue, setQueue] = useState<BaileysQueueItem[]>(initialQueue);
  const [groupStatuses, setGroupStatuses] = useState<BaileysGroupSyncStatus[]>(initialGroupStatuses);
  const [logs, setLogs] = useState<BaileysEventLog[]>(initialLogs);
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'queued' | 'sending' | 'delivered' | 'failed'>('all');
  const [groupSearch, setGroupSearch] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [pairingCodeMode, setPairingCodeMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nextDispatchCountdown, setNextDispatchCountdown] = useState(4);

  // Sync with props
  useEffect(() => {
    setQueue(initialQueue);
  }, [initialQueue]);

  useEffect(() => {
    setGroupStatuses(initialGroupStatuses);
  }, [initialGroupStatuses]);

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  // Toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Anti-ban countdown ticker
  useEffect(() => {
    if (isQueuePaused) return;
    const interval = setInterval(() => {
      setNextDispatchCountdown((prev) => (prev > 1 ? prev - 1 : 5));
    }, 1000);
    return () => clearInterval(interval);
  }, [isQueuePaused]);

  // Handle simulate new dispatch item
  const handleSimulateNewDispatch = () => {
    const target = groupStatuses[Math.floor(Math.random() * groupStatuses.length)];
    const newItem: BaileysQueueItem = {
      id: `queue_${Date.now()}`,
      targetGroupJid: target ? target.groupJid : '120363198273619283@g.us',
      groupName: target ? target.groupName : '💎 VIP Alpha Investidores #01',
      messageType: 'text',
      previewContent: `⚡ [Alerta Flash] Nova oportunidade detectada pelo bot às ${new Date().toLocaleTimeString('pt-BR')}.`,
      mentionAll: true,
      antiBanDelaySec: 5.5,
      scheduledAt: new Date().toISOString(),
      status: 'queued',
      ackStatus: 'PENDING',
      retryCount: 0
    };

    setQueue((prev) => [newItem, ...prev]);
    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        event: 'queue.push',
        level: 'info',
        details: `Mensagem enfileirada para "${newItem.groupName}" com delay anti-ban de 5.5s`,
        groupJid: newItem.targetGroupJid
      },
      ...prev
    ]);
    showToast('Nova mensagem adicionada à fila do Baileys!');
  };

  // Force re-sync
  const handleRefreshAll = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setGroupStatuses((prev) =>
        prev.map((g) => ({
          ...g,
          lastSyncTimestamp: new Date().toISOString(),
          pingMs: Math.floor(Math.random() * 40) + 65
        }))
      );
      setLogs((prev) => [
        {
          id: `log_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          event: 'group-metadata.refresh',
          level: 'success',
          details: `Re-sincronização forçada concluída com sucesso para ${groupStatuses.length} grupos.`
        },
        ...prev
      ]);
      showToast('Sincronização de grupos e sockets atualizada!');
      if (onForceGroupSync) onForceGroupSync();
    }, 900);
  };

  // Toggle Pause
  const handleTogglePause = () => {
    const nextState = !isQueuePaused;
    setIsQueuePaused(nextState);
    showToast(nextState ? 'Fila de disparos PAUSADA' : 'Fila de disparos RETOMADA');
    if (onToggleQueuePause) onToggleQueuePause();
  };

  // Filtered queue
  const filteredQueue = queue.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  // Filtered groups
  const filteredGroupStatuses = groupStatuses.filter(
    (g) =>
      g.groupName.toLowerCase().includes(groupSearch.toLowerCase()) ||
      g.groupJid.toLowerCase().includes(groupSearch.toLowerCase())
  );

  // Helper for message icon
  const getMessageTypeBadge = (type: BaileysQueueItem['messageType']) => {
    switch (type) {
      case 'text':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Texto
          </span>
        );
      case 'image':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> Imagem
          </span>
        );
      case 'audio_ptt':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <Mic className="w-3 h-3" /> Áudio PTT
          </span>
        );
      case 'kick_member':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
            <UserX className="w-3 h-3" /> Auto-Kick
          </span>
        );
      case 'mute_chat':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Silenciar Grupo
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
            {type}
          </span>
        );
    }
  };

  // Helper for Queue status badge
  const getQueueStatusBadge = (status: BaileysQueueItem['status']) => {
    switch (status) {
      case 'sending':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center gap-1 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" /> Enviando...
          </span>
        );
      case 'queued':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Na Fila
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <CheckCheck className="w-3 h-3 text-emerald-600" /> Entregue (Ack)
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Erro / Retry
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="baileys_status_monitor_root" className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero / Master Socket Status Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold relative">
              <Zap className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Motor Baileys Multi-Device (WhatsApp Socket Não-Oficial)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  SOCKET 100% ONLINE (v6.7.8)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sessão master: <code className="font-mono text-emerald-600 dark:text-emerald-400">{engineStatus.baileys.sessionId}</code> • Número: <strong>{engineStatus.baileys.connectedNumber}</strong>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
              <span>Sincronizar Sockets</span>
            </button>

            <button
              onClick={handleSimulateNewDispatch}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Adicionar Teste na Fila</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="py-2 px-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/70 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>QR Code / Pareamento</span>
            </button>
          </div>
        </div>

        {/* Real-time Health Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Latency Ping */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Latência WebSocket</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">82 ms</span>
              <span className="text-[10px] text-slate-400 font-semibold">ótima</span>
            </div>
          </div>

          {/* Outbox Pending */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fila de Disparos</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                {queue.filter((q) => q.status === 'queued' || q.status === 'sending').length} msgs
              </span>
              <span className="text-[10px] text-slate-400">pendentes</span>
            </div>
          </div>

          {/* Anti-Ban Interval */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Intervalo Anti-Ban</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-purple-600 dark:text-purple-400">4.5s - 8.0s</span>
              <span className="text-[10px] text-slate-400">humanizado</span>
            </div>
          </div>

          {/* Groups Connected */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Grupos Sincronizados</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {groupStatuses.length} salas
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">100% OK</span>
            </div>
          </div>

          {/* Heap Memory */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Consumo Heap RAM</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {engineStatus.baileys.heapMemoryMb || 68.4} MB
              </span>
              <span className="text-[10px] text-slate-400">Node.js</span>
            </div>
          </div>

          {/* Circuit Breaker */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Circuit Breaker</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">Fechado</span>
              <span className="text-[10px] text-slate-400">seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonitorSubTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              monitorSubTab === 'queue'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Fila de Disparos & Outbox</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
              monitorSubTab === 'queue' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
            }`}>
              {queue.length}
            </span>
          </button>

          <button
            onClick={() => setMonitorSubTab('group_sync')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              monitorSubTab === 'group_sync'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Status de Conexão por Grupo</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
              monitorSubTab === 'group_sync' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
            }`}>
              {groupStatuses.length}
            </span>
          </button>

          <button
            onClick={() => setMonitorSubTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              monitorSubTab === 'events'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console & Logs Baileys</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
              monitorSubTab === 'events' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
            }`}>
              {logs.length}
            </span>
          </button>
        </div>

        {/* Live Throttle Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-500 dark:text-slate-400">Próximo envio em:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{nextDispatchCountdown}s</span>
        </div>
      </div>

      {/* SUB-TAB 1: QUEUE MONITOR */}
      {monitorSubTab === 'queue' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filtrar:</span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'queued', label: 'Na Fila' },
                { id: 'sending', label: 'Enviando' },
                { id: 'delivered', label: 'Entregues' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Fila Pause / Clean */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePause}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isQueuePaused
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                }`}
              >
                {isQueuePaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isQueuePaused ? 'Retomar Fila' : 'Pausar Fila'}</span>
              </button>

              <button
                onClick={() => {
                  setQueue((prev) => prev.filter((q) => q.status === 'queued' || q.status === 'sending'));
                  showToast('Histórico de mensagens entregues limpo.');
                  if (onClearQueue) onClearQueue();
                }}
                className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Limpar itens já entregues da lista"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Concluídas</span>
              </button>
            </div>
          </div>

          {/* Queue Items Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Status & ACK</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Grupo Destino</th>
                    <th className="py-3 px-4">Conteúdo / Mensagem</th>
                    <th className="py-3 px-4">Anti-Ban Delay</th>
                    <th className="py-3 px-4">Latência</th>
                    <th className="py-3 px-4 text-right">Agendado / Enviado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getQueueStatusBadge(item.status)}
                          {item.ackStatus && (
                            <span className="text-[10px] font-mono text-slate-400 block pl-1">
                              {item.ackStatus}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getMessageTypeBadge(item.messageType)}
                      </td>

                      {/* Group Name & JID */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {item.groupName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                          {item.targetGroupJid}
                        </span>
                      </td>

                      {/* Message Preview */}
                      <td className="py-3 px-4 max-w-[320px]">
                        <p className="text-xs text-slate-700 dark:text-slate-300 truncate font-mono bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                          {item.previewContent}
                        </p>
                        {item.mentionAll && (
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-0.5 inline-block">
                            @todos habilitado
                          </span>
                        )}
                      </td>

                      {/* Anti-Ban Delay */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                          {item.antiBanDelaySec}s
                        </span>
                        <span className="text-[10px] text-slate-400 block">intervalo seguro</span>
                      </td>

                      {/* Latency */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.latencyMs ? (
                          <span className="font-mono text-emerald-600 font-bold">
                            {item.latencyMs}ms
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {item.dispatchedAt ? (
                          <span>{new Date(item.dispatchedAt).toLocaleTimeString('pt-BR')}</span>
                        ) : (
                          <span>{new Date(item.scheduledAt).toLocaleTimeString('pt-BR')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GROUP SYNC STATUS */}
      {monitorSubTab === 'group_sync' && (
        <div className="space-y-4">
          {/* Search Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar grupo ou JID..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="text-xs text-slate-500">
              Total de grupos no socket: <strong className="text-slate-900 dark:text-white">{groupStatuses.length}</strong>
            </div>
          </div>

          {/* Group Sync Cards / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGroupStatuses.map((grp) => (
              <div
                key={grp.groupJid}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 hover:border-emerald-200 dark:hover:border-emerald-800/80 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {grp.groupName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate mt-0.5">
                      {grp.groupJid}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sincronizado
                  </span>
                </div>

                {/* Status Badges Row */}
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {grp.memberCount} membros
                  </span>

                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                    {grp.role === 'superadmin' ? '👑 Super Administrador' : '🛡️ Administrador'}
                  </span>

                  {grp.announceOnly ? (
                    <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Somente Admins
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Aberto a Todos
                    </span>
                  )}
                </div>

                {/* Metrics Box */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Ping do Chat</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{grp.pingMs} ms</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Entrega</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{grp.deliveryRatePercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Fila Atual</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">{grp.queuedMessagesCount} msg</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Sync: {new Date(grp.lastSyncTimestamp).toLocaleTimeString('pt-BR')}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (onToggleGroupMute) onToggleGroupMute(grp.groupJid);
                        setGroupStatuses((prev) =>
                          prev.map((g) =>
                            g.groupJid === grp.groupJid ? { ...g, announceOnly: !g.announceOnly } : g
                          )
                        );
                        showToast(
                          grp.announceOnly
                            ? `Grupo "${grp.groupName}" aberto para todos os membros.`
                            : `Grupo "${grp.groupName}" fechado (somente admins enviam).`
                        );
                      }}
                      className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {grp.announceOnly ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
                      <span>{grp.announceOnly ? 'Abrir Chat' : 'Fechar Chat'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onTriggerTestDispatch) {
                          onTriggerTestDispatch(grp.groupJid, `Ping de verificação Baileys ${new Date().toLocaleTimeString()}`);
                        }
                        showToast(`Ping enviado para o grupo "${grp.groupName}"`);
                      }}
                      className="py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Testar Envio</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REAL-TIME EVENT LOGS */}
      {monitorSubTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold font-mono tracking-tight">
                Baileys Socket Event Stream [stdout/stderr]
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLogs([]);
                  showToast('Logs limpos.');
                }}
                className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer"
              >
                Limpar Console
              </button>
            </div>
          </div>

          {/* Terminal Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl font-mono text-xs text-slate-300 space-y-2 max-h-[460px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/60 p-1.5 rounded transition-colors">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                    log.level === 'success'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : log.level === 'warn'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : log.level === 'error'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}
                >
                  {log.event}
                </span>
                <span className="text-slate-200 break-all">{log.details}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR CODE / PAIRING CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Conectar Sessão Baileys
                  </h3>
                  <p className="text-xs text-slate-500">
                    Escaneie o QR Code ou use o Código de Pareamento
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Toggle QR vs Pairing code */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setPairingCodeMode(false)}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  !pairingCodeMode ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                Escanear QR Code
              </button>
              <button
                onClick={() => setPairingCodeMode(true)}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  pairingCodeMode ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                Código de Pareamento (8 Dígitos)
              </button>
            </div>

            {/* Content Box */}
            {!pairingCodeMode ? (
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="w-52 h-52 bg-white p-3 rounded-2xl shadow-md flex items-center justify-center border-2 border-emerald-500 relative">
                  {/* Mock animated QR */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MANYFLOW_BAILEYS_AUTH_SOCKET_v6.7_PAIRING"
                    alt="QR Code Baileys"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 text-center max-w-xs">
                  Abra o WhatsApp no celular ➔ Aparelhos Conectados ➔ Conectar Aparelho e aponte para a tela.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <span className="text-xs font-bold text-slate-500">Digite este código no seu celular:</span>
                <div className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-md">
                  <span className="font-mono text-2xl font-black tracking-widest text-emerald-600 dark:text-emerald-400">
                    MF89 - 22LK
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 text-center max-w-xs">
                  No WhatsApp, clique em &quot;Conectar com número de telefone&quot; e informe os dígitos acima.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setShowQrModal(false);
                showToast('Sessão Baileys atualizada com sucesso!');
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              Concluir & Validar Conexão
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
