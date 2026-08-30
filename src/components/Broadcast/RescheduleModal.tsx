import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Send,
  Zap
} from 'lucide-react';
import { BroadcastCampaign } from '../../types';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: BroadcastCampaign | null;
  onSaveSchedule: (campaignId: string, newScheduledFor: string) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onSaveSchedule
}) => {
  if (!isOpen || !campaign) return null;

  // Derive initial date & time from campaign.scheduledFor or tomorrow
  const getInitialValues = () => {
    if (campaign.scheduledFor) {
      const d = new Date(campaign.scheduledFor);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return {
          date: `${year}-${month}-${day}`,
          time: `${hours}:${minutes}`
        };
      }
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      time: '19:30'
    };
  };

  const initial = getInitialValues();
  const [scheduledDate, setScheduledDate] = useState(initial.date);
  const [scheduledTime, setScheduledTime] = useState(initial.time);
  const [activePreset, setActivePreset] = useState<string>('custom');

  // Quick preset helper
  const applyPreset = (type: 'in_15m' | 'today_20h' | 'tomorrow_9h' | 'tomorrow_19h30') => {
    const now = new Date();
    if (type === 'in_15m') {
      now.setMinutes(now.getMinutes() + 15);
      setScheduledDate(now.toISOString().slice(0, 10));
      setScheduledTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setActivePreset('in_15m');
    } else if (type === 'today_20h') {
      setScheduledDate(now.toISOString().slice(0, 10));
      setScheduledTime('20:00');
      setActivePreset('today_20h');
    } else if (type === 'tomorrow_9h') {
      now.setDate(now.getDate() + 1);
      setScheduledDate(now.toISOString().slice(0, 10));
      setScheduledTime('09:00');
      setActivePreset('tomorrow_9h');
    } else if (type === 'tomorrow_19h30') {
      now.setDate(now.getDate() + 1);
      setScheduledDate(now.toISOString().slice(0, 10));
      setScheduledTime('19:30');
      setActivePreset('tomorrow_19h30');
    }
  };

  const handleSave = () => {
    try {
      const selected = new Date(`${scheduledDate}T${scheduledTime}:00`);
      if (isNaN(selected.getTime())) {
        alert('Por favor, informe uma data e hora válidas.');
        return;
      }
      onSaveSchedule(campaign.id, selected.toISOString());
      onClose();
    } catch {
      onSaveSchedule(campaign.id, `${scheduledDate}T${scheduledTime}:00Z`);
      onClose();
    }
  };

  const getFormattedSelectedTime = () => {
    try {
      const d = new Date(`${scheduledDate}T${scheduledTime}:00`);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return `${scheduledDate} às ${scheduledTime}`;
    }
    return `${scheduledDate} às ${scheduledTime}`;
  };

  return (
    <div 
      id="reschedule_modal_container"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1D21]">
                Agendar / Reagendar Campanha
              </h3>
              <p className="text-xs text-[#64748B] line-clamp-1">
                {campaign.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-[#64748B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          
          {/* Quick Presets */}
          <div>
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Atalhos Rápidos de Horário
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('in_15m')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  activePreset === 'in_15m'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                    : 'border-[#E2E8F0] hover:border-gray-300 text-gray-700 bg-[#F8F9FB]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Em 15 minutos</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('today_20h')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  activePreset === 'today_20h'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                    : 'border-[#E2E8F0] hover:border-gray-300 text-gray-700 bg-[#F8F9FB]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Hoje às 20h00</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('tomorrow_9h')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  activePreset === 'tomorrow_9h'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                    : 'border-[#E2E8F0] hover:border-gray-300 text-gray-700 bg-[#F8F9FB]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Amanhã às 09h00</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('tomorrow_19h30')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  activePreset === 'tomorrow_19h30'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                    : 'border-[#E2E8F0] hover:border-gray-300 text-gray-700 bg-[#F8F9FB]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Amanhã às 19h30 (Pico)</span>
              </button>
            </div>
          </div>

          {/* Date & Time Custom Pickers */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-amber-950 block mb-1">
                  Data do Disparo:
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => {
                    setScheduledDate(e.target.value);
                    setActivePreset('custom');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-950 block mb-1">
                  Horário (Fuso de Brasília):
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => {
                    setScheduledTime(e.target.value);
                    setActivePreset('custom');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Formatted Confirmation Note */}
            <div className="pt-2 border-t border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900">
              <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Previsão de Execução: </span>
                <span className="font-bold capitalize">{getFormattedSelectedTime()}</span>
              </div>
            </div>
          </div>

          {/* Audience and Target info */}
          <div className="bg-[#F8F9FB] p-3.5 rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#64748B] block text-[11px]">Público Alvo na Fila</span>
              <span className="font-bold text-[#1A1D21]">{campaign.totalTargeted} leads</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px]">Canal</span>
              <span className="font-bold text-[#1A1D21] capitalize">{campaign.channel}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px]">Modo de Envio</span>
              <span className="font-bold text-indigo-700">Fila Segura Meta</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-gray-100 text-[#64748B] transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Salvar Agendamento</span>
          </button>
        </div>

      </div>
    </div>
  );
};
