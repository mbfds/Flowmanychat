import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Instagram, 
  Facebook, 
  Send, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink, 
  Clock, 
  Tag, 
  MessageSquareReply, 
  Flame, 
  Bot, 
  Info,
  Smartphone,
  Phone,
  Video,
  MoreVertical,
  Heart,
  Smile,
  Split,
  Trophy,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flow, FlowNode, FlowButton, QuickReply, ChatMessage, Contact, BotKnowledgeBase, CustomFieldDefinition } from '../../types';

interface InteractiveSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  flows: Flow[];
  activeFlowId: string;
  knowledgeBase: BotKnowledgeBase;
  onUpdateContactTags?: (tags: string[]) => void;
  customFields?: CustomFieldDefinition[];
}

export const InteractiveSimulatorModal: React.FC<InteractiveSimulatorModalProps> = ({
  isOpen,
  onClose,
  flows,
  activeFlowId,
  knowledgeBase,
  customFields = []
}) => {
  if (!isOpen) return null;

  const [channel, setChannel] = useState<'instagram' | 'messenger'>('instagram');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>(['Lead-Simulado', 'Instagram-DM']);
  const [leadFields, setLeadFields] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {
      first_name: 'Camila',
      last_name: 'Silveira',
      username: '@camilasilveira.style'
    };
    customFields.forEach((cf) => {
      initial[cf.key] = cf.defaultValue || 'Moda Feminina';
    });
    return initial;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [executionLogs, setExecutionLogs] = useState<Array<{
    id: string;
    timestamp: string;
    type: 'trigger' | 'node' | 'action' | 'ai' | 'delay';
    message: string;
  }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation on open
  useEffect(() => {
    resetConversation();
  }, [channel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addLog = (type: 'trigger' | 'node' | 'action' | 'ai' | 'delay', text: string) => {
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setExecutionLogs((prev) => [
      ...prev,
      { id: `log_${Date.now()}_${Math.random()}`, timestamp: timeStr, type, message: text }
    ]);
  };

  const resetConversation = () => {
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'bot',
        channel,
        text: channel === 'instagram' 
          ? '👋 Olá! Bem-vindo ao direct da ManyFlow. Experimente digitar "QUERO", "PREÇO" ou usar os botões de simulação abaixo!' 
          : '👋 Olá! Este é o atendimento oficial no Facebook Messenger. Como posso te ajudar hoje?',
        timestamp: 'Agora',
        quickReplies: [
          { id: 'qr_quero', text: '🎁 Quero o Cupom' },
          { id: 'qr_preco', text: '💰 Ver Preços' },
          { id: 'qr_humano', text: '👨‍💼 Falar com Humano' }
        ]
      }
    ]);
    setActiveTags(['Lead-Simulado']);
    setExecutionLogs([
      {
        id: 'log_init',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        type: 'node',
        message: `Simulador iniciado no canal ${channel.toUpperCase()}`
      }
    ]);
  };

  const interpolateMessage = (rawText: string) => {
    let result = rawText || '';
    result = result.replace(/{first_name}/g, leadFields.first_name || 'Camila');
    result = result.replace(/{last_name}/g, leadFields.last_name || 'Silveira');
    result = result.replace(/{username}/g, leadFields.username || '@camilasilveira.style');

    customFields.forEach((cf) => {
      const reg = new RegExp(`{${cf.key}}`, 'g');
      const val = leadFields[cf.key] ?? (cf.defaultValue || cf.name);
      result = result.replace(reg, val);
    });

    return result;
  };

  // Find relevant flow node
  const executeNode = async (flow: Flow, node: FlowNode) => {
    addLog('node', `Executando Nó: "${node.title}" (${node.type.toUpperCase()})`);

    // Handle Actions
    if (node.type === 'action') {
      if (node.data.actionType === 'add_tag' || !node.data.actionType) {
        if (node.data.tagToAdd) {
          setActiveTags((prev) => Array.from(new Set([...prev, node.data.tagToAdd!])));
          addLog('action', `🏷️ [Ação no Fluxo]: Tag atribuída ao contato: "${node.data.tagToAdd}" (Sincronizado para Broadcast)`);
        }
      } else if (node.data.actionType === 'remove_tag') {
        if (node.data.tagToRemove) {
          setActiveTags((prev) => prev.filter((t) => t !== node.data.tagToRemove));
          addLog('action', `❌ [Ação no Fluxo]: Tag removida do perfil: "${node.data.tagToRemove}"`);
        }
      }
      if (node.data.actionType === 'set_field' && node.data.fieldToSet) {
        setLeadFields((prev) => ({
          ...prev,
          [node.data.fieldToSet!]: node.data.fieldValue || 'Atualizado'
        }));
        addLog('action', `Campo {${node.data.fieldToSet}} atualizado para: "${node.data.fieldValue}"`);
      }
      if (node.data.actionType === 'human_handover') {
        setActiveTags((prev) => Array.from(new Set([...prev, 'Precisa-Atendente-Humano'])));
        addLog('action', `Atendimento transferido para Fila Humana (Bot pausado).`);
      }

      // Check next default connection
      const nextConn = flow.connections.find((c) => c.fromNodeId === node.id);
      if (nextConn) {
        const nextNode = flow.nodes.find((n) => n.id === nextConn.toNodeId);
        if (nextNode) {
          await executeNode(flow, nextNode);
        }
      }
      return;
    }

    // Handle Delay
    if (node.type === 'delay') {
      const delay = (node.data.delaySeconds || 2) * 1000;
      addLog('delay', `Aguardando pausa de ${node.data.delaySeconds || 2}s (digitando)...`);
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, delay));
      setIsTyping(false);

      const nextConn = flow.connections.find((c) => c.fromNodeId === node.id);
      if (nextConn) {
        const nextNode = flow.nodes.find((n) => n.id === nextConn.toNodeId);
        if (nextNode) {
          await executeNode(flow, nextNode);
        }
      }
      return;
    }

    // Handle Message
    if (node.type === 'message') {
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 600));
      setIsTyping(false);

      const replacedText = interpolateMessage(node.data.text || '');

      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'bot',
        channel,
        text: replacedText,
        timestamp: 'Agora',
        buttons: node.data.buttons,
        quickReplies: node.data.quickReplies,
        flowNodeId: node.id
      };

      setMessages((prev) => [...prev, botMsg]);
      addLog('node', `Mensagem enviada no Direct com ${node.data.buttons?.length || 0} botões`);

      if (replacedText.includes('desconto') || replacedText.includes('cupom') || replacedText.includes('VIP25') || replacedText.includes('BEMVINDO15')) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
      return;
    }

    // Handle A/B Split Test
    if (node.type === 'ab_split') {
      const ratioA = node.data.splitRatioA ?? 50;
      const winner = node.data.winnerVariant;
      
      let chosenBranch: 'A' | 'B' = 'A';
      if (winner === 'A') {
        chosenBranch = 'A';
      } else if (winner === 'B') {
        chosenBranch = 'B';
      } else {
        const rand = Math.random() * 100;
        chosenBranch = rand < ratioA ? 'A' : 'B';
      }

      const branchName = chosenBranch === 'A' 
        ? (node.data.variantAName || 'Variante A (Mensagem 1)') 
        : (node.data.variantBName || 'Variante B (Mensagem 2)');

      addLog(
        'node',
        `🧪 Teste A/B ("${node.title}"): Roteando para Variante ${chosenBranch} [${branchName}] (Divisão: ${ratioA}% A / ${100 - ratioA}% B)`
      );

      // Find connection matching this variant
      const matchingConn = flow.connections.find(
        (c) => c.fromNodeId === node.id && (c.handleType === `variant_${chosenBranch.toLowerCase()}` || c.handleType === `variant_${chosenBranch}`)
      ) || flow.connections.find((c) => c.fromNodeId === node.id);

      if (matchingConn) {
        const targetNode = flow.nodes.find((n) => n.id === matchingConn.toNodeId);
        if (targetNode) {
          await executeNode(flow, targetNode);
        }
      }
      return;
    }

    // Handle AI Step
    if (node.type === 'ai_step') {
      setIsTyping(true);
      addLog('ai', `Agente Gemini 3.7 pensando resposta com base na instrução...`);
      try {
        const response = await fetch('/api/ai/smart-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Dúvida geral sobre o produto',
            businessContext: knowledgeBase.businessSummary + '\n' + knowledgeBase.productsAndPricing,
            tone: knowledgeBase.toneOfVoice,
            contactInfo: { firstName: leadFields.first_name || 'Camila' }
          })
        });
        const data = await response.json();
        setIsTyping(false);

        const botMsg: ChatMessage = {
          id: `msg_ai_${Date.now()}`,
          sender: 'bot',
          channel,
          text: data.reply || 'Olá! Posso tirar todas as suas dúvidas sobre nossos serviços. Como prefere continuar?',
          timestamp: 'Agora',
          quickReplies: [
            { id: 'qr_ai_cupom', text: 'Quero cupom de desconto' },
            { id: 'qr_ai_whats', text: 'Falar no WhatsApp' }
          ]
        };
        setMessages((prev) => [...prev, botMsg]);
        addLog('ai', `IA gerou resposta (Intenção: ${data.detectedIntent || 'Suporte'}, Sentimento: ${data.sentiment || 'Positivo'})`);
      } catch (err) {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_ai_fb_${Date.now()}`,
            sender: 'bot',
            channel,
            text: 'Nosso horário de atendimento é 24h via IA e seg-sex das 8h às 19h com time humano. Posso te ajudar com o cupom especial de 25%?',
            timestamp: 'Agora'
          }
        ]);
      }
      return;
    }
  };

  // Handle User Sending a Message
  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputText;
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      channel,
      text: message,
      timestamp: 'Agora'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    addLog('trigger', `Usuário enviou mensagem: "${message}"`);

    const upper = message.toUpperCase().trim();

    // 1. Search for matching keyword in active flows
    let matchedFlow = flows.find((f) => f.isActive && f.nodes.some((n) => 
      n.type === 'trigger' && n.data.keywords?.some((k) => upper.includes(k.toUpperCase()))
    ));

    if (!matchedFlow) {
      matchedFlow = flows.find((f) => f.id === activeFlowId);
    }

    if (matchedFlow) {
      const triggerNode = matchedFlow.nodes.find((n) => n.type === 'trigger');
      if (triggerNode) {
        addLog('trigger', `Gatilho disparado no fluxo: "${matchedFlow.title}"`);
        const firstConn = matchedFlow.connections.find((c) => c.fromNodeId === triggerNode.id);
        if (firstConn) {
          const firstTarget = matchedFlow.nodes.find((n) => n.id === firstConn.toNodeId);
          if (firstTarget) {
            await executeNode(matchedFlow, firstTarget);
            return;
          }
        }
      }
    }

    // 2. If no direct flow matches, use AI Fallback
    setIsTyping(true);
    addLog('ai', `Nenhuma palavra-chave estrita disparada. Chamando IA Gemini Fallback...`);

    try {
      const res = await fetch('/api/ai/smart-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: messages.slice(-4),
          contactInfo: { firstName: 'Camila' },
          businessContext: knowledgeBase.businessSummary + '\n' + knowledgeBase.productsAndPricing,
          tone: knowledgeBase.toneOfVoice
        })
      });
      const data = await res.json();
      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_bot_ai_${Date.now()}`,
          sender: 'bot',
          channel,
          text: data.reply || 'Entendido! Como posso te ajudar a avançar hoje?',
          timestamp: 'Agora',
          quickReplies: data.suggestedQuickReplies?.map((q: string, i: number) => ({ id: `qr_${i}`, text: q })) || [
            { id: 'qr_cupom_2', text: '🎁 Quero Cupom 25%' },
            { id: 'qr_duvida_2', text: '💬 Falar no WhatsApp' }
          ]
        }
      ]);
      addLog('ai', `Resposta IA gerada com sucesso.`);
    } catch (e) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_bot_def_${Date.now()}`,
          sender: 'bot',
          channel,
          text: 'Obrigado por nos contatar! Estamos prontos para te atender. Deseja conhecer nossos planos ou resgatar seu cupom?',
          timestamp: 'Agora',
          quickReplies: [{ id: 'qr_def', text: '🎁 Quero o Cupom 25%' }]
        }
      ]);
    }
  };

  // Handle Button Click
  const handleButtonClick = async (btn: FlowButton) => {
    const userMsg: ChatMessage = {
      id: `msg_btn_click_${Date.now()}`,
      sender: 'user',
      channel,
      text: btn.text,
      timestamp: 'Agora'
    };
    setMessages((prev) => [...prev, userMsg]);
    addLog('node', `Usuário clicou no botão: "${btn.text}"`);

    // Assign Tag on Button Click (Segmentation for Broadcast)
    if (btn.assignTag) {
      setActiveTags((prev) => Array.from(new Set([...prev, btn.assignTag!])));
      addLog('action', `🏷️ [Atribuir Tag]: Contato rotulado com "${btn.assignTag}" (Disponível no Broadcast CRM)`);
    }

    if (btn.type === 'url' && btn.value) {
      window.open(btn.value, '_blank');
      addLog('action', `Redirecionando para URL: ${btn.value}`);
      return;
    }

    if (btn.type === 'handover') {
      setActiveTags((prev) => Array.from(new Set([...prev, 'Precisa-Atendente-Humano'])));
      addLog('action', `Atendente Humano acionado.`);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_handover_${Date.now()}`,
            sender: 'bot',
            channel,
            text: 'Um de nossos consultores humanos foi notificado e já vai te responder por aqui em instantes! ⏳',
            timestamp: 'Agora'
          }
        ]);
      }, 800);
      return;
    }

    if (btn.targetNodeId) {
      const activeFlow = flows.find((f) => f.id === activeFlowId) || flows[0];
      const targetNode = activeFlow?.nodes.find((n) => n.id === btn.targetNodeId);
      if (targetNode && activeFlow) {
        await executeNode(activeFlow, targetNode);
      }
    }
  };

  // Handle Quick Reply Click
  const handleQuickReplyClick = async (qr: QuickReply) => {
    if (qr.assignTag) {
      setActiveTags((prev) => Array.from(new Set([...prev, qr.assignTag!])));
      addLog('action', `🏷️ [Atribuir Tag via Quick Reply]: Contato rotulado com "${qr.assignTag}"`);
    }

    if (qr.targetNodeId) {
      const userMsg: ChatMessage = {
        id: `msg_qr_click_${Date.now()}`,
        sender: 'user',
        channel,
        text: qr.text,
        timestamp: 'Agora'
      };
      setMessages((prev) => [...prev, userMsg]);
      addLog('node', `Usuário clicou na resposta rápida: "${qr.text}"`);

      const activeFlow = flows.find((f) => f.id === activeFlowId) || flows[0];
      const targetNode = activeFlow?.nodes.find((n) => n.id === qr.targetNodeId);
      if (targetNode && activeFlow) {
        await executeNode(activeFlow, targetNode);
      }
    } else {
      handleSendMessage(qr.text);
    }
  };

  // Preset Simulation Scenarios
  const triggerScenario = (scenario: 'comment_all_posts' | 'comment_specific' | 'comment_quero' | 'story_mention' | 'keyword_preco' | 'handover' | 'ab_welcome') => {
    switch (scenario) {
      case 'ab_welcome':
        addLog('trigger', `Simulando início de conversa para Teste A/B de Boas-Vindas ("OLÁ")`);
        handleSendMessage('OLÁ');
        break;

      case 'comment_all_posts':
        addLog('trigger', `Simulando comentário em Post Qualquer (Regra Global Evergreen): "QUERO"`);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_sim_post_global_${Date.now()}`,
            sender: 'user',
            channel: 'instagram',
            text: '🌐 [Comentou em Qualquer Post do Feed/Reels]: "QUERO 🚀"',
            timestamp: 'Agora'
          }
        ]);
        setTimeout(() => {
          handleSendMessage('QUERO');
        }, 500);
        break;

      case 'comment_specific':
      case 'comment_quero':
        addLog('trigger', `Simulando comentário no Reel Específico "3 Segredos": "AULA"`);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_sim_post_${Date.now()}`,
            sender: 'user',
            channel: 'instagram',
            text: '🎯 [Comentou no Reel Específico "3 Segredos"]: "AULA 🚀"',
            timestamp: 'Agora'
          }
        ]);
        setTimeout(() => {
          handleSendMessage('AULA');
        }, 500);
        break;

      case 'story_mention':
        addLog('trigger', `Simulando menção no Instagram Story: "@manyflow.oficial"`);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_sim_story_${Date.now()}`,
            sender: 'user',
            channel: 'instagram',
            text: '🌟 [Mencionou você nos Stories]: "@manyflow.oficial Amei o produto! 😍"',
            timestamp: 'Agora'
          }
        ]);
        setTimeout(() => {
          handleSendMessage('@MENTION');
        }, 500);
        break;

      case 'keyword_preco':
        handleSendMessage('Qual é o PREÇO do plano mensal?');
        break;

      case 'handover':
        handleSendMessage('Preciso falar com um atendente humano urgente.');
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[88vh] bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left / Phone Screen Mockup */}
        <div className="flex-1 bg-[#F8F9FB] flex flex-col items-center justify-center p-6 border-r border-[#E2E8F0] relative">
          {/* Top Switcher */}
          <div className="w-full max-w-[340px] mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E2E8F0] rounded-lg shadow-xs">
              <button
                onClick={() => setChannel('instagram')}
                className={`py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  channel === 'instagram'
                    ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-xs'
                    : 'text-[#64748B] hover:text-pink-600'
                }`}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram Direct</span>
              </button>
              <button
                onClick={() => setChannel('messenger')}
                className={`py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  channel === 'messenger'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-[#64748B] hover:text-blue-600'
                }`}
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>Messenger</span>
              </button>
            </div>

            <button
              onClick={resetConversation}
              title="Limpar Conversa"
              className="p-1.5 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Smartphone Frame */}
          <div className="w-full max-w-[340px] h-[580px] bg-white rounded-[36px] border-4 border-gray-300 shadow-xl flex flex-col overflow-hidden relative">
            {/* Phone Notch */}
            <div className="h-6 bg-[#F8F9FB] flex items-center justify-between px-6 text-[10px] text-[#64748B] shrink-0 border-b border-[#E2E8F0]">
              <span>09:41</span>
              <div className="w-16 h-3 bg-gray-200 rounded-full" />
              <span>5G 100%</span>
            </div>

            {/* App Header (Instagram / Messenger) */}
            <div className="px-4 py-2.5 bg-white border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-0.5 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#1A1D21]">manyflow.oficial</span>
                    <CheckCircle2 className="w-3 h-3 text-sky-500 fill-sky-500/20" />
                  </div>
                  <span className="text-[10px] text-[#64748B]">Atendimento Ativo</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#64748B]">
                <Phone className="w-4 h-4" />
                <Video className="w-4 h-4" />
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none bg-[#F8F9FB]">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[84%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? channel === 'instagram'
                            ? 'bg-[#0084FF] text-white rounded-br-xs shadow-xs'
                            : 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-[#1A1D21] rounded-bl-xs border border-[#E2E8F0] shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* Interactive Buttons */}
                      {msg.buttons && msg.buttons.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1.5">
                          {msg.buttons.map((btn) => (
                            <button
                              key={btn.id}
                              onClick={() => handleButtonClick(btn)}
                              className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>{btn.text}</span>
                              {btn.type === 'url' && <ExternalLink className="w-3 h-3 opacity-70" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Replies chips below bot message */}
                    {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {msg.quickReplies.map((qr) => (
                          <button
                            key={qr.id}
                            onClick={() => handleQuickReplyClick(qr)}
                            className="px-2.5 py-1 rounded-full bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[10px] font-semibold text-[#0084FF] transition-colors cursor-pointer shadow-xs"
                          >
                            {qr.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#E2E8F0] text-[#64748B] w-16 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0084FF] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0084FF] animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0084FF] animate-bounce delay-300" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-2 bg-white border-t border-[#E2E8F0] flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={channel === 'instagram' ? 'Mensagem direct...' : 'Digite no Messenger...'}
                className="flex-1 px-3 py-2 rounded-full bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2 rounded-full bg-[#0084FF] hover:bg-[#0073E6] text-white transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right / Automation Control & Logs Panel */}
        <div className="w-full md:w-96 bg-white flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#E2E8F0]">
          {/* Header */}
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
            <div>
              <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
                <span>Painel de Teste em Tempo Real</span>
              </h3>
              <p className="text-xs text-[#64748B]">Inspeção de Gatilhos & Tags CRM</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Simulation Trigger Scenarios */}
          <div className="p-4 border-b border-[#E2E8F0] space-y-2 bg-[#F8F9FB]">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Disparar Cenários Reais do Instagram
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerScenario('ab_welcome')}
                className="col-span-2 p-2 rounded-lg bg-gradient-to-r from-fuchsia-50 to-blue-50 hover:from-fuchsia-100 hover:to-blue-100 border border-fuchsia-200 text-left text-xs font-bold text-fuchsia-950 flex items-center justify-between transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-1.5">
                  <Split className="w-3.5 h-3.5 shrink-0 text-fuchsia-600" />
                  <span>🧪 Testar A/B Boas-Vindas ("OLÁ")</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-200 text-fuchsia-800 font-bold">Split</span>
              </button>
              <button
                onClick={() => triggerScenario('comment_all_posts')}
                className="p-2 rounded-lg bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left text-xs font-bold text-blue-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 shrink-0 text-[#0084FF]" />
                <span className="truncate">Todos os Posts (Global)</span>
              </button>
              <button
                onClick={() => triggerScenario('comment_specific')}
                className="p-2 rounded-lg bg-white hover:bg-pink-50/50 border border-[#E2E8F0] hover:border-pink-200 text-left text-xs font-semibold text-[#1A1D21] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <MessageSquareReply className="w-3.5 h-3.5 shrink-0 text-pink-600" />
                <span className="truncate">Post / Reel Único</span>
              </button>
              <button
                onClick={() => triggerScenario('story_mention')}
                className="p-2 rounded-lg bg-white hover:bg-purple-50/50 border border-[#E2E8F0] hover:border-purple-200 text-left text-xs font-semibold text-[#1A1D21] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Flame className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                <span className="truncate">Marcar no Story</span>
              </button>
              <button
                onClick={() => triggerScenario('keyword_preco')}
                className="p-2 rounded-lg bg-white hover:bg-amber-50/50 border border-[#E2E8F0] hover:border-amber-200 text-left text-xs font-semibold text-[#1A1D21] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span className="truncate">Dúvida de Preço</span>
              </button>
              <button
                onClick={() => triggerScenario('handover')}
                className="p-2 rounded-lg bg-white hover:bg-cyan-50/50 border border-[#E2E8F0] hover:border-cyan-200 text-left text-xs font-semibold text-[#1A1D21] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Bot className="w-3.5 h-3.5 shrink-0 text-cyan-600" />
                <span className="truncate">Pedir Humano</span>
              </button>
            </div>
          </div>

          {/* Current Lead CRM State & Custom Fields */}
          <div className="p-4 border-b border-[#E2E8F0] bg-white space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Tags Atribuídas a este Contato
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Simulated Custom Fields Variables */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[11px] font-semibold text-purple-900 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                <span>Variáveis do Lead ({customFields.length})</span>
                <span className="text-[10px] text-purple-600 font-normal">Interpolação Ativa</span>
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {customFields.map((cf) => (
                  <div key={cf.key} className="flex items-center justify-between gap-1 text-[11px] bg-purple-50/50 p-1.5 rounded-md border border-purple-200/60">
                    <span className="font-mono font-bold text-purple-900 truncate">
                      {`{${cf.key}}`}:
                    </span>
                    <input
                      type="text"
                      value={leadFields[cf.key] ?? (cf.defaultValue || '')}
                      onChange={(e) => {
                        setLeadFields((prev) => ({
                          ...prev,
                          [cf.key]: e.target.value
                        }));
                      }}
                      className="w-36 px-1.5 py-0.5 rounded bg-white border border-purple-200 text-[10px] text-purple-950 font-medium focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Execution Logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] bg-[#F8F9FB]">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block font-sans mb-1">
              Console de Execução do Motor
            </span>
            {executionLogs.map((log) => (
              <div
                key={log.id}
                className="p-2 rounded-lg bg-white border border-[#E2E8F0] text-[#1A1D21] space-y-0.5 leading-snug shadow-xs"
              >
                <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                  <span className="uppercase font-bold text-[#0084FF]">{log.type}</span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="text-[#1A1D21]">{log.message}</p>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-medium">
              Ambiente de Testes Conectado
            </span>
            <button
              onClick={onClose}
              className="py-1.5 px-4 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#1A1D21] text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Fechar Simulador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
