import React, { useState } from 'react';
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
  StickyNote
} from 'lucide-react';
import { LiveConversation, ChatMessage, Contact, Flow } from '../../types';
import { ContactNotes } from '../ContactsCRM/ContactNotes';

interface LiveChatInboxProps {
  conversations: LiveConversation[];
  flows: Flow[];
  onUpdateConversations: (conversations: LiveConversation[]) => void;
}

export const LiveChatInbox: React.FC<LiveChatInboxProps> = ({
  conversations,
  flows,
  onUpdateConversations
}) => {
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id || '');
  const [filterTab, setFilterTab] = useState<'all' | 'open' | 'human_takeover' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0];

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
    if (filterTab === 'resolved') return matchesSearch && c.status === 'resolved';
    return matchesSearch;
  });

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
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`p-3.5 flex gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50/70 border-l-2 border-[#0084FF]' : 'hover:bg-gray-50'
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
                    <span className="text-[10px] text-[#64748B]">{conv.lastMessage.timestamp}</span>
                  </div>
                  <span className="text-[11px] text-[#64748B] truncate block mb-1">
                    {conv.contact.username}
                  </span>
                  <p className="text-[11px] text-[#64748B] truncate line-clamp-1">
                    {conv.lastMessage.text}
                  </p>
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
                </div>
              </div>
            </div>

            {/* Actions: Pause Bot / Trigger Flow */}
            <div className="flex items-center gap-2">
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

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-[#E2E8F0] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Responder no ${activeConv.channel === 'instagram' ? 'Instagram Direct' : 'Facebook Messenger'}...`}
              className="flex-1 px-4 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]"
            />
            <button
              onClick={handleSendMessage}
              className="py-2 px-4 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
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
            <span className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider block">
              Tags do Lead ({activeConv.contact.tags.length})
            </span>
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
