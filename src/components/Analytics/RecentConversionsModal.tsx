import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle2, 
  Instagram, 
  Facebook, 
  Calendar, 
  Clock, 
  Filter, 
  Search, 
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Tag,
  UserCheck
} from 'lucide-react';
import { Contact, Flow } from '../../types';

export interface RecentConversionEvent {
  id: string;
  contactName: string;
  username: string;
  avatarUrl: string;
  channel: 'instagram' | 'messenger';
  conversionType: 'sale' | 'lead_qualified' | 'appointment' | 'coupon_claimed';
  title: string;
  value?: number;
  flowName: string;
  timestamp: string;
  timeAgo: string;
  status: 'completed' | 'verified';
}

interface RecentConversionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversions: RecentConversionEvent[];
  onOpenFlow?: (flowId?: string) => void;
}

export const RecentConversionsModal: React.FC<RecentConversionsModalProps> = ({
  isOpen,
  onClose,
  conversions,
  onOpenFlow
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  if (!isOpen) return null;

  const filteredConversions = conversions.filter((c) => {
    const matchesSearch = 
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.flowName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || c.conversionType === selectedType;
    const matchesChannel = selectedChannel === 'all' || c.channel === selectedChannel;
    return matchesSearch && matchesType && matchesChannel;
  });

  const totalRevenue = conversions
    .filter((c) => c.value)
    .reduce((acc, c) => acc + (c.value || 0), 0);

  return (
    <div 
      id="recent_conversions_modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#1A1D21]">
                  Histórico de Conversões & Vendas Atribuídas
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {conversions.length} registradas
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Conversões capturadas em tempo real via gatilhos de Direct, checkout integrado e automações de fluxo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 text-[#64748B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white border-b border-gray-100 text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider block">Receita Total</span>
            <span className="text-lg font-bold text-emerald-950">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-blue-800 text-[10px] font-bold uppercase tracking-wider block">Total de Conversões</span>
            <span className="text-lg font-bold text-blue-950">{conversions.length}</span>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
            <span className="text-purple-800 text-[10px] font-bold uppercase tracking-wider block">Ticket Médio</span>
            <span className="text-lg font-bold text-purple-950">
              {(totalRevenue / (conversions.filter(c => c.value).length || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-amber-800 text-[10px] font-bold uppercase tracking-wider block">Tempo Médio p/ Converter</span>
            <span className="text-lg font-bold text-amber-950">4.2 minutos</span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8F9FB] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por lead, fluxo ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-xl font-medium text-gray-700 cursor-pointer focus:outline-none"
            >
              <option value="all">Todos os Tipos</option>
              <option value="sale">Vendas & Checkouts</option>
              <option value="lead_qualified">Leads Qualificados</option>
              <option value="coupon_claimed">Cupons Resgatados</option>
              <option value="appointment">Agendamentos VIP</option>
            </select>

            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-xl font-medium text-gray-700 cursor-pointer focus:outline-none"
            >
              <option value="all">Todos os Canais</option>
              <option value="instagram">Instagram Direct</option>
              <option value="messenger">Messenger</option>
            </select>
          </div>
        </div>

        {/* Conversions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredConversions.map((event) => (
            <div
              key={event.id}
              className="bg-white p-4 rounded-xl border border-[#E2E8F0] hover:border-gray-300 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Lead & Event details */}
              <div className="flex items-start gap-3">
                <img
                  src={event.avatarUrl}
                  alt={event.contactName}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#1A1D21]">{event.contactName}</span>
                    <span className="text-[11px] text-[#64748B]">{event.username}</span>
                    {event.channel === 'instagram' ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-0.5">
                        <Instagram className="w-2.5 h-2.5" /> IG
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-0.5">
                        <Facebook className="w-2.5 h-2.5" /> FB
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1A1D21]">{event.title}</span>
                    <span className="text-[11px] text-[#64748B]">• Fluxo: <span className="font-medium text-blue-600">{event.flowName}</span></span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{event.timeAgo} ({new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Conversão Concluída
                    </span>
                  </div>
                </div>
              </div>

              {/* Value & Badge */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 shrink-0">
                {event.value ? (
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 block">
                      +{event.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">Checkout Aprovado</span>
                  </div>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    Lead Qualificado
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredConversions.length === 0 && (
            <div className="text-center py-12 text-[#64748B] text-xs">
              Nenhuma conversão encontrada para os filtros selecionados.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
          <span className="text-xs text-[#64748B]">
            Exibindo <span className="font-bold text-[#1A1D21]">{filteredConversions.length}</span> de <span className="font-bold text-[#1A1D21]">{conversions.length}</span> conversões registradas
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
