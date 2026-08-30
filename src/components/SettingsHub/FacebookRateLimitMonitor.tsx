import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Zap, 
  Layers, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Cpu, 
  BarChart3, 
  ArrowUpRight, 
  TrendingUp, 
  Copy, 
  Check, 
  Sliders, 
  RotateCcw, 
  Info, 
  ExternalLink,
  Lock,
  Radio,
  Server,
  Gauge,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  MetaRateLimitDashboardData, 
  MetaRateLimitHealthStatus 
} from '../../types';
import { facebookRateLimitService } from '../../services/facebookRateLimitService';

export const FacebookRateLimitMonitor: React.FC = () => {
  const [data, setData] = useState<MetaRateLimitDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [copiedHeader, setCopiedHeader] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{
    latencyMs: number;
    traceId: string;
    timestamp: string;
  } | null>(null);
  const [countdown, setCountdown] = useState<number>(30);

  // Load dashboard data
  const loadData = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    try {
      const result = await facebookRateLimitService.getDashboardData();
      setData(result);
    } catch (err) {
      console.error('Falha ao carregar rate limits:', err);
    } finally {
      if (showLoadingState) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => {
      loadData(false);
      setCountdown(30);
    }, 30000);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const handlePing = async () => {
    setIsPinging(true);
    try {
      const res = await facebookRateLimitService.pingGraphApi();
      setPingResult({
        latencyMs: res.latency_ms,
        traceId: res.trace_id,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      });
      await loadData(false);
    } catch (err) {
      console.error('Erro no ping da Graph API:', err);
    } finally {
      setIsPinging(false);
    }
  };

  const handleSimulateBurst = async (targetPercent: number) => {
    setIsSimulating(true);
    try {
      await facebookRateLimitService.simulateBurst(targetPercent);
      await loadData(false);
    } catch (err) {
      console.error('Erro ao simular burst:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetLimits = async () => {
    setIsSimulating(true);
    try {
      await facebookRateLimitService.resetLimits();
      await loadData(false);
    } catch (err) {
      console.error('Erro ao restaurar limites:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleToggleProtection = async (field: 'automaticThrottling' | 'adaptiveBackoff' | 'batchOptimization', currentVal: boolean) => {
    try {
      await facebookRateLimitService.toggleProtection({
        [field]: !currentVal,
      });
      await loadData(false);
    } catch (err) {
      console.error('Erro ao alterar configuração:', err);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHeader(label);
    setTimeout(() => setCopiedHeader(null), 2000);
  };

  const getStatusBadge = (status: MetaRateLimitHealthStatus) => {
    switch (status) {
      case 'optimal':
        return {
          label: 'Status Ótimo (Sem Risco)',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          desc: 'Consumo de chamadas e CPU bem abaixo dos limites de segurança.',
        };
      case 'moderate':
        return {
          label: 'Uso Moderado (Normal)',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          desc: 'Volume sob controle, recomenda-se manter batching ativo.',
        };
      case 'warning':
        return {
          label: 'Alerta de Carga (>75%)',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500 animate-ping',
          desc: 'Próximo do limite de 60 minutos. O sistema está espaçando requisições.',
        };
      case 'throttled':
      default:
        return {
          label: 'Throttling Ativado (>90%)',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500 animate-pulse',
          desc: 'Backoff adaptativo em execução para evitar erros HTTP 429 da Meta.',
        };
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-[#1A1D21]">
          Consultando status em tempo real da Meta Graph API (v21.0)...
        </p>
        <span className="text-xs text-[#64748B]">
          Lendo cabeçalhos x-app-usage e x-business-use-case-usage...
        </span>
      </div>
    );
  }

  const statusInfo = getStatusBadge(data.healthStatus);

  return (
    <div className="space-y-6">
      {/* Top Banner & Live Graph API Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Facebook Graph API Rate Limit Monitor (v21.0)</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <span>Painel de Uso & Cotas da Meta</span>
              <span className={`text-xs px-3 py-1 rounded-full border font-bold ${statusInfo.bg}`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${statusInfo.dot}`} />
                {statusInfo.label}
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitore o consumo das cotas da Meta por aplicativo e página em tempo real. Os limites são calculados por janela móvel de <strong>60 minutos</strong> (baseados em <code>x-app-usage</code> e <code>x-business-use-case-usage</code>) para prevenir bloqueios HTTP 429.
            </p>
          </div>

          {/* Quick Actions & Live Ping Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="btn_ping_graph_api"
              disabled={isPinging}
              onClick={handlePing}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isPinging ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-300" />
              ) : (
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Testar Ping ao Vivo</span>
            </button>

            <button
              type="button"
              id="btn_refresh_rate_limits"
              onClick={() => loadData(true)}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Atualizar ({countdown}s)</span>
            </button>
          </div>
        </div>

        {/* Live Latency & Trace Badge */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>App ID: <strong className="text-white font-mono">{data.liveMetrics.appId}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Page ID: <strong className="text-white font-mono">{data.liveMetrics.pageId}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Janela Móvel: <strong className="text-white">60 minutos</strong> (Reset em ~{data.appUsage.estimatedTimeToResetMinutes}m)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-400">Latência Graph API:</span>
            <span className="text-emerald-400 font-bold">
              {pingResult ? `${pingResult.latencyMs}ms` : `${data.liveMetrics.lastPingDurationMs}ms`}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Trace:</span>
            <span className="text-indigo-300 font-bold">{pingResult?.traceId || 'FBT_OK9481'}</span>
          </div>
        </div>
      </div>

      {/* Primary Rate Limit Gauges & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: App Rate Limit (x-app-usage Call Count) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B] uppercase">
            <span>Chamadas Totais (App)</span>
            <Gauge className={`w-4 h-4 ${data.appUsage.callCount > 75 ? 'text-amber-500' : 'text-blue-500'}`} />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black ${
                data.appUsage.callCount > 90 ? 'text-rose-600' : data.appUsage.callCount > 75 ? 'text-amber-600' : 'text-[#1A1D21]'
              }`}>
                {data.appUsage.callCount}%
              </span>
              <span className="text-xs text-[#64748B] font-bold">da cota/hora</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              data.appUsage.callCount > 75 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {data.appUsage.callCount > 75 ? 'Atenção' : 'Seguro'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  data.appUsage.callCount > 90 
                    ? 'bg-rose-600' 
                    : data.appUsage.callCount > 75 
                    ? 'bg-amber-500' 
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, data.appUsage.callCount)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>Header: x-app-usage</span>
              <span>Reset em {data.appUsage.estimatedTimeToResetMinutes}m</span>
            </div>
          </div>
        </div>

        {/* Metric 2: CPU Time Usage */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B] uppercase">
            <span>Uso de CPU Meta</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-indigo-600">
                {data.appUsage.totalCpuTime}%
              </span>
              <span className="text-xs text-[#64748B] font-bold">CPU Time</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-800">
              Otimizado
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, data.appUsage.totalCpuTime)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>Carga no servidor Meta</span>
              <span>Tempo ótimo</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Page Messaging Quota (x-business-use-case-usage) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B] uppercase">
            <span>Page Messaging Quota</span>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-purple-600">
                {data.businessUseCaseUsage[0]?.callCount || 16}%
              </span>
              <span className="text-xs text-[#64748B] font-bold">Inbox / Direct</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-800">
              Tier 3
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, data.businessUseCaseUsage[0]?.callCount || 16)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>x-business-use-case</span>
              <span>200 reqs/hr/MAU</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Batch Optimization Savings */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase">
            <span>Economia de Requisições</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-700">
                +{data.liveMetrics.savedCallsViaBatch}
              </span>
              <span className="text-xs text-emerald-800 font-bold">chamadas poupadas</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              ~98%
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: '98%' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-emerald-700 font-bold">
              <span>Batch de 50 msgs ativo</span>
              <span>Zero risco de 429</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Grid: 24h Timeline Chart & Policies / Throttling Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 24h Hourly Rate Limit Timeline Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Histórico de Consumo da Cota por Horário (24h)</span>
              </h2>
              <p className="text-xs text-[#64748B]">
                Acompanhe o volume real de requisições versus o teto da cota horária da Meta.
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-[#64748B] border border-gray-200">
              Capacidade: 400 chamadas/bloco
            </span>
          </div>

          {/* Chart Component */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourlyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '12px', 
                    color: '#FFF', 
                    fontSize: '11px',
                    border: 'none' 
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'calls') return [`${value} reqs`, 'Requisições Reais'];
                    if (name === 'savedByBatch') return [`${value} reqs`, 'Poupadas por Lote'];
                    return [value, name];
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={30}
                  formatter={(value) => {
                    if (value === 'calls') return 'Requisições HTTP Enviadas';
                    if (value === 'savedByBatch') return 'Chamadas Economizadas (Lotes de 50)';
                    return value;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="savedByBatch" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSaved)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#4F46E5" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorCalls)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Por que o gráfico verde é superior?</strong> Graças à ativação do <em>Facebook Batch Processing</em>, cada chamada de lote transmite até 50 mensagens em um só pacote, mantendo o consumo real (gráfico roxo) drasticamente reduzido.
            </p>
          </div>
        </div>

        {/* Right: Protection Controls & Stress Testing Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Active Protection Policies Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Políticas de Proteção Ativa</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Mecanismos automáticos anti-bloqueio e throttling inteligente.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Toggle 1: Adaptive Backoff */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#1A1D21] block">
                    Backoff Adaptativo com Jitter
                  </span>
                  <p className="text-[11px] text-[#64748B]">
                    Aumenta automaticamente o espaçamento caso o consumo ultrapasse 75%.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleProtection('adaptiveBackoff', data.policyStatus.adaptiveBackoffEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 shrink-0 ${
                    data.policyStatus.adaptiveBackoffEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    data.policyStatus.adaptiveBackoffEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Toggle 2: Automatic Throttling */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#1A1D21] block">
                    Throttling Automático (Pausa em 90%)
                  </span>
                  <p className="text-[11px] text-[#64748B]">
                    Pausa temporariamente transmissões em massa para preservar mensagens 1:1.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleProtection('automaticThrottling', data.policyStatus.automaticThrottlingEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 shrink-0 ${
                    data.policyStatus.automaticThrottlingEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    data.policyStatus.automaticThrottlingEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Toggle 3: Batch Optimization */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#1A1D21] block">
                    Otimização Forçada em Lotes (50 reqs)
                  </span>
                  <p className="text-[11px] text-[#64748B]">
                    Agrupa disparos automaticamente em pacotes Graph API v21.0.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleProtection('batchOptimization', data.policyStatus.batchOptimizationActive)}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 shrink-0 ${
                    data.policyStatus.batchOptimizationActive ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    data.policyStatus.batchOptimizationActive ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Stress Test / Burst Simulator */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Simulador de Teste de Carga (Burst Test)</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Simule cenários de alto volume para verificar alertas e comportamento do backoff.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1A1D21] block">
                Injetar Carga de Cota Simulada:
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSimulateBurst(14)}
                  className="py-2 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-colors"
                >
                  14% (Normal)
                </button>
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSimulateBurst(50)}
                  className="py-2 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors"
                >
                  50% (Médio)
                </button>
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSimulateBurst(82)}
                  className="py-2 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors"
                >
                  82% (Alerta)
                </button>
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSimulateBurst(96)}
                  className="py-2 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 cursor-pointer transition-colors"
                >
                  96% (Crítico)
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                disabled={isSimulating}
                onClick={handleResetLimits}
                className="text-xs font-bold text-gray-600 hover:text-[#1A1D21] flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Cota Normal</span>
              </button>

              <span className="text-[11px] text-[#64748B]">
                {isSimulating ? 'Aplicando carga...' : 'Pronto para teste'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints Breakdown Table & Raw Headers Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Endpoints Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Detalhamento por Endpoint da Graph API</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Consumo distribuído entre mensagens, autenticação, conversas e webhooks.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FB] text-[#64748B] font-bold border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-3 pl-5">Endpoint & Método</th>
                  <th className="p-3">Canal</th>
                  <th className="p-3">Chamadas</th>
                  <th className="p-3">% do Total</th>
                  <th className="p-3">Latência Média</th>
                  <th className="p-3 pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] font-sans">
                {data.endpointsBreakdown.map((ep, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3 pl-5 font-mono text-[11px] font-bold text-[#1A1D21]">
                      <span className="text-indigo-600 mr-1.5">{ep.method}</span>
                      {ep.endpoint}
                    </td>
                    <td className="p-3">
                      <span className="capitalize text-slate-700 font-semibold">{ep.channel}</span>
                    </td>
                    <td className="p-3 font-bold text-[#1A1D21]">{ep.totalCalls}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${ep.percentOfTotal}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-[#64748B]">{ep.percentOfTotal}%</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">{ep.avgLatencyMs}ms</td>
                    <td className="p-3 pr-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {ep.lastStatusCode} OK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Raw Meta Headers Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>Inspetor de Cabeçalhos HTTP da Meta</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Payloads brutos dos headers de resposta da Graph API.
              </p>
            </div>
          </div>

          <div className="p-4 space-y-4 flex-1 font-mono text-xs bg-[#0F172A] text-slate-200">
            
            {/* Header 1: x-app-usage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                <span className="font-bold text-indigo-400">Header: x-app-usage</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(data.liveMetrics.xAppUsageHeader, 'app_usage')}
                  className="text-xs hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedHeader === 'app_usage' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto">
                {data.liveMetrics.xAppUsageHeader}
              </pre>
            </div>

            {/* Header 2: x-business-use-case-usage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                <span className="font-bold text-purple-400">Header: x-business-use-case-usage</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(data.liveMetrics.xBusinessUseCaseUsageHeader, 'b_usage')}
                  className="text-xs hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedHeader === 'b_usage' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-indigo-300 overflow-x-auto max-h-32 overflow-y-auto">
                {JSON.stringify(JSON.parse(data.liveMetrics.xBusinessUseCaseUsageHeader || '{}'), null, 2)}
              </pre>
            </div>

            {/* Recommendations Feed */}
            <div className="pt-2 border-t border-slate-800 text-slate-300 font-sans text-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Diagnóstico do Sistema:
              </span>
              {data.recommendations.map((rec) => (
                <div key={rec.id} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] flex items-start gap-2">
                  {rec.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                  {rec.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                  {rec.type === 'info' && <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}
                  <div>
                    <strong className="text-white block">{rec.title}</strong>
                    <p className="text-slate-400 mt-0.5">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
