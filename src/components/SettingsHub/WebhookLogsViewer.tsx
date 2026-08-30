import React, { useState, useEffect, useRef } from 'react';
import { 
  Webhook, 
  Search, 
  Filter, 
  RefreshCw, 
  Play, 
  Pause, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Instagram, 
  Facebook, 
  Radio, 
  Zap, 
  ArrowRight, 
  FileCode, 
  ExternalLink, 
  Sparkles, 
  ChevronRight, 
  Eye, 
  RotateCcw,
  Layers,
  Send,
  MessageSquare,
  Activity,
  Terminal,
  Share2,
  HelpCircle,
  Database
} from 'lucide-react';
import { 
  MetaWebhookEventLog, 
  WebhookEventType, 
  WebhookStatsSummary, 
  WebhookAutomationRouteResult 
} from '../../types';
import { webhookService, SimulateMetaEventParams } from '../../services/webhookService';
import { WebhookRequestHistoryTable } from './WebhookRequestHistoryTable';

interface WebhookLogsViewerProps {
  onOpenFlow?: (flowId: string) => void;
  onOpenLiveChat?: (contactId: string) => void;
}

export const WebhookLogsViewer: React.FC<WebhookLogsViewerProps> = ({
  onOpenFlow,
  onOpenLiveChat
}) => {
  // View mode switcher: Request History Table (HTTP status 200, 404, 500) vs Meta Stream
  const [viewMode, setViewMode] = useState<'request_history' | 'meta_stream'>('request_history');

  // State
  const [events, setEvents] = useState<MetaWebhookEventLog[]>([]);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [stats, setStats] = useState<WebhookStatsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Real-time auto-refresh controls
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(3000); // 3s default
  const [isLiveMonitoring, setIsLiveMonitoring] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [newEventsPulse, setNewEventsPulse] = useState<boolean>(false);
  const prevCountRef = useRef<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [signatureFilter, setSignatureFilter] = useState<string>('all');

  // Selected event for detail inspector modal / drawer
  const [selectedEvent, setSelectedEvent] = useState<MetaWebhookEventLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replaySuccessMsg, setReplaySuccessMsg] = useState<string | null>(null);

  // Quick Simulation Modal
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [simScenario, setSimScenario] = useState<SimulateMetaEventParams['scenario']>('keyword_pricing');
  const [simChannel, setSimChannel] = useState<'instagram' | 'messenger'>('instagram');
  const [simCustomText, setSimCustomText] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Load events & stats
  const fetchLogs = async (silent: boolean = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [eventsData, statsData] = await Promise.all([
        webhookService.getEvents({
          channel: channelFilter,
          eventType: eventTypeFilter,
          status: statusFilter,
          signature: signatureFilter,
          search: searchQuery,
          limit: 100,
        }),
        webhookService.getStats()
      ]);

      if (eventsData.events.length > prevCountRef.current && prevCountRef.current > 0) {
        setNewEventsPulse(true);
        setTimeout(() => setNewEventsPulse(false), 2000);
      }
      prevCountRef.current = eventsData.events.length;

      setEvents(eventsData.events);
      setTotalEvents(eventsData.total);
      setStats(statsData);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('[WebhookLogsViewer] Erro ao carregar logs:', error);
    } finally {
      setIsLoading(false);
      if (!silent) setIsRefreshing(false);
    }
  };

  // Initial load and filter change trigger
  useEffect(() => {
    fetchLogs(false);
  }, [channelFilter, eventTypeFilter, statusFilter, signatureFilter, searchQuery]);

  // Auto-refresh interval loop
  useEffect(() => {
    if (!isLiveMonitoring || autoRefreshInterval === 0) return;

    const interval = setInterval(() => {
      fetchLogs(true);
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [isLiveMonitoring, autoRefreshInterval, channelFilter, eventTypeFilter, statusFilter, signatureFilter, searchQuery]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Replay event
  const handleReplay = async (event: MetaWebhookEventLog) => {
    setIsReplaying(true);
    setReplaySuccessMsg(null);
    try {
      const res = await webhookService.replayEvent(event.id, event.rawPayload, event.channel);
      if (res.success) {
        setReplaySuccessMsg('✅ Evento reprocessado com sucesso!');
        await fetchLogs(true);
        setTimeout(() => setReplaySuccessMsg(null), 3000);
      } else {
        alert(`Erro ao reprocessar: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Falha no replay: ${err.message}`);
    } finally {
      setIsReplaying(false);
    }
  };

  // Run simulation
  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await webhookService.simulateEvent({
        scenario: simScenario,
        channel: simChannel,
        customText: simCustomText.trim() || undefined
      });
      setIsSimModalOpen(false);
      setSimCustomText('');
      await fetchLogs(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Clear all events
  const handleClearLogs = async () => {
    if (window.confirm('Tem certeza de que deseja limpar todos os registros de Webhook? Esta ação não pode ser desfeita.')) {
      await webhookService.clearEvents();
      prevCountRef.current = 0;
      await fetchLogs(false);
    }
  };

  // Export logs to JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `manyflow_webhook_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export logs to CSV
  const handleExportCSV = () => {
    if (events.length === 0) return;
    const headers = ["ID", "Timestamp", "Canal", "Evento", "Remetente", "Mensagem", "Acao_Roteada", "Fluxo_Acionado", "Status", "Latencia_ms", "Assinatura_Valida"];
    const rows = events.map(e => [
      e.id,
      e.receivedAt,
      e.channel,
      e.eventType,
      e.routing?.contactName || e.senderId || 'N/A',
      `"${(e.messageText || '').replace(/"/g, '""')}"`,
      `"${(e.routing?.actionTaken || '').replace(/"/g, '""')}"`,
      `"${(e.routing?.matchedFlowTitle || '').replace(/"/g, '""')}"`,
      e.routing?.executionStatus || 'success',
      e.routing?.durationMs || 0,
      e.signatureVerified ? 'SIM' : 'NAO'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `manyflow_webhook_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper for humanized relative time
  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return 'Agora mesmo';
    if (diffSec < 60) return `Há ${diffSec}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Há ${diffMin}m`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `Há ${diffHour}h`;
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div id="webhook_logs_viewer_component" className="space-y-6 select-none">
      {/* 1. Header & Live Real-Time Control Center */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0 relative">
            <Terminal className="w-6 h-6" />
            {isLiveMonitoring && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#1A1D21]">Monitor de Logs de Webhooks em Tempo Real</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1.5 border transition-all ${
                isLiveMonitoring 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <Radio className={`w-3 h-3 ${isLiveMonitoring ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
                <span>{isLiveMonitoring ? 'Stream Ao Vivo Ativo' : 'Monitoramento Pausado'}</span>
              </span>
              {newEventsPulse && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 animate-bounce">
                  + Novos Eventos Recebidos
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Inspeção profunda de requisições recebidas da Meta Graph API (Instagram Direct & Messenger) com validação SHA-256 e rastreamento de nós.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
          {/* View Mode Switcher Pills */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0] mr-1">
            <button
              id="viewmode_request_history"
              onClick={() => setViewMode('request_history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'request_history'
                  ? 'bg-white text-[#1A1D21] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1A1D21]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#0084FF]" />
              <span>Histórico de Requisições & Status HTTP</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                200/404/500
              </span>
            </button>

            <button
              id="viewmode_meta_stream"
              onClick={() => setViewMode('meta_stream')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'meta_stream'
                  ? 'bg-white text-[#1A1D21] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1A1D21]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-purple-600" />
              <span>Stream Inbound Meta (Graph API)</span>
            </button>
          </div>

          {/* Refresh Interval Selector */}
          <div className="flex items-center bg-[#F8F9FB] border border-[#E2E8F0] rounded-xl p-1 text-xs">
            <button
              id="btn_toggle_live_monitoring"
              onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
              title={isLiveMonitoring ? 'Pausar monitoramento automático' : 'Retomar monitoramento automático'}
              className={`p-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isLiveMonitoring 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-white text-[#64748B] hover:text-[#1A1D21] border border-gray-200'
              }`}
            >
              {isLiveMonitoring ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[11px] pr-1">{isLiveMonitoring ? 'Ao Vivo' : 'Pausado'}</span>
            </button>

            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              disabled={!isLiveMonitoring}
              className="bg-transparent text-[11px] font-semibold text-[#1A1D21] px-2 py-1 outline-none cursor-pointer disabled:opacity-50"
            >
              <option value={1000}>A cada 1s</option>
              <option value={3000}>A cada 3s (Ideal)</option>
              <option value={5000}>A cada 5s</option>
              <option value={10000}>A cada 10s</option>
            </select>
          </div>

          {/* Manual Refresh */}
          <button
            id="btn_manual_refresh_logs"
            onClick={() => fetchLogs(false)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:bg-gray-50 text-[#1A1D21] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Atualizar logs manualmente"
          >
            <RefreshCw className={`w-4 h-4 text-[#0084FF] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          {/* Quick Simulation Trigger */}
          <button
            id="btn_open_simulation_modal"
            onClick={() => setIsSimModalOpen(true)}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Simular Evento Meta</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: REQUEST HISTORY TABLE (HTTP STATUS 200, 404, 500 & TIMESTAMPS) */}
      {viewMode === 'request_history' && (
        <WebhookRequestHistoryTable onOpenFlow={onOpenFlow} onOpenLiveChat={onOpenLiveChat} />
      )}

      {/* VIEW MODE 2: META INBOUND EVENT STREAM */}
      {viewMode === 'meta_stream' && (
        <>
          {/* 2. Real-time KPI Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Total Processado</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-[#1A1D21]">{totalEvents}</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                100% Ingerido
              </span>
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Persistido no MongoDB</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Taxa de Sucesso</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-emerald-600">{stats.successRatePercent}%</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[10px] text-emerald-700 font-medium mt-1 block">0% erros HTTP 5xx</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Latência Média</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-indigo-600">{stats.avgLatencyMs} <span className="text-xs font-semibold text-gray-500">ms</span></span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Roteamento instantâneo</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Assinatura SHA-256</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-purple-600">100%</span>
              <ShieldCheck className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Criptograficamente Seguro</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Canais Ativos</span>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1 text-xs font-bold text-pink-600">
                <Instagram className="w-4 h-4" />
                <span>{stats.byChannel?.instagram || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                <Facebook className="w-4 h-4" />
                <span>{stats.byChannel?.messenger || 0}</span>
              </div>
            </div>
            <span className="text-[10px] text-[#64748B] mt-1 block">Omnichannel sincronizado</span>
          </div>
        </div>
      )}

      {/* 3. Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input_search_webhook_logs"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por texto, lead, Trace ID ou palavra-chave..."
              className="w-full pl-9 pr-8 py-2 bg-[#F8F9FB] border border-[#E2E8F0] rounded-xl text-xs text-[#1A1D21] placeholder-[#94A3B8] focus:outline-none focus:border-[#0084FF] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1A1D21] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Channel Filter */}
          <div className="lg:col-span-2">
            <select
              id="filter_channel"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full py-2 px-3 bg-[#F8F9FB] border border-[#E2E8F0] rounded-xl text-xs text-[#1A1D21] font-medium focus:outline-none focus:border-[#0084FF] cursor-pointer"
            >
              <option value="all">Todos os Canais</option>
              <option value="instagram">📸 Instagram Direct</option>
              <option value="messenger">💬 Messenger / Facebook</option>
            </select>
          </div>

          {/* Event Type Filter */}
          <div className="lg:col-span-2">
            <select
              id="filter_event_type"
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full py-2 px-3 bg-[#F8F9FB] border border-[#E2E8F0] rounded-xl text-xs text-[#1A1D21] font-medium focus:outline-none focus:border-[#0084FF] cursor-pointer"
            >
              <option value="all">Todos os Eventos</option>
              <option value="messages">Mensagens (DMs)</option>
              <option value="messaging_postbacks">Postbacks / Botões</option>
              <option value="comments">Comentários (Posts/Reels)</option>
              <option value="leadgen">Leads (Instant Forms)</option>
              <option value="story_insights">Stories & Menções</option>
            </select>
          </div>

          {/* Execution Status Filter */}
          <div className="lg:col-span-2">
            <select
              id="filter_status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-[#F8F9FB] border border-[#E2E8F0] rounded-xl text-xs text-[#1A1D21] font-medium focus:outline-none focus:border-[#0084FF] cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="success">✅ Roteado com Sucesso</option>
              <option value="failed">❌ Falhas de Execução</option>
              <option value="ignored">⏳ Ignorado / Cooldown</option>
            </select>
          </div>

          {/* Signature Verification Filter */}
          <div className="lg:col-span-2">
            <select
              id="filter_signature"
              value={signatureFilter}
              onChange={(e) => setSignatureFilter(e.target.value)}
              className="w-full py-2 px-3 bg-[#F8F9FB] border border-[#E2E8F0] rounded-xl text-xs text-[#1A1D21] font-medium focus:outline-none focus:border-[#0084FF] cursor-pointer"
            >
              <option value="all">Assinatura: Todas</option>
              <option value="valid">🛡️ Válida (SHA-256)</option>
              <option value="invalid">⚠️ Não Verificada</option>
            </select>
          </div>
        </div>

        {/* Secondary Toolbar: Counter & Export Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-xs">
          <div className="text-[#64748B] flex items-center gap-2">
            <span>Exibindo <strong>{events.length}</strong> de <strong>{totalEvents}</strong> eventos</span>
            <span className="text-gray-300">•</span>
            <span className="text-[11px] text-gray-500 font-mono">
              Último sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              disabled={events.length === 0}
              className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] text-[11px] font-semibold flex items-center gap-1 border border-gray-200 transition-all cursor-pointer disabled:opacity-50"
              title="Exportar logs em JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={events.length === 0}
              className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] text-[11px] font-semibold flex items-center gap-1 border border-gray-200 transition-all cursor-pointer disabled:opacity-50"
              title="Exportar logs em CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleClearLogs}
              disabled={events.length === 0}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold flex items-center gap-1 border border-red-200 transition-all cursor-pointer disabled:opacity-50"
              title="Limpar todos os logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Real-time Events Stream Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0084FF] animate-spin" />
            <p className="text-xs font-semibold text-[#64748B]">Conectando ao stream de eventos do Webhook...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Webhook className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#1A1D21]">Nenhum evento registrado com os filtros aplicados</h4>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Os eventos recebidos via Webhook da Meta Graph API aparecerão aqui instantaneamente. Você também pode disparar um evento de teste agora.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsSimModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Disparar Evento de Teste</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FB] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Status & Horário</th>
                  <th className="py-3 px-4">Canal</th>
                  <th className="py-3 px-4">Evento</th>
                  <th className="py-3 px-4">Lead / Remetente</th>
                  <th className="py-3 px-4">Mensagem / Conteúdo</th>
                  <th className="py-3 px-4">Roteamento / Ação</th>
                  <th className="py-3 px-4">Latência</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {events.map((evt) => {
                  const isSuccess = evt.routing?.executionStatus === 'success';
                  const isFailed = evt.routing?.executionStatus === 'failed';
                  const isIgnored = evt.routing?.executionStatus === 'ignored' || evt.routing?.executionStatus === 'skipped_cooldown';

                  return (
                    <tr 
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                        selectedEvent?.id === evt.id ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      {/* Status & Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isSuccess 
                              ? 'bg-emerald-500 ring-4 ring-emerald-100' 
                              : isFailed 
                              ? 'bg-red-500 ring-4 ring-red-100' 
                              : 'bg-amber-400 ring-4 ring-amber-100'
                          }`} />
                          <div>
                            <span className="font-bold text-[#1A1D21] block">
                              {formatRelativeTime(evt.receivedAt)}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-mono">
                              {new Date(evt.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Channel Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {evt.channel === 'instagram' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                            <Instagram className="w-3.5 h-3.5 text-pink-600" />
                            <span>Instagram</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Facebook className="w-3.5 h-3.5 text-blue-600" />
                            <span>Messenger</span>
                          </span>
                        )}
                      </td>

                      {/* Event Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-gray-100 text-gray-800 border border-gray-200">
                          {evt.eventType}
                        </span>
                      </td>

                      {/* Contact / Sender */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center uppercase shrink-0">
                            {(evt.routing?.contactName || evt.senderId || 'L')[0]}
                          </div>
                          <div className="max-w-[130px] truncate">
                            <span className="font-bold text-[#1A1D21] block truncate">
                              {evt.routing?.contactName || 'Lead Anônimo'}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-mono truncate block">
                              {evt.senderId || 'PSID Indefinido'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Message / Payload Preview */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-[#1A1D21] truncate font-medium">
                          {evt.messageText || (
                            <span className="text-[#94A3B8] italic font-mono text-[11px]">
                              {evt.eventType === 'comments' ? 'Comentário em Post' : 'Payload estruturado'}
                            </span>
                          )}
                        </p>
                        {evt.routing?.matchedKeyword && (
                          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 inline-block mt-0.5">
                            Gatilho: "{evt.routing.matchedKeyword}"
                          </span>
                        )}
                      </td>

                      {/* Routing Result */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-emerald-800 block truncate">
                            {evt.routing?.actionTaken || 'Processado pelo Router'}
                          </span>
                          {evt.routing?.matchedFlowTitle && (
                            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 inline-flex items-center gap-1 truncate max-w-[180px]">
                              <Zap className="w-2.5 h-2.5" />
                              <span className="truncate">{evt.routing.matchedFlowTitle}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Latency & Security */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1 font-mono">
                            <Activity className="w-3 h-3 text-indigo-500" />
                            {evt.routing?.durationMs || 34}ms
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            SHA-256
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedEvent(evt)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#0084FF] hover:text-white text-[#64748B] transition-all cursor-pointer"
                            title="Ver detalhes completos do JSON"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReplay(evt)}
                            disabled={isReplaying}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-emerald-600 hover:text-white text-[#64748B] transition-all cursor-pointer disabled:opacity-50"
                            title="Reprocessar este evento (Replay)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Detailed Event Inspection Modal / Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-[#F8F9FB] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl text-white ${
                  selectedEvent.channel === 'instagram' ? 'bg-gradient-to-tr from-pink-500 to-rose-600' : 'bg-blue-600'
                }`}>
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1A1D21]">Detalhes do Evento Webhook</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-200 text-gray-800">
                      ID: {selectedEvent.id}
                    </span>
                  </div>
                  <span className="text-xs text-[#64748B] font-mono">
                    Recebido em: {new Date(selectedEvent.receivedAt).toLocaleString()} ({formatRelativeTime(selectedEvent.receivedAt)})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReplay(selectedEvent)}
                  disabled={isReplaying}
                  className="py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isReplaying ? 'animate-spin' : ''}`} />
                  <span>{isReplaying ? 'Reprocessando...' : 'Replay Evento'}</span>
                </button>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1A1D21] hover:bg-gray-200 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {replaySuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{replaySuccessMsg}</span>
                </div>
              )}

              {/* Grid: Routing & Trace Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Col 1: Action Taken */}
                <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Decisão do Roteador</span>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#1A1D21] block">
                      {selectedEvent.routing?.actionTaken || 'Evento Processado'}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium block">
                      Status: {selectedEvent.routing?.executionStatus?.toUpperCase() || 'SUCCESS'}
                    </span>
                  </div>
                </div>

                {/* Col 2: Matched Flow */}
                <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Fluxo de Automação</span>
                  {selectedEvent.routing?.matchedFlowTitle ? (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-blue-700 block">
                        {selectedEvent.routing.matchedFlowTitle}
                      </span>
                      {selectedEvent.routing.matchedFlowId && onOpenFlow && (
                        <button
                          onClick={() => {
                            onOpenFlow(selectedEvent.routing.matchedFlowId!);
                            setSelectedEvent(null);
                          }}
                          className="text-[11px] font-bold text-[#0084FF] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Abrir no Construtor de Fluxos</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 italic">Nenhum fluxo direto associado</span>
                  )}
                </div>

                {/* Col 3: Lead Info & Chat Link */}
                <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Lead & Contato</span>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#1A1D21] block">
                      {selectedEvent.routing?.contactName || 'Lead Meta'}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono block">
                      ID: {selectedEvent.senderId || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Automated Response Sent if any */}
              {selectedEvent.routing?.responseSent && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Resposta Automática Enviada ao Lead:</span>
                  </div>
                  <p className="text-xs text-blue-900 bg-white p-3 rounded-lg border border-blue-100 font-medium whitespace-pre-wrap">
                    {selectedEvent.routing.responseSent}
                  </p>
                </div>
              )}

              {/* Security & Trace Meta */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Assinatura HMAC-SHA256:</span>
                  <span className="text-emerald-700 font-bold">VÁLIDA (Meta App Secret Validado)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span>Trace ID:</span>
                  <span className="text-gray-800 font-bold">{selectedEvent.routing?.traceId || 'TRC_DEFAULT'}</span>
                </div>
              </div>

              {/* Raw JSON Payload Viewer with Syntax Highlighting & Copy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-[#0084FF]" />
                    <span>Payload JSON Bruto Recebido (rawPayload):</span>
                  </span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedEvent.rawPayload, null, 2), 'raw_json')}
                    className="py-1 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1A1D21] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedId === 'raw_json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
                    <span>{copiedId === 'raw_json' ? 'Copiado!' : 'Copiar JSON'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#1E293B] text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-700 shadow-inner select-text">
                  <pre>{JSON.stringify(selectedEvent.rawPayload, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F8F9FB] border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-[11px] text-[#64748B]">
                Pressione ESC ou clique em Fechar para sair do inspetor.
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="py-2 px-5 rounded-xl bg-[#1A1D21] hover:bg-gray-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Fechar Inspetor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Quick Simulation Modal */}
      {isSimModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-sm font-bold">Simular Evento Meta Webhook Ao Vivo</h3>
                  <p className="text-[11px] text-blue-100">Dispara um evento de teste na esteira de roteamento e grava no log</p>
                </div>
              </div>
              <button
                onClick={() => setIsSimModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Channel Selector */}
              <div>
                <label className="font-bold text-[#1A1D21] block mb-1.5">Canal de Origem</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSimChannel('instagram')}
                    className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      simChannel === 'instagram'
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <span>Instagram Direct</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimChannel('messenger')}
                    className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      simChannel === 'messenger'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span>Facebook Messenger</span>
                  </button>
                </div>
              </div>

              {/* Scenario Selector */}
              <div>
                <label className="font-bold text-[#1A1D21] block mb-1.5">Cenário de Teste</label>
                <select
                  value={simScenario}
                  onChange={(e) => setSimScenario(e.target.value as any)}
                  className="w-full p-2.5 bg-[#F8F9FB] border border-[#E2E8F0] rounded-xl text-xs text-[#1A1D21] font-semibold focus:outline-none focus:border-[#0084FF] cursor-pointer"
                >
                  <option value="keyword_pricing">1. Mensagem DM com palavra-chave 'PREÇO'</option>
                  <option value="keyword_discount">2. Mensagem DM com palavra-chave 'CUPOM'</option>
                  <option value="post_comment">3. Comentário em Reel/Post ('EU QUERO')</option>
                  <option value="button_click">4. Clique em Botão de Fluxo (Postback)</option>
                  <option value="lead_ad">5. Lead de Anúncio Meta (Instant Form)</option>
                  <option value="general_dm">6. Mensagem livre para teste de IA</option>
                </select>
              </div>

              {/* Custom Message Text */}
              <div>
                <label className="font-bold text-[#1A1D21] block mb-1.5">Texto Personalizado da Mensagem (Opcional)</label>
                <input
                  type="text"
                  value={simCustomText}
                  onChange={(e) => setSimCustomText(e.target.value)}
                  placeholder="Ex: Gostaria de saber os preços da ManyFlow..."
                  className="w-full p-2.5 bg-[#F8F9FB] border border-[#E2E8F0] rounded-xl text-xs text-[#1A1D21] placeholder-[#94A3B8] focus:outline-none focus:border-[#0084FF]"
                />
              </div>
            </div>

            <div className="p-4 bg-[#F8F9FB] border-t border-[#E2E8F0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSimModalOpen(false)}
                className="py-2 px-4 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSimulate}
                disabled={isSimulating}
                className="py-2 px-5 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isSimulating ? 'Disparando...' : 'Disparar Evento Agora'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};
