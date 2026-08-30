import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Send, 
  Play, 
  Pause, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Instagram, 
  Facebook, 
  Layers, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Trash2, 
  Plus,
  Sparkles,
  ArrowRight,
  Info,
  SlidersHorizontal,
  Flame,
  Radio
} from 'lucide-react';
import { BroadcastCampaign, Contact } from '../../types';

interface BroadcastQueueManagerProps {
  broadcasts: BroadcastCampaign[];
  onUpdateBroadcasts: (broadcasts: BroadcastCampaign[]) => void;
  onSendNow: (campaignId: string) => void;
  onCancelSchedule: (campaignId: string) => void;
  onOpenReschedule: (campaign: BroadcastCampaign) => void;
  onOpenDetails: (campaign: BroadcastCampaign) => void;
  onCreateNew: () => void;
  contacts: Contact[];
}

export const BroadcastQueueManager: React.FC<BroadcastQueueManagerProps> = ({
  broadcasts,
  onUpdateBroadcasts,
  onSendNow,
  onCancelSchedule,
  onOpenReschedule,
  onOpenDetails,
  onCreateNew,
  contacts
}) => {
  // Live tick state for counting down and monitoring due campaigns
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [workerSecondsLeft, setWorkerSecondsLeft] = useState<number>(5);
  const [isWorkerActive, setIsWorkerActive] = useState<boolean>(true);
  const [executingCampaignIds, setExecutingCampaignIds] = useState<Record<string, number>>({});

  // Ticker for live countdowns & automated execution loop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Decrement worker heartbeat counter
      setWorkerSecondsLeft((prev) => {
        if (prev <= 1) {
          // Check if any scheduled campaign has expired and should auto-execute
          if (isWorkerActive) {
            broadcasts.forEach((bc) => {
              if (bc.status === 'scheduled' && bc.scheduledFor) {
                const schedDate = new Date(bc.scheduledFor);
                if (!isNaN(schedDate.getTime()) && schedDate.getTime() <= now.getTime()) {
                  // Trigger auto-dispatch
                  triggerAutoDispatch(bc.id);
                }
              }
            });
          }
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [broadcasts, isWorkerActive]);

  // Handle auto-dispatch animation & completion
  const triggerAutoDispatch = (campaignId: string) => {
    // Avoid double trigger
    if (executingCampaignIds[campaignId] !== undefined) return;

    setExecutingCampaignIds((prev) => ({ ...prev, [campaignId]: 10 }));

    // Simulate progress
    const interval = setInterval(() => {
      setExecutingCampaignIds((prev) => {
        const current = prev[campaignId] || 0;
        if (current >= 100) {
          clearInterval(interval);
          // Complete campaign
          setTimeout(() => {
            onSendNow(campaignId);
            setExecutingCampaignIds((p) => {
              const copy = { ...p };
              delete copy[campaignId];
              return copy;
            });
          }, 300);
          return prev;
        }
        return { ...prev, [campaignId]: current + 25 };
      });
    }, 400);
  };

  // Toggle Pause / Resume
  const handleTogglePause = (campaign: BroadcastCampaign) => {
    const updated = broadcasts.map((bc) => {
      if (bc.id === campaign.id) {
        return {
          ...bc,
          status: bc.status === 'paused' ? ('scheduled' as const) : ('paused' as const)
        };
      }
      return bc;
    });
    onUpdateBroadcasts(updated);
  };

  // Filter only scheduled & paused campaigns
  const queueCampaigns = broadcasts
    .filter((bc) => bc.status === 'scheduled' || bc.status === 'paused' || bc.status === 'sending')
    .sort((a, b) => {
      const timeA = a.scheduledFor ? new Date(a.scheduledFor).getTime() : Infinity;
      const timeB = b.scheduledFor ? new Date(b.scheduledFor).getTime() : Infinity;
      return timeA - timeB;
    });

  // Calculate high-level stats
  const totalInQueue = queueCampaigns.length;
  const totalTargetedInQueue = queueCampaigns.reduce((acc, c) => acc + (c.totalTargeted || 0), 0);
  
  // Format countdown string
  const getCountdown = (scheduledFor?: string) => {
    if (!scheduledFor) return 'Horário indefinido';
    const target = new Date(scheduledFor);
    if (isNaN(target.getTime())) return 'Data inválida';

    const diffMs = target.getTime() - currentTime.getTime();
    if (diffMs <= 0) {
      return 'Venceu • Pronto para disparar';
    }

    const diffSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `Em ${days}d ${remainingHours}h`;
    }
    if (hours > 0) {
      return `Em ${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `Em ${minutes}m ${seconds}s`;
    }
    return `Em ${seconds}s`;
  };

  return (
    <div id="broadcast_queue_manager_container" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner: Queue Engine & Worker Status */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#1A1D21]">
                  Fila de Disparos Agendados
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600" /> {totalInQueue} {totalInQueue === 1 ? 'campanha na fila' : 'campanhas na fila'}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Gerenciamento autônomo de transmissões programadas com verificação de horário e envio em segundo plano.
              </p>
            </div>
          </div>

          {/* Worker Controller & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F8F9FB] px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isWorkerActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
              <span className="text-[#1A1D21] font-semibold">
                {isWorkerActive ? `Worker Ativo (scan em ${workerSecondsLeft}s)` : 'Worker Pausado'}
              </span>
              <button
                type="button"
                onClick={() => setIsWorkerActive(!isWorkerActive)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer ml-1"
              >
                {isWorkerActive ? 'Pausar' : 'Ativar'}
              </button>
            </div>

            <button
              type="button"
              onClick={onCreateNew}
              className="py-2 px-3.5 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-xs">
          <div className="p-3 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0]">
            <span className="text-[#64748B] text-[11px] font-bold uppercase tracking-wider block">Campanhas Programadas</span>
            <span className="text-lg font-bold text-[#1A1D21]">{totalInQueue}</span>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/80">
            <span className="text-blue-800 text-[11px] font-bold uppercase tracking-wider block">Total de Leads na Fila</span>
            <span className="text-lg font-bold text-blue-950">{totalTargetedInQueue.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80">
            <span className="text-amber-800 text-[11px] font-bold uppercase tracking-wider block">Próximo Disparo</span>
            <span className="text-xs font-bold text-amber-950 truncate block mt-1">
              {queueCampaigns[0]?.scheduledFor 
                ? new Date(queueCampaigns[0].scheduledFor).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) 
                : 'Nenhum'}
            </span>
          </div>

          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/80">
            <span className="text-purple-800 text-[11px] font-bold uppercase tracking-wider block">Fuso Horário</span>
            <span className="text-xs font-bold text-purple-950 block mt-1">Brasília (UTC-3)</span>
          </div>
        </div>
      </div>

      {/* Queue List Cards */}
      <div className="space-y-3">
        {queueCampaigns.map((campaign) => {
          const isUtility = campaign.broadcastType === 'utility';
          const isPaused = campaign.status === 'paused';
          const isSending = campaign.status === 'sending' || executingCampaignIds[campaign.id] !== undefined;
          const currentProgress = executingCampaignIds[campaign.id] || campaign.progressPercent || 0;
          const countdownText = getCountdown(campaign.scheduledFor);
          const isOverdue = countdownText.includes('Venceu');

          return (
            <div
              key={campaign.id}
              className={`bg-white rounded-2xl border transition-all shadow-2xs hover:shadow-xs p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                isPaused 
                  ? 'border-gray-300 bg-gray-50/60 opacity-90' 
                  : isOverdue 
                  ? 'border-amber-400 bg-amber-50/20' 
                  : 'border-[#E2E8F0] hover:border-gray-300'
              }`}
            >
              {/* Left Info */}
              <div className="space-y-2 flex-1 min-w-0">
                
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  {isSending ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Disparando ({currentProgress}%)...
                    </span>
                  ) : isPaused ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-800 border border-gray-300 flex items-center gap-1">
                      <Pause className="w-3 h-3" /> Fila Pausada
                    </span>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                      isOverdue 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{countdownText}</span>
                    </span>
                  )}

                  {/* Broadcast Type */}
                  {isUtility ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Utilidade Meta
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Padrão 24h
                    </span>
                  )}

                  {/* Channel */}
                  {campaign.channel === 'instagram' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-1">
                      <Instagram className="w-3 h-3 text-pink-600" /> Instagram
                    </span>
                  )}
                  {campaign.channel === 'messenger' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <Facebook className="w-3 h-3 text-blue-600" /> Messenger
                    </span>
                  )}
                  {campaign.channel === 'omnichannel' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-purple-600" /> Omnichannel
                    </span>
                  )}
                </div>

                {/* Campaign Title & Message */}
                <div>
                  <h3 
                    onClick={() => onOpenDetails(campaign)}
                    className="font-bold text-sm text-[#1A1D21] hover:text-[#0084FF] cursor-pointer transition-colors"
                  >
                    {campaign.name}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                    "{campaign.messageText}"
                  </p>
                </div>

                {/* Progress Bar (if actively sending) */}
                {isSending && (
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentProgress}%` }}
                    ></div>
                  </div>
                )}

                {/* Audience Segmentation Tags */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-[#64748B] font-semibold mr-1">Segmentação:</span>
                  {campaign.targetFilter.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.2 rounded text-[10px] bg-gray-100 text-gray-700 font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                  {campaign.targetFilter.customFieldKey && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-100 text-purple-800 font-mono">
                      {`{${campaign.targetFilter.customFieldKey}}`}
                    </span>
                  )}
                  <span className="text-[11px] text-emerald-700 font-bold ml-1">
                    • {campaign.totalTargeted} leads no alvo
                  </span>
                </div>

              </div>

              {/* Middle: Scheduled Date & Time Badge */}
              <div className="flex flex-col items-start lg:items-end justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-3 lg:pt-0 lg:pl-6 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Data & Hora Programada
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-[#1A1D21]">
                    {campaign.scheduledFor
                      ? new Date(campaign.scheduledFor).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Data não definida'}
                  </span>
                </div>
                <span className="text-[11px] text-amber-700 font-medium mt-0.5">
                  {countdownText}
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 border-gray-100 pt-3 lg:pt-0">
                
                {/* Send Now Immediately Button */}
                <button
                  type="button"
                  onClick={() => onSendNow(campaign.id)}
                  title="Disparar Agora (Antecipar Disparo)"
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Disparar Agora</span>
                </button>

                {/* Reschedule Button */}
                <button
                  type="button"
                  onClick={() => onOpenReschedule(campaign)}
                  title="Alterar Data e Hora do Agendamento"
                  className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>Reagendar</span>
                </button>

                {/* Pause / Resume Button */}
                <button
                  type="button"
                  onClick={() => handleTogglePause(campaign)}
                  title={isPaused ? 'Retomar Disparo Programado' : 'Pausar Disparo Temporariamente'}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isPaused 
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                  }`}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-700" /> : <Pause className="w-3.5 h-3.5" />}
                </button>

                {/* Cancel Schedule Button */}
                <button
                  type="button"
                  onClick={() => onCancelSchedule(campaign.id)}
                  title="Cancelar Agendamento"
                  className="p-2 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* View Details Button */}
                <button
                  type="button"
                  onClick={() => onOpenDetails(campaign)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}

        {/* Empty State */}
        {queueCampaigns.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-[#E2E8F0] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-[#1A1D21]">
                Nenhum disparo agendado na fila
              </h3>
              <p className="text-xs text-[#64748B]">
                Programe transmissões para datas e horários estratégicos no Instagram e Messenger com execução automatizada.
              </p>
            </div>
            <button
              type="button"
              onClick={onCreateNew}
              className="py-2.5 px-5 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Agendar Nova Transmissão
            </button>
          </div>
        )}
      </div>

      {/* Guide Note Box */}
      <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex items-start gap-3 text-xs text-indigo-950">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Como funciona o Gerenciador de Fila do ManyFlow:</span>
          <p className="text-indigo-900 text-[11px] leading-relaxed">
            As campanhas agendadas são monitoradas em segundo plano respeitando o fuso horário configurado. No momento exato programado, o motor de envio divide os destinatários em lotes seguros de acordo com a política de rate-limit da Meta e conclui a entrega com atualização de métricas e status de cada destinatário.
          </p>
        </div>
      </div>

    </div>
  );
};
