import React, { useState } from 'react';
import { 
  Send, 
  Radio, 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Instagram, 
  Facebook, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Eye, 
  MousePointer, 
  Copy, 
  Trash2, 
  Layers, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Play,
  FileText,
  Check,
  Smartphone,
  AlertTriangle,
  Info,
  Zap,
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BroadcastCampaign, Contact, CustomFieldDefinition, UtilityMessageTemplate, BroadcastType } from '../../types';
import { BroadcastCreatorModal } from './BroadcastCreatorModal';
import { BroadcastDetailsDrawer } from './BroadcastDetailsDrawer';
import { UtilityTemplateModal } from './UtilityTemplateModal';
import { UtilityTemplateDetailsDrawer } from './UtilityTemplateDetailsDrawer';
import { GuzzleBatchModal } from './GuzzleBatchModal';
import { FacebookBatchStudio } from './FacebookBatchStudio';
import { BroadcastQueueManager } from './BroadcastQueueManager';
import { RescheduleModal } from './RescheduleModal';

interface BroadcastViewProps {
  broadcasts: BroadcastCampaign[];
  onUpdateBroadcasts: (broadcasts: BroadcastCampaign[]) => void;
  utilityTemplates?: UtilityMessageTemplate[];
  onUpdateUtilityTemplates?: (templates: UtilityMessageTemplate[]) => void;
  contacts: Contact[];
  customFields?: CustomFieldDefinition[];
  onOpenSimulator?: () => void;
}

export const BroadcastView: React.FC<BroadcastViewProps> = ({
  broadcasts,
  onUpdateBroadcasts,
  utilityTemplates = [],
  onUpdateUtilityTemplates,
  contacts,
  customFields = [],
  onOpenSimulator
}) => {
  // Main view navigation tab: 'campaigns' | 'queue_manager' | 'utility_templates' | 'batch_studio'
  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'queue_manager' | 'utility_templates' | 'batch_studio'>('campaigns');

  // Reschedule Modal State
  const [rescheduleCampaign, setRescheduleCampaign] = useState<BroadcastCampaign | null>(null);

  // Campaigns Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<'all' | 'instagram' | 'messenger' | 'omnichannel'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'completed' | 'scheduled' | 'draft'>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'standard' | 'utility'>('all');

  // Utility Templates Filter State
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<'all' | 'UTILITY' | 'AUTHENTICATION' | 'MARKETING'>('all');
  const [templateStatusFilter, setTemplateStatusFilter] = useState<'all' | 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED'>('all');
  
  // Modals & Drawers
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [initialUtilityTemplateForCreator, setInitialUtilityTemplateForCreator] = useState<UtilityMessageTemplate | null>(null);
  const [selectedCampaignForDetails, setSelectedCampaignForDetails] = useState<BroadcastCampaign | null>(null);
  
  // Utility Modals
  const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);
  const [editingUtilityTemplate, setEditingUtilityTemplate] = useState<UtilityMessageTemplate | null>(null);
  const [selectedTemplateForDetails, setSelectedTemplateForDetails] = useState<UtilityMessageTemplate | null>(null);

  // Active Sending Simulation State
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);
  const [guzzleBatchModalCampaign, setGuzzleBatchModalCampaign] = useState<BroadcastCampaign | null>(null);

  // Filtered campaigns
  const filteredBroadcasts = broadcasts.filter((bc) => {
    // Type filter
    if (selectedTypeFilter !== 'all') {
      const isUtil = bc.broadcastType === 'utility';
      if (selectedTypeFilter === 'utility' && !isUtil) return false;
      if (selectedTypeFilter === 'standard' && isUtil) return false;
    }

    // Channel filter
    if (selectedChannelFilter !== 'all' && bc.channel !== selectedChannelFilter) {
      return false;
    }

    // Status filter
    if (selectedStatusFilter !== 'all' && bc.status !== selectedStatusFilter) {
      return false;
    }

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = bc.name.toLowerCase().includes(term);
      const matchText = bc.messageText.toLowerCase().includes(term);
      const matchTag = bc.metaMessageTag?.toLowerCase().includes(term);
      if (!matchName && !matchText && !matchTag) return false;
    }

    return true;
  });

  // Filtered utility templates
  const filteredTemplates = utilityTemplates.filter((t) => {
    if (templateCategoryFilter !== 'all' && t.category !== templateCategoryFilter) return false;
    if (templateStatusFilter !== 'all' && t.status !== templateStatusFilter) return false;
    if (templateSearchTerm) {
      const term = templateSearchTerm.toLowerCase();
      return (
        t.displayName.toLowerCase().includes(term) ||
        t.name.toLowerCase().includes(term) ||
        t.bodyText.toLowerCase().includes(term) ||
        t.metaTemplateId?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Calculate high-level metrics
  const totalSentMessages = broadcasts.reduce((acc, b) => acc + (b.totalSent || 0), 0);
  const totalDeliveredMessages = broadcasts.reduce((acc, b) => acc + (b.totalDelivered || 0), 0);
  const totalOpenedMessages = broadcasts.reduce((acc, b) => acc + (b.totalOpened || 0), 0);
  const totalClickedMessages = broadcasts.reduce((acc, b) => acc + (b.totalClicked || 0), 0);

  const avgDeliveryRate = totalSentMessages > 0 
    ? Math.round((totalDeliveredMessages / totalSentMessages) * 100) 
    : 98;

  const avgOpenRate = totalDeliveredMessages > 0 
    ? Math.round((totalOpenedMessages / totalDeliveredMessages) * 100) 
    : 83;

  const avgClickRate = totalDeliveredMessages > 0 
    ? Math.round((totalClickedMessages / totalDeliveredMessages) * 100) 
    : 35;

  const scheduledCount = broadcasts.filter((b) => b.status === 'scheduled').length;
  const approvedTemplatesCount = utilityTemplates.filter((t) => t.status === 'APPROVED').length;

  // Handle Save New Campaign
  const handleSaveCampaign = (newCampaign: BroadcastCampaign, sendImmediately: boolean) => {
    const updated = [newCampaign, ...broadcasts];
    onUpdateBroadcasts(updated);

    if (sendImmediately) {
      setSendingCampaignId(newCampaign.id);
      setTimeout(() => {
        setSendingCampaignId(null);
      }, 1800);
    }
  };

  // Handle Disparar Agora (Immediate send of scheduled/draft)
  const handleSendNow = (campaignId: string) => {
    setSendingCampaignId(campaignId);

    const updated = broadcasts.map((bc) => {
      if (bc.id === campaignId) {
        return {
          ...bc,
          status: 'completed' as const,
          sentAt: new Date().toISOString(),
          totalSent: bc.totalTargeted,
          totalDelivered: Math.max(1, Math.floor(bc.totalTargeted * 0.98)),
          totalOpened: Math.floor(bc.totalTargeted * 0.84),
          totalClicked: Math.floor(bc.totalTargeted * 0.36),
          progressPercent: 100,
          recipients: contacts.slice(0, 5).map((c) => ({
            contactId: c.id,
            contactName: c.name,
            username: c.username,
            channel: c.channel,
            status: 'delivered' as const,
            deliveredAt: 'Agora'
          }))
        };
      }
      return bc;
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    onUpdateBroadcasts(updated);

    if (selectedCampaignForDetails && selectedCampaignForDetails.id === campaignId) {
      setSelectedCampaignForDetails(updated.find((b) => b.id === campaignId) || null);
    }

    setTimeout(() => {
      setSendingCampaignId(null);
    }, 1500);
  };

  // Cancel Schedule
  const handleCancelSchedule = (campaignId: string) => {
    const updated = broadcasts.map((b) => {
      if (b.id === campaignId) {
        return { ...b, status: 'cancelled' as const };
      }
      return b;
    });
    onUpdateBroadcasts(updated);

    if (selectedCampaignForDetails && selectedCampaignForDetails.id === campaignId) {
      setSelectedCampaignForDetails(updated.find((b) => b.id === campaignId) || null);
    }
  };

  // Save Reschedule
  const handleSaveReschedule = (campaignId: string, newScheduledFor: string) => {
    const updated = broadcasts.map((b) => {
      if (b.id === campaignId) {
        return {
          ...b,
          scheduledFor: newScheduledFor,
          status: 'scheduled' as const
        };
      }
      return b;
    });
    onUpdateBroadcasts(updated);

    if (selectedCampaignForDetails && selectedCampaignForDetails.id === campaignId) {
      setSelectedCampaignForDetails(updated.find((b) => b.id === campaignId) || null);
    }
  };

  // Duplicate Campaign
  const handleDuplicate = (campaign: BroadcastCampaign) => {
    const duplicate: BroadcastCampaign = {
      ...campaign,
      id: `bc_${Date.now()}`,
      name: `${campaign.name} (Cópia)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      sentAt: undefined,
      scheduledFor: undefined,
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalFailed: 0,
      progressPercent: 0
    };

    onUpdateBroadcasts([duplicate, ...broadcasts]);
    setSelectedCampaignForDetails(duplicate);
  };

  // Delete Campaign
  const handleDelete = (campaignId: string) => {
    const updated = broadcasts.filter((b) => b.id !== campaignId);
    onUpdateBroadcasts(updated);
    if (selectedCampaignForDetails?.id === campaignId) {
      setSelectedCampaignForDetails(null);
    }
  };

  // Utility Templates Handlers
  const handleSaveUtilityTemplate = (template: UtilityMessageTemplate) => {
    if (!onUpdateUtilityTemplates) return;
    const exists = utilityTemplates.some(t => t.id === template.id);
    if (exists) {
      onUpdateUtilityTemplates(utilityTemplates.map(t => t.id === template.id ? template : t));
    } else {
      onUpdateUtilityTemplates([template, ...utilityTemplates]);
    }
  };

  const handleDeleteUtilityTemplate = (templateId: string) => {
    if (!onUpdateUtilityTemplates) return;
    onUpdateUtilityTemplates(utilityTemplates.filter(t => t.id !== templateId));
    if (selectedTemplateForDetails?.id === templateId) {
      setSelectedTemplateForDetails(null);
    }
  };

  const handleLaunchWithUtilityTemplate = (template: UtilityMessageTemplate) => {
    setInitialUtilityTemplateForCreator(template);
    setIsCreatorOpen(true);
  };

  return (
    <div id="broadcast_view_container" className="h-full flex flex-col bg-[#F8F9FB] overflow-y-auto">
      {/* Module Banner / Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-[#1A1D21]">
                Transmissões em Massa & Utilidade (Broadcast)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                Instagram & Messenger
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Envie campanhas promocionais ou acione modelos de utilidade aprovados pela Meta para entrega transacional fora da janela de 24h.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setEditingUtilityTemplate(null);
                setIsUtilityModalOpen(true);
              }}
              className="py-2 px-3.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span>Novo Modelo de Utilidade (Meta)</span>
            </button>

            <button
              id="btn_create_broadcast"
              onClick={() => {
                setInitialUtilityTemplateForCreator(null);
                setIsCreatorOpen(true);
              }}
              className="py-2 px-4 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Transmissão</span>
            </button>
          </div>
        </div>

        {/* Real-time Sending Banner Animation */}
        {sendingCampaignId && (
          <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-[#0084FF] animate-spin" />
              <span className="text-xs font-bold text-blue-900">
                Disparando mensagens em fila segura (30 msgs/min)...
              </span>
            </div>
            <span className="text-xs font-bold text-[#0084FF]">100% Entregue com Sucesso!</span>
          </div>
        )}

        {/* Global Performance Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          <div className="p-3.5 bg-[#F8F9FB] border border-[#E2E8F0] rounded-xl">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Total Disparadas
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-[#1A1D21]">
                {totalSentMessages.toLocaleString('pt-BR')}
              </span>
              <span className="text-[11px] text-[#64748B]">msgs</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Taxa de Entrega
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-emerald-950">{avgDeliveryRate}%</span>
              <span className="text-[11px] text-emerald-700 font-semibold">✓✓</span>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/50 border border-purple-200/80 rounded-xl">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
              Modelos Aprovados Meta
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-purple-950">{approvedTemplatesCount}</span>
              <span className="text-[11px] text-purple-700 font-semibold">ativos</span>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/50 border border-blue-200/80 rounded-xl">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Cliques no Link (CTR)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-blue-950">{avgClickRate}%</span>
              <span className="text-[11px] text-blue-700 font-semibold">conversão</span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Agendamentos Ativos
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-amber-950">{scheduledCount}</span>
              <span className="text-[11px] text-amber-700 font-semibold">campanhas</span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-4 mt-6 border-b border-gray-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('campaigns')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'campaigns'
                ? 'border-[#0084FF] text-[#0084FF]'
                : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Todas as Campanhas ({broadcasts.length})</span>
          </button>

          <button
            type="button"
            id="tab_broadcast_queue"
            onClick={() => setActiveSubTab('queue_manager')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'queue_manager'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Fila de Disparos & Agendamentos ({scheduledCount})</span>
            {scheduledCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                {scheduledCount} ativo{scheduledCount > 1 ? 's' : ''}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('utility_templates')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'utility_templates'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Modelos de Utilidade da Meta ({utilityTemplates.length})</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
              Aprovação Meta
            </span>
          </button>

          <button
            type="button"
            id="tab_batch_processing"
            onClick={() => setActiveSubTab('batch_studio')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'batch_studio'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-[#64748B] hover:text-[#1A1D21]'
            }`}
          >
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Envio em Lote (Facebook Graph Batch - 50 msgs/call)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
              -98% Rate Limit
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 lg:p-8 space-y-4 max-w-7xl w-full mx-auto">
        
        {/* ========================================================================= */}
        {/* SUBTAB 1: CAMPAIGNS LIST */}
        {/* ========================================================================= */}
        {activeSubTab === 'campaigns' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome da campanha ou mensagem..."
                  className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filter */}
                <div className="flex items-center bg-[#F8F9FB] p-0.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSelectedTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      selectedTypeFilter === 'all' ? 'bg-white text-[#1A1D21] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    Tipo: Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTypeFilter('standard')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      selectedTypeFilter === 'standard' ? 'bg-blue-600 text-white font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    Padrão (24h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTypeFilter('utility')}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      selectedTypeFilter === 'utility' ? 'bg-purple-700 text-white font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" /> Utilidade (Meta)
                  </button>
                </div>

                {/* Channel Filters */}
                <div className="flex items-center bg-[#F8F9FB] p-0.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSelectedChannelFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      selectedChannelFilter === 'all' ? 'bg-white text-[#1A1D21] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    Canais: Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannelFilter('instagram')}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      selectedChannelFilter === 'instagram' ? 'bg-white text-pink-700 shadow-2xs font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    <Instagram className="w-3 h-3 text-pink-600" /> Instagram
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannelFilter('messenger')}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      selectedChannelFilter === 'messenger' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    <Facebook className="w-3 h-3 text-blue-600" /> Messenger
                  </button>
                </div>

                {/* Status Filters */}
                <div className="flex items-center bg-[#F8F9FB] p-0.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      selectedStatusFilter === 'all' ? 'bg-white text-[#1A1D21] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    Status: Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter('completed')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      selectedStatusFilter === 'completed' ? 'bg-emerald-500 text-white font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    Concluídos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter('scheduled')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      selectedStatusFilter === 'scheduled' ? 'bg-amber-500 text-white font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    Agendados
                  </button>
                </div>
              </div>
            </div>

            {/* Campaigns List Cards */}
            <div className="space-y-3">
              {filteredBroadcasts.map((campaign) => {
                const isUtility = campaign.broadcastType === 'utility';
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
                    key={campaign.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] hover:border-gray-300 p-4 transition-all shadow-2xs hover:shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {campaign.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Enviada
                          </span>
                        )}
                        {campaign.status === 'scheduled' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Agendada
                          </span>
                        )}
                        {campaign.status === 'draft' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                            Rascunho
                          </span>
                        )}

                        {/* Broadcast Type Badge */}
                        {isUtility ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Utilidade (Meta Approved)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Padrão (24h)
                          </span>
                        )}

                        {/* Channel */}
                        {campaign.channel === 'instagram' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-1">
                            <Instagram className="w-3 h-3 text-pink-600" /> Instagram Direct
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
                        {campaign.channel === 'sms' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-teal-600" /> SMS Gateway
                          </span>
                        )}
                      </div>

                      {/* Title & Preview */}
                      <div>
                        <h3 
                          className="font-bold text-sm text-[#1A1D21] hover:text-[#0084FF] cursor-pointer"
                          onClick={() => setSelectedCampaignForDetails(campaign)}
                        >
                          {campaign.name}
                        </h3>
                        <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                          "{campaign.messageText}"
                        </p>
                      </div>

                      {/* Tags Applied */}
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[10px] text-[#64748B] font-semibold mr-1">Filtros:</span>
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
                      </div>
                    </div>

                    {/* Middle: Metrics / Schedule info */}
                    <div className="flex items-center gap-4 lg:gap-6 border-t lg:border-t-0 lg:border-l border-gray-100 pt-3 lg:pt-0 lg:pl-6 shrink-0">
                      {campaign.status === 'completed' && (
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Entregues</span>
                            <span className="text-xs font-bold text-[#1A1D21]">
                              {campaign.totalDelivered.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-[10px] text-emerald-600 block">{deliveryRate}%</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Abertura</span>
                            <span className="text-xs font-bold text-[#1A1D21]">
                              {campaign.totalOpened.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-[10px] text-purple-600 block">{openRate}%</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Cliques</span>
                            <span className="text-xs font-bold text-[#1A1D21]">
                              {campaign.totalClicked.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-[10px] text-blue-600 block">{clickRate}%</span>
                          </div>
                        </div>
                      )}

                      {campaign.status === 'scheduled' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              {campaign.scheduledFor
                                ? new Date(campaign.scheduledFor).toLocaleString('pt-BR')
                                : 'Em breve'}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#64748B] block text-center">
                            Alvo: <b>{campaign.totalTargeted}</b> contatos
                          </span>
                        </div>
                      )}

                      {campaign.status === 'draft' && (
                        <div className="text-right">
                          <span className="text-[10px] text-[#64748B] block">Alvo estimado:</span>
                          <span className="text-xs font-bold text-[#1A1D21] block">
                            {campaign.totalTargeted} contatos
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 border-gray-100 pt-3 lg:pt-0">
                      {campaign.status === 'scheduled' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSendNow(campaign.id)}
                            title="Disparar Agora"
                            className="p-2 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Disparar Já</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRescheduleCampaign(campaign)}
                            title="Reagendar Data e Hora"
                            className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5 text-amber-700" />
                            <span className="hidden sm:inline">Reagendar</span>
                          </button>
                        </>
                      )}

                      {campaign.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => handleSendNow(campaign.id)}
                          className="p-2 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setGuzzleBatchModalCampaign(campaign)}
                        title="Executar / Ver Script Guzzle Batch (aaPanel)"
                        className="py-1.5 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="hidden sm:inline">Guzzle Batch</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedCampaignForDetails(campaign)}
                        className="py-1.5 px-3 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#1A1D21] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Ver Relatório</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(campaign)}
                        title="Duplicar Campanha"
                        className="p-2 rounded-lg hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(campaign.id)}
                        title="Excluir"
                        className="p-2 rounded-lg hover:bg-rose-50 text-[#64748B] hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredBroadcasts.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-[#E2E8F0] p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto">
                    <Radio className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A1D21]">Nenhuma transmissão encontrada</h3>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    Nenhuma campanha corresponde aos filtros selecionados. Crie um novo disparo para engajar seus leads.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setInitialUtilityTemplateForCreator(null);
                      setIsCreatorOpen(true);
                    }}
                    className="py-2 px-4 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Criar Primeira Transmissão
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 2: QUEUE & DISPATCH MANAGER (NOVO GERENCIADOR DE FILA META) */}
        {/* ========================================================================= */}
        {activeSubTab === 'queue_manager' && (
          <BroadcastQueueManager
            broadcasts={broadcasts}
            onUpdateBroadcasts={onUpdateBroadcasts}
            onSendNow={handleSendNow}
            onCancelSchedule={handleCancelSchedule}
            onOpenReschedule={(camp) => setRescheduleCampaign(camp)}
            onOpenDetails={(camp) => setSelectedCampaignForDetails(camp)}
            onCreateNew={() => {
              setInitialUtilityTemplateForCreator(null);
              setIsCreatorOpen(true);
            }}
            contacts={contacts}
          />
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: UTILITY TEMPLATES (AQUELE QUE PRECISA APROVAR) */}
        {/* ========================================================================= */}
        {activeSubTab === 'utility_templates' && (
          <div className="space-y-6">
            
            {/* Meta Utility Explanation Banner */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-400/20 text-purple-200 border border-purple-300/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-300" /> Meta Graph API v20.0 Verified
                  </span>
                  <span className="text-xs text-purple-200 font-medium">Transacional sem Bloqueio de 24h</span>
                </div>
                <h2 className="text-lg font-bold">
                  Modelos de Utilidade (Utility Broadcast Templates)
                </h2>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Estes são os modelos pré-aprovados pela Meta para comunicações críticas (rastreamento de pedidos, agendamentos, cobranças e senhas temporárias). Uma vez aprovados pela Meta, suas transmissões são entregues garantidamente a qualquer momento.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingUtilityTemplate(null);
                  setIsUtilityModalOpen(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-purple-50 text-purple-950 text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Criar Novo Modelo & Submeter à Meta</span>
              </button>
            </div>

            {/* Filter Bar for Utility Templates */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={templateSearchTerm}
                  onChange={(e) => setTemplateSearchTerm(e.target.value)}
                  placeholder="Buscar modelo por nome, texto ou ID Meta..."
                  className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <div className="flex items-center bg-[#F8F9FB] p-0.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setTemplateCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      templateCategoryFilter === 'all' ? 'bg-white text-[#1A1D21] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    Categorias: Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateCategoryFilter('UTILITY')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      templateCategoryFilter === 'UTILITY' ? 'bg-purple-700 text-white font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    UTILITY
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateCategoryFilter('AUTHENTICATION')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      templateCategoryFilter === 'AUTHENTICATION' ? 'bg-purple-700 text-white font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    AUTHENTICATION
                  </button>
                </div>

                {/* Status Filter */}
                <div className="flex items-center bg-[#F8F9FB] p-0.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setTemplateStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      templateStatusFilter === 'all' ? 'bg-white text-[#1A1D21] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    Status: Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateStatusFilter('APPROVED')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      templateStatusFilter === 'APPROVED' ? 'bg-emerald-600 text-white font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    Aprovados
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateStatusFilter('PENDING_APPROVAL')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      templateStatusFilter === 'PENDING_APPROVAL' ? 'bg-amber-500 text-white font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    Em Análise
                  </button>
                </div>
              </div>
            </div>

            {/* Utility Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => {
                const isApproved = template.status === 'APPROVED';
                const isPending = template.status === 'PENDING_APPROVAL';
                const isRejected = template.status === 'REJECTED';

                return (
                  <div
                    key={template.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-purple-300 p-5 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4"
                  >
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-[#1A1D21]">
                              {template.displayName}
                            </h3>
                            <span className="text-[10px] font-mono text-purple-800 block">
                              {template.name}
                            </span>
                          </div>
                        </div>

                        {/* Meta Status Pill */}
                        {isApproved && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3" /> Aprovado Meta
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 shadow-2xs">
                            <Clock className="w-3 h-3" /> Em Análise Meta
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shadow-2xs">
                            <AlertCircle className="w-3 h-3" /> Rejeitado Meta
                          </span>
                        )}
                      </div>

                      {/* Meta ID & Category */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-mono text-[#64748B] bg-gray-100 px-1.5 py-0.5 rounded">
                          ID: {template.metaTemplateId || 'meta_tpl_pending'}
                        </span>
                        <span className="text-[10px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {template.category}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          Idioma: <b>{template.language}</b>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          🟢 Alta Qualidade
                        </span>
                      </div>

                      {/* Body Preview */}
                      <div className="p-3 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0] text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {template.headerContent && (
                          <div className="font-bold text-gray-900 mb-1 border-b border-gray-200 pb-1">
                            {template.headerContent}
                          </div>
                        )}
                        <p className="line-clamp-3 font-sans">
                          {template.bodyText}
                        </p>
                      </div>

                      {/* Variables Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-[#64748B]">Parâmetros:</span>
                        {template.variables.map((v) => (
                          <span
                            key={v.key}
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800"
                            title={v.description}
                          >
                            {"{{" + v.key + "}}"} {v.description ? `(${v.description})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedTemplateForDetails(template)}
                          className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#1A1D21] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>Ver & Testar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUtilityTemplate(template);
                            setIsUtilityModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUtilityTemplate(template.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-[#64748B] hover:text-rose-600 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isApproved && (
                        <button
                          type="button"
                          onClick={() => handleLaunchWithUtilityTemplate(template)}
                          className="py-1.5 px-3.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Disparar Campanha</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredTemplates.length === 0 && (
                <div className="col-span-2 bg-white rounded-2xl border border-dashed border-[#E2E8F0] p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A1D21]">Nenhum modelo utilitário encontrado</h3>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    Crie modelos de mensagens transacionais para submeter à aprovação da Meta Graph API.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUtilityTemplate(null);
                      setIsUtilityModalOpen(true);
                    }}
                    className="py-2 px-4 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Criar Novo Modelo para Aprovação
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: FACEBOOK GRAPH BATCH PROCESSING STUDIO (50 MSGS/CALL) */}
        {/* ========================================================================= */}
        {activeSubTab === 'batch_studio' && (
          <FacebookBatchStudio contacts={contacts} />
        )}

      </div>

      {/* Creator Modal */}
      <BroadcastCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => {
          setIsCreatorOpen(false);
          setInitialUtilityTemplateForCreator(null);
        }}
        onSaveCampaign={handleSaveCampaign}
        contacts={contacts}
        customFields={customFields}
        utilityTemplates={utilityTemplates}
        initialUtilityTemplate={initialUtilityTemplateForCreator}
      />

      {/* Details Drawer for Broadcast Campaign */}
      <BroadcastDetailsDrawer
        campaign={selectedCampaignForDetails}
        onClose={() => setSelectedCampaignForDetails(null)}
        onSendNow={handleSendNow}
        onCancelSchedule={handleCancelSchedule}
        onOpenReschedule={(camp) => setRescheduleCampaign(camp)}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        contacts={contacts}
        customFields={customFields}
      />

      {/* Reschedule Modal */}
      {rescheduleCampaign && (
        <RescheduleModal
          isOpen={!!rescheduleCampaign}
          onClose={() => setRescheduleCampaign(null)}
          campaign={rescheduleCampaign}
          onSaveSchedule={handleSaveReschedule}
        />
      )}

      {/* Utility Template Creation & Meta Review Modal */}
      <UtilityTemplateModal
        isOpen={isUtilityModalOpen}
        onClose={() => {
          setIsUtilityModalOpen(false);
          setEditingUtilityTemplate(null);
        }}
        onSaveTemplate={handleSaveUtilityTemplate}
        editingTemplate={editingUtilityTemplate}
      />

      {/* Utility Template Details & Test Drawer */}
      <UtilityTemplateDetailsDrawer
        template={selectedTemplateForDetails}
        onClose={() => setSelectedTemplateForDetails(null)}
        onLaunchBroadcastWithTemplate={handleLaunchWithUtilityTemplate}
        onEditTemplate={(tpl) => {
          setSelectedTemplateForDetails(null);
          setEditingUtilityTemplate(tpl);
          setIsUtilityModalOpen(true);
        }}
        onDeleteTemplate={handleDeleteUtilityTemplate}
        onUpdateTemplate={handleSaveUtilityTemplate}
        contacts={contacts}
      />

      {/* Guzzle Batch Modal for Campaign */}
      {guzzleBatchModalCampaign && (
        <GuzzleBatchModal
          isOpen={!!guzzleBatchModalCampaign}
          onClose={() => setGuzzleBatchModalCampaign(null)}
          campaign={guzzleBatchModalCampaign}
        />
      )}
    </div>
  );
};
