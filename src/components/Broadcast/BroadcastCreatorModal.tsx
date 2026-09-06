import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Calendar, 
  Clock, 
  Users, 
  Tag, 
  Sparkles, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Instagram, 
  Facebook, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Smartphone, 
  Variable, 
  Search, 
  Eye, 
  Layers,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  HelpCircle,
  Wand2,
  Check,
  Radio,
  FileText,
  AlertTriangle,
  Info,
  Zap,
  Terminal,
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  BroadcastCampaign, 
  BroadcastTargetFilter, 
  Contact, 
  CustomFieldDefinition, 
  FlowButton, 
  QuickReply, 
  BroadcastType, 
  UtilityMessageTemplate 
} from '../../types';

interface BroadcastCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCampaign: (campaign: BroadcastCampaign, sendImmediately: boolean) => void;
  contacts: Contact[];
  customFields?: CustomFieldDefinition[];
  utilityTemplates?: UtilityMessageTemplate[];
  initialUtilityTemplate?: UtilityMessageTemplate | null;
}

export const BroadcastCreatorModal: React.FC<BroadcastCreatorModalProps> = ({
  isOpen,
  onClose,
  onSaveCampaign,
  contacts,
  customFields = [],
  utilityTemplates = [],
  initialUtilityTemplate = null
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Broadcast Type State
  const [broadcastType, setBroadcastType] = useState<BroadcastType>(
    initialUtilityTemplate ? 'utility' : 'standard'
  );

  // Utility Template Selection
  const [selectedUtilityTemplateId, setSelectedUtilityTemplateId] = useState<string>(
    initialUtilityTemplate?.id || (utilityTemplates.find(t => t.status === 'APPROVED')?.id || utilityTemplates[0]?.id || '')
  );

  // Form State
  const [name, setName] = useState(
    initialUtilityTemplate 
      ? `Disparo: ${initialUtilityTemplate.displayName}` 
      : '🔥 Promoção Especial Direct'
  );
  const [channel, setChannel] = useState<'instagram' | 'messenger' | 'omnichannel' | 'sms'>(
    (initialUtilityTemplate?.channel as any) || 'instagram'
  );
  const [metaMessageTag, setMetaMessageTag] = useState<'MARKETING_OPT_IN' | 'CONFIRMED_EVENT_UPDATE' | 'POST_PURCHASE_UPDATE' | 'ACCOUNT_UPDATE'>(
    'MARKETING_OPT_IN'
  );
  const [throttleSpeed, setThrottleSpeed] = useState<'fast' | 'safe' | 'medium'>('safe');
  const [useGuzzleBatch, setUseGuzzleBatch] = useState(true);
  const [batchSize, setBatchSize] = useState(50);
  const [concurrency, setConcurrency] = useState(5);

  // Segmentation State
  const [tagMode, setTagMode] = useState<'any' | 'all' | 'none'>('any');
  const [selectedTags, setSelectedTags] = useState<string[]>(['VIP']);
  const [customFieldKey, setCustomFieldKey] = useState<string>('');
  const [customFieldOperator, setCustomFieldOperator] = useState<'equals' | 'contains' | 'exists' | 'not_exists'>('equals');
  const [customFieldValue, setCustomFieldValue] = useState<string>('');
  const [contactStatus, setContactStatus] = useState<'all' | 'active' | 'bot_paused'>('active');

  // Message Content State for Standard
  const [messageText, setMessageText] = useState(
    'Olá {first_name}! 🌟 Temos uma novidade incrível para você que ama {preferencia}.\n\nLiberamos o cupom exclusivo *{cupom}* com frete grátis para {cidade}!\n\nToque no botão abaixo para garantir sua oferta antes que acabe:'
  );
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80');
  const [buttons, setButtons] = useState<FlowButton[]>([
    {
      id: 'btn_1',
      text: '🛍️ Resgatar Oferta Agora',
      type: 'url',
      value: 'https://manyflow.io/oferta-vip'
    }
  ]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([
    { id: 'qr_1', text: 'Ver Catálogo 👗' },
    { id: 'qr_2', text: 'Tirar Dúvida ❓' }
  ]);

  // Utility Variable Mappings State
  const [variableMappings, setVariableMappings] = useState<Record<string, string>>({
    '1': '{first_name}',
    '2': '{ultimo_pedido}',
    '3': '{cidade}',
    '4': 'BR88391209X'
  });

  // Current active utility template object
  const activeUtilityTemplate = utilityTemplates.find(t => t.id === selectedUtilityTemplateId) || utilityTemplates[0];

  // Sync when activeUtilityTemplate changes
  useEffect(() => {
    if (broadcastType === 'utility' && activeUtilityTemplate) {
      setName(`Disparo: ${activeUtilityTemplate.displayName}`);
      setChannel(activeUtilityTemplate.channel);
      if (activeUtilityTemplate.buttons && activeUtilityTemplate.buttons.length > 0) {
        setButtons(activeUtilityTemplate.buttons);
      }
    }
  }, [selectedUtilityTemplateId, broadcastType]);

  // Schedule State
  const [sendOption, setSendOption] = useState<'now' | 'schedule' | 'draft'>('now');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [scheduledTime, setScheduledTime] = useState('19:30');
  const [schedulePreset, setSchedulePreset] = useState<string>('custom');

  // Quick preset helper
  const applySchedulePreset = (type: 'in_15m' | 'today_20h' | 'tomorrow_9h' | 'tomorrow_19h30') => {
    const now = new Date();
    if (type === 'in_15m') {
      now.setMinutes(now.getMinutes() + 15);
      setScheduledDate(now.toISOString().slice(0, 10));
      setScheduledTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setSchedulePreset('in_15m');
    } else if (type === 'today_20h') {
      setScheduledDate(now.toISOString().slice(0, 10));
      setScheduledTime('20:00');
      setSchedulePreset('today_20h');
    } else if (type === 'tomorrow_9h') {
      now.setDate(now.getDate() + 1);
      setScheduledDate(now.toISOString().slice(0, 10));
      setScheduledTime('09:00');
      setSchedulePreset('tomorrow_9h');
    } else if (type === 'tomorrow_19h30') {
      now.setDate(now.getDate() + 1);
      setScheduledDate(now.toISOString().slice(0, 10));
      setScheduledTime('19:30');
      setSchedulePreset('tomorrow_19h30');
    }
  };

  const getFormattedSchedulePreview = () => {
    try {
      const d = new Date(`${scheduledDate}T${scheduledTime}:00`);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return `${scheduledDate} às ${scheduledTime}`;
    }
    return `${scheduledDate} às ${scheduledTime}`;
  };

  // AI Generator in Modal State
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [aiObjective, setAiObjective] = useState<'promo' | 'event' | 'launch' | 'reengage'>('promo');
  const [variableCategory, setVariableCategory] = useState<'all' | 'custom' | 'standard'>('all');
  const [variableSearch, setVariableSearch] = useState('');

  // Collect all unique tags in CRM
  const allAvailableTags = Array.from(
    new Set(contacts.flatMap((c) => c.tags || []))
  );

  // Filter contacts in real time
  const matchingContacts = contacts.filter((c) => {
    // Channel check
    if (channel !== 'omnichannel' && c.channel !== channel) {
      return false;
    }

    // Status check
    if (contactStatus === 'active' && c.status === 'bot_paused') return false;
    if (contactStatus === 'bot_paused' && c.status !== 'bot_paused') return false;

    // Tags check
    if (selectedTags.length > 0) {
      const contactTags = c.tags || [];
      if (tagMode === 'any') {
        const hasAny = selectedTags.some((t) => contactTags.includes(t));
        if (!hasAny) return false;
      } else if (tagMode === 'all') {
        const hasAll = selectedTags.every((t) => contactTags.includes(t));
        if (!hasAll) return false;
      } else if (tagMode === 'none') {
        const hasNone = !selectedTags.some((t) => contactTags.includes(t));
        if (!hasNone) return false;
      }
    }

    // Custom field check
    if (customFieldKey) {
      const val = c.custom_fields?.[customFieldKey];
      if (customFieldOperator === 'exists' && (val === undefined || val === null || val === '')) return false;
      if (customFieldOperator === 'not_exists' && val !== undefined && val !== null && val !== '') return false;
      if (customFieldOperator === 'equals' && String(val).toLowerCase() !== customFieldValue.toLowerCase()) return false;
      if (customFieldOperator === 'contains' && !String(val || '').toLowerCase().includes(customFieldValue.toLowerCase())) return false;
    }

    return true;
  });

  // Selected sample contact for preview
  const sampleContact = matchingContacts[0] || contacts[0] || {
    id: 'demo_1',
    name: 'Camila Silveira',
    username: '@camilasilveira',
    channel: 'instagram',
    tags: ['VIP', 'Moda Feminina'],
    custom_fields: {
      cidade: 'São Paulo',
      preferencia: 'Vestidos de Seda',
      cupom: 'VIP20',
      ultimo_pedido: 'PED-98421'
    }
  };

  // Variable replacement in preview
  const renderPreviewText = () => {
    if (broadcastType === 'utility' && activeUtilityTemplate) {
      let rendered = activeUtilityTemplate.bodyText;
      activeUtilityTemplate.variables.forEach((v) => {
        const mapVal = variableMappings[v.key] || v.sampleValue || `{${v.key}}`;
        let replacedVal = mapVal;
        
        // Replace {first_name} etc if mapping points to standard variables
        if (mapVal.includes('{first_name}')) {
          replacedVal = replacedVal.replace('{first_name}', sampleContact.name.split(' ')[0] || 'Cliente');
        }
        if (mapVal.includes('{cidade}')) {
          replacedVal = replacedVal.replace('{cidade}', String(sampleContact.custom_fields?.cidade || 'sua cidade'));
        }
        if (mapVal.includes('{cupom}')) {
          replacedVal = replacedVal.replace('{cupom}', String(sampleContact.custom_fields?.cupom || 'PROMO10'));
        }
        if (mapVal.includes('{ultimo_pedido}')) {
          replacedVal = replacedVal.replace('{ultimo_pedido}', String(sampleContact.custom_fields?.ultimo_pedido || 'PED-8812'));
        }
        
        const placeholder = new RegExp(`\\{\\{${v.key}\\}\\}`, 'g');
        rendered = rendered.replace(placeholder, replacedVal);
      });
      return rendered;
    }

    let text = messageText;
    text = text.replace(/{first_name}/g, sampleContact.name.split(' ')[0] || 'Cliente');
    text = text.replace(/{cidade}/g, String(sampleContact.custom_fields?.cidade || 'sua cidade'));
    text = text.replace(/{preferencia}/g, String(sampleContact.custom_fields?.preferencia || 'nossas ofertas'));
    text = text.replace(/{cupom}/g, String(sampleContact.custom_fields?.cupom || 'PROMO10'));
    return text;
  };

  // Insert Variable in message text
  const handleInsertVariable = (varCode: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = messageText;
      const newText = text.substring(0, start) + varCode + text.substring(end);
      setMessageText(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + varCode.length, start + varCode.length);
        }
      }, 0);
    } else {
      setMessageText((prev) => prev + ' ' + varCode);
    }
  };

  // AI Copy Generation
  const handleGenerateAICopy = () => {
    setIsGeneratingCopy(true);
    setTimeout(() => {
      if (aiObjective === 'promo') {
        setMessageText(
          '🔥 Fala {first_name}, tudo bem? Preparamos uma condição exclusiva para quem ama {preferencia}!\n\nUse o cupom *{cupom}* e garanta 25% OFF com frete grátis para {cidade}.\n\nVálido apenas para os 30 primeiros que clicarem abaixo:'
        );
      } else if (aiObjective === 'event') {
        setMessageText(
          '🚨 {first_name}, nosso evento ao vivo começa em 15 minutos!\n\nToque no botão abaixo para entrar na sala exclusiva e não perder o lançamento especial:'
        );
      } else if (aiObjective === 'launch') {
        setMessageText(
          '✨ O momento chegou, {first_name}! A nova coleção já está no ar com peças exclusivas pensadas para você que busca {preferencia}.\n\nConfira em primeira mão no Direct:'
        );
      } else {
        setMessageText(
          '👋 Oi {first_name}! Sentimos sua falta por aqui. Preparamos um presente especial para sua próxima visita em {cidade}!\n\nToque abaixo para ver seu cupom de boas-vindas:'
        );
      }
      setIsGeneratingCopy(false);
    }, 700);
  };

  // Save / Dispatch Campaign
  const handleFinalSubmit = () => {
    const isImmediate = sendOption === 'now';
    const isDraft = sendOption === 'draft';

    const finalMessageText = broadcastType === 'utility' && activeUtilityTemplate 
      ? activeUtilityTemplate.bodyText 
      : messageText;

    const newCampaign: BroadcastCampaign = {
      id: `bc_${Date.now()}`,
      name,
      channel,
      broadcastType,
      utilityTemplateId: broadcastType === 'utility' ? activeUtilityTemplate?.id : undefined,
      metaApprovalStatus: broadcastType === 'utility' ? (activeUtilityTemplate?.status || 'APPROVED') : undefined,
      variableMappings: broadcastType === 'utility' ? variableMappings : undefined,
      status: isDraft ? 'draft' : isImmediate ? 'completed' : 'scheduled',
      messageText: finalMessageText,
      mediaUrl: mediaUrl.trim() || undefined,
      mediaType: mediaUrl.trim() ? 'image' : 'text',
      buttons: broadcastType === 'utility' ? (activeUtilityTemplate?.buttons || buttons) : buttons,
      quickReplies: broadcastType === 'utility' ? [] : quickReplies,
      metaMessageTag: broadcastType === 'utility' ? 'POST_PURCHASE_UPDATE' : metaMessageTag,
      targetFilter: {
        channel: channel === 'omnichannel' ? 'all' : channel,
        tagMode,
        tags: selectedTags,
        customFieldKey: customFieldKey || undefined,
        customFieldOperator: customFieldKey ? customFieldOperator : undefined,
        customFieldValue: customFieldKey ? customFieldValue : undefined,
        contactStatus
      },
      scheduledFor: !isImmediate && !isDraft 
        ? (() => {
            try {
              const d = new Date(`${scheduledDate}T${scheduledTime}:00`);
              return !isNaN(d.getTime()) ? d.toISOString() : `${scheduledDate}T${scheduledTime}:00Z`;
            } catch {
              return `${scheduledDate}T${scheduledTime}:00Z`;
            }
          })()
        : undefined,
      createdAt: new Date().toISOString(),
      sentAt: isImmediate ? new Date().toISOString() : undefined,
      totalTargeted: matchingContacts.length,
      totalSent: isImmediate ? matchingContacts.length : 0,
      totalDelivered: isImmediate ? Math.max(1, Math.floor(matchingContacts.length * 0.98)) : 0,
      totalOpened: isImmediate ? Math.floor(matchingContacts.length * 0.82) : 0,
      totalClicked: isImmediate ? Math.floor(matchingContacts.length * 0.38) : 0,
      totalFailed: 0,
      progressPercent: isImmediate ? 100 : 0,
      throttleSpeed,
      batchConfig: useGuzzleBatch ? {
        batchSize,
        concurrency,
        engine: 'guzzle_batch',
        includeGuzzleScript: true
      } : undefined,
      recipients: matchingContacts.map((c) => ({
        contactId: c.id,
        contactName: c.name,
        username: c.username,
        channel: c.channel,
        status: isImmediate ? 'delivered' : 'pending',
        deliveredAt: isImmediate ? 'Agora' : undefined
      }))
    };

    if (isImmediate) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    onSaveCampaign(newCampaign, isImmediate);
    onClose();
  };

  return (
    <div 
      id="broadcast_creator_modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-5xl bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-xs ${
              broadcastType === 'utility' ? 'bg-purple-700' : 'bg-[#0084FF]'
            }`}>
              {broadcastType === 'utility' ? <ShieldCheck className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#1A1D21]">
                  Criar Transmissão em Massa
                </h2>
                {broadcastType === 'utility' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Modelo Utilitário Meta
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B]">
                Envie campanhas segmentadas com entrega em tempo real, segurança e suporte a modelos aprovados.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Header */}
        <div className="grid grid-cols-4 border-b border-[#E2E8F0] bg-white text-xs font-semibold select-none">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-3 px-2 text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              step === 1
                ? 'border-[#0084FF] text-[#0084FF] bg-blue-50/40 font-bold'
                : step > 1
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-[#64748B]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step > 1 ? 'bg-emerald-500 text-white' : step === 1 ? 'bg-[#0084FF] text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {step > 1 ? '✓' : '1'}
            </span>
            <span className="hidden sm:inline">1. Tipo & Canal</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-3 px-2 text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              step === 2
                ? 'border-[#0084FF] text-[#0084FF] bg-blue-50/40 font-bold'
                : step > 2
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-[#64748B]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step > 2 ? 'bg-emerald-500 text-white' : step === 2 ? 'bg-[#0084FF] text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {step > 2 ? '✓' : '2'}
            </span>
            <span className="hidden sm:inline">2. Segmentação ({matchingContacts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(3)}
            className={`py-3 px-2 text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              step === 3
                ? 'border-[#0084FF] text-[#0084FF] bg-blue-50/40 font-bold'
                : step > 3
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-[#64748B]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step > 3 ? 'bg-emerald-500 text-white' : step === 3 ? 'bg-[#0084FF] text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {step > 3 ? '✓' : '3'}
            </span>
            <span className="hidden sm:inline">
              {broadcastType === 'utility' ? '3. Modelo & Parâmetros' : '3. Mensagem & IA'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStep(4)}
            className={`py-3 px-2 text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              step === 4
                ? 'border-[#0084FF] text-[#0084FF] bg-blue-50/40 font-bold'
                : 'border-transparent text-[#64748B]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 4 ? 'bg-[#0084FF] text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              4
            </span>
            <span className="hidden sm:inline">4. Envio & Agendamento</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: TIPO & CANAL */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Broadcast Type Picker */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] uppercase tracking-wider mb-2">
                  Selecione a Modalidade da Transmissão
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setBroadcastType('standard')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      broadcastType === 'standard'
                        ? 'border-[#0084FF] bg-blue-50/50 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Radio className="w-5 h-5 text-[#0084FF]" />
                        <span className="font-bold text-sm text-[#1A1D21]">Transmissão Padrão</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Janela 24h
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Mensagem de texto livre, imagem e botões interativos para contatos que interagiram recentemente ou deram aceite promocional.
                    </p>
                  </div>

                  <div
                    onClick={() => setBroadcastType('utility')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      broadcastType === 'utility'
                        ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-purple-700" />
                        <span className="font-bold text-sm text-[#1A1D21]">Transmissão de Utilidade (Utility)</span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Aprovada pela Meta
                      </span>
                    </div>
                    <p className="text-xs text-purple-950/80 leading-relaxed">
                      <b>Aquele que precisa aprovar!</b> Modelos pré-validados pela Meta (Rastreio, Agendamentos, Faturas, OTP) para envio garantido mesmo fora da janela de 24h.
                    </p>
                  </div>
                </div>
              </div>

              {/* Utility Template Selector if utility chosen */}
              {broadcastType === 'utility' && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>Escolha o Modelo Aprovado pela Meta:</span>
                    </label>
                    <span className="text-[11px] text-purple-700 font-semibold">
                      {utilityTemplates.filter(t => t.status === 'APPROVED').length} modelos aprovados disponíveis
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {utilityTemplates.map((tpl) => {
                      const isApproved = tpl.status === 'APPROVED';
                      const isSelected = selectedUtilityTemplateId === tpl.id;

                      return (
                        <div
                          key={tpl.id}
                          onClick={() => isApproved && setSelectedUtilityTemplateId(tpl.id)}
                          className={`p-3 rounded-xl border transition-all text-xs ${
                            isSelected
                              ? 'border-purple-600 bg-white ring-2 ring-purple-600/30 shadow-xs'
                              : isApproved
                              ? 'border-purple-200 bg-white/80 hover:border-purple-400 cursor-pointer'
                              : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#1A1D21] truncate">
                              {tpl.displayName}
                            </span>
                            {isApproved ? (
                              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Aprovado
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                {tpl.status}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-purple-800 block truncate">
                            {tpl.name}
                          </span>
                          <p className="text-[11px] text-[#64748B] line-clamp-2 mt-1">
                            {tpl.bodyText}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Campaign Name */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] uppercase tracking-wider mb-1.5">
                  Nome Identificador da Campanha
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Atualização de Rastreamento VIP"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-sm text-[#1A1D21] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
                />
              </div>

              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] uppercase tracking-wider mb-2">
                  Canal de Destino dos Disparos
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div
                    onClick={() => setChannel('instagram')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      channel === 'instagram'
                        ? 'border-pink-500 bg-pink-50/50 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <span className="font-bold text-sm text-[#1A1D21]">Instagram Direct</span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Disparo no direct de seguidores e contatos que interagiram no perfil.
                    </p>
                  </div>

                  <div
                    onClick={() => setChannel('messenger')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      channel === 'messenger'
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-sm text-[#1A1D21]">Facebook Messenger</span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Disparo na caixa de entrada dos contatos da sua Página no Facebook.
                    </p>
                  </div>

                  <div
                    onClick={() => setChannel('omnichannel')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      channel === 'omnichannel'
                        ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Layers className="w-5 h-5 text-purple-600" />
                      <span className="font-bold text-sm text-[#1A1D21]">Omnichannel</span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Alcança contatos tanto no Instagram quanto no Messenger simultaneamente.
                    </p>
                  </div>

                  <div
                    onClick={() => setChannel('sms')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      channel === 'sms'
                        ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Smartphone className="w-5 h-5 text-teal-600" />
                      <span className="font-bold text-sm text-[#1A1D21]">SMS Gateway</span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Disparo de SMS via HttpSMS direto do seu aparelho Android GSM.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: SEGMENTAÇÃO */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Audience Counter Banner */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">Público Filtrado para Envio</span>
                    <span className="text-xs text-emerald-800">
                      <b>{matchingContacts.length} contatos</b> atendem a todos os critérios de segmentação.
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                  {Math.round((matchingContacts.length / Math.max(1, contacts.length)) * 100)}% da base ativa
                </span>
              </div>

              {/* Tags Filtering */}
              <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#0084FF]" />
                    <span>Segmentar por Tags do CRM</span>
                  </label>

                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[#64748B] text-[11px] mr-1">Modo:</span>
                    <button
                      type="button"
                      onClick={() => setTagMode('any')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                        tagMode === 'any' ? 'bg-[#0084FF] text-white' : 'bg-gray-100 text-[#64748B]'
                      }`}
                    >
                      Qualquer (OR)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTagMode('all')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                        tagMode === 'all' ? 'bg-[#0084FF] text-white' : 'bg-gray-100 text-[#64748B]'
                      }`}
                    >
                      Todas (AND)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTagMode('none')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                        tagMode === 'none' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-[#64748B]'
                      }`}
                    >
                      Excluir (NOT)
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {allAvailableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTags(selectedTags.filter((t) => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0084FF] text-white shadow-2xs'
                            : 'bg-gray-100 hover:bg-gray-200 text-[#1A1D21]'
                        }`}
                      >
                        <span>#{tag}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                  {allAvailableTags.length === 0 && (
                    <span className="text-xs text-[#64748B]">Nenhuma tag encontrada no CRM.</span>
                  )}
                </div>
              </div>

              {/* Custom Fields Filtering */}
              <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
                <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                  <Variable className="w-4 h-4 text-purple-600" />
                  <span>Filtrar por Campos Customizados (Custom Fields)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Campo:</label>
                    <select
                      value={customFieldKey}
                      onChange={(e) => setCustomFieldKey(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white"
                    >
                      <option value="">Nenhum (Todos os campos)</option>
                      {customFields.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.name} ({f.key})
                        </option>
                      ))}
                      <option value="cidade">Cidade (cidade)</option>
                      <option value="preferencia">Preferencia (preferencia)</option>
                      <option value="cupom">Cupom (cupom)</option>
                      <option value="ultimo_pedido">Último Pedido (ultimo_pedido)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Operador:</label>
                    <select
                      value={customFieldOperator}
                      onChange={(e) => setCustomFieldOperator(e.target.value as any)}
                      disabled={!customFieldKey}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white disabled:opacity-50"
                    >
                      <option value="equals">Igual a (=)</option>
                      <option value="contains">Contém texto</option>
                      <option value="exists">Possui valor preenchido</option>
                      <option value="not_exists">Está vazio / nulo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Valor Comparado:</label>
                    <input
                      type="text"
                      value={customFieldValue}
                      onChange={(e) => setCustomFieldValue(e.target.value)}
                      disabled={!customFieldKey || customFieldOperator === 'exists' || customFieldOperator === 'not_exists'}
                      placeholder="Ex: São Paulo"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MENSAGEM & PARÂMETROS */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Form: 7 cols */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* UTILITY TEMPLATE MAPPING MODE */}
                {broadcastType === 'utility' && activeUtilityTemplate && (
                  <div className="space-y-4">
                    {/* Meta Approval Badge Header */}
                    <div className="p-4 bg-purple-50/90 border border-purple-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-purple-700" />
                          <span className="font-bold text-xs text-purple-950">
                            Modelo Meta Aprovado: {activeUtilityTemplate.displayName}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {activeUtilityTemplate.metaTemplateId}
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-900/80 leading-relaxed">
                        O texto foi auditado e aprovado pela Meta. Você só precisa mapear os parâmetros dinâmicos (<b>{"{{1}}"}</b>, <b>{"{{2}}"}</b>) para os campos do seu CRM ManyFlow.
                      </p>
                    </div>

                    {/* Parameter Mappings Card */}
                    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
                      <h3 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                        <Variable className="w-4 h-4 text-purple-600" /> Mapeamento de Parâmetros Dinâmicos
                      </h3>
                      
                      <div className="space-y-3">
                        {activeUtilityTemplate.variables.map((v) => (
                          <div key={v.key} className="p-3 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-mono font-bold text-xs rounded">
                                {"{{" + v.key + "}}"} {v.description}
                              </span>
                              <span className="text-[10px] text-[#64748B]">
                                Exemplo Meta: "{v.sampleValue}"
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#64748B] w-28 shrink-0">Substituir por:</span>
                              <select
                                value={variableMappings[v.key] || ''}
                                onChange={(e) => setVariableMappings({ ...variableMappings, [v.key]: e.target.value })}
                                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E2E8F0] bg-white font-medium focus:ring-2 focus:ring-purple-600"
                              >
                                <option value="{first_name}">Nome do Contato ({'{first_name}'})</option>
                                <option value="{cidade}">Cidade do Lead ({'{cidade}'})</option>
                                <option value="{ultimo_pedido}">Número do Pedido ({'{ultimo_pedido}'})</option>
                                <option value="{cupom}">Código de Cupom ({'{cupom}'})</option>
                                <option value="{preferencia}">Interesse / Preferência ({'{preferencia}'})</option>
                                <option value={v.sampleValue}>Valor Estático ("{v.sampleValue}")</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STANDARD BROADCAST MODE */}
                {broadcastType === 'standard' && (
                  <div className="space-y-4">
                    {/* AI Generator Helper */}
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-purple-700" />
                          <span>Assistente de Copywriting com IA ManyFlow</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleGenerateAICopy}
                          disabled={isGeneratingCopy}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>{isGeneratingCopy ? 'Escrevendo...' : 'Gerar Copy'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-purple-900 text-[11px] font-semibold">Objetivo:</span>
                        <select
                          value={aiObjective}
                          onChange={(e) => setAiObjective(e.target.value as any)}
                          className="px-2 py-0.5 text-xs rounded border border-purple-200 bg-white font-medium"
                        >
                          <option value="promo">Oferta Relâmpago / Desconto</option>
                          <option value="launch">Lançamento de Produto</option>
                          <option value="event">Lembrete de Evento / Live</option>
                          <option value="reengage">Reengajamento de Inativos</option>
                        </select>
                      </div>
                    </div>

                    {/* Text Message Area */}
                    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
                          Texto da Mensagem
                        </label>
                        <span className="text-[11px] text-[#64748B]">{messageText.length}/1000 caracteres</span>
                      </div>

                      <textarea
                        ref={textareaRef}
                        rows={6}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0084FF] leading-relaxed resize-none font-sans"
                        placeholder="Digite o texto da transmissão..."
                      />

                      {/* Quick Variables Insert Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-[#64748B]">Inserir:</span>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable('{first_name}')}
                          className="px-2 py-0.5 text-[11px] rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-mono cursor-pointer"
                        >
                          {'{first_name}'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable('{cidade}')}
                          className="px-2 py-0.5 text-[11px] rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-mono cursor-pointer"
                        >
                          {'{cidade}'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable('{cupom}')}
                          className="px-2 py-0.5 text-[11px] rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-mono cursor-pointer"
                        >
                          {'{cupom}'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable('{preferencia}')}
                          className="px-2 py-0.5 text-[11px] rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-mono cursor-pointer"
                        >
                          {'{preferencia}'}
                        </button>
                      </div>
                    </div>

                    {/* Media Image URL */}
                    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2">
                      <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#0084FF]" /> Imagem de Destaque (Opcional)
                      </label>
                      <input
                        type="text"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="https://... URL da imagem"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Right Phone Preview: 5 cols */}
              <div className="lg:col-span-5 space-y-3">
                <span className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider block">
                  Prévia no Direct do Cliente
                </span>

                {/* Smartphone Mockup */}
                <div className="w-full max-w-[320px] mx-auto bg-gray-950 rounded-[32px] p-3 shadow-xl border-4 border-gray-800">
                  <div className="w-24 h-3 bg-gray-900 rounded-b-xl mx-auto mb-2 flex items-center justify-center" />

                  {/* Direct App Header */}
                  <div className="bg-white rounded-t-2xl px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                          {channel === 'instagram' ? (
                            <Instagram className="w-3 h-3 text-pink-600" />
                          ) : (
                            <Facebook className="w-3 h-3 text-blue-600" />
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-gray-900 truncate">Sua Loja Oficial</span>
                    </div>
                    {broadcastType === 'utility' && <ShieldCheck className="w-4 h-4 text-purple-600" />}
                  </div>

                  {/* Chat Area */}
                  <div className="bg-[#F4F5F7] p-2.5 min-h-[260px] flex flex-col justify-end space-y-2 rounded-b-2xl">
                    
                    {/* Bubble */}
                    <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-200/80 space-y-2 max-w-[95%]">
                      {broadcastType === 'utility' && (
                        <div className="text-[9px] font-bold text-purple-800 border-b border-purple-100 pb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-purple-600" /> Mensagem Transacional Autorizada
                        </div>
                      )}

                      {broadcastType === 'standard' && mediaUrl && (
                        <img
                          src={mediaUrl}
                          alt="Banner"
                          className="w-full h-28 object-cover rounded-xl border border-gray-100"
                        />
                      )}

                      <p className="text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {renderPreviewText()}
                      </p>

                      {buttons.length > 0 && (
                        <div className="space-y-1 pt-1">
                          {buttons.map((b) => (
                            <div
                              key={b.id}
                              className="w-full py-1 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0084FF] text-[10px] font-bold text-center flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>{b.text}</span>
                              {b.type === 'url' && <ExternalLink className="w-2.5 h-2.5" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-gray-400 text-right pr-2">Agora • Entregue ✓✓</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: ENVIO & AGENDAMENTO */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Option Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] uppercase tracking-wider mb-2">
                  Quando Deseja Realizar o Disparo?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setSendOption('now')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      sendOption === 'now'
                        ? 'border-[#0084FF] bg-blue-50/50 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Send className="w-5 h-5 text-[#0084FF]" />
                      <span className="font-bold text-sm text-[#1A1D21]">Disparar Imediatamente</span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Inicia a fila de envio em segundo plano agora para os {matchingContacts.length} contatos.
                    </p>
                  </div>

                  <div
                    onClick={() => setSendOption('schedule')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      sendOption === 'schedule'
                        ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calendar className="w-5 h-5 text-amber-600" />
                      <span className="font-bold text-sm text-[#1A1D21]">Agendar para Depois</span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Programe data e hora exata para o disparo automático.
                    </p>
                  </div>

                  <div
                    onClick={() => setSendOption('draft')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      sendOption === 'draft'
                        ? 'border-gray-700 bg-gray-50 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText className="w-5 h-5 text-gray-700" />
                      <span className="font-bold text-sm text-[#1A1D21]">Salvar como Rascunho</span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Guarda todas as configurações para disparar manualmente depois.
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule Fields */}
              {sendOption === 'schedule' && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  {/* Quick Presets */}
                  <div>
                    <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block mb-1.5">
                      Atalhos Rápidos de Agendamento
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => applySchedulePreset('in_15m')}
                        className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                          schedulePreset === 'in_15m'
                            ? 'border-amber-500 bg-white text-amber-950 font-bold shadow-2xs'
                            : 'border-amber-200/80 hover:border-amber-300 text-amber-900 bg-white/60'
                        }`}
                      >
                        <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Em 15 min</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applySchedulePreset('today_20h')}
                        className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                          schedulePreset === 'today_20h'
                            ? 'border-amber-500 bg-white text-amber-950 font-bold shadow-2xs'
                            : 'border-amber-200/80 hover:border-amber-300 text-amber-900 bg-white/60'
                        }`}
                      >
                        <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>Hoje 20h00</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applySchedulePreset('tomorrow_9h')}
                        className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                          schedulePreset === 'tomorrow_9h'
                            ? 'border-amber-500 bg-white text-amber-950 font-bold shadow-2xs'
                            : 'border-amber-200/80 hover:border-amber-300 text-amber-900 bg-white/60'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Amanhã 09h</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applySchedulePreset('tomorrow_19h30')}
                        className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                          schedulePreset === 'tomorrow_19h30'
                            ? 'border-amber-500 bg-white text-amber-950 font-bold shadow-2xs'
                            : 'border-amber-200/80 hover:border-amber-300 text-amber-900 bg-white/60'
                        }`}
                      >
                        <Calendar className="w-3 h-3 text-purple-600 shrink-0" />
                        <span>Amanhã 19h30</span>
                      </button>
                    </div>
                  </div>

                  {/* Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/80">
                    <div>
                      <label className="text-xs font-semibold text-amber-950 block mb-1">Data do Envio:</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => {
                          setScheduledDate(e.target.value);
                          setSchedulePreset('custom');
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-amber-950 block mb-1">Horário (Fuso de Brasília):</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => {
                          setScheduledTime(e.target.value);
                          setSchedulePreset('custom');
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Formatted Confirmation Note */}
                  <div className="pt-2 border-t border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900">
                    <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Previsão de Execução: </span>
                      <span className="font-bold capitalize">{getFormattedSchedulePreview()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Facebook Batch & Guzzle Configuration Card */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                        <span>Motor de Transmissão: Facebook Batch API & Guzzle PHP</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-black bg-indigo-200 text-indigo-900 uppercase">
                          Otimizado aaPanel
                        </span>
                      </h4>
                      <p className="text-[11px] text-indigo-800">
                        Dispara mensagens em lotes de até 50 requisições simultâneas utilizando Guzzle Pool assíncrono.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useGuzzleBatch}
                      onChange={(e) => setUseGuzzleBatch(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {useGuzzleBatch && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-indigo-200/80 text-xs">
                    <div>
                      <label className="font-bold text-indigo-950 block mb-1">
                        Tamanho do Lote (Facebook Batch Chunk):
                      </label>
                      <select
                        value={batchSize}
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-indigo-300 bg-white font-medium text-indigo-900"
                      >
                        <option value={50}>50 mensagens / lote (Limite Máximo Oficial da Meta)</option>
                        <option value={25}>25 mensagens / lote (Equilibrado)</option>
                        <option value={10}>10 mensagens / lote (Pequenos volumes)</option>
                      </select>
                      <span className="text-[10px] text-indigo-700 block mt-0.5">
                        Agrupa {Math.ceil(matchingContacts.length / batchSize)} lotes HTTP no total.
                      </span>
                    </div>

                    <div>
                      <label className="font-bold text-indigo-950 block mb-1">
                        Concorrência Guzzle (Threads Assíncronas):
                      </label>
                      <select
                        value={concurrency}
                        onChange={(e) => setConcurrency(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-indigo-300 bg-white font-medium text-indigo-900"
                      >
                        <option value={10}>10 Promises Paralelas (Alta Performance)</option>
                        <option value={5}>5 Promises Paralelas (Padrão Recomendado)</option>
                        <option value={2}>2 Promises Paralelas (Modo Conservador)</option>
                      </select>
                      <span className="text-[10px] text-indigo-700 block mt-0.5">
                        Utiliza Guzzle\\Pool para resolução assíncrona sem travar o worker PHP.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Review Card */}
              <div className="bg-[#F8F9FB] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                <span className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider block">
                  Resumo Final da Campanha
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Modalidade:</span>
                    <span className="font-bold text-[#1A1D21]">
                      {broadcastType === 'utility' ? '🛡️ Utilidade (Meta)' : '📢 Padrão (24h)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Canal:</span>
                    <span className="font-bold text-[#1A1D21] capitalize">{channel}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Público Total:</span>
                    <span className="font-bold text-emerald-700">{matchingContacts.length} contatos</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Velocidade:</span>
                    <span className="font-bold text-blue-700">Fila Segura Meta</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step > 1) setStep((step - 1) as any);
              else onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-gray-100 text-[#64748B] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {step > 1 ? (
              <>
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </>
            ) : (
              'Cancelar'
            )}
          </button>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {sendOption === 'now' ? '🚀 Iniciar Disparos Agora' : sendOption === 'schedule' ? '📅 Confirmar Agendamento' : '💾 Salvar Rascunho'}
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
