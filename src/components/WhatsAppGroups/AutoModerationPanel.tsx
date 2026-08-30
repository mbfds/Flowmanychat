import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Ban,
  Link2,
  FileText,
  Zap,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  Radio,
  Play,
  RotateCcw,
  Sparkles,
  Globe,
  Lock,
  MessageSquare,
  Clock,
  UserX,
  Sliders,
  ChevronDown,
  Info
} from 'lucide-react';
import {
  AutoModerationConfig,
  ModerationIncident,
  BlacklistedMember,
  KeywordModerationRule,
  DomainFilterRule,
  WhatsAppGroup
} from '../../types';

interface AutoModerationPanelProps {
  config: AutoModerationConfig;
  incidents: ModerationIncident[];
  blacklist: BlacklistedMember[];
  groups: WhatsAppGroup[];
  onUpdateConfig: (newConfig: AutoModerationConfig) => void;
  onRevertIncident: (incidentId: string) => void;
  onBlacklistMember: (phone: string, name: string, reason: string) => void;
  onRemoveBlacklist: (blacklistId: string) => void;
  onTriggerToast: (msg: string) => void;
}

export const AutoModerationPanel: React.FC<AutoModerationPanelProps> = ({
  config,
  incidents,
  blacklist,
  groups,
  onUpdateConfig,
  onRevertIncident,
  onBlacklistMember,
  onRemoveBlacklist,
  onTriggerToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'keywords' | 'link_blocker' | 'spam_flood' | 'strikes' | 'blacklist' | 'simulator'>('incidents');
  
  // Local editable config
  const [localConfig, setLocalConfig] = useState<AutoModerationConfig>(config);
  const [selectedGroupScope, setSelectedGroupScope] = useState<string>('all');
  
  // Incident filtering
  const [incidentSearch, setIncidentSearch] = useState('');
  const [incidentFilterType, setIncidentFilterType] = useState<string>('all');
  
  // New Keyword Form
  const [showAddKeywordModal, setShowAddKeywordModal] = useState(false);
  const [newKeywordPhrase, setNewKeywordPhrase] = useState('');
  const [newKeywordMatchType, setNewKeywordMatchType] = useState<'contains' | 'exact' | 'regex'>('contains');
  const [newKeywordSeverity, setNewKeywordSeverity] = useState<'high' | 'medium' | 'low'>('high');
  const [newKeywordAction, setNewKeywordAction] = useState<'warn_and_delete' | 'delete_only' | 'instant_kick' | 'kick_and_blacklist'>('kick_and_blacklist');
  const [newKeywordCategory, setNewKeywordCategory] = useState<'scam_crypto' | 'adult' | 'external_groups' | 'profanity' | 'custom'>('custom');

  // New Domain Form
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [newDomainPattern, setNewDomainPattern] = useState('');
  const [newDomainType, setNewDomainType] = useState<'whitelist' | 'blacklist'>('blacklist');
  const [newDomainDescription, setNewDomainDescription] = useState('');
  const [newDomainAction, setNewDomainAction] = useState<'delete_only' | 'warn_and_delete' | 'instant_kick'>('instant_kick');

  // New Manual Blacklist Form
  const [showAddBlacklistModal, setShowAddBlacklistModal] = useState(false);
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualReason, setManualReason] = useState('');

  // Sandbox Simulator State
  const [simText, setSimText] = useState('🚨 Oportunidade Única: urubu do pix manda 50 volta 500 no link t.me/sinais_fake');
  const [simSenderPhone, setSimSenderPhone] = useState('+55 11 98822-3344');
  const [simSenderRole, setSimSenderRole] = useState<'member' | 'admin'>('member');
  const [simResult, setSimResult] = useState<{
    triggered: boolean;
    ruleName?: string;
    details?: string;
    actions: string[];
    riskScore: number;
  } | null>(null);

  // Sync back config helper
  const handleToggleMasterShield = () => {
    const updated = { ...localConfig, enabled: !localConfig.enabled };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    onTriggerToast(updated.enabled ? '🛡️ Escudo de Auto-Moderação Ativado' : '⚠️ Escudo de Auto-Moderação Pausado');
  };

  const handleUpdateKeywords = (newKeywords: KeywordModerationRule[]) => {
    const updated = {
      ...localConfig,
      keywordFilter: {
        ...localConfig.keywordFilter,
        customKeywords: newKeywords
      }
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
  };

  const handleUpdateDomains = (newDomains: DomainFilterRule[]) => {
    const updated = {
      ...localConfig,
      linkBlocker: {
        ...localConfig.linkBlocker,
        domains: newDomains
      }
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
  };

  const handleSaveSpamRules = (changes: Partial<AutoModerationConfig['spamBehavior']>) => {
    const updated = {
      ...localConfig,
      spamBehavior: {
        ...localConfig.spamBehavior,
        ...changes
      }
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    onTriggerToast('Configurações de Anti-Spam & Anti-Flood salvas!');
  };

  const handleSaveStrikeRules = (changes: Partial<AutoModerationConfig['strikeSystem']>) => {
    const updated = {
      ...localConfig,
      strikeSystem: {
        ...localConfig.strikeSystem,
        ...changes
      }
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    onTriggerToast('Configurações do Sistema de Strikes salvas!');
  };

  // Add keyword
  const handleAddKeyword = () => {
    if (!newKeywordPhrase.trim()) return;
    const newRule: KeywordModerationRule = {
      id: `kw_${Date.now()}`,
      phrase: newKeywordPhrase.trim().toLowerCase(),
      matchType: newKeywordMatchType,
      severity: newKeywordSeverity,
      action: newKeywordAction,
      enabled: true,
      category: newKeywordCategory
    };
    handleUpdateKeywords([newRule, ...localConfig.keywordFilter.customKeywords]);
    setNewKeywordPhrase('');
    setShowAddKeywordModal(false);
    onTriggerToast(`Regra de palavra-chave "${newRule.phrase}" adicionada`);
  };

  // Add Domain
  const handleAddDomain = () => {
    if (!newDomainPattern.trim()) return;
    const newRule: DomainFilterRule = {
      id: `dom_${Date.now()}`,
      domainOrPattern: newDomainPattern.trim().toLowerCase().replace(/^https?:\/\//, ''),
      type: newDomainType,
      description: newDomainDescription || (newDomainType === 'whitelist' ? 'Domínio Seguro' : 'Domínio Proibido'),
      enabled: true,
      actionIfBlacklisted: newDomainAction
    };
    handleUpdateDomains([newRule, ...localConfig.linkBlocker.domains]);
    setNewDomainPattern('');
    setNewDomainDescription('');
    setShowAddDomainModal(false);
    onTriggerToast(`Domínio ${newRule.domainOrPattern} adicionado à ${newRule.type === 'whitelist' ? 'Whitelist' : 'Blacklist'}`);
  };

  // Add Manual Blacklist
  const handleAddManualBlacklist = () => {
    if (!manualPhone.trim()) return;
    onBlacklistMember(manualPhone.trim(), manualName.trim() || 'Membro Bloqueado', manualReason.trim() || 'Adicionado manualmente pelo Administrador');
    setManualPhone('');
    setManualName('');
    setManualReason('');
    setShowAddBlacklistModal(false);
    onTriggerToast('Número adicionado à Lista Negra permanentemente');
  };

  // Run Simulator
  const handleRunSimulator = () => {
    const text = simText.toLowerCase();
    let triggered = false;
    let ruleName = '';
    let details = '';
    const actions: string[] = [];
    let riskScore = 0;

    // Check if admin
    if (simSenderRole === 'admin' && localConfig.linkBlocker.allowAdminsToSendLinks) {
      setSimResult({
        triggered: false,
        ruleName: 'Exceção de Administrador',
        details: 'Administradores possuem passe livre para envio de links e conteúdos no grupo.',
        actions: ['Permitir envio sem restrições'],
        riskScore: 0
      });
      return;
    }

    // 1. Blacklisted member check
    const isBlacklisted = blacklist.some(b => b.phone.replace(/\D/g, '') === simSenderPhone.replace(/\D/g, ''));
    if (isBlacklisted) {
      setSimResult({
        triggered: true,
        ruleName: 'Membro na Lista Negra Global',
        details: `O número ${simSenderPhone} está na lista de banimento permanente.`,
        actions: ['Baileys: groupParticipantsUpdate(kick)', 'Deletar mensagem instantaneamente'],
        riskScore: 100
      });
      return;
    }

    // 2. Foreign prefix check
    if (localConfig.spamBehavior.blockForeignPhoneNumbers) {
      const allowed = localConfig.spamBehavior.allowedCountryCodes;
      const hasAllowedPrefix = allowed.some(prefix => simSenderPhone.startsWith(prefix));
      if (!hasAllowedPrefix) {
        triggered = true;
        ruleName = 'Número Internacional Não Autorizado';
        details = `O DDI de ${simSenderPhone} não está na lista permitida (${allowed.join(', ')}).`;
        actions.push('Baileys: groupParticipantsUpdate(kick)');
        actions.push('Auto-adicionar à Blacklist Definitiva');
        riskScore = 95;
      }
    }

    // 3. Keyword Check
    if (localConfig.keywordFilter.enabled && !triggered) {
      for (const kw of localConfig.keywordFilter.customKeywords) {
        if (!kw.enabled) continue;
        if (text.includes(kw.phrase.toLowerCase())) {
          triggered = true;
          ruleName = `Palavra Proibida: "${kw.phrase}"`;
          details = `Detectado termo com gravidade ${kw.severity.toUpperCase()} (Categoria: ${kw.category})`;
          actions.push('Baileys: messages.delete(msgId)');
          if (kw.action === 'instant_kick' || kw.action === 'kick_and_blacklist') {
            actions.push('Baileys: groupParticipantsUpdate(kick)');
          } else {
            actions.push(`Registrar Strike (1/${localConfig.strikeSystem.maxStrikes})`);
            actions.push('Enviar aviso com menção pública no grupo');
          }
          if (kw.action === 'kick_and_blacklist') {
            actions.push('Inserir número na Lista Negra Permanente');
          }
          riskScore = kw.severity === 'high' ? 90 : 65;
          break;
        }
      }
    }

    // 4. Link check
    if (localConfig.linkBlocker.enabled && !triggered) {
      const hasUrl = /(https?:\/\/|www\.|t\.me\/|chat\.whatsapp\.com\/|wa\.me\/|bit\.ly\/|cutt\.ly\/)/i.test(simText);
      if (hasUrl) {
        // Check whitelist
        const whitelistedDomains = localConfig.linkBlocker.domains
          .filter(d => d.type === 'whitelist' && d.enabled)
          .map(d => d.domainOrPattern.toLowerCase());
        
        const isWhitelisted = whitelistedDomains.some(dom => text.includes(dom));

        if (!isWhitelisted) {
          triggered = true;
          ruleName = 'Link Externo Não Autorizado (Anti-Link)';
          details = 'Link detectado que não consta na lista de domínios confiáveis permitidos.';
          actions.push('Baileys: messages.delete(msgId)');
          if (localConfig.linkBlocker.action === 'instant_kick') {
            actions.push('Baileys: groupParticipantsUpdate(kick)');
          } else {
            actions.push(`Registrar Strike no perfil do membro (1/${localConfig.strikeSystem.maxStrikes})`);
          }
          riskScore = 85;
        }
      }
    }

    if (!triggered) {
      setSimResult({
        triggered: false,
        ruleName: 'Mensagem Segura',
        details: 'A mensagem foi escaneada com sucesso e nenhum padrão malicioso ou proibido foi encontrado.',
        actions: ['Permitir postagem no grupo'],
        riskScore: 5
      });
    } else {
      setSimResult({
        triggered: true,
        ruleName,
        details,
        actions,
        riskScore
      });
    }
  };

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (selectedGroupScope !== 'all' && inc.groupJid !== selectedGroupScope) return false;
      if (incidentFilterType !== 'all' && inc.triggerType !== incidentFilterType) return false;
      if (incidentSearch) {
        const q = incidentSearch.toLowerCase();
        return (
          inc.memberName.toLowerCase().includes(q) ||
          inc.memberPhone.toLowerCase().includes(q) ||
          inc.triggerDetail.toLowerCase().includes(q) ||
          inc.originalMessage.toLowerCase().includes(q) ||
          inc.groupName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [incidents, selectedGroupScope, incidentFilterType, incidentSearch]);

  return (
    <div id="auto_moderation_panel" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Global Shield Controller */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-colors ${
              localConfig.enabled
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}>
              {localConfig.enabled ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Sistema de Auto-Moderação & Escudo Anti-Spam
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  localConfig.enabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                }`}>
                  {localConfig.enabled ? 'ESCUDO ATIVO 24/7' : 'ESCUDO DESATIVADO'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Filtros inteligentes de palavras-chave, link-blocker por domínio e remoção imediata de bots e spammers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Scope Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedGroupScope}
                onChange={(e) => setSelectedGroupScope(e.target.value)}
                aria-label="Filtrar escopo de grupos"
                className="bg-transparent border-none text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">Todos os Grupos (Global)</option>
                {groups.map(g => (
                  <option key={g.jid} value={g.jid}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Master Toggle */}
            <button
              onClick={handleToggleMasterShield}
              className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                localConfig.enabled
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{localConfig.enabled ? 'Pausar Moderação' : 'Ativar Moderação'}</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Msgs Escaneadas</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {localConfig.stats.messagesScanned.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Links Bloqueados</span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
              {localConfig.stats.linksBlocked}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Golpes / Palavras</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
              {localConfig.stats.keywordsFiltered}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Floods Travados</span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
              {localConfig.stats.spamFloodsStopped}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Spammers Banidos</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
              {localConfig.stats.membersKicked}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avisos Enviados</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {localConfig.stats.membersWarned}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        {[
          { id: 'incidents', label: `Quarentena & Incidentes (${incidents.length})`, icon: AlertTriangle, badge: `${incidents.filter(i => i.status === 'active').length} ativos` },
          { id: 'keywords', label: `Filtro de Palavras (${localConfig.keywordFilter.customKeywords.length})`, icon: FileText },
          { id: 'link_blocker', label: `Link-Blocker (${localConfig.linkBlocker.domains.length} domínios)`, icon: Link2 },
          { id: 'spam_flood', label: 'Anti-Flood & Bots', icon: Zap },
          { id: 'strikes', label: 'Sistema de Avisos & Strikes', icon: Sliders },
          { id: 'blacklist', label: `Lista Negra (${blacklist.length})`, icon: Ban },
          { id: 'simulator', label: 'Simulador Anti-Spam Sandbox', icon: Play, highlight: true }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: INCIDENTS & QUARANTINE FEED */}
      {activeSubTab === 'incidents' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por telefone, membro ou palavra..."
                value={incidentSearch}
                onChange={(e) => setIncidentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={incidentFilterType}
                onChange={(e) => setIncidentFilterType(e.target.value)}
                aria-label="Filtrar tipo de infração"
                className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border-none focus:outline-none cursor-pointer"
              >
                <option value="all">Todos os Tipos de Infração</option>
                <option value="link_blocker">Link Proibido</option>
                <option value="keyword_violation">Palavra-Chave / Golpe</option>
                <option value="flood_spam">Flood / Mensagens Rápidas</option>
                <option value="foreign_prefix">Número Estrangeiro (+1, +44)</option>
              </select>

              <span className="text-xs text-slate-400 font-mono shrink-0">
                {filteredIncidents.length} registros
              </span>
            </div>
          </div>

          {/* Incident Cards / List */}
          <div className="space-y-3">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Nenhum incidente de spam no momento</p>
                <p className="text-xs text-slate-400">Seus grupos estão protegidos e sem violações pendentes.</p>
              </div>
            ) : (
              filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        incident.triggerType === 'link_blocker' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        incident.triggerType === 'keyword_violation' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        incident.triggerType === 'foreign_prefix' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                        'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}>
                        {incident.triggerType === 'link_blocker' ? <Link2 className="w-4 h-4" /> :
                         incident.triggerType === 'keyword_violation' ? <FileText className="w-4 h-4" /> :
                         incident.triggerType === 'foreign_prefix' ? <Globe className="w-4 h-4" /> :
                         <Zap className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {incident.memberName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ({incident.memberPhone})
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {incident.groupName}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          {incident.triggerDetail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        incident.actionTaken === 'member_kicked' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        incident.actionTaken === 'member_blacklisted' ? 'bg-black text-white dark:bg-slate-800 dark:text-rose-400' :
                        incident.actionTaken === 'member_warned' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {incident.actionTaken === 'member_kicked' ? '🚫 Membro Removido' :
                         incident.actionTaken === 'member_blacklisted' ? '⛔ Ban Permanente' :
                         incident.actionTaken === 'member_warned' ? `⚠️ Advertência (${incident.strikeCount}/${incident.maxStrikes})` :
                         '🗑️ Mensagem Apagada'}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(incident.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Intercepted Content Box */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Conteúdo Interceptado:</span>
                      <span>"{incident.originalMessage}"</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Ação executada em <strong>0.32s</strong> via Baileys API
                    </span>

                    <div className="flex items-center gap-2">
                      {incident.canRevert && (
                        <button
                          onClick={() => {
                            onRevertIncident(incident.id);
                            onTriggerToast(`Ação para ${incident.memberName} revertida com sucesso`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reverter / Desbanir</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onBlacklistMember(incident.memberPhone, incident.memberName, incident.triggerDetail);
                          onTriggerToast(`Número ${incident.memberPhone} adicionado à Lista Negra`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Blacklist Global</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: KEYWORD FILTER CONFIG */}
      {activeSubTab === 'keywords' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Presets Grid */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Pacotes de Proteção Rápida Pré-Configurados
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ative grupos de palavras e padrões maliciosos comuns no WhatsApp em 1 clique
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  key: 'antiScamCrypto',
                  title: 'Anti-Golpe Pix & Crypto',
                  desc: 'Bloqueia "urubu do pix", "robô de pix", pirâmides e ofertas falsas de renda extra.',
                  active: localConfig.keywordFilter.presetPacks.antiScamCrypto
                },
                {
                  key: 'antiExternalGroupInvites',
                  title: 'Anti-Convites Concorrentes',
                  desc: 'Bloqueia links t.me/ e mensagens divulgando canais/grupos externos.',
                  active: localConfig.keywordFilter.presetPacks.antiExternalGroupInvites
                },
                {
                  key: 'antiAdultContent',
                  title: 'Anti-Conteúdo Adulto / Pornô',
                  desc: 'Filtra palavras impróprias, links +18 e pacotes de stickers explícitos.',
                  active: localConfig.keywordFilter.presetPacks.antiAdultContent
                },
                {
                  key: 'antiAggressiveProfanity',
                  title: 'Anti-Ofensas & Ataques',
                  desc: 'Filtra ofensas graves, discurso de ódio e termos depreciativos.',
                  active: localConfig.keywordFilter.presetPacks.antiAggressiveProfanity
                }
              ].map((pack) => (
                <div
                  key={pack.key}
                  onClick={() => {
                    const updated = {
                      ...localConfig,
                      keywordFilter: {
                        ...localConfig.keywordFilter,
                        presetPacks: {
                          ...localConfig.keywordFilter.presetPacks,
                          [pack.key]: !pack.active
                        }
                      }
                    };
                    setLocalConfig(updated);
                    onUpdateConfig(updated);
                    onTriggerToast(`Pacote "${pack.title}" ${!pack.active ? 'ativado' : 'desativado'}`);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    pack.active
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {pack.title}
                    </span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      pack.active ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'
                    }`}>
                      {pack.active ? '✓' : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {pack.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Keywords Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Regras de Palavras-Chave Personalizadas ({localConfig.keywordFilter.customKeywords.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Adicione termos específicos para deleção e punição automática
                </p>
              </div>

              <button
                onClick={() => setShowAddKeywordModal(true)}
                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Palavra / Frase</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="pb-3 pl-2">Palavra / Expressão</th>
                    <th className="pb-3">Tipo de Correspondência</th>
                    <th className="pb-3">Gravidade</th>
                    <th className="pb-3">Ação Automática</th>
                    <th className="pb-3 text-right pr-2">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {localConfig.keywordFilter.customKeywords.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 pl-2 font-mono font-bold text-slate-900 dark:text-white">
                        "{rule.phrase}"
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                          {rule.matchType === 'contains' ? 'Contém no texto' : rule.matchType === 'exact' ? 'Exato' : 'Regex'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rule.severity === 'high' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          rule.severity === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {rule.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {rule.action === 'kick_and_blacklist' ? '🚫 Ban + Blacklist' :
                         rule.action === 'instant_kick' ? '🚫 Remover Imediatamente' :
                         rule.action === 'warn_and_delete' ? '⚠️ Apagar & Advertir' : '🗑️ Apenas Apagar'}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => {
                            const filtered = localConfig.keywordFilter.customKeywords.filter(k => k.id !== rule.id);
                            handleUpdateKeywords(filtered);
                            onTriggerToast(`Regra "${rule.phrase}" removida`);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: LINK BLOCKER CONFIG */}
      {activeSubTab === 'link_blocker' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* General Link Blocker Settings */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600" />
              Configuração Geral do Bloqueador de Links
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Modo de Operação</label>
                <select
                  value={localConfig.linkBlocker.mode}
                  onChange={(e) => {
                    const updated = {
                      ...localConfig,
                      linkBlocker: {
                        ...localConfig.linkBlocker,
                        mode: e.target.value as any
                      }
                    };
                    setLocalConfig(updated);
                    onUpdateConfig(updated);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="block_all_except_whitelist">Bloquear tudo, exceto Whitelist (Recomendado)</option>
                  <option value="block_blacklisted_only">Bloquear apenas domínios da Blacklist</option>
                  <option value="block_all_links">Bloquear 100% dos links (Sem exceções)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ação em Caso de Link Proibido</label>
                <select
                  value={localConfig.linkBlocker.action}
                  onChange={(e) => {
                    const updated = {
                      ...localConfig,
                      linkBlocker: {
                        ...localConfig.linkBlocker,
                        action: e.target.value as any
                      }
                    };
                    setLocalConfig(updated);
                    onUpdateConfig(updated);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="instant_kick">Remoção Imediata (Kick do Grupo)</option>
                  <option value="kick_and_blacklist">Remoção + Blacklist Global</option>
                  <option value="warn_and_delete">Apagar Mensagem + Strike</option>
                  <option value="delete_only">Apenas Apagar Mensagem</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Permissões de Admin</label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="allowAdmins"
                    checked={localConfig.linkBlocker.allowAdminsToSendLinks}
                    onChange={(e) => {
                      const updated = {
                        ...localConfig,
                        linkBlocker: {
                          ...localConfig.linkBlocker,
                          allowAdminsToSendLinks: e.target.checked
                        }
                      };
                      setLocalConfig(updated);
                      onUpdateConfig(updated);
                    }}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="allowAdmins" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
                    Administradores podem postar links livremente
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Rules Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  Domínios Autorizados (Whitelist) e Padrões Bloqueados (Blacklist)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gerencie quais sites podem ser compartilhados pelos membros
                </p>
              </div>

              <button
                onClick={() => setShowAddDomainModal(true)}
                className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Domínio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Whitelist Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Whitelist (Domínios Permitidos)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {localConfig.linkBlocker.domains.filter(d => d.type === 'whitelist').length} domínios
                  </span>
                </div>

                <div className="space-y-2">
                  {localConfig.linkBlocker.domains.filter(d => d.type === 'whitelist').map((dom) => (
                    <div key={dom.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">{dom.domainOrPattern}</span>
                        <span className="text-[10px] text-slate-400">{dom.description}</span>
                      </div>
                      <button
                        onClick={() => {
                          const filtered = localConfig.linkBlocker.domains.filter(d => d.id !== dom.id);
                          handleUpdateDomains(filtered);
                          onTriggerToast(`Domínio ${dom.domainOrPattern} removido`);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blacklist Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    Blacklist (Padrões Proibidos)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {localConfig.linkBlocker.domains.filter(d => d.type === 'blacklist').length} padrões
                  </span>
                </div>

                <div className="space-y-2">
                  {localConfig.linkBlocker.domains.filter(d => d.type === 'blacklist').map((dom) => (
                    <div key={dom.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 block">{dom.domainOrPattern}</span>
                        <span className="text-[10px] text-slate-400">{dom.description}</span>
                      </div>
                      <button
                        onClick={() => {
                          const filtered = localConfig.linkBlocker.domains.filter(d => d.id !== dom.id);
                          handleUpdateDomains(filtered);
                          onTriggerToast(`Padrão ${dom.domainOrPattern} removido`);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: ANTI-FLOOD & BOT BEHAVIOR */}
      {activeSubTab === 'spam_flood' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              Detecção de Flood & Comportamento Malicioso Automatizado
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Flood Frequency */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Limite de Mensagens Rápidas (Anti-Flood)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    ATIVO
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bloqueia quando um mesmo usuário envia mensagens em rajada (flood).
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">Máximo de Mensagens</label>
                    <input
                      type="number"
                      value={localConfig.spamBehavior.maxMessagesWindow}
                      onChange={(e) => handleSaveSpamRules({ maxMessagesWindow: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">Em Janela de (Segundos)</label>
                    <input
                      type="number"
                      value={localConfig.spamBehavior.windowSeconds}
                      onChange={(e) => handleSaveSpamRules({ windowSeconds: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Foreign Numbers Filter */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Filtro de DDI Estrangeiro (Anti-Números Gringos)
                  </span>
                  <input
                    type="checkbox"
                    checked={localConfig.spamBehavior.blockForeignPhoneNumbers}
                    onChange={(e) => handleSaveSpamRules({ blockForeignPhoneNumbers: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bloqueia e expulsa automaticamente números de fora do Brasil comumente usados por robôs de phishing.
                </p>

                <div className="pt-2">
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold block mb-1">Prefixos Permitidos:</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {localConfig.spamBehavior.allowedCountryCodes.map((code) => (
                      <span key={code} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duplicate consecutive messages */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Bloqueio de Mensagens Repetidas Idênticas
                  </span>
                  <input
                    type="checkbox"
                    checked={localConfig.spamBehavior.blockDuplicateConsecutiveMsgs}
                    onChange={(e) => handleSaveSpamRules({ blockDuplicateConsecutiveMsgs: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detecta cópia-e-cola imediato da mesma mensagem em múltiplos grupos ou no mesmo chat.
                </p>
              </div>

              {/* Mass Mentions Protection */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Bloqueio de @todos / Menções em Massa
                  </span>
                  <input
                    type="checkbox"
                    checked={localConfig.spamBehavior.blockMassMentions}
                    onChange={(e) => handleSaveSpamRules({ blockMassMentions: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Apenas administradores podem utilizar a menção global @todos. Se um membro comum usar, a mensagem é apagada na hora.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: STRIKES & WARNING SYSTEM */}
      {activeSubTab === 'strikes' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              Configuração do Sistema de Avisos Graduais (Strikes 1/3, 2/3, 3/3)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Limite de Avisos Antes da Expulsão</label>
                <select
                  value={localConfig.strikeSystem.maxStrikes}
                  onChange={(e) => handleSaveStrikeRules({ maxStrikes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value={1}>1 Strike (Tolerância Zero / Remoção Imediata)</option>
                  <option value={2}>2 Strikes (1 Aviso + Kick no 2º)</option>
                  <option value={3}>3 Strikes (Padrão: 2 Avisos + Kick no 3º)</option>
                  <option value={5}>5 Strikes (Comunidade flexível)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Validade do Histórico de Strikes</label>
                <select
                  value={localConfig.strikeSystem.strikeExpirationHours}
                  onChange={(e) => handleSaveStrikeRules({ strikeExpirationHours: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value={24}>24 Horas (Zera após 1 dia)</option>
                  <option value={72}>72 Horas (3 dias)</option>
                  <option value={168}>7 Dias (1 semana)</option>
                  <option value={9999}>Permanente (Não expira)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Canal de Notificação</label>
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConfig.strikeSystem.sendPublicWarningInGroup}
                      onChange={(e) => handleSaveStrikeRules({ sendPublicWarningInGroup: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    Aviso público no grupo com @membro
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConfig.strikeSystem.sendPrivateWarningDm}
                      onChange={(e) => handleSaveStrikeRules({ sendPrivateWarningDm: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    Aviso privado no Direct (DM)
                  </label>
                </div>
              </div>
            </div>

            {/* Template Editor */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Template da Mensagem de Advertência Pública</label>
              <textarea
                rows={3}
                value={localConfig.strikeSystem.warningMessageTemplate}
                onChange={(e) => handleSaveStrikeRules({ warningMessageTemplate: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Tags disponíveis: <code>{'{membro}'}</code>, <code>{'{motivo}'}</code>, <code>{'{strike}'}</code>, <code>{'{maxStrikes}'}</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: BLACKLIST */}
      {activeSubTab === 'blacklist' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-600" />
                  Lista Negra Global de Telefones & Bots ({blacklist.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Números banidos permanentemente com auto-kick instantâneo caso tentem ingressar por qualquer link
                </p>
              </div>

              <button
                onClick={() => setShowAddBlacklistModal(true)}
                className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Número Manualmente</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="pb-3 pl-2">Telefone</th>
                    <th className="pb-3">Nome / Identificador</th>
                    <th className="pb-3">Motivo do Banimento</th>
                    <th className="pb-3">Bloqueado Em</th>
                    <th className="pb-3 text-center">Tentativas Barradas</th>
                    <th className="pb-3 text-right pr-2">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {blacklist.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 pl-2 font-mono font-bold text-rose-600 dark:text-rose-400">
                        {item.phone}
                      </td>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {item.reason}
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">
                        {item.blockedAt}
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-amber-600">
                        {item.totalAttemptsBlocked}x
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => {
                            onRemoveBlacklist(item.id);
                            onTriggerToast(`Número ${item.phone} removido da Blacklist`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-[11px] cursor-pointer transition-colors"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 7: INTERACTIVE SANDBOX SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-600" />
                  Simulador de Moderação em Tempo Real (Spam Sandbox)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Teste qualquer mensagem, link ou padrão para ver a reação imediata do motor Baileys Shield
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Ambiente de Testes Seguro
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Simulator Inputs (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mensagem a ser Testada:</label>
                  <textarea
                    rows={4}
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    placeholder="Digite um texto com links, palavras proibidas ou mensagens de spam..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Telefone do Remetente:</label>
                    <input
                      type="text"
                      value={simSenderPhone}
                      onChange={(e) => setSimSenderPhone(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Papel no Grupo:</label>
                    <select
                      value={simSenderRole}
                      onChange={(e) => setSimSenderRole(e.target.value as any)}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      <option value="member">Membro Comum (Sujeito a regras)</option>
                      <option value="admin">Administrador (Bypass se configurado)</option>
                    </select>
                  </div>
                </div>

                {/* Quick Test Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Exemplos Rápidos de Teste:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { label: 'Urubu do Pix', text: 'Quem quer participar do urubu do pix manda 50 volta 500 no pix na hora' },
                      { label: 'Link Telegram', text: 'Entrem no canal vip gratuito de sinais t.me/sinais_fake lucros diários' },
                      { label: 'Link Kiwify (Whitelist)', text: 'Aqui está o link oficial da aula no YouTube youtube.com/watch?v=123 e checkout kiwify.com.br/checkout' },
                      { label: 'Número Gringo (+1)', text: 'Hello check my new crypto bot profile', phone: '+1 202 555-0199' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSimText(preset.text);
                          if (preset.phone) setSimSenderPhone(preset.phone);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRunSimulator}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Executar Teste de Moderação</span>
                </button>
              </div>

              {/* Simulator Output (5 cols) */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Resultado do Diagnóstico do Escudo
                </span>

                {!simResult ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Clique em "Executar Teste" para ver como o motor de regras responde a este conteúdo.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                      simResult.triggered
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    }`}>
                      {simResult.triggered ? (
                        <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h5 className="font-bold text-xs">{simResult.ruleName}</h5>
                        <p className="text-[11px] mt-0.5 leading-relaxed opacity-90">{simResult.details}</p>
                      </div>
                    </div>

                    {/* Risk Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Nível de Ameaça Detectado</span>
                        <span className={`font-mono font-bold ${
                          simResult.riskScore >= 70 ? 'text-rose-600' :
                          simResult.riskScore >= 30 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {simResult.riskScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            simResult.riskScore >= 70 ? 'bg-rose-500' :
                            simResult.riskScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${simResult.riskScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Pipeline */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        Ações Disparadas no WhatsApp:
                      </span>
                      <div className="space-y-1.5">
                        {simResult.actions.map((act, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-mono text-slate-800 dark:text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD KEYWORD */}
      {showAddKeywordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adicionar Regra de Palavra-Chave</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Palavra ou Expressão</label>
                <input
                  type="text"
                  placeholder="Ex: urubu do pix, hack de seguidores..."
                  value={newKeywordPhrase}
                  onChange={(e) => setNewKeywordPhrase(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Correspondência</label>
                  <select
                    value={newKeywordMatchType}
                    onChange={(e) => setNewKeywordMatchType(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="contains">Contém no texto</option>
                    <option value="exact">Palavra exata</option>
                    <option value="regex">Expressão Regular (Regex)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Gravidade</label>
                  <select
                    value={newKeywordSeverity}
                    onChange={(e) => setNewKeywordSeverity(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="high">Alta (Crítica)</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Ação Automática</label>
                <select
                  value={newKeywordAction}
                  onChange={(e) => setNewKeywordAction(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="kick_and_blacklist">Remover do Grupo + Adicionar à Blacklist</option>
                  <option value="instant_kick">Remover Membro Imediatamente</option>
                  <option value="warn_and_delete">Apagar Mensagem + Enviar Advertência</option>
                  <option value="delete_only">Apenas Apagar Mensagem Silenciosamente</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddKeywordModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Salvar Regra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD DOMAIN */}
      {showAddDomainModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adicionar Domínio ao Link-Blocker</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Domínio ou Padrão URL</label>
                <input
                  type="text"
                  placeholder="Ex: hotmart.com ou t.me"
                  value={newDomainPattern}
                  onChange={(e) => setNewDomainPattern(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Tipo de Lista</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDomainType('whitelist')}
                    className={`p-2.5 rounded-xl font-bold text-xs border ${
                      newDomainType === 'whitelist'
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    Whitelist (Permitir)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDomainType('blacklist')}
                    className={`p-2.5 rounded-xl font-bold text-xs border ${
                      newDomainType === 'blacklist'
                        ? 'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    Blacklist (Bloquear)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Descrição / Rótulo</label>
                <input
                  type="text"
                  placeholder="Ex: Plataforma de pagamentos oficial"
                  value={newDomainDescription}
                  onChange={(e) => setNewDomainDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddDomainModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDomain}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Salvar Domínio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MANUAL BLACKLIST */}
      {showAddBlacklistModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adicionar à Lista Negra Permanente</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Número do WhatsApp (com DDI)</label>
                <input
                  type="text"
                  placeholder="Ex: +55 11 99999-8888"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nome / Identificador</label>
                <input
                  type="text"
                  placeholder="Ex: Bot Spammer Conhecido"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Motivo do Banimento</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tentativa de phishing nos grupos de lançamento..."
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddBlacklistModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddManualBlacklist}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Bloquear Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
