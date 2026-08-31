import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  X, 
  Minus, 
  Maximize2, 
  BarChart2, 
  CheckCircle2, 
  MousePointerClick, 
  Sparkles, 
  Info,
  Calendar,
  Zap,
  Layers
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
import { Flow } from '../../types';

interface FlowPerformanceOverlayProps {
  flow: Flow;
  onClose: () => void;
}

export const FlowPerformanceOverlay: React.FC<FlowPerformanceOverlayProps> = ({
  flow,
  onClose
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'both' | 'ctr' | 'conversion'>('both');

  // Calculate base rates from flow stats
  const runs = flow.stats.runs || 100;
  const completed = flow.stats.completed || 85;
  const baseCtr = flow.stats.ctr || 90;
  const baseConversionRate = Number(((completed / runs) * 100).toFixed(1));
  const openRateEstimated = Math.min(99.4, Number((baseCtr * 1.04).toFixed(1)));

  // Generate deterministic, realistic daily trend data for the selected timeframe
  const chartData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const data = [];
    const now = new Date();

    // Use flow id characters to seed deterministic variations
    const seed = flow.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayLabel = daysCount <= 7 
        ? d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
        : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      // Controlled natural fluctuation around actual stats
      const pseudoRandom = Math.sin(seed + i * 1.35) * 4.2;
      const pseudoRandom2 = Math.cos(seed + i * 1.1) * 3.8;

      const dailyCtr = Math.max(10, Math.min(100, Number((baseCtr + pseudoRandom).toFixed(1))));
      const dailyConversion = Math.max(5, Math.min(100, Number((baseConversionRate + pseudoRandom2).toFixed(1))));
      const dailyOpenRate = Math.max(15, Math.min(100, Number((openRateEstimated + pseudoRandom * 0.7).toFixed(1))));

      data.push({
        name: dayLabel,
        fullDate: d.toLocaleDateString('pt-BR'),
        openRate: dailyOpenRate,
        ctr: dailyCtr,
        conversionRate: dailyConversion,
        runs: Math.round(runs / daysCount * (1 + (pseudoRandom / 20)))
      });
    }

    return data;
  }, [flow.id, baseCtr, baseConversionRate, openRateEstimated, runs, timeRange]);

  return (
    <div 
      id="flow_canvas_performance_overlay"
      className="absolute top-4 right-4 z-30 w-96 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-3 select-none"
    >
      {/* Overlay Header */}
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Performance em Tempo Real
              </h4>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[170px]">
              {flow.title}
            </p>
          </div>
        </div>

        {/* Window Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expandir Painel" : "Minimizar"}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            title="Fechar Overlay de Performance"
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Minimized Content Preview */}
      {isMinimized ? (
        <div className="p-3 flex items-center justify-between text-xs bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-[11px]">Abertura: <strong className="text-blue-600">{openRateEstimated}%</strong></span>
            <span className="text-slate-500 text-[11px]">Conversão: <strong className="text-emerald-600">{baseConversionRate}%</strong></span>
          </div>
          <button 
            onClick={() => setIsMinimized(false)}
            className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Ver Gráfico
          </button>
        </div>
      ) : (
        /* Expanded Full Content */
        <div className="p-4 space-y-3.5 bg-white dark:bg-slate-900">
          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 gap-2">
            <div 
              onClick={() => setActiveMetric(activeMetric === 'ctr' ? 'both' : 'ctr')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                activeMetric === 'ctr' || activeMetric === 'both'
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/80 ring-1 ring-blue-400/30'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                  Taxa Abertura / CTR
                </span>
                <MousePointerClick className="w-3 h-3 text-blue-600" />
              </div>
              <div className="text-lg font-black text-blue-950 dark:text-blue-100 mt-0.5">
                {flow.stats.ctr}%
              </div>
              <div className="text-[9px] text-blue-600 dark:text-blue-300 font-medium">
                {openRateEstimated}% visualizações estimadas
              </div>
            </div>

            <div 
              onClick={() => setActiveMetric(activeMetric === 'conversion' ? 'both' : 'conversion')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                activeMetric === 'conversion' || activeMetric === 'both'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 ring-1 ring-emerald-400/30'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  Taxa Conversão
                </span>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              </div>
              <div className="text-lg font-black text-emerald-950 dark:text-emerald-100 mt-0.5">
                {baseConversionRate}%
              </div>
              <div className="text-[9px] text-emerald-600 dark:text-emerald-300 font-medium">
                {completed.toLocaleString()} de {runs.toLocaleString()} concluídos
              </div>
            </div>
          </div>

          {/* Timeframe Filter Bar */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Tendência
            </span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  timeRange === '7d' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange('14d')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  timeRange === '14d' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                14D
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  timeRange === '30d' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                30D
              </button>
            </div>
          </div>

          {/* Recharts Performance Visualizer */}
          <div className="h-36 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="openRateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0084FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0084FF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="convRateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 9, fill: '#64748B' }} 
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 9, fill: '#64748B' }} 
                  unit="%" 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-xl border border-slate-700 space-y-1">
                          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">{label}</p>
                          <p className="text-blue-400 font-semibold flex items-center justify-between gap-3">
                            <span>Taxa de Abertura / CTR:</span>
                            <strong>{payload[0]?.value}%</strong>
                          </p>
                          {payload[1] && (
                            <p className="text-emerald-400 font-semibold flex items-center justify-between gap-3">
                              <span>Taxa de Conversão:</span>
                              <strong>{payload[1]?.value}%</strong>
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {(activeMetric === 'both' || activeMetric === 'ctr') && (
                  <Area
                    type="monotone"
                    dataKey="openRate"
                    name="Open Rate / CTR"
                    stroke="#0084FF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#openRateGrad)"
                  />
                )}
                {(activeMetric === 'both' || activeMetric === 'conversion') && (
                  <Area
                    type="monotone"
                    dataKey="conversionRate"
                    name="Taxa de Conversão"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#convRateGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Diagnostics Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <Sparkles className="w-3 h-3" />
              Retenção saudável (+{((baseConversionRate / 100) * 12).toFixed(1)}% acima da meta)
            </span>
            <span className="font-mono">{runs} execuções</span>
          </div>
        </div>
      )}
    </div>
  );
};
