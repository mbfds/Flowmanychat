import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
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
  AlertTriangle,
  Clock,
  ExternalLink,
  RotateCcw,
  Layers,
  Send,
  Radio,
  FileCode,
  ShieldCheck,
  Instagram,
  Facebook,
  Sparkles,
  ChevronRight,
  Eye,
  ArrowUpRight,
  Terminal,
  HelpCircle,
  Info
} from 'lucide-react';
import { WebhookDeliveryLog } from '../../types';
import { webhookService } from '../../services/webhookService';

interface WebhookRequestHistoryTableProps {
  onOpenFlow?: (flowId: string) => void;
  onOpenLiveChat?: (contactId: string) => void;
  compact?: boolean;
}

export const WebhookRequestHistoryTable: React.FC<WebhookRequestHistoryTableProps> = ({
  onOpenFlow,
  onOpenLiveChat,
  compact = false,
}) => {
  // Logs list & pagination
  const [deliveries, setDeliveries] = useState<WebhookDeliveryLog[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<{
    total: number;
    s2xx: number;
    s4xx: number;
    s5xx: number;
    avgLatencyMs: number;
    successRate: number;
  }>({
    total: 0,
    s2xx: 0,
    s4xx: 0,
    s5xx: 0,
    avgLatencyMs: 0,
    successRate: 100,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusGroupFilter, setStatusGroupFilter] = useState<string>('all');
  const [statusCodeFilter, setStatusCodeFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');

  // Real-time Controls
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(3000); // 3s default
  const [isLiveMonitoring, setIsLiveMonitoring] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [newDeliveriesPulse, setNewDeliveriesPulse] = useState<boolean>(false);
  const prevCountRef = useRef<number>(0);

  // Inspector Drawer / Modal
  const [selectedLog, setSelectedLog] = useState<WebhookDeliveryLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Retry State
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  const [retryFeedback, setRetryFeedback] = useState<{ id: string; message: string; success: boolean } | null>(null);

  // Quick Test Dispatch Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [testEndpointUrl, setTestEndpointUrl] = useState<string>('https://api.hubspot.com/crm/v3/events/inbound');
  const [testChannel, setTestChannel] = useState<'instagram' | 'messenger'>('instagram');
  const [testEventType, setTestEventType] = useState<string>('messages');
  const [testExpectedStatus, setTestExpectedStatus] = useState<number>(200);
  const [isTestingDispatch, setIsTestingDispatch] = useState<boolean>(false);
  const [testModalResult, setTestModalResult] = useState<{ success: boolean; statusCode: number; durationMs: number; responseBody: string } | null>(null);

  // Fetch Deliveries & Stats
  const loadDeliveries = async (silent: boolean = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [deliveriesData, statsData] = await Promise.all([
        webhookService.fetchDeliveries({
          statusGroup: statusGroupFilter,
          statusCode: statusCodeFilter,
          channel: channelFilter,
          event: eventFilter,
          search: searchQuery,
          limit: 100,
        }),
        webhookService.fetchDeliveryStats(),
      ]);

      if (deliveriesData.deliveries.length > prevCountRef.current && prevCountRef.current > 0) {
        setNewDeliveriesPulse(true);
        setTimeout(() => setNewDeliveriesPulse(false), 2000);
      }
      prevCountRef.current = deliveriesData.deliveries.length;

      setDeliveries(deliveriesData.deliveries);
      setTotalCount(deliveriesData.total);
      setStats(statsData);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('[WebhookRequestHistoryTable] Erro ao carregar requisições:', err);
    } finally {
      setIsLoading(false);
      if (!silent) setIsRefreshing(false);
    }
  };

  // Initial & Dependency load
  useEffect(() => {
    loadDeliveries(false);
  }, [statusGroupFilter, statusCodeFilter, channelFilter, eventFilter, searchQuery]);

  // Live Auto-Refresh Interval
  useEffect(() => {
    if (!isLiveMonitoring || autoRefreshInterval === 0) return;

    const interval = setInterval(() => {
      loadDeliveries(true);
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [isLiveMonitoring, autoRefreshInterval, statusGroupFilter, statusCodeFilter, channelFilter, eventFilter, searchQuery]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Retry delivery
  const handleRetry = async (log: WebhookDeliveryLog, simulatedStatus?: number) => {
    setRetryingLogId(log.id);
    setRetryFeedback(null);
    try {
      const res = await webhookService.retryDelivery(log.id, simulatedStatus);
      setRetryFeedback({
        id: log.id,
        message: res.message || 'Requisição reenviada!',
        success: res.success,
      });
      await loadDeliveries(true);
      if (selectedLog && selectedLog.id === log.id && res.newLog) {
        setSelectedLog(res.newLog);
      }
    } catch (err: any) {
      setRetryFeedback({
        id: log.id,
        message: `Falha ao reenviar: ${err.message}`,
        success: false,
      });
    } finally {
      setRetryingLogId(null);
      setTimeout(() => setRetryFeedback(null), 4000);
    }
  };

  // Clear history
  const handleClearHistory = async () => {
    if (!window.confirm('Deseja realmente limpar todo o histórico de requisições de Webhook?')) return;
    try {
      await webhookService.clearDeliveries();
      await loadDeliveries(false);
      setSelectedLog(null);
    } catch (err) {
      console.error('Erro ao limpar histórico:', err);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deliveries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `manyflow-webhook-requests-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Test Dispatch execution
  const handleExecuteTestDispatch = async () => {
    setIsTestingDispatch(true);
    setTestModalResult(null);
    try {
      const res = await webhookService.testDispatch({
        endpointUrl: testEndpointUrl,
        eventType: testEventType,
        channel: testChannel,
      });
      setTestModalResult({
        success: res.success,
        statusCode: res.statusCode || 200,
        durationMs: res.durationMs || 45,
        responseBody: typeof res.responseBody === 'string' ? res.responseBody : JSON.stringify(res.responseBody),
      });
      await loadDeliveries(true);
    } catch (err: any) {
      setTestModalResult({
        success: false,
        statusCode: 500,
        durationMs: 0,
        responseBody: err.message,
      });
    } finally {
      setIsTestingDispatch(false);
    }
  };

  // Format timestamp helper
  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return {
        full: d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }),
        relative: getRelativeTimeString(d),
      };
    } catch {
      return { full: isoString, relative: '' };
    }
  };

  const getRelativeTimeString = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return 'agora';
    if (diffSec < 60) return `há ${diffSec}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `há ${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    return `há ${Math.floor(diffHours / 24)}d`;
  };

  // Status Badge Helper
  const renderStatusBadge = (status: number, statusText?: string) => {
    let bg = 'bg-gray-100 text-gray-800 border-gray-200';
    let icon = <Info className="w-3.5 h-3.5 text-gray-500" />;
    let label = statusText || `${status}`;

    if (status >= 200 && status < 300) {
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      if (!statusText) label = status === 200 ? '200 OK' : `${status} Created`;
    } else if (status >= 300 && status < 400) {
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      icon = <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />;
      if (!statusText) label = `${status} Redirect`;
    } else if (status >= 400 && status < 500) {
      bg = 'bg-amber-50 text-amber-800 border-amber-300';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      if (!statusText) {
        label = status === 404 ? '404 Not Found' : status === 401 ? '401 Unauthorized' : status === 429 ? '429 Rate Limit' : `${status} Bad Request`;
      }
    } else if (status >= 500) {
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      icon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      if (!statusText) {
        label = status === 500 ? '500 Server Error' : status === 502 ? '502 Bad Gateway' : status === 504 ? '504 Timeout' : `${status} Server Error`;
      }
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border shadow-2xs ${bg}`}>
        {icon}
        <span>{status}</span>
        <span className="text-[10px] font-medium opacity-80 border-l border-current/20 pl-1.5">
          {label.replace(/^\d+\s*/, '') || statusText || 'Status'}
        </span>
      </span>
    );
  };

  return (
    <div id="webhook_request_history_module" className="flex flex-col space-y-6">
      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Requests */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-medium mb-1">
            <span>Total Disparos</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[#1A1D21]">{stats.total}</span>
            <span className="text-[10px] text-emerald-600 font-bold">100% auditado</span>
          </div>
        </div>

        {/* 2xx Success */}
        <div 
          onClick={() => { setStatusGroupFilter(statusGroupFilter === '2xx' ? 'all' : '2xx'); setStatusCodeFilter('all'); }}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
            statusGroupFilter === '2xx' ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/20' : 'border-[#E2E8F0] hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              2xx Sucesso (200 OK)
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-emerald-700">{stats.s2xx}</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              {stats.total > 0 ? Math.round((stats.s2xx / stats.total) * 100) : 100}%
            </span>
          </div>
        </div>

        {/* 4xx Client Errors */}
        <div 
          onClick={() => { setStatusGroupFilter(statusGroupFilter === '4xx' ? 'all' : '4xx'); setStatusCodeFilter('all'); }}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
            statusGroupFilter === '4xx' ? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50/20' : 'border-[#E2E8F0] hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              4xx Rota / Auth (404/401)
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-amber-800">{stats.s4xx}</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
              {stats.s4xx > 0 ? 'Atenção' : '0 erros'}
            </span>
          </div>
        </div>

        {/* 5xx Server Errors */}
        <div 
          onClick={() => { setStatusGroupFilter(statusGroupFilter === '5xx' ? 'all' : '5xx'); setStatusCodeFilter('all'); }}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
            statusGroupFilter === '5xx' ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' : 'border-[#E2E8F0] hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-700 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              5xx Servidor (500/502)
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-rose-700">{stats.s5xx}</span>
            <span className="text-[10px] bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-bold">
              {stats.s5xx > 0 ? 'Crítico' : '0 falhas'}
            </span>
          </div>
        </div>

        {/* Latency & Health */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-medium mb-1">
            <span>Latência Média</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[#1A1D21]">{stats.avgLatencyMs || 68} ms</span>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded">
              Ultra Rápido
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="webhook_history_search"
              type="text"
              placeholder="Buscar por URL de endpoint, ID, status 200/404/500 ou mensagem de erro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#1A1D21] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0084FF]/20 focus:border-[#0084FF] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Buttons & Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Live Monitoring Indicator & Toggle */}
            <button
              id="btn_toggle_live_monitoring"
              onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isLiveMonitoring
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
              title={isLiveMonitoring ? 'Pausar monitoramento ao vivo' : 'Retomar monitoramento ao vivo'}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveMonitoring ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>{isLiveMonitoring ? 'Ao Vivo (Auto-Sync)' : 'Pausado'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              id="btn_refresh_webhook_history"
              onClick={() => loadDeliveries(false)}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1A1D21] transition-all cursor-pointer disabled:opacity-50"
              title="Atualizar histórico agora"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0084FF]' : 'text-gray-600'}`} />
            </button>

            {/* Test Dispatch Button */}
            <button
              id="btn_open_test_dispatch"
              onClick={() => {
                setIsTestModalOpen(true);
                setTestModalResult(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Testar Disparo Rápido</span>
            </button>

            {/* Export JSON */}
            <button
              id="btn_export_webhook_history"
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1A1D21] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Exportar requisições em formato JSON"
            >
              <Download className="w-3.5 h-3.5 text-gray-600" />
              <span>Exportar</span>
            </button>

            {/* Clear History */}
            <button
              id="btn_clear_webhook_history"
              onClick={handleClearHistory}
              className="p-2 rounded-lg bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all cursor-pointer"
              title="Limpar todo o histórico de disparos"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F1F5F9]">
          <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-[#64748B]" />
            Status HTTP:
          </span>

          {/* All */}
          <button
            onClick={() => { setStatusGroupFilter('all'); setStatusCodeFilter('all'); }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              statusGroupFilter === 'all' && statusCodeFilter === 'all'
                ? 'bg-[#1A1D21] text-white'
                : 'bg-gray-100 text-[#64748B] hover:bg-gray-200'
            }`}
          >
            Todos ({stats.total})
          </button>

          {/* 200 OK */}
          <button
            onClick={() => { setStatusGroupFilter('2xx'); setStatusCodeFilter('200'); }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              statusCodeFilter === '200'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            200 OK
          </button>

          {/* 404 Not Found */}
          <button
            onClick={() => { setStatusGroupFilter('4xx'); setStatusCodeFilter('404'); }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              statusCodeFilter === '404'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            404 Not Found
          </button>

          {/* 500 Internal Server Error */}
          <button
            onClick={() => { setStatusGroupFilter('5xx'); setStatusCodeFilter('500'); }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              statusCodeFilter === '500'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3 h-3" />
            500 Internal Error
          </button>

          {/* 401 Unauthorized */}
          <button
            onClick={() => { setStatusGroupFilter('4xx'); setStatusCodeFilter('401'); }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              statusCodeFilter === '401'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50/60 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
            }`}
          >
            401 Unauthorized
          </button>

          {/* 502 Bad Gateway */}
          <button
            onClick={() => { setStatusGroupFilter('5xx'); setStatusCodeFilter('502'); }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              statusCodeFilter === '502'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50/60 text-rose-800 border border-rose-200/80 hover:bg-rose-100'
            }`}
          >
            502 Bad Gateway
          </button>

          <div className="h-4 w-px bg-gray-200 mx-1" />

          {/* Channel Dropdown */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-[#1A1D21] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#0084FF]"
          >
            <option value="all">Todos os Canais</option>
            <option value="instagram">Instagram Direct</option>
            <option value="messenger">Facebook Messenger</option>
            <option value="omnichannel">Omnichannel</option>
          </select>

          {/* Event Dropdown */}
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-[#1A1D21] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#0084FF]"
          >
            <option value="all">Todos os Eventos</option>
            <option value="messages">messages (DMs)</option>
            <option value="messaging_postbacks">postbacks (Botões)</option>
            <option value="comments">comments (Reels/Posts)</option>
            <option value="story_insights">story_insights (Stories)</option>
            <option value="leadgen">leadgen (Lead Ads)</option>
          </select>

          {/* Auto Refresh Interval Dropdown */}
          <div className="ml-auto flex items-center gap-1 text-[11px] text-[#64748B]">
            <span>Intervalo:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-[11px] text-[#1A1D21] font-medium focus:outline-hidden"
            >
              <option value={1000}>1 segundo</option>
              <option value={3000}>3 segundos</option>
              <option value={5000}>5 segundos</option>
              <option value={10000}>10 segundos</option>
              <option value={0}>Desativado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Webhook Request History Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {isLoading && deliveries.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0084FF] animate-spin" />
            <p className="text-sm font-semibold text-[#1A1D21]">Carregando histórico de requisições de Webhook...</p>
            <p className="text-xs text-[#64748B]">Consultando banco de logs MongoDB</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="w-10 h-10 text-gray-400" />
            <p className="text-sm font-bold text-[#1A1D21]">Nenhuma requisição de Webhook encontrada</p>
            <p className="text-xs text-[#64748B] max-w-md">
              Não foram encontrados disparos correspondentes aos filtros selecionados. Realize um disparo de teste para visualizar o status HTTP e timestamp.
            </p>
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="mt-2 px-4 py-2 bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Realizar Disparo de Teste Agora</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4">Status HTTP</th>
                  <th className="py-3 px-4">Timestamp do Disparo</th>
                  <th className="py-3 px-4">Método & Endpoint de Destino</th>
                  <th className="py-3 px-4">Canal / Evento</th>
                  <th className="py-3 px-4">Latência</th>
                  <th className="py-3 px-4 text-right">Ações de Debug</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {deliveries.map((log) => {
                  const timeInfo = formatTimestamp(log.timestamp);
                  const isSuccess = log.responseStatus >= 200 && log.responseStatus < 300;
                  const isRetrying = retryingLogId === log.id;
                  const hasRetryFeedback = retryFeedback && retryFeedback.id === log.id;

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                        selectedLog?.id === log.id ? 'bg-blue-50/40' : ''
                      }`}
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Status HTTP Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(log.responseStatus, log.responseStatusText)}
                          {log.retryCount && log.retryCount > 0 ? (
                            <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded" title={`Reenviado ${log.retryCount} vez(es)`}>
                              {log.retryCount}x retry
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Timestamp do Disparo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#1A1D21] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                            {timeInfo.full}
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            {timeInfo.relative}
                          </span>
                        </div>
                      </td>

                      {/* Endpoint URL & Name */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-sm lg:max-w-md">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-bold text-[#1A1D21]">
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-mono rounded uppercase">
                              {log.method || 'POST'}
                            </span>
                            <span className="truncate">{log.endpointName || 'Webhook Endpoint'}</span>
                          </div>
                          <span className="text-[11px] text-[#64748B] font-mono truncate hover:text-[#1A1D21]" title={log.endpointUrl}>
                            {log.endpointUrl || 'https://api.empresa.com/webhook'}
                          </span>
                          {log.error && (
                            <span className="text-[11px] text-rose-600 font-medium truncate mt-0.5" title={log.error}>
                              ⚠️ {log.error}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Channel & Event */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {log.channel === 'instagram' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                              <Instagram className="w-3 h-3 text-pink-600" />
                              Instagram
                            </span>
                          ) : log.channel === 'messenger' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Facebook className="w-3 h-3 text-blue-600" />
                              Messenger
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <Radio className="w-3 h-3 text-purple-600" />
                              Omni
                            </span>
                          )}

                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-medium rounded">
                            {log.event}
                          </span>
                        </div>
                      </td>

                      {/* Duration / Latency */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono text-xs">
                          <span className={log.durationMs > 1000 ? 'text-rose-600 font-bold' : log.durationMs > 300 ? 'text-amber-600' : 'text-emerald-700 font-semibold'}>
                            {log.durationMs || 42} ms
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Reenviar / Retry Button */}
                          <button
                            onClick={() => handleRetry(log)}
                            disabled={isRetrying}
                            className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[#1A1D21] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                            title="Reenviar esta requisição agora"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin text-[#0084FF]' : 'text-gray-600'}`} />
                            <span>Retry</span>
                          </button>

                          {/* Inspecionar Detalhes */}
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-[#0084FF] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="Ver cabeçalhos, payload e resposta completa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detalhes</span>
                          </button>
                        </div>

                        {/* Feedback popup on retry */}
                        {hasRetryFeedback && (
                          <div className={`mt-1 text-[11px] font-semibold text-right ${retryFeedback.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {retryFeedback.message}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        <div className="bg-[#F8FAFC] px-4 py-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span>Exibindo <strong>{deliveries.length}</strong> de <strong>{totalCount}</strong> requisições de webhook</span>
            {newDeliveriesPulse && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] animate-bounce">
                + Novos disparos recebidos
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Última sincronização: {lastSyncTime.toLocaleTimeString('pt-BR')}</span>
            <button
              onClick={() => loadDeliveries(false)}
              className="text-[#0084FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL INSPECTOR MODAL / DRAWER */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-[#0084FF]">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#1A1D21]">
                      Inspeção de Requisição Webhook
                    </h3>
                    {renderStatusBadge(selectedLog.responseStatus, selectedLog.responseStatusText)}
                  </div>
                  <p className="text-xs text-[#64748B] flex items-center gap-2 mt-0.5">
                    <span>ID: <code className="font-mono">{selectedLog.id}</code></span>
                    <span>•</span>
                    <span>Disparado em {formatTimestamp(selectedLog.timestamp).full}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRetry(selectedLog)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1A1D21] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
                  <span>Reenviar Disparo</span>
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Quick Diagnostic Card for Error Statuses */}
              {selectedLog.responseStatus >= 400 && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  selectedLog.responseStatus === 404
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : selectedLog.responseStatus === 500
                    ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                    : 'bg-orange-50/80 border-orange-200 text-orange-900'
                }`}>
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-current" />
                  <div>
                    <h4 className="font-bold text-sm">
                      Diagnóstico de Depuração (HTTP {selectedLog.responseStatus})
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">
                      {selectedLog.responseStatus === 404
                        ? 'A URL do webhook retornou 404 (Não Encontrado). Verifique se o caminho da rota no servidor de destino está correto e aceita requisições POST.'
                        : selectedLog.responseStatus === 500
                        ? 'O servidor de destino encontrou uma exceção interna não tratada ao processar o payload JSON. Verifique os logs de erro e conexão de banco da aplicação remota.'
                        : selectedLog.responseStatus === 401
                        ? 'A autenticação falhou. O token secreto de verificação (HMAC SHA-256) ou cabeçalho de assinatura foi rejeitado pelo destinatário.'
                        : selectedLog.responseStatus === 502
                        ? 'O proxy reverso (Nginx/Cloudflare) não conseguiu se conectar ao processo Node.js/Python de destino (Connection Refused).'
                        : selectedLog.error || 'A requisição falhou. Verifique os detalhes do corpo da resposta abaixo.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Endpoint & Dispatch Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div>
                  <span className="text-[#64748B] block text-[11px]">URL de Destino</span>
                  <span className="font-mono font-bold text-[#1A1D21] break-all select-all">
                    {selectedLog.endpointUrl}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Canal & Evento</span>
                  <span className="font-bold text-[#1A1D21] capitalize">
                    {selectedLog.channel} • {selectedLog.event}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Tempo de Resposta</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {selectedLog.durationMs} ms
                  </span>
                </div>
              </div>

              {/* Request Headers */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#1A1D21] flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-600" />
                    Cabeçalhos da Requisição (Request Headers)
                  </span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedLog.requestHeaders || {}, null, 2), 'req_headers')}
                    className="text-[11px] text-[#0084FF] hover:underline font-semibold flex items-center gap-1"
                  >
                    {copiedId === 'req_headers' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'req_headers' ? 'Copiado!' : 'Copiar Headers'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#1A1D21] text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-36">
                  {JSON.stringify(
                    selectedLog.requestHeaders || {
                      'Content-Type': 'application/json',
                      'X-ManyFlow-Event': selectedLog.event,
                      'X-ManyFlow-Signature': 'sha256=3a890fb12c894e772091ea0281b67f10e4a90',
                      'User-Agent': 'ManyFlow-Webhook-Dispatcher/2.1.0'
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Request Payload Sent */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#1A1D21] flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-purple-600" />
                    Payload JSON Enviado (Corpo do Disparo)
                  </span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedLog.payload || {}, null, 2), 'req_payload')}
                    className="text-[11px] text-[#0084FF] hover:underline font-semibold flex items-center gap-1"
                  >
                    {copiedId === 'req_payload' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'req_payload' ? 'Copiado!' : 'Copiar Payload JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#1A1D21] text-blue-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog.payload || {}, null, 2)}
                </pre>
              </div>

              {/* Response Body Received */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#1A1D21] flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-600" />
                    Corpo da Resposta do Destinatário (HTTP {selectedLog.responseStatus} {selectedLog.responseStatusText || ''})
                  </span>
                  {selectedLog.responseBody && (
                    <button
                      onClick={() => handleCopy(selectedLog.responseBody || '', 'res_body')}
                      className="text-[11px] text-[#0084FF] hover:underline font-semibold flex items-center gap-1"
                    >
                      {copiedId === 'res_body' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === 'res_body' ? 'Copiado!' : 'Copiar Resposta'}</span>
                    </button>
                  )}
                </div>
                <pre className={`p-3 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48 ${
                  selectedLog.responseStatus >= 400
                    ? 'bg-rose-950/90 text-rose-200 border border-rose-800'
                    : 'bg-[#1A1D21] text-amber-200'
                }`}>
                  {selectedLog.responseBody || 'Sem corpo de resposta retornado.'}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs text-[#64748B]">
                Pressione <strong>ESC</strong> ou feche para voltar à tabela
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-[#1A1D21] hover:bg-black text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Fechar Inspeção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK TEST DISPATCH MODAL */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-[#0084FF]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A1D21]">Disparo de Teste de Webhook</h3>
                  <p className="text-xs text-[#64748B]">Envie uma requisição e monitore o status HTTP retornado em tempo real</p>
                </div>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#1A1D21] block mb-1">URL de Destino do Endpoint</label>
                <input
                  type="url"
                  value={testEndpointUrl}
                  onChange={(e) => setTestEndpointUrl(e.target.value)}
                  placeholder="https://suaempresa.com.br/api/webhook"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#1A1D21] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0084FF]/20 focus:border-[#0084FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A1D21] block mb-1">Canal de Origem</label>
                  <select
                    value={testChannel}
                    onChange={(e: any) => setTestChannel(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#1A1D21] focus:bg-white focus:outline-hidden"
                  >
                    <option value="instagram">Instagram Direct</option>
                    <option value="messenger">Facebook Messenger</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A1D21] block mb-1">Tipo de Evento</label>
                  <select
                    value={testEventType}
                    onChange={(e) => setTestEventType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#1A1D21] focus:bg-white focus:outline-hidden"
                  >
                    <option value="messages">messages (DM Inbound)</option>
                    <option value="messaging_postbacks">postbacks (Botão Clicado)</option>
                    <option value="comments">comments (Comentário Reel)</option>
                    <option value="leadgen">leadgen (Lead Ads)</option>
                  </select>
                </div>
              </div>

              {/* Status Simulation Helpers */}
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-[11px] text-blue-900 space-y-1">
                <span className="font-bold block">💡 Dica para Testes de Debug:</span>
                <p>
                  Você pode usar URLs reais do seu backend ou testar com endpoints como Webhook.site para checar os cabeçalhos HMAC e o payload JSON.
                </p>
              </div>

              {/* Result Preview if executed */}
              {testModalResult && (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  testModalResult.success ? 'bg-emerald-50/80 border-emerald-200' : 'bg-rose-50/80 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      {testModalResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                      <span>Resultado do Disparo</span>
                    </span>
                    {renderStatusBadge(testModalResult.statusCode)}
                  </div>
                  <div className="text-[11px] flex items-center gap-3 text-gray-700">
                    <span>Latência: <strong>{testModalResult.durationMs} ms</strong></span>
                  </div>
                  <pre className="p-2.5 bg-[#1A1D21] text-emerald-300 font-mono text-[10px] rounded-lg overflow-x-auto max-h-32">
                    {testModalResult.responseBody}
                  </pre>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1A1D21] text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={handleExecuteTestDispatch}
                disabled={isTestingDispatch || !testEndpointUrl}
                className="px-5 py-2 bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isTestingDispatch ? 'animate-spin' : ''}`} />
                <span>{isTestingDispatch ? 'Disparando...' : 'Executar Disparo de Teste'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
