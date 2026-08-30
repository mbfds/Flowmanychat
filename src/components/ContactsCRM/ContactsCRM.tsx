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
  HelpCircle
} from 'lucide-react';
import { Contact, LeadScoreTier } from '../../types';
import { ContactDetailsDrawer } from './ContactDetailsDrawer';
import { 
  calculateLeadScore, 
  getLeadScoreTier, 
  DEFAULT_SCORING_RULES, 
  ScoringRuleConfig 
} from '../../utils/leadScoring';
import { LeadScoreBreakdownModal } from './LeadScoreBreakdownModal';
import { LeadScoringRulesModal } from './LeadScoringRulesModal';

interface ContactsCRMProps {
  contacts: Contact[];
  onUpdateContacts: (contacts: Contact[]) => void;
  onOpenChat?: (contact: Contact) => void;
  onOpenBroadcast?: () => void;
}

export const ContactsCRM: React.FC<ContactsCRMProps> = ({
  contacts,
  onUpdateContacts,
  onOpenChat,
  onOpenBroadcast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [temperatureFilter, setTemperatureFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'recent' | 'interactions' | 'name'>('score_desc');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerInitialTab, setDrawerInitialTab] = useState<'scoring' | 'activity' | 'notes' | 'details' | 'custom_fields'>('scoring');
  const [scoringRules, setScoringRules] = useState<ScoringRuleConfig>(() => {
    try {
      const saved = localStorage.getItem('manyflow_scoring_rules');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SCORING_RULES;
  });
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [contactForScoreBreakdown, setContactForScoreBreakdown] = useState<Contact | null>(null);

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

  const handleExportCSV = () => {
    const headers = [
      'ID', 
      'Nome', 
      'Username', 
      'Canal', 
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
    link.setAttribute('download', `leads_manyflow_scoring_${new Date().toISOString().slice(0, 10)}.csv`);
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
  };

  const openDrawerWithTab = (contact: Contact, tab: 'scoring' | 'activity' | 'notes' | 'details' | 'custom_fields') => {
    setDrawerInitialTab(tab);
    setSelectedContact(contact);
  };

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

      return matchesSearch && matchesTag && matchesChannel && matchesTemperature;
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
  }, [contactsWithScore, searchTerm, selectedTag, selectedChannel, temperatureFilter, sortBy]);

  return (
    <div id="contacts_crm_view" className="flex-1 flex flex-col h-full bg-[#F8F9FB] p-6 lg:p-8 overflow-y-auto select-none space-y-6">
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
            Pontuação automática por interações, cliques em botões, respostas a stories e histórico de conversão.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

          <button
            id="btn_export_leads_csv"
            onClick={handleExportCSV}
            className="py-2 px-4 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#1A1D21] text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#64748B]" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

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

      {/* Contacts Table */}
      <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Contato</th>
                <th className="py-3 px-4">Lead Score 🔥</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Email / Telefone</th>
                <th className="py-3 px-4">Tags Atribuídas</th>
                <th className="py-3 px-4">Histórico & Logs Bot</th>
                <th className="py-3 px-4">Notas Internas</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#1A1D21]">
              {filteredAndSortedContacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#64748B]">
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
                  const notesCount = contact.internalNotes?.length || 0;
                  const logsCount = contact.activityLogs?.length || 0;
                  const latestLog = contact.activityLogs?.[0];
                  const tierInfo = getLeadScoreTier(contact.leadScore || 0);

                  return (
                    <tr 
                      key={contact.id} 
                      onClick={() => openDrawerWithTab(contact, 'scoring')}
                      className="hover:bg-gray-50/90 transition-colors cursor-pointer group"
                    >
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
    </div>
  );
};

