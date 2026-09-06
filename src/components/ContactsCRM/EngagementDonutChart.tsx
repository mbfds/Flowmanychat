import React, { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { 
  Activity, 
  Users, 
  UserCheck, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  Filter, 
  RotateCcw,
  TrendingUp,
  Info
} from 'lucide-react';
import { Contact } from '../../types';
import { 
  EngagementStatus, 
  ENGAGEMENT_CONFIG, 
  getContactEngagementStatus 
} from '../../utils/inactivityHelper';

interface EngagementDonutChartProps {
  contacts: Contact[];
  activeFilter: 'all' | EngagementStatus;
  onSelectFilter: (status: 'all' | EngagementStatus) => void;
  onOpenOptimizer?: () => void;
}

interface ChartDataItem {
  name: EngagementStatus;
  value: number;
  percentage: number;
  color: string;
  description: string;
}

export const EngagementDonutChart: React.FC<EngagementDonutChartProps> = ({
  contacts,
  activeFilter,
  onSelectFilter,
  onOpenOptimizer
}) => {
  // Aggregate counts per engagement status
  const { chartData, totals, activeRate } = useMemo(() => {
    const counts: Record<EngagementStatus, number> = {
      Ativo: 0,
      Inativo: 0,
      Novo: 0,
      Bloqueado: 0
    };

    contacts.forEach((c) => {
      const status = getContactEngagementStatus(c);
      counts[status] = (counts[status] || 0) + 1;
    });

    const total = contacts.length;
    const activeCount = counts.Ativo + counts.Novo;
    const activeRateVal = total > 0 ? ((activeCount / total) * 100).toFixed(1) : '0.0';

    const data: ChartDataItem[] = (['Ativo', 'Inativo', 'Novo', 'Bloqueado'] as EngagementStatus[]).map(
      (status) => ({
        name: status,
        value: counts[status],
        percentage: total > 0 ? Number(((counts[status] / total) * 100).toFixed(1)) : 0,
        color: ENGAGEMENT_CONFIG[status].color,
        description: ENGAGEMENT_CONFIG[status].description
      })
    );

    return {
      chartData: data,
      totals: counts,
      activeRate: activeRateVal
    };
  }, [contacts]);

  const totalContacts = contacts.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem;
      const config = ENGAGEMENT_CONFIG[data.name];
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[200px] z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block" 
                style={{ backgroundColor: data.color }} 
              />
              <span>{data.name}</span>
            </div>
            <span className="font-mono text-emerald-400 font-black">{data.percentage}%</span>
          </div>
          <div className="text-[11px] text-slate-300 font-semibold mb-1">
            {data.value} {data.value === 1 ? 'contato' : 'contatos'}
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-800 pt-1.5 mt-1">
            {config.description}
          </p>
          <div className="text-[9px] text-blue-400 mt-1 font-bold">
            Clique para filtrar a tabela
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      id="engagement_donut_chart_card"
      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4"
    >
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Distribuição por Status de Engajamento
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                {activeRate}% Engajados
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Métricas em tempo real calculadas pelo histórico de interação do ManyFlow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFilter !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectFilter('all')}
              className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Remover filtro de status de engajamento"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Ver Todos ({totalContacts})</span>
            </button>
          )}

          {onOpenOptimizer && totals.Inativo > 0 && (
            <button
              type="button"
              onClick={onOpenOptimizer}
              className="py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Abrir ferramenta de limpeza de contatos inativos"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Limpar {totals.Inativo} Inativos</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Donut Chart on Left, Interactive Status Cards on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Recharts Donut */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="w-full h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  cursor="pointer"
                  onClick={(entry) => {
                    const status = entry.name as EngagementStatus;
                    onSelectFilter(activeFilter === status ? 'all' : status);
                  }}
                >
                  {chartData.map((entry) => {
                    const isSelected = activeFilter === entry.name;
                    const isMuted = activeFilter !== 'all' && !isSelected;
                    return (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.color}
                        opacity={isMuted ? 0.35 : 1}
                        stroke={isSelected ? '#0F172A' : '#FFFFFF'}
                        strokeWidth={isSelected ? 2.5 : 2}
                        className="transition-all duration-200"
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Central Donut Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {activeFilter === 'all' ? totalContacts : totals[activeFilter]}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                {activeFilter === 'all' ? 'Contatos' : activeFilter}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Clique nas fatias para filtrar a tabela abaixo</span>
          </div>
        </div>

        {/* Status Legend & Breakdown Cards */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(['Ativo', 'Inativo', 'Novo', 'Bloqueado'] as EngagementStatus[]).map((status) => {
            const config = ENGAGEMENT_CONFIG[status];
            const count = totals[status];
            const pct = totalContacts > 0 ? ((count / totalContacts) * 100).toFixed(1) : '0.0';
            const isSelected = activeFilter === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => onSelectFilter(isSelected ? 'all' : status)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-950 shadow-md ring-2 ring-slate-900/10'
                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: config.color }} 
                    />
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {config.label}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-500 text-white">
                        Filtrado
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] line-clamp-1 leading-snug ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {config.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-base font-black leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {count}
                  </div>
                  <div className={`text-[10px] font-semibold font-mono ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {pct}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
