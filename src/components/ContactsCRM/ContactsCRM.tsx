import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Tag, 
  Instagram, 
  Facebook, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Trash2,
  StickyNote,
  ChevronRight,
  Eye,
  Plus,
  Radio,
  Activity,
  History,
  MousePointerClick,
  Bot,
  Flame,
  Zap,
  Sliders,
  ArrowUpDown,
  TrendingUp,
  HelpCircle,
  CheckSquare,
  Square,
  Sparkles,
  GitFork,
  Check,
  Clock,
  RotateCcw,
  AlertTriangle,
  Database,
  UserX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Contact, Flow, ContactNote, ContactActivityLog, LeadScoreTier } from '../../types';
import { ContactDetailsDrawer } from './ContactDetailsDrawer';
import { 
  calculateLeadScore, 
  getLeadScoreTier, 
  DEFAULT_SCORING_RULES, 
  ScoringRuleConfig 
} from '../../utils/leadScoring';
import { 
  getContactDaysInactive, 
  formatInactivityBadge,
  EngagementStatus,
  getContactEngagementStatus,
  ENGAGEMENT_CONFIG
} from '../../utils/inactivityHelper';
import { EngagementDonutChart } from './EngagementDonutChart';
import { LeadScoreBreakdownModal } from './LeadScoreBreakdownModal';
import { LeadScoringRulesModal } from './LeadScoringRulesModal';
import { useToast } from '../../context/ToastContext';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { BulkActionsSidebar } from './BulkActionsSidebar';
import { BulkAssignFlowModal } from './BulkAssignFlowModal';
import { BulkTagModal } from './BulkTagModal';
import { BulkAddNoteModal } from './BulkAddNoteModal';
import { BulkStatusScoreModal } from './BulkStatusScoreModal';
import { InactiveContactsCleanerModal } from './InactiveContactsCleanerModal';

interface ContactsCRMProps {
  contacts: Contact[];
  flows?: Flow[];
  onUpdateContacts: (contacts: Contact[]) => void;
  onOpenChat?: (contact: Contact) => void;
  onOpenBroadcast?: () => void;
}

export const ContactsCRM: React.FC<ContactsCRMProps> = ({
  contacts,
  flows = [],
  onUpdateContacts,
  onOpenChat,
  onOpenBroadcast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [temperatureFilter, setTemperatureFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [engagementFilter, setEngagementFilter] = useState<'all' | EngagementStatus>('all');
  const [inactivityFilter, setInactivityFilter] = useState<'all' | '30' | '60' | '90' | '180' | '365'>('all');
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'recent' | 'interactions' | 'name'>('score_desc');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerInitialTab, setDrawerInitialTab] = useState<'scoring' | 'activity' | 'notes' | 'details' | 'custom_fields'>('scoring');
  const toast = useToast();
  const [scoringRules, setScoringRules] = useState<ScoringRuleConfig>(() => {
    try {
      const saved = localStorage.getItem('manyflow_scoring_rules');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SCORING_RULES;
  });
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [contactForScoreBreakdown, setContactForScoreBreakdown] = useState<Contact | null>(null);

  // Inactive contacts cleaner modal and undo history
  const [isCleanerModalOpen, setIsCleanerModalOpen] = useState(false);
  const [deletedHistory, setDeletedHistory] = useState<Contact[] | null>(null);

  // Bulk selection and modal states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAssignFlowModalOpen, setIsAssignFlowModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isStatusScoreModalOpen, setIsStatusScoreModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

  const handleSaveRules = (newRules: ScoringRuleConfig) => {
    setScoringRules(newRules);
    try {
      localStorage.setItem('manyflow_scoring_rules', JSON.stringify(newRules));
    } catch (e) {}
  };

  // Collect all unique tags
  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags)));

  // Calculate scores for all contacts
  const contactsWithScore = useMemo(() => {
    return contacts.map((c) => {
      const breakdown = calculateLeadScore(c, scoringRules);
      return {
        ...c,
        leadScore: breakdown.totalScore,
        scoreTier: breakdown.tier,
        breakdown
      };
    });
  }, [contacts, scoringRules]);

  // Counts by tier
  const tierCounts = useMemo(() => {
    let hot = 0;
    let warm = 0;
    let cold = 0;
    contactsWithScore.forEach((c) => {
      if (c.scoreTier === 'hot') hot++;
      else if (c.scoreTier === 'warm') warm++;
      else cold++;
    });
    return { all: contactsWithScore.length, hot, warm, cold };
  }, [contactsWithScore]);

  // Inactivity statistics
  const inactiveStats = useMemo(() => {
    let count30 = 0;
    let count60 = 0;
    let count90 = 0;
    let count180 = 0;
    let count365 = 0;
    contacts.forEach((c) => {
      const days = getContactDaysInactive(c);
      if (days >= 30) count30++;
      if (days >= 60) count60++;
      if (days >= 90) count90++;
      if (days >= 180) count180++;
      if (days >= 365) count365++;
    });
    return { count30, count60, count90, count180, count365 };
  }, [contacts]);

  const filteredAndSortedContacts = useMemo(() => {
    const list = contactsWithScore.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.internalNotes && c.internalNotes.some((n) => n.content.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (c.activityLogs && c.activityLogs.some((l) => l.title.toLowerCase().includes(searchTerm.toLowerCase()) || l.description.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesTag = selectedTag === 'all' || c.tags.includes(selectedTag);
      const matchesChannel = selectedChannel === 'all' || c.channel === selectedChannel;
      const matchesTemperature = temperatureFilter === 'all' || c.scoreTier === temperatureFilter;
      const matchesEngagement = engagementFilter === 'all' || getContactEngagementStatus(c) === engagementFilter;

      let matchesInactivity = true;
      if (inactivityFilter !== 'all') {
        const threshold = parseInt(inactivityFilter, 10);
        const days = getContactDaysInactive(c);
        matchesInactivity = days >= threshold;
      }

      return matchesSearch && matchesTag && matchesChannel && matchesTemperature && matchesEngagement && matchesInactivity;
    });

    return list.sort((a, b) => {
      switch (sortBy) {
        case 'score_desc':
          return (b.leadScore || 0) - (a.leadScore || 0);
        case 'score_asc':
          return (a.leadScore || 0) - (b.leadScore || 0);
        case 'interactions':
          return (b.totalInteractions || 0) - (a.totalInteractions || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
        default:
          return 0;
      }
    });
  }, [contactsWithScore, searchTerm, selectedTag, selectedChannel, temperatureFilter, engagementFilter, inactivityFilter, sortBy]);

  // Selected Contacts List
  const selectedContacts = useMemo(() => {
    return contacts.filter((c) => selectedIds.has(c.id));
  }, [contacts, selectedIds]);

  const isAllFilteredSelected = filteredAndSortedContacts.length > 0 && 
    filteredAndSortedContacts.every((c) => selectedIds.has(c.id));

  // Selection handlers
  const handleToggleSelectContact = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredAndSortedContacts.forEach((c) => next.add(c.id));
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleToggleSelectAllInHeader = () => {
    if (isAllFilteredSelected) {
      // Unselect all filtered
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredAndSortedContacts.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      // Select all filtered
      handleSelectAllFiltered();
    }
  };

  // Bulk Operations Handlers
  const handleBulkAssignFlow = (flowId: string, executeImmediately: boolean) => {
    const targetFlow = flows.find((f) => f.id === flowId);
    const flowName = targetFlow?.name || 'Automação Personalizada';
    const now = new Date().toISOString();

    const updated = contacts.map((c) => {
      if (!selectedIds.has(c.id)) return c;

      const newLog: ContactActivityLog = {
        id: `act_bulk_flow_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'flow_triggered',
        title: `Atribuído ao Fluxo "${flowName}" (Ação em Massa)`,
        description: executeImmediately
          ? `Fluxo disparado com envio automático de mensagens para o contato no canal ${c.channel}.`
          : `Contato vinculado ao fluxo de automação no CRM.`,
        timestamp: now,
        actor: 'agent',
        flowId: flowId,
        flowTitle: flowName
      };

      return {
        ...c,
        activityLogs: [newLog, ...(c.activityLogs || [])],
        lastInteractionAt: executeImmediately ? now : c.lastInteractionAt,
        totalInteractions: executeImmediately ? (c.totalInteractions || 0) + 1 : c.totalInteractions
      };
    });

    onUpdateContacts(updated);
    showToast(`${selectedIds.size} ${selectedIds.size === 1 ? 'contato atribuído' : 'contatos atribuídos'} ao fluxo "${flowName}" com sucesso!`, 'success');
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    handleClearSelection();
  };

  const handleBulkApplyTags = (tagsToAdd: string[], tagsToRemove: string[]) => {
    const now = new Date().toISOString();

    const updated = contacts.map((c) => {
      if (!selectedIds.has(c.id)) return c;

      let nextTags = [...c.tags];

      // Add tags
      tagsToAdd.forEach((t) => {
        if (!nextTags.includes(t)) {
          nextTags.push(t);
        }
      });

      // Remove tags
      if (tagsToRemove.length > 0) {
        nextTags = nextTags.filter((t) => !tagsToRemove.includes(t));
      }

      const logs: ContactActivityLog[] = [];
      if (tagsToAdd.length > 0) {
        logs.push({
          id: `act_tag_add_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type: 'tag_added',
          title: `Tags Adicionadas em Massa: ${tagsToAdd.join(', ')}`,
          description: `Segmentação atualizada em lote via CRM`,
          timestamp: now,
          actor: 'agent'
        });
      }
      if (tagsToRemove.length > 0) {
        logs.push({
          id: `act_tag_rem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type: 'tag_removed',
          title: `Tags Removidas em Massa: ${tagsToRemove.join(', ')}`,
          description: `Segmentação atualizada em lote via CRM`,
          timestamp: now,
          actor: 'agent'
        });
      }

      return {
        ...c,
        tags: nextTags,
        activityLogs: [...logs, ...(c.activityLogs || [])]
      };
    });

    onUpdateContacts(updated);
    showToast(`Tags atualizadas com sucesso para ${selectedIds.size} contatos!`, 'success');
    handleClearSelection();
  };

  const handleBulkApplyCustomField = (fieldName: string, fieldValue: string) => {
    const cleanKey = fieldName.trim();
    const cleanVal = fieldValue.trim();
    if (!cleanKey) return;
    const now = new Date().toISOString();

    const updated = contacts.map((c) => {
      if (!selectedIds.has(c.id)) return c;

      const nextCustomFields = {
        ...(c.customFields || {}),
        [cleanKey]: cleanVal
      };

      const newLog: ContactActivityLog = {
        id: `act_custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'custom_field_updated',
        title: `Campo Customizado em Massa: "${cleanKey}" = "${cleanVal}"`,
        description: `Atualização de atributo executada via barra lateral de ações em massa`,
        timestamp: now,
        actor: 'agent'
      };

      return {
        ...c,
        customFields: nextCustomFields,
        activityLogs: [newLog, ...(c.activityLogs || [])]
      };
    });

    onUpdateContacts(updated);
    showToast(`Campo "${cleanKey}" atualizado com sucesso em ${selectedIds.size} contatos!`, 'success');
    handleClearSelection();
  };

  const handleBulkAddNote = (noteData: Omit<ContactNote, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();

    const updated = contacts.map((c) => {
      if (!selectedIds.has(c.id)) return c;

      const newNote: ContactNote = {
        id: `note_bulk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        ...noteData,
        createdAt: now
      };

      const newLog: ContactActivityLog = {
        id: `act_note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'note_added',
        title: `Nota Interna em Lote Adicionada (${noteData.author})`,
        description: `"${noteData.content}"`,
        timestamp: now,
        actor: 'agent'
      };

      return {
        ...c,
        internalNotes: [newNote, ...(c.internalNotes || [])],
        activityLogs: [newLog, ...(c.activityLogs || [])]
      };
    });

    onUpdateContacts(updated);
    showToast(`Nota interna adicionada a ${selectedIds.size} contatos!`, 'success');
    handleClearSelection();
  };

  const handleBulkStatusScore = (changes: {
    status?: 'active' | 'bot_paused' | 'human_assigned' | 'unsubscribed';
    scoreBonus?: number;
    assignedAgent?: string;
  }) => {
    const now = new Date().toISOString();

    const updated = contacts.map((c) => {
      if (!selectedIds.has(c.id)) return c;

      const nextContact = { ...c };
      const logs: ContactActivityLog[] = [];

      if (changes.status) {
        nextContact.status = changes.status;
        if (changes.status === 'human_assigned') {
          nextContact.assignedAgent = changes.assignedAgent || 'Lucas Santos';
        }
        logs.push({
          id: `act_status_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type: 'status_changed',
          title: `Status do Lead alterado para "${changes.status}" (Em Massa)`,
          description: `Atualização de status executada via CRM`,
          timestamp: now,
          actor: 'agent'
        });
      }

      if (changes.scoreBonus !== undefined && changes.scoreBonus !== 0) {
        const currentBonus = nextContact.manualScoreBonus || 0;
        nextContact.manualScoreBonus = currentBonus + changes.scoreBonus;
        logs.push({
          id: `act_score_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type: 'custom_field_updated',
          title: `Bônus de Lead Scoring em Massa: ${changes.scoreBonus > 0 ? `+${changes.scoreBonus}` : changes.scoreBonus} pts`,
          description: `Pontuação creditada manualmente pelo operador`,
          timestamp: now,
          actor: 'agent'
        });
      }

      nextContact.activityLogs = [...logs, ...(nextContact.activityLogs || [])];
      return nextContact;
    });

    onUpdateContacts(updated);
    showToast(`Status e pontuação atualizados com sucesso para ${selectedIds.size} contatos!`, 'success');
    handleClearSelection();
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    const remaining = contacts.filter((c) => !selectedIds.has(c.id));
    onUpdateContacts(remaining);
    showToast(`${count} ${count === 1 ? 'contato removido' : 'contatos removidos'} do CRM.`, 'info');
    handleClearSelection();
  };

  const handleConfirmPurge = (idsToDelete: string[], daysThreshold: number) => {
    const idsSet = new Set(idsToDelete);
    const deleted = contacts.filter((c) => idsSet.has(c.id));
    const remaining = contacts.filter((c) => !idsSet.has(c.id));

    setDeletedHistory(deleted);
    onUpdateContacts(remaining);

    // Unselect any purged contacts
    setSelectedIds((prev) => {
      const next = new Set(prev);
      idsToDelete.forEach((id) => next.delete(id));
      return next;
    });

    showToast(
      `Base otimizada: ${deleted.length} contatos inativos (> ${daysThreshold} dias) purgados com sucesso!`,
      'success'
    );
  };

  const handleUndoPurge = () => {
    if (!deletedHistory || deletedHistory.length === 0) return;
    onUpdateContacts([...contacts, ...deletedHistory]);
    const restoredCount = deletedHistory.length;
    setDeletedHistory(null);
    showToast(`${restoredCount} contatos inativos foram restaurados para a base!`, 'info');
  };

  const handleExportSelectedCSV = () => {
    const targetContacts = contactsWithScore.filter((c) => selectedIds.has(c.id));
    if (targetContacts.length === 0) return;

    const headers = [
      'ID', 
      'Nome', 
      'Username', 
      'Canal', 
      'Status Bot',
      'Lead Score (Pontos)', 
      'Classificação (Temperatura)', 
      'Email', 
      'Telefone', 
      'Tags', 
      'Total Logs Atividade', 
      'Última Ação Bot', 
      'Notas Internas', 
      'Última Interação'
    ];
    const rows = targetContacts.map((c) => {
      const notesText = (c.internalNotes || []).map((n) => `[${n.author}: ${n.content}]`).join(' | ');
      const latestActivity = c.activityLogs?.[0]?.title || 'Sem atividade recente';
      const tierLabel = c.scoreTier === 'hot' ? 'Quente' : c.scoreTier === 'warm' ? 'Morno' : 'Frio';
      return [
        c.id,
        `"${c.name}"`,
        `"${c.username}"`,
        c.channel,
        c.status,
        c.leadScore,
        `"${tierLabel}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        `"${c.tags.join(', ')}"`,
        c.activityLogs?.length || 0,
        `"${latestActivity}"`,
        `"${notesText}"`,
        `"${c.lastInteractionAt}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_selecionados_${targetContacts.length}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`${targetContacts.length} contatos exportados em CSV com sucesso!`, 'success');
  };

  const handleExportSelectedJSON = () => {
    const targetContacts = contactsWithScore.filter((c) => selectedIds.has(c.id));
    if (targetContacts.length === 0) return;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(targetContacts, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `leads_selecionados_${targetContacts.length}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`${targetContacts.length} contatos exportados em formato JSON!`, 'success');
  };

  const handleExportFilteredCSV = () => {
    if (filteredAndSortedContacts.length === 0) {
      showToast('Nenhum contato filtrado disponível para exportação.', 'warning');
      return;
    }

    // Dynamic extraction of all unique custom field keys across filtered contacts
    const customFieldKeys: string[] = Array.from(
      new Set(
        filteredAndSortedContacts.flatMap((c) => Object.keys(c.customFields || {}))
      )
    );

    const headers = [
      'ID',
      'Nome',
      'Username',
      'Canal',
      'Status Atendimento',
      'Status Engajamento',
      'Lead Score (Pontos)',
      'Classificacao Temperatura',
      'Email',
      'Telefone',
      'Tags (Marketing)',
      'Dias Sem Interacao',
      'Ultima Interacao',
      'Data de Cadastro',
      'Total Interacoes',
      'LTV (Valor do Cliente)',
      'Atendente Responsavel',
      'Notas Internas',
      'Ultima Atividade Registrada',
      ...customFieldKeys.map((k) => `Campo_${k.replace(/[^a-zA-Z0-9_]/g, '_')}`),
      'Metadados_Customizados_JSON'
    ];

    const rows = filteredAndSortedContacts.map((c) => {
      const engagement = getContactEngagementStatus(c);
      const daysInactive = getContactDaysInactive(c);
      const tierLabel = c.scoreTier === 'hot' ? 'Quente' : c.scoreTier === 'warm' ? 'Morno' : 'Frio';
      const notesText = (c.internalNotes || []).map((n) => `[${n.author}: ${n.content}]`).join(' | ');
      const latestActivity = c.activityLogs?.[0]?.title || 'Sem atividade recente';
      const customJson = JSON.stringify(c.customFields || {});

      const dynamicCols = customFieldKeys.map((k) => {
        const val = c.customFields?.[k];
        return val !== undefined ? `"${String(val).replace(/"/g, '""')}"` : '""';
      });

      return [
        `"${c.id}"`,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.username || '').replace(/"/g, '""')}"`,
        `"${c.channel}"`,
        `"${c.status}"`,
        `"${engagement}"`,
        c.leadScore ?? 0,
        `"${tierLabel}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        `"${(c.tags || []).join('; ').replace(/"/g, '""')}"`,
        daysInactive,
        `"${c.lastInteractionAt || ''}"`,
        `"${c.createdAt || ''}"`,
        c.totalInteractions ?? 0,
        c.lifetimeValue ? `"${c.lifetimeValue.toFixed(2)}"` : '"0.00"',
        `"${(c.assignedAgent || 'Robo ManyFlow').replace(/"/g, '""')}"`,
        `"${notesText.replace(/"/g, '""')}"`,
        `"${latestActivity.replace(/"/g, '""')}"`,
        ...dynamicCols,
        `"${customJson.replace(/"/g, '""')}"`
      ];
    });

    // Add UTF-8 BOM so Excel, Google Sheets, HubSpot and RD Station open accents seamlessly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download', 
      `leads_filtrados_manyflow_${filteredAndSortedContacts.length}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`${filteredAndSortedContacts.length} contatos filtrados exportados para CSV com tags e metadados!`, 'success');
  };

  const handleExportAllCSV = () => {
    const headers = [
      'ID', 
      'Nome', 
      'Username', 
      'Canal', 
      'Status Bot',
      'Lead Score (Pontos)', 
      'Classificação (Temperatura)', 
      'Email', 
      'Telefone', 
      'Tags', 
      'Total Logs Atividade', 
      'Última Ação Bot', 
      'Notas Internas', 
      'Última Interação'
    ];
    const rows = contactsWithScore.map((c) => {
      const notesText = (c.internalNotes || []).map((n) => `[${n.author}: ${n.content}]`).join(' | ');
      const latestActivity = c.activityLogs?.[0]?.title || 'Sem atividade recente';
      const tierLabel = c.scoreTier === 'hot' ? 'Quente' : c.scoreTier === 'warm' ? 'Morno' : 'Frio';
      return [
        c.id,
        `"${c.name}"`,
        `"${c.username}"`,
        c.channel,
        c.status,
        c.leadScore,
        `"${tierLabel}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        `"${c.tags.join(', ')}"`,
        c.activityLogs?.length || 0,
        `"${latestActivity}"`,
        `"${notesText}"`,
        `"${c.lastInteractionAt}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `todos_leads_manyflow_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleUpdateSingleContact = (updatedContact: Contact) => {
    const updatedList = contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c));
    onUpdateContacts(updatedList);
    setSelectedContact(updatedContact);
    if (contactForScoreBreakdown?.id === updatedContact.id) {
      setContactForScoreBreakdown(updatedContact);
    }
    toast.success('Contato atualizado com sucesso!', {
      description: `Os dados de "${updatedContact.name}" foram salvos.`
    });
  };

  const openDrawerWithTab = (contact: Contact, tab: 'scoring' | 'activity' | 'notes' | 'details' | 'custom_fields') => {
    setDrawerInitialTab(tab);
    setSelectedContact(contact);
  };

  return (
    <div id="contacts_crm_view" className="flex-1 flex flex-col h-full bg-[#F8F9FB] p-6 lg:p-8 overflow-y-auto select-none space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#1A1D21] text-white shadow-2xl border border-gray-700 flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold">{feedbackToast.message}</span>
          {deletedHistory && (
            <button
              type="button"
              onClick={handleUndoPurge}
              className="ml-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Desfazer</span>
            </button>
          )}
          <button 
            onClick={() => setFeedbackToast(null)}
            className="text-gray-400 hover:text-white cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#1A1D21] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0084FF]" />
              <span>Contatos & Base de Leads (CRM)</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-600" />
              <span>Lead Scoring Ativo</span>
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Gerencie múltiplos leads, execute ações em lote, tags, notas internas e otimização de base inativa.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn_crm_open_cleaner"
            type="button"
            onClick={() => setIsCleanerModalOpen(true)}
            className="py-2 px-3.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Otimizar base de dados e purgar contatos inativos"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Otimizar Base</span>
            {inactiveStats.count90 > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-black">
                {inactiveStats.count90} inativos
              </span>
            )}
          </button>

          <button
            id="btn_crm_scoring_rules"
            onClick={() => setShowRulesModal(true)}
            className="py-2 px-3 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] hover:border-orange-300 text-[#1A1D21] hover:text-orange-700 text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Ajustar pesos e pontos de lead scoring"
          >
            <Sliders className="w-3.5 h-3.5 text-orange-500" />
            <span>Regras de Scoring</span>
          </button>

          {onOpenBroadcast && (
            <button
              id="btn_crm_open_broadcast"
              onClick={onOpenBroadcast}
              className="py-2 px-3.5 rounded-lg bg-pink-50 hover:bg-pink-100/70 border border-pink-200 text-pink-700 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-pink-600" />
              <span>Criar Transmissão</span>
            </button>
          )}

          {/* Export Filtered Leads to CSV for Marketing */}
          <button
            id="btn_crm_export_filtered_csv"
            type="button"
            onClick={handleExportFilteredCSV}
            className="py-2 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Exportar contatos atualmente filtrados com metadados e tags para marketing"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Filtrados ({filteredAndSortedContacts.length})</span>
          </button>

          <button
            id="btn_export_leads_csv"
            onClick={handleExportAllCSV}
            className="py-2 px-3.5 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#1A1D21] text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Exportar todos os contatos da base em formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Exportar Tudo</span>
          </button>
        </div>
      </div>

      {/* Engagement Status Donut Chart (Recharts) */}
      <EngagementDonutChart
        contacts={contacts}
        activeFilter={engagementFilter}
        onSelectFilter={setEngagementFilter}
        onOpenOptimizer={() => setIsCleanerModalOpen(true)}
      />

      {/* Temperature Quick Filter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setTemperatureFilter('all')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs flex items-center justify-between ${
            temperatureFilter === 'all'
              ? 'bg-white border-[#0084FF] ring-2 ring-[#0084FF]/10 shadow-sm'
              : 'bg-white/80 border-[#E2E8F0] hover:bg-white hover:border-gray-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] block">Todos os Leads</span>
            <span className="text-lg font-extrabold text-[#1A1D21]">{tierCounts.all}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0084FF] flex items-center justify-center font-bold text-xs">
            <Users className="w-4 h-4" />
          </div>
        </button>

        <button
          onClick={() => setTemperatureFilter('hot')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs flex items-center justify-between ${
            temperatureFilter === 'hot'
              ? 'bg-orange-50/60 border-orange-500 ring-2 ring-orange-500/10 shadow-sm'
              : 'bg-white/80 border-[#E2E8F0] hover:bg-orange-50/30 hover:border-orange-200'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-orange-800 flex items-center gap-1">
              <span>Leads Quentes</span>
              <span className="text-[10px] bg-orange-200/80 text-orange-900 px-1 rounded">≥70 pts</span>
            </span>
            <span className="text-lg font-black text-orange-950">{tierCounts.hot}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-base shadow-2xs">
            🔥
          </div>
        </button>

        <button
          onClick={() => setTemperatureFilter('warm')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs flex items-center justify-between ${
            temperatureFilter === 'warm'
              ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/10 shadow-sm'
              : 'bg-white/80 border-[#E2E8F0] hover:bg-amber-50/30 hover:border-amber-200'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
              <span>Leads Mornos</span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1 rounded">35-69</span>
            </span>
            <span className="text-lg font-black text-amber-950">{tierCounts.warm}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-base shadow-2xs">
            ⚡
          </div>
        </button>

        <button
          onClick={() => setTemperatureFilter('cold')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs flex items-center justify-between ${
            temperatureFilter === 'cold'
              ? 'bg-sky-50/60 border-sky-500 ring-2 ring-sky-500/10 shadow-sm'
              : 'bg-white/80 border-[#E2E8F0] hover:bg-sky-50/30 hover:border-sky-200'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-sky-800 flex items-center gap-1">
              <span>Leads Frios</span>
              <span className="text-[10px] bg-sky-200/80 text-sky-900 px-1 rounded">&lt;35</span>
            </span>
            <span className="text-lg font-black text-sky-950">{tierCounts.cold}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-base shadow-2xs">
            ❄️
          </div>
        </button>
      </div>

      {/* Filters & Sorting Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input_search_crm_leads"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, @username, tag, score, ação ou nota..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]"
          />
        </div>

        {/* Tag Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Tag className="w-4 h-4 text-[#64748B] shrink-0" />
          <select
            id="select_tag_filter"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none"
          >
            <option value="all">Todas as Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                🏷️ {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Channel Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="select_channel_filter"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none"
          >
            <option value="all">Todos os Canais</option>
            <option value="instagram">Instagram Direct</option>
            <option value="messenger">Facebook Messenger</option>
          </select>
        </div>

        {/* Engagement Status Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <Activity className={`w-4 h-4 shrink-0 ${engagementFilter !== 'all' ? 'text-emerald-600' : 'text-[#64748B]'}`} />
          <select
            id="select_engagement_status_filter"
            value={engagementFilter}
            onChange={(e) => setEngagementFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
              engagementFilter !== 'all'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                : 'bg-[#F8F9FB] border-[#E2E8F0] text-[#1A1D21]'
            }`}
          >
            <option value="all">Engajamento: Todos</option>
            <option value="Ativo">🟢 Ativo (≤ 30d)</option>
            <option value="Inativo">🟡 Inativo (≥ 30d)</option>
            <option value="Novo">🔵 Novo (≤ 7d)</option>
            <option value="Bloqueado">🔴 Bloqueado / Opt-out</option>
          </select>
        </div>

        {/* Inactivity Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <Clock className={`w-4 h-4 shrink-0 ${inactivityFilter !== 'all' ? 'text-rose-500' : 'text-[#64748B]'}`} />
          <select
            id="select_inactivity_filter"
            value={inactivityFilter}
            onChange={(e) => setInactivityFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
              inactivityFilter !== 'all'
                ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                : 'bg-[#F8F9FB] border-[#E2E8F0] text-[#1A1D21]'
            }`}
          >
            <option value="all">Inatividade: Todas</option>
            <option value="30">Inativos &gt; 30 dias ({inactiveStats.count30})</option>
            <option value="60">Inativos &gt; 60 dias ({inactiveStats.count60})</option>
            <option value="90">Inativos &gt; 90 dias ({inactiveStats.count90} - Recomendado)</option>
            <option value="180">Inativos &gt; 180 dias ({inactiveStats.count180})</option>
            <option value="365">Inativos &gt; 365 dias ({inactiveStats.count365})</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ArrowUpDown className="w-4 h-4 text-[#64748B] shrink-0" />
          <select
            id="select_sort_by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-bold text-[#1A1D21] focus:outline-none"
          >
            <option value="score_desc">🔥 Maior Lead Score (Mais Quentes)</option>
            <option value="score_asc">❄️ Menor Lead Score (Mais Frios)</option>
            <option value="interactions">💬 Mais Interações</option>
            <option value="name">🔤 Nome (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Inactivity Filter Active Alert Banner */}
      {inactivityFilter !== 'all' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500 text-white shadow-xs shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-950">
                  Filtro de Inatividade Ativo: Exibindo {filteredAndSortedContacts.length} contatos sem interação há mais de {inactivityFilter} dias
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-900">
                  Otimização de Base
                </span>
              </div>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Você pode selecionar os contatos inativos abaixo para remoção manual ou utilizar o assistente de purga com regras automáticas de salvaguarda (preservando VIPs e clientes).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-rose-200 text-rose-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              Selecionar ({filteredAndSortedContacts.length})
            </button>

            <button
              type="button"
              onClick={() => setIsCleanerModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Abrir Otimizador & Purga</span>
            </button>

            <button
              type="button"
              onClick={() => setInactivityFilter('all')}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer ml-1"
            >
              Limpar Filtro
            </button>
          </div>
        </div>
      )}

      {/* Main CRM Workspace Grid: Table Area + Persistent Bulk Actions Sidebar */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Table & Actions Area */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          {/* Bulk Actions Sticky Toolbar */}
          <BulkActionsToolbar
            selectedContactsCount={selectedIds.size}
            totalFilteredCount={filteredAndSortedContacts.length}
            totalContactsCount={contacts.length}
            onClearSelection={handleClearSelection}
            onSelectAllFiltered={handleSelectAllFiltered}
            isAllFilteredSelected={isAllFilteredSelected}
            onOpenAssignFlow={() => setIsAssignFlowModalOpen(true)}
            onOpenManageTags={() => setIsTagModalOpen(true)}
            onOpenAddNote={() => setIsAddNoteModalOpen(true)}
            onOpenStatusScore={() => setIsStatusScoreModalOpen(true)}
            onExportSelectedCSV={handleExportSelectedCSV}
            onExportSelectedJSON={handleExportSelectedJSON}
            onDeleteSelected={handleBulkDelete}
          />

          {/* Contacts Table */}
          <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">
                {/* Select All Checkbox */}
                <th className="py-3 px-4 w-10">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllInHeader}
                    className="p-1 rounded text-gray-500 hover:text-[#0084FF] transition-colors cursor-pointer"
                    title={isAllFilteredSelected ? 'Desmarcar todos' : 'Selecionar todos os leads filtrados'}
                  >
                    {isAllFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#0084FF]" />
                    ) : selectedIds.size > 0 ? (
                      <div className="w-4 h-4 rounded bg-[#0084FF] text-white flex items-center justify-center font-bold text-[9px]">
                        -
                      </div>
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Contato</th>
                <th className="py-3 px-4">Lead Score 🔥</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Email / Telefone</th>
                <th className="py-3 px-4">Tags Atribuídas</th>
                <th className="py-3 px-4">Inatividade / Última Interação ⏳</th>
                <th className="py-3 px-4">Histórico & Logs Bot</th>
                <th className="py-3 px-4">Notas Internas</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#1A1D21]">
              {filteredAndSortedContacts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-[#64748B]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-gray-300" />
                      <p className="text-xs font-semibold">Nenhum lead encontrado com os filtros selecionados.</p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedTag('all');
                          setSelectedChannel('all');
                          setTemperatureFilter('all');
                        }}
                        className="text-xs text-[#0084FF] hover:underline cursor-pointer"
                      >
                        Limpar todos os filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedContacts.map((contact) => {
                  const isSelected = selectedIds.has(contact.id);
                  const notesCount = contact.internalNotes?.length || 0;
                  const logsCount = contact.activityLogs?.length || 0;
                  const latestLog = contact.activityLogs?.[0];
                  const tierInfo = getLeadScoreTier(contact.leadScore || 0);

                  return (
                    <tr 
                      key={contact.id} 
                      onClick={() => openDrawerWithTab(contact, 'scoring')}
                      className={`transition-colors cursor-pointer group ${
                        isSelected 
                          ? 'bg-blue-50/70 hover:bg-blue-50' 
                          : 'hover:bg-gray-50/90'
                      }`}
                    >
                      {/* Individual Checkbox */}
                      <td className="py-3.5 px-4 w-10" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelectContact(contact.id, e)}
                          className="p-1 rounded text-gray-400 hover:text-[#0084FF] transition-colors cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#0084FF]" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                          )}
                        </button>
                      </td>

                      {/* Contact Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={contact.avatarUrl}
                            alt={contact.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0]"
                          />
                          <div>
                            <div className="font-semibold text-[#1A1D21] group-hover:text-[#0084FF] transition-colors">
                              {contact.name}
                            </div>
                            <div className="text-[11px] text-[#64748B] font-mono">{contact.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Lead Score Badge & Progress Meter */}
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setContactForScoreBreakdown(contact);
                          }}
                          className="space-y-1 inline-block cursor-pointer"
                          title="Clique para auditar o Lead Score"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border shadow-2xs transition-transform hover:scale-105 ${tierInfo.badgeClass}`}>
                              <span>{tierInfo.icon}</span>
                              <span>{contact.leadScore} pts</span>
                            </span>
                            <span className="text-[10px] font-bold text-[#64748B]">
                              {tierInfo.label}
                            </span>
                          </div>

                          {/* Mini Progress Bar */}
                          <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${tierInfo.barColor}`}
                              style={{ width: `${Math.min(100, ((contact.leadScore || 0) / 100) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-4">
                        {contact.channel === 'instagram' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                            <Instagram className="w-3 h-3" /> Instagram
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Facebook className="w-3 h-3" /> Messenger
                          </span>
                        )}
                      </td>

                      {/* Contact Data */}
                      <td className="py-3.5 px-4 space-y-1">
                        {contact.email ? (
                          <div className="flex items-center gap-1.5 text-[#1A1D21]">
                            <Mail className="w-3 h-3 text-[#64748B]" />
                            <span>{contact.email}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Sem e-mail</span>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-[#1A1D21]">
                            <Phone className="w-3 h-3 text-[#64748B]" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {contact.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Inactivity / Last Interaction Column */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="text-[11px] font-semibold text-[#1A1D21] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#64748B]" />
                          <span>{contact.lastInteractionAt || 'Sem registro'}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {(() => {
                            const engagement = getContactEngagementStatus(contact);
                            const config = ENGAGEMENT_CONFIG[engagement];
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeBg} ${config.badgeText} ${config.border}`}>
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: config.color }} />
                                <span>{engagement}</span>
                              </span>
                            );
                          })()}
                          {(() => {
                            const days = getContactDaysInactive(contact);
                            const badge = formatInactivityBadge(days);
                            return (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                badge.severity === 'critical'
                                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                                  : badge.severity === 'high'
                                  ? 'bg-orange-100 text-orange-800 border-orange-200'
                                  : badge.severity === 'medium' || badge.severity === 'low'
                                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Bot Activity Log Summary Column */}
                      <td className="py-3.5 px-4">
                        {logsCount > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0084FF] border border-blue-200">
                              <Activity className="w-3 h-3 text-[#0084FF]" />
                              <span>{logsCount} {logsCount === 1 ? 'evento' : 'eventos'}</span>
                            </span>
                            {latestLog && (
                              <p className="text-[11px] text-[#64748B] truncate max-w-[190px]">
                                {latestLog.title}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">Sem registros</span>
                        )}
                      </td>

                      {/* Internal Notes Preview Column */}
                      <td className="py-3.5 px-4">
                        {notesCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <StickyNote className="w-3 h-3 text-amber-600" />
                            <span>{notesCount} {notesCount === 1 ? 'nota' : 'notas'}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">Sem notas</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDrawerWithTab(contact, 'scoring');
                            }}
                            className="py-1 px-2 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                            title="Auditar Lead Scoring"
                          >
                            <Flame className="w-3 h-3 text-orange-600" />
                            <span>Score</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDrawerWithTab(contact, 'activity');
                            }}
                            className="py-1 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0084FF] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                            title="Ver Histórico & Auditoria de Atividades"
                          >
                            <Activity className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDrawerWithTab(contact, 'notes');
                            }}
                            className="py-1 px-2 rounded-lg bg-white border border-[#E2E8F0] hover:border-amber-300 text-[#1A1D21] hover:text-amber-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                            title="Ver Notas & Detalhes"
                          >
                            <StickyNote className="w-3 h-3 text-amber-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Persistent Bulk Actions Sidebar */}
    <BulkActionsSidebar
      selectedContacts={selectedContacts}
      totalFilteredCount={filteredAndSortedContacts.length}
      totalContactsCount={contacts.length}
      onClearSelection={handleClearSelection}
      onSelectAllFiltered={handleSelectAllFiltered}
      isAllFilteredSelected={isAllFilteredSelected}
      onBulkApplyTags={handleBulkApplyTags}
      onBulkApplyCustomField={handleBulkApplyCustomField}
      onDeleteSelected={handleBulkDelete}
      flows={flows}
      onBulkAssignFlow={(flowId) => handleBulkAssignFlow(flowId, false)}
    />
  </div>

      {/* Bulk Operations Modals */}
      <BulkAssignFlowModal
        isOpen={isAssignFlowModalOpen}
        onClose={() => setIsAssignFlowModalOpen(false)}
        selectedContacts={selectedContacts}
        flows={flows}
        onAssignFlow={handleBulkAssignFlow}
      />

      <BulkTagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        selectedContacts={selectedContacts}
        availableTags={allTags}
        onApplyTags={handleBulkApplyTags}
      />

      <BulkAddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        selectedContacts={selectedContacts}
        onAddNote={handleBulkAddNote}
      />

      <BulkStatusScoreModal
        isOpen={isStatusScoreModalOpen}
        onClose={() => setIsStatusScoreModalOpen(false)}
        selectedContacts={selectedContacts}
        onApplyChanges={handleBulkStatusScore}
      />

      {/* Contact Details & Activity Drawer */}
      {selectedContact && (
        <ContactDetailsDrawer
          contact={selectedContact}
          initialTab={drawerInitialTab}
          onClose={() => setSelectedContact(null)}
          onUpdateContact={handleUpdateSingleContact}
          onOpenChat={onOpenChat}
          onOpenRulesConfig={() => setShowRulesModal(true)}
        />
      )}

      {/* Standalone Lead Score Breakdown Modal */}
      {contactForScoreBreakdown && (
        <LeadScoreBreakdownModal
          contact={contactForScoreBreakdown}
          onClose={() => setContactForScoreBreakdown(null)}
          onUpdateContact={handleUpdateSingleContact}
          customRules={scoringRules}
          onOpenRulesConfig={() => {
            setContactForScoreBreakdown(null);
            setShowRulesModal(true);
          }}
        />
      )}

      {/* Lead Scoring Rules Configuration Modal */}
      {showRulesModal && (
        <LeadScoringRulesModal
          currentRules={scoringRules}
          onSaveRules={handleSaveRules}
          onClose={() => setShowRulesModal(false)}
        />
      )}

      {/* Inactive Contacts Cleaner & Database Optimizer Modal */}
      <InactiveContactsCleanerModal
        isOpen={isCleanerModalOpen}
        onClose={() => setIsCleanerModalOpen(false)}
        contacts={contacts}
        onConfirmPurge={handleConfirmPurge}
      />
    </div>
  );
};


