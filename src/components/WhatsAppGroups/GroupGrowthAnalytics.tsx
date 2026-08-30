import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Crown,
  Share2,
  Clock,
  Award
} from 'lucide-react';
import { WhatsAppGroup } from '../../types';

interface GroupGrowthAnalyticsProps {
  groups: WhatsAppGroup[];
  onSelectGroup?: (groupId: string) => void;
}

// Aggregated & extended multi-day dataset
const generateTimelineData = (days: number, groups: WhatsAppGroup[]) => {
  const result = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    // Calculate synthetic yet realistic metrics based on the groups
    const dayFactor = 1 + Math.sin(i * 0.8) * 0.25;
    
    let joinsVip = Math.round(180 * dayFactor + (days - i) * 3);
    let joinsLaunch = Math.round(220 * dayFactor + (days - i) * 8);
    let joinsCommunity = Math.round(45 * dayFactor);
    let totalJoins = joinsVip + joinsLaunch + joinsCommunity;
    
    let leftCount = Math.round(totalJoins * 0.032 + Math.random() * 4);
    let netGain = totalJoins - leftCount;
    
    // Retention rate tracking %
    let retentionRate = Math.min(99.4, Math.max(94.2, 97.2 + Math.cos(i * 0.5) * 1.5));
    
    // Specific groups breakdown
    let vip01Joins = Math.round(joinsVip * 0.58);
    let vip02Joins = Math.round(joinsVip * 0.42);
    let launch01Joins = Math.round(joinsLaunch * 0.45);
    let launch02Joins = Math.round(joinsLaunch * 0.55);

    result.push({
      date: dateLabel,
      totalJoins,
      leftCount,
      netGain,
      retentionRate: Number(retentionRate.toFixed(1)),
      churnRate: Number((100 - retentionRate).toFixed(1)),
      vipJoins: joinsVip,
      launchJoins: joinsLaunch,
      communityJoins: joinsCommunity,
      vip01: vip01Joins,
      vip02: vip02Joins,
      launch01: launch01Joins,
      launch02: launch02Joins,
      cumulativeMembers: 10400 + (days - i) * Math.round(totalJoins * 0.85)
    });
  }
  return result;
};

// Retention Cohort breakdown
const RETENTION_COHORT_DATA = [
  { interval: 'Dia 1 (Entrada)', rate: 99.6, benchmark: 98.0, count: 3840 },
  { interval: 'Dia 3 (Ativação)', rate: 98.8, benchmark: 95.0, count: 3794 },
  { interval: 'Dia 7 (Primeira Semana)', rate: 97.5, benchmark: 91.5, count: 3744 },
  { interval: 'Dia 14 (Meio Ciclo)', rate: 96.4, benchmark: 88.0, count: 3701 },
  { interval: 'Dia 30 (Renovação)', rate: 95.2, benchmark: 82.0, count: 3655 },
  { interval: 'Dia 60 (LTV Alto)', rate: 93.8, benchmark: 76.0, count: 3602 },
  { interval: 'Dia 90 (Fidelizado)', rate: 92.4, benchmark: 71.0, count: 3548 },
];

export const GroupGrowthAnalytics: React.FC<GroupGrowthAnalyticsProps> = ({
  groups,
  onSelectGroup
}) => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);
  const [chartMetric, setChartMetric] = useState<'joins_vs_left' | 'net_growth' | 'by_category' | 'cumulative'>('joins_vs_left');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  const timelineData = useMemo(() => {
    return generateTimelineData(timeRange, groups);
  }, [timeRange, groups]);

  // Aggregate totals
  const totalJoinsPeriod = useMemo(() => {
    return timelineData.reduce((acc, curr) => acc + curr.totalJoins, 0);
  }, [timelineData]);

  const totalLeftPeriod = useMemo(() => {
    return timelineData.reduce((acc, curr) => acc + curr.leftCount, 0);
  }, [timelineData]);

  const netGrowthPeriod = totalJoinsPeriod - totalLeftPeriod;
  const avgRetentionPeriod = (
    timelineData.reduce((acc, curr) => acc + curr.retentionRate, 0) / timelineData.length
  ).toFixed(1);

  const avgDailyJoins = Math.round(totalJoinsPeriod / timeRange);

  // Group Categories Distribution
  const categoryDistributionData = useMemo(() => {
    const counts: Record<string, { name: string; value: number; color: string; fillPct: number; revenue: number }> = {
      vip_monetized: { name: 'VIP Monetizado (Pago)', value: 0, color: '#F59E0B', fillPct: 0, revenue: 0 },
      launch_funnel: { name: 'Funis de Lançamento', value: 0, color: '#3B82F6', fillPct: 0, revenue: 0 },
      community: { name: 'Comunidades Gratuitas', value: 0, color: '#10B981', fillPct: 0, revenue: 0 },
      support: { name: 'Suporte & Alunos', value: 0, color: '#8B5CF6', fillPct: 0, revenue: 0 },
    };

    let totalMem = 0;
    groups.forEach((g) => {
      totalMem += g.memberCount;
      const cat = counts[g.category] || counts.community;
      cat.value += g.memberCount;
      cat.revenue += (g.pricing?.price || 0) * g.memberCount;
    });

    return Object.values(counts).filter(c => c.value > 0);
  }, [groups]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-1.5 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {label}
            </span>
            <span className="text-[10px] text-slate-400">Dados do dia</span>
          </div>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.name}:</span>
              </div>
              <span className="font-mono font-bold text-white">
                {typeof item.value === 'number'
                  ? item.name.includes('Taxa') || item.name.includes('%')
                    ? `${item.value}%`
                    : `+${item.value.toLocaleString('pt-BR')}`
                  : item.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="group_growth_analytics_widget" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Métricas de Crescimento & Retenção de Grupos
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                TEMPO REAL
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Análise de fluxo diário de entradas, evasão (churn), taxa de retenção por coorte e velocidade de lotação
            </p>
          </div>
        </div>

        {/* Time Range Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold self-start md:self-auto">
          {[
            { value: 7, label: '7 Dias' },
            { value: 14, label: '14 Dias' },
            { value: 30, label: '30 Dias' }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setTimeRange(item.value as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === item.value
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Novos Membros no Período */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Novas Entradas ({timeRange}d)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              +{totalJoinsPeriod.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              +{avgDailyJoins}/dia
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[82%]" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Aceleração impulsionada por rotadores inteligentes
          </p>
        </div>

        {/* KPI 2: Ganho Líquido */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Crescimento Líquido
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              +{netGrowthPeriod.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-400">
              (-{totalLeftPeriod} saídas)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full w-[94%]" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Saldo positivo: <strong>96.8%</strong> de aproveitamento de leads
          </p>
        </div>

        {/* KPI 3: Taxa de Retenção Média */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Taxa de Retenção
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {avgRetentionPeriod}%
            </span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              +15.2% vs mercado
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full w-[97%]" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Auto-moderação anti-spam previne evasão de membros
          </p>
        </div>

        {/* KPI 4: Health Score da Comunidade */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Score de Saúde Geral
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              9.8 <span className="text-sm text-slate-400">/ 10</span>
            </span>
            <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
              Excelente
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-[98%]" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Baixo churn e alto engajamento em conversas 24h
          </p>
        </div>
      </div>

      {/* Main Growth Evolution Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-600" />
              Curva de Crescimento e Fluxo Diário de Membros ({timeRange} Dias)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualização comparativa de novos membros, evasão e evolução de base
            </p>
          </div>

          {/* Metric View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setChartMetric('joins_vs_left')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                chartMetric === 'joins_vs_left'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              Entradas x Saídas
            </button>
            <button
              onClick={() => setChartMetric('net_growth')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                chartMetric === 'net_growth'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              Ganho Líquido & Retenção
            </button>
            <button
              onClick={() => setChartMetric('by_category')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                chartMetric === 'by_category'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              Por Tipo de Grupo
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'joins_vs_left' ? (
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorJoins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorLeft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="totalJoins"
                  name="Novas Entradas"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorJoins)"
                />
                <Area
                  type="monotone"
                  dataKey="leftCount"
                  name="Saídas (Churn)"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLeft)"
                />
              </AreaChart>
            ) : chartMetric === 'net_growth' ? (
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[90, 100]} stroke="#8B5CF6" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="netGain"
                  name="Ganho Líquido Diário"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorNet)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="retentionRate"
                  name="Taxa de Retenção (%)"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#8B5CF6' }}
                />
              </AreaChart>
            ) : (
              <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="vipJoins" name="Grupos VIP Monetizados" fill="#F59E0B" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="launchJoins" name="Funis de Lançamento" fill="#3B82F6" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="communityJoins" name="Comunidade Gratuita" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Widget Row: Retention Cohort Curve & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Widget: Retention Rate Cohort Curve (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Curva de Retenção & Cohort de Sobrevivência
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Percentual de membros ativos retidos ao longo do tempo (vs benchmark de mercado)
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Média D30: 95.2%
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RETENTION_COHORT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="interval" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis domain={[65, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                          <span className="font-bold text-purple-400 block border-b border-slate-700 pb-1">{label}</span>
                          <div className="flex justify-between gap-3">
                            <span>Sua Retenção:</span>
                            <span className="font-mono font-bold text-emerald-400">{payload[0].value}%</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span>Média de Mercado:</span>
                            <span className="font-mono font-bold text-slate-400">{payload[1]?.value}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine y={90} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Meta 90%', fill: '#10B981', fontSize: 10, position: 'right' }} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Sua Taxa de Retenção (%)"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  name="Benchmark Grupos Brasil (%)"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#94A3B8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <p className="text-xs text-purple-900 dark:text-purple-200">
              <strong>Alta Retenção Comprovada:</strong> Seus grupos mantêm <strong>93.8%</strong> dos membros mesmo após 60 dias de entrada, gerando um LTV recorrente médio 2.4x superior à média do mercado.
            </p>
          </div>
        </div>

        {/* Right Widget: Group Category Donut Distribution (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Distribuição da Base por Categoria
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Divisão proporcional dos membros entre salas
              </p>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-2.5 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                          <span className="font-bold text-slate-200 block">{data.name}</span>
                          <p className="font-mono text-emerald-400 font-bold">{data.value.toLocaleString('pt-BR')} membros</p>
                          {data.revenue > 0 && (
                            <p className="text-[10px] text-amber-300">R$ {data.revenue.toLocaleString('pt-BR')}/mês</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Items */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            {categoryDistributionData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {cat.value.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({Math.round((cat.value / groups.reduce((a, b) => a + b.memberCount, 0)) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Group Capacity Speed & Fill Rate Leaderboard */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Velocidade de Ocupação & Transbordo por Grupo
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Capacidade preenchida, novos membros diários e previsão para acionamento do próximo grupo da rotação
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {groups.length} grupos monitorados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((grp) => {
            const fillPercent = Math.min(100, Math.round((grp.memberCount / grp.maxMembers) * 100));
            const todayCount = grp.stats.dailyJoinsHistory[grp.stats.dailyJoinsHistory.length - 1]?.count || 0;
            const remainingSpots = Math.max(0, grp.maxMembers - grp.memberCount);
            const daysToFull = todayCount > 0 ? (remainingSpots / todayCount).toFixed(1) : '—';

            return (
              <div
                key={grp.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={grp.avatarUrl} alt="" className="w-8 h-8 rounded-xl object-cover shadow-2xs" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {grp.name}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {grp.memberCount} / {grp.maxMembers} membros ({fillPercent}%)
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      fillPercent >= 100
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                        : fillPercent >= 80
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                    }`}
                  >
                    {fillPercent >= 100 ? 'LOTADO (Transbordo Ativo)' : fillPercent >= 80 ? 'Quase Lotado' : 'Vagas Abertas'}
                  </span>
                </div>

                {/* Fill Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all ${
                      fillPercent >= 100
                        ? 'bg-rose-500'
                        : fillPercent >= 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>

                {/* Bottom stats row */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      +{todayCount} hoje
                    </span>
                    <span>•</span>
                    <span>Retenção: <strong>{100 - grp.stats.churnRate}%</strong></span>
                  </div>

                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {fillPercent >= 100 ? '0 vagas restantes' : `${remainingSpots} vagas (~${daysToFull}d p/ lotar)`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
