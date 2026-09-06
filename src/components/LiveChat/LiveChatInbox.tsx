import React, { useState, useEffect, useRef } from 'react';
import { 
  Inbox, 
  Search, 
  Send, 
  Instagram, 
  Facebook, 
  Bot, 
  UserCheck, 
  PauseCircle, 
  PlayCircle, 
  Tag, 
  Plus, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Sparkles, 
  Zap, 
  MoreVertical, 
  Paperclip, 
  Smile,
  StickyNote,
  Mic,
  MicOff,
  Square,
  X,
  AlertCircle,
  Volume2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { LiveConversation, ChatMessage, Contact, Flow } from '../../types';
import { ContactNotes } from '../ContactsCRM/ContactNotes';
import { getConversationUnresponsiveDetails } from '../../utils/inactivityHelper';
import { 
  loadAutoTaggingRules, 
  saveAutoTaggingRules, 
  loadAutoTaggingLogs, 
  saveAutoTaggingLogs, 
  evaluateMessageAutoTagging, 
  applyAutoTaggingToContact 
} from '../../utils/autoTaggingHelper';

interface LiveChatInboxProps {
  conversations: LiveConversation[];
  flows: Flow[];
  onUpdateConversations: (conversations: LiveConversation[]) => void;
  contacts?: Contact[];
  onUpdateContacts?: (contacts: Contact[]) => void;
}

export const LiveChatInbox: React.FC<LiveChatInboxProps> = ({
  conversations,
  flows,
  onUpdateConversations,
  contacts,
  onUpdateContacts
}) => {
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id || '');
  const [filterTab, setFilterTab] = useState<'all' | 'open' | 'human_takeover' | 'followup' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [autoTagNotification, setAutoTagNotification] = useState<{
    keyword: string;
    tags: string[];
    ruleNames: string[];
  } | null>(null);

  // Web Speech API states for voice-to-text audio responses
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const preVoiceInputRef = useRef<string>('');

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0];

  // Clean up speech recognition and timers on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const stopListening = () => {
    setIsListening(false);
    setInterimTranscript('');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const handleToggleVoiceRecording = () => {
    if (isListening) {
      stopListening();
      return;
    }

    // Check Web Speech API browser support
    const SpeechRecognitionClass = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechError('Seu navegador não possui suporte à API Web Speech. Experimente usar o Google Chrome, Microsoft Edge ou Safari mais recente.');
      return;
    }

    try {
      preVoiceInputRef.current = inputText;
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let finalTranscripts = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscripts += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        setInterimTranscript(interim);

        if (finalTranscripts) {
          setInputText((prev) => {
            const base = prev.trim();
            const addition = finalTranscripts.trim();
            return base ? `${base} ${addition}` : addition;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Web Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Permissão para uso do microfone foi negada pelo navegador. Autorize o microfone para gravar respostas.');
        } else if (event.error === 'no-speech') {
          // Normal pause in speech, keep session alive
        } else if (event.error === 'audio-capture') {
          setSpeechError('Nenhum microfone foi detectado no sistema.');
        } else {
          setSpeechError(`Erro no reconhecimento de voz (${event.error}).`);
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      setSpeechError('Falha ao iniciar captura de voz: ' + (err?.message || 'erro desconhecido'));
      stopListening();
    }
  };

  const handleCancelVoiceRecording = () => {
    stopListening();
    // Restore previous text prior to this voice recording session
    setInputText(preVoiceInputRef.current);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeConv) return;

    const newMsg: ChatMessage = {
      id: `msg_agent_${Date.now()}`,
      sender: 'agent',
      channel: activeConv.channel,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    const updated = conversations.map((c) => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: {
            text: inputText.trim(),
            timestamp: newMsg.timestamp,
            sender: 'agent'
          }
        };
      }
      return c;
    });

    onUpdateConversations(updated);
    setInputText('');
  };

  const handleToggleBot = () => {
    if (!activeConv) return;
    const updated = conversations.map((c) => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          isBotActive: !c.isBotActive,
          status: !c.isBotActive ? ('open' as const) : ('human_takeover' as const)
        };
      }
      return c;
    });
    onUpdateConversations(updated);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim() || !activeConv) return;
    const newTags = Array.from(new Set([...activeConv.contact.tags, newTagInput.trim()]));
    const updated = conversations.map((c) => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          contact: {
            ...c.contact,
            tags: newTags
          }
        };
      }
      return c;
    });
    onUpdateConversations(updated);
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeConv) return;
    const newTags = activeConv.contact.tags.filter((t) => t !== tagToRemove);
    const updated = conversations.map((c) => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          contact: {
            ...c.contact,
            tags: newTags
          }
        };
      }
      return c;
    });
    onUpdateConversations(updated);
  };

  const handleTriggerFlow = (flowId: string) => {
    const targetFlow = flows.find((f) => f.id === flowId);
    if (!targetFlow || !activeConv) return;

    const firstMsgNode = targetFlow.nodes.find((n) => n.type === 'message');
    const flowText = firstMsgNode?.data.text?.replace(/{first_name}/g, activeConv.contact.name.split(' ')[0]) ||
      `Fluxo "${targetFlow.title}" iniciado com sucesso.`;

    const newMsg: ChatMessage = {
      id: `msg_bot_${Date.now()}`,
      sender: 'bot',
      channel: activeConv.channel,
      text: flowText,
      timestamp: 'Agora',
      buttons: firstMsgNode?.data.buttons
    };

    const updated = conversations.map((c) => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: {
            text: flowText,
            timestamp: 'Agora',
            sender: 'bot'
          }
        };
      }
      return c;
    });
    onUpdateConversations(updated);
  };

  // Simulates receiving an incoming message from the client, triggering Auto-Tagging detection
  const handleSimulateCustomerMessage = (text: string) => {
    if (!text.trim() || !activeConv) return;
    const cleanText = text.trim();

    const newMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      channel: activeConv.channel,
      text: cleanText,
      timestamp: 'Agora'
    };

    // Evaluate Auto-Tagging rules
    const rules = loadAutoTaggingRules();
    const evaluation = evaluateMessageAutoTagging(cleanText, activeConv.channel, rules);

    let updatedContact = activeConv.contact;

    if (evaluation.matchedRules.length > 0) {
      const result = applyAutoTaggingToContact(
        activeConv.contact,
        {
          tagsToAdd: evaluation.tagsToAdd,
          tagsToRemove: evaluation.tagsToRemove
        },
        evaluation.matchedRules.map((r) => r.name)
      );

      if (result.changed) {
        updatedContact = result.updatedContact;

        // Record execution log
        const newLog = {
          id: `log_${Date.now()}`,
          ruleId: evaluation.matchedRules[0]?.id || 'rule_chat',
          ruleName: evaluation.matchedRules.map((r) => r.name).join(', '),
          contactId: activeConv.contact.id,
          contactName: activeConv.contact.name,
          contactUsername: activeConv.contact.username,
          channel: activeConv.channel,
          matchedKeyword: evaluation.matchedKeywords.join(', '),
          tagsAdded: result.tagsAdded,
          tagsRemoved: result.tagsRemoved,
          messageSnippet: cleanText.slice(0, 100),
          executedAt: new Date().toISOString()
        };
        const currentLogs = loadAutoTaggingLogs();
        saveAutoTaggingLogs([newLog, ...currentLogs]);

        // Increment rules triggers
        const updatedRules = rules.map((r) => {
          if (evaluation.matchedRules.some((m) => m.id === r.id)) {
            return {
              ...r,
              timesTriggered: (r.timesTriggered || 0) + 1,
              lastTriggeredAt: new Date().toISOString()
            };
          }
          return r;
        });
        saveAutoTaggingRules(updatedRules);

        // Notify user via toast banner
        setAutoTagNotification({
          keyword: evaluation.matchedKeywords.join(', '),
          tags: result.tagsAdded,
          ruleNames: evaluation.matchedRules.map((r) => r.name)
        });
        setTimeout(() => setAutoTagNotification(null), 7000);

        // Update contacts CRM
        if (onUpdateContacts && contacts) {
          const updatedContactsList = contacts.map((c) =>
            c.id === updatedContact.id ? updatedContact : c
          );
          onUpdateContacts(updatedContactsList);
        }
      }
    }

    const updated = conversations.map((c) => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          contact: updatedContact,
          messages: [...c.messages, newMsg],
          lastMessage: {
            text: cleanText,
            timestamp: 'Agora',
            sender: 'user'
          }
        };
      }
      return c;
    });

    onUpdateConversations(updated);
  };

  // Quick Snippets
  const quickSnippets = [
    "Olá! Como posso te ajudar hoje?",
    "Aqui está o link com 25% de desconto exclusivo: https://metodo-pro.com/checkout",
    "Nosso prazo de entrega é de 3 a 5 dias úteis com frete grátis!",
    "Vou transferir seu atendimento para um de nossos especialistas em vendas."
  ];

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterTab === 'open') return matchesSearch && c.status === 'open';
    if (filterTab === 'human_takeover') return matchesSearch && c.status === 'human_takeover';
    if (filterTab === 'followup') return matchesSearch && getConversationUnresponsiveDetails(c).isUnresponsive48h;
    if (filterTab === 'resolved') return matchesSearch && c.status === 'resolved';
    return matchesSearch;
  });

  const followUpCount = conversations.filter(c => getConversationUnresponsiveDetails(c).isUnresponsive48h).length;
  const activeConvUnresp = activeConv ? getConversationUnresponsiveDetails(activeConv) : null;

  return (
    <div className="flex-1 flex h-full bg-[#F8F9FB] overflow-hidden select-none">
      {/* Column 1: Conversations List */}
      <div className="w-80 border-r border-[#E2E8F0] bg-white flex flex-col shrink-0">
        {/* Search & Tabs */}
        <div className="p-4 border-b border-[#E2E8F0] space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#0084FF]" />
              <span>Inbox Unificado</span>
            </h2>
            <span className="text-xs text-[#64748B] font-medium">
              {conversations.length} conversas
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou @username..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-md font-semibold shrink-0 transition-colors cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-blue-50 text-[#0084FF] border border-blue-200'
                  : 'text-[#64748B] hover:text-[#1A1D21] hover:bg-gray-50'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterTab('open')}
              className={`px-2.5 py-1 rounded-md font-semibold shrink-0 transition-colors cursor-pointer ${
                filterTab === 'open'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-[#64748B] hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              Abertas
            </button>
            <button
              onClick={() => setFilterTab('followup')}
              className={`px-2.5 py-1 rounded-md font-semibold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                filterTab === 'followup'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                  : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50 border border-amber-200/70'
              }`}
              title="Contatos sem resposta há mais de 48 horas"
            >
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Follow-up</span>
              {followUpCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-200 text-amber-900">
                  {followUpCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterTab('human_takeover')}
              className={`px-2.5 py-1 rounded-md font-semibold shrink-0 transition-colors cursor-pointer ${
                filterTab === 'human_takeover'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'text-[#64748B] hover:text-amber-700 hover:bg-amber-50/50'
              }`}
            >
              Humano
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConv?.id;
            const unrespStatus = getConversationUnresponsiveDetails(conv);

            return (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`p-3.5 flex gap-3 cursor-pointer transition-colors relative ${
                  isSelected 
                    ? 'bg-blue-50/70 border-l-2 border-[#0084FF]' 
                    : unrespStatus.isUnresponsive48h 
                    ? 'bg-amber-50/20 border-l-2 border-amber-400 hover:bg-amber-50/50' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.contact.avatarUrl}
                    alt={conv.contact.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
                  />
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white border border-[#E2E8F0]">
                    {conv.channel === 'instagram' ? (
                      <Instagram className="w-3 h-3 text-pink-600" />
                    ) : (
                      <Facebook className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-[#1A1D21] truncate">
                      {conv.contact.name}
                    </span>
                    <span className="text-[10px] text-[#64748B] shrink-0 ml-1">{conv.lastMessage.timestamp}</span>
                  </div>
                  <span className="text-[11px] text-[#64748B] truncate block mb-1">
                    {conv.contact.username}
                  </span>
                  <p className="text-[11px] text-[#64748B] truncate line-clamp-1 mb-1">
                    {conv.lastMessage.text}
                  </p>

                  {/* Visual Color-coded Badge for Unresponsive Contacts (>48h) */}
                  {unrespStatus.isUnresponsive48h && (
                    <div className="mt-1 flex items-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                          unrespStatus.urgency === 'critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                            : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        }`}
                        title={`Sem resposta há ${unrespStatus.formattedTime}. Recomendado follow-up imediato.`}
                      >
                        <Clock className={`w-3 h-3 shrink-0 ${unrespStatus.urgency === 'critical' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
                        <span>{unrespStatus.badgeLabel}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Column 2: Chat View */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header of Chat */}
          <div className="h-16 px-6 border-b border-[#E2E8F0] bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={activeConv.contact.avatarUrl}
                alt={activeConv.contact.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#1A1D21]">{activeConv.contact.name}</h3>
                  <span className="text-[11px] text-[#64748B]">{activeConv.contact.username}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      activeConv.isBotActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {activeConv.isBotActive ? <Bot className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                    <span>{activeConv.isBotActive ? 'Automação Ativa' : 'Pausado para Humano'}</span>
                  </span>

                  {activeConvUnresp?.isUnresponsive48h && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        activeConvUnresp.urgency === 'critical'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>Follow-up ({activeConvUnresp.formattedTime} s/ resposta)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

              {/* Actions: Pause Bot / Trigger Flow / Simulate Customer */}
            <div className="flex items-center gap-2">
              {/* Simulate Customer message dropdown for testing auto-tagging */}
              <div className="relative group">
                <button
                  id="btn_livechat_simulate_user"
                  type="button"
                  className="py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Simular mensagem do cliente para testar Auto-Tagging por palavra-chave"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Simular Cliente</span>
                </button>
                <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 space-y-1 animate-in fade-in">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                    Disparar Auto-Tagging por Palavra:
                  </span>
                  {[
                    { label: 'Dúvida de Preço', text: 'Olá! Qual o preço do plano e como funciona o desconto?' },
                    { label: 'Suporte Técnico', text: 'Estou com um erro no sistema e preciso de suporte urgente.' },
                    { label: 'Agendamento Demo', text: 'Gostaria de agendar uma reunião de demonstração.' },
                    { label: 'Elogio / Promotor', text: 'Adorei o atendimento, ferramenta maravilhosa!' },
                    { label: 'Risco de Churn', text: 'Quero cancelar minha conta e pedir reembolso.' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSimulateCustomerMessage(item.text)}
                      className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 text-xs transition-colors cursor-pointer flex flex-col"
                    >
                      <span className="font-bold text-[11px] text-indigo-600">{item.label}</span>
                      <span className="text-[11px] text-slate-500 italic truncate">"{item.text}"</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleToggleBot}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeConv.isBotActive
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {activeConv.isBotActive ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                <span>{activeConv.isBotActive ? 'Pausar Robô' : 'Retomar Robô'}</span>
              </button>

              <select
                onChange={(e) => e.target.value && handleTriggerFlow(e.target.value)}
                defaultValue=""
                className="py-1.5 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs font-semibold text-[#0084FF] focus:outline-none cursor-pointer"
              >
                <option value="" disabled>
                  Disparar Fluxo...
                </option>
                {flows.map((f) => (
                  <option key={f.id} value={f.id}>
                    ⚡ {f.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Alert Banner for Follow-up (>48h) */}
          {activeConvUnresp?.isUnresponsive48h && (
            <div className="bg-amber-50/90 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    Lead sem resposta há mais de 48 horas ({activeConvUnresp.formattedTime}):
                  </span>
                  <span className="text-amber-800 dark:text-amber-300 ml-1">
                    Recomendado enviar uma mensagem de follow-up para reengajar antes que o lead esfrie.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const firstName = activeConv.contact.name.split(' ')[0];
                    setInputText(`Olá ${firstName}! Tudo bem? Passando para checar se você conseguiu ver minha última mensagem ou se ficou com alguma dúvida. Posso te ajudar?`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Inserir Mensagem de Follow-up</span>
                </button>
              </div>
            </div>
          )}

          {/* Auto-Tagging Triggered Toast Banner */}
          {autoTagNotification && (
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-b border-indigo-200 px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xs text-indigo-900">
                  <span className="font-bold">⚡ Auto-Tagging disparado: </span>
                  <span>Palavra-chave detectada: <strong>"{autoTagNotification.keyword}"</strong></span>
                  <span className="mx-1 text-slate-400">|</span>
                  <span className="text-indigo-800">Novas tags aplicadas ao contato: </span>
                  <span className="inline-flex gap-1 ml-1 flex-wrap">
                    {autoTagNotification.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-indigo-200/80 text-indigo-950 font-black text-[10px] border border-indigo-300"
                      >
                        +{t}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAutoTagNotification(null)}
                className="p-1 text-indigo-400 hover:text-indigo-700 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9FB]">
            {activeConv.messages.map((m) => {
              const isUser = m.sender === 'user';
              const isAgent = m.sender === 'agent';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                >
                  <span className="text-[10px] text-[#64748B] mb-1 px-1">
                    {isUser ? activeConv.contact.name : isAgent ? 'Você (Atendente)' : 'Robô ManyFlow'} • {m.timestamp}
                  </span>
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-white text-[#1A1D21] rounded-tl-xs border border-[#E2E8F0] shadow-xs'
                        : isAgent
                        ? 'bg-[#0084FF] text-white rounded-tr-xs shadow-xs'
                        : 'bg-purple-50 text-purple-950 border border-purple-200 rounded-tr-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Snippets Bar */}
          <div className="px-6 py-2 bg-white border-t border-[#E2E8F0] flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-[#64748B] shrink-0">Respostas Rápidas:</span>
            {quickSnippets.map((snippet, i) => (
              <button
                key={i}
                onClick={() => setInputText(snippet)}
                className="px-2.5 py-1 rounded-md bg-[#F8F9FB] hover:bg-gray-100 border border-[#E2E8F0] text-[11px] text-[#1A1D21] truncate max-w-[220px] transition-colors shrink-0 cursor-pointer"
              >
                {snippet}
              </button>
            ))}
          </div>

          {/* Speech Error Banner */}
          {speechError && (
            <div className="px-6 py-2.5 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-800 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{speechError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                className="p-1 text-rose-600 hover:text-rose-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Voice Recording Bar (Web Speech API) */}
          {isListening && (
            <div className="px-6 py-3 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border-t border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in slide-in-from-bottom duration-200 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75" />
                  <div className="relative w-3 h-3 rounded-full bg-rose-600" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-rose-600" />
                      Gravando voz com transcrição automática
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900 font-mono text-[11px] font-bold">
                      {formatRecordingTime(recordingSeconds)}
                    </span>
                  </div>

                  <p className="text-[11px] text-rose-700 italic truncate max-w-md">
                    {interimTranscript ? `"${interimTranscript}..."` : 'Fale claramente ao microfone. O texto será transcrito no campo abaixo...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Audio Wave Visualizer Bars */}
                <div className="flex items-center gap-0.5 h-4 px-2">
                  <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.8s_infinite_100ms] h-3" />
                  <span className="w-1 bg-pink-500 rounded-full animate-[bounce_0.8s_infinite_200ms] h-4" />
                  <span className="w-1 bg-rose-600 rounded-full animate-[bounce_0.8s_infinite_300ms] h-2" />
                  <span className="w-1 bg-purple-500 rounded-full animate-[bounce_0.8s_infinite_150ms] h-3.5" />
                  <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite_250ms] h-2" />
                </div>

                <button
                  type="button"
                  onClick={stopListening}
                  className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                  title="Concluir gravação e manter texto transcrito"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Concluir</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelVoiceRecording}
                  className="py-1 px-2 rounded-lg bg-white hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  title="Cancelar e descartar gravação atual"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Descartar</span>
                </button>
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-[#E2E8F0] flex items-center gap-2">
            <input
              id="input_live_chat_message"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? "Transcrevendo fala em tempo real..." : `Responder no ${activeConv.channel === 'instagram' ? 'Instagram Direct' : 'Facebook Messenger'}...`}
              className={`flex-1 px-4 py-2 rounded-lg border text-xs text-[#1A1D21] focus:outline-none transition-all ${
                isListening 
                  ? 'bg-rose-50/40 border-rose-300 ring-2 ring-rose-200/50' 
                  : 'bg-[#F8F9FB] border-[#E2E8F0] focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]'
              }`}
            />

            {/* Web Speech API Microphone Dictation Button */}
            <button
              id="btn_livechat_voice_mic"
              type="button"
              onClick={handleToggleVoiceRecording}
              className={`p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                isListening
                  ? 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-400/50 animate-pulse'
                  : 'bg-white hover:bg-blue-50 border border-[#E2E8F0] hover:border-blue-300 text-[#64748B] hover:text-[#0084FF]'
              }`}
              title={isListening ? 'Parar gravação de voz (Web Speech API)' : 'Gravar resposta em áudio e converter para texto (Web Speech API)'}
            >
              {isListening ? (
                <Square className="w-4 h-4 fill-white" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <button
              id="btn_livechat_send_message"
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="py-2 px-4 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[#64748B] text-xs">
          Selecione uma conversa para visualizar
        </div>
      )}

      {/* Column 3: Contact CRM Profile Drawer */}
      {activeConv && (
        <div className="w-72 border-l border-[#E2E8F0] bg-[#F8F9FB] p-5 space-y-5 overflow-y-auto hidden xl:block shrink-0">
          <div className="text-center space-y-2">
            <img
              src={activeConv.contact.avatarUrl}
              alt={activeConv.contact.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-[#0084FF]"
            />
            <div>
              <h4 className="text-sm font-bold text-[#1A1D21]">{activeConv.contact.name}</h4>
              <p className="text-xs text-[#64748B]">{activeConv.contact.username}</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Dados de Contato
              </span>
              {activeConv.contact.phone && (
                <div className="flex items-center gap-2 text-[#1A1D21]">
                  <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{activeConv.contact.phone}</span>
                </div>
              )}
              {activeConv.contact.email && (
                <div className="flex items-center gap-2 text-[#1A1D21]">
                  <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{activeConv.contact.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags Manager */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
                Tags do Lead ({activeConv.contact.tags.length})
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                Auto-Tagging Ativo
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeConv.contact.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-rose-600 ml-1 cursor-pointer">
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Nova tag..."
                className="flex-1 px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] text-xs text-[#1A1D21]"
              />
              <button
                onClick={handleAddTag}
                className="px-2.5 py-1 bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold rounded-md cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider block">
              Campos Personalizados
            </span>
            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2 text-xs">
              {Object.entries(activeConv.contact.customFields).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-[#64748B] font-mono">{key}:</span>
                  <span className="text-[#0084FF] font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Notes Section */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <ContactNotes
              contact={activeConv.contact}
              onUpdateContact={(updatedContact) => {
                const updated = conversations.map((c) =>
                  c.id === activeConv.id ? { ...c, contact: updatedContact } : c
                );
                onUpdateConversations(updated);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
