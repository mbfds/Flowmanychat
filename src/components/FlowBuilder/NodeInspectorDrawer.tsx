import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Tag, 
  ExternalLink, 
  Clock, 
  Bot, 
  MessageSquare, 
  Split, 
  Zap, 
  UserCheck, 
  ChevronRight,
  HelpCircle,
  Variable,
  Layers,
  Search,
  Eye,
  Check,
  Calendar,
  Hash,
  Type,
  Sliders,
  Target,
  Trophy,
  BarChart3,
  Globe,
  MessageSquareReply,
  Instagram,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { FlowNode, FlowButton, QuickReply, NodeType, CustomFieldDefinition, MessageVariant } from '../../types';

interface NodeInspectorDrawerProps {
  node: FlowNode | null;
  allNodes: FlowNode[];
  onClose: () => void;
  onUpdateNode: (updatedNode: FlowNode) => void;
  customFields?: CustomFieldDefinition[];
}

export const NodeInspectorDrawer: React.FC<NodeInspectorDrawerProps> = ({
  node,
  allNodes,
  onClose,
  onUpdateNode,
  customFields = []
}) => {
  if (!node) return null;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState(node.title);
  const [text, setText] = useState(node.data.text || '');
  const [buttons, setButtons] = useState<FlowButton[]>(node.data.buttons || []);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(node.data.quickReplies || []);

  // In-Node Message A/B Testing State
  const [isMessageABTestEnabled, setIsMessageABTestEnabled] = useState<boolean>(
    node.data.isMessageABTestEnabled ?? false
  );

  const initialVariants: MessageVariant[] = node.data.messageVariants && node.data.messageVariants.length > 0
    ? node.data.messageVariants
    : [
        {
          id: 'variant_a',
          name: 'Variante A (Controle)',
          text: node.data.text || 'Olá {first_name}! Tudo bem? Veja nossas novidades exclusivas:',
          trafficPercent: 50,
          buttons: node.data.buttons || [],
          quickReplies: node.data.quickReplies || [],
          stats: { runs: 320, opens: 314, clicks: 142, conversions: 68, ctr: 45.2, conversionRate: 21.6 }
        },
        {
          id: 'variant_b',
          name: 'Variante B (Copy Curto + Desconto)',
          text: 'Oi {first_name} ✨ Separamos um cupom especial de 20% OFF para você hoje! Quer aproveitar?',
          trafficPercent: 50,
          buttons: [
            { id: 'btn_b_1', text: '🎁 Quero Meu Cupom 20%', type: 'flow', targetNodeId: '' }
          ],
          quickReplies: [],
          stats: { runs: 320, opens: 318, clicks: 210, conversions: 118, ctr: 66.0, conversionRate: 37.1 }
        }
      ];

  const [messageVariants, setMessageVariants] = useState<MessageVariant[]>(initialVariants);
  const [activeVariantId, setActiveVariantId] = useState<string>(
    initialVariants[0]?.id || 'variant_a'
  );
  const [messageTestGoal, setMessageTestGoal] = useState<'ctr' | 'lead_tag' | 'purchase' | 'response' | 'human_handover'>(
    node.data.messageTestGoal || 'ctr'
  );
  const [messageTestGoalTag, setMessageTestGoalTag] = useState<string>(
    node.data.messageTestGoalTag || 'Lead-Convertido'
  );
  const [delaySeconds, setDelaySeconds] = useState(node.data.delaySeconds || 2);
  const [showTypingIndicator, setShowTypingIndicator] = useState(node.data.showTypingIndicator ?? true);
  const [tagToAdd, setTagToAdd] = useState(node.data.tagToAdd || '');
  const [tagToRemove, setTagToRemove] = useState(node.data.tagToRemove || '');
  const [fieldToSet, setFieldToSet] = useState(node.data.fieldToSet || (customFields[0]?.key || 'preferencia'));
  const [fieldValue, setFieldValue] = useState(node.data.fieldValue || '');
  const [actionType, setActionType] = useState(node.data.actionType || 'add_tag');
  const [aiPrompt, setAiPrompt] = useState(node.data.aiPrompt || '');
  const [keywords, setKeywords] = useState<string[]>(node.data.keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const [conditionKey, setConditionKey] = useState(node.data.conditionKey || 'preferencia');
  const [conditionOperator, setConditionOperator] = useState(node.data.conditionOperator || 'equals');
  const [conditionValue, setConditionValue] = useState(node.data.conditionValue || '');

  // Trigger Node Specific State
  const [triggerType, setTriggerType] = useState(node.data.triggerType || 'keyword');
  const [commentPostScope, setCommentPostScope] = useState<'all_posts' | 'specific_post' | 'next_post'>(node.data.commentPostScope || 'all_posts');
  const [commentTargetPages, setCommentTargetPages] = useState<string[]>(node.data.commentTargetPages || ['all_pages']);
  const [commentTriggerMode, setCommentTriggerMode] = useState<'keywords_only' | 'any_comment'>(node.data.commentTriggerMode || 'keywords_only');
  const [commentAutoLike, setCommentAutoLike] = useState(node.data.commentAutoLike ?? true);
  const [commentSpecificPostId, setCommentSpecificPostId] = useState(node.data.commentSpecificPostId || 'post_reel_01');

  // A/B Split Test State
  const [splitRatioA, setSplitRatioA] = useState<number>(node.data.splitRatioA ?? 50);
  const [variantAName, setVariantAName] = useState(node.data.variantAName || 'Variante A (Mensagem de Boas-Vindas A)');
  const [variantBName, setVariantBName] = useState(node.data.variantBName || 'Variante B (Mensagem de Boas-Vindas B)');
  const [variantADescription, setVariantADescription] = useState(node.data.variantADescription || 'Oferta direta com cupom de boas-vindas');
  const [variantBDescription, setVariantBDescription] = useState(node.data.variantBDescription || 'Atendimento consultivo e interativo');
  const [testGoal, setTestGoal] = useState<'ctr' | 'lead_tag' | 'purchase' | 'response' | 'human_handover'>(node.data.testGoal || 'ctr');
  const [testGoalTargetTag, setTestGoalTargetTag] = useState(node.data.testGoalTargetTag || 'Lead-Qualificado');
  const [winnerVariant, setWinnerVariant] = useState<'A' | 'B' | null>(node.data.winnerVariant || null);
  const [autoPickWinner, setAutoPickWinner] = useState(node.data.autoPickWinner ?? true);
  const [minSampleSize, setMinSampleSize] = useState(node.data.minSampleSize || 200);

  // Variable selector UI state
  const [variableCategory, setVariableCategory] = useState<'all' | 'custom' | 'standard'>('all');
  const [variableSearch, setVariableSearch] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  // Standard Meta/Instagram default variables
  const STANDARD_VARIABLES = [
    { label: 'Primeiro Nome', key: 'first_name', tag: '{first_name}', desc: 'Nome do seguidor', example: 'Camila' },
    { label: 'Sobrenome', key: 'last_name', tag: '{last_name}', desc: 'Sobrenome do seguidor', example: 'Silveira' },
    { label: 'Nome de Usuário (@)', key: 'username', tag: '{username}', desc: 'Handle @perfil no Instagram', example: '@camilasilveira.style' }
  ];

  // Insert template variable into text at cursor position or end
  const insertVariable = (variableTag: string) => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newText = text.substring(0, start) + variableTag + text.substring(end);
      setText(newText);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + variableTag.length, start + variableTag.length);
      }, 0);
    } else {
      setText((prev) => prev + variableTag);
    }
  };

  const handleAddButton = () => {
    const newBtn: FlowButton = {
      id: `btn_${Date.now()}`,
      text: 'Novo Botão',
      type: 'flow',
      targetNodeId: allNodes.find((n) => n.id !== node.id)?.id || ''
    };
    setButtons([...buttons, newBtn]);
  };

  const handleUpdateButton = (index: number, field: keyof FlowButton, value: any) => {
    const updated = [...buttons];
    updated[index] = { ...updated[index], [field]: value };
    setButtons(updated);
  };

  const handleRemoveButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleAddQuickReply = () => {
    const newQr: QuickReply = {
      id: `qr_${Date.now()}`,
      text: 'Resposta Rápida',
      targetNodeId: allNodes.find((n) => n.id !== node.id)?.id || ''
    };
    setQuickReplies([...quickReplies, newQr]);
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    setKeywords([...keywords, newKeyword.trim().toUpperCase()]);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSwitchVariantTab = (targetVariantId: string) => {
    // 1. Save active variant data
    const updatedVariants = messageVariants.map((v) => {
      if (v.id === activeVariantId) {
        return {
          ...v,
          text,
          buttons,
          quickReplies
        };
      }
      return v;
    });

    // 2. Load target variant data
    const targetVariant = updatedVariants.find((v) => v.id === targetVariantId);
    if (targetVariant) {
      setText(targetVariant.text || '');
      setButtons(targetVariant.buttons || []);
      setQuickReplies(targetVariant.quickReplies || []);
    }

    setMessageVariants(updatedVariants);
    setActiveVariantId(targetVariantId);
  };

  const handleAddMessageVariant = () => {
    if (messageVariants.length >= 4) return;
    const newId = `variant_${String.fromCharCode(97 + messageVariants.length)}`; // 'variant_c' or 'variant_d'
    const letters = ['A', 'B', 'C', 'D'];
    const letter = letters[messageVariants.length] || 'C';

    const count = messageVariants.length + 1;
    const equalShare = Math.floor(100 / count);
    const remainder = 100 - equalShare * count;

    const newVariant: MessageVariant = {
      id: newId,
      name: `Variante ${letter} (Nova Hipótese)`,
      text: `Olá {first_name}! 🚀 Confira nossa oferta especial da Variante ${letter}:`,
      trafficPercent: equalShare + remainder,
      buttons: [
        { id: `btn_${newId}_1`, text: `⚡ Acessar Oferta ${letter}`, type: 'flow', targetNodeId: '' }
      ],
      quickReplies: [],
      stats: { runs: 100, opens: 98, clicks: 54, conversions: 24, ctr: 55.1, conversionRate: 24.5 }
    };

    const rebalanced = messageVariants.map((v) => ({
      ...v,
      trafficPercent: equalShare
    }));

    const finalVariants = [...rebalanced, newVariant];
    setMessageVariants(finalVariants);
    handleSwitchVariantTab(newId);
  };

  const handleRemoveMessageVariant = (variantId: string) => {
    if (messageVariants.length <= 2) return;
    const remaining = messageVariants.filter((v) => v.id !== variantId);
    const equalShare = Math.floor(100 / remaining.length);
    const remainder = 100 - equalShare * remaining.length;

    const rebalanced = remaining.map((v, i) => ({
      ...v,
      trafficPercent: i === 0 ? equalShare + remainder : equalShare
    }));

    setMessageVariants(rebalanced);
    if (activeVariantId === variantId) {
      const first = rebalanced[0];
      setActiveVariantId(first.id);
      setText(first.text || '');
      setButtons(first.buttons || []);
      setQuickReplies(first.quickReplies || []);
    }
  };

  const handleSetVariantTrafficPreset = (preset: '50_50' | '70_30' | '80_20' | 'equal') => {
    if (preset === '50_50' && messageVariants.length === 2) {
      setMessageVariants([
        { ...messageVariants[0], trafficPercent: 50 },
        { ...messageVariants[1], trafficPercent: 50 }
      ]);
    } else if (preset === '70_30' && messageVariants.length === 2) {
      setMessageVariants([
        { ...messageVariants[0], trafficPercent: 70 },
        { ...messageVariants[1], trafficPercent: 30 }
      ]);
    } else if (preset === '80_20' && messageVariants.length === 2) {
      setMessageVariants([
        { ...messageVariants[0], trafficPercent: 80 },
        { ...messageVariants[1], trafficPercent: 20 }
      ]);
    } else {
      // Equal split among all variants
      const count = messageVariants.length;
      const equalShare = Math.floor(100 / count);
      const remainder = 100 - equalShare * count;
      setMessageVariants(
        messageVariants.map((v, i) => ({
          ...v,
          trafficPercent: i === 0 ? equalShare + remainder : equalShare
        }))
      );
    }
  };

  const handleUpdateVariantTrafficPercent = (id: string, percent: number) => {
    const clamped = Math.max(5, Math.min(95, percent));
    if (messageVariants.length === 2) {
      const otherId = messageVariants.find((v) => v.id !== id)?.id;
      setMessageVariants(
        messageVariants.map((v) => {
          if (v.id === id) return { ...v, trafficPercent: clamped };
          if (v.id === otherId) return { ...v, trafficPercent: 100 - clamped };
          return v;
        })
      );
    } else {
      // Multiple variants: adjust proportionally
      setMessageVariants(
        messageVariants.map((v) => (v.id === id ? { ...v, trafficPercent: clamped } : v))
      );
    }
  };

  const handleSave = () => {
    const ratioB = 100 - splitRatioA;

    // Make sure active variant is synced into messageVariants
    const syncedMessageVariants = isMessageABTestEnabled
      ? messageVariants.map((v) => {
          if (v.id === activeVariantId) {
            return {
              ...v,
              text,
              buttons,
              quickReplies
            };
          }
          return v;
        })
      : messageVariants;

    const updated: FlowNode = {
      ...node,
      title,
      data: {
        ...node.data,
        text,
        buttons,
        quickReplies,
        isMessageABTestEnabled,
        messageVariants: syncedMessageVariants,
        messageTestGoal,
        messageTestGoalTag,
        delaySeconds,
        showTypingIndicator,
        tagToAdd,
        tagToRemove,
        fieldToSet,
        fieldValue,
        actionType,
        aiPrompt,
        triggerType,
        keywords,
        commentPostScope,
        commentTargetPages,
        commentTriggerMode,
        commentAutoLike,
        commentSpecificPostId,
        conditionKey,
        conditionOperator,
        conditionValue,
        splitRatioA,
        splitRatioB: ratioB,
        variantAName,
        variantBName,
        variantADescription,
        variantBDescription,
        testGoal,
        testGoalTargetTag,
        winnerVariant,
        autoPickWinner,
        minSampleSize
      }
    };
    onUpdateNode(updated);
  };

  // Generate real-time simulated interpolated preview text
  const getInterpolatedPreview = () => {
    let result = text || 'Sua mensagem aparecerá aqui...';
    result = result.replace(/{first_name}/g, 'Camila');
    result = result.replace(/{last_name}/g, 'Silveira');
    result = result.replace(/{username}/g, '@camilasilveira.style');

    customFields.forEach((cf) => {
      const reg = new RegExp(`{${cf.key}}`, 'g');
      result = result.replace(reg, cf.defaultValue || cf.name);
    });

    return result;
  };

  // Filtered variables list
  const filteredCustom = customFields.filter(
    (cf) =>
      cf.name.toLowerCase().includes(variableSearch.toLowerCase()) ||
      cf.key.toLowerCase().includes(variableSearch.toLowerCase())
  );

  const filteredStandard = STANDARD_VARIABLES.filter(
    (sv) =>
      sv.label.toLowerCase().includes(variableSearch.toLowerCase()) ||
      sv.key.toLowerCase().includes(variableSearch.toLowerCase())
  );

  return (
    <div 
      id="node_inspector_drawer"
      className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white border-l border-[#E2E8F0] shadow-2xl z-40 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8F9FB]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] shadow-xs">
            {node.type === 'trigger' && <Zap className="w-4 h-4 text-amber-500" />}
            {node.type === 'message' && <MessageSquare className="w-4 h-4 text-[#0084FF]" />}
            {node.type === 'condition' && <Split className="w-4 h-4 text-cyan-600" />}
            {node.type === 'action' && <Tag className="w-4 h-4 text-emerald-600" />}
            {node.type === 'ai_step' && <Sparkles className="w-4 h-4 text-indigo-600" />}
            {node.type === 'delay' && <Clock className="w-4 h-4 text-orange-500" />}
            {node.type === 'ab_split' && <Split className="w-4 h-4 text-fuchsia-600" />}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              {node.type === 'ab_split' ? 'Divisor de Tráfego A/B' : `Editor de Passo (${node.type})`}
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-bold text-sm text-[#1A1D21] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#0084FF] focus:outline-none px-0.5"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Drawer Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Trigger Controls */}
        {node.type === 'trigger' && (
          <div className="space-y-5">
            {/* Trigger Type Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider">
                Origem do Gatilho
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTriggerType('keyword')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    triggerType === 'keyword'
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold shadow-2xs'
                      : 'border-[#E2E8F0] hover:border-gray-300 text-[#64748B]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                    <span>Direct / Mensagem</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Palavra no chat</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTriggerType('post_comment')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    triggerType === 'post_comment'
                      ? 'border-pink-500 bg-pink-50/70 text-pink-950 font-bold shadow-2xs'
                      : 'border-[#E2E8F0] hover:border-gray-300 text-[#64748B]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <MessageSquareReply className="w-3.5 h-3.5 text-pink-600" />
                    <span>Comentário em Post</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Posts e Reels</div>
                </button>
              </div>
            </div>

            {/* Post Comment Trigger Scope Config */}
            {triggerType === 'post_comment' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-pink-50/60 border border-pink-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-pink-950 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-pink-600" />
                    <span>Escopo do Post</span>
                  </label>
                  <span className="text-[10px] font-bold text-pink-700">Instagram & Facebook</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCommentPostScope('all_posts')}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      commentPostScope === 'all_posts'
                        ? 'border-[#0084FF] bg-blue-50 text-[#0084FF] font-bold shadow-2xs'
                        : 'border-pink-200 bg-white text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Todos os Posts</span>
                    </div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">Reels e Feed atuais e futuros</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCommentPostScope('specific_post')}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      commentPostScope === 'specific_post'
                        ? 'border-pink-500 bg-pink-100 text-pink-800 font-bold shadow-2xs'
                        : 'border-pink-200 bg-white text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Post Único</span>
                    </div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">Apenas uma publicação</div>
                  </button>
                </div>

                {/* 1-Click Apply to All Pages in Trigger Node */}
                <div className="pt-2 border-t border-pink-200/80 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1D21] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={commentTargetPages.includes('all_pages')}
                      onChange={(e) => setCommentTargetPages(e.target.checked ? ['all_pages'] : ['acc_ig_main'])}
                      className="rounded accent-emerald-600"
                    />
                    <span>Aplicar em TODAS as Páginas conectadas</span>
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Multicanais
                  </span>
                </div>

                {/* Auto Like Comment */}
                <label className="flex items-center gap-2 text-xs text-[#1A1D21] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={commentAutoLike}
                    onChange={(e) => setCommentAutoLike(e.target.checked)}
                    className="rounded accent-pink-600"
                  />
                  <span>Curtir o comentário do seguidor automaticamente</span>
                </label>
              </div>
            )}

            {/* Trigger Keywords */}
            <div>
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                {triggerType === 'post_comment' ? 'Palavras-Chave no Comentário' : 'Palavras-Chave Gatilho (Trigger Keywords)'}
              </label>
              <p className="text-xs text-[#64748B] mb-2">
                O fluxo iniciará automaticamente quando o seguidor enviar ou comentar qualquer uma destas palavras.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="Ex: CUPOM, PREÇO, QUERO, AULA..."
                className="flex-1 px-3 py-1.5 bg-[#F8F9FB] border border-[#E2E8F0] rounded-lg text-xs text-[#1A1D21]"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5"
                >
                  <span>"{kw}"</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(idx)}
                    className="hover:text-rose-600 cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Message Type Specific Controls */}
        {node.type === 'message' && (
          <div className="space-y-5">
            {/* IN-NODE A/B SPLIT TESTING CONTROL PANEL */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-50/70 via-purple-50/50 to-blue-50/40 border border-fuchsia-200/80 shadow-xs space-y-4">
              {/* Top Toggle Switch */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-fuchsia-100 text-fuchsia-700">
                    <Split className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[#1A1D21]">Divisão de Tráfego em Teste A/B</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200">
                        Otimização de Copy
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Teste variações de texto, CTAs e botões para medir conversão e CTR.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMessageABTestEnabled}
                    onChange={(e) => setIsMessageABTestEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-fuchsia-600"></div>
                </label>
              </div>

              {/* A/B Testing Active Controls */}
              {isMessageABTestEnabled && (
                <div className="space-y-4 pt-2 border-t border-fuchsia-100 animate-in fade-in duration-150">
                  {/* Variant Tabs */}
                  <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {messageVariants.map((v) => {
                        const isActive = v.id === activeVariantId;
                        const isLeading = v.stats && v.stats.conversionRate > 30;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleSwitchVariantTab(v.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                              isActive
                                ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-xs'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-white/90" />
                            <span>{v.name.slice(0, 15)}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                                isActive ? 'bg-white/20 text-white' : 'bg-fuchsia-50 text-fuchsia-800'
                              }`}
                            >
                              {v.trafficPercent}%
                            </span>
                            {isLeading && <Trophy className="w-3 h-3 text-amber-300 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>

                    {messageVariants.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddMessageVariant}
                        className="p-1.5 rounded-xl bg-white hover:bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-700 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        title="Adicionar Nova Variante"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Nova Variante</span>
                      </button>
                    )}
                  </div>

                  {/* Traffic Distribution Controls */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-fuchsia-600" />
                        <span>Distribuição de Tráfego (% dos Contatos)</span>
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">Soma: 100%</span>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-gray-500 font-semibold">Atalhos:</span>
                      <button
                        type="button"
                        onClick={() => handleSetVariantTrafficPreset('50_50')}
                        className="px-2 py-0.5 rounded bg-gray-100 hover:bg-fuchsia-100 hover:text-fuchsia-800 font-bold transition-colors cursor-pointer"
                      >
                        50% / 50%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetVariantTrafficPreset('70_30')}
                        className="px-2 py-0.5 rounded bg-gray-100 hover:bg-fuchsia-100 hover:text-fuchsia-800 font-bold transition-colors cursor-pointer"
                      >
                        70% / 30%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetVariantTrafficPreset('80_20')}
                        className="px-2 py-0.5 rounded bg-gray-100 hover:bg-fuchsia-100 hover:text-fuchsia-800 font-bold transition-colors cursor-pointer"
                      >
                        80% / 20%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetVariantTrafficPreset('equal')}
                        className="px-2 py-0.5 rounded bg-gray-100 hover:bg-fuchsia-100 hover:text-fuchsia-800 font-bold transition-colors cursor-pointer"
                      >
                        Igualitário
                      </button>
                    </div>

                    {/* Sliders for each variant */}
                    <div className="space-y-2 pt-1">
                      {messageVariants.map((v) => (
                        <div key={v.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-[#1A1D21]">{v.name}:</span>
                            <span className="font-mono text-fuchsia-700 font-bold">{v.trafficPercent}%</span>
                          </div>
                          <input
                            type="range"
                            min={5}
                            max={95}
                            value={v.trafficPercent}
                            onChange={(e) => handleUpdateVariantTrafficPercent(v.id, Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Goal and Metrics Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Goal Metric */}
                    <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1.5">
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        Meta Principal de Conversão
                      </label>
                      <select
                        value={messageTestGoal}
                        onChange={(e) => setMessageTestGoal(e.target.value as any)}
                        className="w-full px-2 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-bold text-[#1A1D21]"
                      >
                        <option value="ctr">CTR (Cliques em Botões)</option>
                        <option value="response">Resposta Direta do Usuário</option>
                        <option value="lead_tag">Atribuição de Tag no CRM</option>
                        <option value="human_handover">Transferência p/ Atendente</option>
                      </select>

                      {messageTestGoal === 'lead_tag' && (
                        <input
                          type="text"
                          value={messageTestGoalTag}
                          onChange={(e) => setMessageTestGoalTag(e.target.value)}
                          placeholder="Tag de Conversão (ex: Comprou)"
                          className="w-full px-2 py-1 rounded bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] mt-1"
                        />
                      )}
                    </div>

                    {/* Active Variant Conversion Stats */}
                    <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        <span>Estatísticas da Variante Ativa</span>
                        <BarChart3 className="w-3 h-3 text-fuchsia-600" />
                      </div>

                      {(() => {
                        const activeVar = messageVariants.find((v) => v.id === activeVariantId);
                        const stats = activeVar?.stats || {
                          runs: 280,
                          opens: 275,
                          clicks: 140,
                          conversions: 62,
                          ctr: 50.0,
                          conversionRate: 22.1
                        };
                        return (
                          <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[11px]">
                            <div className="p-1.5 rounded bg-gray-50 border border-gray-100">
                              <span className="text-[9px] text-gray-500 block">CTR de Botão</span>
                              <span className="font-bold text-fuchsia-700">{stats.ctr}%</span>
                            </div>
                            <div className="p-1.5 rounded bg-emerald-50 border border-emerald-100">
                              <span className="text-[9px] text-emerald-800 block">Conversão</span>
                              <span className="font-bold text-emerald-700">{stats.conversionRate}%</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Active Variant Name & Hypothesis Editor */}
                  <div className="p-3 bg-fuchsia-50/40 rounded-xl border border-fuchsia-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-fuchsia-900 uppercase tracking-wider">
                        Identificação: {messageVariants.find((v) => v.id === activeVariantId)?.name}
                      </label>
                      {messageVariants.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMessageVariant(activeVariantId)}
                          className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Excluir esta Variante
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={messageVariants.find((v) => v.id === activeVariantId)?.name || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMessageVariants(
                          messageVariants.map((v) => (v.id === activeVariantId ? { ...v, name: val } : v))
                        );
                      }}
                      placeholder="Nome da variante (ex: Copy Curto com Emoji)"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-fuchsia-200 text-xs font-semibold text-[#1A1D21]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* TEXT AND VARIABLES SECTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#0084FF]" />
                  <span>Conteúdo da Mensagem</span>
                </label>
                <span className="text-[11px] text-[#64748B]">Suporta Markdown & Tags</span>
              </div>

              {/* DYNAMIC VARIABLES PICKER BAR */}
              <div className="p-3 bg-purple-50/50 border border-purple-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Variable className="w-3.5 h-3.5 text-purple-700" />
                    <span className="text-xs font-bold text-purple-900">
                      Inserir Variáveis Personalizadas:
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-700 font-medium">
                    Clique para inserir no texto
                  </span>
                </div>

                {/* Filter / Category Selector */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-purple-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setVariableCategory('all')}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        variableCategory === 'all'
                          ? 'bg-purple-100 text-purple-900'
                          : 'text-[#64748B] hover:text-purple-700'
                      }`}
                    >
                      Todas ({customFields.length + STANDARD_VARIABLES.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVariableCategory('custom')}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        variableCategory === 'custom'
                          ? 'bg-purple-100 text-purple-900'
                          : 'text-[#64748B] hover:text-purple-700'
                      }`}
                    >
                      Personalizadas ({customFields.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVariableCategory('standard')}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        variableCategory === 'standard'
                          ? 'bg-purple-100 text-purple-900'
                          : 'text-[#64748B] hover:text-purple-700'
                      }`}
                    >
                      Meta / Padrão (3)
                    </button>
                  </div>

                  {/* Search Mini Input */}
                  <div className="relative w-28 sm:w-36">
                    <Search className="w-3 h-3 text-purple-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={variableSearch}
                      onChange={(e) => setVariableSearch(e.target.value)}
                      placeholder="Filtrar..."
                      className="w-full pl-6 pr-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  </div>
                </div>

                {/* Variable Chips Grid */}
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {/* Standard Variables */}
                  {(variableCategory === 'all' || variableCategory === 'standard') &&
                    filteredStandard.map((v) => (
                      <button
                        key={v.tag}
                        type="button"
                        onClick={() => insertVariable(v.tag)}
                        title={`${v.desc} (ex: ${v.example})`}
                        className="px-2 py-1 text-[11px] font-mono font-bold rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <span className="text-blue-500 font-sans font-normal text-[10px]">{v.label}:</span>
                        <span>{v.tag}</span>
                      </button>
                    ))}

                  {/* Custom Fields defined by user */}
                  {(variableCategory === 'all' || variableCategory === 'custom') &&
                    filteredCustom.map((cf) => (
                      <button
                        key={cf.key}
                        type="button"
                        onClick={() => insertVariable(`{${cf.key}}`)}
                        title={`${cf.name} - ${cf.description || ''} (Padrão: ${cf.defaultValue || 'vazio'})`}
                        className="px-2 py-1 text-[11px] font-mono font-bold rounded-md bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <span className="text-purple-700 font-sans font-normal text-[10px]">{cf.name}:</span>
                        <span>{`{${cf.key}}`}</span>
                      </button>
                    ))}

                  {filteredCustom.length === 0 && filteredStandard.length === 0 && (
                    <span className="text-[11px] text-[#64748B] italic py-1">
                      Nenhuma variável encontrada para "{variableSearch}"
                    </span>
                  )}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva a mensagem para o direct usando variáveis como {first_name}, {data_nascimento}, {preferencia}..."
                className="w-full p-3 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF] leading-relaxed font-sans"
              />

              {/* LIVE SIMULATED PREVIEW ACCORDION */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <Eye className="w-3.5 h-3.5 text-[#0084FF]" />
                    <span>Pré-Visualização Real (Variáveis Preenchidas):</span>
                  </div>
                  <span className="text-[10px] text-[#64748B]">Simulação Camila</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-gray-200 text-xs text-[#1A1D21] whitespace-pre-line leading-relaxed shadow-2xs font-sans">
                  {getInterpolatedPreview()}
                </div>
              </div>
            </div>

            {/* Buttons Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
                  Botões Interativos ({buttons.length}/3)
                </label>
                {buttons.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddButton}
                    className="text-xs text-[#0084FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Botão
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {buttons.map((btn, index) => (
                  <div
                    key={btn.id}
                    className="p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={btn.text}
                        onChange={(e) => handleUpdateButton(index, 'text', e.target.value)}
                        placeholder="Texto do botão"
                        className="flex-1 px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveButton(index)}
                        className="text-[#64748B] hover:text-rose-600 p-1 cursor-pointer"
                        title="Excluir botão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={btn.type}
                        onChange={(e) => handleUpdateButton(index, 'type', e.target.value)}
                        className="px-2 py-1 rounded-md bg-white border border-[#E2E8F0] text-[11px] text-[#1A1D21]"
                      >
                        <option value="flow">Ir para Próximo Nó</option>
                        <option value="url">Abrir Link (URL)</option>
                        <option value="phone">Ligar / WhatsApp</option>
                        <option value="handover">Chamar Atendente</option>
                      </select>

                      {btn.type === 'flow' ? (
                        <select
                          value={btn.targetNodeId || ''}
                          onChange={(e) => handleUpdateButton(index, 'targetNodeId', e.target.value)}
                          className="px-2 py-1 rounded-md bg-white border border-[#E2E8F0] text-[11px] text-[#1A1D21] truncate"
                        >
                          <option value="">Selecione o Nó...</option>
                          {allNodes
                            .filter((n) => n.id !== node.id)
                            .map((n) => (
                              <option key={n.id} value={n.id}>
                                {n.title}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={btn.value || ''}
                          onChange={(e) => handleUpdateButton(index, 'value', e.target.value)}
                          placeholder={btn.type === 'url' ? 'https://...' : '+5511...'}
                          className="px-2 py-1 rounded-md bg-white border border-[#E2E8F0] text-[11px] text-[#1A1D21]"
                        />
                      )}
                    </div>

                    {/* TAG ATTRIBUTION ACTION ON BUTTON CLICK (FOR BROADCAST SEGMENTATION) */}
                    <div className="pt-2 border-t border-gray-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          <span>Atribuir Tag ao Clicar (Rotular Contato)</span>
                        </label>
                        {btn.assignTag && (
                          <button
                            type="button"
                            onClick={() => handleUpdateButton(index, 'assignTag', undefined)}
                            className="text-[10px] text-rose-600 hover:underline cursor-pointer font-medium"
                          >
                            Remover tag
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={btn.assignTag || ''}
                          onChange={(e) => handleUpdateButton(index, 'assignTag', e.target.value)}
                          placeholder="Ex: Interesse-Cupom, Lead-VIP, Interesse-Planos..."
                          className="w-full px-2.5 py-1 rounded-md bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 text-xs text-[#1A1D21] placeholder:text-gray-400 font-medium"
                        />
                      </div>

                      {/* Quick Tag Suggestions for Button */}
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[10px] text-[#64748B]">Sugestões:</span>
                        {['Interesse-Cupom', 'Interesse-Catalogo', 'Interesse-Planos', 'Lead-VIP-Atendimento', 'Comprador'].map((tagSug) => (
                          <button
                            key={tagSug}
                            type="button"
                            onClick={() => handleUpdateButton(index, 'assignTag', tagSug)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                              btn.assignTag === tagSug
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            +{tagSug}
                          </button>
                        ))}
                      </div>

                      <div className="text-[10px] text-[#64748B] flex items-center gap-1 bg-emerald-50/50 p-1 rounded border border-emerald-100/60">
                        <span className="font-medium text-emerald-900">⚡ Segmentação:</span>
                        <span>Rotula o seguidor no CRM e libera filtros no Broadcast.</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Replies Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
                  Respostas Rápidas (Quick Replies)
                </label>
                <button
                  type="button"
                  onClick={handleAddQuickReply}
                  className="text-xs text-[#0084FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Chip
                </button>
              </div>

              <div className="space-y-2">
                {quickReplies.map((qr, index) => (
                  <div key={qr.id} className="p-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={qr.text}
                        onChange={(e) => {
                          const updated = [...quickReplies];
                          updated[index].text = e.target.value;
                          setQuickReplies(updated);
                        }}
                        placeholder="Texto da resposta rápida"
                        className="flex-1 px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] text-xs text-[#1A1D21]"
                      />
                      <select
                        value={qr.targetNodeId || ''}
                        onChange={(e) => {
                          const updated = [...quickReplies];
                          updated[index].targetNodeId = e.target.value;
                          setQuickReplies(updated);
                        }}
                        className="px-2 py-1 rounded-md bg-white border border-[#E2E8F0] text-xs text-[#1A1D21] max-w-[130px]"
                      >
                        <option value="">Leva para...</option>
                        {allNodes
                          .filter((n) => n.id !== node.id)
                          .map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.title}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setQuickReplies(quickReplies.filter((_, i) => i !== index))}
                        className="text-[#64748B] hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 pl-0.5">
                      <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
                      <input
                        type="text"
                        value={qr.assignTag || ''}
                        onChange={(e) => {
                          const updated = [...quickReplies];
                          updated[index].assignTag = e.target.value;
                          setQuickReplies(updated);
                        }}
                        placeholder="Atribuir Tag ao clicar (opcional)..."
                        className="flex-1 px-2 py-0.5 rounded bg-white border border-emerald-200 text-[10px] text-[#1A1D21] placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Type Controls */}
        {node.type === 'action' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                Tipo de Ação
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] font-semibold"
              >
                <option value="add_tag">🏷️ Atribuir Tag (Adicionar Tag ao Contato)</option>
                <option value="remove_tag">❌ Remover Tag do Contato</option>
                <option value="set_field">📝 Salvar / Atualizar Campo Customizado</option>
                <option value="human_handover">👨‍💼 Transferir para Atendente Humano</option>
              </select>
            </div>

            {actionType === 'add_tag' && (
              <div className="space-y-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">
                    Nome da Tag a Atribuir
                  </label>
                  <p className="text-[11px] text-emerald-800/80 mb-2">
                    Rotula o contato no CRM no momento exato em que ele atingir este nó do fluxo.
                  </p>
                  <input
                    type="text"
                    value={tagToAdd}
                    onChange={(e) => setTagToAdd(e.target.value)}
                    placeholder="Ex: Lead-Qualificado, Interesse-Cupom, Cliente-VIP..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 text-xs text-[#1A1D21] font-semibold"
                  />
                </div>

                {/* Predefined Tag Suggestions */}
                <div>
                  <span className="text-[10px] font-bold text-emerald-900 block mb-1">Tags recomendadas para segmentação:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Lead-Qualificado',
                      'Interesse-Cupom',
                      'Interesse-Catalogo',
                      'Interesse-Planos',
                      'Lead-VIP-Atendimento',
                      'Cliente-VIP',
                      'Pediu-Cupom',
                      'Duvida-Suporte'
                    ].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setTagToAdd(sug)}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          tagToAdd === sug
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        🏷️ {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <span>🚀 Sincronização Automática com Broadcast:</span>
                  </div>
                  <p className="text-emerald-700">
                    Contatos marcados com <strong>"{tagToAdd || 'esta tag'}"</strong> ficam imediatamente disponíveis nos filtros de audiência do módulo de <strong>Broadcast</strong> para disparos segmentados em massa.
                  </p>
                </div>
              </div>
            )}

            {actionType === 'remove_tag' && (
              <div className="space-y-3 p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-rose-950 uppercase tracking-wider mb-1">
                    Nome da Tag a Remover
                  </label>
                  <input
                    type="text"
                    value={tagToRemove}
                    onChange={(e) => setTagToRemove(e.target.value)}
                    placeholder="Ex: Lead-Frio, Pendente..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-rose-300 text-xs text-[#1A1D21] font-semibold"
                  />
                </div>
              </div>
            )}

            {actionType === 'set_field' && (
              <div className="space-y-3 p-3 bg-purple-50/60 border border-purple-200 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    Campo Personalizado a Atualizar:
                  </label>
                  <select
                    value={fieldToSet}
                    onChange={(e) => setFieldToSet(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-purple-200 text-xs text-[#1A1D21]"
                  >
                    {customFields.map((cf) => (
                      <option key={cf.key} value={cf.key}>
                        {cf.name} ({`{${cf.key}}`})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    Novo Valor para o Campo:
                  </label>
                  <input
                    type="text"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder="Ex: Moda Feminina, 25/12/1990, VIP..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-purple-200 text-xs text-[#1A1D21]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Condition Controls */}
        {node.type === 'condition' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1.5">
                Regra Condicional (Bifurcação do Fluxo)
              </label>
              <p className="text-xs text-[#64748B] mb-2">
                Verifica campos personalizados ou tags do contato para decidir o caminho da conversa.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1">
                Campo Personalizado / Atributo:
              </label>
              <select
                value={conditionKey}
                onChange={(e) => setConditionKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
              >
                <option value="tag">🏷️ Tag no CRM</option>
                {customFields.map((cf) => (
                  <option key={cf.key} value={cf.key}>
                    📝 {cf.name} ({`{${cf.key}}`})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">
                  Operador:
                </label>
                <select
                  value={conditionOperator}
                  onChange={(e) => setConditionOperator(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                >
                  <option value="equals">É igual a</option>
                  <option value="contains">Contém</option>
                  <option value="exists">Está preenchido</option>
                  <option value="not_exists">Está vazio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">
                  Valor Esperado:
                </label>
                <input
                  type="text"
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  placeholder="Ex: VIP, Moda Feminina..."
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Step Controls */}
        {node.type === 'ai_step' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-700">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Instrução do Agente IA (Gemini 2.5)
              </span>
            </div>
            <textarea
              rows={6}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Instruções para o Gemini: responda dúvidas sobre preços, prazos de entrega e conduza o cliente para fechar o pedido..."
              className="w-full p-3 rounded-lg bg-purple-50/50 border border-purple-200 text-xs text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed font-sans"
            />
            <p className="text-[11px] text-[#64748B]">
              A IA responderá no estilo e tom configurados na Base de Conhecimento, respeitando os limites da sua empresa.
            </p>
          </div>
        )}

        {/* Delay Controls */}
        {node.type === 'delay' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Tempo de Espera: {delaySeconds} segundos
                </label>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                className="w-full accent-[#0084FF]"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[#1A1D21] cursor-pointer">
              <input
                type="checkbox"
                checked={showTypingIndicator}
                onChange={(e) => setShowTypingIndicator(e.target.checked)}
                className="rounded accent-[#0084FF]"
              />
              <span>Mostrar animação de "digitando..." durante a pausa</span>
            </label>
          </div>
        )}

        {/* A/B Split Test Node Controls */}
        {node.type === 'ab_split' && (
          <div className="space-y-5">
            {/* Split Distribution Control */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 via-fuchsia-50/80 to-purple-50/80 border border-fuchsia-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-fuchsia-600" />
                  <span>Divisão de Tráfego</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700">A: {splitRatioA}%</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs font-bold text-fuchsia-700">B: {100 - splitRatioA}%</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={splitRatioA}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSplitRatioA(val);
                  if (val === 100) setWinnerVariant('A');
                  else if (val === 0) setWinnerVariant('B');
                  else setWinnerVariant(null);
                }}
                className="w-full accent-fuchsia-600 cursor-pointer"
              />

              {/* Presets */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => { setSplitRatioA(50); setWinnerVariant(null); }}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    splitRatioA === 50
                      ? 'bg-fuchsia-600 text-white shadow-xs'
                      : 'bg-white hover:bg-gray-100 border border-[#E2E8F0] text-[#1A1D21]'
                  }`}
                >
                  50 / 50
                </button>
                <button
                  type="button"
                  onClick={() => { setSplitRatioA(70); setWinnerVariant(null); }}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    splitRatioA === 70
                      ? 'bg-fuchsia-600 text-white shadow-xs'
                      : 'bg-white hover:bg-gray-100 border border-[#E2E8F0] text-[#1A1D21]'
                  }`}
                >
                  70 / 30
                </button>
                <button
                  type="button"
                  onClick={() => { setSplitRatioA(80); setWinnerVariant(null); }}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    splitRatioA === 80
                      ? 'bg-fuchsia-600 text-white shadow-xs'
                      : 'bg-white hover:bg-gray-100 border border-[#E2E8F0] text-[#1A1D21]'
                  }`}
                >
                  80 / 20
                </button>
                <button
                  type="button"
                  onClick={() => { setSplitRatioA(0); setWinnerVariant('B'); }}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    splitRatioA === 0
                      ? 'bg-fuchsia-600 text-white shadow-xs'
                      : 'bg-white hover:bg-gray-100 border border-[#E2E8F0] text-[#1A1D21]'
                  }`}
                >
                  100% B 🏆
                </button>
              </div>
            </div>

            {/* Test Conversion Goal */}
            <div className="space-y-3 p-3.5 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
                  Meta de Conversão do Teste
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">
                  Métrica Principal de Sucesso:
                </label>
                <select
                  value={testGoal}
                  onChange={(e) => setTestGoal(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1A1D21]"
                >
                  <option value="ctr">Taxa de Cliques nos Botões (CTR)</option>
                  <option value="lead_tag">Tag no CRM Aplicada (Ex: Lead-Qualificado)</option>
                  <option value="response">Resposta Escrita do Seguidor</option>
                  <option value="human_handover">Conversão em Atendimento com Vendedor</option>
                  <option value="purchase">Conclusão de Checkout / Compra</option>
                </select>
              </div>

              {testGoal === 'lead_tag' && (
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">
                    Tag Alvo no CRM:
                  </label>
                  <input
                    type="text"
                    value={testGoalTargetTag}
                    onChange={(e) => setTestGoalTargetTag(e.target.value)}
                    placeholder="Ex: Lead-Qualificado, Cupom-Resgatado..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1A1D21]"
                  />
                </div>
              )}
            </div>

            {/* Variant Names & Hypotheses */}
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-200 space-y-2">
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Identificação da Variante A ({splitRatioA}%)
                </span>
                <input
                  type="text"
                  value={variantAName}
                  onChange={(e) => setVariantAName(e.target.value)}
                  placeholder="Nome da Variante A"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-semibold text-[#1A1D21]"
                />
                <input
                  type="text"
                  value={variantADescription}
                  onChange={(e) => setVariantADescription(e.target.value)}
                  placeholder="Hipótese ou descrição da mensagem A"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-xs text-[#64748B]"
                />
              </div>

              <div className="p-3 bg-fuchsia-50/40 rounded-xl border border-fuchsia-200 space-y-2">
                <span className="text-xs font-bold text-fuchsia-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-fuchsia-600" />
                  Identificação da Variante B ({100 - splitRatioA}%)
                </span>
                <input
                  type="text"
                  value={variantBName}
                  onChange={(e) => setVariantBName(e.target.value)}
                  placeholder="Nome da Variante B"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-fuchsia-200 text-xs font-semibold text-[#1A1D21]"
                />
                <input
                  type="text"
                  value={variantBDescription}
                  onChange={(e) => setVariantBDescription(e.target.value)}
                  placeholder="Hipótese ou descrição da mensagem B"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-fuchsia-200 text-xs text-[#64748B]"
                />
              </div>
            </div>

            {/* Automated Winner Rules */}
            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-purple-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPickWinner}
                  onChange={(e) => setAutoPickWinner(e.target.checked)}
                  className="rounded accent-purple-600"
                />
                <span>Declarar vencedor automaticamente</span>
              </label>
              <p className="text-[11px] text-[#64748B] pl-5">
                Direciona 100% do tráfego para a variante líder assim que atingir 95% de significância estatística e no mínimo 200 interações.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Apply Button */}
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8F9FB] flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#64748B] text-xs font-semibold transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          id="btn_save_node_inspector"
          type="button"
          onClick={() => {
            handleSave();
            onClose();
          }}
          className="flex-1 py-2 px-3 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};
