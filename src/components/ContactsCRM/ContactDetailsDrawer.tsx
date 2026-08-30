import React, { useState } from 'react';
import { 
  X, 
  Instagram, 
  Facebook, 
  Mail, 
  Phone, 
  Calendar, 
  Tag as TagIcon, 
  User, 
  CheckCircle2, 
  Bot, 
  UserCheck, 
  Clock, 
  DollarSign, 
  Plus, 
  Trash2, 
  ExternalLink,
  MessageSquare,
  Shield,
  Sparkles,
  Edit2,
  Activity,
  Flame,
  Zap,
  TrendingUp,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { Contact, ContactActivityLog } from '../../types';
import { ContactNotes } from './ContactNotes';
import { ContactActivityTimeline } from './ContactActivityTimeline';
import { calculateLeadScore, getLeadScoreTier } from '../../utils/leadScoring';
import { LeadScoreBreakdownModal } from './LeadScoreBreakdownModal';

interface ContactDetailsDrawerProps {
  contact: Contact;
  onClose: () => void;
  onUpdateContact: (updated: Contact) => void;
  onDeleteContact?: (id: string) => void;
  onOpenChat?: (contact: Contact) => void;
  initialTab?: 'scoring' | 'activity' | 'notes' | 'details' | 'custom_fields';
  onOpenRulesConfig?: () => void;
}

export const ContactDetailsDrawer: React.FC<ContactDetailsDrawerProps> = ({
  contact,
  onClose,
  onUpdateContact,
  onDeleteContact,
  onOpenChat,
  initialTab = 'activity',
  onOpenRulesConfig
}) => {
  const [activeTab, setActiveTab] = useState<'scoring' | 'activity' | 'notes' | 'details' | 'custom_fields'>(initialTab);
  const [newTagInput, setNewTagInput] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  const leadScoreBreakdown = calculateLeadScore(contact);
  const tierInfo = getLeadScoreTier(leadScoreBreakdown.totalScore);

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim();
    if (!contact.tags.includes(cleanTag)) {
      const nowStr = `Hoje às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const newLog: ContactActivityLog = {
        id: `act_${Date.now()}`,
        type: 'tag_added',
        title: 'Tag Atribuída Manualmente',
        description: `Tag '${cleanTag}' foi associada ao contato pela equipe.`,
        timestamp: nowStr,
        actor: 'agent',
        tagName: cleanTag
      };

      onUpdateContact({
        ...contact,
        tags: [...contact.tags, cleanTag],
        activityLogs: [newLog, ...(contact.activityLogs || [])]
      });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nowStr = `Hoje às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: ContactActivityLog = {
      id: `act_${Date.now()}`,
      type: 'tag_removed',
      title: 'Tag Removida Manualmente',
      description: `Tag '${tagToRemove}' foi desvinculada do contato pela equipe.`,
      timestamp: nowStr,
      actor: 'agent',
      tagName: tagToRemove
    };

    onUpdateContact({
      ...contact,
      tags: contact.tags.filter((t) => t !== tagToRemove),
      activityLogs: [newLog, ...(contact.activityLogs || [])]
    });
  };

  const handleStatusChange = (newStatus: Contact['status']) => {
    const nowStr = `Hoje às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const statusLabels: Record<string, string> = {
      active: 'Bot Ativo',
      bot_paused: 'Bot Pausado',
      human_assigned: 'Atendimento Humano',
      unsubscribed: 'Descadastrado'
    };

    const newLog: ContactActivityLog = {
      id: `act_${Date.now()}`,
      type: newStatus === 'human_assigned' ? 'human_handover' : 'status_changed',
      title: `Status Alterado para ${statusLabels[newStatus] || newStatus}`,
      description: `O estado de automação do contato foi modificado para '${statusLabels[newStatus]}'.`,
      timestamp: nowStr,
      actor: 'agent'
    };

    onUpdateContact({
      ...contact,
      status: newStatus,
      activityLogs: [newLog, ...(contact.activityLogs || [])]
    });
  };

  const handleAddCustomField = () => {
    if (!newFieldKey.trim() || !newFieldValue.trim()) return;
    const cleanKey = newFieldKey.trim();
    const cleanVal = newFieldValue.trim();

    const nowStr = `Hoje às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: ContactActivityLog = {
      id: `act_${Date.now()}`,
      type: 'custom_field_updated',
      title: `Campo Customizado '{${cleanKey}}' Definido`,
      description: `Valor atualizado para "${cleanVal}".`,
      timestamp: nowStr,
      actor: 'agent',
      fieldName: cleanKey,
      fieldValue: cleanVal
    };

    onUpdateContact({
      ...contact,
      customFields: {
        ...contact.customFields,
        [cleanKey]: cleanVal
      },
      activityLogs: [newLog, ...(contact.activityLogs || [])]
    });
    setNewFieldKey('');
    setNewFieldValue('');
    setShowAddField(false);
  };

  const handleRemoveCustomField = (key: string) => {
    const updated = { ...contact.customFields };
    delete updated[key];

    const nowStr = `Hoje às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: ContactActivityLog = {
      id: `act_${Date.now()}`,
      type: 'custom_field_updated',
      title: `Campo '{${key}}' Removido`,
      description: `O campo customizado foi removido do perfil do contato.`,
      timestamp: nowStr,
      actor: 'agent',
      fieldName: key
    };

    onUpdateContact({
      ...contact,
      customFields: updated,
      activityLogs: [newLog, ...(contact.activityLogs || [])]
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end" id="contact_details_drawer_overlay">
      <div 
        id="contact_details_drawer"
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-[#E2E8F0] animate-in slide-in-from-right duration-200"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={contact.avatarUrl}
              alt={contact.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1A1D21]">{contact.name}</h3>
                {contact.channel === 'instagram' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-1">
                    <Instagram className="w-3 h-3" /> Instagram
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <Facebook className="w-3 h-3" /> Messenger
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] font-mono">{contact.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenChat && (
              <button
                onClick={() => onOpenChat(contact)}
                title="Abrir Conversa"
                className="py-1.5 px-3 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            )}
            <button
              id="btn_close_contact_details"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status & Quick Stats Bar with Lead Score */}
        <div className="px-6 py-3 bg-white border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#64748B]">Status do Bot:</span>
            <select
              value={contact.status}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-bold text-[#1A1D21] focus:outline-none"
            >
              <option value="active">🟢 Bot Ativo (Automático)</option>
              <option value="bot_paused">⏸️ Bot Pausado</option>
              <option value="human_assigned">👨‍💼 Atendimento Humano</option>
              <option value="unsubscribed">🚫 Desinscreveu</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Lead Score Badge */}
            <button
              onClick={() => setActiveTab('scoring')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer shadow-2xs ${tierInfo.badgeClass} hover:opacity-90`}
              title="Clique para ver detalhes do Lead Scoring"
            >
              <span>{tierInfo.icon}</span>
              <span>Score: <strong>{leadScoreBreakdown.totalScore}</strong></span>
              <span className="text-[10px] font-bold opacity-80">({tierInfo.label})</span>
            </button>

            {contact.lifetimeValue !== undefined && contact.lifetimeValue > 0 && (
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 text-[11px]">
                <DollarSign className="w-3 h-3" /> R$ {contact.lifetimeValue.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#E2E8F0] shrink-0 bg-white overflow-x-auto">
          <button
            id="tab_drawer_scoring"
            onClick={() => setActiveTab('scoring')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'scoring'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Lead Scoring</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${tierInfo.pillClass}`}>
              {leadScoreBreakdown.totalScore}
            </span>
          </button>

          <button
            id="tab_drawer_activity"
            onClick={() => setActiveTab('activity')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'activity'
                ? 'border-[#0084FF] text-[#0084FF]'
                : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#0084FF]" />
            <span>Histórico & Logs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-[#0084FF]">
              {contact.activityLogs?.length || 0}
            </span>
          </button>

          <button
            id="tab_drawer_notes"
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-[#0084FF] text-[#0084FF]'
                : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <span>📝 Notas Internas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {contact.internalNotes?.length || 0}
            </span>
          </button>

          <button
            id="tab_drawer_details"
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-[#0084FF] text-[#0084FF]'
                : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <span>👤 Perfil & Contato</span>
          </button>

          <button
            id="tab_drawer_custom_fields"
            onClick={() => setActiveTab('custom_fields')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'custom_fields'
                ? 'border-[#0084FF] text-[#0084FF]'
                : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <span>⚙️ Campos Customizados</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
              {Object.keys(contact.customFields).length}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* LEAD SCORING TAB */}
          {activeTab === 'scoring' && (
            <div className="space-y-6">
              {/* Thermometer Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-[#1A1D21] text-white space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Classificação de Temperatura</span>
                    <div className="text-3xl font-black flex items-center gap-2 mt-0.5">
                      <span>{leadScoreBreakdown.totalScore}</span>
                      <span className="text-sm font-semibold text-gray-400">pontos</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold ${tierInfo.pillClass}`}>
                      {tierInfo.icon} Lead {tierInfo.label}
                    </span>
                    <div className="text-[10px] text-gray-300 mt-1">
                      {leadScoreBreakdown.totalScore >= 70
                        ? '🔥 Alta prontidão para fechamento comercial'
                        : leadScoreBreakdown.totalScore >= 35
                        ? '⚡ Lead em consideração / engajado'
                        : '❄️ Lead em aquecimento inicial'}
                    </div>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${tierInfo.barColor} transition-all duration-500`}
                      style={{ width: `${Math.min(100, (leadScoreBreakdown.totalScore / 100) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                    <span>0 (Frio ❄️)</span>
                    <span>35 (Morno ⚡)</span>
                    <span>70+ (Quente 🔥)</span>
                  </div>
                </div>
              </div>

              {/* Breakdown breakdown item cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Detalhamento dos Pontos ({leadScoreBreakdown.items.length} critérios)</span>
                  </h4>
                  {onOpenRulesConfig && (
                    <button
                      onClick={onOpenRulesConfig}
                      className="text-[11px] font-bold text-[#0084FF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Ver Regras de Pontuação</span>
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-100 rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-2xs">
                  {leadScoreBreakdown.items.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#64748B]">
                      Nenhuma pontuação registrada ainda. Novas interações aumentarão a pontuação deste lead.
                    </div>
                  ) : (
                    leadScoreBreakdown.items.map((item) => (
                      <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                        <div className="min-w-0 pr-3">
                          <div className="text-xs font-bold text-[#1A1D21] truncate">{item.label}</div>
                          <div className="text-[11px] text-[#64748B] truncate">{item.detail}</div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-md text-xs font-black shrink-0 ${
                          item.points >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {item.points >= 0 ? `+${item.points}` : item.points} pts
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Manual bonus fast form */}
              <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#0084FF]" />
                      <span>Ajuste Rápido de Pontuação</span>
                    </span>
                    <p className="text-[11px] text-[#64748B]">
                      Atribua pontos extras ou penalidades manuais para este lead específico.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowScoreModal(true)}
                    className="py-1 px-2.5 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#0084FF] text-xs font-bold text-[#0084FF] cursor-pointer shadow-2xs"
                  >
                    Auditoria Completa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 0. ACTIVITY LOG TIMELINE TAB */}
          {activeTab === 'activity' && (
            <ContactActivityTimeline
              contact={contact}
              onUpdateContact={onUpdateContact}
            />
          )}

          {/* 1. INTERNAL NOTES TAB */}
          {activeTab === 'notes' && (
            <ContactNotes 
              contact={contact} 
              onUpdateContact={onUpdateContact} 
            />
          )}

          {/* 2. PROFILE & CONTACT DETAILS TAB */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Contact Info Card */}
              <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-3">
                <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
                  Informações de Contato
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase">E-mail</span>
                    <div className="flex items-center gap-2 text-[#1A1D21] font-medium bg-white p-2 rounded-lg border border-[#E2E8F0]">
                      <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                      <span className="truncate">{contact.email || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase">Telefone / WhatsApp</span>
                    <div className="flex items-center gap-2 text-[#1A1D21] font-medium bg-white p-2 rounded-lg border border-[#E2E8F0]">
                      <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{contact.phone || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase">Primeiro Contato</span>
                    <div className="flex items-center gap-2 text-[#1A1D21] bg-white p-2 rounded-lg border border-[#E2E8F0]">
                      <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase">Última Interação</span>
                    <div className="flex items-center gap-2 text-[#1A1D21] bg-white p-2 rounded-lg border border-[#E2E8F0]">
                      <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{contact.lastInteractionAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tags Atribuídas ({contact.tags.length})</span>
                  </h4>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                    >
                      <span>🏷️ {t}</span>
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="text-emerald-600 hover:text-rose-600 cursor-pointer font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Tag */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Adicionar nova tag (ex: Lead-VIP, Comprou)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                  />
                  <button
                    onClick={handleAddTag}
                    className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Assigned Agent */}
              <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                  Atendente Responsável:
                </span>
                <input
                  type="text"
                  value={contact.assignedAgent || ''}
                  onChange={(e) => onUpdateContact({ ...contact, assignedAgent: e.target.value })}
                  placeholder="Ex: Lucas Santos (Vendas)"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1A1D21]"
                />
              </div>
            </div>
          )}

          {/* 3. CUSTOM FIELDS TAB */}
          {activeTab === 'custom_fields' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1A1D21]">Campos Customizados do CRM</h4>
                  <p className="text-[11px] text-[#64748B]">
                    Variáveis capturadas automaticamente durante o fluxo do bot ou preenchidas pela equipe.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddField(true)}
                  className="py-1.5 px-2.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-gray-50 text-[#1A1D21] text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Campo</span>
                </button>
              </div>

              {showAddField && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2.5">
                  <span className="text-xs font-bold text-blue-900 block">Adicionar Campo Customizado</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nome da chave (ex: interesse, cargo)"
                      value={newFieldKey}
                      onChange={(e) => setNewFieldKey(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1A1D21]"
                    />
                    <input
                      type="text"
                      placeholder="Valor (ex: Plano Pro, Gerente)"
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1A1D21]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddField(false)}
                      className="px-2.5 py-1 rounded text-xs text-[#64748B] hover:bg-gray-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddCustomField}
                      className="px-3 py-1 rounded bg-[#0084FF] text-white text-xs font-bold hover:bg-[#0073E6] cursor-pointer"
                    >
                      Salvar Campo
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {Object.entries(contact.customFields).length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                    Nenhum campo customizado atribuído a este lead.
                  </div>
                ) : (
                  Object.entries(contact.customFields).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-gray-500 text-[11px] block">{key}</span>
                        <span className="font-semibold text-[#1A1D21] text-xs">{value}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveCustomField(key)}
                        className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showScoreModal && (
        <LeadScoreBreakdownModal
          contact={contact}
          onClose={() => setShowScoreModal(false)}
          onUpdateContact={onUpdateContact}
          onOpenRulesConfig={onOpenRulesConfig}
        />
      )}
    </div>
  );
};
