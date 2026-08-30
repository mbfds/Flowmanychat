import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Tag, 
  Eye, 
  MousePointer, 
  Instagram, 
  Facebook, 
  ExternalLink, 
  Copy, 
  Trash2, 
  Play, 
  Sparkles,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  MessageSquare,
  Variable,
  Layers,
  Info,
  Zap,
  Code2,
  Terminal
} from 'lucide-react';
import { BroadcastCampaign, Contact, CustomFieldDefinition } from '../../types';
import { GuzzleBatchModal } from './GuzzleBatchModal';

interface BroadcastDetailsDrawerProps {
  campaign: BroadcastCampaign | null;
  onClose: () => void;
  onSendNow: (campaignId: string) => void;
  onCancelSchedule: (campaignId: string) => void;
  onDuplicate: (campaign: BroadcastCampaign) => void;
  onDelete: (campaignId: string) => void;
  contacts: Contact[];
  customFields?: CustomFieldDefinition[];
}

export const BroadcastDetailsDrawer: React.FC<BroadcastDetailsDrawerProps> = ({
  campaign,
  onClose,
  onSendNow,
  onCancelSchedule,
  onDuplicate,
  onDelete,
  contacts,
  customFields = []
}) => {
  const [isGuzzleModalOpen, setIsGuzzleModalOpen] = useState(false);

  if (!campaign) return null;

  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Agendado
          </span>
        );
      case 'sending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 animate-pulse">
            <Send className="w-3.5 h-3.5" /> Enviando...
          </span>
        );
      case 'draft':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1.5">
            Rascunho
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
            Cancelado
          </span>
        );
    }
  };

  // Interpolate preview message for first sample recipient
  const getInterpolatedPreview = () => {
    let text = campaign.messageText || '';
    
    if (campaign.broadcastType === 'utility' && campaign.variableMappings) {
      Object.entries(campaign.variableMappings).forEach(([key, mappedVal]) => {
        let val = String(mappedVal || '');
        if (val.includes('{first_name}')) val = val.replace('{first_name}', 'Camila');
        if (val.includes('{cidade}')) val = val.replace('{cidade}', 'São Paulo');
        if (val.includes('{ultimo_pedido}')) val = val.replace('{ultimo_pedido}', 'PED-98421');
        if (val.includes('{cupom}')) val = val.replace('{cupom}', 'VIP25');
        
        const reg = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        text = text.replace(reg, val);
      });
      return text;
    }

    text = text.replace(/{first_name}/g, 'Camila');
    text = text.replace(/{last_name}/g, 'Silveira');
    text = text.replace(/{username}/g, '@camilasilveira.style');
    text = text.replace(/{cupom}/g, 'VIP25');
    text = text.replace(/{cidade}/g, 'São Paulo - SP');
    text = text.replace(/{preferencia}/g, 'Moda Feminina');
    text = text.replace(/{interesse}/g, 'Moda Feminina');
    
    customFields.forEach(cf => {
      const reg = new RegExp(`{${cf.key}}`, 'g');
      text = text.replace(reg, cf.defaultValue || cf.name);
    });

    return text;
  };

  const deliveryRate = campaign.totalSent > 0 
    ? Math.round((campaign.totalDelivered / campaign.totalSent) * 100) 
    : 0;
  
  const openRate = campaign.totalDelivered > 0 
    ? Math.round((campaign.totalOpened / campaign.totalDelivered) * 100) 
    : 0;

  const clickRate = campaign.totalDelivered > 0 
    ? Math.round((campaign.totalClicked / campaign.totalDelivered) * 100) 
    : 0;

  return (
    <div 
      id="broadcast_details_drawer"
      className="fixed inset-y-0 right-0 w-full sm:w-[560px] bg-white border-l border-[#E2E8F0] shadow-2xl z-40 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="p-5 border-b border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Detalhes do Disparo
            </span>
            {getStatusBadge()}
            {campaign.broadcastType === 'utility' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Meta Approved Utility
              </span>
            )}
          </div>
          <h3 className="font-bold text-base text-[#1A1D21] line-clamp-1">
            {campaign.name}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Utility Banner if utility */}
        {campaign.broadcastType === 'utility' && (
          <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span className="font-bold text-xs text-purple-950">
                  Transmissão Utilitária (Aprovada pela Meta)
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded">
                Meta Status: {campaign.metaApprovalStatus || 'APPROVED'}
              </span>
            </div>
            <p className="text-xs text-purple-900/80 leading-relaxed">
              Esta campanha utiliza um modelo homologado pela Meta Graph API. A entrega é 100% autorizada mesmo para destinatários que não enviaram mensagens nas últimas 24 horas.
            </p>
          </div>
        )}

        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-[#F8F9FB] border border-[#E2E8F0] rounded-xl text-center">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Destinatários</span>
            <span className="text-base font-bold text-[#1A1D21] mt-0.5 block">
              {campaign.totalTargeted.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-xl text-center">
            <span className="text-[10px] font-bold text-blue-700 uppercase block">Entregues</span>
            <span className="text-base font-bold text-blue-900 mt-0.5 block">
              {campaign.totalDelivered.toLocaleString('pt-BR')}
              <span className="text-[10px] text-blue-600 font-normal ml-1">({deliveryRate}%)</span>
            </span>
          </div>

          <div className="p-3 bg-purple-50/50 border border-purple-200/80 rounded-xl text-center">
            <span className="text-[10px] font-bold text-purple-700 uppercase block">Lidos (Abertura)</span>
            <span className="text-base font-bold text-purple-900 mt-0.5 block">
              {campaign.totalOpened.toLocaleString('pt-BR')}
              <span className="text-[10px] text-purple-600 font-normal ml-1">({openRate}%)</span>
            </span>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl text-center">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Cliques (CTR)</span>
            <span className="text-base font-bold text-emerald-900 mt-0.5 block">
              {campaign.totalClicked.toLocaleString('pt-BR')}
              <span className="text-[10px] text-emerald-600 font-normal ml-1">({clickRate}%)</span>
            </span>
          </div>
        </div>

        {/* Campaign Info & Meta Tag */}
        <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Canal de Envio:</span>
            <span className="font-semibold text-[#1A1D21] flex items-center gap-1">
              {campaign.channel === 'instagram' && (
                <><Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram Direct</>
              )}
              {campaign.channel === 'messenger' && (
                <><Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook Messenger</>
              )}
              {campaign.channel === 'omnichannel' && (
                <>🌐 Omnichannel (Insta & FB)</>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Tag de Mensagem Meta:</span>
            <span className="font-semibold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
              {campaign.metaMessageTag || (campaign.broadcastType === 'utility' ? 'POST_PURCHASE_UPDATE' : 'MARKETING_OPT_IN')}
            </span>
          </div>

          {campaign.scheduledFor && (
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-medium">Data Agendada:</span>
              <span className="font-semibold text-amber-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                {new Date(campaign.scheduledFor).toLocaleString('pt-BR')}
              </span>
            </div>
          )}

          {campaign.sentAt && (
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-medium">Disparado em:</span>
              <span className="font-semibold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {new Date(campaign.sentAt).toLocaleString('pt-BR')}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Cadência de Disparo:</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {campaign.throttleSpeed === 'safe' ? 'Seguro (30 msgs/min - Meta Safe)' : '60 msgs/min'}
            </span>
          </div>

          {/* Facebook Batch & Guzzle Status */}
          <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
            <span className="text-[#64748B] font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              Motor de Disparo:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                Facebook Batch (50/chunk) + Guzzle
              </span>
              <button
                type="button"
                onClick={() => setIsGuzzleModalOpen(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer flex items-center gap-0.5"
              >
                <Code2 className="w-3 h-3" /> Ver PHP
              </button>
            </div>
          </div>
        </div>

        {/* Mapped Variables if Utility */}
        {campaign.broadcastType === 'utility' && campaign.variableMappings && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
              <Variable className="w-3.5 h-3.5 text-purple-600" />
              <span>Mapeamento de Parâmetros da Meta</span>
            </h4>
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white space-y-2">
              {Object.entries(campaign.variableMappings).map(([param, mappedVal]) => (
                <div key={param} className="flex items-center justify-between text-xs p-1.5 bg-[#F8F9FB] rounded-lg">
                  <span className="font-mono font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                    {"{{" + param + "}}"}
                  </span>
                  <span className="text-[#64748B] font-medium">mapeado para</span>
                  <span className="font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                    {mappedVal}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Audience Filters */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#0084FF]" />
            <span>Filtros de Segmentação Aplicados</span>
          </h4>

          <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[#64748B] font-medium">Tags selecionadas:</span>
              {campaign.targetFilter.tags.length > 0 ? (
                campaign.targetFilter.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#64748B] italic">Todas as tags</span>
              )}
            </div>

            {campaign.targetFilter.customFieldKey && (
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs">
                <span className="text-[#64748B]">Campo Personalizado:</span>
                <span className="font-mono font-bold text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded">
                  {`{${campaign.targetFilter.customFieldKey}}`}
                </span>
                <span className="text-gray-500 font-medium">
                  {campaign.targetFilter.customFieldOperator} "{campaign.targetFilter.customFieldValue}"
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Message Content Preview Box */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#0084FF]" />
            <span>Conteúdo Enviado no Direct</span>
          </h4>

          <div className="p-4 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0] space-y-3">
            {campaign.mediaUrl && (
              <img
                src={campaign.mediaUrl}
                alt="Broadcast media"
                className="w-full h-36 object-cover rounded-lg border border-gray-200"
              />
            )}

            <p className="text-xs text-[#1A1D21] whitespace-pre-wrap leading-relaxed">
              {getInterpolatedPreview()}
            </p>

            {campaign.buttons && campaign.buttons.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-gray-200">
                {campaign.buttons.map((b) => (
                  <div
                    key={b.id}
                    className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-[#0084FF] text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>{b.text}</span>
                    {b.type === 'url' && <ExternalLink className="w-3 h-3" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Delivery Sample Table */}
        {campaign.recipients && campaign.recipients.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center justify-between">
              <span>Amostra de Destinatários ({campaign.recipients.length})</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Atualização em tempo real</span>
            </h4>

            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FB] border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase">
                  <tr>
                    <th className="p-2.5">Contato</th>
                    <th className="p-2.5">Canal</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaign.recipients.slice(0, 5).map((r, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2.5 font-semibold text-[#1A1D21]">
                        {r.contactName}
                        <span className="text-[10px] text-[#64748B] block font-normal">{r.username}</span>
                      </td>
                      <td className="p-2.5">
                        {r.channel === 'instagram' ? (
                          <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">Insta</span>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Messenger</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          ✓ Entregue
                        </span>
                      </td>
                      <td className="p-2.5 text-right text-[#64748B] text-[10px]">
                        {r.deliveredAt || 'Recente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDuplicate(campaign)}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
            title="Duplicar Campanha"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(campaign.id);
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-rose-50 text-[#64748B] hover:text-rose-600 transition-colors cursor-pointer"
            title="Excluir Campanha"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {campaign.status === 'scheduled' && (
            <>
              <button
                type="button"
                onClick={() => onCancelSchedule(campaign.id)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar Agendamento
              </button>
              <button
                type="button"
                onClick={() => onSendNow(campaign.id)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Disparar Agora</span>
              </button>
            </>
          )}

          {campaign.status === 'draft' && (
            <button
              type="button"
              onClick={() => onSendNow(campaign.id)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Disparar Rascunho</span>
            </button>
          )}

          {campaign.status === 'completed' && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1A1D21] transition-colors cursor-pointer"
            >
              Fechar
            </button>
          )}
        </div>
      </div>

      {/* Guzzle Batch Modal */}
      {isGuzzleModalOpen && (
        <GuzzleBatchModal
          isOpen={isGuzzleModalOpen}
          onClose={() => setIsGuzzleModalOpen(false)}
          campaign={campaign}
        />
      )}

    </div>
  );
};
