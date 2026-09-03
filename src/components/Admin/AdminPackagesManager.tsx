import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Package, 
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
  RefreshCw, 
  Percent, 
  DollarSign, 
  CheckCircle2, 
  X, 
  Award, 
  Calculator, 
  Tag, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Sliders,
  HelpCircle,
  Clock
} from 'lucide-react';
import { SubscriptionPlan, PlanLimits, AddonPackage, AddonCategory } from '../../types';
import { plansAndAffiliatesService, INITIAL_PLANS } from '../../services/plansAndAffiliatesService';
import { adminManagementService, INITIAL_ADDON_PACKAGES } from '../../services/adminManagementService';

export const AdminPackagesManager: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [addons, setAddons] = useState<AddonPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'plans' | 'addons' | 'profit_calc'>('plans');

  // Plan Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    slug: '',
    description: '',
    priceMonthly: 197,
    priceYearly: 1970,
    badge: '',
    isHighlighted: false,
    commissionRate: 30,
    isRecurrentCommission: true,
    maxContacts: 25000,
    maxFlows: 50,
    maxUsers: 10,
    maxCustomDomains: 1,
    maxMonthlyMessages: 100000,
    includeAI: true,
    includeWhiteLabel: false,
    includeLiveChat: true,
    includeApiAccess: true,
    includeWhatsAppBulk: true,
    featuresText: ''
  });

  // Add-on Modal State
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddonPackage | null>(null);
  const [addonForm, setAddonForm] = useState({
    name: '',
    slug: '',
    category: 'messages' as AddonCategory,
    description: '',
    price: 99.00,
    billingType: 'recurring_monthly' as 'recurring_monthly' | 'one_time',
    unitAmount: 50000,
    unitLabel: '+50.000 mensagens/mês',
    badge: 'Mais Vendido',
    isActive: true
  });

  // Simulation Calculator State
  const [simStarterClients, setSimStarterClients] = useState(30);
  const [simProClients, setSimProClients] = useState(50);
  const [simWhitelabelClients, setSimWhitelabelClients] = useState(15);
  const [simAddonsPurchased, setSimAddonsPurchased] = useState(40);
  const [simAvgAddonPrice, setSimAvgAddonPrice] = useState(79);

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plansData, addonsData] = await Promise.all([
        plansAndAffiliatesService.getPlans(),
        adminManagementService.getAddonPackages()
      ]);
      setPlans(plansData);
      setAddons(addonsData);
    } catch (err) {
      console.warn('Erro ao carregar planos e pacotes:', err);
      setPlans(INITIAL_PLANS);
      setAddons(INITIAL_ADDON_PACKAGES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- PLAN CRUD HANDLERS ---
  const openCreatePlanModal = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      slug: '',
      description: 'Plano completo com automações omnicanais e CRM inteligente.',
      priceMonthly: 147,
      priceYearly: 1470,
      badge: 'Novo',
      isHighlighted: false,
      commissionRate: 30,
      isRecurrentCommission: true,
      maxContacts: 15000,
      maxFlows: 30,
      maxUsers: 5,
      maxCustomDomains: 1,
      maxMonthlyMessages: 60000,
      includeAI: true,
      includeWhiteLabel: false,
      includeLiveChat: true,
      includeApiAccess: true,
      includeWhatsAppBulk: true,
      featuresText: '30 Fluxos de Automação\n15.000 Contatos no CRM\nIntegração WhatsApp Meta Cloud API\nInteligência Artificial Nativa\nSuporte Prioritário'
    });
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      badge: plan.badge || '',
      isHighlighted: plan.isHighlighted || false,
      commissionRate: plan.commissionRate || 30,
      isRecurrentCommission: plan.isRecurrentCommission !== false,
      maxContacts: plan.limits?.maxContacts || 10000,
      maxFlows: plan.limits?.maxFlows || 20,
      maxUsers: plan.limits?.maxUsers || 5,
      maxCustomDomains: plan.limits?.maxCustomDomains || 0,
      maxMonthlyMessages: plan.limits?.maxMonthlyMessages || 50000,
      includeAI: plan.limits?.includeAI !== false,
      includeWhiteLabel: plan.limits?.includeWhiteLabel === true,
      includeLiveChat: plan.limits?.includeLiveChat !== false,
      includeApiAccess: plan.limits?.includeApiAccess !== false,
      includeWhatsAppBulk: plan.limits?.includeWhatsAppBulk !== false,
      featuresText: (plan.features || []).join('\n')
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const limits: PlanLimits = {
      maxContacts: Number(planForm.maxContacts),
      maxFlows: Number(planForm.maxFlows),
      maxUsers: Number(planForm.maxUsers),
      maxCustomDomains: Number(planForm.maxCustomDomains),
      maxMonthlyMessages: Number(planForm.maxMonthlyMessages),
      includeAI: planForm.includeAI,
      includeWhiteLabel: planForm.includeWhiteLabel,
      includeLiveChat: planForm.includeLiveChat,
      includeApiAccess: planForm.includeApiAccess,
      includeWhatsAppBulk: planForm.includeWhatsAppBulk
    };

    const features = planForm.featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const planPayload = {
      name: planForm.name,
      slug: planForm.slug || planForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: planForm.description,
      priceMonthly: Number(planForm.priceMonthly),
      priceYearly: Number(planForm.priceYearly),
      badge: planForm.badge,
      isHighlighted: planForm.isHighlighted,
      commissionRate: Number(planForm.commissionRate),
      isRecurrentCommission: planForm.isRecurrentCommission,
      limits,
      features,
      isActive: true
    };

    try {
      if (editingPlan) {
        const res = await plansAndAffiliatesService.updatePlan(editingPlan.id, planPayload);
        if (res.success && res.plan) {
          setPlans(prev => prev.map(p => p.id === editingPlan.id ? res.plan! : p));
          setFeedback({ type: 'success', message: `Plano ${planForm.name} atualizado com sucesso!` });
          setIsPlanModalOpen(false);
        }
      } else {
        const res = await plansAndAffiliatesService.createPlan(planPayload);
        if (res.success && res.plan) {
          setPlans(prev => [...prev, res.plan!]);
          setFeedback({ type: 'success', message: `Novo plano ${planForm.name} publicado com sucesso!` });
          setIsPlanModalOpen(false);
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao salvar plano' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!confirm(`Tem certeza que deseja excluir o plano "${plan.name}"?`)) return;
    const res = await plansAndAffiliatesService.deletePlan(plan.id);
    if (res.success) {
      setPlans(prev => prev.filter(p => p.id !== plan.id));
      setFeedback({ type: 'success', message: `Plano ${plan.name} removido.` });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // --- ADD-ON CRUD HANDLERS ---
  const openCreateAddonModal = () => {
    setEditingAddon(null);
    setAddonForm({
      name: '',
      slug: '',
      category: 'messages',
      description: 'Crédito adicional para aumentar a capacidade do cliente sem mudar de plano.',
      price: 69.00,
      billingType: 'recurring_monthly',
      unitAmount: 20000,
      unitLabel: '+20.000 disparos/mês',
      badge: 'Popular',
      isActive: true
    });
    setIsAddonModalOpen(true);
  };

  const openEditAddonModal = (addon: AddonPackage) => {
    setEditingAddon(addon);
    setAddonForm({
      name: addon.name,
      slug: addon.slug,
      category: addon.category,
      description: addon.description,
      price: addon.price,
      billingType: addon.billingType,
      unitAmount: addon.unitAmount,
      unitLabel: addon.unitLabel,
      badge: addon.badge || '',
      isActive: addon.isActive !== false
    });
    setIsAddonModalOpen(true);
  };

  const handleSaveAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingAddon) {
        const res = await adminManagementService.updateAddonPackage(editingAddon.id, addonForm);
        if (res.success && res.package) {
          setAddons(prev => prev.map(a => a.id === editingAddon.id ? res.package! : a));
          setFeedback({ type: 'success', message: `Pacote adicional ${addonForm.name} atualizado!` });
          setIsAddonModalOpen(false);
        }
      } else {
        const res = await adminManagementService.createAddonPackage(addonForm);
        if (res.success && res.package) {
          setAddons(prev => [...prev, res.package!]);
          setFeedback({ type: 'success', message: `Pacote ${addonForm.name} criado e disponível para venda!` });
          setIsAddonModalOpen(false);
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao salvar pacote adicional' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDeleteAddon = async (addon: AddonPackage) => {
    if (!confirm(`Remover pacote adicional "${addon.name}"?`)) return;
    const res = await adminManagementService.deleteAddonPackage(addon.id);
    if (res.success) {
      setAddons(prev => prev.filter(a => a.id !== addon.id));
      setFeedback({ type: 'success', message: 'Pacote adicional removido.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Calculations for Profit & Costs Simulator
  const totalStarterRev = simStarterClients * (plans.find(p => p.id === 'plan_starter')?.priceMonthly || 97);
  const totalProRev = simProClients * (plans.find(p => p.id === 'plan_pro')?.priceMonthly || 197);
  const totalWhitelabelRev = simWhitelabelClients * (plans.find(p => p.id === 'plan_whitelabel')?.priceMonthly || 497);
  const totalAddonsRev = simAddonsPurchased * simAvgAddonPrice;
  const grandTotalMonthlyRev = totalStarterRev + totalProRev + totalWhitelabelRev + totalAddonsRev;

  // Approximate Server and Infra costs
  const estimatedServerCost = 250 + (simStarterClients + simProClients + simWhitelabelClients) * 3.5;
  const estimatedMetaCloudApiCost = (simStarterClients * 1500 + simProClients * 5000 + simWhitelabelClients * 15000) * 0.0035;
  const estimatedAiTokensCost = (simProClients + simWhitelabelClients) * 45;
  const totalInfraCosts = estimatedServerCost + estimatedMetaCloudApiCost + estimatedAiTokensCost;
  const projectedNetProfit = grandTotalMonthlyRev - totalInfraCosts;
  const profitMarginPercent = grandTotalMonthlyRev > 0 ? (projectedNetProfit / grandTotalMonthlyRev) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FB] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Gestão de Planos & Pacotes</h1>
                <p className="text-xs text-gray-500">Configure mensalidades dos planos SaaS, limites de automação e pacotes adicionais de recarga</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
              title="Recarregar"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
            </button>

            {activeTab === 'plans' ? (
              <button
                onClick={openCreatePlanModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Novo Plano de Assinatura
              </button>
            ) : activeTab === 'addons' ? (
              <button
                onClick={openCreateAddonModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Novo Pacote Adicional
              </button>
            ) : null}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`max-w-7xl mx-auto mt-4 p-3 rounded-lg text-xs flex items-center justify-between transition-all ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 w-full space-y-6">
        {/* Navigation Switcher between Plans, Add-ons and Profit Simulator */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-white hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4" /> Planos de Assinatura ({plans.length})
          </button>

          <button
            onClick={() => setActiveTab('addons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'addons'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-white hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" /> Pacotes Adicionais & Recargas ({addons.length})
          </button>

          <button
            onClick={() => setActiveTab('profit_calc')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'profit_calc'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-white hover:text-gray-900'
            }`}
          >
            <Calculator className="w-4 h-4" /> Simulador de Rentabilidade & Custos
          </button>
        </div>

        {/* TAB 1: SUBSCRIPTION PLANS */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map(plan => (
                <div 
                  key={plan.id}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    plan.isHighlighted ? 'border-purple-400 ring-2 ring-purple-100' : 'border-gray-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-gray-900 text-base">{plan.name}</span>
                      {plan.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">{plan.description}</p>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-gray-950">R$ {plan.priceMonthly}</span>
                      <span className="text-xs text-gray-500 font-medium">/mês</span>
                      <span className="text-[11px] text-gray-400 ml-2">(ou R$ {plan.priceYearly}/ano)</span>
                    </div>

                    {/* Affiliate commission tag */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Percent className="w-3.5 h-3.5" />
                      <span>Comissão de Afiliado: <strong>{plan.commissionRate || 30}%</strong> {plan.isRecurrentCommission !== false ? '(Recorrente)' : '(1ª mensalidade)'}</span>
                    </div>
                  </div>

                  {/* Limits & Features list */}
                  <div className="p-6 space-y-3 flex-1 bg-white">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Limites da Plataforma</div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                      <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span><strong>{plan.limits?.maxContacts?.toLocaleString('pt-BR') || '10.000'}</strong> Contatos</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span><strong>{plan.limits?.maxFlows || '20'}</strong> Fluxos</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                        <span><strong>{plan.limits?.maxMonthlyMessages?.toLocaleString('pt-BR') || '50.000'}</strong> Msg/mês</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <Globe className="w-3.5 h-3.5 text-purple-500" />
                        <span><strong>{plan.limits?.maxCustomDomains || '0'}</strong> CNAME</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recursos Inclusos</div>
                      <ul className="space-y-1.5 text-xs text-gray-600">
                        {plan.limits?.includeAI && (
                          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Inteligência Artificial & Agentes Virtuais</li>
                        )}
                        {plan.limits?.includeWhiteLabel && (
                          <li className="flex items-center gap-2 text-purple-700 font-semibold"><Sparkles className="w-3.5 h-3.5 text-purple-600" /> Painel 100% White-Label (Sua Marca)</li>
                        )}
                        {plan.limits?.includeLiveChat && (
                          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Live Chat Inbox Multi-Atendentes</li>
                        )}
                        {plan.limits?.includeWhatsAppBulk && (
                          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Disparo em Massa Omnichannel</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-mono">ID: {plan.slug}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditPlanModal(plan)}
                        className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
                        title="Editar plano"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
                        title="Excluir plano"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ADD-ON PACKAGES */}
        {activeTab === 'addons' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-900">O que são os Pacotes Adicionais?</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Pacotes de expansão permitem que clientes que excederam o limite do seu plano comprem recargas de mensagens, contatos CRM, domínios CNAME ou novos atendentes diretamente no sistema, gerando receita recorrente adicional sem exigir upgrade para planos superiores.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addons.map(addon => (
                <div 
                  key={addon.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {addon.category}
                      </span>
                      {addon.badge && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          {addon.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-gray-900">{addon.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{addon.description}</p>

                    <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-gray-500">Valor do Pacote:</span>
                        <span className="text-lg font-bold text-gray-900">R$ {addon.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Faturamento:</span>
                        <span className="font-semibold text-gray-700">
                          {addon.billingType === 'recurring_monthly' ? 'Mensalidade Adicional' : 'Recarga Avulsa (Crédito)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Capacidade Inclusa:</span>
                        <span className="font-bold text-blue-600">{addon.unitLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                      addon.isActive ? 'text-emerald-700' : 'text-gray-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${addon.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      {addon.isActive ? 'Disponível na Loja' : 'Desativado'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditAddonModal(addon)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar pacote"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddon(addon)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover pacote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROFIT & COSTS CALCULATOR */}
        {activeTab === 'profit_calc' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-gray-900">Simulador de Precificação, Rentabilidade & Margem SaaS</h3>
              <p className="text-xs text-gray-500 mt-1">
                Calcule a projeção de receita recorrente mensal (MRR), custos estimados de infraestrutura (Meta Cloud API, Cloud Run, Tokens Gemini) e lucro líquido.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Base de Clientes Simulada</h4>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>Clientes no Plano Starter (R$ 97/mês):</span>
                    <strong className="text-gray-900">{simStarterClients} clientes</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="5"
                    value={simStarterClients}
                    onChange={e => setSimStarterClients(parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>Clientes no Plano Pro (R$ 197/mês):</span>
                    <strong className="text-gray-900">{simProClients} clientes</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="5"
                    value={simProClients}
                    onChange={e => setSimProClients(parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>Agências White-Label (R$ 497/mês):</span>
                    <strong className="text-gray-900">{simWhitelabelClients} agências</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={simWhitelabelClients}
                    onChange={e => setSimWhitelabelClients(parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>Pacotes Adicionais / Recargas Vendidas / Mês:</span>
                    <strong className="text-gray-900">{simAddonsPurchased} pacotes (Média R$ {simAvgAddonPrice})</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={simAddonsPurchased}
                    onChange={e => setSimAddonsPurchased(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Projeção de Faturamento & Custos</h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-600">Receita Plano Starter:</span>
                    <span className="font-bold text-gray-900">R$ {totalStarterRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-600">Receita Plano Pro:</span>
                    <span className="font-bold text-gray-900">R$ {totalProRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-600">Receita Agências White-Label:</span>
                    <span className="font-bold text-gray-900">R$ {totalWhitelabelRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-100 text-blue-900">
                    <span>Receita com Pacotes Adicionais & Recargas:</span>
                    <span className="font-bold">R$ {totalAddonsRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 font-bold text-sm">
                    <span>Faturamento Bruto Mensal Previsto:</span>
                    <span>R$ {grandTotalMonthlyRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 space-y-1.5 text-[11px] text-gray-500">
                  <div className="flex justify-between">
                    <span>Custo Estimado Servidores Cloud & Banco de Dados:</span>
                    <span>- R$ {estimatedServerCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo Estimado Mensagens WhatsApp Meta Cloud API:</span>
                    <span>- R$ {estimatedMetaCloudApiCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo Estimado Tokens Gemini AI:</span>
                    <span>- R$ {estimatedAiTokensCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800">Lucro Líquido Estimado</span>
                    <div className="text-2xl font-black text-emerald-900">
                      R$ {projectedNetProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-800">Margem Operacional</span>
                    <div className="text-xl font-bold text-emerald-700">
                      {profitMarginPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Subscription Plan */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  {editingPlan ? `Editar Plano • ${editingPlan.name}` : 'Criar Novo Plano de Assinatura'}
                </h3>
              </div>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nome do Plano</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Profissional Growth"
                    value={planForm.name}
                    onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Identificador Slug</label>
                  <input
                    type="text"
                    placeholder="plan_growth"
                    value={planForm.slug}
                    onChange={e => setPlanForm({ ...planForm, slug: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descrição Curta</label>
                <input
                  type="text"
                  placeholder="Para empresas em expansão com múltiplos atendentes e automação IA"
                  value={planForm.description}
                  onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preço Mensal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={planForm.priceMonthly}
                    onChange={e => setPlanForm({ ...planForm, priceMonthly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preço Anual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={planForm.priceYearly}
                    onChange={e => setPlanForm({ ...planForm, priceYearly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Badge Promocional</label>
                  <input
                    type="text"
                    placeholder="Mais Vendido"
                    value={planForm.badge}
                    onChange={e => setPlanForm({ ...planForm, badge: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Commission settings */}
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-purple-900 mb-1">Comissão de Afiliado (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={planForm.commissionRate}
                    onChange={e => setPlanForm({ ...planForm, commissionRate: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-lg font-bold text-purple-800"
                  />
                </div>
                <div className="w-1/2 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-purple-900">
                    <input
                      type="checkbox"
                      checked={planForm.isRecurrentCommission}
                      onChange={e => setPlanForm({ ...planForm, isRecurrentCommission: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
                    />
                    <span>Comissão Recorrente Todos os Meses</span>
                  </label>
                </div>
              </div>

              {/* Technical Limits */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Limites Técnicos do Plano</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Máx. Contatos CRM</label>
                    <input
                      type="number"
                      value={planForm.maxContacts}
                      onChange={e => setPlanForm({ ...planForm, maxContacts: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Máx. Fluxos</label>
                    <input
                      type="number"
                      value={planForm.maxFlows}
                      onChange={e => setPlanForm({ ...planForm, maxFlows: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Máx. Mensagens/mês</label>
                    <input
                      type="number"
                      value={planForm.maxMonthlyMessages}
                      onChange={e => setPlanForm({ ...planForm, maxMonthlyMessages: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Máx. Usuários / Atendentes</label>
                    <input
                      type="number"
                      value={planForm.maxUsers}
                      onChange={e => setPlanForm({ ...planForm, maxUsers: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Domínios CNAME White-Label</label>
                    <input
                      type="number"
                      value={planForm.maxCustomDomains}
                      onChange={e => setPlanForm({ ...planForm, maxCustomDomains: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={planForm.includeAI}
                      onChange={e => setPlanForm({ ...planForm, includeAI: e.target.checked })}
                      className="w-3.5 h-3.5 text-purple-600 rounded border-gray-300"
                    />
                    <span>Incluir Agentes de IA</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={planForm.includeWhiteLabel}
                      onChange={e => setPlanForm({ ...planForm, includeWhiteLabel: e.target.checked })}
                      className="w-3.5 h-3.5 text-purple-600 rounded border-gray-300"
                    />
                    <span>Incluir White-Label</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={planForm.includeLiveChat}
                      onChange={e => setPlanForm({ ...planForm, includeLiveChat: e.target.checked })}
                      className="w-3.5 h-3.5 text-purple-600 rounded border-gray-300"
                    />
                    <span>Incluir Live Chat</span>
                  </label>
                </div>
              </div>

              {/* Bullet Features */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Recursos em Destaque (um por linha)</label>
                <textarea
                  rows={4}
                  value={planForm.featuresText}
                  onChange={e => setPlanForm({ ...planForm, featuresText: e.target.value })}
                  placeholder="Ex: 50 Fluxos de automação ilimitados&#10;Disparo em Massa WhatsApp&#10;Suporte Prioritário VIP"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all"
                >
                  {isSaving ? 'Salvando...' : editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Add-on Package */}
      {isAddonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  {editingAddon ? 'Editar Pacote Adicional' : 'Criar Novo Pacote Adicional'}
                </h3>
              </div>
              <button onClick={() => setIsAddonModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddon} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome do Pacote</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Disparos Extras +50.000 Mensagens"
                  value={addonForm.name}
                  onChange={e => setAddonForm({ ...addonForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={addonForm.category}
                    onChange={e => setAddonForm({ ...addonForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="messages">Mensagens & Disparos</option>
                    <option value="contacts">Contatos CRM</option>
                    <option value="domains">Domínios CNAME</option>
                    <option value="ai_agents">Agentes de IA</option>
                    <option value="team_seats">Assentos de Operadores</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Cobrança</label>
                  <select
                    value={addonForm.billingType}
                    onChange={e => setAddonForm({ ...addonForm, billingType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="recurring_monthly">Mensalidade Adicional Recorrente</option>
                    <option value="one_time">Recarga Avulsa (Crédito Único)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={addonForm.price}
                    onChange={e => setAddonForm({ ...addonForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rótulo da Capacidade</label>
                  <input
                    type="text"
                    placeholder="+50.000 mensagens/mês"
                    value={addonForm.unitLabel}
                    onChange={e => setAddonForm({ ...addonForm, unitLabel: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={addonForm.description}
                  onChange={e => setAddonForm({ ...addonForm, description: e.target.value })}
                  placeholder="Crédito adicional para campanhas em massa sem limites..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={addonForm.isActive}
                    onChange={e => setAddonForm({ ...addonForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span>Pacote Ativo e Disponível para Venda</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddonModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
                >
                  {isSaving ? 'Salvando...' : editingAddon ? 'Salvar Alterações' : 'Criar Pacote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
