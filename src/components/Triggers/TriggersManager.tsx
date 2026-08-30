import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Search, 
  Filter, 
  ExternalLink, 
  Instagram, 
  Facebook,
  Bot,
  MessageSquare,
  HelpCircle,
  Tag,
  DollarSign,
  Gift,
  Headphones,
  ArrowRight,
  ShieldCheck,
  Check,
  Send,
  AlertCircle
} from 'lucide-react';
import { KeywordTrigger, Flow, ChannelType } from '../../types';

interface TriggersManagerProps {
  triggers: KeywordTrigger[];
  flows: Flow[];
  onUpdateTriggers: (triggers: KeywordTrigger[]) => void;
  openSimulator: () => void;
}

export const TriggersManager: React.FC<TriggersManagerProps> = ({
  triggers,
  flows,
  onUpdateTriggers,
  openSimulator
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'keywords' | 'welcome' | 'nomatch'>('keywords');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<KeywordTrigger | null>(null);

  // Welcome Messages States
  const [instaWelcomeActive, setInstaWelcomeActive] = useState(true);
  const [fbWelcomeActive, setFbWelcomeActive] = useState(true);
  const [noMatchFallbackMode, setNoMatchFallbackMode] = useState<'flow' | 'ai'>('flow');

  // Form states for new/edit
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<ChannelType>('omnichannel');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [matchType, setMatchType] = useState<'contains' | 'exact' | 'starts_with'>('contains');
  const [targetFlowId, setTargetFlowId] = useState(flows[0]?.id || '');
  const [cooldownMinutes, setCooldownMinutes] = useState(15);

  const handleOpenAddModal = (preset?: 'pricing' | 'discount' | 'support') => {
    setEditingTrigger(null);
    if (preset === 'pricing') {
      setName("Gatilho de Preço & Planos ('pricing')");
      setChannel('omnichannel');
      setKeywords(['PRICING', 'PRICE', 'PLANS', 'COST', 'PREÇO', 'VALOR', 'TABELA']);
      setMatchType('contains');
      const pFlow = flows.find((f) => f.id === 'flow_pricing_keyword') || flows[0];
      setTargetFlowId(pFlow.id);
      setCooldownMinutes(15);
    } else if (preset === 'discount') {
      setName("Gatilho de Desconto & Cupom ('discount')");
      setChannel('omnichannel');
      setKeywords(['DISCOUNT', 'COUPON', 'PROMO', 'OFFER', 'DESCONTO', 'CUPOM', '20% OFF']);
      setMatchType('contains');
      const dFlow = flows.find((f) => f.id === 'flow_discount_keyword') || flows[0];
      setTargetFlowId(dFlow.id);
      setCooldownMinutes(30);
    } else if (preset === 'support') {
      setName("Gatilho de Suporte & Central de Ajuda ('support')");
      setChannel('omnichannel');
      setKeywords(['SUPPORT', 'HELP', 'SUPORTE', 'AJUDA', 'CONTACT SUPPORT', 'HUMANO', 'ATENDENTE']);
      setMatchType('contains');
      const sFlow = flows.find((f) => f.id === 'flow_support_keyword') || flows[0];
      setTargetFlowId(sFlow.id);
      setCooldownMinutes(5);
    } else {
      setName('');
      setChannel('omnichannel');
      setKeywords(['QUERO', 'CUPOM']);
      setMatchType('contains');
      setTargetFlowId(flows[0]?.id || '');
      setCooldownMinutes(15);
    }
    setShowModal(true);
  };

  const handleEditTrigger = (trig: KeywordTrigger) => {
    setEditingTrigger(trig);
    setName(trig.name);
    setChannel(trig.channel);
    setKeywords([...trig.keywords]);
    setMatchType(trig.matchType);
    setTargetFlowId(trig.targetFlowId);
    setCooldownMinutes(trig.cooldownMinutes);
    setShowModal(true);
  };

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    setKeywords([...keywords, keywordInput.trim().toUpperCase()]);
    setKeywordInput('');
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSaveTrigger = () => {
    if (!name.trim() || keywords.length === 0) return;

    if (editingTrigger) {
      const updated = triggers.map((t) =>
        t.id === editingTrigger.id
          ? {
              ...t,
              name,
              channel,
              keywords,
              matchType,
              targetFlowId,
              cooldownMinutes
            }
          : t
      );
      onUpdateTriggers(updated);
    } else {
      const newTrig: KeywordTrigger = {
        id: `trig_${Date.now()}`,
        name,
        channel,
        keywords,
        matchType,
        targetFlowId,
        isActive: true,
        priority: 1,
        cooldownMinutes,
        stats: {
          triggeredCount: 0,
          lastTriggeredAt: 'Nunca'
        }
      };
      onUpdateTriggers([...triggers, newTrig]);
    }
    setShowModal(false);
  };

  const handleToggleActive = (id: string) => {
    onUpdateTriggers(
      triggers.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    );
  };

  const handleDeleteTrigger = (id: string) => {
    onUpdateTriggers(triggers.filter((t) => t.id !== id));
  };

  const filtered = triggers.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const instaWelcomeFlow = flows.find((f) => f.id === 'flow_welcome_instagram') || flows[0];
  const fbWelcomeFlow = flows.find((f) => f.id === 'flow_welcome_messenger') || flows[1] || flows[0];
  const noMatchFlow = flows.find((f) => f.id === 'flow_no_match_default') || flows[flows.length - 1];

  return (
    <div id="triggers_manager_view" className="flex-1 flex flex-col h-full bg-[#F8F9FB] p-6 lg:p-8 overflow-y-auto select-none space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1A1D21] flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Gatilhos, Palavras-Chave & Mensagens de Boas-Vindas</span>
          </h2>
          <p className="text-xs text-[#64748B]">
            Configure respostas automáticas para palavras-chave ('pricing', 'discount', 'support'), boas-vindas do Instagram / Messenger e resposta padrão no-match.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn_test_simulator_triggers"
            onClick={openSimulator}
            className="py-2 px-3.5 rounded-lg bg-white hover:bg-gray-50 text-[#1A1D21] text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-[#E2E8F0]"
          >
            <Send className="w-3.5 h-3.5 text-[#0084FF]" />
            <span>Testar no Simulador</span>
          </button>
          <button
            id="btn_new_keyword_trigger"
            onClick={() => handleOpenAddModal()}
            className="py-2 px-4 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Gatilho</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          id="subtab_keywords"
          onClick={() => setActiveSubTab('keywords')}
          className={`py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'keywords'
              ? 'bg-white text-[#0084FF] border border-[#E2E8F0] shadow-xs'
              : 'text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Palavras-Chave ('pricing', 'discount', 'support')</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
            {triggers.length}
          </span>
        </button>

        <button
          id="subtab_welcome"
          onClick={() => setActiveSubTab('welcome')}
          className={`py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'welcome'
              ? 'bg-white text-[#0084FF] border border-[#E2E8F0] shadow-xs'
              : 'text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-pink-500" />
          <span>Mensagens de Boas-Vindas Automatizadas (Instagram & FB)</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            Ativo
          </span>
        </button>

        <button
          id="subtab_nomatch"
          onClick={() => setActiveSubTab('nomatch')}
          className={`py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'nomatch'
              ? 'bg-white text-[#0084FF] border border-[#E2E8F0] shadow-xs'
              : 'text-[#64748B] hover:text-[#1A1D21]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>Resposta Padrão (No Match / Fallback)</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
            24/7
          </span>
        </button>
      </div>

      {/* 1. KEYWORDS TAB */}
      {activeSubTab === 'keywords' && (
        <div className="space-y-6">
          {/* Quick Preset Cards for Requested Keywords */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
            <div className="text-xs font-bold text-[#1A1D21] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0084FF]" />
              <span>Gatilhos Recomendados & Pré-Configurados</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A1D21]">
                    <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                      $
                    </div>
                    <span>'Pricing' / Preços & Planos</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Responde com os planos Starter, Pro, Enterprise e opções de teste grátis ou consultor.
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[10px] font-mono text-[#0084FF]">pricing, price, plans, preço</span>
                  <button
                    onClick={() => handleOpenAddModal('pricing')}
                    className="text-[11px] font-bold text-[#0084FF] hover:underline cursor-pointer"
                  >
                    Configurar
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A1D21]">
                    <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                      🎁
                    </div>
                    <span>'Discount' / Cupom & Oferta</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Aplica tag no CRM, digita por 2s e entrega cupom de 25% OFF com link direto de checkout.
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[10px] font-mono text-amber-600">discount, coupon, promo, cupom</span>
                  <button
                    onClick={() => handleOpenAddModal('discount')}
                    className="text-[11px] font-bold text-[#0084FF] hover:underline cursor-pointer"
                  >
                    Configurar
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A1D21]">
                    <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      🎧
                    </div>
                    <span>'Support' / Atendimento & FAQ</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Oferece central de ajuda, status do serviço e opção imediata de transferência para atendente humano.
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[10px] font-mono text-blue-600">support, help, suporte, ajuda</span>
                  <button
                    onClick={() => handleOpenAddModal('support')}
                    className="text-[11px] font-bold text-[#0084FF] hover:underline cursor-pointer"
                  >
                    Configurar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome do gatilho ou palavra-chave (ex: pricing, discount, support, quero)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]"
            />
          </div>

          {/* Triggers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((trig) => {
              const linkedFlow = flows.find((f) => f.id === trig.targetFlowId);
              return (
                <div
                  key={trig.id}
                  className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-gray-300 shadow-xs space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1A1D21]">{trig.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {trig.channel === 'instagram' && (
                            <span className="text-[10px] font-bold text-pink-600 flex items-center gap-1">
                              <Instagram className="w-3 h-3" /> Instagram
                            </span>
                          )}
                          {trig.channel === 'messenger' && (
                            <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                              <Facebook className="w-3 h-3" /> Messenger
                            </span>
                          )}
                          {trig.channel === 'omnichannel' && (
                            <span className="text-[10px] font-bold text-purple-600">
                              Omnichannel (Insta + FB)
                            </span>
                          )}
                          <span className="text-gray-300">•</span>
                          <span className="text-[10px] text-[#64748B]">
                            Cooldown: {trig.cooldownMinutes}min
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleActive(trig.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        trig.isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-gray-100 text-[#64748B] border border-gray-200'
                      }`}
                    >
                      {trig.isActive ? 'Ativo' : 'Pausado'}
                    </button>
                  </div>

                  {/* Keywords List */}
                  <div>
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1.5">
                      Palavras que Disparam:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {trig.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono"
                        >
                          "{kw}"
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target Flow Info */}
                  <div className="p-2.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Fluxo Vinculado:</span>
                    <span className="font-bold text-[#0084FF] truncate max-w-[200px]">
                      {linkedFlow?.title || 'Fluxo Padrão'}
                    </span>
                  </div>

                  {/* Stats & Actions */}
                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                    <span>Disparos: <strong className="text-[#1A1D21]">{trig.stats.triggeredCount}</strong></span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditTrigger(trig)}
                        className="text-xs font-semibold text-[#0084FF] hover:underline cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteTrigger(trig.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-[#64748B] hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. AUTOMATED WELCOME MESSAGES TAB */}
      {activeSubTab === 'welcome' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#0084FF] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Mensagens de Boas-Vindas Automatizadas Configuradas</p>
              <p className="text-blue-800 mt-0.5">
                Novos seguidores e usuários recebem uma recepção imediata e amigável, com 3 opções principais prontas: <strong>'Visit our website'</strong>, <strong>'See our products'</strong> e <strong>'Contact support'</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instagram Welcome Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1D21]">
                      Instagram Direct Welcome Message
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Gatilho automático para novos seguidores & primeira mensagem no Direct
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInstaWelcomeActive(!instaWelcomeActive)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    instaWelcomeActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-gray-100 text-[#64748B] border border-gray-200'
                  }`}
                >
                  {instaWelcomeActive ? 'Ativado' : 'Pausado'}
                </button>
              </div>

              {/* Message Preview Box */}
              <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-3">
                <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Texto da Mensagem Enviada ao Novo Seguidor:
                </div>
                <p className="text-xs text-[#1A1D21] bg-white p-3 rounded-lg border border-[#E2E8F0] whitespace-pre-line leading-relaxed">
                  "Hey {"{first_name}"}! 👋 Obrigado por se conectar com a gente no Instagram!{'\n\n'}
                  Estamos super felizes em ter você aqui. Como podemos te ajudar hoje?"
                </p>

                <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider pt-2">
                  Opções e Botões de Ação Apresentados:
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs">
                    <span className="font-semibold text-[#1A1D21] flex items-center gap-2">
                      <span>🌐</span> Visit our website
                    </span>
                    <span className="text-[10px] text-blue-600 font-mono">https://manyflow.io</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs">
                    <span className="font-semibold text-[#1A1D21] flex items-center gap-2">
                      <span>🛍️</span> See our products
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">Abre Catálogo de Produtos</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs">
                    <span className="font-semibold text-[#1A1D21] flex items-center gap-2">
                      <span>💬</span> Contact support
                    </span>
                    <span className="text-[10px] text-purple-600 font-medium">Chama Atendente Humano</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#64748B]">
                  Disparos realizados: <strong className="text-[#1A1D21]">2.840</strong>
                </span>
                <button
                  onClick={openSimulator}
                  className="py-2 px-3.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Testar Boas-Vindas no Insta</span>
                </button>
              </div>
            </div>

            {/* Facebook Messenger Welcome Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0084FF] text-white flex items-center justify-center shadow-xs">
                    <Facebook className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1D21]">
                      Facebook Messenger Welcome Screen
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Gatilho quando o usuário clica no botão "Começar" ou abre o chat no Facebook
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFbWelcomeActive(!fbWelcomeActive)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    fbWelcomeActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-gray-100 text-[#64748B] border border-gray-200'
                  }`}
                >
                  {fbWelcomeActive ? 'Ativado' : 'Pausado'}
                </button>
              </div>

              {/* Message Preview Box */}
              <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-3">
                <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Texto da Mensagem no Messenger:
                </div>
                <p className="text-xs text-[#1A1D21] bg-white p-3 rounded-lg border border-[#E2E8F0] whitespace-pre-line leading-relaxed">
                  "Hello {"{first_name}"}! 🚀 Bem-vindo ao canal oficial da ManyFlow no Facebook Messenger!{'\n\n'}
                  Estamos disponíveis 24 horas por dia para te atender. O que você gostaria de fazer hoje?"
                </p>

                <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider pt-2">
                  Opções e Botões de Ação Apresentados:
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs">
                    <span className="font-semibold text-[#1A1D21] flex items-center gap-2">
                      <span>🌐</span> Visit our website
                    </span>
                    <span className="text-[10px] text-blue-600 font-mono">https://manyflow.io</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs">
                    <span className="font-semibold text-[#1A1D21] flex items-center gap-2">
                      <span>🛍️</span> See our products
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">Mostra Planos & Soluções</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs">
                    <span className="font-semibold text-[#1A1D21] flex items-center gap-2">
                      <span>💬</span> Contact support
                    </span>
                    <span className="text-[10px] text-purple-600 font-medium">Abre Ticket com Suporte</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#64748B]">
                  Disparos realizados: <strong className="text-[#1A1D21]">1.920</strong>
                </span>
                <button
                  onClick={openSimulator}
                  className="py-2 px-3.5 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Testar Boas-Vindas no FB</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. NO MATCH / FALLBACK TAB */}
      {activeSubTab === 'nomatch' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1D21]">
                    Resposta Padrão quando Nenhuma Palavra-Chave Coincidir (No Match Fallback)
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Quando o usuário envia qualquer texto não reconhecido pelas palavras-chave cadastradas, o bot orienta com ações rápidas ou aciona a IA Gemini 3.7.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Ativo 24/7
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div
                onClick={() => setNoMatchFallbackMode('flow')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  noMatchFallbackMode === 'flow'
                    ? 'border-[#0084FF] bg-blue-50/40 shadow-xs'
                    : 'border-[#E2E8F0] bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-[#1A1D21] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#0084FF]" />
                    <span>Fluxo Estruturado com Botões Rápidos (Recomendado)</span>
                  </div>
                  {noMatchFallbackMode === 'flow' && (
                    <CheckCircle2 className="w-4 h-4 text-[#0084FF]" />
                  )}
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Exibe mensagem educada de desculpas e apresenta botões diretos para Preços ('Pricing'), Cupom ('Discount'), Suporte ('Support') e Site.
                </p>
              </div>

              <div
                onClick={() => setNoMatchFallbackMode('ai')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  noMatchFallbackMode === 'ai'
                    ? 'border-[#0084FF] bg-blue-50/40 shadow-xs'
                    : 'border-[#E2E8F0] bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-[#1A1D21] flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span>Agente Inteligente Gemini 3.7 Flash</span>
                  </div>
                  {noMatchFallbackMode === 'ai' && (
                    <CheckCircle2 className="w-4 h-4 text-[#0084FF]" />
                  )}
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Lê a base de conhecimento e responde qualquer dúvida livremente em linguagem natural e tom humanizado.
                </p>
              </div>
            </div>

            {/* Preview Box */}
            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Exemplo de Mensagem de No-Match Reply:
              </span>
              <p className="text-xs text-[#1A1D21] bg-white p-3 rounded-lg border border-[#E2E8F0]">
                "Desculpe Camila, não entendi exatamente o que você precisa 🤔 Sou o assistente virtual da ManyFlow. Aqui estão alguns tópicos rápidos que posso te ajudar imediatamente:"
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  💰 Pricing
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  🎁 Discount
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                  🎧 Support
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                  🌐 Visit Website
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="text-xs text-[#64748B]">
                Total de mensagens sem match atendidas com sucesso: <strong className="text-[#1A1D21]">3.410</strong>
              </span>
              <button
                onClick={openSimulator}
                className="py-2 px-4 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Testar Resposta No-Match no Simulador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating / Editing Keyword Trigger */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#1A1D21] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>{editingTrigger ? 'Editar Gatilho de Palavra-Chave' : 'Configurar Novo Gatilho'}</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Nome do Gatilho
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Gatilho de Preço & Planos ('pricing')"
                className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Canal
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                >
                  <option value="omnichannel">Ambos (Instagram + Messenger)</option>
                  <option value="instagram">Instagram Direct</option>
                  <option value="messenger">Facebook Messenger</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Tipo de Correspondência
                </label>
                <select
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                >
                  <option value="contains">Mensagem Contém (Recomendado)</option>
                  <option value="exact">Mensagem Exata</option>
                  <option value="starts_with">Começa Com</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Palavras-Chave (Pressione Enter para adicionar)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                  placeholder="Ex: PRICING, DISCOUNT, SUPPORT..."
                  className="flex-1 px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Adicionar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0]">
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 font-mono"
                  >
                    <span>{kw}</span>
                    <button
                      onClick={() => handleRemoveKeyword(idx)}
                      className="hover:text-rose-600 cursor-pointer font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Fluxo de Automação Vinculado
              </label>
              <select
                value={targetFlowId}
                onChange={(e) => setTargetFlowId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
              >
                {flows.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Tempo de Cooldown (Minutos entre disparos para o mesmo usuário)
              </label>
              <input
                type="number"
                value={cooldownMinutes}
                onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                min={0}
                max={1440}
                className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#64748B] text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTrigger}
                className="flex-1 py-2 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Salvar Gatilho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
