import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Users, 
  Globe, 
  MessageSquare, 
  Layers, 
  RefreshCw, 
  Percent, 
  DollarSign, 
  CheckCircle2, 
  X, 
  Award,
  Lock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { SubscriptionPlan, PlanLimits } from '../../types';
import { plansAndAffiliatesService, INITIAL_PLANS } from '../../services/plansAndAffiliatesService';
import { useAuth } from '../../context/AuthContext';

export const PlansPackagesManager: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeInterval, setActiveInterval] = useState<'monthly' | 'yearly'>('monthly');

  // Modal State for Plan CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [priceMonthly, setPriceMonthly] = useState<number>(197);
  const [priceYearly, setPriceYearly] = useState<number>(1970);
  const [badge, setBadge] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [commissionRate, setCommissionRate] = useState<number>(30);
  const [isRecurrentCommission, setIsRecurrentCommission] = useState(true);
  
  // Limits
  const [maxContacts, setMaxContacts] = useState<number>(25000);
  const [maxFlows, setMaxFlows] = useState<number>(50);
  const [maxUsers, setMaxUsers] = useState<number>(10);
  const [maxCustomDomains, setMaxCustomDomains] = useState<number>(1);
  const [maxMonthlyMessages, setMaxMonthlyMessages] = useState<number>(100000);
  const [includeAI, setIncludeAI] = useState(true);
  const [includeWhiteLabel, setIncludeWhiteLabel] = useState(false);
  const [includeLiveChat, setIncludeLiveChat] = useState(true);
  const [includeApiAccess, setIncludeApiAccess] = useState(true);
  const [includeWhatsAppBulk, setIncludeWhatsAppBulk] = useState(true);

  // Features
  const [featureInput, setFeatureInput] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>([]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const data = await plansAndAffiliatesService.getPlans();
      setPlans(data);
    } catch (err) {
      console.warn('Erro ao carregar planos:', err);
      setPlans(INITIAL_PLANS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setSlug('');
    setDescription('Plano completo para automações inteligentes.');
    setPriceMonthly(147);
    setPriceYearly(1470);
    setBadge('Novo');
    setIsHighlighted(false);
    setCommissionRate(30);
    setIsRecurrentCommission(true);
    setMaxContacts(15000);
    setMaxFlows(25);
    setMaxUsers: (5);
    setMaxCustomDomains(1);
    setMaxMonthlyMessages(50000);
    setIncludeAI(true);
    setIncludeWhiteLabel(false);
    setIncludeLiveChat(true);
    setIncludeApiAccess(true);
    setIncludeWhatsAppBulk(true);
    setFeaturesList([
      'Até 15.000 contatos no CRM',
      '25 Fluxos ilimitados',
      '5 Usuários operadores',
      '1 Domínio Personalizado (CNAME)',
      'Inteligência Artificial Ativa',
      'Suporte Prioritário'
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setSlug(plan.slug);
    setDescription(plan.description);
    setPriceMonthly(plan.priceMonthly);
    setPriceYearly(plan.priceYearly || plan.priceMonthly * 10);
    setBadge(plan.badge || '');
    setIsHighlighted(plan.isHighlighted);
    setCommissionRate(plan.commissionRate || 30);
    setIsRecurrentCommission(plan.isRecurrentCommission !== false);
    setMaxContacts(plan.limits.maxContacts);
    setMaxFlows(plan.limits.maxFlows);
    setMaxUsers(plan.limits.maxUsers);
    setMaxCustomDomains(plan.limits.maxCustomDomains);
    setMaxMonthlyMessages(plan.limits.maxMonthlyMessages);
    setIncludeAI(plan.limits.includeAI);
    setIncludeWhiteLabel(plan.limits.includeWhiteLabel);
    setIncludeLiveChat(plan.limits.includeLiveChat);
    setIncludeApiAccess(plan.limits.includeApiAccess);
    setIncludeWhatsAppBulk(plan.limits.includeWhatsAppBulk);
    setFeaturesList(plan.features || []);
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFeaturesList([...featuresList, featureInput.trim()]);
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== idx));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const planPayload: Partial<SubscriptionPlan> = {
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: description.trim(),
      priceMonthly: Number(priceMonthly),
      priceYearly: Number(priceYearly),
      currency: 'BRL',
      badge: badge.trim(),
      isHighlighted,
      commissionRate: Number(commissionRate),
      isRecurrentCommission,
      limits: {
        maxContacts: Number(maxContacts),
        maxFlows: Number(maxFlows),
        maxUsers: Number(maxUsers),
        maxCustomDomains: Number(maxCustomDomains),
        maxMonthlyMessages: Number(maxMonthlyMessages),
        includeAI,
        includeWhiteLabel,
        includeLiveChat,
        includeApiAccess,
        includeWhatsAppBulk
      },
      features: featuresList.length > 0 ? featuresList : ['Recursos ilimitados']
    };

    try {
      if (editingPlan) {
        await plansAndAffiliatesService.updatePlan(editingPlan.id, planPayload);
        setFeedback({ type: 'success', text: `Pacote "${name}" atualizado com sucesso!` });
      } else {
        await plansAndAffiliatesService.createPlan(planPayload as any);
        setFeedback({ type: 'success', text: `Novo pacote "${name}" criado com sucesso!` });
      }
      setIsModalOpen(false);
      await fetchPlans();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Erro ao salvar pacote.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDeletePlan = async (id: string, planName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o pacote "${planName}"?`)) return;
    try {
      await plansAndAffiliatesService.deletePlan(id);
      setFeedback({ type: 'success', text: `Pacote "${planName}" removido.` });
      await fetchPlans();
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Erro ao remover pacote.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div id="plans_packages_manager" className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1A1D21]">Gestão de Pacotes, Mensalidades e Limites</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                Admin CRUD
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Defina os valores das mensalidades, limites de contatos, fluxos, operadores e a taxa de comissão de afiliados para cada pacote.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Interval Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveInterval('monthly')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeInterval === 'monthly'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setActiveInterval('yearly')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeInterval === 'yearly'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Anual (-17%)
            </button>
          </div>

          <button
            id="btn_create_new_plan"
            onClick={openCreateModal}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Pacote</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const displayPrice = activeInterval === 'monthly' ? plan.priceMonthly : Math.round(plan.priceYearly / 12);
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl bg-white border p-6 flex flex-col justify-between transition-all duration-200 ${
                plan.isHighlighted
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                    plan.isHighlighted
                      ? 'bg-blue-600 text-white'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mt-1">
                  <h4 className="text-base font-bold text-[#1A1D21]">{plan.name}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title="Editar pacote e mensalidade"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id, plan.name)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-500 transition-colors"
                      title="Excluir pacote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 min-h-[32px]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-slate-500">R$</span>
                    <span className="text-3xl font-black text-[#1A1D21] font-mono tracking-tight">
                      {displayPrice}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/mês</span>
                  </div>
                  {activeInterval === 'yearly' && (
                    <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                      Faturado anualmente (R$ {plan.priceYearly}/ano)
                    </span>
                  )}
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Percent className="w-3 h-3 text-blue-600" />
                      Comissão Afiliado:
                    </span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {plan.commissionRate || 30}% recorrente
                    </span>
                  </div>
                </div>

                {/* Limits Specs */}
                <div className="space-y-2 text-xs text-slate-700 border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Contatos no CRM:
                    </span>
                    <span className="font-bold text-[#1A1D21]">
                      {plan.limits.maxContacts.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Fluxos de Automação:
                    </span>
                    <span className="font-bold text-[#1A1D21]">
                      {plan.limits.maxFlows >= 999 ? 'Ilimitados' : plan.limits.maxFlows}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Operadores na Equipe:
                    </span>
                    <span className="font-bold text-[#1A1D21]">
                      {plan.limits.maxUsers} operadores
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      Domínio CNAME:
                    </span>
                    <span className={`font-bold ${plan.limits.maxCustomDomains > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {plan.limits.maxCustomDomains > 0 ? `${plan.limits.maxCustomDomains} domínio(s)` : 'Não incluso'}
                    </span>
                  </div>
                </div>

                {/* Bullet Features */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Recursos Inclusos:
                  </span>
                  <ul className="space-y-1.5">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Action */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(plan)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    plan.isHighlighted
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Configurações do Pacote</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating / Editing Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A1D21]">
                    {editingPlan ? `Editar Pacote: ${editingPlan.name}` : 'Criar Novo Pacote de Mensalidade'}
                  </h4>
                  <p className="text-xs text-[#64748B]">Configure precificação, limites e regras de comissão</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-200/60 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePlan} className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Pacote *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Profissional Growth"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Slug / Identificador</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Ex: pro-growth"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição Comercial</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Ideal para infoprodutores e agências com alto volume."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Pricing & Commission */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Precificação & Comissões de Afiliados
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mensalidade (R$/mês) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={priceMonthly}
                      onChange={(e) => setPriceMonthly(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Anuidade (R$/ano)</label>
                    <input
                      type="number"
                      min="0"
                      value={priceYearly}
                      onChange={(e) => setPriceYearly(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Comissão Afiliado (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold text-blue-700 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={isHighlighted}
                      onChange={(e) => setIsHighlighted(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold">Destacar como "Mais Popular"</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={isRecurrentCommission}
                      onChange={(e) => setIsRecurrentCommission(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold">Comissão Recorrente Todo Mês</span>
                  </label>
                </div>
              </div>

              {/* Limits Configuration */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Limites do Sistema
                </span>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Max Contatos</label>
                    <input
                      type="number"
                      value={maxContacts}
                      onChange={(e) => setMaxContacts(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Max Fluxos</label>
                    <input
                      type="number"
                      value={maxFlows}
                      onChange={(e) => setMaxFlows(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Max Operadores</label>
                    <input
                      type="number"
                      value={maxUsers}
                      onChange={(e) => setMaxUsers(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Domínios CNAME</label>
                    <input
                      type="number"
                      value={maxCustomDomains}
                      onChange={(e) => setMaxCustomDomains(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Mensagens/mês</label>
                    <input
                      type="number"
                      value={maxMonthlyMessages}
                      onChange={(e) => setMaxMonthlyMessages(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Badge Visual</label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="Ex: Essencial"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bullet Features Manager */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Recursos Listados na Vitrine</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="Adicione um benefício (Ex: Disparos em Massa WhatsApp)..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {featuresList.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs">
                      <span>{f}</span>
                      <button type="button" onClick={() => handleRemoveFeature(i)} className="text-blue-400 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingPlan ? 'Salvar Alterações' : 'Criar Pacote'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
