import React, { useState, useMemo } from 'react';
import {
  Activity,
  Bot,
  User,
  UserCheck,
  Tag,
  MousePointerClick,
  Workflow,
  Sparkles,
  Radio,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Zap,
  Flame,
  FileText,
  AlertCircle,
  Instagram,
  Facebook,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Contact, ContactActivityLog, ContactActivityType } from '../../types';

interface ContactActivityTimelineProps {
  contact: Contact;
  onUpdateContact: (updated: Contact) => void;
}

export const ContactActivityTimeline: React.FC<ContactActivityTimelineProps> = ({
  contact,
  onUpdateContact
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedActor, setSelectedActor] = useState<string>('all');
  const [showAddLogModal, setShowAddLogModal] = useState(false);

  // New Log Form State
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogDesc, setNewLogDesc] = useState('');
  const [newLogType, setNewLogType] = useState<ContactActivityType>('note_added');
  const [newLogActor, setNewLogActor] = useState<'bot' | 'agent' | 'user' | 'system'>('agent');
  const [newLogTag, setNewLogTag] = useState('');

  const logs = useMemo(() => {
    return contact.activityLogs || [];
  }, [contact.activityLogs]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const automations = logs.filter((l) =>
      ['flow_triggered', 'node_executed', 'comment_keyword_triggered', 'story_reply_triggered', 'broadcast_received'].includes(l.type)
    ).length;
    const buttonClicks = logs.filter((l) => ['button_clicked', 'quick_reply_clicked'].includes(l.type)).length;
    const tagEvents = logs.filter((l) => ['tag_added', 'tag_removed'].includes(l.type)).length;
    const handoverEvents = logs.filter((l) => l.type === 'human_handover').length;

    return { total, automations, buttonClicks, tagEvents, handoverEvents };
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        log.title.toLowerCase().includes(searchLower) ||
        log.description.toLowerCase().includes(searchLower) ||
        (log.flowTitle && log.flowTitle.toLowerCase().includes(searchLower)) ||
        (log.nodeTitle && log.nodeTitle.toLowerCase().includes(searchLower)) ||
        (log.buttonText && log.buttonText.toLowerCase().includes(searchLower)) ||
        (log.tagName && log.tagName.toLowerCase().includes(searchLower)) ||
        (log.fieldName && log.fieldName.toLowerCase().includes(searchLower));

      // Category filter
      let matchesCategory = true;
      if (selectedCategory === 'automations') {
        matchesCategory = ['flow_triggered', 'node_executed', 'comment_keyword_triggered', 'story_reply_triggered', 'broadcast_received'].includes(log.type);
      } else if (selectedCategory === 'clicks') {
        matchesCategory = ['button_clicked', 'quick_reply_clicked'].includes(log.type);
      } else if (selectedCategory === 'tags') {
        matchesCategory = ['tag_added', 'tag_removed'].includes(log.type);
      } else if (selectedCategory === 'fields') {
        matchesCategory = ['custom_field_updated', 'status_changed'].includes(log.type);
      } else if (selectedCategory === 'human') {
        matchesCategory = ['human_handover', 'note_added'].includes(log.type);
      }

      // Actor filter
      const matchesActor = selectedActor === 'all' || log.actor === selectedActor;

      return matchesSearch && matchesCategory && matchesActor;
    });
  }, [logs, searchTerm, selectedCategory, selectedActor]);

  const handleExportLogs = () => {
    const headers = ['ID', 'Data/Hora', 'Tipo', 'Ator', 'Título', 'Descrição', 'Fluxo', 'Nó', 'Botão', 'Tag', 'Campo'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      l.type,
      l.actor,
      `"${l.title}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.flowTitle || ''}"`,
      `"${l.nodeTitle || ''}"`,
      `"${l.buttonText || ''}"`,
      `"${l.tagName || ''}"`,
      `"${l.fieldName ? `${l.fieldName}=${l.fieldValue}` : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_lead_${contact.username.replace('@', '')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleAddManualLog = () => {
    if (!newLogTitle.trim()) return;

    const nowStr = `Hoje às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newEntry: ContactActivityLog = {
      id: `act_${Date.now()}`,
      type: newLogType,
      title: newLogTitle.trim(),
      description: newLogDesc.trim() || 'Ação registrada manualmente na auditoria da equipe.',
      timestamp: nowStr,
      actor: newLogActor,
      tagName: newLogTag.trim() || undefined
    };

    let updatedTags = [...contact.tags];
    if (newLogType === 'tag_added' && newLogTag.trim() && !updatedTags.includes(newLogTag.trim())) {
      updatedTags.push(newLogTag.trim());
    }

    onUpdateContact({
      ...contact,
      tags: updatedTags,
      activityLogs: [newEntry, ...(contact.activityLogs || [])]
    });

    setNewLogTitle('');
    setNewLogDesc('');
    setNewLogTag('');
    setShowAddLogModal(false);
  };

  const getLogIcon = (type: ContactActivityType) => {
    switch (type) {
      case 'tag_added':
        return <Tag className="w-3.5 h-3.5 text-emerald-600" />;
      case 'tag_removed':
        return <Trash2 className="w-3.5 h-3.5 text-rose-600" />;
      case 'button_clicked':
        return <MousePointerClick className="w-3.5 h-3.5 text-[#0084FF]" />;
      case 'quick_reply_clicked':
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case 'flow_triggered':
        return <Workflow className="w-3.5 h-3.5 text-purple-600" />;
      case 'node_executed':
        return <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />;
      case 'comment_keyword_triggered':
        return <Sparkles className="w-3.5 h-3.5 text-pink-600" />;
      case 'story_reply_triggered':
        return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case 'broadcast_received':
        return <Radio className="w-3.5 h-3.5 text-fuchsia-600" />;
      case 'human_handover':
        return <UserCheck className="w-3.5 h-3.5 text-cyan-600" />;
      case 'custom_field_updated':
        return <FileText className="w-3.5 h-3.5 text-amber-600" />;
      case 'status_changed':
        return <AlertCircle className="w-3.5 h-3.5 text-slate-600" />;
      case 'note_added':
      default:
        return <FileText className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const getLogBadgeColors = (type: ContactActivityType) => {
    switch (type) {
      case 'tag_added':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'tag_removed':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'button_clicked':
        return 'bg-blue-50 border-blue-200 text-[#0084FF]';
      case 'quick_reply_clicked':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'flow_triggered':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'node_executed':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'comment_keyword_triggered':
        return 'bg-pink-50 border-pink-200 text-pink-800';
      case 'story_reply_triggered':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'broadcast_received':
        return 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800';
      case 'human_handover':
        return 'bg-cyan-50 border-cyan-200 text-cyan-800';
      case 'custom_field_updated':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getActorBadge = (actor: ContactActivityLog['actor']) => {
    switch (actor) {
      case 'bot':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Bot className="w-3 h-3" /> Bot ManyFlow
          </span>
        );
      case 'user':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <User className="w-3 h-3" /> {contact.name.split(' ')[0]} (Lead)
          </span>
        );
      case 'agent':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3" /> Equipe / Atendente
          </span>
        );
      case 'system':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <Zap className="w-3 h-3" /> Sistema Meta
          </span>
        );
    }
  };

  return (
    <div className="space-y-4" id="contact_activity_timeline_view">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50/80 to-indigo-50/50 border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total de Ações</span>
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-extrabold text-[#1A1D21]">{stats.total}</div>
          <div className="text-[10px] text-[#64748B]">Eventos rastreados</div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50/80 to-sky-50/50 border border-blue-100 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cliques Botões</span>
            <MousePointerClick className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-extrabold text-[#1A1D21]">{stats.buttonClicks}</div>
          <div className="text-[10px] text-[#64748B]">Interações diretas</div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-100 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tags Aplicadas</span>
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-extrabold text-[#1A1D21]">{stats.tagEvents}</div>
          <div className="text-[10px] text-[#64748B]">Rotulagens no CRM</div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 border border-amber-100 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Automações</span>
            <Workflow className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-extrabold text-[#1A1D21]">{stats.automations}</div>
          <div className="text-[10px] text-[#64748B]">Disparos & Gatilhos</div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Actions */}
      <div className="p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2.5">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar em fluxos, tags, botões, nó ou autor..."
              className="w-full pl-8.5 pr-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1A1D21] focus:ring-1 focus:ring-[#0084FF] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21] focus:outline-none"
            >
              <option value="all">Todas as Atividades</option>
              <option value="automations">🤖 Automações & Fluxos</option>
              <option value="clicks">🔘 Cliques em Botões</option>
              <option value="tags">🏷️ Tags & Segmentações</option>
              <option value="fields">📝 Campos & Dados</option>
              <option value="human">👨‍💼 Atendimento / Handover</option>
            </select>

            {/* Actor Filter */}
            <select
              value={selectedActor}
              onChange={(e) => setSelectedActor(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21] focus:outline-none"
            >
              <option value="all">Todos os Autores</option>
              <option value="bot">🤖 Bot</option>
              <option value="user">👤 Lead</option>
              <option value="agent">👨‍💼 Atendente</option>
              <option value="system">⚡ Sistema</option>
            </select>

            {/* Actions */}
            <button
              onClick={handleExportLogs}
              title="Exportar CSV de Auditoria"
              className="p-1.5 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowAddLogModal(!showAddLogModal)}
              title="Registrar Ação Manual"
              className="py-1.5 px-2.5 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Registro</span>
            </button>
          </div>
        </div>

        {/* Modal / In-line Box to Add Manual Log */}
        {showAddLogModal && (
          <div className="p-3.5 rounded-xl bg-white border border-blue-200 shadow-sm space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#0084FF]" />
                <span>Registrar Evento ou Ação Manual no Histórico do Lead</span>
              </span>
              <button
                onClick={() => setShowAddLogModal(false)}
                className="text-xs text-[#64748B] hover:text-gray-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Título da ação (ex: Tag adicionada pelo atendente)"
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-medium text-[#1A1D21]"
                />
              </div>
              <div>
                <select
                  value={newLogType}
                  onChange={(e) => setNewLogType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21]"
                >
                  <option value="tag_added">🏷️ Tag Atribuída</option>
                  <option value="tag_removed">❌ Tag Removida</option>
                  <option value="button_clicked">🔘 Clique em Botão</option>
                  <option value="human_handover">👨‍💼 Atendimento Humano</option>
                  <option value="custom_field_updated">📝 Campo Atualizado</option>
                  <option value="note_added">📋 Registro / Nota</option>
                </select>
              </div>
            </div>

            {newLogType === 'tag_added' && (
              <div>
                <input
                  type="text"
                  placeholder="Nome da tag (ex: Lead-VIP, Interesse-Planos)"
                  value={newLogTag}
                  onChange={(e) => setNewLogTag(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-emerald-200 text-xs font-semibold text-emerald-800"
                />
              </div>
            )}

            <div>
              <textarea
                placeholder="Detalhes ou justificativa da ação para registro de auditoria..."
                value={newLogDesc}
                onChange={(e) => setNewLogDesc(e.target.value)}
                rows={2}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowAddLogModal(false)}
                className="px-3 py-1 text-xs text-[#64748B] hover:bg-gray-100 rounded-md cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddManualLog}
                className="px-3 py-1 bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold rounded-md cursor-pointer shadow-2xs"
              >
                Salvar no Histórico
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activity Timeline List */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-blue-400 before:via-purple-400 before:to-emerald-400">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2">
            <Activity className="w-8 h-8 text-gray-300 mx-auto" />
            <h4 className="text-xs font-bold text-[#1A1D21]">Nenhum registro de atividade encontrado</h4>
            <p className="text-[11px] text-[#64748B] max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'all' || selectedActor !== 'all'
                ? 'Tente remover os filtros ou buscar por outros termos.'
                : 'As automações, cliques em botões e alterações de tags feitas pelo bot aparecerão aqui em tempo real.'}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            return (
              <div key={log.id} className="relative group">
                {/* Node Dot / Icon on Line */}
                <div className="absolute -left-[29px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#0084FF] shadow-xs flex items-center justify-center z-10 transition-transform group-hover:scale-110">
                  {getLogIcon(log.type)}
                </div>

                {/* Event Card */}
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-blue-200 hover:shadow-xs transition-all space-y-2">
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getLogBadgeColors(log.type)}`}>
                        {log.title}
                      </span>
                      {getActorBadge(log.actor)}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-[#64748B] font-mono">
                      <Clock className="w-3 h-3 text-[#64748B]" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#1A1D21] leading-relaxed font-medium">
                    {log.description}
                  </p>

                  {/* Contextual Badges / Highlights */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Tag Badge */}
                    {log.tagName && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        <span>Tag: {log.tagName}</span>
                      </div>
                    )}

                    {/* Button Clicked */}
                    {log.buttonText && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#0084FF] border border-blue-200 text-[11px] font-bold">
                        <MousePointerClick className="w-3 h-3 text-[#0084FF]" />
                        <span>Botão: "{log.buttonText}"</span>
                      </div>
                    )}

                    {/* Flow & Node info */}
                    {log.flowTitle && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
                        <Workflow className="w-3 h-3 text-purple-600" />
                        <span>Fluxo: {log.flowTitle}</span>
                        {log.nodeTitle && (
                          <>
                            <ArrowRight className="w-2.5 h-2.5 text-purple-400" />
                            <span className="text-purple-900 font-bold">{log.nodeTitle}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Custom Field Info */}
                    {log.fieldName && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-mono">
                        <FileText className="w-3 h-3 text-amber-600" />
                        <span>{`{${log.fieldName}}`} = <strong>"{log.fieldValue}"</strong></span>
                      </div>
                    )}

                    {/* Post Caption Trigger */}
                    {log.postCaption && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 text-pink-800 border border-pink-200 text-[10px] font-medium max-w-xs truncate">
                        <Instagram className="w-3 h-3 text-pink-600 shrink-0" />
                        <span className="truncate">Post: "{log.postCaption}"</span>
                      </div>
                    )}

                    {/* Campaign Name */}
                    {log.campaignName && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 text-[11px] font-semibold">
                        <Radio className="w-3 h-3 text-fuchsia-600" />
                        <span>Transmissão: {log.campaignName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
