import React, { useState, useMemo } from 'react';
import { 
  Tag, 
  Sparkles, 
  Plus, 
  Play, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  RotateCcw, 
  History, 
  Search, 
  Filter, 
  Sliders, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  Instagram, 
  Facebook, 
  ArrowRight, 
  Eye, 
  Layers, 
  Database, 
  Zap, 
  X, 
  HelpCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Flame,
  Wand2,
  RefreshCw
} from 'lucide-react';
import { 
  AutoTaggingRule, 
  AutoTaggingExecutionLog, 
  Contact, 
  LiveConversation 
} from '../../types';
import { 
  DEFAULT_AUTO_TAGGING_RULES, 
  loadAutoTaggingRules, 
  saveAutoTaggingRules, 
  loadAutoTaggingLogs, 
  saveAutoTaggingLogs, 
  evaluateMessageAutoTagging, 
  applyAutoTaggingToContact 
} from '../../utils/autoTaggingHelper';

interface AutoTaggingManagerProps {
  contacts?: Contact[];
  onUpdateContacts?: (contacts: Contact[]) => void;
  conversations?: LiveConversation[];
  onUpdateConversations?: (conversations: LiveConversation[]) => void;
  onOpenLiveChat?: (contactId?: string) => void;
}

export const AutoTaggingManager: React.FC<AutoTaggingManagerProps> = ({
  contacts = [],
  onUpdateContacts,
  conversations = [],
  onUpdateConversations,
  onOpenLiveChat
}) => {
  // Rules and logs state
  const [rules, setRules] = useState<AutoTaggingRule[]>(() => loadAutoTaggingRules());
  const [logs, setLogs] = useState<AutoTaggingExecutionLog[]>(() => loadAutoTaggingLogs());
  
  // Navigation tabs inside Auto-Tagging
  const [subTab, setSubTab] = useState<'rules' | 'simulator' | 'retroactive' | 'logs'>('rules');

  // Search & Filters for Rules
  const [ruleSearch, setRuleSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'instagram' | 'messenger'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoTaggingRule | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for rule edit
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formMatchType, setFormMatchType] = useState<'contains' | 'exact' | 'regex'>('contains');
  const [formChannel, setFormChannel] = useState<'all' | 'instagram' | 'messenger'>('all');
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [formCaseSensitive, setFormCaseSensitive] = useState(false);
  const [formKeywords, setFormKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [formTagsToAdd, setFormTagsToAdd] = useState<string[]>([]);
  const [tagToAddInput, setTagToAddInput] = useState('');
  const [formTagsToRemove, setFormTagsToRemove] = useState<string[]>([]);
  const [tagToRemoveInput, setTagToRemoveInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Simulator state
  const [simulatorText, setSimulatorText] = useState(
    'Olá, tudo bem? Gostaria de saber qual é o preço do plano profissional e se tem desconto para pagamento anual.'
  );
  const [simulatorChannel, setSimulatorChannel] = useState<'instagram' | 'messenger'>('instagram');
  const [simulatorSelectedContactId, setSimulatorSelectedContactId] = useState<string>(contacts[0]?.id || '');
  const [simulationSuccessBanner, setSimulationSuccessBanner] = useState<string | null>(null);

  // Retroactive scan state
  const [isScanning, setIsScanning] = useState(false);
  const [retroactiveResults, setRetroactiveResults] = useState<{
    totalScanned: number;
    contactsMatched: number;
    tagsToApplyCount: number;
    matches: Array<{
      contact: Contact;
      matchedRules: AutoTaggingRule[];
      matchedKeywords: string[];
      tagsToAdd: string[];
      lastMessageText: string;
    }>;
  } | null>(null);
  const [scanAppliedMessage, setScanAppliedMessage] = useState<string | null>(null);

  // Existing tags across all CRM contacts for autocompletion
  const existingCrmTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => (c.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [contacts]);

  // Save rules to localStorage and state
  const updateAndSaveRules = (newRules: AutoTaggingRule[]) => {
    setRules(newRules);
    saveAutoTaggingRules(newRules);
  };

  // Save logs to localStorage and state
  const addExecutionLog = (newLog: AutoTaggingExecutionLog) => {
    const updated = [newLog, ...logs];
    setLogs(updated);
    saveAutoTaggingLogs(updated);
  };

  // KPI Metrics
  const stats = useMemo(() => {
    const activeRulesCount = rules.filter((r) => r.enabled).length;
    const allConfiguredTags = new Set<string>();
    rules.forEach((r) => r.tagsToAdd.forEach((t) => allConfiguredTags.add(t)));
    const totalTriggers = rules.reduce((acc, r) => acc + (r.timesTriggered || 0), 0);

    // Contatos que possuem ao menos uma tag configurada nas regras
    const contactsWithAutoTags = contacts.filter((c) =>
      c.tags?.some((t) => allConfiguredTags.has(t))
    ).length;

    return {
      activeRulesCount,
      totalRulesCount: rules.length,
      uniqueTagsCount: allConfiguredTags.size,
      totalTriggers,
      contactsWithAutoTags
    };
  }, [rules, contacts]);

  // Filtered rules for display
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch = 
        rule.name.toLowerCase().includes(ruleSearch.toLowerCase()) ||
        rule.keywords.some((kw) => kw.toLowerCase().includes(ruleSearch.toLowerCase())) ||
        rule.tagsToAdd.some((t) => t.toLowerCase().includes(ruleSearch.toLowerCase()));
      
      const matchesChannel = channelFilter === 'all' || rule.channelFilter === 'all' || rule.channelFilter === channelFilter;
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'enabled' && rule.enabled) || 
        (statusFilter === 'disabled' && !rule.enabled);

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [rules, ruleSearch, channelFilter, statusFilter]);

  // Open Modal for New or Edit
  const handleOpenEditModal = (rule?: AutoTaggingRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormName(rule.name);
      setFormDescription(rule.description || '');
      setFormEnabled(rule.enabled);
      setFormMatchType(rule.matchType);
      setFormChannel(rule.channelFilter);
      setFormPriority(rule.priority || 'medium');
      setFormCaseSensitive(rule.caseSensitive || false);
      setFormKeywords([...rule.keywords]);
      setFormTagsToAdd([...rule.tagsToAdd]);
      setFormTagsToRemove([...(rule.tagsToRemove || [])]);
    } else {
      setEditingRule(null);
      setFormName('');
      setFormDescription('');
      setFormEnabled(true);
      setFormMatchType('contains');
      setFormChannel('all');
      setFormPriority('medium');
      setFormCaseSensitive(false);
      setFormKeywords([]);
      setFormTagsToAdd([]);
      setFormTagsToRemove([]);
    }
    setKeywordInput('');
    setTagToAddInput('');
    setTagToRemoveInput('');
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Add keyword chip in modal
  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;
    if (formKeywords.includes(trimmed)) {
      setKeywordInput('');
      return;
    }
    setFormKeywords([...formKeywords, trimmed]);
    setKeywordInput('');
  };

  // Add tag to add chip
  const handleAddTagToAdd = (tag?: string) => {
    const target = tag || tagToAddInput.trim();
    if (!target) return;
    if (formTagsToAdd.includes(target)) {
      setTagToAddInput('');
      return;
    }
    setFormTagsToAdd([...formTagsToAdd, target]);
    setTagToAddInput('');
  };

  // Add tag to remove chip
  const handleAddTagToRemove = (tag?: string) => {
    const target = tag || tagToRemoveInput.trim();
    if (!target) return;
    if (formTagsToRemove.includes(target)) {
      setTagToRemoveInput('');
      return;
    }
    setFormTagsToRemove([...formTagsToRemove, target]);
    setTagToRemoveInput('');
  };

  // Save Rule
  const handleSaveRule = () => {
    if (!formName.trim()) {
      setFormError('Por favor, informe um nome descritivo para a regra.');
      return;
    }
    if (formKeywords.length === 0) {
      setFormError('Adicione pelo menos uma palavra-chave para detecção.');
      return;
    }
    if (formTagsToAdd.length === 0) {
      setFormError('Adicione pelo menos uma tag para ser aplicada ao contato.');
      return;
    }

    if (editingRule) {
      const updated = rules.map((r) => {
        if (r.id === editingRule.id) {
          return {
            ...r,
            name: formName.trim(),
            description: formDescription.trim(),
            enabled: formEnabled,
            matchType: formMatchType,
            channelFilter: formChannel,
            priority: formPriority,
            caseSensitive: formCaseSensitive,
            keywords: formKeywords,
            tagsToAdd: formTagsToAdd,
            tagsToRemove: formTagsToRemove,
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      });
      updateAndSaveRules(updated);
    } else {
      const newRule: AutoTaggingRule = {
        id: `rule_at_${Date.now()}`,
        name: formName.trim(),
        description: formDescription.trim(),
        enabled: formEnabled,
        matchType: formMatchType,
        channelFilter: formChannel,
        priority: formPriority,
        caseSensitive: formCaseSensitive,
        keywords: formKeywords,
        tagsToAdd: formTagsToAdd,
        tagsToRemove: formTagsToRemove,
        timesTriggered: 0,
        createdAt: new Date().toISOString()
      };
      updateAndSaveRules([newRule, ...rules]);
    }

    setIsEditModalOpen(false);
  };

  // Toggle Rule Status
  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map((r) => {
      if (r.id === ruleId) {
        return { ...r, enabled: !r.enabled };
      }
      return r;
    });
    updateAndSaveRules(updated);
  };

  // Duplicate Rule
  const handleDuplicateRule = (rule: AutoTaggingRule) => {
    const cloned: AutoTaggingRule = {
      ...rule,
      id: `rule_at_${Date.now()}`,
      name: `${rule.name} (Cópia)`,
      timesTriggered: 0,
      lastTriggeredAt: undefined,
      createdAt: new Date().toISOString()
    };
    updateAndSaveRules([cloned, ...rules]);
  };

  // Delete Rule
  const handleDeleteRule = (ruleId: string) => {
    const updated = rules.filter((r) => r.id !== ruleId);
    updateAndSaveRules(updated);
    setDeleteConfirmId(null);
  };

  // Restore Default Presets
  const handleRestoreDefaults = () => {
    if (window.confirm('Deseja restaurar as 5 regras de Auto-Tagging recomendadas? Suas regras personalizadas atuais serão redefinidas para o padrão.')) {
      updateAndSaveRules(DEFAULT_AUTO_TAGGING_RULES);
    }
  };

  // Live Simulator Evaluation
  const simulationResult = useMemo(() => {
    return evaluateMessageAutoTagging(simulatorText, simulatorChannel, rules);
  }, [simulatorText, simulatorChannel, rules]);

  // Apply simulated tags to selected contact
  const handleApplySimulatedTags = () => {
    const targetContact = contacts.find((c) => c.id === simulatorSelectedContactId) || contacts[0];
    if (!targetContact || !onUpdateContacts) return;

    if (simulationResult.matchedRules.length === 0) {
      alert('Nenhuma regra coincidiu com a mensagem digitada. Verifique as palavras-chave.');
      return;
    }

    const { updatedContact, tagsAdded, tagsRemoved, changed } = applyAutoTaggingToContact(
      targetContact,
      {
        tagsToAdd: simulationResult.tagsToAdd,
        tagsToRemove: simulationResult.tagsToRemove
      },
      simulationResult.matchedRules.map((r) => r.name)
    );

    if (changed) {
      const updatedContacts = contacts.map((c) => (c.id === targetContact.id ? updatedContact : c));
      onUpdateContacts(updatedContacts);

      // Increment rules trigger count
      const updatedRules = rules.map((r) => {
        if (simulationResult.matchedRules.some((m) => m.id === r.id)) {
          return {
            ...r,
            timesTriggered: (r.timesTriggered || 0) + 1,
            lastTriggeredAt: new Date().toISOString()
          };
        }
        return r;
      });
      updateAndSaveRules(updatedRules);

      // Log execution
      const newLog: AutoTaggingExecutionLog = {
        id: `log_${Date.now()}`,
        ruleId: simulationResult.matchedRules[0]?.id || 'rule_manual',
        ruleName: simulationResult.matchedRules.map((r) => r.name).join(', '),
        contactId: targetContact.id,
        contactName: targetContact.name,
        contactUsername: targetContact.username,
        channel: simulatorChannel,
        matchedKeyword: simulationResult.matchedKeywords.join(', '),
        tagsAdded,
        tagsRemoved,
        messageSnippet: simulatorText.slice(0, 100),
        executedAt: new Date().toISOString()
      };
      addExecutionLog(newLog);

      setSimulationSuccessBanner(
        `Tags aplicadas com sucesso a "${targetContact.name}": +[${tagsAdded.join(', ')}]${
          tagsRemoved.length > 0 ? ` -[${tagsRemoved.join(', ')}]` : ''
        }`
      );
      setTimeout(() => setSimulationSuccessBanner(null), 5000);
    } else {
      setSimulationSuccessBanner(
        `O contato "${targetContact.name}" já possuía todas as tags correspondentes a esta mensagem.`
      );
      setTimeout(() => setSimulationSuccessBanner(null), 4000);
    }
  };

  // Run Retroactive Scan on Contacts / Conversations
  const handleRunRetroactiveScan = () => {
    setIsScanning(true);
    setScanAppliedMessage(null);

    setTimeout(() => {
      const matches: Array<{
        contact: Contact;
        matchedRules: AutoTaggingRule[];
        matchedKeywords: string[];
        tagsToAdd: string[];
        lastMessageText: string;
      }> = [];

      let tagsToApplyCount = 0;

      // Inspect contacts and their conversations
      contacts.forEach((contact) => {
        // Find messages for this contact in conversations
        const conv = conversations.find((c) => c.contactId === contact.id || c.contact?.id === contact.id);
        const sampleTexts: string[] = [];

        if (conv && conv.messages && conv.messages.length > 0) {
          // Check user incoming messages
          conv.messages
            .filter((m) => m.sender === 'user')
            .forEach((m) => sampleTexts.push(m.text));
        }

        // Also check lastMessage
        if (conv?.lastMessage?.text) {
          sampleTexts.push(conv.lastMessage.text);
        }

        // If no conversations found, fallback to sample intent based on existing contact fields
        if (sampleTexts.length === 0) {
          sampleTexts.push(`Mensagem de teste de ${contact.name}`);
        }

        // Combine text or evaluate each
        const combinedText = sampleTexts.join(' ');
        const evaluation = evaluateMessageAutoTagging(combinedText, contact.channel, rules);

        if (evaluation.matchedRules.length > 0) {
          // Filter only tags that contact doesn't already have
          const newTags = evaluation.tagsToAdd.filter((t) => !(contact.tags || []).includes(t));
          if (newTags.length > 0) {
            tagsToApplyCount += newTags.length;
            matches.push({
              contact,
              matchedRules: evaluation.matchedRules,
              matchedKeywords: evaluation.matchedKeywords,
              tagsToAdd: newTags,
              lastMessageText: sampleTexts[sampleTexts.length - 1] || combinedText
            });
          }
        }
      });

      setRetroactiveResults({
        totalScanned: contacts.length,
        contactsMatched: matches.length,
        tagsToApplyCount,
        matches
      });

      setIsScanning(false);
    }, 600);
  };

  // Apply Retroactive Scan results to CRM
  const handleApplyRetroactiveScanToCrm = () => {
    if (!retroactiveResults || !onUpdateContacts) return;

    let updatedContactsList = [...contacts];
    let appliedCount = 0;

    retroactiveResults.matches.forEach((item) => {
      const contactIdx = updatedContactsList.findIndex((c) => c.id === item.contact.id);
      if (contactIdx >= 0) {
        const currentContact = updatedContactsList[contactIdx];
        const { updatedContact, changed } = applyAutoTaggingToContact(
          currentContact,
          {
            tagsToAdd: item.tagsToAdd,
            tagsToRemove: []
          },
          item.matchedRules.map((r) => r.name)
        );

        if (changed) {
          updatedContactsList[contactIdx] = updatedContact;
          appliedCount++;
        }
      }
    });

    onUpdateContacts(updatedContactsList);
    setScanAppliedMessage(
      `Varredura concluída com sucesso! ${appliedCount} contatos foram etiquetados automaticamente no CRM.`
    );
    setRetroactiveResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">
                  Auto-Tagging por Palavras-Chave
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Monitoramento Ativo
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Instagram &amp; Messenger
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Configure gatilhos inteligentes para mensagens de entrada. Ao detectar palavras-chave específicas nas conversas, o ManyFlow aplica automaticamente tags aos leads para segmentação instantânea no CRM, funis e transmissões.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn_restore_default_auto_tagging"
              onClick={handleRestoreDefaults}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Restaurar predefinições oficiais"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar Padrões</span>
            </button>
            <button
              id="btn_new_auto_tagging_rule"
              onClick={() => handleOpenEditModal()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Regra</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Regras Ativas</span>
              <Sliders className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{stats.activeRulesCount}</span>
              <span className="text-xs text-slate-400 font-medium">de {stats.totalRulesCount}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Tags Geradas</span>
              <Tag className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{stats.uniqueTagsCount}</span>
              <span className="text-xs text-slate-400 font-medium">tags únicas</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Disparos Totais</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{stats.totalTriggers}</span>
              <span className="text-xs text-slate-400 font-medium">etiquetações</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Contatos no CRM</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{stats.contactsWithAutoTags}</span>
              <span className="text-xs text-slate-400 font-medium">segmentados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
        <button
          id="btn_subtab_rules"
          onClick={() => setSubTab('rules')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            subTab === 'rules'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Regras de Auto-Tagging</span>
          <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
            subTab === 'rules' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {rules.length}
          </span>
        </button>

        <button
          id="btn_subtab_simulator"
          onClick={() => setSubTab('simulator')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            subTab === 'simulator'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Simulador em Tempo Real</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          id="btn_subtab_retroactive"
          onClick={() => setSubTab('retroactive')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            subTab === 'retroactive'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Varredura Retroativa no CRM</span>
        </button>

        <button
          id="btn_subtab_logs"
          onClick={() => setSubTab('logs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            subTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Histórico de Execuções</span>
          <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
            subTab === 'logs' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {logs.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: REGRAS DE AUTO-TAGGING                                            */}
      {/* ========================================================================= */}
      {subTab === 'rules' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ruleSearch}
                onChange={(e) => setRuleSearch(e.target.value)}
                placeholder="Buscar por regra, palavra-chave ou tag..."
                className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {ruleSearch && (
                <button
                  onClick={() => setRuleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setChannelFilter('all')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    channelFilter === 'all' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos os Canais
                </button>
                <button
                  onClick={() => setChannelFilter('instagram')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    channelFilter === 'instagram' ? 'bg-white text-pink-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Instagram className="w-3 h-3" />
                  Instagram
                </button>
                <button
                  onClick={() => setChannelFilter('messenger')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    channelFilter === 'messenger' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Facebook className="w-3 h-3" />
                  Messenger
                </button>
              </div>

              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 cursor-pointer"
              >
                <option value="all">Status: Todos</option>
                <option value="enabled">Apenas Ativas</option>
                <option value="disabled">Apenas Desativadas</option>
              </select>
            </div>
          </div>

          {/* Rules List Grid */}
          {filteredRules.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Nenhuma regra encontrada</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {ruleSearch ? 'Nenhuma regra corresponde aos filtros aplicados.' : 'Crie sua primeira regra de Auto-Tagging para começar a etiquetar contatos automaticamente.'}
              </p>
              <button
                onClick={() => handleOpenEditModal()}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-2 hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Nova Regra</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                    rule.enabled
                      ? 'border-slate-200 hover:border-indigo-300'
                      : 'border-slate-200/60 bg-slate-50/50 opacity-80'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Info & Status */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Switch toggle */}
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors relative cursor-pointer ${
                            rule.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                          title={rule.enabled ? 'Desativar Regra' : 'Ativar Regra'}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              rule.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>

                        {/* Match mode badge */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {rule.matchType === 'contains' && 'Contém Palavras'}
                          {rule.matchType === 'exact' && 'Palavra Exata'}
                          {rule.matchType === 'regex' && 'Expressão Regex'}
                        </span>

                        {/* Channel Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border ${
                          rule.channelFilter === 'instagram'
                            ? 'bg-pink-50 text-pink-700 border-pink-200'
                            : rule.channelFilter === 'messenger'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {rule.channelFilter === 'instagram' && <Instagram className="w-3 h-3" />}
                          {rule.channelFilter === 'messenger' && <Facebook className="w-3 h-3" />}
                          {rule.channelFilter === 'all' && 'Todos os Canais'}
                          {rule.channelFilter === 'instagram' && 'Instagram'}
                          {rule.channelFilter === 'messenger' && 'Messenger'}
                        </span>

                        {/* Priority Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          rule.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : rule.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          Prioridade: {rule.priority === 'high' ? 'Alta' : rule.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>

                      {rule.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {rule.description}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSimulatorText(`Mensagem de teste: ${rule.keywords[0] || 'teste'}`);
                          setSubTab('simulator');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Testar esta regra no simulador"
                      >
                        <Play className="w-3 h-3 text-indigo-600" />
                        <span>Testar</span>
                      </button>

                      <button
                        onClick={() => handleDuplicateRule(rule)}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Duplicar regra"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(rule)}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Editar regra"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === rule.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-slate-600 hover:text-slate-900 text-[10px] font-bold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(rule.id)}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Excluir regra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Keywords & Tags Section */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                    {/* Keywords */}
                    <div className="md:col-span-6 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                        Palavras-Chave Detectadas ({rule.keywords.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rule.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50/80 text-indigo-800 font-semibold text-[11px] border border-indigo-100"
                          >
                            "{kw}"
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tags To Add */}
                    <div className="md:col-span-4 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-500" />
                        Tags Aplicadas ({rule.tagsToAdd.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rule.tagsToAdd.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200 flex items-center gap-1"
                          >
                            <Plus className="w-2.5 h-2.5 text-emerald-600" />
                            {t}
                          </span>
                        ))}
                        {rule.tagsToRemove && rule.tagsToRemove.length > 0 && (
                          rule.tagsToRemove.map((t, idx) => (
                            <span
                              key={`rem_${idx}`}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-bold text-[11px] border border-rose-200 flex items-center gap-1"
                              title="Tag removida"
                            >
                              <X className="w-2.5 h-2.5 text-rose-600" />
                              {t}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="md:col-span-2 flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-medium block">Disparos</span>
                        <span className="text-sm font-black text-slate-800">{rule.timesTriggered || 0}</span>
                      </div>
                      {rule.lastTriggeredAt && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(rule.lastTriggeredAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: SIMULADOR EM TEMPO REAL                                           */}
      {/* ========================================================================= */}
      {subTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input & Simulation Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Play className="w-4 h-4 text-indigo-600" />
                  <span>Testador de Mensagens de Entrada</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  Avaliação Instantânea
                </span>
              </div>

              {/* Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Canal de Origem</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulatorChannel('instagram')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      simulatorChannel === 'instagram'
                        ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram Direct</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatorChannel('messenger')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      simulatorChannel === 'messenger'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook Messenger</span>
                  </button>
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Mensagem Enviada pelo Cliente</label>
                <textarea
                  rows={4}
                  value={simulatorText}
                  onChange={(e) => setSimulatorText(e.target.value)}
                  placeholder="Digite uma mensagem simulada do cliente..."
                  className="w-full p-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Sample Quick Phrases */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Exemplos Rápidos de Mensagens
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Quanto custa o plano profissional?',
                    'Preciso agendar uma demonstração com especialista',
                    'O bot deu erro e não funciona, preciso de suporte urgente',
                    'Adorei o atendimento de vocês, excelente plataforma!',
                    'Quero cancelar minha assinatura e pedir reembolso'
                  ].map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSimulatorText(phrase)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer text-left"
                    >
                      "{phrase}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Real Contact Assignment */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Aplicar Resultado em um Contato Real do CRM</span>
                  <span className="text-[11px] text-slate-400 font-normal">Opcional para teste ao vivo</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={simulatorSelectedContactId}
                    onChange={(e) => setSimulatorSelectedContactId(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 cursor-pointer"
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (@{c.username}) - Tags atuais: [{(c.tags || []).join(', ') || 'Nenhuma'}]
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleApplySimulatedTags}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aplicar Tags</span>
                  </button>
                </div>

                {simulationSuccessBanner && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{simulationSuccessBanner}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Detection Results Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Resultado da Detecção</span>
                </h3>
                {simulationResult.matchedRules.length > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {simulationResult.matchedRules.length} Regra(s) Coincidente(s)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    Sem Coincidência
                  </span>
                )}
              </div>

              {simulationResult.matchedRules.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Nenhuma palavra-chave detectada</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Nenhuma das regras ativas contém palavras-chave correspondentes a este texto no canal selecionado.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Matched Keywords */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Palavras-chave Encontradas:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {simulationResult.matchedKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          "{kw}"
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rules Triggered */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Regras Acionadas:
                    </span>
                    <div className="space-y-2">
                      {simulationResult.matchedRules.map((r) => (
                        <div key={r.id} className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900">{r.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            {r.priority === 'high' ? 'Alta' : 'Média'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags to be Added */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      Tags que Serão Adicionadas ao Contato:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {simulationResult.tagsToAdd.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-black text-xs border border-emerald-200"
                        >
                          +{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tags to be Removed */}
                  {simulationResult.tagsToRemove.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-rose-600" />
                        Tags Conflitantes Removidas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {simulationResult.tagsToRemove.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-bold text-xs border border-rose-200"
                          >
                            -{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: VARREDURA RETROATIVA NO CRM                                       */}
      {/* ========================================================================= */}
      {subTab === 'retroactive' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-indigo-600" />
                  <span>Varredura Retroativa no Histórico de Conversas</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Analise o histórico completo de conversas já realizadas pelos contatos no Instagram e Messenger. O sistema avaliará as regras ativas contra as mensagens anteriores e permitirá aplicar as tags aos contatos em lote em 1 clique.
                </p>
              </div>

              <button
                id="btn_run_retroactive_scan"
                onClick={handleRunRetroactiveScan}
                disabled={isScanning}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analisando Mensagens...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Iniciar Varredura Retroativa</span>
                  </>
                )}
              </button>
            </div>

            {scanAppliedMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{scanAppliedMessage}</span>
              </div>
            )}

            {/* Results Display */}
            {retroactiveResults && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-semibold block">Contatos Analisados</span>
                    <span className="text-lg font-black text-slate-800">{retroactiveResults.totalScanned}</span>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                    <span className="text-[11px] text-indigo-700 font-semibold block">Contatos com Coincidências</span>
                    <span className="text-lg font-black text-indigo-900">{retroactiveResults.contactsMatched}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[11px] text-emerald-700 font-semibold block">Novas Tags Prontas para Aplicação</span>
                    <span className="text-lg font-black text-emerald-900">{retroactiveResults.tagsToApplyCount}</span>
                  </div>
                </div>

                {retroactiveResults.matches.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Prévia dos Contatos Identificados ({retroactiveResults.matches.length})
                      </span>
                      <button
                        id="btn_apply_retroactive_tags_all"
                        onClick={handleApplyRetroactiveScanToCrm}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aplicar Tags em Todos os {retroactiveResults.matches.length} Contatos</span>
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {retroactiveResults.matches.map((item, idx) => (
                        <div key={idx} className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{item.contact.name}</span>
                              <span className="text-[11px] text-slate-400">@{item.contact.username}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                item.contact.channel === 'instagram' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {item.contact.channel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 italic truncate max-w-xl">
                              "{item.lastMessageText}"
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                              {item.tagsToAdd.map((t, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200"
                                >
                                  +{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                    Todos os contatos existentes já estão sincronizados com as tags das regras ativas!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: LOGS DE EXECUÇÃO                                                  */}
      {/* ========================================================================= */}
      {subTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Histórico de Auto-Tagging em Tempo Real</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Trilha de auditoria das últimas mensagens recebidas que dispararam regras de etiquetamento.
                </p>
              </div>

              {logs.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Deseja limpar todos os registros de histórico?')) {
                      setLogs([]);
                      saveAutoTaggingLogs([]);
                    }
                  }}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 font-semibold cursor-pointer transition-colors"
                >
                  Limpar Logs
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhum log registrado ainda. Realize testes no simulador ou aguarde mensagens de entrada no Live Chat.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{log.contactName}</span>
                        <span className="text-[11px] text-slate-400">@{log.contactUsername}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.channel === 'instagram' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {log.channel}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.executedAt).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-indigo-700">{log.ruleName}</span>
                        {' — '}
                        <span className="text-slate-500 italic">"{log.messageSnippet}"</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                        Palavra: "{log.matchedKeyword}"
                      </span>
                      {log.tagsAdded.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200"
                        >
                          +{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CRIAR OU EDITAR REGRA DE AUTO-TAGGING                              */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingRule ? 'Editar Regra de Auto-Tagging' : 'Criar Nova Regra de Auto-Tagging'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Defina palavras-chave de detecção e tags associadas para o CRM.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name & Enabled */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nome da Regra *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Interesse em Preço & Planos"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-medium"
                  />
                </div>

                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Status Ativo</span>
                  <button
                    type="button"
                    onClick={() => setFormEnabled(!formEnabled)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors relative cursor-pointer ${
                      formEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        formEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Descrição / Objetivo</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: Marca contatos interessados na tabela de preços para o time comercial."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Match Type & Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Modo de Correspondência</label>
                  <select
                    value={formMatchType}
                    onChange={(e: any) => setFormMatchType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none text-xs font-semibold cursor-pointer"
                  >
                    <option value="contains">Contém Palavra-chave (Flexível)</option>
                    <option value="exact">Palavra Exata / Isolada</option>
                    <option value="regex">Expressão Regular (Regex)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Filtro de Canal</label>
                  <select
                    value={formChannel}
                    onChange={(e: any) => setFormChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none text-xs font-semibold cursor-pointer"
                  >
                    <option value="all">Todos os Canais</option>
                    <option value="instagram">Apenas Instagram Direct</option>
                    <option value="messenger">Apenas Messenger</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Prioridade de Execução</label>
                  <select
                    value={formPriority}
                    onChange={(e: any) => setFormPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none text-xs font-semibold cursor-pointer"
                  >
                    <option value="high">Alta (Avaliar Primeiro)</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>

              {/* Keywords Input */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Palavras-Chave de Detecção *</span>
                  <span className="text-[11px] text-slate-400 font-normal">Pressione Enter ou vírgula para adicionar</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                    placeholder="Digite uma palavra (ex: preço) e tecle Enter..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Keywords Chips */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {formKeywords.length === 0 ? (
                    <span className="text-slate-400 text-[11px] self-center">
                      Nenhuma palavra-chave adicionada ainda.
                    </span>
                  ) : (
                    formKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg font-bold text-[11px] flex items-center gap-1.5 shadow-2xs"
                      >
                        "{kw}"
                        <button
                          type="button"
                          onClick={() => setFormKeywords(formKeywords.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Tags To Add Input */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Tags para Aplicar ao Contato *</span>
                  <span className="text-[11px] text-slate-400 font-normal">Adicionadas automaticamente ao CRM</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagToAddInput}
                    onChange={(e) => setTagToAddInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTagToAdd();
                      }
                    }}
                    placeholder="Digite uma tag (ex: Lead Quente) e tecle Enter..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTagToAdd()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors cursor-pointer shrink-0"
                  >
                    Adicionar Tag
                  </button>
                </div>

                {/* Quick suggestions from existing CRM tags */}
                {existingCrmTags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold">Sugestões do CRM:</span>
                    {existingCrmTags.slice(0, 6).map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddTagToAdd(t)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[10px] font-semibold border border-slate-200 transition-colors cursor-pointer"
                      >
                        +{t}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tags to Add Chips */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  {formTagsToAdd.length === 0 ? (
                    <span className="text-slate-400 text-[11px] self-center">
                      Nenhuma tag de aplicação selecionada.
                    </span>
                  ) : (
                    formTagsToAdd.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg font-black text-[11px] flex items-center gap-1.5 shadow-2xs"
                      >
                        +{t}
                        <button
                          type="button"
                          onClick={() => setFormTagsToAdd(formTagsToAdd.filter((_, i) => i !== idx))}
                          className="text-emerald-600 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Tags To Remove (Optional Cleanup) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Tags Conflitantes para Remover (Opcional)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Ex: remover "Lead Frio" ao marcar "Lead Quente"</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagToRemoveInput}
                    onChange={(e) => setTagToRemoveInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTagToRemove();
                      }
                    }}
                    placeholder="Digite uma tag para remover (ex: Lead Frio)..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTagToRemove()}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                  >
                    Adicionar Remoção
                  </button>
                </div>

                {formTagsToRemove.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-rose-50/50 border border-rose-100 rounded-xl">
                    {formTagsToRemove.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-rose-300 text-rose-800 rounded-lg font-bold text-[11px] flex items-center gap-1.5 shadow-2xs"
                      >
                        -{t}
                        <button
                          type="button"
                          onClick={() => setFormTagsToRemove(formTagsToRemove.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Regra de Auto-Tagging</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
